# FluentCRM API — Email Templates

11 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/templates/do-bulk-action`

**POST Bulk Action Templates**

Perform a bulk action on multiple email templates. Supports changing the status of templates or permanently deleting them. When `select_all` is 'true', the action is applied to all templates regardless of the provided IDs.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `action_name` (string) **required** _(enum: `change_template_status`, `delete_templates`)_ — The bulk action to perform.
- `template_ids` (array<integer>) — Template IDs to act on.
- `select_all` (string) _(enum: `true`, `false`)_ — If 'true', applies the action to all templates, ignoring `template_ids`.
- `status` (string) _(enum: `publish`, `draft`)_ — New status to set (required when `action_name` is 'change_template_status').

Example:

```json
{
  "action_name": "change_template_status",
  "template_ids": [
    42,
    43,
    44
  ],
  "status": "draft"
}
```


**Responses**

- **200** — Bulk action completed successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Status has been changed for the selected templates"
}
```


- **422** — Validation error (e.g., missing status for status change action).

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Please select status"
}
```



---

## POST `/templates`

**POST Create Template**

Create a new email template. If `template_id` is provided, the request is forwarded to the update endpoint instead. The template data should be passed as a nested `template` object containing the post fields, email subject, edit type, design template, and settings.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `template_id` (integer) — If provided, the request is redirected to update the existing template with this ID instead of creating a new one.
- `template` (object) — Template data object.
  - `post_title` (string) — Template title. If empty, defaults to 'Email Template @ {current_time}'.
  - `post_content` (string) — Template HTML content.
  - `post_excerpt` (string) — Template excerpt or email preview text.
  - `email_subject` (string) — Email subject line. Defaults to the post_title if empty.
  - `edit_type` (string) _(enum: `html`, `visual`; default: `html`)_ — Editor type used for the template.
  - `design_template` (string) — Design template identifier (e.g., 'simple', 'plain', 'classic'). Defaults to the site's default email template if not provided.
  - `settings` (object) — Template settings.
    - `template_config` (object) — Template configuration options (e.g., content_padding).
      - `content_padding` (integer) _(default: `20`)_ — Content padding in pixels.
    - `footer_settings` (object) — Footer configuration.
      - `custom_footer` (string) _(enum: `yes`, `no`; default: `no`)_ — Whether to use a custom footer.
      - `footer_content` (string) — Custom footer HTML content. Must include ##crm.manage_subscription_url## or ##crm.unsubscribe_url## when custom_footer is 'yes'.

Example:

```json
{
  "template": {
    "post_title": "Monthly Newsletter",
    "post_content": "<h1>Newsletter</h1><p>Hello {{contact.first_name}},</p><p>Here are the latest updates.</p>",
    "post_excerpt": "Your monthly newsletter update",
    "email_subject": "Monthly Newsletter - {{crm.business_name}}",
    "edit_type": "html",
    "design_template": "simple",
    "settings": {
      "template_config": {
        "content_padding": 20
      },
      "footer_settings": {
        "custom_footer": "no",
        "footer_content": ""
      }
    }
  }
}
```


**Responses**

- **200** — Template created successfully.

  Schema (`application/json`):

  - `message` (string)
  - `template_id` (integer) — ID of the newly created template.

  Example:

```json
{
  "message": "Template successfully created",
  "template_id": 43
}
```



---

## DELETE `/templates/{id}`

**DELETE Delete Template**

Permanently delete a single email template by ID. This removes the template and all associated metadata.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The template ID to delete. |


**Responses**

- **200** — Template deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "The template has been deleted successfully."
}
```


- **404** — Template not found.

  Schema (`application/json`):

  - `message` (string)

---

## POST `/templates/duplicate/{id}`

**POST Duplicate Template**

Create a duplicate of an existing email template. The new template title is prefixed with '[Duplicate]'. All template metadata is copied including email subject, edit type, design template, template config, and footer settings.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The ID of the template to duplicate. |


**Responses**

- **200** — Template duplicated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `template_id` (integer) — ID of the newly created duplicate template.

  Example:

```json
{
  "message": "Template successfully duplicated",
  "template_id": 44
}
```


