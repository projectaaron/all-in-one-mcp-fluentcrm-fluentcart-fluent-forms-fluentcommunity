# Tool surface design

How 699 documented REST endpoints (FluentCRM 319 + FluentCart 380) become
**699 individualized MCP tools plus a fast map** without losing coverage or
maintainability. Companion documents: `TOOL_MAP.md` (one line per tool,
generated), `TOOL_CATALOG.md` (area-level classes + examples, generated),
`PROJECT_MAP.md` (where the code lives), `api-reference/` (the endpoint
inventory).

## Principles

1. **One tool = one operation, findable in seconds.** Every documented
   endpoint is its own tool with a name that says what it does
   (`crm_contacts_list`, `cart_orders_refund`). A session should never have
   to parse a 31-action enum description to make one call — the schema of
   each tool contains exactly the parameters that operation needs, with path
   params as named required fields.
2. **A fast map over a big surface.** ~700 tools are only usable if finding
   the right one is one step. Three layers: the MCP `instructions` string
   (naming rule + conventions, read on connect), the `tool_map` tool
   (area overview → per-area drill-down → keyword search), and the generated
   `TOOL_MAP.md` for humans.
3. **Data over control flow.** A tool is still generated from a declarative
   spec: area, one sentence, and an action map (`action → {method, path,
   destructive, …}`) generated from `endpoints.json` (see "Mechanics"). The
   individual registration (`src/core/action-tools.ts`) derives names,
   schemas, and annotations from the same maps the legacy grouped surface
   uses — an upstream addition is a regen + assignment, never new plumbing.
4. **Token-lean responses.** Summary projection by default, pagination by
   default, `fields` to narrow further, `detail: "full"` only on request.
5. **Safe by default.** Accurate per-operation annotations; destructive
   tools refuse to run without `confirm: true` and instead *describe what
   would happen*.

## Naming: deterministic, collision-free

Tool name = `<area>_<operation>`. The area is the resource domain (the old
grouped tool name, e.g. `crm_contacts`), so related tools share a prefix and
sort/search together. The operation is the docs' action name minus any words
the area name already carries — except the leading verb, which always
survives (`list_lists` → `crm_lists_list`). Crude stemming makes
`contacts`/`contact`, `companies`/`company`, `templates`/`template` match:

- `crm_contacts` + `create_contact` → `crm_contacts_create`
- `crm_contacts` + `get_contact_notes` → `crm_contacts_get_notes`
- `cart_orders` + `refund_order` → `cart_orders_refund`

When stripping would make two operations collide (`delete_contact` vs
`delete_contacts`), **every collider keeps its full action name**
(`crm_contacts_delete_contact`, `crm_contacts_delete_contacts`) — a
deterministic rule with a uniqueness proof in `individualNamesFor`'s
docstring, backstopped by a generator-time throw and a test. All names are
≤ 64 chars and `^[a-z][a-z0-9_]*$` (enforced by tests).

## The per-tool contract

Each tool's schema carries only what its operation uses:

| Param | When present | Meaning |
|-------|--------------|---------|
| *path params* (`id`, `order_id`, …) | the endpoint's placeholders | Named **required** top-level parameters — no generic `id`/`path_params` indirection |
| `query` | always | Query-string parameters (search, filters, sort, `with[]`, …) passed through |
| `body` | non-GET methods | JSON request body |
| `page`, `per_page` | GET list operations | Pagination. **Defaults: page 1, per_page 20** |
| `fields` | always | Keep only these keys on returned records |
| `detail` | always | `summary` (default) projects records to per-resource summary fields; `full` returns the raw API response |
| `confirm` | destructive operations | Must be `true`; otherwise the tool returns an explanation of what would happen and does nothing |

Descriptions follow one shape: `<what it does>. [<Product> · <area>] <METHOD>
<path>.` plus a `⚠ Hard to undo — requires confirm:true.` warning on
destructive tools and the area's caveat note (e.g. customer-session auth)
where one exists.

**Grouped fallback.** `FLUENT_TOOL_MODE=grouped` serves the legacy surface —
one tool per area (~46 total) with an `action` enum parameter — for MCP
clients that can't handle a large tool list. Same specs, same handlers, same
gating; only the registration differs (`src/core/tool-factory.ts` vs
`src/core/action-tools.ts`, both funneling into a shared `executeAction`).

**Responses** are `structuredContent` conforming to one shared
`outputSchema` — `{ok, status, action, data, pagination?, note?}` with
`data` deliberately open-shaped (the upstream response shapes vary per
endpoint and version; faithfully passing them through beats maintaining 699
brittle schemas) — plus a one-line text summary ("12 of 481 orders,
page 1"). Errors return `isError` with an actionable message (what failed,
likely cause, what to try).

## Annotations & safety

- Per-operation and therefore accurate: GET/HEAD non-destructive tools carry
  `readOnlyHint: true`; `destructiveHint` mirrors the operation's own
  destructive flag. (In grouped mode annotations aggregate per area as
  before: read-only iff every action reads.) `idempotentHint` is an explicit
  opt-in in the tool map for areas whose every write is safely repeatable
  (currently only `crm_custom_fields` — pure save endpoints), conservative
  `false` everywhere else.
- `openWorldHint: true` everywhere (a remote WordPress site is an open
  system); `tool_map` alone is closed-world (it answers from local data).
