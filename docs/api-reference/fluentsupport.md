# Fluent Support REST API reference

**Generated** by `scripts/gen-fluentsupport-docs.mjs` — do not edit by hand.

Fluent Support documents a subset of its REST API at
<https://fluentsupport.com/rest-api/> (no OpenAPI specs), so this inventory is
captured from the live route index (`GET /wp-json/fluent-support/v2`, free + Pro)
and named from the plugin's route files. Request/response body shapes are
documented upstream only for that subset: they mirror what the agent portal
sends, so read a record first (`detail:"full"`) and mirror its shape.

- Base URL: `https://{website}/wp-json/fluent-support/v2`
- Auth: WordPress Application Passwords over HTTP Basic (the official docs'
  recommended method; capability-checked per route policy). See
  [`api-reference/auth.md`](../auth.md).
- `customer-portal/*`, `me`, `options/countries`, `ticket_file_upload` and the
  `auth` group serve the customer portal (PortalPolicy): they act as the
  signed-in customer, and `signup`/`login`/`two_fa`/`reset_pass` check the
  portal's own nonce. `public/*` and `mail-piping/*` are token-authenticated
  receivers for external services. `ai/*`, `workflows`, `saved-replies`,
  `ticket-tags`, `agent-groups`, `advanced-reports`, `time-tracks`,
  `ticket-custom-fields`, scheduled replies, merge/split and the `pro/*`
  settings need Fluent Support Pro (404 without it).

## tickets

| Method | Path | Summary |
|---|---|---|
| GET | `/tickets` | List Tickets |
| POST | `/tickets` | Create Ticket (as an agent, on behalf of a customer) |
| GET | `/tickets/ping` | Ping the Support API |
| GET | `/tickets/sidebar-counts` | Get Ticket Sidebar Counts |
| GET | `/tickets/label-search` | List Saved Label Searches |
| POST | `/tickets/label-search` | Create or Update a Saved Label Search |
| DELETE | `/tickets/{label_search_id}/label-search` | Delete Saved Label Search |
| GET | `/tickets/{ticket_id}/mentionable-agents` | List Agents Mentionable on a Ticket |
| GET | `/tickets/{ticket_id}` | Get Ticket (with responses) |
| GET | `/tickets/{ticket_id}/widgets` | Get Ticket Sidebar Widgets |
| GET | `/tickets/{ticket_id}/live_activity` | Get Ticket Live Activity (who is viewing) |
| DELETE | `/tickets/{ticket_id}/live_activity` | Remove Own Live Activity from a Ticket |
| PUT | `/tickets/{ticket_id}/property` | Update a Ticket Property (status, priority, agent, product, …) |
| PUT | `/tickets/{ticket_id}/content` | Update Ticket Title and Content |
| POST | `/tickets/{ticket_id}/tags` | Add a Tag to a Ticket |
| DELETE | `/tickets/{ticket_id}/tags/{tag_id}` | Remove a Tag from a Ticket |
| POST | `/tickets/{ticket_id}/close` | Close Ticket |
| DELETE | `/tickets/{ticket_id}/delete` | Delete Ticket |
| POST | `/tickets/{ticket_id}/re-open` | Re-open Ticket |
| PUT | `/tickets/{ticket_id}/change-customer` | Change Ticket Customer |
| GET | `/tickets/{ticket_id}/custom-data` | Get Ticket Custom Field Data |
| GET | `/tickets/customer_tickets/{customer_id}` | List a Customer's Tickets |
| POST | `/tickets/{ticket_id}/sync-watchers` | Replace Ticket Watchers |
| POST | `/tickets/{ticket_id}/add_watchers` | Add Ticket Watchers |
| POST | `/tickets/{ticket_id}/merge_tickets` | Merge Tickets into This Ticket |
| POST | `/tickets/{ticket_id}/split_ticket` | Split a Response into a New Ticket |
| POST | `/tickets/bulk-actions` | Bulk Action Tickets (close, delete, reopen, assign, tag, priority, product) |
| POST | `/tickets/sync-fluentcrm-tags` | Sync FluentCRM Tags for Ticket Filters |
| POST | `/tickets/sync-fluentcrm-lists` | Sync FluentCRM Lists for Ticket Filters |
| GET | `/tickets/fluent-booking/event-types` | List FluentBooking Event Types |
| GET | `/tickets/{ticket_id}/fluent-booking/availability` | Get FluentBooking Availability for a Ticket |
| POST | `/tickets/{ticket_id}/fluent-booking/booking-link` | Create a FluentBooking Link for a Ticket |
| GET | `/tickets/{ticket_id}/fluent-booking/meetings` | List FluentBooking Meetings for a Ticket |
| GET | `/tickets/fluent-boards/boards` | List FluentBoards Boards |
| GET | `/tickets/fluent-boards/stages/{board_id}` | List FluentBoards Stages of a Board |
| POST | `/tickets/fluent-boards/stages` | Create a FluentBoards Task from a Ticket |
| GET | `/widgets` | List Ticket Sidebar Widgets |
| POST | `/ticket_file_upload` | Upload a Ticket Attachment (agent editor) |
| GET | `/ticket-custom-fields` | List Ticket Custom Fields |
| POST | `/ticket-custom-fields` | Save Ticket Custom Fields |
| POST | `/ticket-custom-fields/{ticket_id}/sync` | Sync a Ticket's Custom Field Values |
| GET | `/time-tracks/{ticket_id}` | List Time Tracks of a Ticket |
| POST | `/time-tracks/{ticket_id}` | Log Time on a Ticket |
| POST | `/time-tracks/{ticket_id}/estimated-time` | Set a Ticket's Estimated Time |

