# FluentCart API — saved-views

4 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/saved-views`

**POST Create Saved View**

Create a saved view for an admin table. A unique slug is generated from the name with a 6-character random suffix.

Each user may hold at most **20** views per table; `query_params` is filtered down to `filter_type`, `advanced_filters`, `search` and `active_view` — any other key is dropped.

**Permission:** varies by `object_type` · **Policy:** `SavedViewsPolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `object_type` (string) **required** _(enum: `product_table`, `order_table`, `customers`, `coupon_table`, `subscriptions`, `licenses`, `order_bump_table`, `log_table`, `taxes_table`, `shipping_zone_table`, `shipping_class_table`)_ — The admin table the view belongs to. **Required** — it is read by `SavedViewsPolicy` *before* the controller runs, so omitting it returns `403 rest_forbidden` rather than a validation error. Each value maps to a different capability: `product_table`/`order_bump_table` → `products/view`, `order_table`/`log_table` → `orders/view`, `customers` → `customers/view`, `coupon_table` → `coupons/view`, `subscriptions` → `subscriptions/view`, `licenses` → `licenses/view`, and `taxes_table`/`shipping_zone_table`/`shipping_class_table` → `manage_options`. The map is filterable via `fluent_cart/saved_views_permission_map`.
- `name` (string) **required** _(maxLength: 50)_ — Display name. Required, 50 characters or fewer.
- `description` (string) — Optional longer description.
- `is_public` (boolean) _(default: `false`)_ — Share the view with all users who can access this table.
- `query_params` (object)
  - `filter_type` (string) — Filter mode, e.g. `simple` or `advanced`.
  - `advanced_filters` (string) — JSON-encoded advanced filter groups. Invalid JSON is stored as `[[]]`.
  - `search` (string) — Free-text search term.
  - `active_view` (string) — Active tab on the table.

Example:

```json
{
  "object_type": "order_table",
  "name": "Unfulfilled orders",
  "description": "Paid orders still awaiting fulfillment",
  "is_public": false,
  "query_params": {
    "filter_type": "advanced",
    "advanced_filters": "[[{\"source\":\"order\",\"property\":\"fulfillment_type\",\"operator\":\"=\",\"value\":\"unfulfilled\"}]]"
  }
}
```


**Responses**

- **201** — View created.

  Schema (`application/json`):

  - `message` (string)
  - `view` (object)
    - `id` (integer)
    - `object_type` (string)
    - `slug` (string) — Auto-generated from the name plus a 6-character random suffix.
    - `name` (string)
    - `description` (string)
    - `query_params` (object)
      - `filter_type` (string) — Filter mode, e.g. `simple` or `advanced`.
      - `advanced_filters` (string) — JSON-encoded advanced filter groups. Invalid JSON is stored as `[[]]`.
      - `search` (string) — Free-text search term.
      - `active_view` (string) — Active tab on the table.
    - `is_public` (boolean) — `true` when the view is shared with every user who can access this table.
    - `owner_id` (integer) — WordPress user ID of the creator.

  Example:

```json
{
  "message": "View saved successfully.",
  "view": {
    "id": 41,
    "object_type": "order_table",
    "slug": "unfulfilled-orders-x7k2p9",
    "name": "Unfulfilled orders",
    "description": "Paid orders still awaiting fulfillment",
    "query_params": {
      "filter_type": "advanced",
      "advanced_filters": "[[{\"source\":\"order\",\"property\":\"fulfillment_type\",\"operator\":\"=\",\"value\":\"unfulfilled\"}]]",
      "search": "",
      "active_view": "all"
    },
    "is_public": false,
    "owner_id": 1
  }
}
```


- **403** — Forbidden — the authenticated user lacks the required permission.

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


- **422** — Validation failed — missing `object_type`, missing/over-long `name`, or the 20-views-per-table cap reached.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Maximum of 20 saved views reached for this table."
}
```



---

## DELETE `/saved-views/{id}`

**DELETE Delete Saved View**

Permanently delete a saved view. Only the **creator** may delete it.

**Permission:** varies by the view's stored `object_type` · **Policy:** `SavedViewsPolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | ID of the saved view. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "View deleted successfully."
}
```


- **403** — The authenticated user is not the creator of this view.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "You do not have permission to delete this view."
}
```