- **Destructive classification** (action-level, enforced by `confirm`):
  DELETE-method endpoints, and write endpoints whose slugs match
  `delete|remove|detach|cancel|refund|deactivate|reset|disconnect|regenerate|bulk-action|do-bulk|bulk-delete|accept-dispute|un-schedule`.
  GET endpoints never gate via the heuristic (report slugs like
  `refund-chart` are reads); the one documented GET that mutates —
  FluentCRM's `reset_system_logs` — is force-gated by an override, and the
  HTTP client is told not to auto-retry destructive GETs.
  **Mass-send actions are also confirm-gated by override**: sending email or
  SMS to a whole audience is as irreversible as a delete
  (`schedule_campaign`, `resume_campaign`, the three `resend_*` actions,
  `schedule_sms_campaign`, `resume_sms_campaign`). Single-recipient sends
  (test emails, one custom SMS) stay ungated.
  Notable catches: FluentCRM's `reset_database` (full CRM wipe) and
  FluentCart's `regenerate_license_key` are confirm-gated. 98 of 699 actions
  classify as destructive.
- Annotations are hints; clients decide approval. The README documents how
  to keep every tool ask-first in Claude Code / Claude Desktop.

## Tool inventory

### FluentCRM — 21 areas / 319 tools

| Area | Docs group(s) | Tools | Class |
|------|---------------|-------|-------|
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
| `crm_forms` | forms | 5 | read/write |
| `crm_webhooks` | webhooks | 5 | read/write/delete |
| `crm_smart_links` | smart-links (Pro) | 5 | read/write/delete |
| `crm_sms` | sms (Pro) | 24 | read/write/delete |
| `crm_reports` | reports (minus its one DELETE), commerce-reports, global-search | 16 | **read-only** |
| `crm_abandoned_carts` | abandon-carts (Pro) | 3 | read/delete |
| `crm_settings` | settings + `reports/delete-report-emails` (log maintenance) | 39 | read/write/delete |
| `crm_settings_pro` | pro-settings | 11 | read/write/delete |
| `crm_utilities` | import, migrators, users, docs, public-bounce | 18 | read/write |

### FluentCart — 22 areas / 380 tools

| Area | Docs group(s) | Tools | Class |
|------|---------------|-------|-------|
| `cart_orders` | orders | 22 | read/write/delete |
| `cart_products` | products (core: CRUD, search, bulk, taxonomy, duplicates) | 27 | read/write/delete |
| `cart_product_variants` | products (variants, pricing, inventory, bundles, upgrade paths) | 23 | read/write/delete |
| `cart_product_assets` | products (downloadable files, media, per-product integrations) | 9 | read/write/delete |
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
| `cart_licensing` | licensing (Pro) | 27 | read/write/delete |
| `cart_roles` | roles-permissions (Pro) | 9 | read/write/delete |
| `cart_order_bumps` | order-bumps (Pro) | 5 | read/write/delete |

### Server built-ins — 5 tools

| Tool | Purpose |
|------|---------|
| `tool_map` | The fast map: no args → one line per area; `{area}` → every tool in it with params; `{search}` → keyword lookup. Registered even with nothing configured |
| `verify_setup` | Diagnostic: config presence per product, connectivity, plugin/API versions, one harmless read per configured product; unconfigured products report `not configured`, never error |
| `wp_media_upload_from_url` | Sideloads an image server-side into `/wp/v2/media` (SSRF-guarded, image/* only, 15 MB cap) |
| `wp_media_get` / `wp_media_list` | Media-library lookup |

**Total: 704 tools** in individual mode (the tables above count *areas*;
each area's endpoints are its individual tools) — or 46 in grouped mode.

## Design decisions worth defending

- **One tool per operation over action mega-tools.** The original surface
  packed each area into one tool with an `action` enum; a session had to
  read a 30-signature description and thread generic `id`/`path_params`
  arguments. Individual tools are self-describing (name + one sentence +
  exact params), annotations become accurate per operation, and clients
  with tool search find `cart_orders_refund` directly. The cost — a large
  `tools/list` — is paid once by clients with deferred tool loading and
  avoided entirely via the grouped fallback.
- **The map is a tool, not just a document.** Descriptions of 700 tools are
  no substitute for an index: `tool_map` gives a session the whole surface
  in ~50 lines, then exact per-area detail on demand — cheaper than reading
  700 schemas and faster than guessing names.
- **Area prefix stays in the name.** The docs' resource groups are still
  the natural seams; keeping *area = docs page = generated reference file*
  as the name prefix preserves the stable correspondence (splitting only
  the 59-endpoint products group, merging only trivially small groups).
- **`crm_reports` / `cart_reports` stay pure-read** so the most common
  analytics questions run through tools clients can safely mark read-only.
  The two FluentCart retention-snapshot *write* endpoints move to
  `cart_utilities`, and FluentCRM's `reports/delete-report-emails` moves to
  `crm_settings` — accuracy of `readOnlyHint` beats taxonomic purity. The
  invariant is enforced by `tests/coverage.test.ts`.
- **Customer-context tools ship despite auth limits.** The
  `cart_checkout_*` / `cart_customer_portal_*` tools need WordPress cookie
  sessions (documented in `api-reference/auth.md`); with Application
  Passwords most calls will 401. They exist for endpoint coverage and for
  sites with custom auth setups; their descriptions say so plainly.
- **Open-shaped `body`/`query`.** Full Zod modeling of 699 request bodies
  would be enormous, drift-prone, and mostly redundant — WordPress validates
  server-side and our references document every schema. Zod validates the
  envelope (path params, param types, confirm gating); the per-endpoint
  reference is the schema authority.
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
   group's default tool). `tests/individual.test.ts` then drives every
   individual tool against its documented endpoint and asserts the name
   rules (unique, ≤ 64 chars, area-prefixed).
3. `scripts/gen-tool-catalog.mjs` renders `TOOL_MAP.md` and
   `TOOL_CATALOG.md` from the same specs, so the human map can't drift from
   the real surface.
