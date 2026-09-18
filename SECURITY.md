# Security

## What this server is

fluentMCP is a thin, stateless proxy: an MCP client (Claude, Cursor, …) calls a
tool, the server turns it into one authenticated request to your WordPress
site's REST API, and returns the response. It stores nothing. It holds exactly
one secret at runtime — the WordPress Application Password you configure — plus
the shared token in remote mode.

**Whoever controls the server's credentials controls your CRM, store, forms and
community.** Read the notes below before exposing it anywhere.

## Recommendations

- **Use a dedicated WordPress user** with only the capabilities the products
  need (FluentCRM/FluentCart/Fluent Forms managers, etc.), and create the
  Application Password for that user. Revoke it in one click if anything leaks.
- **Remote mode:** the URL contains the token — treat it like a password, serve
  only over HTTPS, rotate with `openssl rand -hex 32`. Tokens shorter than 16
  characters are refused. Token comparison is constant-time. Prefer the
  `Authorization: Bearer` form wherever your client supports headers: a token
  in the path lands in any access log in front of the server. The bundled
  Cloudflare config keeps Workers invocation logs off for that reason; if you
  front the Node server with nginx/Caddy, redact the request path in its
  access log. Request bodies are capped at 4 MB (413 above that). There is no
  built-in rate limit — put one at the edge (Cloudflare rule, nginx
  `limit_req`) if the endpoint is reachable from the open internet.
- **Keep your MCP client on "ask" for writes.** The server annotates every tool
  honestly (`readOnlyHint`, `destructiveHint`) and gates 184 destructive
  operations behind `confirm: true` — including every operation that installs
  or activates plugin code, grants a user manager rights or permissions, or
  mints an API key — but the human approval prompt is your client's. Twelve
  catastrophic operations are locked by default and refuse even with
  `confirm: true` (see `FLUENT_LOCKED_TOOLS` in `.env.example`).
- **Prompt injection is the threat model.** Content the tools read back
  (contact notes, product descriptions, form submissions, community posts)
  is written by other people and reaches your assistant's context. A hostile
  note can ask the assistant to call a tool. The confirm gate, the locked
  list and your client's approval prompt are the defence — keep them on.
- **Media sideloading (`wp_media_upload_from_url`)** fetches a URL the caller
  supplies. IPv4 and IPv6 literals in private, loopback, link-local, CGNAT,
  multicast and cloud-metadata ranges are refused (including IPv4-mapped and
  NAT64 forms), as are `localhost`, `.internal`, `.local` and wildcard-DNS
  metadata aliases; redirects are followed by hand and every hop is
  re-checked; the body is streamed and aborted above 15 MB; the site
  credentials are never sent to that URL. **Known limit:** hostnames are not
  DNS-resolved before fetching, so a public name that resolves to a private
  address (attacker-controlled DNS) is not caught. If the server runs next to
  sensitive internal services, lock the tool
  (`FLUENT_LOCKED_TOOLS=default,wp_media_upload_from_url`) or run it in an
  egress-restricted network.
- **Some read tools return stored third-party secrets** by design — payment
  gateway keys (`cart_settings_get_payment_method`), storage-driver
  credentials, REST keys (`crm_settings_get_rest_keys`), review-platform
  tokens. They land in the assistant's context like any other response. Lock
  them with `FLUENT_LOCKED_TOOLS` if your assistant's transcripts are
  retained somewhere you don't control.

## Reporting a vulnerability

Please do **not** open a public issue for security problems. Email the
maintainer via the address on the GitHub profile, or use GitHub's private
vulnerability reporting on this repository. Include the affected file/tool, a
reproduction, and the impact. You will get an acknowledgement within a few
days and credit in the changelog once fixed, if you want it.

## Scope notes

- The server never bypasses WordPress permissions: every request is
  authorized by WordPress and the plugin's own capability checks as the
  configured user.
- `POST /form-submit` (Fluent Forms) and most FluentCommunity feed/chat/course
  tools act *as* the configured user and are visible to real people — they are
  documented as such and the public submit is confirm-gated.
