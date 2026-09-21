# FluentCart API — Orders

32 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/orders/{order}/transactions/{transaction_id}/accept-dispute`

**POST Accept Dispute**

Accept a payment dispute (chargeback) for a specific transaction.

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Order ID |
| `transaction_id` | integer | yes | Transaction ID with the dispute |


**Request body** (`application/json`)

- `dispute_note` (string) — Note about the dispute acceptance

Example:

```json
{
  "dispute_note": "Customer provided valid reason for dispute"
}
```


**Responses**

- **200** — Dispute accepted successfully.

  Schema (`application/json`):

  - `message` (string) — Success message

  Example:

```json
{
  "message": "Dispute accepted!"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/manage`).

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

## POST `/orders/do-bulk-action`

**POST Bulk Actions**

Perform bulk actions on multiple orders at once.

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `action` (string) **required** _(enum: `delete_orders`, `change_shipping_status`, `change_order_status`, `capture_payments`, `change_payment_status`)_ — Bulk action to perform
- `order_ids` (array<integer>) **required** — Array of order IDs to act upon
- `new_status` (string) — New status value. Required for `change_shipping_status`, `change_order_status`, and `change_payment_status` actions
- `manage_stock` (string) — Whether to manage stock on status change (`true`/`false`)

Example:

```json
{
  "action": "change_order_status",
  "order_ids": [
    1,
    2,
    3
  ],
  "new_status": "processing"
}
```


**Responses**

- **200** — Bulk action performed successfully.

  Schema (`application/json`):

  - `message` (string) — Success message

  Example:

```json
{
  "message": "Order Status has been changed for the selected orders"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/manage`).

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

## POST `/orders/calculate-shipping`

**POST Calculate Shipping**

Calculate shipping charges for order items with a specific shipping method.

**Required permissions:** all of `orders/create`, `orders/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `order_items` (array<object>) **required** — Array of order items, each with `id` (variation ID) and `quantity`
  - `id` (integer) — Variation ID
  - `quantity` (integer) — Item quantity
- `shipping_id` (integer) **required** — ID of the shipping method to calculate charges for

Example:

```json
{
  "order_items": [
    {
      "id": 1,
      "quantity": 2
    }
  ],
  "shipping_id": 5
}
```


**Responses**

- **200** — Shipping calculated successfully.

  Schema (`application/json`):

  - `message` (string) — Success message
  - `shipping_charge` (integer) — Total shipping charge in cents
  - `order_items` (object) — Order items keyed by ID with calculated shipping
    - _(object)_

  Example:

```json
{
  "message": "Shipping updated",
  "shipping_charge": 500,
  "order_items": {
    "1": {
      "id": 1,
      "quantity": 2,
      "shipping_charge": 500,
      "unit_price": 2500,
      "other_info": {
        "weight": 1.5,
        "dimensions": "10x8x4"
      },
      "discount_total": 0,
      "fulfillment_type": "physical"
    }
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


- **403** — Authenticated, but the user lacks the required capability (`orders/create, orders/manage`).

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

## POST `/orders/{order_id}/change-customer`

**POST Change Customer**

Reassign an order to a different existing customer. Updates all connected orders (parent/child/renewals), subscriptions, and customer statistics.

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order_id` | integer | yes | Order ID |


**Request body** (`application/json`, required)

- `customer_id` (integer) **required** — New customer ID to assign

Example:

```json
{
  "customer_id": 15
}
```


**Responses**

- **200** — Customer changed successfully.

  Schema (`application/json`):

  - `message` (string) — Success message

  Example:

```json
{
  "message": "Customer changed successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/manage`).

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


- **423** — Validation error.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Customer id is required"
}
```



---

## POST `/orders/{order_id}/create-and-change-customer`

**POST Create and Change Customer**

Create a new customer and immediately assign them to the order. Combines customer creation with order reassignment.

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order_id` | integer | yes | Order ID |


**Request body** (`application/json`, required)

- `first_name` (string) — Customer first name (max 255 chars). Required if full name mode is disabled
- `last_name` (string) — Customer last name (max 255 chars)
- `full_name` (string) — Customer full name (max 255 chars). Required if full name mode is enabled
- `email` (string) **required** _(format: email)_ — Customer email address (max 255 chars, must be unique)
- `city` (string) — Customer city
- `user_id` (integer) — WordPress user ID to link
- `status` (string) — Customer status
- `country` (string) — Customer country
- `state` (string) — Customer state
- `postcode` (string) — Customer postal code
- `notes` (string) — Customer notes

Example:

```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com"
}
```


**Responses**

- **200** — Customer created and assigned successfully.

  Schema (`application/json`):

  - `message` (string) — Success message

  Example:

```json
{
  "message": "Customer changed successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/manage`).

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


- **422** — Validation error.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Email is required"
}
```



---

## POST `/orders/{order}/create-custom`

**POST Create Custom Order Item**

Add a custom product/item to an existing order.

**Required permission:** `orders/create`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Order ID |


**Request body** (`application/json`, required)

- `product` (object) **required** — Product data to add as a custom item
  - `title` (string) — Custom item title
  - `price` (number) — Item price in cents
  - `quantity` (integer) — Item quantity

Example:

```json
{
  "product": {
    "title": "Custom Service",
    "price": 1500,
    "quantity": 1
  }
}
```


**Responses**

- **200** — Custom item added successfully.

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "message": "Custom item added successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/create`).

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


