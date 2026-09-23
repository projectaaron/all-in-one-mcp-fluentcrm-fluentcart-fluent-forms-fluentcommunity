# Changelog

## 1.2.4 — 2026-09-23

- README: the remote-connector section now says plainly that the server does
  not go on WordPress hosting, and why — it is a Node app that only makes
  HTTPS calls to the site's REST API. Covers managed WP hosts (not
  supported), cPanel's Node.js app tool (works), a VPS, and Cloudflare
  Workers (recommended), and points anyone wanting an in-WordPress MCP at
  the vendor's own FluentHub adapter.

## 1.2.3 — 2026-09-22

- README and the packaged `readme.txt` now state that the ready-built
  extension is **free for a limited time** during early access rather than
  free forever; a paid license is planned once early access ends. The source
  stays MIT-licensed and open, and downloaded builds keep working.

## 1.2.2 — 2026-09-22

- The Release workflow now deploys the released commit to the Cloudflare
  Worker as its final job (`deploy-cloudflare.yml` became callable), so the
  download and the hosted connector never drift apart. A deploy failure does
  not unpublish the release. Manual runs can untick "Deploy the Cloudflare
  Worker"; tag pushes always deploy. The deploy workflow still runs on its
  own for hotfixes and rollbacks.

## 1.2.1 — 2026-09-22

- **Tool mode per URL for remote clients.** `/mcp/<token>/grouped` (or
  `/mcp/grouped` with Bearer auth) serves the 73-tool grouped surface from
  the same deployment, so URL-only clients such as ChatGPT connectors and
  editors that cap the tool list can use the server without a separate
  host. `/individual` forces the default; no suffix keeps existing
  connectors unchanged. Both the Node remote server and the Cloudflare
  Worker support it.
- README: new "Other AI clients" section with config snippets for Cursor,
  Windsurf/Cline/Gemini CLI, VS Code, Codex CLI and ChatGPT, and a
  per-client mode recommendation.

## 1.2.0 — 2026-09-21

- **New built-in tool `support_report`** for support requests and bug
  reports. Reproduce a problem, ask the assistant to "run support_report and
  show me the full output unchanged", and paste the result into an issue. The
  report carries the server version, transport (stdio / remote HTTP /
  Cloudflare Worker), tool mode and count, the locked-tool summary, which
  `FLUENT_*` variables are set (names only), the same per-product checks as
  `verify_setup`, and the recent tool-call log (endpoint template, HTTP
  status, WordPress error code, message, duration). The site host, every
  configured username and password, Authorization headers,
  application-password and token-shaped strings, and email addresses are
  redacted before the text is produced. Options: `probe:false` skips the
  live checks, `calls` (1–100, default 25) sets the log depth.
- Every tool call now lands in an in-memory ring buffer (100 entries per
  server instance) that feeds the report. Only the endpoint *template* is
  recorded — never record ids, query strings or bodies.
- `ServerConfig.presentEnv` lists the names of the configuration variables
  that were set; `buildServer` takes an optional `{ transport }`.

## 1.1.2 — 2026-09-21

- Extension icon: bone four-point star with an up arrow and a comet trail of
  stars on the site's black tile (`icon.svg`/`icon.png`, referenced by the
  manifest, so Claude Desktop shows it).
- Releases now also produce `all-in-one-mcp-for-fluent-suite-<version>.zip`
  (the `.mcpb` plus a plain-text install readme and the license) and publish
  it to the Freemius product automatically.

## 1.1.1 — 2026-09-21

- **Renamed** to **All-In-One MCP for Fluent Suite**. Human-facing names only:
  the package id `fluentmcp`, the `.mcpb` filename, the binaries, the
  `FLUENT_*` environment variables, the Worker name and every tool name are
  unchanged, so existing installs and configs keep working.
- **WPManageNinja's API documentation is no longer mirrored.** The 56
  per-endpoint schema files under `docs/api-reference/fluentcrm/` and
  `docs/api-reference/fluentcart/` are removed; the generator now writes only
  the endpoint inventory (`endpoints.json`) and an overview that links to
  each product's official developer docs and to
  <https://github.com/WPManageNinja>. The README gains an "API references"
  section. Tool descriptions and error hints point at the vendor docs.

## 1.1.0 — 2026-09-21

