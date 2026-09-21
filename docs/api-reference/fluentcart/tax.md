# FluentCart API — Tax

27 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/tax/classes`

**POST Create Tax Class**

Create a new tax class. A unique slug is auto-generated from the title. Pass slug "reduced" or "zero" to create one of the built-in classes (title is then set automatically). A maximum of 6 tax classes is allowed; the built-in "standard" class always exists and cannot be deleted.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `title` (string) **required** _(maxLength: 30)_ — Tax class title (max 30 characters). Required unless a built-in slug is passed
- `slug` (string) — Optional. Pass a built-in slug (reduced or zero) to create that built-in class; otherwise the slug is auto-generated from the title

Example:

```json
{
  "title": "Digital Goods"
}
```


**Responses**

- **200** — Tax class created successfully.

  Schema (`application/json`):

  - `class` (TaxClass)
  - `message` (string)

  Example:

```json
{
  "class": {
    "id": 4,
    "title": "Digital Goods",
    "slug": "digital-goods",
    "meta": [],
    "created_at": "2025-06-01 12:00:00",
    "updated_at": "2025-06-01 12:00:00"
  },
  "message": "Tax class created successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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


- **422** — Title exceeds 30 characters.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Tax class name must be 30 characters or fewer"
}
```


- **423** — Limit reached, missing title, or duplicate class. Returned when 6 classes already exist, the title is missing, or a class with the same slug already exists.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Maximum of 6 tax classes allowed"
}
```



---

## POST `/tax/country/rate`

**POST Create Tax Rate**

Create a new tax rate entry for a country.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `class_id` (integer) **required** — ID of the tax class this rate belongs to
- `country` (string) — ISO 3166-1 alpha-2 country code (max 45 characters)
- `state` (string) — State/province code (max 45 characters)
- `postcode` (string) — Postcode/ZIP code (max 45 characters)
- `city` (string) — City name (max 45 characters)
- `rate` (string) — Tax rate percentage (e.g., "19.0000", max 45 characters)
- `name` (string) — Display name for the tax rate (max 45 characters)
- `group` (string) — Geographic group/continent code (e.g., EU, NA, max 45 characters)
- `priority` (integer) _(min: 1)_ — Priority for rate application order (min: 1)
- `is_compound` (integer) _(enum: `0`, `1`; default: `0`)_ — Whether this rate is compound (0 or 1, default: 0)
- `for_shipping` (integer) — Shipping tax override rate. null means no override
- `for_order` (integer) _(enum: `0`, `1`; default: `0`)_ — Whether this rate applies at order level (0 or 1, default: 0)

Example:

```json
{
  "class_id": 1,
  "country": "FR",
  "rate": "20.0000",
  "name": "FR Standard Tax",
  "group": "EU",
  "priority": 1
}
```


**Responses**

- **200** — Tax rate created successfully.

  Schema (`application/json`):

  - `tax_rate` (TaxRateWithClass)
  - `message` (string)

  Example:

```json
{
  "tax_rate": {
    "id": 10,
    "class_id": 1,
    "country": "FR",
    "state": "",
    "postcode": "",
    "city": "",
    "rate": "20.0000",
    "name": "FR Standard Tax",
    "group": "EU",
    "priority": 1,
    "is_compound": 0,
    "for_shipping": null,
    "for_order": 0,
    "formatted_state": "",
    "tax_class": {
      "id": 1,
      "title": "Standard"
    }
  },
  "message": "Tax rate has been created successfully"
}
```


- **400** — Validation error.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Tax class is required"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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

## DELETE `/tax/rates/country/override/{id}`

**DELETE Delete Shipping Tax Override**

Remove the shipping tax override from a tax rate, resetting for_shipping to null.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Tax rate ID to remove the shipping override from |


**Responses**

- **200** — Shipping override deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Shipping override has been deleted successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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

## DELETE `/tax/classes/{id}`

**DELETE Delete Tax Class**

Delete a tax class by ID.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Tax class ID |


**Responses**

