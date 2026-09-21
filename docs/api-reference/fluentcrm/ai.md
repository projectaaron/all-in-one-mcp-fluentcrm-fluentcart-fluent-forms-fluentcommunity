# FluentCRM API — ai

7 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/ai/generate`

**POST Rewrite Or Generate Text**

Run one of the inline writing actions used by the email editors on a block of text.

`content` is required for every action except `custom`; for `custom` you must supply either `content`, `custom_prompt`, or both. AI must already be enabled and configured — this endpoint uses the **saved** provider, model, and key and ignores any credentials in the request body.

The call blocks for up to 30 seconds while the provider responds.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `AiPolicy::generate()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `action` (string) **required** _(enum: `rewrite`, `shorten`, `expand`, `fix_grammar`, `custom`)_ — Writing action to perform.
- `content` (string) — Text to operate on. Required unless `action` is `custom`.
- `tone` (string) — Optional tone hint folded into the system prompt.
- `custom_prompt` (string) — Free-form instruction. Only meaningful when `action` is `custom`.

Example:

```json
{
  "action": "shorten",
  "content": "We are absolutely delighted to announce...",
  "tone": "professional"
}
```


**Responses**

- **200** — Generated text.

  Schema (`application/json`):

  - `content` (string) — The provider's output, passed through `sanitize_textarea_field()`.

  Example:

```json
{
  "content": "We're pleased to announce our spring release."
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — Unknown `action`, missing `content`, AI disabled, provider/model/key not configured, or the provider returned an error.

  Schema (`application/json`):

  - _$ref: Error_

---

## POST `/ai/generate-email-body`

**POST Generate Email Body**

Generate a complete email — subject suggestions, preview text, and body — from a short brief. This is what the “Write with AI” button in the campaign editors calls.

`tone` and `length` are validated against a fixed list and silently fall back to `friendly` / `medium` when the value is not recognised, so an unexpected value never fails the request.

Body sanitisation depends on `context.output_format`: `gutenberg_blocks` is filtered with `filter_block_content()`, anything else with `wp_kses_post()`.

The call blocks for up to 45 seconds while the provider responds.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `AiPolicy::generateEmailBody()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `prompt` (string) **required** — What the email should say. Required.
- `tone` (string) _(enum: `friendly`, `professional`, `casual`, `persuasive`, `educational`; default: `friendly`)_ — Writing tone. Unrecognised values fall back to `friendly`.
- `audience` (string) — Free-text description of who the email is for.
- `length` (string) _(enum: `short`, `medium`, `long`; default: `medium`)_ — Target length. Unrecognised values fall back to `medium`.
- `cta` (string) — Call to action to work into the body.
- `context` (object) — Editor context. Accepts an object or a JSON-encoded string.
  - `output_format` (string) _(enum: `gutenberg_blocks`, `html`)_ — Requested body format. `gutenberg_blocks` returns block markup; anything else returns HTML.

Example:

```json
{
  "prompt": "Announce our spring sale, 20% off everything, ends Sunday.",
  "tone": "persuasive",
  "audience": "Existing customers who bought in the last year",
  "length": "short",
  "cta": "Shop the sale",
  "context": {
    "output_format": "html"
  }
}
```


**Responses**

- **200** — Generated email content.

  Schema (`application/json`):

  - `email_body` (string) — Generated body, sanitised according to `context.output_format`.
  - `subject_suggestions` (array<string>) — Candidate subject lines, best first.
  - `preview_text` (string) — Suggested preheader text.
  - `provider` (string) — Provider that produced the content.
  - `model` (string) — Resolved model id.

  Example:

```json
{
  "email_body": "<p>Spring is here — and so is 20% off everything.</p>",
  "subject_suggestions": [
    "20% off everything — ends Sunday",
    "Your spring sale starts now"
  ],
  "preview_text": "Ends Sunday. No code needed.",
  "provider": "open_ai",
  "model": "gpt-5.4"
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — `prompt` missing, AI not configured, or the provider returned an error.

  Schema (`application/json`):

  - _$ref: Error_

---

## POST `/ai/contact-summary`

**POST Get Or Generate Contact Summary**

Read, generate, or regenerate the AI summary shown on a contact profile.

The two flags decide which of three behaviours you get:

| `generate` | `regenerate` | Behaviour |
|---|---|---|
| `no` | `no` | Return the cached summary if one exists for the current site locale, otherwise return an empty `summary` and `cached: false`. Makes no provider call. |
| `yes` | `no` | Return the cache when valid, otherwise generate and cache a new summary. |
| any | `yes` | Ignore the cache and generate a fresh summary. |

Summaries are cached in subscriber meta under `_ai_contact_summary` and are keyed to the **site** language (Settings → General → Site Language), not the admin user's profile language. A cached summary generated under a different locale is treated as a miss. Summaries cached before locale tracking existed are reused only while the site locale is English.

Generation blocks for up to 45 seconds.

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `AiPolicy::contactSummary()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `subscriber_id` (integer) **required** — Contact to summarise. Required and must be non-zero.
- `generate` (string) _(enum: `yes`, `no`; default: `no`)_ — Send `yes` to generate when the cache misses.
- `regenerate` (string) _(enum: `yes`, `no`; default: `no`)_ — Send `yes` to bypass the cache and force a fresh summary.

Example:

```json
{
  "subscriber_id": 948,
  "generate": "yes",
  "regenerate": "no"
}
```


**Responses**

- **200** — The cached or freshly generated summary.

  Schema (`application/json`):

  - `summary` (object) — Summary payload. An empty object when nothing is cached and generation was not requested.
    - `content` (string) — Markdown summary text.
    - `generated_at` (string) _(format: date-time)_ — Generation timestamp in site time.
    - `provider` (string) — Provider used.
    - `model` (string) — Model configured at generation time.
    - `locale` (string) — Site locale the summary was written for, e.g. `en_US`.
    - `counts` (object)
      - _(object)_
  - `cached` (boolean) — True when the response came from subscriber meta rather than a fresh provider call.

  Example:

```json
{
  "summary": {
    "content": "Long-standing customer, highly engaged with product release emails...",
    "generated_at": "2026-08-04 11:42:10",
    "provider": "open_ai",
    "model": "auto",
    "locale": "en_US",
    "counts": {
      "emails": 42,
      "opens": 31,
      "clicks": 12
    }
  },
  "cached": true
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **404** — No contact exists with that id.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — `subscriber_id` missing or zero, AI disabled, or the provider returned an error.

  Schema (`application/json`):

  - _$ref: Error_

---

## POST `/ai/models`

**POST List Models For Provider**

List the model options FluentCRM offers for a provider, so the settings screen can populate its model dropdown after the provider changes.

This is a **POST** even though it only reads: the provider is sent inside the same `settings` envelope the other AI endpoints use.

Model lists are maintained in FluentCRM, not fetched from the provider, so the call does not need a valid API key and makes no outbound request.

<!-- fc:access -->

**Required capability:** `manage_options`

_Enforced by `AiPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `settings` (object) **required** — Provider selector.
  - `provider` (string) **required** _(enum: `wordpress`, `open_ai`, `claude`, `gemini`)_ — Provider whose models should be listed.

Example:

```json
{
  "settings": {
    "provider": "claude"
  }
}
```


**Responses**

- **200** — Available models for the requested provider.

  Schema (`application/json`):

  - `models` (array<object>) — Model options in dropdown order. `auto` resolves to the provider default at call time.
    - `id` (string) — Model identifier to store in `settings.model`.
    - `title` (string) — Human-readable label.

  Example:

```json
{
  "models": [
    {
      "id": "auto",
      "title": "Auto (Recommended)"
    },
    {
      "id": "claude-opus-4-7",
      "title": "claude-opus-4-7"
    },
    {
      "id": "claude-sonnet-4-6",
      "title": "claude-sonnet-4-6"
    }
  ]
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — Missing or unrecognised `settings.provider`.

  Schema (`application/json`):

  - _$ref: Error_

---

## GET `/ai/settings`

**GET AI Settings**

Return the saved AI writing-assistant configuration.

The stored API key is **never** returned in clear text — it is masked to `****` followed by its last four characters. Sending that masked value back to `POST /ai/settings` keeps the existing key; sending an empty string clears it.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `AiPolicy::getSettings()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Current AI configuration.

  Schema (`application/json`):

  - `settings` (object)
    - `is_enabled` (string) _(enum: `yes`, `no`)_ — Whether AI features are switched on.
    - `provider` (string) _(enum: `wordpress`, `open_ai`, `claude`, `gemini`)_ — Configured AI provider.
    - `model` (string) — Configured model id, or `auto` to let FluentCRM pick the provider default.
    - `api_key` (string) — API key, masked to `****` plus the last four characters. Not returned in clear text.
    - `custom_prompt` (string) — Extra system-prompt text appended to every generation request.
  - `has_wordpress_ai` (boolean) — True when the site runs WordPress 7.0 or newer, which ships the built-in AI provider.
  - `connectors_url` (string) — Admin URL of the WordPress connectors screen, used to configure the `wordpress` provider.

  Example:

```json
{
  "settings": {
    "is_enabled": "yes",
    "provider": "open_ai",
    "model": "auto",
    "api_key": "****Ab12",
    "custom_prompt": ""
  },
  "has_wordpress_ai": false,
  "connectors_url": "https://yourdomain.com/wp-admin/options-connectors.php"
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_

---

## POST `/ai/settings`

**POST Save AI Settings**

Persist the AI writing-assistant configuration.

Everything is nested under a single `settings` object. API-key handling has three cases: an empty `api_key` **clears** the stored key, a value starting with `****` is treated as the masked value from `GET /ai/settings` and **keeps** the stored key, and any other value **replaces** it.

Credentials are stored in the WordPress option `_fluent_ai_creds`; the enable flag and custom prompt go to the FluentCRM option `_ai_writing_settings`.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `AiPolicy::saveSettings()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `settings` (object) **required** — AI configuration payload.
  - `is_enabled` (string) _(enum: `yes`, `no`; default: `no`)_ — Turn AI features on or off. Any value other than `yes` is stored as `no`.
  - `provider` (string) _(enum: `wordpress`, `open_ai`, `claude`, `gemini`)_ — AI provider. Selecting `wordpress` requires WordPress 7.0 or newer.
  - `model` (string) _(default: `auto`)_ — Model id, or `auto` to use the provider default. Empty is coerced to `auto`.
  - `api_key` (string) — Provider API key. Leave empty to clear, or resend the masked value to keep the stored key.
  - `custom_prompt` (string) — Additional instructions appended to the system prompt on every request.

Example:

```json
{
  "settings": {
    "is_enabled": "yes",
    "provider": "open_ai",
    "model": "auto",
    "api_key": "sk-your-real-key",
    "custom_prompt": "Always write in British English."
  }
}
```


**Responses**

- **200** — Configuration saved.

  Schema (`application/json`):

  - `message` (string) — Confirmation message.

  Example:

```json
{
  "message": "AI configuration saved successfully."
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — Invalid provider, or `wordpress` was selected on a site older than WordPress 7.0.

  Schema (`application/json`):

  - _$ref: Error_

---

## POST `/ai/test`

**POST Test AI Connection**

Verify provider credentials by issuing a real, minimal completion request (15-second timeout).

If `api_key` is empty or still masked, the saved key is used instead — so the settings screen can test an existing configuration without re-entering the secret. Every provider except `wordpress` requires a key to be present.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `AiPolicy::testConnection()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `settings` (object) **required** — Credentials to test.
  - `provider` (string) **required** _(enum: `wordpress`, `open_ai`, `claude`, `gemini`)_ — Provider to test.
  - `model` (string) **required** _(default: `auto`)_ — Model id, or `auto`.
  - `api_key` (string) — API key. Omit or send the masked value to test the saved key.

Example:

```json
{
  "settings": {
    "provider": "open_ai",
    "model": "auto",
    "api_key": "****Ab12"
  }
}
```


**Responses**

- **200** — The provider accepted the credentials.

  Schema (`application/json`):

  - `message` (string) — Success message.

  Example:

```json
{
  "message": "Connection successful! Your API key is valid."
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — Provider or model missing, provider unrecognised, API key absent, or the provider rejected the request. The provider's own error text is passed through in `message`.

  Schema (`application/json`):

  - _$ref: Error_

---
