#!/usr/bin/env node
/* Generate docs/api-reference/fluentsupport/endpoints.json (+ overview md)
   for Fluent Support.

   Fluent Support's REST reference (https://fluentsupport.com/rest-api/) is a
   single hand-written page covering ~60 of the plugin's routes, with no
   OpenAPI specs, so the inventory is captured from the live REST route index
   (`GET /wp-json/fluent-support/v2`, free + Pro) and curated here: groups,
   slugs and summaries come from the plugin's own route files
   (app/Http/Routes/api.php and app/Modules/<Module>/routes.php — controller
   and method names) and from the paths for Pro-only modules. The table is
   checked against the live index on every run — an unmapped live route or a
   stale table entry fails the run with the routes named, the same
   loud-on-drift contract the other generators have.

   Run: node scripts/gen-fluentsupport-docs.mjs [--site https://example.com]
   (defaults to FLUENT_SITE_URL; --offline skips the live check.) */
import fs from 'node:fs';

const NAMESPACE = 'fluent-support/v2';

/* [method, path, group, slug, summary]. Groups follow the plugin's route
   prefixes; the tool map folds them into 11 areas. */
const OPS = [

  // ---- tickets (TicketController; AgentTicketPolicy)
  ['GET', '/tickets', 'tickets', 'list-tickets', 'GET List Tickets'],
  ['POST', '/tickets', 'tickets', 'create-ticket', 'POST Create Ticket (as an agent, on behalf of a customer)'],
  ['GET', '/tickets/ping', 'tickets', 'ping', 'GET Ping the Support API'],
  ['GET', '/tickets/sidebar-counts', 'tickets', 'get-sidebar-counts', 'GET Get Ticket Sidebar Counts'],
  ['GET', '/tickets/label-search', 'tickets', 'list-label-searches', 'GET List Saved Label Searches'],
  ['POST', '/tickets/label-search', 'tickets', 'save-label-search', 'POST Create or Update a Saved Label Search'],
  ['DELETE', '/tickets/{label_search_id}/label-search', 'tickets', 'delete-label-search', 'DELETE Delete Saved Label Search'],
  ['GET', '/tickets/{ticket_id}/mentionable-agents', 'tickets', 'list-mentionable-agents', 'GET List Agents Mentionable on a Ticket'],
  ['GET', '/tickets/{ticket_id}', 'tickets', 'get-ticket', 'GET Get Ticket (with responses)'],
  ['GET', '/tickets/{ticket_id}/widgets', 'tickets', 'get-ticket-widgets', 'GET Get Ticket Sidebar Widgets'],
  ['GET', '/tickets/{ticket_id}/live_activity', 'tickets', 'get-ticket-live-activity', 'GET Get Ticket Live Activity (who is viewing)'],
  ['DELETE', '/tickets/{ticket_id}/live_activity', 'tickets', 'remove-ticket-live-activity', 'DELETE Remove Own Live Activity from a Ticket'],
  ['PUT', '/tickets/{ticket_id}/property', 'tickets', 'update-ticket-property', 'PUT Update a Ticket Property (status, priority, agent, product, …)'],
  ['PUT', '/tickets/{ticket_id}/content', 'tickets', 'update-ticket-content', 'PUT Update Ticket Title and Content'],
  ['POST', '/tickets/{ticket_id}/tags', 'tickets', 'add-ticket-tag', 'POST Add a Tag to a Ticket'],
  ['DELETE', '/tickets/{ticket_id}/tags/{tag_id}', 'tickets', 'remove-ticket-tag', 'DELETE Remove a Tag from a Ticket'],
  ['POST', '/tickets/{ticket_id}/close', 'tickets', 'close-ticket', 'POST Close Ticket'],
  ['DELETE', '/tickets/{ticket_id}/delete', 'tickets', 'delete-ticket', 'DELETE Delete Ticket'],
  ['POST', '/tickets/{ticket_id}/re-open', 'tickets', 'reopen-ticket', 'POST Re-open Ticket'],
  ['PUT', '/tickets/{ticket_id}/change-customer', 'tickets', 'change-ticket-customer', 'PUT Change Ticket Customer'],
  ['GET', '/tickets/{ticket_id}/custom-data', 'tickets', 'get-ticket-custom-data', 'GET Get Ticket Custom Field Data'],
  ['GET', '/tickets/customer_tickets/{customer_id}', 'tickets', 'list-customer-tickets', 'GET List a Customer\'s Tickets'],
  ['POST', '/tickets/{ticket_id}/sync-watchers', 'tickets', 'sync-ticket-watchers', 'POST Replace Ticket Watchers'],
  ['POST', '/tickets/{ticket_id}/add_watchers', 'tickets', 'add-ticket-watchers', 'POST Add Ticket Watchers'],
  ['POST', '/tickets/{ticket_id}/merge_tickets', 'tickets', 'merge-tickets', 'POST Merge Tickets into This Ticket'],
  ['POST', '/tickets/{ticket_id}/split_ticket', 'tickets', 'split-ticket', 'POST Split a Response into a New Ticket'],
  ['POST', '/tickets/bulk-actions', 'tickets', 'bulk-action-tickets', 'POST Bulk Action Tickets (close, delete, reopen, assign, tag, priority, product)'],
  ['POST', '/tickets/sync-fluentcrm-tags', 'tickets', 'sync-fluentcrm-tags', 'POST Sync FluentCRM Tags for Ticket Filters'],
  ['POST', '/tickets/sync-fluentcrm-lists', 'tickets', 'sync-fluentcrm-lists', 'POST Sync FluentCRM Lists for Ticket Filters'],
  ['GET', '/tickets/fluent-booking/event-types', 'tickets', 'list-booking-event-types', 'GET List FluentBooking Event Types'],
  ['GET', '/tickets/{ticket_id}/fluent-booking/availability', 'tickets', 'get-booking-availability', 'GET Get FluentBooking Availability for a Ticket'],
  ['POST', '/tickets/{ticket_id}/fluent-booking/booking-link', 'tickets', 'create-booking-link', 'POST Create a FluentBooking Link for a Ticket'],
  ['GET', '/tickets/{ticket_id}/fluent-booking/meetings', 'tickets', 'list-booking-meetings', 'GET List FluentBooking Meetings for a Ticket'],
  ['GET', '/tickets/fluent-boards/boards', 'tickets', 'list-boards', 'GET List FluentBoards Boards'],
  ['GET', '/tickets/fluent-boards/stages/{board_id}', 'tickets', 'list-board-stages', 'GET List FluentBoards Stages of a Board'],
  ['POST', '/tickets/fluent-boards/stages', 'tickets', 'create-board-task', 'POST Create a FluentBoards Task from a Ticket'],
  ['GET', '/widgets', 'tickets', 'list-widgets', 'GET List Ticket Sidebar Widgets'],
  ['POST', '/ticket_file_upload', 'tickets', 'upload-ticket-file', 'POST Upload a Ticket Attachment (agent editor)'],
  ['GET', '/ticket-custom-fields', 'tickets', 'list-ticket-custom-fields', 'GET List Ticket Custom Fields'],
  ['POST', '/ticket-custom-fields', 'tickets', 'save-ticket-custom-fields', 'POST Save Ticket Custom Fields'],
  ['POST', '/ticket-custom-fields/{ticket_id}/sync', 'tickets', 'sync-ticket-custom-fields', 'POST Sync a Ticket\'s Custom Field Values'],
  ['GET', '/time-tracks/{ticket_id}', 'tickets', 'list-time-tracks', 'GET List Time Tracks of a Ticket'],
  ['POST', '/time-tracks/{ticket_id}', 'tickets', 'create-time-track', 'POST Log Time on a Ticket'],
  ['POST', '/time-tracks/{ticket_id}/estimated-time', 'tickets', 'set-estimated-time', 'POST Set a Ticket\'s Estimated Time'],

  // ---- responses (ResponseController): replies, notes, drafts, scheduled and bulk replies
  ['POST', '/tickets/{ticket_id}/responses', 'responses', 'create-response', 'POST Reply to a Ticket (response or internal note)'],
  ['PUT', '/tickets/{ticket_id}/responses/{response_id}', 'responses', 'update-response', 'PUT Update a Response'],
  ['DELETE', '/tickets/{ticket_id}/responses/{response_id}', 'responses', 'delete-response', 'DELETE Delete a Response'],
  ['POST', '/tickets/{ticket_id}/draft', 'responses', 'save-draft', 'POST Create or Update the Draft Reply'],
  ['GET', '/tickets/{ticket_id}/draft', 'responses', 'get-draft', 'GET Get the Draft Reply'],
  ['DELETE', '/tickets/{draft_id}/draft', 'responses', 'delete-draft', 'DELETE Delete a Draft Reply'],
  ['PUT', '/tickets/{ticket_id}/approve_draft_response/{response_id}', 'responses', 'approve-draft-response', 'PUT Approve and Send a Draft Response'],
  ['PUT', '/tickets/{ticket_id}/scheduled_reply/{response_id}', 'responses', 'update-scheduled-reply', 'PUT Update a Scheduled Reply'],
  ['DELETE', '/tickets/{ticket_id}/scheduled_reply/{response_id}', 'responses', 'delete-scheduled-reply', 'DELETE Delete a Scheduled Reply'],
  ['POST', '/tickets/{ticket_id}/scheduled_reply/{response_id}/send_now', 'responses', 'send-scheduled-reply-now', 'POST Send a Scheduled Reply Now'],
  ['POST', '/tickets/{ticket_id}/scheduled_reply/{response_id}/resume', 'responses', 'resume-scheduled-reply', 'POST Resume a Paused Scheduled Reply'],
  ['POST', '/tickets/bulk-reply', 'responses', 'bulk-reply', 'POST Send One Reply to Many Tickets'],

  // ---- saved-replies
  ['GET', '/saved-replies', 'saved-replies', 'list-saved-replies', 'GET List Saved Replies'],
  ['POST', '/saved-replies', 'saved-replies', 'create-saved-reply', 'POST Create Saved Reply'],
  ['GET', '/saved-replies/{id}', 'saved-replies', 'get-saved-reply', 'GET Get Saved Reply'],
  ['PUT', '/saved-replies/{id}', 'saved-replies', 'update-saved-reply', 'PUT Update Saved Reply'],
  ['DELETE', '/saved-replies/{id}', 'saved-replies', 'delete-saved-reply', 'DELETE Delete Saved Reply'],

  // ---- ai (Pro): reply drafting from the configured AI provider
  ['GET', '/ai/preset-prompts', 'ai', 'list-preset-prompts', 'GET List AI Preset Prompts'],
  ['POST', '/ai/{id}/generate-response', 'ai', 'generate-response', 'POST Generate an AI Reply Draft for a Ticket'],
  ['POST', '/ai/{id}/get-ticket-summary', 'ai', 'get-ticket-summary', 'POST Get an AI Summary of a Ticket'],
  ['POST', '/ai/{id}/get-ticket-tone', 'ai', 'get-ticket-tone', 'POST Get the AI-detected Tone of a Ticket'],

  // ---- customers (CustomerController)
  ['GET', '/customers', 'customers', 'list-customers', 'GET List Customers'],
  ['POST', '/customers', 'customers', 'create-customer', 'POST Create Customer'],
  ['GET', '/customers/customerField/{customer_id}', 'customers', 'get-customer-fields', 'GET Get a Customer\'s Custom Fields'],
  ['GET', '/customers/{customer_id}', 'customers', 'get-customer', 'GET Get Customer'],
  ['PUT', '/customers/{customer_id}', 'customers', 'update-customer', 'PUT Update Customer'],
  ['DELETE', '/customers/{customer_id}', 'customers', 'delete-customer', 'DELETE Delete Customer'],
  ['DELETE', '/customers/bulk-delete', 'customers', 'bulk-delete-customers', 'DELETE Bulk Delete Customers'],
  ['PUT', '/customers/bulk-status', 'customers', 'bulk-update-customer-status', 'PUT Bulk Update Customer Status'],
  ['POST', '/customers/profile_image/{customer_id}', 'customers', 'upload-customer-avatar', 'POST Upload a Customer\'s Avatar'],
  ['POST', '/customers/reset_avatar/{customer}', 'customers', 'reset-customer-avatar', 'POST Reset a Customer\'s Avatar'],
  ['GET', '/tickets/search-contact', 'customers', 'search-contact', 'GET Search Contacts (for a new ticket)'],

  // ---- agents (AgentController), agent-groups, notifications
  ['GET', '/agents', 'agents', 'list-agents', 'GET List Agents'],
  ['POST', '/agents', 'agents', 'create-agent', 'POST Create Agent (grants a WordPress user support-agent access)'],
  ['PUT', '/agents/{agent_id}', 'agents', 'update-agent', 'PUT Update Agent (profile, role, permissions)'],
  ['DELETE', '/agents/{agent_id}', 'agents', 'delete-agent', 'DELETE Delete Agent (reassigns their tickets to fallback_id)'],
  ['POST', '/agents/avatar/{agent_id}', 'agents', 'upload-agent-avatar', 'POST Upload an Agent\'s Avatar'],
  ['POST', '/agents/reset_avatar/{agent}', 'agents', 'reset-agent-avatar', 'POST Reset an Agent\'s Avatar'],
  ['GET', '/agent-groups', 'agent-groups', 'list-agent-groups', 'GET List Agent Groups'],
  ['POST', '/agent-groups', 'agent-groups', 'create-agent-group', 'POST Create Agent Group'],
  ['GET', '/agent-groups/{group_id}', 'agent-groups', 'get-agent-group', 'GET Get Agent Group'],
  ['PUT', '/agent-groups/{group_id}', 'agent-groups', 'update-agent-group', 'PUT Update Agent Group'],
  ['DELETE', '/agent-groups/{group_id}', 'agent-groups', 'delete-agent-group', 'DELETE Delete Agent Group'],
  ['GET', '/notifications', 'notifications', 'list-notifications', 'GET List the Current Agent\'s Notifications'],
  ['GET', '/notifications/unread', 'notifications', 'list-unread-notifications', 'GET List Unread Notifications'],
  ['GET', '/notifications/unread-count', 'notifications', 'get-unread-notification-count', 'GET Get Unread Notification Count'],
  ['POST', '/notifications/mark-all-read', 'notifications', 'mark-all-notifications-read', 'POST Mark All Notifications Read'],
  ['POST', '/notifications/{notification_id}/mark-read', 'notifications', 'mark-notification-read', 'POST Mark a Notification Read'],

  // ---- mailboxes (MailBoxController), email-box status, mail piping
  ['GET', '/mailboxes', 'mailboxes', 'list-mailboxes', 'GET List Mailboxes (business inboxes)'],
  ['POST', '/mailboxes', 'mailboxes', 'create-mailbox', 'POST Create Mailbox'],
  ['GET', '/mailboxes/{id}', 'mailboxes', 'get-mailbox', 'GET Get Mailbox'],
  ['PUT', '/mailboxes/{id}', 'mailboxes', 'update-mailbox', 'PUT Update Mailbox'],
  ['DELETE', '/mailboxes/{id}', 'mailboxes', 'delete-mailbox', 'DELETE Delete Mailbox (moves its tickets to fallback_id)'],
  ['PUT', '/mailboxes/{id}/move_tickets', 'mailboxes', 'move-mailbox-tickets', 'PUT Move All of a Mailbox\'s Tickets to Another Mailbox'],
  ['GET', '/mailboxes/{id}/tickets', 'mailboxes', 'list-mailbox-tickets', 'GET List a Mailbox\'s Tickets'],
  ['GET', '/mailboxes/{id}/email_settings', 'mailboxes', 'get-mailbox-email-settings', 'GET Get Mailbox Email Settings (one email_type)'],
  ['PUT', '/mailboxes/{id}/email_settings', 'mailboxes', 'save-mailbox-email-settings', 'PUT Save Mailbox Email Settings'],
  ['GET', '/mailboxes/{id}/email_configs', 'mailboxes', 'get-mailbox-email-configs', 'GET Get Mailbox Email Notification Configs'],
  ['PUT', '/mailboxes/{id}/set_default', 'mailboxes', 'set-default-mailbox', 'PUT Set the Default Mailbox'],
  ['GET', '/email-box/{box_id}/status', 'mailboxes', 'get-email-box-status', 'GET Get Mailbox Email Piping Status'],
  ['POST', '/email-box/{box_id}/issue-email', 'mailboxes', 'issue-email-box-email', 'POST Issue a Mailbox Piping Email Address'],
  ['GET', '/mail-piping/{box_id}/push/{token}', 'mailboxes', 'receive-piped-mail-get', 'GET Mail Piping Push Endpoint (GET — webhook, token-authenticated)'],
  ['POST', '/mail-piping/{box_id}/push/{token}', 'mailboxes', 'receive-piped-mail-post', 'POST Mail Piping Push Endpoint (POST — webhook, token-authenticated)'],
  ['PUT', '/mail-piping/{box_id}/push/{token}', 'mailboxes', 'receive-piped-mail-put', 'PUT Mail Piping Push Endpoint (PUT — webhook, token-authenticated)'],
  ['PATCH', '/mail-piping/{box_id}/push/{token}', 'mailboxes', 'receive-piped-mail-patch', 'PATCH Mail Piping Push Endpoint (PATCH — webhook, token-authenticated)'],
  ['DELETE', '/mail-piping/{box_id}/push/{token}', 'mailboxes', 'receive-piped-mail-delete', 'DELETE Mail Piping Push Endpoint (DELETE — webhook, token-authenticated)'],

  // ---- workflows (Pro)
  ['GET', '/workflows', 'workflows', 'list-workflows', 'GET List Workflows'],
  ['POST', '/workflows', 'workflows', 'create-workflow', 'POST Create Workflow'],
  ['GET', '/workflows/options', 'workflows', 'get-workflow-options', 'GET Get Workflow Trigger, Condition and Action Options'],
  ['GET', '/workflows/commerce-options', 'workflows', 'get-workflow-commerce-options', 'GET Get Workflow Commerce (product) Options'],
  ['POST', '/workflows/action-sequence', 'workflows', 'save-workflow-action-sequence', 'POST Save a Workflow Action Sequence'],
  ['POST', '/workflows/duplicate/{workflow_id}', 'workflows', 'duplicate-workflow', 'POST Duplicate Workflow'],
  ['GET', '/workflows/{workflow_id}', 'workflows', 'get-workflow', 'GET Get Workflow'],
  ['POST', '/workflows/{workflow_id}', 'workflows', 'update-workflow', 'POST Update Workflow'],
  ['DELETE', '/workflows/{workflow_id}', 'workflows', 'delete-workflow', 'DELETE Delete Workflow'],
  ['GET', '/workflows/{workflow_id}/actions', 'workflows', 'list-workflow-actions', 'GET List a Workflow\'s Actions'],
  ['GET', '/workflows/{workflow_id}/runs', 'workflows', 'list-workflow-runs', 'GET List a Workflow\'s Runs'],
  ['POST', '/workflows/{workflow_id}/run', 'workflows', 'run-workflow', 'POST Run a Manual Workflow on Selected Tickets'],

  // ---- reports (read-only): ReportController, mailbox and advanced reports, timesheets, activity logs
  ['GET', '/reports/stats', 'reports', 'get-stats', 'GET Get Overall Ticket Stats'],
  ['GET', '/reports/agents-summary', 'reports', 'get-agents-summary', 'GET Get Per-Agent Summary'],
  ['GET', '/reports/day-time-stats', 'reports', 'get-day-time-stats', 'GET Get Tickets by Day and Hour'],
  ['GET', '/tickets/my_stats', 'reports', 'get-dashboard-stats', 'GET Get the Agent Dashboard Stats'],
  ['GET', '/tickets/agent_performance', 'reports', 'get-agent-performance-today', 'GET Get Today\'s Agent Performance'],
  ['GET', '/my-reports/tickets-resolve-growth', 'my-reports', 'get-my-resolve-growth', 'GET Get Tickets Closed by the Current Agent'],
  ['GET', '/my-reports/response-growth', 'my-reports', 'get-my-response-growth', 'GET Get Replies by the Current Agent'],
  ['GET', '/my-reports/my-summary', 'my-reports', 'get-my-summary', 'GET Get the Current Agent\'s Summary'],
  ['GET', '/mailbox-reports/tickets-growth', 'mailbox-reports', 'get-tickets-growth', 'GET Get Ticket Growth'],
  ['GET', '/mailbox-reports/tickets-resolve-growth', 'mailbox-reports', 'get-tickets-resolve-growth', 'GET Get Resolved Ticket Growth'],
  ['GET', '/mailbox-reports/response-growth', 'mailbox-reports', 'get-response-growth', 'GET Get Response Growth'],
  ['GET', '/advanced-reports/ticket-overview', 'advanced-reports', 'get-ticket-overview', 'GET Get Ticket Overview Report'],
  ['GET', '/advanced-reports/response-activity', 'advanced-reports', 'get-response-activity', 'GET Get Response Activity Report'],
  ['GET', '/advanced-reports/product-insights', 'advanced-reports', 'get-product-insights', 'GET Get Product Insights Report'],
  ['GET', '/advanced-reports/workload-health', 'advanced-reports', 'get-workload-health', 'GET Get Workload Health Report'],
  ['GET', '/advanced-reports/performance-overview/filters', 'advanced-reports', 'get-performance-overview-filters', 'GET Get Performance Overview Filter Options'],
  ['GET', '/advanced-reports/performance-overview', 'advanced-reports', 'get-performance-overview', 'GET Get Performance Overview Report'],
  ['GET', '/advanced-reports/snapshots', 'advanced-reports', 'list-snapshots', 'GET List Report Snapshots'],
  ['GET', '/advanced-reports/snapshots/{id}', 'advanced-reports', 'get-snapshot', 'GET Get a Report Snapshot'],
  ['GET', '/reports/timesheet/by-tickets', 'timesheet', 'get-timesheet-by-tickets', 'GET Get Timesheet by Ticket'],
  ['GET', '/reports/timesheet/by-agents', 'timesheet', 'get-timesheet-by-agents', 'GET Get Timesheet by Agent'],
  ['GET', '/reports/timesheet/by-customers', 'timesheet', 'get-timesheet-by-customers', 'GET Get Timesheet by Customer'],
  ['GET', '/activity-logger', 'activity-logger', 'list-activities', 'GET List Activity Log Entries'],
  ['GET', '/ai-activity-logger', 'activity-logger', 'list-ai-activities', 'GET List AI Activity Log Entries'],

  // ---- products, ticket tags
  ['GET', '/products', 'products', 'list-products', 'GET List Products'],
  ['POST', '/products', 'products', 'create-product', 'POST Create Product'],
  ['GET', '/products/{product_id}', 'products', 'get-product', 'GET Get Product'],
  ['POST', '/products/{product_id}', 'products', 'save-product', 'POST Save Product (create handler with an id)'],
  ['PUT', '/products/{product_id}', 'products', 'update-product', 'PUT Update Product'],
  ['DELETE', '/products/{product_id}', 'products', 'delete-product', 'DELETE Delete Product'],
  ['GET', '/ticket-tags', 'ticket-tags', 'list-ticket-tags', 'GET List Ticket Tags'],
  ['POST', '/ticket-tags', 'ticket-tags', 'create-ticket-tag', 'POST Create Ticket Tag'],
  ['GET', '/ticket-tags/options', 'ticket-tags', 'list-ticket-tag-options', 'GET List Ticket Tags as Options'],
  ['GET', '/ticket-tags/{tag_id}', 'ticket-tags', 'get-ticket-tag', 'GET Get Ticket Tag'],
  ['PUT', '/ticket-tags/{tag_id}', 'ticket-tags', 'update-ticket-tag', 'PUT Update Ticket Tag'],
  ['DELETE', '/ticket-tags/{tag_id}', 'ticket-tags', 'delete-ticket-tag', 'DELETE Delete Ticket Tag'],

  // ---- settings (SettingsController, IntegrationController, McpSettingsController; Pro settings)
  ['GET', '/settings', 'settings', 'get-settings', 'GET Get Settings (settings_key, with[]=fields)'],
  ['POST', '/settings', 'settings', 'save-settings', 'POST Save Settings'],
  ['GET', '/settings/integration-settings', 'settings', 'get-integration-settings', 'GET Get Integration Settings Overview'],
  ['GET', '/settings/integration', 'settings', 'get-integration', 'GET Get One Integration\'s Settings'],
  ['POST', '/settings/integration', 'settings', 'save-integration', 'POST Save One Integration\'s Settings'],
  ['GET', '/settings/pages', 'settings', 'list-pages', 'GET List WordPress Pages (for the portal page setting)'],
  ['POST', '/settings/setup', 'settings', 'setup-portal', 'POST Run the Portal Setup (creates the portal page)'],
  ['POST', '/settings/setup-installation', 'settings', 'setup-installation', 'POST Run the Installation Setup Wizard Step'],
  ['POST', '/settings/recaptcha-settings', 'settings', 'save-recaptcha-settings', 'POST Save reCAPTCHA Settings'],
  ['GET', '/settings/recaptcha-settings', 'settings', 'get-recaptcha-settings', 'GET Get reCAPTCHA Settings'],
  ['GET', '/settings/integration-statuses', 'settings', 'get-integration-statuses', 'GET Get Integration Statuses'],
  ['GET', '/settings/fluentcrm-settings', 'settings', 'get-fluentcrm-settings', 'GET Get FluentCRM Integration Settings'],
  ['POST', '/settings/install-fluentcrm', 'settings', 'install-fluentcrm', 'POST Install the FluentCRM Plugin'],
  ['GET', '/settings/remote-upload-settings', 'settings', 'get-remote-upload-settings', 'GET Get Remote Upload (cloud storage) Settings'],
  ['POST', '/settings/update-remote-upload-driver', 'settings', 'update-remote-upload-driver', 'POST Set the Remote Upload Driver'],
  ['POST', '/settings/remote-upload-options', 'settings', 'update-remote-upload-options', 'POST Save Remote Upload Driver Options'],
  ['POST', '/settings/remote-upload-retry', 'settings', 'retry-remote-uploads', 'POST Retry Failed Remote Uploads'],
  ['GET', '/settings/ai-integration', 'settings', 'get-ai-integration', 'GET Get AI Provider Settings'],
  ['POST', '/settings/ai-integration', 'settings', 'save-ai-integration', 'POST Save AI Provider Settings'],
  ['GET', '/settings/settings-menu', 'settings', 'get-settings-menu', 'GET Get the Settings Menu'],
  ['GET', '/settings/mcp', 'settings', 'get-mcp-status', 'GET Get Site-side MCP Adapter Status'],
  ['POST', '/settings/mcp/toggle', 'settings', 'toggle-mcp', 'POST Enable or Disable the Site-side MCP Adapter'],
  ['POST', '/settings/mcp/install-adapter', 'settings', 'install-mcp-adapter', 'POST Install the MCP Adapter Plugin'],
  ['GET', '/settings/mcp/config-snippets', 'settings', 'get-mcp-config-snippets', 'GET Get MCP Client Config Snippets'],
  ['GET', '/settings/incoming-webhook', 'settings', 'get-incoming-webhook', 'GET Get Incoming Webhook Settings'],
  ['PUT', '/settings/incoming-webhook', 'settings', 'save-incoming-webhook', 'PUT Save Incoming Webhook Settings'],
  ['GET', '/settings/upload_integration', 'settings', 'get-upload-integration', 'GET Get Upload Integration Settings'],
  ['POST', '/settings/upload_integration', 'settings', 'save-upload-integration', 'POST Save Upload Integration Settings'],
  ['GET', '/settings/auto-close', 'settings', 'get-auto-close', 'GET Get Auto-close Settings'],
  ['POST', '/settings/auto-close', 'settings', 'save-auto-close', 'POST Save Auto-close Settings'],
  ['GET', '/settings/remote-portal', 'settings', 'get-remote-portal-settings', 'GET Get Remote Portal Settings'],
  ['POST', '/settings/remote-portal', 'settings', 'save-remote-portal-settings', 'POST Save Remote Portal Settings'],
  ['POST', '/settings/remote-portal/connection-key', 'settings', 'create-remote-portal-connection-key', 'POST Generate a Remote Portal Connection Key'],
  ['POST', '/settings/remote-portal/disconnect', 'settings', 'disconnect-remote-portal', 'POST Disconnect the Remote Portal'],
  ['POST', '/settings/remote-portal/test', 'settings', 'test-remote-portal', 'POST Test the Remote Portal Connection'],
  ['GET', '/pro/license', 'settings', 'get-license', 'GET Get Pro License Status'],
  ['POST', '/pro/license', 'settings', 'activate-license', 'POST Activate Pro License'],
  ['POST', '/pro/remove-license', 'settings', 'remove-license', 'POST Remove Pro License'],
  ['GET', '/pro/form-settings', 'settings', 'get-form-settings', 'GET Get Ticket Form Settings'],
  ['POST', '/pro/form-settings', 'settings', 'save-form-settings', 'POST Save Ticket Form Settings'],
  ['GET', '/activity-logger/settings', 'settings', 'get-activity-logger-settings', 'GET Get Activity Logger Settings'],
  ['POST', '/activity-logger/settings', 'settings', 'save-activity-logger-settings', 'POST Save Activity Logger Settings'],
  ['GET', '/ai-activity-logger/settings', 'settings', 'get-ai-activity-logger-settings', 'GET Get AI Activity Logger Settings'],
  ['POST', '/ai-activity-logger/settings', 'settings', 'save-ai-activity-logger-settings', 'POST Save AI Activity Logger Settings'],

  // ---- portal: customer portal (PortalPolicy — customer session), portal auth, remote portal
  ['GET', '/customer-portal/public_options', 'customer-portal', 'get-public-options', 'GET Get Public Portal Options'],
  ['GET', '/customer-portal/custom-fields-rendered', 'customer-portal', 'get-rendered-custom-fields', 'GET Get Rendered Ticket Form Custom Fields'],
  ['POST', '/customer-portal/logout', 'customer-portal', 'logout', 'POST Log the Portal Session Out'],
  ['GET', '/customer-portal/me', 'customer-portal', 'get-portal-me', 'GET Get the Portal User'],
  ['GET', '/customer-portal/tickets', 'customer-portal', 'list-portal-tickets', 'GET List the Customer\'s Own Tickets'],
  ['POST', '/customer-portal/tickets', 'customer-portal', 'create-portal-ticket', 'POST Create a Ticket as the Customer'],
  ['GET', '/customer-portal/tickets/{ticket_id}', 'customer-portal', 'get-portal-ticket', 'GET Get One of the Customer\'s Tickets'],
  ['POST', '/customer-portal/tickets/{ticket_id}/responses', 'customer-portal', 'reply-portal-ticket', 'POST Reply as the Customer'],
  ['POST', '/customer-portal/tickets/{ticket_id}/close', 'customer-portal', 'close-portal-ticket', 'POST Close a Ticket as the Customer'],
  ['POST', '/customer-portal/tickets/{ticket_id}/re-open', 'customer-portal', 'reopen-portal-ticket', 'POST Re-open a Ticket as the Customer'],
  ['POST', '/customer-portal/tickets/{ticket_id}/agent-feedback', 'customer-portal', 'rate-agent', 'POST Rate the Agent on a Ticket'],
  ['POST', '/customer-portal/ticket_file_upload', 'customer-portal', 'upload-portal-ticket-file', 'POST Upload a Ticket Attachment (portal)'],
  ['GET', '/customer-portal/search-doc', 'customer-portal', 'search-docs', 'GET Search Help Docs from the Portal'],
  ['GET', '/me', 'customer-portal', 'get-me', 'GET Get the Current User'],
  ['GET', '/options/countries', 'customer-portal', 'list-countries', 'GET List Countries'],
  ['POST', '/signup', 'auth', 'signup', 'POST Portal Sign-up'],
  ['POST', '/login', 'auth', 'login', 'POST Portal Login'],
  ['POST', '/two_fa', 'auth', 'verify-login-code', 'POST Verify the Portal Login Code (2FA)'],
  ['POST', '/reset_pass', 'auth', 'reset-password', 'POST Portal Password Reset'],
  ['POST', '/remote-portal/connect', 'remote-portal', 'connect-remote-portal', 'POST Connect a Remote Portal'],
  ['POST', '/remote-portal/rotate-token', 'remote-portal', 'rotate-remote-portal-token', 'POST Rotate the Remote Portal Token'],
  ['GET', '/remote-portal/ping', 'remote-portal', 'ping-remote-portal', 'GET Ping the Remote Portal'],
  ['GET', '/remote-portal/portal-config', 'remote-portal', 'get-remote-portal-config', 'GET Get the Remote Portal Config'],
  ['POST', '/remote-portal/portal-url', 'remote-portal', 'set-remote-portal-url', 'POST Set the Remote Portal URL'],
  ['POST', '/remote-portal/test-widgets', 'remote-portal', 'test-remote-portal-widgets', 'POST Test the Remote Portal Widgets'],
  ['POST', '/remote-portal/disconnect', 'remote-portal', 'disconnect-remote-portal-connection', 'POST Disconnect the Remote Portal Connection'],

  // ---- utilities: system tools, ticket importer, public webhooks and OAuth callbacks, report audits
  ['GET', '/system-tools/rest-test', 'system-tools', 'rest-test-get', 'GET REST Connectivity Test (GET)'],
  ['POST', '/system-tools/rest-test', 'system-tools', 'rest-test-post', 'POST REST Connectivity Test (POST)'],
  ['PUT', '/system-tools/rest-test', 'system-tools', 'rest-test-put', 'PUT REST Connectivity Test (PUT)'],
  ['PATCH', '/system-tools/rest-test', 'system-tools', 'rest-test-patch', 'PATCH REST Connectivity Test (PATCH)'],
  ['DELETE', '/system-tools/rest-test', 'system-tools', 'rest-test-delete', 'DELETE REST Connectivity Test (DELETE)'],
  ['GET', '/system-tools/cron', 'system-tools', 'list-cron-events', 'GET List Scheduled Cron Events'],
  ['POST', '/system-tools/cron/run', 'system-tools', 'run-cron', 'POST Run the Support Cron Now'],
  ['GET', '/system-tools/database', 'system-tools', 'get-database-health', 'GET Get Database Health'],
  ['POST', '/system-tools/database/repair', 'system-tools', 'repair-database', 'POST Repair Database Tables'],
  ['GET', '/system-tools/cleanup', 'system-tools', 'get-cleanup-counts', 'GET Get Old Log Counts (cleanup preview)'],
  ['DELETE', '/system-tools/cleanup', 'system-tools', 'delete-old-logs', 'DELETE Delete Old Logs'],
  ['GET', '/ticket_importer', 'ticket-importer', 'get-import-stats', 'GET Get Ticket Import Stats'],
  ['POST', '/ticket_importer/import', 'ticket-importer', 'import-tickets', 'POST Import Tickets from Another Helpdesk'],
  ['POST', '/ticket_importer/helpscout/token', 'ticket-importer', 'save-helpscout-token', 'POST Save the Help Scout Import Token'],
  ['DELETE', '/ticket_importer/delete', 'ticket-importer', 'delete-imported-tickets', 'DELETE Delete Imported Tickets of a Source'],
  ['POST', '/public/incoming_webhook/{token}', 'public', 'receive-incoming-webhook', 'POST Incoming Webhook Receiver (public, token-authenticated)'],
  ['GET', '/public/dropbox_auth', 'public', 'dropbox-auth-callback', 'GET Dropbox OAuth Callback'],
  ['GET', '/public/google_auth', 'public', 'google-auth-callback', 'GET Google Drive OAuth Callback'],
  ['GET', '/public/authorize', 'public', 'helpscout-auth-callback', 'GET Help Scout OAuth Callback'],
  ['POST', '/public/telegram_bot_response/{token}', 'public', 'telegram-bot-response', 'POST Telegram Bot Reply Receiver (public, token-authenticated)'],
  ['POST', '/public/slack_response/{token}', 'public', 'slack-response', 'POST Slack Reply Receiver (public, token-authenticated)'],
  ['POST', '/public/twilio-response/{token}', 'public', 'twilio-response', 'POST Twilio SMS Reply Receiver (public, token-authenticated)'],
  ['POST', '/advanced-reports/audit/run', 'audit', 'run-audit', 'POST Start a Report Data Audit'],
  ['POST', '/advanced-reports/audit/process-batch', 'audit', 'process-audit-batch', 'POST Process the Next Audit Batch'],
  ['GET', '/advanced-reports/audit/results', 'audit', 'get-audit-results', 'GET Get Audit Results'],
];