## responses

| Method | Path | Summary |
|---|---|---|
| POST | `/tickets/{ticket_id}/responses` | Reply to a Ticket (response or internal note) |
| PUT | `/tickets/{ticket_id}/responses/{response_id}` | Update a Response |
| DELETE | `/tickets/{ticket_id}/responses/{response_id}` | Delete a Response |
| POST | `/tickets/{ticket_id}/draft` | Create or Update the Draft Reply |
| GET | `/tickets/{ticket_id}/draft` | Get the Draft Reply |
| DELETE | `/tickets/{draft_id}/draft` | Delete a Draft Reply |
| PUT | `/tickets/{ticket_id}/approve_draft_response/{response_id}` | Approve and Send a Draft Response |
| PUT | `/tickets/{ticket_id}/scheduled_reply/{response_id}` | Update a Scheduled Reply |
| DELETE | `/tickets/{ticket_id}/scheduled_reply/{response_id}` | Delete a Scheduled Reply |
| POST | `/tickets/{ticket_id}/scheduled_reply/{response_id}/send_now` | Send a Scheduled Reply Now |
| POST | `/tickets/{ticket_id}/scheduled_reply/{response_id}/resume` | Resume a Paused Scheduled Reply |
| POST | `/tickets/bulk-reply` | Send One Reply to Many Tickets |

## saved-replies

| Method | Path | Summary |
|---|---|---|
| GET | `/saved-replies` | List Saved Replies |
| POST | `/saved-replies` | Create Saved Reply |
| GET | `/saved-replies/{id}` | Get Saved Reply |
| PUT | `/saved-replies/{id}` | Update Saved Reply |
| DELETE | `/saved-replies/{id}` | Delete Saved Reply |

## ai

| Method | Path | Summary |
|---|---|---|
| GET | `/ai/preset-prompts` | List AI Preset Prompts |
| POST | `/ai/{id}/generate-response` | Generate an AI Reply Draft for a Ticket |
| POST | `/ai/{id}/get-ticket-summary` | Get an AI Summary of a Ticket |
| POST | `/ai/{id}/get-ticket-tone` | Get the AI-detected Tone of a Ticket |

## customers

