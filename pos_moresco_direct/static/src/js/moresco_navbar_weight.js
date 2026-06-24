/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { Navbar } from "@point_of_sale/app/navbar/navbar";
import { _t } from "@web/core/l10n/translation";
import { onMounted, onWillUnmount, useState } from "@odoo/owl";
import { useRef } from "@odoo/owl";

patch(Navbar.prototype, {
    setup() {
        super.setup(...arguments);

        this.morescoWeightState = useState({
            value: null,
            status: "idle",   // idle | connected | disconnected | error
            reading: false,   // true briefly when weight value changes
        });

        this._morescoWeightTimer = null;
        this._morescoReadingTimer = null;
        this._morescoLastWeight = null;
        this._morescoKeyHandler = this._morescoHandleKey.bind(this);

        onMounted(() => {
            this._startMorescoWeightPolling();
            document.addEventListener("keydown", this._morescoKeyHandler);
        });

        onWillUnmount(() => {
            this._stopMorescoWeightPolling();
            document.removeEventListener("keydown", this._morescoKeyHandler);
            if (this._morescoReadingTimer) clearTimeout(this._morescoReadingTimer);
        });
    },

    /** Keyboard shortcuts: Ctrl+B → reconnect,  Alt+B → focus search bar */
    _morescoHandleKey(e) {
        if (e.ctrlKey && !e.altKey && (e.key === "b" || e.key === "B")) {
            e.preventDefault();
            this.clickMorescoNavbarConnect();
            return;
        }
        if (e.altKey && !e.ctrlKey && (e.key === "b" || e.key === "B")) {
            e.preventDefault();
            const searchInput = document.querySelector(
                ".pos-searchbar input, input.product-search-input, .search-word"
            );
            searchInput?.focus();
        }
    },


    get showMorescoNavbarWeight() {
        return Boolean(!this.ui.isSmall && this.pos?.config?.moresco_scale_enabled);
    },

    get morescoIsSerialConnected() {
        return this.pos?._morescoSerial?.status === "connected";
    },

    get morescoNavbarWeightLabel() {
        const status = this.morescoWeightState.status;
        if (status === "idle" || status === "disconnected") return _t("Sin báscula");
        if (status === "error") return _t("Error");
        if (this.morescoWeightState.value === null) return "--- kg";
        return `${this.morescoWeightState.value.toFixed(3)} kg`;
    },

    get morescoIndicatorSubLabel() {
        const status = this.morescoWeightState.status;
        if (status === "connected") return _t("báscula en vivo · Ctrl+B");
        return _t("click o Ctrl+B para conectar");
    },

    get morescoIndicatorTitle() {
        return this.morescoIsSerialConnected
            ? _t("Báscula conectada — clic para desconectar")
            : _t("Clic o Ctrl+B para conectar báscula · Alt+B para buscar producto");
    },

    get morescoNavbarWeightContainerClass() {
        const status = this.morescoWeightState.status;
        let base = "moresco-weight-indicator";
        if (status === "connected") {
            base += " moresco-connected";
            if (this.morescoWeightState.reading) base += " moresco-reading";
        } else if (status === "error") {
            base += " moresco-error";
        } else {
            base += " moresco-disconnected";
        }
        return base;
    },

    // Keep old getter as alias so pos_screen.xml still works if referenced
    get morescoNavbarWeightClass() {
        return this.morescoNavbarWeightContainerClass;
    },

    async clickMorescoNavbarConnect() {
        if (this.morescoIsSerialConnected) {
            await this.pos.morescoDisconnectSerial();
        } else {
            await this.pos.morescoConnectSerial();
        }
    },

    _startMorescoWeightPolling() {
        this._stopMorescoWeightPolling();
        this._refreshMorescoNavbarWeight();
        this._morescoWeightTimer = setInterval(() => this._refreshMorescoNavbarWeight(), 500);
    },

    _stopMorescoWeightPolling() {
        if (this._morescoWeightTimer) {
            clearInterval(this._morescoWeightTimer);
            this._morescoWeightTimer = null;
        }
    },

    _refreshMorescoNavbarWeight() {
        if (!this.showMorescoNavbarWeight) {
            this.morescoWeightState.value = null;
            this.morescoWeightState.status = "idle";
            return;
        }

        // Simulation mode
        if (this.pos.config.moresco_simulation_enabled) {
            const simulated = this.pos._getMorescoSimulatedWeight?.();
            this.morescoWeightState.value = typeof simulated === "number" ? simulated : null;
            this.morescoWeightState.status = "connected";
            return;
        }

        // Web Serial mode - read from driver state
        const serial = this.pos._morescoSerial;
        if (!serial || serial.status !== "connected") {
            this.morescoWeightState.value = null;
            this.morescoWeightState.status = "disconnected";
            return;
        }

        // Detect change → trigger reading flash
        const newWeight = serial.weight;
        if (newWeight !== this._morescoLastWeight) {
            this._morescoLastWeight = newWeight;
            this.morescoWeightState.reading = true;
            if (this._morescoReadingTimer) clearTimeout(this._morescoReadingTimer);
            this._morescoReadingTimer = setTimeout(() => {
                this.morescoWeightState.reading = false;
            }, 380);
        }
        this.morescoWeightState.value = newWeight;
        this.morescoWeightState.status = "connected";
    },
});
