# FluentCRM API — Smart Links (Pro)

5 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/smart-links/activate`

**POST Activate Smart Links Module**

Activate the Smart Links module by running database migrations to create the `fc_smart_links` table. This must be called before using any other Smart Links endpoints if the module has not been activated yet. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Smart Links module activated successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.

  Example:

```json
{
  "message": "SmartLinks module has been successfully activated"
}
```



---

## POST `/smart-links`

**POST Create Smart Link**

Create a new smart link with a target URL and optional actions (add/remove tags, add/remove lists, auto-login). A unique short slug is generated automatically. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `link` (SmartLinkInput) **required**

Example:

```json
{
  "link": {
    "title": "Upgrade Interest Link",
    "target_url": "https://example.com/upgrade",
    "actions": {
      "tags": [
        1,
        3
      ],
      "lists": [
        2
      ]
    },
    "detach_actions": {
      "tags": [
        5
      ],
      "lists": []
    },
    "auto_login": "no",
    "notes": "Track users interested in upgrading"
  }
}
```


**Responses**

- **200** — Smart link created successfully.

  Schema (`application/json`):

  - `link` (object) — The created smart link object.
    - `id` (integer) — Unique identifier.
    - `title` (string) — Display title.
    - `short` (string) — Generated short slug.
    - `target_url` (string) — Destination URL.
    - `actions` (object) — Actions configuration.
      - _(object)_
    - `notes` (string,null) — Optional notes.
    - `created_by` (integer) — Creator's WordPress user ID.
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_
    - `short_url` (string) — Full trackable URL.
  - `message` (string) — Success message.

  Example:

```json
{
  "link": {
    "id": 4,
    "title": "Upgrade Interest Link",
    "short": "x7y8z9",
    "target_url": "https://example.com/upgrade",
    "actions": {
      "tags": [
        1,
        3
      ],
      "lists": [
        2
      ],
      "remove_tags": [
        5
      ],
      "remove_lists": [],
      "auto_login": "no"
    },
    "notes": "Track users interested in upgrading",
    "created_by": 1,
    "created_at": "2024-06-20 14:00:00",
    "updated_at": "2024-06-20 14:00:00",
    "short_url": "https://example.com/?fluentcrm=1&route=smart_url&slug=x7y8z9"
  },
  "message": "SmartLink has be created"
}
```


- **422** — Validation error.

  Schema (`application/json`):

  - `errors` (object) — Map of field names to validation error messages.
    - _(object)_

  Example:

```json
{
  "errors": {
    "title": [
      "The title field is required."
    ],
    "target_url": [
      "The target url field is required.",
      "The target url format is invalid."
    ]
  }
}
```



---

## DELETE `/smart-links/{id}`

**DELETE Delete Smart Link**

Permanently delete a smart link by its ID. The short URL will no longer redirect contacts. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The ID of the smart link to delete. |


**Responses**

- **200** — Smart link deleted successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.

  Example:

```json
{
  "message": "Selected Smart Link has been deleted"
}
```



---

## GET `/smart-links`

**GET List Smart Links**

Retrieve a paginated list of smart links. Smart links are trackable URLs that can automatically apply actions (add/remove tags, add/remove lists) when a contact clicks them. Supports search and sorting. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search smart links by title, target URL, or notes. |
| `orderBy` | string | no | Column to sort by. |
| `order` | string | no | Sort direction. Accepts `ascending` or `descending` (also `asc`/`desc`). |
| `per_page` | integer | no | Number of smart links per page. |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Paginated list of smart links, or disabled status if the module is not activated.

  Example:

```json
{
  "action_links": {
    "total": 3,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "next_page_url": null,
    "prev_page_url": null,
    "from": 1,
    "to": 3,
    "data": [
      {
        "id": 1,
        "title": "Upgrade Interest Link",
        "short": "a1b2c3",
        "target_url": "https://example.com/upgrade",
        "actions": {
          "tags": [
            1,
            3
          ],
          "lists": [
            2
          ],
          "remove_tags": [],
          "remove_lists": [],
          "auto_login": "no"
        },
        "notes": "Track users interested in upgrading",
        "created_by": 1,
        "created_at": "2024-06-15 10:30:00",
        "updated_at": "2024-06-15 10:30:00",
        "short_url": "https://example.com/?fluentcrm=1&route=smart_url&slug=a1b2c3",
        "detach_actions": {
          "tags": [],
          "lists": []
        },
        "auto_login": "no"
      }
    ]
  }
}
```



---

## PUT `/smart-links/{id}`

**PUT Update Smart Link**

Update an existing smart link's title, target URL, actions, and notes. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The ID of the smart link to update. |


**Request body** (`application/json`, required)

- `link` (object) **required**
  - `title` (string) **required** — Updated display title.
  - `target_url` (string) **required** _(format: uri)_ — Updated destination URL.
  - `actions` (object) — Updated actions to apply on click.
    - `tags` (array<integer>) — Tag IDs to add.
    - `lists` (array<integer>) — List IDs to add.
  - `detach_actions` (object) — Updated actions to remove on click.
    - `tags` (array<integer>) — Tag IDs to remove.
    - `lists` (array<integer>) — List IDs to remove.
  - `auto_login` (string) _(enum: `yes`, `no`)_ — Whether to auto-login the WordPress user.
  - `notes` (string,null) — Updated notes.

Example:

```json
{
  "link": {
    "title": "Updated Upgrade Link",
    "target_url": "https://example.com/upgrade-v2",
    "actions": {
      "tags": [
        1,
        3,
        7
      ],
      "lists": [
        2
      ]
    },
    "detach_actions": {
      "tags": [],
      "lists": [
        4
      ]
    },
    "auto_login": "yes",
    "notes": "Updated tracking link for v2 upgrade page"
  }
}
```


**Responses**

- **200** — Smart link updated successfully.

  Schema (`application/json`):

  - `link` (object) — The updated smart link object.
    - `id` (integer) — Unique identifier.
    - `title` (string) — Updated title.
    - `short` (string) — Short slug (unchanged).
    - `target_url` (string) — Updated destination URL.
    - `actions` (object) — Updated actions configuration.
      - _(object)_
    - `notes` (string,null) — Updated notes.
    - `created_by` (integer) — Creator's WordPress user ID.
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_
    - `short_url` (string) — Full trackable URL.
  - `message` (string) — Success message.

  Example:

```json
{
  "link": {
    "id": 4,
    "title": "Updated Upgrade Link",
    "short": "x7y8z9",
    "target_url": "https://example.com/upgrade-v2",
    "actions": {
      "tags": [
        1,
        3,
        7
      ],
      "lists": [
        2
      ],
      "remove_tags": [],
      "remove_lists": [
        4
      ],
      "auto_login": "yes"
    },
    "notes": "Updated tracking link for v2 upgrade page",
    "created_by": 1,
    "created_at": "2024-06-20 14:00:00",
    "updated_at": "2024-06-21 09:15:00",
    "short_url": "https://example.com/?fluentcrm=1&route=smart_url&slug=x7y8z9"
  },
  "message": "SmartLink has be updated"
}
```


- **404** — Smart link not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "No query results for model [SmartLink]."
}
```


- **422** — Validation error.

  Schema (`application/json`):

  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "errors": {
    "title": [
      "The title field is required."
    ],
    "target_url": [
      "The target url format is invalid."
    ]
  }
}
```



---