**Upstream API refresh: FluentCRM 319 → 363 endpoints, FluentCart 381 → 436.**
The scheduled docs refresh (PR #12) recorded both vendors' API growth since
July; this release wires it into tools. Totals: 1,191 → 1,290 endpoint tools
(1,298 registered), 68 → 73 areas, 184 → 203 confirm-gated operations.

FluentCRM (+45, −1):
- New areas `crm_ai` (generate/rewrite text and email bodies, contact
  summaries, provider models, AI settings and connection test) and
  `crm_email_patterns` (reusable email content patterns and categories,
  incl. wp_block format, bulk delete⚠).
- `crm_utilities` gains the contact export (`crm_utilities_export_contacts`,
  paged); `crm_settings` gains DB index health + repair⚠, system-log CSV
  export, and the MCP-adapter status/config/install⚠/toggle⚠ endpoints.
- 11 new read-only reports (automations, campaigns list, contacts by
  country/list/status/tag, unsubscribe stats, top campaigns, recent tags);
  bulk note deletes⚠ on contacts and companies; sequence email delay patch;
  automation sticky note; built-in template fetch; company custom-field
  group rename; legacy SMS unschedule path.
- Removed upstream: `crm_webhooks_list_sms` (route no longer served).
- `crm_settings_reset_system_logs` is now a DELETE upstream (was a GET); the
  confirm gate is unchanged.

FluentCart (+73, −18):
- New areas `cart_inventory` (stock list/stats, single and bulk⚠ updates,
  adjustment history, export), `cart_data_export` (paged batch exports of
  customers/orders/subscriptions/licenses with schemas) and
  `cart_pdf_templates` (receipt/invoice PDF templates, factory defaults,
  seller details, preview). Saved admin list views join `cart_utilities`.
- `cart_orders` gains renewal invoices (list/get/resend/void⚠), subscription
  charge-now⚠, create-renewal-now⚠, skip-renewal⚠, subscription detail
  update, pending-transaction sync, tax calculation. `cart_products`: bulk
  and group-bulk variant updates⚠, tax-exemption toggles. `cart_settings`:
  storage-driver status/bucket/reset⚠, Turnstile key check, MCP adapter
  status/snippets/install⚠/toggle⚠. `cart_email_notifications`: store
  digest settings, digest test, manual reminder. `cart_shipping`: packages,
  class profiles, zone countries. `cart_labels_attributes`: bulk term
  create, reorder, attribute library. `cart_customer_portal`: sections,
  pause⚠/resume subscription. `cart_licensing`: license sites.
  `cart_utilities`: run data backfills⚠, onboarding tax settings.
- Removed upstream (18): the per-product integration feed routes under
  `/products/{id}/integrations/*`, two attribute-term routes, six legacy
  `customer-profile` routes that duplicated `cart_customers`, the three
  license report charts under `/reports/*`, and the duplicate
  `roles-permissions` permission routes (`cart_settings_get/save_permissions`
  remain).

Safety classification for the additions followed the existing line: money
movement (charge-now, create-renewal-now, skip/void renewal), bulk rewrites
(variants, stock), code installation (MCP adapter), schema/data operations
(DB index repair, data backfills) and pauses gate; single reads, single
updates and single sends do not.

## 1.0.0 — 2026-09-18

**First public release.** Source on GitHub under MIT, sponsored by
upfluent.io; the ready-built Claude Desktop extension (`.mcpb`) is a free
download from upfluent.io / Freemius. Five WPManageNinja products (FluentCRM, FluentCart,
Fluent Forms, FluentCommunity, WP Social Ninja), 1,191 endpoint tools in 68
areas, self-describing writes (merge mode, post-write verification,
`dry_run`, read-back guards), confirm gates on 184 destructive operations and
12 admin-locked catastrophes. Release prep: personal-data and secrets audit of
the tree and full history, dependency audit (0 known vulnerabilities),
security review of the auth, sideloading and input paths, and a rewritten
README. Everything below this heading landed between 0.9.0 and 1.0.0.

**Security hardening from the release audit.**

- `wp_media_upload_from_url` SSRF guard: IPv6 literals (loopback,
  unspecified, ULA, link-local, multicast, IPv4-mapped and NAT64 forms) and
  the IPv4 CGNAT/benchmark/protocol-assignment/multicast ranges are now
  refused alongside the RFC1918/loopback/link-local set; `localhost`-style
  names, `.arpa`, `metadata.google.internal` and wildcard-DNS aliases
  (`nip.io`, `sslip.io`) are refused; URLs with embedded credentials are
  refused. Redirects are no longer followed by `fetch` — the tool follows up
  to 5 hops by hand and re-validates each `Location`, so a public URL can't
  bounce the server onto a private address. The body is streamed with a
  running byte count and aborted above the 15 MB cap (previously buffered in
  full first); a `Content-Length` over the cap is refused before download.
  The remaining known gap (no DNS pre-resolution) is documented in
  SECURITY.md with the lock-it-down mitigation.
- Privilege and code-installing operations are now confirm-gated: FluentCart
  plugin/payment addon install + activate and integration addon install,
  every product's add/update-manager, Fluent Forms add-role-capability and
  MCP-adapter toggle, FluentCart save-permissions and customer→WP-user
  attach, FluentCRM create-rest-key. Destructive count 167 → 184.
- Locked by default (12, was 9): `cart_settings_install_plugin_addon`,
  `cart_settings_install_payment_addon` (install arbitrary plugin code) and
  `crm_settings_create_rest_key` (mints a standing credential).
- `FLUENT_LOCKED_TOOLS=none` disables locking only as the sole value;
  `default,none` or `none,foo` no longer silently unlock everything.
- Remote Node server: request bodies capped at 4 MB (413), the `/mcp/<token>`
  path segment is percent-decoded so URL-unsafe tokens work in path form.
- Cloudflare Worker: same token decoding; 500 responses no longer echo
  internal error text; a message with an `id` but no `method` gets a JSON-RPC
  `-32600` instead of an empty 202. `wrangler.jsonc` turns Workers invocation
  logs off so the path token never lands in the log store.
- `deepMerge` (merge-mode writes) uses own-key lookup and skips
  `__proto__`/`constructor`/`prototype` keys from a JSON body.
- Query serialization handles arrays of objects and nested objects at any
  depth (`filters[0][field]=…`) instead of emitting `[object Object]`.
- Path templates that repeat a placeholder are fully substituted.
- `.wrangler/` local state is untracked and ignored; the deploy workflow runs
  with `permissions: contents: read`.

**`forms_integrations_save` can no longer save a feed Fluent Forms will
never run.** Field report: an integration feed written through the connector
returned 200 but never fired on submission — no row in `wp_fluentform_logs`,
the feed invisible in the integrations list. The tool does go through Fluent
Forms' own `FormIntegrationService::update()` (the connector has no database
access), but that service derives the storage key as
`<integration_name>_feeds` **without checking the name against registered
integrations** — so `"FluentCRM"` or `"fluent-crm"` instead of `"fluentcrm"`
stores a row the submission processor never reads, with a 200. The
registered slugs are inconsistent (`fluentcrm`, `fluent_support`,
`fluent_community`, `wp_social_ninja`), which is exactly what an agent
guesses wrong.

