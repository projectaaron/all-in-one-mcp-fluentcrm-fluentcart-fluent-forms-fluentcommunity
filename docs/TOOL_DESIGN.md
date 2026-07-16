# Tool surface design

How 699 documented REST endpoints (FluentCRM 319 + FluentCart 380) become
**44 MCP tools** without losing coverage. Companion documents:
`TOOL_CATALOG.md` (the concrete tool list, generated), `PROJECT_MAP.md`
(where the code lives), `api-reference/` (the endpoint inventory).

## Principles

1. **Coverage without sprawl.** Every documented endpoint is reachable; the
   tool count stays lean (target 30–60). One tool per *resource domain*, an
   `action` parameter selects the operation — mirroring how the docs
   themselves group endpoints.
2. **Data over control flow.** A tool is a declarative spec: name, one
   sentence, annotations, and an action map (`action → {method, path,
   destructive, …}`). The shared factory (`src/core/tool-factory.ts`) builds
   the Zod schema, routes, paginates, shapes, and gates. Endpoints are
   *generated* into these maps from `endpoints.json` (see "Mechanics"), so an
   upstream addition is a regen + assignment, never new plumbing.
3. **Token-lean responses.** Summary projection by default, pagination by
   default, `fields` to narrow further, `detail: "full"` only on request.
4. **Safe by default.** Accurate annotations; destructive actions refuse to
   run without `confirm: true` and instead *describe what would happen*.

## The uniform tool contract

Every resource tool takes the same parameter families (per-tool schema only
includes what that tool actually uses):

| Param | Type | Meaning |
|-------|------|---------|
| `action` | enum (required) | Which operation to perform. The field description lists every action with its required path params and destruction flag, e.g. `get(id)`, `delete(id)!` |
| `id` | string\|number | Primary path parameter (the `{order_id}`, `{subscriber}`, … of the chosen action) |
| `path_params` | object | Remaining path parameters when an action has more than one, keyed by placeholder name (e.g. `{"transaction_id": 55}`) |
| `query` | object | Query-string parameters (search, filters, sort, `with[]`, …) passed through to the endpoint |
| `body` | object | JSON request body for create/update-style actions |
| `page`, `per_page` | number | Pagination for list actions. **Defaults: page 1, per_page 20** |
| `fields` | string[] | Keep only these keys on returned records |
| `detail` | `"summary"` \| `"full"` | `summary` (default) projects records to per-resource summary fields; `full` returns the raw API response |
| `confirm` | boolean | Must be `true` for destructive actions; otherwise the tool returns an explanation of what would happen and does nothing |

Action names are derived from the docs' own operation slugs
(`list-orders → list`, `update-statuses → update_statuses`), so the API
reference, the tool surface, and the coverage test all speak the same names.

**Responses** are `structuredContent` conforming to one shared
`outputSchema` — `{ok, status, action, data, pagination?, note?}` with
`data` deliberately open-shaped (the upstream response shapes vary per
endpoint and version; faithfully passing them through beats maintaining 699
brittle schemas) — plus a one-line text summary ("12 of 481 orders,
page 1"). Errors return `isError` with an actionable message (what failed,
likely cause, what to try).

## Annotations & safety

- Tools whose actions are all reads: `readOnlyHint: true`.
- Any tool with writes: `readOnlyHint: false`; `destructiveHint: true` iff
  at least one action is destructive; `idempotentHint` only when every write
  action is safely repeatable (rare — settings-save tools).
- `openWorldHint: true` everywhere (a remote WordPress site is an open
  system).
- **Destructive classification** (action-level, enforced by `confirm`):
  DELETE-method endpoints, and write endpoints whose slugs match
  `delete|remove|detach|cancel|refund|deactivate|reset|disconnect|regenerate|bulk-action|do-bulk|bulk-delete|accept-dispute|un-schedule`.
  GET endpoints never gate (report slugs like `refund-chart` are reads).
  Overrides are curated per product module where the heuristic is wrong.
  Notable catches: FluentCRM's `reset_database` (full CRM wipe) and
  FluentCart's `regenerate_license_key` are confirm-gated. 90 of 699 actions
  classify as destructive.
- Annotations are hints; clients decide approval. The README documents how
  to keep every tool ask-first in Claude Code / Claude Desktop.

## Tool inventory

### FluentCRM — 21 tools / 319 endpoints

| Tool | Docs group(s) | Endpoints | Class |
|------|---------------|-----------|-------|
| `crm_contacts` | contacts | 31 | read/write/delete |
| `crm_lists` | lists | 7 | read/write/delete |
| `crm_tags` | tags | 7 | read/write/delete |
| `crm_segments` | dynamic-segments | 9 | read/write/delete |
| `crm_custom_fields` | custom-fields | 3 | read/write |
| `crm_labels` | labels | 4 | read/write/delete |
| `crm_companies` | companies | 19 | read/write/delete |
| `crm_campaigns` | campaigns, campaigns-pro | 39 | read/write/delete |
| `crm_recurring_campaigns` | recurring-campaigns | 14 | read/write/delete |
| `crm_sequences` | sequences (Pro) | 18 | read/write/delete |
| `crm_automations` | funnels | 31 | read/write/delete |
| `crm_templates` | templates | 11 | read/write/delete |
| `crm_forms` | forms | 5 | read |
| `crm_webhooks` | webhooks | 5 | read/write/delete |
| `crm_smart_links` | smart-links (Pro) | 5 | read/write |
| `crm_sms` | sms (Pro) | 24 | read/write/delete |
| `crm_reports` | reports (minus its one DELETE), commerce-reports, global-search | 16 | **read-only** |
| `crm_abandoned_carts` | abandon-carts (Pro) | 3 | read/delete |
| `crm_settings` | settings + `reports/delete-report-emails` (log maintenance) | 39 | read/write/delete |
| `crm_settings_pro` | pro-settings | 11 | read/write |
| `crm_utilities` | import, migrators, users, docs, public-bounce | 18 | read/write |

