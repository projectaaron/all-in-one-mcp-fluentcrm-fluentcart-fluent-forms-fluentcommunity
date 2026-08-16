# Tool catalog

Area-level view of the tool surface: what each area covers, its
read/write/delete classification, and one example call. **Generated** by
`scripts/gen-tool-catalog.mjs` from the live registry — regenerate after any
tool-surface change. The per-tool list (one line per tool) is
[`docs/TOOL_MAP.md`](./TOOL_MAP.md); full endpoint schemas live in
[`docs/api-reference/`](./api-reference/).

Tools are **individualized**: each does exactly one operation and is named
`<area>_<operation>` (e.g. `crm_contacts_list`, `cart_orders_refund`).
Destructive tools (⚠ in the map) always require `confirm: true` — without it
the tool refuses and explains what would happen. Set
`FLUENT_TOOL_MODE=grouped` to serve the legacy one-tool-per-area surface
instead (an `action` parameter selects the operation).

## FluentCRM (`crm_*`, 21 areas, 322 tools)

| Area | Class | Tools | Description |
|------|-------|-------|-------------|
| `crm_contacts` | read/write/delete | 31 | Look up, create, update, delete, and manage CRM contacts (subscribers), including their notes, tags, lists, and email history. |
| `crm_lists` | read/write/delete | 7 | View, create, update, or delete the contact lists used to organize CRM subscribers. |
| `crm_tags` | read/write/delete | 7 | View, create, update, or delete the tags used to label CRM contacts. |
| `crm_segments` | read/write/delete | 9 | View, create, update, or delete dynamic contact segments and see which contacts match them. |
| `crm_custom_fields` | read/write | 3 | View or update the custom contact fields configured in the CRM. |
| `crm_labels` | read/write/delete | 4 | View, create, update, or delete the labels used to organize items in the CRM. |
| `crm_companies` | read/write/delete | 19 | Look up, create, update, delete, and manage CRM companies, their notes, and their associated contacts. |
| `crm_campaigns` | read/write/delete | 39 | Create, schedule, send, pause, duplicate, delete, and analyze one-off email campaigns, including resending failed or unopened emails. |
| `crm_recurring_campaigns` | read/write/delete | 14 | Manage recurring (automatically repeating) email campaigns from creation through scheduling and deletion (FluentCRM Pro). |
| `crm_sequences` | read/write/delete | 18 | Manage email sequence (drip) automations, their emails, and their subscribers (FluentCRM Pro). |
| `crm_automations` | read/write/delete | 31 | Manage marketing automation funnels and their subscribers, from creation and editing to import, export, and deletion. |
| `crm_templates` | read/write/delete | 11 | Manage reusable email templates, including creating, duplicating, updating, and deleting them. |
| `crm_forms` | read/write | 5 | View and manage the opt-in forms connected to the CRM. |
| `crm_webhooks` | read/write/delete | 5 | Manage incoming webhooks that create or update CRM contacts from external services. |
| `crm_smart_links` | read/write/delete | 5 | Manage Smart Links that tag and redirect contacts when clicked (FluentCRM Pro). |
| `crm_sms` | read/write/delete | 24 | Manage SMS campaigns, templates, contacts' phone data, and SMS settings (FluentCRM Pro). |
| `crm_reports` | read | 16 | Read-only CRM analytics: dashboard stats, subscriber growth, email and revenue reports, commerce reports, and global search. |
| `crm_abandoned_carts` | read/write/delete | 3 | View abandoned-cart records and their report summary, and delete records in bulk (FluentCRM Pro commerce feature). |
| `crm_settings` | read/write/delete | 39 | Read or update FluentCRM settings such as double opt-in, business info, email preferences, compliance, and experimental features. |
| `crm_settings_pro` | read/write/delete | 11 | Read or update FluentCRM Pro settings such as the plugin license and Pro-only features. |
| `crm_utilities` | read/write | 18 | Administrative utilities: import contacts from CSV or WordPress users, migrate from other tools, list WordPress users and roles, browse in-app docs, and receive bounce webhooks. |

Example calls:

