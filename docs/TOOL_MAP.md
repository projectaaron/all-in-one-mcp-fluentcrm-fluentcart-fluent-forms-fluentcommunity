# Tool map

The fast map of this server: **every tool, one line each, grouped by area** —
834 tools in 53 areas. **Generated** by
`scripts/gen-tool-catalog.mjs` from the live registry; regenerate after any
tool-surface change. Sessions get the same map at runtime from the
`tool_map` tool (no args = area overview, `{"area": …}` /
`{"search": …}` to drill down) and a summary in the MCP `instructions`.

**How to read a line:** `name(required_params)` ⚠ — what it does.
Conventions: ⚠ tools are hard to undo and require confirm:true (without it they refuse and explain). 🔒 tools are locked by the server admin and always refuse — confirm:true cannot override. (paginated) tools page by default (page/per_page, 20 per page); every GET tool also accepts page/per_page — many get_* tools return paginated collections. All tools take query filters. Responses are compact summaries — pass detail:"full" or fields:["…"] for complete records.
🔒 marks the tools locked **by default**; the server admin controls the set
via `FLUENT_LOCKED_TOOLS`.
Full endpoint schemas: [`docs/api-reference/`](./api-reference/).

## Areas

| Area | Tools | What it covers |
|------|-------|----------------|
| `crm_contacts` | 31 | Look up, create, update, delete, and manage CRM contacts (subscribers), including their notes, tags, lists, and email history. |
| `crm_lists` | 7 | View, create, update, or delete the contact lists used to organize CRM subscribers. |
| `crm_tags` | 7 | View, create, update, or delete the tags used to label CRM contacts. |
| `crm_segments` | 9 | View, create, update, or delete dynamic contact segments and see which contacts match them. |
| `crm_custom_fields` | 3 | View or update the custom contact fields configured in the CRM. |
| `crm_labels` | 4 | View, create, update, or delete the labels used to organize items in the CRM. |
| `crm_companies` | 19 | Look up, create, update, delete, and manage CRM companies, their notes, and their associated contacts. |
| `crm_campaigns` | 39 | Create, schedule, send, pause, duplicate, delete, and analyze one-off email campaigns, including resending failed or unopened emails. |
| `crm_recurring_campaigns` | 14 | Manage recurring (automatically repeating) email campaigns from creation through scheduling and deletion (FluentCRM Pro). |
| `crm_sequences` | 21 | Manage email sequence (drip) automations, their emails, and their subscribers (FluentCRM Pro). |
| `crm_automations` | 31 | Manage marketing automation funnels and their subscribers, from creation and editing to import, export, and deletion. |
| `crm_templates` | 11 | Manage reusable email templates, including creating, duplicating, updating, and deleting them. |
| `crm_forms` | 5 | View and manage the opt-in forms connected to the CRM. |
| `crm_webhooks` | 5 | Manage incoming webhooks that create or update CRM contacts from external services. |
| `crm_smart_links` | 5 | Manage Smart Links that tag and redirect contacts when clicked (FluentCRM Pro). |
| `crm_sms` | 24 | Manage SMS campaigns, templates, contacts' phone data, and SMS settings (FluentCRM Pro). |
| `crm_reports` | 16 | Read-only CRM analytics: dashboard stats, subscriber growth, email and revenue reports, commerce reports, and global search. |
| `crm_abandoned_carts` | 3 | View abandoned-cart records and their report summary, and delete records in bulk (FluentCRM Pro commerce feature). |
| `crm_settings` | 39 | Read or update FluentCRM settings such as double opt-in, business info, email preferences, compliance, and experimental features. |
| `crm_settings_pro` | 11 | Read or update FluentCRM Pro settings such as the plugin license and Pro-only features. |
| `crm_utilities` | 18 | Administrative utilities: import contacts from CSV or WordPress users, migrate from other tools, list WordPress users and roles, browse in-app docs, and receive bounce webhooks. |
| `cart_orders` | 22 | Look up, create, update, refund, and manage store orders, including their statuses, transactions, addresses, and disputes. |
| `cart_products` | 28 | Look up, create, update, delete, and bulk-edit store products, including search, duplication, taxonomy terms, and shipping/tax classes. |
| `cart_product_variants` | 22 | Manage product variations: pricing, inventory and stock, bundles, upgrade paths, media, and variant search. |
| `cart_product_assets` | 9 | Manage products' downloadable files and per-product integration feeds. |
| `cart_customers` | 18 | Look up, create, update, and manage store customers, their addresses, purchase stats, and linked WordPress users. |
| `cart_coupons` | 12 | Manage discount coupons: create, update, delete, apply to or remove from orders, and check product eligibility. |
| `cart_subscriptions` | 17 | View and manage recurring subscriptions: cancel, re-sync from the payment gateway, switch payment methods, and handle early payments. |
| `cart_tax` | 27 | Manage tax classes, tax rates, per-country configuration, EU VAT/OSS overrides, and order tax records. |
| `cart_shipping` | 15 | Manage shipping zones, shipping methods, and shipping classes. |
| `cart_settings` | 30 | Read or update store settings: general store options, modules and addons, permissions, payment methods, storage drivers, and checkout fields. |
| `cart_email_notifications` | 11 | Manage the store's transactional email templates, global email settings, reminders, and previews. |
| `cart_reports` | 41 | Read-only store analytics: revenue, orders, products, customers, subscriptions, refunds, licenses, and dashboard summaries. |
| `cart_integrations` | 17 | Manage global integration feeds and provider settings, and install or activate integration addons. |
| `cart_files` | 5 | List, upload, and delete files in the store's configured storage drivers. |
| `cart_labels_attributes` | 13 | Manage store labels and product attribute groups and their terms. |
| `cart_utilities` | 22 | Store utilities: dashboard stats and onboarding, activity log, order notes, print templates, country data, filter options, and retention snapshots. |
| `cart_storefront` | 3 | Read-only public storefront data: published products, rendered product listings, and product search — no authentication required. |
| `cart_checkout` | 7 | Checkout-session operations: place an order, fetch payment and shipping info for the cart, and log a customer in. |
| `cart_customer_portal` | 21 | Customer-portal operations on the logged-in customer's own profile, orders, addresses, subscriptions, and downloads. |
| `cart_licensing` | 27 | Manage software licenses: view, extend, regenerate keys, change limits, activate or deactivate sites, plus the public license verification endpoints (FluentCart Pro). |
| `cart_roles` | 9 | Manage FluentCart shop roles, permissions, and user assignments (FluentCart Pro). |
| `cart_order_bumps` | 5 | Manage checkout order bumps: list, create, update, and delete (FluentCart Pro). |
| `social_reviews` | 11 | Manage the reviews collected from connected platforms: list, edit, duplicate, categorize, change status, or mark as spam. |
| `social_testimonials` | 11 | Manage hand-written testimonials, their statuses, spam flags, and categories. |
| `social_templates` | 14 | Manage the review and social-feed widget templates rendered on the site via shortcodes and blocks. |
| `social_platforms` | 20 | Connect review and feed platforms (Google, Facebook, Instagram, …), manage their configs, and sync their content. |
| `social_chat_widgets` | 8 | Manage floating chat widgets (WhatsApp, Messenger, Telegram, …) shown on the site. |
| `social_notifications` | 5 | Manage sales/social-proof notification popups. |
| `social_shoppable` | 5 | Manage the shoppable Instagram feed and its product-tagged posts. |
| `social_settings` | 23 | Global WP Social Ninja settings: general and advanced options, translations, licensing, managers, resets, and the onboarding wizard. |
| `social_collection` | 29 | Collect new reviews: review forms, custom sources, get-reviews QR codes, form captcha, FluentCRM tagging, and WooCommerce/FluentCart review imports. |
| `server` | 5 | Built-in tools: this map, setup verification, and the WordPress media library. |

## FluentCRM (`crm_*`)

### crm_contacts — Look up, create, update, delete, and manage CRM contacts (subscribers), including their notes, tags, lists, and email history.

- `crm_contacts_bulk_action` ⚠ — Bulk Action Contacts
- `crm_contacts_bulk_add_update` — Bulk Add/Update Contacts
- `crm_contacts_create` — Create Contact
- `crm_contacts_create_note(id)` — Create Contact Note
- `crm_contacts_delete_contact(id)` ⚠ — Delete Contact
- `crm_contacts_delete_emails(id)` ⚠ — Delete Contact Emails
- `crm_contacts_delete_note(id, note_id)` ⚠ — Delete Contact Note
- `crm_contacts_delete_contacts` ⚠ 🔒 — Delete Contacts
- `crm_contacts_get(id)` — Get Contact
- `crm_contacts_get_dynamic_item_view(id)` — Get Contact Dynamic Item View
- `crm_contacts_get_emails(id)` — Get Contact Emails
- `crm_contacts_get_external_view(id)` — Get Contact External View
- `crm_contacts_get_form_submissions(id)` — Get Contact Form Submissions
- `crm_contacts_get_info_widgets(id)` — Get Contact Info Widgets
- `crm_contacts_get_notes(id)` — Get Contact Notes
- `crm_contacts_get_prev_next_ids` — Get Contact Prev/Next IDs
- `crm_contacts_get_purchase_history(id)` — Get Contact Purchase History
- `crm_contacts_get_support_tickets(id)` — Get Contact Support Tickets
- `crm_contacts_get_template_mock(id)` — Get Contact Template Mock
- `crm_contacts_get_tracking_events(id)` — Get Contact Tracking Events
- `crm_contacts_get_url_metrics(id)` — Get Contact URL Metrics
- `crm_contacts_list` — List Contacts (paginated)
- `crm_contacts_save_external_view(id)` — Save Contact External View
- `crm_contacts_search` — Search Contacts (paginated)
- `crm_contacts_send_custom_email(id)` — Send Contact Custom Email
- `crm_contacts_send_double_optin(id)` — Send Contact Double Opt-in
- `crm_contacts_sync_segments` — Sync Contact Segments
- `crm_contacts_track_event` — Track Contact Event
- `crm_contacts_update(id)` — Update Contact
- `crm_contacts_update_note(id, note_id)` — Update Contact Note
- `crm_contacts_update_property` — Update Contacts Property

