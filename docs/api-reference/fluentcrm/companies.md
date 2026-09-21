# FluentCRM API — Companies

21 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/companies/attach-subscribers`

**POST Attach Subscribers to Companies**

Attach one or more contacts (subscribers) to one or more companies. Creates the many-to-many relationship between contacts and companies. Uses the `FluentCrmApi('companies')->attachContactsByIds()` method internally.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `subscriber_ids` (array<integer>) **required** — Array of contact/subscriber IDs to attach.
- `company_ids` (array<integer>) **required** — Array of company IDs to attach the contacts to.

Example:

```json
{
  "subscriber_ids": [
    1,
    5,
    12
  ],
  "company_ids": [
    3
  ]
}
```


**Responses**

- **200** — Contacts attached successfully.

  Schema (`application/json`):

  - `message` (string)
  - `companies` (array<object>) — Updated list of companies with their associations.
    - `id` (integer) — Unique identifier for the company.
    - `name` (string) — Company name.
    - `description` (string,null) — Company description.
    - `email` (string,null) _(format: email)_ — Company email address.
    - `phone` (string,null) — Phone number.
    - `address_line_1` (string,null) — Address line 1.
    - `address_line_2` (string,null) — Address line 2.
    - `city` (string,null) — City.
    - `state` (string,null) — State or province.
    - `postal_code` (string,null) — Postal/zip code.
    - `country` (string,null) — Two-letter country code.
    - `type` (string,null) — Company type (e.g., partner, customer, vendor).
    - `industry` (string,null) — Industry category.
    - `logo` (string,null) — URL to the company logo image.
    - `website` (string,null) _(format: uri)_ — Company website URL.
    - `linkedin_url` (string,null) _(format: uri)_ — LinkedIn profile URL.
    - `facebook_url` (string,null) _(format: uri)_ — Facebook page URL.
    - `twitter_url` (string,null) _(format: uri)_ — Twitter/X profile URL.
    - `owner_user_id` (integer,null) — Subscriber ID of the company owner.
    - `employees_number` (integer,null) — Number of employees.
    - `status` (string,null) — Company status.
    - `contacts_count` (integer) — Number of contacts associated with this company.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the company was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the company was last updated.
    - `owner` (object,null) — The contact who owns this company.
      - `id` (integer)
      - `first_name` (string)
      - `last_name` (string)
      - `email` (string) _(format: email)_

  Example:

```json
{
  "message": "Selected Companies have been attached successfully",
  "companies": [
    {
      "id": 3,
      "name": "Acme Corporation",
      "email": "info@acme.com",
      "type": "customer"
    }
  ]
}
```


- **422** — Invalid data provided.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Invalid data"
}
```



---

## POST `/companies/do-bulk-action`

**POST Bulk Action on Companies**

Perform a bulk action on multiple companies. Supports deleting companies, changing status, changing type, and changing industry category. Companies can be selected by explicit IDs or by filter criteria (search + inline_filters). When using filter criteria, processes up to 50 companies per request in batches -- use `last_id` for pagination across multiple requests.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats_delete` or `fcrm_manage_contact_cats` — which one applies depends on the action being performed.

_Enforced by `CompanyPolicy::handleBulkActions()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `action_name` (string) **required** _(enum: `delete_companies`, `change_company_status`, `change_company_type`, `change_company_category`)_ — The bulk action to perform.
- `company_ids` (array<integer>) — Explicit list of company IDs to act on. If empty, uses filter criteria instead.
- `new_status` (string) — New value for `change_company_status`, `change_company_type`, or `change_company_category` actions.
- `search` (string) — Search term for filter-based selection (used when `company_ids` is empty).
- `last_id` (integer) _(default: `0`)_ — For paginated batch processing. Pass the `last_company_id` from the previous response to process the next batch.
- `company_query` (object) — Filter criteria for selecting companies (used when `company_ids` is empty).
  - `inline_filters` (object)
    - `company_categories` (array<string>) — Filter by industry categories.
    - `company_types` (array<string>) — Filter by company types.

Example:

```json
{
  "action_name": "change_company_type",
  "company_ids": [
    1,
    2,
    5
  ],
  "new_status": "partner"
}
```


**Responses**

- **200** — Bulk action completed or batch processed.

  Schema (`application/json`):

  - `message` (string) — Status message.
  - `last_company_id` (integer) — Last processed company ID (for paginated batch processing).
  - `completed_companies` (integer) — Number of companies processed in this batch.
  - `is_completed` (boolean) — Only present when all companies have been processed (filter-based mode).

  Example:

```json
{
  "message": "Company Type has been updated for the selected companies",
  "last_company_id": 5,
  "completed_companies": 3
}
```


- **422** — Validation error (e.g., missing new_status for status/type/category change).

  Schema (`application/json`):

  - `message` (string)

---

## POST `/companies`

**POST Create Company**

Create a new company. The company name must be unique. If a website is provided and the `company_auto_logo` experimental feature is enabled, the logo will be automatically fetched from the website's favicon/apple-touch-icon. Optionally attach the company to an existing contact via `intended_contact_id`.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `name` (string) **required** — Company name (must be unique).
- `description` (string) — Company description.
- `email` (string) _(format: email)_ — Company email address.
- `phone` (string) — Phone number.
- `address_line_1` (string) — Address line 1.
- `address_line_2` (string) — Address line 2.
- `city` (string) — City.
- `state` (string) — State or province.
- `postal_code` (string) — Postal/zip code.
- `country` (string) — Two-letter country code.
- `type` (string) — Company type (e.g., partner, customer, vendor).
- `industry` (string) — Industry category.
- `logo` (string) _(format: uri)_ — URL to the company logo image.
- `website` (string) _(format: uri)_ — Company website URL. Auto-prefixed with https:// if no scheme provided.
- `linkedin_url` (string) _(format: uri)_ — LinkedIn profile URL.
- `facebook_url` (string) _(format: uri)_ — Facebook page URL.
- `twitter_url` (string) _(format: uri)_ — Twitter/X profile URL.
- `owner_user_id` (integer) — Subscriber ID of the company owner.
- `employees_number` (integer) — Number of employees.
- `status` (string) — Company status.
- `intended_contact_id` (integer) — If provided, attach the new company to this contact and set it as the contact's primary company if none is set.

Example:

```json
{
  "name": "Acme Corporation",
  "email": "info@acme.com",
  "phone": "+1-555-0100",
  "website": "https://acme.com",
  "type": "customer",
  "industry": "Technology",
  "city": "San Francisco",
  "state": "CA",
  "country": "US"
}
```


**Responses**

- **200** — Company created successfully.

  Schema (`application/json`):

  - `message` (string)
  - `company` (object)
    - `id` (integer) — Unique identifier for the company.
    - `name` (string) — Company name.
    - `description` (string,null) — Company description.
    - `email` (string,null) _(format: email)_ — Company email address.
    - `phone` (string,null) — Phone number.
    - `address_line_1` (string,null) — Address line 1.
    - `address_line_2` (string,null) — Address line 2.
    - `city` (string,null) — City.
    - `state` (string,null) — State or province.
    - `postal_code` (string,null) — Postal/zip code.
    - `country` (string,null) — Two-letter country code.
    - `type` (string,null) — Company type (e.g., partner, customer, vendor).
    - `industry` (string,null) — Industry category.
    - `logo` (string,null) — URL to the company logo image.
    - `website` (string,null) _(format: uri)_ — Company website URL.
    - `linkedin_url` (string,null) _(format: uri)_ — LinkedIn profile URL.
    - `facebook_url` (string,null) _(format: uri)_ — Facebook page URL.
    - `twitter_url` (string,null) _(format: uri)_ — Twitter/X profile URL.
    - `owner_user_id` (integer,null) — Subscriber ID of the company owner.
    - `employees_number` (integer,null) — Number of employees.
    - `status` (string,null) — Company status.
    - `contacts_count` (integer) — Number of contacts associated with this company.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the company was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the company was last updated.
    - `owner` (object,null) — The contact who owns this company.
      - `id` (integer)
      - `first_name` (string)
      - `last_name` (string)
      - `email` (string) _(format: email)_

  Example:

```json
{
  "message": "Company has been created successfully",
  "company": {
    "id": 5,
    "name": "Acme Corporation",
    "email": "info@acme.com",
    "phone": "+1-555-0100",
    "website": "https://acme.com",
    "type": "customer",
    "industry": "Technology",
    "city": "San Francisco",
    "state": "CA",
    "country": "US",
    "created_at": "2024-03-01 14:30:00",
    "updated_at": "2024-03-01 14:30:00"
  }
}
```


- **422** — Validation error (e.g., name is required or not unique, invalid URL).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## POST `/companies/{id}/notes`

**POST Create Company Note**

Add a new note to a company. If `created_at` is not provided, it defaults to the current WordPress time. Fires the `fluent_crm/company_note_added` action hook after creation.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The company ID. |


**Request body** (`application/json`, required)

