# FluentCart API — Dashboard & Utilities

20 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [API index](./README.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/notes/attach`

**POST Attach Note to Order**

Add or update a note on an order. The note is stored directly on the order record.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `order_id` (integer) **required** — The order ID to attach the note to
- `note` (string) **required** — The note content (sanitized as text field)

Example:

```json
{
  "order_id": 1024,
  "note": "Customer requested express shipping. Upgraded at no charge."
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Order Note Updated successfully."
}
```


- **422** — Error response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Failed to update order note."
}
```



---

## POST `/onboarding/create-pages`

**POST Create All Pages**

Create all required store pages (shop, checkout, customer profile, etc.) in bulk. Skips pages that already have valid page IDs assigned. After creation, returns the updated onboarding settings.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response - returns updated onboarding settings

  Schema (`application/json`):

  - `pages` (array<object>)
    - `id` (integer)
    - `title` (string)
    - `link` (string) _(format: uri)_
  - `currencies` (object)
    - _(object)_
  - `default_settings` (object)
    - `store_name` (string)
    - `store_logo` (string)
    - `currency` (string)
    - `shop_page_id` (string)
    - `checkout_page_id` (string)
    - `customer_profile_page_id` (string)

  Example:

```json
{
  "pages": [
    {
      "id": 10,
      "title": "Shop",
      "link": "https://example.com/shop/"
    },
    {
      "id": 12,
      "title": "Checkout",
      "link": "https://example.com/checkout/"
    }
  ],
  "currencies": {
    "USD": "United States Dollar ($)",
    "EUR": "Euro (EUR)",
    "GBP": "British Pound (GBP)"
  },
  "default_settings": {
    "store_name": "My Store",
    "store_logo": "",
    "currency": "USD",
    "shop_page_id": "10",
    "checkout_page_id": "12",
    "customer_profile_page_id": ""
  }
}
```



---

## POST `/onboarding/create-page`

**POST Create Single Page**

Create a single store page (e.g., shop, checkout, customer profile) and optionally save the page ID to store settings.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `content` (string) **required** — The page key identifier with _page_id suffix (e.g., shop_page_id, checkout_page_id, customer_profile_page_id)
- `page_name` (string) **required** — The title for the new WordPress page
- `save_settings` (boolean) _(default: `false`)_ — Whether to save the new page ID to store settings. When true, also flushes rewrite rules.

Example:

```json
{
  "content": "shop_page_id",
  "page_name": "Shop",
  "save_settings": true
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `page_id` (string) — The created WordPress page ID
  - `page_name` (string) — The page title
  - `link` (string) _(format: uri)_ — The page permalink

  Example:

```json
{
  "page_id": "156",
  "page_name": "Shop",
  "link": "https://example.com/shop/"
}
```


- **422** — Error response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Unable to create page"
}
```



---

## DELETE `/activity/{id}`

**DELETE Delete Activity**

Delete a specific activity log entry.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The activity log entry ID |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Activity Deleted Successfully"
}
```


- **404** — Activity not found

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Activity not found"
}
```



---

## GET `/address-info/get-country-info`

**GET Get Country Info**

Retrieve detailed information for a specific country including states/provinces and address locale formatting rules. Can identify the country from either a country code or a timezone string.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `country_code` | string | no | Two-letter ISO country code (e.g., US, GB). Required if timezone is not provided. |
| `timezone` | string | no | IANA timezone string (e.g., America/New_York). Used to guess the country. Takes priority over country_code. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `country_code` (string) — Two-letter ISO country code
  - `country_name` (string) — Country display name
  - `states` (array<StateOption>)
  - `address_locale` (object) — Localized address field labels and requirements
    - _(object)_

  Example:

```json
{
  "country_code": "US",
  "country_name": "United States",
  "states": [
    {
      "label": "Alabama",
      "value": "AL"
    },
    {
      "label": "Alaska",
      "value": "AK"
    },
    {
      "label": "California",
      "value": "CA"
    }
  ],
  "address_locale": {
    "state": {
      "label": "State",
      "required": true
    },
    "postcode": {
      "label": "ZIP Code",
      "required": true
    },
    "city": {
      "label": "City",
      "required": true
    }
  }
}
```



