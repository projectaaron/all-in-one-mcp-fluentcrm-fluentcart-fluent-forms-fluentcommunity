# FluentCart API — data-export

8 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/data-export/customers/batch`

**POST Export Customers Batch**

Export one batch of customers. This endpoint is **cursor-paginated and self-throttling**: it returns as many records as fit inside a runtime and response-size budget, then hands back a `cursor` and `has_more`.

**Loop until `has_more` is `false`**, passing the previous `cursor` each time and preferring the returned `batch.next_max` as the next `max_records`. `total` is only computed on the first call and is `null` thereafter.

**Permission:** `customers/export` · **Policy:** `CustomerPolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `format` (string) _(enum: `csv`, `json`; default: `csv`)_ — `csv` yields flat records keyed by `columns`; `json` yields nested records keyed by `modules`.
- `scope` (string) _(enum: `current_page`, `selected`, `search_results`, `all`; default: `all`)_ — `all` ignores `filters` entirely. `current_page` and `selected` both require a non-empty `ids` array.
- `ids` (array<integer>) — Record IDs. Required when `scope` is `current_page` or `selected`. Truncated to the first 5000; deduplicated.
- `columns` (array<string>) — Column keys from `csv_columns`. Unknown keys are dropped. Required (after filtering) when `format` is `csv`. Capped at 100 entries.
- `modules` (array<string>) — Module keys from `json_modules`. Unknown keys are dropped. Capped at 100 entries.
- `filters` (object)
  - `filter_type` (string)
  - `search` (string)
  - `active_view` (string)
  - `sort_by` (string)
  - `sort_type` (string)
  - `advanced_filters` (string) — JSON-encoded filter groups; truncated at 100,000 characters.
  - `user_tz` (string)
- `cursor` (integer) _(default: `0`)_ — Continuation token from the previous response. Omit or send `0` for the first batch.
- `max_records` (integer) _(min: 100; max: 1000; default: `500`)_ — Records to return. Clamped into the 100–1000 range.

Example:

```json
{
  "format": "csv",
  "scope": "all",
  "columns": [
    "customer_id"
  ],
  "max_records": 500
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `export` (object)
    - `entity` (string)
    - `schema_version` (integer)
    - `records` (array<object>)
      - `record_id` (integer) — Primary key of the record; also the value written back to `cursor`.
    - `total` (integer) — Total matching records. Counted only on the first call (`cursor` 0 or absent); `null` on every continuation.
    - `cursor` (integer) — Pass this back as `cursor` on the next call to continue. `null` on the first page.
    - `has_more` (boolean) — `true` when more records remain. Keep calling until this is `false`.
    - `batch` (object)
      - `records` (integer) — Records returned in this batch.
      - `elapsed_ms` (integer)
      - `estimated_bytes` (integer)
      - `requested_max` (integer)
      - `next_max` (integer) — Server-suggested `max_records` for the next call, adapted to observed size and runtime. Honour it to avoid `413`s.

  Example:

```json
{
  "export": {
    "entity": "customers",
    "schema_version": 1,
    "records": [
      {
        "record_id": 1219,
        "customer_id": 1219,
        "first_name": "Alex",
        "last_name": "Morgan",
        "email": "alex.morgan@example.com",
        "status": "active",
        "purchase_count": 1
      }
    ],
    "total": 1,
    "cursor": 1219,
    "has_more": false,
    "batch": {
      "records": 1,
      "elapsed_ms": 2,
      "estimated_bytes": 671,
      "requested_max": 100,
      "next_max": 100
    }
  }
}
```


- **403** — Forbidden — the user lacks `customers/export`.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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


- **409** — The module backing this entity is not active.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "This export module is not active."
}
```


- **413** — A single record exceeded the response size budget. Lower `max_records`, or reduce the selected `columns`/`modules`.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "A single record was too large to export."
}
```


- **422** — Invalid `format` or `scope`; or `scope` is `current_page`/`selected` with no `ids`; or `format` is `csv` and no valid `columns` remained after filtering.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Select at least one CSV column."
}
```



---

## POST `/data-export/licenses/batch`

**POST Export Licenses Batch**

Export one batch of licenses. This endpoint is **cursor-paginated and self-throttling**: it returns as many records as fit inside a runtime and response-size budget, then hands back a `cursor` and `has_more`.

