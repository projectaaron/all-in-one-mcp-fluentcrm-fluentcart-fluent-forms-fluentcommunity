# FluentCart API — Coupons

12 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/coupons/apply`

**POST Apply Coupon**

Apply a coupon code to a set of order line items. This endpoint validates the coupon, checks eligibility for each line item, and returns the recalculated discount breakdown.

**Required permissions:** all of `orders/create`, `orders/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `coupon_code` (string) **required** — The coupon code to apply
- `order_items` (array<OrderItem>) **required** — Array of order line item objects
- `order_uuid` (string) _(maxLength: 100)_ — UUID of an existing order to apply the coupon to. When provided, previously applied coupons from the order are included.
- `applied_coupons` (array<integer>) — Array of coupon IDs that are already applied (but not yet persisted to the order)
- `customer_email` (string) _(format: email)_ — Customer email for email-based coupon restrictions

Example:

```json
{
  "coupon_code": "WELCOME20",
  "order_items": [
    {
      "post_id": 123,
      "quantity": 1,
      "price": 9900,
      "unit_price": 9900,
      "item_total": 9900,
      "line_total": 9900,
      "other_info": {
        "payment_type": "onetime"
      }
    }
  ],
  "applied_coupons": [],
  "customer_email": "sarah.johnson@example.com"
}
```


**Responses**

- **200** — Coupon applied successfully. Returns the applied coupons and recalculated items.

  Schema (`application/json`):

  - `applied_coupons` (object) — Map of coupon codes to their applied details
    - _(object)_
  - `calculated_items` (array<CalculatedItem>) — Recalculated order items with discounts

  Example:

```json
{
  "applied_coupons": {
    "WELCOME20": {
      "id": 3,
      "title": "Welcome Discount",
      "code": "WELCOME20",
      "type": "percent",
      "amount": 20,
      "discount_amount": 1980,
      "stackable": "no",
      "priority": 10
    }
  },
  "calculated_items": [
    {
      "post_id": 123,
      "quantity": 1,
      "price": 9900,
      "discounted_price": 7920,
      "discount_total": 1980
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

## POST `/coupons/cancel`

**POST Cancel Coupon**

Remove a coupon from an order and recalculate the remaining discounts. If an order_uuid is provided and the coupon was already persisted to the order, it is deleted from the fct_applied_coupons table and the coupon's use_count is decremented.

**Required permissions:** all of `orders/create`, `orders/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `coupon_code` (string) **required** — The coupon code to cancel
- `order_items` (array<OrderItem>) **required** — Array of current order line item objects
- `id` (integer) — The applied coupon record ID (from fct_applied_coupons). Required to delete the persisted record from an existing order.
- `order_uuid` (string) _(maxLength: 100)_ — UUID of the existing order
- `applied_coupons` (array<integer>) — Array of remaining coupon IDs that should stay applied
- `customer_email` (string) _(format: email)_ — Customer email address

Example:

```json
{
  "coupon_code": "WELCOME20",
  "id": 9,
  "order_uuid": "e7b3a1d4-5f2c-48e9-a6b1-c3d4e5f67890",
  "order_items": [
    {
      "post_id": 123,
      "quantity": 1,
      "price": 9900,
      "unit_price": 9900,
      "item_total": 9900,
      "line_total": 9900
    }
  ],
  "applied_coupons": [
    5
  ]
}
```


**Responses**

- **200** — Coupon cancelled successfully. Returns remaining applied coupons and recalculated items.

  Schema (`application/json`):

  - `applied_coupons` (object) — Map of remaining coupon codes to their applied details
    - _(object)_
  - `calculated_items` (array<CalculatedItem>) — Recalculated order items with remaining discounts

  Example:

```json
{
  "applied_coupons": {
    "SUMMER15": {
      "id": 5,
      "title": "Summer Sale 15%",
      "code": "SUMMER15",
      "type": "percent",
      "amount": 15,
      "discount_amount": 1485,
      "stackable": "yes",
      "priority": 5
    }
  },
  "calculated_items": [
    {
      "post_id": 123,
      "quantity": 1,
      "price": 9900,
      "discounted_price": 8415,
      "discount_total": 1485
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

## POST `/coupons/checkProductEligibility`

**POST Check Product Eligibility**

Check whether a product is eligible for a set of applied coupons. This is used in the order form to validate that adding a product does not conflict with currently applied coupons.

**Required permissions:** all of `orders/create`, `orders/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `productId` (integer) **required** — The product (post) ID to check eligibility for
- `appliedCoupons` (array<string>) — Array of coupon codes currently applied. Each code is checked against the product's categories and the coupon's inclusion/exclusion rules.
- `origin` (string) — The context where the check originates (e.g., checkout, admin_order)

Example:

```json
{
  "productId": 123,
  "appliedCoupons": [
    "WELCOME20",
    "SUMMER15"
  ],
  "origin": "admin_order"
}
```


**Responses**

- **200** — Eligibility check result.

  Schema (`application/json`):

  - `isApplicable` (boolean) — Whether the product is eligible for the applied coupons
  - `message` (string) — Reason for ineligibility (only present when isApplicable is false)

  Example:

```json
{
  "eligible": true,
  "product_id": 123,
  "coupon_codes": [
    "WELCOME20",
    "SUMMER25"
  ],
  "applicable_coupons": [
    {
      "id": 3,
      "code": "WELCOME20",
      "type": "percent",
      "amount": 2000,
      "title": "Welcome Discount"
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

## POST `/coupons`

**POST Create Coupon**

Create a new discount coupon.

**Required permission:** `coupons/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `title` (string) **required** _(maxLength: 200)_ — Coupon display name
- `code` (string) **required** _(maxLength: 50)_ — Unique coupon code. Must be unique across all coupons.
- `type` (string) **required** _(enum: `fixed`, `percentage`, `free_shipping`, `buy_x_get_y`)_ — Discount type
- `amount` (number) **required** _(min: 0)_ — Discount amount. For percentage: value 0-100. For fixed: amount in store currency (auto-converted to cents).
- `status` (string) **required** _(enum: `active`, `expired`, `disabled`, `scheduled`)_ — Coupon status
- `stackable` (string) **required** _(enum: `yes`, `no`; maxLength: 50)_ — Whether coupon can be combined with others
- `show_on_checkout` (string) **required** _(enum: `yes`, `no`; maxLength: 50)_ — Whether to display the coupon on checkout
- `priority` (integer) _(min: 0)_ — Sort priority for discount calculation order. Lower numbers are applied first.
- `notes` (string) — Internal notes about the coupon
- `start_date` (string) _(format: date-time)_ — Start date in any parseable datetime format. Required if end_date is provided. Automatically converted to GMT.
- `end_date` (string) _(format: date-time)_ — End date in any parseable datetime format. Must be after start_date.
- `conditions` (object) — Coupon conditions and restrictions
  - `min_purchase_amount` (number) — Minimum purchase amount in store currency (auto-converted to cents)
  - `max_discount_amount` (number) — Maximum discount cap in store currency (auto-converted to cents)
  - `max_purchase_amount` (number) — Maximum purchase amount allowed
  - `apply_to_whole_cart` (string) _(enum: `yes`, `no`)_ — Apply discount to the entire cart
  - `apply_to_quantity` (string) _(enum: `yes`, `no`)_ — Apply discount per quantity
  - `max_uses` (integer) — Maximum total uses across all customers. Must be >= max_per_customer.
  - `max_per_customer` (integer) — Maximum uses per individual customer
  - `included_products` (array<integer>) — Product IDs the coupon is limited to
  - `excluded_products` (array<integer>) — Product IDs excluded from the coupon
  - `included_categories` (array<integer>) — Category IDs the coupon is limited to
  - `excluded_categories` (array<integer>) — Category IDs excluded from the coupon
  - `email_restrictions` (string) — Email-based restriction
  - `is_recurring` (string) _(enum: `yes`, `no`)_ — Whether the coupon applies to subscription renewals
  - `buy_products` (array<integer>) — Product IDs for the buy part of buy-x-get-y coupons
  - `get_products` (array<integer>) — Product IDs for the get part of buy-x-get-y coupons

Example:

```json
{
  "title": "Summer Sale 20%",
  "code": "SUMMER20",
  "type": "percentage",
  "amount": 20,
  "status": "active",
  "stackable": "yes",
  "show_on_checkout": "yes",
  "priority": 1,
  "start_date": "2025-06-01 00:00:00",
  "end_date": "2025-08-31 23:59:59",
  "conditions": {
    "min_purchase_amount": 20,
    "max_discount_amount": 50,
    "max_uses": 500,
    "max_per_customer": 2,
    "apply_to_whole_cart": "yes",
    "is_recurring": "no"
  }
}
```


**Responses**

- **200** — Coupon created successfully.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object) — The created coupon object
    - _(object)_

  Example:

```json
{
  "message": "Coupon created successfully!",
  "data": {
    "id": 7,
    "parent": null,
    "title": "Summer Sale 20%",
    "code": "SUMMER20",
    "status": "active",
    "type": "percent",
    "conditions": {
      "min_purchase_amount": 2000,
      "max_discount_amount": 5000,
      "max_purchase_amount": 0,
      "apply_to_whole_cart": "yes",
      "apply_to_quantity": "no",
      "max_uses": 500,
      "max_per_customer": 2,
      "excluded_categories": [],
      "included_categories": [],
      "excluded_products": [],
      "included_products": [],
      "email_restrictions": "",
      "is_recurring": "no"
    },
    "amount": 20,
    "stackable": "yes",
    "priority": 1,
    "use_count": 0,
    "notes": "Summer promotional campaign - limited to new signups",
    "show_on_checkout": "yes",
    "start_date": "2025-06-01 00:00:00",
    "end_date": "2025-08-31 23:59:59",
    "created_at": "2025-05-25 10:00:00",
    "updated_at": "2025-05-25 10:00:00"
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


- **403** — Authenticated, but the user lacks the required capability (`coupons/manage`).

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
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "code": [
      "The code field is required."
    ],
    "type": [
      "The type field is required."
    ],
    "amount": [
      "The amount field is required."
    ]
  }
}
```



---

## DELETE `/coupons/{id}`

**DELETE Coupon**

Permanently delete a coupon.

**Required permission:** `coupons/delete`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The coupon ID |


**Responses**

- **200** — Coupon deleted successfully.

  Schema (`application/json`):

  - `message` (string)
  - `data` (string)

  Example:

```json
{
  "message": "Coupon successfully deleted.",
  "data": ""
}
```


- **400** — Deletion failed.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Coupon deletion failed!"
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


- **403** — Invalid coupon ID.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Please use a valid coupon ID!"
}
```


- **404** — Coupon not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Coupon not found in database, failed to remove."
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

## GET `/coupons/{id}`

**GET Coupon Details**

Retrieve detailed information about a specific coupon, including its activity log. The coupon status is automatically updated to expired if its end_date has passed.

**Required permission:** `coupons/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The coupon ID |


**Responses**

- **200** — Successful response. Returns the coupon details with activity log.

  Schema (`application/json`):

  - `coupon` (CouponDetail)

  Example:

