# FluentCRM API — WordPress Users

2 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## GET `/users/roles`

**GET WordPress User Roles**

Retrieve all editable WordPress user roles. Returns role keys and their capabilities. Useful for building role selection UIs for user import.

<!-- fc:access -->

**Required capability:** `list_users`

_Enforced by `UsersPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Map of WordPress user roles.

  Schema (`application/json`):

  - `roles` (object) — Map of role slugs to role details.
    - _(object)_

  Example:

```json
{
  "roles": {
    "administrator": {
      "name": "Administrator",
      "capabilities": {
        "switch_themes": true,
        "edit_themes": true,
        "manage_options": true
      }
    },
    "subscriber": {
      "name": "Subscriber",
      "capabilities": {
        "read": true
      }
    }
  }
}
```



---

## GET `/users`

**GET List WordPress Users**

Retrieve a list of WordPress users filtered by role. Returns user ID, display name, and email by default. Useful for previewing users before importing them as contacts.

<!-- fc:access -->

**Required capability:** `list_users`

_Enforced by `UsersPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `roles[]` | array<string> | no | WordPress user roles to filter by. |
| `limit` | integer | no | Maximum number of users to return. |
| `fields[]` | array<string> | no | User fields to include in the response. |


**Responses**

- **200** — List of WordPress users.

  Schema (`application/json`):

  - `users` (array<object>) — Array of WordPress user objects.
    - `ID` (integer) — WordPress user ID.
    - `display_name` (string) — User display name.
    - `user_email` (string) _(format: email)_ — User email address.
  - `total` (integer) — Total number of matching users.

  Example:

```json
{
  "users": [
    {
      "ID": 1,
      "display_name": "John Doe",
      "user_email": "john@example.com"
    },
    {
      "ID": 2,
      "display_name": "Jane Smith",
      "user_email": "jane@example.com"
    }
  ],
  "total": 45
}
```



---
