# FluentCart API — Customers

18 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/customers/{customerId}/attachable-user`

**POST Attach WordPress User**

Link a WordPress user to an existing customer record. The customer must not already have a linked user, and the target user must not already be linked to another customer.

**Required permission:** `customers/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID |


**Request body** (`application/json`, required)

- `user_id` (integer) **required** — The WordPress user ID to attach. Must reference an existing user who is not already linked to a customer.

Example:

```json
{
  "user_id": 8
}
```


**Responses**

- **200** — User attached successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "User attached successfully"
}
```


- **400** — Cannot attach user.

  Example:

```json
{
  "success": false,
  "data": {
    "message": "This WordPress user is already attached to another customer record."
  }
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`customers/manage`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## POST `/customers/do-bulk-action`

**POST Bulk Actions**

Perform bulk operations on multiple customers such as deletion or status change.

**Required permission:** `customers/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `action` (string) **required** _(enum: `delete_customers`, `change_customer_status`)_ — The action to perform.
- `customer_ids` (array<integer>) **required** — Array of customer IDs to act upon
- `new_status` (string) — Required when action is change_customer_status. The new status to apply to the selected customers.

Example:

```json
{
  "action": "change_customer_status",
  "customer_ids": [
    12,
    15,
    23
  ],
  "new_status": "inactive"
}
```


**Responses**

- **200** — Bulk action completed successfully.

  Schema (`application/json`):

  - `message` (string)
  - `data` (string)

  Example:

```json
{
  "message": "Bulk action completed successfully.",
  "affected_count": 5,
  "action": "delete"
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Missing customer selection.

  Example:

```json
{
  "code": 403,
  "message": "Customers selection is required",
  "data": ""
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## POST `/customers/{customerId}/address`

**POST Create Address**

Create a new address for a customer. If no primary address exists for the given type, this address is automatically set as primary. Optionally syncs with an associated order address.

**Required permission:** `customers/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID |


**Request body** (`application/json`, required)

- `name` (string) **required** _(maxLength: 255)_ — Full name for the address.
- `email` (string) **required** _(format: email; maxLength: 255)_ — Email for the address.
- `address_1` (string) **required** — Primary street address
- `address_2` (string) — Secondary address line (apartment, suite, etc.)
- `city` (string) **required** _(maxLength: 255)_ — City.
- `state` (string) — State/province code. May be required depending on store localization settings.
- `postcode` (string) — Postal/zip code. May be required depending on store localization settings.
- `country` (string) **required** — Country code (e.g., US, GB)
- `phone` (string) — Phone number
- `type` (string) **required** _(enum: `billing`, `shipping`)_ — Address type: billing or shipping
- `label` (string) _(maxLength: 15)_ — Custom label for the address (e.g., Home, Office).
- `status` (string) — Address status (default: active)
- `is_primary` (integer) _(enum: `0`, `1`)_ — Set to 1 to make this the primary address (default: 0)
- `company_name` (string) _(maxLength: 255)_ — Company name.
- `order_id` (integer) — Order ID to sync this address with.

Example:

```json
{
  "name": "Sarah Johnson",
  "email": "sarah.johnson@example.com",
  "address_1": "456 Market Street",
  "address_2": "Suite 300",
  "city": "San Francisco",
  "state": "CA",
  "postcode": "94102",
  "country": "US",
  "phone": "+1-415-555-0142",
  "type": "billing",
  "label": "Office",
  "company_name": "TechStart Inc."
}
```


**Responses**

- **200** — Address created successfully.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object)
    - _(object)_

  Example:

```json
{
  "message": "Billing address created successfully!",
  "data": {
    "id": 25,
    "customer_id": 12,
    "is_primary": 1,
    "type": "billing",
    "status": "active",
    "label": "Office",
    "name": "Sarah Johnson",
    "address_1": "456 Market Street",
    "address_2": "Suite 300",
    "city": "San Francisco",
    "state": "CA",
    "postcode": "94102",
    "country": "US",
    "phone": "+1-415-555-0142",
    "email": "sarah.johnson@example.com",
    "company": "TechStart Inc.",
    "meta": null
  }
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`customers/manage`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## POST `/customers`

**POST Create Customer**

Create a new customer record. Automatically links to an existing WordPress user if a matching email is found.

**Required permission:** `customers/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `email` (string) **required** _(format: email; maxLength: 255)_ — Customer email address. Must be unique and valid.
- `first_name` (string) _(maxLength: 255)_ — Customer first name. Required when store is not configured for full name mode.
- `last_name` (string) _(maxLength: 255)_ — Customer last name.
- `full_name` (string) _(maxLength: 255)_ — Customer full name. Required when store is configured for full name mode. Automatically split into first_name and last_name.
- `city` (string) — Customer city
- `state` (string) — Customer state/province code
- `postcode` (string) — Customer postal/zip code
- `country` (string) — Customer country code (e.g., US, GB)
- `notes` (string) — Internal notes about the customer
- `status` (string) — Customer status
- `user_id` (integer) — WordPress user ID to associate
- `wp_user` (string) — Set to 'yes' to create a new WordPress user account for this customer
- `aov` (string) — Average order value
- `user_url` (string) — Customer website URL

Example:

```json
{
  "first_name": "Sarah",
  "last_name": "Johnson",
  "email": "sarah.johnson@example.com",
  "country": "US",
  "city": "San Francisco",
  "state": "CA",
  "postcode": "94102",
  "wp_user": "yes"
}
```


**Responses**

- **200** — Customer created successfully.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object)
    - _(object)_

  Example:

```json
{
  "message": "Customer created successfully!",
  "data": {
    "id": 12,
    "user_id": 5,
    "email": "sarah.johnson@example.com",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "status": "active",
    "purchase_value": 0,
    "purchase_count": 0,
    "ltv": 0,
    "aov": 0,
    "uuid": "cust_a1b2c3d4",
    "country": "US",
    "city": "San Francisco",
    "state": "CA",
    "postcode": "94102",
    "created_at": "2025-06-10 09:15:00",
    "updated_at": "2025-06-10 09:15:00"
  }
}
```


- **400** — Customer already exists.

  Example:

```json
{
  "code": 400,
  "message": "Customer already exists.",
  "data": ""
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`customers/manage`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## DELETE `/customers/{customerId}/address`

**DELETE Delete Address**

Delete a customer address. Primary addresses and the last remaining address cannot be deleted.

**Also used by the customer portal UI.** Delete an existing address for the authenticated customer. The address ID is passed in the request body.

**Required permission:** `customers/delete`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `address[id]` | integer | yes | The address record ID to delete |


**Request body** (`application/json`, required)

- `address` (object) **required**
  - `id` (integer) **required** — The address record ID to delete

Example:

```json
{
  "address": {
    "id": 5
  }
}
```


**Responses**

- **200** — Address deleted successfully.

  Schema (`application/json`):

  - `message` (string)
  - `data` (string)

  Example:

```json
{
  "message": "Address successfully deleted.",
  "data": ""
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Cannot delete primary or last address.

  Example:

```json
{
  "success": false,
  "data": {
    "message": "You do not have permission to perform this action."
  }
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## POST `/customers/{customerId}/detach-user`

**POST Detach WordPress User**

Remove the WordPress user association from a customer record. The customer record itself is preserved; only the user_id link is cleared.

**Required permission:** `customers/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID |


**Responses**

- **200** — User detached successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "User detached successfully"
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`customers/manage`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **404** — Customer not found.

  Example:

```json
{
  "message": "Customer not found."
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## GET `/customers/{customerId}/order`

**GET Find Customer Order**

Retrieve all orders for a customer with their filtered order items (line items) eager-loaded.

**Required permission:** `customers/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID |


**Responses**

- **200** — Successful response. Returns customer orders with line items.

  Schema (`application/json`):

  - `data` (object)
    - `data` (array<object>)
      - _(object)_

  Example:

```json
{
  "data": {
    "data": [
      {
        "id": 42,
        "customer_id": 12,
        "invoice_no": "INV-042",
        "status": "completed",
        "payment_status": "paid",
        "currency": "USD",
        "total_amount": 10692,
        "created_at": "2025-09-20 14:25:00",
        "filtered_order_items": [
          {
            "id": 78,
            "order_id": 42,
            "title": "Pro Starter Kit",
            "quantity": 1,
            "unit_price": 9900
          },
          {
            "id": 79,
            "order_id": 42,
            "title": "Priority Support Add-on",
            "quantity": 1,
            "unit_price": 792
          }
        ]
      },
      {
        "id": 35,
        "customer_id": 12,
        "invoice_no": "INV-035",
        "status": "completed",
        "payment_status": "paid",
        "currency": "USD",
        "total_amount": 7500,
        "created_at": "2025-08-05 11:30:00",
        "filtered_order_items": [
          {
            "id": 62,
            "order_id": 35,
            "title": "Premium Theme License",
            "quantity": 1,
            "unit_price": 7500
          }
        ]
      }
    ]
  }
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`customers/view`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## GET `/customers/attachable-user`

**GET Get Attachable Users**

Retrieve a list of WordPress users that are not yet associated with any FluentCart customer. Useful for linking existing WP users to customer records.

**Required permission:** `customers/manage`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns a list of attachable WordPress users.

  Schema (`application/json`):

  - `users` (array<object>)
    - `ID` (integer) — WordPress user ID
    - `display_name` (string) — User display name
    - `user_email` (string) _(format: email)_ — User email address

  Example:

```json
{
  "users": [
    {
      "ID": 8,
      "user_email": "mike.chen@example.com",
      "display_name": "Mike Chen"
    },
    {
      "ID": 14,
      "user_email": "lisa.park@example.com",
      "display_name": "Lisa Park"
    }
  ]
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`customers/manage`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```



---

## GET `/customers/{customerId}`

**GET Get Customer**

Retrieve a single customer by ID with optional eager-loaded relationships.

**Also used by the customer portal UI.** Retrieve the details of the currently authenticated customer. The customerId must match the logged-in customer's record.

**Required permission:** `customers/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with` | array<string> | no | Relationships to eager-load (e.g., `orders`, `labels`, `billing_address`, `shipping_address`, `subscriptions`, `wpUser`) |
| `params[customer_only]` | string | no | Set to `yes` to return the customer without labels processing |


**Responses**

- **200** — Successful response. Returns the customer object.

  Schema (`application/json`):

  - `customer` (object)
    - _(object)_

  Example:

```json
{
  "customer": {
    "id": 12,
    "user_id": 5,
    "contact_id": null,
    "email": "sarah.johnson@example.com",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "status": "active",
    "purchase_value": 24900,
    "purchase_count": 3,
    "ltv": 24900,
    "first_purchase_date": "2025-06-10 09:15:00",
    "last_purchase_date": "2025-09-20 14:25:00",
    "aov": 8300,
    "notes": "",
    "uuid": "cust_a1b2c3d4",
    "country": "US",
    "city": "San Francisco",
    "state": "CA",
    "postcode": "94102",
    "created_at": "2025-06-10 09:15:00",
    "updated_at": "2025-09-20 14:30:00",
    "full_name": "Sarah Johnson",
    "photo": "https://www.gravatar.com/avatar/abc123",
    "country_name": "United States",
    "formatted_address": "San Francisco, CA 94102, US",
    "user_link": "https://example.com/wp-admin/user-edit.php?user_id=5",
    "selected_labels": [
      1,
      2
    ],
    "labels": [
      {
        "id": 1,
        "title": "VIP",
        "color": "#3b82f6"
      },
      {
        "id": 2,
        "title": "Enterprise",
        "color": "#10b981"
      }
    ]
  }
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Forbidden. The authenticated user does not own this customer record.

  Example:

```json
{
  "message": "You are not authorized to view this customer"
}
```


- **404** — Customer not found.

  Example:

```json
{
  "message": "Customer not found",
  "back_text": "Back to Customer List",
  "back_url": "/customers"
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## GET `/customers/{customerId}/address`

**GET Get Customer Addresses**

Retrieve addresses for a customer, optionally filtered by address type. Results are sorted with the primary address first.

**Required permission:** `customers/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | string | no | Address type filter: billing or shipping (default: billing) |


**Responses**

- **200** — Successful response. Returns customer addresses.

  Schema (`application/json`):

  - `addresses` (array<object>)
    - _(object)_

  Example:

```json
{
  "addresses": [
    {
      "id": 25,
      "customer_id": 12,
      "is_primary": 1,
      "type": "billing",
      "status": "active",
      "label": "Office",
      "name": "Sarah Johnson",
      "address_1": "456 Market Street",
      "address_2": "Suite 300",
      "city": "San Francisco",
      "state": "CA",
      "postcode": "94102",
      "country": "US",
      "phone": "+1-415-555-0142",
      "email": "sarah.johnson@example.com",
      "meta": null,
      "created_at": "2025-06-10 09:15:00",
      "updated_at": "2025-09-20 14:30:00",
      "formatted_address": {
        "country": "United States",
        "state": "California",
        "city": "San Francisco",
        "postcode": "94102",
        "address_1": "456 Market Street",
        "address_2": "Suite 300",
        "type": "billing",
        "name": "Sarah Johnson",
        "company_name": "TechStart Inc.",
        "vat_number": "",
        "legal_registration_id": "",
        "label": "Office",
        "phone": "+1-415-555-0142",
        "full_address": "TechStart Inc., 456 Market Street, Suite 300, San Francisco, California, United States"
      },
      "company_name": "TechStart Inc.",
      "vat_number": "",
      "legal_registration_id": ""
    }
  ]
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`customers/view`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## GET `/customers/{customerId}/orders`

**GET Get Customer Orders**

Retrieve a paginated list of orders belonging to a specific customer. Supports the same filtering and sorting parameters as the main Orders list.

**Also used by the customer portal UI.** Retrieve a paginated list of orders for the specified customer. The customerId must match the logged-in user.

**Required permission:** `customers/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search orders by invoice number, customer name/email, or order item title |
| `per_page` | integer | no | Number of items per page (1-199, default: 10) |
| `page` | integer | no | Page number for pagination |
| `sort_by` | string | no | Column to sort by (default: id) |
| `sort_type` | string | no | Sort direction: asc or desc (default: desc) |
| `filter_type` | string | no | Filter mode: simple or advanced (default: simple) |
| `advanced_filters` | string | no | JSON-encoded array of advanced filter groups |
| `active_view` | string | no | Active tab filter (e.g., on-hold, paid, completed, processing) |


**Responses**

- **200** — Successful response. Returns a paginated list of customer orders.

  Schema (`application/json`):

  - `orders` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `data` (array<object>)
      - _(object)_

  Example:

```json
{
  "orders": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1,
    "data": [
      {
        "id": 42,
        "invoice_no": "INV-042",
        "customer_id": 12,
        "status": "completed",
        "payment_status": "paid",
        "payment_method": "stripe",
        "currency": "USD",
        "total_amount": 10692,
        "created_at": "2025-09-20 14:25:00"
      },
      {
        "id": 35,
        "invoice_no": "INV-035",
        "customer_id": 12,
        "status": "completed",
        "payment_status": "paid",
        "payment_method": "stripe",
        "currency": "USD",
        "total_amount": 7500,
        "created_at": "2025-08-05 11:30:00"
      },
      {
        "id": 28,
        "invoice_no": "INV-028",
        "customer_id": 12,
        "status": "processing",
        "payment_status": "paid",
        "payment_method": "paypal",
        "currency": "USD",
        "total_amount": 6708,
        "created_at": "2025-06-10 09:15:00"
      }
    ]
  }
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`customers/view`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## GET `/customers/get-stats/{customer}`

**GET Get Customer Stats**

Retrieve widget/stats data for a specific customer. Results are extensible via the fluent_cart/widgets/single_customer filter.

**Required permission:** `customers/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customer` | integer | yes | The customer ID |


**Responses**

- **200** — Successful response. Returns customer widget data.

  Schema (`application/json`):

  - `widgets` (array<object>) — Array of widget data populated by modules and extensions
    - _(object)_

  Example:

```json
{
  "widgets": [
    {
      "title": "Total Orders",
      "value": 3
    },
    {
      "title": "Completed Orders",
      "value": 2
    },
    {
      "title": "Pending Orders",
      "value": 1
    },
    {
      "title": "Total Spent",
      "value": 24900
    },
    {
      "title": "Average Order Value",
      "value": 8300
    },
    {
      "title": "First Order Date",
      "value": "2025-06-10 09:15:00"
    },
    {
      "title": "Last Order Date",
      "value": "2025-09-20 14:25:00"
    },
    {
      "title": "Active Subscriptions",
      "value": 1
    }
  ]
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`customers/view`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## GET `/customers`

**GET List Customers**

Retrieve a paginated list of customers with support for searching, sorting, and advanced filtering.

**Required permission:** `customers/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search by customer name, email, or ID. Supports operator syntax (e.g., `id=5`, `ltv>1000`). |
| `per_page` | integer | no | Number of items per page (1-199, default: 10) |
| `page` | integer | no | Page number for pagination |
| `sort_by` | string | no | Column to sort by. Must be a fillable field on the Customer model (default: `id`) |
| `sort_type` | string | no | Sort direction: `asc` or `desc` (default: `desc`) |
| `filter_type` | string | no | Filter mode: `simple` or `advanced` (default: `simple`) |
| `advanced_filters` | string | no | JSON-encoded array of advanced filter groups (Pro only). Supports filtering by order items, purchase count, purchase dates, customer name, email, LTV, and labels. |
| `with` | array<string> | no | Relationships to eager-load (e.g., `orders`, `labels`, `billing_address`, `shipping_address`) |
| `select` | string | no | Comma-separated column names or array of columns to select |
| `include_ids` | string | no | Comma-separated IDs or array of IDs that must be included in results |
| `active_view` | string | no | Active tab/view filter |
| `user_tz` | string | no | User timezone for date filter conversion |


**Responses**

- **200** — Successful response. Returns a paginated list of customers.

  Schema (`application/json`):

  - `customers` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `first_page_url` (string) — URL of the first page.
    - `from` (integer) — Index of the first item on this page.
    - `last_page_url` (string) — URL of the last page.
    - `links` (array<object>) — Pagination links (previous, numbered pages, next).
      - `url` (string)
      - `label` (string)
      - `active` (boolean)
    - `next_page_url` (string) — URL of the next page.
    - `path` (string) — Base URL without the query string.
    - `prev_page_url` (string) — URL of the previous page.
    - `to` (integer) — Index of the last item on this page.
    - `data` (array<object>)
      - _(object)_

  Example:

```json
{
  "customers": {
    "total": 150,
    "per_page": 10,
    "current_page": 1,
    "last_page": 15,
    "first_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/customers/?page=1",
    "from": 1,
    "last_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/customers/?page=15",
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/customers/?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/customers/?page=2",
        "label": "2",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/customers/?page=2",
        "label": "pagination.next",
        "active": false
      }
    ],
    "next_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/customers/?page=2",
    "path": "https://yoursite.com/wp-json/fluent-cart/v2/customers/",
    "prev_page_url": null,
    "to": 10,
    "data": [
      {
        "id": 12,
        "user_id": 5,
        "contact_id": null,
        "email": "sarah.johnson@example.com",
        "first_name": "Sarah",
        "last_name": "Johnson",
        "status": "active",
        "purchase_value": 24900,
        "purchase_count": 3,
        "ltv": 24900,
        "first_purchase_date": "2025-06-10 09:15:00",
        "last_purchase_date": "2025-09-20 14:25:00",
        "aov": 8300,
        "notes": "",
        "uuid": "cust_a1b2c3d4",
        "country": "US",
        "city": "San Francisco",
        "state": "CA",
        "postcode": "94102",
        "created_at": "2025-06-10 09:15:00",
        "updated_at": "2025-09-20 14:30:00",
        "full_name": "Sarah Johnson",
        "photo": "https://www.gravatar.com/avatar/abc123",
        "country_name": "United States",
        "formatted_address": "San Francisco, CA 94102, US",
        "user_link": "https://example.com/wp-admin/user-edit.php?user_id=5"
      }
    ]
  }
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`customers/view`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```



---

## POST `/customers/{customerId}/recalculate-ltv`

**POST Recalculate Lifetime Value**

Recalculate a customer's lifetime value (LTV) by summing net payments from all successful orders. Also updates purchase_count, first_purchase_date, last_purchase_date, and aov (average order value).

**Required permission:** `customers/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID |


**Responses**

- **200** — Lifetime value recalculated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `customer` (object)
    - _(object)_

  Example:

```json
{
  "message": "Lifetime value recalculated successfully",
  "customer": {
    "id": 12,
    "user_id": 5,
    "email": "sarah.johnson@example.com",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "full_name": "Sarah Johnson",
    "status": "active",
    "purchase_count": 3,
    "purchase_value": 24900,
    "ltv": 24900,
    "aov": 8300,
    "first_purchase_date": "2025-06-10 09:15:00",
    "last_purchase_date": "2025-09-20 14:25:00",
    "country": "US",
    "city": "San Francisco",
    "state": "CA",
    "postcode": "94102",
    "uuid": "cust_a1b2c3d4",
    "created_at": "2025-06-10 09:15:00",
    "updated_at": "2025-09-20 14:30:00"
  }
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`customers/manage`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **404** — Customer not found.

  Example:

```json
{
  "message": "Customer not found."
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## POST `/customers/{customerId}/address/make-primary`

**POST Set Primary Address**

Set a specific address as the primary address for its type. The previous primary address of the same type is automatically demoted.

**Also used by the customer portal UI.** Mark a specific address as the primary address for its type (billing or shipping). All other addresses of the same type are demoted.

**Required permission:** `customers/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID |


**Request body** (`application/json`, required)

- `address` (object) **required**
  - `id` (integer) **required** — The address record ID to set as primary
  - `type` (string) **required** _(enum: `billing`, `shipping`)_ — Address type: `billing` or `shipping`

Example:

```json
{
  "address": {
    "id": 5,
    "type": "billing"
  }
}
```


**Responses**

- **200** — Address set as primary successfully.

  Schema (`application/json`):

  - `message` (string)
  - `data` (string)

  Example:

```json
{
  "message": "Address successfully set as the primary",
  "data": ""
}
```


- **400** — Failed to set primary address.

  Example:

```json
{
  "code": 400,
  "message": "Address set as primary failed.",
  "data": ""
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Forbidden. The authenticated user does not own this address.

  Example:

```json
{
  "message": "You are not authorized to update this address"
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## PUT `/customers/{customerId}/additional-info`

**PUT Update Additional Info (Labels)**

Update a customer's labels/tags. Manages the label relationships for a customer by syncing provided label IDs with existing ones.

**Required permission:** `customers/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID |


**Request body** (`application/json`, required)

- `labels` (array<integer>) **required** — Array of label IDs to assign to the customer. Existing labels not in this array will be removed.

Example:

```json
{
  "labels": [
    1,
    2
  ]
}
```


**Responses**

- **200** — Customer labels updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object)
    - _(object)_

  Example:

```json
{
  "message": "Customer updated successfully!",
  "data": {
    "id": 12,
    "user_id": 5,
    "email": "sarah.johnson@example.com",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "full_name": "Sarah Johnson",
    "status": "active",
    "labels": [
      {
        "id": 1,
        "title": "VIP",
        "color": "#3b82f6"
      },
      {
        "id": 2,
        "title": "Enterprise",
        "color": "#10b981"
      }
    ]
  }
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Authenticated, but the user lacks the required capability (`customers/manage`).

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 403
  }
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## PUT `/customers/{customerId}/address`

**PUT Update Address**

Update an existing customer address by its address record ID. Optionally syncs changes to an associated order address.

**Also used by the customer portal UI.** Update an existing address for the authenticated customer. The address ID is passed in the request body.

**Required permission:** `customers/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID |


**Request body** (`application/json`, required)

- `address` (object)
  - `id` (integer) **required** — The address record ID to update
- `type` (string) **required** _(enum: `billing`, `shipping`)_ — Address type: `billing` or `shipping`
- `billing_label` (string) _(maxLength: 15)_ — Short label (max 15 characters, for billing type)
- `billing_name` (string) — Contact name (for billing type)
- `billing_address_1` (string) — Primary street address (for billing type)
- `billing_address_2` (string) — Secondary address line (for billing type)
- `billing_city` (string) — City (for billing type)
- `billing_state` (string) — State/province code (for billing type)
- `billing_postcode` (string) — Postal/zip code (for billing type)
- `billing_country` (string) — Country code (for billing type)
- `shipping_label` (string) _(maxLength: 15)_ — Short label (max 15 characters, for shipping type)
- `shipping_name` (string) — Contact name (for shipping type)
- `shipping_address_1` (string) — Primary street address (for shipping type)
- `shipping_address_2` (string) — Secondary address line (for shipping type)
- `shipping_city` (string) — City (for shipping type)
- `shipping_state` (string) — State/province code (for shipping type)
- `shipping_postcode` (string) — Postal/zip code (for shipping type)
- `shipping_country` (string) — Country code (for shipping type)

Example:

```json
{
  "type": "billing",
  "address": {
    "id": 5
  },
  "billing_name": "John Doe",
  "billing_address_1": "456 Oak Ave",
  "billing_city": "Boston",
  "billing_state": "MA",
  "billing_postcode": "02101",
  "billing_country": "US",
  "billing_label": "Work"
}
```


**Responses**

- **200** — Address updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object)
    - _(object)_

  Example:

```json
{
  "message": "Billing address updated successfully!",
  "data": {
    "id": 25,
    "customer_id": 12,
    "is_primary": 1,
    "type": "billing",
    "name": "Sarah Johnson",
    "address_1": "456 Market Street",
    "address_2": "Suite 500",
    "city": "San Francisco",
    "state": "CA",
    "postcode": "94102",
    "country": "US",
    "phone": "+1-415-555-0142",
    "email": "sarah.johnson@example.com",
    "company": "TechStart Inc.",
    "meta": null
  }
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Forbidden. The authenticated user does not own this address.

  Example:

```json
{
  "message": "You are not authorized to update this address"
}
```


- **404** — Address not found.

  Example:

```json
{
  "code": 404,
  "message": "Address not found, please reload the page and try again!",
  "data": ""
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---

## PUT `/customers/{customerId}`

**PUT Update Customer**

Update an existing customer. If the customer is linked to a WordPress user, the corresponding WP user profile is also updated.

**Also used by the customer portal UI.** Update the authenticated customer's profile details. The customerId must match the logged-in customer's record.

**Required permission:** `customers/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID |


**Request body** (`application/json`, required)

- `email` (string) **required** _(format: email; maxLength: 255)_ — Customer email address. Must be unique (excluding current customer).
- `first_name` (string) _(maxLength: 255)_ — Customer first name. Required when store is not configured for full name mode.
- `last_name` (string) _(maxLength: 255)_ — Customer last name.
- `full_name` (string) _(maxLength: 255)_ — Customer full name. Required when store is configured for full name mode.
- `city` (string) — Customer city
- `state` (string) — Customer state/province code
- `postcode` (string) — Customer postal/zip code
- `country` (string) — Customer country code
- `notes` (string) — Internal notes about the customer
- `status` (string) — Customer status
- `user_id` (integer) — WordPress user ID
- `aov` (string) — Average order value
- `user_url` (string) — Customer website URL
- `username` (string) — Username
- `user_nicename` (string) — User nicename
- `display_name` (string) — Display name

Example:

```json
{
  "first_name": "Sarah",
  "last_name": "Johnson",
  "email": "sarah.johnson@example.com",
  "city": "San Francisco",
  "state": "CA",
  "postcode": "94102",
  "country": "US",
  "notes": "Preferred contact method: email"
}
```


**Responses**

- **200** — Customer updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object)
    - _(object)_

  Example:

```json
{
  "message": "Customer updated successfully!",
  "data": {
    "id": 12,
    "user_id": 5,
    "contact_id": null,
    "email": "sarah.johnson@example.com",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "full_name": "Sarah Johnson",
    "status": "active",
    "purchase_value": 24900,
    "purchase_count": 3,
    "ltv": 24900,
    "aov": 8300,
    "country": "US",
    "city": "San Francisco",
    "state": "CA",
    "postcode": "94102",
    "notes": "Preferred contact method: email",
    "uuid": "cust_a1b2c3d4",
    "created_at": "2025-06-10 09:15:00",
    "updated_at": "2025-09-20 14:30:00"
  }
}
```


- **401** — Not authenticated. The request carried no valid WordPress credentials.

  Example:

```json
{
  "code": "rest_forbidden",
  "message": "Sorry, you are not allowed to do that.",
  "data": {
    "status": 401
  }
}
```


- **403** — Forbidden. The authenticated user does not own this customer record.

  Example:

```json
{
  "message": "You are not authorized to update this customer"
}
```


- **422** — Validation failed, or the referenced record does not exist.

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "This field is required."
    ]
  }
}
```



---
