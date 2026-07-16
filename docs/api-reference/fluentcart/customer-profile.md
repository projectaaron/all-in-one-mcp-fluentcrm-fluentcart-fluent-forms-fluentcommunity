# FluentCart API — Customer Profile

21 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/customers/add-address`

**POST Create Address (Checkout)**

Create a new address for the currently authenticated customer. Used during checkout to add a new billing or shipping address. After creation, returns updated address selector HTML for the checkout form.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `type` (string) **required** _(enum: `billing`, `shipping`)_ — Address type: `billing` or `shipping`
- `product_type` (string) — Product fulfillment type (e.g., `physical`, `digital`). Used for field validation rules.
- `label` (string) _(maxLength: 15)_ — Short label for the address (max 15 characters, e.g., `Home`, `Office`)
- `billing_name` (string) — Contact name (for billing type)
- `billing_address_1` (string) — Primary street address (for billing type)
- `billing_address_2` (string) — Secondary address line (for billing type)
- `billing_city` (string) — City (for billing type)
- `billing_state` (string) — State/province code (for billing type)
- `billing_postcode` (string) — Postal/zip code (for billing type)
- `billing_country` (string) — Country code (for billing type)
- `billing_phone` (string) — Phone number (for billing type)
- `billing_email` (string) — Email address (for billing type)
- `shipping_name` (string) — Contact name (for shipping type)
- `shipping_address_1` (string) — Primary street address (for shipping type)
- `shipping_address_2` (string) — Secondary address line (for shipping type)
- `shipping_city` (string) — City (for shipping type)
- `shipping_state` (string) — State/province code (for shipping type)
- `shipping_postcode` (string) — Postal/zip code (for shipping type)
- `shipping_country` (string) — Country code (for shipping type)
- `shipping_phone` (string) — Phone number (for shipping type)
- `shipping_email` (string) — Email address (for shipping type)

Example:

```json
{
  "type": "billing",
  "billing_name": "John Doe",
  "billing_address_1": "123 Main St",
  "billing_city": "New York",
  "billing_state": "NY",
  "billing_postcode": "10001",
  "billing_country": "US",
  "billing_phone": "+1234567890",
  "label": "Home"
}
```


**Responses**

- **200** — Successful response. Returns success message and updated address selector fragment.

  Schema (`application/json`):

  - `message` (string)
  - `fragment` (array<object>)
    - `selector` (string)
    - `content` (string)
    - `type` (string)

  Example:

```json
{
  "message": "Customer address created successfully!",
  "fragment": [
    {
      "selector": "[data-fluent-cart-checkout-page-form-address-modal-address-selector-button-wrapper]",
      "content": "<div>...updated address selector HTML...</div>",
      "type": "replace"
    }
  ]
}
```


- **422** — Validation error.

  Example:

```json
{
  "status": "failed",
  "errors": {
    "billing_country": {
      "required": "Country is required."
    }
  }
}
```



---

## POST `/customer-profile/create-address`

**POST Create Profile Address**

Create a new address for the authenticated customer from the profile management page.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `type` (string) **required** _(enum: `billing`, `shipping`)_ — Address type: `billing` or `shipping`
- `name` (string) **required** _(maxLength: 255)_ — Contact name. Max 255 characters.
- `label` (string) _(maxLength: 15)_ — Short label for the address (max 15 characters, e.g., `Home`, `Work`)
- `address_1` (string) — Primary street address
- `address_2` (string) — Secondary address line
- `city` (string) _(maxLength: 255)_ — City. Max 255 characters.
- `state` (string) _(maxLength: 255)_ — State/province code. Max 255 characters.
- `postcode` (string) **required** — Postal/zip code
- `country` (string) **required** — Country code (e.g., `US`, `GB`)
- `phone` (string) — Phone number
- `email` (string) **required** — Email address
- `company_name` (string) _(maxLength: 255)_ — Company name. Max 255 characters.
- `is_primary` (integer) _(enum: `0`, `1`)_ — Set to `1` to make this the primary address. Defaults to `0`. Automatically set to `1` if no primary address exists.

Example:

```json
{
  "type": "billing",
  "name": "John Doe",
  "address_1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postcode": "10001",
  "country": "US",
  "phone": "+1234567890",
  "email": "john@example.com",
  "label": "Home"
}
```


**Responses**

- **200** — Successful response. Address created.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object)
    - `is_created` (object)
      - _(object)_
    - `total_address_count` (integer)

  Example:

```json
{
  "message": "Customer address created successfully!",
  "data": {
    "is_created": {
      "id": 10,
      "customer_id": 1,
      "type": "billing",
      "name": "John Doe",
      "address_1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postcode": "10001",
      "country": "US",
      "is_primary": "1",
      "status": "active"
    },
    "total_address_count": 2
  }
}
```


- **422** — Validation error.

  Example:

```json
{
  "message": "Name field is required."
}
```



---

## GET `/customer-profile/`

**GET Dashboard Overview**

Retrieve the customer's dashboard overview including the 5 most recent orders. This is the landing page data for the customer portal.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns dashboard data with recent orders.

  Schema (`application/json`):

  - `message` (string)
  - `dashboard_data` (object)
    - `orders` (array<object>)
      - _(object)_
  - `sections_parts` (object)
    - `before_orders_table` (string)
    - `after_orders_table` (string)

  Example:

```json
{
  "message": "Success",
  "dashboard_data": {
    "orders": [
      {
        "created_at": "2025-06-15 10:30:00",
        "invoice_no": "INV-000101",
        "total_amount": 4999,
        "uuid": "abc-123-def",
        "type": "one-time",
        "status": "completed",
        "renewals_count": 0,
        "order_items": [
          {
            "id": 1,
            "post_title": "Premium Plugin",
            "title": "Premium Plugin - Single Site",
            "quantity": 1,
            "payment_type": "one-time",
            "line_meta": {
              "bundle_parent_item_id": null
            }
          }
        ]
      }
    ]
  },
  "sections_parts": {
    "before_orders_table": "",
    "after_orders_table": ""
  }
}
```



---

## DELETE `/customers/{customerId}/address`

**DELETE Delete Address (Checkout)**

Delete an existing address for the authenticated customer. The address ID is passed in the request body.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID. Must belong to the authenticated user. |


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

- **200** — Successful response. Address deleted.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Address deleted successfully"
}
```