- **404** — View not found.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "View not found."
}
```



---

## GET `/saved-views`

**GET List Saved Views**

Retrieve every saved view the current user can see for a given admin table — their own views plus any public views. Results are ordered by ID ascending.

**Permission:** varies by `object_type` (see below) · **Policy:** `SavedViewsPolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `object_type` | string | yes | The admin table the view belongs to. **Required** — it is read by `SavedViewsPolicy` *before* the controller runs, so omitting it returns `403 rest_forbidden` rather than a validation error. Each value maps to a different capability: `product_table`/`order_bump_table` → `products/view`, `order_table`/`log_table` → `orders/view`, `customers` → `customers/view`, `coupon_table` → `coupons/view`, `subscriptions` → `subscriptions/view`, `licenses` → `licenses/view`, and `taxes_table`/`shipping_zone_table`/`shipping_class_table` → `manage_options`. The map is filterable via `fluent_cart/saved_views_permission_map`. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `views` (array<object>)
    - `id` (integer)
    - `object_type` (string)
    - `slug` (string) — Auto-generated from the name plus a 6-character random suffix.
    - `name` (string)
    - `description` (string)
    - `query_params` (object)
      - `filter_type` (string) — Filter mode, e.g. `simple` or `advanced`.
      - `advanced_filters` (string) — JSON-encoded advanced filter groups. Invalid JSON is stored as `[[]]`.
      - `search` (string) — Free-text search term.
      - `active_view` (string) — Active tab on the table.
    - `is_public` (boolean) — `true` when the view is shared with every user who can access this table.
    - `owner_id` (integer) — WordPress user ID of the creator.

  Example:

```json
{
  "views": [
    {
      "id": 41,
      "object_type": "order_table",
      "slug": "unfulfilled-orders-x7k2p9",
      "name": "Unfulfilled orders",
      "description": "Paid orders still awaiting fulfillment",
      "query_params": {
        "filter_type": "advanced",
        "advanced_filters": "[[{\"source\":\"order\",\"property\":\"fulfillment_type\",\"operator\":\"=\",\"value\":\"unfulfilled\"}]]",
        "search": "",
        "active_view": "all"
      },
      "is_public": false,
      "owner_id": 1
    }
  ]
}
```


- **403** — Forbidden — returned both when `object_type` is missing or unknown and when the user lacks the capability that `object_type` maps to.

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

## PUT `/saved-views/{id}`

**PUT Update Saved View**

Update a saved view. Only the fields present in the request body are changed — omit a field to leave it untouched.

Only the **creator** may update a view. `object_type` is not sent for this route; the policy resolves it by looking the record up from the ID in the URL.

**Permission:** varies by the view's stored `object_type` · **Policy:** `SavedViewsPolicy`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | ID of the saved view. |


**Request body** (`application/json`)

- `name` (string) _(maxLength: 50)_ — New display name, 50 characters or fewer.
- `description` (string)
- `is_public` (boolean)
- `query_params` (object)
  - `filter_type` (string) — Filter mode, e.g. `simple` or `advanced`.
  - `advanced_filters` (string) — JSON-encoded advanced filter groups. Invalid JSON is stored as `[[]]`.
  - `search` (string) — Free-text search term.
  - `active_view` (string) — Active tab on the table.

Example:

```json
{
  "name": "Unfulfilled orders (EU)",
  "is_public": true
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)
  - `view` (object)
    - `id` (integer)
    - `object_type` (string)
    - `slug` (string) — Auto-generated from the name plus a 6-character random suffix.
    - `name` (string)
    - `description` (string)
    - `query_params` (object)
      - `filter_type` (string) — Filter mode, e.g. `simple` or `advanced`.
      - `advanced_filters` (string) — JSON-encoded advanced filter groups. Invalid JSON is stored as `[[]]`.
      - `search` (string) — Free-text search term.
      - `active_view` (string) — Active tab on the table.
    - `is_public` (boolean) — `true` when the view is shared with every user who can access this table.
    - `owner_id` (integer) — WordPress user ID of the creator.

  Example:

```json
{
  "message": "View updated successfully.",
  "view": {
    "id": 41,
    "object_type": "order_table",
    "slug": "unfulfilled-orders-x7k2p9",
    "name": "Unfulfilled orders (EU)",
    "description": "Paid orders still awaiting fulfillment",
    "query_params": {
      "filter_type": "advanced",
      "advanced_filters": "[[{\"source\":\"order\",\"property\":\"fulfillment_type\",\"operator\":\"=\",\"value\":\"unfulfilled\"}]]",
      "search": "",
      "active_view": "all"
    },
    "is_public": true,
    "owner_id": 1
  }
}
```


- **403** — The authenticated user is not the creator of this view. A `rest_forbidden` response with the same status is returned earlier by the policy when the user lacks the table capability or the record does not exist.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "You do not have permission to update this view."
}
```


- **404** — View not found.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "View not found."
}
```


- **422** — Validation failed — `name` was sent empty or longer than 50 characters.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Name is required and must be 50 characters or fewer."
}
```



---