**Loop until `has_more` is `false`**, passing the previous `cursor` each time and preferring the returned `batch.next_max` as the next `max_records`. `total` is only computed on the first call and is `null` thereafter.

::: warning Module-gated
These routes are only **registered** when the licensing module is active (`ModuleSettings::isActive('license')`). When it is off the endpoint does not exist at all and WordPress returns `404 rest_no_route` — not the `409` below.
:::

**Permission:** `licenses/export` · **Policy:** `LicensePolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `format` (string) _(enum: `csv`, `json`; default: `csv`)_ — `csv` yields flat records keyed by `columns`; `json` yields nested records keyed by `modules`.
- `scope` (string) _(enum: `current_page`, `selected`, `search_results`, `all`; default: `all`)_ — `all` ignores `filters` entirely. `current_page` and `selected` both require a non-empty `ids` array.
- `ids` (array<integer>) — Record IDs. Required when `scope` is `current_page` or `selected`. Truncated to the first 5000; deduplicated.
- `columns` (array<string>) — Column keys from `csv_columns`. Unknown keys are dropped. Required (after filtering) when `format` is `csv`. Capped at 100 entries.
- `modules` (array<string>) — Module keys from `json_modules`. Unknown keys are dropped. Capped at 100 entries.
- `filters` (object)
  - `filter_type` (string)
  - `search` (string)
  - `active_view` (string)
  - `sort_by` (string)
  - `sort_type` (string)
  - `advanced_filters` (string) — JSON-encoded filter groups; truncated at 100,000 characters.
  - `user_tz` (string)
- `cursor` (integer) _(default: `0`)_ — Continuation token from the previous response. Omit or send `0` for the first batch.
- `max_records` (integer) _(min: 100; max: 1000; default: `500`)_ — Records to return. Clamped into the 100–1000 range.

Example:

```json
{
  "format": "csv",
  "scope": "all",
  "columns": [
    "license_id"
  ],
  "max_records": 500
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `export` (object)
    - `entity` (string)
    - `schema_version` (integer)
    - `records` (array<object>)
      - `record_id` (integer) — Primary key of the record; also the value written back to `cursor`.
    - `total` (integer) — Total matching records. Counted only on the first call (`cursor` 0 or absent); `null` on every continuation.
    - `cursor` (integer) — Pass this back as `cursor` on the next call to continue. `null` on the first page.
    - `has_more` (boolean) — `true` when more records remain. Keep calling until this is `false`.
    - `batch` (object)
      - `records` (integer) — Records returned in this batch.
      - `elapsed_ms` (integer)
      - `estimated_bytes` (integer)
      - `requested_max` (integer)
      - `next_max` (integer) — Server-suggested `max_records` for the next call, adapted to observed size and runtime. Honour it to avoid `413`s.

  Example:

```json
{
  "export": {
    "entity": "customers",
    "schema_version": 1,
    "records": [
      {
        "record_id": 1219,
        "customer_id": 1219,
        "first_name": "Alex",
        "last_name": "Morgan",
        "email": "alex.morgan@example.com",
        "status": "active",
        "purchase_count": 1
      }
    ],
    "total": 1,
    "cursor": 1219,
    "has_more": false,
    "batch": {
      "records": 1,
      "elapsed_ms": 2,
      "estimated_bytes": 671,
      "requested_max": 100,
      "next_max": 100
    }
  }
}
```


- **403** — Forbidden — the user lacks `licenses/export`.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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


- **409** — The module backing this entity is not active.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "This export module is not active."
}
```


- **413** — A single record exceeded the response size budget. Lower `max_records`, or reduce the selected `columns`/`modules`.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "A single record was too large to export."
}
```


