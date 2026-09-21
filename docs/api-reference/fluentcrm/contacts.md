# FluentCRM API — Contacts (Subscribers)

32 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/subscribers/do-bulk-action`

**POST Bulk Action Contacts**

Perform a bulk action on multiple contacts. Supports adding/removing tags and lists, changing status/type, deleting contacts, sending double opt-in, adding to email sequences/automation funnels/companies, removing from companies, and updating custom fields. When `is_all` is `yes`, processes contacts matching the filter query in chunks.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `SubscriberPolicy::handleBulkActions()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `action_name` (string) **required** _(enum: `add_to_tags`, `remove_from_tags`, `add_to_lists`, `remove_from_lists`, `delete_contacts`, `send_double_optin`, `change_contact_status`, `change_contact_type`, `add_to_email_sequence`, `add_to_automation`, `add_to_company`, `remove_from_company`, `update_custom_fields`)_ — The bulk action to perform.
- `subscriber_ids` (array<integer>) — Contact IDs to act on (used when `is_all` is not `yes`).
- `is_all` (string) _(enum: `yes`, `no`)_ — If `yes`, applies the action to all contacts matching the `contact_query` filter. Processes in chunks.
- `contact_query` (object) — Filter query to select contacts when `is_all` is `yes`.
  - `filter_type` (string) _(enum: `simple`, `advanced`)_
  - `search` (string)
  - `tags` (array<integer>)
  - `statuses` (array<string>)
  - `lists` (array<integer>)
  - `company_ids` (array<integer>)
  - `advanced_filters` (string) — JSON-encoded advanced filter groups.
- `last_id` (integer) _(default: `0`)_ — Last processed contact ID for chunked processing (when `is_all` is `yes`).
- `action_options` (array<integer>) — Tag/list IDs for add/remove tag/list actions.
- `new_status` (string) — New status/type value for `change_contact_status`, `change_contact_type`, sequence/automation/company ID for respective actions.
- `custom_field` (object) — Custom field data for `update_custom_fields` action.
  - `key` (string) — Custom field key.
  - `value` (string) — Custom field value.

Example:

```json
{
  "action_name": "add_to_tags",
  "subscriber_ids": [
    1,
    5,
    12
  ],
  "action_options": [
    3,
    7
  ]
}
```


**Responses**

- **200** — Bulk action completed successfully.

  Schema (`application/json`):

  - `message` (string)
  - `completed_contacts` (integer) — Number of contacts processed in this chunk.
  - `last_contact_id` (integer) — Last processed contact ID (for chunked processing).
  - `is_completed` (boolean) — Only present when all contacts have been processed in `is_all` mode.

  Example:

```json
{
  "message": "Selected bulk action has been successfully completed",
  "completed_contacts": 3,
  "last_contact_id": 12
}
```


- **422** — Validation error.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Subscribers selection is required"
}
```



---

## POST `/subscribers/bulk-add-update`

**POST Bulk Add/Update Contacts**

Add or update multiple contacts in a single request. Each contact in the array is processed individually. Invalid contacts (missing or invalid email) are collected and returned separately. Optionally sends double opt-in emails and forces updates on existing contacts.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `contacts` (array<object>) **required** — Array of contact objects to create or update.
  - `email` (string) **required** _(format: email)_
  - `first_name` (string)
  - `last_name` (string)
  - `prefix` (string)
  - `status` (string) _(enum: `subscribed`, `pending`, `unsubscribed`, `bounced`, `complained`)_
  - `contact_type` (string) _(enum: `lead`, `customer`)_
  - `address_line_1` (string)
  - `address_line_2` (string)
  - `postal_code` (string)
  - `city` (string)
  - `state` (string)
  - `country` (string)
  - `phone` (string)
  - `timezone` (string)
  - `date_of_birth` (string)
  - `source` (string)
  - `tags` (array<integer>) — Tag IDs to assign.
  - `lists` (array<integer>) — List IDs to assign.
- `double_optin` (boolean) _(default: `false`)_ — Send double opt-in emails to contacts with `pending` status.
- `force_update` (boolean) _(default: `false`)_ — Update existing contacts that share an email address.

Example:

```json
{
  "contacts": [
    {
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "status": "subscribed",
      "tags": [
        1,
        3
      ],
      "lists": [
        2
      ]
    },
    {
      "email": "jane@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "status": "pending"
    }
  ],
  "force_update": true,
  "double_optin": true
}
```


**Responses**

- **200** — Bulk operation result with created, updated, and invalid contacts.

  Schema (`application/json`):

  - `message` (string)
  - `created` (array<object>) — Newly created contacts.
    - `id` (integer)
    - `email` (string)
    - `status` (string)
  - `updated` (array<object>) — Updated existing contacts.
    - `id` (integer)
    - `email` (string)
    - `status` (string)
  - `invalids` (array<object>) — Contacts that could not be processed (invalid/missing email).
    - _(object)_

  Example:

```json
{
  "message": "Successfully added/updated the subscribers.",
  "created": [
    {
      "id": 42,
      "email": "john@example.com",
      "status": "subscribed"
    }
  ],
  "updated": [
    {
      "id": 5,
      "email": "jane@example.com",
      "status": "pending"
    }
  ],
  "invalids": []
}
```



---

## POST `/subscribers`

**POST Create Contact**

Create a new contact. If `__force_update` is set to `yes`, it will update an existing contact with the same email instead of returning an error. Optionally sends a double opt-in email.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `email` (string) **required** _(format: email)_ — Contact email address. Must be unique unless `__force_update` is `yes`.
- `status` (string) **required** _(enum: `subscribed`, `pending`, `unsubscribed`, `bounced`, `complained`)_ — Contact subscription status.
- `first_name` (string) — First name.
- `last_name` (string) — Last name.
- `prefix` (string) — Name prefix (e.g., Mr, Mrs, Ms).
- `contact_type` (string) _(enum: `lead`, `customer`)_ — Contact type.
- `address_line_1` (string) — Address line 1.
- `address_line_2` (string) — Address line 2.
- `postal_code` (string) — Postal/zip code.
- `city` (string) — City.
- `state` (string) — State or province.
- `country` (string) — Two-letter country code.
- `phone` (string) — Phone number.
- `timezone` (string) — Timezone identifier.
- `date_of_birth` (string) — Date of birth (YYYY-MM-DD).
- `source` (string) — Contact source.
- `tags` (array<integer>) — Tag IDs to assign.
- `lists` (array<integer>) — List IDs to assign.
- `double_optin` (boolean) — Send double opt-in confirmation email.
- `__force_update` (string) _(enum: `yes`, `no`)_ — If `yes`, updates existing contact with the same email instead of failing.

Example:

```json
{
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "status": "subscribed",
  "contact_type": "lead",
  "tags": [
    1,
    3
  ],
  "lists": [
    2
  ]
}
```


**Responses**

- **200** — Contact created or updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `contact` (Contact)
  - `action_type` (string) _(enum: `created`, `updated`)_ — `created` if a new contact was made, `updated` if `__force_update` was used on an existing email.

  Example:

```json
{
  "message": "Successfully added the subscriber.",
  "contact": {
    "id": 42,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "subscribed",
    "contact_type": "lead",
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 10:00:00"
  },
  "action_type": "created"
}
```


- **422** — Validation error (e.g., email already exists, missing required fields).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "Provided email already assigned to another subscriber.",
  "errors": {
    "email": [
      "Provided email already assigned to another subscriber."
    ]
  }
}
```



