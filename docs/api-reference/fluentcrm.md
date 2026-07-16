# FluentCRM REST API — Reference

> **Source:** <https://developers.fluentcrm.com/rest-api/> · **Scraped:** 2026-07-16 · **Endpoints:** 319 across 28 groups
> Regenerate with `node scripts/gen-api-docs.mjs fluentcrm` — see [MAINTAINING.md](./MAINTAINING.md).

**Base URL:** `https://{website}/wp-json/fluent-crm/v2` (namespace `fluent-crm/v2`)

## Authentication

| Context | Used by | Auth |
|---------|---------|------|
| Admin | all endpoints except public bounce handlers | WordPress Application Passwords (HTTP Basic), created under FluentCRM → Settings → Rest API (backed by a FluentCRM Manager account) |
| Public | `public-bounce` handlers | Security key in URL (none/webhook-style) |

Credential setup for all products: [auth.md](./auth.md).

## Groups

| Group | Endpoints | Full schemas |
|-------|-----------|------|
| Contacts (Subscribers) | 31 | [contacts.md](./fluentcrm/contacts.md) |
| Lists | 7 | [lists.md](./fluentcrm/lists.md) |
| Tags | 7 | [tags.md](./fluentcrm/tags.md) |
| Dynamic Segments | 9 | [dynamic-segments.md](./fluentcrm/dynamic-segments.md) |
| Custom Fields | 3 | [custom-fields.md](./fluentcrm/custom-fields.md) |
| Companies | 19 | [companies.md](./fluentcrm/companies.md) |
| Campaigns | 32 | [campaigns.md](./fluentcrm/campaigns.md) |
| Campaign Actions (Pro) | 7 | [campaigns-pro.md](./fluentcrm/campaigns-pro.md) |
| Recurring Campaigns (Pro) | 14 | [recurring-campaigns.md](./fluentcrm/recurring-campaigns.md) |
| Email Sequences (Pro) | 18 | [sequences.md](./fluentcrm/sequences.md) |
| Automations (Funnels) | 31 | [funnels.md](./fluentcrm/funnels.md) |
| Email Templates | 11 | [templates.md](./fluentcrm/templates.md) |
| Forms | 5 | [forms.md](./fluentcrm/forms.md) |
| Incoming Webhooks | 5 | [webhooks.md](./fluentcrm/webhooks.md) |
| Smart Links (Pro) | 5 | [smart-links.md](./fluentcrm/smart-links.md) |
| SMS (Pro) | 24 | [sms.md](./fluentcrm/sms.md) |
| Abandoned Carts (Pro) | 3 | [abandon-carts.md](./fluentcrm/abandon-carts.md) |
| Commerce Reports (Pro) | 2 | [commerce-reports.md](./fluentcrm/commerce-reports.md) |
| Reports | 14 | [reports.md](./fluentcrm/reports.md) |
| Contact Import | 6 | [import.md](./fluentcrm/import.md) |
| Migrators | 5 | [migrators.md](./fluentcrm/migrators.md) |
| WordPress Users | 2 | [users.md](./fluentcrm/users.md) |
| Labels | 4 | [labels.md](./fluentcrm/labels.md) |
| Docs & Addons | 3 | [docs.md](./fluentcrm/docs.md) |
| Global Search | 1 | [global-search.md](./fluentcrm/global-search.md) |
| Settings | 38 | [settings.md](./fluentcrm/settings.md) |
| Pro Settings | 11 | [pro-settings.md](./fluentcrm/pro-settings.md) |
| Public Bounce Handlers | 2 | [public-bounce.md](./fluentcrm/public-bounce.md) |

## Endpoints by group

### Contacts (Subscribers)