- **422** — Invalid `format` or `scope`; or `scope` is `current_page`/`selected` with no `ids`; or `format` is `csv` and no valid `columns` remained after filtering.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Select at least one CSV column."
}
```



---

## POST `/data-export/orders/batch`

**POST Export Orders Batch**

Export one batch of orders. This endpoint is **cursor-paginated and self-throttling**: it returns as many records as fit inside a runtime and response-size budget, then hands back a `cursor` and `has_more`.

**Loop until `has_more` is `false`**, passing the previous `cursor` each time and preferring the returned `batch.next_max` as the next `max_records`. `total` is only computed on the first call and is `null` thereafter.

**Permission:** `orders/export` · **Policy:** `OrderPolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `format` (string) _(enum: `csv`, `json`; default: `csv`)_ — `csv` yields flat records keyed by `columns`; `json` yields nested records keyed by `modules`.
- `scope` (string) _(enum: `current_page`, `selected`, `search_results`, `all`; default: `all`)_ — `all` ignores `filters` entirely. `current_page` and `selected` both require a non-empty `ids` array.
- `ids` (array<integer>) — Record IDs. Required when `scope` is `current_page` or `selected`. Truncated to the first 5000; deduplicated.
- `columns` (array<string>) — Column keys from `csv_columns`. Unknown keys are dropped. Required (after filtering) when `format` is `csv`. Capped at 100 entries.
- `modules` (array<string>) — Module keys from `json_modules`. Unknown keys are dropped. Capped at 100 entries.
- `filters` (object)
  - `filter_type` (string)
  - `search` (string)
  - `active_view` (string)
  - `sort_by` (string)
  - `sort_type` (string)
  - `advanced_filters` (string) — JSON-encoded filter groups; truncated at 100,000 characters.
  - `user_tz` (string)
- `cursor` (integer) _(default: `0`)_ — Continuation token from the previous response. Omit or send `0` for the first batch.
- `max_records` (integer) _(min: 100; max: 1000; default: `500`)_ — Records to return. Clamped into the 100–1000 range.

Example:

```json
{
  "format": "csv",
  "scope": "all",
  "columns": [
    "order_id"
  ],
  "max_records": 500
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `export` (object)
    - `entity` (string)
    - `schema_version` (integer)
    - `records` (array<object>)
      - `record_id` (integer) — Primary key of the record; also the value written back to `cursor`.
    - `total` (integer) — Total matching records. Counted only on the first call (`cursor` 0 or absent); `null` on every continuation.
    - `cursor` (integer) — Pass this back as `cursor` on the next call to continue. `null` on the first page.
    - `has_more` (boolean) — `true` when more records remain. Keep calling until this is `false`.
    - `batch` (object)
      - `records` (integer) — Records returned in this batch.
      - `elapsed_ms` (integer)
      - `estimated_bytes` (integer)
      - `requested_max` (integer)
      - `next_max` (integer) — Server-suggested `max_records` for the next call, adapted to observed size and runtime. Honour it to avoid `413`s.

  Example:

```json
{
  "export": {
    "entity": "customers",
    "schema_version": 1,
    "records": [
      {
        "record_id": 1219,
        "customer_id": 1219,
        "first_name": "Alex",
        "last_name": "Morgan",
        "email": "alex.morgan@example.com",
        "status": "active",
        "purchase_count": 1
      }
    ],
    "total": 1,
    "cursor": 1219,
    "has_more": false,
    "batch": {
      "records": 1,
      "elapsed_ms": 2,
      "estimated_bytes": 671,
      "requested_max": 100,
      "next_max": 100
    }
  }
}
```


- **403** — Forbidden — the user lacks `orders/export`.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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


- **409** — The module backing this entity is not active.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "This export module is not active."
}
```


- **413** — A single record exceeded the response size budget. Lower `max_records`, or reduce the selected `columns`/`modules`.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "A single record was too large to export."
}
```


- **422** — Invalid `format` or `scope`; or `scope` is `current_page`/`selected` with no `ids`; or `format` is `csv` and no valid `columns` remained after filtering.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Select at least one CSV column."
}
```



---

## POST `/data-export/subscriptions/batch`

**POST Export Subscriptions Batch**

Export one batch of subscriptions. This endpoint is **cursor-paginated and self-throttling**: it returns as many records as fit inside a runtime and response-size budget, then hands back a `cursor` and `has_more`.

**Loop until `has_more` is `false`**, passing the previous `cursor` each time and preferring the returned `batch.next_max` as the next `max_records`. `total` is only computed on the first call and is `null` thereafter.

