# FluentCart API — Tax

26 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/tax/classes`

**POST Create Tax Class**

Create a new tax class. A unique slug is auto-generated from the title.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `title` (string) **required** — Tax class title (max 192 characters)
- `description` (string) — Description of the tax class
- `categories` (array<integer>) — Array of product category IDs associated with this tax class
- `priority` (integer) _(default: `0`)_ — Sort priority (higher values appear first, default: 0)

Example:

```json
{
  "title": "Digital Goods",
  "description": "Tax class for digital products",
  "categories": [
    12,
    15
  ],
  "priority": 7
}
```


**Responses**

- **200** — Tax class created successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Tax class has been created successfully"
}
```


- **422** — Validation failed.

  Schema (`application/json`):

  - `errors` (object)
    - `title` (array<string>)
  - `message` (string)

  Example:

```json
{
  "errors": {
    "title": [
      "Tax class title is required."
    ]
  },
  "message": "Validation failed"
}
```



---

## POST `/tax/country/rate`

**POST Create Tax Rate**

Create a new tax rate entry for a country.

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



---

## DELETE `/tax/country/{country_code}`

**DELETE Delete All Rates for a Country**

Delete all tax rates for a specific country.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `country_code` | string | yes | ISO 3166-1 alpha-2 country code (e.g., US, DE) |


**Responses**

- **200** — Country rates deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Country has been deleted successfully"
}
```


- **400** — Failed to delete country rates.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Failed to delete country"
}
```



---

## DELETE `/tax/configuration/settings/eu-vat/oss/shipping-override`

**DELETE Delete OSS Shipping Tax Override**

Delete all EU shipping tax rate overrides for a specific country. Optionally filter by state/region.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `country` | string | yes | ISO 3166-1 alpha-2 country code |
| `state` | string | no | State/region code to narrow the deletion scope |


**Responses**

- **200** — OSS shipping override deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "OSS shipping override deleted successfully"
}
```


- **423** — Validation failed or no matching records found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "No matching OSS shipping override found to delete"
}
```



---

## DELETE `/tax/configuration/settings/eu-vat/oss/override`

**DELETE Delete OSS Tax Override**

Delete all EU tax rate overrides for a specific country. Optionally filter by state/region.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `country` | string | yes | ISO 3166-1 alpha-2 country code |
| `state` | string | no | State/region code to narrow the deletion scope |


**Responses**

- **200** — OSS tax override deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "OSS tax override deleted successfully"
}
```


- **423** — Validation failed or no matching records found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "No matching OSS tax override found to delete"
}
```



---

## DELETE `/tax/rates/country/override/{id}`

**DELETE Delete Shipping Tax Override**

Remove the shipping tax override from a tax rate, resetting for_shipping to null.

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



---

## DELETE `/tax/classes/{id}`

**DELETE Delete Tax Class**

Delete a tax class by ID.

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



---

## DELETE `/tax/country/rate/{id}`

**DELETE Delete Tax Rate**

Delete a single tax rate by ID.

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



---

## GET `/tax/country-tax-id/{country_code}`

**GET Get Country Tax ID**

Retrieve the store's tax identification number (VAT/GST/EIN) for a specific country.

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



---

## GET `/tax/rates/country/rates/{country_code}`

**GET Get Country Tax Rates**

Retrieve all tax rates for a specific country, including the associated tax class and country-level configuration settings.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `country_code` | string | yes | ISO 3166-1 alpha-2 country code (e.g., US, DE, GB) |


**Responses**

