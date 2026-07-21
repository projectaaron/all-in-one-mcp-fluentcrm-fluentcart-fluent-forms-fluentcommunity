# Decision log

Non-obvious decisions made while building the FluentCRM + FluentCart MCP server.
Newest entries at the bottom. Each entry: what was decided, why, and what it
affects. A future session should be able to reconstruct the project's shape
from this file plus `PROJECT_MAP.md`.

---

## 2026-07-16 — Phase 0: repo audit

**State found:** the repo contained only the FluentCart Dev Kit bootstrap
committed earlier the same day (`15d13ed`, `3e1055e`): the dev kit markdown,
a generated 380-endpoint FluentCart REST reference (`docs/api/`), the
generator (`scripts/gen-api-docs.mjs`), a weekly refresh workflow, and
WordPress-plugin-oriented `README.md`/`.gitattributes`. **No application code,
no package.json — greenfield for the server itself.**

| Existing asset | Verdict | Why |
|---|---|---|
| `docs/api/*.md` (20 groups, 380 endpoints) | **Reuse** — becomes `docs/api-reference/fluentcart/` | Complete, freshly generated from FluentCart's own OpenAPI specs; exactly the Phase 1 deliverable for FluentCart |
| `scripts/gen-api-docs.mjs` | **Refactor** — generalize to multi-product | FluentCRM's docs site (developers.fluentcrm.com) runs the *same* VitePress + per-operation OpenAPI infrastructure; one parameterized generator covers both products and any future Fluent product |
| `scripts/api-operations.txt` | **Reuse** — renamed per-product (`fluentcart-operations.txt`) | Operation inventory doubles as the coverage checklist for tool design |
| `.github/workflows/refresh-api-docs.yml` | **Refactor** — regenerate all products' references | Same weekly-refresh value, now for every product module's docs |
| `FLUENTCART_DEV_KIT.md` | **Keep as reference** | Its integration gotchas (status-update fragility, hook context arrays, list filtering params) directly inform tool implementations; its PHP snippets are WP-plugin-side and not used by the server |
| `README.md`, `.gitattributes` | **Replace** | Written for a WordPress plugin repo; this is now an npm/MCP-server repo |
| `docs/fluentcart-api-reference.md` | **Supersede** | Its hand-curated REST overview is regenerated mechanically into `docs/api-reference/fluentcart.md`; the architecture/hooks/models content stays available inside `FLUENTCART_DEV_KIT.md` |

**Stack (greenfield):** TypeScript, official `@modelcontextprotocol/sdk`,
stdio transport, Zod input validation, Vitest with mocked HTTP. Node 20+.

## 2026-07-16 — Both products authenticate with WordPress Application Passwords

Confirmed from the docs (not guessed):

- **FluentCRM** (`/raw/rest-api/authentication.md`): credentials are created
  under *FluentCRM → Settings → Rest API* (backed by a dedicated FluentCRM
  Manager account — the docs explicitly warn against using an Administrator),
  then used as HTTP Basic `username:application_password` against
  `wp-json/fluent-crm/v2`.
- **FluentCart** (generated API index): WordPress Application Passwords
  (HTTP Basic) for the admin API against `wp-json/fluent-cart/v2`; the
  `/public/*` endpoints need no auth; `/customer-profile/*` + `/checkout/*`
  use WordPress cookie+nonce (browser session) and are **not usable** with
  Application Passwords.

Consequence: the server takes one site URL plus per-product Basic credentials
via env vars. Details in `docs/api-reference/auth.md`.

## 2026-07-16 — One parameterized docs generator for all Fluent products

`developers.fluentcrm.com` exposes the same machinery as `dev.fluentcart.com`:
sidebar links matching `operations/<group>/<slug>`, per-operation OpenAPI 3
specs (FluentCRM at `/openapi/<group>/<slug>.json`, FluentCart at
`/openapi/public/<group>/<slug>.json`), and — on FluentCRM — raw markdown at
`/raw/...`. `scripts/gen-api-docs.mjs` therefore becomes a product-config
table + shared pipeline. Each product's config: docs host, spec base path,
discovery URLs, REST namespace, output dir, operations file.

