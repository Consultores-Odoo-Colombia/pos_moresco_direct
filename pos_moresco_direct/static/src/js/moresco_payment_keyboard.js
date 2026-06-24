/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { ReceiptScreen } from "@point_of_sale/app/screens/receipt_screen/receipt_screen";
import { onMounted, onWillUnmount } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";

/**
 * Moresco Keyboard Navigation for Payment and Receipt Screens
 * Completes the 100% keyboard workflow
 * 
 * Payment Screen shortcuts:
 * - Up/Down Arrows: Navigate between payment methods
 * - Enter: Select payment method and validate when paid (or overpaid with change)
 * - V: Force validate the order immediately
 * 
 * Receipt Screen shortcuts:
 * - Enter: New order
 */

patch(PaymentScreen.prototype, {
    setup() {
        super.setup(...arguments);
        
        this._morescoPaymentKeyHandler = this._handleMorescoPaymentKey.bind(this);
        this._selectedPaymentMethodIndex = 0;
        
        onMounted(() => {
            document.addEventListener("keydown", this._morescoPaymentKeyHandler, true);
            // Highlight first payment method by default
            setTimeout(() => {
                this._highlightPaymentMethod(0);
            }, 100);
        });
        
        onWillUnmount(() => {
            document.removeEventListener("keydown", this._morescoPaymentKeyHandler, true);
        });
    },

    /**
     * Keyboard handler for payment screen
     */
    _handleMorescoPaymentKey(event) {
        // Skip if typing in input (amount, customer search, etc)
        const target = event.target;
        const tagName = target?.tagName?.toLowerCase();
        const isInput = tagName === "input" || tagName === "textarea";
        const isNumpad = target?.closest?.(".numpad");
        const isPopup = target?.closest?.(".popup");
        
        if (isInput || isNumpad || isPopup) {
            return; // Let default behavior work
        }

        // Arrow Down: Navigate to next payment method
        if (event.key === "ArrowDown") {
            event.preventDefault();
            this._navigatePaymentMethods(1);
            return;
        }

        // Arrow Up: Navigate to previous payment method
        if (event.key === "ArrowUp") {
            event.preventDefault();
            this._navigatePaymentMethods(-1);
            return;
        }

        // Enter: Select payment method OR validate order if fully paid / overpaid
        if (event.key === "Enter") {
            event.preventDefault();
            this._handleEnterPayment();
            return;
        }

        // V: Validate order directly
        if (event.key === "v" || event.key === "V") {
            event.preventDefault();
            this.validateOrder(false);
            return;
        }
    },

    /**
     * Navigate through payment methods with arrow keys
     */
    _navigatePaymentMethods(direction) {
        const paymentMethods = this.payment_methods_from_config;
        if (!paymentMethods || paymentMethods.length === 0) return;

        // Remove previous highlight
        this._removePaymentMethodHighlight();

        // Update index
        this._selectedPaymentMethodIndex += direction;
        
        // Wrap around
        if (this._selectedPaymentMethodIndex >= paymentMethods.length) {
            this._selectedPaymentMethodIndex = 0;
        } else if (this._selectedPaymentMethodIndex < 0) {
            this._selectedPaymentMethodIndex = paymentMethods.length - 1;
        }

        // Highlight new selection
        this._highlightPaymentMethod(this._selectedPaymentMethodIndex);
    },

    /**
     * Highlight selected payment method
     */
    _highlightPaymentMethod(index) {
        const buttons = document.querySelectorAll(".payment-screen .paymentmethods .button.paymentmethod");
        if (buttons[index]) {
            buttons[index].classList.add("moresco-keyboard-selected");
            buttons[index].scrollIntoView({ 
                behavior: "smooth", 
                block: "nearest" 
            });
        }
    },

    /**
     * Remove highlight from all payment methods
     */
    _removePaymentMethodHighlight() {
        document.querySelectorAll(".payment-screen .paymentmethods .button.paymentmethod").forEach(btn => {
            btn.classList.remove("moresco-keyboard-selected");
        });
    },

    /**
     * Handle Enter key: select payment method or validate order
     */
    async _handleEnterPayment() {
        const currentOrder = this.currentOrder;
        if (!currentOrder) return;

        // Check if order is fully paid or overpaid (change due)
        const dueAmount = currentOrder.get_due();
        
        if (dueAmount <= 0.01) {
            // Order is fully paid or customer is paying with a larger bill (change) - validate
            await this.validateOrder(false);
        } else {
            // Order not paid - select current payment method
            const paymentMethods = this.payment_methods_from_config;
            if (paymentMethods && paymentMethods[this._selectedPaymentMethodIndex]) {
                const selectedMethod = paymentMethods[this._selectedPaymentMethodIndex];
                await this._addSinglePaymentLineByMethod(selectedMethod);
            }
        }
    },

    /**
     * Keep a single payment line per payment method.
     * If it already exists, select it instead of creating a duplicate line.
     */
    async _addSinglePaymentLineByMethod(selectedMethod) {
        const existingLine = this._findPaymentLineByMethod(selectedMethod);

        if (existingLine) {
            this.currentOrder.select_paymentline(existingLine);
            this.env.services.notification.add(
                _t("Este método de pago ya está agregado."),
                { type: "info" }
            );
            return;
        }

        await this.addNewPaymentLine(selectedMethod);
    },

    /**
     * Normalize payment method ids because Odoo records can expose them in different shapes.
     */
    _getPaymentMethodId(methodOrLineValue) {
        if (!methodOrLineValue) return null;
        if (typeof methodOrLineValue === "number") return methodOrLineValue;
        if (typeof methodOrLineValue === "object") {
            if (typeof methodOrLineValue.id === "number") return methodOrLineValue.id;
            if (Array.isArray(methodOrLineValue) && typeof methodOrLineValue[0] === "number") {
                return methodOrLineValue[0];
            }
        }
        return null;
    },

    _findPaymentLineByMethod(selectedMethod) {
        const targetMethodId = this._getPaymentMethodId(selectedMethod);
        if (!targetMethodId) return null;
        const paymentLines = this.paymentLines || [];
        return paymentLines.find((line) => {
            const lineMethodId = this._getPaymentMethodId(line.payment_method_id);
            return lineMethodId === targetMethodId;
        });
    },

    async addNewPaymentLine(paymentMethod) {
        const existingLine = this._findPaymentLineByMethod(paymentMethod);
        if (existingLine) {
            this.currentOrder.select_paymentline(existingLine);
            return true;
        }
        return await super.addNewPaymentLine(...arguments);
    },

    updateSelectedPaymentline(amount = false) {
        // Core Odoo auto-creates a new line when all lines are paid.
        // We prevent duplicate method lines by reusing the first configured method line if it exists.
        if (this.paymentLines.every((line) => line.paid)) {
            const firstMethod = this.payment_methods_from_config?.[0];
            if (firstMethod) {
                const existingLine = this._findPaymentLineByMethod(firstMethod);
                if (existingLine) {
                    this.currentOrder.select_paymentline(existingLine);
                    return super.updateSelectedPaymentline(amount);
                }
            }
        }

        const beforeCount = this.paymentLines.length;
        super.updateSelectedPaymentline(amount);

        // Safety net: if a duplicate line was created by any internal flow, remove it.
        if (this.paymentLines.length > beforeCount) {
            const seenMethodIds = new Set();
            for (const line of [...this.paymentLines]) {
                const methodId = this._getPaymentMethodId(line.payment_method_id);
                if (!methodId) continue;
                if (seenMethodIds.has(methodId)) {
                    this.currentOrder.remove_paymentline(line);
                } else {
                    seenMethodIds.add(methodId);
                }
            }
        }
    },
});