- `note` (object) **required**
  - `title` (string) **required** — Note title.
  - `description` (string) **required** — Note content (HTML).
  - `type` (string) **required** _(enum: `note`, `call`, `email`, `meeting`, `activity`)_ — Note type.
  - `created_at` (string) _(format: date-time)_ — Custom creation date. Defaults to current WordPress time if not provided.

Example:

```json
{
  "note": {
    "title": "Partnership discussion",
    "description": "<p>Discussed partnership terms. Follow up next week.</p>",
    "type": "meeting"
  }
}
```


**Responses**

- **200** — Note created successfully.

  Schema (`application/json`):

  - `note` (object)
    - `id` (integer) — Unique identifier for the note.
    - `subscriber_id` (integer) — The company ID this note belongs to (stored in subscriber_id column).
    - `title` (string) — Note title.
    - `description` (string) — Note content (HTML).
    - `type` (string) _(enum: `note`, `call`, `email`, `meeting`, `activity`)_ — Note type.
    - `created_at` (string) _(format: date-time)_ — When the note was created.
    - `updated_at` (string) _(format: date-time)_ — When the note was last updated.
    - `added_by` (string,null) — Display name of the user who created the note.
  - `message` (string)

  Example:

```json
{
  "note": {
    "id": 15,
    "subscriber_id": 1,
    "title": "Partnership discussion",
    "description": "<p>Discussed partnership terms. Follow up next week.</p>",
    "type": "meeting",
    "created_at": "2024-03-01 14:30:00",
    "updated_at": "2024-03-01 14:30:00"
  },
  "message": "Note has been successfully added"
}
```


- **404** — Company not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — Validation error (title, description, and type are required).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## DELETE `/companies/{id}`

**DELETE Delete Company**

Permanently delete a company by its ID. Fires `fluent_crm/before_company_delete` and `fluent_crm/company_deleted` action hooks.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats_delete`

_Enforced by `CompanyPolicy::delete()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The company ID to delete. |


**Responses**

- **200** — Company deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Company has been deleted successfully"
}
```


- **404** — Company not found.

  Schema (`application/json`):

  - `message` (string)

---

## DELETE `/companies/{id}/notes/{note_id}`

**DELETE Delete Company Note**

Delete a note from a company. Fires the `fluent_crm/company_note_deleted` action hook after deletion.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats_delete`

_Enforced by `CompanyPolicy::deleteNote()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The company ID. |
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


- **404** — Company not found.

  Schema (`application/json`):

  - `message` (string)

---

## POST `/companies/detach-subscribers`

**POST Detach Subscribers from Companies**

Detach one or more contacts (subscribers) from one or more companies. Removes the many-to-many relationship between contacts and companies. Uses the `FluentCrmApi('companies')->detachContactsByIds()` method internally.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::detachSubscribers()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `subscriber_ids` (array<integer>) **required** — Array of contact/subscriber IDs to detach.
- `company_ids` (array<integer>) **required** — Array of company IDs to detach the contacts from.

Example:

```json
{
  "subscriber_ids": [
    5
  ],
  "company_ids": [
    3
  ]
}
```


**Responses**

- **200** — Contacts detached successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Company has been successfully detached"
}
```


