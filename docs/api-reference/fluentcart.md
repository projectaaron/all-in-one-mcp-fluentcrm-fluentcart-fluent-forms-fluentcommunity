# FluentCart REST API — Reference

> **Source:** <https://dev.fluentcart.com/restapi/> · **Scraped:** 2026-09-21 · **Endpoints:** 436 across 24 groups
> Regenerate with `node scripts/gen-api-docs.mjs fluentcart` — see [MAINTAINING.md](./MAINTAINING.md).

**Base URL:** `https://{website}/wp-json/fluent-cart/v2` (namespace `fluent-cart/v2`)

## Authentication

| Context | Used by | Auth |
|---------|---------|------|
| Admin | most endpoints | WordPress Application Passwords (HTTP Basic `username:application_password`) |
| Customer Portal | `/customer-profile/*`, `/checkout/*`, `/user/login` | WordPress cookie + nonce (browser session — not usable with Application Passwords) |
| Public | `/public/*` and license query endpoints | None |

Credential setup for all products: [auth.md](./auth.md).

Request/response schemas for every endpoint below are in FluentCart's own developer documentation: <https://dev.fluentcart.com/restapi/> (source: <https://github.com/WPManageNinja>). This file is an inventory, not a copy of that documentation.

## Groups

| Group | Endpoints |
|-------|-----------|
| Orders | 32 |
| Products | 63 |
| Customers | 18 |
| Coupons | 12 |
| Subscriptions | 19 |
| Tax | 27 |
| Shipping | 19 |
| Settings | 39 |
| Email Notifications | 15 |
| Reports | 43 |
| Integrations | 12 |
| Files | 5 |
| Labels & Attributes | 15 |
| Dashboard & Utilities | 22 |
| Public Shop | 3 |
| Checkout | 7 |
| Customer Profile | 18 |
| Licensing (Pro) | 26 |
| Roles & Permissions (Pro) | 7 |
| Order Bumps (Pro) | 5 |
| data-export | 8 |
| inventory | 6 |
| pdf-templates | 11 |
| saved-views | 4 |

## Endpoints by group

### Orders

| Method | Path | Summary |
|--------|------|---------|
| POST | `/orders/{order}/transactions/{transaction_id}/accept-dispute` | POST Accept Dispute |
| POST | `/orders/do-bulk-action` | POST Bulk Actions |
| POST | `/orders/calculate-shipping` | POST Calculate Shipping |
| POST | `/orders/{order_id}/change-customer` | POST Change Customer |
| POST | `/orders/{order_id}/create-and-change-customer` | POST Create and Change Customer |
| POST | `/orders/{order}/create-custom` | POST Create Custom Order Item |
| POST | `/orders` | POST Create Order |
| DELETE | `/orders/{order_id}` | DELETE Delete Order |
| POST | `/orders/{order}/generate-missing-licenses` | POST Generate Missing Licenses |
| GET | `/orders/{order_id}` | GET Get Order Details |
| GET | `/orders/{order}/transactions` | GET Get Order Transactions |
| GET | `/orders/shipping_methods` | GET Get Shipping Methods |
| GET | `/orders/{id}/transactions/{transaction_id}` | GET Get Single Transaction |
| GET | `/orders` | GET List Orders |
| POST | `/orders/{order}/mark-as-paid` | POST Mark Order as Paid |
| POST | `/orders/{order_id}/refund` | POST Refund Order |
| PUT | `/orders/{order}/sync-statuses` | PUT Sync Order Statuses |
| POST | `/orders/{order_id}` | POST Update Order |
| PUT | `/orders/{order}/address/{id}` | PUT Update Order Address |
| POST | `/orders/{order_id}/update-address-id` | POST Update Order Address ID |
| PUT | `/orders/{order}/statuses` | PUT Update Statuses |
| PUT | `/orders/{order}/transactions/{transaction}/status` | PUT Update Transaction Status |
| POST | `/orders/calculate-tax` | POST Calculate Order Tax |
| POST | `/orders/{order}/subscriptions/{subscription}/charge-now` | POST Charge Subscription Now |
| POST | `/orders/{order}/subscriptions/{subscription}/create-renewal` | POST Create Renewal Now |
| GET | `/renewals/{id}` | GET Get Renewal Invoice Details |
| GET | `/renewals` | GET List Renewal Invoices |
| POST | `/renewals/{order}/resend` | POST Resend Renewal Invoice Email |
| POST | `/orders/{order}/subscriptions/{subscription}/skip-renewal` | POST Skip Next Renewal Period |
| POST | `/orders/{order}/transactions/{transaction}/sync` | POST Sync Pending Transaction |
| PUT | `/orders/{order}/subscriptions/{subscription}/update` | PUT Update Subscription |
| POST | `/renewals/{order}/void` | POST Void Renewal Invoice |

### Products