- **New core guard, `readback`** (an `operationOverrides` entry): a GET on
  a sibling path is fetched *before* a write to validate a body field against
  what the plugin advertises, and *after* it to return the stored record as
  `stored`. Applied to `forms_integrations_save`: `integration_name` must be
  a key of `available_integrations`, refused before writing otherwise (the
  refusal lists the registered slugs); after writing, the feed is located in
  the plugin's own `feeds` listing and returned — if the plugin doesn't list
  it, the tool errors instead of reporting success. Status-only toggles
  (`{integration_id, status}`) pass the allow check, since no name is
  involved.
- `bodyNote`s on save/get/delete document the body shape, the slug rule, the
  read-first pattern (`forms_integrations_get` with `integration_id` +
  `integration_name`), and that `forms_integrations_list` is the working
  read counterpart — its `provider` field is the stored key, so a
  misnamed feed's absence there is the diagnostic.

**New product: FluentCommunity — 274 endpoints, 8 areas, `community_*`
tools.** The fifth WPManageNinja product and the largest single addition:
spaces and space groups (membership, lock screens, paywalls, media
galleries), the activity feed (posts, comments, reactions, bookmarks,
surveys, documents, scheduled posts, moderation), chat (threads, groups,
messages), courses end to end (sections, lessons, students, quizzes,
progress), member profiles (follows, blocks, invitations, notifications,
leaderboard), read-only analytics, portal settings, and site administration.

- **Inventory from the live route index.** FluentCommunity publishes no REST
  reference, so `scripts/gen-fluentcommunity-docs.mjs` curates the operation
  table and checks it against `GET /wp-json/fluent-community/v2` on every
  run, failing loudly on drift — the same contract as the other generators.
- **Member-context writes are called out in `auth.md`.** Unlike the other
  products, much of this surface acts *as the authenticated user* — posting,
  commenting, reacting, joining spaces, sending chat messages, enrolling in
  courses. Called with an admin application password those act as that
  admin's persona and are visible to the community, so the identity of the
  credential is part of the blast radius.
- **Safety: 32 confirm-gated operations.** Beyond the deletes (including the
  POST-based ones the slug heuristic catches), gating follows the precedent
  the other products already set — **mass** outward-facing operations are
  gated, individual ones are not: `batch_create_feeds` and the four
  bulk-add/bulk-import member and student operations gate; posting a single
  feed item or sending one chat message does not.
  `promote_chat_group_member_to_admin` gates because the API has no demote
  route. `install_plugin` gates but is **not** locked — unlike Fluent Forms'
  installer it validates the slug against FluentCommunity's own addon
  allowlist, so it cannot install arbitrary plugins.

**The area budget is now per-product, not global.** The old rule capped the
whole server at 60 areas and was hit exactly at four products, so a fifth
would have failed even though every product was well consolidated. What the
budget protects is a scannable `tool_map` overview, and what threatens that
is one product sprawling into thin areas — not how many products a site
installs (a site only ever sees areas for the products it configures). The
test now caps **each product at 25 areas** (FluentCart: 381 endpoints in 22;
FluentCommunity: 274 in 8), keeps the floor of 30, and holds a loose absolute
ceiling of 100 as a smoke alarm.

- Tool total: 917 → 1,191 endpoint tools (1,199 registered incl. extras and
  built-ins), 60 → 68 areas.

