# FluentCart API — inventory

6 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/inventory/bulk-update`

**POST Bulk Update Stock**

Adjust stock for many variants at once. `mode: "set"` writes `value` as the new absolute stock; `mode: "add"` adds `value` to each variant's current stock (use a negative `value` to subtract). Results are clamped at 0.

IDs that do not resolve to an existing variant are **skipped silently** — compare `count` against the number of items you sent to detect this. An empty `items` array is a successful no-op.

**Permission:** `products/edit` · **Policy:** `ProductPolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `mode` (string) **required** _(enum: `add`, `set`)_ — `set` writes an absolute value; `add` applies a delta.
- `value` (integer) **required** — The absolute value or the delta, per `mode`.
- `reason` (string) **required** _(enum: `received`, `damage`, `return`, `correction`, `transfer`, `other`)_ — Why the stock changed. One of `received` (Received Stock), `damage` (Damage/Loss), `return` (Return/Refund), `correction` (Count Correction), `transfer` (Inventory Transfer) or `other`. When `other` is used, `customReason` becomes required.
- `customReason` (string) — Free-text reason. Required when `reason` is `other`.
- `items` (array<object>) **required** — Variants to update. Only the `id` key is read.
  - `id` (integer) — Variant ID.

Example:

```json
{
  "mode": "add",
  "value": 5,
  "reason": "received",
  "items": [
    {
      "id": 22
    },
    {
      "id": 23
    }
  ]
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)
  - `count` (integer) — Number of variants actually updated.

  Example:

```json
{
  "message": "Stock updated successfully",
  "count": 2
}
```


- **400** — Invalid `mode` (allowed: `add`, `set`) or invalid `reason`.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Invalid mode. Allowed: add, set"
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



---

## POST `/inventory/export`

**POST Export Inventory**

Build a CSV of stock-managed variants and return it **inline as a string** — this endpoint does not return a file download or a URL; the client is expected to turn `csvData` into a file itself.

`inventoryState: "available"` emits `ID, SKU, Product Title, Variation Title, Available`. `inventoryState: "full"` additionally emits `Total Stock`, `On Hold` and `Delivered`.

**Permission:** `products/view` · **Policy:** `ProductPolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `scope` (string) **required** _(enum: `all`, `current_page`, `selected`)_ — `all` exports every stock-managed variant; `current_page` caps the query at 1000 rows; `selected` restricts to the IDs in `items`.
- `inventoryState` (string) **required** _(enum: `available`, `full`)_ — Which columns to emit.
- `format` (string) _(enum: `csv_spreadsheet`, `csv`; default: `csv_spreadsheet`)_ — `csv_spreadsheet` prefixes the payload with a UTF-8 BOM so Excel opens it correctly. Any other value omits the BOM.
- `items` (array<object>) — Variant IDs, read only when `scope` is `selected`.
  - `id` (integer)

Example:

```json
{
  "scope": "all",
  "inventoryState": "full",
  "format": "csv_spreadsheet"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)
  - `filename` (string) — Suggested filename, stamped with the server date/time.
  - `csvData` (string) — The complete CSV document as a string.

  Example:

```json
{
  "message": "Inventory exported successfully",
  "filename": "inventory-export-2026-08-18-09-12-44.csv",
  "csvData": "﻿ID,SKU,Product Title,Variation Title,Total Stock,Available,On Hold,Delivered\n22,TES-RED-XS,Example Tee,Red / XS,12,10,0,2\n"
}
```


- **400** — Invalid `scope` or invalid `inventoryState`.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Invalid scope."
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



---

## GET `/inventory/adjustment-history`

**GET Get Adjustment History**

Return the stock-adjustment audit trail for a single variant, newest first, capped at the **100** most recent entries.

**Permission:** `products/view` · **Policy:** `ProductPolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `variant_id` | integer | yes | ID of the product variant. **Required** — the endpoint returns `400` without it. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `adjustments` (array<object>)
    - `id` (integer)
    - `variant_id` (integer)
    - `post_id` (integer)
    - `old_stock` (integer)
    - `new_stock` (integer)
    - `change` (integer) — `new_stock - old_stock`; negative for a decrease.
    - `reason` (string) _(enum: `received`, `damage`, `return`, `correction`, `transfer`, `other`)_
    - `reason_label` (string) — Human-readable label for `reason`.
    - `custom_reason` (string) — Free text, only set when `reason` is `other`.
    - `user_id` (integer)
    - `user_name` (string) — Display name of the user who made the adjustment, or `System`.
    - `created_at` (string)
    - `updated_at` (string)
  - `variant_id` (integer)

  Example:

```json
{
  "adjustments": [
    {
      "id": 18,
      "variant_id": 22,
      "post_id": 31562,
      "old_stock": 8,
      "new_stock": 12,
      "change": 4,
      "reason": "received",
      "reason_label": "Received Stock",
      "custom_reason": "",
      "user_id": 1,
      "user_name": "Alex Morgan",
      "created_at": "2026-08-14 09:31:02",
      "updated_at": "2026-08-14 09:31:02"
    }
  ],
  "variant_id": 22
}
```


- **400** — `variant_id` was not supplied.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Variant ID is required"
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



---

## GET `/inventory/stats`

**GET Get Inventory Stats**

Return counts of stock-managed variants bucketed by availability. The low-stock boundary defaults to **10** units and is filterable via `fluent_cart/inventory_low_stock_threshold`.

Buckets are computed on `available` (not `total_stock`): `outOfStock` is `available <= 0`, `lowStock` is `0 < available <= threshold`, and `inStock` is `available > threshold`.

**Permission:** `products/view` · **Policy:** `ProductPolicy`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `totalVariants` (integer) — All variants with `manage_stock = 1`.
  - `inStock` (integer)
  - `lowStock` (integer)
  - `outOfStock` (integer)

  Example:

```json
{
  "totalVariants": 24,
  "inStock": 0,
  "lowStock": 24,
  "outOfStock": 0
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



---

## GET `/inventory`

**GET List Inventory**

Retrieve a paginated list of stock-managed products with their variants. Only products whose detail row **and** at least one variant have `manage_stock = 1` are returned.

**Permission:** `products/view` · **Policy:** `ProductPolicy`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `page` | integer | no | Page number for pagination. |
| `per_page` | integer | no | Records per page. |
| `search` | string | no | Search term. Matches product title, and variant SKU or variation title. Also supports operator syntax (e.g. `sku = TES-RED-XS`). |
| `sort_by` | string | no | Column to sort by (default: `id`). |
| `sort_type` | string | no | Sort direction. |
| `active_view` | string | no | Tab filter: `all`, `low_stock` or `out_of_stock`. |
| `filter_type` | string | no | Filter mode. |
| `advanced_filters` | string | no | JSON-encoded array of advanced filter groups. |
| `with` | string | no | Eager-load relations. Allowlisted values: `admin_inventory_list` (both relations, variant columns narrowed — used by the admin table), `detail`, and `variants`. Extendable via the `fluent_cart/inventory_allowed_withs` filter. |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `products` (object)
    - `current_page` (integer)
    - `data` (array<object>)
      - `ID` (integer)
      - `post_title` (string)
      - `post_content` (string)
      - `post_excerpt` (string)
      - `post_status` (string)
      - `thumbnail` (string)
      - `view_url` (string) — Public permalink for the product.
      - `gallery` (array<object>)
        - _(object)_
      - `detail` (object)
        - `id` (integer)
        - `post_id` (integer)
        - `fulfillment_type` (string)
        - `min_price` (string)
        - `max_price` (string)
        - `manage_stock` (string)
        - `stock_availability` (string)
        - `variation_type` (string)
      - `variants` (array<object>)
        - `id` (integer)
        - `post_id` (integer)
        - `variation_title` (string)
        - `variation_identifier` (string)
        - `sku` (string)
        - `manage_stock` (string) — `"1"` when this variant tracks stock.
        - `stock_status` (string)
        - `backorders` (integer)
        - `total_stock` (integer) — Physical units on hand.
        - `on_hold` (integer) — Units reserved by in-flight checkouts.
        - `committed` (integer) — Units sold and awaiting fulfillment.
        - `available` (integer) — `total_stock - committed - on_hold`, floored at 0.
        - `item_price` (integer) — Price in the store's smallest currency unit (cents).
        - `item_cost` (integer)
        - `item_status` (string)
        - `fulfillment_type` (string)
        - `created_at` (string)
        - `updated_at` (string)
        - `serial_index` (integer) — Display order of the variant within its product.
        - `sold_individually` (integer) — `1` limits the variant to one unit per order.
        - `media_id` (integer) — Attachment ID of the variant image.
        - `media` (object) — Resolved media object for the variant image.
          - _(object)_
        - `thumbnail` (string) — Resolved thumbnail URL, falling back to the store placeholder.
        - `payment_type` (string) — `onetime` or a subscription payment type.
        - `manage_cost` (string) — `"true"`/`"false"` — whether cost-of-goods tracking is on.
        - `compare_price` (integer) — Struck-through comparison price, in the smallest currency unit.
        - `formatted_total` (string) — Human-readable price, HTML-escaped (e.g. `&#36;100.00`).
        - `shipping_class` (integer) — Shipping class ID, `null` for digital variants.
        - `downloadable` (string) — `"true"`/`"false"` — whether the variant carries downloadable files.
        - `other_info` (object) — Per-variant settings: tax class/exemption, weight and dimensions, bundle config.
          - _(object)_
    - `first_page_url` (string)
    - `from` (integer)
    - `last_page` (integer)
    - `last_page_url` (string)
    - `links` (array<object>)
      - _(object)_
    - `next_page_url` (string)
    - `path` (string)
    - `per_page` (integer)
    - `prev_page_url` (string)
    - `to` (integer)
    - `total` (integer)

  Example:

```json
{
  "products": {
    "current_page": 1,
    "data": [
      {
        "ID": 31562,
        "post_title": "Example Tee",
        "post_content": "",
        "post_excerpt": "",
        "post_status": "draft",
        "thumbnail": "https://example.com/wp-content/plugins/fluent-cart/assets/images/placeholder.svg",
        "view_url": "https://example.com/?post_type=fluent-products&p=31562",
        "gallery": [],
        "detail": {
          "id": 2,
          "post_id": 31562,
          "fulfillment_type": "digital",
          "min_price": "10000",
          "max_price": "15000",
          "default_variation_id": null,
          "default_media": null,
          "manage_stock": "1",
          "stock_availability": "in-stock",
          "variation_type": "advanced_variations",
          "manage_downloadable": "0",
          "other_info": {
            "is_bundle_product": null,
            "attribute_config": [
              {
                "group_id": 1,
                "variants": [
                  1,
                  2
                ]
              },
              {
                "group_id": 2,
                "variants": [
                  11,
                  12
                ]
              }
            ],
            "active_editor": "wp-editor"
          },
          "created_at": "2026-06-24T06:56:49+00:00",
          "updated_at": "2026-07-31T11:08:17+00:00",
          "featured_media": null,
          "formatted_min_price": "&#36;100.00",
          "formatted_max_price": "&#36;150.00",
          "gallery_image": null
        },
        "variants": [
          {
            "id": 22,
            "post_id": 31562,
            "media_id": null,
            "serial_index": 1,
            "sold_individually": 0,
            "variation_title": "Red / XS",
            "variation_identifier": "1_11",
            "sku": "TES-RED-XS",
            "manage_stock": "1",
            "payment_type": "onetime",
            "stock_status": "in-stock",
            "backorders": 0,
            "total_stock": 1,
            "on_hold": 0,
            "committed": 0,
            "available": 1,
            "fulfillment_type": "digital",
            "item_status": "active",
            "manage_cost": "false",
            "item_price": 10000,
            "item_cost": 0,
            "compare_price": 0,
            "shipping_class": null,
            "other_info": {
              "description": "",
              "payment_type": "onetime",
              "tax_class": "standard",
              "tax_exempt": "no",
              "tax_inclusion": "",
              "package_slug": "",
              "weight": null,
              "weight_unit": "kg",
              "length": null,
              "width": null,
              "height": null,
              "is_bundle_product": null,
              "bundle_child_ids": []
            },
            "downloadable": "false",
            "created_at": "2026-06-24T06:57:57+00:00",
            "updated_at": "2026-06-24T06:58:49+00:00",
            "thumbnail": null,
            "formatted_total": "&#36;100.00",
            "media": null
          },
          {
            "id": 23,
            "post_id": 31562,
            "media_id": null,
            "serial_index": 2,
            "sold_individually": 0,
            "variation_title": "Red / S",
            "variation_identifier": "1_12",
            "sku": "TES-RED-S",
            "manage_stock": "1",
            "payment_type": "onetime",
            "stock_status": "in-stock",
            "backorders": 0,
            "total_stock": 1,
            "on_hold": 0,
            "committed": 0,
            "available": 1,
            "fulfillment_type": "digital",
            "item_status": "active",
            "manage_cost": "false",
            "item_price": 10000,
            "item_cost": 0,
            "compare_price": 0,
            "shipping_class": null,
            "other_info": {
              "description": "",
              "payment_type": "onetime",
              "tax_class": "standard",
              "tax_exempt": "no",
              "tax_inclusion": "",
              "package_slug": "",
              "weight": null,
              "weight_unit": "kg",
              "length": null,
              "width": null,
              "height": null,
              "is_bundle_product": null,
              "bundle_child_ids": []
            },
            "downloadable": "false",
            "created_at": "2026-06-24T06:57:57+00:00",
            "updated_at": "2026-06-24T06:58:53+00:00",
            "thumbnail": null,
            "formatted_total": "&#36;100.00",
            "media": null
          }
        ]
      },
      {
        "ID": 21480,
        "post_title": "FluentCart Pro",
        "post_content": "<p>Hello!</p>",
        "post_excerpt": "A complete eCommerce management suite that helps teams build stores and manage sales with subscriptions and licensing. Built for speed and simplicity.",
        "post_status": "publish",
        "thumbnail": "https://example.com/wp-content/uploads/2025/07/cropped-fluentcart-site-icon12.webp",
        "view_url": "https://example.com/blog/item/fluent-cart-pro/",
        "gallery": [
          {
            "id": 15853,
            "url": "https://example.com/wp-content/uploads/2025/07/cropped-fluentcart-site-icon12.webp",
            "title": "fluentcart product icon"
          }
        ],
        "detail": {
          "id": 1,
          "post_id": 21480,
          "fulfillment_type": "digital",
          "min_price": "9900",
          "max_price": "219800",
          "default_variation_id": null,
          "default_media": null,
          "manage_stock": "1",
          "stock_availability": "in-stock",
          "variation_type": "simple_variations",
          "manage_downloadable": "1",
          "other_info": {
            "group_pricing_by": "none",
            "sold_individually": "yes",
            "use_pricing_table": "no",
            "shipping_class": 0,
            "tax_class": 0,
            "active_editor": "gutenberg"
          },
          "created_at": "2025-10-08T05:24:50+00:00",
          "updated_at": "2026-06-24T06:37:44+00:00",
          "featured_media": {
            "id": 15853,
            "url": "https://example.com/wp-content/uploads/2025/07/cropped-fluentcart-site-icon12.webp",
            "title": "fluentcart product icon"
          },
          "formatted_min_price": "&#36;99.00",
          "formatted_max_price": "&#36;2,198.00",
          "gallery_image": {
            "meta_id": "30489",
            "post_id": 21480,
            "meta_key": "fluent-products-gallery-image",
            "meta_value": [
              {
                "id": 15853,
                "url": "https://example.com/wp-content/uploads/2025/07/cropped-fluentcart-site-icon12.webp",
                "title": "fluentcart product icon"
              }
            ]
          }
        },
        "variants": [
          {
            "id": 1,
            "post_id": 21480,
            "media_id": null,
            "serial_index": 1,
            "sold_individually": 0,
            "variation_title": "2 Sites - VIP Exclusive",
            "variation_identifier": null,
            "sku": "FLU-PRO-2-SIT-VIP-EXC",
            "manage_stock": "1",
            "payment_type": "onetime",
            "stock_status": "in-stock",
            "backorders": 0,
            "total_stock": 1,
            "on_hold": 0,
            "committed": 0,
            "available": 1,
            "fulfillment_type": "digital",
            "item_status": "active",
            "manage_cost": "false",
            "item_price": 49800,
            "item_cost": 0,
            "compare_price": 0,
            "shipping_class": null,
            "other_info": {
              "payment_type": "onetime",
              "description": null,
              "weight_unit": "kg",
              "package_slug": "",
              "weight": null,
              "length": null,
              "width": null,
              "height": null,
              "tax_class": null,
              "tax_exempt": null,
              "is_bundle_product": "no",
              "bundle_child_ids": []
            },
            "downloadable": "false",
            "created_at": "2025-10-08T05:24:50+00:00",
            "updated_at": "2026-06-24T06:44:56+00:00",
            "thumbnail": "https://example.com/wp-content/uploads/2025/10/All-Logos-66-1.png",
            "formatted_total": "&#36;498.00",
            "media": {
              "id": 1,
              "object_id": "1",
              "meta_value": [
                {
                  "id": 20816,
                  "url": "https://example.com/wp-content/uploads/2025/10/All-Logos-66-1.png",
                  "title": "All Logos (66) (1)"
                }
              ]
            }
          },
          {
            "id": 2,
            "post_id": 21480,
            "media_id": null,
            "serial_index": 2,
            "sold_individually": 0,
            "variation_title": "10 Sites - VIP Exclusive",
            "variation_identifier": null,
            "sku": "FLU-PRO-10-SIT-VIP-EXC",
            "manage_stock": "1",
            "payment_type": "onetime",
            "stock_status": "in-stock",
            "backorders": 0,
            "total_stock": 1,
            "on_hold": 0,
            "committed": 0,
            "available": 1,
            "fulfillment_type": "digital",
            "item_status": "active",
            "manage_cost": "false",
            "item_price": 99800,
            "item_cost": 0,
            "compare_price": 0,
            "shipping_class": null,
            "other_info": {
              "payment_type": "onetime",
              "description": null,
              "weight_unit": "kg",
              "package_slug": "",
              "weight": null,
              "length": null,
              "width": null,
              "height": null,
              "tax_class": null,
              "tax_exempt": null,
              "is_bundle_product": "no",
              "bundle_child_ids": []
            },
            "downloadable": "false",
            "created_at": "2025-10-08T05:26:52+00:00",
            "updated_at": "2026-06-24T06:45:01+00:00",
            "thumbnail": "https://example.com/wp-content/uploads/2025/10/All-Logos-66-1.png",
            "formatted_total": "&#36;998.00",
            "media": {
              "id": 2,
              "object_id": "2",
              "meta_value": [
                {
                  "id": 20816,
                  "url": "https://example.com/wp-content/uploads/2025/10/All-Logos-66-1.png",
                  "title": "All Logos (66) (1)"
                }
              ]
            }
          }
        ]
      }
    ],
    "first_page_url": "https://example.com/wp-json/fluent-cart/v2/inventory/?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "https://example.com/wp-json/fluent-cart/v2/inventory/?page=1",
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "active": false
      },
      {
        "url": "https://example.com/wp-json/fluent-cart/v2/inventory/?page=1",
        "label": "1",
        "active": true
      }
    ],
    "next_page_url": null,
    "path": "https://example.com/wp-json/fluent-cart/v2/inventory",
    "per_page": 2,
    "prev_page_url": null,
    "to": 2,
    "total": 2
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



---

## POST `/inventory/update-stock`

**POST Update Stock**

Set the absolute stock level for one variant and record a stock-adjustment entry.

`available` is recalculated as `new_stock - committed - on_hold`, floored at 0. A negative `new_stock` is clamped to 0.

**Permission:** `products/edit` · **Policy:** `ProductPolicy`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `variant_id` (integer) **required** — ID of the variant to update.
- `post_id` (integer) **required** — ID of the parent product. Must match the variant's `post_id` or the request 404s.
- `new_stock` (integer) **required** — Absolute new `total_stock`. Values below 0 are clamped to 0.
- `reason` (string) **required** _(enum: `received`, `damage`, `return`, `correction`, `transfer`, `other`)_ — Why the stock changed. One of `received` (Received Stock), `damage` (Damage/Loss), `return` (Return/Refund), `correction` (Count Correction), `transfer` (Inventory Transfer) or `other`. When `other` is used, `customReason` becomes required.
- `customReason` (string) — Free-text reason. Required when `reason` is `other`.

Example:

```json
{
  "variant_id": 22,
  "post_id": 31562,
  "new_stock": 12,
  "reason": "received"
}
```


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `message` (string)
  - `variant_id` (integer)
  - `new_stock` (integer)

  Example:

```json
{
  "message": "Stock updated successfully",
  "variant_id": 22,
  "new_stock": 12
}
```


- **400** — Missing `variant_id`, `post_id` or `new_stock`; or an invalid `reason`; or `reason` is `other` with an empty `customReason`.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Required parameters are missing"
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


- **404** — No variant matches that `variant_id` / `post_id` pair.

  Schema (`application/json`):

  - `message` (string) — Human-readable error message

  Example:

```json
{
  "message": "Variant not found"
}
```



---
