# Fluent Forms REST API reference

**Generated** by `scripts/gen-fluentforms-docs.mjs` — do not edit by hand.

Fluent Forms publishes an auto-extracted route reference at
<https://developers.fluentforms.com/api/endpoints/> but no OpenAPI specs, so this
inventory is curated from that reference plus the plugin source and reconciled
against the live route index (`GET /wp-json/fluentform/v1`) on every run.
Request/response body shapes are not published upstream: they mirror what the
wp-admin UI sends, so read a record first (`detail:"full"`) and mirror its shape.

- Base URL: `https://{website}/wp-json/fluentform/v1`
- Auth: WordPress Application Passwords over HTTP Basic. The docs pages show an
  `X-WP-Nonce` header because that is what the admin UI (cookie-authenticated)
  must send; the route policies themselves are pure capability checks
  (`Acl::hasPermission()` → `current_user_can()`), and `Acl::verifyNonce()`
  returns early unless `wp_doing_ajax()`, so no nonce applies to REST calls.
  See [`api-reference/auth.md`](../auth.md).
- `PUT`/`PATCH`/`DELETE` are served natively; the docs mention an
  `X-HTTP-Method-Override` header only as a fallback for restrictive hosts.
- `license` requires Fluent Forms Pro. `POST /form-submit` is the public
  submission endpoint — it creates a real entry and fires notifications,
  integrations and payment processing.

## forms

| Method | Path | Summary |
|---|---|---|
| GET | `/forms` | List Forms |
| POST | `/forms` | Create Form |
| GET | `/forms/ping` | Ping Forms API |
| GET | `/forms/templates` | List Form Templates |
| GET | `/forms/{form_id}` | Get Form |
| POST | `/forms/{form_id}` | Update Form |
| DELETE | `/forms/{form_id}` | Delete Form |
| POST | `/forms/{form_id}/duplicate` | Duplicate Form |
| POST | `/forms/{form_id}/convert` | Convert Form Type |
| POST | `/forms/{form_id}/clearHistory` | Clear Form Edit History |
| GET | `/forms/{form_id}/editHistory` | Get Form Edit History |
| GET | `/forms/{form_id}/fields` | Get Form Fields |
| GET | `/forms/{form_id}/findShortCodePage` | Find Form Shortcode Page |
| GET | `/forms/{form_id}/pages` | List Pages Embedding the Form |
| GET | `/forms/{form_id}/resources` | Get Form Resources |
| GET | `/forms/{form_id}/shortcodes` | Get Form Shortcodes |

## analytics

| Method | Path | Summary |
|---|---|---|
| POST | `/analytics/{form_id}/reset` | Reset Form Analytics |

## submissions

| Method | Path | Summary |
|---|---|---|
| GET | `/submissions` | List Submissions |
| GET | `/submissions/all` | List All Submissions |
| POST | `/submissions/bulk-actions` | Bulk Action Submissions |
| GET | `/submissions/print` | Print Submissions |
| GET | `/submissions/resources` | Get Submission Resources |
| GET | `/submissions/{entry_id}` | Get Submission |
| DELETE | `/submissions/{entry_id}` | Delete Submission |
| POST | `/submissions/{entry_id}/is-favorite` | Toggle Submission Favorite |
| GET | `/submissions/{entry_id}/logs` | Get Submission Logs |
| DELETE | `/submissions/{entry_id}/logs` | Delete Submission Logs |
| GET | `/submissions/{entry_id}/notes` | Get Submission Notes |
| POST | `/submissions/{entry_id}/notes` | Create Submission Note |
| POST | `/submissions/{entry_id}/status` | Update Submission Status |
| GET | `/submissions/{entry_id}/submission-users` | Get Submission Users |
| POST | `/submissions/{entry_id}/update-submission-user` | Update Submission User |

## form-submit

| Method | Path | Summary |
|---|---|---|
| POST | `/form-submit` | Submit a Form Entry |

## settings

