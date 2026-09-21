# FluentCRM API — Contact Import

6 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## GET `/import/drivers/{driver}`

**GET Import Driver Details**

Retrieve configuration details for a specific import driver. For the `users` driver, returns available WordPress roles and configuration fields. When called with `summary=true`, returns a preview of matching users. For other drivers, the response is determined by the driver's filter hook.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `ImportUserPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `driver` | string | yes | Import driver identifier (e.g., `users`, `csv`). |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `summary` | string | no | If truthy, returns a summary/preview of contacts to import based on the current config. |
| `config[roles][]` | array<string> | no | User roles to filter by (for the `users` driver summary view). |


**Responses**

- **200** — Driver configuration or import summary.

  Example:

```json
{
  "config": {
    "roles": []
  },
  "fields": {
    "roles": {
      "label": "Select User Roles",
      "type": "checkbox-group",
      "options": [
        {
          "id": "subscriber",
          "label": "Subscriber"
        },
        {
          "id": "administrator",
          "label": "Administrator"
        }
      ]
    }
  },
  "labels": {
    "step_2": "Next [Review Data]",
    "step_3": "Import Users Now"
  }
}
```


- **422** — Driver not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sorry no driver found for this import"
}
```



---

## GET `/import/drivers`

**GET Import Drivers**

Retrieve the list of available import providers (drivers). Default drivers include CSV File and WordPress Users. Additional drivers may be available based on installed plugins (e.g., FluentCart, LifterLMS, LearnDash).

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `ImportUserPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — List of available import drivers.

  Schema (`application/json`):

  - `drivers` (object) — Map of driver keys to driver details.
    - _(object)_

  Example:

```json
{
  "drivers": {
    "csv": {
      "label": "CSV File",
      "logo": "https://example.com/images/csv.svg",
      "disabled": false
    },
    "users": {
      "label": "WordPress Users",
      "logo": "https://example.com/images/wordpress.svg",
      "disabled": false
    }
  }
}
```



---

## POST `/import/csv-import`

**POST Import Contacts from CSV**

Import contacts from a previously uploaded CSV file. Processes records in batches (default 100 per request). Supports pagination for large files -- call repeatedly with incrementing `importing_page` until `has_more` is `false`. Assigns tags, lists, and status to imported contacts.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `ImportUserPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `file` (string) **required** — Temporary file path returned from the CSV upload endpoint.
- `map` (array<object>) **required** — Column mapping between CSV headers and database fields.
  - `csv` (string) — CSV column header name.
  - `table` (string,null) — Target database field name, or null to skip.
- `tags` (array<integer>) — Tag IDs to assign to all imported contacts.
- `lists` (array<integer>) — List IDs to assign to all imported contacts.
- `update` (string) _(enum: `yes`, `no`)_ — Whether to update existing contacts that match by email.
- `new_status` (string) **required** _(enum: `subscribed`, `pending`, `unsubscribed`)_ — Status to assign to new contacts.
- `double_optin_email` (string) _(enum: `yes`, `no`)_ — Whether to send a double opt-in confirmation email.
- `import_silently` (string) _(enum: `yes`, `no`)_ — If `yes`, disables tag/list assignment events during import.
- `force_update_status` (string) _(enum: `yes`, `no`)_ — If `yes`, forces status update on existing contacts.
- `delimiter` (string) _(enum: `comma`, `semicolon`; default: `comma`)_ — CSV delimiter type.
- `importing_page` (integer) _(default: `1`)_ — Current batch page number. Increment for each subsequent request.

Example:

```json
{
  "file": "/tmp/fluent-crm/import_abc123.csv",
  "map": [
    {
      "csv": "Email",
      "table": "email"
    },
    {
      "csv": "First Name",
      "table": "first_name"
    }
  ],
  "tags": [
    1,
    3
  ],
  "lists": [
    2
  ],
  "update": "no",
  "new_status": "subscribed",
  "double_optin_email": "no",
  "import_silently": "no",
  "force_update_status": "no",
  "delimiter": "comma",
  "importing_page": 1
}
```


**Responses**

- **200** — Batch import result. Check `has_more` to determine if additional batches remain.

  Schema (`application/json`):

  - `total` (integer) — Total number of records in the CSV.
  - `completed` (integer) — Number of records processed so far.
  - `total_page` (integer) — Total number of batch pages.
  - `skipped` (integer) — Number of skipped records in this batch.
  - `invalid_contacts` (array<object>) — Contacts skipped due to invalid email addresses.
    - _(object)_
  - `skipped_contacts` (array<object>) — Contacts skipped (e.g., existing contacts when update is disabled).
    - _(object)_
  - `invalid_email_counts` (integer) — Number of records with invalid emails.
  - `inserted` (integer) — Number of new contacts created in this batch.
  - `updated` (integer) — Number of existing contacts updated in this batch.
  - `has_more` (boolean) — `true` if more batches remain to be processed.
  - `last_page` (integer) — The page number just processed.
  - `tags` (array<integer>) — Tag IDs applied.
  - `lists` (array<integer>) — List IDs applied.
  - `offset` (integer) — Record offset for this batch.

  Example:

```json
{
  "total": 250,
  "completed": 100,
  "total_page": 3,
  "skipped": 2,
  "invalid_contacts": [],
  "skipped_contacts": [],
  "invalid_email_counts": 0,
  "inserted": 95,
  "updated": 3,
  "has_more": true,
  "last_page": 1,
  "tags": [
    1,
    3
  ],
  "lists": [
    2
  ],
  "offset": 0
}
```


- **422** — Validation error (e.g., email field not mapped).

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "The email field is required."
}
```