### crm_lists — View, create, update, or delete the contact lists used to organize CRM subscribers.

- `crm_lists_bulk_action` ⚠ — Bulk Action Lists
- `crm_lists_bulk_create` — Bulk Create Lists
- `crm_lists_create` — Create List
- `crm_lists_delete(id)` ⚠ — Delete List
- `crm_lists_get(id)` — Get List
- `crm_lists_list` — List Lists (paginated)
- `crm_lists_update(id)` — Update List

### crm_tags — View, create, update, or delete the tags used to label CRM contacts.

- `crm_tags_bulk_action` ⚠ — Bulk Action Tags
- `crm_tags_bulk_create` — Bulk Create Tags
- `crm_tags_create` — Create Tag
- `crm_tags_delete(id)` ⚠ — Delete Tag
- `crm_tags_get(id)` — Get Tag
- `crm_tags_list` — List Tags (paginated)
- `crm_tags_update(id)` — Update Tag

### crm_segments — View, create, update, or delete dynamic contact segments and see which contacts match them.

- `crm_segments_create_dynamic` — Create Dynamic Segment
- `crm_segments_delete_dynamic(id)` ⚠ — Delete Dynamic Segment
- `crm_segments_duplicate_dynamic(id)` — Duplicate Dynamic Segment
- `crm_segments_estimate_dynamic_contacts` — Estimate Dynamic Segment Contacts
- `crm_segments_get_dynamic_custom_fields` — Get Dynamic Segment Custom Fields
- `crm_segments_get_dynamic_stats` — Get Dynamic Segment Stats
- `crm_segments_get_dynamic_subscribers(slug, id)` — Get Dynamic Segment Subscribers
- `crm_segments_list_dynamic` — List Dynamic Segments (paginated)
- `crm_segments_update_dynamic(id)` — Update Dynamic Segment

### crm_custom_fields — View or update the custom contact fields configured in the CRM.

- `crm_custom_fields_get_contact` — Get Contact Custom Fields
- `crm_custom_fields_save_contact` — Save Contact Custom Fields
- `crm_custom_fields_update_group_name` — Update Custom Field Group Name

### crm_labels — View, create, update, or delete the labels used to organize items in the CRM.

- `crm_labels_create` — Create Label
- `crm_labels_delete(id)` ⚠ — Delete Label
- `crm_labels_list` — List Labels (paginated)
- `crm_labels_update(id)` — Update Label

### crm_companies — Look up, create, update, delete, and manage CRM companies, their notes, and their associated contacts.

- `crm_companies_attach_subscribers` — Attach Subscribers to Companies
- `crm_companies_bulk_action` ⚠ — Bulk Action on Companies
- `crm_companies_create` — Create Company
- `crm_companies_create_note(id)` — Create Company Note
- `crm_companies_delete(id)` ⚠ — Delete Company
- `crm_companies_delete_note(id, note_id)` ⚠ — Delete Company Note
- `crm_companies_detach_subscribers` ⚠ — Detach Subscribers from Companies
- `crm_companies_get(id)` — Get Company
- `crm_companies_get_custom_fields` — Get Company Custom Fields
- `crm_companies_get_external_view(id)` — Get Company External View
- `crm_companies_get_notes(id)` — Get Company Notes
- `crm_companies_import_csv` — Import Companies from CSV
- `crm_companies_list` — List Companies (paginated)
- `crm_companies_save_custom_fields` — Save Company Custom Fields
- `crm_companies_search` — Search Companies (paginated)
- `crm_companies_search_unattached_contacts` — Search Unattached Contacts (paginated)
- `crm_companies_update_property` — Update Companies Property
- `crm_companies_update(id)` — Update Company
- `crm_companies_update_note(id, note_id)` — Update Company Note

### crm_campaigns — Create, schedule, send, pause, duplicate, delete, and analyze one-off email campaigns, including resending failed or unopened emails.

- `crm_campaigns_bulk_action` ⚠ — Bulk Action Campaigns
- `crm_campaigns_create` — Create Campaign
- `crm_campaigns_delete(id)` ⚠ — Delete Campaign
- `crm_campaigns_delete_emails(id)` ⚠ — Delete Campaign Emails
- `crm_campaigns_draft_recipients(id)` — Draft Campaign Recipients
- `crm_campaigns_duplicate(id)` — Duplicate Campaign
- `crm_campaigns_estimate_contacts` — Estimate Campaign Contacts
- `crm_campaigns_get(id)` — Get Campaign
- `crm_campaigns_get_contacts_by_segment(id)` — Get Campaign Contacts by Segment
- `crm_campaigns_get_emails(id)` — Get Campaign Emails
- `crm_campaigns_get_link_report(id)` — Get Campaign Link Report
- `crm_campaigns_get_overview_stats(id)` — Get Campaign Overview Stats
- `crm_campaigns_get_processing_stat(id)` — Get Campaign Processing Stat
- `crm_campaigns_get_recipients_count(id)` — Get Campaign Recipients Count
- `crm_campaigns_get_revenues(id)` — Get Campaign Revenues
- `crm_campaigns_get_share_url(id)` — Get Campaign Share URL
- `crm_campaigns_get_status(id)` — Get Campaign Status
- `crm_campaigns_get_unsubscribers(id)` — Get Campaign Unsubscribers
- `crm_campaigns_list` — List Campaigns (paginated)
- `crm_campaigns_pause(id)` — Pause Campaign
- `crm_campaigns_preview_email(email_id)` — Preview Campaign Email
- `crm_campaigns_preview_email_html` — Preview Campaign Email HTML
- `crm_campaigns_resume(id)` ⚠ — Resume Campaign
- `crm_campaigns_resync_revenues(id)` — Resync Campaign Revenues
- `crm_campaigns_schedule(id)` ⚠ — Schedule Campaign
- `crm_campaigns_send_test_email` — Send Campaign Test Email
- `crm_campaigns_un_schedule(id)` ⚠ — Un-Schedule Campaign
- `crm_campaigns_update(id)` — Update Campaign
- `crm_campaigns_update_labels(id)` — Update Campaign Labels
- `crm_campaigns_update_step(id)` — Update Campaign Step
- `crm_campaigns_update_title(id)` — Update Campaign Title
- `crm_campaigns_update_single_simulate` — Update Single Campaign (Simulate)
- `crm_campaigns_do_tag_actions(id)` — Campaign Tag Actions
- `crm_campaigns_get_dynamic_post_taxonomies` — Dynamic Post Taxonomies
- `crm_campaigns_get_dynamic_posts` — Dynamic Posts
- `crm_campaigns_get_dynamic_products` — Dynamic Products
- `crm_campaigns_resend_emails(id)` ⚠ — Resend Campaign Emails
- `crm_campaigns_resend_failed_emails(id)` ⚠ — Resend Failed Emails
- `crm_campaigns_resend_unopened_emails(id)` ⚠ — Resend Unopened Emails

### crm_recurring_campaigns — Manage recurring (automatically repeating) email campaigns from creation through scheduling and deletion (FluentCRM Pro).

- `crm_recurring_campaigns_bulk_action` ⚠ — Bulk Action Recurring Campaigns
- `crm_recurring_campaigns_change_status(campaign_id)` — Change Recurring Campaign Status
- `crm_recurring_campaigns_create` — Create Recurring Campaign
- `crm_recurring_campaigns_delete_bulk` ⚠ — Delete Bulk Recurring Campaigns
- `crm_recurring_campaigns_duplicate(campaign_id)` — Duplicate Recurring Campaign
- `crm_recurring_campaigns_get(campaign_id)` — Get Recurring Campaign
- `crm_recurring_campaigns_get_email(campaign_id, email_id)` — Get Recurring Campaign Email
- `crm_recurring_campaigns_get_emails(campaign_id)` — Get Recurring Campaign Emails
- `crm_recurring_campaigns_list` — List Recurring Campaigns (paginated)
- `crm_recurring_campaigns_patch_email(campaign_id, email_id)` — Patch Recurring Campaign Email Status
- `crm_recurring_campaigns_update_data` — Update Recurring Campaign Email Data
- `crm_recurring_campaigns_update_email(campaign_id)` — Update Recurring Campaign Email
- `crm_recurring_campaigns_update_labels(campaign_id)` — Update Recurring Campaign Labels
- `crm_recurring_campaigns_update_settings(campaign_id)` — Update Recurring Campaign Settings

### crm_sequences — Manage email sequence (drip) automations, their emails, and their subscribers (FluentCRM Pro).

