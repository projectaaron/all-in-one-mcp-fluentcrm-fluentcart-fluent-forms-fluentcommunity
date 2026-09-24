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

## FluentCRM (`crm_*`, 23 areas, 366 tools)

| Area | Class | Tools | Description |
|------|-------|-------|-------------|
| `crm_contacts` | read/write/delete | 32 | Look up, create, update, delete, and manage CRM contacts (subscribers), including their notes, tags, lists, and email history. |
| `crm_lists` | read/write/delete | 7 | View, create, update, or delete the contact lists used to organize CRM subscribers. |
| `crm_tags` | read/write/delete | 7 | View, create, update, or delete the tags used to label CRM contacts. |
| `crm_segments` | read/write/delete | 9 | View, create, update, or delete dynamic contact segments and see which contacts match them. |
| `crm_custom_fields` | read/write | 3 | View or update the custom contact fields configured in the CRM. |
| `crm_labels` | read/write/delete | 4 | View, create, update, or delete the labels used to organize items in the CRM. |
| `crm_companies` | read/write/delete | 21 | Look up, create, update, delete, and manage CRM companies, their notes, and their associated contacts. |
| `crm_campaigns` | read/write/delete | 39 | Create, schedule, send, pause, duplicate, delete, and analyze one-off email campaigns, including resending failed or unopened emails. |
| `crm_recurring_campaigns` | read/write/delete | 14 | Manage recurring (automatically repeating) email campaigns from creation through scheduling and deletion (FluentCRM Pro). |
| `crm_sequences` | read/write/delete | 19 | Manage email sequence (drip) automations, their emails, and their subscribers (FluentCRM Pro). |
| `crm_automations` | read/write/delete | 32 | Manage marketing automation funnels and their subscribers, from creation and editing to import, export, and deletion. |
| `crm_templates` | read/write/delete | 12 | Manage reusable email templates, including creating, duplicating, updating, and deleting them. |
| `crm_forms` | read/write | 5 | View and manage the opt-in forms connected to the CRM. |
| `crm_webhooks` | read/write/delete | 4 | Manage incoming webhooks that create or update CRM contacts from external services. |
| `crm_smart_links` | read/write/delete | 5 | Manage Smart Links that tag and redirect contacts when clicked (FluentCRM Pro). |
| `crm_sms` | read/write/delete | 25 | Manage SMS campaigns, templates, contacts' phone data, and SMS settings (FluentCRM Pro). |
| `crm_reports` | read | 27 | Read-only CRM analytics: dashboard stats, subscriber growth, email and revenue reports, commerce reports, and global search. |
| `crm_abandoned_carts` | read/write/delete | 3 | View abandoned-cart records and their report summary, and delete records in bulk (FluentCRM Pro commerce feature). |
| `crm_settings` | read/write/delete | 46 | Read or update FluentCRM settings such as double opt-in, business info, email preferences, compliance, and experimental features. |
| `crm_settings_pro` | read/write/delete | 11 | Read or update FluentCRM Pro settings such as the plugin license and Pro-only features. |
| `crm_utilities` | read/write/delete | 20 | Administrative utilities: import contacts from CSV or WordPress users, export contacts, migrate from other tools, list WordPress users and roles, browse in-app docs, and receive bounce webhooks. |
| `crm_ai` | read/write | 7 | FluentCRM's AI assistant: generate or rewrite text and email bodies, summarize a contact, list provider models, and manage the AI provider settings and connection test. |
| `crm_email_patterns` | read/write/delete | 11 | Reusable email content patterns and their categories: list, create (incl. from wp_block payloads), update, delete, and bulk actions. |

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
- `crm_webhooks`: `{"name":"crm_webhooks_list","arguments":{"per_page":5}}`
- `crm_smart_links`: `{"name":"crm_smart_links_list","arguments":{"per_page":5}}`
- `crm_sms`: `{"name":"crm_sms_list_campaigns","arguments":{"per_page":5}}`
- `crm_reports`: `{"name":"crm_reports_get_advanced_providers","arguments":{}}`
- `crm_abandoned_carts`: `{"name":"crm_abandoned_carts_list","arguments":{"per_page":5}}`
- `crm_settings`: `{"name":"crm_settings_get_abandon_cart","arguments":{}}`
- `crm_settings_pro`: `{"name":"crm_settings_pro_get_license_status","arguments":{}}`
- `crm_utilities`: `{"name":"crm_utilities_list_users","arguments":{"per_page":5}}`
- `crm_ai`: `{"name":"crm_ai_get_settings","arguments":{}}`
- `crm_email_patterns`: `{"name":"crm_email_patterns_list_categories","arguments":{"per_page":5}}`