- **403** — Forbidden. The authenticated user does not own this address.

  Example:

```json
{
  "message": "You are not authorized to delete this address"
}
```



---

## POST `/customer-profile/delete-address`

**POST Delete Profile Address**

Delete an address from the customer's profile. The address must belong to the authenticated customer. Primary addresses and the last remaining address cannot be deleted.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `addressId` (integer) **required** — The address record ID to delete

Example:

```json
{
  "addressId": 5
}
```


**Responses**

- **200** — Successful response. Address deleted.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Address successfully deleted."
}
```


- **400** — Address cannot be deleted (primary or last remaining).

  Example:

```json
{
  "message": "Primary address cannot be deleted!"
}
```


- **403** — Forbidden. The authenticated user does not own this address.

  Example:

```json
{
  "message": "You are not authorized to update this address"
}
```



---

## GET `/customers/{customerId}`

**GET Get Customer Details**

Retrieve the details of the currently authenticated customer. The customerId must match the logged-in customer's record.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID. Must belong to the authenticated user. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with` | array<string> | no | Relationships to eager-load (e.g., `billing_address`, `shipping_address`, `orders`) |


**Responses**

- **200** — Successful response. Returns the customer details.

  Schema (`application/json`):

  - `customer` (object)
    - _(object)_

  Example:

```json
{
  "customer": {
    "id": 1,
    "user_id": 5,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "active",
    "purchase_value": {
      "total": 15000,
      "currency": "USD",
      "formatted": "$150.00"
    },
    "purchase_count": 3,
    "ltv": 15000,
    "country": "US",
    "city": "New York",
    "state": "NY",
    "postcode": "10001",
    "created_at": "2025-01-10 08:00:00",
    "updated_at": "2025-06-20 14:00:00"
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



---

## GET `/customers/{customerId}/orders`

**GET Get Customer Orders**

Retrieve a paginated list of orders for the specified customer. The customerId must match the logged-in user.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID. Must belong to the authenticated user. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of items per page (default: 15) |


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
    "total": 25,
    "per_page": 15,
    "current_page": 1,
    "last_page": 2,
    "data": [
      {
        "id": 101,
        "invoice_no": "INV-000101",
        "total_amount": 4999,
        "uuid": "abc-123-def",
        "type": "one-time",
        "status": "completed",
        "created_at": "2025-06-15 10:30:00"
      }
    ]
  }
}
```



