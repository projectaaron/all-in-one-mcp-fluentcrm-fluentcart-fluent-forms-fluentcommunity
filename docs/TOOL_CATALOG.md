# Tool catalog

Every tool this server exposes: name, what it does, read/write/delete
classification, action count, and one example call. **Generated** by
`scripts/gen-tool-catalog.mjs` from the live registry — regenerate after any
tool-surface change. Action-level signatures live in each tool's `action`
parameter description; full endpoint schemas live in
[`docs/api-reference/`](./api-reference/).

Destructive actions (marked ⚠ in the tool's action list) always require
`confirm: true` — without it the tool refuses and explains what would happen.

## FluentCRM (`crm_*`, 21 tools, 319 endpoints)

| Tool | Class | Actions | Description |
|------|-------|---------|-------------|
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

- `crm_contacts`: `{"name":"crm_contacts","arguments":{"action":"list_contacts","per_page":5}}`
- `crm_lists`: `{"name":"crm_lists","arguments":{"action":"list_lists","per_page":5}}`
- `crm_tags`: `{"name":"crm_tags","arguments":{"action":"list_tags","per_page":5}}`
- `crm_segments`: `{"name":"crm_segments","arguments":{"action":"list_dynamic_segments","per_page":5}}`
- `crm_custom_fields`: `{"name":"crm_custom_fields","arguments":{"action":"get_contact_custom_fields"}}`
- `crm_labels`: `{"name":"crm_labels","arguments":{"action":"list_labels","per_page":5}}`
- `crm_companies`: `{"name":"crm_companies","arguments":{"action":"list_companies","per_page":5}}`
- `crm_campaigns`: `{"name":"crm_campaigns","arguments":{"action":"list_campaigns","per_page":5}}`
- `crm_recurring_campaigns`: `{"name":"crm_recurring_campaigns","arguments":{"action":"list_recurring_campaigns","per_page":5}}`
- `crm_sequences`: `{"name":"crm_sequences","arguments":{"action":"list_sequences","per_page":5}}`
- `crm_automations`: `{"name":"crm_automations","arguments":{"action":"list_funnels","per_page":5}}`
- `crm_templates`: `{"name":"crm_templates","arguments":{"action":"list_all_templates","per_page":5}}`
- `crm_forms`: `{"name":"crm_forms","arguments":{"action":"list_forms","per_page":5}}`
- `crm_webhooks`: `{"name":"crm_webhooks","arguments":{"action":"list_sms_webhooks","per_page":5}}`
- `crm_smart_links`: `{"name":"crm_smart_links","arguments":{"action":"list_smart_links","per_page":5}}`
- `crm_sms`: `{"name":"crm_sms","arguments":{"action":"list_sms_campaigns","per_page":5}}`
- `crm_reports`: `{"name":"crm_reports","arguments":{"action":"get_advanced_report_providers"}}`
- `crm_abandoned_carts`: `{"name":"crm_abandoned_carts","arguments":{"action":"list_abandoned_carts","per_page":5}}`
- `crm_settings`: `{"name":"crm_settings","arguments":{"action":"get_abandon_cart_settings"}}`
- `crm_settings_pro`: `{"name":"crm_settings_pro","arguments":{"action":"get_license_status"}}`
- `crm_utilities`: `{"name":"crm_utilities","arguments":{"action":"list_users","per_page":5}}`

## FluentCart (`cart_*`, 22 tools, 380 endpoints)

| Tool | Class | Actions | Description |
|------|-------|---------|-------------|
| `cart_orders` | read/write/delete | 22 | Look up, create, update, refund, and manage store orders, including their statuses, transactions, addresses, and disputes. |
| `cart_products` | read/write/delete | 27 | Look up, create, update, delete, and bulk-edit store products, including search, duplication, taxonomy terms, and shipping/tax classes. |
| `cart_product_variants` | read/write/delete | 23 | Manage product variations: pricing, inventory and stock, bundles, upgrade paths, media, and variant search. |
| `cart_product_assets` | read/write/delete | 9 | Manage products' downloadable files and per-product integration feeds. |
| `cart_customers` | read/write/delete | 18 | Look up, create, update, and manage store customers, their addresses, purchase stats, and linked WordPress users. |
| `cart_coupons` | read/write/delete | 12 | Manage discount coupons: create, update, delete, apply to or remove from orders, and check product eligibility. |
| `cart_subscriptions` | read/write/delete | 17 | View and manage recurring subscriptions: cancel, re-sync from the payment gateway, switch payment methods, and handle early payments. |
| `cart_tax` | read/write/delete | 26 | Manage tax classes, tax rates, per-country configuration, EU VAT/OSS overrides, and order tax records. |
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

- `cart_orders`: `{"name":"cart_orders","arguments":{"action":"list_orders","per_page":5}}`
- `cart_products`: `{"name":"cart_products","arguments":{"action":"list_products","per_page":5}}`
- `cart_product_variants`: `{"name":"cart_product_variants","arguments":{"action":"list_all_variants","per_page":5}}`
- `cart_product_assets`: `{"name":"cart_product_assets","arguments":{"action":"get_downloadable_url","id":123}}`
- `cart_customers`: `{"name":"cart_customers","arguments":{"action":"list_customers","per_page":5}}`
- `cart_coupons`: `{"name":"cart_coupons","arguments":{"action":"list_coupon_codes","per_page":5}}`
- `cart_subscriptions`: `{"name":"cart_subscriptions","arguments":{"action":"list_subscriptions","per_page":5}}`
- `cart_tax`: `{"name":"cart_tax","arguments":{"action":"list_all_tax_rates","per_page":5}}`
- `cart_shipping`: `{"name":"cart_shipping","arguments":{"action":"list_shipping_classes","per_page":5}}`
- `cart_settings`: `{"name":"cart_settings","arguments":{"action":"list_all_payment_methods","per_page":5}}`
- `cart_email_notifications`: `{"name":"cart_email_notifications","arguments":{"action":"list_notifications","per_page":5}}`
- `cart_reports`: `{"name":"cart_reports","arguments":{"action":"country_heat_map"}}`
- `cart_integrations`: `{"name":"cart_integrations","arguments":{"action":"list_addons","per_page":5}}`
- `cart_files`: `{"name":"cart_files","arguments":{"action":"list_files","per_page":5}}`
- `cart_labels_attributes`: `{"name":"cart_labels_attributes","arguments":{"action":"list_attribute_groups","per_page":5}}`
- `cart_utilities`: `{"name":"cart_utilities","arguments":{"action":"list_activities","per_page":5}}`
- `cart_storefront`: `{"name":"cart_storefront","arguments":{"action":"list_products","per_page":5}}`
- `cart_checkout`: `{"name":"cart_checkout","arguments":{"action":"get_available_shipping_methods"}}`
- `cart_customer_portal`: `{"name":"cart_customer_portal","arguments":{"action":"get_customer_details","id":123}}`
- `cart_licensing`: `{"name":"cart_licensing","arguments":{"action":"list_licenses","per_page":5}}`
- `cart_roles`: `{"name":"cart_roles","arguments":{"action":"list_managers","per_page":5}}`
- `cart_order_bumps`: `{"name":"cart_order_bumps","arguments":{"action":"list_order_bumps","per_page":5}}`

## Server (2 tools)

| Tool | Class | Description |
|------|-------|-------------|
| `verify_setup` | read | Check site reachability, per-product credentials, plugin presence, and run one harmless read per configured product. |
| `wp_media` | read/write | WordPress media library: upload an image from a URL (server-side fetch — ideal for migrating product photos from another platform's CDN), or look up existing media. |

Examples: `{"name": "verify_setup", "arguments": {}}` ·
`{"name": "wp_media", "arguments": {"action": "upload_from_url", "source_url": "https://cdn.example.com/photo.jpg", "alt_text": "Product photo"}}`

**Total: 45 tools.**
