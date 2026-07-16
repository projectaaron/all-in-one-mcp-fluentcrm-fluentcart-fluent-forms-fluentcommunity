# Running fluentMCP as a remote connector

The remote entry point (`dist/remote.js`) speaks MCP **Streamable HTTP**, so
you can add it to claude.ai under **Settings → Connectors → Add custom
connector** and use it from Claude on the web, your phone, and the desktop
app — no local install on each machine.

## How auth works

The server requires a shared secret, `FLUENT_MCP_TOKEN` (it refuses to start
without one, minimum 16 characters). Every request must present it, either:

- in the URL path — `https://your-host/mcp/<token>` — which is what you paste
  into claude.ai's custom-connector form (it can't set headers), or
- as a header — `Authorization: Bearer <token>` — for clients that can.

Generate a good one:

```bash
openssl rand -hex 32
```

**Treat the URL as a password.** Anyone holding it controls your store and
CRM. Always serve over HTTPS (both hosting recipes below give you TLS for
free), and rotate the token by changing the env var and updating the
connector URL.

## Environment

Same variables as the local install (`.env.example`), plus:

| Variable | Meaning |
|----------|---------|
| `FLUENT_MCP_TOKEN` | Required shared secret (16+ chars) |
| `PORT` | Listen port (default 3000) |
| `FLUENT_MCP_HOST` | Bind address (default 0.0.0.0) |

## Hosting recipes

### A. Cloudflare Tunnel (great if you already use Cloudflare)

Runs the server on any machine you control (a home server, a VPS, even your
Mac) and publishes it through Cloudflare with TLS — no ports opened.

```bash
# on the machine that will run the server
npm install && npm run build
FLUENT_MCP_TOKEN=$(openssl rand -hex 32)
echo "token: $FLUENT_MCP_TOKEN"   # save this
FLUENT_SITE_URL=https://your-site.com \
FLUENT_API_USERNAME=youruser FLUENT_API_PASSWORD='xxxx xxxx xxxx xxxx' \
FLUENT_MCP_TOKEN=$FLUENT_MCP_TOKEN node dist/remote.js &

# quick test (URL changes every run — fine for trying it out):
cloudflared tunnel --url http://localhost:3000
# stable named tunnel on your own domain (one-time setup):
cloudflared tunnel login
cloudflared tunnel create fluentmcp
cloudflared tunnel route dns fluentmcp mcp.your-domain.com
cloudflared tunnel run --url http://localhost:3000 fluentmcp
```

Connector URL: `https://mcp.your-domain.com/mcp/<token>`

### B. Any Node host / PaaS (Render, Railway, Fly.io, …)

The repo ships a `Dockerfile`; every PaaS that runs Docker or Node works.
Set the env vars in the dashboard, deploy, and note the HTTPS URL the
platform gives you. Health check path: `/healthz`.

```bash
# plain VPS example
npm ci && npm run build
FLUENT_MCP_TOKEN=... FLUENT_SITE_URL=... FLUENT_API_USERNAME=... FLUENT_API_PASSWORD=... \
node dist/remote.js
# put nginx/caddy in front for TLS, or use the Docker image behind a proxy
```

### C. Docker

```bash
docker build -t fluentmcp .
docker run -d -p 3000:3000 --env-file .env --restart unless-stopped fluentmcp
```

## Add it to Claude

1. claude.ai → **Settings → Connectors → Add custom connector**
2. Name: `fluentmcp` · URL: `https://your-host/mcp/<token>`
3. It appears in the tools menu of new conversations on **web, mobile, and
   desktop**. Ask Claude to run `verify_setup`.

## Notes

- The server is **stateless** — each request builds a fresh MCP session, so
  restarts are invisible to clients and horizontal scaling is trivial.
- `GET /healthz` is unauthenticated and reveals nothing but `{ok: true}`.
- All the same safety behavior applies remotely: honest tool annotations and
  `confirm: true` gates on all 98 destructive actions.
- Your WordPress Application Password lives wherever the server runs — pick
  hosting you trust, and prefer a dedicated WP user so it's revocable in one
  click.
