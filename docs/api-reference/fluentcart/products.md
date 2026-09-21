# FluentCart API — Products

63 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/products/add-product-terms`

**POST Add Product Terms**

Create new taxonomy terms for products (categories, brands, etc.).

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `term` (object) **required**
  - `name` (string) **required** — Term name(s), comma-separated for multiple
  - `taxonomy` (string) **required** — Taxonomy name (e.g., product-categories, product-brands)
  - `parent` (integer) — Parent term ID for hierarchical terms

Example:

```json
{
  "term": {
    "name": "New Category,Another Category",
    "taxonomy": "product-categories",
    "parent": 0
  }
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "term_ids": [
    14,
    15
  ],
  "names": [
    "New Category",
    "Another Category"
  ],
  "taxonomy": "product-categories"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## GET `/products/bulk-edit-data`

**GET Bulk Edit Fetch**

Fetch products formatted for the bulk editing spreadsheet view.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search by product title |
| `per_page` | integer | no | Number of results per page |
| `page` | integer | no | Page number |
| `sort_by` | string | no | Column to sort by |
| `sort_type` | string | no | Sort direction |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "products": [
    {
      "ID": 123,
      "post_title": "Developer Toolkit Pro",
      "post_content": "<p>A complete developer toolkit.</p>",
      "post_excerpt": "A complete developer toolkit for building modern apps.",
      "post_status": "publish",
      "view_url": "https://yoursite.com/product/developer-toolkit-pro/",
      "gallery": [
        {
          "id": 456,
          "url": "https://yoursite.com/wp-content/uploads/2025/06/toolkit-icon.webp",
          "title": "Developer Toolkit icon"
        }
      ],
      "detail": {
        "variation_type": "simple_variations",
        "fulfillment_type": "digital",
        "manage_stock": 1
      },
      "variants": [
        {
          "id": 1,
          "post_id": 123,
          "variation_title": "Single Site License",
          "sku": "DEV-TOOLKIT-1",
          "item_price": 49,
          "compare_price": 0,
          "payment_type": "onetime",
          "manage_stock": 1,
          "total_stock": 100,
          "available": 100,
          "stock_status": "in-stock",
          "serial_index": 1,
          "fulfillment_type": "digital",
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
          "media": []
        },
        {
          "id": 2,
          "post_id": 123,
          "variation_title": "5 Site License",
          "sku": "DEV-TOOLKIT-5",
          "item_price": 99,
          "compare_price": 0,
          "payment_type": "onetime",
          "manage_stock": 1,
          "total_stock": 100,
          "available": 100,
          "stock_status": "in-stock",
          "serial_index": 2,
          "fulfillment_type": "digital",
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
          "media": []
        }
      ],
      "category_terms": [],
      "categories": []
    },
    {
      "ID": 124,
      "post_title": "Cloud Hosting Starter",
      "post_content": "",
      "post_excerpt": "",
      "post_status": "draft",
      "view_url": "https://yoursite.com/?post_type=fluent-products&p=124",
      "gallery": [],
      "detail": {
        "variation_type": "simple_variations",
        "fulfillment_type": "digital",
        "manage_stock": 1
      },
      "variants": [
        {
          "id": 3,
          "post_id": 124,
          "variation_title": "Monthly Plan",
          "sku": "CLOUD-HOST-M",
          "item_price": 19,
          "compare_price": 0,
          "payment_type": "onetime",
          "manage_stock": 1,
          "total_stock": 1,
          "available": 1,
          "stock_status": "in-stock",
          "serial_index": 1,
          "fulfillment_type": "digital",
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
          "media": []
        }
      ],
      "category_terms": [],
      "categories": []
    }
  ],
  "total": 2,
  "per_page": 10,
  "page": 1
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/bulk-insert`

**POST Bulk Insert Products**

Insert multiple products at once. Maximum 10 products per request. Money fields are in cents: `detail.item_price`, `detail.compare_price` (single-variation products), and `variants[].item_price`, `variants[].compare_price`, `variants[].other_info.signup_fee` (multi-variation products) all take cents — e.g. `1999` for $19.99.

**Required permission:** `products/create`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `products` (array<object>) **required** — Array of product data objects (max 10). Money fields (detail.item_price, detail.compare_price, variants[].item_price, variants[].compare_price, variants[].other_info.signup_fee) are cents.
  - _(object)_

Example:

```json
{
  "products": [
    {
      "post_title": "Product A",
      "detail": {
        "fulfillment_type": "digital",
        "item_price": 1999,
        "compare_price": 2999
      }
    },
    {
      "post_title": "Product B",
      "detail": {
        "fulfillment_type": "physical"
      }
    }
  ]
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "2 product(s) created successfully",
  "created": [
    {
      "ID": 130,
      "post_title": "Product A",
      "post_status": "draft",
      "detail": {
        "id": 95,
        "post_id": 130,
        "fulfillment_type": "digital",
        "variation_type": "single"
      }
    },
    {
      "ID": 131,
      "post_title": "Product B",
      "post_status": "draft",
      "detail": {
        "id": 96,
        "post_id": 131,
        "fulfillment_type": "physical",
        "variation_type": "single"
      }
    }
  ],
  "errors": []
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


- **403** — Authenticated, but the user lacks the required capability (`products/create`).

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

## POST `/products/bulk-update`

**POST Bulk Update Products**

Update multiple products at once from the bulk edit view. Maximum 10 products per request. Money fields are in cents: `variants[].item_price`, `variants[].compare_price`, `variants[].item_cost`, and `variants[].other_info.signup_fee` all take cents — e.g. `1999` for $19.99.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `products` (array<object>) **required** — Array of product data objects to update (max 10). Money fields (variants[].item_price, variants[].compare_price, variants[].item_cost, variants[].other_info.signup_fee) are cents.
  - _(object)_

Example:

```json
{
  "products": [
    {
      "ID": 123,
      "post_title": "Updated Title A",
      "variants": [
        {
          "id": 456,
          "item_price": 1999,
          "compare_price": 2999
        }
      ]
    }
  ]
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "1 product(s) updated successfully",
  "updated": [
    {
      "ID": 123,
      "post_title": "Updated Title A",
      "post_status": "publish"
    }
  ],
  "errors": []
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/{product_id}/integrations/feed/change-status`

**POST Change Integration Status**

Enable or disable a product integration feed.

**Also used by the integrations UI.** Toggle a product-level integration feed on or off.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `product_id` | integer | yes | The product ID |


**Request body** (`application/json`, required)

- `notification_id` (integer) **required** — The integration feed ID
- `status` (string) **required** _(enum: `yes`, `no`)_ — yes to enable, no to disable

Example:

```json
{
  "product_id": 123,
  "notification_id": 10,
  "status": "yes"
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Integration status has been updated"
}
```


- **400** — Missing required parameters

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Product ID and Notification ID are required"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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


- **404** — Notification not found

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Notification not found"
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

## POST `/products/create-dummy`

**POST Create Dummy Products**

Create sample/demo products for testing or onboarding purposes.

**Required permission:** `products/create`

**Auth:** ApplicationPasswords

**Request body** (`application/json`)

- `category` (string) — Product category for dummy products
- `index` (integer) — Index for dummy product generation

Example:

```json
{
  "category": "digital",
  "index": 1
}
```


**Responses**

- **200** — Returns the created dummy product data.

  Example:

```json
{
  "product": {
    "ID": 135,
    "post_title": "Sample Digital Product",
    "post_status": "publish",
    "post_type": "fluent-products",
    "post_name": "sample-digital-product",
    "detail": {
      "id": 100,
      "post_id": 135,
      "fulfillment_type": "digital",
      "variation_type": "single",
      "manage_stock": 0
    }
  },
  "message": "Dummy product created successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/create`).

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

## POST `/products`

**POST Create Product**

Create a new product. A default variation is automatically created with the product.

**Required permission:** `products/create`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `post_title` (string) **required** — Product title (max 200 characters)
- `post_status` (string) _(enum: `draft`, `publish`)_ — Post status
- `detail` (object)
  - `fulfillment_type` (string) _(enum: `physical`, `digital`)_ — Fulfillment type (default: digital)
  - `other_info` (object)
    - `is_bundle_product` (string) _(enum: `yes`, `no`)_ — Whether this is a bundle product (default: no)

Example:

```json
{
  "post_title": "New Digital Product",
  "post_status": "draft",
  "detail": {
    "fulfillment_type": "digital"
  }
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "data": {
    "ID": 124,
    "variant": {
      "id": 458,
      "post_id": 124,
      "serial_index": 0,
      "variation_title": "New Digital Product",
      "variation_identifier": "new-digital-product",
      "sku": null,
      "payment_type": "onetime",
      "item_price": 0,
      "item_cost": 0,
      "compare_price": 0,
      "item_status": "active",
      "manage_stock": 0,
      "stock_status": "in-stock",
      "total_stock": 0,
      "available": 0,
      "committed": 0,
      "on_hold": 0,
      "fulfillment_type": "digital",
      "downloadable": 0,
      "sold_individually": 0,
      "thumbnail": null
    },
    "product_details": {
      "id": 91,
      "post_id": 124,
      "fulfillment_type": "digital",
      "min_price": 0,
      "max_price": 0,
      "default_variation_id": 458,
      "variation_type": "single",
      "stock_availability": "in-stock",
      "manage_stock": 0,
      "manage_downloadable": 0,
      "formatted_min_price": "$0.00",
      "formatted_max_price": "$0.00"
    }
  },
  "message": "Product has been created successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/create`).

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