/**
 * Patch ReceiptScreen for keyboard navigation
 */
patch(ReceiptScreen.prototype, {
    setup() {
        super.setup(...arguments);
        
        this._morescoReceiptKeyHandler = this._handleMorescoReceiptKey.bind(this);
        
        onMounted(() => {
            document.addEventListener("keydown", this._morescoReceiptKeyHandler, true);
        });
        
        onWillUnmount(() => {
            document.removeEventListener("keydown", this._morescoReceiptKeyHandler, true);
        });
    },

    /**
     * Keyboard handler for receipt screen
     */
    _handleMorescoReceiptKey(event) {
        // Skip if typing in input
        const target = event.target;
        const tagName = target?.tagName?.toLowerCase();
        const isInput = tagName === "input" || tagName === "textarea";
        const isPopup = target?.closest?.(".popup");
        
        if (isInput || isPopup) {
            return;
        }

        // Enter: New order
        if (event.key === "Enter") {
            event.preventDefault();
            this._triggerNewOrder();
            return;
        }
    },

    /**
     * Trigger new order (same as clicking "New Order" button)
     */
    _triggerNewOrder() {
        console.log("🔄 Moresco Keyboard: Attempting to trigger new order");
        
        // Try multiple selectors to find the new order button
        const selectors = [
            '.receipt-screen .button.next:not(.not-clickable)',
            '.receipt-screen .button.next',
            '.receipt-screen button.btn-primary',
            '.receipt-screen button[name="new_order"]',
            '.receipt-screen .button-container .button'
        ];
        
        for (const selector of selectors) {
            const button = document.querySelector(selector);
            if (button && !button.disabled && !button.classList.contains('not-clickable')) {
                console.log("✅ New order button found:", selector);
                button.click();
                
                // Focus search bar after new order is created
                this._focusSearchAfterNewOrder();
                return;
            }
        }
        
        // Fallback: look for any button with "New Order" text content
        const allButtons = document.querySelectorAll('.receipt-screen button, .receipt-screen .button');
        for (const button of allButtons) {
            if (button.textContent.includes('New Order') || 
                button.textContent.includes('Nueva Orden') ||
                button.textContent.includes('Nouvelle commande')) {
                console.log("✅ New order button found by text content");
                button.click();
                
                // Focus search bar after new order is created
                this._focusSearchAfterNewOrder();
                return;
            }
        }
        
        // Last resort: use the onClickNext method if available
        if (typeof this.onClickNext === "function") {
            console.log("✅ Using onClickNext method");
            this.onClickNext();
            
            // Focus search bar after new order is created
            this._focusSearchAfterNewOrder();
        } else {
            console.warn("⚠️ No new order button found");
        }
    },
    
    /**
     * Focus search bar after creating new order
     */
    _focusSearchAfterNewOrder() {
        // Wait for screen transition to complete
        setTimeout(() => {
            const searchInput = document.querySelector(
                ".pos-rightheader .input-container input, " +
                ".input-container input[placeholder*='Search'], " +
                "input[placeholder*='products']"
            );
            
            if (searchInput) {
                searchInput.focus();
                console.log("✅ Search bar focused for new order");
            } else {
                console.warn("⚠️ Search bar not found after new order");
            }
        }, 300); // Wait 300ms for screen transition
    },
});