- **200** — Successful response. Returns tax rates for the specified country.

  Schema (`application/json`):

  - `tax_rates` (array<TaxRate>)
  - `settings` (object)
    - `compound_tax` (boolean)
    - `tax_id_label` (string)
    - `states` (object)
      - _(object)_

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
      "formatted_state": "",
      "tax_class": {
        "id": 1,
        "title": "Standard"
      }
    }
  ],
  "settings": {
    "compound_tax": true,
    "tax_id_label": "VAT",
    "states": {
      "BW": "Baden-Württemberg",
      "BY": "Bavaria",
      "BE": "Berlin",
      "HH": "Hamburg",
      "NW": "North Rhine-Westphalia"
    }
  }
}
```



---

## GET `/tax/configuration/settings/eu-vat/rates`

**GET Get EU Tax Rates**

Retrieve all tax rates in the EU group from the database, grouped by region and country.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns EU tax rates grouped by region and country.

  Schema (`application/json`):

  - `tax_rates` (array<object>)
    - `group_name` (string)
    - `group_code` (string)
    - `countries` (array<object>)
      - `country_code` (string)
      - `country_name` (string)
      - `rates` (array<object>)
        - `class_id` (integer)
        - `name` (string)
        - `rate` (string)
        - `for_shipping` (integer)
      - `total_rates` (integer)
    - `total_countries` (integer)

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
              "name": "standard",
              "rate": "19.0000",
              "for_shipping": null
            },
            {
              "class_id": 2,
              "name": "reduced",
              "rate": "7.0000",
              "for_shipping": null
            }
          ],
          "total_rates": 2
        },
        {
          "country_code": "FR",
          "country_name": "France",
          "rates": [
            {
              "class_id": 1,
              "name": "standard",
              "rate": "20.0000",
              "for_shipping": null
            }
          ],
          "total_rates": 1
        }
      ],
      "total_countries": 2
    }
  ]
}
```



---

## GET `/tax/configuration/rates`

**GET Get Preconfigured Tax Rates**

Retrieve the full list of preconfigured tax rates from the built-in tax rates data file. These are the default rates organized by continent/region and country.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns preconfigured tax rates grouped by geographic region.

  Schema (`application/json`):

  - `tax_rates` (object)
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
          "country_code": "DE",
          "country_name": "Germany",
          "total_rates": 3,
          "rates": {
            "standard": {
              "rate": 19,
              "name": "DE Standard Tax",
              "type": "standard",
              "compound": false,
              "shipping": false
            },
            "reduced": {
              "rate": 7,
              "name": "DE Reduced Tax",
              "type": "reduced",
              "compound": false,
              "shipping": false
            },
            "zero": {
              "rate": 0,
              "name": "DE Zero Tax",
              "type": "zero",
              "compound": false,
              "shipping": false
            }
          }
        }
      ],
      "total_countries": 27
    },
    "NA": {
      "group_name": "North America",
      "group_code": "NA",
      "countries": [
        {
          "country_code": "US",
          "country_name": "United States",
          "total_rates": 2,
          "rates": {
            "standard": {
              "rate": 10,
              "name": "US Standard Tax",
              "type": "standard",
              "compound": false,
              "shipping": false
            },
            "zero": {
              "rate": 0,
              "name": "US Zero Tax",
              "type": "zero",
              "compound": false,
              "shipping": false
            }
          }
        },
        {
          "country_code": "CA",
          "country_name": "Canada",
          "total_rates": 2,
          "rates": {
            "standard": {
              "rate": 5,
              "name": "CA GST",
              "type": "standard",
              "compound": false,
              "shipping": true
            },
            "zero": {
              "rate": 0,
              "name": "CA Zero Tax",
              "type": "zero",
              "compound": false,
              "shipping": false
            }
          }
        }
      ],
      "total_countries": 2
    }
  }
}
```



---

## GET `/tax/configuration/settings`

**GET Get Tax Settings**

Retrieve the current global tax configuration settings.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns the current tax settings.

  Schema (`application/json`):

  - `settings` (TaxSettings)

  Example:

```json
{
  "settings": {
    "tax_inclusion": "included",
    "tax_calculation_basis": "shipping",
    "tax_rounding": "item",
    "enable_tax": "yes",
    "price_suffix": "",
    "eu_vat_settings": {
      "require_vat_number": "no",
      "local_reverse_charge": "yes",
      "vat_reverse_excluded_categories": [
        30,
        42
      ],
      "method": "oss",
      "oss_country": "DE",
      "oss_vat": "DE123456789"
    }
  }
}
```



---

## GET `/tax/rates`

**GET List All Tax Rates**

Retrieve all tax rates from the database, grouped by continent/region and country.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns tax rates grouped by geographic region.

  Schema (`application/json`):

  - `tax_rates` (array<TaxRateGroup>)

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
          "total_rates": 2
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
          "total_rates": 1
        }
      ],
      "total_countries": 1
    }
  ]
}
```