- **422** — Invalid data provided.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Invalid data"
}
```



---

## GET `/companies/{id}`

**GET Get Company**

Retrieve a single company by its ID, or by an alternate field (`name`, `email`, or `phone`) using the `find_by` and `find_by_value` query parameters. The response includes the eager-loaded `owner` relation (with stats if available) and the computed `contacts_count`.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The company ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `find_by` | string | no | Field to look up the company by instead of the path `id`. Supported values: `name`, `email`, `phone`. |
| `find_by_value` | string | no | The value to search for when using `find_by`. Required when `find_by` is not `id`. |


**Responses**

- **200** — Company details.

  Schema (`application/json`):

  - `company` (object)
    - `id` (integer) — Unique identifier for the company.
    - `name` (string) — Company name.
    - `description` (string,null) — Company description.
    - `email` (string,null) _(format: email)_ — Company email address.
    - `phone` (string,null) — Phone number.
    - `address_line_1` (string,null) — Address line 1.
    - `address_line_2` (string,null) — Address line 2.
    - `city` (string,null) — City.
    - `state` (string,null) — State or province.
    - `postal_code` (string,null) — Postal/zip code.
    - `country` (string,null) — Two-letter country code.
    - `type` (string,null) — Company type (e.g., partner, customer, vendor).
    - `industry` (string,null) — Industry category.
    - `logo` (string,null) — URL to the company logo image.
    - `website` (string,null) _(format: uri)_ — Company website URL.
    - `linkedin_url` (string,null) _(format: uri)_ — LinkedIn profile URL.
    - `facebook_url` (string,null) _(format: uri)_ — Facebook page URL.
    - `twitter_url` (string,null) _(format: uri)_ — Twitter/X profile URL.
    - `owner_user_id` (integer,null) — Subscriber ID of the company owner.
    - `employees_number` (integer,null) — Number of employees.
    - `status` (string,null) — Company status.
    - `contacts_count` (integer) — Number of contacts associated with this company.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the company was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the company was last updated.
    - `owner` (object,null) — The contact who owns this company.
      - `id` (integer)
      - `first_name` (string)
      - `last_name` (string)
      - `email` (string) _(format: email)_

  Example:

```json
{
  "company": {
    "id": 1,
    "name": "Acme Corporation",
    "description": "A leading technology company",
    "email": "info@acme.com",
    "phone": "+1-555-0100",
    "address_line_1": "100 Innovation Drive",
    "address_line_2": "Suite 200",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94105",
    "country": "US",
    "type": "customer",
    "industry": "Technology",
    "logo": "https://example.com/wp-content/uploads/fluentcrm/acme-logo.png",
    "website": "https://acme.com",
    "linkedin_url": "https://linkedin.com/company/acme",
    "facebook_url": null,
    "twitter_url": null,
    "owner_user_id": 5,
    "employees_number": 250,
    "status": "active",
    "contacts_count": 12,
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-03-01 14:30:00",
    "owner": {
      "id": 5,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com",
      "stats": {
        "emails": 45,
        "opens": 30,
        "clicks": 12,
        "total_points": 150,
        "last_activity": "2024-03-01 14:30:00"
      }
    }
  }
}
```


- **404** — Company not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — Company not found when using custom find_by field.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/companies/custom-fields`

**GET Get Company Custom Fields**

Retrieve the global custom field definitions for companies. These define the custom fields available for all companies (not the values for a specific company).

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with[]` | array<string> | no | Additional data to include with the fields. |


**Responses**

- **200** — Custom field definitions.

  Schema (`application/json`):

  - `fields` (array<CustomCompanyField>) — Array of custom field definitions.

  Example:

```json
{
  "fields": [
    {
      "key": "annual_revenue",
      "label": "Annual Revenue",
      "type": "number",
      "options": [],
      "settings": {}
    },
    {
      "key": "contract_end_date",
      "label": "Contract End Date",
      "type": "date",
      "options": [],
      "settings": {}
    }
  ]
}
```



---

## GET `/companies/{id}/custom_tab_view`

**GET Get Company External View**

Retrieve a custom tab/section view for a company profile. This endpoint delegates to the `fluent_crm/company_profile_section_{section_provider}` filter hook, allowing third-party integrations to provide custom content sections on the company profile page.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The company ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `section_provider` | string | yes | The identifier of the section provider (used as suffix in the filter hook name). |


**Responses**

- **200** — External view content.

  Schema (`application/json`):

  - `heading` (string) — Section heading.
  - `content_html` (string) — HTML content for the section.

  Example:

```json
{
  "heading": "Sales History",
  "content_html": "<div class=\"sales-summary\"><p>Total orders: 15</p><p>Revenue: $12,500</p></div>"
}
```


- **404** — Company not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/companies/{id}/notes`

**GET Get Company Notes**

Retrieve a paginated list of notes for a company. Notes are ordered by ID descending (newest first). Each note includes the `added_by` field showing who created it. Also returns note sync fields configuration.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The company ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search notes by title (LIKE match). |
| `per_page` | integer | no | Number of notes per page. |
| `page` | integer | no | Page number for pagination. |
| `include_id` | integer | no | Id of a note that must appear in the response even when it falls outside the current page. When it is not already on the page it is returned separately as `included_note`, scoped to this company. |


**Responses**

- **200** — Paginated list of company notes.

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
    - `data` (array<CompanyNote>)
  - `fields` (object) — Note sync field configuration.
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
        "title": "Partnership discussion",
        "description": "<p>Discussed partnership terms. Follow up next week.</p>",
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

## POST `/companies/csv-import`

**POST Import Companies from CSV**

Import companies from a previously uploaded CSV file. Processes up to 100 records per request for batch importing. Use the `importing_page` parameter to paginate through large files. Supports field mapping via the `map` parameter, optional updating of existing companies (matched by name), and automatic owner creation from the CSV data.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `map` (array<object>) **required** — Array of field mappings from CSV columns to company table columns.
  - `csv` (string) — The CSV column header name.
  - `table` (string) — The target company table column (e.g., name, email, phone, type, industry). Use `_custom_` prefix for custom fields.