**New product: Fluent Forms — 91 endpoints, 7 areas, `forms_*` tools.** The
fourth WPManageNinja product: forms (CRUD, duplicate, convert, fields,
shortcodes, embed pages, edit history), submissions/entries (notes, logs,
statuses, favorites, bulk actions), per-form settings, integrations,
read-only reports, site administration (global settings, licensing,
managers, roles) and utilities (logs, global search, plugin helpers, the
MCP-adapter settings).

- **Inventory: docs reference + live reconciliation.** Fluent Forms publishes
  an auto-extracted route reference (method, path, `Controller@action`) but
  no OpenAPI specs, so `scripts/gen-fluentforms-docs.mjs` curates the
  operation table from it and checks it against the live
  `GET /wp-json/fluentform/v1` index on every run, failing loudly on drift.
  The docs cover 84 operations; the live site serves 91 — the extra 7 are Pro
  licensing and the newer MCP-adapter routes, now documented here.
- **The docs' "Auth: X-WP-Nonce" is not a second auth model.** Every endpoint
  page shows a nonce header, which would imply Application Passwords can't
  work. Verified in the plugin source instead: the route policies are pure
  capability checks (`Acl::hasPermission()` → `current_user_can()`), and
  `Acl::verifyNonce()` returns early unless `wp_doing_ajax()`, so no nonce is
  checked on REST requests. The nonce is simply what the cookie-authenticated
  admin UI must send. `auth.md` records this so nobody re-derives it.
- **Safety.** 16 confirm-gated operations. Three are gated on inspection, not
  the slug heuristic: `forms_forms_clear_edit_history` (deletes history),
  `forms_forms_convert` (rewrites the form), and `forms_submissions_submit` —
  the public endpoint, which creates a **real** entry and fires notification
  emails, integration feeds and payment processing. Two more ship
  **admin-locked** by default: `forms_utilities_install_plugin` and
  `forms_utilities_activate_plugin` take an arbitrary wordpress.org slug with
  no allowlist, i.e. they install and run new code on the site.
- **`forms_reports` is strictly read-only.** Its one POST
  (`/report/submissions`, a filtered query) is registered under
  `forms_submissions` so the reporting area keeps its read-only annotation.
- The locked-tools test now derives from `DEFAULT_LOCKED_TOOLS` instead of
  restating it, and additionally asserts every locked name is a real
  registered tool — that hardcoded copy had broken on each of the last three
  product/lock changes.
- Tool total: 826 → 917 endpoint tools (925 registered incl. extras and
  built-ins), 53 → 60 areas.

**New product: WP Social Ninja — 126 endpoints, 9 areas, `social_*` tools.**
The third WPManageNinja product on the server, covering platform reviews,
testimonials, widget templates, platform connections and syncing, chat
widgets, sales notifications, shoppable Instagram feeds, global settings, and
the Pro review-collection surface (review forms, custom sources, QR codes,
WooCommerce/FluentCart imports).

- **Inventory from the live route index, not a docs site.** WP Social Ninja
  publishes no OpenAPI reference, so `scripts/gen-wpsocialninja-docs.mjs`
  captures `GET /wp-json/wpsocialreviews/v2` and checks it against a
  hand-curated operation table (groups, slugs, summaries) — any live/table
  drift fails the run with the routes named, mirroring the OpenAPI
  pipeline's loud-on-drift behavior. Body shapes are undocumented upstream;
  the reference says so and points at read-first workflows.
- **Auth verified live:** standard capability-checked WordPress Application
  Passwords, like the Fluent products (`docs/api-reference/auth.md` gains a
  section). The shared `FLUENT_API_*` credentials enable it automatically;
  `WPSOCIALNINJA_API_*` overrides are honored.
- **Safety:** all 22 DELETE operations confirm-gate, and
  `social_settings_delete_all_data` (drops every review, template, and
  setting the plugin owns) joins the default `FLUENT_LOCKED_TOOLS` list.
- Nine GET+PUT pairs (`/settings`, `/shoppable`, review forms, managers,
  notifications, chat-widget and template meta) picked up merge-mode writes
  with verification automatically — no per-product code.
- Tool total: 700 → 826 endpoint tools (834 registered incl. extras and
  built-ins), 44 → 53 areas.

**Writes are now self-describing: merge by default, verified after, and
previewable.** The Fluent update endpoints behave as full replaces — fields
omitted from a PUT body are cleared, not preserved — while returning 200
either way. A partial `crm_sequences_update_email` body silently wiped the
email's `title` and `settings.template_config` in the field; the connector
reported `ok: true`. That entire failure class is now closed at the executor:

- **Merge mode (default) on paired updates.** Every PUT/PATCH action with a
  GET registered on the identical path (27 across both products —
  `crm_sequences_update_email`, `crm_contacts_update`,
  `crm_campaigns_update`, `cart_coupons_update`, `cart_customers_update`, …)
  now reads the current record first and deep-merges the supplied body onto
  it, so omitted fields survive. Handles wrapped (`{"email": {…}}`),
  record-shaped, and flat-body-vs-wrapped-GET responses; when the shapes
  don't line up the body passes through untouched (with a note) rather than
  being guessed at. `mode:"replace"` restores full-PUT semantics and is
  confirm-gated like destructive actions. Tool descriptions declare the
  semantics: `[merge]` on paired updates, `[replace — omitted fields may be
  cleared]` on unpaired ones.
- **Post-write verification.** Merge-capable writes re-read the record and
  diff it: the response's `changed` map lists every field that actually
  changed (dotted paths, from → to), and `warnings` calls out fields that
  changed without being in the request body and supplied fields that didn't
  take effect. A write whose supplied values all differ from the record yet
  changed nothing returns an error instead of `ok: true` — the
  ignored-body case can no longer report success.
- **`dry_run:true` on every write tool** returns the exact request that
  would be sent — for merge-capable updates, including the computed
  field-level diff — and touches nothing (it also satisfies the confirm
  gate, since nothing executes).
- **`if_unmodified_since` optimistic concurrency** on merge-capable
  updates: pass the record's `updated_at` from a prior read and the write
  refuses if someone (say, a human in wp-admin) modified the record since.

**Sequence timing is now visible before a contact enrolls.** Sequence
`delay` is an absolute offset from enrollment in seconds — not relative to
the previous email — which is invisible in the API and easy to configure
into a 31-emails-on-day-one accident. Three hand-written FluentCRM tools
(the first product `extras`, registered alongside the generated surface and
listed under `crm_sequences` in the tool map):

- `crm_sequences_preview_schedule` — the computed send timetable for a
  hypothetical enrollment: absolute delays, `is_anytime`/`sending_time`
  windows, allowed sending days, site timezone (from
  `wp/v2/settings`, overridable). Flags same-delay groups, windows that land
  before enrollment+delay, and the empty-`sending_time` config the plugin
  turns into a corrupt send datetime.
- `crm_sequences_validate` — timing lint: duplicate delays (same-delay
  emails send as one group), `is_anytime`/`sending_time` mismatches, and
  timings-vs-delay-column drift (the scheduler uses the column).
- `crm_sequences_bulk_update_emails` — many merge-mode email updates in one
  call with per-row diffs/warnings, `dry_run`, and `stop_on_error`
  (documented honestly: REST offers no transaction, so written rows stay
  written).

The sequence-email `bodyNote`s now spell out the timing semantics (absolute
delay recomputed from `settings.timings` on save; `title` derived from
`email_subject`; ignored `sending_time`) so the landmines are in the tool
descriptions, not just this changelog.

**Wrapper-key request bodies fail fast with the expected shape.** The
FluentCRM sequence-email endpoints read every field from a top-level
`email` object and silently ignore flat body fields, so a flat payload to
`crm_sequences_create_email` inserted pure defaults and died on
`Column 'title' cannot be null` — a 500 that said nothing about the actual
mistake.

- New per-operation overrides in `tool-map.json`: `requiredBody` (top-level
  body keys checked in the shared executor before any HTTP — a missing key
  now returns an actionable refusal instead of the plugin-side SQL error)
  and `bodyNote` (a body-shape hint appended to the tool description and to
  that refusal). Both flow through `gen-endpoint-maps.mjs` into
  `endpoints.gen.ts`; both tool modes share the check.
- Applied to `crm_sequences_create_email` and `crm_sequences_update_email`
  (body nests under `email`; title derives from `email_subject`, send delay
  from `settings.timings`) and `crm_sequences_create_or_update_email`
  (additionally needs the `route_method` discriminator and `sequence_id` —
  its 422 `"Invalid route_method"` was the same missing-shape problem).

## 0.9.0 — 2026-07-27

**FluentCart's tax API changed upstream; the tool surface now matches it.**
The weekly docs refresh had already recorded the change in
`docs/api-reference/`, but the server's endpoint maps still pointed at the
old routes — seven tools were calling endpoints FluentCart no longer serves.

- **Removed (7)** — these routes are gone upstream and the tools that
  wrapped them would have failed at call time: `cart_tax_delete_country_rates`,
  `cart_tax_delete_oss_shipping_override`, `cart_tax_delete_oss_override`,
  `cart_tax_get_eu_rates`, `cart_tax_save_oss_shipping_override`,
  `cart_tax_save_oss_override`, `cart_tax_update_class`.
- **Added (8)** — EU VAT/OSS handling was reworked upstream around
  per-country OSS rates and per-product overrides:
  `cart_tax_get_oss_country_rates`, `cart_tax_save_oss_country_rates`,
  `cart_tax_get_eu_vat_product_overrides`, `cart_tax_get_product_overrides`,
  `cart_tax_save_product_override`, `cart_tax_delete_product_override`,
  `cart_tax_reset_eu_vat_rates`, `cart_tax_update_country_status`.
