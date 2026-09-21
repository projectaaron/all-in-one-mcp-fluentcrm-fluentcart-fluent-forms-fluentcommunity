# FluentCart API — Dashboard & Utilities

22 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/notes/attach`

**POST Attach Note to Order**

Add or update a note on an order. The note is stored directly on the order record.

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

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

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

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

## POST `/onboarding/create-page`

**POST Create Single Page**

Create a single store page (e.g., shop, checkout, customer profile) and optionally save the page ID to store settings.

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

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

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

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


- **404** — Activity not found

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Activity not found"
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

## GET `/address-info/get-country-info`

**GET Get Country Info**

Retrieve detailed information for a specific country including states/provinces and address locale formatting rules. Can identify the country from either a country code or a timezone string.

**Access policy:** `UserPolicy`

**Access policy:** `UserPolicy`

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



---

## GET `/dashboard/stats`

**GET Get Dashboard Stats**

Retrieve dashboard statistics widgets including total products, orders, net revenue, and refunds for the last 30 days.

**Required permission:** `dashboard_stats/view`

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


- **403** — Authenticated, but the user lacks the required capability (`dashboard_stats/view`).

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

## GET `/advance_filter/get-filter-options`

**GET Get Filter Options**

Retrieve dynamic filter options for the advanced filter dropdowns. Supports loading product variations, labels, and extensible custom data keys via WordPress filters.

**Access policy:** `AdvanceFilterPolicy`

**Access policy:** `AdvanceFilterPolicy`

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



---

## GET `/dashboard`

**GET Get Onboarding Data**

Retrieve the onboarding checklist with completion status for each setup step. Used to display the getting-started wizard on the dashboard.

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

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



---

## GET `/onboarding`

**GET Get Onboarding Settings**

Retrieve the current store settings, available pages, and currency options for the onboarding wizard.

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `pages` (array<PageOption>) — Pages available for the onboarding wizard's page pickers (e.g. Privacy Policy, Terms & Conditions), formatted as label/value options.
  - `currencies` (array<CurrencyOption>) — Available store currencies, formatted as label/value options.
  - `default_settings` (OnboardingDefaults)
  - `tax_settings` (OnboardingTaxSettings)

  Example:

```json
{
  "pages": [
    {
      "label": "Shop( 10 )",
      "value": "10"
    },
    {
      "label": "Checkout( 12 )",
      "value": "12"
    }
  ],
  "currencies": [
    {
      "label": "United States Dollar",
      "value": "USD"
    },
    {
      "label": "Euro",
      "value": "EUR"
    },
    {
      "label": "British Pound",
      "value": "GBP"
    }
  ],
  "default_settings": {
    "reminders_enabled": "no",
    "yearly_renewal_reminders_enabled": "yes",
    "yearly_renewal_reminder_days": "30",
    "trial_end_reminders_enabled": "yes",
    "trial_end_reminder_days": "3",
    "monthly_renewal_reminders_enabled": "no",
    "monthly_renewal_reminder_days": "7",
    "quarterly_renewal_reminders_enabled": "no",
    "quarterly_renewal_reminder_days": "14",
    "half_yearly_renewal_reminders_enabled": "no",
    "half_yearly_renewal_reminder_days": "21",
    "renewal_reminders_enabled": "no",
    "renewal_reminder_overdue_days": "1,3,7",
    "store_name": "My Store",
    "company_name": "",
    "legal_registration_id": "",
    "seller_vat_id": "",
    "seller_tax_id": "",
    "note_for_user_account_creation": "An user account will be created",
    "checkout_button_text": "Checkout",
    "view_cart_button_text": "View Cart",
    "cart_button_text": "Add To Cart",
    "popup_button_text": "View Product",
    "out_of_stock_button_text": "Out of stock",
    "currency_position": "before",
    "decimal_separator": "dot",
    "checkout_method_style": "logo",
    "enable_modal_checkout": "no",
    "require_logged_in": "no",
    "show_cart_icon_in_nav": "no",
    "show_cart_icon_in_body": "yes",
    "additional_address_field": "yes",
    "hide_coupon_field": "yes",
    "user_account_creation_mode": "all",
    "checkout_page_id": 12,
    "custom_payment_page_id": "",
    "registration_page_id": "",
    "login_page_id": "",
    "cart_page_id": 13,
    "receipt_page_id": 14,
    "shop_page_id": 10,
    "customer_profile_page_id": 15,
    "customer_profile_page_slug": "account",
    "currency": "USD",
    "store_address1": "",
    "store_address2": "",
    "store_city": "",
    "store_country": "US",
    "store_postcode": "",
    "store_state": "",
    "show_relevant_product_in_single_page": "no",
    "show_relevant_product_in_modal": "no",
    "order_mode": "live",
    "variation_view": "both",
    "variation_columns": "masonry",
    "enable_early_payment_for_installment": "yes",
    "subscription_management_mode": "gateway_managed",
    "subscription_system_charge": "no",
    "modules_settings": [],
    "min_receipt_number": "1000"
  },
  "tax_settings": {
    "enable_tax": "no",
    "tax_inclusion": "excluded",
    "eu_method": "oss",
    "vat_number": ""
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



---

## GET `/templates/print-templates`

**GET Get Print Templates**

Retrieve all available print templates. Returns saved custom templates or falls back to default templates.

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

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



---

## GET `/forms/search_options`

**GET Get Search Options**

Retrieve dynamic search/autocomplete options for form fields. Options are resolved via the fluent_cart/get_dynamic_search_{search_for} WordPress filter, allowing modules to provide context-specific search data.

**Required permission:** `super_admin`

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


- **403** — Authenticated, but the user lacks the required capability (`super_admin`).

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

## GET `/widgets`

**GET Get Widgets**

Retrieve dynamic widget data for a specific context. Widgets are loaded via WordPress filters, allowing modules and extensions to register custom widgets.

**Required permissions:** any one of `customers/view`, `orders/view`

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


- **403** — Authenticated, but the user lacks the required capability (`customers/view, orders/view`).

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

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

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



---

## GET `/activity`

**GET List Activities**

Retrieve a paginated list of activity log entries with filtering and sorting support.

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

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
    - `first_page_url` (string) — URL of the first page of results
    - `from` (integer) — Starting record number on the current page
    - `last_page_url` (string) — URL of the last page of results
    - `links` (array<object>) — Laravel-style pagination links (previous, page numbers, next)
      - `url` (string)
      - `label` (string)
      - `active` (boolean)
    - `next_page_url` (string) — URL of the next page of results
    - `path` (string) — Base URL of the endpoint without the query string
    - `prev_page_url` (string) — URL of the previous page of results
    - `to` (integer) — Ending record number on the current page

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
    ],
    "first_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/activity/?page=1",
    "from": 1,
    "last_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/activity/?page=16",
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/activity/?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/activity/?page=2",
        "label": "2",
        "active": false
      }
    ],
    "next_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/activity/?page=2",
    "path": "https://yoursite.com/wp-json/fluent-cart/v2/activity",
    "prev_page_url": null,
    "to": 10
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