```json
{
  "coupon": {
    "id": 3,
    "title": "Welcome Discount",
    "code": "WELCOME20",
    "status": "active",
    "type": "percent",
    "conditions": {
      "min_purchase_amount": 2000,
      "max_discount_amount": 10000,
      "max_purchase_amount": 0,
      "apply_to_whole_cart": "no",
      "apply_to_quantity": "no",
      "max_uses": 500,
      "max_per_customer": 1,
      "excluded_categories": [],
      "included_categories": [],
      "excluded_products": [],
      "included_products": [],
      "email_restrictions": "",
      "is_recurring": "no"
    },
    "amount": 20,
    "stackable": "no",
    "priority": 10,
    "use_count": 47,
    "notes": "20% off for new customers",
    "show_on_checkout": "yes",
    "start_date": "2025-01-01 00:00:00",
    "end_date": "2025-12-31 23:59:59",
    "created_at": "2025-01-01 10:00:00",
    "updated_at": "2025-09-15 08:30:00",
    "activities": [
      {
        "id": 8,
        "title": "Coupon Created",
        "content": "Coupon \"WELCOME20\" created by Admin",
        "status": "success",
        "user_id": 1,
        "created_at": "2025-01-01 10:00:00",
        "user": {
          "ID": 1,
          "display_name": "Admin"
        }
      },
      {
        "id": 24,
        "title": "Coupon Updated",
        "content": "Coupon \"WELCOME20\" updated - max uses changed from 200 to 500",
        "status": "info",
        "user_id": 1,
        "created_at": "2025-06-10 11:15:00",
        "user": {
          "ID": 1,
          "display_name": "Admin"
        }
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


- **403** — Authenticated, but the user lacks the required capability (`coupons/view`).

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

## GET `/coupons/getSettings`

**GET Coupon Settings**

Retrieve the global coupon settings (currently, whether coupon input is shown on the checkout page).

**Required permission:** `coupons/view`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns the global coupon settings.

  Schema (`application/json`):

  - `show_on_checkout` (integer) — Whether the coupon code input is displayed on the checkout page. 1 for yes, 0 for no.

  Example:

```json
{
  "show_on_checkout": 1
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


- **403** — Authenticated, but the user lacks the required capability (`coupons/view`).

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

## GET `/coupons/listCoupons`

**GET List Coupon Codes**

Retrieve a simple array of active coupon codes. This lightweight endpoint is designed for use in order creation forms and quick coupon lookups.

**Required permissions:** all of `orders/create`, `orders/manage`, `coupons/view`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns an array of active coupon code strings.

  Schema (`application/json`):

  - `coupons` (array<string>) — Array of active coupon code strings

  Example:

```json
{
  "coupons": [
    "WELCOME20",
    "SUMMER25",
    "LAUNCH50",
    "FREESHIP"
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


- **403** — Authenticated, but the user lacks the required capability (`orders/create, orders/manage, coupons/view`).

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

## GET `/coupons`

**GET List Coupons**

Retrieve a paginated list of coupons with optional filtering, sorting, and search. Coupon statuses are automatically updated based on their start/end dates before the response is returned.

**Required permission:** `coupons/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | no | Page number for pagination |
| `per_page` | integer | no | Number of records per page (1-199, default: 10) |
| `search` | string | no | Search by coupon title, code, or ID. If the search string contains %, it searches percentage-type coupons by amount. Numeric values also match the amount field. Supports operator syntax (e.g., status = active, id > 5). |
| `sort_by` | string | no | Column to sort by (default: id). Must be a fillable column on the Coupon model. |
| `sort_type` | string | no | Sort direction: asc or desc (default: desc) |
| `active_view` | string | no | Tab filter. active = status is active. expired = end_date has passed or status != active. |
| `filter_type` | string | no | Filter mode: simple (default) or advanced |
| `advanced_filters` | string | no | JSON-encoded array of advanced filter groups (requires Pro) |
| `with` | string | no | Eager-load relations (comma-separated or array) |
| `select` | string | no | Comma-separated list of columns to select |
| `include_ids` | string | no | Comma-separated IDs that must always be included in results |
| `user_tz` | string | no | User timezone for date filtering (e.g., America/New_York) |


**Responses**

- **200** — Successful response. Returns a paginated list of coupons.

  Schema (`application/json`):

  - `coupons` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `first_page_url` (string) — URL to the first page of results
    - `from` (integer) — Index of the first item on this page
    - `last_page_url` (string) — URL to the last page of results
    - `links` (array<object>) — Pagination links for previous, numbered pages, and next
      - `url` (string)
      - `label` (string)
      - `active` (boolean)
    - `next_page_url` (string) — URL to the next page of results
    - `path` (string) — Base URL without query string
    - `prev_page_url` (string) — URL to the previous page of results
    - `to` (integer) — Index of the last item on this page
    - `data` (array<Coupon>)

  Example:

```json
{
  "coupons": {
    "total": 25,
    "per_page": 10,
    "current_page": 1,
    "last_page": 3,
    "first_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/coupons/?page=1",
    "from": 1,
    "last_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/coupons/?page=3",
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/coupons/?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/coupons/?page=2",
        "label": "2",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/coupons/?page=3",
        "label": "3",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/coupons/?page=2",
        "label": "pagination.next",
        "active": false
      }
    ],
    "next_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/coupons/?page=2",
    "path": "https://yoursite.com/wp-json/fluent-cart/v2/coupons",
    "prev_page_url": null,
    "to": 10,
    "data": [
      {
        "id": 3,
        "parent": null,
        "title": "Welcome Discount",
        "code": "WELCOME20",
        "status": "active",
        "type": "percent",
        "conditions": {
          "min_purchase_amount": 2000,
          "max_discount_amount": 10000,
          "max_purchase_amount": 0,
          "apply_to_whole_cart": "no",
          "apply_to_quantity": "no",
          "max_uses": 500,
          "max_per_customer": 1,
          "excluded_categories": [],
          "included_categories": [],
          "excluded_products": [],
          "included_products": [],
          "email_restrictions": "",
          "is_recurring": "no"
        },
        "amount": 20,
        "stackable": "no",
        "priority": 10,
        "use_count": 47,
        "notes": "20% off for new customers",
        "show_on_checkout": "yes",
        "start_date": "2025-01-01 00:00:00",
        "end_date": "2025-12-31 23:59:59",
        "created_at": "2025-01-01 10:00:00",
        "updated_at": "2025-09-15 08:30:00",
        "total_items": 47
      },
      {
        "id": 5,
        "parent": null,
        "title": "Summer Sale 25%",
        "code": "SUMMER25",
        "status": "active",
        "type": "percent",
        "conditions": {
          "min_purchase_amount": 3000,
          "max_discount_amount": 15000,
          "max_purchase_amount": 0,
          "apply_to_whole_cart": "yes",
          "apply_to_quantity": "no",
          "max_uses": 300,
          "max_per_customer": 2,
          "excluded_categories": [],
          "included_categories": [],
          "excluded_products": [],
          "included_products": [],
          "email_restrictions": "",
          "is_recurring": "no"
        },
        "amount": 25,
        "stackable": "yes",
        "priority": 5,
        "use_count": 89,
        "notes": "Summer promotional campaign - 25% off all plans",
        "show_on_checkout": "yes",
        "start_date": "2025-06-01 00:00:00",
        "end_date": "2025-08-31 23:59:59",
        "created_at": "2025-05-25 10:00:00",
        "updated_at": "2025-08-20 16:45:00",
        "total_items": 89
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


- **403** — Authenticated, but the user lacks the required capability (`coupons/view`).

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

## POST `/coupons/re-apply`

**POST Re-apply Coupons**

Recalculate all previously applied coupons against the current order items. This is used when order items change (e.g., quantity update, item added/removed) and discounts need to be recalculated. If order_items is empty, all applied coupons on the order are deleted.

**Required permissions:** all of `orders/create`, `orders/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `order_uuid` (string) — UUID of the existing order whose applied coupons should be reapplied
- `order_items` (array<OrderItem>) — Array of current order line item objects. If empty, all applied coupons on the order are removed.
- `applied_coupons` (array<integer>) — Array of coupon IDs to include (in addition to those already on the order). Values are cast to integers.

Example:

```json
{
  "order_uuid": "e7b3a1d4-5f2c-48e9-a6b1-c3d4e5f67890",
  "order_items": [
    {
      "post_id": 123,
      "quantity": 1,
      "price": 9900,
      "unit_price": 9900,
      "item_total": 9900,
      "line_total": 9900
    },
    {
      "post_id": 130,
      "quantity": 2,
      "price": 4900,
      "unit_price": 4900,
      "item_total": 9800,
      "line_total": 9800
    }
  ],
  "applied_coupons": [
    3
  ]
}
```


**Responses**

- **200** — Coupons re-applied successfully. Returns the recalculated applied coupons and items.

  Schema (`application/json`):

  - `applied_coupons` (object) — Map of coupon codes to their re-applied details
    - _(object)_
  - `calculated_items` (array<CalculatedItem>) — Recalculated order items with discounts

  Example:

```json
{
  "applied_coupons": {
    "WELCOME20": {
      "id": 3,
      "title": "Welcome Discount",
      "code": "WELCOME20",
      "type": "percent",
      "amount": 20,
      "discount_amount": 3940,
      "stackable": "no",
      "priority": 10
    }
  },
  "calculated_items": [
    {
      "post_id": 123,
      "quantity": 1,
      "price": 9900,
      "discounted_price": 7920,
      "discount_total": 1980
    },
    {
      "post_id": 130,
      "quantity": 2,
      "price": 4900,
      "discounted_price": 3920,
      "discount_total": 1960
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

## POST `/coupons/storeCouponSettings`

**POST Store Coupon Settings**

Update the global coupon settings. Currently controls whether the coupon input field is displayed on the checkout page.

**Required permission:** `coupons/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `show_on_checkout` (boolean) — Whether to show the coupon input on the checkout page. Any truthy value sets it to 1, falsy sets to 0.

Example:

```json
{
  "show_on_checkout": true
}
```


**Responses**

- **200** — Settings saved successfully. Response varies based on whether the setting already existed.

  Example:

```json
{
  "message": "Coupon settings saved successfully.",
  "settings": {
    "enable_coupons": true,
    "auto_apply_coupons": false,
    "max_coupons_per_order": 3,
    "allow_stackable_coupons": false
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


- **403** — Authenticated, but the user lacks the required capability (`coupons/manage`).

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

## PUT `/coupons/{id}`

**PUT Update Coupon**

Update an existing coupon. Accepts the same fields as Create Coupon. The code uniqueness check excludes the current coupon.

**Required permission:** `coupons/manage`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The coupon ID |


**Request body** (`application/json`, required)

- `title` (string) **required** _(maxLength: 200)_ — Coupon display name
- `code` (string) **required** _(maxLength: 50)_ — Unique coupon code
- `type` (string) **required** _(enum: `fixed`, `percentage`, `free_shipping`, `buy_x_get_y`)_ — Discount type
- `amount` (number) **required** _(min: 0)_ — Discount amount. For percentage: value 0-100. For fixed: amount in store currency.
- `status` (string) **required** _(enum: `active`, `expired`, `disabled`, `scheduled`)_ — Coupon status
- `stackable` (string) **required** _(enum: `yes`, `no`)_ — Whether coupon can be combined with others
- `show_on_checkout` (string) **required** _(enum: `yes`, `no`)_ — Whether to display the coupon on checkout
- `priority` (integer) _(min: 0)_ — Sort priority
- `notes` (string) — Internal notes
- `start_date` (string) _(format: date-time)_ — Start date. Required if end_date is provided.
- `end_date` (string) _(format: date-time)_ — End date. Must be after start_date.
- `conditions` (object) — Coupon conditions and restrictions
  - _(object)_

Example:

```json
{
  "title": "Summer Sale 25%",
  "code": "SUMMER25",
  "type": "percentage",
  "amount": 25,
  "status": "active",
  "stackable": "yes",
  "show_on_checkout": "yes"
}
```


**Responses**

- **200** — Coupon updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `data` (object) — The updated coupon object
    - _(object)_

  Example:

```json
{
  "message": "Coupon updated successfully!",
  "data": {
    "id": 5,
    "title": "Summer Sale 25%",
    "code": "SUMMER25",
    "status": "active",
    "type": "percent",
    "amount": 25,
    "conditions": {
      "min_purchase_amount": 3000,
      "max_discount_amount": 15000,
      "max_purchase_amount": 0,
      "apply_to_whole_cart": "yes",
      "apply_to_quantity": "no",
      "max_uses": 300,
      "max_per_customer": 2,
      "excluded_categories": [],
      "included_categories": [],
      "excluded_products": [],
      "included_products": [],
      "email_restrictions": "",
      "is_recurring": "no"
    },
    "stackable": "yes",
    "priority": 1,
    "use_count": 12,
    "notes": "Summer promotional campaign - 25% off all plans",
    "show_on_checkout": "yes",
    "start_date": "2025-06-01 00:00:00",
    "end_date": "2025-08-31 23:59:59",
    "created_at": "2025-05-25 10:00:00",
    "updated_at": "2025-06-20 11:00:00"
  }
}
```


- **400** — Update failed.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Coupon update failed."
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


- **403** — Invalid coupon.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Please edit a valid coupon!"
}
```


- **404** — Coupon not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Coupon not found, please reload the page and try again!"
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