### FluentCart — 22 tools / 380 endpoints

| Tool | Docs group(s) | Endpoints | Class |
|------|---------------|-----------|-------|
| `cart_orders` | orders | 22 | read/write/delete |
| `cart_products` | products (core: CRUD, search, bulk, taxonomy, duplicates) | ~30 | read/write/delete |
| `cart_product_variants` | products (variants, pricing, inventory, bundles, upgrade paths) | ~19 | read/write/delete |
| `cart_product_assets` | products (downloadable files, media, per-product integrations) | ~10 | read/write/delete |
| `cart_customers` | customers | 18 | read/write/delete |
| `cart_coupons` | coupons | 12 | read/write/delete |
| `cart_subscriptions` | subscriptions | 17 | read/write/delete |
| `cart_tax` | tax | 26 | read/write/delete |
| `cart_shipping` | shipping | 15 | read/write/delete |
| `cart_settings` | settings | 30 | read/write |
| `cart_email_notifications` | email-notification | 11 | read/write |
| `cart_reports` | reports (minus the 2 retention-snapshot writes) | 41 | **read-only** |
| `cart_integrations` | integration | 17 | read/write/delete |
| `cart_files` | files | 5 | read/write/delete |
| `cart_labels_attributes` | labels-attributes | 13 | read/write/delete |
| `cart_utilities` | dashboard + retention-snapshot generate/status | 22 | read/write |
| `cart_storefront` | public-shop | 3 | **read-only**, no auth |
| `cart_checkout` | checkout | 7 | read/write (customer-session context) |
| `cart_customer_portal` | customer-profile | 21 | read/write (customer-session context) |
| `cart_licensing` | licensing (Pro) | 24 | read/write/delete |
| `cart_roles` | roles-permissions (Pro) | 7 | read/write/delete |
| `cart_order_bumps` | order-bumps (Pro) | 5 | read/write/delete |

### Server — 1 tool

| Tool | Purpose |
|------|---------|
| `verify_setup` | Diagnostic: config presence per product, connectivity, plugin/API versions, one harmless read per configured product; unconfigured products report `not configured`, never error |

**Total: 44 tools** (within the 30–60 target).

## Design decisions worth defending

- **Group-per-tool over CRUD-only-per-tool.** The docs' resource groups are
  the natural seams; mapping tools 1:1 to groups (splitting only the
  59-endpoint products group, merging only trivially small groups) keeps a
  stable, predictable correspondence: *tool name = docs page = generated
  reference file*.
- **`crm_reports` / `cart_reports` stay pure-read** so the most common
  analytics questions run through tools clients can safely mark read-only.
  The two FluentCart retention-snapshot *write* endpoints move to
  `cart_utilities`, and FluentCRM's `reports/delete-report-emails` moves to
  `crm_settings` — accuracy of `readOnlyHint` beats taxonomic purity. The
  invariant is enforced by `tests/coverage.test.ts`.
- **Customer-context tools ship despite auth limits.** `cart_checkout` /
  `cart_customer_portal` need WordPress cookie sessions (documented in
  `api-reference/auth.md`); with Application Passwords most calls will 401.
  They exist for endpoint coverage and for sites with custom auth setups;
  their descriptions say so plainly.
- **Open-shaped `body`/`query`.** Full Zod modeling of 699 request bodies
  would be enormous, drift-prone, and mostly redundant — WordPress validates
  server-side and our references document every schema. Zod validates the
  envelope (action enum, param types, confirm gating); the per-endpoint
  reference (linked from each tool's description) is the schema authority.
- **Pause/resume/schedule are writes, not destructive.** `confirm` is
  reserved for hard-to-undo operations (delete/cancel/refund/bulk/detach);
  over-gating routine writes would train users to click through confirmations.

## Mechanics: how coverage stays honest

1. `scripts/gen-endpoint-maps.mjs` reads each product's
   `docs/api-reference/<product>/endpoints.json` plus the product module's
   curated assignment table (`group → tool`, with per-operation overrides for
   splits/renames/destructive flags) and emits
   `src/products/<product>/endpoints.gen.ts` — the action maps the factory
   consumes. Collisions (two ops mapping to one action name) fail the
   generator.
2. `tests/coverage.test.ts` recomputes the mapping from `endpoints.json` and
   asserts every operation appears in exactly one tool action. A new upstream
   endpoint therefore fails CI until it's assigned (usually automatic via its
   group's default tool).
3. `scripts/gen-tool-catalog.mjs` renders `TOOL_CATALOG.md` from the same
   specs, so the human catalog can't drift from the real surface.
