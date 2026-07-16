# FluentCRM API — Migrators

5 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## GET `/migrators`

**GET Migrator Drivers**

Retrieve the list of available SaaS CRM migrator drivers. Default drivers include Mailchimp, ConvertKit, MailerLite, Drip, and ActiveCampaign. Additional drivers may be registered via the `fluent_crm/saas_migrators` filter.

**Auth:** ApplicationPasswords

**Responses**

- **200** — List of available migrator drivers.

  Schema (`application/json`):

  - `drivers` (object) — Map of driver keys to driver information.
    - _(object)_

  Example:

```json
{
  "drivers": {
    "mailchimp": {
      "title": "Mailchimp",
      "description": "Migrate your Mailchimp contacts to FluentCRM",
      "logo": "https://example.com/images/mailchimp.svg",
      "credentials": {
        "api_key": {
          "label": "API Key",
          "type": "text",
          "placeholder": "Enter your Mailchimp API key"
        }
      }
    },
    "ConvertKit": {
      "title": "ConvertKit",
      "description": "Migrate your ConvertKit subscribers to FluentCRM",
      "logo": "https://example.com/images/convertkit.svg",
      "credentials": {
        "api_key": {
          "label": "API Key",
          "type": "text",
          "placeholder": "Enter your ConvertKit API key"
        }
      }
    }
  }
}
```



---

## POST `/migrators/summary`

**POST Get Migrator Import Summary**

Retrieve a summary of what will be imported from the external CRM based on the selected list/tag mappings. Shows the number of contacts and other data that will be migrated before executing the actual import.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `driver` (string) **required** — Migrator driver identifier.
- `credential` (object) — Driver-specific credential fields.
  - _(object)_
- `map_settings` (object) — List/tag mapping settings from the previous step.
  - _(object)_

Example:

```json
{
  "driver": "mailchimp",
  "credential": {
    "api_key": "abc123def456-us10"
  },
  "map_settings": {
    "lists": [
      "abc123"
    ],
    "tags": [
      1,
      2
    ]
  }
}
```


**Responses**

- **200** — Import summary with counts and preview data.

  Schema (`application/json`):

  - `import_summary` (object) — Summary data from the migrator driver. Structure varies by driver.
    - _(object)_

  Example:

```json
{
  "import_summary": {
    "total_contacts": 1500,
    "lists": [
      {
        "id": "abc123",
        "name": "Main Newsletter",
        "count": 1200
      }
    ],
    "tags": [
      {
        "id": 1,
        "name": "Customer",
        "count": 800
      }
    ]
  }
}
```


- **422** — Driver not found or summary retrieval error.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sorry no driver found for the selected CRM"
}
```



---

## GET `/migrators/list-tag-mappings`

**GET Migrator List/Tag Mappings**

Retrieve the available lists and tags from the external CRM for mapping to FluentCRM lists and tags during migration. Requires valid credentials to have been verified first.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `driver` | string | yes | Migrator driver identifier (e.g., `mailchimp`, `ConvertKit`). |
| `credential` | object | no | Driver-specific credential fields. |


**Responses**

- **200** — Available list and tag mapping options from the external CRM.

  Schema (`application/json`):

  - `options` (object) — Mapping options returned by the migrator driver. Structure varies by driver.
    - _(object)_

  Example:

```json
{
  "options": {
    "lists": [
      {
        "id": "abc123",
        "name": "Main Newsletter"
      },
      {
        "id": "def456",
        "name": "Product Updates"
      }
    ],
    "tags": [
      {
        "id": 1,
        "name": "Customer"
      },
      {
        "id": 2,
        "name": "Lead"
      }
    ]
  }
}
```


- **422** — Driver not found or credential error.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sorry no driver found for the selected CRM"
}
```



---

## POST `/migrators/import`

**POST Execute Migrator Import**

Execute the actual import from the external CRM. Fetches contacts from the external service and creates/updates them in FluentCRM based on the configured mappings. The response structure depends on the migrator driver.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `driver` (string) **required** — Migrator driver identifier (e.g., `mailchimp`, `ConvertKit`, `MailerLite`, `Drip`, `ActiveCampaign`).
- `credential` (object) — Driver-specific credential fields.
  - _(object)_
- `map_settings` (object) — List/tag mapping settings.
  - _(object)_

Example:

```json
{
  "driver": "mailchimp",
  "credential": {
    "api_key": "abc123def456-us10"
  },
  "map_settings": {
    "lists": [
      "abc123"
    ],
    "tags": [
      1,
      2
    ],
    "status": "subscribed",
    "update": "yes"
  }
}
```


**Responses**

- **200** — Import completed successfully.

  Schema (`application/json`):

  - `import_info` (object) — Import result data from the migrator driver. Structure varies by driver.
    - _(object)_

  Example:

```json
{
  "import_info": {
    "inserted": 1200,
    "updated": 150,
    "skipped": 50,
    "total": 1400,
    "message": "Import completed successfully"
  }
}
```


- **422** — Driver not found or import error.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sorry no driver found for the selected CRM"
}
```



---

## POST `/migrators/verify-cred`

**POST Verify Migrator Credential**

Verify the API credentials for a specific CRM migrator driver. Tests the provided credentials against the external CRM service to confirm they are valid before proceeding with the migration.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `driver` (string) **required** — Migrator driver identifier (e.g., `mailchimp`, `ConvertKit`, `MailerLite`, `Drip`, `ActiveCampaign`).
- `credential` (object) **required** — Driver-specific credential fields (e.g., API key, API secret).
  - _(object)_

Example:

```json
{
  "driver": "mailchimp",
  "credential": {
    "api_key": "abc123def456-us10"
  }
}
```


**Responses**

- **200** — Credentials verified successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.

  Example:

```json
{
  "message": "Your provided API key is valid"
}
```


- **422** — Invalid credentials or driver not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sorry no driver found for the selected CRM"
}
```



---
