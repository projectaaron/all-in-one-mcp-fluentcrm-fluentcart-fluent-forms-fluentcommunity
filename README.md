# All-In-One MCP for Fluent Suite

[![Sponsored by upfluent.io](https://img.shields.io/badge/sponsored%20by-upfluent.io-2563eb)](https://upfluent.io)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Tools](https://img.shields.io/badge/tools-1%2C290-informational)](docs/TOOL_MAP.md)

**Let your AI assistant run your WordPress business** — the CRM, the store,
the forms, the community — through one safe, complete
[MCP](https://modelcontextprotocol.io) server.

All-In-One MCP for Fluent Suite connects Claude (or any MCP client) to the WPManageNinja plugin
suite on your WordPress site: **[FluentCRM](https://fluentcrm.com/?ref=4618)**,
**[FluentCart](https://fluentcart.com/?by=272)**,
**[Fluent Forms](https://fluentforms.com/?ref=4618)**,
**[FluentCommunity](https://fluentcommunity.co/?ref=4618)**, and
**[WP Social Ninja](https://wpsocialninja.com/?ref=4618)**. Every one of their **1,290
documented REST endpoints** is its own clearly named tool
(`crm_contacts_list`, `cart_orders_refund`, `forms_submissions_list`,
`community_spaces_list`, …), a built-in `tool_map` answers "which tool do I
need?" in one call, partial updates can't silently wipe data, and every risky
operation is confirm-gated.

> "How did the store do this week versus last week?" ·
> "Find jane@example.com — what has she bought, and is she on the newsletter?" ·
> "Tag everyone who bought the spring course with `course-buyer`." ·
> "Draft a campaign to the `vip` list from the welcome template — don't send it." ·
> "Order #1042 shipped today, update its status." ·
> "Preview when each email in sequence 12 will go out for someone who enrols
> Monday at 9am."

Products you don't configure are simply switched off — run it with just
FluentCRM, or all five.

**Free, MIT-licensed, sponsored by [upfluent.io](https://upfluent.io).**
Developers: clone this repo. Everyone else: grab the one-click Claude Desktop
extension from [upfluent.io](https://upfluent.io) — it's the same code,
already built.

**Not affiliated with WPManageNinja.** All-In-One MCP for Fluent Suite and upfluent.io are an
independent community project, not associated with, endorsed by, or
supported by WPManageNinja. It is offered free and in good faith to help
Fluent users get more from the plugins they already own. You use it at your
own risk — read the [Disclaimer](#disclaimer). WPManageNinja also ships its
own first-party MCP via [FluentHub](https://wpmanageninja.com/fluenthub-mcp/);
see [How this differs](#how-this-differs-from-fluenthubs-mcp).

---

## Contents

- [Requirements](#requirements)
- [Install](#install) — desktop extension · config file · remote connector
- [Configuration](#configuration)
- [How the tools work](#how-the-tools-work)
- [Safety](#safety)
- [The products and their tools](#the-products-and-their-tools)
- [API references](#api-references)
- [Troubleshooting](#troubleshooting)
- [Security model](#security-model)
- [Development](#development)
- [Support this project](#support-this-project)
- [Disclaimer](#disclaimer)
- [License](#license)

---

## Requirements

- A WordPress site running one or more of
  [FluentCRM](https://fluentcrm.com/?ref=4618),
  [FluentCart](https://fluentcart.com/?by=272),
  [Fluent Forms](https://fluentforms.com/?ref=4618),
  [FluentCommunity](https://fluentcommunity.co/?ref=4618),
  [WP Social Ninja](https://wpsocialninja.com/?ref=4618) (free or Pro —
  Pro-only endpoints simply return 404 without the Pro plugin).
- A WordPress user with admin (or the plugin's manager) capabilities, and an
  **Application Password** for that user: *WP Admin → Users → your user →
  Application Passwords → Add New*. One password covers every product.
- For options B and C: **Node 20.6+**.

---

## Install

Three ways to run it — pick by where you want to use your assistant:

| | Works in | Setup |
|---|----------|-------|
| **A. Desktop extension** (`.mcpb`) | Claude **Desktop** conversations | Drag & drop, fill in a form |
| **B. Config file** | Claude Code, Cursor, any local MCP client | JSON snippet + `.env` |
| **C. Remote connector** | **Everywhere** — claude.ai web, mobile, desktop | Host it once (free on Cloudflare), add the URL under Settings → Connectors |

### A — Claude Desktop extension

1. Get `fluentmcp-<version>.mcpb` — free from [upfluent.io](https://upfluent.io),
   from the [Releases](../../releases) page, or build it yourself:

   ```bash
   git clone https://github.com/projectaaron/fluentMCP.git
   cd fluentMCP
   npm install
   npm run pack:extension      # produces fluentmcp.mcpb
   ```

2. Claude Desktop → **Settings → Extensions** → drag the `.mcpb` file in.
3. Fill in the form: site URL (the root, not `/wp-admin`), username,
   Application Password. Claude Desktop stores the password as a sensitive
   value.
4. Ask Claude: *"Run verify_setup."*

### B — Any MCP client (config file)

```bash
git clone https://github.com/projectaaron/fluentMCP.git
cd fluentMCP
npm install && npm run build
cp .env.example .env        # fill in FLUENT_SITE_URL, FLUENT_API_USERNAME, FLUENT_API_PASSWORD
```

**Claude Code** — `.mcp.json` in your project (or `~/.claude.json`):

```json
{
  "mcpServers": {
    "fluentmcp": {
      "command": "node",
      "args": ["--env-file=/absolute/path/to/fluentMCP/.env", "/absolute/path/to/fluentMCP/dist/index.js"]
    }
  }
}
```

**Claude Desktop (manual), Cursor, others** — the same block in that client's
MCP config. Prefer explicit env over a `.env` file? Drop the `--env-file`
argument and add an `"env"` object with the three variables.

Restart the client and ask it to run **`verify_setup`**, or run the read-only
smoke test: `node --env-file=.env scripts/smoke-test.mjs`.

### C — Remote connector (web, mobile, desktop)

Host it once; every Claude surface gets the tools. The easiest host is
**Cloudflare Workers** (free tier, nothing to keep running). From a clone:

```bash
npm install
npx wrangler login
npx wrangler secret put FLUENT_SITE_URL
npx wrangler secret put FLUENT_API_USERNAME
npx wrangler secret put FLUENT_API_PASSWORD
npx wrangler secret put FLUENT_MCP_TOKEN     # paste the output of: openssl rand -hex 32
npm run deploy:cloudflare
```

Then claude.ai → **Settings → Connectors → Add custom connector** →
`https://fluentmcp.<your-subdomain>.workers.dev/mcp/<token>`.
**The URL contains your secret — treat it like a password.**

Cloudflare Tunnel, Docker, any Node host, and a GitHub Actions deploy are
covered in **[docs/REMOTE.md](docs/REMOTE.md)**.

---

## Configuration

All settings are environment variables (`.env.example` documents every one).

| Variable | Required | Meaning |
|----------|----------|---------|
| `FLUENT_SITE_URL` | yes | Your WordPress site root, e.g. `https://example.com` |
| `FLUENT_API_USERNAME` / `FLUENT_API_PASSWORD` | yes | The WordPress user and its Application Password — enables every installed product |
| `FLUENTCRM_API_*`, `FLUENTCART_API_*`, `FLUENTFORMS_API_*`, `FLUENTCOMMUNITY_API_*`, `WPSOCIALNINJA_API_*` | no | Per-product credential overrides (a different, more limited user per product) |
| `FLUENT_TOOL_MODE` | no | `individual` (default, one tool per operation) or `grouped` (one tool per area with an `action` parameter — for clients that struggle with large tool lists) |
| `FLUENT_LOCKED_TOOLS` | no | Admin-locked tools that refuse unconditionally: `default` (see [Safety](#safety)), a replacement list, `default,extra_tool`, or `none` |
| `FLUENT_MCP_TOKEN` | remote only | Shared secret for remote mode, 16+ characters |
| `PORT`, `FLUENT_MCP_HOST` | remote only | Listen port (3000) and bind address (0.0.0.0) |
| `FLUENT_HTTP_TIMEOUT_MS`, `FLUENT_HTTP_MAX_RETRIES` | no | HTTP tuning (30000 ms, 3 retries with backoff; writes are never blindly retried) |

---

## How the tools work

**One tool = one operation**, named `<area>_<operation>`. The area is the
part of your business it touches (`crm_contacts`, `cart_orders`,
`forms_submissions`, …); the operation says what it does. Each tool's schema
contains only the parameters that operation needs — record IDs are named,
required fields, so there is nothing to guess:

```json
{ "name": "cart_orders_list",   "arguments": { "per_page": 5 } }
{ "name": "cart_orders_get",    "arguments": { "order_id": 1042 } }
{ "name": "crm_contacts_create","arguments": { "body": { "email": "new@example.com" } } }
{ "name": "cart_orders_refund", "arguments": { "order_id": 1042, "confirm": true } }
```

**The fast map.** Not sure which tool? One call answers it:

| Call | Returns |
|------|---------|
| `tool_map` | The whole surface at a glance — one line per area with tool counts |
| `tool_map {"area": "crm_contacts"}` | Every tool in that area with its required parameters |
| `tool_map {"search": "refund"}` | Every tool matching a keyword |

The same map ships as [`docs/TOOL_MAP.md`](docs/TOOL_MAP.md), and a summary
reaches every session automatically through the MCP `instructions` field.

**Shared parameters, everywhere:**

| Parameter | What it does |
|-----------|--------------|
| `query` | Filters, search, sorting — `{"search": "jane"}` |
| `body` | The data for create/update tools |
| `page` / `per_page` | List pagination — 20 per page by default |
| `detail` / `fields` | Responses are **compact summaries by default**. `detail: "full"` returns the complete record; `fields: ["id","status"]` returns exactly those columns |
| `confirm` | `true` to execute a destructive (⚠) tool, or a `mode: "replace"` write |
| `mode` | On updates with a paired read: `merge` (default) or `replace` — see below |
| `dry_run` | Preview any write without touching data |
| `if_unmodified_since` | Optimistic concurrency: refuse the write if the record changed since you read it |

---

## Safety

This is the part that makes it usable for real operations rather than demos.

**Writes describe what they did.** The Fluent plugins treat updates as full
replaces — omit a field and it's cleared, with a 200 either way. All-In-One MCP for Fluent Suite
closes that at the executor:

- **Merge mode (default)** on every update that has a matching read
  (`crm_contacts_update`, `cart_coupons_update`, `crm_sequences_update_email`,
  27+ more): the current record is read, your partial body is deep-merged
  onto it, and only then is it written. Omitted fields survive.
  `mode: "replace"` restores full-replace semantics and requires `confirm`.
- **Verification** after every such write: the record is re-read and diffed.
  The response carries `changed` (every field that actually changed) and
  `warnings` — fields that changed without being in your request, or fields
  you sent that didn't take effect. A write the plugin silently ignored
  returns an **error**, not `ok: true`.
- **`dry_run: true`** on every write returns exactly what would be sent (and
  the computed diff) without touching anything.
- **Read-back guards** on endpoints that store anything and validate nothing
  (Fluent Forms integration feeds): the body is checked against what the
  plugin advertises *before* writing, and the stored record is returned
  *after* — if the plugin doesn't list it, the tool errors.

**Nothing irreversible runs by accident.** 203 operations are classified
destructive (⚠ in the map): deletes, refunds, cancels, bulk actions, resets,
mass sends, plugin installs and activations, manager/permission grants,
API-key minting, and the public form-submit that fires real notifications. Called without `confirm: true`, the tool refuses, does
nothing, and explains what would have happened. Annotations are accurate per
operation — every read-only tool really is `readOnlyHint: true`.

**Some things no agent should ever do.** Twelve operations are locked by
default and refuse even with `confirm: true`: full CRM wipe
(`crm_settings_reset_database`), audience-wide contact delete, REST-key
creation and deletion, the test delete resolver, payment-method disconnect,
license-key regeneration, WP Social Ninja's delete-all-data, and the plugin
installers in Fluent Forms and FluentCart (they fetch and run new code on
your site). They stay visible (🔒 in the map) so sessions get a clear refusal
instead of a mystery. Adjust with `FLUENT_LOCKED_TOOLS`.

**Keep your client on "ask" for writes.** The server does its part; the
human-in-the-loop is your MCP client's approval prompt.

- **Claude Desktop:** choose "Allow once" rather than "Always allow" for
  anything that isn't read-only.
- **Claude Code:** don't allowlist `mcp__fluentmcp__*`; to force asking, add
  `{ "permissions": { "ask": ["mcp__fluentmcp__*"] } }` to
  `.claude/settings.json`.

---

## The products and their tools

73 areas. Every individual tool is one line in
[`docs/TOOL_MAP.md`](docs/TOOL_MAP.md); area-level examples in
[`docs/TOOL_CATALOG.md`](docs/TOOL_CATALOG.md); the endpoint inventory per
product in [`docs/api-reference/`](docs/api-reference/). Request/response
schemas are WPManageNinja's own documentation and are not mirrored here —
see [API references](#api-references).

### Built-in

| Tool | What it does |
|------|--------------|
| `tool_map` | The fast map — call this first when unsure |
| `verify_setup` | Checks site URL, each product's credentials and plugin, one harmless read per product |
| `wp_media_upload_from_url` / `wp_media_get` / `wp_media_list` | The WordPress media library; sideload an image from a URL and get the attachment ID |

### [FluentCRM](https://fluentcrm.com/?ref=4618) — `crm_*` (23 areas, 366 tools)

| Area | What it manages |
|------|-----------------|
| `crm_contacts` | Subscribers: find, create, update, delete; notes, tags, lists, email history |
| `crm_companies` | Companies, their notes, and member contacts |
| `crm_lists` · `crm_tags` · `crm_segments` · `crm_custom_fields` · `crm_labels` | Audience organization |
| `crm_campaigns` | One-off email campaigns: create, schedule⚠, send, pause, analyze, resend⚠ |
| `crm_recurring_campaigns` · `crm_sequences` · `crm_templates` · `crm_sms` | Recurring campaigns, drip sequences, templates, SMS (Pro) |
| `crm_automations` · `crm_forms` · `crm_webhooks` · `crm_smart_links` | Funnels, opt-in forms, incoming webhooks, smart links |
| `crm_email_patterns` | Reusable email content patterns and categories |
| `crm_ai` | FluentCRM's AI assistant: generate/rewrite text, email bodies, contact summaries; provider settings |
| `crm_reports` · `crm_abandoned_carts` | Read-only analytics |
| `crm_settings` · `crm_settings_pro` · `crm_utilities` | Settings, license, DB index health, MCP adapter, imports, exports, migrations |

**Extras beyond the API:** `crm_sequences_preview_schedule` computes when
every email in a sequence will send for a hypothetical enrolment (delays are
absolute from enrolment, a common surprise); `crm_sequences_validate` lints
timing configuration; `crm_sequences_bulk_update_emails` updates many emails
in one call with per-row verification.

### [FluentCart](https://fluentcart.com/?by=272) — `cart_*` (25 areas, 436 tools)

| Area | What it manages |
|------|-----------------|
| `cart_products` · `cart_product_variants` · `cart_product_assets` · `cart_labels_attributes` · `cart_files` | Catalog, variations, stock, downloadable files |
| `cart_orders` · `cart_subscriptions` · `cart_coupons` · `cart_customers` | Sales: orders, refunds⚠, subscriptions, coupons, customers |
| `cart_tax` · `cart_shipping` · `cart_settings` · `cart_email_notifications` · `cart_integrations` | Configuration |
| `cart_order_bumps` · `cart_roles` · `cart_licensing` | Pro: order bumps, shop roles, software licensing |
| `cart_inventory` · `cart_data_export` · `cart_pdf_templates` | Stock levels and adjustments, batch data exports, PDF receipt templates |
| `cart_reports` · `cart_utilities` · `cart_storefront` | Analytics, dashboard, saved views, public storefront |
| `cart_checkout` · `cart_customer_portal` | Customer-session endpoints — need a browser cookie, mostly rejected under admin credentials ([why](docs/api-reference/auth.md)) |

### [Fluent Forms](https://fluentforms.com/?ref=4618) — `forms_*` (7 areas, 91 tools)

| Area | What it manages |
|------|-----------------|
| `forms_forms` | Forms: CRUD, duplicate, convert, fields, shortcodes, embed pages, edit history |
| `forms_submissions` | Entries: list, notes, logs, statuses, favorites, bulk actions⚠, the public submit⚠ |
| `forms_settings` | Per-form settings: confirmations, notifications (`meta_key`), restrictions, customizer |
| `forms_integrations` | Global and per-form integration feeds — with a read-back guard against misnamed feeds |
| `forms_reports` | Read-only analytics |
| `forms_admin` · `forms_utilities` | Global settings, licensing, managers, roles, logs, search |

### [FluentCommunity](https://fluentcommunity.co/?ref=4618) — `community_*` (8 areas, 274 tools)

| Area | What it manages |
|------|-----------------|
| `community_spaces` | Spaces, space groups, membership, lock screens, paywalls |
| `community_feeds` | Posts, comments, reactions, bookmarks, surveys, documents, scheduled posts, moderation |
| `community_chat` | Threads, groups, messages |
| `community_courses` | Courses, sections, lessons, students, quizzes, progress |
| `community_profiles` | Profiles, follows, blocks, invitations, notifications, leaderboard |
| `community_analytics` | Read-only analytics |
| `community_settings` · `community_admin` | Portal settings, licensing, managers, webhooks, topics, badges |

> Many FluentCommunity tools act **as the configured user** — posting,
> commenting, joining, messaging. Under an admin credential that is the
> admin's own persona, publicly. See [auth.md](docs/api-reference/auth.md).

### [WP Social Ninja](https://wpsocialninja.com/?ref=4618) — `social_*` (9 areas, 126 tools)

| Area | What it manages |
|------|-----------------|
| `social_reviews` · `social_testimonials` | Collected reviews and hand-written testimonials, statuses, categories |
| `social_templates` | Review and feed widget templates |
| `social_platforms` | Platform connections (Google, Facebook, Instagram, …) and syncing |
| `social_chat_widgets` · `social_notifications` · `social_shoppable` | Chat widgets, sales notifications, shoppable Instagram |
| `social_settings` · `social_collection` | Settings, managers, and the Pro review-collection surface |

---

## API references

This project passes requests through to REST APIs that WPManageNinja
documents publicly. The schemas live with them, not here:

| Product | Developer docs |
|---------|----------------|
| FluentCRM | [developers.fluentcrm.com/rest-api](https://developers.fluentcrm.com/rest-api/) · [GitHub](https://github.com/WPManageNinja/fluentcrm-api-doc) |
| FluentCart | [dev.fluentcart.com/restapi](https://dev.fluentcart.com/restapi/) · [GitHub](https://github.com/WPManageNinja/fluent-cart-dev-docs) |
| Fluent Forms | [developers.fluentforms.com/api/endpoints](https://developers.fluentforms.com/api/endpoints/) |
| FluentCommunity | [GitHub: fluent-community-developer-docs](https://github.com/WPManageNinja/fluent-community-developer-docs) |
| WP Social Ninja | [GitHub: wpsocialninja-docs](https://github.com/WPManageNinja/wpsocialninja-docs) |

All of WPManageNinja's public repositories: <https://github.com/WPManageNinja>.
`docs/api-reference/<product>.md` in this repo is an inventory (method, path,
one-line summary per endpoint) that the tool surface is generated from.

## How this differs from FluentHub's MCP

WPManageNinja's own [FluentHub MCP](https://wpmanageninja.com/fluenthub-mcp/)
is a WordPress plugin exposing a curated set of tools (around 20 per
product). All-In-One MCP for Fluent Suite runs outside WordPress and covers the **entire** REST
surface of each product — 1,290 operations — with the write-safety machinery
above. Use FluentHub if you want the vendor-supported basics with no extra
install; use All-In-One MCP for Fluent Suite if you want everything the admin UI can do, with
merge/verify/dry-run guarantees and a per-operation safety policy you
control.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| `verify_setup` says `not configured` | Credentials blank for that product |
| 401 | Wrong or revoked credentials — create a fresh Application Password |
| 403 | The user lacks the plugin capability — or it's a customer-session tool (`cart_checkout_*`, `cart_customer_portal_*`) |
| 404 | Plugin not active, wrong site URL (use the root), or a Pro endpoint without Pro |
| 429 | The server retries with backoff; persistent 429s mean the site's limits need raising |
| A write returned an error saying the record "did not change" | The plugin ignored the body — read the tool's description for the expected shape (`bodyNote`), read the record first, and mirror it |
| Extension won't start | Rebuild after changes: `npm run pack:extension`, remove and re-add |

---

## Security model

- The server is a stateless proxy; it stores nothing and holds one secret —
  your Application Password (plus the token in remote mode). Every request
  is authorized by WordPress and the plugin's own capability checks as that
  user.
- **Use a dedicated WordPress user** with the minimum capabilities and
  revoke its password if anything leaks.
- Remote mode: HTTPS only, constant-time token comparison, 16-character
  minimum, `/healthz` reveals nothing.
- Media sideloading refuses private, loopback, link-local and cloud-metadata
  addresses and never forwards your site credentials to the fetched URL.
- Credentials never appear in logs, errors, or tool results.

Full notes and how to report a vulnerability: [SECURITY.md](SECURITY.md).

---

## Development

```bash
npm test                       # 380+ unit tests, mocked HTTP — no site needed
npm run build
npm run gen:catalog            # regenerate TOOL_MAP.md / TOOL_CATALOG.md / manifest sync
npm run gen:docs               # re-scrape the FluentCRM/FluentCart OpenAPI references
node scripts/gen-<product>-docs.mjs --site https://your-site   # products without OpenAPI: live route check
npm run pack:extension         # build fluentmcp.mcpb (the release workflow does this on every v* tag)
npx @modelcontextprotocol/inspector node dist/index.js
```

Project layout: [`docs/PROJECT_MAP.md`](docs/PROJECT_MAP.md) ·
Design rationale: [`docs/TOOL_DESIGN.md`](docs/TOOL_DESIGN.md) ·
Decision log: [`docs/DECISIONS.md`](docs/DECISIONS.md) ·
Adding a product: [`docs/EXTENDING.md`](docs/EXTENDING.md) ·
Contributing: [`CONTRIBUTING.md`](CONTRIBUTING.md)

## Support this project

All-In-One MCP for Fluent Suite is free and MIT-licensed, and will stay that way. Development is
sponsored by **[upfluent.io](https://upfluent.io)**, which also hosts the
ready-built desktop extension. If the project saves you time, three things
help keep it maintained:

- **Buy the plugins through the links in this README.** The FluentCRM,
  FluentCart, Fluent Forms, FluentCommunity and WP Social Ninja links above
  are affiliate links: you pay the same price, and WPManageNinja pays the
  maintainer a referral commission. That is the main way this project earns
  anything. The same applies to the rest of their suite if you need it:
  [Fluent Support](https://fluentsupport.com/?ref=4618),
  [FluentBooking](https://fluentbooking.com/?ref=4618),
  [FluentBoards](https://fluentboards.com/?ref=4618),
  [Paymattic](https://paymattic.com/?ref=4618),
  [Ninja Tables](https://ninjatables.com/?ref=4618),
  [FluentAffiliate](https://fluentaffiliate.com/?ref=4618),
  [FluentPlayer](https://fluentplayer.com/?ref=4618),
  [AzonPress](https://azonpress.com/?ref=4618).
- **Star the repo and report what breaks.** An issue with the tool name,
  the arguments (redact anything private) and the response you got is how
  most of the plugin-quirk guards in `docs/DECISIONS.md` were found.
- **Sponsor** via the *Sponsor* button at the top of the repository.

## Disclaimer

**Independent project.** All-In-One MCP for Fluent Suite and [upfluent.io](https://upfluent.io)
are not associated with, endorsed by, sponsored by, or supported by
WPManageNinja or any of its products. FluentCRM, FluentCart, Fluent Forms,
FluentCommunity, WP Social Ninja, FluentHub and the other WPManageNinja
names are trademarks of their respective owners and are used here only to
describe what this software connects to. If you have a problem with a
WPManageNinja plugin itself, their support is the right place; if you have a
problem with this connector, open an issue here.

**Made in good faith, for the community.** This project exists to help
Fluent users get more from the plugins they already own. It is built by
reading the plugins' own public REST APIs and passing requests through to
them. It does not modify, bypass or reverse-engineer the plugins, and every
request runs under the WordPress permissions of the user you configure.

**Use at your own risk.** This software gives an AI assistant the ability to
read, create, change and delete real data on your WordPress site — contacts,
orders, refunds, campaigns, form entries, community posts and settings. The
confirm gates, locked tools and honest annotations described under
[Safety](#safety) reduce the chance of an accident; they do not remove it.
You are responsible for: the credentials you hand it and their scope; what
you approve when your assistant asks; keeping backups; how you use the data
you access through it; and compliance with the laws that apply to your
business (email consent, privacy, payments and so on). Test against a
staging site before pointing it at production.

**No warranty, no liability.** The software is provided "as is", without
warranty of any kind, as stated in the [MIT license](LICENSE). The authors,
maintainers and sponsors are not responsible for any loss, damage, data
change, or consequence arising from its use, and are not responsible for how
others use, modify or redistribute it. If those terms don't work for you,
don't use it.

## License

[MIT](LICENSE). FluentCRM, FluentCart, Fluent Forms, FluentCommunity, WP
Social Ninja and FluentHub are trademarks of their respective owners; this
project is not affiliated with, endorsed by, or supported by WPManageNinja.
See the [Disclaimer](#disclaimer).