## POST `/products/variants`

**POST Create Variation**

Create a new product variation.

**Required permission:** `products/create`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `variants` (object) **required**
  - `post_id` (integer) **required** — Parent product ID
  - `variation_title` (string) **required** — Variation title (max 200 chars)
  - `sku` (string) — SKU (max 30 chars, must be unique)
  - `item_price` (number) — Price in cents (min: 0)
  - `compare_price` (number) — Compare-at price in cents
  - `manage_cost` (string) — Enable cost tracking
  - `item_cost` (number) — Item cost (required if manage_cost is true)
  - `fulfillment_type` (string) **required** _(enum: `physical`, `digital`)_
  - `manage_stock` (integer) _(enum: `0`, `1`)_
  - `stock_status` (string) _(enum: `in-stock`, `out-of-stock`)_
  - `total_stock` (integer) **required** — Total stock quantity
  - `available` (integer) **required** — Available stock
  - `committed` (integer) **required** — Committed stock
  - `on_hold` (integer) **required** — Stock on hold
  - `serial_index` (integer) — Display order index
  - `downloadable` (string) — Downloadable flag
  - `other_info` (object)
    - `payment_type` (string) _(enum: `onetime`, `subscription`)_
    - `description` (string)
    - `repeat_interval` (string)
    - `times` (number)
    - `trial_days` (number)
    - `billing_summary` (string)
    - `manage_setup_fee` (string)
    - `signup_fee` (number)
    - `signup_fee_name` (string)
  - `media` (array<object>)
    - _(object)_

Example:

```json
{
  "variants": {
    "post_id": 123,
    "variation_title": "Pro Plan",
    "item_price": 2999,
    "sku": "PRO-PLN",
    "fulfillment_type": "digital",
    "total_stock": 1,
    "available": 1,
    "committed": 0,
    "on_hold": 0,
    "other_info": {
      "payment_type": "onetime"
    }
  }
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "variant": {
    "id": 460,
    "post_id": 123,
    "serial_index": 2,
    "variation_title": "Pro Plan",
    "variation_identifier": "pro-plan",
    "sku": "PRO-PLN",
    "payment_type": "onetime",
    "item_price": 2999,
    "item_cost": 0,
    "compare_price": 0,
    "item_status": "active",
    "manage_stock": 0,
    "stock_status": "in-stock",
    "total_stock": 0,
    "available": 0,
    "committed": 0,
    "on_hold": 0,
    "fulfillment_type": "digital",
    "downloadable": 0,
    "sold_individually": 0,
    "thumbnail": null
  },
  "message": "Variation created successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/create`).

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

## DELETE `/products/{downloadableId}/delete`

**DELETE Delete Downloadable File**

Delete a downloadable file record.

**Required permission:** `products/delete`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `downloadableId` | integer | yes | The downloadable file ID |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "File deleted successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/delete`).

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

## DELETE `/products/{product}`

**DELETE Delete Product**

Delete a product and all associated data.

**Required permission:** `products/delete`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `product` | integer | yes | The product ID to delete |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Product deleted successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/delete`).

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

## DELETE `/products/{product_id}/integrations/{integration_id}`

**DELETE Delete Product Integration**

Delete a product integration feed.

**Also used by the integrations UI.** Permanently delete a product-level integration feed.

**Required permission:** `products/delete`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `product_id` | integer | yes | The product ID |
| `integration_id` | integer | yes | The integration feed ID to delete |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Integration deleted successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/delete`).

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

## POST `/products/delete-taxonomy-term/{postId}`

**POST Delete Taxonomy Term**

Remove a specific taxonomy term from a product.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | integer | yes | The product post ID |


**Request body** (`application/json`, required)

- `taxonomy` (string) **required** — Taxonomy name (e.g., product-categories)
- `term` (integer) **required** — Term ID to remove

Example:

```json
{
  "taxonomy": "product-categories",
  "term": 5
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Taxonomy term removed successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## DELETE `/products/upgrade-path/{id}/delete`

**DELETE Delete Upgrade Path**

Delete an upgrade path.

**Required permission:** `products/delete`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The upgrade path ID |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Path deleted successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/delete`).

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

## DELETE `/products/variants/{variantId}`

**DELETE Delete Variation**

Delete a product variation.