- `crm_sequences_add_subscribers(id)` — Add Sequence Subscribers
- `crm_sequences_bulk_action` ⚠ — Bulk Action Sequences
- `crm_sequences_create_or_update_email` — Create or Update Sequence Email
- `crm_sequences_create` — Create Sequence
- `crm_sequences_create_email(id)` — Create Sequence Email
- `crm_sequences_delete(id)` ⚠ — Delete Sequence
- `crm_sequences_delete_email(id, email_id)` ⚠ — Delete Sequence Email
- `crm_sequences_duplicate(id)` — Duplicate Sequence
- `crm_sequences_duplicate_email(id)` — Duplicate Sequence Email
- `crm_sequences_get(id)` — Get Sequence
- `crm_sequences_get_email(id, email_id)` — Get Sequence Email
- `crm_sequences_get_subscribers(id)` — Get Sequence Subscribers
- `crm_sequences_get_subscriber(subscriber_id)` — Get Subscriber Sequences
- `crm_sequences_list` — List Sequences (paginated)
- `crm_sequences_reapply(id)` — Reapply Sequence
- `crm_sequences_remove_subscribers(id)` ⚠ — Remove Sequence Subscribers
- `crm_sequences_update(id)` — Update Sequence
- `crm_sequences_update_email(id, email_id)` — Update Sequence Email
- `crm_sequences_preview_schedule(id)` — Computed send timetable for a hypothetical enrollment (connector-side)
- `crm_sequences_validate(id)` — Timing sanity checks: duplicate delays, broken sending_time, timings drift
- `crm_sequences_bulk_update_emails(id)` — Merge-mode updates for many sequence emails in one call, with per-row verification

### crm_automations — Manage marketing automation funnels and their subscribers, from creation and editing to import, export, and deletion.

- `crm_automations_bulk_action_funnels` ⚠ — Bulk Action Funnels
- `crm_automations_change_funnel_trigger(id)` — Change Funnel Trigger
- `crm_automations_clone_funnel(id)` — Clone Funnel
- `crm_automations_create_funnel` — Create Funnel
- `crm_automations_create_funnel_from_template` — Create Funnel from Template
- `crm_automations_delete_funnel(id)` ⚠ — Delete Funnel
- `crm_automations_delete_funnel_subscribers(id)` ⚠ — Delete Funnel Subscribers
- `crm_automations_force_advance_funnel_subscriber(id, subscriber_id)` — Force Advance Funnel Subscriber
- `crm_automations_get_funnel(id)` — Get Funnel
- `crm_automations_get_funnel_all_activities` — Get All Funnel Activities
- `crm_automations_get_funnel_email_reports(id)` — Get Funnel Email Reports
- `crm_automations_get_funnel_report(id)` — Get Funnel Report
- `crm_automations_get_funnel_subscriber_reporting(id, contact_id)` — Get Funnel Subscriber Reporting
- `crm_automations_get_funnel_subscribers(id)` — Get Funnel Subscribers
- `crm_automations_get_funnel_syncable_counts(id)` — Get Funnel Syncable Counts
- `crm_automations_get_funnel_templates` — Get Funnel Templates
- `crm_automations_get_funnel_triggers` — Get Funnel Triggers
- `crm_automations_get_subscriber(subscriber_id)` — Get Subscriber Automations
- `crm_automations_import_funnel` — Import Funnel
- `crm_automations_list_funnels` — List Funnels (paginated)
- `crm_automations_remove_funnel_bulk_subscribers` ⚠ — Remove Bulk Subscribers from Funnels
- `crm_automations_save_email_action_fallback` — Save Email Action (Fallback)
- `crm_automations_save_funnel_email_action(id)` — Save Funnel Email Action
- `crm_automations_save_funnel_sequences(id)` — Save Funnel Sequences
- `crm_automations_save_funnel_sequences_fallback` — Save Funnel Sequences (Fallback)
- `crm_automations_send_test_webhook` — Send Test Webhook
- `crm_automations_sync_funnel_new_steps(id)` — Sync Funnel New Steps
- `crm_automations_update_funnel_labels(id)` — Update Funnel Labels
- `crm_automations_update_funnel_property(id)` — Update Funnel Property
- `crm_automations_update_funnel_subscription_status(id, subscriber_id)` — Update Funnel Subscription Status
- `crm_automations_update_funnel_title(id)` — Update Funnel Title

### crm_templates — Manage reusable email templates, including creating, duplicating, updating, and deleting them.

- `crm_templates_bulk_action` ⚠ — Bulk Action Templates
- `crm_templates_create` — Create Template
- `crm_templates_delete(id)` ⚠ — Delete Template
- `crm_templates_duplicate(id)` — Duplicate Template
- `crm_templates_get_built_in` — Get Built-In Templates
- `crm_templates_get_smart_codes` — Get Smart Codes
- `crm_templates_get(id)` — Get Template
- `crm_templates_list_all` — List All Templates (paginated)
- `crm_templates_list` — List Templates (paginated)
- `crm_templates_set_global_style` — Set Global Style
- `crm_templates_update(id)` — Update Template

### crm_forms — View and manage the opt-in forms connected to the CRM.

- `crm_forms_create` — Create Form
- `crm_forms_get_entries(id)` — Form Entries
- `crm_forms_get_entry(form_id, id)` — Form Entry
- `crm_forms_get_templates` — Form Templates
- `crm_forms_list` — List Forms (paginated)

### crm_webhooks — Manage incoming webhooks that create or update CRM contacts from external services.

- `crm_webhooks_create` — Create Webhook
- `crm_webhooks_delete(id)` ⚠ — Delete Webhook
- `crm_webhooks_list_sms` — List SMS Webhooks (paginated)
- `crm_webhooks_list` — List Webhooks (paginated)
- `crm_webhooks_update(id)` — Update Webhook

### crm_smart_links — Manage Smart Links that tag and redirect contacts when clicked (FluentCRM Pro).

- `crm_smart_links_activate` — Activate Smart Links Module
- `crm_smart_links_create` — Create Smart Link
- `crm_smart_links_delete(id)` ⚠ — Delete Smart Link
- `crm_smart_links_list` — List Smart Links (paginated)
- `crm_smart_links_update(id)` — Update Smart Link

### crm_sms — Manage SMS campaigns, templates, contacts' phone data, and SMS settings (FluentCRM Pro).

- `crm_sms_bulk_action_campaigns` ⚠ — Bulk Action on SMS Campaigns
- `crm_sms_create_campaign` — Create SMS Campaign
- `crm_sms_delete_campaign(id)` ⚠ — Delete SMS Campaign
- `crm_sms_delete_messages` ⚠ — Delete SMS Messages
- `crm_sms_do_campaign_tag_actions(id)` — Apply Tag Actions to SMS Campaign Recipients
- `crm_sms_duplicate_campaign(id)` — Duplicate SMS Campaign
- `crm_sms_estimate_campaign_contacts` — Estimate SMS Campaign Contacts
- `crm_sms_get_campaign(id)` — Get SMS Campaign
- `crm_sms_get_campaign_processing_stat(id)` — Get SMS Campaign Processing Status
- `crm_sms_get_campaign_recipients(id)` — Get SMS Campaign Recipients
- `crm_sms_get_campaign_recipients_count(id)` — Get SMS Campaign Recipients Count
- `crm_sms_get_campaign_status(id)` — Get SMS Campaign Status
- `crm_sms_get_subscriber_logs(id)` — Get Subscriber SMS Logs
- `crm_sms_get_subscriber_stats(id)` — Get Subscriber SMS Statistics
- `crm_sms_list_campaigns` — List SMS Campaigns (paginated)
- `crm_sms_list_messages` — List All SMS Messages (paginated)
- `crm_sms_pause_campaign(id)` — Pause SMS Campaign
- `crm_sms_resend_message(id)` — Resend SMS Message
- `crm_sms_resume_campaign(id)` ⚠ — Resume SMS Campaign
- `crm_sms_schedule_campaign(id)` ⚠ — Schedule SMS Campaign
- `crm_sms_send_subscriber_custom(id)` — Send Custom SMS to Subscriber
- `crm_sms_unschedule_campaign(id)` — Unschedule SMS Campaign
- `crm_sms_update_campaign(id)` — Update SMS Campaign
- `crm_sms_update_campaign_labels(id)` — Update SMS Campaign Labels

### crm_reports — Read-only CRM analytics: dashboard stats, subscriber growth, email and revenue reports, commerce reports, and global search.

- `crm_reports_get_commerce_report(provider)` — Commerce Report
- `crm_reports_get_commerce_reports(provider)` — Commerce Reports
- `crm_reports_get_advanced_providers` — Advanced Report Providers
- `crm_reports_get_ajax_options` — Ajax Options
- `crm_reports_get_cascade_selections` — Cascade Selections
- `crm_reports_get_contact_growth` — Contact Growth
- `crm_reports_get_dashboard_stats` — Dashboard Stats
- `crm_reports_get_email_click_stats` — Email Click Stats
- `crm_reports_get_email_open_stats` — Email Open Stats
- `crm_reports_get_email_performance` — Email Performance
- `crm_reports_get_email_sent_stats` — Email Sent Stats
- `crm_reports_get_emails` — Report Emails
- `crm_reports_get_options` — Report Options
- `crm_reports_get_taxonomy_terms` — Taxonomy Terms
- `crm_reports_ping` — Ping Report
- `crm_reports_global_search` — Global Search

