# FluentCart API — Licensing (Pro)

27 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/settings/license/`

**POST Activate Plugin License**

Activate a FluentCart Pro license key on this WordPress site.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `license_key` (string) **required** — The FluentCart Pro license key to activate

Example:

```json
{
  "license_key": "DTPRO-A1B2-C3D4-E5F6"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `status` (string)
  - `license_key` (string)
  - `notice` (object)
    - `id` (string)
    - `html` (string)
    - `timeout` (integer)

  Example:

```json
{
  "status": "valid",
  "license_key": "DTPRO-A1B2-C3D4-E5F6",
  "notice": {
    "id": "fluent_cart_license_activated",
    "html": "<div>Your FluentCart Pro license has been activated successfully.</div>",
    "timeout": 5000
  }
}
```


- **400** — Invalid license key or activation failed

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)

  Example:

```json
{
  "success": false,
  "code": "invalid_license_key",
  "message": "The provided license key is invalid or has expired."
}
```



---

## POST `/licensing/licenses/{id}/activate_site`

**POST Activate Site (Admin)**

Manually activate a site URL on a license from the admin panel.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The license ID |


**Request body** (`application/json`, required)

- `id` (any) **required** — The license ID or key (used by the service internally)
- `url` (string) **required** — The site URL to activate

Example:

```json
{
  "id": 1,
  "url": "https://my-client-site.com"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Site has been activated successfully!"
}
```


- **423** — Error response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "<error message from license manager>"
}
```



---

## DELETE `/settings/license/`

**DELETE Deactivate Plugin License**

Deactivate the FluentCart Pro license from this WordPress site.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `status` (string)
  - `notice` (object)
    - `id` (string)
    - `html` (string)

  Example:

```json
{
  "status": "deactivated",
  "notice": {
    "id": "activate_license",
    "html": "<div>License deactivation message</div>"
  }
}
```



---

## POST `/licensing/licenses/{id}/deactivate_site`

**POST Deactivate Site (Admin)**

Deactivate a specific site activation from a license using the activation ID.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The license ID |


**Request body** (`application/json`, required)

- `id` (any) **required** — The license ID or key (used by the service internally)
- `activation_id` (any) **required** — The activation record ID to deactivate

Example:

```json
{
  "id": 1,
  "activation_id": 5
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Site has been deactivated successfully!"
}
```


- **422** — Error response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "<error message from license manager>"
}
```



---

## POST `/customer-profile/licenses/{license_key}/deactivate_site`

**POST Deactivate Site (Customer)**

Deactivate a specific site from a license. The customer can only deactivate sites from their own licenses.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `license_key` | string | yes | The license key (alphanumeric with dashes) |


**Request body** (`application/json`, required)

- `site_url` (string) **required** — The site URL to deactivate

Example:

```json
{
  "site_url": "example.com"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Site deactivated successfully"
}
```


- **422** — License not found or site not activated

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Site not found or not activated for this license"
}
```



---

## DELETE `/licensing/licenses/{id}/delete`

**DELETE Delete License**

Permanently delete a license and all its associated data.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The license ID |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "License deleted successfully!"
}
```



---

## POST `/licensing/licenses/{id}/extend-validity`

**POST Extend License Validity**

Change the expiration date of a license. Can extend, reduce, or set to lifetime. If the license status is not `active` or `inactive`, it will be automatically set to `active`.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The license ID |


**Request body** (`application/json`, required)

- `expiration_date` (string) **required** — New expiration date in `YYYY-MM-DD HH:MM:SS` format, or the string `lifetime` to remove expiration

Example:

```json
{
  "expiration_date": "2027-06-15 00:00:00"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `license` (object)
    - `id` (integer)
    - `expiration_date` (string)
    - `status` (string)
  - `message` (string)

  Example:

```json
{
  "license": {
    "id": 1,
    "expiration_date": "2027-01-15 00:00:00",
    "status": "active"
  },
  "message": "License validity extended!"
}
```


- **423** — Invalid expiration date

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Invalid expiration date!"
}
```



---

## GET `/customer-profile/licenses/{license_key}`

**GET Get Customer License Details**

Retrieve full details of a specific license for the currently logged-in customer.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `license_key` | string | yes | The license key (alphanumeric with dashes) |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)
  - `license` (object)
    - `license_key` (string)
    - `status` (string)
    - `expiration_date` (string)
    - `variation_id` (integer)
    - `activation_count` (integer)
    - `limit` (integer)
    - `product_id` (integer)
    - `created_at` (string)
    - `title` (string)
    - `subtitle` (string)
    - `renewal_url` (string)
    - `has_upgrades` (boolean)
    - `order` (object)
      - `uuid` (string)
  - `section_parts` (object) — HTML content blocks injected via the `fluent_cart/customer/license_details_section_parts` filter
    - `before_summary` (string)
    - `after_summary` (string)
    - `end_of_details` (string)
    - `additional_actions` (string)

  Example:

```json
{
  "message": "Success",
  "license": {
    "license_key": "DTPRO-A1B2-C3D4-E5F6",
    "status": "active",
    "expiration_date": "2026-01-15 00:00:00",
    "variation_id": 15,
    "activation_count": 2,
    "limit": 5,
    "product_id": 10,
    "created_at": "2025-01-15 10:30:00",
    "title": "My Plugin",
    "subtitle": "Pro License",
    "renewal_url": "",
    "has_upgrades": true,
    "order": {
      "uuid": "order-uuid-here"
    }
  },
  "section_parts": {
    "before_summary": "",
    "after_summary": "",
    "end_of_details": "",
    "additional_actions": ""
  }
}
```


- **422** — License or customer not found

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "License not found"
}
```



---

## GET `/licensing/licenses/customer/{id}`

**GET Get Customer Licenses (Admin)**

Retrieve a paginated list of licenses belonging to a specific customer.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The customer ID |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | no | Page number for pagination (default: 1) |
| `per_page` | integer | no | Number of records per page (default: 10) |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `licenses` (object)
    - `current_page` (integer)
    - `data` (array<object>)
      - `id` (integer)
      - `status` (string)
      - `limit` (integer)
      - `activation_count` (integer)
      - `license_key` (string)
      - `product_id` (integer)
      - `variation_id` (integer)
      - `order_id` (integer)
      - `customer_id` (integer)
      - `expiration_date` (string)
      - `customer` (object)
        - _(object)_
      - `product_variant` (object)
        - _(object)_
      - `order` (object)
        - _(object)_
      - `product` (object)
        - _(object)_
      - `activations_count` (integer)
    - `per_page` (integer)
    - `total` (integer)
    - `last_page` (integer)

  Example:

```json
{
  "licenses": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "status": "active",
        "limit": 5,
        "activation_count": 2,
        "license_key": "DTPRO-A1B2-C3D4-E5F6",
        "product_id": 10,
        "variation_id": 15,
        "order_id": 42,
        "customer_id": 7,
        "expiration_date": "2026-01-15 00:00:00",
        "customer": {
          "id": 7,
          "first_name": "Sarah",
          "last_name": "Johnson",
          "email": "sarah.johnson@example.com"
        },
        "product_variant": {
          "id": 15,
          "title": "Personal License",
          "price": 4900,
          "product_id": 10
        },
        "order": {
          "id": 42,
          "invoice_no": "INV-042",
          "status": "completed",
          "total_amount": 4900
        },
        "product": {
          "ID": 10,
          "post_title": "Developer Toolkit Pro"
        },
        "activations_count": 2
      }
    ],
    "per_page": 10,
    "total": 5,
    "last_page": 1
  }
}
```



---

## GET `/customer-profile/licenses/{license_key}/activations`

**GET Get License Activations**

Retrieve all site activations for a specific license belonging to the currently logged-in customer.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `license_key` | string | yes | The license key (alphanumeric with dashes) |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `activations` (array<object>)
    - `site_url` (string) — The activated site URL (without protocol)
    - `is_local` (integer) — Whether this is a local/staging site (1) or production site (0). Local sites do not count toward the activation limit
    - `status` (string) — Activation status
    - `created_at` (string) — When the activation was created

  Example:

```json
{
  "activations": [
    {
      "site_url": "example.com",
      "is_local": 0,
      "status": "active",
      "created_at": "2025-03-10 14:22:00"
    },
    {
      "site_url": "staging.example.com",
      "is_local": 1,
      "status": "active",
      "created_at": "2025-03-12 09:15:00"
    }
  ]
}
```


- **422** — License not found

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "License not found"
}
```



---

## GET `/reports/license-chart`

**GET Get License Line Chart**

Retrieve license data formatted for a line chart visualization.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params` | object | yes | Request parameters object containing filters, date range, and grouping |
| `params[startDate]` | string | yes | Start date for the report (ISO 8601 format) |
| `params[endDate]` | string | yes | End date for the report (ISO 8601 format) |
| `params[groupKey]` | string | yes | Grouping key for the chart (e.g., 'day', 'week', 'month') |
| `params[filters]` | object | no | Filter criteria |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "labels": [
    "2024-01",
    "2024-02",
    "2024-03",
    "2024-04",
    "2024-05",
    "2024-06"
  ],
  "datasets": [
    {
      "label": "Licenses Issued",
      "data": [
        18,
        22,
        28,
        24,
        32,
        30
      ]
    },
    {
      "label": "Activations",
      "data": [
        25,
        30,
        38,
        35,
        45,
        42
      ]
    }
  ],
  "summary": {
    "total_licenses_issued": 154,
    "total_activations": 215
  }
}
```