---

## GET `/tax/classes`

**GET List Tax Classes**

Retrieve all tax classes, sorted by priority (highest first), then by newest first when priority is equal.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns all tax classes.

  Schema (`application/json`):

  - `tax_classes` (array<TaxClass>)

  Example:

```json
{
  "tax_classes": [
    {
      "id": 1,
      "title": "Standard",
      "slug": "standard",
      "description": "Standard tax rate for most products",
      "meta": {
        "categories": [
          5,
          12,
          18
        ],
        "priority": 10
      },
      "categories": [
        5,
        12,
        18
      ],
      "created_at": "2025-01-15 10:00:00",
      "updated_at": "2025-01-15 10:00:00"
    },
    {
      "id": 2,
      "title": "Reduced",
      "slug": "reduced",
      "description": "Reduced tax rate for essential goods",
      "meta": {
        "categories": [
          8,
          22
        ],
        "priority": 5
      },
      "categories": [
        8,
        22
      ],
      "created_at": "2025-01-15 10:15:00",
      "updated_at": "2025-01-15 10:15:00"
    },
    {
      "id": 3,
      "title": "Zero",
      "slug": "zero",
      "description": "Zero tax rate for exempt products",
      "meta": {
        "categories": [
          30
        ],
        "priority": 2
      },
      "categories": [
        30
      ],
      "created_at": "2025-01-15 10:30:00",
      "updated_at": "2025-01-15 10:30:00"
    }
  ]
}
```



---

## GET `/taxes`

**GET List Tax Records**

Retrieve a paginated list of order tax rate records with optional filtering, sorting, and search.

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
    "last_page": 5
  }
}
```



---

## POST `/taxes`

**POST Mark Taxes as Filed**

Mark one or more order tax records as filed by setting their filed_at timestamp.

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



---

## POST `/tax/configuration/countries`

**POST Save Configured Countries**

Generate tax classes and import tax rates for the specified countries from the built-in rates data. Countries that already have rates in the database are skipped.

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



---

## POST `/tax/country-tax-id/{country_code}`

**POST Save Country Tax ID**

Save or update the store's tax identification number for a specific country.

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



---

## POST `/tax/configuration/settings/eu-vat`

**POST Save EU VAT Cross-Border Settings**

Save EU VAT cross-border registration settings. Handles the configuration of how cross-border EU VAT is managed (OSS, home country, or specific country registrations).

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `action` (string) **required** _(enum: `euCrossBorderSettings`)_ — Action identifier
- `eu_vat_settings` (object) **required**
  - `method` (string) **required** _(enum: `oss`, `home`, `specific`)_ — Cross-border method
  - `oss_country` (string) — Country of OSS registration (required when method is oss)
  - `oss_vat` (string) — OSS VAT number
  - `home_country` (string) — Home country code (required when method is home)
  - `home_vat` (string) — Home VAT number
- `reset_registration` (string) _(enum: `yes`, `no`)_ — Set to yes to clear the current method (reset registration)

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

- **200** — EU VAT settings saved successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "EU VAT settings saved successfully"
}
```


- **423** — Validation failed or invalid action.

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

## POST `/tax/configuration/settings/eu-vat/oss/shipping-override`

**POST Save OSS Shipping Tax Override**

Save or update OSS shipping tax rate overrides for a specific EU country. Supports the for_shipping field for shipping-specific tax rates.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `country_code` (string) **required** — ISO 3166-1 alpha-2 country code of the EU member state
- `overrides` (array<object>) **required** — Array of override objects
  - `type` (string) **required** _(enum: `standard`, `reduced`, `zero`)_ — Tax class slug
  - `rate` (string) **required** — The overridden tax rate percentage
  - `for_shipping` (integer) _(default: `0`)_ — Shipping-specific tax rate override (default: 0)

Example:

```json
{
  "country_code": "IT",
  "overrides": [
    {
      "type": "standard",
      "rate": "22.0000",
      "for_shipping": 10
    },
    {
      "type": "reduced",
      "rate": "10.0000",
      "for_shipping": 5
    }
  ]
}
```


**Responses**

- **200** — OSS shipping tax override saved successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "OSS tax override saved successfully"
}
```


- **423** — Validation failed.

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - `country_code` (string)

  Example:

```json
{
  "message": "Validation failed for OSS tax override",
  "errors": {
    "country_code": "Select country of OSS registration"
  }
}
```



---

## POST `/tax/configuration/settings/eu-vat/oss/override`

**POST Save OSS Tax Override**

Save or update OSS (One-Stop Shop) tax rate overrides for a specific EU country.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `country_code` (string) **required** — ISO 3166-1 alpha-2 country code of the EU member state
- `overrides` (array<object>) **required** — Array of override objects
  - `type` (string) **required** _(enum: `standard`, `reduced`, `zero`)_ — Tax class slug
  - `rate` (string) **required** — The overridden tax rate percentage

Example:

```json
{
  "country_code": "FR",
  "overrides": [
    {
      "type": "standard",
      "rate": "20.0000"
    },
    {
      "type": "reduced",
      "rate": "5.5000"
    },
    {
      "type": "zero",
      "rate": "0.0000"
    }
  ]
}
```


**Responses**

- **200** — OSS tax override saved successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "OSS tax override saved successfully"
}
```


- **423** — Validation failed.

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - `country_code` (string)

  Example:

```json
{
  "message": "Validation failed for OSS tax override",
  "errors": {
    "country_code": "Select country of OSS registration"
  }
}
```



---

## POST `/tax/rates/country/override`

**POST Save Shipping Tax Override**

Set a shipping-specific tax override on an existing tax rate.

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


- **404** — Tax rate not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Tax rate not found"
}
```



---

## POST `/tax/configuration/settings`

**POST Save Tax Settings**

Save the global tax configuration settings. If tax is enabled for the first time, initial tax classes are automatically created.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `settings` (object) **required**
  - `enable_tax` (string) _(enum: `yes`, `no`)_ — Enable or disable tax calculation
  - `tax_inclusion` (string) _(enum: `included`, `excluded`)_ — Whether prices include tax
  - `tax_calculation_basis` (string) _(enum: `shipping`, `billing`, `store`)_ — Address basis for tax calculation
  - `tax_rounding` (string) _(enum: `item`, `subtotal`)_ — Rounding method
  - `price_suffix` (string) — Text appended after product prices
  - `eu_vat_settings` (object) — EU VAT configuration object
    - `require_vat_number` (string) _(enum: `yes`, `no`)_
    - `local_reverse_charge` (string) _(enum: `yes`, `no`)_
    - `vat_reverse_excluded_categories` (array<integer>)

Example:

```json
{
  "settings": {
    "enable_tax": "yes",
    "tax_inclusion": "excluded",
    "tax_calculation_basis": "billing",
    "tax_rounding": "subtotal",
    "price_suffix": "excl. VAT",
    "eu_vat_settings": {
      "require_vat_number": "yes",
      "local_reverse_charge": "yes",
      "vat_reverse_excluded_categories": [
        12,
        15
      ]
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



---

## PUT `/tax/classes/{id}`

**PUT Update Tax Class**

Update an existing tax class. The slug is automatically regenerated if the title changes.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Tax class ID |


**Request body** (`application/json`, required)

- `title` (string) **required** — Tax class title (max 192 characters)
- `description` (string) — Description of the tax class
- `categories` (array<integer>) — Array of product category IDs associated with this tax class
- `priority` (integer) — Sort priority (higher values appear first, default: 0)

Example:

```json
{
  "title": "Digital Goods Updated",
  "description": "Updated description",
  "categories": [
    12,
    15,
    20
  ],
  "priority": 8
}
```


**Responses**

- **200** — Tax class updated successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Tax class has been updated successfully"
}
```



---

## PUT `/tax/country/rate/{id}`

**PUT Update Tax Rate**

Update an existing tax rate.

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



---
