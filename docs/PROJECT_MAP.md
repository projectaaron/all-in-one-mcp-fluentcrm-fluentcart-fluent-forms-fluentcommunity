# Project map

Living document: what lives where and how the pieces connect. Update this
whenever the structure changes. Last updated: 2026-07-17 (v0.7.0 —
individualized tool surface + fast map).

## What this repo is

**fluentMCP** — an MCP (Model Context Protocol) server, written in TypeScript
on the official `@modelcontextprotocol/sdk` (v1.x) with stdio transport, that
gives an AI harness full CRUD control over WPManageNinja "Fluent" products on
a WordPress site. Products ship as self-contained modules; FluentCRM
(319 endpoints, 21 areas) and FluentCart (380 endpoints, 22 areas) are the
first two. Every endpoint is its own individualized tool — 704 total
including the built-ins (`tool_map`, `verify_setup`, `wp_media_*`); set
`FLUENT_TOOL_MODE=grouped` for the legacy 46-tool one-tool-per-area surface.

## Directory structure

```
fluentMCP/
├── src/
│   ├── index.ts                  # Entry point: config → enabled products → tools → stdio
│   ├── core/                     # Product-agnostic — adding a product never edits this
│   │   ├── types.ts              # EndpointDef / ToolSpec / ProductModule contracts
│   │   ├── config.ts             # Env parsing; per-product enablement (creds present = enabled)
│   │   ├── http.ts               # THE WordPress REST client: Basic-auth injection, retry with
│   │   │                         #   backoff + Retry-After, WP-style query serialization,
│   │   │                         #   site-root paths, normalized errors; creds never logged
│   │   ├── errors.ts             # FluentApiError + per-status actionable hints
│   │   ├── shape.ts              # Paginator detection, summary projection, pruning, text summary
│   │   ├── tool-factory.ts       # Shared executeAction (path substitution, pagination
│   │   │                         #   defaults, confirm gating, shaping) + the legacy grouped
│   │   │                         #   registration (one tool per area, action enum)
│   │   ├── action-tools.ts       # Individual registration (default): one tool per operation —
│   │   │                         #   deterministic <area>_<operation> names, focused schemas,
│   │   │                         #   per-operation annotations
│   │   ├── tool-map.ts           # The fast map: tool_map tool (overview/area/search), MCP
│   │   │                         #   instructions string, map data for the generators
│   │   ├── media.ts              # wp_media tools (upload_from_url/get/list, both modes)
│   │   └── verify.ts             # verify_setup diagnostic tool
│   └── products/
│       ├── index.ts              # Registry: the ONLY line touched outside a new module
│       ├── fluentcrm/
│       │   ├── tool-map.json     # Curated: docs group -> tool, descriptions, overrides
│       │   ├── endpoints.gen.ts  # GENERATED action maps (gen-endpoint-maps.mjs)
│       │   ├── summaries.ts      # Summary-mode field lists per tool
│       │   └── index.ts          # ProductModule (key, namespace, env prefix, verifyRead)
│       ├── fluentcart/           # Same layout
│       └── _template/            # Scaffold (.tpl files, ignored by tsc/generators)
├── tests/                        # Vitest, mocked HTTP, no network — 235 tests
│   ├── helpers.ts                # mockFetch + client factory
│   ├── core/*.test.ts            # http, config, shape, factory, verify (via in-memory MCP client)
│   ├── products.test.ts          # Table-driven (grouped handler): EVERY action × routing/gating
│   ├── individual.test.ts        # Individual surface: names unique/≤64/area-prefixed, focused
│   │                             #   schemas, EVERY operation × routing/gating, buildServer modes
│   ├── tool-map.test.ts          # Fast map: overview/area/search rendering + tool_map tool
│   └── coverage.test.ts          # endpoints.json ↔ tools 1:1; read-only purity; tool budget
├── scripts/
│   ├── gen-api-docs.mjs          # Multi-product API reference scraper (PRODUCTS config table)
│   ├── gen-endpoint-maps.mjs     # endpoints.json + tool-map.json -> endpoints.gen.ts
│   ├── gen-tool-catalog.mjs      # dist registry -> docs/TOOL_MAP.md + TOOL_CATALOG.md + manifest sync
│   ├── smoke-test.mjs            # Post-install READ-ONLY smoke test over stdio
│   └── *-operations.txt          # Discovered operation lists (ordering + offline fallback)
├── evals/questions.xml           # 10 read-only multi-tool regression Q&As
├── docs/
│   ├── api-reference/            # GENERATED per-product references + endpoints.json
│   │   ├── fluentcrm.md / fluentcart.md   # Overviews (auth, one table per group)
│   │   ├── fluentcrm/ fluentcart/         # Full per-endpoint schemas + endpoints.json
│   │   ├── auth.md               # Confirmed auth models (hand-written)
│   │   └── MAINTAINING.md        # How scraping works + how to refresh (hand-written)
│   ├── DECISIONS.md              # Append-only decision log
│   ├── PROJECT_MAP.md            # This file
│   ├── TOOL_DESIGN.md            # Surface rationale (naming, map, safety policy) + inventory
│   ├── TOOL_MAP.md               # GENERATED fast map: one line per tool, grouped by area
│   ├── TOOL_CATALOG.md           # GENERATED area-level catalog with examples
│   └── EXTENDING.md              # Playbook: add a new Fluent product end-to-end
├── .github/workflows/
│   ├── refresh-api-docs.yml      # Weekly reference refresh, PRs on change
│   └── deploy-cloudflare.yml     # Manual-dispatch Worker deploy (needs CLOUDFLARE_API_TOKEN secret)
├── FLUENTCART_DEV_KIT.md         # Upstream dev kit (WP-side gotchas) — kept verbatim
├── .env.example                  # All env vars, commented, no real values
├── wrangler.jsonc                # Cloudflare Workers deploy config (src/worker.ts entry)
├── Dockerfile                    # Container image for the Node remote server
├── manifest.json                 # Claude Desktop extension manifest (MCPB 0.3);
│                                 #   user_config fields map onto the FLUENT_* env vars;
│                                 #   tools list + version synced by gen:catalog
├── .mcpbignore                   # What stays OUT of the .mcpb bundle
├── CHANGELOG.md · README.md · LICENSE · package.json · tsconfig.json · vitest.config.ts
```

