# FluentCart API — Shipping

19 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/shipping/classes`

**POST Create Shipping Class**

Create a new shipping class.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `name` (string) **required** _(maxLength: 192)_ — Class name (max 192 characters)
- `cost` (number) **required** _(min: 0)_ — Cost value (minimum: 0). For fixed type, this is a flat amount. For percentage type, this is a percentage value.
- `type` (string) **required** _(enum: `fixed`, `percentage`)_ — Cost type: fixed or percentage
- `per_item` (integer) _(enum: `0`, `1`; default: `0`)_ — Apply cost per item (1) or per order (0). Default: 0

Example:

```json
{
  "name": "Oversized Items",
  "cost": 25,
  "type": "fixed",
  "per_item": 1
}
```


**Responses**

- **200** — Shipping class created successfully.

  Schema (`application/json`):

  - `shipping_class` (ShippingClass)
  - `message` (string)

  Example:

```json
{
  "shipping_class": {
    "id": 3,
    "name": "Oversized Items",
    "cost": 25,
    "type": "fixed",
    "per_item": 1,
    "created_at": "2025-02-01 11:00:00",
    "updated_at": "2025-02-01 11:00:00"
  },
  "message": "Shipping class has been created successfully"
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

## POST `/shipping/methods`

**POST Create Shipping Method**

Create a new shipping method within a shipping zone.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `zone_id` (integer) **required** — ID of the parent shipping zone
- `title` (string) **required** _(maxLength: 192)_ — Method display title (max 192 characters)
- `type` (string) **required** _(maxLength: 192)_ — Shipping method type (e.g., flat_rate, free_shipping, local_pickup)
- `amount` (string) — Shipping cost in cents (e.g., 500 for $5.00)
- `is_enabled` (integer) _(enum: `0`, `1`; default: `1`)_ — Enable/disable the method: 1 (enabled) or 0 (disabled)
- `states` (array<string>) — Array of state/province codes to restrict this method to (e.g., ["CA", "NY"]). Empty array means all states.
- `settings` (object) — Additional settings for the method
  - `configure_rate` (string) — Rate configuration type
  - `class_aggregation` (string) — How shipping classes are aggregated
- `meta` (object) — Additional metadata key-value pairs (string values only)
  - _(object)_

Example:

```json
{
  "zone_id": 1,
  "title": "Standard Shipping",
  "type": "flat_rate",
  "amount": "500",
  "is_enabled": 1,
  "states": [
    "CA",
    "NY"
  ],
  "settings": {
    "configure_rate": "per_order",
    "class_aggregation": "per_class"
  }
}
```


**Responses**

- **200** — Shipping method created successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Shipping method has been created successfully"
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

## POST `/shipping/zones`

**POST Create Shipping Zone**

Create a new shipping zone.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `name` (string) **required** _(maxLength: 192)_ — Zone name (max 192 characters)
- `region` (string) — ISO 3166-1 alpha-2 country code (e.g., US, GB) or 'all' for worldwide. Only one 'all' zone is allowed.
- `order` (integer) — Sort order for display priority

Example:

```json
{
  "name": "Europe",
  "region": "DE",
  "order": 2
}
```


**Responses**

- **200** — Shipping zone created successfully.

  Schema (`application/json`):

  - `shipping_zone` (ShippingZone)
  - `message` (string)

  Example:

```json
{
  "shipping_zone": {
    "id": 3,
    "name": "Europe",
    "region": "DE",
    "order": 2,
    "formatted_region": "Germany",
    "created_at": "2025-02-01 08:00:00",
    "updated_at": "2025-02-01 08:00:00"
  },
  "message": "Shipping zone has been created successfully"
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

## DELETE `/shipping/classes/{id}`

**DELETE Delete Shipping Class**

Delete a shipping class by ID.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The shipping class ID |


**Responses**

- **200** — Shipping class deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Shipping class has been deleted successfully"
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

## DELETE `/shipping/methods/{method_id}`

**DELETE Delete Shipping Method**

Delete a shipping method by ID.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `method_id` | integer | yes | The shipping method ID |


**Responses**

- **200** — Shipping method deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Shipping method has been deleted successfully"
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

## DELETE `/shipping/zones/{id}`

**DELETE Delete Shipping Zone**

Delete a shipping zone and all its associated shipping methods.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The shipping zone ID |


**Responses**

- **200** — Shipping zone deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Shipping zone has been deleted successfully"
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

## GET `/shipping/classes/{id}`

**GET Get Shipping Class**

Retrieve a single shipping class by ID.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The shipping class ID |


**Responses**

- **200** — Successful response. Returns the shipping class.

  Schema (`application/json`):

  - `shipping_class` (ShippingClass)

  Example:

```json
{
  "shipping_class": {
    "id": 1,
    "name": "Heavy Items",
    "cost": 15,
    "type": "fixed",
    "per_item": 1,
    "created_at": "2025-01-20 09:00:00",
    "updated_at": "2025-01-20 09:00:00"
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

## GET `/shipping/zones/{id}`

**GET Get Shipping Zone**

Retrieve a single shipping zone by ID, including its associated shipping methods.

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The shipping zone ID |


**Responses**

- **200** — Successful response. Returns the shipping zone with its methods.

  Schema (`application/json`):

  - `shipping_zone` (ShippingZoneWithMethods)

  Example:

```json
{
  "shipping_zone": {
    "id": 1,
    "shipping_class_id": null,
    "name": "Domestic",
    "region": "US",
    "meta": [],
    "order": 0,
    "formatted_region": "United States",
    "created_at": "2025-01-15 12:00:00",
    "updated_at": "2025-01-15 12:00:00",
    "methods": [
      {
        "id": 10,
        "zone_id": 1,
        "title": "Standard Shipping",
        "type": "flat_rate",
        "amount": 500,
        "is_enabled": true,
        "states": [
          "CA",
          "NY",
          "TX"
        ],
        "settings": {
          "configure_rate": "per_order",
          "class_aggregation": "per_class",
          "tax_status": "taxable"
        },
        "meta": {
          "min_amount": 0,
          "max_amount": 0
        },
        "order": 0,
        "formatted_states": [
          "California",
          "New York",
          "Texas"
        ],
        "created_at": "2025-01-15 12:30:00",
        "updated_at": "2025-01-15 12:30:00"
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

## GET `/shipping/zone/states`

**GET Get Zone States**

Retrieve state/province options and address locale configuration for a given country. Useful for populating state selectors when configuring shipping methods within a zone.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `country_code` | string | no | ISO 3166-1 alpha-2 country code (e.g., US, CA, GB) |


**Responses**

- **200** — Successful response. Returns states and address locale configuration for the given country.

  Schema (`application/json`):

  - `data` (object)
    - `country_code` (string) — The country code queried
    - `states` (any)
    - `address_locale` (any)

  Example:

```json
{
  "data": {
    "country_code": "US",
    "states": {
      "AL": "Alabama",
      "AK": "Alaska",
      "AZ": "Arizona",
      "CA": "California",
      "NY": "New York"
    },
    "address_locale": {
      "state": {
        "label": "State",
        "required": true
      },
      "postcode": {
        "label": "ZIP Code",
        "required": true
      }
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

## GET `/shipping/classes`

**GET List Shipping Classes**

Retrieve a paginated list of shipping classes with filtering and sorting capabilities.

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search classes by name |
| `per_page` | integer | no | Number of results per page (default: 10, max: 200) |
| `page` | integer | no | Page number for pagination |
| `sort_by` | string | no | Column to sort by (default: id) |
| `sort_type` | string | no | Sort direction: asc or desc (default: desc) |
| `filter_type` | string | no | Filter type: simple or advanced |


**Responses**

- **200** — Successful response. Returns a paginated list of shipping classes.

  Schema (`application/json`):

  - `shipping_classes` (object)
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
    - `data` (array<ShippingClass>)

  Example:

```json
{
  "shipping_classes": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1,
    "first_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/shipping/classes/?page=1",
    "from": 1,
    "last_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/shipping/classes/?page=1",
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/shipping/classes/?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": null,
        "label": "pagination.next",
        "active": false
      }
    ],
    "next_page_url": null,
    "path": "https://yoursite.com/wp-json/fluent-cart/v2/shipping/classes",
    "prev_page_url": null,
    "to": 2,
    "data": [
      {
        "id": 1,
        "name": "Heavy Items",
        "cost": 15,
        "type": "fixed",
        "per_item": 1,
        "created_at": "2025-01-20 09:00:00",
        "updated_at": "2025-01-20 09:00:00"
      },
      {
        "id": 2,
        "name": "Fragile Items",
        "cost": 10,
        "type": "percentage",
        "per_item": 0,
        "created_at": "2025-01-21 10:00:00",
        "updated_at": "2025-01-21 10:00:00"
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

## GET `/shipping/zones`

**GET List Shipping Zones**

Retrieve a paginated list of shipping zones with filtering and sorting capabilities.

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search zones by name |
| `per_page` | integer | no | Number of results per page (default: 10, max: 200) |
| `page` | integer | no | Page number for pagination |
| `sort_by` | string | no | Column to sort by (default: order) |
| `sort_type` | string | no | Sort direction: asc or desc (default: asc) |
| `filter_type` | string | no | Filter type: simple or advanced |


**Responses**

- **200** — Successful response. Returns a paginated list of shipping zones.

  Schema (`application/json`):

  - `shipping_zones` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
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
    - `last_page` (integer)
    - `data` (array<ShippingZone>)

  Example:

```json
{
  "shipping_zones": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
    "first_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/shipping/zones/?page=1",
    "from": 1,
    "last_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/shipping/zones/?page=1",
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/shipping/zones/?page=1",
        "label": "1",
        "active": true
      }
    ],
    "next_page_url": null,
    "path": "https://yoursite.com/wp-json/fluent-cart/v2/shipping/zones",
    "prev_page_url": null,
    "to": 2,
    "last_page": 1,
    "data": [
      {
        "id": 1,
        "name": "Domestic",
        "region": "US",
        "order": 0,
        "formatted_region": "United States",
        "created_at": "2025-01-15 12:00:00",
        "updated_at": "2025-01-15 12:00:00"
      },
      {
        "id": 2,
        "name": "Rest of World",
        "region": "all",
        "order": 1,
        "formatted_region": "Whole World",
        "created_at": "2025-01-16 10:00:00",
        "updated_at": "2025-01-16 10:00:00"
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

## PUT `/shipping/classes/{id}`

**PUT Update Shipping Class**

Update an existing shipping class.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The shipping class ID |


**Request body** (`application/json`, required)

- `name` (string) **required** _(maxLength: 192)_ — Class name (max 192 characters)
- `cost` (number) **required** _(min: 0)_ — Cost value (minimum: 0)
- `type` (string) **required** _(enum: `fixed`, `percentage`)_ — Cost type: fixed or percentage
- `per_item` (integer) _(enum: `0`, `1`; default: `0`)_ — Apply cost per item (1) or per order (0). Default: 0

Example:

```json
{
  "name": "Heavy Items",
  "cost": 20,
  "type": "fixed",
  "per_item": 1
}
```


**Responses**

- **200** — Shipping class updated successfully.

  Schema (`application/json`):

  - `shipping_class` (ShippingClass)
  - `message` (string)

  Example:

```json
{
  "shipping_class": {
    "id": 1,
    "name": "Heavy Items",
    "cost": 20,
    "type": "fixed",
    "per_item": 1,
    "created_at": "2025-01-20 09:00:00",
    "updated_at": "2025-02-05 14:00:00"
  },
  "message": "Shipping class has been updated successfully"
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

## PUT `/shipping/methods`

**PUT Update Shipping Method**

Update an existing shipping method. The method ID is passed in the request body.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `method_id` (integer) **required** — ID of the shipping method to update
- `zone_id` (integer) **required** — ID of the parent shipping zone
- `title` (string) **required** _(maxLength: 192)_ — Method display title (max 192 characters)
- `type` (string) **required** _(maxLength: 192)_ — Shipping method type (e.g., flat_rate, free_shipping, local_pickup)
- `amount` (string) — Shipping cost in cents (e.g., 500 for $5.00)
- `is_enabled` (integer) _(enum: `0`, `1`)_ — Enable/disable the method: 1 (enabled) or 0 (disabled)
- `states` (array<string>) — Array of state/province codes to restrict this method to. Empty array means all states.
- `settings` (object) — Additional settings for the method
  - `configure_rate` (string) — Rate configuration type
  - `class_aggregation` (string) — How shipping classes are aggregated
- `meta` (object) — Additional metadata key-value pairs (string values only)
  - _(object)_

Example:

```json
{
  "method_id": 10,
  "zone_id": 1,
  "title": "Express Shipping",
  "type": "flat_rate",
  "amount": "1200",
  "is_enabled": 1,
  "states": [
    "CA",
    "NY",
    "TX",
    "FL"
  ]
}
```


**Responses**

- **200** — Shipping method updated successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Shipping method has been updated successfully"
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

## PUT `/shipping/zones/{id}`

**PUT Update Shipping Zone**

Update an existing shipping zone. If the region changes, all associated shipping method states are reset to empty.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The shipping zone ID |


**Request body** (`application/json`, required)

- `name` (string) **required** _(maxLength: 192)_ — Zone name (max 192 characters)
- `region` (string) — ISO 3166-1 alpha-2 country code or 'all'. Only one 'all' zone is allowed.
- `order` (integer) — Sort order for display priority

Example:

```json
{
  "name": "United States",
  "region": "US",
  "order": 0
}
```


**Responses**

- **200** — Shipping zone updated successfully.

  Schema (`application/json`):

  - `shipping_zone` (ShippingZone)
  - `message` (string)

  Example:

```json
{
  "shipping_zone": {
    "id": 1,
    "name": "United States",
    "region": "US",
    "order": 0,
    "formatted_region": "United States",
    "created_at": "2025-01-15 12:00:00",
    "updated_at": "2025-02-01 09:00:00"
  },
  "message": "Shipping zone has been updated successfully"
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

## POST `/shipping/zones/update-order`

**POST Update Zone Order**

Reorder shipping zones by providing an array of zone IDs in the desired order. Each zone's order field is updated to match its index position.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `zones` (array<integer>) **required** — Array of zone IDs in the desired display order

Example:

```json
{
  "zones": [
    3,
    1,
    2
  ]
}
```


**Responses**

- **200** — Zone order updated successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Shipping zones order has been updated"
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


- **422** — Invalid data provided.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Invalid data provided"
}
```



---

## GET `/shipping/classes/{id}/profile`

**GET Get Shipping Class Profile**

Retrieve a shipping class together with every shipping zone it is assigned to, each zone including its shipping methods. Used to show the full reach of a class across all zones in one call.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The shipping class ID |


**Responses**

- **200** — Successful response. Returns the shipping class with its zones and each zone's methods.

  Schema (`application/json`):

  - `shipping_class` (ShippingClassProfile)

  Example:

```json
{
  "shipping_class": {
    "id": 1,
    "name": "Heavy Items",
    "cost": 15,
    "type": "fixed",
    "per_item": 1,
    "created_at": "2025-01-20 09:00:00",
    "updated_at": "2025-01-20 09:00:00",
    "zones": [
      {
        "id": 1,
        "name": "Domestic",
        "region": "US",
        "shipping_class_id": 1,
        "order": 0,
        "formatted_region": "United States",
        "created_at": "2025-01-15 12:00:00",
        "updated_at": "2025-01-15 12:00:00",
        "methods": [
          {
            "id": 10,
            "zone_id": 1,
            "title": "Standard Shipping",
            "type": "flat_rate",
            "amount": 500,
            "is_enabled": true,
            "created_at": "2025-01-15 12:30:00",
            "updated_at": "2025-01-15 12:30:00"
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


- **404** — No shipping class exists with the given ID. Thrown by `ShippingClass::findOrFail()`, not an explicit controller check, so the message is generic and names the model class and ID.

  Example:

```json
{
  "message": "No query results for model [FluentCart\\App\\Models\\ShippingClass] 42"
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

## GET `/shipping/packages`

**GET Get Shipping Packages**

List the store's configured shipping packages (boxes, envelopes, and soft packages used for rate calculation).

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns the configured shipping packages.

  Schema (`application/json`):

  - `packages` (array<ShippingPackage>)

  Example:

```json
{
  "packages": [
    {
      "slug": "small-box",
      "name": "Small Box",
      "type": "box",
      "length": 20,
      "width": 15,
      "height": 10,
      "dimension_unit": "cm",
      "weight": 0.5,
      "weight_unit": "kg",
      "is_default": true
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

## GET `/shipping/zone/countries`

**GET Get Countries By Continent**

List every country FluentCart recognizes, grouped by continent. Used to populate the region picker when creating or editing a shipping zone.

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns countries grouped by continent.

  Schema (`application/json`):

  - `continents` (array<object>)
    - `code` (string) — Continent code.
    - `name` (string) — Continent display name.
    - `countries` (array<object>)
      - `code` (string) — ISO 3166-1 alpha-2 country code.
      - `name` (string) — Country display name.

  Example:

```json
{
  "continents": [
    {
      "code": "AF",
      "name": "Africa",
      "countries": [
        {
          "code": "AO",
          "name": "Angola"
        },
        {
          "code": "BF",
          "name": "Burkina Faso"
        }
      ]
    },
    {
      "code": "AN",
      "name": "Antarctica",
      "countries": [
        {
          "code": "AQ",
          "name": "Antarctica"
        },
        {
          "code": "BV",
          "name": "Bouvet Island"
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

## POST `/shipping/packages`

**POST Save Shipping Packages**

Replace the store's full list of shipping packages. The list is capped at 50 entries; each entry is sanitized server-side (unknown `type`/unit values fall back to defaults, `height` is forced to null for `envelope` packages, and duplicate slugs are automatically suffixed).

**Access policy:** `StoreSensitivePolicy`

**Access policy:** `StoreSensitivePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `packages` (array<object>) **required** — Full replacement list of packages (max 50). Non-array values are treated as an empty list.
  - `slug` (string) — Optional; derived from name if omitted.
  - `name` (string)
  - `type` (string) _(enum: `box`, `envelope`, `soft_package`)_
  - `length` (number)
  - `width` (number)
  - `height` (number) — Ignored (forced to null) for `envelope` type.
  - `dimension_unit` (string) _(enum: `cm`, `mm`, `in`, `m`)_
  - `weight` (number)
  - `weight_unit` (string) _(enum: `kg`, `g`, `lbs`, `oz`)_
  - `is_default` (boolean)

Example:

```json
{
  "packages": [
    {
      "name": "Small Box",
      "type": "box",
      "length": 20,
      "width": 15,
      "height": 10,
      "dimension_unit": "cm",
      "weight": 0.5,
      "weight_unit": "kg",
      "is_default": true
    }
  ]
}
```


**Responses**

- **200** — Successful response. Returns the sanitized, persisted package list.

  Schema (`application/json`):

  - `packages` (array<ShippingPackage>)
  - `message` (string)

  Example:

```json
{
  "packages": [
    {
      "slug": "small-box",
      "name": "Small Box",
      "type": "box",
      "length": 20,
      "width": 15,
      "height": 10,
      "dimension_unit": "cm",
      "weight": 0.5,
      "weight_unit": "kg",
      "is_default": true
    }
  ],
  "message": "Packages have been saved successfully"
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