The generator also emits `<outDir>/endpoints.json` (machine-readable:
group/slug/operationId/method/path/summary per endpoint). That file is the
backbone for: the overview tables in `docs/api-reference/<product>.md`, the
Phase 2 endpoint→tool coverage map, and an automated coverage test asserting
every documented endpoint is reachable through some tool.

## 2026-07-16 — FluentCRM inventory snapshot

319 endpoints across 28 groups (includes FluentCampaign Pro groups such as
`recurring-campaigns`, `campaigns-pro`, `sms`, `abandon-carts`,
`commerce-reports`, `pro-settings`). Largest groups: settings (38),
campaigns (32), funnels (31), contacts (31), sms (24).

## 2026-07-16 — SDK v1.29 (not the v2 beta)

The `main` branch of the TypeScript SDK is the v2 beta (split
`@modelcontextprotocol/server` packages). Production guidance from the SDK's
own README: stay on `@modelcontextprotocol/sdk` 1.x. We pin `^1.29.0`, Zod
`^3.25` (the SDK's required peer range), `registerTool` (the `tool()` method
is deprecated), and `moduleResolution: NodeNext` with `.js` deep imports.

## 2026-07-16 — Action names are full operation slugs

`list_orders`, not `list`. Slightly more tokens per enum, but: zero collisions
when tools merge docs groups, a 1:1 lexical match with the generated API
reference and the docs site, and self-describing tool calls in client logs.

## 2026-07-16 — Open-shaped `body`/`query`; envelope-only Zod

Fully modeling 699 request bodies in Zod would be huge and drift-prone, and
WordPress validates server-side anyway. Zod validates the envelope (action
enum, param types, pagination bounds, confirm), tool descriptions link to the
generated per-endpoint schemas, and `outputSchema` keeps `data` open-shaped
for the same reason. structuredContent is validated by the SDK against the
declared shape on every call.

## 2026-07-16 — Destructive gating: what counts

`confirm: true` is required for hard-to-undo operations only
(DELETE-method + delete/remove/detach/cancel/refund/deactivate/reset/
disconnect/regenerate/bulk slugs on writes; GETs never gate). Routine writes
(pause/resume/schedule/update) are not gated — over-gating trains users to
click through confirmations. Review pass caught two things the first
heuristic got wrong: report GETs with "refund" in the slug were gated
(fixed: reads never gate), and FluentCRM's `settings/reset-database` — a
full CRM wipe — wasn't (fixed: `reset` added). `reports/delete-report-emails`
was moved into `crm_settings` so `crm_reports` stays strictly read-only.

## 2026-07-16 — Customer-session tools ship anyway

`cart_checkout` / `cart_customer_portal` need WP cookie+nonce sessions and
will mostly 401 under Application Passwords. They exist for full endpoint
coverage (a hard requirement) with the limitation stated in their own
descriptions and in auth.md, rather than silently dropping 28 documented
endpoints.

## 2026-07-16 — Template ships as .tpl files

`src/products/_template/` uses `.ts.tpl` / `tool-map.template.json` names so
tsc, the map generator, and the registry all ignore it until a real module is
copied from it. The generator discovers products by the presence of
`tool-map.json`, so the template can never half-register.

## 2026-07-16 — Final verification outcome (19-agent adversarial review)

A five-dimension review (correctness, safety, DoD audit, docs consistency,
live stdio probing) confirmed 12 findings; all are fixed:

- **Summary shaping bug (high):** both APIs wrap single records one level
  down (`{subscriber: {...}}`); summary/field projection hit the wrapper and
  returned `{}` for every wrapped get/create/update. `shapeResponse` now
  projects the inner record (preserving the wrapper key) and falls back to
  pruning instead of ever emptying a response. Projected fields are pruned
  too, so the documented "truncates long values" claim holds.
