# fluentMCP

Let your AI assistant run your WordPress store and CRM.

fluentMCP is an [MCP](https://modelcontextprotocol.io) server that connects
Claude (or any MCP client) to **FluentCRM**, **FluentCart**,
**WP Social Ninja**, and **Fluent Forms** by WPManageNinja. Once connected,
you can ask your assistant to look things up, create and update them, and run
your day-to-day operations — every one of the **917 documented REST
endpoints** is its own **individualized tool** with a clear name
(`crm_contacts_list`, `cart_orders_refund`, `social_reviews_list`,
`forms_submissions_list`, …), a built-in **`tool_map`** answers "which tool do
I need?" in one call, and every risky operation is safety-gated.

**Try asking things like:**

> - "How did the store do this week? Compare it to last week."
> - "Find the customer jane@example.com — what has she bought, and is she on
>   the newsletter list?"
> - "Tag everyone who bought the spring course with `course-buyer`."
> - "Draft a campaign to the `vip` list using the spring template — don't
>   send it yet."
> - "Order #1042 was shipped today — update its shipping status."
> - "Which coupons are active, and how much discount have they given out?"

Products you don't configure are simply switched off — you can run this with
just FluentCRM, just FluentCart, or both.

---

## Install

Three ways to run it — pick by where you want to use Claude:

| | Works in | Setup |
|---|----------|-------|
| **A. Desktop extension** (`.mcpb`) | Claude **Desktop app** conversations only | Drag & drop, fill a form |
| **B. Local config file** | Claude Code / any local MCP client | JSON snippet + `.env` |
| **C. Remote connector** | **Everywhere** — claude.ai web, mobile, desktop | Host it once, add the URL under Settings → Connectors ([guide](docs/REMOTE.md)) |

### Option A — Claude Desktop extension

No config files. Credentials are entered in a settings form and your
passwords are stored as sensitive values by Claude Desktop.

1. **Get the extension bundle** — `fluentmcp.mcpb`. Grab it from the
   repository's releases, or build it yourself (run the commands **one at a
   time**):

   ```bash
   gh repo clone projectaaron/fluentMCP      # private repo — use the GitHub CLI…
   # …or SSH: git clone git@github.com:projectaaron/fluentMCP.git
   cd fluentMCP
   npm install
   npm run pack:extension                    # produces fluentmcp.mcpb
   ```

   > **Private-repo note:** a plain
   > `git clone https://github.com/projectaaron/fluentMCP.git` will prompt
   > for a username/password — and GitHub no longer accepts account
   > passwords over HTTPS. Use the GitHub CLI (`brew install gh`,
   > `gh auth login`) or SSH as shown above, or a
   > [personal access token](https://github.com/settings/tokens) as the
   > password.

2. **Install it** — open Claude Desktop → **Settings → Extensions**, and drag
   `fluentmcp.mcpb` into the window (or use "Install extension" and pick the
   file).

3. **Fill in the settings form** — one WordPress Application Password runs
   both products:

   | Field | What to enter |
   |-------|---------------|
   | **WordPress Site URL** | Your site root, e.g. `https://example.com` |
   | **WordPress Username** | The admin user the server acts as |
   | **Application Password** | Create under WP Admin → Users → your user → **Application Passwords** → *Add New* |

   > Older FluentCRM docs mention a *FluentCRM → Settings → Rest API* page for
   > API keys — newer FluentCRM versions removed it as redundant. A standard
   > WordPress Application Password is all you need.

4. **Verify** — ask Claude: *"Run verify_setup."* It checks the site
   connection, each product's credentials and plugin, and does one harmless
   read per configured product.

### Option B — Any MCP client (config file)

Requires **Node 20.6+**. Build once (see the private-repo note above for
cloning):

```bash
gh repo clone projectaaron/fluentMCP
cd fluentMCP
npm install && npm run build
cp .env.example .env    # then fill in your site URL + credentials
```

**Claude Code** — add to `.mcp.json` in your project (or `~/.claude.json`):

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

**Claude Desktop (manual)** — same block under `mcpServers` in
`claude_desktop_config.json` (Settings → Developer → Edit Config). Prefer
explicit env over a `.env` file? Drop the `--env-file` arg and add an `"env"`
object with `FLUENT_SITE_URL`, `FLUENT_API_USERNAME`, `FLUENT_API_PASSWORD`.
(Per-product `FLUENTCRM_API_*` / `FLUENTCART_API_*` / `WPSOCIALNINJA_API_*` /
`FLUENTFORMS_API_*` overrides are also honored if you want a different user
per product.)

Then restart your client and ask it to run **`verify_setup`**, or run the
read-only smoke test yourself: `node --env-file=.env scripts/smoke-test.mjs`.

### Option C — Remote connector (works on web, mobile, and desktop)

Host the server once and add it to your Claude account — every surface gets
the tools. **Easiest host: Cloudflare Workers** (free tier, nothing to keep
running):

```bash
npm install
npx wrangler login                          # opens your browser once
npx wrangler secret put FLUENT_SITE_URL
npx wrangler secret put FLUENT_API_USERNAME
npx wrangler secret put FLUENT_API_PASSWORD
npx wrangler secret put FLUENT_MCP_TOKEN    # paste output of: openssl rand -hex 32
npm run deploy:cloudflare
```

Then in claude.ai → **Settings → Connectors → Add custom connector**, paste
`https://fluentmcp.<your-subdomain>.workers.dev/mcp/<token>`. Self-hosting
alternatives (Cloudflare Tunnel, Docker, any Node PaaS via
`npm run start:remote`), TLS, and security notes:
**[docs/REMOTE.md](docs/REMOTE.md)**. The URL contains your secret — treat it
like a password.

---

## How the tools work

**One tool = one operation.** Every tool does exactly one thing and its name
says what: `<area>_<operation>`, where the area is the part of your business
it touches (`crm_contacts`, `cart_orders`, …):

```json
{ "name": "cart_orders_list", "arguments": { "per_page": 5 } }
{ "name": "cart_orders_get", "arguments": { "order_id": 1042 } }
{ "name": "crm_contacts_create", "arguments": { "body": { "email": "new@example.com" } } }
{ "name": "cart_orders_refund", "arguments": { "order_id": 1042, "confirm": true } }
```

Each tool's schema contains only what that operation actually needs — the
record IDs it takes are named, required parameters, so there's nothing to
guess.

**The fast map.** Not sure which tool you need? One call answers it:

| Call | Returns |
|------|---------|
| `tool_map` (no arguments) | The whole surface at a glance — one line per area with tool counts |
| `tool_map {"area": "crm_contacts"}` | Every tool in that area, with its required parameters |
| `tool_map {"search": "refund"}` | Every tool matching a keyword, across all areas |

The same map ships as [`docs/TOOL_MAP.md`](docs/TOOL_MAP.md) (one line per
tool), and a summary reaches every session automatically through the MCP
`instructions` field on connect.

Shared conventions, everywhere:

| Parameter | What it does |
|-----------|--------------|
| `query` | Filters, search, sorting — e.g. `{"search": "jane"}`. |
| `body` | The data for create/update tools. |
| `page` / `per_page` | On list tools — 20 per page by default. |
| `detail` / `fields` | Responses come back as **compact summaries by default**. Ask for `detail: "full"` for the complete record, or `fields: ["id", "status"]` for exactly the columns you want. |
| `confirm` | Required (`true`) for destructive tools — see below. |

**Locked tools: some things no agent should ever do.** Six operations are
locked by default and refuse unconditionally — `confirm: true` cannot
override them: `crm_settings_reset_database` (full CRM wipe),
`crm_contacts_delete_contacts` (audience-wide delete),
`crm_settings_delete_rest_key` (API self-lockout),
`crm_settings_test_delete_request`, `cart_settings_disconnect_payment_method`
(stops checkout revenue), and `cart_licensing_regenerate_license_key`
(invalidates customers' keys). They stay visible (marked 🔒 in the map) so
sessions get a clear refusal instead of a mystery. The set is admin-controlled
via `FLUENT_LOCKED_TOOLS` (`default`, a replacement list,
`default,extra_tool`, or `none`).

**Safety: nothing irreversible runs by accident.** Deleting, refunding,
canceling, bulk actions, resets, and sending a campaign to a whole audience
are all classified destructive (97 of the 700 operations, marked ⚠ in the
map). Called without `confirm: true`, the tool refuses, does nothing, and
explains what would have happened. Annotations are now accurate per
operation — every read-only tool really carries `readOnlyHint: true`, so
your client knows exactly which tools only look.

**Prefer fewer, bigger tools?** Set `FLUENT_TOOL_MODE=grouped` and the server
exposes the legacy surface instead: one tool per area (~46 total) with an
`action` parameter selecting the operation — useful for MCP clients that
struggle with large tool lists.

---

## The tools

Tools are organized into **areas** — one per part of your business. The area
is the tool-name prefix: the tables below say what lives where, and
[`docs/TOOL_MAP.md`](docs/TOOL_MAP.md) (or the `tool_map` tool) lists every
individual tool inside each area.

### `tool_map` — the fast map

One line per area (no arguments), every tool in an area
(`{"area": "cart_orders"}`), or keyword lookup (`{"search": "refund"}`).
When in doubt, call this first.

### `verify_setup` — start here

Checks your site URL, each product's credentials and plugin presence, and
runs one harmless read per configured product. Unconfigured products report
`not configured` — that's normal, not an error.

### `wp_media_*` — the media library

`wp_media_upload_from_url` sideloads an image into the WordPress media
library **from a URL** (the server fetches it — perfect for migrating product
photos from another platform's CDN) and returns the attachment ID you can
wire to products/variants with the `cart_*` tools; `wp_media_get` and
`wp_media_list` cover lookup.

### FluentCRM (`crm_*`) — 21 areas, 319 tools

**People & audience**

| Area | What it manages |
|------|-----------------|
| `crm_contacts` | Your subscribers: find, create, update, delete; notes, tags, lists, email history |
| `crm_companies` | Companies, their notes, and which contacts belong to them |
| `crm_lists` | The lists that organize subscribers |
| `crm_tags` | The tags that label contacts |
| `crm_segments` | Dynamic segments and who currently matches them |
| `crm_custom_fields` | Custom contact fields |
| `crm_labels` | Labels for organizing CRM items |

**Email, SMS & campaigns**

| Area | What it manages |
|------|-----------------|
| `crm_campaigns` | One-off email campaigns: create, schedule⚠, send, pause, analyze, resend⚠ |
| `crm_recurring_campaigns` | Automatically repeating campaigns (Pro) |
| `crm_sequences` | Drip email sequences and their subscribers (Pro) |
| `crm_templates` | Reusable email templates |
| `crm_sms` | SMS campaigns and settings (Pro) |

**Automation & capture**

| Area | What it manages |
|------|-----------------|
| `crm_automations` | Marketing automation funnels and their subscribers |
| `crm_forms` | Opt-in forms connected to the CRM |
| `crm_webhooks` | Incoming webhooks that create/update contacts |
| `crm_smart_links` | Links that tag + redirect contacts when clicked (Pro) |

**Insights & admin**

| Area | What it manages |
|------|-----------------|
| `crm_reports` | Read-only analytics: growth, email performance, revenue, global search |
| `crm_abandoned_carts` | Abandoned-cart records and reports (Pro) |
| `crm_settings` | CRM settings: double opt-in, business info, email preferences, compliance |
| `crm_settings_pro` | Pro settings and plugin license |
| `crm_utilities` | CSV/WordPress-user imports, migrations from other tools, WP users & roles |

### FluentCart (`cart_*`) — 22 areas, 380 tools

**Catalog**

| Area | What it manages |
|------|-----------------|
| `cart_products` | Products: find, create, update, delete, bulk-edit, categories, classes |
| `cart_product_variants` | Variations: pricing, stock & inventory, bundles, upgrade paths |
| `cart_product_assets` | Downloadable files and per-product integration feeds |
| `cart_labels_attributes` | Store labels and product attributes (Color, Size, …) |
| `cart_files` | Files in the store's storage drivers |

**Sales**

| Area | What it manages |
|------|-----------------|
| `cart_orders` | Orders: find, create, update, statuses, refunds⚠, transactions, disputes |
| `cart_subscriptions` | Recurring subscriptions: view, cancel⚠, re-sync, payment methods |
| `cart_coupons` | Discount coupons and their eligibility rules |
| `cart_customers` | Store customers, addresses, purchase stats, linked WP users |

**Configuration**

| Area | What it manages |
|------|-----------------|
| `cart_tax` | Tax classes, rates, per-country config, EU VAT/OSS |
| `cart_shipping` | Shipping zones, methods, and classes |
| `cart_settings` | Store settings, payment methods, permissions, storage, checkout fields |
| `cart_email_notifications` | Transactional email templates and reminders |
| `cart_integrations` | Integration feeds and provider settings |
| `cart_order_bumps` | Checkout order bumps (Pro) |
| `cart_roles` | Shop roles and user assignments (Pro) |
| `cart_licensing` | Software licenses: keys, activations, sites (Pro) |

**Insights & customer-facing**

| Area | What it manages |
|------|-----------------|
| `cart_reports` | Read-only analytics: revenue, orders, products, customers, refunds |
| `cart_utilities` | Dashboard stats, activity log, order notes, print templates, onboarding |
| `cart_storefront` | Public storefront data (published products & search) — no auth needed |
| `cart_checkout` | Checkout-session operations — *needs a customer browser session, see note* |
| `cart_customer_portal` | The logged-in customer's own profile/orders — *needs a customer browser session, see note* |

> **Note:** the `cart_checkout_*` and `cart_customer_portal_*` tools cover
> FluentCart's customer-facing endpoints, which authenticate with a browser
> cookie rather than API credentials. They're included for completeness, but
> most calls will be rejected under admin credentials —
> [details](docs/api-reference/auth.md).

**Want more detail?** Every individual tool is one line in
[`docs/TOOL_MAP.md`](docs/TOOL_MAP.md); area-level classes and example calls
are in [`docs/TOOL_CATALOG.md`](docs/TOOL_CATALOG.md); every endpoint's full
request/response schema is in [`docs/api-reference/`](docs/api-reference/);
the design rationale is in [`docs/TOOL_DESIGN.md`](docs/TOOL_DESIGN.md).

---

## Keeping every tool ask-first (recommended)

Approval settings live in your MCP client, and you should keep them on "ask":

- **Claude Desktop**: when the tool-approval dialog appears, choose
  **"Allow once"** rather than "Always allow" — at minimum for every tool
  that isn't read-only (writes and ⚠ tools in [`docs/TOOL_MAP.md`](docs/TOOL_MAP.md)).
- **Claude Code**: don't add `mcp__fluentmcp__*` to your allowlist. To force
  asking even if something was allowed before, add to `.claude/settings.json`:

  ```json
  { "permissions": { "ask": ["mcp__fluentmcp__*"] } }
  ```

The server does its part — honest annotations plus the `confirm: true` gate —
but the human-in-the-loop is your client's approval prompt.

## Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| `verify_setup` says `not configured` | `FLUENT_API_USERNAME` / `FLUENT_API_PASSWORD` (or the extension's username/password fields) are blank |
| 401 errors | Wrong or revoked credentials — generate a fresh Application Password under WP Admin → Users → your user → Application Passwords |
| 403 errors | The user behind the credentials lacks permission — or you're calling a customer-session tool (`cart_checkout_*`, `cart_customer_portal_*`) |
| 404 errors | Plugin not installed/active, wrong Site URL (use the site root, not `/wp-admin`), or a Pro endpoint without the Pro plugin |
| 429 / rate limiting | The server retries with backoff automatically; persistent 429s mean the site's limits need raising |
| Extension won't start | Claude Desktop needs the bundle rebuilt after changes: `npm run pack:extension`, then remove + re-add the extension |

## Development

```bash
npm test                 # 230 unit tests, mocked HTTP — no network needed
npm run gen:docs         # re-scrape both products' API references
npm run gen:maps         # regenerate tool action maps from endpoints.json
npm run build && npm run gen:catalog   # regenerate TOOL_MAP.md + TOOL_CATALOG.md + manifest
npm run pack:extension   # build fluentmcp.mcpb for Claude Desktop
npx @modelcontextprotocol/inspector node dist/index.js   # poke it interactively
```

Project layout: [`docs/PROJECT_MAP.md`](docs/PROJECT_MAP.md) ·
Decision log: [`docs/DECISIONS.md`](docs/DECISIONS.md) ·
Adding another Fluent product (Forms, Booking, Support, …):
[`docs/EXTENDING.md`](docs/EXTENDING.md)
