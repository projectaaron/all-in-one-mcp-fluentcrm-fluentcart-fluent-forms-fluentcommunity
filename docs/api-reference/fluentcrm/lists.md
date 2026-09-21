# FluentCRM API — Lists

7 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/lists/do-bulk-action`

**POST Bulk Action Lists**

Perform a bulk action on multiple contact lists. Currently supports bulk deletion of lists by their IDs.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats_delete`

_Enforced by `ListPolicy::handleBulkAction()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `listIds` (array<integer>) **required** — Array of list IDs to delete.

Example:

```json
{
  "listIds": [
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
  "message": "Selected Lists have been removed permanently"
}
```



---

## POST `/lists/bulk`

**POST Bulk Create Lists**

Create or update multiple contact lists in a single request. Lists are matched by slug -- if a list with the given slug already exists, its title is updated; otherwise a new list is created. Lists without a `title` are skipped.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `ListPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `lists` (array<object>) — Array of list objects to create or update. Alternatively, use `items` as the key name.
  - `title` (string) **required** — Display name of the list.
  - `slug` (string) — URL-friendly identifier. Auto-generated from title if omitted.
- `items` (array<object>) — Alternative key for the lists array. Used as fallback if `lists` is empty.
  - `title` (string) **required** — Display name of the list.
  - `slug` (string) — URL-friendly identifier. Auto-generated from title if omitted.

Example:

```json
{
  "lists": [
    {
      "title": "Newsletter",
      "slug": "newsletter"
    },
    {
      "title": "Product Updates"
    },
    {
      "title": "Weekly Digest",
      "slug": "weekly-digest"
    }
  ]
}
```


**Responses**

- **200** — Lists created or updated successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.
  - `ids` (array<integer>) — Array of IDs for the created or updated lists.

  Example:

```json
{
  "message": "Provided Lists have been successfully created",
  "ids": [
    10,
    11,
    12
  ]
}
```



---

## POST `/lists`

**POST Create List**

Create a new contact list. The `title` field is required. If `slug` is omitted, it is auto-generated from the title. The slug must be unique across all lists.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `ListPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `title` (string) **required** — Display name of the list.
- `slug` (string) — URL-friendly unique identifier. Auto-generated from title if omitted.
- `description` (string) — Optional description of the list.

Example:

```json
{
  "title": "Newsletter",
  "slug": "newsletter",
  "description": "Main newsletter subscribers"
}
```


**Responses**

- **200** — List created successfully.

  Schema (`application/json`):

  - `lists` (ContactList) — The created list (legacy key name).
  - `item` (ContactList) — The created list.
  - `message` (string) — Success message.

  Example:

```json
{
  "lists": {
    "id": 5,
    "title": "Newsletter",
    "slug": "newsletter",
    "description": "Main newsletter subscribers",
    "created_at": "2024-03-01 14:20:00",
    "updated_at": "2024-03-01 14:20:00"
  },
  "item": {
    "id": 5,
    "title": "Newsletter",
    "slug": "newsletter",
    "description": "Main newsletter subscribers",
    "created_at": "2024-03-01 14:20:00",
    "updated_at": "2024-03-01 14:20:00"
  },
  "message": "Successfully saved the list."
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

## DELETE `/lists/{id}`

**DELETE Delete List**

Permanently delete a contact list by its ID. This removes the list but does not delete contacts that were in the list.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats_delete`

_Enforced by `ListPolicy::remove()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The ID of the list to delete. |


**Responses**

- **200** — List deleted successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.

  Example:

```json
{
  "message": "Successfully removed the list."
}
```



---

## GET `/lists/{id}`

**GET Get List**

Retrieve a single contact list by its ID.

The list object is returned **at the top level** — there is no `list` wrapper key. A missing id yields `null` rather than a 404.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `ListPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The ID of the list to retrieve. |


**Responses**

- **200** — List found successfully.

  Schema (`application/json`):

  - `id` (integer) — List id.
  - `title` (string) — List name.
  - `slug` (string) — URL-friendly unique identifier.
  - `description` (string,null) — Optional description. Null when never set.
  - `is_public` (string) _(enum: `0`, `1`)_ — `"1"` when the list may be shown on public preference pages, `"0"` otherwise. Returned as a string, not a boolean.
  - `created_at` (string) _(format: date-time)_ — Creation timestamp.
  - `updated_at` (string) _(format: date-time)_ — Last update timestamp.

  Example:

```json
{
  "id": 1,
  "title": "Community Members",
  "slug": "community-members",
  "description": null,
  "is_public": "0",
  "created_at": "2024-03-27 00:52:39",
  "updated_at": "2024-03-27 00:52:39"
}
```



---

## GET `/lists`

**GET List Lists**

Retrieve a paginated list of contact lists. Optionally includes subscriber counts and a separate array of all lists for dropdown/select usage.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `ListPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search lists by title, slug, or description. |
| `sort_by` | string | no | Column to sort by. |
| `sort_order` | string | no | Sort direction. |
| `per_page` | integer | no | Number of lists per page. |
| `page` | integer | no | Page number for pagination. |
| `exclude_counts` | boolean | no | If set to any truthy value, `totalCount` and `subscribersCount` will not be included for each list. |
| `all_lists` | boolean | no | If set to any truthy value, includes a flat `all_lists` array with id, title, and slug of every list (useful for dropdowns). |
| `with[]` | array<string> | no | Extra data to include. `subscribersCount` adds per-list contact counts via one grouped pivot query. |


**Responses**

- **200** — Paginated list of contact lists.

  Schema (`application/json`):

  - `lists` (object)
    - `total` (integer) — Total number of lists matching the query.
    - `per_page` (integer) — Number of lists per page.
    - `current_page` (integer) — Current page number.
    - `last_page` (integer) — Last page number.
    - `next_page_url` (string,null) — URL for the next page, or null if on the last page.
    - `prev_page_url` (string,null) — URL for the previous page, or null if on the first page.
    - `from` (integer) — Starting record index on this page.
    - `to` (integer) — Ending record index on this page.
    - `data` (array<ContactList>)
  - `pagination` (object)
    - `total` (integer) — Total number of lists matching the query.
  - `all_lists` (array<object>) — Only present when `all_lists` query parameter is truthy. A flat array of all lists. Returned **only** when the request sends `all_lists`. Contains every list, unpaginated, for use in pickers.
    - `id` (string) — List ID as a string.
    - `title` (string)
    - `slug` (string)

  Example:

```json
{
  "lists": {
    "total": 8,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "next_page_url": null,
    "prev_page_url": null,
    "from": 1,
    "to": 8,
    "data": [
      {
        "id": 1,
        "title": "Newsletter",
        "slug": "newsletter",
        "description": "Main newsletter subscribers",
        "is_public": 0,
        "created_at": "2024-01-15 10:30:00",
        "updated_at": "2024-01-15 10:30:00",
        "totalCount": 1250,
        "subscribersCount": 1100
      },
      {
        "id": 2,
        "title": "Product Updates",
        "slug": "product-updates",
        "description": null,
        "is_public": 0,
        "created_at": "2024-01-16 08:00:00",
        "updated_at": "2024-01-16 08:00:00",
        "totalCount": 530,
        "subscribersCount": 480
      }
    ]
  },
  "pagination": {
    "total": 8
  }
}
```



---

## PUT `/lists/{id}`

**PUT Update List**

Update an existing contact list by its ID. The `title` field is required. If `slug` is provided, it is regenerated from the title. Alternatively, set `id` to `0` and pass `update_by=slug` to find the list by its slug instead.

<!-- fc:access -->

**Required capability:** `fcrm_manage_contact_cats`

_Enforced by `ListPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The ID of the list to update. Pass `0` with `update_by=slug` to look up by slug instead. |


**Request body** (`application/json`, required)

- `title` (string) **required** — Display name of the list.
- `slug` (string) — URL-friendly unique identifier. If provided, the slug is regenerated from the title.
- `description` (string) — Optional description of the list.
- `update_by` (string) _(enum: `slug`)_ — Set to `slug` to look up the list by its slug instead of ID (only when `id` is `0`).

Example:

```json
{
  "title": "Weekly Newsletter",
  "slug": "weekly-newsletter",
  "description": "Updated description for the weekly newsletter list"
}
```


**Responses**

- **200** — List updated successfully.

  Schema (`application/json`):

  - `lists` (integer) — Number of rows updated (legacy key name). Typically `1`.
  - `message` (string) — Success message.

  Example:

```json
{
  "lists": 1,
  "message": "Successfully saved the list."
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
  "message": "Provided slug already exists in another list"
}
```



---
