# FluentCart API — Labels & Attributes

15 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/options/attr/group`

**POST Create Attribute Group**

Create a new attribute group for product variations.

**Required permission:** `products/create`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- _$ref: CreateAttributeGroupRequest_

**Responses**

- **200** — Attribute group created successfully.

  Schema (`application/json`):

  - `data` (AttributeGroup)
  - `message` (string)

  Example:

```json
{
  "data": {
    "id": 3,
    "title": "Material",
    "slug": "material",
    "description": "Product material type",
    "settings": null,
    "created_at": "2025-01-15 12:00:00",
    "updated_at": "2025-01-15 12:00:00"
  },
  "message": "Successfully created!"
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


- **422** — Validation error - duplicate title or slug.

  Schema (`application/json`):

  - `errors` (object)
    - `title` (array<string>)
    - `slug` (array<string>)

  Example:

```json
{
  "errors": {
    "title": [
      "Group title can not be empty and must be unique."
    ],
    "slug": [
      "Group slug can not be empty and must be unique."
    ]
  }
}
```



---

## POST `/labels`

**POST Create Label**

Create a new label and optionally attach it to an entity (order, customer, etc.) in a single request.

**Required permission:** `labels/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- _$ref: CreateLabelRequest_

**Responses**

- **200** — Label created successfully.

  Schema (`application/json`):

  - `data` (Label)
  - `message` (string)

  Example:

```json
{
  "data": {
    "id": 4,
    "value": "Returning Customer"
  },
  "message": "Label created successfully!"
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


- **403** — Authenticated, but the user lacks the required capability (`labels/manage`).

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


- **422** — Validation error - duplicate label.

  Schema (`application/json`):

  - `errors` (object)
    - `value` (array<string>)

  Example:

```json
{
  "errors": {
    "value": [
      "Label must be unique."
    ]
  }
}
```



---

## DELETE `/options/attr/group/{group_id}`

**DELETE Delete Attribute Group**

Delete an attribute group. The group can only be deleted if none of its terms are currently in use by any product variations. Deleting a group also deletes all its terms.

**Required permission:** `products/delete`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group_id` | integer | yes | The attribute group ID to delete. |


**Responses**

- **200** — Attribute group deleted successfully.

  Schema (`application/json`):

  - `data` (string)
  - `message` (string)

  Example:

```json
{
  "data": "",
  "message": "Attribute group successfully deleted!"
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


- **403** — Group is in use by product variations.

  Schema (`application/json`):

  - `message` (string)
  - `code` (integer)

  Example:

```json
{
  "message": "This group is already in use, can not be deleted.",
  "code": 403
}
```


- **404** — Attribute group not found.

  Schema (`application/json`):

  - `message` (string)
  - `code` (integer)

  Example:

```json
{
  "message": "Attribute group not found in database, failed to remove.",
  "code": 404
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

## DELETE `/options/attr/group/{group_id}/term/{term_id}`

**DELETE Delete Attribute Term**

Delete an attribute term. The term can only be deleted if it is not currently in use by any product variations.

**Required permission:** `products/delete`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group_id` | integer | yes | The attribute group ID. |
| `term_id` | integer | yes | The term ID to delete. |


**Responses**

- **200** — Attribute term deleted successfully.

  Schema (`application/json`):

  - `data` (string)
  - `message` (string)

  Example:

```json
{
  "data": "",
  "message": "Attribute term successfully deleted!"
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


- **403** — Term is in use by product variations.

  Schema (`application/json`):

  - `message` (string)
  - `code` (integer)

  Example:

```json
{
  "message": "This term is already in use, can not be deleted.",
  "code": 403
}
```


- **404** — Term not found or group mismatch.

  Schema (`application/json`):

  - `message` (string)
  - `code` (integer)

  Example:

```json
{
  "message": "Term not found in database, failed to remove.",
  "code": 404
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

## GET `/options/attr/group/{group_id}`

**GET Get Attribute Group**

Retrieve a single attribute group by ID, optionally with its terms.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group_id` | integer | yes | The attribute group ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with[]` | array<string> | no | Relations to eager load. Supported: `terms`. |


**Responses**

- **200** — Successful response. Returns the attribute group with optional terms.

  Schema (`application/json`):

  - `group` (AttributeGroupWithTerms)

  Example:

```json
{
  "group": {
    "id": 1,
    "title": "Color",
    "slug": "color",
    "description": "Product color options",
    "settings": null,
    "created_at": "2025-01-10 08:30:00",
    "updated_at": "2025-01-10 08:30:00",
    "terms": [
      {
        "id": 1,
        "group_id": 1,
        "title": "Red",
        "slug": "red",
        "serial": 1,
        "description": null,
        "settings": null
      },
      {
        "id": 2,
        "group_id": 1,
        "title": "Blue",
        "slug": "blue",
        "serial": 2,
        "description": null,
        "settings": null
      }
    ],
    "is_system": false,
    "serial": "1"
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

## GET `/options/attr/groups`

**GET List Attribute Groups**

Retrieve a paginated list of attribute groups with optional search, filtering, and sorting. Attribute groups represent product attribute categories (e.g., Color, Size, Material) used to create product variations.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | object | no | Search criteria. Each key is a column name with `column`, `operator`, and `value` fields. Searchable columns: `title`, `slug`. |
| `filters` | object | no | Filter criteria. Same format as `search`. Supports `terms_count` with comparison operators. |
| `with[]` | array<string> | no | Relations to eager load (e.g., `terms`). |
| `order_by` | string | no | Column to sort by: `title`, `id`, `slug`, `created_at` (default: `title`). |
| `order_type` | string | no | Sort direction: `ASC` or `DESC` (default: `ASC`). |
| `per_page` | integer | no | Number of results per page (default: `10`). |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Successful response. Returns paginated attribute groups.

  Schema (`application/json`):

  - `groups` (object)
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
    - `data` (array<AttributeGroup>)

  Example:

```json
{
  "groups": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1,
    "first_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/options/attr/groups/?page=1",
    "from": 1,
    "last_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/options/attr/groups/?page=1",
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/options/attr/groups/?page=1",
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
    "path": "https://yoursite.com/wp-json/fluent-cart/v2/options/attr/groups",
    "prev_page_url": null,
    "to": 3,
    "data": [
      {
        "id": 1,
        "title": "Color",
        "slug": "color",
        "description": "Product color options",
        "settings": null,
        "created_at": "2025-01-10 08:30:00",
        "updated_at": "2025-01-10 08:30:00",
        "terms_count": 5
      },
      {
        "id": 2,
        "title": "Size",
        "slug": "size",
        "description": "Product size options",
        "settings": null,
        "created_at": "2025-01-10 08:35:00",
        "updated_at": "2025-01-10 08:35:00",
        "terms_count": 4
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

## GET `/options/attr/group/{group_id}/terms`

**GET List Attribute Terms**

Retrieve a paginated list of terms for a specific attribute group. Attribute terms are the individual values within an attribute group (e.g., "Red", "Blue", "Green" within the "Color" group).

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group_id` | integer | yes | The attribute group ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | object | no | Search criteria. Each key is a column name with `column`, `operator`, and `value` fields. Searchable columns: `title`, `slug`. |
| `filters` | object | no | Filter criteria. Same format as `search`. Filterable columns: `group_id`, `serial`, `title`, `slug`, `description`, `settings`. |
| `order_by` | string | no | Column to sort by: `id`, `title`, `slug`, `serial`, `created_at` (default: `serial`). |
| `order_type` | string | no | Sort direction: `ASC` or `DESC` (default: `ASC`). |
| `per_page` | integer | no | Number of results per page (default: `15`). |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Successful response. Returns paginated attribute terms.

  Schema (`application/json`):

  - `terms` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `data` (array<AttributeTerm>)
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
  "terms": {
    "total": 5,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "data": [
      {
        "id": 1,
        "group_id": 1,
        "serial": 1,
        "title": "Red",
        "slug": "red",
        "description": null,
        "settings": null,
        "created_at": "2025-01-10 08:30:00",
        "updated_at": "2025-01-10 08:30:00"
      },
      {
        "id": 2,
        "group_id": 1,
        "serial": 2,
        "title": "Blue",
        "slug": "blue",
        "description": null,
        "settings": null,
        "created_at": "2025-01-10 08:35:00",
        "updated_at": "2025-01-10 08:35:00"
      }
    ],
    "first_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/options/attr/group/1/terms/?page=1",
    "from": 1,
    "last_page_url": "https://yoursite.com/wp-json/fluent-cart/v2/options/attr/group/1/terms/?page=1",
    "links": [
      {
        "url": null,
        "label": "pagination.previous",
        "active": false
      },
      {
        "url": "https://yoursite.com/wp-json/fluent-cart/v2/options/attr/group/1/terms/?page=1",
        "label": "1",
        "active": true
      }
    ],
    "next_page_url": null,
    "path": "https://yoursite.com/wp-json/fluent-cart/v2/options/attr/group/1/terms",
    "prev_page_url": null,
    "to": 5
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

## GET `/labels`

**GET List Labels**

Retrieve all available labels. Labels are tags that can be attached to orders, customers, or other entities for organizational purposes.

**Required permission:** `labels/view`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns all labels.

  Schema (`application/json`):

  - `labels` (array<Label>)

  Example:

```json
{
  "labels": [
    {
      "id": 1,
      "value": "VIP",
      "created_at": "2026-05-10T09:12:00+00:00",
      "updated_at": "2026-05-10T09:12:00+00:00"
    },
    {
      "id": 2,
      "value": "Wholesale",
      "created_at": "2026-05-12T14:20:00+00:00",
      "updated_at": "2026-05-12T14:20:00+00:00"
    },
    {
      "id": 3,
      "value": "Priority",
      "created_at": "2026-05-15T08:05:00+00:00",
      "updated_at": "2026-05-15T08:05:00+00:00"
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


- **403** — Authenticated, but the user lacks the required capability (`labels/view`).

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

## PUT `/options/attr/group/{group_id}`

**PUT Update Attribute Group**

Update an existing attribute group.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group_id` | integer | yes | The attribute group ID. |


**Request body** (`application/json`, required)

- _$ref: UpdateAttributeGroupRequest_

**Responses**

- **200** — Attribute group updated successfully.

  Schema (`application/json`):

  - `data` (boolean)
  - `message` (string)

  Example:

```json
{
  "data": true,
  "message": "Group updated successfully!"
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


- **422** — Validation error - duplicate title or slug.

  Schema (`application/json`):

  - `errors` (object)
    - `title` (array<string>)

  Example:

```json
{
  "errors": {
    "title": [
      "Group title can not be empty and must be unique."
    ]
  }
}
```



---

## POST `/options/attr/group/{group_id}/term/{term_id}`

**POST Update Attribute Term**

Update an existing attribute term.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group_id` | integer | yes | The attribute group ID. |
| `term_id` | integer | yes | The term ID to update. |


**Request body** (`application/json`, required)

- _$ref: UpdateAttributeTermRequest_

**Responses**

- **200** — Attribute term updated successfully.

  Schema (`application/json`):

  - `data` (boolean)
  - `message` (string)

  Example:

```json
{
  "data": true,
  "message": "Successfully updated!"
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


- **404** — Term not found or group mismatch.

  Schema (`application/json`):

  - `message` (string)
  - `code` (integer)

  Example:

```json
{
  "message": "Information mismatch.",
  "code": 404
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

## POST `/labels/update-label-selections`

**POST Update Label Selections**

Update the labels attached to a specific entity. This endpoint syncs the label assignments -- labels in `selectedLabels` are attached, and previously attached labels not in the list are detached.

**Required permission:** `labels/manage`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- _$ref: UpdateLabelSelectionsRequest_

**Responses**

- **200** — Labels updated successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Labels Updated Successfully"
}
```


- **400** — Failed to update labels.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Failed To Update Labels"
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


- **403** — Authenticated, but the user lacks the required capability (`labels/manage`).

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

## POST `/options/attr/group/{group_id}/terms`

**POST Create Attribute Terms**

Create up to 10 terms at once inside an attribute group (e.g. add "Red", "Blue" to a "Color" group). Term slugs are unique per group, not globally — the same term title can exist in two different groups. If the group's type is "color", every term requires a valid hex `settings.color`; if it is "image", every term requires a `settings.image` URL.

**Required permission:** `products/create`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group_id` | integer | yes | ID of the attribute group to add terms to. |


**Request body** (`application/json`, required)

- `terms` (array<object>) **required** — 1-10 terms to create.
  - `title` (string) **required** _(maxLength: 50)_ — Term title.
  - `settings` (object) — Required shape depends on the group's type.
    - `color` (string) — Required hex color (#rgb or #rrggbb) for color-type groups.
    - `image` (string) _(format: uri)_ — Required image URL for image-type groups.

Example:

```json
{
  "terms": [
    {
      "title": "Red",
      "settings": {
        "color": "#e53e3e"
      }
    },
    {
      "title": "Blue",
      "settings": {
        "color": "#3182ce"
      }
    }
  ]
}
```


**Responses**

- **200** — Terms created successfully.

  Schema (`application/json`):

  - `data` (array<object>) — The created term records.
    - _(object)_

  Example:

```json
{
  "data": [
    {
      "id": 21,
      "group_id": 4,
      "title": "Red",
      "slug": "red",
      "settings": {
        "color": "#e53e3e"
      },
      "sort_order": 1,
      "created_at": "2026-01-12 09:15:00",
      "updated_at": "2026-01-12 09:15:00"
    },
    {
      "id": 22,
      "group_id": 4,
      "title": "Blue",
      "slug": "blue",
      "settings": {
        "color": "#3182ce"
      },
      "sort_order": 2,
      "created_at": "2026-01-12 09:15:00",
      "updated_at": "2026-01-12 09:15:00"
    }
  ]
}
```


- **401** — Unauthenticated.

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


- **403** — The authenticated user lacks the products/create permission.

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


- **422** — No terms supplied, more than 10 terms supplied, a term is missing its title, or a term is missing the color/image its group type requires.

  Example:

```json
{
  "message": "At least one term is required."
}
```



---

## GET `/options/attr/groups/library`

**GET Get Attribute Groups Library**

Return the attribute-groups library used by the Advanced Variation picker: up to 200 groups ordered by the merchant's manual drag-order, each annotated with a term count computed from a single batched aggregate. Terms are not eager-loaded here — call the group's terms endpoint to expand a specific group's full term list on demand.

**Required permission:** `products/view`

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns the attribute groups library.

  Schema (`application/json`):

  - `groups` (array<object>)
    - _(object)_
  - `total_groups` (integer)
  - `cap` (integer)

  Example:

```json
{
  "groups": [
    {
      "id": 10,
      "title": "Billing Period",
      "slug": "billing-period",
      "description": null,
      "settings": null,
      "created_at": "2026-06-15T15:14:49+00:00",
      "updated_at": "2026-06-15T15:14:49+00:00",
      "is_system": true,
      "serial": "1",
      "terms_count": 3
    },
    {
      "id": 1,
      "title": "Color",
      "slug": "color",
      "description": null,
      "settings": {
        "type": "color"
      },
      "created_at": "2026-06-15T15:14:49+00:00",
      "updated_at": "2026-06-15T15:14:49+00:00",
      "is_system": true,
      "serial": "2",
      "terms_count": 10
    }
  ],
  "total_groups": 12,
  "cap": 200
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

## POST `/options/attr/groups/reorder`

**POST Reorder Attribute Groups**

Persist the merchant's drag-reorder of attribute groups in the library. Submit group IDs in the desired display order; every ID must exist. Writes a dense, 1-indexed `serial` to each group. The list is capped at 500 IDs per request (filterable via `fluent_cart/attribute_groups/max_reorder`) — a reorder cannot be split into batches, so an oversized payload is rejected rather than truncated.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `ids` (array<integer>) **required** — Attribute group IDs in the desired display order. Non-positive and duplicate values are stripped before validation.

Example:

```json
{
  "ids": [
    10,
    1,
    3,
    7
  ]
}
```


**Responses**

- **200** — Groups reordered successfully.

  Schema (`application/json`):

  - `message` (string)
  - `data` (array<any>)

  Example:

```json
{
  "message": "Groups reordered.",
  "data": []
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


- **422** — No group IDs were provided, or the reorder list exceeds the maximum of 500 groups.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "No group IDs provided."
}
```



---

## POST `/options/attr/group/{group_id}/terms/reorder`

**POST Reorder Attribute Terms**

Persist the merchant's drag-reorder of attribute terms within one attribute group. Submit the term IDs in the desired display order; every ID must belong to the group given in the path. Writes a dense, 1-indexed `serial` to each term.

**Required permission:** `products/edit`

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group_id` | integer | yes | Attribute group ID that owns the terms being reordered. |


**Request body** (`application/json`, required)

- `ids` (array<integer>) **required** — Term IDs in the desired display order. Every ID must belong to the group in the path; an empty list or a list containing an ID from a different group is rejected.

Example:

```json
{
  "ids": [
    12,
    15,
    9
  ]
}
```


**Responses**

- **200** — Terms reordered successfully.

  Schema (`application/json`):

  - `message` (string)
  - `data` (array<any>)

  Example:

```json
{
  "message": "Terms reordered.",
  "data": []
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


- **422** — No term IDs were provided, or one or more term IDs do not belong to this group.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "One or more term IDs do not belong to this group."
}
```



---