- `crm_contacts`: `{"name":"crm_contacts_list","arguments":{"per_page":5}}`
- `crm_lists`: `{"name":"crm_lists_list","arguments":{"per_page":5}}`
- `crm_tags`: `{"name":"crm_tags_list","arguments":{"per_page":5}}`
- `crm_segments`: `{"name":"crm_segments_list_dynamic","arguments":{"per_page":5}}`
- `crm_custom_fields`: `{"name":"crm_custom_fields_get_contact","arguments":{}}`
- `crm_labels`: `{"name":"crm_labels_list","arguments":{"per_page":5}}`
- `crm_companies`: `{"name":"crm_companies_list","arguments":{"per_page":5}}`
- `crm_campaigns`: `{"name":"crm_campaigns_list","arguments":{"per_page":5}}`
- `crm_recurring_campaigns`: `{"name":"crm_recurring_campaigns_list","arguments":{"per_page":5}}`
- `crm_sequences`: `{"name":"crm_sequences_list","arguments":{"per_page":5}}`
- `crm_automations`: `{"name":"crm_automations_list_funnels","arguments":{"per_page":5}}`
- `crm_templates`: `{"name":"crm_templates_list_all","arguments":{"per_page":5}}`
- `crm_forms`: `{"name":"crm_forms_list","arguments":{"per_page":5}}`
- `crm_webhooks`: `{"name":"crm_webhooks_list_sms","arguments":{"per_page":5}}`
- `crm_smart_links`: `{"name":"crm_smart_links_list","arguments":{"per_page":5}}`
- `crm_sms`: `{"name":"crm_sms_list_campaigns","arguments":{"per_page":5}}`
- `crm_reports`: `{"name":"crm_reports_get_advanced_providers","arguments":{}}`
- `crm_abandoned_carts`: `{"name":"crm_abandoned_carts_list","arguments":{"per_page":5}}`
- `crm_settings`: `{"name":"crm_settings_get_abandon_cart","arguments":{}}`
- `crm_settings_pro`: `{"name":"crm_settings_pro_get_license_status","arguments":{}}`
- `crm_utilities`: `{"name":"crm_utilities_list_users","arguments":{"per_page":5}}`

## FluentCart (`cart_*`, 22 areas, 381 tools)

| Area | Class | Tools | Description |
|------|-------|-------|-------------|
| `cart_orders` | read/write/delete | 22 | Look up, create, update, refund, and manage store orders, including their statuses, transactions, addresses, and disputes. |
| `cart_products` | read/write/delete | 28 | Look up, create, update, delete, and bulk-edit store products, including search, duplication, taxonomy terms, and shipping/tax classes. |
| `cart_product_variants` | read/write/delete | 22 | Manage product variations: pricing, inventory and stock, bundles, upgrade paths, media, and variant search. |
| `cart_product_assets` | read/write/delete | 9 | Manage products' downloadable files and per-product integration feeds. |
| `cart_customers` | read/write/delete | 18 | Look up, create, update, and manage store customers, their addresses, purchase stats, and linked WordPress users. |
| `cart_coupons` | read/write/delete | 12 | Manage discount coupons: create, update, delete, apply to or remove from orders, and check product eligibility. |
| `cart_subscriptions` | read/write/delete | 17 | View and manage recurring subscriptions: cancel, re-sync from the payment gateway, switch payment methods, and handle early payments. |
| `cart_tax` | read/write/delete | 27 | Manage tax classes, tax rates, per-country configuration, EU VAT/OSS overrides, and order tax records. |
| `cart_shipping` | read/write/delete | 15 | Manage shipping zones, shipping methods, and shipping classes. |
| `cart_settings` | read/write/delete | 30 | Read or update store settings: general store options, modules and addons, permissions, payment methods, storage drivers, and checkout fields. |
| `cart_email_notifications` | read/write | 11 | Manage the store's transactional email templates, global email settings, reminders, and previews. |
| `cart_reports` | read | 41 | Read-only store analytics: revenue, orders, products, customers, subscriptions, refunds, licenses, and dashboard summaries. |
| `cart_integrations` | read/write/delete | 17 | Manage global integration feeds and provider settings, and install or activate integration addons. |
| `cart_files` | read/write/delete | 5 | List, upload, and delete files in the store's configured storage drivers. |
| `cart_labels_attributes` | read/write/delete | 13 | Manage store labels and product attribute groups and their terms. |
| `cart_utilities` | read/write/delete | 22 | Store utilities: dashboard stats and onboarding, activity log, order notes, print templates, country data, filter options, and retention snapshots. |
| `cart_storefront` | read | 3 | Read-only public storefront data: published products, rendered product listings, and product search — no authentication required. |
| `cart_checkout` | read/write | 7 | Checkout-session operations: place an order, fetch payment and shipping info for the cart, and log a customer in. |
| `cart_customer_portal` | read/write/delete | 21 | Customer-portal operations on the logged-in customer's own profile, orders, addresses, subscriptions, and downloads. |
| `cart_licensing` | read/write/delete | 27 | Manage software licenses: view, extend, regenerate keys, change limits, activate or deactivate sites, plus the public license verification endpoints (FluentCart Pro). |
| `cart_roles` | read/write/delete | 9 | Manage FluentCart shop roles, permissions, and user assignments (FluentCart Pro). |
| `cart_order_bumps` | read/write/delete | 5 | Manage checkout order bumps: list, create, update, and delete (FluentCart Pro). |