---

## POST `/subscribers/{id}/notes`

**POST Create Contact Note**

Add a new note to a contact. The note description supports SmartCode/merge tags which are parsed before saving. If `created_at` is not provided, it defaults to the current WordPress time.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Request body** (`application/json`, required)

- `note` (object) **required**
  - `title` (string) **required** — Note title.
  - `description` (string) **required** — Note content (HTML). Supports SmartCode/merge tags.
  - `type` (string) **required** _(enum: `note`, `call`, `email`, `meeting`, `activity`)_ — Note type.
  - `created_at` (string) _(format: date-time)_ — Custom creation date. Defaults to current time if not provided.

Example:

```json
{
  "note": {
    "title": "Call follow-up",
    "description": "<p>Discussed pricing options. Will send proposal by Friday.</p>",
    "type": "note"
  }
}
```


**Responses**

- **200** — Note created successfully.

  Schema (`application/json`):

  - `note` (Note)
  - `message` (string)

  Example:

```json
{
  "note": {
    "id": 15,
    "subscriber_id": 1,
    "title": "Call follow-up",
    "description": "<p>Discussed pricing options. Will send proposal by Friday.</p>",
    "type": "note",
    "created_at": "2024-03-01 14:30:00",
    "updated_at": "2024-03-01 14:30:00"
  },
  "message": "Note successfully added"
}
```


- **422** — Validation error.

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## DELETE `/subscribers/{id}`

**DELETE Delete Contact**

Permanently delete a single contact by ID. This removes the contact and all associated data.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts_delete`

_Enforced by `SubscriberPolicy::deleteSubscriber()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID to delete. |


**Responses**

- **200** — Contact deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Selected Subscriber has been deleted successfully"
}
```


- **404** — Contact not found.

  Schema (`application/json`):

  - `message` (string)

---

## DELETE `/subscribers/{id}/emails`

**DELETE Delete Contact Emails**

Delete specific email records for a contact by their email IDs. Only deletes campaign emails belonging to the specified contact.

<!-- fc:access -->

**Required capability:** `fcrm_manage_email_delete`

_Enforced by `SubscriberPolicy::deleteEmails()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Request body** (`application/json`, required)

- `email_ids` (array<integer>) **required** — Array of campaign email IDs to delete.

Example:

```json
{
  "email_ids": [
    100,
    101,
    102
  ]
}
```


**Responses**

- **200** — Emails deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Selected emails have been deleted"
}
```



---

## DELETE `/subscribers/{id}/notes/{note_id}`

**DELETE Delete Contact Note**

Delete a specific note from a contact.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts_delete`

_Enforced by `SubscriberPolicy::deleteNote()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |
| `note_id` | integer | yes | The note ID to delete. |


**Responses**

- **200** — Note deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Note successfully deleted"
}
```


- **404** — Contact not found.

  Schema (`application/json`):

  - `message` (string)

---

## DELETE `/subscribers`

**DELETE Delete Contacts**

Permanently delete multiple contacts by their IDs. This removes the contacts and all associated data.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts_delete`

_Enforced by `SubscriberPolicy::deleteSubscribers()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `subscribers` (array<integer>) **required** — Array of contact IDs to delete.

Example:

```json
{
  "subscribers": [
    1,
    5,
    12
  ]
}
```


**Responses**

