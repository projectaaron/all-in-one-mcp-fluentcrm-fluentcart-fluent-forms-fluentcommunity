# FluentCRM API — Public Bounce Handlers

2 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/public/bounce_handler/{service_name}/{security_code}`

**POST Handle Bounce**

Webhook endpoint for email service providers to report bounces, complaints, and unsubscribes. This is the shorter path variant without `/handle/`. Accepts any HTTP method. Validates the security code and processes the bounce event for supported services. Custom services can be handled via the `fluent_crm_handle_bounce_{service_name}` filter.

**Auth:** None (public)

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `service_name` | string | yes | Email service provider name. |
| `security_code` | string | yes | Security code for webhook authentication. Must match the stored bounce key. |


**Request body** (`application/json`)

- _(object)_

**Responses**

- **200** — Bounce processed successfully.

  Schema (`application/json`):

  - _$ref: BounceResponse_

  Example:

```json
{
  "success": 1,
  "message": "recorded",
  "service": "sendgrid",
  "result": "bounced",
  "time": 1709312400
}
```


- **401** — Invalid security code.

  Schema (`application/json`):

  - `status` (boolean) — Always false on authentication failure.
  - `message` (string) — Error message.

  Example:

```json
{
  "status": false,
  "message": "Invalid Data or Security Code"
}
```



---

## POST `/public/bounce_handler/{service_name}/handle/{security_code}`

**POST Handle Bounce (with /handle/ path)**

Webhook endpoint for email service providers to report bounces, complaints, and unsubscribes. This is the variant with `/handle/` in the path. Accepts any HTTP method. Validates the security code and processes the bounce event for supported services. Custom services can be handled via the `fluent_crm_handle_bounce_{service_name}` filter.

**Auth:** None (public)

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `service_name` | string | yes | Email service provider name. |
| `security_code` | string | yes | Security code for webhook authentication. Must match the stored bounce key. |


**Request body** (`application/json`)

- _(object)_

**Responses**

- **200** — Bounce processed successfully.

  Schema (`application/json`):

  - _$ref: BounceResponse_

  Example:

```json
{
  "success": 1,
  "message": "recorded",
  "service": "mailgun",
  "result": "bounced",
  "time": 1709312400
}
```


- **401** — Invalid security code.

  Schema (`application/json`):

  - `status` (boolean) — Always false on authentication failure.
  - `message` (string) — Error message.

  Example:

```json
{
  "status": false,
  "message": "Invalid Data or Security Code"
}
```



---
