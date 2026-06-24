/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";
import { ControlButtons } from "@point_of_sale/app/screens/product_screen/control_buttons/control_buttons";
import { _t } from "@web/core/l10n/translation";

/**
 * Moresco HY918 Scale Driver for Odoo PoS
 * Uses Web Serial API for direct USB-RS232 connection (Chrome/Edge required)
 *
 * Scale output format examples (Moresco HY918):
 *   "ST,GS,+001.234kg\r\n"   → stable gross 1.234 kg
 *   "US,GS,-000.050kg\r\n"   → unstable
 *   "+001.234\r\n"            → simple numeric
 *   "  1.234 kg\r\n"         → simple with spaces
 */

/**
 * Parse a raw string line from serial port into a weight number.
 * Returns null if no valid positive weight found.
 */
function parseMorescoWeight(line) {
    // Remove null bytes and trim
    const clean = line.replace(/\x00/g, "").trim();
    if (!clean) return null;

    // Pattern: optional sign, digits, dot, digits (e.g. +001.234 or 1.234)
    const match = clean.match(/([+-]?\d{1,6}[.,]\d{1,4})/);
    if (!match) return null;

    const value = parseFloat(match[1].replace(",", "."));
    if (isNaN(value) || value < 0) return null;
    return Math.round(value * 1000) / 1000; // 3 decimal places
}