### crm_abandoned_carts — View abandoned-cart records and their report summary, and delete records in bulk (FluentCRM Pro commerce feature).

- `crm_abandoned_carts_bulk_delete` ⚠ — Bulk Delete Abandoned Carts
- `crm_abandoned_carts_get_abandon_report_summary` — Get Abandon Cart Report Summary
- `crm_abandoned_carts_list` — List Abandoned Carts (paginated)

### crm_settings — Read or update FluentCRM settings such as double opt-in, business info, email preferences, compliance, and experimental features.

- `crm_settings_delete_report_emails` ⚠ — Report Emails
- `crm_settings_complete_installation` — Complete Installation Wizard
- `crm_settings_create_rest_key` — Create REST API Key
- `crm_settings_delete_rest_key` ⚠ 🔒 — REST API Key
- `crm_settings_get_abandon_cart` — Abandon Cart Settings
- `crm_settings_get_auto_subscribe` — Auto Subscribe Settings
- `crm_settings_get_bounce_configs` — Bounce Handler Configurations
- `crm_settings_get_compliance` — Compliance Settings
- `crm_settings_get_cron_status` — Cron Status
- `crm_settings_get_double_optin` — Double Opt-in Settings
- `crm_settings_get_experiment_campaigns` — Experiment Campaigns
- `crm_settings_get_experimental` — Experimental Settings
- `crm_settings_get_integrations` — Deep Integration Providers
- `crm_settings_get_old_logs` — Old Log Details
- `crm_settings_get_rest_keys` — REST API Keys
- `crm_settings_get` — Global Settings
- `crm_settings_get_system_logs` — System Logs
- `crm_settings_install_fluent_boards` — Install Fluent Boards Plugin
- `crm_settings_install_fluent_booking` — Install Fluent Booking Plugin
- `crm_settings_install_fluent_cart` — Install FluentCart Plugin
- `crm_settings_install_fluent_community` — Install Fluent Community Plugin
- `crm_settings_install_fluent_form` — Install Fluent Forms Plugin
- `crm_settings_install_fluent_smtp` — Install FluentSMTP Plugin
- `crm_settings_install_fluent_support` — Install Fluent Support Plugin
- `crm_settings_remove_old_logs` ⚠ — Remove Old Logs
- `crm_settings_reset_database` ⚠ 🔒 — Reset Database
- `crm_settings_reset_system_logs` ⚠ — Reset System Logs
- `crm_settings_run_cron` — Run Cron Event
- `crm_settings_save_abandon_cart` — Save Abandon Cart Settings
- `crm_settings_save_auto_subscribe` — Save Auto Subscribe Settings
- `crm_settings_save_double_optin` — Save Double Opt-in Settings
- `crm_settings_save_integration` — Save Integration Settings
- `crm_settings_save` — Save Global Settings
- `crm_settings_test_delete_request` ⚠ 🔒 — Test Request Resolver
- `crm_settings_test_get_request` — Test Request Resolver
- `crm_settings_test_post_request` — Test Request Resolver
- `crm_settings_test_put_request` — Test Request Resolver
- `crm_settings_update_compliance` — Update Compliance Settings
- `crm_settings_update_experimental` — Update Experimental Settings

### crm_settings_pro — Read or update FluentCRM Pro settings such as the plugin license and Pro-only features.

- `crm_settings_pro_add_manager` — Add Manager
- `crm_settings_pro_deactivate_license` ⚠ — Deactivate License
- `crm_settings_pro_delete_manager(id)` ⚠ — Remove Manager
- `crm_settings_pro_disable_sms` — Disable SMS
- `crm_settings_pro_get_license_status` — License Status
- `crm_settings_pro_get_managers` — List Managers
- `crm_settings_pro_get_sms` — SMS Settings
- `crm_settings_pro_import_funnel` — Import Funnel
- `crm_settings_pro_save_license` — Save License
- `crm_settings_pro_save_sms` — Save SMS Settings
- `crm_settings_pro_update_manager(id)` — Update Manager

### crm_utilities — Administrative utilities: import contacts from CSV or WordPress users, migrate from other tools, list WordPress users and roles, browse in-app docs, and receive bounce webhooks. The two handle_bounce actions are webhook receivers meant to be called by email services, not by API clients.

- `crm_utilities_get_import_driver(driver)` — Import Driver Details
- `crm_utilities_get_import_drivers` — Import Drivers
- `crm_utilities_import_csv_contacts` — Import Contacts from CSV
- `crm_utilities_import_driver_data(driver)` — Import Data via Driver
- `crm_utilities_import_wp_users` — Import WordPress Users
- `crm_utilities_upload_csv_import` — Upload CSV for Import
- `crm_utilities_get_migrator_drivers` — Migrator Drivers
- `crm_utilities_get_migrator_import_summary` — Get Migrator Import Summary
- `crm_utilities_get_migrator_list_tag_mappings` — Migrator List/Tag Mappings
- `crm_utilities_handle_migrator_import` — Execute Migrator Import
- `crm_utilities_verify_migrator_credential` — Verify Migrator Credential
- `crm_utilities_get_user_roles` — WordPress User Roles
- `crm_utilities_list_users` — List WordPress Users (paginated)
- `crm_utilities_get_doc(doc_id)` — Get Doc
- `crm_utilities_get_doc_addons` — Get Addons
- `crm_utilities_list_docs` — List Docs (paginated)
- `crm_utilities_handle_bounce(service_name, security_code)` — Handle Bounce
- `crm_utilities_handle_bounce_with_handle(service_name, security_code)` — Handle Bounce (with /handle/ path)

## FluentCart (`cart_*`)

### cart_orders — Look up, create, update, refund, and manage store orders, including their statuses, transactions, addresses, and disputes. Order totals and amounts are integers in CENTS (e.g. 1200 = $12.00).

- `cart_orders_accept_dispute(order, transaction_id)` ⚠ — Accept Dispute
- `cart_orders_bulk_actions` ⚠ — Bulk Actions
- `cart_orders_calculate_shipping` — Calculate Shipping
- `cart_orders_change_customer(order_id)` — Change Customer
- `cart_orders_create_and_change_customer(order_id)` — Create and Change Customer
- `cart_orders_create_custom_item(order)` — Create Custom Order Item
- `cart_orders_create` — Create Order
- `cart_orders_delete(order_id)` ⚠ — Delete Order
- `cart_orders_generate_missing_licenses(order)` — Generate Missing Licenses
- `cart_orders_get(order_id)` — Get Order Details
- `cart_orders_get_transactions(order)` — Get Order Transactions
- `cart_orders_get_shipping_methods` — Get Shipping Methods
- `cart_orders_get_single_transaction(id, transaction_id)` — Get Single Transaction
- `cart_orders_list` — List Orders (paginated)
- `cart_orders_mark_as_paid(order)` — Mark Order as Paid
- `cart_orders_refund(order_id)` ⚠ — Refund Order
- `cart_orders_sync_statuses(order)` — Sync Order Statuses
- `cart_orders_update(order_id)` — Update Order
- `cart_orders_update_address(order, id)` — Update Order Address
- `cart_orders_update_address_id(order_id)` — Update Order Address ID
- `cart_orders_update_statuses(order)` — Update Statuses
- `cart_orders_update_transaction_status(order, transaction)` — Update Transaction Status

### cart_products — Look up, create, update, delete, and bulk-edit store products, including search, duplication, taxonomy terms, and shipping/tax classes. cart_products_update: despite its /pricing API path this is the FULL product update and the only action that writes the product gallery/featured image — gallery is [{id, url, title}] where id is a WP media attachment ID, gallery[0] becomes the featured image, and an empty gallery [] deletes the thumbnail. post_title and post_status are set unconditionally, so always send them (omitting them blanks the stored values). Omit variants entirely unless you mean to rewrite them: item_price there is multiplied by 100 on write, so round-tripping read values inflates every price 100×.

- `cart_products_add_terms` — Add Product Terms
- `cart_products_bulk_edit_fetch` — Bulk Edit Fetch
- `cart_products_bulk_insert` — Bulk Insert Products
- `cart_products_bulk_update` — Bulk Update Products
- `cart_products_create_dummy` — Create Dummy Products
- `cart_products_create` — Create Product
- `cart_products_delete(product)` ⚠ — Delete Product
- `cart_products_delete_taxonomy_term(postId)` ⚠ — Delete Taxonomy Term
- `cart_products_do_bulk_action` ⚠ — Do Bulk Action
- `cart_products_duplicate(productId)` — Duplicate Product
- `cart_products_fetch_by_ids` — Fetch Products by IDs
- `cart_products_fetch_taxonomy_terms` — Fetch Taxonomy Terms
- `cart_products_fetch_terms_by_parent` — Fetch Terms by Parent
- `cart_products_get_max_excerpt_word_count` — Get Max Excerpt Word Count
- `cart_products_get_pricing_widgets(productId)` — Get Pricing Widgets
- `cart_products_get(product)` — Get Product
- `cart_products_get_related(productId)` — Get Related Products
- `cart_products_list` — List Products (paginated)
- `cart_products_remove_shipping_class(postId)` ⚠ — Remove Shipping Class
- `cart_products_remove_tax_class(postId)` ⚠ — Remove Tax Class
- `cart_products_search_by_name` — Search Products by Name (paginated)
- `cart_products_suggest_sku` — Suggest SKU
- `cart_products_sync_taxonomy_terms(postId)` — Sync Taxonomy Terms
- `cart_products_update_long_desc_editor_mode(postId)` — Update Long Description Editor Mode
- `cart_products_update_detail(detailId)` — Update Product Detail
- `cart_products_update(postId)` — Update Product (post fields, detail, variants, gallery/featured image)
- `cart_products_update_shipping_class(postId)` — Update Shipping Class
- `cart_products_update_tax_class(postId)` — Update Tax Class

