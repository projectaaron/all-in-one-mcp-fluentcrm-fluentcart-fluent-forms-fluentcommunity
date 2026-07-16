# fluentMCP

Let your AI assistant run your WordPress store and CRM.

fluentMCP is an [MCP](https://modelcontextprotocol.io) server that connects
Claude (or any MCP client) to **FluentCRM** and **FluentCart** by
WPManageNinja. Once connected, you can ask your assistant to look things up,
create and update them, and run your day-to-day operations — every one of the
**699 documented REST endpoints** is reachable through **45 tools**, and every
risky operation is safety-gated.

**Try asking things like:**

> - "How did the store do this week? Compare it to last week."
> - "Find the customer jane@example.com — what has she bought, and is she on
>   the newsletter list?"
> - "Tag everyone who bought the Marriage Course with `course-buyer`."
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
(Per-product `FLUENTCRM_API_*` / `FLUENTCART_API_*` overrides are also
honored if you want a different user per product.)

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

Instead of one tool per API endpoint (there are 699 of them), fluentMCP gives
you **one tool per area of your business**. Each tool takes an `action` that
says what to do — the same way you'd think about it:

```json
{ "name": "cart_orders", "arguments": { "action": "list_orders", "per_page": 5 } }
{ "name": "cart_orders", "arguments": { "action": "get_order", "id": 1042 } }
{ "name": "crm_contacts", "arguments": { "action": "create_contact", "body": { "email": "new@example.com" } } }
```

Things every tool understands:

| Parameter | What it does |
|-----------|--------------|
| `action` | Which operation to run. The tool's own description lists every action; `⚠` marks the dangerous ones. |
| `id` / `path_params` | Which record — `id` for the main one, `path_params` if an action needs more than one. |
| `query` | Filters, search, sorting — e.g. `{"search": "jane"}`. |
| `body` | The data for create/update actions. |
| `page` / `per_page` | Pagination for lists — 20 per page by default. |
| `detail` / `fields` | Responses come back as **compact summaries by default**. Ask for `detail: "full"` for the complete record, or `fields: ["id", "status"]` for exactly the columns you want. |
| `confirm` | Required (`true`) for destructive actions — see below. |

**Safety: nothing irreversible runs by accident.** Deleting, refunding,
canceling, bulk actions, resets, and sending a campaign to a whole audience
are all classified destructive (98 of the 699 actions). Called without
`confirm: true`, the tool refuses, does nothing, and explains what would have
happened. Every tool also carries honest MCP annotations (`readOnlyHint`,
`destructiveHint`) so your client knows which tools only read.

---

## The tools

### `verify_setup` — start here

Checks your site URL, each product's credentials and plugin presence, and
runs one harmless read per configured product. Unconfigured products report
`not configured` — that's normal, not an error.

### `wp_media` — the media library

Uploads an image into the WordPress media library **from a URL** (the server
fetches it — perfect for migrating product photos from another platform's
CDN), and looks up existing media. Returns the attachment ID you can wire to
products/variants with the `cart_*` tools.

### FluentCRM (`crm_*`) — 21 tools, 319 endpoints

**People & audience**

| Tool | What it manages |
|------|-----------------|
| `crm_contacts` | Your subscribers: find, create, update, delete; notes, tags, lists, email history |
| `crm_companies` | Companies, their notes, and which contacts belong to them |
| `crm_lists` | The lists that organize subscribers |
| `crm_tags` | The tags that label contacts |
| `crm_segments` | Dynamic segments and who currently matches them |
| `crm_custom_fields` | Custom contact fields |
| `crm_labels` | Labels for organizing CRM items |

**Email, SMS & campaigns**

| Tool | What it manages |
|------|-----------------|
| `crm_campaigns` | One-off email campaigns: create, schedule⚠, send, pause, analyze, resend⚠ |
| `crm_recurring_campaigns` | Automatically repeating campaigns (Pro) |
| `crm_sequences` | Drip email sequences and their subscribers (Pro) |
| `crm_templates` | Reusable email templates |
| `crm_sms` | SMS campaigns and settings (Pro) |

**Automation & capture**

| Tool | What it manages |
|------|-----------------|
| `crm_automations` | Marketing automation funnels and their subscribers |
| `crm_forms` | Opt-in forms connected to the CRM |
| `crm_webhooks` | Incoming webhooks that create/update contacts |
| `crm_smart_links` | Links that tag + redirect contacts when clicked (Pro) |

**Insights & admin**

| Tool | What it manages |
|------|-----------------|
| `crm_reports` | Read-only analytics: growth, email performance, revenue, global search |
| `crm_abandoned_carts` | Abandoned-cart records and reports (Pro) |
| `crm_settings` | CRM settings: double opt-in, business info, email preferences, compliance |
| `crm_settings_pro` | Pro settings and plugin license |
| `crm_utilities` | CSV/WordPress-user imports, migrations from other tools, WP users & roles |

### FluentCart (`cart_*`) — 22 tools, 380 endpoints

**Catalog**

| Tool | What it manages |
|------|-----------------|
| `cart_products` | Products: find, create, update, delete, bulk-edit, categories, classes |
| `cart_product_variants` | Variations: pricing, stock & inventory, bundles, upgrade paths |
| `cart_product_assets` | Downloadable files and per-product integration feeds |
| `cart_labels_attributes` | Store labels and product attributes (Color, Size, …) |
| `cart_files` | Files in the store's storage drivers |

**Sales**

| Tool | What it manages |
|------|-----------------|
| `cart_orders` | Orders: find, create, update, statuses, refunds⚠, transactions, disputes |
| `cart_subscriptions` | Recurring subscriptions: view, cancel⚠, re-sync, payment methods |
| `cart_coupons` | Discount coupons and their eligibility rules |
| `cart_customers` | Store customers, addresses, purchase stats, linked WP users |

**Configuration**

| Tool | What it manages |
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

| Tool | What it manages |
|------|-----------------|
| `cart_reports` | Read-only analytics: revenue, orders, products, customers, refunds |
| `cart_utilities` | Dashboard stats, activity log, order notes, print templates, onboarding |
| `cart_storefront` | Public storefront data (published products & search) — no auth needed |
| `cart_checkout` | Checkout-session operations — *needs a customer browser session, see note* |
| `cart_customer_portal` | The logged-in customer's own profile/orders — *needs a customer browser session, see note* |

> **Note:** `cart_checkout` and `cart_customer_portal` cover FluentCart's
> customer-facing endpoints, which authenticate with a browser cookie rather
> than API credentials. They're included for completeness, but most calls
> will be rejected under admin credentials —
> [details](docs/api-reference/auth.md).

**Want more detail?** Every tool's example call is in
[`docs/TOOL_CATALOG.md`](docs/TOOL_CATALOG.md); every endpoint's full
request/response schema is in [`docs/api-reference/`](docs/api-reference/);
the design rationale is in [`docs/TOOL_DESIGN.md`](docs/TOOL_DESIGN.md).

---

## Keeping every tool ask-first (recommended)

Approval settings live in your MCP client, and you should keep them on "ask":

- **Claude Desktop**: when the tool-approval dialog appears, choose
  **"Allow once"** rather than "Always allow" — at minimum for every tool not
  classified `read` in [`docs/TOOL_CATALOG.md`](docs/TOOL_CATALOG.md).
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
| 403 errors | The user behind the credentials lacks permission — or you're calling a customer-session tool (`cart_checkout`, `cart_customer_portal`) |
| 404 errors | Plugin not installed/active, wrong Site URL (use the site root, not `/wp-admin`), or a Pro endpoint without the Pro plugin |
| 429 / rate limiting | The server retries with backoff automatically; persistent 429s mean the site's limits need raising |
| Extension won't start | Claude Desktop needs the bundle rebuilt after changes: `npm run pack:extension`, then remove + re-add the extension |

## Development

```bash
npm test                 # 144 unit tests, mocked HTTP — no network needed
npm run gen:docs         # re-scrape both products' API references
npm run gen:maps         # regenerate tool action maps from endpoints.json
npm run build && npm run gen:catalog   # regenerate TOOL_CATALOG.md + manifest tool list
npm run pack:extension   # build fluentmcp.mcpb for Claude Desktop
npx @modelcontextprotocol/inspector node dist/index.js   # poke it interactively
```

Project layout: [`docs/PROJECT_MAP.md`](docs/PROJECT_MAP.md) ·
Decision log: [`docs/DECISIONS.md`](docs/DECISIONS.md) ·
Adding another Fluent product (Forms, Booking, Support, …):
[`docs/EXTENDING.md`](docs/EXTENDING.md)
