# FluentCRM API — Tags

7 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/tags/do-bulk-action`

**POST Bulk Action Tags**

Perform a bulk action on multiple tags. Currently supports bulk deletion of tags by their IDs.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `tagIds` (array<integer>) **required** — Array of tag IDs to delete.

Example:

```json
{
  "tagIds": [
    3,
    5,
    8
  ]
}
```


**Responses**

- **200** — Bulk action completed successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.

  Example:

```json
{
  "message": "Selected Tags have been removed permanently"
}
```



---

## POST `/tags/bulk`

**POST Bulk Create Tags**

Create or update multiple tags in a single request. Tags are matched by slug -- if a tag with the given slug already exists, its title is updated; otherwise a new tag is created. Tags without a `title` are skipped.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `tags` (array<object>) — Array of tag objects to create or update. Alternatively, use `items` as the key name.
  - `title` (string) **required** — Display name of the tag.
  - `slug` (string) — URL-friendly identifier. Auto-generated from title if omitted.
- `items` (array<object>) — Alternative key for the tags array. Used as fallback if `tags` is empty.
  - `title` (string) **required** — Display name of the tag.
  - `slug` (string) — URL-friendly identifier. Auto-generated from title if omitted.

Example:

```json
{
  "tags": [
    {
      "title": "Early Adopter",
      "slug": "early-adopter"
    },
    {
      "title": "Beta Tester"
    },
    {
      "title": "Premium Plan",
      "slug": "premium-plan"
    }
  ]
}
```


**Responses**

- **200** — Tags created or updated successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.
  - `ids` (array<integer>) — Array of IDs for the created or updated tags.

  Example:

```json
{
  "message": "Successfully saved the tags.",
  "ids": [
    10,
    11,
    12
  ]
}
```



---

## POST `/tags`

**POST Create Tag**

Create a new tag. The `title` field is required. If `slug` is omitted, it is auto-generated from the title. The slug must be unique across all tags.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `title` (string) **required** — Display name of the tag.
- `slug` (string) — URL-friendly unique identifier. Auto-generated from title if omitted.
- `description` (string) — Optional description of the tag.

Example:

```json
{
  "title": "VIP Customer",
  "slug": "vip-customer",
  "description": "High-value customers with priority support"
}
```


**Responses**

- **200** — Tag created successfully.

  Schema (`application/json`):

  - `lists` (Tag) — The created tag (legacy key name).
  - `item` (Tag) — The created tag.
  - `message` (string) — Success message.

  Example:

```json
{
  "lists": {
    "id": 5,
    "title": "VIP Customer",
    "slug": "vip-customer",
    "description": "High-value customers with priority support",
    "created_at": "2024-03-01 14:20:00",
    "updated_at": "2024-03-01 14:20:00"
  },
  "item": {
    "id": 5,
    "title": "VIP Customer",
    "slug": "vip-customer",
    "description": "High-value customers with priority support",
    "created_at": "2024-03-01 14:20:00",
    "updated_at": "2024-03-01 14:20:00"
  },
  "message": "Successfully saved the tag."
}
```


- **422** — Validation error. Returned when required fields are missing or the slug already exists.

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "Unprocessable Entity!",
  "errors": {
    "title": [
      "The title field is required."
    ],
    "slug": [
      "The slug has already been taken."
    ]
  }
}
```



---

## DELETE `/tags/{id}`

**DELETE Delete Tag**

Permanently delete a tag by its ID. This removes the tag and its associations with contacts.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The ID of the tag to delete. |


**Responses**

- **200** — Tag deleted successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.

  Example:

```json
{
  "message": "Successfully removed the tag."
}
```


- **404** — Tag not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Tag could not be found"
}
```



---

## GET `/tags/{id}`

**GET Get Tag**

Retrieve a single tag by its ID.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The ID of the tag to retrieve. |


**Responses**

- **200** — Tag found successfully.

  Schema (`application/json`):

  - `tag` (Tag)

  Example:

```json
{
  "tag": {
    "id": 1,
    "title": "VIP Customer",
    "slug": "vip-customer",
    "description": "High-value customers with priority support",
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-01-15 10:30:00"
  }
}
```



---

## GET `/tags`

**GET List Tags**

Retrieve a paginated list of tags. Optionally includes subscriber counts and a separate array of all tags for dropdown/select usage.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search tags by title, slug, or description. |
| `sort_by` | string | no | Column to sort by. |
| `sort_order` | string | no | Sort direction. |
| `per_page` | integer | no | Number of tags per page. |
| `page` | integer | no | Page number for pagination. |
| `exclude_counts` | boolean | no | If set to any truthy value, subscriber counts will not be included for each tag. |
| `all_tags` | boolean | no | If set to any truthy value, includes a flat `all_tags` array with id, title, and slug of every tag (useful for dropdowns). |


**Responses**

- **200** — Paginated list of tags.

  Schema (`application/json`):

  - `tags` (object)
    - `total` (integer) — Total number of tags matching the query.
    - `per_page` (integer) — Number of tags per page.
    - `current_page` (integer) — Current page number.
    - `last_page` (integer) — Last page number.
    - `next_page_url` (string,null) — URL for the next page, or null if on the last page.
    - `prev_page_url` (string,null) — URL for the previous page, or null if on the first page.
    - `from` (integer) — Starting record index on this page.
    - `to` (integer) — Ending record index on this page.
    - `data` (array<Tag>)
  - `all_tags` (array<object>) — Only present when `all_tags` query parameter is truthy. A flat array of all tags.
    - `id` (string) — Tag ID as a string.
    - `title` (string)
    - `slug` (string)

  Example:

```json
{
  "tags": {
    "total": 12,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "next_page_url": null,
    "prev_page_url": null,
    "from": 1,
    "to": 12,
    "data": [
      {
        "id": 1,
        "title": "VIP Customer",
        "slug": "vip-customer",
        "description": "High-value customers with priority support",
        "created_at": "2024-01-15 10:30:00",
        "updated_at": "2024-01-15 10:30:00",
        "subscribersCount": 245
      },
      {
        "id": 2,
        "title": "Newsletter Subscriber",
        "slug": "newsletter-subscriber",
        "description": null,
        "created_at": "2024-01-16 08:00:00",
        "updated_at": "2024-01-16 08:00:00",
        "subscribersCount": 1830
      }
    ]
  }
}
```



---

## PUT `/tags/{id}`

**PUT Update Tag**

Update an existing tag by its ID. The `title` field is required. If `slug` is omitted, it is auto-generated from the title. Alternatively, set `id` to `0` and pass `update_by=slug` to find the tag by its slug instead.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The ID of the tag to update. Pass `0` with `update_by=slug` to look up by slug instead. |


**Request body** (`application/json`, required)

- `title` (string) **required** — Display name of the tag.
- `slug` (string) — URL-friendly unique identifier. Auto-generated from title if omitted.
- `description` (string) — Optional description of the tag.
- `update_by` (string) _(enum: `slug`)_ — Set to `slug` to look up the tag by its slug instead of ID (only when `id` is `0`).

Example:

```json
{
  "title": "Premium Customer",
  "slug": "premium-customer",
  "description": "Updated description for premium customers"
}
```


**Responses**

- **200** — Tag updated successfully.

  Schema (`application/json`):

  - `lists` (integer) — Number of rows updated (legacy key name). Typically `1`.
  - `message` (string) — Success message.

  Example:

```json
{
  "lists": 1,
  "message": "Successfully saved the tag."
}
```


- **422** — Validation error or slug conflict.

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "Provided slug already exists in another tag"
}
```



---