- **423** — Error processing custom item.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Error processing custom item"
}
```



---

## POST `/orders`

**POST Create Order**

Create a new order manually from the admin panel.

**Required permission:** `orders/create`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `customer_id` (integer) **required** — ID of the customer placing the order
- `order_items` (array<object>) **required** — Array of order items
  - `id` (integer) — Order item ID (for updates)
  - `order_id` (integer) — Parent order ID
  - `post_id` (integer) — WordPress post ID of the product
  - `variation_id` (integer) — Product variation ID
  - `object_id` (integer) — Object reference ID
  - `fulfillment_type` (string) — `digital` or `physical`
  - `payment_type` (string) — Payment type (max 100 chars), e.g., `subscription`
  - `quantity` (integer) _(min: 1)_ — Item quantity (min: 1)
  - `post_title` (string) — Product title (max 255 chars)
  - `title` (string) — Item title (max 255 chars)
  - `price` (number) — Item price in cents
  - `unit_price` (number) — Unit price in cents
  - `shipping_charge` (number) — Shipping charge in cents
  - `item_cost` (number) — Item cost in cents
  - `item_total` (number) — Item total in cents
  - `tax_amount` (number) — Tax amount in cents
  - `discount_total` (number) — Discount total in cents
  - `total` (number) — Total in cents
  - `line_total` (number) — Line total in cents
  - `cart_index` (integer) — Cart position index
  - `rate` (number) — Exchange rate
  - `line_meta` (array<object>) — Line item metadata
    - _(object)_
  - `other_info` (object) — Additional item information
    - _(object)_
- `status` (string) — Order status (max 50 chars)
- `invoice_no` (string) — Invoice number (max 100 chars)
- `fulfillment_type` (string) — Fulfillment type (max 50 chars)
- `type` (string) — Order type (max 50 chars)
- `payment_method` (string) — Payment method key (max 50 chars)
- `payment_method_title` (string) — Payment method display title (max 50 chars)
- `payment_status` (string) — Payment status (max 50 chars)
- `currency` (string) — Currency code, e.g., `USD` (max 10 chars)
- `subtotal` (number) — Order subtotal in cents
- `discount_tax` (number) — Discount tax amount in cents
- `manual_discount_total` (number) — Manual discount total in cents
- `coupon_discount_total` (number) — Coupon discount total in cents
- `shipping_tax` (number) — Shipping tax in cents
- `shipping_total` (number) — Shipping total in cents
- `tax_total` (number) — Tax total in cents
- `total_amount` (number) — Total order amount in cents
- `rate` (number) — Exchange rate
- `note` (string) — Order note (max 5000 chars)
- `uuid` (string) — Order UUID (max 100 chars)
- `ip_address` (string) — Customer IP address (max 100 chars)
- `completed_at` (string) — Completion timestamp (max 100 chars)
- `refunded_at` (string) — Refund timestamp (max 100 chars)
- `user_tz` (string) — User timezone (max 50 chars)
- `discount` (object) — Manual discount details
  - `type` (string) — Discount type (max 100 chars)
  - `value` (number) — Discount value
  - `label` (string) — Discount label (max 100 chars)
  - `reason` (string) — Discount reason (max 100 chars)
  - `action` (string) — Discount action (max 100 chars)
- `shipping` (array<object>) — Shipping method details
  - `type` (string) — Shipping type (max 100 chars)
  - `rate_name` (string) — Shipping rate name (max 100 chars)
  - `custom_price` (number) — Custom shipping price in cents
- `applied_coupon` (array<object>) — Applied coupon details
  - `id` (integer) — Applied coupon record ID
  - `order_id` (integer) — Order ID
  - `coupon_id` (integer) — Coupon ID (min: 1)
  - `code` (string) — Coupon code (max 100 chars)
  - `amount` (number) — Coupon amount
  - `discounted_amount` (number) — Discounted amount in cents
  - `discount` (number) — Discount value
  - `stackable` (integer) — Whether coupon is stackable (0 or 1)
  - `priority` (integer) — Coupon priority
  - `max_uses` (integer) — Maximum uses
  - `use_count` (integer) — Current use count
  - `max_per_customer` (integer) — Max uses per customer (min: 1)
  - `min_purchase_amount` (number) — Minimum purchase amount in cents
  - `max_discount_amount` (number) — Maximum discount amount in cents
  - `notes` (string) — Coupon notes (max 100 chars)
- `trigger` (string) — Trigger source

Example:

```json
{
  "customer_id": 1,
  "order_items": [
    {
      "post_id": 10,
      "variation_id": 5,
      "object_id": 5,
      "quantity": 1,
      "unit_price": 2500,
      "price": 2500,
      "item_total": 2500,
      "total": 2500,
      "line_total": 2500,
      "title": "Pro License"
    }
  ],
  "subtotal": 2500,
  "total_amount": 2500,
  "payment_method": "offline_payment"
}
```


**Responses**

- **200** — Order created successfully.

  Schema (`application/json`):

  - `message` (string) — Success message
  - `order_id` (integer) — Created order ID
  - `uuid` (string) — Created order UUID

  Example:

```json
{
  "message": "Order created successfully!",
  "order_id": 42,
  "uuid": "abc123-def456-ghi789"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/create`).

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

## DELETE `/orders/{order_id}`

**DELETE Delete Order**

Permanently delete an order and all associated data (transactions, items, meta, addresses, coupons, cart data, download permissions, labels). For subscription orders, also deletes all child renewal orders and subscriptions.

**Required permission:** `orders/delete`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order_id` | integer | yes | Order ID to delete |


**Responses**

- **200** — Order deleted successfully.

  Schema (`application/json`):

  - `message` (string) — Success message
  - `data` (object)
    - `order_id` (integer) — Deleted order ID
    - `invoice_no` (string) — Invoice number
    - `status` (string) — Deletion status
  - `errors` (array<string>) — Array of error messages (empty on success)

  Example:

```json
{
  "message": "Order 42 deleted successfully",
  "data": {
    "order_id": 42,
    "invoice_no": "INV-042",
    "status": "success"
  },
  "errors": []
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


- **403** — Authenticated, but the user lacks the required capability (`orders/delete`).

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


- **404** — Order not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Order not found"
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

## POST `/orders/{order}/generate-missing-licenses`

**POST Generate Missing Licenses**

Generate any missing license keys for an order's items (requires Pro with licensing module).

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Order ID |


**Responses**

- **200** — Missing licenses generated successfully.

  Schema (`application/json`):

  - `message` (string) — Success message

  Example:

```json
{
  "message": "Missing licenses generated successfully"
}
```


- **400** — No missing licenses found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "No missing licenses found!"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/manage`).

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


- **404** — Order not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Order not found"
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

## GET `/orders/{order_id}`

**GET Get Order Details**

Retrieve detailed information about a specific order, including items, transactions, addresses, subscriptions, and activities.

**Required permission:** `orders/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order_id` | integer | yes | Order ID |


**Responses**

- **200** — Successful response. Returns detailed order information.

  Schema (`application/json`):

  - `order` (object) — Full order object with relations
    - _(object)_
  - `discount_meta` (object) — Discount metadata
    - _(object)_
  - `shipping_meta` (object) — Shipping metadata
    - _(object)_
  - `order_settings` (object) — Order settings
    - _(object)_
  - `selected_labels` (array<integer>) — Array of selected label IDs
  - `tax_id` (integer) — Tax ID if applicable
  - `checkout_shipping` (object) — Shipping option selected at checkout, if any
    - _(object)_
  - `can_send_payment_reminder` (boolean) — Whether a payment reminder can currently be sent for this order

  Example:

```json
{
  "order": {
    "id": 42,
    "uuid": "ord_a1b2c3d4e5f6",
    "invoice_no": "INV-042",
    "receipt_number": "RCP-042",
    "status": "completed",
    "parent_id": null,
    "fulfillment_type": "digital",
    "type": "payment",
    "customer_id": 12,
    "payment_method": "stripe",
    "payment_method_title": "Credit Card (Stripe)",
    "payment_status": "paid",
    "currency": "USD",
    "subtotal": 9900,
    "discount_tax": 0,
    "manual_discount_total": 0,
    "coupon_discount_total": 0,
    "shipping_tax": 0,
    "shipping_total": 0,
    "tax_total": 792,
    "tax_behavior": "exclusive",
    "total_amount": 10692,
    "rate": 1,
    "note": "",
    "ip_address": "203.0.113.42",
    "completed_at": "2025-09-20 14:25:30",
    "refunded_at": null,
    "total_refund": 0,
    "total_paid": 10692,
    "mode": "live",
    "shipping_status": "unfulfilled",
    "customer": {
      "id": 12,
      "user_id": 5,
      "email": "sarah.johnson@example.com",
      "first_name": "Sarah",
      "last_name": "Johnson",
      "full_name": "Sarah Johnson",
      "status": "active",
      "photo": "https://www.gravatar.com/avatar/example",
      "purchase_value": 24900,
      "purchase_count": 3,
      "ltv": 24900,
      "country": "US",
      "city": "San Francisco",
      "state": "CA",
      "postcode": "94102",
      "country_name": "United States",
      "uuid": "cust_a1b2c3d4",
      "created_at": "2025-06-10 09:15:00",
      "updated_at": "2025-09-20 14:30:00"
    },
    "order_items": [
      {
        "id": 101,
        "order_id": 42,
        "post_id": 123,
        "post_title": "Developer Toolkit Pro",
        "title": "Developer Toolkit Pro - Annual License",
        "object_id": 456,
        "object_type": "product_variation",
        "cart_index": 0,
        "quantity": 1,
        "unit_price": 9900,
        "cost": 9900,
        "subtotal": 9900,
        "tax_amount": 792,
        "discount_total": 0,
        "refund_total": 0,
        "line_total": 10692,
        "rate": 1,
        "payment_type": "onetime",
        "fulfillment_type": "digital",
        "fulfilled_quantity": 0,
        "created_at": "2025-09-20 14:25:00"
      }
    ],
    "transactions": [
      {
        "id": 78,
        "order_id": 42,
        "vendor_charge_id": "ch_3PxKE2JY8q",
        "payment_method": "stripe",
        "payment_mode": "live",
        "payment_method_type": "card",
        "currency": "USD",
        "transaction_type": "payment",
        "card_last_4": "4242",
        "card_brand": "visa",
        "status": "paid",
        "total": 10692,
        "uuid": "txn_f7e8d9c0",
        "url": "https://example.com/order-receipt/?order_hash=abc123",
        "created_at": "2025-09-20 14:25:30"
      }
    ],
    "billing_address": {
      "id": 55,
      "order_id": 42,
      "type": "billing",
      "name": "Sarah Johnson",
      "first_name": "Sarah",
      "last_name": "Johnson",
      "email": "sarah.johnson@example.com",
      "phone": "+1-415-555-0142",
      "company_name": "TechStart Inc.",
      "address_1": "456 Market Street",
      "address_2": "Suite 300",
      "city": "San Francisco",
      "state": "CA",
      "postcode": "94102",
      "country": "US",
      "formatted_address": "456 Market Street, Suite 300, San Francisco, CA 94102, US"
    },
    "shipping_address": {
      "id": 56,
      "order_id": 42,
      "type": "shipping",
      "name": "Sarah Johnson",
      "first_name": "Sarah",
      "last_name": "Johnson",
      "address_1": "456 Market Street",
      "address_2": "Suite 300",
      "city": "San Francisco",
      "state": "CA",
      "postcode": "94102",
      "country": "US",
      "formatted_address": "456 Market Street, Suite 300, San Francisco, CA 94102, US"
    },
    "subscriptions": [
      {
        "id": 15,
        "customer_id": 12,
        "parent_order_id": 42,
        "product_id": 123,
        "item_name": "Developer Toolkit Pro - Annual License",
        "variation_id": 456,
        "billing_interval": "yearly",
        "recurring_amount": 9900,
        "recurring_total": 10692,
        "status": "active",
        "next_billing_date": "2026-09-20 14:25:00",
        "created_at": "2025-09-20 14:25:00"
      }
    ],
    "activities": [
      {
        "id": 200,
        "title": "Order completed",
        "content": "Payment received via Stripe",
        "status": "info",
        "created_at": "2025-09-20 14:25:30"
      }
    ],
    "labels": [
      {
        "id": 1,
        "title": "VIP",
        "color": "#3b82f6"
      }
    ],
    "applied_coupons": [
      {
        "id": 8,
        "order_id": 42,
        "coupon_id": 3,
        "code": "WELCOME20",
        "amount": 1980
      }
    ],
    "children": [],
    "parent_order": null,
    "order_operation": {
      "id": 42,
      "order_id": 42,
      "total_commission": 0,
      "created_at": "2025-09-20 14:25:00"
    },
    "receipt_url": "https://example.com/receipt/?order_hash=abc123",
    "custom_checkout_url": "https://example.com/checkout/?payment_hash=abc123def456",
    "has_missing_licenses": false,
    "created_at": "2025-09-20 14:25:00",
    "updated_at": "2025-09-20 14:25:30"
  },
  "discount_meta": {
    "type": "",
    "value": 0,
    "label": "",
    "reason": ""
  },
  "shipping_meta": {
    "type": "none",
    "rate_name": "",
    "custom_price": 0
  },
  "order_settings": {
    "is_tax_enabled": true,
    "tax_behavior": "exclusive"
  },
  "selected_labels": [
    1
  ],
  "tax_id": null,
  "checkout_shipping": null,
  "can_send_payment_reminder": false
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


- **403** — Authenticated, but the user lacks the required capability (`orders/view`).

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

## GET `/orders/{order}/transactions`

**GET Get Order Transactions**

Retrieve all transactions for an order. Returns the full order details (same as Get Order Details), which includes the transactions relation.

**Required permission:** `orders/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Order ID |


**Responses**

- **200** — Successful response. Returns full order details with transactions.

  Schema (`application/json`):

  - `order` (object) — Full order object with relations including transactions
    - _(object)_
  - `discount_meta` (object) — Discount metadata
    - _(object)_
  - `shipping_meta` (object) — Shipping metadata
    - _(object)_
  - `order_settings` (object) — Order settings
    - _(object)_
  - `selected_labels` (array<integer>) — Array of selected label IDs
  - `tax_id` (integer) — Tax ID if applicable
  - `checkout_shipping` (object) — Shipping option selected at checkout, if any
    - _(object)_
  - `can_send_payment_reminder` (boolean) — Whether a payment reminder can currently be sent for this order

  Example:

```json
{
  "order": {
    "id": 42,
    "uuid": "ord_a1b2c3d4e5f6",
    "invoice_no": "INV-042",
    "receipt_number": "RCP-042",
    "status": "completed",
    "parent_id": null,
    "fulfillment_type": "digital",
    "type": "payment",
    "customer_id": 12,
    "payment_method": "stripe",
    "payment_method_title": "Credit Card (Stripe)",
    "payment_status": "paid",
    "currency": "USD",
    "subtotal": 9900,
    "discount_tax": 0,
    "manual_discount_total": 0,
    "coupon_discount_total": 0,
    "shipping_tax": 0,
    "shipping_total": 0,
    "tax_total": 792,
    "total_amount": 10692,
    "rate": 1,
    "note": "",
    "ip_address": "203.0.113.42",
    "completed_at": "2025-09-20 14:25:30",
    "refunded_at": null,
    "total_refund": 0,
    "total_paid": 10692,
    "mode": "live",
    "shipping_status": "unfulfilled",
    "transactions": [
      {
        "id": 78,
        "order_id": 42,
        "vendor_charge_id": "ch_3PxKE2JY8q",
        "payment_method": "stripe",
        "payment_mode": "live",
        "payment_method_type": "card",
        "currency": "USD",
        "transaction_type": "payment",
        "card_last_4": "4242",
        "card_brand": "visa",
        "status": "paid",
        "total": 10692,
        "uuid": "txn_f7e8d9c0",
        "url": "https://example.com/order-receipt/?order_hash=abc123",
        "created_at": "2025-09-20 14:25:30"
      }
    ],
    "created_at": "2025-09-20 14:25:00",
    "updated_at": "2025-09-20 14:25:30"
  },
  "discount_meta": {
    "type": "",
    "value": 0,
    "label": "",
    "reason": ""
  },
  "shipping_meta": {
    "type": "none",
    "rate_name": "",
    "custom_price": 0
  },
  "order_settings": {
    "is_tax_enabled": true,
    "tax_behavior": "exclusive"
  },
  "selected_labels": [
    1
  ],
  "tax_id": null,
  "checkout_shipping": null,
  "can_send_payment_reminder": false
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


- **403** — Authenticated, but the user lacks the required capability (`orders/view`).

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

## GET `/orders/shipping_methods`

**GET Get Shipping Methods**

Retrieve available shipping methods, optionally filtered by country and state. Returns methods applicable to the specified location and all other enabled methods separately.

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `country_code` | string | no | Country code to filter applicable shipping methods (e.g., `US`, `GB`) |
| `state` | string | no | State/province code for more specific filtering |
| `order_items` | array<object> | no | Array of order items (each with `id` and `quantity`) to calculate shipping charges |


**Responses**

- **200** — Successful response. Returns shipping methods.

  Schema (`application/json`):

  - `shipping_methods` (array<object>) — Shipping methods applicable to the specified location
    - `id` (integer) — Shipping method ID
    - `title` (string) — Shipping method title
    - `is_enabled` (string) — Whether the method is enabled
    - `shipping_charge` (integer) — Shipping charge in cents
  - `other_shipping_methods` (array<object>) — All other enabled shipping methods
    - `id` (integer) — Shipping method ID
    - `title` (string) — Shipping method title
    - `is_enabled` (string) — Whether the method is enabled
    - `shipping_charge` (integer) — Shipping charge in cents

  Example:

```json
{
  "shipping_methods": [
    {
      "id": 1,
      "title": "Standard Shipping",
      "is_enabled": "1",
      "shipping_charge": 500
    }
  ],
  "other_shipping_methods": [
    {
      "id": 2,
      "title": "International Shipping",
      "is_enabled": "1",
      "shipping_charge": 1500
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


- **403** — Authenticated, but the user lacks the required capability (`orders/manage`).

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

## GET `/orders/{id}/transactions/{transaction_id}`

**GET Get Single Transaction**

Retrieve details of a specific transaction within an order. Returns the full order details (same as Get Order Details).

**Required permission:** `orders/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Order ID |
| `transaction_id` | integer | yes | Transaction ID |


**Responses**

- **200** — Successful response. Returns full order details.

  Schema (`application/json`):

  - `order` (object) — Full order object with relations
    - _(object)_
  - `discount_meta` (object) — Discount metadata
    - _(object)_
  - `shipping_meta` (object) — Shipping metadata
    - _(object)_
  - `order_settings` (object) — Order settings
    - _(object)_
  - `selected_labels` (array<integer>) — Array of selected label IDs
  - `tax_id` (integer) — Tax ID if applicable
  - `checkout_shipping` (object) — The shipping method/rate selected at checkout, if the order has shipping. Null for orders without a shipping component.
    - _(object)_
  - `can_send_payment_reminder` (boolean) — Whether a manual payment reminder can currently be sent for this order (e.g. order is unpaid/past due and reminders are applicable).

  Example:

```json
{
  "order": {
    "id": 42,
    "uuid": "ord_a1b2c3d4e5f6",
    "invoice_no": "INV-042",
    "receipt_number": "RCP-042",
    "status": "completed",
    "parent_id": null,
    "fulfillment_type": "digital",
    "type": "payment",
    "customer_id": 12,
    "payment_method": "stripe",
    "payment_method_title": "Credit Card (Stripe)",
    "payment_status": "paid",
    "currency": "USD",
    "subtotal": 9900,
    "discount_tax": 0,
    "manual_discount_total": 0,
    "coupon_discount_total": 0,
    "shipping_tax": 0,
    "shipping_total": 0,
    "tax_total": 792,
    "total_amount": 10692,
    "rate": 1,
    "note": "",
    "ip_address": "203.0.113.42",
    "completed_at": "2025-09-20 14:25:30",
    "refunded_at": null,
    "total_refund": 0,
    "total_paid": 10692,
    "mode": "live",
    "shipping_status": "unfulfilled",
    "transactions": [
      {
        "id": 78,
        "order_id": 42,
        "vendor_charge_id": "ch_3PxKE2JY8q",
        "payment_method": "stripe",
        "payment_mode": "live",
        "payment_method_type": "card",
        "currency": "USD",
        "transaction_type": "payment",
        "card_last_4": "4242",
        "card_brand": "visa",
        "status": "paid",
        "total": 10692,
        "uuid": "txn_f7e8d9c0",
        "url": "https://example.com/order-receipt/?order_hash=abc123",
        "created_at": "2025-09-20 14:25:30"
      }
    ],
    "created_at": "2025-09-20 14:25:00",
    "updated_at": "2025-09-20 14:25:30"
  },
  "discount_meta": {
    "type": "",
    "value": 0,
    "label": "",
    "reason": ""
  },
  "shipping_meta": {
    "type": "none",
    "rate_name": "",
    "custom_price": 0
  },
  "order_settings": {
    "is_tax_enabled": true,
    "tax_behavior": "exclusive"
  },
  "selected_labels": [
    1
  ],
  "tax_id": null,
  "checkout_shipping": null,
  "can_send_payment_reminder": false
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


- **403** — Authenticated, but the user lacks the required capability (`orders/view`).

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

## GET `/orders`

**GET List Orders**

Retrieve a paginated list of orders with optional filtering, sorting, and search.

**Required permission:** `orders/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | no | Page number for pagination |
| `per_page` | integer | no | Number of records per page (default: 10, max: 200) |
| `search` | string | no | Search term. Searches invoice number, customer name/email, and order item titles. Also supports operator syntax (e.g., `status = completed`, `id > 5`, `id :: 1-10`) |
| `sort_by` | string | no | Column to sort by (default: `id`). Must be a fillable column on the Order model |
| `sort_type` | string | no | Sort direction: `asc` or `desc` (default: `desc`) |
| `active_view` | string | no | Tab filter for quick views |
| `filter_type` | string | no | Filter mode: `simple` (default) or `advanced` |
| `advanced_filters` | string | no | JSON-encoded array of advanced filter groups (requires Pro). Supports filtering by order properties, customer properties, transaction properties, license properties, and UTM properties |
| `with` | string | no | Eager-load relations. Supports relation names and `{relation}Count` for counts |
| `select` | string | no | Comma-separated list of columns to select |
| `include_ids` | string | no | Comma-separated IDs that must always be included in results |
| `limit` | integer | no | Limit number of records (used with non-paginated queries) |
| `offset` | integer | no | Offset for records |
| `user_tz` | string | no | User timezone for date filtering (e.g., `America/New_York`) |
| `payment_statuses` | array<string> | no | Filter by payment statuses |
| `order_statuses` | array<string> | no | Filter by order statuses |
| `shipping_statuses` | array<string> | no | Filter by shipping statuses |


**Responses**

- **200** — Successful response. Returns a paginated list of orders.

  Schema (`application/json`):

  - `orders` (object) — Paginated response
    - `current_page` (integer) — Current page number
    - `first_page_url` (string) — URL of the first page
    - `from` (integer) — Index of first item on this page
    - `last_page_url` (string) — URL of the last page
    - `links` (array<object>) — Pagination links (previous, page numbers, next)
      - `url` (string)
      - `label` (string)
      - `active` (boolean)
    - `next_page_url` (string) — URL of the next page
    - `path` (string) — Base URL without query string
    - `prev_page_url` (string) — URL of the previous page
    - `to` (integer) — Index of last item on this page
    - `data` (array<object>) — Array of order objects
      - _(object)_
    - `per_page` (integer) — Items per page
    - `total` (integer) — Total number of records
    - `last_page` (integer) — Last page number

  Example:

```json
{
  "orders": {
    "current_page": 1,
    "first_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/orders/?page=1",
    "from": 1,
    "last_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/orders/?page=10",
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/orders/?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/orders/?page=2",
        "label": "2",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/orders/?page=2",
        "label": "pagination.next",
        "active": false
      }
    ],
    "next_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/orders/?page=2",
    "path": "https://yoursite.com/wp-json/fluent-cart/v2/orders",
    "prev_page_url": null,
    "to": 10,
    "data": [
      {
        "id": 42,
        "uuid": "ord_a1b2c3d4e5f6",
        "invoice_no": "INV-042",
        "receipt_number": "RCP-042",
        "status": "completed",
        "parent_id": null,
        "fulfillment_type": "digital",
        "type": "payment",
        "customer_id": 12,
        "payment_method": "stripe",
        "payment_method_title": "Credit Card (Stripe)",
        "payment_status": "paid",
        "currency": "USD",
        "subtotal": 9900,
        "discount_tax": 0,
        "manual_discount_total": 0,
        "coupon_discount_total": 0,
        "shipping_tax": 0,
        "shipping_total": 0,
        "tax_total": 792,
        "total_amount": 10692,
        "rate": 1,
        "total_refund": 0,
        "total_paid": 10692,
        "mode": "live",
        "shipping_status": "unfulfilled",
        "customer": {
          "id": 12,
          "user_id": 5,
          "email": "sarah.johnson@example.com",
          "first_name": "Sarah",
          "last_name": "Johnson",
          "full_name": "Sarah Johnson",
          "status": "active",
          "photo": "https://www.gravatar.com/avatar/example",
          "purchase_value": 24900,
          "purchase_count": 3,
          "ltv": 24900,
          "country": "US",
          "city": "San Francisco",
          "state": "CA",
          "postcode": "94102",
          "country_name": "United States",
          "uuid": "cust_a1b2c3d4",
          "created_at": "2025-06-10 09:15:00",
          "updated_at": "2025-09-20 14:30:00"
        },
        "created_at": "2025-09-20 14:25:00",
        "updated_at": "2025-09-20 14:25:30"
      },
      {
        "id": 41,
        "uuid": "ord_b2c3d4e5f6a7",
        "invoice_no": "INV-041",
        "receipt_number": "RCP-041",
        "status": "processing",
        "parent_id": null,
        "fulfillment_type": "physical",
        "type": "payment",
        "customer_id": 8,
        "payment_method": "paypal",
        "payment_method_title": "PayPal",
        "payment_status": "paid",
        "currency": "USD",
        "subtotal": 4500,
        "discount_tax": 0,
        "manual_discount_total": 0,
        "coupon_discount_total": 500,
        "shipping_tax": 0,
        "shipping_total": 750,
        "tax_total": 360,
        "total_amount": 5110,
        "rate": 1,
        "total_refund": 0,
        "total_paid": 5110,
        "mode": "live",
        "shipping_status": "unfulfilled",
        "customer": {
          "id": 8,
          "user_id": 3,
          "email": "mike.chen@example.com",
          "first_name": "Mike",
          "last_name": "Chen",
          "full_name": "Mike Chen",
          "status": "active",
          "photo": "https://www.gravatar.com/avatar/example2",
          "purchase_value": 12500,
          "purchase_count": 2,
          "ltv": 12500,
          "country": "US",
          "city": "New York",
          "state": "NY",
          "postcode": "10001",
          "country_name": "United States",
          "uuid": "cust_e5f6a7b8",
          "created_at": "2025-07-15 11:00:00",
          "updated_at": "2025-09-18 09:45:00"
        },
        "created_at": "2025-09-18 09:30:00",
        "updated_at": "2025-09-18 09:45:00"
      }
    ],
    "per_page": 10,
    "total": 100,
    "last_page": 10
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


- **403** — Authenticated, but the user lacks the required capability (`orders/view`).

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

## POST `/orders/{order}/mark-as-paid`

**POST Mark Order as Paid**

Mark a pending order as paid, creating or updating the transaction record.

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Order ID |


**Request body** (`application/json`)

- `payment_method` (string) — Payment method used (e.g., `offline_payment`, `stripe`)
- `vendor_charge_id` (string) — External payment reference/charge ID
- `transaction_type` (string) — Transaction type identifier
- `mark_paid_note` (string) — Note to attach to the order

Example:

```json
{
  "payment_method": "offline_payment",
  "vendor_charge_id": "CHK-12345",
  "mark_paid_note": "Payment received via bank transfer"
}
```


**Responses**

- **200** — Order marked as paid successfully.

  Schema (`application/json`):

  - `message` (string) — Success message

  Example:

```json
{
  "message": "Order has been marked as paid"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/manage`).

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


- **423** — Order cannot be marked as paid.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Order has already been paid"
}
```



---

## POST `/orders/{order_id}/refund`

**POST Refund Order**

Process a full or partial refund for an order. Supports both gateway refunds and manual refunds, with optional subscription cancellation.

**Required permission:** `orders/can_refund`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order_id` | integer | yes | Order ID |


**Request body** (`application/json`, required)

- `refund_info` (object) **required** — Refund details object
  - `transaction_id` (integer) **required** — ID of the transaction to refund
  - `amount` (number) **required** — Refund amount in cents, matching every other money value in the API (e.g. 2500 refunds $25.00).
  - `cancelSubscription` (string) — Set to `"true"` to cancel associated subscription

Example:

```json
{
  "refund_info": {
    "transaction_id": 15,
    "amount": 2500,
    "cancelSubscription": "true"
  }
}
```


**Responses**

- **200** — Refund processed successfully.

  Schema (`application/json`):

  - `fluent_cart_refund` (object) — FluentCart refund status
    - `status` (string)
    - `message` (string)
  - `gateway_refund` (object) — Payment gateway refund status
    - `status` (string)
    - `message` (string)
  - `subscription_cancel` (object) — Subscription cancellation status (if cancelSubscription was true)
    - `status` (string)
    - `message` (string)

  Example:

```json
{
  "fluent_cart_refund": {
    "status": "success",
    "message": "Refund processed on FluentCart."
  },
  "gateway_refund": {
    "status": "success",
    "message": "Refund processed on Stripe"
  },
  "subscription_cancel": {
    "status": "success",
    "message": "Subscription cancelled successfully"
  }
}
```


- **400** — Order cannot be refunded.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Order can not be refunded"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/can_refund`).

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


- **422** — Validation error.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Transaction ID is required"
}
```



---

## PUT `/orders/{order}/sync-statuses`

**PUT Sync Order Statuses**

Synchronize the order's status and payment status based on the latest transaction data. Useful for resolving status mismatches.

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Order ID |


**Responses**

- **200** — Order statuses synced successfully.

  Schema (`application/json`):

  - `message` (string) — Success message
  - `order` (object) — Updated order object
    - _(object)_
  - `payment_status` (string) — Synced payment status
  - `status` (string) — Synced order status

  Example:

```json
{
  "message": "Order statuses synced successfully",
  "order": {
    "id": 42,
    "uuid": "ord_a1b2c3d4e5f6",
    "invoice_no": "INV-042",
    "status": "processing",
    "payment_status": "paid",
    "payment_method": "stripe",
    "payment_method_title": "Credit Card (Stripe)",
    "type": "payment",
    "fulfillment_type": "digital",
    "currency": "USD",
    "subtotal": 9900,
    "total_amount": 10692,
    "total_paid": 10692,
    "total_refund": 0,
    "customer_id": 12,
    "mode": "live",
    "created_at": "2025-09-20 14:25:00",
    "updated_at": "2025-09-20 14:30:00"
  },
  "payment_status": "paid",
  "status": "processing"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/manage`).

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


- **404** — No transaction found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "No transaction found for this order"
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

## POST `/orders/{order_id}`

**POST Update Order**

Update an existing order's details, items, discounts, shipping, and coupons. Subscription orders cannot be edited.

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order_id` | integer | yes | Order ID |


**Request body** (`application/json`, required)

- `customer_id` (integer) **required** — Customer ID
- `order_items` (array<object>) **required** — Updated array of order items (same structure as Create Order)
  - `id` (integer) — Order item ID (for updates)
  - `order_id` (integer) — Parent order ID
  - `post_id` (integer) — WordPress post ID of the product
  - `variation_id` (integer) — Product variation ID
  - `quantity` (integer) _(min: 1)_ — Item quantity
  - `unit_price` (number) — Unit price in cents
  - `line_total` (number) — Line total in cents
  - `title` (string) — Item title
- `status` (string) — Order status (cannot be set to `completed`)
- `payment_status` (string) — Payment status
- `subtotal` (number) — Updated subtotal in cents
- `total_amount` (number) — Updated total amount in cents
- `total_paid` (number) — Total amount already paid in cents
- `shipping_total` (number) — Updated shipping total in cents
- `tax_total` (number) — Updated tax total in cents
- `manual_discount_total` (number) — Manual discount in cents
- `coupon_discount_total` (number) — Coupon discount in cents
- `discount` (object) — Discount details (see Create Order)
  - _(object)_
- `shipping` (array<object>) — Shipping details (see Create Order)
  - _(object)_
- `applied_coupon` (array<object>) — Applied coupon details (see Create Order)
  - _(object)_
- `deletedItems` (array<integer>) — Array of order item IDs to remove
- `couponCalculation` (array<object>) — Coupon calculation details
  - _(object)_

Example:

```json
{
  "customer_id": 1,
  "order_items": [
    {
      "id": 10,
      "order_id": 42,
      "quantity": 2,
      "unit_price": 2500,
      "line_total": 5000
    }
  ],
  "subtotal": 5000,
  "total_amount": 5000
}
```


**Responses**

- **200** — Order updated successfully.

  Schema (`application/json`):

  - `message` (string) — Success message
  - `order` (object) — Updated order object
    - _(object)_

  Example:

```json
{
  "message": "Order updated successfully",
  "order": {
    "id": 42,
    "uuid": "ord_a1b2c3d4e5f6",
    "invoice_no": "INV-042",
    "receipt_number": "RCP-042",
    "status": "pending",
    "parent_id": null,
    "fulfillment_type": "digital",
    "type": "payment",
    "customer_id": 12,
    "payment_method": "stripe",
    "payment_method_title": "Credit Card (Stripe)",
    "payment_status": "unpaid",
    "currency": "USD",
    "subtotal": 5000,
    "discount_tax": 0,
    "manual_discount_total": 0,
    "coupon_discount_total": 0,
    "shipping_tax": 0,
    "shipping_total": 0,
    "tax_total": 400,
    "total_amount": 5400,
    "rate": 1,
    "total_refund": 0,
    "total_paid": 0,
    "mode": "live",
    "shipping_status": "unfulfilled",
    "order_items": [
      {
        "id": 101,
        "order_id": 42,
        "post_id": 123,
        "post_title": "Developer Toolkit Pro",
        "title": "Developer Toolkit Pro - Annual License",
        "object_id": 456,
        "object_type": "product_variation",
        "cart_index": 0,
        "quantity": 2,
        "unit_price": 2500,
        "cost": 2500,
        "subtotal": 5000,
        "tax_amount": 400,
        "discount_total": 0,
        "refund_total": 0,
        "line_total": 5400,
        "rate": 1,
        "payment_type": "onetime",
        "fulfillment_type": "digital",
        "fulfilled_quantity": 0,
        "created_at": "2025-09-20 14:25:00"
      }
    ],
    "customer": {
      "id": 12,
      "user_id": 5,
      "email": "sarah.johnson@example.com",
      "first_name": "Sarah",
      "last_name": "Johnson",
      "full_name": "Sarah Johnson",
      "status": "active",
      "photo": "https://www.gravatar.com/avatar/example",
      "purchase_value": 24900,
      "purchase_count": 3,
      "ltv": 24900,
      "country": "US",
      "country_name": "United States",
      "uuid": "cust_a1b2c3d4"
    },
    "created_at": "2025-09-20 14:25:00",
    "updated_at": "2025-09-20 15:10:00"
  }
}
```


- **400** — Bad request - subscription order or completed status update.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Subscription Order cannot be edited"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/manage`).

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

## PUT `/orders/{order}/address/{id}`

**PUT Update Order Address**

Update an existing order address (billing or shipping) with new address data.

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Order ID |
| `id` | integer | yes | Order address ID |


**Request body** (`application/json`, required)

- `order_id` (integer) **required** — Order ID (must match the path parameter)
- `name` (string) — Full name
- `first_name` (string) — First name
- `last_name` (string) — Last name
- `full_name` (string) — Full name
- `address_1` (string) — Address line 1
- `address_2` (string) — Address line 2
- `city` (string) — City
- `state` (string) — State/province
- `postcode` (string) — Postal/ZIP code
- `country` (string) — Country code

Example:

```json
{
  "order_id": 42,
  "first_name": "John",
  "last_name": "Doe",
  "address_1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postcode": "10001",
  "country": "US"
}
```


**Responses**

- **200** — Address updated successfully.

  Schema (`application/json`):

  - `message` (string) — Success message

  Example:

```json
{
  "message": "Address updated successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/manage`).

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


- **404** — Address information does not match.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "The address information does not match"
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

## POST `/orders/{order_id}/update-address-id`

**POST Update Order Address ID**

Assign an existing customer address to an order's billing or shipping address.

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order_id` | integer | yes | Order ID |


**Request body** (`application/json`, required)

- `address_id` (integer) **required** — Customer address ID to assign
- `address_type` (string) _(enum: `billing`, `shipping`; default: `billing`)_ — Address type: `billing` (default) or `shipping`

Example:

```json
{
  "address_id": 5,
  "address_type": "billing"
}
```


**Responses**

- **200** — Address updated successfully.

  Schema (`application/json`):

  - `message` (string) — Success message

  Example:

```json
{
  "message": "Address updated successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/manage`).

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


- **404** — Order not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Order not found"
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

## PUT `/orders/{order}/statuses`

**PUT Update Statuses**

Update the order status or shipping status for an order.

**Required permission:** `orders/manage_statuses`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Order ID |


**Request body** (`application/json`, required)

- `action` (string) **required** _(enum: `change_order_status`, `change_shipping_status`)_ — Status change type: `change_order_status` or `change_shipping_status`
- `statuses` (object) **required** — Status values object
  - `order_status` (string) — New order status. Required when action is `change_order_status`. One of: `completed`, `processing`, `on-hold`, `canceled`
  - `shipping_status` (string) — New shipping status. Required when action is `change_shipping_status`
- `manage_stock` (boolean) — Whether to adjust stock levels on status change

Example:

```json
{
  "action": "change_order_status",
  "statuses": {
    "order_status": "processing"
  },
  "manage_stock": true
}
```


**Responses**

- **200** — Status updated successfully.

  Schema (`application/json`):

  - `message` (string) — Success message
  - `data` (object) — Updated data
    - _(object)_

  Example:

```json
{
  "message": "Status has been updated",
  "data": {
    "order_id": 42,
    "old_status": "pending",
    "new_status": "processing",
    "updated_at": "2025-09-20 15:00:00"
  }
}
```


- **400** — Bad request.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Order already has the same status"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/manage_statuses`).

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

## PUT `/orders/{order}/transactions/{transaction}/status`

**PUT Update Transaction Status**

Update the payment status of a specific transaction and sync the order's payment status accordingly.

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Order ID |
| `transaction` | integer | yes | Transaction ID |


**Request body** (`application/json`, required)

- `status` (string) **required** — New transaction status (e.g., `succeeded`, `pending`, `refunded`, `failed`)

Example:

```json
{
  "status": "succeeded"
}
```


**Responses**

- **200** — Transaction status updated successfully.

  Schema (`application/json`):

  - `transaction` (object) — Updated transaction object
    - `id` (integer) — Transaction ID
    - `order_id` (integer) — Order ID
    - `status` (string) — Updated transaction status
    - `total` (integer) — Transaction total in cents
    - `payment_method` (string) — Payment method
  - `message` (string) — Success message

  Example:

```json
{
  "transaction": {
    "id": 15,
    "order_id": 42,
    "status": "succeeded",
    "total": 5000,
    "payment_method": "stripe"
  },
  "message": "Payment status has been successfully updated"
}
```


- **400** — Bad request.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Transaction already has the same status"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/manage`).

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

## POST `/orders/calculate-tax`

**POST Calculate Order Tax**

Calculate tax for an admin-created order given a destination address and a list of line items. This is a pure calculation helper — no database writes occur and no order is created or modified. Up to 100 items are processed per request; any beyond that are silently dropped. If tax calculation isn't available for the given address, all totals are returned as zero.

**Required permissions:** any one of `orders/create`, `orders/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `country` (string) — Destination country code (e.g. US).
- `state` (string) — Destination state/province code.
- `city` (string) — Destination city.
- `postcode` (string) — Destination postal/zip code.
- `items` (array<object>) — Line items to calculate tax for. Capped at 100 items per request.
  - `post_id` (integer) — Product post ID.
  - `object_id` (integer) — Variation/object ID.
  - `subtotal` (integer) — Line subtotal in cents.
  - `discount_total` (integer) — Discount applied to the line, in cents.
  - `shipping_charge` (integer) — Shipping charge attributed to the line, in cents.
  - `quantity` (integer) — Line quantity. Minimum 1.

Example:

```json
{
  "country": "US",
  "state": "CA",
  "city": "Springfield",
  "postcode": "62704",
  "items": [
    {
      "post_id": 123,
      "object_id": 456,
      "subtotal": 9900,
      "discount_total": 0,
      "shipping_charge": 0,
      "quantity": 1
    }
  ]
}
```


**Responses**

- **200** — Successful response. Returns calculated tax totals.

  Schema (`application/json`):

  - `tax_total` (integer) — Total tax across all items, in cents.
  - `shipping_tax` (integer) — Tax on shipping, in cents.
  - `tax_behavior` (integer) — 0 for tax-exclusive, 1 for tax-inclusive pricing.
  - `tax_country` (string)
  - `tax_lines` (array<object>)
    - `label` (string)
    - `rate_percent` (number)
    - `tax_amount` (integer) — Tax amount for this line, in cents.
    - `inclusive` (boolean)

  Example:

```json
{
  "tax_total": 792,
  "shipping_tax": 0,
  "tax_behavior": 0,
  "tax_country": "US",
  "tax_lines": [
    {
      "label": "CA State Tax",
      "rate_percent": 8,
      "tax_amount": 792,
      "inclusive": false
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


- **403** — Authenticated, but the user lacks the required capability.

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

## POST `/orders/{order}/subscriptions/{subscription}/charge-now`

**POST Charge Subscription Now**

Run one immediate off-session charge attempt against a subscription's open renewal invoice. Requires a store-billed (manual or auto-charge) subscription that already has a pending or scheduled renewal order. A declined card is returned as HTTP 200 with `status: "failed"` — the request itself succeeded, the charge attempt did not; only a state violation (e.g. no open renewal order to charge) returns an error response.

**Required permission:** `subscriptions/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Parent order ID the subscription belongs to. |
| `subscription` | integer | yes | Subscription ID. |


**Responses**

- **200** — Charge attempt completed (may still report a failed charge in `status`).

  Schema (`application/json`):

  - `status` (string)
  - `message` (string)
  - `subscription` (object)
    - _(object)_

  Example:

```json
{
  "status": "success",
  "message": "Subscription charged successfully.",
  "subscription": {
    "id": 15,
    "customer_id": 12,
    "parent_order_id": 42,
    "product_id": 123,
    "item_name": "Developer Toolkit Pro - Annual License",
    "variation_id": 456,
    "billing_interval": "yearly",
    "recurring_amount": 9900,
    "recurring_total": 10692,
    "status": "active",
    "next_billing_date": "2026-09-20 14:25:00",
    "created_at": "2025-09-20 14:25:00",
    "updated_at": "2026-08-18 10:00:00"
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


- **403** — Authenticated, but the user lacks the required capability.

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


- **404** — The 404 fires for whichever route-bound model resolves first: `order` (if the order ID doesn't exist) or `subscription` (if the order exists but the subscription ID doesn't, or doesn't belong to that order). No order matches the given ID. Thrown by the framework's route-model-binding, not an explicit controller check, so the message is generic and names the model class.

  Example:

```json
{
  "message": "No query results for model [FluentCart\\\\App\\\\Models\\\\Order]."
}
```


- **422** — No open renewal order to charge, or the charge attempt could not be started.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "There is no open renewal order to charge for this subscription."
}
```



---

## POST `/orders/{order}/subscriptions/{subscription}/create-renewal`

**POST Create Renewal Now**

Immediately create the next renewal order for a store-billed (manual or auto-charge) subscription, ahead of its scheduled billing date. Only valid for active or trialing subscriptions that have an upcoming billing date. For auto-charge (system) subscriptions, the newly created (or already-open) renewal is charged immediately and the response mirrors the charge-now endpoint; for manual subscriptions the renewal is created as a pay-now invoice and the customer is emailed.

**Required permission:** `subscriptions/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Parent order ID the subscription belongs to. |
| `subscription` | integer | yes | Subscription ID. |


**Responses**

- **200** — Renewal created (manual subscriptions) or charged (auto-charge subscriptions).

  Schema (`application/json`):

  - `message` (string)
  - `renewal` (object)
    - _(object)_

  Example:

```json
{
  "message": "Renewal has been created successfully.",
  "renewal": {
    "id": 87,
    "uuid": "ord_b2c3d4e5f6a7",
    "parent_id": 42,
    "type": "renewal",
    "status": "pending",
    "payment_status": "pending",
    "total_amount": 10692,
    "currency": "USD",
    "created_at": "2026-08-18 10:00:00"
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


- **403** — Authenticated, but the user lacks the required capability.

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


- **404** — The 404 fires for whichever route-bound model resolves first: `order` or `subscription`. No order matches the given ID. Thrown by the framework's route-model-binding, not an explicit controller check, so the message is generic and names the model class.

  Example:

```json
{
  "message": "No query results for model [FluentCart\\\\App\\\\Models\\\\Order]."
}
```


- **422** — The subscription is not eligible for an immediate renewal right now (wrong billing type, status, or a renewal already exists).

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "A pending renewal already exists for this subscription."
}
```



---

## GET `/renewals/{id}`

**GET Get Renewal Invoice Details**

Retrieve a single renewal invoice (an order of type `renewal`), including its customer, order items, and transactions.

**Required permission:** `orders/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Renewal order ID |


**Responses**

- **200** — Successful response. Returns the renewal invoice.

  Schema (`application/json`):

  - `invoice` (object) — Renewal order with customer, order_items, and transactions relations
    - _(object)_

  Example:

```json
{
  "invoice": {
    "id": 5151,
    "status": "completed",
    "type": "renewal",
    "customer_id": 1484,
    "payment_status": "paid",
    "total_amount": 9900
  }
}
```


- **401** — Authentication required.

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


- **403** — The current user lacks the orders/view permission.

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


- **404** — No renewal order matches the given ID. Uses the shared entity-not-found shape (`entityNotFoundError()`), which nests the message under `data` and includes admin-UI hints.

  Example:

```json
{
  "code": "fluent_cart_entity_not_found",
  "data": {
    "message": "Renewal order not found",
    "buttonText": "Back to Orders",
    "route": "/orders"
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

## GET `/renewals`

**GET List Renewal Invoices**

List orders of type `renewal` (subscription renewal invoices), newest first, paginated. Each row includes its customer relation.

**Required permission:** `orders/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `payment_status` | string | no | Filter by payment status (e.g. paid, pending, failed). |
| `parent_id` | integer | no | Filter to renewal invoices belonging to a specific parent order ID. |
| `customer_id` | integer | no | Filter to renewal invoices belonging to a specific customer ID. |


**Responses**

- **200** — Successful response. Returns a paginated list of renewal invoices.

  Schema (`application/json`):

  - `invoices` (object) — Laravel-style paginator payload
    - _(object)_

  Example:

```json
{
  "invoices": {
    "current_page": 1,
    "data": [
      {
        "id": 5151,
        "status": "completed",
        "customer_id": 1484,
        "payment_status": "paid",
        "total_amount": 9900
      }
    ],
    "from": 1,
    "last_page": 175,
    "per_page": 15,
    "to": 15,
    "total": 2612
  }
}
```


- **401** — Authentication required.

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


- **403** — The current user lacks the orders/view permission.

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

## POST `/renewals/{order}/resend`

**POST Resend Renewal Invoice Email**

Resend the pay-now email notification for a pending renewal invoice. Only allowed for renewal orders with `payment_status = pending`. If the invoice belongs to a system (store-managed) subscription that is still mid-retry, the resend is blocked until the automatic retry ladder is exhausted, so it never overlaps the dunning emails.

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Renewal order ID |


**Responses**

- **200** — Renewal invoice email resent.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Renewal order email has been resent"
}
```


- **400** — Order is not a renewal, is not pending, or its automatic retries have not yet exhausted.

  Example:

```json
{
  "message": "Only pending renewal orders can be resent"
}
```


- **401** — Authentication required.

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


- **403** — The current user lacks the orders/manage permission.

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


- **404** — No order matches the given ID. Thrown by the framework's route-model-binding (`Order::firstOrFail()`), not an explicit controller check, so the message is generic.

  Example:

```json
{
  "message": "No query results for model [FluentCart\\App\\Models\\Order]."
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

## POST `/orders/{order}/subscriptions/{subscription}/skip-renewal`

**POST Skip Next Renewal Period**

Advance a store-billed (manual or auto-charge) subscription's `next_billing_date` to the following period without creating or charging a renewal for the current one. Only valid for active or trialing subscriptions with an upcoming billing date. The skip does not stack — if a skip is already pending, or there is nothing left to advance, the request fails.

**Required permission:** `subscriptions/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Parent order ID the subscription belongs to. |
| `subscription` | integer | yes | Subscription ID. |


**Request body** (`application/json`)

- `reason` (string) — Optional note recorded against the skip.

Example:

```json
{
  "reason": "Customer requested a one-cycle pause"
}
```


**Responses**

- **200** — Billing period skipped successfully.

  Schema (`application/json`):

  - `message` (string)
  - `old_next_billing_date` (string)
  - `new_next_billing_date` (string)

  Example:

```json
{
  "message": "Billing period has been skipped successfully.",
  "old_next_billing_date": "2026-09-01 00:00:00",
  "new_next_billing_date": "2026-10-01 00:00:00"
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


- **403** — Authenticated, but the user lacks the required capability.

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


- **404** — The 404 fires for whichever route-bound model resolves first: `order` or `subscription`. No order matches the given ID. Thrown by the framework's route-model-binding, not an explicit controller check, so the message is generic and names the model class.

  Example:

```json
{
  "message": "No query results for model [FluentCart\\\\App\\\\Models\\\\Order]."
}
```


- **422** — The subscription is not eligible to skip a period right now (wrong billing type, status, no upcoming date, or a skip is already pending).

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "The next period could not be skipped. It may have already been skipped."
}
```



---

## POST `/orders/{order}/transactions/{transaction}/sync`

**POST Sync Pending Transaction**

Re-fetch a pending transaction's current status directly from its payment gateway and update the local record to match. Use this to reconcile a transaction stuck in a pending state after a webhook was missed or delayed.

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Order ID the transaction belongs to. |
| `transaction` | integer | yes | Transaction ID to sync. |


**Responses**

- **200** — Transaction synced from the payment gateway successfully.

  Schema (`application/json`):

  - `message` (string)
  - `transaction` (object)
    - _(object)_

  Example:

```json
{
  "message": "Transaction has been synced from the payment gateway successfully!",
  "transaction": {
    "id": 78,
    "order_id": 42,
    "vendor_charge_id": "ch_3PxKE2JY8q",
    "payment_method": "stripe",
    "payment_mode": "live",
    "payment_method_type": "card",
    "currency": "USD",
    "transaction_type": "payment",
    "card_last_4": "4242",
    "card_brand": "visa",
    "status": "paid",
    "total": 10692,
    "uuid": "txn_f7e8d9c0",
    "created_at": "2026-08-18 10:00:00"
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


- **403** — Authenticated, but the user lacks the required capability.

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


- **404** — The 404 fires for whichever route-bound model resolves first: `order` (the plain `$order` string) is not model-bound here, only `transaction` is, so this only fires when the transaction ID doesn't exist. No ordertransaction matches the given ID. Thrown by the framework's route-model-binding, not an explicit controller check, so the message is generic and names the model class.

  Example:

```json
{
  "message": "No query results for model [FluentCart\\\\App\\\\Models\\\\OrderTransaction]."
}
```


- **422** — The transaction does not belong to the given order, or the gateway sync failed.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "The selected transaction does not match with the provided order"
}
```



---

## PUT `/orders/{order}/subscriptions/{subscription}/update`

**PUT Update Subscription**

Update a manual subscription's billing details — recurring amount, remaining bill count, billing interval, status, or next billing date. Only subscriptions with a manual collection method can be updated through this endpoint; system (auto-charge) and gateway-managed subscriptions are rejected. Note `recurring_total` is submitted as a decimal amount in the store's currency (e.g. `29.99`), not cents, unlike most other money fields in this API.

**Required permission:** `subscriptions/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Parent order ID the subscription belongs to. |
| `subscription` | integer | yes | Subscription ID. |


**Request body** (`application/json`, required)

- `status` (string) **required** _(enum: `active`, `paused`, `trialing`, `canceled`, `expired`, `completed`, `past_due`)_ — New subscription status.
- `recurring_total` (number) _(min: 0)_ — New recurring amount, as a decimal in the store's currency (e.g. 29.99) — not cents.
- `bill_times` (integer) _(min: 0)_ — Number of remaining billing cycles.
- `billing_interval` (string) _(maxLength: 100)_ — Billing interval label (e.g. monthly, yearly).
- `next_billing_date` (string) _(maxLength: 25)_ — Next billing date. Any string `strtotime()` can parse.

Example:

```json
{
  "status": "active",
  "recurring_total": 29.99,
  "bill_times": 0,
  "billing_interval": "monthly",
  "next_billing_date": "2026-09-18 00:00:00"
}
```


**Responses**

- **200** — Subscription updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `subscription` (object)
    - _(object)_

  Example:

```json
{
  "message": "Subscription has been updated successfully!",
  "subscription": {
    "id": 15,
    "customer_id": 12,
    "parent_order_id": 42,
    "product_id": 123,
    "item_name": "Developer Toolkit Pro - Annual License",
    "variation_id": 456,
    "billing_interval": "yearly",
    "recurring_amount": 9900,
    "recurring_total": 10692,
    "status": "active",
    "next_billing_date": "2026-09-20 14:25:00",
    "created_at": "2025-09-20 14:25:00",
    "updated_at": "2026-08-18 10:00:00"
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


- **403** — Authenticated, but the user lacks the required capability.

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


- **404** — The 404 fires for whichever route-bound model resolves first: `order` or `subscription`. No order matches the given ID. Thrown by the framework's route-model-binding, not an explicit controller check, so the message is generic and names the model class.

  Example:

```json
{
  "message": "No query results for model [FluentCart\\\\App\\\\Models\\\\Order]."
}
```


- **422** — Validation failed (e.g. missing/invalid status, or the subscription is not manual and cannot be updated).

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Only manual subscriptions can be updated."
}
```



---

## POST `/renewals/{order}/void`

**POST Void Renewal Invoice**

Cancel a pending or scheduled renewal invoice. Sets the order's payment_status to failed and status to canceled, fails any pending transactions on it, advances the subscription past this billing period so the scheduler doesn't immediately regenerate the same invoice, and recounts the customer's stats. If the invoice was paid by a concurrent webhook between validation and the update, the void is rejected instead of overwriting a paid invoice.

**Required permission:** `orders/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | integer | yes | Renewal order ID |


**Responses**

- **200** — Renewal invoice voided.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Renewal order has been voided successfully"
}
```


- **400** — Order is not a renewal, or is not pending/scheduled.

  Example:

```json
{
  "message": "Only pending or scheduled invoices can be voided"
}
```


- **401** — Authentication required.

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


- **403** — The current user lacks the orders/manage permission.

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


- **404** — No order matches the given ID. Thrown by the framework's route-model-binding, not an explicit controller check, so the message is generic and names the model class.

  Example:

```json
{
  "message": "No query results for model [FluentCart\\\\App\\\\Models\\\\Order]."
}
```


- **409** — The invoice was paid by a concurrent webhook and can no longer be voided.

  Example:

```json
{
  "message": "This invoice was just paid and can no longer be voided"
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
