# FluentCRM API — Pro Settings

11 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/campaign-pro-settings/managers`

**POST Add Manager**

Add a WordPress user as a FluentCRM manager with specific permissions. The user must already exist in WordPress. Permission dependencies are validated before assignment.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `manager` (object) **required**
  - `email` (string) **required** _(format: email)_ — Email address of the WordPress user to add as a manager.
  - `permissions` (array<string>) **required** — Array of FluentCRM permission slugs to assign.

Example:

```json
{
  "manager": {
    "email": "jane@example.com",
    "permissions": [
      "fcrm_manage_contacts",
      "fcrm_manage_campaigns"
    ]
  }
}
```


**Responses**

- **200** — Manager added successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Manager has been added"
}
```


- **422** — Validation error, user not found, or permission dependency not met.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Associate user could not be found with this email"
}
```



---

## DELETE `/campaign-pro-settings/license`

**DELETE Deactivate License**

Deactivate the current FluentCRM Pro license key. Contacts the licensing server to release the activation slot and removes the stored license key locally.

**Auth:** ApplicationPasswords

**Responses**

- **200** — License deactivated successfully.

  Schema (`application/json`):

  - `license_data` (object) — License deactivation response data (license_key field is removed).
    - _(object)_
  - `message` (string)

  Example:

```json
{
  "license_data": {
    "status": "deactivated"
  },
  "message": "Your license key has been successfully deactivated"
}
```


- **422** — Deactivation failed.

  Schema (`application/json`):

  - `message` (string)

---

## DELETE `/campaign-pro-settings/managers/{id}`

**DELETE Remove Manager**

Remove a FluentCRM manager by their WordPress user ID. This removes all FluentCRM permissions from the user and clears their manager role flag. The WordPress user account itself is not affected.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The WordPress user ID of the manager to remove. |


**Responses**

- **200** — Manager removed successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Manager has been removed"
}
```


- **422** — User not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Associate user could not be found"
}
```



---

## POST `/campaign-pro-settings/sms/disable`

**POST Disable SMS**

Disable the SMS module entirely. This sets the SMS enabled flag to 'no' and updates the experimental settings. Provider credentials are preserved but the module is deactivated.

**Auth:** ApplicationPasswords

**Responses**

- **200** — SMS module disabled successfully.

  Schema (`application/json`):

  - `message` (string)
  - `reload` (boolean) — Whether the UI should reload (true when the status actually changed).

  Example:

```json
{
  "message": "SMS has been disabled successfully",
  "reload": true
}
```



---

## GET `/campaign-pro-settings/license`

**GET License Status**

Retrieve the current FluentCRM Pro license status. The license key is partially masked for security (first 4 and last 4 characters visible). If the license is expired, a renewal URL is included.

**Auth:** ApplicationPasswords

**Responses**

- **200** — License status retrieved successfully.

  Schema (`application/json`):

  - `status` (string) _(enum: `valid`, `expired`, `invalid`, `disabled`, `inactive`)_ — License status.
  - `license_key` (string) — Partially masked license key (e.g., 'abcd****efgh').
  - `purchase_url` (string) — URL to purchase a license.
  - `renew_url` (string) — URL to renew the license. Only present when status is 'expired'.
  - `error` (boolean) — Present and true if there was an error checking license status.

  Example:

```json
{
  "status": "valid",
  "license_key": "abcd************************efgh",
  "purchase_url": "https://fluentcrm.com/pricing/"
}
```



---

## GET `/campaign-pro-settings/managers`

**GET List Managers**

Retrieve a paginated list of FluentCRM managers. Managers are WordPress users who have been assigned FluentCRM-specific permissions (roles). Also returns the full list of available permissions.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of managers per page. |
| `page` | integer | no | Page number. |


**Responses**

- **200** — List of managers and available permissions.

  Schema (`application/json`):

  - `managers` (object)
    - `data` (array<object>)
      - `id` (integer) — WordPress user ID.
      - `first_name` (string)
      - `last_name` (string)
      - `email` (string)
      - `permissions` (array<string>) — List of FluentCRM permission slugs assigned to this manager.
    - `total` (integer)
  - `permissions` (object) — All available FluentCRM permissions with labels and dependencies.
    - _(object)_

  Example:

```json
{
  "managers": {
    "data": [
      {
        "id": 2,
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane@example.com",
        "permissions": [
          "fcrm_manage_contacts",
          "fcrm_manage_campaigns"
        ]
      }
    ],
    "total": 1
  },
  "permissions": {
    "fcrm_manage_contacts": {
      "label": "Manage Contacts",
      "depends": []
    },
    "fcrm_manage_campaigns": {
      "label": "Manage Campaigns",
      "depends": [
        "fcrm_manage_contacts"
      ]
    }
  }
}
```



---

## GET `/campaign-pro-settings/sms`

**GET SMS Settings**

Retrieve the current SMS module settings, including the active SMS provider configuration and available provider options with their field definitions.

**Auth:** ApplicationPasswords

**Responses**

- **200** — SMS settings and provider options.

  Schema (`application/json`):

  - `settings` (object) — Current SMS settings including enabled status and provider credentials.
    - `enabled` (string) _(enum: `yes`, `no`)_ — Whether the SMS module is enabled.
    - `sms_provider` (string) — The active SMS provider slug.
  - `options` (object) — Available SMS provider options with field definitions.
    - `providers` (object) — Available SMS providers keyed by provider slug.
      - _(object)_

  Example:

```json
{
  "settings": {
    "enabled": "yes",
    "sms_provider": "twilio"
  },
  "options": {
    "providers": {
      "twilio": {
        "fields": {
          "account_sid": {
            "label": "Account SID",
            "required": true,
            "default": ""
          },
          "auth_token": {
            "label": "Auth Token",
            "required": true,
            "default": ""
          },
          "from_number": {
            "label": "From Number",
            "required": true,
            "default": ""
          }
        }
      }
    }
  }
}
```



---

## POST `/campaign-pro-settings/import_funnel`

**POST Import Funnel**

Import an automation funnel from a file. Accepts a funnel configuration file and creates the corresponding funnel with all its sequences, triggers, and actions.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `file` (string) **required** — The funnel configuration file content or reference.

**Responses**

- **200** — Funnel imported successfully.

  Schema (`application/json`):

  - `message` (string)
- **422** — Invalid file or import failed.

  Schema (`application/json`):

  - `message` (string)

---

## POST `/campaign-pro-settings/license`

**POST Save License**

Activate a FluentCRM Pro license key. Validates the key against the licensing server and stores it if valid.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `license_key` (string) **required** — The license key to activate.

Example:

```json
{
  "license_key": "your-license-key-here"
}
```


**Responses**

- **200** — License activated successfully.

  Schema (`application/json`):

  - `license_data` (object) — License activation response data from the licensing server.
    - _(object)_
  - `message` (string)

  Example:

```json
{
  "license_data": {
    "status": "valid",
    "expires": "2025-12-31 23:59:59"
  },
  "message": "Your license key has been successfully updated"
}
```


- **422** — Invalid or failed license activation.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Your license key is invalid"
}
```



