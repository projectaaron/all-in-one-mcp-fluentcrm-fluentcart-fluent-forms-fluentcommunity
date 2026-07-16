# Maintaining the FluentCart API reference

The files in `docs/api/` are **generated**, not hand-written. This explains
where the data comes from and how to refresh it, so future updates are a
one-command job.

## TL;DR — refresh everything

```bash
node scripts/gen-api-docs.mjs
```

That discovers the current endpoint set, fetches every spec, and rewrites
`docs/api/*.md` + `docs/api/README.md`. It prints any **added** or **removed**
operations so you can see what changed, and keeps `scripts/api-operations.txt`
in sync. Commit the result. (Requires network access and Node 18+.)

## Where the data comes from

FluentCart's developer docs (<https://dev.fluentcart.com/>) are a VitePress site
whose API pages are **rendered from per-operation OpenAPI 3 specs**. We document
straight from those specs rather than scraping rendered HTML — it's the exact
source the site itself uses, so it's complete and accurate.

Two URL patterns matter:

| What | URL pattern | Example |
|------|-------------|---------|
| Per-operation OpenAPI spec | `https://dev.fluentcart.com/openapi/public/<group>/<slug>.json` | `…/openapi/public/orders/list-orders.json` |
| Rendered operation page | `https://dev.fluentcart.com/restapi/operations/<group>/<slug>` | `…/restapi/operations/orders/list-orders` |

Every group/slug uses the **same** `<group>/<slug>` in both — including Pro
groups (licensing, roles-permissions, order-bumps), which all live under
`/openapi/public/` (there is no `/pro/` path).

### How this was found (so you can re-derive it if the site changes)

1. The operation pages are an SPA — the static HTML has no body content. Each
   page loads a VitePress content chunk, e.g.
   `/assets/restapi_operations_orders_list-orders.md.<hash>.lean.js`.
2. That chunk renders a single component:
   `<OAOperation operationId="listOrders" specUrl="/openapi/public/orders/list-orders.json" />`.
   The `specUrl` is the OpenAPI source — that's the key.
3. The full list of operations is the docs **sidebar**, which is present in the
   rendered HTML of any `/restapi/*` page as `operations/<group>/<slug>` links.
   The generator scrapes those to discover every endpoint.

There is **no** combined/single OpenAPI file and no `sitemap.xml` (both 404) —
discovery is per-operation.

## How the generator works (`scripts/gen-api-docs.mjs`)

1. **Discover** — fetches `…/restapi/orders` (falls back to `…/restapi/`) and
   regexes out every `operations/<group>/<slug>` link. If discovery fails, it
   falls back to the committed `scripts/api-operations.txt`.
2. **Reconcile** — keeps the curated order from `scripts/api-operations.txt`,
   appends newly-discovered operations (grouped), drops removed ones, logs the
   diff, and rewrites `api-operations.txt` so it stays current.
3. **Fetch** — pulls each `…/openapi/public/<group>/<slug>.json` (12 in
   parallel).
4. **Render** — for every operation: method + path, summary/description, auth,
   path/query parameter tables, request-body schema (nested, with
   types/required/enums/limits) + example, and every response (status, schema,
   example). Writes `docs/api/<group>.md` and a fresh `docs/api/README.md`.

## Supporting files

| File | Role |
|------|------|
| `scripts/gen-api-docs.mjs` | The generator (self-contained; fetches its own data). |
| `scripts/api-operations.txt` | Canonical operation list — defines ordering and is the offline fallback. Auto-updated by the generator. |
| `docs/api/*.md` | Generated output — do not edit by hand; rerun the generator. |
| `docs/fluentcart-api-reference.md` | A **hand-curated** compact overview (one line per endpoint). Update its summary tables manually if you want the overview to track new endpoints; the full detail in `docs/api/` is the generated source of truth. |

## CI auto-refresh

`.github/workflows/refresh-api-docs.yml` reruns the generator weekly and opens
a PR only when the upstream API actually changed. **One-time repo setup
required:** the default `GITHUB_TOKEN` cannot open PRs until you enable
*Settings → Actions → General → Workflow permissions → "Allow GitHub Actions
to create and approve pull requests"* (off by default on new repos).
Alternatively point the workflow's `GH_TOKEN` at a PAT or GitHub App token.

## When something changes upstream

- **New / removed endpoints** → just rerun the generator; it auto-discovers and
  prints the diff.
- **Group renamed / new group** → it still works (unknown groups use the raw key
  as a title). For a nicer title, add the group to the `GROUPS` array in the
  generator.
- **Spec URL pattern changed** → update `BASE` (and `DISCOVERY_URLS`) at the top
  of the generator.