- **404** — Source template not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/templates/built-in-templates`

**GET Get Built-In Templates**

Retrieve a collection of pre-designed email templates from the FluentCRM template library. Templates are fetched from a remote API and cached locally for 24 hours. Each template includes its design JSON, cover image, and metadata.

**Auth:** ApplicationPasswords

**Responses**

- **200** — List of built-in email templates.

  Schema (`application/json`):

  - `templates` (array<BuiltInTemplate>)

  Example:

```json
{
  "templates": [
    {
      "id": 101,
      "title": "Product Launch Announcement",
      "content": "{\"blocks\":[...]}",
      "short_description": "A professional template for announcing new product launches.",
      "link": "https://fluentcrm.com/templates/product-launch/",
      "media_url": "https://fluentcrm.com/wp-content/uploads/2024/01/product-launch-thumb.jpg",
      "status": "publish",
      "cover_image": "https://fluentcrm.com/wp-content/uploads/2024/01/product-launch-cover.jpg"
    },
    {
      "id": 102,
      "title": "Welcome Series - Day 1",
      "content": "{\"blocks\":[...]}",
      "short_description": "First email in a welcome series for new subscribers.",
      "link": "https://fluentcrm.com/templates/welcome-day-1/",
      "media_url": "https://fluentcrm.com/wp-content/uploads/2024/01/welcome-thumb.jpg",
      "status": "publish",
      "cover_image": "https://fluentcrm.com/wp-content/uploads/2024/01/welcome-cover.jpg"
    }
  ]
}
```



---

## GET `/templates/smartcodes`

**GET Get Smart Codes**

Retrieve all available smartcodes grouped by category. Smartcodes are placeholder tokens (e.g., `{{contact.first_name}}`) that get replaced with actual values when emails are sent. Groups include contact fields, custom fields, and general codes like business name and unsubscribe URLs.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Available smartcode groups.

  Schema (`application/json`):

  - `smartcodes` (array<object>) — Array of smartcode groups.
    - `key` (string) — Group identifier (e.g., 'contact', 'general', 'contact_custom_fields').
    - `title` (string) — Human-readable group title.
    - `shortcodes` (object) — Key-value pairs where keys are smartcode placeholders and values are human-readable labels.
      - _(object)_

  Example:

```json
{
  "smartcodes": [
    {
      "key": "contact",
      "title": "Contact",
      "shortcodes": {
        "{{contact.full_name}}": "Full Name",
        "{{contact.prefix}}": "Name Prefix",
        "{{contact.first_name}}": "First Name",
        "{{contact.last_name}}": "Last Name",
        "{{contact.email}}": "Contact Email",
        "{{contact.id}}": "Contact ID",
        "{{contact.user_id}}": "User ID",
        "{{contact.address_line_1}}": "Address Line 1",
        "{{contact.address_line_2}}": "Address Line 2",
        "{{contact.city}}": "City",
        "{{contact.state}}": "State",
        "{{contact.postal_code}}": "Postal Code",
        "{{contact.country}}": "Country",
        "{{contact.phone}}": "Phone Number",
        "{{contact.status}}": "Status",
        "{{contact.date_of_birth}}": "Date of Birth"
      }
    },
    {
      "key": "general",
      "title": "General",
      "shortcodes": {
        "{{crm.business_name}}": "Business Name",
        "{{crm.business_address}}": "Business Address",
        "{{wp.admin_email}}": "Admin Email",
        "##wp.url##": "Site URL",
        "##crm.unsubscribe_url##": "Unsubscribe URL",
        "##crm.manage_subscription_url##": "Manage Subscription URL",
        "##web_preview_url##": "View On Browser URL"
      }
    }
  ]
}
```



---

## GET `/templates/{id}`

**GET Get Template**

Retrieve a single email template by ID. Returns the template content, email subject, edit type, design template, and settings including template configuration and footer settings. If the template ID does not exist, returns a blank template structure with defaults.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The template ID. |


**Responses**

- **200** — Template details.

  Schema (`application/json`):

  - `template` (TemplateDetail)

  Example:

```json
{
  "template": {
    "post_title": "Welcome Email",
    "post_content": "<h1>Welcome!</h1><p>Thank you for subscribing, {{contact.first_name}}.</p>",
    "post_excerpt": "A welcome email for new subscribers",
    "email_subject": "Welcome to {{crm.business_name}}!",
    "edit_type": "html",
    "design_template": "simple",
    "settings": {
      "template_config": {
        "content_padding": 20
      },
      "footer_settings": {
        "custom_footer": "no",
        "footer_content": ""
      }
    }
  }
}
```



---

## GET `/templates/all`

**GET List All Templates**

Retrieve all published email templates (non-paginated) along with available smartcodes. Useful for template selection dropdowns where all published templates are needed at once.

**Auth:** ApplicationPasswords

**Responses**

- **200** — All published templates and available smartcodes.

  Schema (`application/json`):

  - `templates` (array<object>) — All published email templates, ordered by ID descending.
    - `ID` (integer) — Unique identifier for the template (WordPress post ID).
    - `post_title` (string) — Template title.
    - `post_content` (string) — Template HTML content.
    - `post_excerpt` (string) — Template excerpt or preview text.
    - `post_status` (string) _(enum: `publish`, `draft`)_ — Template status.
    - `post_type` (string) — WordPress post type slug for FluentCRM templates.
    - `post_date` (string) _(format: date-time)_ — Date when the template was created.
    - `post_modified` (string) _(format: date-time)_ — Date when the template was last modified.
    - `design_template` (string) — Design template identifier (e.g., 'simple', 'plain', 'classic').
  - `smartcodes` (array<SmartCodeGroup>) — Available smartcode groups for use in templates.

  Example:

```json
{
  "templates": [
    {
      "ID": 42,
      "post_title": "Welcome Email",
      "post_content": "<h1>Welcome!</h1><p>Thank you for subscribing.</p>",
      "post_excerpt": "",
      "post_status": "publish",
      "post_type": "fc_template",
      "post_date": "2024-01-15 10:30:00",
      "post_modified": "2024-03-01 14:30:00"
    }
  ],
  "smartcodes": [
    {
      "key": "contact",
      "title": "Contact",
      "shortcodes": {
        "{{contact.full_name}}": "Full Name",
        "{{contact.first_name}}": "First Name",
        "{{contact.last_name}}": "Last Name",
        "{{contact.email}}": "Contact Email"
      }
    }
  ]
}
```



---

## GET `/templates`

**GET List Templates**

Retrieve a paginated list of email templates. Supports filtering by status types and searching by title. Each template in the response includes its design template identifier.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search templates by title (partial match). |
| `types[]` | array<string> | no | Filter by post status types. |
| `orderBy` | string | no | Column to sort by. |
| `order` | string | no | Sort direction. |
| `per_page` | integer | no | Number of templates per page. |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Paginated list of email templates.

  Schema (`application/json`):

  - `templates` (object)
    - `total` (integer) — Total number of templates matching the query.
    - `per_page` (integer) — Number of templates per page.
    - `current_page` (integer) — Current page number.
    - `last_page` (integer) — Last page number.
    - `next_page_url` (string,null) — URL for the next page, or null if on the last page.
    - `prev_page_url` (string,null) — URL for the previous page, or null if on the first page.
    - `from` (integer) — Starting record index on this page.
    - `to` (integer) — Ending record index on this page.
    - `data` (array<TemplateListItem>)

  Example:

```json
{
  "templates": {
    "total": 25,
    "per_page": 15,
    "current_page": 1,
    "last_page": 2,
    "next_page_url": "/wp-json/fluent-crm/v2/templates?page=2",
    "prev_page_url": null,
    "from": 1,
    "to": 15,
    "data": [
      {
        "ID": 42,
        "post_title": "Welcome Email",
        "post_content": "<h1>Welcome!</h1><p>Thank you for subscribing.</p>",
        "post_excerpt": "A welcome email for new subscribers",
        "post_status": "publish",
        "post_type": "fc_template",
        "post_date": "2024-01-15 10:30:00",
        "post_modified": "2024-03-01 14:30:00",
        "design_template": "simple"
      }
    ]
  }
}
```



---

## POST `/templates/set-global-style`

**POST Set Global Style**

Update the global email style configuration. These settings apply as defaults across all email templates. Each setting value is sanitized before being saved.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `config` (object) — Key-value pairs of global style settings. All values are sanitized as text.
  - _(object)_

Example:

```json
{
  "config": {
    "body_bg_color": "#f2f4f6",
    "content_bg_color": "#ffffff",
    "content_font_family": "Arial, sans-serif",
    "content_font_color": "#333333",
    "link_color": "#3869d4",
    "heading_font_color": "#222222",
    "footer_font_color": "#999999"
  }
}
```


**Responses**

- **200** — Global style settings updated successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Global style settings have been updated"
}
```