- **200** — Contacts deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Selected Subscribers have been deleted"
}
```


- **422** — Validation error (no subscriber IDs provided).

  Schema (`application/json`):

  - `message` (string)

---

## GET `/subscribers/{id}`

**GET Get Contact**

Retrieve a single contact by ID or email. Supports eager-loading related data like stats, custom values, custom field definitions, and commerce stats via the `with[]` parameter.

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `get_by_email` | string | no | If set, looks up the contact by email address instead of the path `id`. |
| `with[]` | array<string> | no | Relationships and extra data to include. Supported values: `stats`, `subscriber.custom_values`, `custom_fields`, `commerce_stat`. |


**Responses**

- **200** — Contact details.

  Schema (`application/json`):

  - `subscriber` (any)
  - `custom_fields` (array<object>) — Custom field definitions (only when `with[]` includes `custom_fields`). Returned **only** when the request asks for custom fields.
    - `label` (string)
    - `slug` (string)
    - `type` (string)

  Example:

```json
{
  "subscriber": {
    "id": 1,
    "user_id": "5",
    "hash": "a1b2c3d4e5f6",
    "contact_owner": null,
    "company_id": null,
    "prefix": "Mr",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "email": "john@example.com",
    "status": "subscribed",
    "contact_type": "customer",
    "address_line_1": "123 Main St",
    "address_line_2": "",
    "postal_code": "90210",
    "city": "Beverly Hills",
    "state": "CA",
    "country": "US",
    "phone": "+1234567890",
    "timezone": "America/New_York",
    "date_of_birth": "1990-05-15",
    "source": "web",
    "life_time_value": 0,
    "last_activity": "2024-03-01 14:30:00",
    "total_points": 0,
    "latitude": null,
    "longitude": null,
    "ip": "192.168.1.1",
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-03-01 14:30:00",
    "photo": "https://www.gravatar.com/avatar/abc123",
    "user_edit_url": "https://example.com/wp-admin/user-edit.php?user_id=5",
    "user_roles": [
      "subscriber"
    ],
    "tags": [
      {
        "id": 1,
        "title": "VIP Customer",
        "slug": "vip-customer"
      }
    ],
    "lists": [
      {
        "id": 1,
        "title": "Newsletter",
        "slug": "newsletter"
      }
    ],
    "stats": {
      "emails": 25,
      "opens": 18,
      "clicks": 7,
      "total_points": 150,
      "last_activity": "2024-03-01 14:30:00"
    },
    "custom_values": {
      "company_name": "Acme Inc",
      "job_title": "Developer"
    }
  },
  "custom_fields": [
    {
      "label": "Company Name",
      "slug": "company_name",
      "type": "text"
    },
    {
      "label": "Job Title",
      "slug": "job_title",
      "type": "text"
    }
  ]
}
```


- **404** — Contact not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Subscriber not found"
}
```



---

## GET `/subscribers/{id}/dynamic-item-view`

**GET Get Contact Dynamic Item View**

Retrieve a dynamic item view for a contact from a specific provider. The content is generated by the `fluent_crm/dynamic_contact_item_view_{provider}` filter hook and typically returns rendered HTML content.

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `provider` | string | yes | The dynamic view provider identifier. |
| `params` | object | no | Additional parameters to pass to the provider. |


**Responses**

- **200** — Dynamic item view data.

  Schema (`application/json`):

  - `data_view` (object)
    - `type` (string) — View type (e.g., `html`).
    - `title` (string) — View title.
    - `content_html` (string) — Rendered HTML content.
    - `footer_content` (string) — Footer HTML content.

  Example:

```json
{
  "data_view": {
    "type": "html",
    "title": "Order Details",
    "content_html": "<div class=\"order-details\"><p>Order #1234 - $59.99</p></div>",
    "footer_content": ""
  }
}
```


- **404** — Contact not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/subscribers/{id}/emails`

**GET Get Contact Emails**

Retrieve a paginated list of emails sent to a contact. Supports filtering by open/click status. Can also show FluentSMTP logs when the `tab` parameter is set to `fluentsmtp`.

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `filter` | string | no | Filter emails by engagement status. |
| `tab` | string | no | Email source tab. Use `fluentsmtp` to show FluentSMTP logs instead of CRM campaign emails. |
| `per_page` | integer | no | Number of emails per page. |
| `page` | integer | no | Page number. |


**Responses**

- **200** — Paginated list of emails.

  Schema (`application/json`):

  - `emails` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `next_page_url` (string,null)
    - `prev_page_url` (string,null)
    - `from` (integer)
    - `to` (integer)
    - `data` (array<object>)
      - `id` (integer) — Campaign email ID.
      - `campaign_id` (integer) — Campaign ID.
      - `subscriber_id` (integer) — Contact ID.
      - `email_type` (string) — Type of email.
      - `email_subject_id` (integer,null)
      - `email_address` (string) — Recipient email address.
      - `email_subject` (string) — Email subject line.
      - `email_body` (string) — Email HTML body.
      - `status` (string) — Email delivery status.
      - `is_open` (integer) — Whether the email was opened (0 or 1).
      - `click_counter` (integer,null) — Number of clicks.
      - `scheduled_at` (string) _(format: date-time)_
      - `created_at` (string) _(format: date-time)_
      - `updated_at` (string) _(format: date-time)_

  Example:

```json
{
  "emails": {
    "total": 25,
    "per_page": 15,
    "current_page": 1,
    "last_page": 2,
    "next_page_url": "/wp-json/fluent-crm/v2/subscribers/1/emails?page=2",
    "prev_page_url": null,
    "from": 1,
    "to": 15,
    "data": [
      {
        "id": 100,
        "campaign_id": 5,
        "subscriber_id": 1,
        "email_type": "campaign",
        "email_address": "john@example.com",
        "email_subject": "Weekly Newsletter",
        "status": "sent",
        "is_open": 1,
        "click_counter": 3,
        "scheduled_at": "2024-03-01 09:00:00",
        "created_at": "2024-03-01 09:00:00",
        "updated_at": "2024-03-01 14:30:00"
      }
    ]
  }
}
```



---

## GET `/subscribers/{id}/external_view`

**GET Get Contact External View**

Retrieve external profile section content for a contact. The content is provided by registered section providers via the `fluencrm_profile_section_{section_provider}` filter hook.

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `section_provider` | string | yes | The section provider identifier. |


**Responses**

- **200** — External view section content.

  Schema (`application/json`):

  - `heading` (string) — Section heading.
  - `content_html` (string) — HTML content for the section.

  Example:

```json
{
  "heading": "WooCommerce Orders",
  "content_html": "<div class=\"order-summary\"><p>Total orders: 5</p></div>"
}
```


- **404** — Contact not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/subscribers/{id}/form-submissions`

