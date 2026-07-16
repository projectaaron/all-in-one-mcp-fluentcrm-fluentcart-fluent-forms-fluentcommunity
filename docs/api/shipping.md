# FluentCart API — Shipping

15 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [API index](./README.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/shipping/classes`

**POST Create Shipping Class**

Create a new shipping class.

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



---

## POST `/shipping/methods`

**POST Create Shipping Method**

Create a new shipping method within a shipping zone.

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



---

## POST `/shipping/zones`

**POST Create Shipping Zone**

Create a new shipping zone.

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



---

## DELETE `/shipping/classes/{id}`

**DELETE Delete Shipping Class**

Delete a shipping class by ID.

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



---

## DELETE `/shipping/methods/{method_id}`

**DELETE Delete Shipping Method**

Delete a shipping method by ID.

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



---

## DELETE `/shipping/zones/{id}`

**DELETE Delete Shipping Zone**

Delete a shipping zone and all its associated shipping methods.

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



---

## GET `/shipping/classes/{id}`

**GET Get Shipping Class**

Retrieve a single shipping class by ID.

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



---

## GET `/shipping/zones/{id}`

**GET Get Shipping Zone**

Retrieve a single shipping zone by ID, including its associated shipping methods.

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
    "name": "Domestic",
    "region": "US",
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



---

## GET `/shipping/zone/states`

**GET Get Zone States**

Retrieve state/province options and address locale configuration for a given country. Useful for populating state selectors when configuring shipping methods within a zone.

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



---

## GET `/shipping/classes`

**GET List Shipping Classes**

Retrieve a paginated list of shipping classes with filtering and sorting capabilities.

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
    - `data` (array<ShippingClass>)

  Example:

```json
{
  "shipping_classes": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1,
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



---

## GET `/shipping/zones`

**GET List Shipping Zones**

Retrieve a paginated list of shipping zones with filtering and sorting capabilities.

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
    - `last_page` (integer)
    - `data` (array<ShippingZone>)

  Example:

```json
{
  "shipping_zones": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
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



---

## PUT `/shipping/classes/{id}`

**PUT Update Shipping Class**

Update an existing shipping class.

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



---

## PUT `/shipping/methods`

**PUT Update Shipping Method**

Update an existing shipping method. The method ID is passed in the request body.

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



---

## PUT `/shipping/zones/{id}`

**PUT Update Shipping Zone**

Update an existing shipping zone. If the region changes, all associated shipping method states are reset to empty.

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



---

## POST `/shipping/zones/update-order`

**POST Update Zone Order**

Reorder shipping zones by providing an array of zone IDs in the desired order. Each zone's order field is updated to match its index position.

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
