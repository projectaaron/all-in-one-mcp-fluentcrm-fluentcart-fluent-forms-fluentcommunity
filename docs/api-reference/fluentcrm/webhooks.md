# FluentCRM API — Incoming Webhooks

4 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/webhooks`

**POST Create Webhook**

Create a new webhook for receiving contact data. Supports both standard contact webhooks and SMS webhooks (requires Fluent Campaign Pro). For standard webhooks, `name` and `status` are required. For SMS webhooks, set `type` to `sms_webhook` and provide `sms_provider`. A unique URL is generated automatically.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `WebhookPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `name` (string) **required** — Human-readable name for the webhook.
- `status` (string) _(enum: `subscribed`, `pending`, `unsubscribed`)_ — Default subscription status for contacts created via this webhook. Required for standard webhooks.
- `lists` (array<integer>) — List IDs to assign to incoming contacts.
- `tags` (array<integer>) — Tag IDs to assign to incoming contacts.
- `companies` (array<integer>) — Company IDs to assign to incoming contacts.
- `type` (string) _(enum: `sms_webhook`)_ — Set to `sms_webhook` to create an SMS webhook. Omit for a standard webhook.
- `sms_provider` (string) — SMS provider identifier (e.g., `twilio`). Required when `type` is `sms_webhook`.

Example:

```json
{
  "name": "Lead Capture Webhook",
  "status": "subscribed",
  "lists": [
    1
  ],
  "tags": [
    3,
    5
  ]
}
```


**Responses**

- **200** — Webhook created successfully.

  Schema (`application/json`):

  - `id` (integer) — The ID of the newly created webhook.
  - `webhook` (object) — The webhook value/configuration data.
    - `name` (string)
    - `status` (string)
    - `lists` (array<integer>)
    - `tags` (array<integer>)
    - `url` (string)
  - `webhooks` (array<object>) — Updated list of all webhooks.
    - `id` (integer) — Unique identifier for the webhook.
    - `object_type` (string) — Type discriminator. `webhook` for standard webhooks, `webhook_{provider}` for SMS webhooks.
    - `key` (string) — UUID key used in the webhook URL.
    - `value` (object) — Webhook configuration data.
      - `name` (string) — Human-readable webhook name.
      - `status` (string) _(enum: `subscribed`, `pending`, `unsubscribed`)_ — Default subscription status for contacts created via this webhook.
      - `lists` (array<integer>) — List IDs to assign to incoming contacts.
      - `tags` (array<integer>) — Tag IDs to assign to incoming contacts.
      - `companies` (array<integer>) — Company IDs to assign to incoming contacts.
      - `url` (string) — The webhook endpoint URL.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the webhook was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the webhook was last updated.
  - `message` (string) — Success message.

  Example:

```json
{
  "id": 2,
  "webhook": {
    "name": "Lead Capture Webhook",
    "status": "subscribed",
    "lists": [
      1
    ],
    "tags": [
      3,
      5
    ],
    "url": "https://example.com/?fluentcrm=1&route=contact&hash=b2c3d4e5-f6a7-8901-bcde-f12345678901"
  },
  "webhooks": [],
  "message": "Successfully created the WebHook"
}
```


- **403** — SMS webhooks require Fluent Campaign Pro.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "SMS webhooks are available in Fluent Campaign Pro version only."
}
```


- **422** — Validation error (e.g., missing required fields, invalid SMS provider, or duplicate SMS webhook).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "A webhook already exists for twilio provider"
}
```



---

## DELETE `/webhooks/{id}`

**DELETE Delete Webhook**

Permanently delete a webhook by ID. This removes the webhook and its configuration. The webhook URL will no longer accept incoming data.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `WebhookPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The webhook ID to delete. |


**Responses**

- **200** — Webhook deleted successfully.

  Schema (`application/json`):

  - `webhooks` (array<object>) — Updated list of all remaining webhooks.
    - `id` (integer) — Unique identifier for the webhook.
    - `object_type` (string) — Type discriminator. `webhook` for standard webhooks, `webhook_{provider}` for SMS webhooks.
    - `key` (string) — UUID key used in the webhook URL.
    - `value` (object) — Webhook configuration data.
      - `name` (string) — Human-readable webhook name.
      - `status` (string) _(enum: `subscribed`, `pending`, `unsubscribed`)_ — Default subscription status for contacts created via this webhook.
      - `lists` (array<integer>) — List IDs to assign to incoming contacts.
      - `tags` (array<integer>) — Tag IDs to assign to incoming contacts.
      - `companies` (array<integer>) — Company IDs to assign to incoming contacts.
      - `url` (string) — The webhook endpoint URL.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the webhook was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the webhook was last updated.
  - `message` (string) — Success message.

  Example:

```json
{
  "webhooks": [],
  "message": "Successfully deleted the webhook"
}
```



---

## GET `/webhooks`

**GET List Webhooks**

Retrieve all webhooks along with available contact fields, custom fields, lists, and tags. Optionally filter webhooks by name using a search query. If the Companies module is enabled, company data is also included.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `WebhookPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Filter webhooks by name (case-insensitive partial match). |


