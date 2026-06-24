/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { onMounted, onWillUnmount } from "@odoo/owl";
import { _t } from "@web/core/l10n/translation";

/**
 * Moresco Keyboard Navigation for PoS
 * Allows cashier to work 100% with keyboard, no mouse needed.
 * 
 * Product Screen shortcuts:
 * - Enter: Select first product from search results and add to cart (only when search has text)
 * - Up/Down Arrows: Navigate through product list
 * - Enter (on selected product): Add product to cart
 * - Escape: Return focus to search bar
 * - Tab: Clear search and focus search bar for next product
 * - F2: Trigger payment (go to payment screen)
 * 
 * For payment screen navigation, see moresco_payment_keyboard.js
 */

patch(ProductScreen.prototype, {
    setup() {
        super.setup(...arguments);
        
        this._morescoKeyboardHandler = this._handleMorescoKeyboard.bind(this);
        this._selectedProductIndex = -1;
        this._lastSearchValue = "";
        this._lastProductCount = 0;
        this._isAddingProductFromKeyboard = false;
        
        onMounted(() => {
            document.addEventListener("keydown", this._morescoKeyboardHandler, true);
        });
        
        onWillUnmount(() => {
            document.removeEventListener("keydown", this._morescoKeyboardHandler, true);
        });
    },

    /**
     * Enhanced keyboard handler for full keyboard navigation
     */
    _handleMorescoKeyboard(event) {
        // Skip if typing in textarea or special input (notes, payment, etc)
        const target = event.target;
        const tagName = target?.tagName?.toLowerCase();
        const isTextArea = tagName === "textarea";
        const isNumpad = target?.closest?.(".numpad");
        const isPaymentScreen = target?.closest?.(".payment-screen");
        const isPopup = target?.closest?.(".popup");
        const isDialogOpen = this._hasActiveDialog();
        
        if (isTextArea || isNumpad || isPaymentScreen || isPopup || isDialogOpen) {
            return; // Let default behavior work in these contexts
        }

        const searchInput = this._getSearchInput();
        const isFocusedOnSearch = searchInput && document.activeElement === searchInput;
        const productCards = this._getProductCards();
        const searchValue = searchInput ? searchInput.value.trim() : "";
        
        // Enter key: Add product to cart
        if (event.key === "Enter") {
            if (searchValue.length > 0) {
                // If there's text in search: numeric query -> exact default_code, text query -> first result
                event.preventDefault();
                this._selectAndAddProductFromSearch(searchValue);
                return;
            } else if (this._selectedProductIndex >= 0 && productCards.length > 0) {
                // If a product card is focused with arrows, add it to cart
                event.preventDefault();
                this._addFocusedProductToCart(productCards);
                return;
            }
        }
        
        // Arrow Down: Navigate to next product
        if (event.key === "ArrowDown") {
            event.preventDefault();
            this._navigateProducts(productCards, 1);
            return;
        }
        
        // Arrow Up: Navigate to previous product
        if (event.key === "ArrowUp") {
            event.preventDefault();
            this._navigateProducts(productCards, -1);
            return;
        }
        
        // Escape: Return to search bar
        if (event.key === "Escape") {
            event.preventDefault();
            this._focusSearchBar();
            this._selectedProductIndex = -1;
            return;
        }
        
        // Tab: Clear search and focus for next product
        if (event.key === "Tab" && isFocusedOnSearch) {
            event.preventDefault();
            this._clearAndFocusSearch();
            return;
        }
        
        // F2: Pay button (trigger payment)
        if (event.key === "F2") {
            event.preventDefault();
            this._triggerPayment();
            return;
        }
        
        // Any other key while not focused on search: focus search bar
        if (!isFocusedOnSearch && !event.ctrlKey && !event.altKey && event.key.length === 1) {
            this._focusSearchBar();
            // Let the key be typed in the search bar
        }
    },

    /**
     * Get the search input element
     */
    _getSearchInput() {
        return document.querySelector(
            ".pos-rightheader .input-container input, " +
            ".input-container input[placeholder*='Search'], " +
            "input[placeholder*='products']"
        );
    },

    /**
     * Get all visible product card elements
     */
    _getProductCards() {
        const cards = document.querySelectorAll(
            ".product-list article.product, " +
            ".product-list .product-card, " +
            "article.product"
        );
        // Reset selection when product list changes
        const visibleCards = Array.from(cards).filter(card => {
            const style = window.getComputedStyle(card);
            return style.display !== "none" && style.visibility !== "hidden";
        });
        
        // If product count changed, reset selection
        if (this._lastProductCount !== visibleCards.length) {
            this._selectedProductIndex = -1;
            this._lastProductCount = visibleCards.length;
            // Remove selection from all cards
            document.querySelectorAll(".moresco-keyboard-selected").forEach(card => {
                card.classList.remove("moresco-keyboard-selected");
            });
        }
        
        return visibleCards;
    },

    /**
     * Focus the search bar
     */
    _focusSearchBar() {
        const searchInput = this._getSearchInput();
        if (searchInput) {
            searchInput.focus();
            searchInput.select(); // Select all text for easy replacement
        }
    },

    /**
     * Clear search and focus search bar
     */
    _clearAndFocusSearch() {
        const searchInput = this._getSearchInput();
        if (searchInput) {
            searchInput.value = "";
            searchInput.dispatchEvent(new Event("input", { bubbles: true }));
            searchInput.focus();
        }
        this._selectedProductIndex = -1;
    },

    /**
     * Returns true if there is an active Odoo dialog/popup opened.
     */
    _hasActiveDialog() {
        return Boolean(document.querySelector(".o_dialog:not(.o_inactive_modal)"));
    },

    /**
     * Add product using current search value.
     * Numeric search -> exact internal reference (default_code) match.
     * Text search -> first product in current filtered results.
     */
    async _selectAndAddProductFromSearch(searchValue) {
        if (this._isAddingProductFromKeyboard) {
            return;
        }

        const query = (searchValue || "").trim();
        if (!query) return;

        // Use getProductsBySearchWord directly (avoids reactive-state lag from this.productsToDisplay)
        const products = this.getProductsBySearchWord(query);
        if (!products.length) {
            this.env.services.notification.add(
                _t("No hay productos para: ") + query,
                { type: "warning" }
            );
            return;
        }

        const isNumericQuery = /^\d+$/.test(query);

        let productToAdd = null;
        if (isNumericQuery) {
            productToAdd = products.find((product) => {
                const defaultCode = String(product.default_code || "").trim();
                return defaultCode === query;
            });

            if (!productToAdd) {
                this.env.services.notification.add(
                    _t("No existe una referencia interna exacta para: ") + query,
                    { type: "warning" }
                );
                return;
            }
        } else {
            productToAdd = products[0];
        }

        this._isAddingProductFromKeyboard = true;
        try {
            await this.addProductToOrder(productToAdd);
            setTimeout(() => {
                this._clearAndFocusSearch();
            }, 100);
        } finally {
            this._isAddingProductFromKeyboard = false;
        }
    },

    /**
     * Add currently focused/selected product to cart
     */
    _addFocusedProductToCart(productCards) {
        if (this._selectedProductIndex >= 0 && this._selectedProductIndex < productCards.length) {
            const selectedCard = productCards[this._selectedProductIndex];
            selectedCard.click();
            
            // Clear search and refocus for next product
            setTimeout(() => {
                this._clearAndFocusSearch();
            }, 100);
        }
    },

    /**
     * Navigate through product list with arrow keys
     * @param {Array} productCards - Array of product card elements
     * @param {number} direction - 1 for down, -1 for up
     */
    _navigateProducts(productCards, direction) {
        if (!productCards || productCards.length === 0) return;

        // Remove previous highlight
        if (this._selectedProductIndex >= 0 && this._selectedProductIndex < productCards.length) {
            productCards[this._selectedProductIndex].classList.remove("moresco-keyboard-selected");
        }

        // Update index
        if (this._selectedProductIndex === -1) {
            this._selectedProductIndex = direction > 0 ? 0 : productCards.length - 1;
        } else {
            this._selectedProductIndex += direction;
            
            // Wrap around
            if (this._selectedProductIndex >= productCards.length) {
                this._selectedProductIndex = 0;
            } else if (this._selectedProductIndex < 0) {
                this._selectedProductIndex = productCards.length - 1;
            }
        }

        // Highlight new selection
        const selectedCard = productCards[this._selectedProductIndex];
        selectedCard.classList.add("moresco-keyboard-selected");
        
        // Scroll into view
        selectedCard.scrollIntoView({ 
            behavior: "smooth", 
            block: "nearest",
            inline: "nearest"
        });
        
        // Remove focus from search input
        const searchInput = this._getSearchInput();
        if (searchInput && document.activeElement === searchInput) {
            searchInput.blur();
        }
    },

    /**
     * Trigger payment button
     */
    _triggerPayment() {
        const currentOrder = this.pos.get_order();
        if (!currentOrder || currentOrder.is_empty()) {
            this.env.services.notification.add(
                _t("No hay productos en la orden"),
                { type: "warning" }
            );
            return;
        }
        
        // Trigger the payment action
        this.pos.pay();
    },

});