---

## POST `/campaign-pro-settings/sms`

**POST Save SMS Settings**

Save SMS module settings including the provider selection and credentials. When enabling SMS, all required provider fields must be filled. If enabling for the first time, runs the SMS database migration. Saves credentials for all configured providers.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `settings` (object) **required** — Provider-specific settings are included as nested objects keyed by provider slug.
  - `enabled` (string) _(enum: `yes`, `no`)_ — Whether to enable the SMS module.
  - `sms_provider` (string) — The SMS provider slug to use (e.g., 'twilio').

Example:

```json
{
  "settings": {
    "enabled": "yes",
    "sms_provider": "twilio",
    "twilio": {
      "account_sid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "auth_token": "your_auth_token",
      "from_number": "+15551234567"
    }
  }
}
```


**Responses**

- **200** — SMS settings saved successfully.

  Schema (`application/json`):

  - `message` (string)
  - `reload` (boolean) — Whether the UI should reload (true when enabled/disabled status changed).

  Example:

```json
{
  "message": "Settings has been saved successfully",
  "reload": false
}
```


- **422** — Validation error - missing provider or required credentials.

  Schema (`application/json`):

  - `message` (string)
  - `required_fields` (array<string>) — List of missing required field labels.

  Example:

```json
{
  "message": "Please provide all required SMS provider credentials before enabling the SMS module",
  "required_fields": [
    "Account SID",
    "Auth Token"
  ]
}
```


- **500** — Settings could not be saved.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "SMS settings could not be saved completely. Please try again."
}
```



---

## PUT `/campaign-pro-settings/managers/{id}`

**PUT Update Manager**

Update the permissions of an existing FluentCRM manager. Permission dependencies are validated before assignment. The manager is identified by their WordPress user ID.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The WordPress user ID of the manager. |


**Request body** (`application/json`, required)

- `manager` (object) **required**
  - `email` (string) **required** _(format: email)_ — Email address of the WordPress user.
  - `permissions` (array<string>) **required** — Updated array of FluentCRM permission slugs.

Example:

```json
{
  "manager": {
    "email": "jane@example.com",
    "permissions": [
      "fcrm_manage_contacts",
      "fcrm_manage_campaigns",
      "fcrm_manage_settings"
    ]
  }
}
```


**Responses**

- **200** — Manager updated successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Manager has been updated"
}
```


- **422** — Validation error, user not found, or permission dependency not met.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Associate user could not be found with this email"
}
```



---