| Method | Path | Summary |
|--------|------|---------|
| POST | `/products/add-product-terms` | POST Add Product Terms |
| GET | `/products/bulk-edit-data` | GET Bulk Edit Fetch |
| POST | `/products/bulk-insert` | POST Bulk Insert Products |
| POST | `/products/bulk-update` | POST Bulk Update Products |
| POST | `/products/{product_id}/integrations/feed/change-status` | POST Change Integration Status |
| POST | `/products/create-dummy` | POST Create Dummy Products |
| POST | `/products` | POST Create Product |
| POST | `/products/variants` | POST Create Variation |
| DELETE | `/products/{downloadableId}/delete` | DELETE Delete Downloadable File |
| DELETE | `/products/{product}` | DELETE Delete Product |
| DELETE | `/products/{product_id}/integrations/{integration_id}` | DELETE Delete Product Integration |
| POST | `/products/delete-taxonomy-term/{postId}` | POST Delete Taxonomy Term |
| DELETE | `/products/upgrade-path/{id}/delete` | DELETE Delete Upgrade Path |
| DELETE | `/products/variants/{variantId}` | DELETE Delete Variation |
| POST | `/products/do-bulk-action` | POST Do Bulk Action |
| POST | `/products/{productId}/duplicate` | POST Duplicate Product |
| GET | `/products/fetchProductsByIds` | GET Fetch Products by IDs |
| GET | `/products/fetch-term` | GET Fetch Taxonomy Terms |
| POST | `/products/fetch-term-by-parent` | POST Fetch Terms by Parent |
| GET | `/products/fetchVariationsByIds` | GET Fetch Variations by IDs |
| GET | `/products/findSubscriptionVariants` | GET Find Subscription Variants |
| GET | `/products/get-bundle-info/{productId}` | GET Get Bundle Info |
| GET | `/products/getDownloadableUrl/{downloadableId}` | GET Get Downloadable URL |
| GET | `/products/get-max-excerpt-word-count` | GET Get Max Excerpt Word Count |
| GET | `/products/{productId}/pricing-widgets` | GET Get Pricing Widgets |
| GET | `/products/{product}` | GET Get Product |
| GET | `/products/{productId}/integrations` | GET Get Product Integration Feeds |
| GET | `/products/{product_id}/integrations/{integration_name}/settings` | GET Get Product Integration Settings |
| GET | `/products/{productId}/pricing` | GET Get Product Pricing |
| GET | `/products/{productId}/related-products` | GET Get Related Products |
| GET | `/products/{id}/upgrade-paths` | GET Get Upgrade Settings |
| GET | `/products/variation/{variantId}/upgrade-paths` | GET Get Variation Upgrade Paths |
| GET | `/variants` | GET List All Variants |
| GET | `/products/variants` | GET List Product Variations |
| GET | `/products` | GET List Products |
| POST | `/products/{postId}/shipping-class/remove` | POST Remove Shipping Class |
| POST | `/products/{postId}/tax-class/remove` | POST Remove Tax Class |
| POST | `/products/save-bundle-info/{variationId}` | POST Save Bundle Info |
| POST | `/products/{product_id}/integrations` | POST Save Product Integration |
| POST | `/products/{id}/upgrade-path` | POST Save Upgrade Path |
| GET | `/products/search-product-variant-options` | GET Search Product Variant Options |
| GET | `/products/searchProductByName` | GET Search Products by Name |
| GET | `/products/searchVariantByName` | GET Search Variants by Name |
| POST | `/products/variants/{variantId}/setMedia` | POST Set Variation Media |
| GET | `/products/suggest-sku` | GET Suggest SKU |
| POST | `/products/{postId}/sync-downloadable-files` | POST Sync Downloadable Files |
| POST | `/products/sync-taxonomy-term/{postId}` | POST Sync Taxonomy Terms |
| PUT | `/products/{downloadableId}/update` | PUT Update Downloadable File |
| PUT | `/products/{postId}/update-inventory/{variantId}` | PUT Update Inventory |
| POST | `/products/{postId}/update-long-desc-editor-mode` | POST Update Long Description Editor Mode |
| PUT | `/products/{postId}/update-manage-stock` | PUT Update Manage Stock Setting |
| POST | `/products/detail/{detailId}` | POST Update Product Detail |
| POST | `/products/{postId}/pricing` | POST Update Product Pricing |
| POST | `/products/{postId}/shipping-class` | POST Update Shipping Class |
| POST | `/products/{postId}/tax-class` | POST Update Tax Class |
| POST | `/products/upgrade-path/{id}/update` | POST Update Upgrade Path |
| POST | `/products/{postId}/update-variant-option` | POST Update Variant Option |
| POST | `/products/variants/{variantId}` | POST Update Variation |
| PUT | `/products/variants/{variantId}/pricing-table` | PUT Update Variation Pricing Table |
| POST | `/products/variants/bulk-update` | POST Bulk Update Product Variants |
| POST | `/products/variants/group-bulk-update` | POST Group Bulk Update Variants |
| POST | `/products/{postId}/tax-exempt` | POST Toggle Product Tax Exempt |
| POST | `/products/variants/{variantId}/tax-exempt` | POST Update Variant Tax Settings |

