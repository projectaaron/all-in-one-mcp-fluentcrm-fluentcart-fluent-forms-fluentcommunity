# Project map

Living document: what lives where and how the pieces connect. Update this
whenever the structure changes. Last updated: 2026-07-16 (Phase 1).

## What this repo is

**fluentMCP** — an MCP (Model Context Protocol) server, written in TypeScript
on the official `@modelcontextprotocol/sdk` with stdio transport, that gives
an AI harness full CRUD control over WPManageNinja "Fluent" products on a
WordPress site. Products ship as self-contained modules; FluentCRM and
FluentCart are the first two.

## Directory structure

```
fluentMCP/
├── src/
│   ├── index.ts                  # Entry point: builds server, registers enabled products, stdio
│   ├── core/                     # Product-agnostic — no product may require editing this
│   │   ├── config.ts             # Env parsing (site URL, per-product credentials); product enablement
│   │   ├── http.ts               # Single WordPress REST client: Basic auth injection, retry/backoff,
│   │   │                         #   rate-limit handling, normalized errors (never logs credentials)
│   │   ├── errors.ts             # Normalized error type + actionable-message helpers
│   │   ├── registry.ts           # Product module interface + registration; verify_setup aggregation
│   │   ├── tool-factory.ts       # Declarative resource-tool builder: action routing, Zod schema
│   │   │                         #   assembly, confirm:true gating, summary/full shaping, pagination
│   │   └── shape.ts              # Response shaping: field filtering, summary projections, text summary
│   └── products/
│       ├── fluentcrm/            # crm_* tools
│       │   ├── index.ts          # Product module: meta, auth config, tool registration
│       │   ├── tools/*.ts        # Declarative tool specs (action → endpoint maps)
│       │   └── summaries.ts      # Per-resource summary field lists
│       ├── fluentcart/           # cart_* tools (same layout)
│       └── _template/            # Scaffold for the next Fluent product (see docs/EXTENDING.md)
├── tests/                        # Vitest; mocked HTTP, no network
│   ├── core/*.test.ts            # http client, config, confirm gating, shaping
│   ├── products/*.test.ts        # Table-driven: every tool/action × success/validation/auth/API-error
│   └── coverage.test.ts          # Asserts every endpoint in endpoints.json maps to a tool action
├── scripts/
│   ├── gen-api-docs.mjs          # Multi-product API reference generator (see below)
│   ├── fluentcart-operations.txt # Discovered operation lists (ordering + offline fallback)
│   ├── fluentcrm-operations.txt
│   ├── gen-tool-catalog.mjs      # Renders docs/TOOL_CATALOG.md from the live tool registry
│   └── smoke-test.mjs            # Post-install read-only smoke test against a live site
├── evals/questions.xml           # 10 realistic read-only multi-tool Q&As
├── docs/
│   ├── api-reference/
│   │   ├── fluentcrm.md          # Per-product overview: auth, one table per group (generated)
│   │   ├── fluentcart.md
│   │   ├── auth.md               # Confirmed auth models + credential setup for each product
│   │   ├── fluentcrm/            # Full per-endpoint reference, one file per group (generated)
│   │   │   └── endpoints.json    #   + machine-readable endpoint inventory (drives coverage test)
│   │   └── fluentcart/
│   ├── DECISIONS.md              # Non-obvious decisions, append-only log
│   ├── PROJECT_MAP.md            # This file
│   ├── TOOL_DESIGN.md            # Tool consolidation rationale + endpoint→tool coverage map
│   ├── TOOL_CATALOG.md           # Every tool: name, one-liner, classification, example (generated)
│   └── EXTENDING.md              # Playbook: add a new Fluent product end-to-end
├── .github/workflows/refresh-api-docs.yml  # Weekly regeneration of docs/api-reference, PR on change
├── FLUENTCART_DEV_KIT.md         # Upstream dev kit (gotchas + WP-side reference) — kept verbatim
├── .env.example                  # All env vars with comments; no real values
├── CHANGELOG.md
└── README.md                     # 5-minute install path
```

## How the pieces connect

1. **Docs pipeline** (`scripts/gen-api-docs.mjs`): per-product config →
   discover `operations/<group>/<slug>` from the docs-site sidebar → fetch
   each per-operation OpenAPI spec → write `docs/api-reference/<product>/`
   (one md per group + `endpoints.json` + overview `<product>.md`). Weekly CI
   refresh opens a PR when upstream changes.
2. **Server runtime**: `index.ts` reads config (`core/config.ts`), asks the
   registry for products whose credentials are present, and each product
   module registers its tools through `core/tool-factory.ts` against the
   shared HTTP client. Products without credentials are skipped cleanly and
   reported by `verify_setup` as "not configured".
3. **Tool factory contract**: a tool spec is data — name, description,
   annotations, and an `actions` map (`action name → {method, path, params,
   destructive?, …}`). The factory produces the Zod input schema (action enum
   + common params + per-action fields), routes calls, enforces
   `confirm: true` on destructive actions, applies pagination defaults and
   summary/full shaping. Adding endpoints = editing data, not control flow.
4. **Coverage guarantee**: `tests/coverage.test.ts` diffs every entry in each
   product's `endpoints.json` against the union of endpoints reachable from
   that product's tool specs; unmapped endpoints fail CI.

## Build phases / status

- [x] Phase 0 — repo audit (`DECISIONS.md` 2026-07-16 entries)
- [ ] Phase 1 — API research & living references (in progress)
- [ ] Phase 2 — tool surface design (`TOOL_DESIGN.md`)
- [ ] Phase 3 — server build
- [ ] Phase 4 — tests, Inspector, smoke, evals
- [ ] Phase 5 — packaging & docs