---

## GET `/dashboard/stats`

**GET Get Dashboard Stats**

Retrieve dashboard statistics widgets including total products, orders, net revenue, and refunds for the last 30 days.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `stats` (array<StatWidget>)

  Example:

```json
{
  "stats": [
    {
      "title": "Total Products",
      "current_count": 45,
      "icon": "Frame",
      "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/products?active_view=all"
    },
    {
      "title": "Orders",
      "current_count": 128,
      "icon": "AllOrdersIcon",
      "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/orders"
    },
    {
      "title": "Revenue",
      "current_count": 15420.5,
      "icon": "Currency",
      "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/reports/revenue",
      "has_currency": true
    },
    {
      "title": "Refund",
      "current_count": 350,
      "icon": "Failed",
      "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/reports/refunds",
      "has_currency": true
    }
  ]
}
```



---

## GET `/advance_filter/get-filter-options`

**GET Get Filter Options**

Retrieve dynamic filter options for the advanced filter dropdowns. Supports loading product variations, labels, and extensible custom data keys via WordPress filters.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `remote_data_key` | string | yes | The type of filter options to retrieve. Built-in values: product_variations, labels. Custom values are resolved via WordPress filters. |
| `search` | string | no | Search query to filter options |
| `include_ids` | string | no | Specific IDs to include in results |
| `limit` | integer | no | Maximum number of options to return |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `options` (array<FilterOption>)

  Example:

```json
{
  "options": [
    {
      "id": 1,
      "title": "Premium T-Shirt - Small / Red",
      "children": [
        {
          "id": 10,
          "title": "Small / Red"
        },
        {
          "id": 11,
          "title": "Medium / Blue"
        }
      ]
    }
  ]
}
```



---

## GET `/dashboard`

**GET Get Onboarding Data**

Retrieve the onboarding checklist with completion status for each setup step. Used to display the getting-started wizard on the dashboard.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (object)
    - `steps` (object)
      - _(object)_
    - `completed` (integer) — Number of completed steps

  Example:

```json
{
  "data": {
    "steps": {
      "page_setup": {
        "title": "Setup Pages",
        "text": "Customers to find what they're looking for by organising.",
        "icon": "Cart",
        "completed": false,
        "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/settings/store-settings/pages_setup"
      },
      "store_info": {
        "title": "Add Details to Store",
        "text": "Store details such as addresses, company info etc.",
        "icon": "StoreIcon",
        "completed": true,
        "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/settings/store-settings/"
      },
      "product_info": {
        "title": "Add Your First Product",
        "text": "Share your brand story and build trust with customers.",
        "icon": "ShoppingCartIcon",
        "completed": false,
        "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/products"
      },
      "setup_payments": {
        "title": "Setup Payment Methods",
        "text": "Choose from fast & secure online and offline payment.",
        "icon": "PaymentIcon",
        "completed": true,
        "url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/settings/payments"
      }
    },
    "completed": 2
  }
}
```



---

## GET `/onboarding`

**GET Get Onboarding Settings**

Retrieve the current store settings, available pages, and currency options for the onboarding wizard.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `pages` (array<PageOption>)
  - `currencies` (object) — Map of currency codes to display labels
    - _(object)_
  - `default_settings` (OnboardingDefaults)

  Example:

```json
{
  "pages": [
    {
      "id": 10,
      "title": "Shop",
      "link": "https://example.com/shop/"
    },
    {
      "id": 12,
      "title": "Checkout",
      "link": "https://example.com/checkout/"
    }
  ],
  "currencies": {
    "USD": "United States Dollar ($)",
    "EUR": "Euro (EUR)",
    "GBP": "British Pound (GBP)"
  },
  "default_settings": {
    "store_name": "My Store",
    "store_logo": "",
    "currency": "USD",
    "shop_page_id": "10",
    "checkout_page_id": "12",
    "customer_profile_page_id": ""
  }
}
```



---

## GET `/templates/print-templates`