| Method | Path | Summary |
|---|---|---|
| GET | `/customers` | List Customers |
| POST | `/customers` | Create Customer |
| GET | `/customers/customerField/{customer_id}` | Get a Customer's Custom Fields |
| GET | `/customers/{customer_id}` | Get Customer |
| PUT | `/customers/{customer_id}` | Update Customer |
| DELETE | `/customers/{customer_id}` | Delete Customer |
| DELETE | `/customers/bulk-delete` | Bulk Delete Customers |
| PUT | `/customers/bulk-status` | Bulk Update Customer Status |
| POST | `/customers/profile_image/{customer_id}` | Upload a Customer's Avatar |
| POST | `/customers/reset_avatar/{customer}` | Reset a Customer's Avatar |
| GET | `/tickets/search-contact` | Search Contacts (for a new ticket) |

## agents

| Method | Path | Summary |
|---|---|---|
| GET | `/agents` | List Agents |
| POST | `/agents` | Create Agent (grants a WordPress user support-agent access) |
| PUT | `/agents/{agent_id}` | Update Agent (profile, role, permissions) |
| DELETE | `/agents/{agent_id}` | Delete Agent (reassigns their tickets to fallback_id) |
| POST | `/agents/avatar/{agent_id}` | Upload an Agent's Avatar |
| POST | `/agents/reset_avatar/{agent}` | Reset an Agent's Avatar |

## agent-groups

| Method | Path | Summary |
|---|---|---|
| GET | `/agent-groups` | List Agent Groups |
| POST | `/agent-groups` | Create Agent Group |
| GET | `/agent-groups/{group_id}` | Get Agent Group |
| PUT | `/agent-groups/{group_id}` | Update Agent Group |
| DELETE | `/agent-groups/{group_id}` | Delete Agent Group |

## notifications

| Method | Path | Summary |
|---|---|---|
| GET | `/notifications` | List the Current Agent's Notifications |
| GET | `/notifications/unread` | List Unread Notifications |
| GET | `/notifications/unread-count` | Get Unread Notification Count |
| POST | `/notifications/mark-all-read` | Mark All Notifications Read |
| POST | `/notifications/{notification_id}/mark-read` | Mark a Notification Read |

## mailboxes

| Method | Path | Summary |
|---|---|---|
| GET | `/mailboxes` | List Mailboxes (business inboxes) |
| POST | `/mailboxes` | Create Mailbox |
| GET | `/mailboxes/{id}` | Get Mailbox |
| PUT | `/mailboxes/{id}` | Update Mailbox |
| DELETE | `/mailboxes/{id}` | Delete Mailbox (moves its tickets to fallback_id) |
| PUT | `/mailboxes/{id}/move_tickets` | Move All of a Mailbox's Tickets to Another Mailbox |
| GET | `/mailboxes/{id}/tickets` | List a Mailbox's Tickets |
| GET | `/mailboxes/{id}/email_settings` | Get Mailbox Email Settings (one email_type) |
| PUT | `/mailboxes/{id}/email_settings` | Save Mailbox Email Settings |
| GET | `/mailboxes/{id}/email_configs` | Get Mailbox Email Notification Configs |
| PUT | `/mailboxes/{id}/set_default` | Set the Default Mailbox |
| GET | `/email-box/{box_id}/status` | Get Mailbox Email Piping Status |
| POST | `/email-box/{box_id}/issue-email` | Issue a Mailbox Piping Email Address |
| GET | `/mail-piping/{box_id}/push/{token}` | Mail Piping Push Endpoint (GET — webhook, token-authenticated) |
| POST | `/mail-piping/{box_id}/push/{token}` | Mail Piping Push Endpoint (POST — webhook, token-authenticated) |
| PUT | `/mail-piping/{box_id}/push/{token}` | Mail Piping Push Endpoint (PUT — webhook, token-authenticated) |
| PATCH | `/mail-piping/{box_id}/push/{token}` | Mail Piping Push Endpoint (PATCH — webhook, token-authenticated) |
| DELETE | `/mail-piping/{box_id}/push/{token}` | Mail Piping Push Endpoint (DELETE — webhook, token-authenticated) |

## workflows