patch(PosStore.prototype, {
    /**
     * Simulated weight for testing without hardware
     */
    _getMorescoSimulatedWeight() {
        const mode = this.config.moresco_simulation_mode || "fixed";
        if (mode === "random") {
            const min = Number(this.config.moresco_simulation_min_weight ?? 0.1);
            const max = Number(this.config.moresco_simulation_max_weight ?? 3.0);
            const safeMin = Math.min(min, max);
            const safeMax = Math.max(min, max);
            return Math.round((safeMin + Math.random() * (safeMax - safeMin)) * 1000) / 1000;
        }
        const fixed = Number(this.config.moresco_simulation_fixed_weight ?? 1.0);
        return Math.round(Math.max(fixed, 0.001) * 1000) / 1000;
    },

    /**
     * Try to auto-reconnect using a previously granted port (no dialog).
     * Called automatically when scale disconnects.
     */
    async morescoAutoReconnect() {
        if (!navigator.serial) return;
        if (this._morescoSerial?.status === "connected") return;
        if (this._morescoReconnecting) return;

        try {
            const ports = await navigator.serial.getPorts();
            if (!ports.length) return;

            // Reuse the first previously authorized port
            this._morescoReconnecting = true;
            const port = ports[0];

            const baudRate = Number(this.config.moresco_baud_rate) || 9600;
            const dataBits = Number(this.config.moresco_data_bits) || 8;
            const stopBits = Number(this.config.moresco_stop_bits) || 1;
            const parityMap = { none: "none", even: "even", odd: "odd" };
            const parity = parityMap[this.config.moresco_parity] || "none";

            // Try to close the port first if it's open (from previous session)
            try {
                if (port.readable || port.writable) {
                    await port.close();
                    await new Promise(r => setTimeout(r, 500)); // Wait for port to fully close
                }
            } catch (_) {
                // Port might not be open, continue
            }

            // Try to open the port with retries
            let opened = false;
            for (let i = 0; i < 3 && !opened; i++) {
                try {
                    await port.open({ baudRate, dataBits, stopBits, parity });
                    opened = true;
                } catch (err) {
                    if (i < 2) {
                        await new Promise(r => setTimeout(r, 1000)); // Wait before retry
                    }
                }
            }

            if (!opened) {
                this._morescoReconnecting = false;
                return;
            }

            this._morescoSerial = {
                port, reader: null, weight: null,
                status: "connected", buffer: "", _running: true,
            };
            this._morescoStartReading();
            
            console.log("Moresco scale auto-reconnected successfully");
        } catch (err) {
            console.error("Moresco auto-reconnect error:", err);
        } finally {
            this._morescoReconnecting = false;
        }
    },

    /**
     * Open serial port using Web Serial API.
     * Stores port, reader and last weight on this._morescoSerial.
     */
    async morescoConnectSerial() {
        // Check browser support
        if (!navigator.serial) {
            this.env.services.notification.add(
                _t("Web Serial API not supported. Use Chrome or Edge browser."),
                { type: "danger", sticky: true }
            );
            return false;
        }

        // Disconnect existing connection first
        await this.morescoDisconnectSerial();

        try {
            // Prompt user to select serial port
            const port = await navigator.serial.requestPort();

            const baudRate = Number(this.config.moresco_baud_rate) || 9600;
            const dataBits = Number(this.config.moresco_data_bits) || 8;
            const stopBits = Number(this.config.moresco_stop_bits) || 1;
            const parityMap = { none: "none", even: "even", odd: "odd" };
            const parity = parityMap[this.config.moresco_parity] || "none";

            await port.open({ baudRate, dataBits, stopBits, parity });

            this._morescoSerial = {
                port,
                reader: null,
                weight: null,
                status: "connected",  // connected | disconnected | error
                buffer: "",
                _running: true,
            };

            this.env.services.notification.add(
                _t("Moresco scale connected ✓"),
                { type: "success" }
            );

            // Start background reading loop
            this._morescoStartReading();
            return true;

        } catch (err) {
            if (err.name === "NotFoundError" || err.name === "AbortError") {
                // User cancelled port selection - not an error
                return false;
            }
            this.env.services.notification.add(
                _t("Failed to connect scale: ") + (err.message || err.name),
                { type: "danger" }
            );
            return false;
        }
    },

    /**
     * Disconnect and clean up serial port.
     */
    async morescoDisconnectSerial() {
        if (!this._morescoSerial) return;

        this._morescoSerial._running = false;

        try {
            if (this._morescoSerial.reader) {
                await this._morescoSerial.reader.cancel();
            }
        } catch (_) { /* ignore */ }

        try {
            if (this._morescoSerial.port?.readable) {
                await this._morescoSerial.port.close();
            }
        } catch (_) { /* ignore */ }

        this._morescoSerial = null;
    },

    /**
     * Background loop: continuously reads serial data and parses weight.
     */
    async _morescoStartReading() {
        const serial = this._morescoSerial;
        if (!serial) return;

        const decoder = new TextDecoder();

        try {
            while (serial._running && serial.port?.readable) {
                serial.reader = serial.port.readable.getReader();
                try {
                    while (serial._running) {
                        const { value, done } = await serial.reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        serial.buffer += chunk;

                        // Process complete lines
                        const lines = serial.buffer.split(/\r?\n/);
                        serial.buffer = lines.pop(); // Keep incomplete line

                        for (const line of lines) {
                            const weight = parseMorescoWeight(line);
                            if (weight !== null) {
                                serial.weight = weight;
                                serial.status = "connected";
                            }
                        }
                    }
                } catch (err) {
                    console.warn("Moresco read error:", err.message);
                    if (serial._running) {
                        serial.status = "error";
                    }
                } finally {
                    try { serial.reader?.releaseLock(); } catch (_) { /* ignore */ }
                    serial.reader = null;
                }

                if (!serial._running) break;
                // Brief pause before reconnecting readable
                await new Promise((r) => setTimeout(r, 100));
            }
        } catch (err) {
            console.error("Moresco reading loop error:", err);
        }

        if (serial.status !== "disconnected") {
            serial.status = "disconnected";
            console.log("Moresco scale disconnected, scheduling auto-reconnect...");
        }

        // Schedule auto-reconnect if scale was in use (not a voluntary disconnect)
        // Retry more persistently
        if (serial._running !== false && this._morescoSerial === serial) {
            setTimeout(() => this.morescoAutoReconnect(), 3000);
            
            // Also retry again after a longer delay if first attempt fails
            setTimeout(() => {
                if (this._morescoSerial?.status !== "connected") {
                    this.morescoAutoReconnect();
                }
            }, 10000);
        }
    },

    /**
     * Get current weight from serial driver or simulation.
     * Returns {weight, source} or null on error.
     */
    async getWeightFromMoresco() {
        if (!this.config.moresco_scale_enabled) {
            this.env.services.notification.add(
                _t("Moresco scale is not enabled. Enable it in POS Configuration → Connected Devices."),
                { type: "warning" }
            );
            return null;
        }

        // Simulation mode
        if (this.config.moresco_simulation_enabled) {
            return this._getMorescoSimulatedWeight();
        }

        // Web Serial API mode
        if (!navigator.serial) {
            this.env.services.notification.add(
                _t("Web Serial API not supported. Use Chrome or Edge browser."),
                { type: "danger" }
            );
            return null;
        }

        // Not connected - auto-prompt connection
        if (!this._morescoSerial || this._morescoSerial.status !== "connected") {
            this.env.services.notification.add(
                _t("Scale not connected. Click 'Connect Scale' button to connect."),
                { type: "warning" }
            );
            return null;
        }

        const weight = this._morescoSerial.weight;
        if (weight === null) {
            this.env.services.notification.add(
                _t("No weight reading yet. Place product on scale and try again."),
                { type: "warning" }
            );
            return null;
        }

        return weight;
    },

    /**
     * Apply weight from scale to current selected order line.
     */
    async applyScaleWeightToCurrentLine() {
        const currentOrder = this.get_order();
        if (!currentOrder) {
            this.env.services.notification.add(_t("No active order"), { type: "warning" });
            return;
        }

        const selectedLine = currentOrder.get_selected_orderline();
        if (!selectedLine) {
            this.env.services.notification.add(
                _t("No product selected. Please select a product first."),
                { type: "warning" }
            );
            return;
        }

        const isWeighable = Boolean(selectedLine.product?.to_weight || selectedLine.product_id?.to_weight);
        if (!isWeighable) {
            this.env.services.notification.add(
                _t("Selected product is not weighable. Enable 'To Weigh' on the product."),
                { type: "warning" }
            );
            return;
        }

        const weight = await this.getWeightFromMoresco();

        if (weight !== null && weight > 0) {
            selectedLine.set_quantity(weight);
            this.env.services.notification.add(
                _t("Weight applied: ") + weight.toFixed(3) + " kg",
                { type: "success" }
            );
        }
    },

    async addLineToCurrentOrder(vals, opts = {}, configure = true) {
        const line = await super.addLineToCurrentOrder(...arguments);

        if (!line || !configure) return line;

        const shouldAutoRead = Boolean(
            this.config.moresco_scale_enabled && this.config.moresco_auto_read
        );
        const isWeighable = Boolean(line.product_id?.to_weight || line.product?.to_weight);

        if (shouldAutoRead && isWeighable) {
            setTimeout(async () => {
                const order = this.get_order();
                if (!order) return;
                this.selectOrderLine(order, line);
                await this.applyScaleWeightToCurrentLine();
            }, 300);
        }

        return line;
    },

    /**
     * Initialize Moresco scale connection when POS opens
     * This runs automatically after POS session is ready
     */
    async _morescoInitializeConnection() {
        if (!this.config.moresco_scale_enabled) return;
        if (this.config.moresco_simulation_enabled) return;
        if (!navigator.serial) return;

        // Wait a bit for the UI to settle
        await new Promise(r => setTimeout(r, 2000));

        // Try to auto-reconnect to previously authorized scale
        await this.morescoAutoReconnect();

        // Start watchdog to keep connection alive
        this._startMorescoWatchdog();
    },

    /**
     * Watchdog: periodically check and reconnect scale if needed
     */
    _startMorescoWatchdog() {
        if (this._morescoWatchdog) return;

        this._morescoWatchdog = setInterval(async () => {
            // Skip if not enabled or in simulation mode
            if (!this.config.moresco_scale_enabled || this.config.moresco_simulation_enabled) {
                return;
            }

            // Check if scale is disconnected
            if (!this._morescoSerial || this._morescoSerial.status !== "connected") {
                const ports = await navigator.serial?.getPorts();
                if (ports && ports.length > 0) {
                    console.log("Moresco watchdog: scale disconnected, attempting reconnect...");
                    await this.morescoAutoReconnect();
                }
            }
        }, 15000); // Check every 15 seconds
    },

    /**
     * Stop the watchdog timer
     */
    _stopMorescoWatchdog() {
        if (this._morescoWatchdog) {
            clearInterval(this._morescoWatchdog);
            this._morescoWatchdog = null;
        }
    },

    async after_load_server_data() {
        await super.after_load_server_data(...arguments);
        
        // Initialize scale connection automatically
        setTimeout(() => this._morescoInitializeConnection(), 1000);
    },
});

patch(ControlButtons.prototype, {
    /**
     * Click "Read Weight" button: reads current weight from connected scale.
     */
    async clickMorescoScale() {
        await this.pos.applyScaleWeightToCurrentLine();
    },

    /**
     * Click "Connect Scale" button: opens Web Serial port picker.
     */
    async clickMorescoConnect() {
        await this.pos.morescoConnectSerial();
    },

    get morescoSerialStatus() {
        return this.pos._morescoSerial?.status || "disconnected";
    },

    get morescoIsConnected() {
        return this.morescoSerialStatus === "connected";
    },
});
