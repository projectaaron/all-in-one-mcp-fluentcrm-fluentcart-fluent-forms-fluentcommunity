# Authentication — confirmed models per product

Verified against each product's official docs on 2026-07-16 (not guessed).
Both products authenticate with **WordPress Application Passwords over HTTP
Basic auth** — but the credentials are created in different places and carry
different permission models.

## FluentCRM

- **Source:** <https://developers.fluentcrm.com/rest-api/authentication>
- **Namespace:** `https://<site>/wp-json/fluent-crm/v2`
- **Model:** HTTP Basic `username:application_password`.
- **Where credentials come from:** *FluentCRM → Settings → Rest API →
  "Create New API Key"*. The key is backed by a **FluentCRM Manager
  account** (created under *FluentCRM → Settings → Managers*) whose FluentCRM
  permissions scope what the API key can do.
- **Official guidance:** do **not** use an Administrator account; create a
  dedicated manager with only the needed FluentCRM permissions. The generated
  application password cannot be retrieved later — store it immediately.
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

- Site URL + per-product credentials come from environment variables (see
  `.env.example`); products with no credentials are skipped and reported as
  `not configured` by `verify_setup`.
- Credentials are injected as an `Authorization: Basic …` header by the one
  shared HTTP client (`src/core/http.ts`). They are **never logged and never
  echoed** in tool output or error messages.
- Because both products accept WP Application Passwords, you *may* point both
  at one WP admin user's application password. The recommended setup is still
  two credentials: a scoped FluentCRM API key for `crm_*` and an admin
  application password for `cart_*`.

### Env vars

| Variable | Product | Notes |
|----------|---------|-------|
| `FLUENT_SITE_URL` | shared | e.g. `https://example.com` — the WordPress site root |
| `FLUENTCRM_API_USERNAME` / `FLUENTCRM_API_PASSWORD` | FluentCRM | from FluentCRM → Settings → Rest API |
| `FLUENTCART_API_USERNAME` / `FLUENTCART_API_PASSWORD` | FluentCart | WP username + application password with FluentCart admin capabilities |

401/403 troubleshooting lives in the README; the short version: 401 means
the Basic credentials are wrong or the key was revoked; 403 usually means
the backing user lacks the FluentCRM manager permission / FluentCart
capability for that endpoint.
