# FluentCart API — Orders

22 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/orders/{order}/transactions/{transaction_id}/accept-dispute/`

**POST Accept Dispute**

Accept a payment dispute (chargeback) for a specific transaction.

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



---

## POST `/orders/do-bulk-action`

**POST Bulk Actions**

Perform bulk actions on multiple orders at once.

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



---

## POST `/orders/calculate-shipping`

**POST Calculate Shipping**

Calculate shipping charges for order items with a specific shipping method.

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



---

## POST `/orders/{order_id}/change-customer`

**POST Change Customer**

Reassign an order to a different existing customer. Updates all connected orders (parent/child/renewals), subscriptions, and customer statistics.

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



---

## DELETE `/orders/{order_id}`

**DELETE Delete Order**

Permanently delete an order and all associated data (transactions, items, meta, addresses, coupons, cart data, download permissions, labels). For subscription orders, also deletes all child renewal orders and subscriptions.

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


- **404** — Order not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Order not found"
}
```



---

## POST `/orders/{order}/generate-missing-licenses`

**POST Generate Missing Licenses**

Generate any missing license keys for an order's items (requires Pro with licensing module).

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


- **404** — Order not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Order not found"
}
```



---

## GET `/orders/{order_id}`

**GET Get Order Details**

Retrieve detailed information about a specific order, including items, transactions, addresses, subscriptions, and activities.

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
  "tax_id": null
}
```



---

## GET `/orders/{order}/transactions`

**GET Get Order Transactions**

Retrieve all transactions for an order. Returns the full order details (same as Get Order Details), which includes the transactions relation.

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
  "tax_id": null
}
```



---

## GET `/orders/shipping_methods`

**GET Get Shipping Methods**

Retrieve available shipping methods, optionally filtered by country and state. Returns methods applicable to the specified location and all other enabled methods separately.

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



---

## GET `/orders/{id}/transactions/{transaction_id}`

**GET Get Single Transaction**

Retrieve details of a specific transaction within an order. Returns the full order details (same as Get Order Details).

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
  "tax_id": null
}
```



---

## GET `/orders`

**GET List Orders**

Retrieve a paginated list of orders with optional filtering, sorting, and search.

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



---

## POST `/orders/{order}/mark-as-paid`

**POST Mark Order as Paid**

Mark a pending order as paid, creating or updating the transaction record.

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

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order_id` | integer | yes | Order ID |


**Request body** (`application/json`, required)

- `refund_info` (object) **required** — Refund details object
  - `transaction_id` (integer) **required** — ID of the transaction to refund
  - `amount` (number) **required** — Refund amount in decimal format (e.g., 10.00 not cents). Will be converted to cents internally
  - `cancelSubscription` (string) — Set to `"true"` to cancel associated subscription

Example:

```json
{
  "refund_info": {
    "transaction_id": 15,
    "amount": 25,
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


- **404** — No transaction found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "No transaction found for this order"
}
```



---

## POST `/orders/{order_id}`

**POST Update Order**

Update an existing order's details, items, discounts, shipping, and coupons. Subscription orders cannot be edited.

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



---

## PUT `/orders/{order}/address/{id}`

**PUT Update Order Address**

Update an existing order address (billing or shipping) with new address data.

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


- **404** — Address information does not match.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "The address information does not match"
}
```



---

## POST `/orders/{order_id}/update-address-id`

**POST Update Order Address ID**

Assign an existing customer address to an order's billing or shipping address.

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


- **404** — Order not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Order not found"
}
```



---

## PUT `/orders/{order}/statuses`

**PUT Update Statuses**

Update the order status or shipping status for an order.

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



---

## PUT `/orders/{order}/transactions/{transaction}/status`

**PUT Update Transaction Status**

Update the payment status of a specific transaction and sync the order's payment status accordingly.

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



---