### cart_product_variants — Manage product variations: pricing, inventory and stock, bundles, upgrade paths, media, and variant search. PRICE UNITS: despite the API docs' blanket 'cents' claim, variation create/update prices (item_price, compare_price) are plain DOLLARS — sending cents stores a 100× price; read back after writing to confirm. Stock updates expect a variants wrapper with total_stock/available (422 errors name the missing fields).

- `cart_product_variants_create_variation` — Create Variation
- `cart_product_variants_delete_upgrade_path(id)` ⚠ — Delete Upgrade Path
- `cart_product_variants_delete_variation(variantId)` ⚠ — Delete Variation
- `cart_product_variants_fetch_variations_by_ids` — Fetch Variations by IDs
- `cart_product_variants_find_subscription` — Find Subscription Variants
- `cart_product_variants_get_bundle_info(productId)` — Get Bundle Info
- `cart_product_variants_get_pricing(productId)` — Get Product Pricing
- `cart_product_variants_get_upgrade_settings(id)` — Get Upgrade Settings
- `cart_product_variants_get_variation_upgrade_paths(variantId)` — Get Variation Upgrade Paths
- `cart_product_variants_list_all` — List All Variants (paginated)
- `cart_product_variants_list_variations` — List Product Variations (paginated)
- `cart_product_variants_save_bundle_info(variationId)` — Save Bundle Info
- `cart_product_variants_save_upgrade_path(id)` — Save Upgrade Path
- `cart_product_variants_search_options` — Search Product Variant Options (paginated)
- `cart_product_variants_search_by_name` — Search Variants by Name (paginated)
- `cart_product_variants_set_variation_media(variantId)` — Set Variation Media
- `cart_product_variants_update_inventory(postId, variantId)` — Update Inventory
- `cart_product_variants_update_manage_stock(postId)` — Update Manage Stock Setting
- `cart_product_variants_update_upgrade_path(id)` — Update Upgrade Path
- `cart_product_variants_update_option(postId)` — Update Variant Option
- `cart_product_variants_update_variation(variantId)` — Update Variation
- `cart_product_variants_update_variation_pricing_table(variantId)` — Update Variation Pricing Table

### cart_product_assets — Manage products' downloadable files and per-product integration feeds.

- `cart_product_assets_change_integration_status(product_id)` — Change Integration Status
- `cart_product_assets_delete_downloadable_file(downloadableId)` ⚠ — Delete Downloadable File
- `cart_product_assets_delete_integration(product_id, integration_id)` ⚠ — Delete Product Integration
- `cart_product_assets_get_downloadable_url(downloadableId)` — Get Downloadable URL
- `cart_product_assets_get_integration_feeds(productId)` — Get Product Integration Feeds
- `cart_product_assets_get_integration_settings(product_id, integration_name)` — Get Product Integration Settings
- `cart_product_assets_save_integration(product_id)` — Save Product Integration
- `cart_product_assets_sync_downloadable_files(postId)` — Sync Downloadable Files
- `cart_product_assets_update_downloadable_file(downloadableId)` — Update Downloadable File

### cart_customers — Look up, create, update, and manage store customers, their addresses, purchase stats, and linked WordPress users.

- `cart_customers_attach_user(customerId)` — Attach WordPress User
- `cart_customers_bulk_actions` ⚠ — Bulk Actions
- `cart_customers_create_address(customerId)` — Create Address
- `cart_customers_create` — Create Customer
- `cart_customers_delete_address(customerId)` ⚠ — Delete Address
- `cart_customers_detach_user(customerId)` ⚠ — Detach WordPress User
- `cart_customers_find_order(customerId)` — Find Customer Order
- `cart_customers_get_attachable_users` — Get Attachable Users
- `cart_customers_get(customerId)` — Get Customer
- `cart_customers_get_addresses(customerId)` — Get Customer Addresses
- `cart_customers_get_orders(customerId)` — Get Customer Orders
- `cart_customers_get_stats(customer)` — Get Customer Stats
- `cart_customers_list` — List Customers (paginated)
- `cart_customers_recalculate_ltv(customerId)` — Recalculate Lifetime Value
- `cart_customers_set_primary_address(customerId)` — Set Primary Address
- `cart_customers_update_additional_info(customerId)` — Update Additional Info (Labels)
- `cart_customers_update_address(customerId)` — Update Address
- `cart_customers_update(customerId)` — Update Customer

### cart_coupons — Manage discount coupons: create, update, delete, apply to or remove from orders, and check product eligibility.

- `cart_coupons_apply` — Apply Coupon
- `cart_coupons_cancel` ⚠ — Cancel Coupon
- `cart_coupons_check_product_eligibility` — Check Product Eligibility
- `cart_coupons_create` — Create Coupon
- `cart_coupons_delete(id)` ⚠ — Coupon
- `cart_coupons_get(id)` — Coupon Details
- `cart_coupons_get_settings` — Coupon Settings
- `cart_coupons_list_codes` — List Coupon Codes (paginated)
- `cart_coupons_list` — List Coupons (paginated)
- `cart_coupons_re_apply` — Re-apply Coupons
- `cart_coupons_store_settings` — Store Coupon Settings
- `cart_coupons_update(id)` — Update Coupon

### cart_subscriptions — View and manage recurring subscriptions: cancel, re-sync from the payment gateway, switch payment methods, and handle early payments.

- `cart_subscriptions_cancel_auto_renew(subscription_uuid)` ⚠ — Cancel Auto-Renew
- `cart_subscriptions_cancel(order, subscription)` ⚠ — Cancel Subscription
- `cart_subscriptions_confirm_switch(subscription_uuid)` — Confirm Subscription Switch
- `cart_subscriptions_fetch_remote(order, subscription)` — Fetch Subscription from Remote
- `cart_subscriptions_generate_early_payment_link(order, subscription)` — Generate Early Payment Link
- `cart_subscriptions_get_customer(subscription_uuid)` — Get Customer Subscription Details
- `cart_subscriptions_get_or_create_plan(subscription_uuid)` — Get or Create Plan
- `cart_subscriptions_get_setup_intent_attempts(subscription_uuid)` — Get Setup Intent Remaining Attempts
- `cart_subscriptions_get(subscriptionOrderId)` — Get Subscription Details
- `cart_subscriptions_initiate_early_payment(subscription_uuid)` — Initiate Early Payment
- `cart_subscriptions_list_customer` — List Customer Subscriptions (paginated)
- `cart_subscriptions_list` — List Subscriptions (paginated)
- `cart_subscriptions_pause(order, subscription)` — Pause Subscription
- `cart_subscriptions_reactivate(order, subscription)` — Reactivate Subscription
- `cart_subscriptions_resume(order, subscription)` — Resume Subscription
- `cart_subscriptions_switch_payment_method(subscription_uuid)` — Switch Payment Method
- `cart_subscriptions_update_payment_method(subscription_uuid)` — Update Payment Method

### cart_tax — Manage tax classes, tax rates, per-country configuration, EU VAT/OSS overrides, and order tax records.

- `cart_tax_create_class` — Create Tax Class
- `cart_tax_create_rate` — Create Tax Rate
- `cart_tax_delete_shipping_override(id)` ⚠ — Delete Shipping Tax Override
- `cart_tax_delete_class(id)` ⚠ — Delete Tax Class
- `cart_tax_delete_rate(id)` ⚠ — Delete Tax Rate
- `cart_tax_get_country_id(country_code)` — Get Country Tax ID
- `cart_tax_get_country_rates(country_code)` — Get Country Tax Rates
- `cart_tax_get_preconfigured_rates` — Get Preconfigured Tax Rates
- `cart_tax_get_settings` — Get Tax Settings
- `cart_tax_list_all_rates` — List All Tax Rates (paginated)
- `cart_tax_list_classes` — List Tax Classes (paginated)
- `cart_tax_list_records` — List Tax Records (paginated)
- `cart_tax_mark_as_filed` — Mark Taxes as Filed
- `cart_tax_save_configured_countries` — Save Configured Countries
- `cart_tax_save_country_id(country_code)` — Save Country Tax ID
- `cart_tax_save_eu_vat_cross_border_settings` — Save EU VAT Cross-Border Settings
- `cart_tax_save_shipping_override` — Save Shipping Tax Override
- `cart_tax_save_settings` — Save Tax Settings
- `cart_tax_update_rate(id)` — Update Tax Rate
- `cart_tax_delete_product_override(id)` ⚠ — Delete Product Category Tax Override
- `cart_tax_get_eu_vat_product_overrides` — Get EU VAT Product Overrides
- `cart_tax_get_oss_country_rates` — Get OSS Country Rates
- `cart_tax_get_product_overrides(country_code)` — Get Product Category Tax Overrides
- `cart_tax_reset_eu_vat_rates` ⚠ — Reset EU VAT Rates
- `cart_tax_save_oss_country_rates` — Save OSS Country Rates
- `cart_tax_save_product_override` — Save Product Category Tax Override
- `cart_tax_update_country_status(country_code)` — Update Country Tax Status