## FluentCart (`cart_*`, 25 areas, 436 tools)

| Area | Class | Tools | Description |
|------|-------|-------|-------------|
| `cart_orders` | read/write/delete | 32 | Look up, create, update, refund, and manage store orders, including their statuses, transactions, addresses, and disputes. |
| `cart_products` | read/write/delete | 32 | Look up, create, update, delete, and bulk-edit store products, including search, duplication, taxonomy terms, and shipping/tax classes. |
| `cart_product_variants` | read/write/delete | 22 | Manage product variations: pricing, inventory and stock, bundles, upgrade paths, media, and variant search. |
| `cart_product_assets` | read/write/delete | 9 | Manage products' downloadable files and per-product integration feeds. |
| `cart_customers` | read/write/delete | 18 | Look up, create, update, and manage store customers, their addresses, purchase stats, and linked WordPress users. |
| `cart_coupons` | read/write/delete | 12 | Manage discount coupons: create, update, delete, apply to or remove from orders, and check product eligibility. |
| `cart_subscriptions` | read/write/delete | 19 | View and manage recurring subscriptions: cancel, re-sync from the payment gateway, switch payment methods, and handle early payments. |
| `cart_tax` | read/write/delete | 27 | Manage tax classes, tax rates, per-country configuration, EU VAT/OSS overrides, and order tax records. |
| `cart_shipping` | read/write/delete | 19 | Manage shipping zones, shipping methods, and shipping classes. |
| `cart_settings` | read/write/delete | 39 | Read or update store settings: general store options, modules and addons, permissions, payment methods, storage drivers, and checkout fields. |
| `cart_email_notifications` | read/write/delete | 15 | Manage the store's transactional email templates, global email settings, reminders, and previews. |
| `cart_reports` | read | 41 | Read-only store analytics: revenue, orders, products, customers, subscriptions, refunds, licenses, and dashboard summaries. |
| `cart_integrations` | read/write/delete | 12 | Manage global integration feeds and provider settings, and install or activate integration addons. |
| `cart_files` | read/write/delete | 5 | List, upload, and delete files in the store's configured storage drivers. |
| `cart_labels_attributes` | read/write/delete | 15 | Manage store labels and product attribute groups and their terms. |
| `cart_utilities` | read/write/delete | 28 | Store utilities: dashboard stats and onboarding, activity log, order notes, print templates, country data, filter options, and retention snapshots; saved list views (filters) for the admin UI. |
| `cart_storefront` | read | 3 | Read-only public storefront data: published products, rendered product listings, and product search — no authentication required. |
| `cart_checkout` | read/write | 7 | Checkout-session operations: place an order, fetch payment and shipping info for the cart, and log a customer in. |
| `cart_customer_portal` | read/write/delete | 18 | Customer-portal operations on the logged-in customer's own profile, orders, addresses, subscriptions, and downloads. |
| `cart_licensing` | read/write/delete | 26 | Manage software licenses: view, extend, regenerate keys, change limits, activate or deactivate sites, plus the public license verification endpoints (FluentCart Pro). |
| `cart_roles` | read/write/delete | 7 | Manage FluentCart shop roles, permissions, and user assignments (FluentCart Pro). |
| `cart_order_bumps` | read/write/delete | 5 | Manage checkout order bumps: list, create, update, and delete (FluentCart Pro). |
| `cart_inventory` | read/write/delete | 6 | Stock across all products and variants: list and stats, single and bulk stock updates, adjustment history, and inventory export. |
| `cart_data_export` | read/write | 8 | Batch data exports of customers, orders, subscriptions and licenses, plus the export schema (available columns) for each. |
| `cart_pdf_templates` | read/write/delete | 11 | PDF receipt/invoice templates: list, get, save and delete templates, factory defaults, PDF engine status, preview download, and the seller details printed on documents. |

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
- `cart_customer_portal`: `{"name":"cart_customer_portal_select_address_for_checkout","arguments":{"customerAddressId":123}}`
- `cart_licensing`: `{"name":"cart_licensing_list_licenses","arguments":{"per_page":5}}`
- `cart_roles`: `{"name":"cart_roles_list_managers","arguments":{"per_page":5}}`
- `cart_order_bumps`: `{"name":"cart_order_bumps_list","arguments":{"per_page":5}}`
- `cart_inventory`: `{"name":"cart_inventory_list","arguments":{"per_page":5}}`
- `cart_data_export`: `{"name":"cart_data_export_get_customers_schema","arguments":{}}`
- `cart_pdf_templates`: `{"name":"cart_pdf_templates_list","arguments":{"per_page":5}}`