**Permission:** `subscriptions/export` · **Policy:** `OrderPolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `format` (string) _(enum: `csv`, `json`; default: `csv`)_ — `csv` yields flat records keyed by `columns`; `json` yields nested records keyed by `modules`.
- `scope` (string) _(enum: `current_page`, `selected`, `search_results`, `all`; default: `all`)_ — `all` ignores `filters` entirely. `current_page` and `selected` both require a non-empty `ids` array.
- `ids` (array<integer>) — Record IDs. Required when `scope` is `current_page` or `selected`. Truncated to the first 5000; deduplicated.
- `columns` (array<string>) — Column keys from `csv_columns`. Unknown keys are dropped. Required (after filtering) when `format` is `csv`. Capped at 100 entries.
- `modules` (array<string>) — Module keys from `json_modules`. Unknown keys are dropped. Capped at 100 entries.
- `filters` (object)
  - `filter_type` (string)
  - `search` (string)
  - `active_view` (string)
  - `sort_by` (string)
  - `sort_type` (string)
  - `advanced_filters` (string) — JSON-encoded filter groups; truncated at 100,000 characters.
  - `user_tz` (string)
- `cursor` (integer) _(default: `0`)_ — Continuation token from the previous response. Omit or send `0` for the first batch.
- `max_records` (integer) _(min: 100; max: 1000; default: `500`)_ — Records to return. Clamped into the 100–1000 range.

Example:

```json
{
  "format": "csv",
  "scope": "all",
  "columns": [
    "subscription_id"
  ],
  "max_records": 500
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `export` (object)
    - `entity` (string)
    - `schema_version` (integer)
    - `records` (array<object>)
      - `record_id` (integer) — Primary key of the record; also the value written back to `cursor`.
    - `total` (integer) — Total matching records. Counted only on the first call (`cursor` 0 or absent); `null` on every continuation.
    - `cursor` (integer) — Pass this back as `cursor` on the next call to continue. `null` on the first page.
    - `has_more` (boolean) — `true` when more records remain. Keep calling until this is `false`.
    - `batch` (object)
      - `records` (integer) — Records returned in this batch.
      - `elapsed_ms` (integer)
      - `estimated_bytes` (integer)
      - `requested_max` (integer)
      - `next_max` (integer) — Server-suggested `max_records` for the next call, adapted to observed size and runtime. Honour it to avoid `413`s.

  Example:

```json
{
  "export": {
    "entity": "customers",
    "schema_version": 1,
    "records": [
      {
        "record_id": 1219,
        "customer_id": 1219,
        "first_name": "Alex",
        "last_name": "Morgan",
        "email": "alex.morgan@example.com",
        "status": "active",
        "purchase_count": 1
      }
    ],
    "total": 1,
    "cursor": 1219,
    "has_more": false,
    "batch": {
      "records": 1,
      "elapsed_ms": 2,
      "estimated_bytes": 671,
      "requested_max": 100,
      "next_max": 100
    }
  }
}
```


- **403** — Forbidden — the user lacks `subscriptions/export`.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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


- **409** — The module backing this entity is not active.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "This export module is not active."
}
```


- **413** — A single record exceeded the response size budget. Lower `max_records`, or reduce the selected `columns`/`modules`.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "A single record was too large to export."
}
```


- **422** — Invalid `format` or `scope`; or `scope` is `current_page`/`selected` with no `ids`; or `format` is `csv` and no valid `columns` remained after filtering.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Select at least one CSV column."
}
```



---

## GET `/data-export/customers/schema`

**GET Get Customers Export Schema**

Describe what can be exported for customers: the supported output formats, the selectable flat CSV columns, and the selectable nested JSON modules.

Call this first — the `key` values it returns are exactly what the matching `/batch` endpoint accepts in `columns` and `modules`. Unknown keys sent to `/batch` are silently dropped.

**Permission:** `customers/export` · **Policy:** `CustomerPolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `export` (object)
    - `entity` (string) — The exported entity.
    - `schema_version` (integer) — Version of this schema contract.
    - `formats` (array<object>) — Output formats this entity supports.
      - `value` (string) _(enum: `csv`, `json`)_
      - `label` (string)
    - `csv_columns` (array<object>) — Selectable flat columns, used when `format` is `csv`.
      - `key` (string)
      - `label` (string)
      - `default_selected` (boolean) — Whether the admin UI pre-selects this column.
    - `json_modules` (array<object>) — Selectable nested record groups, used when `format` is `json`.
      - `key` (string)
      - `label` (string)
      - `description` (string)

  Example:

```json
{
  "export": {
    "entity": "customers",
    "schema_version": 1,
    "formats": [
      {
        "value": "csv",
        "label": "CSV file"
      },
      {
        "value": "json",
        "label": "JSON file"
      }
    ],
    "csv_columns": [
      {
        "key": "customer_id",
        "label": "Customer ID",
        "default_selected": true
      },
      {
        "key": "first_name",
        "label": "First name",
        "default_selected": true
      },
      {
        "key": "last_name",
        "label": "Last name",
        "default_selected": true
      },
      {
        "key": "full_name",
        "label": "Full name",
        "default_selected": true
      },
      {
        "key": "email",
        "label": "Email",
        "default_selected": true
      },
      {
        "key": "status",
        "label": "Status",
        "default_selected": true
      },
      {
        "key": "purchase_count",
        "label": "Purchases",
        "default_selected": true
      },
      {
        "key": "lifetime_value",
        "label": "Lifetime value",
        "default_selected": true
      },
      {
        "key": "average_order_value",
        "label": "Average order value",
        "default_selected": false
      },
      {
        "key": "first_purchase_date",
        "label": "First purchase date",
        "default_selected": true
      },
      {
        "key": "last_purchase_date",
        "label": "Last purchase date",
        "default_selected": true
      },
      {
        "key": "customer_since",
        "label": "Customer since",
        "default_selected": true
      },
      {
        "key": "country",
        "label": "Country",
        "default_selected": true
      },
      {
        "key": "state",
        "label": "State",
        "default_selected": true
      },
      {
        "key": "city",
        "label": "City",
        "default_selected": true
      },
      {
        "key": "postcode",
        "label": "Postcode",
        "default_selected": true
      },
      {
        "key": "wordpress_user_id",
        "label": "WordPress user ID",
        "default_selected": false
      },
      {
        "key": "contact_id",
        "label": "Contact ID",
        "default_selected": false
      }
    ],
    "json_modules": [
      {
        "key": "customers",
        "label": "Customers",
        "description": "Core rows from the customers table.",
        "default_selected": true,
        "required": true
      },
      {
        "key": "customer_addresses",
        "label": "Customer addresses",
        "description": "Saved address-book rows.",
        "default_selected": true,
        "required": false
      },
      {
        "key": "customer_meta",
        "label": "Customer metadata",
        "description": "Metadata rows attached to each customer.",
        "default_selected": false,
        "required": false
      }
    ],
    "batching": {
      "initial_records": 500,
      "min_records": 100,
      "max_records": 1000,
      "target_ms": 1500
    },
    "direct_file_writer": true,
    "sensitive_values_redacted": true
  }
}
```


- **403** — Forbidden — the user lacks `customers/export`.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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

## GET `/data-export/licenses/schema`

**GET Get Licenses Export Schema**

Describe what can be exported for licenses: the supported output formats, the selectable flat CSV columns, and the selectable nested JSON modules.

Call this first — the `key` values it returns are exactly what the matching `/batch` endpoint accepts in `columns` and `modules`. Unknown keys sent to `/batch` are silently dropped.

::: warning Module-gated
These routes are only **registered** when the licensing module is active (`ModuleSettings::isActive('license')`). When it is off the endpoint does not exist at all and WordPress returns `404 rest_no_route` — not the `409` below.
:::

