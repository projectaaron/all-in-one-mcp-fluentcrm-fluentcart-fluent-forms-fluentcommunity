# FluentCart API — Order Bumps

5 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [API index](./README.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/order_bump`

**POST Create Order Bump**

Create a new order bump promotion. The order bump is created with minimal data (title and source variant) and can be fully configured via the Update endpoint.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `title` (string) **required** — Display title for the order bump.
- `src_object_id` (integer) **required** — The product variation ID that this order bump offers. Must reference an existing product variation.

Example:

```json
{
  "title": "Add Extended Warranty",
  "src_object_id": 42
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string) — Success message
  - `id` (integer) — The ID of the newly created order bump

  Example:

```json
{
  "message": "Order bump created successfully",
  "id": 5
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

## DELETE `/order_bump/{id}`

**DELETE Delete Order Bump**

Permanently delete an order bump.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The order bump ID. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string) — Success message

  Example:

```json
{
  "message": "Order bump deleted successfully"
}
```


- **400** — Error response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Failed to delete order bump"
}
```



---

## GET `/order_bump/{id}`

**GET Get Order Bump**

Retrieve detailed information about a specific order bump, including its configuration, conditions, and associated product variant.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The order bump ID. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `order_bump` (OrderBumpDetail)
  - `variant` (ProductVariant)

  Example:

```json
{
  "order_bump": {
    "id": 1,
    "hash": "a1b2c3d4e5f6...",
    "parent_id": null,
    "type": "order_bump",
    "status": "active",
    "src_object_id": 42,
    "src_object_type": null,
    "title": "Add Extended Warranty",
    "description": "<p>Protect your purchase with our 2-year warranty plan.</p>",
    "conditions": [
      {
        "type": "product",
        "operator": "in",
        "values": [
          10,
          15
        ]
      }
    ],
    "config": {
      "discount": {
        "discount_type": "percentage",
        "discount_amount": 10
      },
      "display_conditions_if": "",
      "call_to_action": "Yes, add warranty!"
    },
    "priority": 1,
    "created_at": "2025-06-01 10:00:00",
    "updated_at": "2025-06-15 14:30:00"
  },
  "variant": {
    "id": 42,
    "product_id": 10,
    "title": "Extended Warranty - 2 Year",
    "price": 2999,
    "product": {
      "id": 10,
      "title": "Extended Warranty",
      "status": "publish"
    }
  }
}
```


- **404** — Order bump not found

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Order bump not found"
}
```



---

## GET `/order_bump`

**GET List Order Bumps**

Retrieve a paginated list of order bumps with optional filtering, sorting, and search.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sort_by` | string | no | Column to sort by. |
| `sort_type` | string | no | Sort direction. |
| `active_view` | string | no | Filter by status tab. |
| `search` | string | no | Search by order bump title or description. Partial matches supported. |
| `page` | integer | no | Page number for pagination. |
| `per_page` | integer | no | Number of records per page. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `order_bumps` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `data` (array<OrderBumpListItem>)

  Example:

```json
{
  "order_bumps": {
    "total": 5,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "data": [
      {
        "id": 1,
        "hash": "a1b2c3d4e5f6...",
        "parent_id": null,
        "type": "order_bump",
        "status": "active",
        "src_object_id": 42,
        "src_object_type": null,
        "title": "Add Extended Warranty",
        "description": "<p>Protect your purchase with our 2-year warranty plan.</p>",
        "conditions": [
          {
            "type": "cart_products",
            "operator": "contains",
            "value": [
              123,
              124
            ]
          },
          {
            "type": "cart_total",
            "operator": "greater_than",
            "value": 2500
          }
        ],
        "config": {
          "discount": {
            "discount_type": "percentage",
            "discount_amount": 10
          },
          "display_conditions_if": "",
          "call_to_action": "Yes, add warranty!"
        },
        "priority": 1,
        "created_at": "2025-06-01 10:00:00",
        "updated_at": "2025-06-15 14:30:00",
        "product_variant": {
          "id": 42,
          "product_id": 10,
          "title": "Extended Warranty - 2 Year",
          "price": 2999,
          "product": {
            "id": 10,
            "title": "Extended Warranty",
            "status": "publish"
          }
        }
      }
    ]
  }
}
```



---

## PUT `/order_bump/{id}`

**PUT Update Order Bump**

Update an existing order bump's configuration, conditions, status, and display settings.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The order bump ID. |


**Request body** (`application/json`, required)

- `title` (string) **required** _(maxLength: 194)_ — Display title. Max 194 characters.
- `src_object_id` (integer) **required** — Product variation ID for the bump offer.
- `status` (string) _(enum: `active`, `draft`; maxLength: 50)_ — Order bump status.
- `src_object_type` (string) _(maxLength: 50)_ — Source object type identifier.
- `description` (string) — HTML description displayed to the customer. Sanitized with wp_kses_post.
- `config` (object) — Configuration object.
  - `discount` (object)
    - `discount_type` (string) _(enum: `percentage`, `fixed`)_ — Discount type.
    - `discount_amount` (number) — Discount amount. For percentage: value 0-100. For fixed: amount in cents.
  - `display_conditions_if` (string) — Logical operator for combining conditions.
  - `call_to_action` (string) — Button or checkbox text shown to the customer.
- `conditions` (array<object>) — Array of display condition objects that control when the order bump is displayed during checkout.
  - _(object)_
- `priority` (integer) _(min: 1)_ — Display priority. Lower numbers appear first.

Example:

```json
{
  "title": "Add Extended Warranty",
  "src_object_id": 42,
  "status": "active",
  "description": "<p>Protect your purchase with our 2-year extended warranty.</p>",
  "priority": 1,
  "config": {
    "discount": {
      "discount_type": "percentage",
      "discount_amount": 10
    },
    "display_conditions_if": "",
    "call_to_action": "Yes, add warranty!"
  },
  "conditions": [
    {
      "type": "cart_products",
      "operator": "contains",
      "value": [
        123,
        124
      ]
    },
    {
      "type": "cart_total",
      "operator": "greater_than",
      "value": 2500
    }
  ]
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string) — Success message

  Example:

```json
{
  "message": "Order bump updated successfully"
}
```


- **400** — Error response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Failed to update order bump"
}
```



---