---

## GET `/customer-profile/orders/{order_uuid}`

**GET Get Order Details**

Retrieve full details for a specific order including line items, transactions, subscriptions, downloads, and addresses. The order must belong to the authenticated customer.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order_uuid` | string | yes | The UUID of the order (alphanumeric with dashes) |


**Responses**

- **200** — Successful response. Returns full order details.

  Schema (`application/json`):

  - `order` (object)
    - _(object)_
  - `section_parts` (object)
    - _(object)_

  Example:

```json
{
  "order": {
    "id": 101,
    "fulfillment_type": "digital",
    "type": "one-time",
    "created_at": "2025-06-15 10:30:00",
    "invoice_no": "INV-000101",
    "currency": "USD",
    "uuid": "abc-123-def",
    "status": "completed",
    "payment_status": "paid",
    "shipping_status": "",
    "billing_address_text": "John Doe, 123 Main St, New York, NY 10001, US",
    "shipping_address_text": "",
    "subtotal": 4999,
    "total_amount": 4999,
    "total_paid": 4999,
    "total_refund": 0,
    "shipping_total": 0,
    "coupon_discount_total": 0,
    "manual_discount_total": 0,
    "tax_total": 0,
    "tax_behavior": "exclusive",
    "shipping_tax": 0,
    "payment_method": "stripe",
    "order_items": [
      {
        "id": 1,
        "variation_id": 10,
        "product_id": 5,
        "post_title": "Premium Plugin",
        "title": "Premium Plugin - Single Site",
        "quantity": 1,
        "unit_price": 4999,
        "subtotal": 4999,
        "payment_type": "one-time",
        "meta_lines": [
          {
            "key": "License",
            "value": "DTPRO-A1B2-C3D4-E5F6"
          },
          {
            "key": "Activation Limit",
            "value": "1 site"
          }
        ],
        "extra_amount": 0,
        "image": "https://example.com/wp-content/uploads/product.jpg",
        "variant_image": "",
        "url": "https://example.com/product/premium-plugin/",
        "line_meta": {
          "license_id": 100,
          "billing_interval": "year",
          "billing_count": 1
        }
      }
    ],
    "subscriptions": [
      {
        "id": 10,
        "status": "active",
        "billing_interval": "year",
        "billing_count": 1,
        "next_billing_date": "2026-06-15 10:30:00",
        "amount": 4999
      }
    ],
    "downloads": [
      {
        "file_size": "2.5 MB",
        "title": "premium-plugin-v2.zip",
        "download_url": "https://example.com/?fct_download=..."
      }
    ],
    "transactions": [
      {
        "id": 50,
        "uuid": "txn-abc-123",
        "order_id": 101,
        "amount": 4999,
        "status": "succeeded",
        "payment_method": "stripe",
        "created_at": "2025-06-15 10:30:00"
      }
    ]
  },
  "section_parts": {
    "before_summary": "",
    "after_summary": "",
    "after_licenses": "",
    "after_subscriptions": "",
    "after_downloads": "",
    "after_transactions": "",
    "end_of_order": ""
  }
}
```


- **403** — Not logged in.

  Example:

```json
{
  "message": "You are not logged in"
}
```


- **404** — Order not found.

  Example:

```json
{
  "message": "Order not found"
}
```



---

## GET `/customer-profile/profile`

**GET Get Profile Details**

Retrieve the authenticated customer's profile details including name, email, and associated addresses. If the logged-in user does not yet have a customer record, basic WordPress user data is returned instead.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns profile data with addresses.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object)
    - `first_name` (string)
    - `last_name` (string)
    - `email` (string)
    - `billing_address` (array<object>)
      - _(object)_
    - `shipping_address` (array<object>)
      - _(object)_
    - `not_a_customer` (boolean)

  Example:

```json
{
  "message": "Success",
  "data": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "billing_address": [
      {
        "id": 1,
        "customer_id": 1,
        "type": "billing",
        "name": "John Doe",
        "address_1": "123 Main St",
        "address_2": "",
        "city": "New York",
        "state": "NY",
        "postcode": "10001",
        "country": "US",
        "is_primary": "1",
        "status": "active"
      }
    ],
    "shipping_address": [
      {
        "id": 2,
        "customer_id": 1,
        "type": "shipping",
        "name": "John Doe",
        "address_1": "456 Oak Avenue",
        "address_2": "Suite 200",
        "city": "San Francisco",
        "state": "CA",
        "postcode": "94102",
        "country": "US",
        "is_primary": "1",
        "status": "active"
      }
    ]
  }
}
```



---

## GET `/customer-profile/orders/{transaction_uuid}/billing-address`

**GET Get Transaction Billing Address**

Retrieve the billing address associated with a specific transaction. Used for invoice/receipt editing in the customer portal.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `transaction_uuid` | string | yes | The UUID of the transaction (alphanumeric with dashes) |


**Responses**

- **200** — Successful response. Returns the billing address data.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object)
    - `address_1` (string)
    - `address_2` (string)
    - `city` (string)
    - `state` (string)
    - `postcode` (string)
    - `country` (string)
    - `name` (string)
    - `vat_tax_id` (string)
    - `address_id` (integer,string)

  Example:

```json
{
  "message": "Success",
  "data": {
    "address_1": "123 Main St",
    "address_2": "",
    "city": "New York",
    "state": "NY",
    "postcode": "10001",
    "country": "US",
    "name": "John Doe",
    "vat_tax_id": "EU123456789",
    "address_id": 15
  }
}
```


- **404** — Customer, transaction, or order not found.

  Example:

```json
{
  "message": "Transaction not found"
}
```



---

## GET `/customer-profile/orders/{order_uuid}/upgrade-paths`

**GET Get Upgrade Paths**

Retrieve available upgrade/downgrade paths for a specific product variation within an order. Used to show plan switching options in the customer portal.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order_uuid` | string | yes | The UUID of the order (alphanumeric with dashes) |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `variation_id` | integer | yes | The product variation ID to find upgrade paths for |


