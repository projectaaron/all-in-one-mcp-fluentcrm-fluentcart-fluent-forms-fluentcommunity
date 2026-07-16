# Authentication — confirmed models per product

Verified against each product's official docs on 2026-07-16 (not guessed).
Both products authenticate with **WordPress Application Passwords over HTTP
Basic auth** — but the credentials are created in different places and carry
different permission models.

## FluentCRM

- **Source:** <https://developers.fluentcrm.com/rest-api/authentication>
- **Namespace:** `https://<site>/wp-json/fluent-crm/v2`
- **Model:** HTTP Basic `username:application_password` — standard WordPress
  **Application Passwords** (WP Admin → Users → your user → Application
  Passwords → *Add New*).
- **Note on the docs:** the official docs describe a *FluentCRM → Settings →
  Rest API → "Create New API Key"* page backed by a FluentCRM Manager
  account. **Newer FluentCRM versions removed that page** (verified on a live
  install, 2026-07-16) — it was redundant with WordPress core Application
  Passwords, which is what the feature generated under the hood. On current
  versions, just use an Application Password for a user with FluentCRM
  permissions. If you're on an older version that still has the page, keys
  created there keep working — they're the same mechanism.
- **Scoping:** a FluentCRM Manager account (FluentCRM → Settings → Managers)
  with only the needed permissions is still the least-privilege option; an
  Application Password for that manager user scopes the API accordingly.
- **Exceptions:** the two `public-bounce` endpoints are webhook receivers for
  email-service bounce callbacks (security key in the URL, no Basic auth).

## FluentCart

- **Source:** <https://dev.fluentcart.com/restapi/> (generated index:
  [`fluentcart.md`](./fluentcart.md))
- **Namespace:** `https://<site>/wp-json/fluent-cart/v2`
- **Model:** three contexts:

| Context | Endpoints | Auth |
|---------|-----------|------|
| **Admin** | most endpoints | WordPress **Application Passwords** (HTTP Basic), i.e. a WP user with FluentCart capabilities (`manage_options`-level admin, or a FluentCart Pro role) + an application password created under *WP Admin → Users → Profile → Application Passwords* |
| **Customer portal** | `/customer-profile/*`, `/checkout/*`, `/user/login` | WordPress **cookie + nonce** (a logged-in browser session). **Not usable with Application Passwords** — this MCP server exposes these endpoints, but calls will be rejected by FluentCart unless the site accepts basic-auth'd users for them; treat them as customer-context only |
| **Public** | `/public/*`, license query endpoints (`/?fluent-cart=...`) | None |

## What this server does with it

- Site URL + **one shared credential pair** come from environment variables
  (see `.env.example`); both products use it. Per-product overrides exist for
  scoped setups. With no credentials at all, products are skipped and
  reported as `not configured` by `verify_setup`.
- Credentials are injected as an `Authorization: Basic …` header by the one
  shared HTTP client (`src/core/http.ts`). They are **never logged and never
  echoed** in tool output or error messages.

### Env vars

| Variable | Product | Notes |
|----------|---------|-------|
| `FLUENT_SITE_URL` | shared | e.g. `https://example.com` — the WordPress site root |
| `FLUENT_API_USERNAME` / `FLUENT_API_PASSWORD` | shared | one WP user + Application Password for everything (the default setup) |
| `FLUENTCRM_API_USERNAME` / `FLUENTCRM_API_PASSWORD` | FluentCRM | optional override — e.g. a scoped FluentCRM manager user |
| `FLUENTCART_API_USERNAME` / `FLUENTCART_API_PASSWORD` | FluentCart | optional override |

401/403 troubleshooting lives in the README; the short version: 401 means
the Basic credentials are wrong or the key was revoked; 403 usually means
the backing user lacks the FluentCRM manager permission / FluentCart
capability for that endpoint.
