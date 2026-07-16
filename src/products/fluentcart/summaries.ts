/** Summary-mode projections per tool: fields kept on each record when
 *  detail:"summary" (the default). Unlisted tools fall back to generic
 *  pruning (long strings truncated). `id` is always preserved. */
export const SUMMARY_FIELDS: Record<string, string[]> = {
  cart_orders: ['id', 'invoice_no', 'status', 'payment_status', 'shipping_status', 'type', 'total_amount', 'total_paid', 'currency', 'customer_id', 'payment_method', 'created_at'],
  cart_products: ['id', 'ID', 'post_title', 'post_status', 'title', 'created_at'],
  cart_product_variants: ['id', 'post_id', 'variation_title', 'variation_identifier', 'payment_type', 'item_price', 'total_stock', 'available', 'stock_status', 'item_status'],
  cart_customers: ['id', 'email', 'first_name', 'last_name', 'status', 'purchase_count', 'ltv', 'city', 'country', 'created_at'],
  cart_coupons: ['id', 'title', 'code', 'type', 'amount', 'status', 'created_at'],
  cart_subscriptions: ['id', 'uuid', 'customer_id', 'product_id', 'status', 'recurring_amount', 'billing_interval', 'next_billing_date', 'created_at'],
  cart_licensing: ['id', 'license_key', 'status', 'customer_id', 'product_id', 'expiration_date', 'limit', 'activation_count', 'created_at'],
};