### Customers

| Method | Path | Summary |
|--------|------|---------|
| POST | `/customers/{customerId}/attachable-user` | POST Attach WordPress User |
| POST | `/customers/do-bulk-action` | POST Bulk Actions |
| POST | `/customers/{customerId}/address` | POST Create Address |
| POST | `/customers` | POST Create Customer |
| DELETE | `/customers/{customerId}/address` | DELETE Delete Address |
| POST | `/customers/{customerId}/detach-user` | POST Detach WordPress User |
| GET | `/customers/{customerId}/order` | GET Find Customer Order |
| GET | `/customers/attachable-user` | GET Get Attachable Users |
| GET | `/customers/{customerId}` | GET Get Customer |
| GET | `/customers/{customerId}/address` | GET Get Customer Addresses |
| GET | `/customers/{customerId}/orders` | GET Get Customer Orders |
| GET | `/customers/get-stats/{customer}` | GET Get Customer Stats |
| GET | `/customers` | GET List Customers |
| POST | `/customers/{customerId}/recalculate-ltv` | POST Recalculate Lifetime Value |
| POST | `/customers/{customerId}/address/make-primary` | POST Set Primary Address |
| PUT | `/customers/{customerId}/additional-info` | PUT Update Additional Info (Labels) |
| PUT | `/customers/{customerId}/address` | PUT Update Address |
| PUT | `/customers/{customerId}` | PUT Update Customer |

### Coupons

| Method | Path | Summary |
|--------|------|---------|
| POST | `/coupons/apply` | POST Apply Coupon |
| POST | `/coupons/cancel` | POST Cancel Coupon |
| POST | `/coupons/checkProductEligibility` | POST Check Product Eligibility |
| POST | `/coupons` | POST Create Coupon |
| DELETE | `/coupons/{id}` | DELETE Coupon |
| GET | `/coupons/{id}` | GET Coupon Details |
| GET | `/coupons/getSettings` | GET Coupon Settings |
| GET | `/coupons/listCoupons` | GET List Coupon Codes |
| GET | `/coupons` | GET List Coupons |
| POST | `/coupons/re-apply` | POST Re-apply Coupons |
| POST | `/coupons/storeCouponSettings` | POST Store Coupon Settings |
| PUT | `/coupons/{id}` | PUT Update Coupon |

### Subscriptions

| Method | Path | Summary |
|--------|------|---------|
| POST | `/customer-profile/subscriptions/{subscription_uuid}/cancel-auto-renew` | POST Cancel Auto-Renew |
| PUT | `/orders/{order}/subscriptions/{subscription}/cancel` | PUT Cancel Subscription |
| POST | `/customer-profile/subscriptions/{subscription_uuid}/confirm-subscription-switch` | POST Confirm Subscription Switch |
| PUT | `/orders/{order}/subscriptions/{subscription}/fetch` | PUT Fetch Subscription from Remote |
| POST | `/orders/{order}/subscriptions/{subscription}/early-payment-link` | POST Generate Early Payment Link |
| GET | `/customer-profile/subscriptions/{subscription_uuid}` | GET Get Customer Subscription Details |
| POST | `/customer-profile/subscriptions/{subscription_uuid}/get-or-create-plan` | POST Get or Create Plan |
| GET | `/customer-profile/subscriptions/{subscription_uuid}/setup-intent-attempts` | GET Get Setup Intent Remaining Attempts |
| GET | `/subscriptions/{subscriptionOrderId}` | GET Get Subscription Details |
| POST | `/customer-profile/subscriptions/{subscription_uuid}/initiate-early-payment` | POST Initiate Early Payment |
| GET | `/customer-profile/subscriptions` | GET List Customer Subscriptions |
| GET | `/subscriptions` | GET List Subscriptions |
| PUT | `/orders/{order}/subscriptions/{subscription}/pause` | PUT Pause Subscription |
| PUT | `/orders/{order}/subscriptions/{subscription}/reactivate` | PUT Reactivate Subscription |
| PUT | `/orders/{order}/subscriptions/{subscription}/resume` | PUT Resume Subscription |
| POST | `/customer-profile/subscriptions/{subscription_uuid}/switch-payment-method` | POST Switch Payment Method |
| POST | `/customer-profile/subscriptions/{subscription_uuid}/update-payment-method` | POST Update Payment Method |
| PUT | `/orders/{order}/subscriptions/{subscription}/vendor-ids` | PUT Update Vendor IDs |
| POST | `/orders/{order}/subscriptions/{subscription}/verify-vendor-ids` | POST Verify Vendor IDs |