---

## GET `/licensing/licenses/{id}`

**GET Get License Details**

Retrieve the full details of a single license including the associated order, activations, product information, downloads, labels, and previous orders.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The license ID |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `license` (object)
    - _(object)_
  - `downloads` (array<object>)
    - _(object)_
  - `order` (object)
    - _(object)_
  - `activations` (array<object>)
    - _(object)_
  - `product` (object)
    - _(object)_
  - `selected_labels` (array<integer>)
  - `orders` (array<object>)
    - _(object)_
  - `prev_orders` (array<object>)
    - _(object)_
  - `subscription` (object)
    - _(object)_
  - `upgrade_path_base` (string)

  Example:

```json
{
  "license": {
    "id": 1,
    "status": "active",
    "limit": 5,
    "activation_count": 2,
    "license_key": "DTPRO-A1B2-C3D4-E5F6",
    "product_id": 10,
    "variation_id": 15,
    "order_id": 42,
    "customer_id": 7,
    "expiration_date": "2026-01-15 00:00:00",
    "subscription_id": 3,
    "config": {
      "activation_limit": 5,
      "validity_days": 365,
      "auto_renew": true
    },
    "customer": {
      "id": 7,
      "first_name": "Sarah",
      "last_name": "Johnson",
      "email": "sarah.johnson@example.com"
    },
    "product_variant": {
      "id": 15,
      "title": "Personal License",
      "price": 4900,
      "product_id": 10
    },
    "labels": [
      {
        "id": 1,
        "title": "VIP",
        "color": "#3b82f6"
      },
      {
        "id": 3,
        "title": "Enterprise",
        "color": "#10b981"
      }
    ]
  },
  "downloads": [
    {
      "id": 1,
      "post_id": 10,
      "product_title": "My Plugin",
      "variation_titles": [
        "Pro License"
      ],
      "download_url": "https://example.com/?fluent-cart=download&..."
    }
  ],
  "order": {
    "id": 42,
    "order_items": [
      {
        "id": 1,
        "product_id": 10,
        "variation_id": 15,
        "title": "Developer Toolkit Pro - Personal License",
        "quantity": 1,
        "unit_price": 4900,
        "subtotal": 4900
      }
    ],
    "billing_address": {
      "name": "Sarah Johnson",
      "address_1": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postcode": "94102",
      "country": "US"
    },
    "shipping_address": {
      "name": "Sarah Johnson",
      "address_1": "456 Oak Avenue",
      "city": "San Francisco",
      "state": "CA",
      "postcode": "94102",
      "country": "US"
    }
  },
  "activations": [
    {
      "id": 1,
      "license_id": 1,
      "site_id": 5,
      "status": "active",
      "is_local": 0,
      "activation_hash": "abc123def456...",
      "site": {
        "id": 5,
        "site_url": "example.com"
      }
    }
  ],
  "product": {
    "ID": 10,
    "post_title": "My Plugin",
    "variants": [
      {
        "id": 15,
        "title": "Personal License",
        "price": 4900
      },
      {
        "id": 16,
        "title": "Business License",
        "price": 9900
      },
      {
        "id": 17,
        "title": "Unlimited License",
        "price": 19900
      }
    ]
  },
  "selected_labels": [
    1,
    3
  ],
  "orders": [
    {
      "id": 42
    }
  ],
  "prev_orders": [
    {
      "id": 38,
      "invoice_no": "INV-038",
      "status": "completed",
      "total_amount": 4900,
      "created_at": "2025-08-15 09:30:00"
    }
  ],
  "subscription": null,
  "upgrade_path_base": "https://example.com/?fluent-cart=custom-payment"
}
```


- **404** — License not found

  Schema (`application/json`):

  - `data` (object)
    - `message` (string)
    - `buttonText` (string)
    - `route` (string)
  - `code` (string)

  Example:

```json
{
  "data": {
    "message": "License not found",
    "buttonText": "Back to License List",
    "route": "/licenses"
  },
  "code": "fluent_cart_entity_not_found"
}
```



---

## GET `/reports/license-pie-chart`

**GET Get License Pie Chart**