const args = process.argv.slice(2);
const offline = args.includes('--offline');
const siteArg = args.indexOf('--site');
const site = siteArg >= 0 ? args[siteArg + 1] : process.env.FLUENT_SITE_URL;

const key = (m, p) => `${m} ${p}`;
const table = new Map(OPS.map(([m, p]) => [key(m, p), true]));
if (OPS.length !== table.size) throw new Error('OPS table has duplicate method+path entries');
if (new Set(OPS.map(([, , g, s]) => `${g}/${s}`)).size !== OPS.length) {
  throw new Error('OPS table has duplicate group/slug pairs');
}

if (!offline) {
  if (!site) {
    console.error('No site to check against — pass --site https://… or set FLUENT_SITE_URL (or use --offline).');
    process.exit(1);
  }
  const res = await fetch(`${site.replace(/\/+$/, '')}/wp-json/${NAMESPACE}`);
  if (!res.ok) throw new Error(`route index fetch failed: HTTP ${res.status}`);
  const index = await res.json();
  const live = new Set();
  for (const [routePath, route] of Object.entries(index.routes ?? {})) {
    const rel = routePath.replace(`/${NAMESPACE}`, '');
    if (!rel) continue;
    const template = rel.replace(/\(\?P<(\w+)>(?:\[[^\]]*\]|[^)])*\)/g, '{$1}');
    for (const ep of route.endpoints ?? []) {
      for (const method of ep.methods ?? []) live.add(key(method, template));
    }
  }
  const missing = [...live].filter((k) => !table.has(k));
  const stale = [...table.keys()].filter((k) => !live.has(k));
  if (missing.length || stale.length) {
    for (const k of missing) console.error(`LIVE ROUTE NOT IN TABLE: ${k}`);
    for (const k of stale) console.error(`TABLE ENTRY NOT SERVED LIVE: ${k}`);
    console.error(`\n${missing.length} unmapped live route(s), ${stale.length} stale table entr(ies) — update OPS in this script.`);
    process.exit(1);
  }
  console.log(`live check ok — ${live.size} operations match the table`);
}

