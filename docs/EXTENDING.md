# Extending fluentMCP with a new Fluent product

A step-by-step playbook for adding any WPManageNinja product (FluentForms,
FluentBooking, FluentSupport, FluentBoards, FluentSMTP, FluentCommunity, or
whatever ships next). It is written so a future AI session can execute it
end-to-end **with nothing but the product's developer-docs URL as input**.
Nothing in `src/core/` or in existing product modules is modified at any step.

Reserved tool prefixes: `crm_*` (FluentCRM), `cart_*` (FluentCart),
`forms_*` (FluentForms), `booking_*` (FluentBooking), `support_*`
(FluentSupport), `boards_*` (FluentBoards), `smtp_*` (FluentSMTP),
`community_*` (FluentCommunity).

Throughout, replace `<product>` (e.g. `fluentforms`), `<PREFIX>` (env prefix,
e.g. `FLUENTFORMS`), and `<tp>` (tool prefix, e.g. `forms`).

## Step 1 — Scrape the API reference

WPManageNinja docs sites share one architecture (VitePress + per-operation
OpenAPI specs; see [`api-reference/MAINTAINING.md`](api-reference/MAINTAINING.md)).

1. Open the product's docs site and find the REST API section. Verify the
   sidebar links look like `operations/<group>/<slug>` and locate the spec
   base by fetching one operation page's raw markdown (`/raw/...md`) or its
   content chunk and reading the `<OAOperation specUrl="...">` value.
2. Add a `PRODUCTS` entry in `scripts/gen-api-docs.mjs`: host, `specBase`,
   `discoveryUrls`, `docsUrl`, REST `namespace`, `opsFile:
   'scripts/<product>-operations.txt'`, `outDir:
   'docs/api-reference/<product>'`, `overviewFile:
   'docs/api-reference/<product>.md'`, an `authNote`, and group titles
   (start with `groups: []` — unknown groups still render, with raw keys as
   titles; fill in nice titles after the first run).
3. Run `node scripts/gen-api-docs.mjs <product>` and commit the generated
   reference. Confirm the endpoint count against the docs site's own claim.
4. Confirm the **auth model** from the product's authentication docs page
   (do not guess) and add a section to
   [`api-reference/auth.md`](api-reference/auth.md). Every Fluent product so
   far uses WordPress Application Passwords over HTTP Basic, but verify.

## Step 2 — Design the tool surface

Follow [`TOOL_DESIGN.md`](TOOL_DESIGN.md):

1. Copy `src/products/_template/` to `src/products/<product>/` and rename
   `tool-map.template.json` → `tool-map.json`.
2. Assign every docs group to one **area** (`<tp>_<resource>`) — each
   endpoint in the area becomes its own individualized tool named
   `<area>_<operation>` at registration. Split a group only when it exceeds
   ~35 endpoints; merge tiny related groups. Keep reporting/analytics groups
   in their own strictly-read-only area — move any write endpoint out of it
   via `operationOverrides`.
3. Write a one-plain-sentence description per area (it shows in the
   `tool_map` overview and in every one of its tools' descriptions).
4. Run `node scripts/gen-endpoint-maps.mjs` — it fails loudly on unassigned
   groups, action-name collisions, or empty tools. Then review destructive
   classification with `node scripts/gen-endpoint-maps.mjs --destructive`;
   fix misses via `operationOverrides` (`{"group/slug": {"destructive": true}}`).
   The same overrides accept `"action"` (rename the action) and `"toolName"`
   (pin the operation's individual tool name when the stemmer's choice is
   wrong or must never change).
   Watch for: anything irreversible that the slug heuristic
   (delete/remove/detach/cancel/refund/deactivate/reset/disconnect/regenerate/bulk)
   doesn't catch.

## Step 3 — Wire the module

1. In `src/products/<product>/`, rename the `.tpl` files to `.ts` and fill in
   the placeholders (module key, title, namespace, env prefix, tool prefix,
   a cheap harmless `verifyRead` GET, summary fields for the main record
   types).
2. Register it in `src/products/index.ts` (one import + one array entry —
   the only line outside the module you touch).
3. Add the product's env vars to `.env.example`, and a credentials row to the
   README install table.

## Step 4 — Test

`npm run build && npm test`. The existing table-driven suites pick the new
module up automatically from the registry:

- `tests/products.test.ts` (grouped handlers) and
  `tests/individual.test.ts` (individual tools, names, schemas) exercise
  every new operation (endpoint URL, API error, confirm gating) with zero
  new test code.
- `tests/coverage.test.ts` asserts every endpoint in the new
  `endpoints.json` is reachable and read-only areas stay pure. It also
  enforces the 30–60 *area* budget — if the new product bursts it,
  consolidate further.

Add product-specific tests only for genuinely product-specific behavior.

## Step 5 — Document and ship

1. `npm run build && npm run gen:catalog` — regenerates
   [`TOOL_MAP.md`](TOOL_MAP.md) and [`TOOL_CATALOG.md`](TOOL_CATALOG.md)
   including the new product.
2. Update [`PROJECT_MAP.md`](PROJECT_MAP.md) (structure) and append the
   non-obvious decisions to [`DECISIONS.md`](DECISIONS.md).
3. Add a `CHANGELOG.md` entry.
4. Smoke-test against a live site if available:
   `node --env-file=.env scripts/smoke-test.mjs` (add a read for the new
   product to the `READS` table in the script), and run `verify_setup` —
   the new product must report `ok` when configured and `not_configured`
   (never an error) when its credentials are absent.

## Definition of done for a new product

- [ ] Generated reference in `docs/api-reference/<product>{,.md}` with auth section
- [ ] Every documented endpoint mapped (coverage test green)
- [ ] Area count justified; read-only areas pure; destructive operations reviewed
- [ ] `npm test` green; map + catalog regenerated; env example + README updated
- [ ] `verify_setup` reports the product correctly in both configured and unconfigured states