**GET Get Contact Form Submissions**

Retrieve form submissions for a contact from a specific form provider. The data is fetched via the `fluentcrm_get_form_submissions_{provider}` filter hook, so the response structure depends on the active form integration (e.g., Fluent Forms).

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `provider` | string | yes | The form provider identifier (e.g., `fluentform`). |


**Responses**

- **200** — Form submissions data.

  Schema (`application/json`):

  - `submissions` (object)
    - `data` (array<object>) — List of form submissions. Structure varies by provider.
      - _(object)_
    - `total` (integer) — Total number of submissions.

  Example:

```json
{
  "submissions": {
    "data": [
      {
        "id": 56,
        "form_id": 3,
        "form_title": "Contact Form",
        "status": "read",
        "created_at": "2024-02-20 14:00:00"
      }
    ],
    "total": 1
  }
}
```


- **404** — Contact not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/subscribers/{id}/info-widgets`

**GET Get Contact Info Widgets**

Retrieve info widgets for a contact's profile page. Returns top widgets (like commerce stats) and other widgets registered by plugins. Optionally fetches a single specific widget when `by_widget` is provided.

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `by_widget` | string | no | If provided, returns only the specified widget type instead of all widgets. |


**Responses**

- **200** — Widget data. Shape varies based on whether `by_widget` is provided.

  Example:

```json
{
  "widgets": {
    "top_widgets": [
      {
        "title": "Commerce Stats",
        "content": "<div>Total Orders: 5, Revenue: $299</div>"
      }
    ],
    "other_widgets": [],
    "widgets_count": 1
  }
}
```



---

## GET `/subscribers/{id}/notes`

**GET Get Contact Notes**

Retrieve a paginated list of notes for a contact. Supports searching notes by title. Each note includes the user who created it.

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search notes by title. |
| `per_page` | integer | no | Number of notes per page. |
| `page` | integer | no | Page number. |
| `include_id` | integer | no | Id of a note that must appear in the response even when it falls outside the current page. When it is not already on the page it is returned separately as `included_note`, scoped to this contact. |


**Responses**

- **200** — Paginated list of notes.

  Schema (`application/json`):

  - `notes` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `next_page_url` (string,null)
    - `prev_page_url` (string,null)
    - `from` (integer)
    - `to` (integer)
    - `data` (array<Note>)
  - `fields` (object) — Note sync field definitions.
    - `fields` (array<object>)
      - _(object)_

  Example:

```json
{
  "notes": {
    "total": 5,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "next_page_url": null,
    "prev_page_url": null,
    "from": 1,
    "to": 5,
    "data": [
      {
        "id": 10,
        "subscriber_id": 1,
        "title": "Call follow-up",
        "description": "<p>Discussed pricing options. Will send proposal by Friday.</p>",
        "type": "note",
        "created_at": "2024-03-01 14:30:00",
        "updated_at": "2024-03-01 14:30:00",
        "added_by": "Admin User"
      }
    ]
  },
  "fields": {
    "fields": []
  }
}
```



---

## GET `/subscribers/prev-next-ids`

**GET Get Contact Prev/Next IDs**

Get the previous and next contact IDs relative to a given contact ID within the current filter context. Returns up to 10 IDs in each direction. Useful for implementing prev/next navigation on a contact profile page.

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `current_id` | integer | yes | The current contact ID to navigate from. |
| `filter_type` | string | yes | Type of filtering applied to the contact list. |
| `sort_type` | string | no | Sort direction of the contact list. |
| `search` | string | no | Search term applied to the contact list. |
| `tags[]` | array<integer> | no | Tag IDs filter (simple mode). |
| `statuses[]` | array<string> | no | Status filter (simple mode). |
| `lists[]` | array<integer> | no | List IDs filter (simple mode). |
| `advanced_filters` | string | no | JSON-encoded advanced filter groups (advanced mode). |


**Responses**

- **200** — Previous and next contact IDs.

  Schema (`application/json`):

  - `navigation` (object)
    - `next` (array<integer>) — Up to 10 contact IDs after the current one.
    - `prev` (array<integer>) — Up to 10 contact IDs before the current one.
  - `has_next` (boolean) — Whether there are more contacts after the returned next IDs.
  - `has_prev` (boolean) — Whether there are more contacts before the returned prev IDs.

  Example:

```json
{
  "navigation": {
    "next": [
      9,
      8,
      7,
      6,
      5,
      4,
      3,
      2,
      1
    ],
    "prev": [
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20
    ]
  },
  "has_next": false,
  "has_prev": true
}
```


- **422** — Missing required parameters.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "filter_type and current_id are required"
}
```



---

## GET `/subscribers/{id}/purchase-history`

**GET Get Contact Purchase History**