const camel = (s) => s.replace(/-(\w)/g, (_, c) => c.toUpperCase());
const today = new Date().toISOString().slice(0, 10);
const outDir = 'docs/api-reference/fluentsupport';
fs.mkdirSync(outDir, { recursive: true });
const existing = fs.existsSync(`${outDir}/endpoints.json`)
  ? JSON.parse(fs.readFileSync(`${outDir}/endpoints.json`, 'utf8'))
  : undefined;

const inventory = {
  product: 'fluentsupport',
  source: 'live REST route index (GET /wp-json/fluent-support/v2, free + Pro), named from the plugin route files; https://fluentsupport.com/rest-api/ documents a subset',
  scraped: today,
  baseUrl: `https://{website}/wp-json/${NAMESPACE}`,
  namespace: NAMESPACE,
  count: OPS.length,
  endpoints: OPS.map(([method, path, group, slug, summary]) => ({
    group,
    slug,
    operationId: camel(slug),
    method,
    path,
    summary,
    security: ['ApplicationPasswords'],
    deprecated: false,
  })),
};
const unchanged =
  existing && JSON.stringify({ ...existing, scraped: '' }) === JSON.stringify({ ...inventory, scraped: '' });
if (unchanged) {
  console.log(`${outDir}/endpoints.json unchanged (${OPS.length} operations) — not restamped`);
} else {
  fs.writeFileSync(`${outDir}/endpoints.json`, JSON.stringify(inventory, null, 2) + '\n');
  console.log(`${outDir}/endpoints.json written (${OPS.length} operations)`);
}

