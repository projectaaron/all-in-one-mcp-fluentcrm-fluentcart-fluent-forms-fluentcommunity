# FluentCart API — Labels & Attributes

13 endpoints. Base URL: `https://{website}/wp-json/fluent-cart/v2`. See the [FluentCart overview](../fluentcart.md) for auth and the full group list.

_Generated from the FluentCart OpenAPI specs (dev.fluentcart.com)._

---

## POST `/options/attr/group/{group_id}/term/{term_id}/serial`

**POST Change Term Sort Order**

Move a term up or down in the sort order by incrementing or decrementing its `serial` value.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group_id` | integer | yes | The attribute group ID. |
| `term_id` | integer | yes | The term ID to reorder. |


**Request body** (`application/json`)

- _$ref: ChangeTermSortOrderRequest_

**Responses**

- **200** — Serial updated successfully. The `data` field contains the new serial value.

  Schema (`application/json`):

  - `data` (integer) — The new serial value after the change.
  - `message` (string)

  Example:

```json
{
  "data": 2,
  "message": "Serial updated."
}
```


- **404** — Term not found or group mismatch.

  Schema (`application/json`):

  - `message` (string)
  - `code` (integer)

  Example:

```json
{
  "message": "Info mismatch.",
  "code": 404
}
```



---

## POST `/options/attr/group`

**POST Create Attribute Group**

Create a new attribute group for product variations.

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

## POST `/options/attr/group/{group_id}/term`

**POST Create Attribute Term**

Create a new term within an attribute group.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `group_id` | integer | yes | The attribute group ID. |


**Request body** (`application/json`, required)

- _$ref: CreateAttributeTermRequest_

**Responses**

- **200** — Attribute term created successfully.

  Schema (`application/json`):

  - `data` (AttributeTerm)
  - `message` (string)

  Example:

```json
{
  "data": {
    "id": 6,
    "group_id": 1,
    "serial": 10,
    "title": "Green",
    "slug": "green",
    "description": null,
    "settings": null,
    "created_at": "2025-01-15 12:00:00",
    "updated_at": "2025-01-15 12:00:00"
  },
  "message": "Successfully created!"
}
```


- **404** — Attribute group not found.

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


- **422** — Validation error.

  Schema (`application/json`):

  - `errors` (object)
    - `title` (array<string>)
    - `slug` (array<string>)

  Example:

```json
{
  "errors": {
    "title": [
      "Title is required"
    ],
    "slug": [
      "Slug is required"
    ]
  }
}
```



---

## POST `/labels`

**POST Create Label**

Create a new label and optionally attach it to an entity (order, customer, etc.) in a single request.

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



---

## DELETE `/options/attr/group/{group_id}/term/{term_id}`

**DELETE Delete Attribute Term**

Delete an attribute term. The term can only be deleted if it is not currently in use by any product variations.

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



---

## GET `/options/attr/group/{group_id}`

**GET Get Attribute Group**

Retrieve a single attribute group by ID, optionally with its terms.

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
    ]
  }
}
```



---

## GET `/options/attr/groups`

**GET List Attribute Groups**

Retrieve a paginated list of attribute groups with optional search, filtering, and sorting. Attribute groups represent product attribute categories (e.g., Color, Size, Material) used to create product variations.

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
    - `data` (array<AttributeGroup>)

  Example:

```json
{
  "groups": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1,
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



---

## GET `/options/attr/group/{group_id}/terms`

**GET List Attribute Terms**

Retrieve a paginated list of terms for a specific attribute group. Attribute terms are the individual values within an attribute group (e.g., "Red", "Blue", "Green" within the "Color" group).

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
    ]
  }
}
```



---

## GET `/labels`

**GET List Labels**

Retrieve all available labels. Labels are tags that can be attached to orders, customers, or other entities for organizational purposes.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Successful response. Returns all labels.

  Schema (`application/json`):

  - `labels` (object)
    - `labels` (array<Label>)

  Example:

```json
{
  "labels": {
    "labels": [
      {
        "id": 1,
        "value": "VIP"
      },
      {
        "id": 2,
        "value": "Wholesale"
      },
      {
        "id": 3,
        "value": "Priority"
      }
    ]
  }
}
```



---

## PUT `/options/attr/group/{group_id}`

**PUT Update Attribute Group**

Update an existing attribute group.

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



---

## POST `/labels/update-label-selections`

**POST Update Label Selections**

Update the labels attached to a specific entity. This endpoint syncs the label assignments -- labels in `selectedLabels` are attached, and previously attached labels not in the list are detached.

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



---