**Responses**

- **200** — List of webhooks with related metadata.

  Schema (`application/json`):

  - `webhooks` (array<Webhook>) — Array of webhook objects.
  - `fields` (array<object>) — Available contact fields for webhook mapping.
    - `key` (string) — Field key/slug.
    - `field` (string) — Human-readable field label.
  - `custom_fields` (array<object>) — Available custom contact fields for webhook mapping.
    - `key` (string) — Custom field slug.
    - `field` (string) — Human-readable custom field label.
  - `lists` (array<object>) — All available lists.
    - `id` (integer)
    - `title` (string)
    - `slug` (string)
  - `tags` (array<object>) — All available tags.
    - `id` (integer)
    - `title` (string)
    - `slug` (string)
  - `companies` (array<object>) — All available companies (only present when Companies module is enabled).
    - `id` (integer)
    - `name` (string)

  Example:

```json
{
  "webhooks": [
    {
      "id": 1,
      "object_type": "webhook",
      "key": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "value": {
        "name": "Lead Capture Webhook",
        "status": "subscribed",
        "lists": [
          1,
          2
        ],
        "tags": [
          3
        ],
        "url": "https://example.com/?fluentcrm=1&route=contact&hash=a1b2c3d4-e5f6-7890-abcd-ef1234567890"
      },
      "created_at": "2024-03-01 10:00:00",
      "updated_at": "2024-03-01 10:00:00"
    }
  ],
  "fields": [
    {
      "key": "first_name",
      "field": "First Name"
    },
    {
      "key": "last_name",
      "field": "Last Name"
    },
    {
      "key": "email",
      "field": "Email"
    }
  ],
  "custom_fields": [
    {
      "key": "company_name",
      "field": "Company Name"
    }
  ],
  "lists": [
    {
      "id": 1,
      "title": "Newsletter",
      "slug": "newsletter"
    }
  ],
  "tags": [
    {
      "id": 3,
      "title": "VIP",
      "slug": "vip"
    }
  ]
}
```



---

## PUT `/webhooks/{id}`

**PUT Update Webhook**

Update an existing webhook's configuration. SMS webhooks cannot be edited; they must be deleted and recreated instead. The webhook's `id` and `url` fields are immutable and cannot be changed through this endpoint.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `WebhookPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The webhook ID to update. |


**Request body** (`application/json`, required)

- `name` (string) — Updated webhook name.
- `status` (string) _(enum: `subscribed`, `pending`, `unsubscribed`)_ — Updated default subscription status.
- `lists` (array<integer>) — Updated list IDs to assign to incoming contacts.
- `tags` (array<integer>) — Updated tag IDs to assign to incoming contacts.
- `companies` (array<integer>) — Updated company IDs to assign to incoming contacts.

Example:

```json
{
  "name": "Updated Webhook Name",
  "status": "pending",
  "lists": [
    1,
    2
  ],
  "tags": [
    3
  ],
  "companies": []
}
```


**Responses**

- **200** — Webhook updated successfully.

  Schema (`application/json`):

  - `webhooks` (array<object>) — Updated list of all webhooks.
    - `id` (integer) — Unique identifier for the webhook.
    - `object_type` (string) — Type discriminator. `webhook` for standard webhooks, `webhook_{provider}` for SMS webhooks.
    - `key` (string) — UUID key used in the webhook URL.
    - `value` (object) — Webhook configuration data.
      - `name` (string) — Human-readable webhook name.
      - `status` (string) _(enum: `subscribed`, `pending`, `unsubscribed`)_ — Default subscription status for contacts created via this webhook.
      - `lists` (array<integer>) — List IDs to assign to incoming contacts.
      - `tags` (array<integer>) — Tag IDs to assign to incoming contacts.
      - `companies` (array<integer>) — Company IDs to assign to incoming contacts.
      - `url` (string) — The webhook endpoint URL.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the webhook was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the webhook was last updated.
  - `message` (string) — Success message.

  Example:

```json
{
  "webhooks": [],
  "message": "Successfully updated the webhook"
}
```


- **404** — Webhook not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Webhook not found"
}
```


- **422** — SMS webhooks cannot be edited.

  Schema (`application/json`):

  - `message` (string)
  - `type` (string) — Error type identifier.

  Example:

```json
{
  "message": "SMS webhooks cannot be edited. Please delete and create a new one if changes are needed.",
  "type": "sms_webhook_edit_blocked"
}
```



---