**Responses**

- **200** — Successful response. Returns available upgrade/downgrade paths.

  Schema (`application/json`):

  - `upgradePaths` (array<object>)
    - `variation_id` (integer)
    - `title` (string)
    - `price` (integer)
    - `billing_interval` (string)
    - `upgrade_type` (string)
    - `prorated_amount` (integer)

  Example:

```json
{
  "upgradePaths": [
    {
      "variation_id": 15,
      "title": "Premium Plugin - 5 Sites",
      "price": 9999,
      "billing_interval": "year",
      "upgrade_type": "upgrade",
      "prorated_amount": 5000
    },
    {
      "variation_id": 20,
      "title": "Premium Plugin - Unlimited Sites",
      "price": 19999,
      "billing_interval": "year",
      "upgrade_type": "upgrade",
      "prorated_amount": 15000
    }
  ]
}
```


- **403** — Not logged in.

  Example:

```json
{
  "message": "You must be logged in to view upgrade paths."
}
```


- **404** — Order not found or no permission.

  Example:

```json
{
  "message": "Order not found or you do not have permission to view it."
}
```



---

## GET `/customer-profile/downloads`

**GET List Downloads**

Retrieve a paginated list of downloadable files available to the authenticated customer. Only includes downloads from orders with a successful payment status. Filters downloads based on purchased product variations.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | no | Page number for pagination (default: 1) |
| `per_page` | integer | no | Number of items per page (default: 10) |


**Responses**

- **200** — Successful response. Returns a paginated list of downloadable files.

  Schema (`application/json`):

  - `message` (string)
  - `downloads` (object)
    - `data` (array<object>)
      - `file_size` (string)
      - `title` (string)
      - `download_url` (string)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)

  Example:

```json
{
  "message": "Success",
  "downloads": {
    "data": [
      {
        "file_size": "2.5 MB",
        "title": "premium-plugin-v2.0.1.zip",
        "download_url": "https://example.com/?fct_download=eyJ0eXAi..."
      },
      {
        "file_size": "1.2 MB",
        "title": "starter-theme-v1.5.zip",
        "download_url": "https://example.com/?fct_download=eyJ0eXAi..."
      }
    ],
    "total": 5,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1
  }
}
```



---

## GET `/customer-profile/orders`

**GET List Orders**

Retrieve a paginated list of the authenticated customer's orders. Excludes renewal orders that have a parent subscription order. Supports text search across order fields.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of items per page (default: 10) |
| `page` | integer | no | Page number for pagination (default: 1) |
| `search` | string | no | Search text to filter orders |


**Responses**