| Method | Path | Summary |
|---|---|---|
| GET | `/workflows` | List Workflows |
| POST | `/workflows` | Create Workflow |
| GET | `/workflows/options` | Get Workflow Trigger, Condition and Action Options |
| GET | `/workflows/commerce-options` | Get Workflow Commerce (product) Options |
| POST | `/workflows/action-sequence` | Save a Workflow Action Sequence |
| POST | `/workflows/duplicate/{workflow_id}` | Duplicate Workflow |
| GET | `/workflows/{workflow_id}` | Get Workflow |
| POST | `/workflows/{workflow_id}` | Update Workflow |
| DELETE | `/workflows/{workflow_id}` | Delete Workflow |
| GET | `/workflows/{workflow_id}/actions` | List a Workflow's Actions |
| GET | `/workflows/{workflow_id}/runs` | List a Workflow's Runs |
| POST | `/workflows/{workflow_id}/run` | Run a Manual Workflow on Selected Tickets |

## reports

| Method | Path | Summary |
|---|---|---|
| GET | `/reports/stats` | Get Overall Ticket Stats |
| GET | `/reports/agents-summary` | Get Per-Agent Summary |
| GET | `/reports/day-time-stats` | Get Tickets by Day and Hour |
| GET | `/tickets/my_stats` | Get the Agent Dashboard Stats |
| GET | `/tickets/agent_performance` | Get Today's Agent Performance |

## my-reports

| Method | Path | Summary |
|---|---|---|
| GET | `/my-reports/tickets-resolve-growth` | Get Tickets Closed by the Current Agent |
| GET | `/my-reports/response-growth` | Get Replies by the Current Agent |
| GET | `/my-reports/my-summary` | Get the Current Agent's Summary |

## mailbox-reports

| Method | Path | Summary |
|---|---|---|
| GET | `/mailbox-reports/tickets-growth` | Get Ticket Growth |
| GET | `/mailbox-reports/tickets-resolve-growth` | Get Resolved Ticket Growth |
| GET | `/mailbox-reports/response-growth` | Get Response Growth |

## advanced-reports

| Method | Path | Summary |
|---|---|---|
| GET | `/advanced-reports/ticket-overview` | Get Ticket Overview Report |
| GET | `/advanced-reports/response-activity` | Get Response Activity Report |
| GET | `/advanced-reports/product-insights` | Get Product Insights Report |
| GET | `/advanced-reports/workload-health` | Get Workload Health Report |
| GET | `/advanced-reports/performance-overview/filters` | Get Performance Overview Filter Options |
| GET | `/advanced-reports/performance-overview` | Get Performance Overview Report |
| GET | `/advanced-reports/snapshots` | List Report Snapshots |
| GET | `/advanced-reports/snapshots/{id}` | Get a Report Snapshot |

## timesheet

| Method | Path | Summary |
|---|---|---|
| GET | `/reports/timesheet/by-tickets` | Get Timesheet by Ticket |
| GET | `/reports/timesheet/by-agents` | Get Timesheet by Agent |
| GET | `/reports/timesheet/by-customers` | Get Timesheet by Customer |

## activity-logger

| Method | Path | Summary |
|---|---|---|
| GET | `/activity-logger` | List Activity Log Entries |
| GET | `/ai-activity-logger` | List AI Activity Log Entries |

## products

| Method | Path | Summary |
|---|---|---|
| GET | `/products` | List Products |
| POST | `/products` | Create Product |
| GET | `/products/{product_id}` | Get Product |
| POST | `/products/{product_id}` | Save Product (create handler with an id) |
| PUT | `/products/{product_id}` | Update Product |
| DELETE | `/products/{product_id}` | Delete Product |

## ticket-tags

| Method | Path | Summary |
|---|---|---|
| GET | `/ticket-tags` | List Ticket Tags |
| POST | `/ticket-tags` | Create Ticket Tag |
| GET | `/ticket-tags/options` | List Ticket Tags as Options |
| GET | `/ticket-tags/{tag_id}` | Get Ticket Tag |
| PUT | `/ticket-tags/{tag_id}` | Update Ticket Tag |
| DELETE | `/ticket-tags/{tag_id}` | Delete Ticket Tag |