## WP Social Ninja (`social_*`, 9 areas, 126 tools)

| Area | Class | Tools | Description |
|------|-------|-------|-------------|
| `social_reviews` | read/write/delete | 11 | Manage the reviews collected from connected platforms: list, edit, duplicate, categorize, change status, or mark as spam. |
| `social_testimonials` | read/write/delete | 11 | Manage hand-written testimonials, their statuses, spam flags, and categories. |
| `social_templates` | read/write/delete | 14 | Manage the review and social-feed widget templates rendered on the site via shortcodes and blocks. |
| `social_platforms` | read/write/delete | 20 | Connect review and feed platforms (Google, Facebook, Instagram, …), manage their configs, and sync their content. |
| `social_chat_widgets` | read/write/delete | 8 | Manage floating chat widgets (WhatsApp, Messenger, Telegram, …) shown on the site. |
| `social_notifications` | read/write/delete | 5 | Manage sales/social-proof notification popups. |
| `social_shoppable` | read/write/delete | 5 | Manage the shoppable Instagram feed and its product-tagged posts. |
| `social_settings` | read/write/delete | 23 | Global WP Social Ninja settings: general and advanced options, translations, licensing, managers, resets, and the onboarding wizard. |
| `social_collection` | read/write/delete | 29 | Collect new reviews: review forms, custom sources, get-reviews QR codes, form captcha, FluentCRM tagging, and WooCommerce/FluentCart review imports. |

Example calls:

- `social_reviews`: `{"name":"social_reviews_list","arguments":{"per_page":5}}`
- `social_testimonials`: `{"name":"social_testimonials_list","arguments":{"per_page":5}}`
- `social_templates`: `{"name":"social_templates_list","arguments":{"per_page":5}}`
- `social_platforms`: `{"name":"social_platforms_list","arguments":{"per_page":5}}`
- `social_chat_widgets`: `{"name":"social_chat_widgets_list","arguments":{"per_page":5}}`
- `social_notifications`: `{"name":"social_notifications_list","arguments":{"per_page":5}}`
- `social_shoppable`: `{"name":"social_shoppable_list_posts","arguments":{"per_page":5}}`
- `social_settings`: `{"name":"social_settings_list_managers","arguments":{"per_page":5}}`
- `social_collection`: `{"name":"social_collection_list_review_forms","arguments":{"per_page":5}}`

## Fluent Forms (`forms_*`, 7 areas, 91 tools)

| Area | Class | Tools | Description |
|------|-------|-------|-------------|
| `forms_forms` | read/write/delete | 17 | Create, read, update, duplicate, convert and delete forms, and inspect their fields, shortcodes, embedding pages and edit history. |
| `forms_submissions` | read/write/delete | 17 | Read and manage form submissions (entries): filters, notes, logs, statuses, favorites, bulk actions, and the public submission endpoint. |
| `forms_settings` | read/write/delete | 12 | Per-form settings: general options, confirmations, style customizer, entry columns, conversational design, and style presets. |
| `forms_integrations` | read/write/delete | 8 | Connect forms to third-party services: global integration credentials and per-form integration feeds. |
| `forms_reports` | read | 14 | Read-only analytics for forms: submission counts, completion rates, revenue, payment types, heatmaps and top-performing forms. |
| `forms_admin` | read/write/delete | 11 | Site-level Fluent Forms administration: global settings, licensing, managers and role capabilities. |
| `forms_utilities` | read/write/delete | 12 | Maintenance and helper operations: system logs, global search, admin notices, plugin install helpers, and the MCP adapter settings. |