**GET Get Print Templates**

Retrieve all available print templates. Returns saved custom templates or falls back to default templates.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `templates` (array<PrintTemplate>)

  Example:

```json
{
  "templates": [
    {
      "key": "invoice_template",
      "title": "Invoice Template",
      "content": "<html>...invoice HTML template with shortcodes...</html>"
    },
    {
      "key": "packing_slip",
      "title": "Packing Slip Template",
      "content": "<html>...packing slip HTML template...</html>"
    },
    {
      "key": "delivery_slip",
      "title": "Delivery Slip Template",
      "content": "<html>...delivery slip HTML template...</html>"
    },
    {
      "key": "shipping_slip",
      "title": "Shipping Slip Template",
      "content": "<html>...shipping slip HTML template...</html>"
    },
    {
      "key": "dispatch_slip",
      "title": "Dispatch Slip Template",
      "content": "<html>...dispatch slip HTML template...</html>"
    }
  ]
}
```



---

## GET `/forms/search_options`

**GET Get Search Options**

Retrieve dynamic search/autocomplete options for form fields. Options are resolved via the fluent_cart/get_dynamic_search_{search_for} WordPress filter, allowing modules to provide context-specific search data.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search_for` | string | yes | The type of search options to retrieve (used as the filter key suffix) |
| `search_by` | string | no | Additional search context or query string passed to the filter |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `options` (array<SearchOption>)

  Example:

```json
{
  "options": [
    {
      "id": "option_1",
      "label": "Option Label",
      "value": "option_value"
    }
  ]
}
```



---

## GET `/widgets`

**GET Get Widgets**

Retrieve dynamic widget data for a specific context. Widgets are loaded via WordPress filters, allowing modules and extensions to register custom widgets.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `filter` | string | no | Widget context identifier (the fluent_cart_ prefix is automatically stripped). Example: single_order_page |
| `data[order_id]` | integer | no | Additional context data. For single_order_page filter, must include order_id. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `widgets` (array<Widget>)

  Example:

```json
{
  "widgets": [
    {
      "title": "Customer Lifetime Value",
      "value": "$1,250.00",
      "type": "stat"
    }
  ]
}
```


- **404** — Order not found (when filter is single_order_page)

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Order not found"
}
```



---

## GET `/app/init`

**GET Initialize App**

Initialize the admin application by loading REST API configuration, asset URLs, translation strings, and shop configuration. This is the first call made when the admin SPA loads.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `rest` (RestConfig)
  - `asset_url` (string) _(format: uri)_ — Base URL for plugin assets
  - `trans` (object) — Translation strings map
    - _(object)_
  - `shop` (ShopConfig)

  Example:

```json
{
  "rest": {
    "base_url": "https://example.com/wp-json/",
    "url": "https://example.com/wp-json/fluent-cart/v2/",
    "nonce": "abc123def456",
    "namespace": "fluent-cart",
    "version": "v2"
  },
  "asset_url": "https://example.com/wp-content/plugins/fluent-cart/assets/",
  "trans": {
    "Dashboard": "Dashboard",
    "Products": "Products",
    "Orders": "Orders"
  },
  "shop": {
    "currency": "USD",
    "currency_sign": "$",
    "currency_sign_position": "left",
    "decimal_separator": ".",
    "thousands_separator": ",",
    "number_of_decimals": 2,
    "store_name": "My Store",
    "store_logo": "https://example.com/wp-content/uploads/logo.png"
  }
}
```



---

## GET `/activity`

**GET List Activities**

