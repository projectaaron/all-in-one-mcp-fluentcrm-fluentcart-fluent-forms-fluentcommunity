# All-In-One MCP for Fluent Suite: FluentCRM, FluentCart, Fluent Forms, FluentCommunity & WP Social Ninja

[![Sponsored by upfluent.io](https://img.shields.io/badge/sponsored%20by-upfluent.io-2563eb)](https://upfluent.io)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Tools](https://img.shields.io/badge/tools-1%2C299-informational)](docs/TOOL_MAP.md)
[![Latest release](https://img.shields.io/github/v/release/projectaaron/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity?label=download)](https://github.com/projectaaron/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity/releases/latest)

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

**Open source (MIT), sponsored by [upfluent.io](https://upfluent.io).**
Developers: clone this repo. Everyone else: grab the one-click Claude Desktop
extension from [upfluent.io](https://upfluent.io) — it's the same code,
already built.

> **Free for a limited time.** The ready-built extension is being given away
> during the early-access period while the project finds its footing. It will
> not stay free forever — a paid license is planned once it leaves early
> access. Grab it now and the build you download is yours to keep.

**Not affiliated with WPManageNinja.** All-In-One MCP for Fluent Suite and upfluent.io are an
independent community project, not associated with, endorsed by, or
supported by WPManageNinja. It is offered in good faith to help
Fluent users get more from the plugins they already own. You use it at your
own risk — read the [Disclaimer](#disclaimer). WPManageNinja also ships its
own first-party MCP via [FluentHub](https://wpmanageninja.com/fluenthub-mcp/);
see [How this compares](#how-this-compares-to-the-native-fluent-mcps).

---

## Contents

- [Requirements](#requirements)
- [Install](#install) — desktop extension · config file · remote connector
- [Configuration](#configuration)
- [How the tools work](#how-the-tools-work)
- [Safety](#safety)
- [The products and their tools](#the-products-and-their-tools)
- [Roadmap: more Fluent products](#roadmap-more-fluent-products)
- [API references](#api-references)
- [How this compares to the native Fluent MCPs](#how-this-compares-to-the-native-fluent-mcps)
- [Other AI clients](#other-ai-clients)
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
- Your site must use **https://** (WordPress only offers Application
  Passwords over HTTPS) and **Settings → Permalinks** must not be "Plain".
- A **separate WordPress user just for Claude** (recommended) and an
  **Application Password** for it:
  1. *Users → Add New User*: give it a username such as `claude`, an
     email address you control (WordPress needs one that differs from
     your own account's), and the **Administrator** role.
  2. *Users → All Users*, edit that user, scroll to **Application
     Passwords**, type a name such as *Claude*, click **Add New
     Application Password**, and copy the password shown (it is shown
     once; the spaces are fine). One password covers every product.

  If you ever need to cut off access, revoke that password or delete the
  user — your own login is untouched.
- **Option A needs nothing else installed** — Claude Desktop (current
  version, macOS or Windows) runs the extension with its own built-in
  Node.js. Options B and C need **Node 20.6+**.

---

## Install

Three ways to run it — pick by where you want to use your assistant:

| | Works in | Setup |
|---|----------|-------|
| **A. Desktop extension** (`.mcpb`) | Claude **Desktop** conversations | Drag & drop, fill in a form |
| **B. Config file** | Claude Code, Cursor, any local MCP client | JSON snippet + `.env` |
| **C. Remote connector** | **Everywhere** — claude.ai web, mobile, desktop | Host it once (Cloudflare Workers Paid, $5/month), add the URL under Settings → Connectors |

### A — Claude Desktop extension

1. Download it — free for a limited time — from
   [upfluent.io](https://upfluent.io/all-in-one-mcp-for-fluent-suite/), or
   `all-in-one-mcp-for-fluent-suite-latest.zip` from the
   [latest release](https://github.com/projectaaron/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity/releases/latest).
   Double-click the ZIP to unzip it and find `fluentmcp-<version>.mcpb`
   inside. (Developers can build it instead — see [Development](#development).)
2. In Claude Desktop open **Settings → Extensions**, drag the `.mcpb` file
   into the window, and click **Install**.
3. Fill in the form: your site URL **including https://** (the home page
   address, e.g. `https://example.com` — not the `/wp-admin` address), your
   Claude user's username, and its Application Password. Claude Desktop stores
   the password as a sensitive value.
4. Start a new chat and ask Claude: *"Run verify_setup."* You should see ✅
   next to each Fluent plugin you have; plugins you don't have show ⏭️ and
   are simply skipped.

### B — Any MCP client (config file)

```bash
git clone https://github.com/projectaaron/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity.git
cd all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity
npm install && npm run build
cp .env.example .env        # fill in FLUENT_SITE_URL, FLUENT_API_USERNAME, FLUENT_API_PASSWORD
```

**Claude Code** — `.mcp.json` in your project (or `~/.claude.json`):

```json
{
  "mcpServers": {
    "fluentmcp": {
      "command": "node",
      "args": ["--env-file=/absolute/path/to/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity/.env", "/absolute/path/to/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity/dist/index.js"]
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
**Cloudflare Workers** — nothing to keep running. It needs the **Workers
Paid plan ($5/month)**: each request builds the full tool set, which takes
well over the Free plan's 10 ms CPU limit (a live deployment measured a
95 ms median), so on the Free plan requests fail with error 1102.

This path uses a terminal. You need Node 20.6+ and a Cloudflare account:

```bash
git clone https://github.com/projectaaron/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity.git
cd all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity
npm install
npx wrangler login
npx wrangler secret put FLUENT_SITE_URL
npx wrangler secret put FLUENT_API_USERNAME
npx wrangler secret put FLUENT_API_PASSWORD
npx wrangler secret put FLUENT_MCP_TOKEN     # paste a long random string, see below
npm run deploy:cloudflare
```

For the token, generate a random string with
`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
(works on macOS, Windows and Linux) and paste it when asked.

Then claude.ai → **Settings → Connectors → Add custom connector** →
`https://fluentmcp.<your-subdomain>.workers.dev/mcp/<token>`, where
`<token>` is the value you entered for `FLUENT_MCP_TOKEN`.
**The URL contains your secret — treat it like a password.**

Cloudflare Tunnel, Docker, any Node host, and a GitHub Actions deploy are
covered in **[docs/REMOTE.md](docs/REMOTE.md)**.

> **This does not go on your WordPress hosting.** The server is a Node.js
> app, and WordPress hosting runs PHP. It also never touches your database
> or files — it makes authenticated HTTPS calls to your site's REST API, the
> same way Claude Desktop does. Running it beside WordPress buys you nothing
> and adds a process next to your store.
>
> - **Managed WordPress hosts** (WP Engine, Kinsta's WP plans, Pressable,
>   Flywheel, SiteGround): not supported — PHP only, no long-running Node
>   process.
> - **cPanel shared hosting** with "Setup Node.js App": works. Point it at
>   `dist/remote.js`, set the four environment variables, serve it on a
>   subdomain. Watch the memory limit; the server registers ~1,300 tools.
> - **A VPS or any Node host**: works, and you maintain it.
> - **Cloudflare Workers**: nothing to keep running, recommended (Workers
>   Paid plan, $5/month — see above).
>
> If what you want is "runs inside WordPress with nothing else to host",
> that means a PHP plugin rather than this server — which is what
> WPManageNinja's own [FluentHub](https://wpmanageninja.com/fluenthub-mcp/)
> adapter does. See [How this compares](#how-this-compares-to-the-native-fluent-mcps).

---

## Configuration

All settings are environment variables (`.env.example` documents every one).

| Variable | Required | Meaning |
|----------|----------|---------|
| `FLUENT_SITE_URL` | yes | Your WordPress site root, e.g. `https://example.com` |
| `FLUENT_API_USERNAME` / `FLUENT_API_PASSWORD` | yes | The WordPress user and its Application Password — enables every installed product |
| `FLUENTCRM_API_*`, `FLUENTCART_API_*`, `FLUENTFORMS_API_*`, `FLUENTCOMMUNITY_API_*`, `WPSOCIALNINJA_API_*` | no | Per-product credential overrides (a different, more limited user per product) |
| `FLUENT_TOOL_MODE` | no | `individual` (default, one tool per operation) or `grouped` (one tool per area with an `action` parameter — for clients that cap the tool list, see [Other AI clients](#other-ai-clients)). Remote clients can also pick a mode per URL: `/mcp/<token>/grouped` |
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

**Nothing irreversible runs by accident.** 230 operations are classified
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
| `support_report` | A redacted, paste-ready diagnostic (version, transport, connection checks, the recent tool-call log with every error) for support requests and bug reports — see [Getting help](#getting-help) |
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

## Roadmap: more Fluent products

Covered today: FluentCRM, FluentCart, Fluent Forms, FluentCommunity and WP
Social Ninja. The rest of the WPManageNinja lineup, in the order they are
likely to land. Each product is a self-contained module (see
[`docs/EXTENDING.md`](docs/EXTENDING.md)), so adding one never touches the
core or the existing tools.

| Product | Status | What it would cover |
|---------|--------|---------------------|
| **Fluent Support** | Coming soon | Tickets, customers, agents, workflows, saved replies, reports |
| **FluentBooking** | Coming soon | Calendars, events, bookings, availability, hosts |
| **FluentBoards** | Coming soon | Boards, stages, tasks, comments, members, time tracking |
| **FluentAffiliate** | Coming soon | Affiliates, referrals, commissions, payouts |
| **Paymattic** | Planned | Payment forms, submissions, subscriptions, donors |
| **FluentSMTP** · **Ninja Tables** | Under consideration | Email log lookups; table data |
| **FluentInvoice** · **FluentMembers** | When released | Invoices and clients; memberships and content access |

Want one sooner? Open an issue and say which operations you need first; the
products with a published REST reference go fastest.

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

## How this compares to the native Fluent MCPs

WPManageNinja ships its own MCP servers, and they are good for what they
cover. This project exists because of what they don't: when the maintainer
tried to run a real business through them, several products had no MCP at
all, the ones that did were separate servers to install and connect one by
one, and many of the operations needed day to day were read-only or missing.
Rather than wait, this connector was built over the products' complete REST
APIs. The comparison below is factual as of September 2026; check the vendor
pages, since their coverage grows.

### Side by side

| | Native Fluent MCPs (FluentHub / per-product) | All-In-One MCP for Fluent Suite |
|---|---|---|
| **Runs where** | Inside WordPress, as plugin code (FluentHub or the WordPress MCP Adapter; needs WordPress 6.9+ for the Abilities API) | Outside WordPress: Claude Desktop extension, local Node process, or a Cloudflare Worker. Nothing installed on the site. |
| **Products covered** | FluentCRM, FluentCart, Fluent Forms, Fluent Support, FluentBoards. FluentCommunity and WP Social Ninja: none announced. | FluentCRM, FluentCart, Fluent Forms, FluentCommunity, WP Social Ninja. Fluent Support, FluentBooking, FluentBoards and FluentAffiliate coming soon (see [Roadmap](#roadmap-more-fluent-products)). |
| **Servers to connect** | One per product (Fluent Forms has its own; CRM/Cart/Support/Boards go through FluentHub, each with its own enable switch and snippet) | One. All five products behind one connector, one credential. Products you don't have are simply off. |
| **Tool count** | FluentCRM ~25 (some Pro-only) · FluentCart 30 · Fluent Forms 20 free / 23 Pro · Fluent Support ~20 | 1,299 tools: every one of the 1,290 documented endpoints plus 9 built-ins and helpers. CRM 366 (363 endpoints + 3 sequence helpers) · Cart 436 · Forms 91 · Community 274 · Social Ninja 126 |
| **Coverage model** | Curated: a hand-picked subset of common operations | Complete: every documented REST endpoint of each product, generated from the vendor's own API reference and re-checked weekly |
| **Writes** | Selected writes per product (e.g. Cart: order status, notes, refunds, customer create/update, subscription cancel, coupons, labels) | Every write the admin UI can do: create, update, delete, bulk actions, settings, automations, sequences, templates, integrations, licensing, courses, spaces, chat, reviews, and so on |
| **Explicitly not exposed natively** | FluentCart: settings, shipping, tax, licensing administration, email templates. FluentCRM: templates, forms, webhooks, settings, SMS, reports (per the vendor's own write-ups). Fluent Forms: form settings beyond styling and notifications, integrations beyond listing | All of those, plus the rest of each REST surface |
| **Partial updates** | Tool-specific | Merge by default on every update: the record is read, your fields are merged in, written, re-read and diffed. Omitted fields survive. `mode:"replace"` is explicit and confirm-gated. |
| **Safety** | Preview-then-confirm on selected sensitive actions (refunds, cancellations); permissions inherited from the WordPress user | `confirm:true` gate on 230 destructive or privilege-changing operations, 12 locked outright, `dry_run` on every write, post-write verification, read-back guards, per-operation policy you control via `FLUENT_LOCKED_TOOLS`; permissions likewise inherited from the WordPress user |
| **Auth** | WordPress Application Password | WordPress Application Password (per product overrides optional) |
| **Where you can use it** | Claude Desktop, Claude Code, Cursor, Codex via HTTP to your site | Same clients, plus claude.ai web and mobile through the remote connector |
| **Price / license** | Free with the plugins (some tools Pro-only) | Source is MIT and open. The ready-built extension is free for a limited time during early access; a paid license is planned afterwards |
| **Support** | Vendor | Community; issues on GitHub |

### When to use which

Use the **native MCPs** if you want the vendor-supported basics for one
product, with nothing to host and nothing to configure beyond a toggle.
They are the right answer for "show me last week's orders" and "tag this
contact".

Use **this project** if you want one connector for the whole suite, need the
operations the native tools leave out, or want the write-safety guarantees
(merge, verify, dry-run, confirm and lock) applied uniformly to everything.
It is the right answer for "build the 37-email sequence", "reconcile the
integration feeds on every form", "set up the course, its sections and its
paywall", or anything else you would otherwise click through the admin UI to
do.

The two are not exclusive: they use the same Application Password model and
can be connected to the same site at the same time.

Sources: [FluentHub MCP](https://wpmanageninja.com/fluenthub-mcp/),
[Fluent Forms MCP server](https://fluentforms.com/fluent-forms-mcp-server/),
[FluentCart: Connecting AI assistants](https://docs.fluentcart.com/guide/settings-configuration/mcp),
[FluentCRM MCP](https://fluentcrm.com/blog/fluentcrm-mcp-and-what-it-means/).

---

## Other AI clients

This is a standard [Model Context Protocol](https://modelcontextprotocol.io)
server, so it works with every MCP-capable harness, not only Claude. Only
the `.mcpb` extension file is Claude Desktop-specific; the config-file
install ([B](#b--any-mcp-client-config-file)) and the remote connector
([C](#c--remote-connector-web-mobile-desktop)) work everywhere.

**Pick the tool mode for your client.** The default surface is 1,299 small
tools, which Claude handles well but many other clients cap or truncate.
`grouped` mode collapses the same operations into 79 tools (one per area,
an `action` parameter picks the operation, plus the built-ins) with identical
confirm gates, locks, `tool_map` and `support_report`.

| Client | Mode | How to connect |
|--------|------|----------------|
| Claude Desktop, Claude Code, claude.ai | `individual` (default) | See [Install](#install) |
| Cursor | `grouped` | `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project); Cursor warns above ~40 tools per server |
| VS Code (Copilot agent mode) | `grouped` | `.vscode/mcp.json`; Copilot caps a request at 128 tools |
| Windsurf, Cline, Roo Code, Continue | `grouped` | Their MCP settings file; same `mcpServers` shape as Cursor |
| ChatGPT (connectors / developer mode) | `grouped` | Remote URL ending in `/grouped`, see below |
| Gemini CLI | `grouped` | `~/.gemini/settings.json`, same `mcpServers` shape |
| Codex CLI | `grouped` | `~/.codex/config.toml`, see below |
| Zed, JetBrains AI, other stdio clients | try `individual`, fall back to `grouped` | The `command`/`args`/`env` block below |

Local clients set the mode with the `FLUENT_TOOL_MODE` variable. Remote
clients that only take a URL append `/grouped` to the connector URL
instead.

**Cursor, Windsurf, Cline, Gemini CLI** (`mcpServers` shape):

```json
{
  "mcpServers": {
    "fluentmcp": {
      "command": "node",
      "args": ["/absolute/path/to/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity/dist/index.js"],
      "env": {
        "FLUENT_SITE_URL": "https://example.com",
        "FLUENT_API_USERNAME": "your-wp-user",
        "FLUENT_API_PASSWORD": "xxxx xxxx xxxx xxxx xxxx xxxx",
        "FLUENT_TOOL_MODE": "grouped"
      }
    }
  }
}
```

**VS Code** (`.vscode/mcp.json`, note `servers` and `type`):

```json
{
  "servers": {
    "fluentmcp": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity/dist/index.js"],
      "env": {
        "FLUENT_SITE_URL": "https://example.com",
        "FLUENT_API_USERNAME": "your-wp-user",
        "FLUENT_API_PASSWORD": "xxxx xxxx xxxx xxxx xxxx xxxx",
        "FLUENT_TOOL_MODE": "grouped"
      }
    }
  }
}
```

**Codex CLI** (`~/.codex/config.toml`):

```toml
[mcp_servers.fluentmcp]
command = "node"
args = ["/absolute/path/to/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity/dist/index.js"]

[mcp_servers.fluentmcp.env]
FLUENT_SITE_URL = "https://example.com"
FLUENT_API_USERNAME = "your-wp-user"
FLUENT_API_PASSWORD = "xxxx xxxx xxxx xxxx xxxx xxxx"
FLUENT_TOOL_MODE = "grouped"
```

**ChatGPT and other URL-only clients** — host the remote connector
([C](#c--remote-connector-web-mobile-desktop)), then add the URL with the
mode suffix:

```
https://fluentmcp.<your-subdomain>.workers.dev/mcp/<token>/grouped
```

In ChatGPT: **Settings → Connectors → Create** (developer mode must be
enabled on the workspace), paste the URL, authentication "none" (the token
is in the URL). Clients that send the token as a `Bearer` header use
`https://…/mcp/grouped` instead. Without a suffix the URL serves the
default mode, so existing claude.ai connectors are unaffected.

**What to expect outside Claude**

- The confirm gate, locked tools and dry runs are enforced by the server,
  so they hold in every client. Some clients only show that a call failed
  rather than the refusal text; ask the assistant to read the tool result.
- The server's usage hints (`instructions`) are honoured by Claude, Cursor
  and VS Code; other clients rely on the tool descriptions alone, which
  are written to stand on their own.
- Every result carries its data as text as well as structured content, so
  clients on older protocol versions lose nothing.
- Ask the assistant to run `verify_setup` after connecting, and
  `support_report` if something misbehaves.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| `verify_setup` shows ⏭️ `not_installed` | That Fluent plugin isn't installed or active on your site. Expected — its tools are skipped |
| `verify_setup` says `not configured` | Credentials blank for that product |
| Every product fails, or "No Fluent plugin answered" | The site URL is wrong — use the home page address including `https://` — or **Settings → Permalinks** is set to "Plain" (pick any other option) |
| No **Application Passwords** section on your WordPress profile | The site must use `https://`. A security plugin may have turned them off — in Wordfence: *Login Security → Settings*, uncheck "Disable WordPress application passwords"; Solid Security and All-In-One WP Security have similar options. Some hosts turn them off too, so ask your host |
| 401 | Wrong or revoked credentials — create a fresh Application Password |
| 401 even with a fresh Application Password | Your host or firewall is stripping the `Authorization` header, or a security plugin blocks REST API logins. Ask your host to pass the header through |
| 403 | The user lacks the plugin capability — or it's a customer-session tool (`cart_checkout_*`, `cart_customer_portal_*`) |
| 404 | Plugin not active, wrong site URL (use the root), or a Pro endpoint without Pro |
| 429 | The server retries with backoff; persistent 429s mean the site's limits need raising |
| A write returned an error saying the record "did not change" | The plugin ignored the body — read the tool's description for the expected shape (`bodyNote`), read the record first, and mirror it |
| Extension won't start | Update Claude Desktop, then check **Settings → Extensions → All-In-One MCP for Fluent Suite** is enabled. If it still won't start, remove it and drag the `.mcpb` in again. (Built it yourself? Rerun `npm run pack:extension`.) |
| Error 1102 on the Cloudflare Worker | The Workers Free plan's 10 ms CPU limit — the remote connector needs Workers Paid |

### Getting help

If something keeps failing, reproduce it once, then ask your assistant:

> **Run support_report and show me the full output unchanged.**

The built-in `support_report` tool prints a Markdown block with the server
version and transport, the tool mode, which environment variables are set
(names only), the same connection checks as `verify_setup`, and the last 25
tool calls with their HTTP status, WordPress error code and message. Your
site's host name, usernames, passwords, tokens and email addresses are
masked before the report is produced, so it is safe to paste into a public
issue. Copy the whole block into a
[new issue](https://github.com/projectaaron/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity/issues/new)
together with what you asked the assistant to do and what you expected.

No GitHub account? Send the same block through the
[support form](https://upfluent.io/support/) or by email to
**support@upfluent.io**.

Options: `{"probe": false}` skips the live connection checks when the site
is unreachable; `{"calls": 100}` includes up to 100 recent calls. On the
Cloudflare Worker the log covers only the current request, so reproduce
the problem and ask for the report in the same message.

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

Build the Claude Desktop extension yourself:

```bash
git clone https://github.com/projectaaron/all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity.git
cd all-in-one-mcp-fluentcrm-fluentcart-fluent-forms-fluentcommunity
npm install
npm run pack:extension      # produces fluentmcp.mcpb
```

```bash
npm test                       # 440+ unit tests, mocked HTTP — no site needed
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

All-In-One MCP for Fluent Suite is open source under the MIT license, and the
source stays that way. The **ready-built desktop extension is free for a
limited time** while the project is in early access; a paid license is planned
once that period ends, and anything you have already downloaded keeps working.
Development is sponsored by **[upfluent.io](https://upfluent.io)**, which also
hosts the build. If the project saves you time, three things help keep it
maintained:

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