Retrieve license data formatted for a pie chart visualization.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params` | object | yes | Request parameters object containing filters and date range |
| `params[startDate]` | string | yes | Start date for the report (ISO 8601 format) |
| `params[endDate]` | string | yes | End date for the report (ISO 8601 format) |
| `params[filters]` | object | no | Filter criteria |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "distribution": [
    {
      "label": "Active",
      "value": 198,
      "percentage": 80.8,
      "color": "#67C23A"
    },
    {
      "label": "Expired",
      "value": 32,
      "percentage": 13.1,
      "color": "#E6A23C"
    },
    {
      "label": "Revoked",
      "value": 15,
      "percentage": 6.1,
      "color": "#F56C6C"
    }
  ],
  "total_licenses": 245
}
```



---

## GET `/reports/license-summary`

**GET Get License Summary**

Retrieve a summary of license statistics.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params` | object | yes | Request parameters object containing filters and date range |
| `params[startDate]` | string | yes | Start date for the report (ISO 8601 format) |
| `params[endDate]` | string | yes | End date for the report (ISO 8601 format) |
| `params[filters]` | object | no | Filter criteria |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - _(object)_

  Example:

```json
{
  "total_licenses": 245,
  "active_licenses": 198,
  "expired_licenses": 32,
  "revoked_licenses": 15,
  "total_activations": 412,
  "average_activations_per_license": 1.68,
  "activation_limit_reached": 24
}
```



---

## GET `/settings/license/`

**GET Get Plugin License Status**

Retrieve the current activation status of the FluentCart Pro plugin license on this site.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `status` (string) — License status (e.g., `valid`, `invalid`, `expired`)
  - `license_key` (string) — The activated license key
  - `expires` (string) — License expiration date

  Example:

```json
{
  "status": "valid",
  "license_key": "DTPRO-A1B2-C3D4-E5F6",
  "expires": "2026-01-15"
}
```



---

## GET `/licensing/products/{id}/settings`

**GET Get Product License Settings**

Retrieve the license configuration for a specific product, including per-variation activation limits and validity periods.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The product ID |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `settings` (object)
    - `enabled` (string) — Whether licensing is enabled: `yes` or `no`
    - `version` (string) — Current software version number
    - `global_update_file` (object) — The downloadable file used for auto-updates
      - `id` (string)
      - `driver` (string)
      - `path` (string)
      - `url` (string)
    - `variations` (array<object>)
      - `variation_id` (integer)
      - `title` (string)
      - `activation_limit` (any)
      - `validity` (object)
        - `unit` (string) _(enum: `day`, `week`, `month`, `year`, `lifetime`)_
        - `value` (integer)
      - `media` (array<object>)
        - _(object)_
      - `subscription_info` (string)
      - `setup_fee_info` (string)
    - `wp` (object) — WordPress-specific settings for plugin/theme update API
      - `is_wp` (string)
      - `readme_url` (string)
      - `banner_url` (string)
      - `icon_url` (string)
      - `required_php` (string)
      - `required_wp` (string)
    - `prefix` (string)
    - `changelog` (string) — HTML changelog content
    - `license_keys` (string) — Pre-defined license keys (if applicable)
  - `is_bundle_product` (boolean) — Whether the product is a bundle (licensing is disabled for bundles)

  Example:

```json
{
  "settings": {
    "enabled": "yes",
    "version": "1.2.0",
    "global_update_file": {
      "id": "",
      "driver": "local",
      "path": "",
      "url": ""
    },
    "variations": [
      {
        "variation_id": 15,
        "title": "Single Site License",
        "activation_limit": 1,
        "validity": {
          "unit": "year",
          "value": 1
        },
        "media": [
          {
            "id": "dev-toolkit-pro__fluent-cart__.1693526400.zip",
            "driver": "local",
            "path": "dev-toolkit-pro__fluent-cart__.1693526400.zip",
            "url": "https://example.com/wp-content/uploads/fluent-cart/dev-toolkit-pro__fluent-cart__.1693526400.zip"
          }
        ],
        "subscription_info": "Billed yearly at $49.00",
        "setup_fee_info": ""
      },
      {
        "variation_id": 16,
        "title": "Unlimited Sites License",
        "activation_limit": "",
        "validity": {
          "unit": "lifetime",
          "value": 1
        },
        "media": [
          {
            "id": "dev-toolkit-pro__fluent-cart__.1693526400.zip",
            "driver": "local",
            "path": "dev-toolkit-pro__fluent-cart__.1693526400.zip",
            "url": "https://example.com/wp-content/uploads/fluent-cart/dev-toolkit-pro__fluent-cart__.1693526400.zip"
          }
        ],
        "subscription_info": "",
        "setup_fee_info": ""
      }
    ],
    "wp": {
      "is_wp": "yes",
      "readme_url": "https://example.com/changelog",
      "banner_url": "https://example.com/banner.png",
      "icon_url": "https://example.com/icon.png",
      "required_php": "7.4",
      "required_wp": "5.6"
    },
    "prefix": "",
    "changelog": "<h4>1.2.0</h4><ul><li>New feature added</li></ul>",
    "license_keys": ""
  },
  "is_bundle_product": false
}
```



---

## GET `/customer-profile/licenses/`

**GET List Customer Licenses**

Retrieve a paginated list of licenses belonging to the currently logged-in customer.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | no | Page number for pagination (default: 1) |
| `per_page` | integer | no | Number of records per page (default: 10) |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `licenses` (object)
    - `data` (array<object>)
      - `license_key` (string)
      - `status` (string)
      - `expiration_date` (string)
      - `variation_id` (integer)
      - `activation_count` (integer)
      - `limit` (integer)
      - `product_id` (integer)
      - `created_at` (string)
      - `title` (string)
      - `subtitle` (string)
      - `renewal_url` (string)
      - `has_upgrades` (boolean)
      - `order` (object)
        - `uuid` (string)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
  - `message` (string)

  Example:

```json
{
  "licenses": {
    "data": [
      {
        "license_key": "DTPRO-A1B2-C3D4-E5F6",
        "status": "active",
        "expiration_date": "2026-01-15 00:00:00",
        "variation_id": 15,
        "activation_count": 2,
        "limit": 5,
        "product_id": 10,
        "created_at": "2025-01-15 10:30:00",
        "title": "My Plugin",
        "subtitle": "Pro License",
        "renewal_url": "",
        "has_upgrades": true,
        "order": {
          "uuid": "order-uuid-here"
        }
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

## GET `/licensing/licenses`

**GET List Licenses**

Retrieve a paginated list of all licenses with optional filtering, sorting, and search.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | no | Page number for pagination |
| `per_page` | integer | no | Number of records per page (default: 10, max: 200) |
| `search` | string | no | Search term. Searches across license key, order ID, customer name, customer email, and activated site URLs. Also supports operator syntax (e.g., `license_key = abc123`) |
| `sort_by` | string | no | Column to sort by (default: `id`). Must be a fillable column on the License model |
| `sort_type` | string | no | Sort direction: `asc` or `desc` (default: `desc`) |
| `active_view` | string | no | Tab filter. One of: `active`, `expired`, `disabled`, `inactive` |
| `filter_type` | string | no | Filter mode: `simple` (default) or `advanced` |
| `advanced_filters` | string | no | JSON-encoded array of advanced filter groups (requires Pro). Supports filtering by product, customer, and license properties |
| `with` | string | no | Eager-load relations. Supports relation names and `{relation}Count` for counts |
| `select` | string | no | Comma-separated list of columns to select |
| `scopes` | array<string> | no | Model scopes to apply |
| `include_ids` | string | no | Comma-separated IDs that must always be included in results |
| `limit` | integer | no | Limit number of records (used with non-paginated queries) |
| `offset` | integer | no | Offset for records |
| `user_tz` | string | no | User timezone for date filtering (e.g., `America/New_York`) |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `licenses` (object)
    - `current_page` (integer)
    - `data` (array<object>)
      - `id` (integer)
      - `status` (string)
      - `limit` (integer)
      - `activation_count` (integer)
      - `license_key` (string)
      - `product_id` (integer)
      - `variation_id` (integer)
      - `order_id` (integer)
      - `parent_id` (integer)
      - `customer_id` (integer)
      - `expiration_date` (string)
      - `subscription_id` (integer)
      - `created_at` (string)
      - `updated_at` (string)
    - `per_page` (integer)
    - `total` (integer)
    - `last_page` (integer)

  Example:

```json
{
  "licenses": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "status": "active",
        "limit": 5,
        "activation_count": 2,
        "license_key": "DTPRO-A1B2-C3D4-E5F6",
        "product_id": 10,
        "variation_id": 15,
        "order_id": 42,
        "parent_id": null,
        "customer_id": 7,
        "expiration_date": "2026-01-15 00:00:00",
        "subscription_id": 3,
        "created_at": "2025-01-15 10:30:00",
        "updated_at": "2025-06-15 10:35:00"
      }
    ],
    "per_page": 10,
    "total": 50,
    "last_page": 5
  }
}
```



---

## POST `/?fluent-cart=activate_license`

**POST Activate License**

Activate a license key on a specific site URL. If the site is already activated for this license, the existing activation details are returned. Local/staging sites are detected automatically and do not count toward the activation limit. This is a public endpoint that does not use the WordPress REST API. No authentication required.

**Auth:** None (public)

**Request body** (`application/x-www-form-urlencoded`, required)

- `license_key` (string) **required** — The license key to activate
- `item_id` (string) **required** — The product ID (must match the license's product)
- `site_url` (string) **required** — The site URL to activate
- `server_version` (string) — The server software version (e.g., PHP version)
- `platform_version` (string) — The platform version (e.g., WordPress version)

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `success` (boolean)
  - `status` (string)
  - `activation_limit` (integer)
  - `activation_hash` (string)
  - `activations_count` (integer)
  - `license_key` (string)
  - `expiration_date` (string)
  - `product_id` (integer)
  - `variation_id` (integer)
  - `variation_title` (string)
  - `product_title` (string)
  - `created_at` (string)
  - `updated_at` (string)

  Example:

```json
{
  "success": true,
  "status": "valid",
  "activation_limit": 5,
  "activation_hash": "abc123def456...",
  "activations_count": 3,
  "license_key": "DTPRO-A1B2-C3D4-E5F6",
  "expiration_date": "2026-01-15 00:00:00",
  "product_id": 10,
  "variation_id": 15,
  "variation_title": "Pro License",
  "product_title": "My Plugin",
  "created_at": "2025-01-15 10:30:00",
  "updated_at": "2025-06-15 10:35:00"
}
```


- **422** — Activation error

  Schema (`application/json`):

  - `success` (boolean)
  - `message` (string)
  - `error_type` (string) _(enum: `validation_error`, `license_not_found`, `key_mismatch`, `license_expired`, `license_not_active`, `activation_limit_exceeded`, `activation_error`)_

  Example:

```json
{
  "success": false,
  "message": "license_key, site_url and item_id is required",
  "error_type": "validation_error"
}
```



---

## GET `/?fluent-cart=check_license`

**GET Check License**

Verify the validity of a license key and check its activation status for a specific site. This is a public endpoint that does not use the WordPress REST API -- it uses query parameter-based URLs on the site's front end. No authentication required.

**Auth:** None (public)

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `license_key` | string | no | The license key to check. Required if `activation_hash` is not provided |
| `activation_hash` | string | no | The activation hash from a previous activation. Required if `license_key` is not provided |
| `item_id` | string | yes | The product ID (must match the license's product) |
| `site_url` | string | yes | The site URL making the request |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `success` (boolean)
  - `status` (string) _(enum: `valid`, `expired`, `invalid`)_ — License status
  - `activation_limit` (integer) — Maximum allowed site activations (0 = unlimited)
  - `activation_hash` (string) — Unique hash for this site's activation (empty if not activated)
  - `activations_count` (integer) — Current number of active site activations
  - `license_key` (string)
  - `expiration_date` (string) — Expiration date in GMT, or `lifetime` for non-expiring licenses
  - `product_id` (string)
  - `variation_id` (integer)
  - `variation_title` (string)
  - `product_title` (string)
  - `created_at` (string)
  - `updated_at` (string)

  Example:

```json
{
  "success": true,
  "status": "valid",
  "activation_limit": 5,
  "activation_hash": "abc123def456...",
  "activations_count": 2,
  "license_key": "DTPRO-A1B2-C3D4-E5F6",
  "expiration_date": "2026-01-15 00:00:00",
  "product_id": 10,
  "variation_id": 15,
  "variation_title": "Pro License",
  "product_title": "My Plugin",
  "created_at": "2025-01-15 10:30:00",
  "updated_at": "2025-06-15 10:35:00"
}
```


- **422** — Validation or license error

  Schema (`application/json`):

  - `success` (boolean)
  - `status` (string)
  - `error_type` (string) _(enum: `validation_error`, `invalid_license`, `invalid_activation`, `key_mismatch`)_
  - `message` (string)

  Example:

```json
{
  "success": true,
  "status": "invalid",
  "error_type": "validation_error",
  "message": "license_key, site_url and item_id is required"
}
```



---

## POST `/?fluent-cart=deactivate_license`

**POST Deactivate License**

Deactivate a license from a specific site URL. Removes the site activation and decrements the activation count. This is a public endpoint that does not use the WordPress REST API. No authentication required.

**Auth:** None (public)

**Request body** (`application/x-www-form-urlencoded`, required)

- `license_key` (string) **required** — The license key to deactivate
- `item_id` (string) **required** — The product ID (must match the license's product)
- `site_url` (string) **required** — The site URL to deactivate

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `success` (boolean)
  - `status` (string)
  - `activation_limit` (integer)
  - `activations_count` (integer)
  - `expiration_date` (string)
  - `product_id` (integer)
  - `variation_id` (integer)
  - `product_title` (string)
  - `variation_title` (string)
  - `created_at` (string)
  - `updated_at` (string)

  Example:

```json
{
  "success": true,
  "status": "deactivated",
  "activation_limit": 5,
  "activations_count": 2,
  "expiration_date": "2026-01-15 00:00:00",
  "product_id": 10,
  "variation_id": 15,
  "product_title": "My Plugin",
  "variation_title": "Pro License",
  "created_at": "2025-01-15 10:30:00",
  "updated_at": "2025-06-15 10:35:00"
}
```


- **422** — Deactivation error

  Schema (`application/json`):

  - `success` (boolean)
  - `message` (string)
  - `error_type` (string) _(enum: `validation_error`, `license_not_found`, `site_not_found`)_

  Example:

```json
{
  "success": false,
  "message": "license_key, site_url and item_id is required",
  "error_type": "validation_error"
}
```



---

## GET `/?fluent-cart=download_license_package`

**GET Download License Package**

Download the product's update package file. This endpoint is not called directly -- it is used via the signed URLs generated by the Get License Version endpoint. The URL contains an encoded token (`fct_package`) that includes the license key, activation hash, site URL, product ID, and expiration timestamp. This is a public endpoint that does not use the WordPress REST API. No authentication required (authentication is embedded in the signed URL).

**Auth:** None (public)

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `fct_package` | string | yes | Base64-encoded package data containing license credentials and expiration. This is automatically generated by the version check endpoint |


**Responses**

- **302** — Redirect to the signed download URL for the file
- **422** — Package or license error

  Schema (`application/json`):

  - `success` (boolean)
  - `message` (string)
  - `error_type` (string) _(enum: `invalid_package_data`, `expired_license`, `downloadable_file_not_found`)_

  Example:

```json
{
  "success": false,
  "message": "Invalid package data",
  "error_type": "invalid_package_data"
}
```



---

## GET `/?fluent-cart=get_license_version`

**GET Get License Version**

Retrieve the latest version information for a licensed product. This endpoint is designed to integrate with WordPress plugin/theme update mechanisms. It returns version data, changelog, download links, and banner/icon URLs. This is a public endpoint that does not use the WordPress REST API. No authentication required.

**Auth:** None (public)

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `item_id` | string | yes | The product ID |
| `license_key` | string | no | License key for authenticated download links. Required if `activation_hash` is not provided |
| `activation_hash` | string | no | Activation hash for authenticated download links. Required if `license_key` is not provided |
| `site_url` | string | no | The site URL making the request |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `success` (boolean)
  - `new_version` (string)
  - `stable_version` (string)
  - `name` (string)
  - `slug` (string)
  - `url` (string)
  - `last_updated` (string)
  - `homepage` (string)
  - `package` (string) — Download URL with time-limited token (expires after 48 hours). Empty if license is invalid
  - `download_link` (string) — Same as package URL
  - `trunk` (string)
  - `license_status` (string) _(enum: `valid`, `invalid`, `expired`)_
  - `license_message` (string) — Present when license is invalid
  - `sections` (object)
    - `description` (string)
    - `changelog` (string)
  - `banners` (object)
    - `low` (string)
    - `high` (string)
  - `icons` (object)
    - `2x` (string)
    - `1x` (string)

  Example:

```json
{
  "success": true,
  "new_version": "1.3.0",
  "stable_version": "1.3.0",
  "name": "My Plugin",
  "slug": "my-plugin",
  "url": "https://example.com/my-plugin",
  "last_updated": "2025-06-15 10:30:00",
  "homepage": "https://example.com/my-plugin",
  "package": "https://example.com/?fluent-cart=download_license_package&fct_package=...",
  "download_link": "https://example.com/?fluent-cart=download_license_package&fct_package=...",
  "trunk": "https://example.com/?fluent-cart=download_license_package&fct_package=...",
  "license_status": "valid",
  "sections": {
    "description": "Product description here",
    "changelog": "<h4>1.3.0</h4><ul><li>New feature</li></ul>"
  },
  "banners": {
    "low": "https://example.com/banner.png",
    "high": "https://example.com/banner.png"
  },
  "icons": {
    "2x": "https://example.com/icon.png",
    "1x": "https://example.com/icon.png"
  }
}
```


- **422** — Product or license settings error

  Schema (`application/json`):

  - `success` (boolean)
  - `message` (string)
  - `error_type` (string) _(enum: `product_not_found`, `license_not_enabled`, `license_settings_not_found`)_

  Example:

```json
{
  "success": false,
  "message": "Product not found",
  "error_type": "product_not_found"
}
```



---

## POST `/licensing/licenses/{id}/regenerate-key`

**POST Regenerate License Key**

Generate a new random license key for an existing license. The old key is immediately invalidated.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The license ID |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `license` (object)
    - `id` (integer)
    - `license_key` (string)
    - `status` (string)
  - `message` (string)

  Example:

```json
{
  "license": {
    "id": 1,
    "license_key": "DTPRO-R7K9-M2N4-P8Q1",
    "status": "active"
  },
  "message": "License key regenerated successfully!"
}
```



---

## POST `/licensing/products/{id}/settings`

**POST Save Product License Settings**

Update the license configuration for a specific product.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The product ID |


**Request body** (`application/json`, required)

- `settings` (object) **required**
  - `enabled` (string) **required** _(enum: `yes`, `no`)_ — Enable licensing: `yes` or `no`
  - `version` (string) — Software version (required when `enabled` is `yes`)
  - `global_update_file` (string) — ID of the downloadable file to use for auto-updates
  - `prefix` (string) — License key prefix
  - `variations` (array<object>) **required**
    - `variation_id` (integer) **required** — The variation ID
    - `activation_limit` (any) — Max site activations (empty or 0 = unlimited, must be >= 0)
    - `validity` (object) **required**
      - `unit` (string) _(enum: `day`, `week`, `month`, `year`, `lifetime`)_ — Validity unit (required when `enabled` is `yes`)
      - `value` (integer) — Number of validity units (default: 1)
  - `wp` (object) — WordPress update API settings
    - `is_wp` (string) _(enum: `yes`, `no`)_ — Whether this is a WordPress plugin/theme
    - `readme_url` (string) — URL to the changelog/readme page
    - `banner_url` (string) — URL to the plugin banner image
    - `icon_url` (string) — URL to the plugin icon
    - `required_php` (string) — Minimum required PHP version
    - `required_wp` (string) — Minimum required WordPress version
  - `changelog` (string) — HTML changelog content
  - `license_keys` (string) — Pre-defined license keys

Example:

```json
{
  "settings": {
    "enabled": "yes",
    "version": "1.3.0",
    "global_update_file": "file_abc123",
    "variations": [
      {
        "variation_id": 15,
        "activation_limit": 1,
        "validity": {
          "unit": "year",
          "value": 1
        }
      },
      {
        "variation_id": 16,
        "activation_limit": "",
        "validity": {
          "unit": "lifetime",
          "value": 1
        }
      }
    ],
    "wp": {
      "is_wp": "yes",
      "readme_url": "https://example.com/changelog",
      "banner_url": "https://example.com/banner.png",
      "icon_url": "https://example.com/icon.png",
      "required_php": "7.4",
      "required_wp": "5.6"
    },
    "changelog": "<h4>1.3.0</h4><ul><li>Performance improvements</li></ul>",
    "license_keys": ""
  }
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Settings has been updated successfully."
}
```


- **422** — Validation error or bundle product

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "License settings cannot be saved for bundle products. Licenses are generated according to bundle items' license settings."
}
```



---

## POST `/licensing/licenses/{id}/update_limit`

**POST Update License Activation Limit**

Change the maximum number of site activations allowed for a license.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The license ID |


**Request body** (`application/json`, required)

- `limit` (any) **required** — New activation limit. Use a positive integer for a specific limit, or `0` / `"unlimited"` for unlimited activations

Example:

```json
{
  "limit": 10
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `license` (object)
    - `id` (integer)
    - `limit` (integer)
  - `message` (string)

  Example:

```json
{
  "license": {
    "id": 1,
    "limit": 10
  },
  "message": "License limit has been updated successfully!"
}
```



---

## POST `/licensing/licenses/{id}/update_status`

**POST Update License Status**

Change the status of a license.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The license ID |


**Request body** (`application/json`, required)

- `status` (string) **required** _(enum: `active`, `disabled`, `expired`)_ — New status. One of: `active`, `disabled`, `expired`

Example:

```json
{
  "status": "disabled"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `license` (object)
    - `id` (integer)
    - `status` (string)
  - `message` (string)

  Example:

```json
{
  "license": {
    "id": 1,
    "status": "disabled"
  },
  "message": "License status has been updated successfully!"
}
```


- **423** — Invalid status

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Invalid status!"
}
```



---