### cart_shipping — Manage shipping zones, shipping methods, and shipping classes.

- `cart_shipping_create_class` — Create Shipping Class
- `cart_shipping_create_method` — Create Shipping Method
- `cart_shipping_create_zone` — Create Shipping Zone
- `cart_shipping_delete_class(id)` ⚠ — Delete Shipping Class
- `cart_shipping_delete_method(method_id)` ⚠ — Delete Shipping Method
- `cart_shipping_delete_zone(id)` ⚠ — Delete Shipping Zone
- `cart_shipping_get_class(id)` — Get Shipping Class
- `cart_shipping_get_zone(id)` — Get Shipping Zone
- `cart_shipping_get_zone_states` — Get Zone States
- `cart_shipping_list_classes` — List Shipping Classes (paginated)
- `cart_shipping_list_zones` — List Shipping Zones (paginated)
- `cart_shipping_update_class(id)` — Update Shipping Class
- `cart_shipping_update_method` — Update Shipping Method
- `cart_shipping_update_zone(id)` — Update Shipping Zone
- `cart_shipping_update_zone_order` — Update Zone Order

### cart_settings — Read or update store settings: general store options, modules and addons, permissions, payment methods, storage drivers, and checkout fields.

- `cart_settings_activate_payment_addon` — Activate Payment Addon
- `cart_settings_activate_plugin_addon` — Activate Plugin Addon
- `cart_settings_check_paypal_webhook` — Check PayPal Webhook
- `cart_settings_disconnect_payment_method` ⚠ 🔒 — Disconnect Payment Method
- `cart_settings_exchange_paypal_seller_auth_token` — Exchange PayPal Seller Auth Token
- `cart_settings_get_active_storage_drivers` — Get Active Storage Drivers
- `cart_settings_get_checkout_fields` — Get Checkout Fields
- `cart_settings_get_email_shortcodes` — Get Email Shortcodes
- `cart_settings_get_module` — Get Module Settings
- `cart_settings_get_payment_method_connection_info` — Get Payment Method Connection Info
- `cart_settings_get_payment_method` — Get Payment Method Settings
- `cart_settings_get_permissions` — Get Permissions
- `cart_settings_get_plugin_addons` — Get Plugin Addons
- `cart_settings_get_storage_driver(driver)` — Get Storage Driver Settings
- `cart_settings_get_store` — Get Store Settings
- `cart_settings_install_payment_addon` — Install Payment Addon
- `cart_settings_install_plugin_addon` — Install Plugin Addon
- `cart_settings_list_all_payment_methods` — List All Payment Methods (paginated)
- `cart_settings_list_all_storage_drivers` — List All Storage Drivers (paginated)
- `cart_settings_reorder_payment_methods` — Reorder Payment Methods
- `cart_settings_save_checkout_fields` — Save Checkout Fields
- `cart_settings_save_confirmation` — Save Confirmation Settings
- `cart_settings_save_module` — Save Module Settings
- `cart_settings_save_payment_method_design` — Save Payment Method Design
- `cart_settings_save_payment_method` — Save Payment Method Settings
- `cart_settings_save_permissions` — Save Permissions
- `cart_settings_save_storage_driver` — Save Storage Driver Settings
- `cart_settings_save_store` — Save Store Settings
- `cart_settings_setup_paypal_webhook` — Setup PayPal Webhook
- `cart_settings_verify_storage_driver_connection` — Verify Storage Driver Connection

### cart_email_notifications — Manage the store's transactional email templates, global email settings, reminders, and previews.

- `cart_email_notifications_enable(name)` — Enable/Disable Notification
- `cart_email_notifications_get(notification)` — Get Single Notification
- `cart_email_notifications_get_reminders` — Get Scheduling Settings
- `cart_email_notifications_get_settings` — Get Global Email Settings
- `cart_email_notifications_get_shortcodes` — Get Shortcodes
- `cart_email_notifications_list` — List All Notifications (paginated)
- `cart_email_notifications_preview_default_template` — Preview Default Template
- `cart_email_notifications_preview` — Preview Notification
- `cart_email_notifications_save_reminders` — Save Scheduling Settings
- `cart_email_notifications_save_settings` — Save Global Email Settings
- `cart_email_notifications_update(notification)` — Update Notification

### cart_reports — Read-only store analytics: revenue, orders, products, customers, subscriptions, refunds, licenses, and dashboard summaries.

- `cart_reports_country_heat_map` — Get Country Heat Map
- `cart_reports_customer` — Get Customer Report
- `cart_reports_daily_signups` — Get Daily Signups
- `cart_reports_dashboard_stats` — Get Dashboard Stats
- `cart_reports_fetch_new_vs_returning_customer` — Get New vs Returning Customers
- `cart_reports_fetch_order_by_group` — Get Orders by Group
- `cart_reports_fetch_by_day_and_hour` — Get Report by Day and Hour
- `cart_reports_fetch_meta` — Get Report Meta
- `cart_reports_fetch_top_sold_products` — Get Top Sold Products
- `cart_reports_fetch_top_sold_variants` — Get Top Sold Variants
- `cart_reports_future_renewals` — Get Future Renewals
- `cart_reports_get_dashboard_summary` — Get Dashboard Summary
- `cart_reports_get_overview` — Get Revenue Overview
- `cart_reports_get_recent_activities` — Get Recent Activities
- `cart_reports_get_recent_orders` — Get Recent Orders
- `cart_reports_get_revenue` — Get Revenue Data
- `cart_reports_item_count_distribution` — Get Item Count Distribution
- `cart_reports_license_chart` — Get License Line Chart
- `cart_reports_license_pie_chart` — Get License Pie Chart
- `cart_reports_license_summary` — Get License Summary
- `cart_reports_order_chart` — Get Order Chart
- `cart_reports_order_completion_time` — Get Order Completion Time
- `cart_reports_order_value_distribution` — Get Order Value Distribution
- `cart_reports_product_performance` — Get Product Performance
- `cart_reports_product` — Get Product Report
- `cart_reports_quick_order_stats` — Get Quick Order Stats
- `cart_reports_refund_chart` — Get Refund Chart
- `cart_reports_refund_data_by_group` — Get Refund Data by Group
- `cart_reports_overview` — Get Report Overview
- `cart_reports_retention_chart` — Get Retention Chart
- `cart_reports_revenue_by_group` — Get Revenue by Group
- `cart_reports_sales_growth` — Get Sales Growth
- `cart_reports_sales_growth_chart` — Get Sales Growth Chart
- `cart_reports_sales` — Get Sales Report
- `cart_reports_search_repeat_customer` — Search Repeat Customers (paginated)
- `cart_reports_sources` — Get Source Report
- `cart_reports_subscription_chart` — Get Subscription Chart
- `cart_reports_subscription_cohorts` — Get Subscription Cohorts
- `cart_reports_subscription_retention` — Get Subscription Retention
- `cart_reports_top_products_sold` — Get Top Products Sold
- `cart_reports_weeks_between_refund` — Get Weeks Between Refund

### cart_integrations — Manage global integration feeds and provider settings, and install or activate integration addons.

- `cart_integrations_chained_data_request` — Chained Data Request
- `cart_integrations_change_feed_status(integration_id)` — Change Feed Status
- `cart_integrations_change_product_feed_status(product_id)` — Change Product Feed Status
- `cart_integrations_delete_feed(integration_id)` ⚠ — Feed
- `cart_integrations_delete_product(product_id, integration_id)` ⚠ — Product Integration Feed
- `cart_integrations_get_dynamic_options` — Dynamic Options
- `cart_integrations_get_feed_lists` — Feed Merge Fields (Lists)
- `cart_integrations_get_feed_settings` — Feed Settings
- `cart_integrations_get_global_feeds` — List Global Integration Feeds
- `cart_integrations_get_global_settings` — Global Integration Settings
- `cart_integrations_get_product_settings(product_id, integration_name)` — Product Integration Settings
- `cart_integrations_install_addon_plugin` — Install and Activate Add-on Plugin
- `cart_integrations_list_addons` — List Available Add-ons (paginated)
- `cart_integrations_list_product_feeds(productId)` — List Product Integration Feeds (paginated)
- `cart_integrations_save_feed_settings` — Save Feed Settings
- `cart_integrations_save_product(product_id)` — Save Product Integration Feed
- `cart_integrations_set_global_settings` — Save Global Integration Settings

### cart_files — List, upload, and delete files in the store's configured storage drivers.

- `cart_files_delete` ⚠ — Delete File
- `cart_files_get_bucket_list` — Get Bucket List
- `cart_files_list` — List Files (paginated)
- `cart_files_upload_editor` — Upload Editor File
- `cart_files_upload` — Upload File

### cart_labels_attributes — Manage store labels and product attribute groups and their terms.

