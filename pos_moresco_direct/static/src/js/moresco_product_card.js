/** @odoo-module */

import { ProductCard } from "@point_of_sale/app/generic_components/product_card/product_card";
import { patch } from "@web/core/utils/patch";

patch(ProductCard.prototype, {
    get formattedPrice() {
        const product = this.props.product;
        if (!product) return "";
        return this.env.utils.formatCurrency(product.lst_price);
    },
    get productUom() {
        const product = this.props.product;
        return product?.uom_id?.name || "";
    },
});
