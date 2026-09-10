# Authentication — confirmed models per product

Verified against each product's official docs on 2026-07-16 (not guessed;
WP Social Ninja, Fluent Forms and FluentCommunity verified against a live
install and the plugin source on 2026-09-10). All products authenticate with **WordPress
Application Passwords over HTTP Basic auth** — but the credentials are
created in different places and carry different permission models.

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

## WP Social Ninja

- **Source:** no developer docs site exists — verified live against a
  production install (2026-09-10): anonymous calls to admin routes return the
  standard WordPress `rest_forbidden` 401, i.e. permission callbacks are
  capability checks evaluated against the authenticated user, exactly like
  the Fluent products.
- **Namespace:** `https://<site>/wp-json/wpsocialreviews/v2` (the plugin's
  slug is `wp-social-reviews`; the Pro add-on registers its routes under the
  same namespace at `/pro/…`).
- **Model:** HTTP Basic `username:application_password` — standard WordPress
  **Application Passwords** for a user with WP Social Ninja capabilities
  (`manage_options`-level admin, or a WP Social Ninja Pro manager).
- **Scoping:** WP Social Ninja Pro's Managers feature (Settings → Managers,
  exposed here as `social_settings_list_managers` etc.) is the
  least-privilege option — an Application Password for a manager user scopes
  the API to their permissions.

## Fluent Forms

- **Source:** <https://developers.fluentforms.com/api/endpoints/> (generated
  index: [`fluentforms.md`](./fluentforms.md)), cross-checked against the
  plugin source and a live install.
- **Namespace:** `https://<site>/wp-json/fluentform/v1`
- **Model:** HTTP Basic `username:application_password` — standard WordPress
  **Application Passwords**.
- **Note on the docs:** every Fluent Forms endpoint page shows
  `-H 'X-WP-Nonce: <nonce>'` and says "Auth: X-WP-Nonce header". **That is
  not a second auth model and it does not apply to Application Passwords.**
  It describes how the wp-admin UI calls the API: that client is
  cookie-authenticated, and WordPress requires a nonce for cookie auth. The
  routes' own permission callbacks are pure capability checks — every policy
  resolves to `Acl::hasPermission()` → `current_user_can()` — and
  `Acl::verifyNonce()` returns early unless `wp_doing_ajax()`, so no nonce is
  ever checked on a REST request. Verified in
  `app/Http/Policies/*.php` and `app/Modules/Acl/Acl.php` (v6.x).
- **Method override:** the docs also mention sending `PUT`/`PATCH`/`DELETE`
  as `POST` with `X-HTTP-Method-Override`. Those methods are registered
  natively; the override is only a fallback for hosts that block them, and
  this server does not use it.
- **Scoping:** Fluent Forms Managers (Fluent Forms → Settings → Managers,
  exposed as `forms_admin_list_managers` etc.) with per-form permissions are
  the least-privilege option; an Application Password for a manager user
  scopes the API to their forms.
- **Exception:** `POST /form-submit` is public (`PublicPolicy` returns true) —
  it is the endpoint the front-end form posts to, and it creates a real
  submission plus all of its side effects.

## FluentCommunity

- **Source:** no REST API reference is published (docs.fluentcommunity.co is
  end-user documentation); verified against a live install and the plugin
  source. Generated index: [`fluentcommunity.md`](./fluentcommunity.md).
- **Namespace:** `https://<site>/wp-json/fluent-community/v2`
- **Model:** HTTP Basic `username:application_password` — standard WordPress
  **Application Passwords**, capability-checked per route.
- **Member context — the thing to know before writing.** Unlike the other
  products, whose write endpoints are administrative, much of
  FluentCommunity's surface acts *as the authenticated user*: creating a post
  or comment, reacting, joining or leaving a space, sending a chat message,
  enrolling in a course, following or blocking a member. Called with an admin
  application password, those act as that admin's persona and are visible to
  the community. Member-context writes are not "admin operations that happen
  to touch member data" — they put words in a real account's mouth, so treat
  the identity of the credential as part of the blast radius.
- **Scoping:** FluentCommunity Managers (exposed as
  `community_admin_list_managers` etc.) are the least-privilege option; an
  Application Password for a manager user scopes the API to their
  permissions.

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