### Tax

| Method | Path | Summary |
|--------|------|---------|
| POST | `/tax/classes` | POST Create Tax Class |
| POST | `/tax/country/rate` | POST Create Tax Rate |
| DELETE | `/tax/rates/country/override/{id}` | DELETE Delete Shipping Tax Override |
| DELETE | `/tax/classes/{id}` | DELETE Delete Tax Class |
| DELETE | `/tax/country/rate/{id}` | DELETE Delete Tax Rate |
| GET | `/tax/country-tax-id/{country_code}` | GET Get Country Tax ID |
| GET | `/tax/rates/country/rates/{country_code}` | GET Get Country Tax Rates |
| GET | `/tax/configuration/rates` | GET Get Preconfigured Tax Rates |
| GET | `/tax/configuration/settings` | GET Get Tax Settings |
| GET | `/tax/rates` | GET List All Tax Rates |
| GET | `/tax/classes` | GET List Tax Classes |
| GET | `/taxes` | GET List Tax Records |
| POST | `/taxes` | POST Mark Taxes as Filed |
| POST | `/tax/configuration/countries` | POST Save Configured Countries |
| POST | `/tax/country-tax-id/{country_code}` | POST Save Country Tax ID |
| POST | `/tax/configuration/settings/eu-vat` | POST Save EU VAT Cross-Border Settings |
| POST | `/tax/rates/country/override` | POST Save Shipping Tax Override |
| POST | `/tax/configuration/settings` | POST Save Tax Settings |
| PUT | `/tax/country/rate/{id}` | PUT Update Tax Rate |
| DELETE | `/tax/product-overrides/{id}` | DELETE Delete Product Category Tax Override |
| GET | `/tax/configuration/settings/eu-vat/product-overrides` | GET Get EU VAT Product Overrides |
| GET | `/tax/configuration/settings/eu-vat/oss-rates` | GET Get OSS Country Rates |
| GET | `/tax/product-overrides/{country_code}` | GET Get Product Category Tax Overrides |
| POST | `/tax/configuration/settings/eu-vat/reset-rates` | POST Reset EU VAT Rates |
| POST | `/tax/configuration/settings/eu-vat/oss-rates` | POST Save OSS Country Rates |
| POST | `/tax/product-overrides` | POST Save Product Category Tax Override |
| POST | `/tax/country-status/{country_code}` | POST Update Country Tax Status |

### Shipping

| Method | Path | Summary |
|--------|------|---------|
| POST | `/shipping/classes` | POST Create Shipping Class |
| POST | `/shipping/methods` | POST Create Shipping Method |
| POST | `/shipping/zones` | POST Create Shipping Zone |
| DELETE | `/shipping/classes/{id}` | DELETE Delete Shipping Class |
| DELETE | `/shipping/methods/{method_id}` | DELETE Delete Shipping Method |
| DELETE | `/shipping/zones/{id}` | DELETE Delete Shipping Zone |
| GET | `/shipping/classes/{id}` | GET Get Shipping Class |
| GET | `/shipping/zones/{id}` | GET Get Shipping Zone |
| GET | `/shipping/zone/states` | GET Get Zone States |
| GET | `/shipping/classes` | GET List Shipping Classes |
| GET | `/shipping/zones` | GET List Shipping Zones |
| PUT | `/shipping/classes/{id}` | PUT Update Shipping Class |
| PUT | `/shipping/methods` | PUT Update Shipping Method |
| PUT | `/shipping/zones/{id}` | PUT Update Shipping Zone |
| POST | `/shipping/zones/update-order` | POST Update Zone Order |
| GET | `/shipping/classes/{id}/profile` | GET Get Shipping Class Profile |
| GET | `/shipping/packages` | GET Get Shipping Packages |
| GET | `/shipping/zone/countries` | GET Get Countries By Continent |
| POST | `/shipping/packages` | POST Save Shipping Packages |

### Settings