Retrieve a paginated list of activity log entries with filtering and sorting support.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search by ID (prefix with #), title, content, or module name |
| `active_view` | string | no | Filter by tab |
| `sort_by` | string | no | Column to sort by |
| `sort_type` | string | no | Sort direction |
| `per_page` | integer | no | Results per page (max 200) |
| `page` | integer | no | Page number for pagination |
| `filter_type` | string | no | Filter mode |
| `advanced_filters` | string | no | JSON-encoded advanced filter groups (requires filter_type=advanced and Pro) |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `activities` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `data` (array<ActivityLogEntry>)

  Example:

```json
{
  "activities": {
    "total": 156,
    "per_page": 10,
    "current_page": 1,
    "last_page": 16,
    "data": [
      {
        "id": 42,
        "title": "Order #1024 status changed",
        "content": "Order status changed from pending to completed",
        "status": "success",
        "log_type": "activity",
        "module_name": "orders",
        "read_status": "unread",
        "created_at": "2025-06-15 14:30:00",
        "updated_at": "2025-06-15 14:30:00"
      }
    ]
  }
}
```



---

## GET `/app/attachments`

**GET List Attachments**

Retrieve all image attachments from the WordPress media library. Used for the media picker in the admin interface.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `attachments` (array<Attachment>)

  Example:

```json
{
  "attachments": [
    {
      "id": 101,
      "title": "product-image",
      "url": "https://example.com/wp-content/uploads/2025/01/product-image.jpg"
    },
    {
      "id": 102,
      "title": "store-logo",
      "url": "https://example.com/wp-content/uploads/2025/01/store-logo.png"
    }
  ]
}
```


- **404** — No images found

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "No Images Found"
}
```



---

## GET `/address-info/countries`

**GET List Countries**

Retrieve a list of all available countries formatted as select options.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `data` (array<CountryOption>)

  Example:

```json
{
  "data": [
    {
      "label": "United States",
      "value": "US"
    },
    {
      "label": "United Kingdom",
      "value": "GB"
    },
    {
      "label": "Canada",
      "value": "CA"
    }
  ]
}
```



---

## PUT `/activity/{id}/mark-read`

**PUT Mark Activity Read/Unread**

Toggle the read status of an activity log entry.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The activity log entry ID |


**Request body** (`application/json`, required)

- `status` (string) **required** _(enum: `read`, `unread`)_ — New read status

Example:

```json
{
  "status": "read"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Activity Marked as Read"
}
```



---

## POST `/onboarding`

**POST Save Onboarding Settings**

Save store settings during the onboarding process. Merges submitted values with existing store settings. If a category value is provided, dummy products are created asynchronously.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `store_name` (string) — The store name
- `store_logo` (string) — URL of the store logo
- `currency` (string) — Store currency code (e.g., USD, EUR)
- `category` (string) — Product category for generating dummy products. Excluded from saved settings but triggers async dummy product creation.

Example:

```json
{
  "store_name": "My Awesome Store",
  "store_logo": "https://example.com/wp-content/uploads/logo.png",
  "currency": "USD"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Store has been updated successfully"
}
```


- **422** — Validation error

  Schema (`application/json`):

  - `errors` (string)

  Example:

```json
{
  "errors": "Failed to update!"
}
```



---

## PUT `/templates/print-templates`

**PUT Save Print Templates**

Save customized print templates. Each template's content is sanitized with wp_kses_post before saving.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `templates` (array<object>) **required**
  - `key` (string) **required** — Template identifier (e.g., invoice_template, packing_slip)
  - `content` (string) **required** — HTML template content with shortcodes

Example:

```json
{
  "templates": [
    {
      "key": "invoice_template",
      "content": "<html><body><h1>Invoice #{order_id}</h1>...</body></html>"
    }
  ]
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Template saved successfully"
}
```



---

## POST `/app/upload-attachments`

**POST Upload Attachment**

Upload an image file to the WordPress media library.

**Auth:** ApplicationPasswords

**Request body** (`multipart/form-data`, required)

- `file` (string) **required** _(format: binary)_ — Image file to upload. Only image MIME types are accepted.

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `id` (integer) — WordPress attachment ID
  - `title` (string) — Attachment title
  - `url` (string) _(format: uri)_ — Attachment URL

  Example:

```json
{
  "id": 103,
  "title": "new-product-photo",
  "url": "https://example.com/wp-content/uploads/2025/01/new-product-photo.jpg"
}
```


- **400** — Invalid file type or no file attached

  Schema (`application/json`):

  - `error` (string)
  - `message` (string)

  Example:

```json
{
  "error": "Error Uploading File"
}
```



---