- `cart_labels_attributes_change_term_sort_order(group_id, term_id)` — Change Term Sort Order
- `cart_labels_attributes_create_group` — Create Attribute Group
- `cart_labels_attributes_create_term(group_id)` — Create Attribute Term
- `cart_labels_attributes_create` — Create Label
- `cart_labels_attributes_delete_group(group_id)` ⚠ — Delete Attribute Group
- `cart_labels_attributes_delete_term(group_id, term_id)` ⚠ — Delete Attribute Term
- `cart_labels_attributes_get_group(group_id)` — Get Attribute Group
- `cart_labels_attributes_list_groups` — List Attribute Groups (paginated)
- `cart_labels_attributes_list_terms(group_id)` — List Attribute Terms (paginated)
- `cart_labels_attributes_list` — List Labels (paginated)
- `cart_labels_attributes_update_group(group_id)` — Update Attribute Group
- `cart_labels_attributes_update_term(group_id, term_id)` — Update Attribute Term
- `cart_labels_attributes_update_selections` — Update Label Selections

### cart_utilities — Store utilities: dashboard stats and onboarding, activity log, order notes, print templates, country data, filter options, and retention snapshots.

- `cart_utilities_generate_retention_snapshots` — Generate Retention Snapshots
- `cart_utilities_retention_snapshots_status` — Check Retention Snapshot Status
- `cart_utilities_attach_note_to_order` — Attach Note to Order
- `cart_utilities_create_all_pages` — Create All Pages
- `cart_utilities_create_single_page` — Create Single Page
- `cart_utilities_delete_activity(id)` ⚠ — Delete Activity
- `cart_utilities_get_country_info` — Get Country Info
- `cart_utilities_get_dashboard_stats` — Get Dashboard Stats
- `cart_utilities_get_filter_options` — Get Filter Options
- `cart_utilities_get_onboarding_data` — Get Onboarding Data
- `cart_utilities_get_onboarding_settings` — Get Onboarding Settings
- `cart_utilities_get_print_templates` — Get Print Templates
- `cart_utilities_get_search_options` — Get Search Options
- `cart_utilities_get_widgets` — Get Widgets
- `cart_utilities_initialize_app` — Initialize App
- `cart_utilities_list_activities` — List Activities (paginated)
- `cart_utilities_list_attachments` — List Attachments (paginated)
- `cart_utilities_list_countries` — List Countries (paginated)
- `cart_utilities_mark_activity_read(id)` — Mark Activity Read/Unread
- `cart_utilities_save_onboarding_settings` — Save Onboarding Settings
- `cart_utilities_save_print_templates` — Save Print Templates
- `cart_utilities_upload_attachment` — Upload Attachment

### cart_storefront — Read-only public storefront data: published products, rendered product listings, and product search — no authentication required.

- `cart_storefront_get_product_views` — Get Product Views
- `cart_storefront_list_products` — List Products (paginated)
- `cart_storefront_search_products` — Search Products (paginated)

### cart_checkout — Checkout-session operations: place an order, fetch payment and shipping info for the cart, and log a customer in. These endpoints expect a customer browser session (cookie + nonce); most will be rejected under Application Password auth — see docs/api-reference/auth.md.

- `cart_checkout_get_available_shipping_methods` — Get Available Shipping Methods
- `cart_checkout_get_summary` — Get Checkout Summary
- `cart_checkout_get_country_info` — Get Country Info
- `cart_checkout_get_order_info` — Get Order Info
- `cart_checkout_get_shipping_methods_list_view` — Get Shipping Methods List View
- `cart_checkout_login` — Login
- `cart_checkout_place_order` — Place Order

### cart_customer_portal — Customer-portal operations on the logged-in customer's own profile, orders, addresses, subscriptions, and downloads. These endpoints expect a customer browser session (cookie + nonce); most will be rejected under Application Password auth — see docs/api-reference/auth.md.

- `cart_customer_portal_create_address_checkout` — Create Address (Checkout)
- `cart_customer_portal_create_profile_address` — Create Profile Address
- `cart_customer_portal_dashboard_overview` — Dashboard Overview
- `cart_customer_portal_delete_address_checkout(customerId)` ⚠ — Delete Address (Checkout)
- `cart_customer_portal_delete_profile_address` ⚠ — Delete Profile Address
- `cart_customer_portal_get_details(customerId)` — Get Customer Details
- `cart_customer_portal_get_orders(customerId)` — Get Customer Orders
- `cart_customer_portal_get_order_details(order_uuid)` — Get Order Details
- `cart_customer_portal_get_profile_details` — Get Profile Details
- `cart_customer_portal_get_transaction_billing_address(transaction_uuid)` — Get Transaction Billing Address
- `cart_customer_portal_get_upgrade_paths(order_uuid)` — Get Upgrade Paths
- `cart_customer_portal_list_downloads` — List Downloads (paginated)
- `cart_customer_portal_list_orders` — List Orders (paginated)
- `cart_customer_portal_make_profile_address_primary` — Make Profile Address Primary
- `cart_customer_portal_save_transaction_billing_address(transaction_uuid)` — Save Transaction Billing Address
- `cart_customer_portal_select_address_for_checkout(customerAddressId)` — Select Address for Checkout
- `cart_customer_portal_set_address_as_primary(customerId)` — Set Address as Primary
- `cart_customer_portal_update_address_checkout(customerId)` — Update Address (Checkout)
- `cart_customer_portal_update_details(customerId)` — Update Customer Details
- `cart_customer_portal_update_profile_address` — Update Profile Address
- `cart_customer_portal_update_profile_details` — Update Profile Details

### cart_licensing — Manage software licenses: view, extend, regenerate keys, change limits, activate or deactivate sites, plus the public license verification endpoints (FluentCart Pro).

- `cart_licensing_activate_plugin_license` — Activate Plugin License
- `cart_licensing_activate_site_admin(id)` — Activate Site (Admin)
- `cart_licensing_deactivate_plugin_license` ⚠ — Deactivate Plugin License
- `cart_licensing_deactivate_site_admin(id)` ⚠ — Deactivate Site (Admin)
- `cart_licensing_deactivate_site_customer(license_key)` ⚠ — Deactivate Site (Customer)
- `cart_licensing_delete_license(id)` ⚠ — Delete License
- `cart_licensing_extend_license_validity(id)` — Extend License Validity
- `cart_licensing_get_customer_license_details(license_key)` — Get Customer License Details
- `cart_licensing_get_customer_licenses_admin(id)` — Get Customer Licenses (Admin)
- `cart_licensing_get_license_activations(license_key)` — Get License Activations
- `cart_licensing_get_license_chart` — Get License Line Chart
- `cart_licensing_get_license_details(id)` — Get License Details
- `cart_licensing_get_license_pie_chart` — Get License Pie Chart
- `cart_licensing_get_license_summary` — Get License Summary
- `cart_licensing_get_plugin_license_status` — Get Plugin License Status
- `cart_licensing_get_product_license_settings(id)` — Get Product License Settings
- `cart_licensing_list_customer_licenses` — List Customer Licenses (paginated)
- `cart_licensing_list_licenses` — List Licenses (paginated)
- `cart_licensing_public_activate_license` — Activate License
- `cart_licensing_public_check_license` — Check License
- `cart_licensing_public_deactivate_license` ⚠ — Deactivate License
- `cart_licensing_public_download_license_package` — Download License Package
- `cart_licensing_public_get_license_version` — Get License Version
- `cart_licensing_regenerate_license_key(id)` ⚠ 🔒 — Regenerate License Key
- `cart_licensing_save_product_license_settings(id)` — Save Product License Settings
- `cart_licensing_update_license_activation_limit(id)` — Update License Activation Limit
- `cart_licensing_update_license_status(id)` — Update License Status

### cart_roles — Manage FluentCart shop roles, permissions, and user assignments (FluentCart Pro).

- `cart_roles_assign` — Assign Role
- `cart_roles_delete_assignment(key)` ⚠ — Delete Role Assignment
- `cart_roles_get_permissions` — Get Permissions
- `cart_roles_get(key)` — Get Role
- `cart_roles_list_managers` — List Managers (paginated)
- `cart_roles_list` — List Roles (paginated)
- `cart_roles_save_permissions` — Save Permissions
- `cart_roles_search_users` — Search Users (paginated)
- `cart_roles_update(key)` — Update Role

### cart_order_bumps — Manage checkout order bumps: list, create, update, and delete (FluentCart Pro).

- `cart_order_bumps_create` — Create Order Bump
- `cart_order_bumps_delete(id)` ⚠ — Delete Order Bump
- `cart_order_bumps_get(id)` — Get Order Bump
- `cart_order_bumps_list` — List Order Bumps (paginated)
- `cart_order_bumps_update(id)` — Update Order Bump

## WP Social Ninja (`social_*`)

### social_reviews — Manage the reviews collected from connected platforms: list, edit, duplicate, categorize, change status, or mark as spam.

- `social_reviews_list` — List Reviews (paginated)
- `social_reviews_create` — Create Review
- `social_reviews_delete` ⚠ — Delete Reviews
- `social_reviews_update(id)` — Update Review
- `social_reviews_duplicate` — Duplicate Review
- `social_reviews_update_statuses` — Update Review Statuses
- `social_reviews_mark_spam` — Mark Reviews as Spam
- `social_reviews_bulk_assign_category` — Bulk Assign Review Category
- `social_reviews_list_categories` — List Review Categories (paginated)
- `social_reviews_update_category(id)` — Update Review Category
- `social_reviews_delete_category(id)` ⚠ — Delete Review Category

