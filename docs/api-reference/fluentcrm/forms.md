# FluentCRM API — Forms

5 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/forms`

**POST Create Form**

Create a new Fluent Form with FluentCRM integration pre-configured. The form is created from a template and automatically gets a FluentCRM integration feed with the specified tags and list. Requires Fluent Forms to be installed.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `template_id` (string) **required** — Template ID to create the form from (e.g., `inline_subscribe`, `simple_optin`, `with_name_subscribe`).
- `title` (string) **required** — Form title. Must be unique across all Fluent Forms.
- `selected_tags` (array<integer>) **required** — FluentCRM tag IDs to assign to form submissions.
- `selected_list` (integer) **required** — FluentCRM list ID to assign to form submissions.
- `double_optin` (boolean) — Whether to enable double opt-in for form submissions.

Example:

```json
{
  "template_id": "inline_subscribe",
  "title": "Newsletter Signup",
  "selected_tags": [
    1,
    3
  ],
  "selected_list": 2,
  "double_optin": true
}
```


**Responses**

- **200** — Form created successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.
  - `created_form` (object)
    - `id` (integer) — Created form ID.
    - `shortcode` (string) — WordPress shortcode to embed the form.
    - `feed_url` (string) — URL to the FluentCRM integration feed settings.
    - `edit_url` (string) — URL to edit the form.
    - `preview_url` (string) — URL to preview the form.

  Example:

```json
{
  "message": "Form has been created",
  "created_form": {
    "id": 12,
    "shortcode": "[fluentform id=\"12\"]",
    "feed_url": "https://example.com/wp-admin/admin.php?page=fluent_forms&form_id=12&route=settings",
    "edit_url": "https://example.com/wp-admin/admin.php?page=fluent_forms&route=editor&form_id=12",
    "preview_url": "https://example.com/?fluent_forms_pages=1&design_mode=1&preview_id=12"
  }
}
```


- **422** — Validation error (e.g., missing required fields, duplicate title).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "Unprocessable Entity",
  "errors": {
    "title": [
      "The title has already been taken."
    ]
  }
}
```



---

## GET `/forms/{id}/entries`

**GET Form Entries**

Retrieve a paginated list of form submission entries for a specific Fluent Form. Includes submission data, browser info, device info, and a link to view the entry in the Fluent Forms admin. Requires Fluent Forms to be installed and appropriate entry viewer permissions.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Form ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | no | Page number for pagination. |
| `per_page` | integer | no | Number of entries per page. |
| `search` | string | no | Search entries by response content or status. |


**Responses**

- **200** — Paginated list of form entries.

  Schema (`application/json`):

  - `entries` (object)
    - `data` (array<FormEntry>)
    - `page` (integer) — Current page number.
    - `per_page` (integer) — Items per page.
    - `total` (integer) — Total number of entries.
    - `last_page` (integer) — Last page number.
  - `form` (object)
    - `id` (integer) — Form ID.
    - `title` (string) — Form title.

  Example:

```json
{
  "entries": {
    "data": [
      {
        "id": 101,
        "serial_number": 1,
        "status": "read",
        "created_at": "2024-03-01 14:30:00",
        "response": {
          "email": "john@example.com",
          "names": {
            "first_name": "John",
            "last_name": "Doe"
          }
        },
        "user_id": 5,
        "browser": "Chrome",
        "device": "Desktop",
        "ip": "192.168.1.1",
        "entry_url": "https://example.com/wp-admin/admin.php?page=fluent_forms&form_id=5&route=entries#/entries/101"
      }
    ],
    "page": 1,
    "per_page": 10,
    "total": 25,
    "last_page": 3
  },
  "form": {
    "id": 5,
    "title": "Newsletter Signup"
  }
}
```


- **422** — Fluent Forms not installed, form not found, or insufficient permissions.

  Schema (`application/json`):

  - `message` (string)
  - `entries` (array<any>)

  Example:

```json
{
  "message": "Fluent Forms is not installed",
  "entries": []
}
```



---

## GET `/forms/{form_id}/entries/{id}`

**GET Form Entry**

Retrieve a single form entry by ID. Returns a dynamic HTML view of the entry data, rendered via the `fluent_crm/dynamic_contact_item_view_fluentform` filter.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `form_id` | integer | yes | Form ID. |
| `id` | integer | yes | Entry ID. |


**Responses**

- **200** — Entry detail view.

  Schema (`application/json`):

  - `entry` (object)
    - `content_html` (string) — HTML rendering of the entry data.

  Example:

```json
{
  "entry": {
    "content_html": "<table><tr><td>Email</td><td>john@example.com</td></tr></table>"
  }
}
```



---

## GET `/forms/templates`

**GET Form Templates**

Retrieve available form templates for creating new Fluent Forms with FluentCRM integration. Default templates include Inline Opt-in, Simple Opt-in, and Subscription Form with name fields.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Available form templates.

  Schema (`application/json`):

  - `templates` (object) — Map of template IDs to template details.
    - _(object)_

  Example:

```json
{
  "templates": {
    "inline_subscribe": {
      "label": "Inline Opt-in Form",
      "image": "https://example.com/images/forms/form_1.svg",
      "id": "inline_subscribe",
      "form_fields": "{\"fields\":[...]}",
      "custom_css": ".fluent_form_FF_ID { position: relative; }",
      "map_fields": {
        "email": "email"
      }
    },
    "simple_optin": {
      "label": "Simple Opt-in Form",
      "image": "https://example.com/images/forms/form_2.svg",
      "id": "simple_optin",
      "form_fields": "{\"fields\":[...]}",
      "custom_css": "",
      "map_fields": {
        "email": "email"
      }
    },
    "with_name_subscribe": {
      "label": "Subscription Form",
      "image": "https://example.com/images/forms/form_3.svg",
      "id": "with_name_subscribe",
      "form_fields": "{\"fields\":[...]}",
      "custom_css": "",
      "map_fields": {
        "email": "email",
        "first_name": "{inputs.names.first_name}",
        "last_name": "{inputs.names.last_name}"
      }
    }
  }
}
```



---

## GET `/forms`

**GET List Forms**

Retrieve a paginated list of Fluent Forms that are connected to FluentCRM (via integration feeds or automation funnels). Returns form details including associated tags, lists, shortcode, and links to edit/preview the form. Requires Fluent Forms to be installed.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | no | Page number for pagination. |
| `per_page` | integer | no | Number of forms per page. |
| `search` | string | no | Search forms by title. |


**Responses**

- **200** — List of connected forms.

  Schema (`application/json`):

  - `installed` (boolean) — Whether Fluent Forms is installed and active.
  - `forms` (object)
    - `data` (array<Form>)
    - `page` (integer) — Current page number.
    - `per_page` (integer) — Items per page.
    - `total` (integer) — Total number of connected forms.
    - `last_page` (integer) — Last page number.

  Example:

```json
{
  "installed": true,
  "forms": {
    "data": [
      {
        "id": 5,
        "title": "Newsletter Signup",
        "status": "published",
        "created_at": "2024-01-15 10:00:00",
        "funnel_url": "",
        "feed_url": "https://example.com/wp-admin/admin.php?page=fluent_forms&form_id=5&route=settings",
        "associate_tags": "Newsletter, VIP",
        "associate_lists": "Main List",
        "shortcode": "[fluentform id=\"5\"]",
        "edit_url": "https://example.com/wp-admin/admin.php?page=fluent_forms&route=editor&form_id=5",
        "preview_url": "https://example.com/?fluent_forms_pages=1&design_mode=1&preview_id=5"
      }
    ],
    "page": 1,
    "per_page": 10,
    "total": 3,
    "last_page": 1
  }
}
```



---
