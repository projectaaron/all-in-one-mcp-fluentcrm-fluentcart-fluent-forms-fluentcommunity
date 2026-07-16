# Changelog

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