- **200** — Successful response. Returns a paginated list of orders.

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
    "total": 25,
    "per_page": 10,
    "current_page": 1,
    "last_page": 3,
    "data": [
      {
        "created_at": "2025-06-15 10:30:00",
        "invoice_no": "INV-000101",
        "total_amount": 4999,
        "uuid": "abc-123-def",
        "type": "one-time",
        "status": "completed",
        "renewals_count": 0,
        "order_items": [
          {
            "id": 1,
            "post_title": "Premium Plugin",
            "title": "Premium Plugin - Single Site",
            "quantity": 1,
            "payment_type": "one-time",
            "line_meta": {
              "bundle_parent_item_id": null
            }
          }
        ]
      }
    ]
  }
}
```



---

## POST `/customer-profile/make-primary-address`

**POST Make Profile Address Primary**

Set a specific address as the primary address for its type. All other addresses of the same type for the customer are demoted.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `addressId` (integer) **required** — The address record ID to set as primary
- `type` (string) **required** _(enum: `billing`, `shipping`)_ — Address type: `billing` or `shipping`

Example:

```json
{
  "addressId": 5,
  "type": "billing"
}
```


**Responses**

- **200** — Successful response. Address set as primary.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Address successfully set as the primary"
}
```


- **403** — Forbidden. The authenticated user does not own this address.

  Example:

```json
{
  "message": "You are not authorized to update this address"
}
```



---

## PUT `/customer-profile/orders/{transaction_uuid}/billing-address`

**PUT Save Transaction Billing Address**

Create or update the billing address for a specific transaction's order. Also stores the VAT/Tax ID as order metadata. Validates address fields against country-specific rules.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `transaction_uuid` | string | yes | The UUID of the transaction (alphanumeric with dashes) |


**Request body** (`application/json`, required)

- `address_id` (string) — Existing order address ID to update. If empty, a new address is created.
- `name` (string) **required** — Contact name
- `address_1` (string) — Primary street address. Required based on country validation rules.
- `address_2` (string) — Secondary address line
- `city` (string) — City. Required based on country validation rules.
- `state` (string) — State/province code. Required for countries with states.
- `postcode` (string) — Postal/zip code. Validated against country-specific format.
- `country` (string) **required** — Country code (e.g., `US`, `GB`)
- `vat_tax_id` (string) — VAT or Tax ID. Stored as order meta.

Example:

```json
{
  "address_id": "15",
  "name": "John Doe",
  "address_1": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postcode": "10001",
  "country": "US",
  "vat_tax_id": "EU123456789"
}
```


**Responses**

- **200** — Successful response. Address created or updated.

  Schema (`application/json`):

  - `message` (string)
  - `address_id` (integer)
  - `formatted_address` (string)

  Example:

```json
{
  "message": "Billing address updated successfully",
  "formatted_address": "John Doe, 123 Main St, New York, NY 10001, US"
}
```


- **404** — Order not found.

  Example:

```json
{
  "message": "Order not found"
}
```


- **422** — Validation error.

  Example:

```json
{
  "errors": {
    "country": [
      "The country field is required."
    ]
  }
}
```



---

## GET `/customers/{customerAddressId}/update-address-select`

**GET Select Address for Checkout**

Select an existing address and apply it to the current cart/checkout session. Updates the cart's checkout data with the selected address and returns the rendered address HTML along with updated checkout fragments.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerAddressId` | integer | yes | The address record ID to select |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with` | array<string> | no | Relationships to eager-load on the address |
| `fct_cart_hash` | string | no | Cart hash identifier to locate the active cart session |


**Responses**

- **200** — Successful response. Returns the address HTML and updated checkout fragments.

  Schema (`application/json`):

  - `message` (string)
  - `data` (string)
  - `fragments` (object)
    - _(object)_

  Example:

```json
{
  "message": "Address Attached",
  "data": "<div class=\"fct-address-info\">...</div>",
  "fragments": {
    ".fct-checkout-summary": "<div>...updated summary HTML...</div>"
  }
}
```


- **403** — Forbidden. The authenticated user does not own this address.

  Example:

```json
{
  "message": "You are not authorized to view this address"
}
```


- **404** — Address not found.

  Example:

```json
{
  "message": "Address not found"
}
```



---

## POST `/customers/{customerId}/address/make-primary`

**POST Set Address as Primary**

Mark a specific address as the primary address for its type (billing or shipping). All other addresses of the same type are demoted.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID. Must belong to the authenticated user. |


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

