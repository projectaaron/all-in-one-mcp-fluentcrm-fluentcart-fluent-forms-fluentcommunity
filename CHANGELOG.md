# Changelog

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

Recovered an unmerged field-reported fix (branch
`claude/fluentmcp-image-attachments-nlaw7x`, 2026-07-16) and ported it to
the individualized surface:

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