Retrieve purchase/order history for a contact from a specific commerce provider. The data is fetched via the `fluent_crm/purchase_history_{provider}` filter hook, so the response structure depends on the active commerce integration (e.g., WooCommerce, EDD).

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `provider` | string | yes | The commerce provider identifier (e.g., `woocommerce`, `edd`, `learndash`, `lifterlms`). |


**Responses**

- **200** — Purchase history data.

  Schema (`application/json`):

  - `orders` (object)
    - `orders` (array<object>) — List of orders from the provider.
      - _(object)_
    - `total` (integer) — Total number of orders.

  Example:

```json
{
  "orders": {
    "orders": [
      {
        "id": 1234,
        "status": "completed",
        "total": "59.99",
        "date": "2024-02-15 10:30:00",
        "items": [
          {
            "name": "Pro Plan Subscription",
            "quantity": 1,
            "total": "59.99"
          }
        ]
      }
    ],
    "total": 1
  }
}
```


- **404** — Contact not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/subscribers/{id}/support-tickets`

**GET Get Contact Support Tickets**

Retrieve support tickets for a contact from a specific support ticket provider. The data is fetched via the `fluentcrm-get_support_tickets_{provider}` filter hook. Also returns column configuration for rendering the ticket table.

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `provider` | string | yes | The support ticket provider identifier (e.g., `fluent-support`). |


**Responses**

- **200** — Support tickets data with column configuration.

  Schema (`application/json`):

  - `tickets` (object)
    - `data` (array<object>) — List of support tickets. Structure varies by provider.
      - _(object)_
    - `total` (integer) — Total number of tickets.
    - `columns_config` (object) — Column configuration for displaying the tickets table.
      - `id` (object)
        - `label` (string)
        - `width` (string)
      - `status` (object)
        - `label` (string)
        - `width` (string)
      - `Submitted at` (object)
        - `label` (string)
        - `width` (string)
      - `action` (object)
        - `label` (string)
        - `width` (string)

  Example:

```json
{
  "tickets": {
    "data": [
      {
        "id": 42,
        "status": "open",
        "Submitted at": "2024-03-01 09:00:00",
        "action": "https://example.com/support/ticket/42"
      }
    ],
    "total": 1,
    "columns_config": {
      "id": {
        "label": "ID",
        "width": "100px"
      },
      "status": {
        "label": "Status",
        "width": "120px"
      },
      "Submitted at": {
        "label": "Submitted at",
        "width": "150px"
      },
      "action": {
        "label": "Action",
        "width": "150px"
      }
    }
  }
}
```



---

## GET `/subscribers/{id}/emails/template-mock`

**GET Get Contact Template Mock**

Get a template mock/scaffold for composing a custom email to a contact. Returns default email campaign structure with empty fields ready to be filled.

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Responses**

- **200** — Email template mock data.

  Schema (`application/json`):

  - `email_mock` (object) — Template scaffold for a custom email campaign.
    - `title` (string) — Default title for the email.
    - `email_subject` (string) — Default email subject.
    - `email_pre_header` (string) — Email pre-header text.
    - `email_body` (string) — Default email body HTML.
    - `settings` (object) — Email settings.
      - `template_config` (object)
        - _(object)_
      - `mailer_settings` (object)
        - _(object)_
    - `design_template` (string) — Template design type.

  Example:

```json
{
  "email_mock": {
    "title": "Custom Email to Contact",
    "email_subject": "",
    "email_pre_header": "",
    "email_body": "",
    "settings": {
      "template_config": {},
      "mailer_settings": {}
    },
    "design_template": "simple"
  }
}
```



---

## GET `/subscribers/{id}/tracking-events`

**GET Get Contact Tracking Events**

Retrieve a paginated list of tracking events for a contact. Requires the `event_tracking` experimental feature to be enabled.

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of events per page. |
| `page` | integer | no | Page number. |


**Responses**

- **200** — Paginated list of tracking events.

  Schema (`application/json`):

  - `events` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `next_page_url` (string,null)
    - `prev_page_url` (string,null)
    - `from` (integer)
    - `to` (integer)
    - `data` (array<object>)
      - `id` (integer)
      - `subscriber_id` (integer)
      - `event_key` (string) — Unique event key identifier.
      - `title` (string) — Event title.
      - `value` (string,null) — Event value.
      - `counter` (integer) — How many times this event occurred.
      - `provider` (string,null) — Event provider.
      - `created_at` (string) _(format: date-time)_
      - `updated_at` (string) _(format: date-time)_

  Example:

```json
{
  "events": {
    "total": 3,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "next_page_url": null,
    "prev_page_url": null,
    "from": 1,
    "to": 3,
    "data": [
      {
        "id": 1,
        "subscriber_id": 1,
        "event_key": "page_visit",
        "title": "Visited Pricing Page",
        "value": "/pricing",
        "counter": 5,
        "provider": null,
        "created_at": "2024-03-01 14:30:00",
        "updated_at": "2024-03-01 16:45:00"
      }
    ]
  }
}
```


- **422** — Event tracking is not enabled.

  Schema (`application/json`):

  - `message` (string)
  - `error_code` (string)

  Example:

```json
{
  "message": "Event Tracker is not enabled",
  "error_code": "not_enabled"
}
```



---

## GET `/subscribers/{id}/url-metrics`

**GET Get Contact URL Metrics**

Retrieve a paginated list of URL click metrics for a contact. Shows which URLs the contact clicked in campaign emails along with click counts.

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sort_by` | string | no | Column to sort by. |
| `sort_type` | string | no | Sort direction. |
| `per_page` | integer | no | Number of records per page. |
| `page` | integer | no | Page number. |