- **200** — Successful response. Address set as primary.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Address successfully set as the primary"
}
```


- **403** — Forbidden. The authenticated user does not own this address.

  Example:

```json
{
  "message": "You are not authorized to update this address"
}
```



---

## PUT `/customers/{customerId}/address`

**PUT Update Address (Checkout)**

Update an existing address for the authenticated customer. The address ID is passed in the request body.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID. Must belong to the authenticated user. |


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

- **200** — Successful response. Address updated.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Address updated successfully"
}
```


- **403** — Forbidden. The authenticated user does not own this address.

  Example:

```json
{
  "message": "You are not authorized to update this address"
}
```



---

## PUT `/customers/{customerId}`

**PUT Update Customer Details**

Update the authenticated customer's profile details. The customerId must match the logged-in customer's record.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `customerId` | integer | yes | The customer ID. Must belong to the authenticated user. |


**Request body** (`application/json`, required)

- `email` (string) **required** — Customer email address. Must be unique and valid. Max 255 characters.
- `first_name` (string) — Customer first name. Required when store uses separate name fields. Max 255 characters.
- `last_name` (string) — Customer last name. Max 255 characters.
- `full_name` (string) — Customer full name. Required when store uses full name mode. Max 255 characters.
- `city` (string) — Customer city
- `state` (string) — Customer state/province code
- `postcode` (string) — Customer postal/zip code
- `country` (string) — Customer country code (e.g., `US`, `GB`)
- `notes` (string) — Internal notes about the customer
- `status` (string) — Customer status

Example:

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@example.com"
}
```


**Responses**

- **200** — Successful response. Returns the updated customer data.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object)
    - _(object)_

  Example:

```json
{
  "message": "Customer updated successfully!",
  "data": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
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



---

## POST `/customer-profile/edit-address`

**POST Update Profile Address**

Update an existing address from the profile management page. The address must belong to the authenticated customer.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `id` (integer) **required** — The address record ID to update
- `type` (string) **required** _(enum: `billing`, `shipping`)_ — Address type: `billing` or `shipping`
- `name` (string) **required** _(maxLength: 255)_ — Contact name. Max 255 characters.
- `label` (string) _(maxLength: 15)_ — Short label (max 15 characters)
- `address_1` (string) — Primary street address
- `address_2` (string) — Secondary address line
- `city` (string) _(maxLength: 255)_ — City. Max 255 characters.
- `state` (string) _(maxLength: 255)_ — State/province code. Max 255 characters.
- `postcode` (string) **required** — Postal/zip code
- `country` (string) **required** — Country code (e.g., `US`, `GB`)
- `phone` (string) — Phone number
- `email` (string) **required** — Email address
- `company_name` (string) _(maxLength: 255)_ — Company name. Max 255 characters.

Example:

```json
{
  "id": 5,
  "type": "billing",
  "name": "John Smith",
  "address_1": "456 Oak Ave",
  "city": "Boston",
  "state": "MA",
  "postcode": "02101",
  "country": "US",
  "email": "john@example.com"
}
```


**Responses**

- **200** — Successful response. Address updated.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object)
    - _(object)_

  Example:

```json
{
  "message": "Customer address updated successfully!",
  "data": {
    "id": 5,
    "customer_id": 1,
    "type": "billing",
    "name": "John Smith",
    "address_1": "456 Oak Ave",
    "city": "Boston",
    "state": "MA",
    "postcode": "02101",
    "country": "US"
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



---

## POST `/customer-profile/update`

**POST Update Profile Details**

Update the authenticated customer's profile name. Also updates the associated WordPress user's first_name, last_name, and display_name.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `first_name` (string) _(maxLength: 255)_ — Customer first name. Max 255 characters.
- `last_name` (string) _(maxLength: 255)_ — Customer last name. Max 255 characters.
- `email` (string) **required** — Customer email address. Must be valid.
- `current_password` (string) — Current password (for password change flow)
- `new_password` (string) — New password (for password change flow)
- `confirm_new_password` (string) — Confirm new password (for password change flow)

Example:

```json
{
  "first_name": "John",
  "last_name": "Smith",
  "email": "john@example.com"
}
```


**Responses**

- **200** — Successful response. Profile updated.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Profile updated successfully"
}
```


- **403** — Not logged in or customer not found.

  Example:

```json
{
  "message": "You are not logged in"
}
```



---