Example calls:

- `forms_forms`: `{"name":"forms_forms_list","arguments":{"per_page":5}}`
- `forms_submissions`: `{"name":"forms_submissions_list","arguments":{"per_page":5}}`
- `forms_settings`: `{"name":"forms_settings_get","arguments":{"form_id":123}}`
- `forms_integrations`: `{"name":"forms_integrations_list_global","arguments":{"per_page":5}}`
- `forms_reports`: `{"name":"forms_reports_list","arguments":{"per_page":5}}`
- `forms_admin`: `{"name":"forms_admin_list_managers","arguments":{"per_page":5}}`
- `forms_utilities`: `{"name":"forms_utilities_list_logs","arguments":{"per_page":5}}`

## FluentCommunity (`community_*`, 8 areas, 274 tools)

| Area | Class | Tools | Description |
|------|-------|-------|-------------|
| `community_spaces` | read/write/delete | 35 | Manage community spaces and space groups: membership, lock screens, links, paywalls, and each space's media gallery. |
| `community_feeds` | read/write/delete | 44 | Posts and the activity feed: create and edit posts, comments, reactions, bookmarks, surveys, uploaded documents and media, scheduled posts, and moderation reports. |
| `community_chat` | read/write/delete | 30 | Direct and group chat: threads, group membership, messages, reactions, and blocking. |
| `community_courses` | read/write/delete | 54 | Courses end to end: course CRUD, sections, lessons, students and enrolment, quizzes, progress, and the member-facing course views. |
| `community_profiles` | read/write/delete | 33 | Member profiles and directory: profile fields, follows and blocks, notification preferences, memberships, invitations, notifications, and the leaderboard. |
| `community_analytics` | read | 12 | Read-only community analytics: activity over time, popular spaces, and top members. |
| `community_settings` | read/write/delete | 22 | Portal settings and runtime options: colours, features, menus, privacy, snippets, follower and player settings, and CRM tagging. |
| `community_admin` | read/write/delete | 44 | Site administration: licensing, managers, webhooks, topics, badges, onboarding, and the auth, email, push, PWA, storage and messaging settings. |

Example calls:

- `community_spaces`: `{"name":"community_spaces_list_paywalls","arguments":{"spaceId":123,"per_page":5}}`
- `community_feeds`: `{"name":"community_feeds_list_activities","arguments":{"per_page":5}}`
- `community_chat`: `{"name":"community_chat_list_group_members","arguments":{"thread_id":123,"per_page":5}}`
- `community_courses`: `{"name":"community_courses_list_all_space_courses","arguments":{"per_page":5}}`
- `community_profiles`: `{"name":"community_profiles_list_invitations","arguments":{"per_page":5}}`
- `community_analytics`: `{"name":"community_analytics_list_top_commenters","arguments":{"per_page":5}}`
- `community_settings`: `{"name":"community_settings_list_menu_items","arguments":{"per_page":5}}`
- `community_admin`: `{"name":"community_admin_list_custom_profile_fields","arguments":{"per_page":5}}`

## Server built-ins (6 tools)

| Tool | Class | Description |
|------|-------|-------------|
| `tool_map` | read | This map — overview, per-area drill-down, keyword search. |
| `verify_setup` | read | Check credentials, connectivity, and plugin presence per product. |
| `support_report` | read | Redacted diagnostic report (version, connection checks, recent errors) to paste into a support request or GitHub issue. |
| `wp_media_upload_from_url` | write | Upload an image from a URL (server-side fetch). |
| `wp_media_get` | read | Get one media attachment. |
| `wp_media_list` | read | List or search the media library. |

Examples: `{"name": "verify_setup", "arguments": {}}` ·
`{"name": "tool_map", "arguments": {"search": "refund"}}` ·
`{"name": "wp_media_upload_from_url", "arguments": {"source_url": "https://cdn.example.com/photo.jpg", "alt_text": "Product photo"}}`

**Total: 1299 tools** (`FLUENT_TOOL_MODE=grouped` serves 75 instead).