**Responses**

- **200** — Paginated URL click metrics.

  Schema (`application/json`):

  - `urlMetrics` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `next_page_url` (string,null)
    - `prev_page_url` (string,null)
    - `from` (integer)
    - `to` (integer)
    - `data` (array<object>)
      - `url` (string) — The clicked URL.
      - `count` (integer) — Number of times the URL was clicked.

  Example:

```json
{
  "urlMetrics": {
    "total": 3,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "next_page_url": null,
    "prev_page_url": null,
    "from": 1,
    "to": 3,
    "data": [
      {
        "url": "https://example.com/pricing",
        "count": 5
      },
      {
        "url": "https://example.com/features",
        "count": 3
      },
      {
        "url": "https://example.com/blog/post-1",
        "count": 1
      }
    ]
  }
}
```


- **404** — Contact not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/subscribers`

**GET List Contacts**

Retrieve a paginated list of contacts. Supports both simple filtering (by tags, lists, statuses) and advanced filtering with complex filter groups. Optionally includes custom field values.

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `filter_type` | string | no | Type of filtering to apply. |
| `search` | string | no | Search contacts by name, email, or other searchable fields. |
| `sort_by` | string | no | Column to sort by. |
| `sort_type` | string | no | Sort direction. |
| `has_commerce` | string | no | Filter by commerce integration availability. |
| `custom_fields` | string | no | Set to `true` to include custom field values in the response. |
| `tags[]` | array<integer> | no | Filter by tag IDs (simple filter mode only). |
| `statuses[]` | array<string> | no | Filter by contact statuses (simple filter mode only). |
| `sms_statuses[]` | array<string> | no | Filter by SMS statuses (simple filter mode only). |
| `lists[]` | array<integer> | no | Filter by list IDs (simple filter mode only). |
| `company_ids[]` | array<integer> | no | Filter by company IDs. |
| `advanced_filters` | string | no | JSON-encoded advanced filter groups (advanced filter mode only). |
| `per_page` | integer | no | Number of contacts per page. |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Paginated list of contacts.

  Schema (`application/json`):

  - `subscribers` (object)
    - `total` (integer) — Total number of contacts matching the query.
    - `per_page` (integer) — Number of contacts per page.
    - `current_page` (integer) — Current page number.
    - `last_page` (integer) — Last page number.
    - `next_page_url` (string,null) — URL for the next page, or null if on the last page.
    - `prev_page_url` (string,null) — URL for the previous page, or null if on the first page.
    - `from` (integer) — Starting record index on this page.
    - `to` (integer) — Ending record index on this page.
    - `data` (array<Contact>)
  - `custom` (string,null) — Echoes back the `custom_fields` query parameter value.

  Example:

```json
{
  "subscribers": {
    "total": 150,
    "per_page": 15,
    "current_page": 1,
    "last_page": 10,
    "next_page_url": "/wp-json/fluent-crm/v2/subscribers?page=2",
    "prev_page_url": null,
    "from": 1,
    "to": 15,
    "data": [
      {
        "id": 1,
        "user_id": "5",
        "hash": "a1b2c3d4e5f6",
        "contact_owner": null,
        "company_id": null,
        "prefix": "Mr",
        "first_name": "John",
        "last_name": "Doe",
        "full_name": "John Doe",
        "email": "john@example.com",
        "status": "subscribed",
        "contact_type": "customer",
        "address_line_1": "123 Main St",
        "address_line_2": "",
        "postal_code": "90210",
        "city": "Beverly Hills",
        "state": "CA",
        "country": "US",
        "phone": "+1234567890",
        "timezone": "America/New_York",
        "date_of_birth": "1990-05-15",
        "source": "web",
        "life_time_value": 0,
        "last_activity": "2024-03-01 14:30:00",
        "total_points": 0,
        "latitude": null,
        "longitude": null,
        "ip": "192.168.1.1",
        "created_at": "2024-01-15 10:30:00",
        "updated_at": "2024-03-01 14:30:00",
        "photo": "https://www.gravatar.com/avatar/abc123",
        "tags": [
          {
            "id": 1,
            "title": "VIP Customer",
            "slug": "vip-customer"
          }
        ],
        "lists": [
          {
            "id": 1,
            "title": "Newsletter",
            "slug": "newsletter"
          }
        ]
      }
    ]
  },
  "custom": null
}
```



---

## POST `/subscribers/{id}/external_view`

**POST Save Contact External View**

Save data for an external profile section of a contact. The data handling is delegated to the registered section provider via the `fluencrm_profile_section_save_{section_provider}` filter hook.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Request body** (`application/json`, required)

- `section_provider` (string) **required** — The section provider identifier.
- `data` (object) — Data to save. Structure depends on the section provider.
  - _(object)_

Example:

```json
{
  "section_provider": "custom_section",
  "data": {
    "key": "value"
  }
}
```


**Responses**

- **200** — Data saved successfully. Response structure depends on the section provider.

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "message": "Data saved successfully"
}
```


- **422** — Handler not found for the section provider.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Handled could not be found."
}
```



---

## GET `/subscribers/search-contacts`

**GET Search Contacts**

Search contacts by name or email. Returns a lightweight object of contacts keyed by ID, suitable for dropdowns and autocomplete widgets. Optionally loads default contacts when no search term is provided.

<!-- fc:access -->

**Required capability:** `fcrm_read_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search term to match against contact name and email. |
| `limit` | integer | no | Maximum number of results to return. |
| `load_default` | string | no | If truthy and no search term is provided, returns the most recent contacts. |
| `values[]` | array<integer> | no | Array of contact IDs to always include in results (useful for pre-selected values). |
| `offset` | integer | no | Rows to skip before the first result. Combine with `limit` to page through matches. |