---

## GET `/app/attachments`

**GET List Attachments**

Retrieve all image attachments from the WordPress media library. Used for the media picker in the admin interface.

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

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

**Access policy:** `UserPolicy`

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
      "value": "US",
      "name": "United States"
    },
    {
      "value": "GB",
      "name": "United Kingdom"
    },
    {
      "value": "CA",
      "name": "Canada"
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



---

## PUT `/activity/{id}/mark-read`

**PUT Mark Activity Read/Unread**

Toggle the read status of an activity log entry.

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

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

## POST `/onboarding`

**POST Save Onboarding Settings**

Save store settings during the onboarding process. Merges submitted values with existing store settings. If a category value is provided, dummy products are created asynchronously.

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

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

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

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

## POST `/app/upload-attachments`

**POST Upload Attachment**

Upload an image file to the WordPress media library.

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

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

## POST `/data-backfills/run`

**POST Run Pending Data Backfills**

Run pending one-shot data backfills within this request's execution budget. The admin app silently re-calls this endpoint while the returned status is `running`; a status of `locked` means another request is already processing backfills.

**Access policy:** `AdminPolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Backfill processing status after this request's budget was spent.

  Schema (`application/json`):

  - `status` (string) — One of: completed, running, locked. Callers should re-call this endpoint while the status is running.
  - `completed` (array<string>) — Slugs of backfills that finished during this request.
  - `pending` (array<string>) — Slugs of backfills still pending after this request.

  Example:

```json
{
  "status": "completed",
  "completed": [],
  "pending": []
}
```


- **401** — Unauthenticated.

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


- **403** — The authenticated user is not an admin.

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

## POST `/onboarding/save-tax`

**POST Save Onboarding Tax Settings**

Save the store's tax configuration as part of onboarding. When `enable_tax` is "no", tax is simply switched off. When it is "yes", the store country is used to determine whether EU VAT handling applies; if it does, tax classes are generated for all EU countries and, for the OSS method, an EU VAT registration is upserted. For non-EU countries with a VAT number, a `fluent_cart_tax_id_{country}` meta record is created or updated instead.

**Access policy:** `AdminPolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `enable_tax` (string) _(enum: `yes`, `no`)_ — "yes" or "no". Defaults to "no". Any other value returns a 422.
- `tax_inclusion` (string) _(enum: `included`, `excluded`)_ — "included" or "excluded". Only read when enable_tax is "yes". Defaults to "excluded". Any other value returns a 422.
- `store_country` (string) — Store's country code, uppercased server-side. Must be alphabetic and at most 3 characters, or a 422 is returned. Only read when enable_tax is "yes".
- `eu_method` (string) _(enum: `oss`, `home`, `specific`)_ — "oss", "home", or "specific". Only required/validated when store_country resolves to an EU tax country. Defaults to "oss".
- `vat_number` (string) — VAT number, truncated to 50 characters. Stored against the EU VAT registration for EU countries, or as tax meta for non-EU countries.

Example:

```json
{
  "enable_tax": "yes",
  "tax_inclusion": "excluded",
  "store_country": "DE",
  "eu_method": "oss",
  "vat_number": "DE123456789"
}
```


**Responses**

- **200** — Tax settings saved successfully.

  Schema (`application/json`):

  - `data` (object)
    - `tax_enabled` (boolean)
    - `classes_created` (boolean) — false if tax class generation threw an exception.
    - `eu_rates_imported` (boolean) — true only when the store country is an EU tax country.
  - `message` (string)

  Example:

```json
{
  "data": {
    "tax_enabled": true,
    "classes_created": true,
    "eu_rates_imported": true
  },
  "message": "Tax settings saved"
}
```


- **401** — Unauthenticated.

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


- **403** — The authenticated user is not an admin.

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


- **422** — An invalid enable_tax, tax_inclusion, store_country, or eu_method value was supplied.

  Example:

```json
{
  "message": "Invalid store_country value"
}
```



---