- `file` (string) **required** — Server-side file path of the uploaded CSV file.
- `update` (string) _(enum: `yes`, `no`; default: `no`)_ — Whether to update existing companies matched by name.
- `create_owner` (string) _(enum: `yes`, `no`; default: `no`)_ — Whether to automatically create a contact as owner if the owner_email doesn't match an existing contact.
- `delimiter` (string) _(enum: `comma`, `semicolon`; default: `comma`)_ — CSV delimiter character.
- `importing_page` (integer) _(default: `1`)_ — Page number for batch processing (100 records per page).

Example:

```json
{
  "map": [
    {
      "csv": "Company Name",
      "table": "name"
    },
    {
      "csv": "Email",
      "table": "email"
    },
    {
      "csv": "Phone",
      "table": "phone"
    },
    {
      "csv": "Type",
      "table": "type"
    },
    {
      "csv": "Industry",
      "table": "industry"
    },
    {
      "csv": "Website",
      "table": "website"
    }
  ],
  "file": "/path/to/uploaded/companies.csv",
  "update": "yes",
  "create_owner": "no",
  "delimiter": "comma",
  "importing_page": 1
}
```


**Responses**

- **200** — Batch import completed.

  Schema (`application/json`):

  - `total` (integer) — Total number of records in the CSV file.
  - `completed` (integer) — Number of companies processed in this batch.
  - `total_page` (integer) — Total number of pages needed.
  - `skipped` (integer) — Number of companies skipped (already exist and update=no).
  - `has_more` (boolean) — Whether more pages remain to be processed.
  - `last_page` (integer) — The page number that was just processed.
  - `offset` (integer) — Record offset for this batch.

  Example:

```json
{
  "total": 250,
  "completed": 100,
  "total_page": 3,
  "skipped": 5,
  "has_more": true,
  "last_page": 1,
  "offset": 0
}
```


- **422** — Validation error (e.g., missing company name in CSV row).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## GET `/companies`

**GET List Companies**

Retrieve a paginated list of companies. Supports sorting, searching, and inline filtering by industry categories and company types. Each company in the response includes the computed `contacts_count` and the eager-loaded `owner` relation.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search companies by name or other searchable fields. |
| `sort_by` | string | no | Column to sort by. |
| `sort_order` | string | no | Sort direction. |
| `inline_filters[company_categories][]` | array<string> | no | Filter by industry categories. |
| `inline_filters[company_types][]` | array<string> | no | Filter by company types (e.g., partner, customer, vendor). |
| `per_page` | integer | no | Number of companies per page. |
| `page` | integer | no | Page number for pagination. |
| `inline_filters` | string | no | Column-level filters applied from the companies table header. Sent as a nested object keyed by column. |


**Responses**

- **200** — Paginated list of companies.

  Schema (`application/json`):

  - `companies` (object)
    - `total` (integer) — Total number of companies matching the query.
    - `per_page` (integer) — Number of companies per page.
    - `current_page` (integer) — Current page number.
    - `last_page` (integer) — Last page number.
    - `next_page_url` (string,null) — URL for the next page, or null if on the last page.
    - `prev_page_url` (string,null) — URL for the previous page, or null if on the first page.
    - `from` (integer) — Starting record index on this page.
    - `to` (integer) — Ending record index on this page.
    - `data` (array<Company>)

  Example:

```json
{
  "companies": {
    "total": 25,
    "per_page": 15,
    "current_page": 1,
    "last_page": 2,
    "next_page_url": "/wp-json/fluent-crm/v2/companies?page=2",
    "prev_page_url": null,
    "from": 1,
    "to": 15,
    "data": [
      {
        "id": 1,
        "name": "Acme Corporation",
        "description": "A leading technology company",
        "email": "info@acme.com",
        "phone": "+1-555-0100",
        "address_line_1": "100 Innovation Drive",
        "address_line_2": "Suite 200",
        "city": "San Francisco",
        "state": "CA",
        "postal_code": "94105",
        "country": "US",
        "type": "customer",
        "industry": "Technology",
        "logo": "https://example.com/wp-content/uploads/fluentcrm/acme-logo.png",
        "website": "https://acme.com",
        "linkedin_url": "https://linkedin.com/company/acme",
        "facebook_url": "https://facebook.com/acme",
        "twitter_url": "https://twitter.com/acme",
        "owner_user_id": 5,
        "employees_number": 250,
        "status": "active",
        "contacts_count": 12,
        "created_at": "2024-01-15 10:30:00",
        "updated_at": "2024-03-01 14:30:00",
        "owner": {
          "id": 5,
          "first_name": "Jane",
          "last_name": "Smith",
          "email": "jane@example.com"
        }
      }
    ]
  }
}
```