Example calls:

- `cart_orders`: `{"name":"cart_orders_list","arguments":{"per_page":5}}`
- `cart_products`: `{"name":"cart_products_list","arguments":{"per_page":5}}`
- `cart_product_variants`: `{"name":"cart_product_variants_list_all","arguments":{"per_page":5}}`
- `cart_product_assets`: `{"name":"cart_product_assets_get_downloadable_url","arguments":{"downloadableId":123}}`
- `cart_customers`: `{"name":"cart_customers_list","arguments":{"per_page":5}}`
- `cart_coupons`: `{"name":"cart_coupons_list_codes","arguments":{"per_page":5}}`
- `cart_subscriptions`: `{"name":"cart_subscriptions_list","arguments":{"per_page":5}}`
- `cart_tax`: `{"name":"cart_tax_list_all_rates","arguments":{"per_page":5}}`
- `cart_shipping`: `{"name":"cart_shipping_list_classes","arguments":{"per_page":5}}`
- `cart_settings`: `{"name":"cart_settings_list_all_payment_methods","arguments":{"per_page":5}}`
- `cart_email_notifications`: `{"name":"cart_email_notifications_list","arguments":{"per_page":5}}`
- `cart_reports`: `{"name":"cart_reports_country_heat_map","arguments":{}}`
- `cart_integrations`: `{"name":"cart_integrations_list_addons","arguments":{"per_page":5}}`
- `cart_files`: `{"name":"cart_files_list","arguments":{"per_page":5}}`
- `cart_labels_attributes`: `{"name":"cart_labels_attributes_list_groups","arguments":{"per_page":5}}`
- `cart_utilities`: `{"name":"cart_utilities_list_activities","arguments":{"per_page":5}}`
- `cart_storefront`: `{"name":"cart_storefront_list_products","arguments":{"per_page":5}}`
- `cart_checkout`: `{"name":"cart_checkout_get_available_shipping_methods","arguments":{}}`
- `cart_customer_portal`: `{"name":"cart_customer_portal_get_details","arguments":{"customerId":123}}`
- `cart_licensing`: `{"name":"cart_licensing_list_licenses","arguments":{"per_page":5}}`
- `cart_roles`: `{"name":"cart_roles_list_managers","arguments":{"per_page":5}}`
- `cart_order_bumps`: `{"name":"cart_order_bumps_list","arguments":{"per_page":5}}`

## Server built-ins (5 tools)

| Tool | Class | Description |
|------|-------|-------------|
| `tool_map` | read | This map — overview, per-area drill-down, keyword search. |
| `verify_setup` | read | Check credentials, connectivity, and plugin presence per product. |
| `wp_media_upload_from_url` | write | Upload an image from a URL (server-side fetch). |
| `wp_media_get` | read | Get one media attachment. |
| `wp_media_list` | read | List or search the media library. |

Examples: `{"name": "verify_setup", "arguments": {}}` ·
`{"name": "tool_map", "arguments": {"search": "refund"}}` ·
`{"name": "wp_media_upload_from_url", "arguments": {"source_url": "https://cdn.example.com/photo.jpg", "alt_text": "Product photo"}}`

**Total: 708 tools** (`FLUENT_TOOL_MODE=grouped` serves 46 instead).
