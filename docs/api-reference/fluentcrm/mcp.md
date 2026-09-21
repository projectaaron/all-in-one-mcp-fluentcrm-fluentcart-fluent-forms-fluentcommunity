# FluentCRM API — mcp

4 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## GET `/mcp/config-snippet`

**GET MCP Client Config Snippet**

Generate a copy-paste configuration snippet for a specific MCP client.

Every client authenticates with WordPress Application Passwords. The snippet contains **placeholders**, never real credentials — `<base64(your-username:application-password)>`, `<your-username>`, and `<your-application-password>` — which the Settings screen swaps for the values the user types in. Nothing secret is ever returned by this endpoint.

Supported `client` values:

| Value | Output |
|---|---|
| `claude-code` | A `claude mcp add` command over HTTP transport. **The default** — an unrecognised value also lands here. |
| `claude-desktop` | JSON for `claude_desktop_config.json`. Claude Desktop cannot speak HTTP MCP directly, so this routes through the `@automattic/mcp-wordpress-remote` npx proxy. |
| `cursor` | JSON for Cursor's native HTTP MCP support. |
| `codex` | Step-by-step instructions for OpenAI Codex's custom-MCP screen. |
| `generic` | Raw URL, auth header, and a ready-to-run `curl` test. |

For `claude-desktop` on a local install, `NODE_TLS_REJECT_UNAUTHORIZED=0` is added to the snippet so the npx proxy tolerates a self-signed Valet/MAMP/Local certificate. That is decided by `local_dev` when supplied, and by auto-detection otherwise.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `client` | string | no | Target MCP client. Unrecognised values fall back to `claude-code`. |
| `local_dev` | string | no | Override local-development detection. `yes`/`1`/`true` force it on, `no`/`0`/`false` force it off, and omitting it uses auto-detection. |


**Responses**

- **200** — The generated snippet and its instructions.

  Schema (`application/json`):

  - `client` (string) — The client the snippet was generated for, after fallback.
  - `snippet` (string) — Copy-paste configuration containing credential placeholders.
  - `instructions` (string) — Where to put the snippet and what to do afterwards.
  - `endpoint` (string) — The MCP JSON-RPC endpoint URL.
  - `app_passwords_url` (string) — Admin URL for creating an application password.
  - `is_local_dev` (boolean) — The local-development flag that was applied.

  Example:

```json
{
  "client": "claude-code",
  "snippet": "claude mcp add \\\n  --transport http \\\n  fluent-crm https://yourdomain.com/wp-json/fluent-crm/mcp \\\n  --header \"Authorization: Basic <base64(your-username:application-password)>\"",
  "instructions": "Fill in your username and application password above, then paste the command into your terminal. Run `claude` and the FluentCRM tools will appear under MCP servers.",
  "endpoint": "https://yourdomain.com/wp-json/fluent-crm/mcp",
  "app_passwords_url": "https://yourdomain.com/wp-admin/profile.php#application-passwords-section",
  "is_local_dev": false
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_

---

## GET `/mcp/status`

**GET MCP Status**

Report everything the Settings → MCP screen needs to decide what to render: whether an adapter is installed and active, which one is providing it, how many abilities are registered, and whether the kill-switch is on.

An adapter can come from two places — the standalone adapter plugin or a bundled adapter inside FluentHub — and `adapter_provider` tells you which one won (`plugin`, `toolkit`, or an empty string when neither is active).

`tools_count` is 0 whenever the WordPress Abilities API is missing, since there is nowhere to register abilities.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Current MCP integration status.

  Schema (`application/json`):

  - `adapter_installed` (boolean) — True when either the standalone adapter or FluentHub is present on disk.
  - `adapter_active` (boolean) — True when an adapter runtime is actually available to serve MCP requests.
  - `adapter_provider` (string) _(enum: `plugin`, `toolkit`, ``)_ — Which source is providing the active adapter.
  - `standalone_adapter_installed` (boolean) — True when the standalone adapter plugin is present.
  - `toolkit_installed` (boolean) — True when FluentHub is present.
  - `toolkit_active` (boolean) — True when FluentHub is loaded.
  - `toolkit_adapter_available` (boolean) — True when the loaded FluentHub build bundles an MCP adapter.
  - `adapter_runtime_available` (boolean) — True when the adapter runtime classes are loadable.
  - `adapter_version` (string,null) — Detected standalone adapter version, if any.
  - `toolkit_version` (string,null) — Detected FluentHub version, if any.
  - `abilities_api_loaded` (boolean) — True when `wp_register_ability()` exists.
  - `endpoint_url` (string) — Full URL of the MCP JSON-RPC endpoint.
  - `tools_count` (integer) — Number of registered FluentCRM abilities. 0 when the Abilities API is absent.
  - `mcp_enabled` (boolean) — The kill-switch. Defaults to true; toggled by `POST /mcp/toggle`.
  - `pro_active` (boolean) — True when FluentCampaign Pro is active, which adds further abilities.
  - `app_passwords_url` (string) — Admin URL of the Application Passwords section.
  - `plugins_url` (string) — Admin URL of the Plugins screen.
  - `can_auto_install_adapter` (boolean) — True when a handler opted into background installation via the `fluent_toolkit/can_auto_install` filter.
  - `toolkit_download_url` (string) — Where to download FluentHub manually.
  - `current_user_login` (string) — Login of the requesting user, pre-filled into the generated snippets.
  - `is_local_dev` (boolean) — Heuristic local-development detection — a dev TLD, `localhost`, or a private/loopback IP. Filterable via `fluent_crm/mcp_is_local_dev`.

  Example:

```json
{
  "adapter_installed": true,
  "adapter_active": true,
  "adapter_provider": "plugin",
  "standalone_adapter_installed": true,
  "toolkit_installed": true,
  "toolkit_active": true,
  "toolkit_adapter_available": true,
  "adapter_runtime_available": true,
  "adapter_version": "0.5.0",
  "toolkit_version": "2.1.0",
  "abilities_api_loaded": true,
  "endpoint_url": "https://yourdomain.com/wp-json/fluent-crm/mcp",
  "tools_count": 29,
  "mcp_enabled": true,
  "pro_active": true,
  "app_passwords_url": "https://yourdomain.com/wp-admin/profile.php#application-passwords-section",
  "plugins_url": "https://yourdomain.com/wp-admin/plugins.php",
  "can_auto_install_adapter": true,
  "toolkit_download_url": "https://github.com/WPManageNinja/fluent-toolkit",
  "current_user_login": "site-admin",
  "is_local_dev": false
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_

---

## POST `/mcp/install-adapter`

**POST Install MCP Adapter**

Attempt a one-click install of FluentHub, which supplies the MCP adapter.

Automatic installation only happens when something has opted in through the `fluent_toolkit/can_auto_install` filter. On a stock install nothing does, so the endpoint returns a 422 pointing at the manual download instead — that is the expected response, not a fault.

When auto-install is available the call fires `fluent_toolkit/do_auto_install`, clears the plugin cache, and re-checks the result. The `message` distinguishes all four outcomes: installed and active, installed but the build has no bundled adapter, installed but not activatable, and install failed.

<!-- fc:access -->

**Required capability:** `install_plugins`

The policy also re-asserts `verifyRequest()`, so the caller must additionally hold `fcrm_manage_settings`.

_Enforced by `SettingsPolicy::installAdapter()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Installation attempted. Read `message` for the outcome.

  Schema (`application/json`):

  - `is_installed` (boolean) — True when the standalone adapter or FluentHub is now present.
  - `adapter_active` (boolean) — True when an adapter runtime is now available.
  - `toolkit_active` (boolean) — True when FluentHub is loaded.
  - `toolkit_adapter_available` (boolean) — True when the loaded FluentHub build bundles an adapter.
  - `message` (string) — Human-readable outcome, including next steps when something is still missing.

  Example:

```json
{
  "is_installed": true,
  "adapter_active": true,
  "toolkit_active": true,
  "toolkit_adapter_available": true,
  "message": "FluentHub installed and activated. Reload the page to register FluentCRM MCP tools."
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — The user cannot install plugins, or automatic installation is unavailable. The response carries `toolkit_download_url` for the manual route.

  Schema (`application/json`):

  - _$ref: Error_

---

## POST `/mcp/toggle`

**POST Toggle MCP Tools**

Flip the MCP kill-switch, stored as the FluentCRM option `mcp_enabled`.

With it off, the adapter stops reporting FluentCRM abilities — the endpoint stays reachable but advertises nothing. The change takes effect on the **next** request, because the guard that reads it runs during ability registration.

`mcp_enabled` is permissive about types: the strings `yes`, `true`, and `1` all enable, any other string disables, and a non-string is cast to boolean.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `SettingsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `mcp_enabled` (string) **required** _(enum: `yes`, `no`, `true`, `false`, `1`, `0`)_ — Whether MCP tools should be advertised. `yes`, `true`, or `1` enable; any other string disables.

Example:

```json
{
  "mcp_enabled": "no"
}
```


**Responses**

- **200** — Kill-switch updated.

  Schema (`application/json`):

  - `ok` (boolean) — Always true on success.
  - `mcp_enabled` (boolean) — The resolved state that was stored.
  - `message` (string) — Message describing the new state.

  Example:

```json
{
  "ok": true,
  "mcp_enabled": false,
  "message": "MCP tools disabled. The adapter will no longer report FluentCRM abilities."
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — Validation failed — the response message names the offending field.

  Schema (`application/json`):

  - _$ref: Error_

---