| Method | Path | Summary |
|--------|------|---------|
| POST | `/settings/payment-methods/activate-addon` | POST Activate Payment Addon |
| POST | `/settings/modules/plugin-addons/activate` | POST Activate Plugin Addon |
| GET | `/settings/payment-methods/paypal/webhook/check` | GET Check PayPal Webhook |
| POST | `/settings/payment-methods/disconnect` | POST Disconnect Payment Method |
| POST | `/settings/payment-methods/paypal/seller-auth-token` | POST Exchange PayPal Seller Auth Token |
| GET | `/settings/storage-drivers/active-drivers` | GET Get Active Storage Drivers |
| GET | `/checkout-fields/get-fields` | GET Get Checkout Fields |
| GET | `/settings/confirmation/shortcode` | GET Get Email Shortcodes |
| GET | `/settings/modules` | GET Get Module Settings |
| GET | `/settings/payment-methods/connect/info` | GET Get Payment Method Connection Info |
| GET | `/settings/payment-methods` | GET Get Payment Method Settings |
| GET | `/settings/permissions` | GET Get Permissions |
| GET | `/settings/modules/plugin-addons` | GET Get Plugin Addons |
| GET | `/settings/storage-drivers/{driver}` | GET Get Storage Driver Settings |
| GET | `/settings/store` | GET Get Store Settings |
| POST | `/settings/payment-methods/install-addon` | POST Install Payment Addon |
| POST | `/settings/modules/plugin-addons/install` | POST Install Plugin Addon |
| GET | `/settings/payment-methods/all` | GET List All Payment Methods |
| GET | `/settings/storage-drivers` | GET List All Storage Drivers |
| POST | `/settings/payment-methods/reorder` | POST Reorder Payment Methods |
| POST | `/checkout-fields/save-fields` | POST Save Checkout Fields |
| POST | `/settings/confirmation` | POST Save Confirmation Settings |
| POST | `/settings/modules` | POST Save Module Settings |
| POST | `/settings/payment-methods/design` | POST Save Payment Method Design |
| POST | `/settings/payment-methods` | POST Save Payment Method Settings |
| POST | `/settings/permissions` | POST Save Permissions |
| POST | `/settings/storage-drivers` | POST Save Storage Driver Settings |
| POST | `/settings/store` | POST Save Store Settings |
| POST | `/settings/payment-methods/paypal/webhook/setup` | POST Setup PayPal Webhook |
| POST | `/settings/storage-drivers/verify-info` | POST Verify Storage Driver Connection |
| POST | `/settings/storage-drivers/change-status` | POST Change Storage Driver Status |
| POST | `/settings/storage-drivers/create-bucket` | POST Create Storage Bucket |
| GET | `/settings/mcp/config-snippets` | GET Get MCP Config Snippets |
| GET | `/settings/mcp` | GET Get MCP Status |
| POST | `/settings/mcp/install-adapter` | POST Install MCP Adapter |
| POST | `/settings/storage-drivers/bucket-list` | POST List Storage Buckets |
| POST | `/settings/storage-drivers/reset` | POST Reset Storage Driver Settings |
| POST | `/settings/mcp/toggle` | POST Toggle MCP |
| POST | `/settings/modules/turnstile/verify` | POST Verify Turnstile Keys |

### Email Notifications

| Method | Path | Summary |
|--------|------|---------|
| POST | `/email-notification/enable-notification/{name}` | POST Enable/Disable Notification |
| GET | `/email-notification/{notification}` | GET Get Single Notification |
| GET | `/email-notification/reminders` | GET Get Scheduling Settings |
| GET | `/email-notification/get-settings` | GET Get Global Email Settings |
| GET | `/email-notification/get-short-codes` | GET Get Shortcodes |
| GET | `/email-notification` | GET List All Notifications |
| POST | `/email-notification/preview-default-template` | POST Preview Default Template |
| POST | `/email-notification/preview` | POST Preview Notification |
| POST | `/email-notification/reminders` | POST Save Scheduling Settings |
| POST | `/email-notification/save-settings` | POST Save Global Email Settings |
| PUT | `/email-notification/{notification}` | PUT Update Notification |
| GET | `/email-notification/digest-settings` | GET Get Store Digest Settings |
| POST | `/email-notification/digest-settings` | POST Save Store Digest Settings |
| POST | `/email-notification/digest-settings/send-test` | POST Send Test Digest Email |
| POST | `/email-notification/send-manual-reminder` | POST Send Manual Reminder |

### Reports