**Required permission:** `products/delete`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `variantId` | integer | yes | The variation ID to delete |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Variation deleted successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/delete`).

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

## POST `/products/do-bulk-action`

**POST Do Bulk Action**

Perform bulk actions on selected products (e.g., publish, draft, delete).

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `action` (string) **required** — The bulk action to perform
- `product_ids` (array<integer>) **required** — Array of product IDs to act on

Example:

```json
{
  "action": "publish",
  "product_ids": [
    123,
    456,
    789
  ]
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Bulk action completed successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/{productId}/duplicate`

**POST Duplicate Product**

Duplicate a product with options to include or exclude certain settings. The new product is saved as a draft.

**Required permission:** `products/create`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `productId` | integer | yes | The product ID to duplicate |


**Request body** (`application/json`)

- `import_stock_management` (string) — Include stock management settings (true/false)
- `import_license_settings` (string) — Include license settings (true/false)
- `import_downloadable_files` (string) — Include downloadable files (true/false)

Example:

```json
{
  "import_stock_management": "true",
  "import_license_settings": "true",
  "import_downloadable_files": "false"
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "product_id": 130,
  "product": {
    "ID": 130,
    "post_title": "Developer Toolkit Pro (Copy)",
    "post_status": "draft",
    "post_type": "fluent-products",
    "edit_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/products/130"
  },
  "message": "Product duplicated successfully. The new product has been saved as a draft."
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


- **403** — Authenticated, but the user lacks the required capability (`products/create`).

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

## GET `/products/fetchProductsByIds`

**GET Fetch Products by IDs**

Retrieve products by an array of IDs. Returns products with their detail relation.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `productIds[]` | array<integer> | yes | Array of product IDs to fetch |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "products": [
    {
      "ID": 123,
      "post_title": "Developer Toolkit Pro",
      "post_status": "publish",
      "post_type": "fluent-products",
      "post_date": "2025-03-15 10:00:00",
      "post_modified": "2025-09-01 15:30:00",
      "post_name": "developer-toolkit-pro",
      "thumbnail": "https://example.com/wp-content/uploads/2025/03/dev-toolkit.png",
      "detail": {
        "id": 89,
        "post_id": 123,
        "fulfillment_type": "digital",
        "min_price": 4900,
        "max_price": 19900,
        "default_variation_id": 456,
        "variation_type": "multi",
        "stock_availability": "in-stock",
        "manage_stock": 0,
        "manage_downloadable": 1,
        "formatted_min_price": "$49.00",
        "formatted_max_price": "$199.00"
      }
    },
    {
      "ID": 124,
      "post_title": "Cloud Hosting Starter",
      "post_status": "publish",
      "post_type": "fluent-products",
      "post_date": "2025-06-20 08:30:00",
      "post_modified": "2025-08-10 12:00:00",
      "post_name": "cloud-hosting-starter",
      "thumbnail": null,
      "detail": {
        "id": 90,
        "post_id": 124,
        "fulfillment_type": "digital",
        "min_price": 1900,
        "max_price": 1900,
        "default_variation_id": 460,
        "variation_type": "single",
        "stock_availability": "in-stock",
        "manage_stock": 0,
        "manage_downloadable": 0,
        "formatted_min_price": "$19.00",
        "formatted_max_price": "$19.00"
      }
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/fetch-term`

**GET Fetch Taxonomy Terms**

Retrieve all registered taxonomies and their terms for product categorization.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response.

  Example:

```json
{
  "taxonomies": {
    "product-categories": {
      "name": "product-categories",
      "label": "Product Categories",
      "terms": [
        {
          "value": "10",
          "label": "Software",
          "parent": "0",
          "children": [
            {
              "value": "11",
              "label": "Developer Tools",
              "parent": "10",
              "children": []
            },
            {
              "value": "12",
              "label": "Plugins",
              "parent": "10",
              "children": []
            }
          ]
        },
        {
          "value": "13",
          "label": "Templates",
          "parent": "0",
          "children": []
        }
      ]
    },
    "product-brands": {
      "name": "product-brands",
      "label": "Product Brands",
      "terms": [
        {
          "value": "20",
          "label": "FluentWP",
          "parent": "0",
          "children": []
        }
      ]
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## POST `/products/fetch-term-by-parent`

**POST Fetch Terms by Parent**

Retrieve taxonomy terms filtered by parent term IDs.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `parents` (array<integer>) **required** — Array of parent term IDs
- `listeners` (array<string>) **required** — Array of taxonomy names to retrieve terms for

Example:

```json
{
  "parents": [
    1,
    2
  ],
  "listeners": [
    "product-categories"
  ]
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "data": {
    "product-categories": [
      {
        "value": 11,
        "label": "Developer Tools",
        "parent": 10
      },
      {
        "value": 12,
        "label": "Plugins",
        "parent": 10
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/fetchVariationsByIds`

**GET Fetch Variations by IDs**

Retrieve variations by an array of IDs. Returns simplified label/value pairs.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `productIds[]` | array<integer> | yes | Array of variation IDs to fetch |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "products": [
    {
      "value": 456,
      "label": "Developer Toolkit Pro - Personal License ($49.00)"
    },
    {
      "value": 457,
      "label": "Developer Toolkit Pro - Business License - Annual ($99.00/yr)"
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/findSubscriptionVariants`

**GET Find Subscription Variants**

Search for product variants that have a subscription payment type.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | no | Variant title to search |


**Responses**

- **200** — Successful response.

  Schema (`application/json`):

  - array of object
    - `id` (integer)
    - `title` (string)

  Example:

```json
[
  {
    "id": 457,
    "title": "Developer Toolkit Pro - Business License - Annual",
    "post_id": 123,
    "item_price": 9900,
    "sku": "DTK-BIZ-ANNUAL",
    "payment_type": "subscription"
  },
  {
    "id": 470,
    "title": "Cloud Hosting - Monthly Plan",
    "post_id": 124,
    "item_price": 1900,
    "sku": "HOST-MONTHLY",
    "payment_type": "subscription"
  }
]
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/get-bundle-info/{productId}`

**GET Get Bundle Info**

Retrieve bundle configuration information for a product, including child variant mappings.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `productId` | integer | yes | The product ID |


**Responses**

- **200** — Successful response.

  Schema (`application/json`):

  - array of object
    - `id` (integer)
    - `variation_title` (string)
    - `other_info` (object)
      - _(object)_

  Example:

```json
[
  {
    "id": 789,
    "post_id": 126,
    "variation_title": "Complete Developer Bundle",
    "variation_identifier": "complete-bundle",
    "sku": "DEV-BUNDLE",
    "item_price": 14900,
    "compare_price": 19900,
    "payment_type": "onetime",
    "item_status": "active",
    "stock_status": "in-stock",
    "fulfillment_type": "digital",
    "other_info": {
      "payment_type": "onetime",
      "is_bundle": true,
      "bundle_type": "fixed",
      "bundle_child_ids": [
        460,
        465
      ],
      "items": [
        {
          "product_id": 124,
          "variation_id": 460,
          "title": "Code Generator Plugin",
          "quantity": 1
        },
        {
          "product_id": 125,
          "variation_id": 465,
          "title": "API Testing Suite",
          "quantity": 1
        }
      ]
    }
  }
]
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/getDownloadableUrl/{downloadableId}`

**GET Get Downloadable URL**

Generate a temporary download URL for a downloadable file (valid for 7 days).

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `downloadableId` | integer | yes | The downloadable file ID |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "url": "https://example.com/fluent-cart/download?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9&file_id=30&expires=1756684800"
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/get-max-excerpt-word-count`

**GET Get Max Excerpt Word Count**

Returns the maximum allowed word count for product excerpts (controlled by the WordPress excerpt_length filter).

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response.

  Example:

```json
{
  "count": 55
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/{productId}/pricing-widgets`

**GET Get Pricing Widgets**

Retrieve sales overview widgets for a product (all-time, last 30 days, this month).

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `productId` | integer | yes | The product ID |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "widgets": [
    {
      "title": "Quick Sales Overview",
      "body": "<ul class=\"fct-lists\"><li><span>All time (42)</span><span>$4,158.00</span></li><li><span>Last 30 days (8)</span><span>$784.00</span></li><li><span>This month (3)</span><span>$294.00</span></li></ul>"
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/{product}`

**GET Get Product**

Retrieve a single product by ID.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `product` | integer | yes | The product ID |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with[]` | array<string> | no | Relations to eager load (e.g., detail, variants, product_menu) |


**Responses**

- **200** — Successful response.

  Schema (`application/json`):

  - `product` is the raw WordPress post record (post_type `fluent-products`) with its `detail` relation (pricing, stock, media) always attached, plus an appended `thumbnail` URL. `product_menu` is included only when `product_menu` is passed in the `with[]` query parameter; it is absent otherwise.

  Example:

```json
{
  "product": {
    "ID": 123,
    "post_date": "2025-03-15 10:00:00",
    "post_date_gmt": "2025-03-15 10:00:00",
    "post_content": "A comprehensive developer toolkit with API access, code generators, and premium support.",
    "post_title": "Developer Toolkit Pro",
    "post_excerpt": "Professional developer tools for building modern applications.",
    "post_status": "publish",
    "comment_status": "closed",
    "ping_status": "closed",
    "post_name": "developer-toolkit-pro",
    "post_modified": "2025-09-01 15:30:00",
    "post_modified_gmt": "2025-09-01 15:30:00",
    "guid": "https://yoursite.com/?post_type=fluent-products&p=123",
    "post_type": "fluent-products",
    "thumbnail": "https://yoursite.com/wp-content/uploads/2025/03/dev-toolkit.png",
    "detail": {
      "id": 1,
      "post_id": 123,
      "fulfillment_type": "digital",
      "min_price": "4999",
      "max_price": "9999",
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
      "created_at": "2025-03-15T10:00:00+00:00",
      "updated_at": "2025-09-01T15:30:00+00:00",
      "featured_media": {
        "id": 456,
        "url": "https://yoursite.com/wp-content/uploads/2025/03/dev-toolkit.png",
        "title": "Developer Toolkit Pro icon"
      },
      "formatted_min_price": "&#36;49.99",
      "formatted_max_price": "&#36;99.99",
      "gallery_image": {
        "meta_id": "789",
        "post_id": 123,
        "meta_key": "fluent-products-gallery-image",
        "meta_value": [
          {
            "id": 456,
            "url": "https://yoursite.com/wp-content/uploads/2025/03/dev-toolkit.png",
            "title": "Developer Toolkit Pro icon"
          }
        ]
      }
    }
  },
  "product_menu": [
    {
      "key": "pricing",
      "label": "Pricing",
      "route": "product-pricing"
    },
    {
      "key": "integrations",
      "label": "Integrations",
      "route": "product-integrations"
    },
    {
      "key": "upgrade_paths",
      "label": "Upgrade Paths",
      "route": "product-upgrade-paths"
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/{productId}/integrations`

**GET Get Product Integration Feeds**

Retrieve all integration feeds configured for a product, along with available integrations.

**Also used by the integrations UI.** Retrieve all integration feeds configured for a specific product, along with available product-scoped integrations.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `productId` | integer | yes | The product ID |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "feeds": [
    {
      "id": 10,
      "name": "Add to FluentCRM List",
      "enabled": "yes",
      "provider": "fluentcrm",
      "feed": {
        "name": "Add to FluentCRM List",
        "list_id": 1,
        "tag_ids": [
          5,
          8
        ],
        "conditional_variation_ids": [],
        "enabled": "yes"
      },
      "scope": "product"
    }
  ],
  "available_integrations": {
    "fluentcrm": {
      "title": "FluentCRM",
      "logo": "...",
      "enabled": true,
      "scopes": [
        "product",
        "order"
      ]
    }
  },
  "all_module_config_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/integrations"
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/{product_id}/integrations/{integration_name}/settings`

**GET Get Product Integration Settings**

Retrieve settings for a specific integration type on a product. Returns the integration form configuration, existing settings, and product variations.

**Also used by the integrations UI.** Retrieve the feed editor settings for a specific integration provider, scoped to a product. Returns form schema, saved values, available shortcodes, and the product's variation list for conditional targeting.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `product_id` | integer | yes | The product ID |
| `integration_name` | string | yes | Integration provider name (e.g., fluentcrm) |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `integration_id` | integer | no | Existing integration feed ID to load for editing |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "settings": {
    "name": "Add to FluentCRM List",
    "list_id": 1,
    "tag_ids": [
      5,
      8
    ],
    "conditional_variation_ids": [
      456,
      457
    ],
    "enabled": "yes"
  },
  "fields": [
    {
      "key": "name",
      "label": "Feed Name",
      "type": "text",
      "required": true
    },
    {
      "key": "list_id",
      "label": "FluentCRM List",
      "type": "select",
      "required": true
    }
  ],
  "product_variations": [
    {
      "id": 456,
      "title": "Personal License"
    },
    {
      "id": 457,
      "title": "Business License - Annual"
    }
  ],
  "scope": "product"
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/{productId}/pricing`

**GET Get Product Pricing**

Retrieve the full product details including pricing, variants, downloadable files, and taxonomy information.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `productId` | integer | yes | The product ID |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with[]` | array<string> | no | Additional relations (e.g., product_menu) |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "product": {
    "ID": 123,
    "post_title": "Developer Toolkit Pro",
    "post_status": "publish",
    "post_excerpt": "Professional developer tools for building modern applications.",
    "post_content": "A comprehensive developer toolkit with API access, code generators, and premium support.",
    "post_date": "2025-03-15 10:00:00",
    "post_modified": "2025-09-01 15:30:00",
    "post_name": "developer-toolkit-pro",
    "featured_image_id": 201,
    "view_url": "https://example.com/product/developer-toolkit-pro",
    "edit_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/products/123",
    "thumbnail": "https://example.com/wp-content/uploads/2025/03/dev-toolkit.png",
    "detail": {
      "id": 89,
      "post_id": 123,
      "fulfillment_type": "digital",
      "min_price": 4900,
      "max_price": 19900,
      "default_variation_id": 456,
      "variation_type": "multi",
      "stock_availability": "in-stock",
      "manage_stock": 0,
      "manage_downloadable": 1,
      "formatted_min_price": "$49.00",
      "formatted_max_price": "$199.00",
      "other_info": {
        "group_pricing_by": "payment_type",
        "sold_individually": "no",
        "use_pricing_table": "yes"
      }
    },
    "variants": [
      {
        "id": 456,
        "post_id": 123,
        "serial_index": 0,
        "variation_title": "Personal License",
        "variation_identifier": "personal",
        "sku": "DTK-PERSONAL",
        "payment_type": "onetime",
        "item_price": 4900,
        "item_cost": 0,
        "compare_price": 6900,
        "item_status": "active",
        "manage_stock": 0,
        "stock_status": "in-stock",
        "fulfillment_type": "digital",
        "downloadable": 1,
        "sold_individually": 1,
        "other_info": {
          "payment_type": "onetime",
          "description": "For individual developers"
        },
        "media": [],
        "thumbnail": null
      },
      {
        "id": 457,
        "post_id": 123,
        "serial_index": 1,
        "variation_title": "Business License - Annual",
        "variation_identifier": "business-annual",
        "sku": "DTK-BIZ-ANNUAL",
        "payment_type": "subscription",
        "item_price": 9900,
        "item_cost": 0,
        "compare_price": 14900,
        "item_status": "active",
        "manage_stock": 0,
        "stock_status": "in-stock",
        "fulfillment_type": "digital",
        "downloadable": 1,
        "sold_individually": 1,
        "other_info": {
          "payment_type": "subscription",
          "billing_interval": "yearly",
          "trial_days": 14,
          "signup_fee": 0,
          "bill_times": 0,
          "description": "For teams and businesses"
        },
        "media": [],
        "thumbnail": null
      }
    ],
    "downloadable_files": [
      {
        "id": 30,
        "post_id": 123,
        "variant_id": 456,
        "title": "Developer Toolkit Pro v2.5.zip",
        "file_source": "local",
        "file_url": "https://example.com/wp-content/uploads/fluent-cart/dev-toolkit-pro-2.5.zip",
        "file_hash": "abc123def456",
        "download_limit": -1,
        "created_at": "2025-09-01 12:00:00"
      }
    ]
  },
  "product_menu": "pricing",
  "taxonomies": [
    {
      "name": "product-categories",
      "label": "Product Categories",
      "terms": [
        {
          "term_id": 10,
          "name": "Software",
          "slug": "software",
          "taxonomy": "fluent_cart_category"
        }
      ],
      "labels": {
        "name": "Product Categories",
        "singular_name": "Product Category",
        "add_new_item": "Add New Product Category"
      }
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/{productId}/related-products`

**GET Get Related Products**

Retrieve products related to a given product based on shared categories or brands.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `productId` | integer | yes | The product ID |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `related_by_categories` | boolean | no | Include products from same categories |
| `related_by_brands` | boolean | no | Include products from same brands |
| `order_by` | string | no | Sort order (default: title_asc) |
| `posts_per_page` | integer | no | Number of related products to return (default: 6) |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "products": [
    {
      "ID": 124,
      "post_title": "Code Generator Plugin",
      "post_status": "publish",
      "post_type": "fluent-products",
      "post_name": "code-generator-plugin",
      "post_excerpt": "Automatically generate boilerplate code for your projects.",
      "thumbnail": "https://example.com/wp-content/uploads/2025/04/code-gen.png",
      "view_url": "https://example.com/product/code-generator-plugin",
      "detail": {
        "id": 90,
        "post_id": 124,
        "fulfillment_type": "digital",
        "min_price": 2900,
        "max_price": 2900,
        "formatted_min_price": "$29.00",
        "formatted_max_price": "$29.00"
      }
    },
    {
      "ID": 125,
      "post_title": "API Testing Suite",
      "post_status": "publish",
      "post_type": "fluent-products",
      "post_name": "api-testing-suite",
      "post_excerpt": "Comprehensive API testing and monitoring tools.",
      "thumbnail": "https://example.com/wp-content/uploads/2025/05/api-test.png",
      "view_url": "https://example.com/product/api-testing-suite",
      "detail": {
        "id": 92,
        "post_id": 125,
        "fulfillment_type": "digital",
        "min_price": 3900,
        "max_price": 7900,
        "formatted_min_price": "$39.00",
        "formatted_max_price": "$79.00"
      }
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/{id}/upgrade-paths`

**GET Get Upgrade Settings**

Retrieve all upgrade path configurations for a product.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The product ID |


**Responses**

- **200** — Successful response.

  Schema (`application/json`):

  - `data` (array<object>) — List of upgrade path meta records defined for the product's variants.
    - `id` (integer) — Meta record ID.
    - `object_type` (string) — Always `variant_upgrade` for upgrade path records.
    - `object_id` (string) — The source variant ID this upgrade path is attached to.
    - `meta_key` (string) — Always `variant_upgrade_path`.
    - `meta_value` (object)
      - `to_variants` (array<string>) — Variant IDs the source variant can upgrade to.
      - `is_prorate` (string) — Whether the upgrade is prorated (`"1"` or `"0"`).
      - `discount_amount` (string) — Discount amount applied on upgrade, in cents (as a numeric string).
    - `created_at` (string) — Creation timestamp (ISO 8601).
    - `updated_at` (string) — Last update timestamp (ISO 8601).

  Example:

```json
{
  "data": [
    {
      "id": 13,
      "object_type": "variant_upgrade",
      "object_id": "456",
      "meta_key": "variant_upgrade_path",
      "meta_value": {
        "to_variants": [
          "457",
          "458"
        ],
        "is_prorate": "1",
        "discount_amount": "500"
      },
      "created_at": "2025-10-14T22:20:09+00:00",
      "updated_at": "2025-10-14T22:20:09+00:00"
    },
    {
      "id": 14,
      "object_type": "variant_upgrade",
      "object_id": "457",
      "meta_key": "variant_upgrade_path",
      "meta_value": {
        "to_variants": [
          "458"
        ],
        "is_prorate": "1",
        "discount_amount": "0"
      },
      "created_at": "2025-10-14T22:20:31+00:00",
      "updated_at": "2025-10-14T22:20:31+00:00"
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/variation/{variantId}/upgrade-paths`

**GET Get Variation Upgrade Paths**

Retrieve available upgrade paths for a specific variation (used in customer-facing upgrade flows).

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `variantId` | integer | yes | The variation ID |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params[order_hash]` | string | yes | The order hash to determine applicable upgrades |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "upgradePaths": [
    {
      "id": 5,
      "from_variation_id": 456,
      "to_variation_id": 457,
      "title": "Upgrade to Business License",
      "prorate": true,
      "to_variation": {
        "id": 457,
        "variation_title": "Business License - Annual",
        "item_price": 9900,
        "payment_type": "subscription",
        "sku": "DTK-BIZ-ANNUAL"
      }
    },
    {
      "id": 6,
      "from_variation_id": 456,
      "to_variation_id": 458,
      "title": "Upgrade to Enterprise License",
      "prorate": true,
      "to_variation": {
        "id": 458,
        "variation_title": "Enterprise License",
        "item_price": 19900,
        "payment_type": "onetime",
        "sku": "DTK-ENTERPRISE"
      }
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/variants`

**GET List All Variants**

Retrieve all product variations across all products (separate route group using VariantController).

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params` | object | no | Query parameters for filtering |


**Responses**

- **200** — Successful response.

  Schema (`application/json`):

  - array of object
    - `id` (integer)
    - `post_id` (integer)
    - `variation_title` (string)
    - `item_price` (integer)
    - `sku` (string)
    - `stock_status` (string)
    - `payment_type` (string)
    - `other_info` (object)
      - _(object)_

  Example:

```json
[
  {
    "id": 456,
    "post_id": 123,
    "variation_title": "Personal License",
    "variation_identifier": "personal",
    "item_price": 4900,
    "item_cost": 0,
    "compare_price": 6900,
    "sku": "DTK-PERSONAL",
    "stock_status": "in-stock",
    "payment_type": "onetime",
    "item_status": "active",
    "fulfillment_type": "digital",
    "other_info": {
      "payment_type": "onetime",
      "description": "For individual developers"
    }
  },
  {
    "id": 457,
    "post_id": 123,
    "variation_title": "Business License - Annual",
    "variation_identifier": "business-annual",
    "item_price": 9900,
    "item_cost": 0,
    "compare_price": 14900,
    "sku": "DTK-BIZ-ANNUAL",
    "stock_status": "in-stock",
    "payment_type": "subscription",
    "item_status": "active",
    "fulfillment_type": "digital",
    "other_info": {
      "payment_type": "subscription",
      "billing_interval": "yearly",
      "trial_days": 14,
      "signup_fee": 0,
      "bill_times": 0
    }
  }
]
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/variants`

**GET List Product Variations**

Retrieve a list of product variations.

**Required permissions:** all of `products/view`, `products/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `params` | object | no | Query parameters for filtering variations |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "variants": [
    {
      "id": 456,
      "post_id": 123,
      "serial_index": 0,
      "variation_title": "Personal License",
      "variation_identifier": "personal",
      "sku": "DTK-PERSONAL",
      "payment_type": "onetime",
      "item_price": 4900,
      "item_cost": 0,
      "compare_price": 6900,
      "item_status": "active",
      "manage_stock": 0,
      "stock_status": "in-stock",
      "total_stock": 0,
      "available": 0,
      "committed": 0,
      "on_hold": 0,
      "fulfillment_type": "digital",
      "downloadable": 1,
      "sold_individually": 1,
      "thumbnail": null
    },
    {
      "id": 457,
      "post_id": 123,
      "serial_index": 1,
      "variation_title": "Business License - Annual",
      "variation_identifier": "business-annual",
      "sku": "DTK-BIZ-ANNUAL",
      "payment_type": "subscription",
      "item_price": 9900,
      "item_cost": 0,
      "compare_price": 14900,
      "item_status": "active",
      "manage_stock": 0,
      "stock_status": "in-stock",
      "total_stock": 0,
      "available": 0,
      "committed": 0,
      "on_hold": 0,
      "fulfillment_type": "digital",
      "downloadable": 1,
      "sold_individually": 1,
      "thumbnail": null
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


- **403** — Authenticated, but the user lacks the required capability (`products/view, products/view`).

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

## GET `/products`

**GET List Products**

Retrieve a paginated list of products with filtering, sorting, and search capabilities.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search by product title, ID, or variation title |
| `per_page` | integer | no | Number of results per page |
| `page` | integer | no | Page number for pagination |
| `sort_by` | string | no | Column to sort by |
| `sort_type` | string | no | Sort direction: asc or desc |
| `active_view` | string | no | Filter tab |
| `filter_type` | string | no | Filter type |
| `with[]` | array<string> | no | Relations to eager load |
| `search_groups` | array<object> | no | Advanced filter groups for complex queries |


**Responses**

- **200** — Successful response. Returns a paginated list of products.

  Schema (`application/json`):

  - `products` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `first_page_url` (string) — URL of the first page.
    - `from` (integer) — Index of the first item on this page.
    - `last_page_url` (string) — URL of the last page.
    - `links` (array<object>) — Pagination links (previous, numbered pages, next).
      - `url` (string)
      - `label` (string)
      - `active` (boolean)
    - `next_page_url` (string) — URL of the next page.
    - `path` (string) — Base URL without the query string.
    - `prev_page_url` (string) — URL of the previous page.
    - `to` (integer) — Index of the last item on this page.
    - `data` (array<object>)
      - _(object)_

  Example:

```json
{
  "products": {
    "total": 50,
    "per_page": 10,
    "current_page": 1,
    "last_page": 5,
    "first_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/products/?page=1",
    "from": 1,
    "last_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/products/?page=5",
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/products/?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/products/?page=2",
        "label": "2",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/products/?page=2",
        "label": "pagination.next",
        "active": false
      }
    ],
    "next_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/products/?page=2",
    "path": "https://yoursite.com/wp-json/fluent-cart/v2/products",
    "prev_page_url": null,
    "to": 10,
    "data": [
      {
        "ID": 123,
        "post_title": "Developer Toolkit Pro",
        "post_status": "publish",
        "post_type": "fluent-products",
        "post_date": "2025-03-15 10:00:00",
        "post_modified": "2025-09-01 15:30:00",
        "post_name": "developer-toolkit-pro",
        "post_excerpt": "Professional developer tools for building modern applications.",
        "thumbnail": "https://example.com/wp-content/uploads/2025/03/dev-toolkit.png",
        "view_url": "https://example.com/product/developer-toolkit-pro",
        "edit_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/products/123",
        "detail": {
          "id": 89,
          "post_id": 123,
          "fulfillment_type": "digital",
          "min_price": 4900,
          "max_price": 19900,
          "default_variation_id": 456,
          "variation_type": "multi",
          "stock_availability": "in-stock",
          "formatted_min_price": "$49.00",
          "formatted_max_price": "$199.00"
        }
      },
      {
        "ID": 124,
        "post_title": "Cloud Hosting Starter",
        "post_status": "publish",
        "post_type": "fluent-products",
        "post_date": "2025-06-20 08:30:00",
        "post_modified": "2025-08-10 12:00:00",
        "post_name": "cloud-hosting-starter",
        "post_excerpt": "Affordable cloud hosting for small projects.",
        "thumbnail": null,
        "view_url": "https://example.com/product/cloud-hosting-starter",
        "edit_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/products/124",
        "detail": {
          "id": 90,
          "post_id": 124,
          "fulfillment_type": "digital",
          "min_price": 1900,
          "max_price": 4900,
          "default_variation_id": 460,
          "variation_type": "single",
          "stock_availability": "in-stock",
          "formatted_min_price": "$19.00",
          "formatted_max_price": "$49.00"
        }
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## POST `/products/{postId}/shipping-class/remove`

**POST Remove Shipping Class**

Remove the assigned shipping class from a product.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | integer | yes | The product post ID |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Shipping Class removed successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/{postId}/tax-class/remove`

**POST Remove Tax Class**

Remove the assigned tax class from a product.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | integer | yes | The product post ID |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Tax Class removed successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/save-bundle-info/{variationId}`

**POST Save Bundle Info**

Save bundle child variant IDs for a variation. Bundle products cannot be added as children of other bundles.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `variationId` | integer | yes | The variation ID to configure as a bundle |


**Request body** (`application/json`, required)

- `bundle_child_ids` (array<integer>) **required** — Array of child variation IDs

Example:

```json
{
  "bundle_child_ids": [
    101,
    102,
    103
  ]
}
```


**Responses**

- **200** — Successful response.

  Schema (`application/json`):

  - array of boolean

  Example:

```json
[
  true
]
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/{product_id}/integrations`

**POST Save Product Integration**

Create or update an integration feed for a product.

**Also used by the integrations UI.** Create a new product-level integration feed or update an existing one. Validates required fields and associates the feed with the specified product.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `product_id` | integer | yes | The product ID |


**Request body** (`application/json`, required)

- `integration_name` (string) **required** — Integration provider name
- `integration_id` (integer) — Existing feed ID (for updates)
- `integration` (string) **required** — JSON-encoded integration settings object

Example:

```json
{
  "integration_name": "fluentcrm",
  "integration": "{\"name\":\"Add to List\",\"list_id\":1,\"enabled\":\"yes\"}"
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Integration has been successfully saved",
  "integration_id": 10,
  "integration_name": "fluentcrm",
  "created": true,
  "feedData": {
    "id": 10,
    "name": "Add to List",
    "list_id": 1,
    "tag_ids": [
      5,
      8
    ],
    "conditional_variation_ids": [],
    "enabled": "yes",
    "provider": "fluentcrm",
    "scope": "product"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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


- **404** — Product not found

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Product not found"
}
```


- **422** — Validation error

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "Please fill up the required fields:",
  "errors": {
    "name": "Feed Name is required."
  }
}
```



---

## POST `/products/{id}/upgrade-path`

**POST Save Upgrade Path**

Create a new upgrade path for a product.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The product ID |


**Request body** (`application/json`, required)

- `from_variant` (integer) **required** — Source variation ID (must exist in fct_product_variations)
- `to_variants` (array<integer>) **required** — Array of target variation IDs
- `discount_amount` (number) — Discount amount for the upgrade
- `title` (string) — Upgrade path title
- `description` (string) — Upgrade path description
- `slug` (string) — Upgrade path slug

Example:

```json
{
  "from_variant": 456,
  "to_variants": [
    457,
    458
  ],
  "discount_amount": 500
}
```


**Responses**

- **200** — Successful response.

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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## GET `/products/search-product-variant-options`

**GET Search Product Variant Options**

Search for product variants suitable for selection (e.g., in order creation). Filters out out-of-stock items.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search term for product/variant title |
| `include_ids[]` | array<integer> | no | Variation IDs to always include in results |
| `scopes[]` | array<string> | no | Model scopes to apply |
| `subscription_status` | string | no | Use not_subscribable to exclude subscription variants |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "products": [
    {
      "value": "product_123",
      "label": "Developer Toolkit Pro",
      "children": [
        {
          "value": 456,
          "label": "Personal License - $49.00"
        },
        {
          "value": 457,
          "label": "Business License - Annual - $99.00/yr"
        }
      ]
    },
    {
      "value": "product_124",
      "label": "Code Generator Plugin",
      "children": [
        {
          "value": 460,
          "label": "Single Site License - $29.00"
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/searchProductByName`

**GET Search Products by Name**

Search for published products by name. Returns products formatted for select dropdowns.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | no | Product name to search for |
| `url_mode` | string | no | URL mode flag |
| `termId` | integer | no | Filter by taxonomy term ID (product-categories) |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "products": {
    "current_page": 1,
    "data": [
      {
        "ID": 123,
        "post_title": "Developer Toolkit Pro",
        "thumbnail": "https://example.com/wp-content/uploads/2025/03/dev-toolkit-pro.png",
        "wp_terms": [
          {
            "term_id": 10,
            "name": "Software",
            "slug": "software",
            "taxonomy": "product-categories"
          }
        ],
        "detail": {
          "id": 1,
          "post_id": 123,
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
            "id": 501,
            "url": "https://example.com/wp-content/uploads/2025/03/dev-toolkit-pro.png",
            "title": "Developer Toolkit Pro icon"
          },
          "formatted_min_price": "$99.00",
          "formatted_max_price": "$2,198.00",
          "gallery_image": {
            "meta_id": "3001",
            "post_id": 123,
            "meta_key": "fluent-products-gallery-image",
            "meta_value": [
              {
                "id": 501,
                "url": "https://example.com/wp-content/uploads/2025/03/dev-toolkit-pro.png",
                "title": "Developer Toolkit Pro icon"
              }
            ]
          }
        }
      },
      {
        "ID": 124,
        "post_title": "Code Generator Plugin",
        "thumbnail": "https://example.com/wp-content/uploads/2025/04/code-generator-plugin.png",
        "wp_terms": [
          {
            "term_id": 11,
            "name": "Developer Tools",
            "slug": "developer-tools",
            "taxonomy": "product-categories"
          }
        ],
        "detail": {
          "id": 2,
          "post_id": 124,
          "fulfillment_type": "digital",
          "min_price": "4900",
          "max_price": "14900",
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
            "id": 502,
            "url": "https://example.com/wp-content/uploads/2025/04/code-generator-plugin.png",
            "title": "Code Generator Plugin icon"
          },
          "formatted_min_price": "$49.00",
          "formatted_max_price": "$149.00",
          "gallery_image": {
            "meta_id": "3002",
            "post_id": 124,
            "meta_key": "fluent-products-gallery-image",
            "meta_value": [
              {
                "id": 502,
                "url": "https://example.com/wp-content/uploads/2025/04/code-generator-plugin.png",
                "title": "Code Generator Plugin icon"
              }
            ]
          }
        }
      }
    ],
    "first_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/products/searchProductByName/?current_page=1",
    "from": 1,
    "next_page_url": null,
    "path": "https://yoursite.com/wp-json/fluent-cart/v2/products/searchProductByName",
    "per_page": 10,
    "prev_page_url": null,
    "to": 2
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## GET `/products/searchVariantByName`

**GET Search Variants by Name**

Search for published product variants by name. Returns a hierarchical product > variants structure.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `name` | string | no | Product/variant name to search |
| `search` | string | no | Alternative search parameter (used if name is empty) |
| `ids[]` | array<integer> | no | Array of product IDs to include |


**Responses**

- **200** — Successful response.

  Schema (`application/json`):

  - array of object
    - `value` (integer)
    - `label` (string)
    - `children` (array<object>)
      - `value` (integer)
      - `label` (string)

  Example:

```json
[
  {
    "value": 123,
    "label": "Developer Toolkit Pro",
    "children": [
      {
        "value": 456,
        "label": "Personal License ($49.00)"
      },
      {
        "value": 457,
        "label": "Business License - Annual ($99.00/yr)"
      }
    ]
  },
  {
    "value": 124,
    "label": "Code Generator Plugin",
    "children": [
      {
        "value": 460,
        "label": "Single Site License ($29.00)"
      }
    ]
  }
]
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## POST `/products/variants/{variantId}/setMedia`

**POST Set Variation Media**

Set media/images for a variation.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `variantId` | integer | yes | The variation ID |


**Request body** (`application/json`, required)

- `media` (array<object>) **required**
  - `id` (integer) **required** — WordPress attachment ID
  - `title` (string) — Image title
  - `url` (string) — Image URL

Example:

```json
{
  "media": [
    {
      "id": 101,
      "title": "Product Image",
      "url": "https://example.com/wp-content/uploads/product.jpg"
    }
  ]
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Media set successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## GET `/products/suggest-sku`

**GET Suggest SKU**

Generate a unique SKU suggestion based on product and variant titles.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `title` | string | yes | Product title to base SKU on |
| `variant_title` | string | no | Variant title to include in SKU |
| `exclude_id` | integer | no | Variation ID to exclude from uniqueness check |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "sku": "DEV-TOO-PER"
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


- **403** — Authenticated, but the user lacks the required capability (`products/view`).

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

## POST `/products/{postId}/sync-downloadable-files`

**POST Sync Downloadable Files**

Attach multiple downloadable files to a product. Automatically enables the manage_downloadable flag.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | integer | yes | The product post ID |


**Request body** (`application/json`, required)

- `downloadable_files` (array<object>) **required**
  - `title` (string) **required** — File title (max 160 chars)
  - `type` (string) **required** — File type (max 100 chars)
  - `driver` (string) **required** — Storage driver (e.g., local, s3)
  - `file_name` (string) **required** — File name (max 185 chars)
  - `file_path` (string) **required** — File path (max 185 chars)
  - `file_url` (string) **required** — File URL (max 200 chars)
  - `bucket` (string) — Storage bucket name
  - `file_size` (string) — File size
  - `serial` (integer) — Display order serial
  - `product_variation_id` (array<integer>) — Variation IDs this file is associated with
  - `settings` (object)
    - `download_limit` (integer) — Maximum number of downloads allowed
    - `download_expiry` (integer) — Download expiry in days

Example:

```json
{
  "postId": 123,
  "downloadable_files": [
    {
      "title": "Software v1.0",
      "type": "zip",
      "driver": "local",
      "file_name": "software-v1.zip",
      "file_path": "software-v1.zip",
      "file_url": "software-v1.zip",
      "product_variation_id": [
        456
      ],
      "settings": {
        "download_limit": 5,
        "download_expiry": 365
      }
    }
  ]
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "downloadable_files": [
    {
      "id": 30,
      "post_id": 123,
      "title": "Software v1.0",
      "type": "zip",
      "driver": "local",
      "file_name": "software-v1.zip",
      "file_path": "software-v1.zip",
      "file_url": "https://example.com/wp-content/uploads/fluent-cart/software-v1.zip",
      "download_identifier": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "serial": 0,
      "product_variation_id": [
        456
      ],
      "settings": {
        "download_limit": 5,
        "download_expiry": 365
      },
      "created_at": "2025-09-01 12:00:00"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/sync-taxonomy-term/{postId}`

**POST Sync Taxonomy Terms**

Sync (replace) taxonomy terms for a product.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | integer | yes | The product post ID |


**Request body** (`application/json`, required)

- `taxonomy` (string) **required** — Taxonomy name (e.g., product-categories)
- `terms` (array<integer>) — Array of term IDs to sync

Example:

```json
{
  "taxonomy": "product-categories",
  "terms": [
    1,
    5,
    10
  ]
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Taxonomy terms synced successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## PUT `/products/{downloadableId}/update`

**PUT Update Downloadable File**

Update an existing downloadable file record.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `downloadableId` | integer | yes | The downloadable file ID |


**Request body** (`application/json`, required)

- `title` (string) **required** — File title (max 100 chars)
- `type` (string) **required** — File type (max 100 chars)
- `driver` (string) **required** — Storage driver (max 100 chars)
- `file_name` (string) **required** — File name (max 100 chars)
- `product_variation_id` (array<integer>) — Array of variation IDs
- `serial` (integer) — Display order serial
- `settings` (object)
  - `download_limit` (integer) — Maximum downloads allowed
  - `download_expiry` (integer) — Download expiry in days

Example:

```json
{
  "title": "Software v2.0",
  "type": "zip",
  "driver": "local",
  "file_name": "software-v2.zip",
  "product_variation_id": [
    456,
    457
  ],
  "settings": {
    "download_limit": 10
  }
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Product downloadable files updated successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## PUT `/products/{postId}/update-inventory/{variantId}`

**PUT Update Inventory**

Update stock levels for a specific variant. Automatically updates stock status and product-level availability.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | integer | yes | The product post ID |
| `variantId` | integer | yes | The variant ID to update |


**Request body** (`application/json`, required)

- `total_stock` (integer) **required** — Total stock quantity
- `available` (integer) **required** — Available stock quantity

Example:

```json
{
  "total_stock": 100,
  "available": 80
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Inventory updated successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/{postId}/update-long-desc-editor-mode`

**POST Update Long Description Editor Mode**

Switch the long description editor between modes (e.g., visual, code).

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | integer | yes | The product post ID |


**Request body** (`application/json`, required)

- `active_editor` (string) **required** — The editor mode to set

Example:

```json
{
  "active_editor": "visual"
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Editor mode updated successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## PUT `/products/{postId}/update-manage-stock`

**PUT Update Manage Stock Setting**

Enable or disable stock management for a product and all its variants.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | integer | yes | The product post ID |


**Request body** (`application/json`, required)

- `manage_stock` (integer) **required** _(enum: `0`, `1`)_ — 1 to enable, 0 to disable stock management

Example:

```json
{
  "manage_stock": 1
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Manage stock updated successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/detail/{detailId}`

**POST Update Product Detail**

Update a product detail record (e.g., change variation type).

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `detailId` | integer | yes | The product detail ID |


**Request body** (`application/json`)

- `variation_type` (string) — New variation type (e.g., simple, simple_variations)
- `variation_ids` (array<integer>) — Array of variation IDs
- `action` (string) — Action to perform (default: change_variation_type)

Example:

```json
{
  "variation_type": "simple_variations",
  "action": "change_variation_type"
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Product detail updated successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/{postId}/pricing`

**POST Update Product Pricing**

Update a product's pricing, details, variants, and other metadata.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | integer | yes | The product post ID |


**Request body** (`application/json`, required)

- `post_title` (string) **required** — Product title (max 200 characters)
- `post_status` (string) **required** _(enum: `draft`, `publish`, `future`)_ — Product status
- `post_date` (string) — Required when post_status is future. Must be a future date (GMT)
- `post_excerpt` (string) — Product short description
- `post_content` (string) — Product long description (HTML allowed)
- `post_name` (string) — Product URL slug
- `comment_status` (string) — Comment status (max 100 chars)
- `detail` (object) **required**
  - `fulfillment_type` (string) **required** _(enum: `physical`, `digital`)_
  - `variation_type` (string) **required** _(enum: `simple`, `simple_variations`)_
  - `manage_stock` (integer) _(enum: `0`, `1`)_
  - `manage_downloadable` (integer) _(enum: `0`, `1`)_
  - `default_variation_id` (integer)
  - `stock_availability` (string)
  - `other_info` (object)
    - `group_pricing_by` (string) _(enum: `payment_type`, `repeat_interval`, `none`)_
    - `sold_individually` (string) _(enum: `yes`, `no`)_
    - `use_pricing_table` (string)
    - `shipping_class` (integer)
    - `tax_class` (integer)
    - `active_editor` (string)
- `variants` (array<object>)
  - `variation_title` (string)
  - `post_id` (integer)
  - `item_price` (number) — Price in cents (min: 0).
  - `compare_price` (number) — Compare-at price in cents.
  - `manage_cost` (string)
  - `item_cost` (number) — Item cost in cents (required if manage_cost is true).
  - `serial_index` (integer)
  - `sku` (string)
  - `fulfillment_type` (string)
  - `other_info` (object)
    - _(object)_
- `product_terms` (object) — Taxonomy term IDs
  - _(object)_
- `gallery` (array<object>)
  - _(object)_
- `metaValue` (any) — Additional metadata

Example:

```json
{
  "post_title": "Updated Product",
  "post_status": "publish",
  "detail": {
    "fulfillment_type": "digital",
    "variation_type": "simple"
  },
  "variants": [
    {
      "id": 789,
      "post_id": 123,
      "variation_title": "Default Plan",
      "item_price": 1999,
      "other_info": {
        "payment_type": "onetime"
      }
    }
  ]
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "data": {
    "ID": 123,
    "post_title": "Developer Toolkit Pro",
    "post_status": "publish",
    "post_name": "developer-toolkit-pro",
    "post_excerpt": "Professional developer tools for building modern applications.",
    "view_url": "https://example.com/product/developer-toolkit-pro",
    "edit_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/products/123",
    "detail": {
      "id": 89,
      "post_id": 123,
      "fulfillment_type": "digital",
      "min_price": 4900,
      "max_price": 19900,
      "default_variation_id": 456,
      "variation_type": "multi",
      "stock_availability": "in-stock",
      "manage_stock": 0,
      "manage_downloadable": 1,
      "formatted_min_price": "$49.00",
      "formatted_max_price": "$199.00"
    },
    "variants": [
      {
        "id": 456,
        "post_id": 123,
        "variation_title": "Personal License",
        "item_price": 4900,
        "compare_price": 6900,
        "sku": "DTK-PERSONAL",
        "stock_status": "in-stock",
        "payment_type": "onetime",
        "item_status": "active",
        "fulfillment_type": "digital"
      }
    ]
  },
  "message": "Product updated successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/{postId}/shipping-class`

**POST Update Shipping Class**

Assign a shipping class to a product.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | integer | yes | The product post ID |


**Request body** (`application/json`, required)

- `shipping_class` (integer) **required** — Shipping class ID

Example:

```json
{
  "shipping_class": 3
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Shipping Class updated successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/{postId}/tax-class`

**POST Update Tax Class**

Assign a tax class to a product.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | integer | yes | The product post ID |


**Request body** (`application/json`, required)

- `tax_class` (integer) **required** — Tax class ID

Example:

```json
{
  "tax_class": 5
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Tax Class updated successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/upgrade-path/{id}/update`

**POST Update Upgrade Path**

Update an existing upgrade path.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The upgrade path ID |


**Request body** (`application/json`, required)

- `from_variant` (integer) **required** — Source variation ID
- `to_variants` (array<integer>) **required** — Array of target variation IDs
- `discount_amount` (number) — Discount amount
- `title` (string) — Upgrade path title
- `description` (string) — Upgrade path description
- `slug` (string) — Upgrade path slug

Example:

```json
{
  "from_variant": 456,
  "to_variants": [
    458,
    459
  ],
  "discount_amount": 1000
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Settings updated successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/{postId}/update-variant-option`

**POST Update Variant Option**

Sync variant options for a product (used when managing product attribute variations).

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | integer | yes | The product post ID |


**Request body** (`application/json`, required)

- `variation_type` (string) **required** — The variation type
- `product_id` (integer) **required** — The product ID
- `options` (array<object>) **required** — Array of option objects with id and variants
  - _(object)_

Example:

```json
{
  "variation_type": "simple_variations",
  "product_id": 123,
  "options": [
    {
      "id": 1,
      "name": "License Type",
      "variants": [
        {
          "id": 456,
          "value": "Personal"
        },
        {
          "id": 457,
          "value": "Business"
        }
      ]
    }
  ]
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Variant options synced successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/variants/{variantId}`

**POST Update Variation**

Update an existing product variation.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `variantId` | integer | yes | The variation ID to update |


**Request body** (`application/json`, required)

- `variants` (object) **required**
  - `id` (integer)
  - `post_id` (integer)
  - `variation_title` (string)
  - `item_price` (number) — Price in cents (min: 0).
  - `compare_price` (number) — Compare-at price in cents.
  - `sku` (string)
  - `fulfillment_type` (string) _(enum: `physical`, `digital`)_
  - `total_stock` (integer)
  - `available` (integer)
  - `committed` (integer)
  - `on_hold` (integer)
  - `other_info` (object)
    - _(object)_

Example:

```json
{
  "variants": {
    "id": 460,
    "post_id": 123,
    "variation_title": "Pro Plan - Updated",
    "item_price": 3999,
    "fulfillment_type": "digital",
    "total_stock": 1,
    "available": 1,
    "committed": 0,
    "on_hold": 0,
    "other_info": {
      "payment_type": "onetime"
    }
  }
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "variant": {
    "id": 460,
    "post_id": 123,
    "serial_index": 0,
    "variation_title": "Pro Plan - Updated",
    "variation_identifier": "pro-plan-updated",
    "sku": "PRO-PLN",
    "payment_type": "onetime",
    "item_price": 3999,
    "item_cost": 0,
    "compare_price": 0,
    "item_status": "active",
    "manage_stock": 0,
    "stock_status": "in-stock",
    "total_stock": 0,
    "available": 0,
    "committed": 0,
    "on_hold": 0,
    "fulfillment_type": "digital",
    "downloadable": 0,
    "sold_individually": 0,
    "thumbnail": null
  },
  "message": "Variation updated successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## PUT `/products/variants/{variantId}/pricing-table`

**PUT Update Variation Pricing Table**

Update the pricing table description for a variation.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `variantId` | integer | yes | The variation ID |


**Request body** (`application/json`, required)

- `description` (string) **required** — Pricing table description text (newlines preserved)

Example:

```json
{
  "description": "Includes:\n- Feature A\n- Feature B\n- Priority Support"
}
```


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "message": "Pricing table updated successfully"
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


- **403** — Authenticated, but the user lacks the required capability (`products/edit`).

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

## POST `/products/variants/bulk-update`

**POST Bulk Update Product Variants**

Update price and status fields on multiple product variants in one request. All targeted variants must belong to the same product. Rows in the payload that target the same variant ID are merged (last field wins), the batch is applied inside a single locked transaction, and the `item_price` / `compare_price` relationship is enforced in both directions — raising `item_price` above an existing `compare_price` clears `compare_price`, and a `compare_price` below `item_price` is rejected back to 0. Up to 500 update rows are processed per request; additional rows are silently dropped. `item_price` and `compare_price` are submitted as cents (e.g. `2999` for $29.99), matching every other price field in the API — sending `29.99` creates a 29-cent price, not a $29.99 one.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `updates` (array<object>) **required** — Variant updates. Each row must include id plus at least one of item_price, compare_price, or item_status.
  - `id` (integer) **required** — Product variation ID.
  - `item_price` (number) — New price in cents (e.g. 2999 for $29.99).
  - `compare_price` (number) — New compare-at price in cents. Must be 0 or >= item_price.
  - `item_status` (string) _(enum: `active`, `inactive`)_ — New variant status.

Example:

```json
{
  "updates": [
    {
      "id": 501,
      "item_price": 2999,
      "compare_price": 3999,
      "item_status": "active"
    },
    {
      "id": 502,
      "item_price": 2499
    }
  ]
}
```


**Responses**

- **200** — Variants updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `updated` (integer)

  Example:

```json
{
  "message": "Variants updated successfully.",
  "updated": 2
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


- **404** — One or more variant IDs do not exist.

  Example:

```json
{
  "message": "One or more variant IDs do not exist."
}
```


- **422** — No updates provided, or the updates target variants across more than one product.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "All updates must target variants on the same product."
}
```



---

## POST `/products/variants/group-bulk-update`

**POST Group Bulk Update Variants**

Apply a partial (PATCH-style) update to a group of product variants at once. Any field left null or omitted in the payload is skipped for every variant in the group; only the provided non-null fields are written. For `other_info`, only the supplied non-null sub-keys are merged into each variant's existing JSON rather than replacing it outright. All variants in `variant_ids` must belong to the same product, and `sku` can only be set when exactly one variant is targeted (SKUs must stay unique).

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `variant_ids` (array<integer>) **required** — IDs of the variants to update. All must belong to the same product.
- `sku` (string) _(maxLength: 30)_ — New SKU. Only accepted when variant_ids contains exactly one ID. An empty string clears the SKU. Must be unique.
- `item_price` (number) — New sale price in cents, applied to every targeted variant.
- `compare_price` (number) — New compare-at price in cents. Ignored per-row if it would be less than the effective item_price for that row.
- `manage_stock` (integer) _(enum: `0`, `1`)_ — Whether to track stock for the targeted variants.
- `total_stock` (integer) — New total stock quantity.
- `fulfillment_type` (string) _(enum: `physical`, `digital`)_ — New fulfillment type.
- `manage_cost` (string) _(enum: `true`, `false`)_ — Whether to track cost of goods for the targeted variants.
- `item_cost` (number) — New cost of goods in cents.
- `other_info` (object) — Partial delta merged into each variant's existing other_info JSON (e.g. payment_type, repeat_interval, signup_fee). Only non-null sub-keys are applied. signup_fee, when present, is also in cents.
  - _(object)_

Example:

```json
{
  "variant_ids": [
    456,
    457
  ],
  "item_price": 8900,
  "manage_stock": 1,
  "total_stock": 50
}
```


**Responses**

- **200** — Variants updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `updated` (integer)

  Example:

```json
{
  "message": "2 variants updated successfully.",
  "updated": 2
}
```


- **401** — Authentication required.

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


- **403** — The current user lacks the products/edit permission.

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


- **404** — One or more variant IDs do not exist.

  Example:

```json
{
  "message": "One or more variant IDs do not exist."
}
```


- **422** — No valid variant IDs/updates provided, variants span more than one product, or a subscription variant is missing a billing interval.

  Example:

```json
{
  "message": "All variants must belong to the same product."
}
```



---

## POST `/products/{postId}/tax-exempt`

**POST Toggle Product Tax Exempt**

Set the tax-exempt flag and tax class for an entire product (stored on the product detail, not per-variant). If `tax_class` is omitted, the product's existing tax class (or `standard`) is kept. The resolved tax class ID (not the slug) is stored on the product.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `postId` | integer | yes | Product post ID |


**Request body** (`application/json`)

- `tax_exempt` (string) _(enum: `yes`, `no`)_ — Whether the product is exempt from tax. Defaults to 'no'.
- `tax_class` (string) — Slug of an existing tax class. Defaults to the product's current tax class, or 'standard'.

Example:

```json
{
  "tax_exempt": "yes",
  "tax_class": "standard"
}
```


**Responses**

- **200** — Product tax settings updated.

  Schema (`application/json`):

  - `message` (string)
  - `tax_exempt` (string)
  - `tax_class` (integer) — Resolved tax class ID
  - `tax_class_slug` (string)

  Example:

```json
{
  "message": "Product is now tax exempt",
  "tax_exempt": "yes",
  "tax_class": 1,
  "tax_class_slug": "standard"
}
```


- **400** — Product not found.

  Example:

```json
{
  "message": "Product not found"
}
```


- **401** — Authentication required.

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


- **403** — The current user lacks the products/edit permission.

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


- **422** — The supplied tax_class does not exist.

  Example:

```json
{
  "message": "Invalid tax class"
}
```



---

## POST `/products/variants/{variantId}/tax-exempt`

**POST Update Variant Tax Settings**

Set the tax-exempt flag and tax class for a single product variant. If `tax_class` is omitted, the variant's existing tax class (or `standard` if none is set) is kept. The supplied tax class must already exist.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `variantId` | integer | yes | Product variation ID |


**Request body** (`application/json`)

- `tax_exempt` (string) _(enum: `yes`, `no`)_ — Whether the variant is exempt from tax. Defaults to 'no'.
- `tax_class` (string) — Slug of an existing tax class. Defaults to the variant's current tax class, or 'standard'.

Example:

```json
{
  "tax_exempt": "yes",
  "tax_class": "standard"
}
```


**Responses**

- **200** — Variant tax settings updated.

  Schema (`application/json`):

  - `message` (string)
  - `tax_exempt` (string)
  - `tax_class` (string)
  - `tax_class_slug` (string)

  Example:

```json
{
  "message": "Variation is now tax exempt",
  "tax_exempt": "yes",
  "tax_class": "standard",
  "tax_class_slug": "standard"
}
```


- **400** — Variant not found.

  Example:

```json
{
  "message": "Variant not found"
}
```


- **401** — Authentication required.

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


- **403** — The current user lacks the products/edit permission.

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


- **422** — The supplied tax_class does not exist.

  Example:

```json
{
  "message": "Invalid tax class"
}
```



---
