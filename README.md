# fluentMCP

An MCP (Model Context Protocol) server that gives AI assistants full
create / read / update / delete control over **FluentCRM** and **FluentCart**
(by WPManageNinja) on your WordPress site — 699 documented REST endpoints
reachable through **44 consolidated tools**, with safety gating on every
destructive operation.

- TypeScript, official [`@modelcontextprotocol/sdk`](https://www.npmjs.com/package/@modelcontextprotocol/sdk), stdio transport
- Product-modular: FluentCRM and FluentCart today; any future Fluent product
  (Forms, Booking, Support, …) drops in without touching existing code — see
  [`docs/EXTENDING.md`](docs/EXTENDING.md)
- Lean responses by design: summaries + pagination by default, `detail:"full"`
  and `fields:[...]` when you need more

## Install (five minutes)

### 1. Get the code and build it

Requires **Node 20.6+** (the install path below uses `node --env-file`,
added in 20.6.0).

```bash
git clone https://github.com/projectaaron/fluentMCP.git
cd fluentMCP
npm install
npm run build
```

### 2. Create your credentials

| Product | Where |
|---------|-------|
| **FluentCRM** | WP Admin → FluentCRM → Settings → **Rest API** → Create New API Key (create a dedicated Manager first — not an Administrator) |
| **FluentCart** | WP Admin → Users → your admin user → **Application Passwords** → Add New |

Copy `.env.example` to `.env` and fill in your site URL and the credentials.
Products you leave blank are simply disabled — you can start with just one.

### 3. Add the server to your MCP client

**Claude Code** — add to `.mcp.json` in your project (or `~/.claude.json` for
all projects):

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

**Claude Desktop** — add the same block under `mcpServers` in
`claude_desktop_config.json` (Settings → Developer → Edit Config).

Prefer explicit env over a `.env` file? Drop the `--env-file` arg and use:

```json
{
  "mcpServers": {
    "fluentmcp": {
      "command": "node",
      "args": ["/absolute/path/to/fluentMCP/dist/index.js"],
      "env": {
        "FLUENT_SITE_URL": "https://your-site.com",
        "FLUENTCRM_API_USERNAME": "api_user",
        "FLUENTCRM_API_PASSWORD": "xxxx xxxx xxxx xxxx",
        "FLUENTCART_API_USERNAME": "admin_user",
        "FLUENTCART_API_PASSWORD": "xxxx xxxx xxxx xxxx"
      }
    }
  }
}
```

### 4. Restart your client, then verify

Ask your assistant to run **`verify_setup`** — it checks the site connection,
each product's credentials and plugin presence, and does one harmless read per
configured product. Or run the read-only smoke test yourself:

```bash
node --env-file=.env scripts/smoke-test.mjs
```

## Keeping every tool ask-first (recommended)

This server annotates every tool honestly (`readOnlyHint`,
`destructiveHint`, …) and refuses destructive actions without
`confirm: true` — but **approval settings live in your MCP client**, and you
should keep them on "ask".

- **Claude Code**: don't add `mcp__fluentmcp__*` to your allowlist. To force
  asking even if something was allowed before, add to `.claude/settings.json`:

  ```json
  { "permissions": { "ask": ["mcp__fluentmcp__*"] } }
  ```

- **Claude Desktop**: when the tool-approval dialog appears, choose
  "Allow once" rather than "Always allow" — at minimum for every tool that
  isn't classified `read` in [`docs/TOOL_CATALOG.md`](docs/TOOL_CATALOG.md).

## The tool surface

One tool per resource domain with an `action` parameter — e.g. `cart_orders`
handles `list_orders`, `get_order`, `create_order`, `update_statuses`,
`refund_order`⚠, … The `action` parameter's description lists every action
with its required path parameters; `⚠` marks destructive actions that demand
`confirm: true`.

| | Tools | Endpoints covered |
|---|-------|-------------------|
| FluentCRM (`crm_*`) | 21 | 319 |
| FluentCart (`cart_*`) | 22 | 380 |
| Server (`verify_setup`) | 1 | — |

- Full catalog with examples: [`docs/TOOL_CATALOG.md`](docs/TOOL_CATALOG.md)
- Design rationale: [`docs/TOOL_DESIGN.md`](docs/TOOL_DESIGN.md)
- Complete endpoint references: [`docs/api-reference/`](docs/api-reference/)
  (auth model in [`auth.md`](docs/api-reference/auth.md))

Common parameters on every tool: `query` (filters/search), `body`
(create/update payload), `page`/`per_page` (default 20), `fields`
(project columns), `detail: "summary" | "full"` (summary is default),
`confirm` (destructive actions only).

## Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| `verify_setup` → `not_configured` | The product's `*_API_USERNAME` / `*_API_PASSWORD` env vars aren't set — intentional if you're not using that product |
| 401 errors | Wrong/revoked credentials. FluentCRM keys live under FluentCRM → Settings → Rest API; FluentCart uses a WP Application Password |
| 403 errors | The user behind the credentials lacks the FluentCRM manager permission / FluentCart capability — or you're calling a customer-session endpoint (`cart_checkout`, `cart_customer_portal`); see [`docs/api-reference/auth.md`](docs/api-reference/auth.md) |
| 404 errors | Plugin not installed/active on the site, wrong `FLUENT_SITE_URL`, or a Pro-only endpoint without the Pro plugin |
| Rate limiting (429) | The client retries with backoff automatically; persistent 429s mean the site's limits need raising |

## Development

```bash
npm test                 # 134 unit tests, mocked HTTP — no network needed
npm run gen:docs         # re-scrape both products' API references
npm run gen:maps         # regenerate tool action maps from endpoints.json
npm run build && npm run gen:catalog   # regenerate docs/TOOL_CATALOG.md
npx @modelcontextprotocol/inspector node dist/index.js   # poke it interactively
```

Project layout and how the pieces connect: [`docs/PROJECT_MAP.md`](docs/PROJECT_MAP.md).
Decision log: [`docs/DECISIONS.md`](docs/DECISIONS.md).
Adding another Fluent product: [`docs/EXTENDING.md`](docs/EXTENDING.md).