---

## POST `/import/drivers/{driver}`

**POST Import Data via Driver**

Execute the import process for a specific driver. For the `users` driver, imports WordPress users as contacts in batches. For other drivers, the import behavior is determined by the driver's filter hook. Call repeatedly with incrementing `importing_page` until `has_more` is `false`.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `ImportUserPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `driver` | string | yes | Import driver identifier (e.g., `users`). |


**Request body** (`application/json`, required)

- `config` (object) — Driver-specific configuration. For the `users` driver, includes roles, tags, lists, status, and update settings.
  - `roles` (array<string>) — WordPress user roles to import.
  - `tags` (array<integer>) — Tag IDs to assign.
  - `lists` (array<integer>) — List IDs to assign.
  - `status` (string) _(enum: `subscribed`, `pending`, `unsubscribed`)_ — Status to assign to new contacts.
  - `update` (string) _(enum: `yes`, `no`)_ — Whether to update existing contacts.
  - `double_optin_email` (string) _(enum: `yes`, `no`)_ — Whether to send a double opt-in email.
  - `import_silently` (string) _(enum: `yes`, `no`)_ — If `yes`, disables tag/list events during import.
- `importing_page` (integer) _(default: `1`)_ — Current batch page number.

Example:

```json
{
  "config": {
    "roles": [
      "subscriber"
    ],
    "tags": [
      1
    ],
    "lists": [
      2
    ],
    "status": "subscribed",
    "update": "no",
    "double_optin_email": "no",
    "import_silently": "no"
  },
  "importing_page": 1
}
```


**Responses**

- **200** — Batch import result.

  Schema (`application/json`):

  - `page_total` (integer) — Total number of batch pages.
  - `record_total` (integer) — Total number of matching records.
  - `has_more` (boolean) — `true` if more batches remain.
  - `current_page` (integer) — The page number just processed.
  - `next_page` (integer) — The next page number to request.

  Example:

```json
{
  "page_total": 3,
  "record_total": 250,
  "has_more": true,
  "current_page": 1,
  "next_page": 2
}
```


- **422** — Driver not found or import error.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sorry no driver found for this import"
}
```



---

## POST `/import/users`

**POST Import WordPress Users**

Import WordPress users as FluentCRM contacts. Processes users in batches (default 100 per request). Call repeatedly with incrementing `page` until `has_more` is `false`. Assigns tags, lists, and status to imported contacts.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `ImportUserPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `roles` (array<string>) **required** — WordPress user roles to import (e.g., `subscriber`, `customer`).
- `tags` (array<integer>) — Tag IDs to assign to imported contacts.
- `lists` (array<integer>) — List IDs to assign to imported contacts.
- `map` (object) — Field mapping configuration.
  - _(object)_
