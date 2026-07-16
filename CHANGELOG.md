# Changelog

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
  `openWorldHint` per tool; 90 destructive actions (deletes, refunds,
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
- **Tests**: 134 unit tests over mocked HTTP (every tool action's endpoint
  routing, confirm gating, error paths, coverage guarantees); MCP Inspector
  load verification; read-only post-install smoke script; 10-question
  read-only eval file (`evals/questions.xml`).
