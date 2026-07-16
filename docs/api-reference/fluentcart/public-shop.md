# FluentCart API — Public Shop

3 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## GET `/public/product-views`

**GET Get Product Views**

Retrieve server-rendered HTML views of product listings. Used by Gutenberg blocks and shortcodes for AJAX-powered product grids.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of products per page |
| `current_page` | integer | no | Current page number |
| `template_provider` | string | no | Template provider identifier for custom rendering |
| `client_id` | string | no | Client identifier used to retrieve cached block markup from transients |
| `order_type` | string | no | Sort direction |
| `filters[sort_by]` | string | no | Sort preset |
| `filters[wildcard]` | string | no | Search by product title |
| `filters[price_range_from]` | number | no | Minimum price filter in decimal |
| `filters[price_range_to]` | number | no | Maximum price filter in decimal |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `products` (object)
    - `views` (string) — Server-rendered HTML of product listings
    - `current_page` (integer)
    - `last_page` (integer)
    - `total` (integer)
    - `per_page` (integer)
    - `from` (integer)
    - `to` (integer)

  Example:

```json
{
  "products": {
    "views": "<div class=\"fct-product-card\">...rendered HTML...</div>",
    "current_page": 1,
    "last_page": 3,
    "total": 24,
    "per_page": 10,
    "from": 1,
    "to": 10
  }
}
```



---

## GET `/public/products`

**GET List Products**

Retrieve a paginated list of published products with optional filtering by taxonomy terms, price range, product type, and more. Only products with publish status are returned.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of products per page |
| `current_page` | integer | no | Page number for offset-based pagination |
| `cursor` | string | no | Cursor token for cursor-based pagination |
| `paginate_using` | string | no | Pagination strategy: cursor for cursor-based, omit for offset-based |
| `order_type` | string | no | Sort direction |
| `with[]` | array<string> | no | Relations to eager load (e.g., detail) |
| `allow_out_of_stock` | boolean | no | Include out-of-stock products |
| `include_ids[]` | array<integer> | no | Only return products with these IDs (max 100 IDs) |
| `exclude_ids[]` | array<integer> | no | Exclude products with these IDs (max 100 IDs) |
| `product_type` | string | no | Filter by product type |
| `on_sale` | boolean | no | Only return products currently on sale |
| `filters[wildcard]` | string | no | Search by product title |
| `filters[sort_by]` | string | no | Sort preset |
| `filters[price_range_from]` | number | no | Minimum price filter in decimal (e.g., 10.00) |
| `filters[price_range_to]` | number | no | Maximum price filter in decimal (e.g., 99.99) |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `products` (object)
    - `products` (object)
      - `total` (integer)
      - `per_page` (integer)
      - `current_page` (integer)
      - `last_page` (integer)
      - `data` (array<PublicProduct>)
    - `total` (integer)

  Example:

```json
{
  "products": {
    "products": {
      "total": 24,
      "per_page": 10,
      "current_page": 1,
      "last_page": 3,
      "data": [
        {
          "ID": 42,
          "post_title": "Premium T-Shirt",
          "post_status": "publish",
          "post_excerpt": "High-quality cotton t-shirt",
          "guid": "https://example.com/?p=42",
          "view_url": "https://example.com/product/premium-t-shirt",
          "has_subscription": false,
          "thumbnail": "https://example.com/wp-content/uploads/tshirt.jpg",
          "detail": {
            "id": 15,
            "post_id": 42,
            "variation_type": "simple",
            "min_price": 2500,
            "max_price": 2500,
            "fulfillment_type": "physical"
          }
        }
      ]
    },
    "total": 24
  }
}
```



---

## GET `/public/product-search`

**GET Search Products**

Search for published products by title and return server-rendered HTML search result items. Designed for use with the storefront search bar component.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_title` | string | yes | The search query string to match against product titles |
| `url_mode` | string | no | URL mode passed to the SearchBarRenderer to control how product links are generated |
| `termId` | integer | no | Filter search results to products within a specific taxonomy term (category) ID |


**Responses**

- **200** — Successful response

  Schema (`application/json`):

  - `htmlView` (string) — Pre-rendered HTML for direct insertion into the search results dropdown

  Example:

```json
{
  "htmlView": "<div class=\"fct-search-result-item\"><a href=\"https://example.com/product/premium-t-shirt\">Premium T-Shirt</a></div>..."
}
```



---