**Responses**

- **200** — Object of contacts keyed by contact ID.

  Schema (`application/json`):

  - `contacts` (object) — Contacts keyed by ID.
    - _(object)_

  Example:

```json
{
  "contacts": {
    "1": {
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "email": "john@example.com",
      "id": "1"
    },
    "5": {
      "first_name": "Jane",
      "last_name": "Smith",
      "full_name": "Jane Smith",
      "email": "jane@example.com",
      "id": "5"
    }
  }
}
```



---

## POST `/subscribers/{id}/emails/send`

**POST Send Contact Custom Email**

Send a custom one-off email to a specific contact. The contact must have a status of `subscribed` or `transactional`. Creates a custom email campaign record and immediately queues it for sending.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `SubscriberPolicy::sendCustomEmail()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Request body** (`application/json`, required)

- `campaign` (object) **required** — The email campaign data. Obtain the structure from the template mock endpoint first.
  - `title` (string) — Internal title for the email.
  - `email_subject` (string) — Email subject line.
  - `email_pre_header` (string) — Email pre-header text.
  - `email_body` (string) — Email body HTML content.
  - `settings` (object) — Email settings including template config and mailer settings.
    - _(object)_
  - `design_template` (string) — Template design type.

Example:

```json
{
  "campaign": {
    "title": "Welcome Email",
    "email_subject": "Welcome to our platform!",
    "email_pre_header": "We're glad to have you.",
    "email_body": "<h1>Welcome!</h1><p>Thank you for joining us.</p>",
    "settings": {},
    "design_template": "simple"
  }
}
```


**Responses**

- **200** — Email sent successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Custom Email has been successfully sent"
}
```


- **422** — Contact status is not subscribed or transactional.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Subscriber's status need to be subscribed."
}
```



---

## POST `/subscribers/{id}/send-double-optin`

**POST Send Contact Double Opt-in**

Send a double opt-in confirmation email to a contact. The contact should not already be in `subscribed` status.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Responses**

- **200** — Double opt-in email sent successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Double OptIn email has been sent"
}
```


