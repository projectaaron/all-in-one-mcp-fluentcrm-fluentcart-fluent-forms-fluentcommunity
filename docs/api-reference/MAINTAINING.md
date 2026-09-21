# Maintaining the API references

Everything under `docs/api-reference/` except `auth.md` and this file is
**generated**, not hand-written. This explains where the data comes from and
how to refresh it, so updates stay a one-command job — for the current
products and for any Fluent product added later.

## TL;DR — refresh everything

```bash
node scripts/gen-api-docs.mjs              # all products
node scripts/gen-api-docs.mjs fluentcrm    # one product
```

That discovers each product's current endpoint set, fetches every OpenAPI
spec, and rewrites per product:

| Output | Content |
|--------|---------|
| `docs/api-reference/<product>.md` | Overview: source URL, scrape date, auth model, one table per group, link to the vendor's schema docs |
| `docs/api-reference/<product>/endpoints.json` | Machine-readable inventory (drives the tool-coverage test) |

Per-endpoint request/response schemas are **not** mirrored in this repository.
They are WPManageNinja's documentation and live at the sources below (and in
their GitHub organization, <https://github.com/WPManageNinja>); the overview
links there. The inventory keeps only what the tool surface needs: group,
slug, method, path, one-line summary, auth scheme, deprecation flag.

| Product | Official developer docs |
|---------|-------------------------|
| FluentCRM | <https://developers.fluentcrm.com/rest-api/> · [WPManageNinja/fluentcrm-api-doc](https://github.com/WPManageNinja/fluentcrm-api-doc) |
| FluentCart | <https://dev.fluentcart.com/restapi/> · [WPManageNinja/fluent-cart-dev-docs](https://github.com/WPManageNinja/fluent-cart-dev-docs) |
| Fluent Forms | <https://developers.fluentforms.com/api/endpoints/> |
| FluentCommunity | [WPManageNinja/fluent-community-developer-docs](https://github.com/WPManageNinja/fluent-community-developer-docs) |
| WP Social Ninja | [WPManageNinja/wpsocialninja-docs](https://github.com/WPManageNinja/wpsocialninja-docs) |
| `scripts/<product>-operations.txt` | Canonical operation list — ordering + offline fallback (auto-updated) |

It prints **added/removed** operations so you can see what changed. Commit
the result. (Network + Node 18+ required. When running behind the dev
container's proxy, prefix with `NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`.)

## Where the data comes from

WPManageNinja's developer docs sites are VitePress sites whose API pages are
**rendered from per-operation OpenAPI 3 specs**. We document straight from
those specs rather than scraping rendered HTML — it's the exact source the
sites themselves use.

| Product | Docs site | Spec URL pattern |
|---------|-----------|------------------|
| FluentCart | `https://dev.fluentcart.com/restapi/` | `https://dev.fluentcart.com/openapi/public/<group>/<slug>.json` |
| FluentCRM | `https://developers.fluentcrm.com/rest-api/` | `https://developers.fluentcrm.com/openapi/<group>/<slug>.json` |

Every operation appears in the docs sidebar as an
`operations/<group>/<slug>` link — that's what discovery scrapes. The same
`<group>/<slug>` names the spec file. Pro-only groups live under the same
spec base (no separate `/pro/` path).

### How this was found (re-derive it if a site changes)

1. Operation pages are an SPA — static HTML has no body content. Each page
   loads a VitePress content chunk that renders a single component:
   `<OAOperation operationId="..." specUrl="/openapi/.../<group>/<slug>.json" />`.
   The `specUrl` is the OpenAPI source.
2. FluentCRM additionally serves the raw page markdown at
   `/raw/rest-api/...md` (e.g. `/raw/rest-api/authentication.md`) — handy for
   prose pages like authentication.
3. The full operation list is the docs **sidebar**, present in the rendered
   HTML of any docs page as `operations/<group>/<slug>` links.
4. There is **no** combined single OpenAPI file and no `sitemap.xml` —
   discovery is per-operation.

## How the generator works (`scripts/gen-api-docs.mjs`)

Per product config (`PRODUCTS` table at the top: host, spec base, discovery
URLs, namespace, output paths, group titles):

1. **Discover** — fetch the docs page(s), regex out every
   `operations/<group>/<slug>` link. Falls back to the committed
   `scripts/<product>-operations.txt` if discovery fails.
2. **Reconcile** — keep the committed order, append newly-discovered
   operations, drop removed ones, log the diff, rewrite the ops file.
3. **Fetch** — pull each spec (12 in parallel).
4. **Render** — per operation: method + path, summary/description, auth,
   parameter tables, request-body schema + example, every response. Write the
   group files, `endpoints.json`, and the overview.
5. **Clean** — delete group files for groups that vanished upstream.

## When something changes upstream

- **New / removed endpoints** → rerun the generator; it prints the diff.
  Then check `tests/coverage.test.ts` — a new endpoint that no tool action
  reaches fails CI until it's mapped in the product's tool specs.
- **Group renamed / new group** → still works (unknown groups use the raw
  key as title). Add a nicer title to the product's `groups` array.
- **Spec URL pattern changed** → update the product's `specBase` /
  `discoveryUrls` in the `PRODUCTS` table.
- **New Fluent product** → add a `PRODUCTS` entry (host + spec base +
  namespace) and follow `docs/EXTENDING.md`.

## CI auto-refresh

`.github/workflows/refresh-api-docs.yml` reruns the generator weekly and
opens a PR only when an upstream API actually changed. **One-time repo setup
required:** the default `GITHUB_TOKEN` cannot open PRs until you enable
*Settings → Actions → General → Workflow permissions → "Allow GitHub Actions
to create and approve pull requests"* (off by default on new repos).
Alternatively point the workflow's `GH_TOKEN` at a PAT or GitHub App token.