| Method | Path | Summary |
|--------|------|---------|
| GET | `/reports/country-heat-map` | GET Get Country Heat Map |
| GET | `/reports/customer-report` | GET Get Customer Report |
| GET | `/reports/daily-signups` | GET Get Daily Signups |
| GET | `/reports/dashboard-stats` | GET Get Dashboard Stats |
| GET | `/reports/fetch-new-vs-returning-customer` | GET Get New vs Returning Customers |
| GET | `/reports/fetch-order-by-group` | GET Get Orders by Group |
| GET | `/reports/fetch-report-by-day-and-hour` | GET Get Report by Day and Hour |
| GET | `/reports/fetch-report-meta` | GET Get Report Meta |
| GET | `/reports/fetch-top-sold-products` | GET Get Top Sold Products |
| GET | `/reports/fetch-top-sold-variants` | GET Get Top Sold Variants |
| GET | `/reports/future-renewals` | GET Get Future Renewals |
| POST | `/reports/retention-snapshots/generate` | POST Generate Retention Snapshots |
| GET | `/reports/get-dashboard-summary` | GET Get Dashboard Summary |
| GET | `/reports/overview` | GET Get Revenue Overview |
| GET | `/reports/get-recent-activities` | GET Get Recent Activities |
| GET | `/reports/get-recent-orders` | GET Get Recent Orders |
| GET | `/reports/revenue` | GET Get Revenue Data |
| GET | `/reports/item-count-distribution` | GET Get Item Count Distribution |
| GET | `/reports/license-chart` | GET Get License Line Chart |
| GET | `/reports/license-pie-chart` | GET Get License Pie Chart |
| GET | `/reports/license-summary` | GET Get License Summary |
| GET | `/reports/order-chart` | GET Get Order Chart |
| GET | `/reports/order-completion-time` | GET Get Order Completion Time |
| GET | `/reports/order-value-distribution` | GET Get Order Value Distribution |
| GET | `/reports/product-performance` | GET Get Product Performance |
| GET | `/reports/product-report` | GET Get Product Report |
| GET | `/reports/quick-order-stats` | GET Get Quick Order Stats |
| GET | `/reports/refund-chart` | GET Get Refund Chart |
| GET | `/reports/refund-data-by-group` | GET Get Refund Data by Group |
| GET | `/reports/report-overview` | GET Get Report Overview |
| GET | `/reports/retention-chart` | GET Get Retention Chart |
| GET | `/reports/retention-snapshots/status` | GET Check Retention Snapshot Status |
| GET | `/reports/revenue-by-group` | GET Get Revenue by Group |
| GET | `/reports/sales-growth` | GET Get Sales Growth |
| GET | `/reports/sales-growth-chart` | GET Get Sales Growth Chart |
| GET | `/reports/sales-report` | GET Get Sales Report |
| GET | `/reports/search-repeat-customer` | GET Search Repeat Customers |
| GET | `/reports/sources` | GET Get Source Report |
| GET | `/reports/subscription-chart` | GET Get Subscription Chart |
| GET | `/reports/subscription-cohorts` | GET Get Subscription Cohorts |
| GET | `/reports/subscription-retention` | GET Get Subscription Retention |
| GET | `/reports/top-products-sold` | GET Get Top Products Sold _(deprecated)_ |
| GET | `/reports/weeks-between-refund` | GET Get Weeks Between Refund |

### Integrations

| Method | Path | Summary |
|--------|------|---------|
| POST | `/integration/feed/chained` | POST Chained Data Request |
| POST | `/integration/global-feeds/change-status/{integration_id}` | POST Change Feed Status |
| DELETE | `/integration/global-feeds/{integration_id}` | DELETE Feed |
| GET | `/integration/feed/dynamic_options` | GET Dynamic Options |
| GET | `/integration/feed/lists` | GET Feed Merge Fields (Lists) |
| GET | `/integration/global-feeds/settings` | GET Feed Settings |
| GET | `/integration/global-feeds` | GET List Global Integration Feeds |
| GET | `/integration/global-settings` | GET Global Integration Settings |
| POST | `/integration/feed/install-plugin` | POST Install and Activate Add-on Plugin |
| GET | `/integration/addons` | GET List Available Add-ons |
| POST | `/integration/global-feeds/settings` | POST Save Feed Settings |
| POST | `/integration/global-settings` | POST Save Global Integration Settings |

### Files

| Method | Path | Summary |
|--------|------|---------|
| DELETE | `/files/delete` | DELETE Delete File |
| GET | `/files/bucket-list` | GET Get Bucket List |
| GET | `/files` | GET List Files |
| POST | `/upload-editor-file` | POST Upload Editor File |
| POST | `/files/upload` | POST Upload File |

### Labels & Attributes

| Method | Path | Summary |
|--------|------|---------|
| POST | `/options/attr/group` | POST Create Attribute Group |
| POST | `/labels` | POST Create Label |
| DELETE | `/options/attr/group/{group_id}` | DELETE Delete Attribute Group |
| DELETE | `/options/attr/group/{group_id}/term/{term_id}` | DELETE Delete Attribute Term |
| GET | `/options/attr/group/{group_id}` | GET Get Attribute Group |
| GET | `/options/attr/groups` | GET List Attribute Groups |
| GET | `/options/attr/group/{group_id}/terms` | GET List Attribute Terms |
| GET | `/labels` | GET List Labels |
| PUT | `/options/attr/group/{group_id}` | PUT Update Attribute Group |
| POST | `/options/attr/group/{group_id}/term/{term_id}` | POST Update Attribute Term |
| POST | `/labels/update-label-selections` | POST Update Label Selections |
| POST | `/options/attr/group/{group_id}/terms` | POST Create Attribute Terms |
| GET | `/options/attr/groups/library` | GET Get Attribute Groups Library |
| POST | `/options/attr/groups/reorder` | POST Reorder Attribute Groups |
| POST | `/options/attr/group/{group_id}/terms/reorder` | POST Reorder Attribute Terms |