---

## PUT `/companies/custom-fields`

**PUT Save Company Custom Fields**

Save (create or update) the global custom field definitions for companies. This replaces the entire set of custom field definitions.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `fields` (array<object>) **required** — Array of custom field definitions. Can be passed as JSON string or array.
  - `key` (string) — Unique field key/slug.
  - `label` (string) — Human-readable field label.
  - `type` (string) _(enum: `text`, `textarea`, `number`, `date`, `select`, `radio`, `checkbox`)_ — Field input type.
  - `options` (array<string>) — Available options for select/radio/checkbox fields.
  - `settings` (object) — Additional field settings.
    - _(object)_

Example:

```json
{
  "fields": [
    {
      "key": "annual_revenue",
      "label": "Annual Revenue",
      "type": "number",
      "options": [],
      "settings": {}
    },
    {
      "key": "contract_end_date",
      "label": "Contract End Date",
      "type": "date",
      "options": [],
      "settings": {}
    },
    {
      "key": "priority_level",
      "label": "Priority Level",
      "type": "select",
      "options": [
        "Low",
        "Medium",
        "High"
      ],
      "settings": {}
    }
  ]
}
```


**Responses**

- **200** — Custom fields saved successfully.

  Schema (`application/json`):

  - `fields` (array<object>)
    - `key` (string) — Unique field key/slug.
    - `label` (string) — Human-readable field label.
    - `type` (string) _(enum: `text`, `textarea`, `number`, `date`, `select`, `radio`, `checkbox`)_ — Field input type.
    - `options` (array<string>) — Available options for select/radio/checkbox fields.
    - `settings` (object) — Additional field settings.
      - _(object)_
  - `message` (string)

  Example:

```json
{
  "fields": [
    {
      "key": "annual_revenue",
      "label": "Annual Revenue",
      "type": "number",
      "options": [],
      "settings": {}
    },
    {
      "key": "contract_end_date",
      "label": "Contract End Date",
      "type": "date",
      "options": [],
      "settings": {}
    },
    {
      "key": "priority_level",
      "label": "Priority Level",
      "type": "select",
      "options": [
        "Low",
        "Medium",
        "High"
      ],
      "settings": {}
    }
  ],
  "message": "Fields saved successfully!"
}
```



---

## GET `/companies/search`

**GET Search Companies**

Search companies by name with a simplified result format (id, name, email, logo, phone, website). Returns up to 50 results sorted by name. Optionally exclude companies already associated with a specific subscriber. Pre-selected company IDs can be passed via `values[]` to ensure they appear in the results even if they don't match the search.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search term to filter companies by name. |
| `subscriber_id` | integer | no | If provided, exclude companies already associated with this subscriber. |
| `values[]` | array<integer> | no | Array of company IDs that should always be included in results (for pre-selected values in dropdowns). |


**Responses**

- **200** — Search results.

  Schema (`application/json`):

  - `results` (array<object>)
    - `id` (integer) — Company ID.
    - `name` (string) — Company name.
    - `email` (string,null) — Company email.
    - `logo` (string,null) — Logo URL.
    - `phone` (string,null) — Phone number.
    - `website` (string,null) — Website URL.
  - `has_more` (boolean) — Whether there are more than 50 total companies (indicates results may be truncated).

  Example:

```json
{
  "results": [
    {
      "id": 1,
      "name": "Acme Corporation",
      "email": "info@acme.com",
      "logo": "https://example.com/wp-content/uploads/fluentcrm/acme-logo.png",
      "phone": "+1-555-0100",
      "website": "https://acme.com"
    },
    {
      "id": 3,
      "name": "Acme Labs",
      "email": "labs@acme.com",
      "logo": null,
      "phone": null,
      "website": "https://labs.acme.com"
    }
  ],
  "has_more": false
}
```



---

## GET `/companies/search-unattached-contacts`

**GET Search Unattached Contacts**

Search for contacts (subscribers) that are **not** currently associated with a specific company. Useful for finding contacts to attach to a company. Returns contacts ordered by ID descending.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `company_id` | integer | yes | The company ID. Only contacts not attached to this company are returned. |
| `search` | string | no | Search term to filter contacts by name, email, or other searchable fields. |
| `limit` | integer | no | Maximum number of contacts to return. |


**Responses**

