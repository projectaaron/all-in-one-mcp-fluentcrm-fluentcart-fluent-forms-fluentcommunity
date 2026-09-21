# FluentCRM API — Public Bounce Handlers

2 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## GET `/public/bounce_handler/{service_name}/{security_code}`

**GET Handle Bounce Webhook**

_Same handler as `POST /public/bounce_handler/{service_name}/{security_code}` — documented separately because the route accepts any HTTP method._

::: warning PUBLIC ENDPOINT
This route is **unauthenticated**. It is called by your email service provider, which cannot present WordPress credentials, so the security code in the URL is the only thing authorising the request. Treat that code as a secret and rotate it if it leaks.
:::

Receives bounce and complaint webhooks from a transactional email provider and updates the affected contacts' statuses.

This is the **short form** of the webhook URL. It is equivalent to the `/handle/` variant — configure whichever your provider's UI accepts.

**Accepts any HTTP method.** The route is registered with `any()`, so `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` all reach the same handler — providers differ in what they send, and none of them are turned away. `POST` is what every supported provider actually uses.

Recognised `service_name` values: `mailgun`, `pepipost`, `postmark`, `sendgrid`, `sparkpost`, `elasticemail`, `postalserver`, `smtp2go`, `brevo`, `tosend`.

Two behaviours are easy to misread:

- An **unrecognised** `service_name` does not error. It is handed to the `fluent_crm_handle_bounce_{service_name}` filter so add-ons can implement their own provider, and returns `success: 0` when nothing handles it. **The security code is not checked on this path** — validating it is the custom handler's responsibility.
- A **wrong security code** on a recognised service returns HTTP **200** with `{"status": false}`, not a 401 or 403. Check the body, not the status code.

The security code is generated on first use and stored as the FluentCRM option `_fc_bounce_key`. Both path segments are constrained to alphanumerics and dashes.

<!-- fc:access -->

**Authentication:** none — this is a public endpoint.

<!-- /fc:access -->

**Auth:** None (public)

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `service_name` | string | yes | Email service sending the webhook. Unrecognised values are routed to the custom-handler filter. |
| `security_code` | string | yes | Secret from FluentCRM's bounce-handler settings. Compared with `hash_equals()`. |


**Responses**

- **200** — Always 200 while the route matches. Read `success` / `status` in the body to tell a recorded webhook from a rejected one.

  Example:

```json
{
  "success": 1,
  "message": "recorded",
  "service": "mailgun",
  "result": "processed",
  "time": 1785000000
}
```



---

## GET `/public/bounce_handler/{service_name}/handle/{security_code}`

**GET Handle Bounce Webhook**

_Same handler as `POST /public/bounce_handler/{service_name}/handle/{security_code}` — documented separately because the route accepts any HTTP method._

::: warning PUBLIC ENDPOINT
This route is **unauthenticated**. It is called by your email service provider, which cannot present WordPress credentials, so the security code in the URL is the only thing authorising the request. Treat that code as a secret and rotate it if it leaks.
:::

Receives bounce and complaint webhooks from a transactional email provider and updates the affected contacts' statuses.

This is the **`/handle/` form** of the webhook URL, for providers that reject a URL ending in what looks like a token. It behaves identically to the short form.

**Accepts any HTTP method.** The route is registered with `any()`, so `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` all reach the same handler — providers differ in what they send, and none of them are turned away. `POST` is what every supported provider actually uses.

Recognised `service_name` values: `mailgun`, `pepipost`, `postmark`, `sendgrid`, `sparkpost`, `elasticemail`, `postalserver`, `smtp2go`, `brevo`, `tosend`.

Two behaviours are easy to misread:

- An **unrecognised** `service_name` does not error. It is handed to the `fluent_crm_handle_bounce_{service_name}` filter so add-ons can implement their own provider, and returns `success: 0` when nothing handles it. **The security code is not checked on this path** — validating it is the custom handler's responsibility.
- A **wrong security code** on a recognised service returns HTTP **200** with `{"status": false}`, not a 401 or 403. Check the body, not the status code.

The security code is generated on first use and stored as the FluentCRM option `_fc_bounce_key`. Both path segments are constrained to alphanumerics and dashes.

<!-- fc:access -->

**Authentication:** none — this is a public endpoint.

<!-- /fc:access -->

**Auth:** None (public)

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `service_name` | string | yes | Email service sending the webhook. Unrecognised values are routed to the custom-handler filter. |
| `security_code` | string | yes | Secret from FluentCRM's bounce-handler settings. Compared with `hash_equals()`. |


**Responses**

- **200** — Always 200 while the route matches. Read `success` / `status` in the body to tell a recorded webhook from a rejected one.

  Example:

```json
{
  "success": 1,
  "message": "recorded",
  "service": "mailgun",
  "result": "processed",
  "time": 1785000000
}
```



---
