# FluentCart API — Roles & Permissions (Pro)

7 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/roles`

**POST Assign Role**

Assign a FluentCart role to a WordPress user. The user receives the fluent_cart_admin capability and their role is stored as user meta. If the user already has an assigned role, it is replaced.

**Policy:** `AdminPolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `user_id` (integer) **required** — WordPress user ID. Must reference an existing user.
- `role_key` (string) **required** _(maxLength: 50)_ — The role key to assign. Must be one of the valid role keys returned by the List Roles endpoint (e.g., super_admin, manager, worker, accountant).

Example:

```json
{
  "user_id": 10,
  "role_key": "manager"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string) — Success message
  - `is_updated` (boolean) — Whether the role was updated

  Example:

```json
{
  "message": "Role synced successfully",
  "is_updated": true
}
```


- **400** — Error response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "success": false,
  "data": {
    "message": "Invalid request. Please check your input and try again."
  }
}
```



---

## DELETE `/roles/{key}`

**DELETE Delete Role Assignment**

Remove a FluentCart role assignment from a user. The user's fluent_cart_admin capability is removed and their role meta is deleted. The user's WordPress account is not affected.

**Policy:** `AdminPolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `key` | string | yes | The role key to remove (e.g., manager, worker). |


**Request body** (`application/json`, required)

- `user_id` (integer) **required** — The WordPress user ID to remove the role from.

Example:

```json
{
  "user_id": 10
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string) — Success message

  Example:

```json
{
  "message": "Role deleted successfully"
}
```


- **400** — Error response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "success": false,
  "data": {
    "message": "Invalid request. Please check your input and try again."
  }
}
```



---

## GET `/roles/{key}`

**GET Get Role**

Retrieve details for a specific role by its key. This endpoint is currently a placeholder and returns no data. It is reserved for future use.

**Policy:** `AdminPolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `key` | string | yes | Role slug. Valid values come from `PermissionManager::getAllRoles()` — `super_admin`, `manager`, `worker`, `accountant`. |


**Responses**

- **200** — Successful response (currently returns no data)

  Schema (`application/json`):

  - `role` (object)
    - `key` (string) — Role slug, e.g. `manager`.
    - `title` (string) — Human-readable role name.
    - `description` (string) — What the role is allowed to do.
    - `permissions` (array<string>) — Permission slugs granted to the role, e.g. `orders/view`.

  Example:

```json
{
  "role": {
    "key": "fct_manager",
    "display_name": "FluentCart Manager",
    "capabilities": {
      "fct_manage_orders": true,
      "fct_manage_products": true,
      "fct_manage_customers": true,
      "fct_view_reports": true,
      "fct_manage_settings": false
    }
  }
}
```


- **404** — Unknown or empty role key.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Invalid role."
}
```



---

## GET `/roles/managers`

**GET List Managers**

Retrieve a list of all WordPress users who have been assigned a FluentCart shop role. Returns user details along with their assigned role and resolved permissions.

**Policy:** `AdminPolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `managers` (array<Manager>)

  Example:

```json
{
  "managers": [
    {
      "id": 5,
      "email": "manager@example.com",
      "display_name": "Jane Manager",
      "username": "janemanager",
      "shop_role": "manager",
      "description": "With All Permissions Except Sensitive Settings",
      "registered_at": "2025-03-10 08:00:00",
      "role_permissions": [
        "store/settings",
        "products/view",
        "products/create",
        "products/edit",
        "products/delete",
        "customers/view",
        "customers/manage",
        "customers/delete",
        "orders/view",
        "orders/manage_statuses",
        "orders/can_refund",
        "orders/manage",
        "orders/export",
        "orders/delete",
        "subscriptions/view",
        "subscriptions/manage",
        "subscriptions/delete",
        "licenses/view",
        "licenses/manage",
        "licenses/delete",
        "coupons/view",
        "coupons/manage",
        "coupons/delete",
        "reports/view",
        "reports/export",
        "integrations/view",
        "integrations/manage",
        "integrations/delete"
      ]
    }
  ]
}
```



---

## GET `/roles`

**GET List Roles**

Retrieve all available FluentCart roles with their titles and descriptions. This returns the role definitions (not user assignments).

**Policy:** `AdminPolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `roles` (object)
    - _(object)_

  Example:

```json
{
  "roles": {
    "super_admin": {
      "title": "Super Admin",
      "description": "With All Permissions"
    },
    "manager": {
      "title": "Manager",
      "description": "With All Permissions Except Sensitive Settings"
    },
    "worker": {
      "title": "Worker",
      "description": "View Access for products, customers, coupons, integrations. Manage Access for Order Statuses"
    },
    "accountant": {
      "title": "Accountant",
      "description": "View Access for products, customers, orders, subscriptions, licenses, coupons, reports and integrations"
    }
  }
}
```



---

## GET `/roles/user-list`

**GET Search Users**

Search for WordPress users who can be assigned a FluentCart role. Returns users matching the search query, excluding those who already have a WordPress administrator role.

**Policy:** `AdminPolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search by display name or email address. Partial matches supported. |
| `user_ids` | string | no | Comma-separated user IDs to include in results regardless of search filter. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `users` (object)
    - `total` (integer) — Total number of matching users
    - `per_page` (integer) — Number of users per page
    - `current_page` (integer) — Current page number
    - `last_page` (integer) — Last page number
    - `data` (array<UserListItem>)
    - `first_page_url` (string)
    - `from` (integer)
    - `last_page_url` (string)
    - `links` (array<object>) — Rendered pagination links, including the `&laquo; Previous` / `Next &raquo;` entries.
      - `url` (string)
      - `label` (string)
      - `active` (boolean)
    - `next_page_url` (string)
    - `path` (string)
    - `prev_page_url` (string)
    - `to` (integer)

  Example:

```json
{
  "users": {
    "total": 25,
    "per_page": 15,
    "current_page": 1,
    "last_page": 2,
    "data": [
      {
        "ID": 10,
        "name": "Alice Johnson",
        "email": "alice@example.com"
      },
      {
        "ID": 15,
        "name": "Bob Wilson",
        "email": "bob@example.com"
      }
    ]
  }
}
```



---

## POST `/roles/{key}`

**POST Update Role**

Update a specific role definition. This endpoint is currently a placeholder and returns no data. It is reserved for future use.

**Policy:** `AdminPolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `key` | string | yes | The role key to update. |


**Request body** (`application/json`)

- _(object)_

Example:

```json
{
  "title": "Manager",
  "capabilities": [
    "manage_orders",
    "manage_products",
    "manage_customers",
    "manage_coupons"
  ]
}
```


**Responses**

- **200** — Successful response (currently returns no data)

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "message": "Role updated successfully.",
  "role": {
    "key": "fct_manager",
    "display_name": "FluentCart Manager",
    "capabilities": {
      "fct_manage_orders": true,
      "fct_manage_products": true,
      "fct_manage_customers": true,
      "fct_view_reports": true,
      "fct_manage_coupons": true,
      "fct_manage_settings": false
    }
  }
}
```



---
