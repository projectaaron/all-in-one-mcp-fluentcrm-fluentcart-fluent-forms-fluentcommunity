# fluentMCP

FluentCart plugin project, bootstrapped from the [FluentCart Dev Kit](./FLUENTCART_DEV_KIT.md).

## What's here

| Path | Purpose |
|------|---------|
| [`FLUENTCART_DEV_KIT.md`](./FLUENTCART_DEV_KIT.md) | The full dev kit: integration gotchas, reusable code (internal REST client, admin-menu registration, secrets encryption), and the complete FluentCart development reference. |
| [`docs/fluentcart-api-reference.md`](./docs/fluentcart-api-reference.md) | Hand-curated FluentCart development reference — architecture, DB schema, models, hooks, and a one-line-per-endpoint REST API overview. |
| [`docs/api/`](./docs/api/README.md) | **Generated** full per-endpoint REST API reference (request params, body schemas, responses, examples) — one file per resource group. Do not edit by hand. |
| [`scripts/gen-api-docs.mjs`](./scripts/gen-api-docs.mjs) | Generator for `docs/api/` — discovers every endpoint from dev.fluentcart.com and renders its OpenAPI spec. See [`docs/api/MAINTAINING.md`](./docs/api/MAINTAINING.md). |
| [`scripts/api-operations.txt`](./scripts/api-operations.txt) | Discovered operation list (auto-maintained by the generator; offline fallback + ordering). |
| [`.github/workflows/refresh-api-docs.yml`](./.github/workflows/refresh-api-docs.yml) | Weekly CI refresh — reruns the generator and opens a PR only when FluentCart's API actually changed. |

## Refresh the API docs

```bash
node scripts/gen-api-docs.mjs   # Node 18+, needs internet to dev.fluentcart.com
```

It prints any added/removed endpoints and rewrites `docs/api/` — commit the result.