## settings

| Method | Path | Summary |
|---|---|---|
| GET | `/settings` | Get Settings (settings_key, with[]=fields) |
| POST | `/settings` | Save Settings |
| GET | `/settings/integration-settings` | Get Integration Settings Overview |
| GET | `/settings/integration` | Get One Integration's Settings |
| POST | `/settings/integration` | Save One Integration's Settings |
| GET | `/settings/pages` | List WordPress Pages (for the portal page setting) |
| POST | `/settings/setup` | Run the Portal Setup (creates the portal page) |
| POST | `/settings/setup-installation` | Run the Installation Setup Wizard Step |
| POST | `/settings/recaptcha-settings` | Save reCAPTCHA Settings |
| GET | `/settings/recaptcha-settings` | Get reCAPTCHA Settings |
| GET | `/settings/integration-statuses` | Get Integration Statuses |
| GET | `/settings/fluentcrm-settings` | Get FluentCRM Integration Settings |
| POST | `/settings/install-fluentcrm` | Install the FluentCRM Plugin |
| GET | `/settings/remote-upload-settings` | Get Remote Upload (cloud storage) Settings |
| POST | `/settings/update-remote-upload-driver` | Set the Remote Upload Driver |
| POST | `/settings/remote-upload-options` | Save Remote Upload Driver Options |
| POST | `/settings/remote-upload-retry` | Retry Failed Remote Uploads |
| GET | `/settings/ai-integration` | Get AI Provider Settings |
| POST | `/settings/ai-integration` | Save AI Provider Settings |
| GET | `/settings/settings-menu` | Get the Settings Menu |
| GET | `/settings/mcp` | Get Site-side MCP Adapter Status |
| POST | `/settings/mcp/toggle` | Enable or Disable the Site-side MCP Adapter |
| POST | `/settings/mcp/install-adapter` | Install the MCP Adapter Plugin |
| GET | `/settings/mcp/config-snippets` | Get MCP Client Config Snippets |
| GET | `/settings/incoming-webhook` | Get Incoming Webhook Settings |
| PUT | `/settings/incoming-webhook` | Save Incoming Webhook Settings |
| GET | `/settings/upload_integration` | Get Upload Integration Settings |
| POST | `/settings/upload_integration` | Save Upload Integration Settings |
| GET | `/settings/auto-close` | Get Auto-close Settings |
| POST | `/settings/auto-close` | Save Auto-close Settings |
| GET | `/settings/remote-portal` | Get Remote Portal Settings |
| POST | `/settings/remote-portal` | Save Remote Portal Settings |
| POST | `/settings/remote-portal/connection-key` | Generate a Remote Portal Connection Key |
| POST | `/settings/remote-portal/disconnect` | Disconnect the Remote Portal |
| POST | `/settings/remote-portal/test` | Test the Remote Portal Connection |
| GET | `/pro/license` | Get Pro License Status |
| POST | `/pro/license` | Activate Pro License |
| POST | `/pro/remove-license` | Remove Pro License |
| GET | `/pro/form-settings` | Get Ticket Form Settings |
| POST | `/pro/form-settings` | Save Ticket Form Settings |
| GET | `/activity-logger/settings` | Get Activity Logger Settings |
| POST | `/activity-logger/settings` | Save Activity Logger Settings |
| GET | `/ai-activity-logger/settings` | Get AI Activity Logger Settings |
| POST | `/ai-activity-logger/settings` | Save AI Activity Logger Settings |

## customer-portal