### social_testimonials — Manage hand-written testimonials, their statuses, spam flags, and categories.

- `social_testimonials_list` — List Testimonials (paginated)
- `social_testimonials_create` — Create Testimonial
- `social_testimonials_delete` ⚠ — Delete Testimonials
- `social_testimonials_update(id)` — Update Testimonial
- `social_testimonials_duplicate` — Duplicate Testimonial
- `social_testimonials_update_statuses` — Update Testimonial Statuses
- `social_testimonials_mark_spam` — Mark Testimonials as Spam
- `social_testimonials_bulk_assign_category` — Bulk Assign Testimonial Category
- `social_testimonials_list_categories` — List Testimonial Categories (paginated)
- `social_testimonials_update_category(id)` — Update Testimonial Category
- `social_testimonials_delete_category(id)` ⚠ — Delete Testimonial Category

### social_templates — Manage the review and social-feed widget templates rendered on the site via shortcodes and blocks.

- `social_templates_list` — List Templates (paginated)
- `social_templates_create` — Create Template
- `social_templates_delete` ⚠ — Delete Templates
- `social_templates_duplicate` — Duplicate Template
- `social_templates_update_title(id)` — Update Template Title
- `social_templates_get_reviews(id)` — Get Reviews Template Meta
- `social_templates_update_reviews(id)` — Update Reviews Template Meta
- `social_templates_edit_reviews(id)` — Edit Reviews Template
- `social_templates_load_more_reviews(id)` — Load More Template Reviews
- `social_templates_can_enable_ai_summary(id)` — Can Enable AI Summary
- `social_templates_get_reviews_first_round(id, isFirstRound)` — Get Reviews Template (First Round)
- `social_templates_get_feed(id)` — Get Feed Template Meta
- `social_templates_update_feed(id)` — Update Feed Template Meta
- `social_templates_edit_feed(id)` — Edit Feed Template

### social_platforms — Connect review and feed platforms (Google, Facebook, Instagram, …), manage their configs, and sync their content.

- `social_platforms_list` — List Platforms (paginated)
- `social_platforms_list_enabled` — List Enabled Platforms (paginated)
- `social_platforms_get_statuses` — Get Platform Statuses
- `social_platforms_update_statuses` — Update Platform Statuses
- `social_platforms_update_addons` — Update Platform Addons
- `social_platforms_subscribe_updates` — Subscribe to Platform Updates
- `social_platforms_get_dashboard_notices` — Get Dashboard Notices
- `social_platforms_update_dashboard_notices` — Update Dashboard Notices
- `social_platforms_get_review_configs` — Get Review Platform Configs
- `social_platforms_save_review_config` — Save Review Platform Config
- `social_platforms_delete_review_config` ⚠ — Delete Review Platform Config
- `social_platforms_prepare_review_connect` — Prepare Review Platform Connect
- `social_platforms_consume_review_connect` — Consume Review Platform Connect
- `social_platforms_sync_reviews` — Manually Sync Platform Reviews
- `social_platforms_fetch_reviews` — Fetch Platform Reviews
- `social_platforms_get_feed_configs` — Get Feed Platform Configs
- `social_platforms_save_feed_config` — Save Feed Platform Config
- `social_platforms_delete_feed_config` ⚠ — Delete Feed Platform Config
- `social_platforms_prepare_feed_connect` — Prepare Feed Platform Connect
- `social_platforms_consume_feed_connect` — Consume Feed Platform Connect

### social_chat_widgets — Manage floating chat widgets (WhatsApp, Messenger, Telegram, …) shown on the site.

- `social_chat_widgets_list` — List Chat Widgets (paginated)
- `social_chat_widgets_create` — Create Chat Widget
- `social_chat_widgets_update_statuses` — Update Chat Widget Statuses
- `social_chat_widgets_delete` ⚠ — Delete Chat Widgets
- `social_chat_widgets_duplicate` — Duplicate Chat Widget
- `social_chat_widgets_get(id)` — Get Chat Widget Meta
- `social_chat_widgets_update(id)` — Update Chat Widget Meta
- `social_chat_widgets_reset(id)` ⚠ — Reset Chat Widget Meta

### social_notifications — Manage sales/social-proof notification popups.

- `social_notifications_list` — List Notifications (paginated)
- `social_notifications_create` — Create Notification
- `social_notifications_update` — Update Notification
- `social_notifications_delete` ⚠ — Delete Notifications
- `social_notifications_duplicate` — Duplicate Notification

### social_shoppable — Manage the shoppable Instagram feed and its product-tagged posts.

- `social_shoppable_get_feed` — Get Shoppable Feed
- `social_shoppable_update_feed` — Update Shoppable Feed
- `social_shoppable_delete_feed` ⚠ — Delete Shoppable Feed
- `social_shoppable_list_posts` — List Shoppable Posts (paginated)
- `social_shoppable_update_template_settings(id)` — Update Shoppable Template Settings

### social_settings — Global WP Social Ninja settings: general and advanced options, translations, licensing, managers, resets, and the onboarding wizard. The manager endpoints (/pro/settings/managers) require WP Social Ninja Pro.

- `social_settings_get` — Get Global Settings
- `social_settings_save` — Save Global Settings
- `social_settings_delete` ⚠ — Delete Global Settings
- `social_settings_get_advanced` — Get Advanced Settings
- `social_settings_save_advanced` — Save Advanced Settings
- `social_settings_get_translations` — Get Translations
- `social_settings_save_translations` — Save Translations
- `social_settings_get_license` — Get License
- `social_settings_activate_license` — Activate License
- `social_settings_deactivate_license` ⚠ — Deactivate License
- `social_settings_delete_twitter_card` ⚠ — Delete Twitter Card Connection
- `social_settings_reset_cached_images` ⚠ — Reset Cached Images
- `social_settings_reset_error_log` ⚠ — Reset Error Log
- `social_settings_delete_all_data` ⚠ 🔒 — Delete All Plugin Data
- `social_settings_search_pages` — Search Site Pages (paginated)
- `social_settings_list_managers` — List Managers (paginated)
- `social_settings_add_manager` — Add Manager
- `social_settings_update_manager` — Update Manager
- `social_settings_delete_manager(id)` ⚠ — Delete Manager
- `social_settings_get_onboarding` — Get Onboarding State
- `social_settings_save_onboarding` — Save Onboarding Step
- `social_settings_get_onboarding_config` — Get Onboarding Config
- `social_settings_skip_onboarding` — Skip Onboarding

### social_collection — Collect new reviews: review forms, custom sources, get-reviews QR codes, form captcha, FluentCRM tagging, and WooCommerce/FluentCart review imports. Requires WP Social Ninja Pro (all endpoints live under /pro/).

- `social_collection_list_review_forms` — List Review Forms (paginated)
- `social_collection_create_review_form` — Create Review Form
- `social_collection_delete_review_forms` ⚠ — Delete Review Forms
- `social_collection_get_review_form(id)` — Get Review Form
- `social_collection_update_review_form(id)` — Update Review Form
- `social_collection_duplicate_review_form(id)` — Duplicate Review Form
- `social_collection_update_review_form_statuses` — Update Review Form Statuses
- `social_collection_list_custom_sources` — List Custom Sources (paginated)
- `social_collection_create_custom_source` — Create Custom Source
- `social_collection_delete_custom_sources` ⚠ — Delete Custom Sources
- `social_collection_get_custom_source(id)` — Get Custom Source
- `social_collection_save_custom_source_settings(id)` — Save Custom Source Settings
- `social_collection_list_custom_source_form_templates` — List Custom Source Form Templates (paginated)
- `social_collection_list_qr_codes` — List Get-Reviews QR Codes (paginated)
- `social_collection_create_qr_code` — Create Get-Reviews QR Code
- `social_collection_update_qr_code(id)` — Update Get-Reviews QR Code
- `social_collection_delete_qr_code(id)` ⚠ — Delete Get-Reviews QR Code
- `social_collection_list_review_platforms` — List Review Collection Platforms (paginated)
- `social_collection_get_review_form_captcha` — Get Review Form Captcha
- `social_collection_save_review_form_captcha` — Save Review Form Captcha
- `social_collection_delete_review_form_captcha` ⚠ — Delete Review Form Captcha
- `social_collection_get_fluentcrm_review_tag` — Get FluentCRM Review Tag
- `social_collection_save_fluentcrm_review_tag` — Save FluentCRM Review Tag
- `social_collection_import_woocommerce_reviews` — Import WooCommerce Reviews
- `social_collection_restart_woocommerce_import` — Restart WooCommerce Review Import
- `social_collection_get_woocommerce_import_progress` — Get WooCommerce Import Progress
- `social_collection_quick_setup_woocommerce` — Quick Setup WooCommerce Reviews
- `social_collection_quick_setup_fluent_cart` — Quick Setup FluentCart Reviews
- `social_collection_connect_fluent_cart_products` — Connect All FluentCart Products

## Server built-ins

- `tool_map` — This map — overview, per-area drill-down, keyword search
- `verify_setup` — Check credentials, connectivity, and plugin presence per product
- `wp_media_upload_from_url(source_url)` — Upload an image from a URL (server-side fetch)
- `wp_media_get(id)` — Get one media attachment
- `wp_media_list` — List or search the media library (paginated)