- `cart_tax_delete_product_override` and `cart_tax_reset_eu_vat_rates` are
  confirm-gated by the usual slug heuristic. Totals: **700 endpoints, 705
  tools, 97 destructive** (FluentCart 381, FluentCRM 319).
- Test counts that tracked the endpoint total are now derived from the
  committed api-reference inventories instead of written as literals — the
  refresh workflow runs weekly, and a hardcoded 704 turned every upstream
  API change into four unrelated-looking count failures.
- The coverage test now fails by name when an action maps an operation that
  is absent from the inventory. It previously null-dereffed on exactly the
  drift this release fixes, reporting "Cannot read properties of undefined"
  instead of naming the stale tool. 244 tests.

## 0.8.0 — 2026-07-17

**Locked tools — a safety tier above `confirm`.** Some operations have no
legitimate agent use, and a confused session can produce `confirm: true` as
easily as any other argument. Locked tools refuse unconditionally,
server-side, in both tool modes:

- Locked by default: `crm_settings_reset_database` (full CRM wipe),
  `crm_contacts_delete_contacts` (audience-wide delete),
  `crm_settings_delete_rest_key` (API self-lockout),
  `crm_settings_test_delete_request` (diagnostics resolver),
  `cart_settings_disconnect_payment_method` (stops checkout revenue),
  `cart_licensing_regenerate_license_key` (invalidates customers' keys).
- Admin-controlled via `FLUENT_LOCKED_TOOLS`: a comma list of individual
  tool names replaces the default; the token `default` expands it
  (`default,crm_contacts_bulk_action`); `none` disables locking.
- Locked tools stay registered and visible — 🔒 in tool descriptions,
  tool_map, and TOOL_MAP.md — so sessions get an explicit refusal naming
  the env var instead of a mystery missing tool.
- Generic bulk-action tools stay unlocked by default (bulk tagging is a
  first-class use case); they remain confirm-gated. 244 tests.

## 0.7.3 — 2026-07-17

Recovered an unmerged field-reported fix (image-attachments branch,
2026-07-16) and ported it to the individualized surface:

- **New tool: `cart_products_update`** — FluentCart's
  `POST /products/{postId}/pricing` is, despite the path, the FULL product
  update and the only route that writes the product gallery / featured
  image. It was hidden as a "pricing" action under variants, so agents
  migrating product images could find no working path. The area note
  documents the landmines: `gallery[0].id` becomes the featured image and
  `gallery: []` deletes the thumbnail; always send `post_title`/`post_status`
  (they're set unconditionally); omit `variants` unless rewriting them
  (`item_price` is ×100 on write).
- The endpoint generator honors a `summary` operation override for cases
  where the upstream title misdescribes the endpoint.

## 0.7.2 — 2026-07-17

Second-pass line-by-line review over the audit fixes themselves:

- `wp_media` `fields:[…]` now projects from the raw attachment, so fields
  outside the summary set (caption, media_details, …) are reachable.
- Grouped-mode instructions and tool_map overview count callable tools
  (46), not operations (~700) — the map now says "46 tools (702
  operations)".
- Map conventions state that every GET tool accepts page/per_page (many
  paginated collections hide behind get_* names), not just list tools.
- Registration now throws if a future endpoint's path placeholder would
  shadow a reserved parameter (page, query, fields, …) instead of silently
  clobbering it; schema cache keyed per (endpoint, action). 239 tests.

## 0.7.1 — 2026-07-17

Audit pass over the 0.7.0 surface — eight independent review angles plus a
consistency sweep; everything found, fixed:

- **Non-list GET tools regained `page`/`per_page`.** ~250 paginated
  collections hide behind `get_*` names (contact emails, funnel subscribers,
  order transactions, …); their individual schemas omitted the params, and
  the SDK's schema validation silently stripped them — a session asking for
  page 2 got page 1 with no error. Every GET (and list/search of any method)
  now takes them; defaults still apply only to GET lists.
- **Missing-param errors now name the tool's own parameter.** The shared
  executor's message suggested `id`/`path_params`, which individual tools
  don't accept — following the advice looped forever. Individual handlers
  now say exactly which top-level argument is missing.
- **Worker request cost cut 4.5×** (40ms → 9ms per request). Tool names,
  input schemas, and map data are memoized at module scope — the stateless
  Cloudflare entry point rebuilds the server per POST and was paying full
  schema construction every time.
- **Naming rule refined**: stripping that would empty an action name keeps
  the verb (`list_lists` → `crm_lists_list`) without inflating noun-first
  names (`report_overview` → `cart_reports_overview`, not
  `…_report_overview`). New `toolName` override in `operationOverrides`
  pins an operation's name for good — tool names are external API.
- **Grouped-mode tool_map teaches the calling convention** (`crm_contacts
  {"action": "list_contacts"}`) instead of dot-forms that look callable.
- **wp_media honors the response conventions**: `detail:"full"` and
  `fields:[…]` now work on all three media tools (previously the map's
  conventions promised them server-wide but media ignored them).
- **Single-sourced surface metadata.** The built-in tools' names/summaries
  lived in three drifting copies (runtime map, server.ts, docs generator);
  now one `serverArea()` builder feeds runtime, docs, and manifest. The
  manifest lists only mode-independent built-ins (`tool_map`,
  `verify_setup`), so grouped-mode installs no longer advertise tools that
  don't exist.
- `verify_setup` reports mode-aware `tools` plus `areas` per product
  (previously reported area count as "tools"); smoke test pins
  individual mode; eval expected-tool names corrected; stale counts in
  README/PROJECT_MAP fixed. 235 tests.

## 0.7.0 — 2026-07-17

**Individualized tools + the fast map.** The surface is rebuilt so every
session understands it in seconds:

- **One tool per operation** (was: 45 mega-tools with `action` enums).
  Every one of the 699 documented endpoints is now its own tool with a name
  that says what it does — `crm_contacts_list`, `crm_contacts_create`,
  `cart_orders_refund` — 704 tools total including the built-ins. Names are
  deterministic: `<area>_<operation>` with redundant words stripped
  (collisions keep the full action name), unique, ≤ 64 chars, test-enforced.
- **Focused schemas.** Each tool carries only the parameters its operation
  uses; path placeholders (`order_id`, `note_id`, …) are named *required*
  top-level parameters instead of the generic `id`/`path_params` envelope.
  `body` appears only on writes, `page`/`per_page` only on lists, `confirm`
  only on destructive tools.
- **The fast map.** New `tool_map` tool: no args → one line per area
  (~50 lines for the whole surface); `{"area": "crm_contacts"}` → every
  tool in the area with its parameters; `{"search": "refund"}` → keyword
  lookup. The same map ships as generated `docs/TOOL_MAP.md`, and every
  session receives the naming rule + conventions via MCP `instructions` on
  connect.
- **Accurate annotations.** Read-only operations now really carry
  `readOnlyHint: true` (previously one write in an area forced
  `readOnlyHint: false` onto its 30 reads).
- **`wp_media` split** into `wp_media_upload_from_url` / `wp_media_get` /
  `wp_media_list`.
- **Legacy surface kept**: `FLUENT_TOOL_MODE=grouped` (env var or the
  extension's new "Tool Surface" setting) restores the one-tool-per-area
  surface (~46 tools) for MCP clients that can't handle large tool lists.
  Same specs, same shared executor, same confirm gating in both modes.
- Destructive classification, coverage guarantees, and response shaping are
  unchanged; the safety regression suite now also runs against the
  individual surface. 230 tests.

## 0.6.0 — 2026-07-16

- **New tool: `wp_media`** (server-level, like `verify_setup`) — closes the
  product-photo gap: FluentCart's own upload endpoint needs a multipart file,
  which doesn't travel through JSON tool calls. `upload_from_url` fetches an
  image server-side (e.g. from Shopify's CDN) and sideloads it via WordPress
  core `/wp/v2/media`, optionally setting title/alt text; `get_media` and
  `list_media` cover lookup. Guards: http(s)-only with private/loopback hosts
  blocked, image/* content types only, 15 MB cap. Registers only when
  credentials are configured. 45 tools total.
- `FluentClient` gains `wpRequest` (authenticated WordPress-core REST with
  arbitrary method/headers/body) and `fetchUrl` (timeout-bounded external
  fetch); `requestRaw` now delegates to `wpRequest`.

## 0.5.2 — 2026-07-16

Field-report fixes from the first production sessions:

- **422 validation errors now carry their field-level messages.** Fluent
  returns `{"errors": {"variants.total_stock": [...]}}`; the wrapper
  previously surfaced only "HTTP 422". The flattened field errors are now in
  the error text, so agents learn the required body shape in one call.
- **Price-unit warnings in tool descriptions.** The upstream API docs claim
  all money is in cents, but variation create/update prices are plain
  dollars (server multiplies by 100) — an agent following the docs stored a
  100× price. `cart_product_variants` now warns (dollars, read back after
  writing); `cart_orders` states its totals are cents.

## 0.5.1 — 2026-07-16

- **Fix: record data now reaches every MCP client.** Tool results carried the
  payload only in `structuredContent` with a one-line text summary — but
  claude.ai surfaces just the text block to the model, so list/get data never
  arrived ("15 items" with no items). Responses now serialize the shaped
  payload into the text block as well, per the MCP spec's compatibility
  guidance. Reported live by the first real user session.
- Summary mode drops the Laravel paginator boilerplate (`links[]`, page
  URLs, `from`/`to`) — the clean `pagination` field already carries the
  numbers; `detail:"full"` keeps the envelope verbatim.
- `wrangler.jsonc` sets `keep_vars: true` so deploys never clobber
  dashboard-added plaintext variables (credentials added as "Text" vars were
  wiped by a redeploy — store credentials as type **Secret**).

## 0.5.0 — 2026-07-16

- **Cloudflare Workers deployment** — the recommended remote host.
  `src/worker.ts` is a fetch-native entry point: since Workers have no Node
  HTTP server, a minimal stateless single-exchange MCP transport bridges each
  POST to a fresh server instance. Same endpoints, token auth, and safety
  behavior as the Node remote mode; config via Worker secrets.
  `wrangler.jsonc` + `npm run deploy:cloudflare` / `dev:cloudflare`;
  four-command deploy documented in docs/REMOTE.md (now recipe A).
- Verified in the real workerd runtime via `wrangler dev`: MCP Inspector over
  streamable HTTP lists all 44 tools; `verify_setup` executes with outbound
  fetch; 401/405/202 semantics correct. 9 worker-handler unit tests.

## 0.4.0 — 2026-07-16

- **Remote mode (Streamable HTTP).** `npm run start:remote` serves the same
  44 tools over HTTP for claude.ai custom connectors — works on web, mobile,
  and desktop. Stateless (fresh MCP session per request), token-auth via
  `Authorization: Bearer` or the URL path (`/mcp/<token>`) since claude.ai's
  connector form can't set headers; refuses to start without a 16+ char
  `FLUENT_MCP_TOKEN`. Unauthenticated `/healthz`.
- Shared server builder (`src/server.ts`) now backs both entry points
  (stdio `dist/index.js`, HTTP `dist/remote.js` / `fluentmcp-remote` bin).
- `Dockerfile` and `docs/REMOTE.md` (Cloudflare Tunnel, PaaS, Docker
  recipes; security notes). README gains a which-install-where table.

## 0.3.0 — 2026-07-16

- **One credential pair runs everything.** Newer FluentCRM versions removed
  the *Settings → Rest API* key page (redundant with WordPress core
  Application Passwords — verified on a live install), so the server now
  takes a single `FLUENT_API_USERNAME` / `FLUENT_API_PASSWORD` for both
  products. The extension settings form is down to 3 fields: Site URL,
  WordPress Username, Application Password.
- Per-product `FLUENTCRM_API_*` / `FLUENTCART_API_*` env vars remain as
  optional overrides (e.g. a scoped FluentCRM manager user) and win over the
  shared pair for that product.
- Auth docs updated (`docs/api-reference/auth.md`, generated FluentCRM
  overview) to describe current FluentCRM auth and note the removed page.

## 0.2.0 — 2026-07-16

- **Claude Desktop extension packaging**: `npm run pack:extension` builds
  `fluentmcp.mcpb` (MCP Bundle, `manifest.json` spec 0.3). Install by
  drag-and-drop into Claude Desktop → Settings → Extensions; site URL and
  per-product credentials are entered in the extension's settings form
  (passwords are `sensitive` fields). Blank credentials disable that product,
  exactly like the env-var path.
- The manifest's tool list and version are kept in sync with the live
  registry by `gen:catalog`.
- **README rewritten** for readability: extension-first install, a
  plain-English "How the tools work" section, and grouped tool tables
  covering all 44 tools.

## 0.1.0 — 2026-07-16

Initial release.

- **MCP server** (TypeScript, official `@modelcontextprotocol/sdk` 1.x, stdio
  transport) exposing **44 tools** over **699 documented REST endpoints**:
  FluentCRM (319 endpoints → 21 `crm_*` tools), FluentCart (380 endpoints →
  22 `cart_*` tools), plus the `verify_setup` diagnostic.
- **Consolidated tool contract**: one tool per resource domain with an
  `action` parameter; uniform `id`/`path_params`/`query`/`body`/`fields`/
  `detail`/`page`/`per_page` params; pagination defaults (20/page); summary
  responses by default with `structuredContent` + output schema.
- **Safety**: accurate `readOnlyHint`/`destructiveHint`/`idempotentHint`/
  `openWorldHint` per tool; 98 destructive actions (deletes, refunds, mass-sends,
  cancels, bulk actions, resets) refuse to run without `confirm: true`.
- **Shared core**: one HTTP client with Basic-auth injection, retry with
  exponential backoff + `Retry-After` handling, normalized errors with
  actionable hints; credentials never logged or echoed.
- **Product-modular architecture**: products register through
  `src/products/index.ts`; per-product enablement via env credentials;
  unconfigured products report `not_configured` instead of erroring;
  `_template/` scaffold + `docs/EXTENDING.md` playbook for future Fluent
  products.
- **Generated, living documentation**: full per-endpoint API references
  scraped from both products' OpenAPI specs (`docs/api-reference/`), tool
  catalog generated from the live registry, weekly CI refresh workflow.
- **Tests**: 144 unit tests over mocked HTTP (every tool action's endpoint
  routing, confirm gating, error paths, coverage guarantees); MCP Inspector
  load verification; read-only post-install smoke script; 10-question
  read-only eval file (`evals/questions.xml`).