| Method | Path | Summary |
|---|---|---|
| GET | `/customer-portal/public_options` | Get Public Portal Options |
| GET | `/customer-portal/custom-fields-rendered` | Get Rendered Ticket Form Custom Fields |
| POST | `/customer-portal/logout` | Log the Portal Session Out |
| GET | `/customer-portal/me` | Get the Portal User |
| GET | `/customer-portal/tickets` | List the Customer's Own Tickets |
| POST | `/customer-portal/tickets` | Create a Ticket as the Customer |
| GET | `/customer-portal/tickets/{ticket_id}` | Get One of the Customer's Tickets |
| POST | `/customer-portal/tickets/{ticket_id}/responses` | Reply as the Customer |
| POST | `/customer-portal/tickets/{ticket_id}/close` | Close a Ticket as the Customer |
| POST | `/customer-portal/tickets/{ticket_id}/re-open` | Re-open a Ticket as the Customer |
| POST | `/customer-portal/tickets/{ticket_id}/agent-feedback` | Rate the Agent on a Ticket |
| POST | `/customer-portal/ticket_file_upload` | Upload a Ticket Attachment (portal) |
| GET | `/customer-portal/search-doc` | Search Help Docs from the Portal |
| GET | `/me` | Get the Current User |
| GET | `/options/countries` | List Countries |

## auth

| Method | Path | Summary |
|---|---|---|
| POST | `/signup` | Portal Sign-up |
| POST | `/login` | Portal Login |
| POST | `/two_fa` | Verify the Portal Login Code (2FA) |
| POST | `/reset_pass` | Portal Password Reset |

## remote-portal

| Method | Path | Summary |
|---|---|---|
| POST | `/remote-portal/connect` | Connect a Remote Portal |
| POST | `/remote-portal/rotate-token` | Rotate the Remote Portal Token |
| GET | `/remote-portal/ping` | Ping the Remote Portal |
| GET | `/remote-portal/portal-config` | Get the Remote Portal Config |
| POST | `/remote-portal/portal-url` | Set the Remote Portal URL |
| POST | `/remote-portal/test-widgets` | Test the Remote Portal Widgets |
| POST | `/remote-portal/disconnect` | Disconnect the Remote Portal Connection |

## system-tools

| Method | Path | Summary |
|---|---|---|
| GET | `/system-tools/rest-test` | REST Connectivity Test (GET) |
| POST | `/system-tools/rest-test` | REST Connectivity Test (POST) |
| PUT | `/system-tools/rest-test` | REST Connectivity Test (PUT) |
| PATCH | `/system-tools/rest-test` | REST Connectivity Test (PATCH) |
| DELETE | `/system-tools/rest-test` | REST Connectivity Test (DELETE) |
| GET | `/system-tools/cron` | List Scheduled Cron Events |
| POST | `/system-tools/cron/run` | Run the Support Cron Now |
| GET | `/system-tools/database` | Get Database Health |
| POST | `/system-tools/database/repair` | Repair Database Tables |
| GET | `/system-tools/cleanup` | Get Old Log Counts (cleanup preview) |
| DELETE | `/system-tools/cleanup` | Delete Old Logs |

## ticket-importer

| Method | Path | Summary |
|---|---|---|
| GET | `/ticket_importer` | Get Ticket Import Stats |
| POST | `/ticket_importer/import` | Import Tickets from Another Helpdesk |
| POST | `/ticket_importer/helpscout/token` | Save the Help Scout Import Token |
| DELETE | `/ticket_importer/delete` | Delete Imported Tickets of a Source |

## public

| Method | Path | Summary |
|---|---|---|
| POST | `/public/incoming_webhook/{token}` | Incoming Webhook Receiver (public, token-authenticated) |
| GET | `/public/dropbox_auth` | Dropbox OAuth Callback |
| GET | `/public/google_auth` | Google Drive OAuth Callback |
| GET | `/public/authorize` | Help Scout OAuth Callback |
| POST | `/public/telegram_bot_response/{token}` | Telegram Bot Reply Receiver (public, token-authenticated) |
| POST | `/public/slack_response/{token}` | Slack Reply Receiver (public, token-authenticated) |
| POST | `/public/twilio-response/{token}` | Twilio SMS Reply Receiver (public, token-authenticated) |

## audit

| Method | Path | Summary |
|---|---|---|
| POST | `/advanced-reports/audit/run` | Start a Report Data Audit |
| POST | `/advanced-reports/audit/process-batch` | Process the Next Audit Batch |
| GET | `/advanced-reports/audit/results` | Get Audit Results |