- **`reset_system_logs` (high):** FluentCRM deletes all system logs via a
  GET. Force-gated destructive by override, and destructive actions now set
  `noRetry` so the HTTP client never auto-retries a mutating GET.
- **Mass-send gating:** sending to a whole audience is as irreversible as a
  delete. `schedule_campaign`, `resume_campaign`, `resend_*` (3), and the SMS
  schedule/resume equivalents now require `confirm: true`. Single-recipient
  sends stay ungated. (The safety-audit agent covering this died on API
  overload; the gating decision was made conservatively without it.)
  Destructive actions: 98 of 699.
- **`idempotentHint`** is now a real per-tool opt-in in the tool map
  (currently `crm_custom_fields` only) instead of documented-but-hardcoded
  false.
- **Smaller fixes:** `FLUENT_HTTP_MAX_RETRIES=0` now disables retries;
  `requestRaw` (verify_setup's probe) respects the configured timeout;
  `engines` bumped to `>=20.6` (`--env-file` requires it, README says so);
  tool-catalog examples avoid customer-session endpoints that would 401 under
  Application Passwords; TOOL_DESIGN inventory table synced to the generated
  surface (licensing 27, roles 9, products 27/23/9 split, three class cells).

## 2026-07-16 — Claude Desktop extension packaging (MCPB)

Packaged the server as an MCP Bundle (`fluentmcp.mcpb`, manifest spec 0.3,
built with `@anthropic-ai/mcpb`) so installation is drag-and-drop and
credentials live in Claude Desktop's extension settings UI instead of a
`.env` file. Decisions:

- **user_config → env mapping.** The manifest's `user_config` fields map to
  the same `FLUENT_*` env vars the server already reads — no second config
  path in code. Passwords are `sensitive: true`; optional fields default to
  `""`, which `loadConfig` already treats as "not configured", so per-product
  enablement behaves identically in both install modes.
- **Bundle contents.** `.mcpbignore` ships only `manifest.json`, `dist/`,
  production `node_modules/`, `package.json`, README, LICENSE (2.5 MB).
  `pack:extension` prunes dev deps before packing and restores them after.
- **No drift.** `gen:catalog` now also syncs the manifest's `tools` array
  (shown in the extension UI) and version from the live registry/package.json.
- The `.mcpb` artifact is gitignored; users build it with
  `npm run pack:extension` or take it from a release.

## 2026-07-16 — Single shared credential pair (user-verified FluentCRM change)

User report from a live install: current FluentCRM has **no Settings → Rest
API page** — the feature was removed as redundant because it only generated
WordPress core Application Passwords. The official docs still describe the
old flow; the live product wins. Consequence: `FLUENT_API_USERNAME` /
`FLUENT_API_PASSWORD` now configure every product (one WP Application
Password runs the whole server), the extension form is 3 fields, and
per-product `<PREFIX>_API_*` vars remain as optional overrides for scoped
setups (resolved override-first in `loadConfig`). auth.md and the generator's
FluentCRM auth note document both the current behavior and the legacy page.

## 2026-07-16 — Remote mode: token-in-URL over OAuth, stateless over sessions

The Desktop extension only exists inside the Desktop app's own conversations;
the user works across claude.ai surfaces, so remote (Streamable HTTP) is the
primary deployment now. Two shortcuts taken deliberately:

- **Shared-secret auth instead of OAuth.** claude.ai custom connectors accept
  a bare URL; a full OAuth 2.1 authorization server (DCR, consent, tokens) is
  heavy for a single-owner personal server. A ≥16-char token — accepted as a
  Bearer header or as a URL path segment (`/mcp/<token>`, because the
  connector form can't set headers) — with timing-safe comparison and an
  HTTPS-only rule documented in REMOTE.md is proportionate. Revisit OAuth if
  this ever serves more than one user.
- **Stateless transport.** `sessionIdGenerator: undefined`; a fresh
  McpServer + transport per request (~44 registrations, trivially cheap).
  No session store, restart-transparent, horizontally scalable, and immune to
  the SSE-resumability complexity of stateful mode.

## 2026-07-16 — Cloudflare Workers: fetch-native bridge, not McpAgent

Deployed target is the user's Cloudflare account (they already run one).
Workers have no `node:http`, and the SDK's StreamableHTTPServerTransport is
built around Node req/res. Rather than adopting Cloudflare's Durable-Object
McpAgent stack (extra deps, platform lock, session state we don't need), the
worker entry implements a ~60-line stateless single-exchange Transport: feed
the POST body's JSON-RPC message(s) to a fresh McpServer, collect the
response(s), reply as JSON (202 for notification-only bodies). Server-
initiated messages are dropped — correct for stateless streamable HTTP.
`loadConfig(prefixes, env)` accepting an env record (originally for tests)
made Worker vars/secrets a drop-in. `nodejs_compat` covers Buffer in the
shared HTTP client. The MCP tools available in this session could read but
not deploy Workers, and no API token was present — deployment is the user's
`wrangler login` + `npm run deploy:cloudflare`; the Worker was verified here
in local workerd via `wrangler dev` with Inspector + curl.

## 2026-07-16 — Field reports beat reference docs

Two production findings from the first live agent sessions, both now
encoded in the server:

- **FluentCart's money units are inconsistent** with its own docs: order
  totals are cents (BIGINT), but variation prices (`item_price`,
  `compare_price` — DOUBLE columns) are dollars on create/update, multiplied
  by 100 server-side. The docs' blanket "all monetary values in cents" caused
  a live 100× price write. Tool descriptions now state the units per tool;
  the generated reference inherits upstream's claim, so the tool description
  is the authoritative warning layer.
- **Validation errors must pass through verbatim.** parseWpError now
  flattens Laravel-style `errors` maps into the error message (capped at
  600 chars). The agent that hit this burned ~10 calls reverse-engineering
  ProductVariationRequest.php; one good error message replaces all of that.

## 2026-07-16 — wp_media: server-side sideloading instead of multipart passthrough

Product photos couldn't get into WordPress through the tool surface:
FluentCart's own `/upload-editor-file` needs a multipart file, and raw binary
doesn't travel through JSON tool calls. The fix is a server-level `wp_media`
tool (like verify_setup — WordPress core `/wp/v2/media` is outside both
Fluent namespaces, so it stays out of the generated product maps and the
coverage test): `upload_from_url` fetches an image server-side and sideloads
it, then optionally sets title/alt. Guards: http(s)-only with
private/loopback hosts refused (the fetch runs with the Worker's network
position), image/* content types only, 15 MB cap. Registers only when
credentials exist. Verified live: migrated the Lilly print photo from
Shopify's CDN into the production media library (attachment 92413) in one
tool call.

## 2026-07-17 — Individualized tools + the fast map (0.7.0)

The 45 action mega-tools were slow for sessions to learn: picking one
operation meant parsing a 30-signature `action` enum description, and the
generic `id`/`path_params` envelope hid what each call actually needed.
Requirement: every tool individualized (fast to find, fast to use) plus a
fast map explaining the whole surface.

- **One tool per operation** (default; `FLUENT_TOOL_MODE=grouped` restores
  the legacy surface for clients that can't handle ~700 tools). Names are
  `<area>_<operation>` with words the area already carries stripped via
  crude stemming (`crm_contacts_create`, `cart_orders_refund`); colliders
  keep their full action name (`crm_contacts_delete_contact` vs
  `crm_contacts_delete_contacts`). Deterministic, unique (proof sketch in
  `individualNamesFor`), ≤ 64 chars — all test-enforced. Schemas carry only
  what the operation uses; path placeholders become named *required*
  params; annotations became accurate per operation (reads really say
  `readOnlyHint: true` now).
- **The fast map is three layers**: MCP `instructions` (naming rule +
  conventions, read at connect), the `tool_map` tool (~50-line area
  overview → per-area drill-down → keyword search, registered even when
  nothing is configured), and generated `docs/TOOL_MAP.md`. Rationale: an
  index a session can *call* beats 700 descriptions it would have to read.
- **Shared executor, two registrations.** `makeHandler` (grouped) and
  `makeActionHandler` (individual) both funnel into one `executeAction` —
  gating, path substitution, pagination, shaping stay single-sourced, and
  the grouped surface costs nothing extra to keep.
- `wp_media` split the same way (`wp_media_upload_from_url` / `_get` /
  `_list`); `verify_setup` was already individual. The .mcpb manifest lists
  only the always-present built-ins (`tools_generated: true` covers the
  product tools) and gains a Tool Surface user-config option.

## 2026-07-17 — 0.7.1 audit: what the review caught

Eight independent review angles (line-by-line, removed-behavior,
cross-file, reuse, simplification, efficiency, altitude, conventions) over
the 0.7.0 diff. Lessons worth keeping:

- **Schema-validated surfaces fail silently.** The SDK strips undeclared
  arguments, so dropping `page`/`per_page` from non-list GETs didn't error —
  it returned page 1 as if it were page 2. When narrowing a schema, grep for
  what the old surface accepted and prove each removal harmless.
- **Error advice is part of the contract.** The shared executor's
  "pass id/path_params" recovery text survived into a surface with neither
  parameter — an unfollowable instruction is a retry loop. Recovery text
  must be generated from the same schema the caller sees.
- **Stateless entry points make startup cost a per-request cost.** The
  Workers bridge rebuilds the McpServer per POST; 704 registrations cost
  40ms until names/schemas/map data were memoized at module scope (9ms
  after). Anything computed from module-lifetime singletons should be
  cached as such.
- **Names are external API.** The stemmer is a heuristic; a heuristic tweak
  is a global rename. Mitigations shipped: `toolName` operationOverride to
  pin names, and the committed generated TOOL_MAP.md making renames
  diff-visible.
- **Copies drift immediately.** The built-ins' metadata existed in three
  places for less than a day and already disagreed. The map data now has
  one builder (`serverArea`/`mapAreasOf`) consumed by runtime, docs
  generator, and manifest.

## 2026-07-17 — Locked tools: a safety tier above confirm (0.8.0)

Field request after reviewing the 98 confirm-gated tools: `confirm: true`
is a speed bump, not a wall — a confused session produces it as easily as
any other argument. Added server-side locks that refuse unconditionally in
both tool modes (grouped mode matches by each action's canonical
individual name via `ToolRuntime.canonicalNames`, avoiding an import
cycle).

- **Default lock list** (six, chosen for zero legitimate agent use):
  `crm_settings_reset_database` (full CRM wipe),
  `crm_contacts_delete_contacts` (audience-wide delete),
  `crm_settings_delete_rest_key` (self-lockout),
  `crm_settings_test_delete_request` (diagnostics resolver),
  `cart_settings_disconnect_payment_method` (stops checkout revenue),
  `cart_licensing_regenerate_license_key` (breaks customers' activations).
- **Deliberately NOT locked**: the generic bulk-action tools
  (`crm_contacts_bulk_action`, `cart_products_do_bulk_action`, …) — bulk
  tagging is a flagship use case ("tag everyone who bought X") and runs
  through exactly those tools. They stay confirm-gated; locking them is
  one env edit away.
- **Visible, not hidden**: locked tools stay registered with 🔒 in
  descriptions/tool_map/TOOL_MAP.md so a session gets an explicit refusal
  naming FLUENT_LOCKED_TOOLS rather than a mystery missing tool.
- `FLUENT_LOCKED_TOOLS` semantics: comma list REPLACES the default;
  `default` token expands it; `none` disables. Unset = default six.