**Permission:** `licenses/export` · **Policy:** `LicensePolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `export` (object)
    - `entity` (string) — The exported entity.
    - `schema_version` (integer) — Version of this schema contract.
    - `formats` (array<object>) — Output formats this entity supports.
      - `value` (string) _(enum: `csv`, `json`)_
      - `label` (string)
    - `csv_columns` (array<object>) — Selectable flat columns, used when `format` is `csv`.
      - `key` (string)
      - `label` (string)
      - `default_selected` (boolean) — Whether the admin UI pre-selects this column.
    - `json_modules` (array<object>) — Selectable nested record groups, used when `format` is `json`.
      - `key` (string)
      - `label` (string)
      - `description` (string)

  Example:

```json
{
  "export": {
    "entity": "licenses",
    "schema_version": 1,
    "formats": [
      {
        "value": "csv",
        "label": "CSV file"
      },
      {
        "value": "json",
        "label": "JSON file"
      }
    ],
    "csv_columns": [
      {
        "key": "license_id",
        "label": "License ID",
        "default_selected": true
      },
      {
        "key": "license_key",
        "label": "License key",
        "default_selected": true
      },
      {
        "key": "status",
        "label": "Status",
        "default_selected": true
      },
      {
        "key": "activation_limit",
        "label": "Activation limit",
        "default_selected": true
      },
      {
        "key": "activation_count",
        "label": "Activation count",
        "default_selected": true
      },
      {
        "key": "customer_id",
        "label": "Customer ID",
        "default_selected": true
      },
      {
        "key": "customer_name",
        "label": "Customer name",
        "default_selected": true
      },
      {
        "key": "customer_email",
        "label": "Customer email",
        "default_selected": true
      },
      {
        "key": "order_id",
        "label": "Order ID",
        "default_selected": true
      },
      {
        "key": "subscription_id",
        "label": "Subscription ID",
        "default_selected": false
      },
      {
        "key": "product_id",
        "label": "Product ID",
        "default_selected": true
      },
      {
        "key": "variation_id",
        "label": "Variation ID",
        "default_selected": true
      },
      {
        "key": "expiration_date",
        "label": "Expiration date",
        "default_selected": true
      },
      {
        "key": "created_at",
        "label": "Created date",
        "default_selected": true
      },
      {
        "key": "updated_at",
        "label": "Updated date",
        "default_selected": false
      }
    ],
    "json_modules": [
      {
        "key": "licenses",
        "label": "Licenses",
        "description": "Core rows from the licenses table.",
        "default_selected": true,
        "required": true
      },
      {
        "key": "customers",
        "label": "Customers",
        "description": "The customer row linked to each license.",
        "default_selected": true,
        "required": false
      },
      {
        "key": "orders",
        "label": "Orders",
        "description": "The order row linked to each license.",
        "default_selected": false,
        "required": false
      },
      {
        "key": "subscriptions",
        "label": "Subscriptions",
        "description": "The subscription row linked to each license.",
        "default_selected": false,
        "required": false
      },
      {
        "key": "license_activations",
        "label": "License activations",
        "description": "Activation rows attached to each license. Authentication hashes are excluded.",
        "default_selected": true,
        "required": false
      },
      {
        "key": "license_sites",
        "label": "Activated sites",
        "description": "Unique site rows referenced by the selected license activations.",
        "default_selected": true,
        "required": false
      },
      {
        "key": "license_meta",
        "label": "License metadata",
        "description": "Metadata rows attached directly to each license.",
        "default_selected": false,
        "required": false
      }
    ],
    "batching": {
      "initial_records": 500,
      "min_records": 100,
      "max_records": 1000,
      "target_ms": 1500
    },
    "direct_file_writer": true,
    "sensitive_values_redacted": true
  }
}
```


- **403** — Forbidden — the user lacks `licenses/export`.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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


- **409** — The licensing module is not active.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "License export is unavailable because the licensing module is not active."
}
```



---

## GET `/data-export/orders/schema`

**GET Get Orders Export Schema**

Describe what can be exported for orders: the supported output formats, the selectable flat CSV columns, and the selectable nested JSON modules.

Call this first — the `key` values it returns are exactly what the matching `/batch` endpoint accepts in `columns` and `modules`. Unknown keys sent to `/batch` are silently dropped.