- **422** — Contact is already subscribed.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Contact Already Subscribed"
}
```



---

## POST `/subscribers/sync-segments`

**POST Sync Contact Segments**

Attach and/or detach tags or lists for one or more contacts in a single request. The `type` parameter controls whether tags or lists are being synced.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `subscribers` (array<integer>) **required** — Array of contact IDs to update.
- `type` (string) **required** _(enum: `tags`, `lists`)_ — Whether to sync tags or lists.
- `attach` (array<string>) — Slugs (or values matching `find_by`) of tags/lists to attach.
- `detach` (array<string>) — Slugs (or values matching `find_by`) of tags/lists to detach.
- `find_by` (string) _(default: `slug`)_ — Column to match attach/detach values against (e.g., `slug`, `id`, `title`).

Example:

```json
{
  "subscribers": [
    1,
    5,
    12
  ],
  "type": "tags",
  "attach": [
    "vip-customer",
    "newsletter-subscriber"
  ],
  "detach": [
    "trial-user"
  ],
  "find_by": "slug"
}
```


**Responses**

- **200** — Segments synced successfully.

  Schema (`application/json`):

  - `message` (string)
  - `subscribers` (array<Contact>) — Updated contacts with their tags and lists.

  Example:

```json
{
  "message": "Successfully updated the subscribers.",
  "subscribers": [
    {
      "id": 1,
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "tags": [
        {
          "id": 1,
          "title": "VIP Customer",
          "slug": "vip-customer"
        },
        {
          "id": 2,
          "title": "Newsletter Subscriber",
          "slug": "newsletter-subscriber"
        }
      ],
      "lists": [
        {
          "id": 1,
          "title": "Newsletter",
          "slug": "newsletter"
        }
      ]
    }
  ]
}
```



---

## POST `/subscribers/track-event`

**POST Track Contact Event**

Track a custom event for a contact. Requires the `event_tracking` experimental feature to be enabled. Events can be marked as repeatable or unique.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `event_key` (string) **required** — Unique key for the event type.
- `title` (string) **required** — Human-readable event title.
- `value` (string) — Optional event value.
- `subscriber_id` (integer) — Contact ID to track the event for.
- `email` (string) _(format: email)_ — Alternatively, identify the contact by email.
- `provider` (string) — Event provider identifier.
- `repeatable` (boolean) _(default: `true`)_ — Whether the event can be tracked multiple times. If false, only the first occurrence is recorded.

Example:

```json
{
  "event_key": "page_visit",
  "title": "Visited Pricing Page",
  "value": "/pricing",
  "subscriber_id": 1,
  "repeatable": true
}
```


**Responses**

- **200** — Event tracked successfully.

  Schema (`application/json`):

  - `message` (string)
  - `id` (integer) — The tracking event record ID.

  Example:

```json
{
  "message": "Event has been tracked",
  "id": 42
}
```


- **422** — Validation error or event tracking not enabled.

  Schema (`application/json`):

  - `message` (string)
  - `error_code` (string)

---

## PUT `/subscribers/{id}`

**PUT Update Contact**

Update an existing contact's fields, custom values, tags, and lists. Supports attaching and detaching tags/lists in a single request. The `subscriber` object or individual fields can be passed in the request body.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |


**Request body** (`application/json`, required)

- `subscriber` (object) — Contact data can be nested inside a `subscriber` object or passed at the top level.
  - `email` (string) _(format: email)_ — Email address (must be unique).
  - `first_name` (string)
  - `last_name` (string)
  - `prefix` (string)
  - `status` (string) _(enum: `subscribed`, `pending`, `unsubscribed`, `bounced`, `complained`)_
  - `contact_type` (string) _(enum: `lead`, `customer`)_
  - `address_line_1` (string)
  - `address_line_2` (string)
  - `postal_code` (string)
  - `city` (string)
  - `state` (string)
  - `country` (string)
  - `phone` (string)
  - `timezone` (string)
  - `date_of_birth` (string,null) — Date of birth (YYYY-MM-DD). Send null or empty string to clear.
  - `source` (string)
  - `custom_values` (object) — Custom field key-value pairs to update.
    - _(object)_
  - `attach_tags` (array<integer>) — Tag IDs to attach.
  - `detach_tags` (array<integer>) — Tag IDs to detach.
  - `attach_lists` (array<integer>) — List IDs to attach.
  - `detach_lists` (array<integer>) — List IDs to detach.

Example:

```json
{
  "subscriber": {
    "first_name": "John",
    "last_name": "Smith",
    "phone": "+1987654321",
    "custom_values": {
      "company_name": "Acme Corp"
    },
    "attach_tags": [
      3,
      5
    ],
    "detach_lists": [
      2
    ]
  }
}
```


**Responses**

- **200** — Contact updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `contact` (Contact)
  - `isDirty` (boolean) — Whether any standard fields were actually changed.
  - `values` (object) — Custom values that were updated.
    - _(object)_

  Example:

```json
{
  "message": "Subscriber successfully updated",
  "contact": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Smith",
    "status": "subscribed"
  },
  "isDirty": true,
  "values": {
    "company_name": "Acme Corp"
  }
}
```


- **422** — Validation error (e.g., duplicate email).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## PUT `/subscribers/{id}/notes/{note_id}`

**PUT Update Contact Note**

Update an existing note for a contact. The note description supports SmartCode/merge tags which are parsed before saving.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The contact ID. |
| `note_id` | integer | yes | The note ID. |


**Request body** (`application/json`, required)

- `note` (object) **required**
  - `title` (string) **required** — Note title.
  - `description` (string) **required** — Note content (HTML). Supports SmartCode/merge tags.
  - `type` (string) **required** _(enum: `note`, `call`, `email`, `meeting`, `activity`)_ — Note type.
  - `created_at` (string) _(format: date-time)_ — Override the creation date. Omit to keep the existing date.

Example:

```json
{
  "note": {
    "title": "Updated call follow-up",
    "description": "<p>Sent the proposal. Awaiting response.</p>",
    "type": "note"
  }
}
```


**Responses**

- **200** — Note updated successfully.

  Schema (`application/json`):

  - `note` (Note)
  - `message` (string)

  Example:

```json
{
  "note": {
    "id": 15,
    "subscriber_id": 1,
    "title": "Updated call follow-up",
    "description": "<p>Sent the proposal. Awaiting response.</p>",
    "type": "note",
    "created_at": "2024-03-01 14:30:00",
    "updated_at": "2024-03-02 09:15:00"
  },
  "message": "Note successfully updated"
}
```


- **422** — Validation error.

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## PUT `/subscribers/subscribers-property`

**PUT Update Contacts Property**

Update a single property for one or more contacts. Supported properties are `status`, `contact_type`, `avatar`, `company_id`, and `sms_status`. Validates the value against allowed options for each property type.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `SubscriberPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `property` (string) **required** _(enum: `status`, `contact_type`, `avatar`, `company_id`, `sms_status`)_ — The property/column to update.
- `value` (string) **required** — The new value for the property. Must be valid for the given property type (e.g., `subscribed` for status, `lead`/`customer` for contact_type).
- `subscribers` (any) **required** — Contact ID(s) to update. Can be a single ID or an array of IDs.

Example:

```json
{
  "property": "status",
  "value": "subscribed",
  "subscribers": [
    1,
    5,
    12
  ]
}
```


**Responses**

- **200** — Contacts updated successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Subscribers successfully updated"
}
```


- **422** — Validation error (invalid column or value).

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Column is not valid"
}
```



---

## POST `/subscribers/{id}/notes/bulk-delete`

**POST Bulk Delete Contact Notes**

Delete several notes from one contact in a single request.

Deletion is **scoped to the contact in the path**: ids that belong to a different contact are filtered out before anything is removed, so this cannot be used to reach another contact's notes. Because those ids are dropped rather than rejected, the reported count can be lower than the number of ids you sent — check `message` to see how many rows were actually removed.

At most **200** ids per request; more returns a 422.

Each deletion fires `fluent_crm/note_delete`.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts_delete`

_Enforced by `SubscriberPolicy::bulkDeleteNotes()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Contact (subscriber) id. |


**Request body** (`application/json`, required)

- `note_ids` (array<integer>) **required** — Note ids to delete. Required, and capped at 200 per request. Ids belonging to a different contact are silently skipped.

Example:

```json
{
  "note_ids": [
    1201,
    1202,
    1203
  ]
}
```


**Responses**

- **200** — Notes deleted.

  Schema (`application/json`):

  - `message` (string) — Confirmation message stating how many notes were removed.

  Example:

```json
{
  "message": "3 notes deleted"
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **404** — The requested resource does not exist.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — `note_ids` was empty, or more than 200 ids were supplied.

  Schema (`application/json`):

  - _$ref: Error_

---