### Dashboard & Utilities

| Method | Path | Summary |
|--------|------|---------|
| POST | `/notes/attach` | POST Attach Note to Order |
| POST | `/onboarding/create-pages` | POST Create All Pages |
| POST | `/onboarding/create-page` | POST Create Single Page |
| DELETE | `/activity/{id}` | DELETE Delete Activity |
| GET | `/address-info/get-country-info` | GET Get Country Info |
| GET | `/dashboard/stats` | GET Get Dashboard Stats |
| GET | `/advance_filter/get-filter-options` | GET Get Filter Options |
| GET | `/dashboard` | GET Get Onboarding Data |
| GET | `/onboarding` | GET Get Onboarding Settings |
| GET | `/templates/print-templates` | GET Get Print Templates |
| GET | `/forms/search_options` | GET Get Search Options |
| GET | `/widgets` | GET Get Widgets |
| GET | `/app/init` | GET Initialize App |
| GET | `/activity` | GET List Activities |
| GET | `/app/attachments` | GET List Attachments |
| GET | `/address-info/countries` | GET List Countries |
| PUT | `/activity/{id}/mark-read` | PUT Mark Activity Read/Unread |
| POST | `/onboarding` | POST Save Onboarding Settings |
| PUT | `/templates/print-templates` | PUT Save Print Templates |
| POST | `/app/upload-attachments` | POST Upload Attachment |
| POST | `/data-backfills/run` | POST Run Pending Data Backfills |
| POST | `/onboarding/save-tax` | POST Save Onboarding Tax Settings |

### Public Shop

| Method | Path | Summary |
|--------|------|---------|
| GET | `/public/product-views` | GET Get Product Views |
| GET | `/public/products` | GET List Products |
| GET | `/public/product-search` | GET Search Products |

### Checkout

| Method | Path | Summary |
|--------|------|---------|
| GET | `/checkout/get-available-shipping-methods` | GET Get Available Shipping Methods |
| GET | `/checkout/get-checkout-summary-view` | GET Get Checkout Summary |
| GET | `/checkout/get-country-info` | GET Get Country Info |
| GET | `/checkout/get-order-info` | GET Get Order Info |
| GET | `/checkout/get-shipping-methods-list-view` | GET Get Shipping Methods List View |
| POST | `/user/login` | POST Login |
| POST | `/checkout/place-order` | POST Place Order |

### Customer Profile

| Method | Path | Summary |
|--------|------|---------|
| POST | `/customers/add-address` | POST Create Address (Checkout) |
| POST | `/customer-profile/create-address` | POST Create Profile Address |
| GET | `/customer-profile` | GET Dashboard Overview |
| POST | `/customer-profile/delete-address` | POST Delete Profile Address |
| GET | `/customer-profile/orders/{order_uuid}` | GET Get Order Details |
| GET | `/customer-profile/profile` | GET Get Profile Details |
| GET | `/customer-profile/orders/{transaction_uuid}/billing-address` | GET Get Transaction Billing Address |
| GET | `/customer-profile/orders/{order_uuid}/upgrade-paths` | GET Get Upgrade Paths |
| GET | `/customer-profile/downloads` | GET List Downloads |
| GET | `/customer-profile/orders` | GET List Orders |
| POST | `/customer-profile/make-primary-address` | POST Make Profile Address Primary |
| PUT | `/customer-profile/orders/{transaction_uuid}/billing-address` | PUT Save Transaction Billing Address |
| GET | `/customers/{customerAddressId}/update-address-select` | GET Select Address for Checkout |
| POST | `/customer-profile/edit-address` | POST Update Profile Address |
| POST | `/customer-profile/update` | POST Update Profile Details |
| GET | `/customer-profile/sections` | GET Get Portal Sections |
| POST | `/customer-profile/subscriptions/{subscription_uuid}/pause` | POST Pause Subscription |
| POST | `/customer-profile/subscriptions/{subscription_uuid}/resume` | POST Resume Subscription |

