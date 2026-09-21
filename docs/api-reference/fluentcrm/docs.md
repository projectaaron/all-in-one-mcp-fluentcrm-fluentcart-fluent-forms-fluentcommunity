# FluentCRM API — Docs & Addons

3 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## GET `/docs/{doc_id}`

**GET Get Doc**

Retrieve a single documentation article by its ID from the FluentCRM website.

<!-- fc:access -->

**Required capability:** `fcrm_view_dashboard`

_Enforced by `ReportPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `doc_id` | integer | yes | The documentation article ID. |


**Responses**

- **200** — Documentation article details.

  Schema (`application/json`):

  - `title` (string) — Sanitized title of the article.
  - `content` (string) — Sanitized HTML content with target attributes added to links.
  - `link` (string) _(format: uri)_ — URL to the article on the FluentCRM website.
  - `id` (integer) — Article ID.

  Example:

```json
{
  "title": "Getting Started with FluentCRM",
  "content": "<p>Welcome to FluentCRM. This guide will help you...</p>",
  "link": "https://fluentcrm.com/docs/getting-started/",
  "id": 123
}
```


- **error** — Returned when the remote doc fetch fails.

  Schema (`application/json`):

  - `content` (string) — Error message.
  - `is_error` (boolean) — Always true when an error occurs.

  Example:

```json
{
  "content": "sorry, we could not fetch the doc at this moment. Please try again",
  "is_error": true
}
```



---

## GET `/docs/addons`

**GET Get Addons**

Retrieve the list of recommended companion plugins (Fluent Forms, Fluent SMTP, Fluent Support) with their installation status. Optionally includes experimental feature settings.

<!-- fc:access -->

**Required capability:** `fcrm_view_dashboard`

_Enforced by `ReportPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with[]` | array<string> | no | Include additional data. Pass `experimental_features` to include experimental settings. |


**Responses**

- **200** — Addons list with installation status.

  Schema (`application/json`):

  - `addons` (object) — Map of addon slugs to addon details.
    - _(object)_
  - `experimental_features` (object) — Only present when `with[]=experimental_features` is passed. Contains experimental feature settings. Returned **only** when `with[]=experimental_features` is requested.
    - _(object)_

  Example:

```json
{
  "addons": {
    "fluentform": {
      "title": "Fluent Forms",
      "logo": "https://example.com/wp-content/plugins/fluent-crm/assets/images/fluentform.png",
      "is_installed": true,
      "learn_more_url": "https://wordpress.org/plugins/fluentform/",
      "settings_url": "https://example.com/wp-admin/admin.php?page=fluent_forms",
      "action_text": "Active Fluent Forms",
      "description": "Collect leads and build any type of forms..."
    },
    "fluentsmtp": {
      "title": "Fluent SMTP",
      "logo": "https://example.com/wp-content/plugins/fluent-crm/assets/images/fluent-smtp.svg",
      "is_installed": false,
      "learn_more_url": "https://wordpress.org/plugins/fluent-smtp/",
      "settings_url": "https://example.com/wp-admin/options-general.php?page=fluent-mail#/",
      "action_text": "Install Fluent SMTP",
      "description": "The Ultimate SMTP and SES Plugin for WordPress..."
    },
    "fluent-support": {
      "title": "Fluent Support",
      "logo": "https://example.com/wp-content/plugins/fluent-crm/assets/images/fluent-support.svg",
      "is_installed": false,
      "learn_more_url": "https://wordpress.org/plugins/fluent-support/",
      "settings_url": "https://example.com/wp-admin/admin.php?page=fluent-support#/",
      "action_text": "Install Fluent Support",
      "description": "WordPress Helpdesk and Customer Support Ticket Plugin..."
    }
  }
}
```



---

## GET `/docs`

**GET List Docs**

Retrieve the full list of documentation articles fetched from the FluentCRM website. Results are cached for one week.

<!-- fc:access -->

**Required capability:** `fcrm_view_dashboard`

_Enforced by `ReportPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — List of documentation articles.

  Schema (`application/json`):

  - `docs` (array<DocSummary>) — Array of documentation articles.

  Example:

```json
{
  "docs": [
    {
      "title": "Getting Started with FluentCRM",
      "content": "<p>Welcome to FluentCRM...</p>",
      "link": "https://fluentcrm.com/docs/getting-started/",
      "category": {
        "value": "getting-started",
        "label": "Getting Started"
      }
    },
    {
      "title": "Managing Contacts",
      "content": "<p>Learn how to manage your contacts...</p>",
      "link": "https://fluentcrm.com/docs/managing-contacts/",
      "category": {
        "value": "contacts",
        "label": "Contacts"
      }
    }
  ]
}
```



---