- **200** — List of contacts not attached to the specified company.

  Schema (`application/json`):

  - `results` (array<object>)
    - `id` (integer) — Contact ID.
    - `first_name` (string) — First name.
    - `last_name` (string) — Last name.
    - `full_name` (string) — Full name.
    - `email` (string) _(format: email)_ — Email address.
    - `status` (string) — Subscription status.
    - `photo` (string) — Gravatar URL.

  Example:

```json
{
  "results": [
    {
      "id": 42,
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "email": "john@example.com",
      "status": "subscribed",
      "photo": "https://www.gravatar.com/avatar/abc123"
    },
    {
      "id": 38,
      "first_name": "Alice",
      "last_name": "Johnson",
      "full_name": "Alice Johnson",
      "email": "alice@example.com",
      "status": "subscribed",
      "photo": "https://www.gravatar.com/avatar/def456"
    }
  ]
}
```



---

## PUT `/companies/companies-property`

**PUT Update Companies Property**

Update a single property for one or more companies. Valid properties are `type`, `logo`, `owner_id`, and `refetch_logo`. When `refetch_logo` is used, the system attempts to re-fetch the company logo from its website URL. Fires `fluent_crm/company_{column}_to_{value}` action hooks for `type`, `status`, and `owner_id` changes.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `property` (string) **required** _(enum: `type`, `logo`, `owner_id`, `refetch_logo`)_ — The property/column to update.
- `value` (string) **required** — The new value for the property. For `type`, must be a valid company type. For `refetch_logo`, any truthy value triggers the re-fetch.
- `companies` (any) **required** — Company ID or array of company IDs to update.

Example:

```json
{
  "property": "type",
  "value": "partner",
  "companies": [
    1,
    2,
    3
  ]
}
```


**Responses**

- **200** — Property updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `updated_logo` (string) — Only present when `refetch_logo` was used and a new logo was found.

  Example:

```json
{
  "message": "Company successfully updated"
}
```


- **422** — Validation error (invalid column, value, or empty company IDs).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## PUT `/companies/{id}`

**PUT Update Company**

Update an existing company. The company name must remain unique across all companies. If the `id` is `0`, the request is treated as a create operation. URL fields (`website`, `linkedin_url`, `facebook_url`, `twitter_url`) are auto-prefixed with `https://` if no scheme is provided and validated as URLs.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The company ID to update. Pass `0` to create a new company instead. |


**Request body** (`application/json`, required)

- `name` (string) **required** — Company name (must be unique).
- `description` (string) — Company description.
- `email` (string) _(format: email)_ — Company email address.
- `phone` (string) — Phone number.
- `address_line_1` (string) — Address line 1.
- `address_line_2` (string) — Address line 2.
- `city` (string) — City.
- `state` (string) — State or province.
- `postal_code` (string) — Postal/zip code.
- `country` (string) — Two-letter country code.
- `type` (string) — Company type (e.g., partner, customer, vendor).
- `industry` (string) — Industry category.
- `logo` (string) _(format: uri)_ — URL to the company logo image.
- `website` (string) _(format: uri)_ — Company website URL.
- `linkedin_url` (string) _(format: uri)_ — LinkedIn profile URL.
- `facebook_url` (string) _(format: uri)_ — Facebook page URL.
- `twitter_url` (string) _(format: uri)_ — Twitter/X profile URL.
- `owner_user_id` (integer) — Subscriber ID of the company owner.
- `employees_number` (integer) — Number of employees.
- `status` (string) — Company status.

Example:

```json
{
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "employees_number": 300,
  "type": "partner"
}
```


**Responses**

- **200** — Company updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `company` (object)
    - `id` (integer) — Unique identifier for the company.
    - `name` (string) — Company name.
    - `description` (string,null) — Company description.
    - `email` (string,null) _(format: email)_ — Company email address.
    - `phone` (string,null) — Phone number.
    - `address_line_1` (string,null) — Address line 1.
    - `address_line_2` (string,null) — Address line 2.
    - `city` (string,null) — City.
    - `state` (string,null) — State or province.
    - `postal_code` (string,null) — Postal/zip code.
    - `country` (string,null) — Two-letter country code.
    - `type` (string,null) — Company type (e.g., partner, customer, vendor).
    - `industry` (string,null) — Industry category.
    - `logo` (string,null) — URL to the company logo image.
    - `website` (string,null) _(format: uri)_ — Company website URL.
    - `linkedin_url` (string,null) _(format: uri)_ — LinkedIn profile URL.
    - `facebook_url` (string,null) _(format: uri)_ — Facebook page URL.
    - `twitter_url` (string,null) _(format: uri)_ — Twitter/X profile URL.
    - `owner_user_id` (integer,null) — Subscriber ID of the company owner.
    - `employees_number` (integer,null) — Number of employees.
    - `status` (string,null) — Company status.
    - `contacts_count` (integer) — Number of contacts associated with this company.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the company was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the company was last updated.
    - `owner` (object,null) — The contact who owns this company.
      - `id` (integer)
      - `first_name` (string)
      - `last_name` (string)
      - `email` (string) _(format: email)_

  Example:

```json
{
  "message": "Company has been updated",
  "company": {
    "id": 1,
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "employees_number": 300,
    "type": "partner",
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-03-05 09:15:00"
  }
}
```


- **404** — Company not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — Validation error (e.g., duplicate company name, invalid URL).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## PUT `/companies/{id}/notes/{note_id}`

**PUT Update Company Note**

Update an existing note on a company. Only the `title`, `description`, `type`, and `created_at` fields can be updated. Fires the `fluent_crm/company_note_updated` action hook after the update.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The company ID. |
| `note_id` | integer | yes | The note ID to update. |


**Request body** (`application/json`, required)

- `note` (object) **required**
  - `title` (string) **required** — Note title.
  - `description` (string) **required** — Note content (HTML).
  - `type` (string) **required** _(enum: `note`, `call`, `email`, `meeting`, `activity`)_ — Note type.
  - `created_at` (string) _(format: date-time)_ — Custom creation date. If empty, the existing value is preserved.

Example:

```json
{
  "note": {
    "title": "Partnership discussion - Updated",
    "description": "<p>Updated terms agreed upon. Contract to be signed next Monday.</p>",
    "type": "meeting"
  }
}
```


**Responses**

- **200** — Note updated successfully.

  Schema (`application/json`):

  - `note` (object)
    - `id` (integer) — Unique identifier for the note.
    - `subscriber_id` (integer) — The company ID this note belongs to (stored in subscriber_id column).
    - `title` (string) — Note title.
    - `description` (string) — Note content (HTML).
    - `type` (string) _(enum: `note`, `call`, `email`, `meeting`, `activity`)_ — Note type.
    - `created_at` (string) _(format: date-time)_ — When the note was created.
    - `updated_at` (string) _(format: date-time)_ — When the note was last updated.
    - `added_by` (string,null) — Display name of the user who created the note.
  - `message` (string)

  Example:

```json
{
  "note": {
    "id": 15,
    "subscriber_id": 1,
    "title": "Partnership discussion - Updated",
    "description": "<p>Updated terms agreed upon. Contract to be signed next Monday.</p>",
    "type": "meeting",
    "created_at": "2024-03-01 14:30:00",
    "updated_at": "2024-03-05 09:00:00"
  },
  "message": "Note successfully updated"
}
```


- **404** — Company or note not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — Validation error.

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## POST `/companies/{id}/notes/bulk-delete`

**POST Bulk Delete Company Notes**

Delete several notes from one company in a single request. The company-side counterpart to `POST /subscribers/{id}/notes/bulk-delete`, with identical semantics: ids are scoped to the company in the path, foreign ids are silently skipped, and no more than **200** ids are accepted.

Each deletion fires `fluent_crm/company_note_deleted`.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats_delete`

_Enforced by `CompanyPolicy::bulkDeleteNotes()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Company id. |


**Request body** (`application/json`, required)

- `note_ids` (array<integer>) **required** — Note ids to delete. Required, and capped at 200 per request. Ids belonging to a different company are silently skipped.

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

## PUT `/companies/custom-fields/update_group_name`

**PUT Rename Company Custom Field Group**

Rename a company custom-field group, moving every field assigned to `old_name` over to `new_name` in one operation.

Groups are not standalone records — they exist only as a label on each custom field — so this endpoint is the only way to rename one without editing every field individually.

The full updated field set is returned so the caller can refresh without a second request.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `CompanyPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `old_name` (string) **required** — Existing group name to rename.
- `new_name` (string) **required** — Replacement group name.

Example:

```json
{
  "old_name": "Billing",
  "new_name": "Finance"
}
```


**Responses**

- **200** — Group renamed.

  Schema (`application/json`):

  - `fields` (array<object>) — Every company custom field after the rename.
    - `slug` (string) — Field key.
    - `label` (string) — Field label.
    - `type` (string) — Field input type.
    - `group` (string) — Group name, now reflecting `new_name`.
  - `message` (string) — Confirmation message.

  Example:

```json
{
  "fields": [
    {
      "slug": "vat_number",
      "label": "VAT Number",
      "type": "text",
      "group": "Finance"
    }
  ],
  "message": "Group name updated successfully!"
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