---

## PUT `/templates/{id}`

**PUT Update Template**

Update an existing email template. The template data should be passed as a nested `template` object. If a custom footer is enabled, it must include `##crm.manage_subscription_url##` or `##crm.unsubscribe_url##` for compliance.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The template ID to update. |


**Request body** (`application/json`, required)

- `template` (object) — Template data object.
  - `post_title` (string) — Template title. If empty, defaults to 'Email template created at {date}'.
  - `post_content` (string) — Template HTML content.
  - `post_excerpt` (string) — Template excerpt or email preview text.
  - `email_subject` (string) — Email subject line. If empty, defaults to 'Email template created at {date}'.
  - `edit_type` (string) _(enum: `html`, `visual`)_ — Editor type used for the template.
  - `design_template` (string) — Design template identifier (e.g., 'simple', 'plain', 'classic').
  - `settings` (object) — Template settings.
    - `template_config` (object) — Template configuration options.
      - `content_padding` (integer) — Content padding in pixels.
    - `footer_settings` (object) — Footer configuration. When custom_footer is 'yes', footer_content must include ##crm.manage_subscription_url## or ##crm.unsubscribe_url##.
      - `custom_footer` (string) _(enum: `yes`, `no`)_ — Whether to use a custom footer.
      - `footer_content` (string) — Custom footer HTML content.

Example:

```json
{
  "template": {
    "post_title": "Updated Newsletter",
    "post_content": "<h1>Newsletter v2</h1><p>Hello {{contact.first_name}},</p><p>Updated content here.</p>",
    "post_excerpt": "Updated newsletter preview text",
    "email_subject": "Updated Newsletter - {{crm.business_name}}",
    "edit_type": "html",
    "design_template": "simple",
    "settings": {
      "template_config": {
        "content_padding": 20
      },
      "footer_settings": {
        "custom_footer": "no",
        "footer_content": ""
      }
    }
  }
}
```


**Responses**

- **200** — Template updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `template_id` (integer) — ID of the updated template.

  Example:

```json
{
  "message": "Template successfully updated",
  "template_id": 42
}
```


- **404** — Template not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — Validation error (e.g., custom footer missing compliance URL).

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "##crm.manage_subscription_url## or ##crm.unsubscribe_url## string is required for compliance. Please include unsubscription or manage subscription link"
}
```



---