- **200** — Tax class deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Tax class has been deleted successfully"
}
```


- **400** — Failed to delete tax class.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Failed to delete tax class"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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

## DELETE `/tax/country/rate/{id}`

**DELETE Delete Tax Rate**

Delete a single tax rate by ID.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Tax rate ID |


**Responses**

- **200** — Tax rate deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Tax rate has been deleted successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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

## GET `/tax/country-tax-id/{country_code}`

**GET Get Country Tax ID**

Retrieve the store's tax identification number (VAT/GST/EIN) for a specific country.

**Required permission:** `store/settings`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `country_code` | string | yes | ISO 3166-1 alpha-2 country code (e.g., US, DE) |


**Responses**

- **200** — Successful response. Returns the tax ID for the country.

  Schema (`application/json`):

  - `tax_data` (object)
    - `tax_id` (string) — Tax identification number

  Example:

```json
{
  "tax_data": {
    "tax_id": "DE123456789"
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


- **403** — Authenticated, but the user lacks the required capability (`store/settings`).

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

## GET `/tax/rates/country/rates/{country_code}`

**GET Get Country Tax Rates**

Retrieve all tax rates for a specific country (ordered by priority, then ID), the country-level form configuration, and whether tax is enabled for the country.

**Required permission:** `store/settings`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `country_code` | string | yes | ISO 3166-1 alpha-2 country code (e.g., US, DE, GB) |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `class_id` | integer | no | Optional tax class ID to filter the rates |


**Responses**

- **200** — Successful response. Returns tax rates for the specified country.

  Schema (`application/json`):

  - `tax_rates` (array<TaxRate>)
  - `settings` (object) — Country-level form configuration from the built-in tax config. Falls back to the continent configuration (e.g., EU) and is null when neither defines one
    - `hidden` (array<string>) — Address fields hidden in the rate form for this country (e.g., city, zip, state)
  - `tax_enabled` (boolean) — Whether tax collection is enabled for this country (default: true)

  Example:

```json
{
  "tax_rates": [
    {
      "id": 5,
      "class_id": 1,
      "country": "DE",
      "state": "",
      "postcode": "",
      "city": "",
      "rate": "19.0000",
      "name": "DE Standard Tax",
      "group": "EU",
      "priority": 1,
      "is_compound": 0,
      "for_shipping": null,
      "for_order": 0,
      "formatted_state": ""
    }
  ],
  "settings": {
    "hidden": [
      "city",
      "zip",
      "state"
    ]
  },
  "tax_enabled": true
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


- **403** — Authenticated, but the user lacks the required capability (`store/settings`).

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

## GET `/tax/configuration/rates`

**GET Get Preconfigured Tax Rates**

Retrieve the full list of preconfigured tax rates from the built-in tax rates data file. These are the default rates organized by continent/region (`EU`, `NA`, `SA`, `AS`, `AF`, `OC`, `REST`) and country.

**Required permission:** `store/settings`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns preconfigured tax rates grouped by geographic region.

  Schema (`application/json`):

  - `tax_rates` (object) — Keyed by region/continent group code: EU, NA, SA, AS, AF, OC, REST.
    - _(object)_

  Example:

```json
{
  "tax_rates": {
    "EU": {
      "group_name": "European Union",
      "group_code": "EU",
      "countries": [
        {
          "country_code": "AT",
          "country_name": "Austria",
          "total_rates": 3,
          "rates": [
            {
              "rate": 20,
              "compound": false,
              "type": "standard",
              "name": "MwSt"
            },
            {
              "rate": 13,
              "compound": false,
              "type": "reduced"
            },
            {
              "rate": 0,
              "compound": false,
              "type": "zero"
            }
          ]
        },
        {
          "country_code": "BE",
          "country_name": "Belgium",
          "total_rates": 3,
          "rates": [
            {
              "rate": 21,
              "compound": false,
              "type": "standard",
              "name": "BTW/TVA"
            },
            {
              "rate": 6,
              "compound": false,
              "type": "reduced"
            },
            {
              "rate": 0,
              "compound": false,
              "type": "zero"
            }
          ]
        }
      ],
      "total_countries": 27
    },
    "REST": {
      "group_name": "Rest of the World",
      "group_code": "REST",
      "countries": [
        {
          "country_code": "GB",
          "country_name": "United Kingdom (UK)",
          "total_rates": 2,
          "rates": [
            {
              "rate": 20,
              "compound": false,
              "type": "standard"
            },
            {
              "rate": 5,
              "compound": false,
              "type": "reduced"
            }
          ]
        }
      ],
      "total_countries": 28
    },
    "NA": {
      "group_name": "North America",
      "group_code": "NA",
      "countries": [
        {
          "country_code": "US",
          "country_name": "United States (US)",
          "total_rates": 2,
          "rates": [
            {
              "rate": 4,
              "compound": false,
              "state": "AL",
              "name": "Alabama State Tax (Standard)",
              "type": "standard"
            },
            {
              "rate": 2,
              "compound": false,
              "state": "AL",
              "name": "Alabama Reduced",
              "type": "reduced"
            }
          ]
        },
        {
          "country_code": "CA",
          "country_name": "Canada",
          "total_rates": 2,
          "rates": [
            {
              "rate": 5,
              "compound": false,
              "type": "standard",
              "name": "GST"
            },
            {
              "rate": 0,
              "compound": false,
              "type": "zero"
            }
          ]
        }
      ],
      "total_countries": 42
    },
    "SA": {
      "group_name": "South America",
      "group_code": "SA",
      "countries": [
        {
          "country_code": "BR",
          "country_name": "Brazil",
          "total_rates": 2,
          "rates": [
            {
              "rate": 17,
              "compound": false,
              "type": "standard",
              "name": "ICMS"
            },
            {
              "rate": 0,
              "compound": false,
              "type": "zero"
            }
          ]
        }
      ],
      "total_countries": 15
    },
    "AS": {
      "group_name": "Asia",
      "group_code": "AS",
      "countries": [
        {
          "country_code": "CN",
          "country_name": "China",
          "total_rates": 2,
          "rates": [
            {
              "rate": 13,
              "compound": false,
              "type": "standard",
              "name": "VAT"
            },
            {
              "rate": 0,
              "compound": false,
              "type": "zero"
            }
          ]
        }
      ],
      "total_countries": 50
    },
    "AF": {
      "group_name": "Africa",
      "group_code": "AF",
      "countries": [
        {
          "country_code": "BJ",
          "country_name": "Benin",
          "total_rates": 2,
          "rates": [
            {
              "rate": 18,
              "compound": false,
              "type": "standard",
              "name": "TVA"
            },
            {
              "rate": 0,
              "compound": false,
              "type": "zero"
            }
          ]
        }
      ],
      "total_countries": 58
    },
    "OC": {
      "group_name": "Oceania",
      "group_code": "OC",
      "countries": [
        {
          "country_code": "AU",
          "country_name": "Australia",
          "total_rates": 2,
          "rates": [
            {
              "rate": 10,
              "compound": false,
              "type": "standard",
              "name": "GST"
            },
            {
              "rate": 0,
              "compound": false,
              "type": "zero"
            }
          ]
        }
      ],
      "total_countries": 30
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


- **403** — Authenticated, but the user lacks the required capability (`store/settings`).

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

## GET `/tax/configuration/settings`

**GET Get Tax Settings**

Retrieve the current global tax configuration settings along with the store country.

**Required permission:** `store/settings`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns the current tax settings and the store country.

  Schema (`application/json`):

  - `settings` (TaxSettings)
  - `store_country` (string) — The store country code from store settings (empty string when unset)

  Example:

```json
{
  "settings": {
    "tax_inclusion": "included",
    "tax_calculation_basis": "shipping",
    "tax_rounding": "item",
    "checkout_tax_breakdown_display": "itemized",
    "tax_display_label": "Tax",
    "enable_tax": "yes",
    "price_suffix_included": "",
    "price_suffix_excluded": "",
    "eu_vat_settings": {
      "require_vat_number": "no",
      "local_reverse_charge": "yes",
      "reverse_charge_price_mode": "fixed",
      "vat_reverse_excluded_categories": [
        30,
        42
      ],
      "method": "oss",
      "oss_country": "DE",
      "oss_vat": "DE123456789",
      "country_wise_vat": [],
      "country_registrations": [
        {
          "country": "DE",
          "vat": "DE123456789",
          "rate": 19,
          "rates": {
            "standard": {
              "rate": 19,
              "label": "VAT"
            },
            "reduced": {
              "rate": 7,
              "label": "Reduced VAT"
            }
          },
          "tax_label": "VAT"
        }
      ]
    }
  },
  "store_country": "DE"
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


- **403** — Authenticated, but the user lacks the required capability (`store/settings`).

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

## GET `/tax/rates`

**GET List All Tax Rates**

Retrieve all tax rates from the database, grouped by continent/region and country.

**Required permission:** `store/settings`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns tax rates grouped by geographic region.

  Schema (`application/json`):

  - `tax_rates` (array<TaxRateGroup>)
  - `country_enabled_map` (object) — Map of country code (plus "EU") to whether tax is enabled for that country. Defaults to true for any country without an explicit override.
    - _(object)_

  Example:

```json
{
  "tax_rates": [
    {
      "group_name": "European Union",
      "group_code": "EU",
      "countries": [
        {
          "country_code": "DE",
          "country_name": "Germany",
          "rates": [
            {
              "class_id": 1,
              "name": "DE Standard Tax",
              "rate": "19.0000",
              "for_shipping": null
            },
            {
              "class_id": 2,
              "name": "DE Reduced Tax",
              "rate": "7.0000",
              "for_shipping": null
            }
          ],
          "total_rates": 2,
          "enabled": true
        }
      ],
      "total_countries": 1
    },
    {
      "group_name": "North America",
      "group_code": "NA",
      "countries": [
        {
          "country_code": "US",
          "country_name": "United States",
          "rates": [
            {
              "class_id": 1,
              "name": "US Standard Tax",
              "rate": "10.0000",
              "for_shipping": null
            }
          ],
          "total_rates": 1,
          "enabled": true
        }
      ],
      "total_countries": 1
    }
  ],
  "country_enabled_map": {
    "EU": true,
    "DE": true,
    "US": true
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


- **403** — Authenticated, but the user lacks the required capability (`store/settings`).

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

## GET `/tax/classes`

**GET List Tax Classes**

Retrieve all tax classes ordered by ID (oldest first), along with the maximum allowed number of classes and the next built-in class (Reduced or Zero) that has not been created yet.

**Required permission:** `store/settings`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns all tax classes.

  Schema (`application/json`):

  - `classes` (array<TaxClass>)
  - `max_classes` (integer) — Maximum number of tax classes allowed (6)
  - `next_builtin` (object) — The next built-in class not yet created (null when both reduced and zero exist)
    - `slug` (string)
    - `title` (string)

  Example:

```json
{
  "classes": [
    {
      "id": 1,
      "title": "Standard",
      "slug": "standard",
      "meta": [],
      "created_at": "2025-01-15 10:00:00",
      "updated_at": "2025-01-15 10:00:00"
    },
    {
      "id": 2,
      "title": "Reduced",
      "slug": "reduced",
      "meta": [],
      "created_at": "2025-01-15 10:15:00",
      "updated_at": "2025-01-15 10:15:00"
    },
    {
      "id": 3,
      "title": "Digital Goods",
      "slug": "digital-goods",
      "meta": [],
      "created_at": "2025-01-15 10:30:00",
      "updated_at": "2025-01-15 10:30:00"
    }
  ],
  "max_classes": 6,
  "next_builtin": {
    "slug": "zero",
    "title": "Zero"
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


- **403** — Authenticated, but the user lacks the required capability (`store/settings`).

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

## GET `/taxes`

**GET List Tax Records**

Retrieve a paginated list of order tax rate records with optional filtering, sorting, and search.

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | no | Page number for pagination |
| `per_page` | integer | no | Number of records per page (default: 10, max: 200) |
| `search` | string | no | Search term. If numeric, searches by id or order_id. Also searches related tax rate country, state, postcode, and name fields. Supports operator syntax (e.g., id = 5, order_id > 100). |
| `sort_by` | string | no | Column to sort by (default: id) |
| `sort_type` | string | no | Sort direction: asc or desc (default: desc) |
| `active_view` | string | no | Tab filter. One of: filed (records with filed_at set), not_filed (records without filed_at). |
| `filter_type` | string | no | Filter mode: simple (default) or advanced |
| `advanced_filters` | string | no | JSON-encoded array of advanced filter groups. Supports filtering by country, region, tax name, and filed status. |
| `with` | string | no | Eager-load relations (e.g., order, tax_rate) |
| `select` | string | no | Comma-separated list of columns to select |
| `include_ids` | string | no | Comma-separated IDs that must always be included in results |
| `user_tz` | string | no | User timezone for date filtering (e.g., America/New_York) |


**Responses**

- **200** — Successful response. Returns paginated tax records.

  Schema (`application/json`):

  - `taxes` (object)
    - `current_page` (integer)
    - `data` (array<OrderTaxRate>)
    - `per_page` (integer)
    - `total` (integer)
    - `last_page` (integer)
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
  "taxes": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "order_id": 42,
        "tax_rate_id": 5,
        "shipping_tax": 150,
        "order_tax": 1000,
        "total_tax": 1150,
        "meta": {
          "rates": [
            {
              "rate_id": 5,
              "name": "CA State Tax",
              "rate": "8.2500",
              "tax_amount": 825,
              "shipping_tax_amount": 150
            }
          ],
          "tax_country": "US",
          "store_vat_number": "12-3456789"
        },
        "filed_at": null,
        "created_at": "2025-06-01 12:00:00",
        "updated_at": "2025-06-01 12:00:00"
      }
    ],
    "per_page": 10,
    "total": 50,
    "last_page": 5,
    "first_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/taxes/?page=1",
    "from": 1,
    "last_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/taxes/?page=5",
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/taxes/?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/taxes/?page=2",
        "label": "2",
        "active": false
      }
    ],
    "next_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/taxes/?page=2",
    "path": "https://yoursite.com/wp-json/fluent-cart/v2/taxes",
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

## POST `/taxes`

**POST Mark Taxes as Filed**

Mark one or more order tax records as filed by setting their filed_at timestamp.

**Access policy:** `AdminPolicy` — requires the `is_super_admin` FluentCart capability.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `ids` (array<integer>) **required** — Array of OrderTaxRate record IDs to mark as filed

Example:

```json
{
  "ids": [
    1,
    2,
    3,
    5
  ]
}
```


**Responses**

- **200** — Taxes marked as filed successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Taxes marked as filed successfully"
}
```


- **400** — No IDs provided.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "No IDs provided to mark!"
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

## POST `/tax/configuration/countries`

**POST Save Configured Countries**

Generate tax classes and import tax rates for the specified countries from the built-in rates data. Countries that already have rates in the database are skipped.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `countries` (array<string>) **required** — Array of ISO 3166-1 alpha-2 country codes to configure

Example:

```json
{
  "countries": [
    "DE",
    "FR",
    "IT",
    "ES"
  ]
}
```


**Responses**

- **200** — Countries saved successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Countries saved successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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

## POST `/tax/country-tax-id/{country_code}`

**POST Save Country Tax ID**

Save or update the store's tax identification number for a specific country.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `country_code` | string | yes | ISO 3166-1 alpha-2 country code (e.g., US, DE) |


**Request body** (`application/json`, required)

- `tax_id` (string) **required** — The tax identification number (e.g., VAT number, EIN, GST number)

Example:

```json
{
  "tax_id": "DE123456789"
}
```


**Responses**

- **200** — Tax ID saved successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Tax ID has been saved successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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

## POST `/tax/configuration/settings/eu-vat`

**POST Save EU VAT Cross-Border Settings**

Multi-action endpoint for EU VAT settings, dispatched by the action field: euCrossBorderSettings saves the cross-border registration configuration (OSS, home country, or specific country registrations); saveCountryRegistration creates or updates a per-country VAT registration with per-class rates; deleteCountryRegistration removes a per-country VAT registration.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `action` (string) **required** _(enum: `euCrossBorderSettings`, `saveCountryRegistration`, `deleteCountryRegistration`)_ — Which operation to perform
- `eu_vat_settings` (object) — euCrossBorderSettings only. Merged into the stored eu_vat_settings
  - `method` (string) _(enum: `oss`, `home`, `specific`)_ — Cross-border method (required)
  - `oss_country` (string) — Country of OSS registration (required when method is oss; must be an EU VAT country)
  - `oss_vat` (string) — OSS VAT number
  - `home_country` (string) — Home country code (required when method is home; must be an EU VAT country)
  - `home_vat` (string) — Home VAT number
- `reset_registration` (string) _(enum: `yes`, `no`)_ — euCrossBorderSettings only. Set to yes to clear the current method (reset registration)
- `country` (string) — saveCountryRegistration / deleteCountryRegistration. ISO 3166-1 alpha-2 code of an EU VAT country (required)
- `vat` (string) _(maxLength: 50)_ — saveCountryRegistration only. VAT registration number (max 50 characters)
- `rates` (object) — saveCountryRegistration only. Per-class rates keyed by tax class slug; at least one rate must be greater than 0 and every slug must reference an existing tax class
  - _(object)_

Example:

```json
{
  "action": "euCrossBorderSettings",
  "eu_vat_settings": {
    "method": "oss",
    "oss_country": "DE",
    "oss_vat": "DE123456789"
  }
}
```


**Responses**

- **200** — Settings saved. The message depends on the action: "EU VAT settings saved successfully", "Country VAT registration saved successfully", or "Country registration removed successfully".

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "EU VAT settings saved successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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


- **422** — Unknown action ("Invalid method") or validation failed for the given action.

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "Validation failed for EU VAT settings",
  "errors": {
    "method": "Select a cross-border registration type"
  }
}
```



---

## POST `/tax/rates/country/override`

**POST Save Shipping Tax Override**

Set a shipping-specific tax override on an existing tax rate.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `id` (integer) **required** — Tax rate ID to apply the shipping override to
- `override_tax_rate` (integer) **required** — The override tax rate value to use for shipping

Example:

```json
{
  "id": 5,
  "override_tax_rate": 7
}
```


**Responses**

- **200** — Shipping tax override saved successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Tax override has been saved successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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


- **404** — Tax rate not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Tax rate not found"
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

## POST `/tax/configuration/settings`

**POST Save Tax Settings**

Save the global tax configuration settings. Invalid enum values are silently replaced with their defaults. If tax is enabled, initial tax classes are automatically created.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `settings` (object) **required**
  - `enable_tax` (string) _(enum: `yes`, `no`)_ — Enable or disable tax calculation
  - `tax_inclusion` (string) _(enum: `included`, `excluded`)_ — Whether prices include tax
  - `tax_calculation_basis` (string) _(enum: `shipping`, `billing`, `store`)_ — Address basis for tax calculation
  - `tax_rounding` (string) _(enum: `item`, `total`, `subtotal`)_ — Where tax rounding is applied
  - `checkout_tax_breakdown_display` (string) _(enum: `itemized`, `simplified`)_ — How the tax breakdown is displayed at checkout
  - `tax_display_label` (string) — Label used when displaying tax amounts
  - `price_suffix_included` (string) — Text appended after prices that include tax
  - `price_suffix_excluded` (string) — Text appended after prices that exclude tax
  - `eu_vat_settings` (object) — EU VAT configuration object
    - `require_vat_number` (string) _(enum: `yes`, `no`)_
    - `local_reverse_charge` (string) _(enum: `yes`, `no`)_
    - `reverse_charge_price_mode` (string) _(enum: `fixed`, `dynamic`; default: `fixed`)_ — Invalid values are replaced with fixed
    - `vat_reverse_excluded_categories` (array<integer>)
    - `country_wise_vat` (array<object>)
      - _(object)_

Example:

```json
{
  "settings": {
    "enable_tax": "yes",
    "tax_inclusion": "excluded",
    "tax_calculation_basis": "billing",
    "tax_rounding": "subtotal",
    "checkout_tax_breakdown_display": "itemized",
    "tax_display_label": "VAT",
    "price_suffix_included": "incl. VAT",
    "price_suffix_excluded": "excl. VAT",
    "eu_vat_settings": {
      "require_vat_number": "yes",
      "local_reverse_charge": "yes",
      "reverse_charge_price_mode": "fixed",
      "vat_reverse_excluded_categories": [
        12,
        15
      ],
      "country_wise_vat": []
    }
  }
}
```


**Responses**

- **200** — Settings saved successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Settings saved successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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

## PUT `/tax/country/rate/{id}`

**PUT Update Tax Rate**

Update an existing tax rate.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Tax rate ID |


**Request body** (`application/json`, required)

- `class_id` (integer) **required** — ID of the tax class this rate belongs to
- `country` (string) — ISO 3166-1 alpha-2 country code (max 45 characters)
- `state` (string) — State/province code (max 45 characters)
- `postcode` (string) — Postcode/ZIP code (max 45 characters)
- `city` (string) — City name (max 45 characters)
- `rate` (string) — Tax rate percentage (e.g., "19.0000")
- `name` (string) — Display name for the tax rate (max 45 characters)
- `group` (string) — Geographic group/continent code (max 45 characters)
- `priority` (integer) _(min: 1)_ — Priority for rate application order (min: 1)
- `is_compound` (integer) _(enum: `0`, `1`)_ — Whether this rate is compound (0 or 1)
- `for_shipping` (integer) — Shipping tax override rate
- `for_order` (integer) _(enum: `0`, `1`)_ — Whether this rate applies at order level (0 or 1)

Example:

```json
{
  "class_id": 1,
  "rate": "21.0000",
  "name": "FR Standard Tax (Updated)"
}
```


**Responses**

- **200** — Tax rate updated successfully.

  Schema (`application/json`):

  - `tax_rate` (object)
    - `id` (integer)
    - `class_id` (integer)
    - `country` (string)
    - `state` (string)
    - `postcode` (string)
    - `city` (string)
    - `rate` (string)
    - `name` (string)
    - `group` (string)
    - `priority` (integer)
    - `is_compound` (integer)
    - `for_shipping` (integer)
    - `for_order` (integer)
    - `formatted_state` (string)
    - `tax_class` (object)
      - `id` (integer)
      - `title` (string)
  - `message` (string)

  Example:

```json
{
  "tax_rate": {
    "id": 10,
    "class_id": 1,
    "country": "FR",
    "state": "",
    "postcode": "",
    "city": "",
    "rate": "20.0000",
    "name": "FR Standard Tax",
    "group": "EU",
    "priority": 1,
    "is_compound": 0,
    "for_shipping": null,
    "for_order": 0,
    "formatted_state": "",
    "tax_class": {
      "id": 1,
      "title": "Standard"
    }
  },
  "message": "Tax rate has been updated successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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

## DELETE `/tax/product-overrides/{id}`

**DELETE Delete Product Category Tax Override**

Delete a product category tax override by its ID.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Override (meta row) ID |


**Responses**

- **200** — Override deleted.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Product category tax override deleted"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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


- **422** — Override not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Override not found"
}
```



---

## GET `/tax/configuration/settings/eu-vat/product-overrides`

**GET Get EU VAT Product Overrides**

Retrieve product category tax overrides for all EU countries, plus every EU tax rate that has a shipping tax override set. class_id and class_label are appended to each row for convenience.

**Required permission:** `store/settings`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns EU product category overrides and shipping overrides.

  Schema (`application/json`):

  - `overrides` (array<ProductCategoryTaxOverride>)
  - `shipping_overrides` (array<EuShippingOverride>)

  Example:

```json
{
  "overrides": [
    {
      "id": 12,
      "object_type": "tax_override",
      "object_id": 15,
      "meta_key": "product_category_override",
      "meta_value": {
        "country": "DE",
        "state": "",
        "city": "",
        "postcode": "",
        "category_id": 15,
        "category_name": "Books",
        "tax_label": "Reduced VAT",
        "override_state_tax": "no",
        "rate": 7,
        "class_id": 1
      },
      "class_id": 1,
      "class_label": "Standard",
      "created_at": "2025-06-01 12:00:00",
      "updated_at": "2025-06-01 12:00:00"
    }
  ],
  "shipping_overrides": [
    {
      "id": 8,
      "class_id": 1,
      "country": "DE",
      "state": "",
      "postcode": "",
      "city": "",
      "rate": "19.0000",
      "name": "DE Standard Tax",
      "group": "EU",
      "priority": 1,
      "is_compound": 0,
      "for_shipping": "7.0000",
      "for_order": 0,
      "class_label": "Standard"
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


- **403** — Authenticated, but the user lacks the required capability (`store/settings`).

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

## GET `/tax/configuration/settings/eu-vat/oss-rates`

**GET Get OSS Country Rates**

Retrieve per-country EU VAT rates for every tax class. Each country entry includes the effective rate per class (custom database value or built-in default), plus top-level standard-class values for backward compatibility, and the list of tax classes.

**Required permission:** `store/settings`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns EU country rates per tax class.

  Schema (`application/json`):

  - `rates` (array<object>)
    - `country` (string) — ISO 3166-1 alpha-2 country code
    - `label` (string) — Country display name
    - `rate` (number) — Standard-class effective rate (backward compatibility)
    - `tax_label` (string) — Standard-class label, defaults to VAT
    - `default_rate` (number) — Built-in default standard rate
    - `has_custom` (boolean) — Whether the standard class has a custom rate row
    - `class_rates` (object) — Per-class rates keyed by tax class slug
      - _(object)_
  - `classes` (array<object>)
    - `slug` (string)
    - `title` (string)
    - `id` (integer)

  Example:

```json
{
  "rates": [
    {
      "country": "DE",
      "label": "Germany",
      "rate": 19,
      "tax_label": "VAT",
      "default_rate": 19,
      "has_custom": true,
      "class_rates": {
        "standard": {
          "rate": 19,
          "default_rate": 19,
          "has_custom": true,
          "label": ""
        },
        "reduced": {
          "rate": 7,
          "default_rate": 7,
          "has_custom": true,
          "label": ""
        },
        "zero": {
          "rate": 0,
          "default_rate": 0,
          "has_custom": false,
          "label": ""
        }
      }
    }
  ],
  "classes": [
    {
      "slug": "standard",
      "title": "Standard",
      "id": 1
    },
    {
      "slug": "reduced",
      "title": "Reduced",
      "id": 2
    },
    {
      "slug": "zero",
      "title": "Zero",
      "id": 3
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


- **403** — Authenticated, but the user lacks the required capability (`store/settings`).

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

## GET `/tax/product-overrides/{country_code}`

**GET Get Product Category Tax Overrides**

Retrieve all product category tax overrides for a specific country. Each override is a meta row whose meta_value holds the location, category, rate, and tax class data; class_id and class_label are appended for convenience.

**Required permission:** `store/settings`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `country_code` | string | yes | ISO 3166-1 alpha-2 country code (e.g., US, DE) |


**Responses**

- **200** — Successful response. Returns the product category tax overrides for the country.

  Schema (`application/json`):

  - `overrides` (array<ProductCategoryTaxOverride>)

  Example:

```json
{
  "overrides": [
    {
      "id": 12,
      "object_type": "tax_override",
      "object_id": 15,
      "meta_key": "product_category_override",
      "meta_value": {
        "country": "DE",
        "state": "",
        "city": "",
        "postcode": "",
        "category_id": 15,
        "category_name": "Books",
        "tax_label": "Reduced VAT",
        "override_state_tax": "no",
        "rate": 7,
        "class_id": 1
      },
      "class_id": 1,
      "class_label": "Standard",
      "created_at": "2025-06-01 12:00:00",
      "updated_at": "2025-06-01 12:00:00"
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


- **403** — Authenticated, but the user lacks the required capability (`store/settings`).

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

## POST `/tax/configuration/settings/eu-vat/reset-rates`

**POST Reset EU VAT Rates**

Reset all country-level EU standard VAT rates back to the built-in defaults. Custom rate values and auto-generated labels are overwritten; state-specific entries and shipping overrides on the rows are preserved. No request body is required.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Responses**

- **200** — EU rates reset.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "EU tax rates have been reset to defaults"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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

## POST `/tax/configuration/settings/eu-vat/oss-rates`

**POST Save OSS Country Rates**

Save per-country EU VAT rates. Each entry may provide class_rates keyed by tax class slug ({rate, label}); rates are upserted per country and class in the EU group. When class_rates is omitted, the single rate value is applied to the standard class (backward compatibility). Entries with unknown tax class slugs or without a country are skipped.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `rates` (array<object>) **required** — Array of country rate entries
  - `country` (string) **required** — ISO 3166-1 alpha-2 code of an EU VAT country
  - `tax_label` (string) — Shared label fallback for classes without their own label
  - `rate` (number) — Standard-class rate (used only when class_rates is omitted)
  - `class_rates` (object) — Per-class rates keyed by tax class slug
    - _(object)_

Example:

```json
{
  "rates": [
    {
      "country": "DE",
      "tax_label": "VAT",
      "class_rates": {
        "standard": {
          "rate": 19,
          "label": "VAT"
        },
        "reduced": {
          "rate": 7,
          "label": "Reduced VAT"
        }
      }
    }
  ]
}
```


**Responses**

- **200** — OSS country rates saved.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "OSS country rates saved successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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


- **422** — Validation failed — one or more entries reference a non-EU VAT country.

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "Validation failed for OSS country rates",
  "errors": {
    "rates.0.country": "Select a valid EU VAT country"
  }
}
```



---

## POST `/tax/product-overrides`

**POST Save Product Category Tax Override**

Create or update a product category tax override. Pass id to update an existing override. Without id, an existing override matching the same category, location, and tax class is updated in place; otherwise a new override is created. Pass source_type "shipping" with source_id to convert an existing shipping tax override into a product override (the shipping override is removed).

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `id` (integer) — Existing override ID to update (omit to create or upsert by category/location/class)
- `country` (string) **required** — ISO 3166-1 alpha-2 country code
- `state` (string) — State/province code (optional)
- `city` (string) — City name (optional, max 45 characters)
- `postcode` (string) — Postcode/ZIP code (optional)
- `category_id` (integer) **required** — Product category (product-categories term) ID
- `tax_label` (string) — Display label for the override tax
- `override_state_tax` (string) _(enum: `yes`, `no`)_ — Whether the override replaces state-level tax (default: no)
- `rate` (number) — Override tax rate percentage (negative values are clamped to 0)
- `class_id` (integer) — Tax class ID the override applies to (0 = none; must exist when non-zero)
- `source_type` (string) — Set to "shipping" together with source_id to convert a shipping override into this product override
- `source_id` (integer) — Tax rate ID of the shipping override being converted (used with source_type "shipping")

Example:

```json
{
  "country": "DE",
  "category_id": 15,
  "tax_label": "Reduced VAT",
  "override_state_tax": "no",
  "rate": 7,
  "class_id": 1
}
```


**Responses**

- **200** — Override saved or updated.

  Schema (`application/json`):

  - `override` (ProductCategoryTaxOverride)
  - `message` (string)

  Example:

```json
{
  "override": {
    "id": 12,
    "object_type": "tax_override",
    "object_id": 15,
    "meta_key": "product_category_override",
    "meta_value": {
      "country": "DE",
      "state": "",
      "city": "",
      "postcode": "",
      "category_id": 15,
      "category_name": "Books",
      "tax_label": "Reduced VAT",
      "override_state_tax": "no",
      "rate": 7,
      "class_id": 1
    },
    "class_id": 1,
    "class_label": "Standard",
    "created_at": "2025-06-01 12:00:00",
    "updated_at": "2025-06-01 12:00:00"
  },
  "message": "Product category tax override saved"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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


- **404** — Override (or shipping override source) not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Override not found"
}
```


- **422** — Validation failed — missing country/category, invalid country code, invalid tax class, invalid product category, or a conflicting override already exists for the same category, location, and tax class.

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "An override already exists for the selected category, location, and tax class"
}
```



---

## POST `/tax/country-status/{country_code}`

**POST Update Country Tax Status**

Enable or disable tax collection for a specific country. Accepts an ISO 3166-1 alpha-2 country code or the special code EU to toggle the whole EU group. By default every country is enabled; disabling stores a flag in the fct_meta table.

**Required permission:** `store/sensitive`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `country_code` | string | yes | ISO 3166-1 alpha-2 country code (e.g., US, DE) or EU for the EU group |


**Request body** (`application/json`, required)

- `enabled` (integer) **required** _(enum: `0`, `1`)_ — 1 to enable tax for the country, 0 to disable

Example:

```json
{
  "enabled": 1
}
```


**Responses**

- **200** — Country tax status updated.

  Schema (`application/json`):

  - `enabled` (boolean) — The new status
  - `message` (string)

  Example:

```json
{
  "enabled": true,
  "message": "Tax has been enabled successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`store/sensitive`).

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


- **422** — Invalid country code or validation failed.

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "Invalid country code"
}
```



---