const groups = [...new Set(OPS.map(([, , g]) => g))];
const lines = [
  '# Fluent Support REST API reference',
  '',
  '**Generated** by `scripts/gen-fluentsupport-docs.mjs` — do not edit by hand.',
  '',
  'Fluent Support documents a subset of its REST API at',
  '<https://fluentsupport.com/rest-api/> (no OpenAPI specs), so this inventory is',
  `captured from the live route index (\`GET /wp-json/${NAMESPACE}\`, free + Pro)`,
  'and named from the plugin\'s route files. Request/response body shapes are',
  'documented upstream only for that subset: they mirror what the agent portal',
  'sends, so read a record first (`detail:"full"`) and mirror its shape.',
  '',
  `- Base URL: \`https://{website}/wp-json/${NAMESPACE}\``,
  '- Auth: WordPress Application Passwords over HTTP Basic (the official docs\'',
  '  recommended method; capability-checked per route policy). See',
  '  [`api-reference/auth.md`](../auth.md).',
  '- `customer-portal/*`, `me`, `options/countries`, `ticket_file_upload` and the',
  '  `auth` group serve the customer portal (PortalPolicy): they act as the',
  '  signed-in customer, and `signup`/`login`/`two_fa`/`reset_pass` check the',
  '  portal\'s own nonce. `public/*` and `mail-piping/*` are token-authenticated',
  '  receivers for external services. `ai/*`, `workflows`, `saved-replies`,',
  '  `ticket-tags`, `agent-groups`, `advanced-reports`, `time-tracks`,',
  '  `ticket-custom-fields`, scheduled replies, merge/split and the `pro/*`',
  '  settings need Fluent Support Pro (404 without it).',
  '',
];
for (const g of groups) {
  lines.push(`## ${g}`, '', '| Method | Path | Summary |', '|---|---|---|');
  for (const [method, path, group, , summary] of OPS) {
    if (group === g) lines.push(`| ${method} | \`${path}\` | ${summary.replace(/^(GET|POST|PUT|PATCH|DELETE)\s+/, '')} |`);
  }
  lines.push('');
}
fs.writeFileSync('docs/api-reference/fluentsupport.md', lines.join('\n'));
console.log('docs/api-reference/fluentsupport.md written');
