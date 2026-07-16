# FluentCart API — Products

59 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [API index](./README.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/products/add-product-terms`

**POST Add Product Terms**

Create new taxonomy terms for products (categories, brands, etc.).

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



---

## GET `/products/bulk-edit-data`

**GET Bulk Edit Fetch**

Fetch products formatted for the bulk editing spreadsheet view.

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
      "post_status": "publish",
      "post_date": "2025-03-15 10:00:00",
      "detail": {
        "id": 89,
        "post_id": 123,
        "fulfillment_type": "digital",
        "min_price": 4900,
        "max_price": 19900,
        "variation_type": "multi",
        "formatted_min_price": "$49.00",
        "formatted_max_price": "$199.00"
      }
    },
    {
      "ID": 124,
      "post_title": "Cloud Hosting Starter",
      "post_status": "draft",
      "post_date": "2025-06-20 08:30:00",
      "detail": {
        "id": 90,
        "post_id": 124,
        "fulfillment_type": "digital",
        "min_price": 1900,
        "max_price": 4900,
        "variation_type": "single",
        "formatted_min_price": "$19.00",
        "formatted_max_price": "$49.00"
      }
    }
  ],
  "columns": [
    {
      "key": "post_title",
      "label": "Product Title",
      "editable": true
    },
    {
      "key": "post_status",
      "label": "Status",
      "editable": true
    },
    {
      "key": "fulfillment_type",
      "label": "Fulfillment",
      "editable": true
    }
  ]
}
```



---

## POST `/products/bulk-insert`

**POST Bulk Insert Products**

Insert multiple products at once. Maximum 10 products per request.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `products` (array<object>) **required** — Array of product data objects (max 10)
  - _(object)_

Example:

```json
{
  "products": [
    {
      "post_title": "Product A",
      "detail": {
        "fulfillment_type": "digital"
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



---

## POST `/products/bulk-update`

**POST Bulk Update Products**

Update multiple products at once from the bulk edit view. Maximum 10 products per request.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `products` (array<object>) **required** — Array of product data objects to update (max 10)
  - _(object)_

Example:

```json
{
  "products": [
    {
      "ID": 123,
      "post_title": "Updated Title A"
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



---

## POST `/products/{product_id}/integrations/feed/change-status`

**POST Change Integration Status**

Enable or disable a product integration feed.

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



---

## POST `/products/create-dummy`

**POST Create Dummy Products**

Create sample/demo products for testing or onboarding purposes.

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



---

## POST `/products`

**POST Create Product**

Create a new product. A default variation is automatically created with the product.

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



---

## POST `/products/variants`

**POST Create Variation**

Create a new product variation.

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



---

## DELETE `/products/{downloadableId}/delete`

**DELETE Delete Downloadable File**

Delete a downloadable file record.

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



---

## DELETE `/products/{product}`

**DELETE Delete Product**

Delete a product and all associated data.

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



---

## DELETE `/products/{product_id}/integrations/{integration_id}`

**DELETE Delete Product Integration**

Delete a product integration feed.

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



---

## POST `/products/delete-taxonomy-term/{postId}`

**POST Delete Taxonomy Term**

Remove a specific taxonomy term from a product.

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



---

## DELETE `/products/upgrade-path/{id}/delete`

**DELETE Delete Upgrade Path**

Delete an upgrade path.

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



---

## DELETE `/products/variants/{variantId}`

**DELETE Delete Variation**

Delete a product variation.

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



---

## POST `/products/do-bulk-action`

**POST Do Bulk Action**

Perform bulk actions on selected products (e.g., publish, draft, delete).

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



---

## POST `/products/{productId}/duplicate`

**POST Duplicate Product**

Duplicate a product with options to include or exclude certain settings. The new product is saved as a draft.

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



---

## GET `/products/fetchProductsByIds`

**GET Fetch Products by IDs**

Retrieve products by an array of IDs. Returns products with their detail relation.

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



---

## GET `/products/fetch-term`

**GET Fetch Taxonomy Terms**

Retrieve all registered taxonomies and their terms for product categorization.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response.

  Example:

```json
{
  "taxonomies": [
    {
      "name": "product-categories",
      "label": "Product Categories",
      "terms": [
        {
          "value": 10,
          "label": "Software",
          "children": [
            {
              "value": 11,
              "label": "Developer Tools",
              "children": []
            },
            {
              "value": 12,
              "label": "Plugins",
              "children": []
            }
          ]
        },
        {
          "value": 13,
          "label": "Templates",
          "children": []
        }
      ]
    },
    {
      "name": "product-brands",
      "label": "Product Brands",
      "terms": [
        {
          "value": 20,
          "label": "FluentWP",
          "children": []
        }
      ]
    }
  ]
}
```



---

## POST `/products/fetch-term-by-parent`

**POST Fetch Terms by Parent**

Retrieve taxonomy terms filtered by parent term IDs.

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



---

## GET `/products/fetchVariationsByIds`

**GET Fetch Variations by IDs**

Retrieve variations by an array of IDs. Returns simplified label/value pairs.

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



---

## GET `/products/findSubscriptionVariants`

**GET Find Subscription Variants**

Search for product variants that have a subscription payment type.

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



---

## GET `/products/get-bundle-info/{productId}`

**GET Get Bundle Info**

Retrieve bundle configuration information for a product, including child variant mappings.

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



---

## GET `/products/getDownloadableUrl/{downloadableId}`

**GET Get Downloadable URL**

Generate a temporary download URL for a downloadable file (valid for 7 days).

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



---

## GET `/products/get-max-excerpt-word-count`

**GET Get Max Excerpt Word Count**

Returns the maximum allowed word count for product excerpts (controlled by the WordPress excerpt_length filter).

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response.

  Example:

```json
{
  "count": 55
}
```



---

## GET `/products/{productId}/pricing-widgets`

**GET Get Pricing Widgets**

Retrieve sales overview widgets for a product (all-time, last 30 days, this month).

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



---

## GET `/products/{product}`

**GET Get Product**

Retrieve a single product by ID.

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

  Example:

```json
{
  "product": {
    "ID": 123,
    "post_title": "Developer Toolkit Pro",
    "post_status": "publish",
    "post_type": "fluent-products",
    "post_date": "2025-03-15 10:00:00",
    "post_modified": "2025-09-01 15:30:00",
    "post_name": "developer-toolkit-pro",
    "post_excerpt": "Professional developer tools for building modern applications.",
    "post_content": "A comprehensive developer toolkit with API access, code generators, and premium support.",
    "thumbnail": "https://example.com/wp-content/uploads/2025/03/dev-toolkit.png",
    "view_url": "https://example.com/product/developer-toolkit-pro",
    "edit_url": "https://example.com/wp-admin/admin.php?page=fluent-cart#/products/123"
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



---

## GET `/products/{productId}/integrations`

**GET Get Product Integration Feeds**

Retrieve all integration feeds configured for a product, along with available integrations.

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



---

## GET `/products/{product_id}/integrations/{integration_name}/settings`

**GET Get Product Integration Settings**

Retrieve settings for a specific integration type on a product. Returns the integration form configuration, existing settings, and product variations.

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



---

## GET `/products/{productId}/pricing`

**GET Get Product Pricing**

Retrieve the full product details including pricing, variants, downloadable files, and taxonomy information.

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



---

## GET `/products/{productId}/related-products`

**GET Get Related Products**

Retrieve products related to a given product based on shared categories or brands.

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



---

## GET `/products/{id}/upgrade-paths`

**GET Get Upgrade Settings**

Retrieve all upgrade path configurations for a product.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The product ID |


**Responses**

- **200** — Successful response.

  Example:

```json
{
  "data": [
    {
      "id": 5,
      "product_id": 123,
      "from_variant": 456,
      "to_variants": [
        457,
        458
      ],
      "title": "Upgrade to Business License",
      "description": "Upgrade from Personal to Business for team access and priority support.",
      "slug": "upgrade-to-business",
      "discount_amount": 500,
      "from_variation": {
        "id": 456,
        "variation_title": "Personal License",
        "item_price": 4900
      },
      "to_variations": [
        {
          "id": 457,
          "variation_title": "Business License - Annual",
          "item_price": 9900
        },
        {
          "id": 458,
          "variation_title": "Enterprise License",
          "item_price": 19900
        }
      ]
    }
  ]
}
```



---

## GET `/products/variation/{variantId}/upgrade-paths`

**GET Get Variation Upgrade Paths**

Retrieve available upgrade paths for a specific variation (used in customer-facing upgrade flows).

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



---

## GET `/variants`

**GET List All Variants**

Retrieve all product variations across all products (separate route group using VariantController).

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



---

## GET `/products/variants`

**GET List Product Variations**

Retrieve a list of product variations.

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



---

## GET `/products`

**GET List Products**

Retrieve a paginated list of products with filtering, sorting, and search capabilities.

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



---

## POST `/products/{postId}/shipping-class/remove`

**POST Remove Shipping Class**

Remove the assigned shipping class from a product.

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



---

## POST `/products/{postId}/tax-class/remove`

**POST Remove Tax Class**

Remove the assigned tax class from a product.

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



---

## POST `/products/save-bundle-info/{variationId}`

**POST Save Bundle Info**

Save bundle child variant IDs for a variation. Bundle products cannot be added as children of other bundles.

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



---

## POST `/products/{product_id}/integrations`

**POST Save Product Integration**

Create or update an integration feed for a product.

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



---

## POST `/products/{id}/upgrade-path`

**POST Save Upgrade Path**

Create a new upgrade path for a product.

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



---

## GET `/products/search-product-variant-options`

**GET Search Product Variant Options**

Search for product variants suitable for selection (e.g., in order creation). Filters out out-of-stock items.

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



---

## GET `/products/searchProductByName`

**GET Search Products by Name**

Search for published products by name. Returns products formatted for select dropdowns.

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
  "products": [
    {
      "ID": 123,
      "post_title": "Developer Toolkit Pro",
      "post_status": "publish",
      "post_name": "developer-toolkit-pro",
      "thumbnail": "https://example.com/wp-content/uploads/2025/03/dev-toolkit.png",
      "wpTerms": [
        {
          "term_id": 10,
          "name": "Software",
          "slug": "software",
          "taxonomy": "fluent_cart_category"
        }
      ]
    },
    {
      "ID": 124,
      "post_title": "Code Generator Plugin",
      "post_status": "publish",
      "post_name": "code-generator-plugin",
      "thumbnail": "https://example.com/wp-content/uploads/2025/04/code-gen.png",
      "wpTerms": [
        {
          "term_id": 11,
          "name": "Developer Tools",
          "slug": "developer-tools",
          "taxonomy": "fluent_cart_category"
        }
      ]
    }
  ]
}
```



---

## GET `/products/searchVariantByName`

**GET Search Variants by Name**

Search for published product variants by name. Returns a hierarchical product > variants structure.

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



---

## POST `/products/variants/{variantId}/setMedia`

**POST Set Variation Media**

Set media/images for a variation.

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



---

## GET `/products/suggest-sku`

**GET Suggest SKU**

Generate a unique SKU suggestion based on product and variant titles.

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



---

## POST `/products/{postId}/sync-downloadable-files`

**POST Sync Downloadable Files**

Attach multiple downloadable files to a product. Automatically enables the manage_downloadable flag.

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



---

## POST `/products/sync-taxonomy-term/{postId}`

**POST Sync Taxonomy Terms**

Sync (replace) taxonomy terms for a product.

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



---

## PUT `/products/{downloadableId}/update`

**PUT Update Downloadable File**

Update an existing downloadable file record.

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



---

## PUT `/products/{postId}/update-inventory/{variantId}`

**PUT Update Inventory**

Update stock levels for a specific variant. Automatically updates stock status and product-level availability.

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



---

## POST `/products/{postId}/update-long-desc-editor-mode`

**POST Update Long Description Editor Mode**

Switch the long description editor between modes (e.g., visual, code).

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



---

## PUT `/products/{postId}/update-manage-stock`

**PUT Update Manage Stock Setting**

Enable or disable stock management for a product and all its variants.

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



---

## POST `/products/detail/{detailId}`

**POST Update Product Detail**

Update a product detail record (e.g., change variation type).

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



---

## POST `/products/{postId}/pricing`

**POST Update Product Pricing**

Update a product's pricing, details, variants, and other metadata.

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
  - `item_price` (number)
  - `compare_price` (number)
  - `manage_cost` (string)
  - `item_cost` (number)
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



---

## POST `/products/{postId}/shipping-class`

**POST Update Shipping Class**

Assign a shipping class to a product.

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



---

## POST `/products/{postId}/tax-class`

**POST Update Tax Class**

Assign a tax class to a product.

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



---

## POST `/products/upgrade-path/{id}/update`

**POST Update Upgrade Path**

Update an existing upgrade path.

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



---

## POST `/products/{postId}/update-variant-option`

**POST Update Variant Option**

Sync variant options for a product (used when managing product attribute variations).

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



---

## POST `/products/variants/{variantId}`

**POST Update Variation**

Update an existing product variation.

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
  - `item_price` (number)
  - `compare_price` (number)
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



---

## PUT `/products/variants/{variantId}/pricing-table`

**PUT Update Variation Pricing Table**

Update the pricing table description for a variation.

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



---