## How the pieces connect

1. **Docs pipeline**: `gen-api-docs.mjs` scrapes each product's docs site
   (shared VitePress/OpenAPI infra) → `docs/api-reference/<product>{,.md}`
   incl. `endpoints.json`. Weekly CI refresh opens a PR on upstream change.
2. **Map pipeline**: `gen-endpoint-maps.mjs` joins `endpoints.json` with the
   curated `tool-map.json` → `endpoints.gen.ts` (action maps). Fails on
   unassigned groups, collisions, empty tools. `--destructive` prints the
   gated-action review list.
3. **Runtime**: `index.ts` loads env config; products with credentials get a
   `FluentClient` and register one tool per operation via `action-tools.ts`
   (or per area via `tool-factory.ts` when `FLUENT_TOOL_MODE=grouped`); the
   rest are skipped, reported by `verify_setup` as `not configured`, and
   marked `[not configured]` in `tool_map`. The map + MCP instructions are
   built from the same specs at startup.
4. **Coverage loop**: `tests/coverage.test.ts` re-derives the mapping from
   `endpoints.json` — a new upstream endpoint fails CI until it lands in a
   tool (usually automatically via its group's default tool). The catalog is
   regenerated from the same registry, so docs can't drift.
5. **Extension packaging**: `npm run pack:extension` builds → prunes dev deps
   → packs `fluentmcp.mcpb` (per `.mcpbignore`) → restores dev deps. The
   manifest's `user_config` (site URL + per-product credentials, passwords
   sensitive) feeds the same `FLUENT_*` env vars as `.env`, so both install
   modes share one config path.

## Regeneration cheat sheet

```bash
npm run gen:docs      # re-scrape upstream APIs (network)
npm run gen:maps      # rebuild action maps from endpoints.json (offline)
npm run build         # tsc
npm run gen:catalog   # rebuild TOOL_MAP.md + TOOL_CATALOG.md + manifest from dist
npm test              # 235 tests incl. coverage guarantees
```

## Build phases / status

- [x] Phase 0 — repo audit (`DECISIONS.md`)
- [x] Phase 1 — API research & living references (`docs/api-reference/`)
- [x] Phase 2 — tool surface design (`TOOL_DESIGN.md`; v0.7.0 individualized the surface)
- [x] Phase 3 — server build (core + 2 product modules + verify_setup)
- [x] Phase 4 — tests (134 passing), Inspector load, smoke, evals
- [x] Phase 5 — packaging & docs (README, catalog, changelog, EXTENDING, template)