### Licensing (Pro)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/settings/license/` | POST Activate Plugin License |
| POST | `/licensing/licenses/{id}/activate_site` | POST Activate Site (Admin) |
| DELETE | `/settings/license/` | DELETE Deactivate Plugin License |
| POST | `/licensing/licenses/{id}/deactivate_site` | POST Deactivate Site (Admin) |
| POST | `/customer-profile/licenses/{license_key}/deactivate_site` | POST Deactivate Site (Customer) |
| DELETE | `/licensing/licenses/{id}/delete` | DELETE Delete License |
| POST | `/licensing/licenses/{id}/extend-validity` | POST Extend License Validity |
| GET | `/customer-profile/licenses/{license_key}` | GET Get Customer License Details |
| GET | `/licensing/licenses/customer/{id}` | GET Get Customer Licenses (Admin) |
| GET | `/customer-profile/licenses/{license_key}/activations` | GET Get License Activations |
| GET | `/licensing/licenses/{id}` | GET Get License Details |
| GET | `/settings/license/` | GET Get Plugin License Status |
| GET | `/licensing/products/{id}/settings` | GET Get Product License Settings |
| GET | `/customer-profile/licenses/` | GET List Customer Licenses |
| GET | `/licensing/licenses` | GET List Licenses |
| POST | `/?fluent-cart=activate_license` | POST Activate License |
| GET | `/?fluent-cart=check_license` | GET Check License |
| POST | `/?fluent-cart=deactivate_license` | POST Deactivate License |
| GET | `/?fluent-cart=download_license_package` | GET Download License Package |
| GET | `/?fluent-cart=get_license_version` | GET Get License Version |
| POST | `/licensing/licenses/{id}/regenerate-key` | POST Regenerate License Key |
| POST | `/licensing/products/{id}/settings` | POST Save Product License Settings |
| POST | `/licensing/licenses/{id}/update_limit` | POST Update License Activation Limit |
| POST | `/licensing/licenses/{id}/update_status` | POST Update License Status |
| GET | `/licensing/sites/{id}` | GET Get License Site |
| GET | `/licensing/sites` | GET List License Sites |

### Roles & Permissions (Pro)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/roles` | POST Assign Role |
| DELETE | `/roles/{key}` | DELETE Delete Role Assignment |
| GET | `/roles/{key}` | GET Get Role |
| GET | `/roles/managers` | GET List Managers |
| GET | `/roles` | GET List Roles |
| GET | `/roles/user-list` | GET Search Users |
| POST | `/roles/{key}` | POST Update Role |

### Order Bumps (Pro)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/order_bump` | POST Create Order Bump |
| DELETE | `/order_bump/{id}` | DELETE Delete Order Bump |
| GET | `/order_bump/{id}` | GET Get Order Bump |
| GET | `/order_bump` | GET List Order Bumps |
| PUT | `/order_bump/{id}` | PUT Update Order Bump |

### data-export

| Method | Path | Summary |
|--------|------|---------|
| POST | `/data-export/customers/batch` | POST Export Customers Batch |
| POST | `/data-export/licenses/batch` | POST Export Licenses Batch |
| POST | `/data-export/orders/batch` | POST Export Orders Batch |
| POST | `/data-export/subscriptions/batch` | POST Export Subscriptions Batch |
| GET | `/data-export/customers/schema` | GET Get Customers Export Schema |
| GET | `/data-export/licenses/schema` | GET Get Licenses Export Schema |
| GET | `/data-export/orders/schema` | GET Get Orders Export Schema |
| GET | `/data-export/subscriptions/schema` | GET Get Subscriptions Export Schema |

### inventory

| Method | Path | Summary |
|--------|------|---------|
| POST | `/inventory/bulk-update` | POST Bulk Update Stock |
| POST | `/inventory/export` | POST Export Inventory |
| GET | `/inventory/adjustment-history` | GET Get Adjustment History |
| GET | `/inventory/stats` | GET Get Inventory Stats |
| GET | `/inventory` | GET List Inventory |
| POST | `/inventory/update-stock` | POST Update Stock |

### pdf-templates

| Method | Path | Summary |
|--------|------|---------|
| POST | `/settings/pdf-templates/create` | POST Create PDF Template |
| DELETE | `/settings/pdf-templates/delete/{template_id}` | DELETE Delete PDF Template |
| POST | `/settings/pdf-templates/download` | POST Download PDF Preview |
| GET | `/settings/pdf-templates/factory-default` | GET Get Factory Default Templates |
| GET | `/settings/pdf-templates/status` | GET Get PDF Status |
| GET | `/settings/pdf-templates/receipt/{template_id}` | GET Get PDF Template |
| GET | `/settings/pdf-templates/saved` | GET Get Saved Templates |
| GET | `/settings/pdf-templates/seller-details` | GET Get Seller Details |
| GET | `/settings/pdf-templates/receipt` | GET List PDF Templates |
| POST | `/settings/pdf-templates/receipt/{template_id}` | POST Save PDF Template |
| POST | `/settings/pdf-templates/seller-details` | POST Save Seller Details |

### saved-views

| Method | Path | Summary |
|--------|------|---------|
| POST | `/saved-views` | POST Create Saved View |
| DELETE | `/saved-views/{id}` | DELETE Delete Saved View |
| GET | `/saved-views` | GET List Saved Views |
| PUT | `/saved-views/{id}` | PUT Update Saved View |

_Generated by `scripts/gen-api-docs.mjs` from the per-operation OpenAPI specs published at dev.fluentcart.com; endpoints marked (Pro) require the product's Pro version._