- `update` (string) _(enum: `yes`, `no`)_ — Whether to update existing contacts.
- `new_status` (string) **required** _(enum: `subscribed`, `pending`, `unsubscribed`)_ — Status to assign to new contacts.
- `double_optin_email` (string) _(enum: `yes`, `no`)_ — Whether to send a double opt-in confirmation email.
- `import_silently` (string) _(enum: `yes`, `no`)_ — If `yes`, disables tag/list assignment events during import.
- `page` (integer) _(default: `1`)_ — Current batch page number.

Example:

```json
{
  "roles": [
    "subscriber",
    "customer"
  ],
  "tags": [
    1
  ],
  "lists": [
    2
  ],
  "update": "no",
  "new_status": "subscribed",
  "double_optin_email": "no",
  "import_silently": "no",
  "page": 1
}
```


**Responses**

- **200** — Batch import result. Check `has_more` to determine if additional batches remain.

  Schema (`application/json`):

  - `message` (string) — Status message.
  - `page_total` (integer) — Total number of batch pages.
  - `record_total` (integer) — Total number of matching WordPress users.
  - `has_more` (boolean) — `true` if more batches remain to be processed.
  - `current_page` (integer) — The page number just processed.
  - `next_page` (integer) — The next page number to request.

  Example:

```json
{
  "message": "Processing",
  "page_total": 5,
  "record_total": 450,
  "has_more": true,
  "current_page": 1,
  "next_page": 2
}
```



---

## POST `/import/csv-upload`

**POST Upload CSV for Import**

Upload a CSV file for contact or company import. Returns the parsed CSV headers, mappable subscriber/company fields, and auto-matched column mappings. The uploaded file is stored temporarily for the subsequent import step.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contacts`

_Enforced by `ImportUserPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`multipart/form-data`, required)

- `file` (string) **required** _(format: binary)_ — The CSV file to upload. Must have a valid CSV MIME type.
- `delimiter` (string) _(enum: `comma`, `semicolon`; default: `comma`)_ — CSV delimiter type. `comma` uses `,`, `semicolon` uses `;`.
- `type` (string) _(enum: `contact`, `company`)_ — Type of import. If `company`, returns company-specific mappable fields.

**Responses**

- **200** — CSV parsed successfully. Returns headers, mappable fields, and auto-matched mappings.

  Schema (`application/json`):

  - `file` (string) — Temporary file path for the uploaded CSV. Pass this to the import endpoint.
  - `headers` (array<string>) — Column headers extracted from the CSV file.
  - `fields` (object) — Mappable subscriber/company fields as key-label pairs.
    - _(object)_
  - `columns` (array<string>) — List of valid database column names.
  - `map` (array<object>) — Auto-generated mapping between CSV headers and database columns.
    - `csv` (string) — CSV header name.
    - `table` (string,null) — Auto-matched database column, or null if no match.

  Example:

```json
{
  "file": "/tmp/fluent-crm/import_abc123.csv",
  "headers": [
    "Email",
    "First Name",
    "Last Name",
    "Phone"
  ],
  "fields": {
    "email": "Email",
    "first_name": "First Name",
    "last_name": "Last Name",
    "phone": "Phone"
  },
  "columns": [
    "email",
    "first_name",
    "last_name",
    "phone",
    "status"
  ],
  "map": [
    {
      "csv": "Email",
      "table": "email"
    },
    {
      "csv": "First Name",
      "table": "first_name"
    },
    {
      "csv": "Last Name",
      "table": "last_name"
    },
    {
      "csv": "Phone",
      "table": "phone"
    }
  ]
}
```


- **422** — Validation error (invalid file type or duplicate headers).

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "The file must be a valid CSV."
}
```



---