Full schemas: [`fluentcrm/contacts.md`](./fluentcrm/contacts.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/subscribers/do-bulk-action` | POST Bulk Action Contacts |
| POST | `/subscribers/bulk-add-update` | POST Bulk Add/Update Contacts |
| POST | `/subscribers` | POST Create Contact |
| POST | `/subscribers/{id}/notes` | POST Create Contact Note |
| DELETE | `/subscribers/{id}` | DELETE Delete Contact |
| DELETE | `/subscribers/{id}/emails` | DELETE Delete Contact Emails |
| DELETE | `/subscribers/{id}/notes/{note_id}` | DELETE Delete Contact Note |
| DELETE | `/subscribers` | DELETE Delete Contacts |
| GET | `/subscribers/{id}` | GET Get Contact |
| GET | `/subscribers/{id}/dynamic-item-view` | GET Get Contact Dynamic Item View |
| GET | `/subscribers/{id}/emails` | GET Get Contact Emails |
| GET | `/subscribers/{id}/external_view` | GET Get Contact External View |
| GET | `/subscribers/{id}/form-submissions` | GET Get Contact Form Submissions |
| GET | `/subscribers/{id}/info-widgets` | GET Get Contact Info Widgets |
| GET | `/subscribers/{id}/notes` | GET Get Contact Notes |
| GET | `/subscribers/prev-next-ids` | GET Get Contact Prev/Next IDs |
| GET | `/subscribers/{id}/purchase-history` | GET Get Contact Purchase History |
| GET | `/subscribers/{id}/support-tickets` | GET Get Contact Support Tickets |
| GET | `/subscribers/{id}/emails/template-mock` | GET Get Contact Template Mock |
| GET | `/subscribers/{id}/tracking-events` | GET Get Contact Tracking Events |
| GET | `/subscribers/{id}/url-metrics` | GET Get Contact URL Metrics |
| GET | `/subscribers` | GET List Contacts |
| POST | `/subscribers/{id}/external_view` | POST Save Contact External View |
| GET | `/subscribers/search-contacts` | GET Search Contacts |
| POST | `/subscribers/{id}/emails/send` | POST Send Contact Custom Email |
| POST | `/subscribers/{id}/send-double-optin` | POST Send Contact Double Opt-in |
| POST | `/subscribers/sync-segments` | POST Sync Contact Segments |
| POST | `/subscribers/track-event` | POST Track Contact Event |
| PUT | `/subscribers/{id}` | PUT Update Contact |
| PUT | `/subscribers/{id}/notes/{note_id}` | PUT Update Contact Note |
| PUT | `/subscribers/subscribers-property` | PUT Update Contacts Property |

### Lists

Full schemas: [`fluentcrm/lists.md`](./fluentcrm/lists.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/lists/do-bulk-action` | POST Bulk Action Lists |
| POST | `/lists/bulk` | POST Bulk Create Lists |
| POST | `/lists` | POST Create List |
| DELETE | `/lists/{id}` | DELETE Delete List |
| GET | `/lists/{id}` | GET Get List |
| GET | `/lists` | GET List Lists |
| PUT | `/lists/{id}` | PUT Update List |

### Tags

Full schemas: [`fluentcrm/tags.md`](./fluentcrm/tags.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/tags/do-bulk-action` | POST Bulk Action Tags |
| POST | `/tags/bulk` | POST Bulk Create Tags |
| POST | `/tags` | POST Create Tag |
| DELETE | `/tags/{id}` | DELETE Delete Tag |
| GET | `/tags/{id}` | GET Get Tag |
| GET | `/tags` | GET List Tags |
| PUT | `/tags/{id}` | PUT Update Tag |

### Dynamic Segments

Full schemas: [`fluentcrm/dynamic-segments.md`](./fluentcrm/dynamic-segments.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/dynamic-segments` | POST Create Dynamic Segment |
| DELETE | `/dynamic-segments/{id}` | DELETE Delete Dynamic Segment |
| POST | `/dynamic-segments/duplicate/{id}` | POST Duplicate Dynamic Segment |
| POST | `/dynamic-segments/estimated-contacts` | POST Estimate Dynamic Segment Contacts |
| GET | `/dynamic-segments/custom-fields` | GET Get Dynamic Segment Custom Fields |
| GET | `/dynamic-segments/stats` | GET Get Dynamic Segment Stats |
| GET | `/dynamic-segments/{slug}/subscribers/{id}` | GET Get Dynamic Segment Subscribers |
| GET | `/dynamic-segments` | GET List Dynamic Segments |
| PUT | `/dynamic-segments/{id}` | PUT Update Dynamic Segment |

### Custom Fields

Full schemas: [`fluentcrm/custom-fields.md`](./fluentcrm/custom-fields.md)

| Method | Path | Summary |
|--------|------|---------|
| GET | `/custom-fields/contacts` | GET Get Contact Custom Fields |
| PUT | `/custom-fields/contacts` | PUT Save Contact Custom Fields |
| PUT | `/custom-fields/contacts/update_group_name` | PUT Update Custom Field Group Name |

### Companies

Full schemas: [`fluentcrm/companies.md`](./fluentcrm/companies.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/companies/attach-subscribers` | POST Attach Subscribers to Companies |
| POST | `/companies/do-bulk-action` | POST Bulk Action on Companies |
| POST | `/companies` | POST Create Company |
| POST | `/companies/{id}/notes` | POST Create Company Note |
| DELETE | `/companies/{id}` | DELETE Delete Company |
| DELETE | `/companies/{id}/notes/{note_id}` | DELETE Delete Company Note |
| POST | `/companies/detach-subscribers` | POST Detach Subscribers from Companies |
| GET | `/companies/{id}` | GET Get Company |
| GET | `/companies/custom-fields` | GET Get Company Custom Fields |
| GET | `/companies/{id}/custom_tab_view` | GET Get Company External View |
| GET | `/companies/{id}/notes` | GET Get Company Notes |
| POST | `/companies/csv-import` | POST Import Companies from CSV |
| GET | `/companies` | GET List Companies |
| PUT | `/companies/custom-fields` | PUT Save Company Custom Fields |
| GET | `/companies/search` | GET Search Companies |
| GET | `/companies/search-unattached-contacts` | GET Search Unattached Contacts |
| PUT | `/companies/companies-property` | PUT Update Companies Property |
| PUT | `/companies/{id}` | PUT Update Company |
| PUT | `/companies/{id}/notes/{note_id}` | PUT Update Company Note |

### Campaigns

Full schemas: [`fluentcrm/campaigns.md`](./fluentcrm/campaigns.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/campaigns/do-bulk-action` | POST Bulk Action Campaigns |
| POST | `/campaigns` | POST Create Campaign |
| DELETE | `/campaigns/{id}` | DELETE Delete Campaign |
| DELETE | `/campaigns/{id}/emails` | DELETE Delete Campaign Emails |
| POST | `/campaigns/{id}/draft-recipients` | POST Draft Campaign Recipients |
| POST | `/campaigns/{id}/duplicate` | POST Duplicate Campaign |
| POST | `/campaigns/estimated-contacts` | POST Estimate Campaign Contacts |
| GET | `/campaigns/{id}` | GET Get Campaign |
| GET | `/campaigns/{id}/contacts-by-segment` | GET Get Campaign Contacts by Segment |
| GET | `/campaigns/{id}/emails` | GET Get Campaign Emails |
| GET | `/campaigns/{id}/link-report` | GET Get Campaign Link Report |
| GET | `/campaigns/{id}/overview_stats` | GET Get Campaign Overview Stats |
| GET | `/campaigns/{id}/processing-stat` | GET Get Campaign Processing Stat |
| GET | `/campaigns/{id}/estimated-recipients-count` | GET Get Campaign Recipients Count |
| GET | `/campaigns/{id}/revenues` | GET Get Campaign Revenues |
| GET | `/campaigns/{id}/share-url` | GET Get Campaign Share URL |
| GET | `/campaigns/{id}/status` | GET Get Campaign Status |
| GET | `/campaigns/{id}/unsubscribers` | GET Get Campaign Unsubscribers |
| GET | `/campaigns` | GET List Campaigns |
| POST | `/campaigns/{id}/pause` | POST Pause Campaign |
| GET | `/campaigns/emails/{email_id}/preview` | GET Preview Campaign Email |
| POST | `/campaigns/email-preview-html` | POST Preview Campaign Email HTML |
| POST | `/campaigns/{id}/resume` | POST Resume Campaign |
| POST | `/campaigns/{id}/revenues/resync` | POST Resync Campaign Revenues |
| POST | `/campaigns/{id}/schedule` | POST Schedule Campaign |
| POST | `/campaigns/send-test-email` | POST Send Campaign Test Email |
| POST | `/campaigns/{id}/un-schedule` | POST Un-Schedule Campaign |
| PUT | `/campaigns/{id}` | PUT Update Campaign |
| PUT | `/campaigns/{id}/update-labels` | PUT Update Campaign Labels |
| POST | `/campaigns/{id}/step` | POST Update Campaign Step |
| PUT | `/campaigns/{id}/title` | PUT Update Campaign Title |
| POST | `/campaigns/update-single-campaign` | POST Update Single Campaign (Simulate) |

### Campaign Actions (Pro)

Full schemas: [`fluentcrm/campaigns-pro.md`](./fluentcrm/campaigns-pro.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/campaigns-pro/{id}/tag-actions` | POST Campaign Tag Actions |
| GET | `/campaigns-pro/posts/taxonomies` | GET Dynamic Post Taxonomies |
| GET | `/campaigns-pro/posts` | GET Dynamic Posts |
| GET | `/campaigns-pro/products` | GET Dynamic Products |
| POST | `/campaigns-pro/{id}/resend-emails` | POST Resend Campaign Emails |
| POST | `/campaigns-pro/{id}/resend-failed-emails` | POST Resend Failed Emails |
| POST | `/campaigns-pro/{id}/resend-unopened-emails` | POST Resend Unopened Emails |

### Recurring Campaigns (Pro)

Full schemas: [`fluentcrm/recurring-campaigns.md`](./fluentcrm/recurring-campaigns.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/recurring-campaigns/do-bulk-action` | POST Bulk Action Recurring Campaigns |
| POST | `/recurring-campaigns/{campaign_id}/change-status` | POST Change Recurring Campaign Status |
| POST | `/recurring-campaigns` | POST Create Recurring Campaign |
| POST | `/recurring-campaigns/delete-bulk` | POST Delete Bulk Recurring Campaigns |
| POST | `/recurring-campaigns/{campaign_id}/duplicate` | POST Duplicate Recurring Campaign |
| GET | `/recurring-campaigns/{campaign_id}` | GET Get Recurring Campaign |
| GET | `/recurring-campaigns/{campaign_id}/emails/{email_id}` | GET Get Recurring Campaign Email |
| GET | `/recurring-campaigns/{campaign_id}/emails` | GET Get Recurring Campaign Emails |
| GET | `/recurring-campaigns` | GET List Recurring Campaigns |
| PUT | `/recurring-campaigns/{campaign_id}/emails/{email_id}` | PUT Patch Recurring Campaign Email Status |
| POST | `/recurring-campaigns/update-campaign-data` | POST Update Recurring Campaign Email Data |
| POST | `/recurring-campaigns/{campaign_id}/emails/update-email` | POST Update Recurring Campaign Email |
| PUT | `/recurring-campaigns/{campaign_id}/update-labels` | PUT Update Recurring Campaign Labels |
| POST | `/recurring-campaigns/{campaign_id}/update-settings` | POST Update Recurring Campaign Settings |

### Email Sequences (Pro)

Full schemas: [`fluentcrm/sequences.md`](./fluentcrm/sequences.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/sequences/{id}/subscribers` | POST Add Sequence Subscribers |
| POST | `/sequences/do-bulk-action` | POST Bulk Action Sequences |
| POST | `/sequences/sequence-email-update-create` | POST Create or Update Sequence Email |
| POST | `/sequences` | POST Create Sequence |
| POST | `/sequences/{id}/email` | POST Create Sequence Email |
| DELETE | `/sequences/{id}` | DELETE Delete Sequence |
| DELETE | `/sequences/{id}/email/{email_id}` | DELETE Delete Sequence Email |
| POST | `/sequences/{id}/duplicate` | POST Duplicate Sequence |
| POST | `/sequences/{id}/email/duplicate` | POST Duplicate Sequence Email |
| GET | `/sequences/{id}` | GET Get Sequence |
| GET | `/sequences/{id}/email/{email_id}` | GET Get Sequence Email |
| GET | `/sequences/{id}/subscribers` | GET Get Sequence Subscribers |
| GET | `/sequences/subscriber/{subscriber_id}/sequences` | GET Get Subscriber Sequences |
| GET | `/sequences` | GET List Sequences |
| POST | `/sequences/{id}/reapply` | POST Reapply Sequence |
| DELETE | `/sequences/{id}/subscribers` | DELETE Remove Sequence Subscribers |
| PUT | `/sequences/{id}` | PUT Update Sequence |
| PUT | `/sequences/{id}/email/{email_id}` | PUT Update Sequence Email |

### Automations (Funnels)

Full schemas: [`fluentcrm/funnels.md`](./fluentcrm/funnels.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/funnels/do-bulk-action` | POST Bulk Action Funnels |
| PUT | `/funnels/{id}/change-trigger` | PUT Change Funnel Trigger |
| POST | `/funnels/{id}/clone` | POST Clone Funnel |
| POST | `/funnels` | POST Create Funnel |
| POST | `/funnels/create-from-template` | POST Create Funnel from Template |
| DELETE | `/funnels/{id}` | DELETE Delete Funnel |
| DELETE | `/funnels/{id}/subscribers` | DELETE Delete Funnel Subscribers |
| POST | `/funnels/{id}/subscribers/{subscriber_id}/advance` | POST Force Advance Funnel Subscriber |
| GET | `/funnels/{id}` | GET Get Funnel |
| GET | `/funnels/all-activities` | GET Get All Funnel Activities |
| GET | `/funnels/{id}/email_reports` | GET Get Funnel Email Reports |
| GET | `/funnels/{id}/report` | GET Get Funnel Report |
| GET | `/funnels/{id}/subscribers/{contact_id}` | GET Get Funnel Subscriber Reporting |
| GET | `/funnels/{id}/subscribers` | GET Get Funnel Subscribers |
| GET | `/funnels/{id}/syncable-counts` | GET Get Funnel Syncable Counts |
| GET | `/funnels/templates` | GET Get Funnel Templates |
| GET | `/funnels/triggers` | GET Get Funnel Triggers |
| GET | `/funnels/subscriber/{subscriber_id}/automations` | GET Get Subscriber Automations |
| POST | `/funnels/import` | POST Import Funnel |
| GET | `/funnels` | GET List Funnels |
| POST | `/funnels/remove-bulk-subscribers` | POST Remove Bulk Subscribers from Funnels |
| POST | `/funnels/funnel/save-email-action-fallback` | POST Save Email Action (Fallback) |
| POST | `/funnels/{id}/sequences/save-email-action` | POST Save Funnel Email Action |
| POST | `/funnels/{id}/sequences` | POST Save Funnel Sequences |
| POST | `/funnels/funnel/save-funnel-sequences` | POST Save Funnel Sequences (Fallback) |
| POST | `/funnels/send-test-webhook` | POST Send Test Webhook |
| POST | `/funnels/{id}/sync-new-steps` | POST Sync Funnel New Steps |
| PUT | `/funnels/{id}/update-labels` | PUT Update Funnel Labels |
| PUT | `/funnels/{id}` | PUT Update Funnel Property |
| PUT | `/funnels/{id}/subscribers/{subscriber_id}/status` | PUT Update Funnel Subscription Status |
| PUT | `/funnels/funnel/{id}/title` | PUT Update Funnel Title |

### Email Templates

Full schemas: [`fluentcrm/templates.md`](./fluentcrm/templates.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/templates/do-bulk-action` | POST Bulk Action Templates |
| POST | `/templates` | POST Create Template |
| DELETE | `/templates/{id}` | DELETE Delete Template |
| POST | `/templates/duplicate/{id}` | POST Duplicate Template |
| GET | `/templates/built-in-templates` | GET Get Built-In Templates |
| GET | `/templates/smartcodes` | GET Get Smart Codes |
| GET | `/templates/{id}` | GET Get Template |
| GET | `/templates/all` | GET List All Templates |
| GET | `/templates` | GET List Templates |
| POST | `/templates/set-global-style` | POST Set Global Style |
| PUT | `/templates/{id}` | PUT Update Template |

### Forms

Full schemas: [`fluentcrm/forms.md`](./fluentcrm/forms.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/forms` | POST Create Form |
| GET | `/forms/{id}/entries` | GET Form Entries |
| GET | `/forms/{form_id}/entries/{id}` | GET Form Entry |
| GET | `/forms/templates` | GET Form Templates |
| GET | `/forms` | GET List Forms |

### Incoming Webhooks

Full schemas: [`fluentcrm/webhooks.md`](./fluentcrm/webhooks.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/webhooks` | POST Create Webhook |
| DELETE | `/webhooks/{id}` | DELETE Delete Webhook |
| GET | `/webhooks/sms` | GET List SMS Webhooks |
| GET | `/webhooks` | GET List Webhooks |
| PUT | `/webhooks/{id}` | PUT Update Webhook |

### Smart Links (Pro)

Full schemas: [`fluentcrm/smart-links.md`](./fluentcrm/smart-links.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/smart-links/activate` | POST Activate Smart Links Module |
| POST | `/smart-links` | POST Create Smart Link |
| DELETE | `/smart-links/{id}` | DELETE Delete Smart Link |
| GET | `/smart-links` | GET List Smart Links |
| PUT | `/smart-links/{id}` | PUT Update Smart Link |

### SMS (Pro)

Full schemas: [`fluentcrm/sms.md`](./fluentcrm/sms.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/sms/campaigns/do-bulk-action` | POST Bulk Action on SMS Campaigns |
| POST | `/sms/campaigns` | POST Create SMS Campaign |
| DELETE | `/sms/campaigns/{id}` | DELETE Delete SMS Campaign |
| DELETE | `/sms/messages` | DELETE Delete SMS Messages |
| POST | `/sms/campaigns/{id}/tag-actions` | POST Apply Tag Actions to SMS Campaign Recipients |
| POST | `/sms/campaigns/{id}/duplicate` | POST Duplicate SMS Campaign |
| POST | `/sms/campaigns/estimated-contacts` | POST Estimate SMS Campaign Contacts |
| GET | `/sms/campaigns/{id}` | GET Get SMS Campaign |
| GET | `/sms/campaigns/{id}/processing-stat` | GET Get SMS Campaign Processing Status |
| GET | `/sms/campaigns/{id}/recipients` | GET Get SMS Campaign Recipients |
| GET | `/sms/campaigns/{id}/estimated-recipients-count` | GET Get SMS Campaign Recipients Count |
| GET | `/sms/campaigns/{id}/status` | GET Get SMS Campaign Status |
| GET | `/sms/subscribers/{id}/logs` | GET Get Subscriber SMS Logs |
| GET | `/sms/subscribers/{id}/stats` | GET Get Subscriber SMS Statistics |
| GET | `/sms/campaigns` | GET List SMS Campaigns |
| GET | `/sms/messages` | GET List All SMS Messages |
| POST | `/sms/campaigns/{id}/pause` | POST Pause SMS Campaign |
| POST | `/sms/messages/{id}/resend` | POST Resend SMS Message |
| POST | `/sms/campaigns/{id}/resume` | POST Resume SMS Campaign |
| POST | `/sms/campaigns/{id}/schedule` | POST Schedule SMS Campaign |
| POST | `/sms/subscribers/{id}/send` | POST Send Custom SMS to Subscriber |
| POST | `/sms/campaigns/{id}/unschedule` | POST Unschedule SMS Campaign |
| PUT | `/sms/campaigns/{id}` | PUT Update SMS Campaign |
| PUT | `/sms/{id}/update-labels` | PUT Update SMS Campaign Labels |

### Abandoned Carts (Pro)

Full schemas: [`fluentcrm/abandon-carts.md`](./fluentcrm/abandon-carts.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/abandon-carts/bulk-delete` | POST Bulk Delete Abandoned Carts |
| GET | `/abandon-carts/report-summary` | GET Get Abandon Cart Report Summary |
| GET | `/abandon-carts` | GET List Abandoned Carts |

### Commerce Reports (Pro)

Full schemas: [`fluentcrm/commerce-reports.md`](./fluentcrm/commerce-reports.md)

| Method | Path | Summary |
|--------|------|---------|
| GET | `/commerce-reports/{provider}/report` | GET Commerce Report |
| GET | `/commerce-reports/{provider}` | GET Commerce Reports |

### Reports

Full schemas: [`fluentcrm/reports.md`](./fluentcrm/reports.md)

| Method | Path | Summary |
|--------|------|---------|
| DELETE | `/reports/emails` | DELETE Report Emails |
| GET | `/reports/advanced-providers` | GET Advanced Report Providers |
| GET | `/reports/ajax-options` | GET Ajax Options |
| GET | `/reports/cascade_selections` | GET Cascade Selections |
| GET | `/reports/subscribers` | GET Contact Growth |
| GET | `/reports/dashboard-stats` | GET Dashboard Stats |
| GET | `/reports/email-clicks` | GET Email Click Stats |
| GET | `/reports/email-opens` | GET Email Open Stats |
| GET | `/reports/email-performance` | GET Email Performance |
| GET | `/reports/email-sents` | GET Email Sent Stats |
| GET | `/reports/emails` | GET Report Emails |
| GET | `/reports/options` | GET Report Options |
| GET | `/reports/taxonomy-terms` | GET Taxonomy Terms |
| GET | `/reports/ping` | GET Ping Report |

### Contact Import

Full schemas: [`fluentcrm/import.md`](./fluentcrm/import.md)

| Method | Path | Summary |
|--------|------|---------|
| GET | `/import/drivers/{driver}` | GET Import Driver Details |
| GET | `/import/drivers` | GET Import Drivers |
| POST | `/import/csv-import` | POST Import Contacts from CSV |
| POST | `/import/drivers/{driver}` | POST Import Data via Driver |
| POST | `/import/users` | POST Import WordPress Users |
| POST | `/import/csv-upload` | POST Upload CSV for Import |

### Migrators

Full schemas: [`fluentcrm/migrators.md`](./fluentcrm/migrators.md)

| Method | Path | Summary |
|--------|------|---------|
| GET | `/migrators` | GET Migrator Drivers |
| POST | `/migrators/summary` | POST Get Migrator Import Summary |
| GET | `/migrators/list-tag-mappings` | GET Migrator List/Tag Mappings |
| POST | `/migrators/import` | POST Execute Migrator Import |
| POST | `/migrators/verify-cred` | POST Verify Migrator Credential |

### WordPress Users

Full schemas: [`fluentcrm/users.md`](./fluentcrm/users.md)

| Method | Path | Summary |
|--------|------|---------|
| GET | `/users/roles` | GET WordPress User Roles |
| GET | `/users` | GET List WordPress Users |

### Labels

Full schemas: [`fluentcrm/labels.md`](./fluentcrm/labels.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/labels` | POST Create Label |
| DELETE | `/labels/{id}` | DELETE Delete Label |
| GET | `/labels` | GET List Labels |
| PUT | `/labels/{id}` | PUT Update Label |

### Docs & Addons

Full schemas: [`fluentcrm/docs.md`](./fluentcrm/docs.md)

| Method | Path | Summary |
|--------|------|---------|
| GET | `/docs/{doc_id}` | GET Get Doc |
| GET | `/docs/addons` | GET Get Addons |
| GET | `/docs` | GET List Docs |

### Global Search

Full schemas: [`fluentcrm/global-search.md`](./fluentcrm/global-search.md)

| Method | Path | Summary |
|--------|------|---------|
| GET | `/global-search` | GET Global Search |

### Settings

Full schemas: [`fluentcrm/settings.md`](./fluentcrm/settings.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/setting/complete-installation` | POST Complete Installation Wizard |
| POST | `/setting/rest-keys` | POST Create REST API Key |
| DELETE | `/setting/rest-keys` | DELETE REST API Key |
| GET | `/setting/abandon-cart` | GET Abandon Cart Settings |
| GET | `/setting/auto_subscribe_settings` | GET Auto Subscribe Settings |
| GET | `/setting/bounce_configs` | GET Bounce Handler Configurations |
| GET | `/setting/compliance` | GET Compliance Settings |
| GET | `/setting/cron_status` | GET Cron Status |
| GET | `/setting/double-optin` | GET Double Opt-in Settings |
| GET | `/setting/experiments/campaigns` | GET Experiment Campaigns |
| GET | `/setting/experiments` | GET Experimental Settings |
| GET | `/setting/integrations` | GET Deep Integration Providers |
| GET | `/setting/old_logs` | GET Old Log Details |
| GET | `/setting/rest-keys` | GET REST API Keys |
| GET | `/setting` | GET Global Settings |
| GET | `/setting/system-logs` | GET System Logs |
| POST | `/setting/install-fluent-boards` | POST Install Fluent Boards Plugin |
| POST | `/setting/install-fluent-booking` | POST Install Fluent Booking Plugin |
| POST | `/setting/install-fluent-cart` | POST Install FluentCart Plugin |
| POST | `/setting/install-fluent-community` | POST Install Fluent Community Plugin |
| POST | `/setting/install-fluentform` | POST Install Fluent Forms Plugin |
| POST | `/setting/install-fluentsmtp` | POST Install FluentSMTP Plugin |
| POST | `/setting/install-fluent-support` | POST Install Fluent Support Plugin |
| DELETE | `/setting/old_logs` | DELETE Remove Old Logs |
| POST | `/setting/reset_db` | POST Reset Database |
| GET | `/setting/system-logs/reset` | GET Reset System Logs |
| POST | `/setting/run_cron` | POST Run Cron Event |
| POST | `/setting/abandon-cart` | POST Save Abandon Cart Settings |
| POST | `/setting/auto_subscribe_settings` | POST Save Auto Subscribe Settings |
| PUT | `/setting/double-optin` | PUT Save Double Opt-in Settings |
| POST | `/setting/integrations` | POST Save Integration Settings |
| PUT | `/setting` | PUT Save Global Settings |
| DELETE | `/setting/test` | DELETE Test Request Resolver |
| GET | `/setting/test` | GET Test Request Resolver |
| POST | `/setting/test` | POST Test Request Resolver |
| PUT | `/setting/test` | PUT Test Request Resolver |
| POST | `/setting/compliance` | POST Update Compliance Settings |
| POST | `/setting/experiments` | POST Update Experimental Settings |

### Pro Settings

Full schemas: [`fluentcrm/pro-settings.md`](./fluentcrm/pro-settings.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/campaign-pro-settings/managers` | POST Add Manager |
| DELETE | `/campaign-pro-settings/license` | DELETE Deactivate License |
| DELETE | `/campaign-pro-settings/managers/{id}` | DELETE Remove Manager |
| POST | `/campaign-pro-settings/sms/disable` | POST Disable SMS |
| GET | `/campaign-pro-settings/license` | GET License Status |
| GET | `/campaign-pro-settings/managers` | GET List Managers |
| GET | `/campaign-pro-settings/sms` | GET SMS Settings |
| POST | `/campaign-pro-settings/import_funnel` | POST Import Funnel |
| POST | `/campaign-pro-settings/license` | POST Save License |
| POST | `/campaign-pro-settings/sms` | POST Save SMS Settings |
| PUT | `/campaign-pro-settings/managers/{id}` | PUT Update Manager |

### Public Bounce Handlers

Full schemas: [`fluentcrm/public-bounce.md`](./fluentcrm/public-bounce.md)

| Method | Path | Summary |
|--------|------|---------|
| POST | `/public/bounce_handler/{service_name}/{security_code}` | POST Handle Bounce |
| POST | `/public/bounce_handler/{service_name}/handle/{security_code}` | POST Handle Bounce (with /handle/ path) |

_Generated by `scripts/gen-api-docs.mjs` from the per-operation OpenAPI specs; endpoints marked (Pro) require the product's Pro version._