| Method | Path | Summary |
|---|---|---|
| GET | `/settings/{form_id}` | Get Form Settings |
| POST | `/settings/{form_id}` | Save Form Settings |
| DELETE | `/settings/{form_id}` | Delete Form Settings |
| GET | `/settings/{form_id}/general` | Get General Form Settings |
| POST | `/settings/{form_id}/general` | Save General Form Settings |
| GET | `/settings/{form_id}/customizer` | Get Form Customizer Settings |
| POST | `/settings/{form_id}/customizer` | Save Form Customizer Settings |
| POST | `/settings/{form_id}/entry-columns` | Save Entry Columns |
| GET | `/settings/{form_id}/conversational-design` | Get Conversational Form Design |
| POST | `/settings/{form_id}/store-conversational-design` | Save Conversational Form Design |
| GET | `/settings/{form_id}/preset` | Get Form Style Preset |
| POST | `/settings/{form_id}/save-preset` | Save Form Style Preset |

## integrations

| Method | Path | Summary |
|---|---|---|
| GET | `/integrations` | List Global Integrations |
| POST | `/integrations` | Save Global Integration |
| POST | `/integrations/update-status` | Update Integration Module Status |
| GET | `/integrations/{form_id}` | Get Form Integration |
| POST | `/integrations/{form_id}` | Save Form Integration |
| DELETE | `/integrations/{form_id}` | Delete Form Integration |
| GET | `/integrations/{form_id}/form-integrations` | List Form Integrations |
| GET | `/integrations/{form_id}/integration-list-id` | Get Integration List Component |

## report

| Method | Path | Summary |
|---|---|---|
| GET | `/report/api-logs` | Get API Logs Report |
| GET | `/report/completion-rate` | Get Form Completion Rate |
| GET | `/report/country-heatmap` | Get Country Heatmap |
| GET | `/report/form-stats` | Get Form Stats |
| GET | `/report/forms/{form_id}` | Get Form Report |
| GET | `/report/heatmap-data` | Get Heatmap Data |
| GET | `/report/net-revenue` | Get Net Revenue |
| GET | `/report/overview-chart` | Get Overview Chart |
| GET | `/report/payment-types` | Get Payment Types Report |
| GET | `/report/revenue-chart` | Get Revenue Chart |
| GET | `/report/select-forms` | List Forms for Reports |
| GET | `/report/submissions-analysis` | Get Submissions Analysis |
| GET | `/report/subscriptions` | Get Subscriptions Report |
| GET | `/report/top-performing-forms` | Get Top Performing Forms |
| POST | `/report/submissions` | Query Submissions Report |

## global-settings

| Method | Path | Summary |
|---|---|---|
| GET | `/global-settings` | Get Global Settings |
| POST | `/global-settings` | Save Global Settings |

## license

| Method | Path | Summary |
|---|---|---|
| GET | `/license` | Get License Status |
| POST | `/license` | Activate License |
| DELETE | `/license` | Deactivate License |

## managers

| Method | Path | Summary |
|---|---|---|
| GET | `/managers` | List Managers |
| POST | `/managers` | Add Manager |
| DELETE | `/managers` | Remove Manager |
| GET | `/managers/users` | List Assignable Users |

## roles

| Method | Path | Summary |
|---|---|---|
| GET | `/roles` | List Roles and Capabilities |
| POST | `/roles` | Add Role Capability |

## logs

| Method | Path | Summary |
|---|---|---|
| GET | `/logs` | List Logs |
| DELETE | `/logs` | Delete Logs |
| GET | `/logs/filters` | Get Log Filters |

## global-search

| Method | Path | Summary |
|---|---|---|
| GET | `/global-search` | Global Search |

## notice

| Method | Path | Summary |
|---|---|---|
| POST | `/notice` | Handle Admin Notice Action |

## suggested-plugins

| Method | Path | Summary |
|---|---|---|
| POST | `/suggested-plugins/check-plugin-statuses` | Check Plugin Statuses |
| POST | `/suggested-plugins/install-plugin` | Install Plugin |
| POST | `/suggested-plugins/activate-plugin` | Activate Plugin |

## mcp

| Method | Path | Summary |
|---|---|---|
| GET | `/mcp/status` | Get MCP Adapter Status |
| POST | `/mcp/toggle` | Toggle MCP Adapter |
| POST | `/mcp/install-adapter` | Install MCP Adapter |
| GET | `/mcp/config-snippets` | Get MCP Config Snippets |