**Permission:** `orders/export` · **Policy:** `OrderPolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `export` (object)
    - `entity` (string) — The exported entity.
    - `schema_version` (integer) — Version of this schema contract.
    - `formats` (array<object>) — Output formats this entity supports.
      - `value` (string) _(enum: `csv`, `json`)_
      - `label` (string)
    - `csv_columns` (array<object>) — Selectable flat columns, used when `format` is `csv`.
      - `key` (string)
      - `label` (string)
      - `default_selected` (boolean) — Whether the admin UI pre-selects this column.
    - `json_modules` (array<object>) — Selectable nested record groups, used when `format` is `json`.
      - `key` (string)
      - `label` (string)
      - `description` (string)

  Example:

```json
{
  "export": {
    "entity": "orders",
    "schema_version": 1,
    "formats": [
      {
        "value": "csv",
        "label": "CSV file"
      },
      {
        "value": "json",
        "label": "JSON file"
      }
    ],
    "csv_columns": [
      {
        "key": "order_id",
        "label": "Order ID",
        "default_selected": true
      },
      {
        "key": "invoice_no",
        "label": "Invoice number",
        "default_selected": true
      },
      {
        "key": "status",
        "label": "Order status",
        "default_selected": true
      },
      {
        "key": "payment_status",
        "label": "Payment status",
        "default_selected": true
      },
      {
        "key": "shipping_status",
        "label": "Shipping status",
        "default_selected": false
      },
      {
        "key": "currency",
        "label": "Currency",
        "default_selected": true
      },
      {
        "key": "subtotal",
        "label": "Subtotal",
        "default_selected": true
      },
      {
        "key": "discount_total",
        "label": "Discount total",
        "default_selected": true
      },
      {
        "key": "shipping_total",
        "label": "Shipping total",
        "default_selected": true
      },
      {
        "key": "tax_total",
        "label": "Tax total",
        "default_selected": true
      },
      {
        "key": "total_amount",
        "label": "Total amount",
        "default_selected": true
      },
      {
        "key": "total_refund",
        "label": "Refund total",
        "default_selected": false
      },
      {
        "key": "items_count",
        "label": "Items count",
        "default_selected": true
      },
      {
        "key": "order_type",
        "label": "Order type",
        "default_selected": true
      },
      {
        "key": "payment_method",
        "label": "Payment method",
        "default_selected": true
      },
      {
        "key": "customer_id",
        "label": "Customer ID",
        "default_selected": true
      },
      {
        "key": "customer_name",
        "label": "Customer name",
        "default_selected": true
      },
      {
        "key": "customer_email",
        "label": "Customer email",
        "default_selected": true
      },
      {
        "key": "mode",
        "label": "Mode",
        "default_selected": false
      },
      {
        "key": "created_at",
        "label": "Order date",
        "default_selected": true
      },
      {
        "key": "completed_at",
        "label": "Completed date",
        "default_selected": false
      }
    ],
    "json_modules": [
      {
        "key": "orders",
        "label": "Orders",
        "description": "Core rows from the orders table.",
        "default_selected": true,
        "required": true
      },
      {
        "key": "customers",
        "label": "Customers",
        "description": "The customer row linked to each order.",
        "default_selected": true,
        "required": false
      },
      {
        "key": "order_items",
        "label": "Order items",
        "description": "Line items linked to each order.",
        "default_selected": true,
        "required": false
      },
      {
        "key": "order_addresses",
        "label": "Order addresses",
        "description": "Billing and shipping address rows.",
        "default_selected": false,
        "required": false
      },
      {
        "key": "order_transactions",
        "label": "Transactions",
        "description": "Payment transaction rows.",
        "default_selected": false,
        "required": false
      },
      {
        "key": "order_tax_rates",
        "label": "Tax rates",
        "description": "Applied order tax rows.",
        "default_selected": false,
        "required": false
      },
      {
        "key": "order_meta",
        "label": "Order metadata",
        "description": "Metadata rows attached to each order.",
        "default_selected": false,
        "required": false
      }
    ],
    "batching": {
      "initial_records": 500,
      "min_records": 100,
      "max_records": 1000,
      "target_ms": 1500
    },
    "direct_file_writer": true,
    "sensitive_values_redacted": true
  }
}
```


- **403** — Forbidden — the user lacks `orders/export`.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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

## GET `/data-export/subscriptions/schema`

**GET Get Subscriptions Export Schema**

Describe what can be exported for subscriptions: the supported output formats, the selectable flat CSV columns, and the selectable nested JSON modules.

Call this first — the `key` values it returns are exactly what the matching `/batch` endpoint accepts in `columns` and `modules`. Unknown keys sent to `/batch` are silently dropped.

**Permission:** `subscriptions/export` · **Policy:** `OrderPolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `export` (object)
    - `entity` (string) — The exported entity.
    - `schema_version` (integer) — Version of this schema contract.
    - `formats` (array<object>) — Output formats this entity supports.
      - `value` (string) _(enum: `csv`, `json`)_
      - `label` (string)
    - `csv_columns` (array<object>) — Selectable flat columns, used when `format` is `csv`.
      - `key` (string)
      - `label` (string)
      - `default_selected` (boolean) — Whether the admin UI pre-selects this column.
    - `json_modules` (array<object>) — Selectable nested record groups, used when `format` is `json`.
      - `key` (string)
      - `label` (string)
      - `description` (string)

  Example:

```json
{
  "export": {
    "entity": "subscriptions",
    "schema_version": 1,
    "formats": [
      {
        "value": "csv",
        "label": "CSV file"
      },
      {
        "value": "json",
        "label": "JSON file"
      }
    ],
    "csv_columns": [
      {
        "key": "subscription_id",
        "label": "Subscription ID",
        "default_selected": true
      },
      {
        "key": "status",
        "label": "Status",
        "default_selected": true
      },
      {
        "key": "item_name",
        "label": "Item name",
        "default_selected": true
      },
      {
        "key": "customer_id",
        "label": "Customer ID",
        "default_selected": true
      },
      {
        "key": "customer_name",
        "label": "Customer name",
        "default_selected": true
      },
      {
        "key": "customer_email",
        "label": "Customer email",
        "default_selected": true
      },
      {
        "key": "parent_order_id",
        "label": "Original order ID",
        "default_selected": true
      },
      {
        "key": "product_id",
        "label": "Product ID",
        "default_selected": true
      },
      {
        "key": "variation_id",
        "label": "Variation ID",
        "default_selected": true
      },
      {
        "key": "billing_interval",
        "label": "Billing interval",
        "default_selected": true
      },
      {
        "key": "quantity",
        "label": "Quantity",
        "default_selected": true
      },
      {
        "key": "signup_fee",
        "label": "Signup fee",
        "default_selected": false
      },
      {
        "key": "recurring_amount",
        "label": "Recurring amount",
        "default_selected": true
      },
      {
        "key": "recurring_tax_total",
        "label": "Recurring tax total",
        "default_selected": true
      },
      {
        "key": "recurring_total",
        "label": "Recurring total",
        "default_selected": true
      },
      {
        "key": "bill_times",
        "label": "Billing cycles",
        "default_selected": true
      },
      {
        "key": "bill_count",
        "label": "Completed billings",
        "default_selected": true
      },
      {
        "key": "trial_days",
        "label": "Trial days",
        "default_selected": false
      },
      {
        "key": "collection_method",
        "label": "Collection method",
        "default_selected": true
      },
      {
        "key": "payment_method",
        "label": "Payment method",
        "default_selected": true
      },
      {
        "key": "vendor_subscription_id",
        "label": "Gateway subscription ID",
        "default_selected": false
      },
      {
        "key": "next_billing_date",
        "label": "Next billing date",
        "default_selected": true
      },
      {
        "key": "trial_ends_at",
        "label": "Trial end date",
        "default_selected": false
      },
      {
        "key": "expire_at",
        "label": "Expiration date",
        "default_selected": false
      },
      {
        "key": "canceled_at",
        "label": "Canceled date",
        "default_selected": false
      },
      {
        "key": "created_at",
        "label": "Created date",
        "default_selected": true
      },
      {
        "key": "updated_at",
        "label": "Updated date",
        "default_selected": false
      }
    ],
    "json_modules": [
      {
        "key": "subscriptions",
        "label": "Subscriptions",
        "description": "Core rows from the subscriptions table. Sensitive payment credentials are redacted.",
        "default_selected": true,
        "required": true
      },
      {
        "key": "customers",
        "label": "Customers",
        "description": "The customer row linked to each subscription.",
        "default_selected": true,
        "required": false
      },
      {
        "key": "parent_orders",
        "label": "Original orders",
        "description": "The original order row linked to each subscription.",
        "default_selected": false,
        "required": false
      },
      {
        "key": "subscription_transactions",
        "label": "Transactions",
        "description": "Payment transaction rows linked to each subscription. Sensitive values are redacted.",
        "default_selected": false,
        "required": false
      },
      {
        "key": "subscription_meta",
        "label": "Subscription metadata",
        "description": "Metadata rows attached to each subscription. Sensitive values are redacted.",
        "default_selected": false,
        "required": false
      },
      {
        "key": "licenses",
        "label": "Licenses",
        "description": "License rows linked to each subscription.",
        "default_selected": false,
        "required": false
      }
    ],
    "batching": {
      "initial_records": 500,
      "min_records": 100,
      "max_records": 1000,
      "target_ms": 1500
    },
    "direct_file_writer": true,
    "sensitive_values_redacted": true
  }
}
```


- **403** — Forbidden — the user lacks `subscriptions/export`.

  Schema (`application/json`):

  - `code` (string)
  - `message` (string)
  - `data` (object)
    - `status` (integer)

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
