# FluentCRM API — email-patterns

11 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/email-patterns/do-bulk-action`

**POST Bulk Delete Email Patterns**

Delete several patterns in one request. `delete_patterns` is the only supported action — anything else is rejected.

There are two selection modes. By default the ids in `pattern_ids` are deleted. When `select_all` is truthy the id list is ignored and **every pattern matching `search` is deleted** — with an empty `search`, that is every pattern on the site.

<!-- fc:access -->

**Required capability:** `fcrm_manage_email_delete`

_Enforced by `EmailPatternPolicy::handleBulkAction()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `action_name` (string) **required** _(enum: `delete_patterns`)_ — Must be `delete_patterns`.
- `select_all` (boolean) _(default: `false`)_ — When truthy, delete everything matching `search` and ignore `pattern_ids`.
- `search` (string) — Search term applied in `select_all` mode. Empty means no filter — every pattern is deleted.
- `pattern_ids` (array<integer>) — Pattern ids to delete. Required unless `select_all` is truthy.

Example:

```json
{
  "action_name": "delete_patterns",
  "pattern_ids": [
    178,
    179
  ]
}
```


**Responses**

- **200** — Patterns deleted.

  Schema (`application/json`):

  - `message` (string) — Confirmation message including how many rows were removed.

  Example:

```json
{
  "message": "2 pattern(s) deleted successfully"
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — `action_name` is not `delete_patterns`, or no patterns were selected.

  Schema (`application/json`):

  - _$ref: Error_

---

## POST `/email-patterns`

**POST Create Email Pattern**

Create a pattern. `title` and `content` are both required and validated before anything is written.

The slug is generated server-side as `fluentcrm/<sanitised-title>-<uniqid>` and cannot be supplied. `content` is filtered through `wp_kses_post()`, so disallowed markup is stripped rather than rejected.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `EmailPatternPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `title` (string) **required** — Pattern name. Required.
- `content` (string) **required** — Block markup. Required.
- `category` (string) — Category name. Free text — the category does not have to exist.
- `description` (string) — Optional description.
- `sync_status` (string) _(default: `unsynced`)_ — Sync status stored verbatim.

Example:

```json
{
  "title": "Hero with CTA",
  "content": "<!-- wp:heading --><h2>Big news</h2><!-- /wp:heading -->",
  "category": "My Patterns",
  "description": "Headline plus a call-to-action button.",
  "sync_status": "unsynced"
}
```


**Responses**

- **200** — Pattern created.

  Schema (`application/json`):

  - `message` (string) — Confirmation message.
  - `pattern` (EmailPattern)

  Example:

```json
{
  "message": "Pattern saved successfully",
  "pattern": {
    "id": 180,
    "slug": "fluentcrm/hero-with-cta-68f0a1",
    "title": "Hero with CTA",
    "content": "<!-- wp:heading --><h2>Big news</h2><!-- /wp:heading -->",
    "category": "My Patterns",
    "description": "Headline plus a call-to-action button.",
    "sync_status": "unsynced",
    "created_at": "2026-08-04 09:12:00",
    "updated_at": "2026-08-04 09:12:00"
  }
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — `title` or `content` missing.

  Schema (`application/json`):

  - _$ref: Error_

---

## POST `/email-patterns/categories`

**POST Create Pattern Category**

Create a pattern category, or return the existing one when the slug already exists — the call is idempotent, so a repeat request is safe and returns the original record rather than an error.

The slug is derived from `name` via `sanitize_title()`. The response is a bare WordPress-term-shaped object with no `message` envelope.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `EmailPatternPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `name` (string) **required** — Category display name. Required.

Example:

```json
{
  "name": "Newsletters"
}
```


**Responses**

- **200** — The created — or already existing — category.

  Schema (`application/json`):

  - _$ref: PatternCategory_

  Example:

```json
{
  "id": 12,
  "count": 0,
  "name": "Newsletters",
  "slug": "newsletters",
  "parent": 0
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — `name` was empty.

  Schema (`application/json`):

  - _$ref: Error_

---

## POST `/email-patterns/wp-format`

**POST Create Pattern From wp_block Payload**

Create a pattern from a WordPress `wp_block` payload, and return it in the same shape.

The counterpart to `GET /email-patterns/wp-format`, used by the block editor's save path. `title` and `content` each accept a plain string or `{ "raw": "…" }`.

Unlike `POST /email-patterns`, neither field is strictly required: supplying just one is enough, and a missing title is stored as “Untitled Pattern”. Sending neither is rejected.

The response is the created pattern as a bare `wp_block` object, with no `message` envelope.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `EmailPatternPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `title` (string) — Pattern name. Accepts a string or `{"raw": "…"}`. Defaults to “Untitled Pattern”.
- `content` (string) — Block markup. Accepts a string or `{"raw": "…"}`.
- `meta` (object)
  - `wp_pattern_sync_status` (string) — Sync status to store.
- `wp_pattern_category` (array<integer>) — Category ids. The first match supplies the stored category name.

Example:

```json
{
  "title": {
    "raw": "Hero with CTA"
  },
  "content": {
    "raw": "<!-- wp:heading --><h2>Big news</h2><!-- /wp:heading -->"
  },
  "meta": {
    "wp_pattern_sync_status": "unsynced"
  },
  "wp_pattern_category": [
    12
  ]
}
```


**Responses**

- **200** — The created pattern in `wp_block` shape.

  Schema (`application/json`):

  - _$ref: WpBlockPattern_

  Example:

```json
{
  "id": 181,
  "date": {
    "date": "2026-08-04 09:30:00.000000",
    "timezone_type": 1,
    "timezone": "+00:00"
  },
  "date_gmt": {
    "date": "2026-08-04 09:30:00.000000",
    "timezone_type": 1,
    "timezone": "+00:00"
  },
  "modified": {
    "date": "2026-08-04 09:30:00.000000",
    "timezone_type": 1,
    "timezone": "+00:00"
  },
  "modified_gmt": {
    "date": "2026-08-04 09:30:00.000000",
    "timezone_type": 1,
    "timezone": "+00:00"
  },
  "slug": "fluentcrm/hero-with-cta-68f0b2",
  "status": "publish",
  "type": "wp_block",
  "link": "",
  "title": {
    "raw": "Hero with CTA"
  },
  "content": {
    "raw": "<!-- wp:heading --><h2>Big news</h2><!-- /wp:heading -->",
    "protected": false
  },
  "meta": {},
  "wp_pattern_sync_status": "unsynced",
  "wp_pattern_category": [
    12
  ]
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — Both `title` and `content` were empty.

  Schema (`application/json`):

  - _$ref: Error_

---

## DELETE `/email-patterns/{id}`

**DELETE Delete Email Pattern**

Permanently delete a pattern. Emails already built from it are unaffected — the block markup was copied into them at insert time.

<!-- fc:access -->

**Required capability:** `fcrm_manage_email_delete`

_Enforced by `EmailPatternPolicy::delete()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Pattern id. |


**Responses**

- **200** — Pattern deleted.

  Schema (`application/json`):

  - `message` (string) — Confirmation message.

  Example:

```json
{
  "message": "Pattern deleted successfully"
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **404** — The requested resource does not exist.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — Validation failed — the response message names the offending field.

  Schema (`application/json`):

  - _$ref: Error_

---

## DELETE `/email-patterns/categories/{id}`

**DELETE Delete Pattern Category**

Delete a pattern category.

Patterns are **not** touched: each stores its category as a plain name, so they keep that name and simply stop resolving to a category id.

<!-- fc:access -->

**Required capability:** `fcrm_manage_email_delete`

_Enforced by `EmailPatternPolicy::deleteCategory()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Category id. |


**Responses**

- **200** — Category deleted.

  Schema (`application/json`):

  - `message` (string) — Confirmation message.

  Example:

```json
{
  "message": "Category deleted successfully"
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **404** — The requested resource does not exist.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — Validation failed — the response message names the offending field.

  Schema (`application/json`):

  - _$ref: Error_

---

## GET `/email-patterns/{id}`

**GET Single Email Pattern**

Fetch one pattern by id.

<!-- fc:access -->

**Required capability:** `fcrm_read_emails`

_Enforced by `EmailPatternPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Pattern id. |


**Responses**

- **200** — The requested pattern.

  Schema (`application/json`):

  - `pattern` (EmailPattern)

  Example:

```json
{
  "pattern": {
    "id": 172,
    "slug": "fluentcrm/test-1774795856",
    "title": "Test",
    "content": "<!-- wp:group --><div class=\"wp-block-group\">…</div><!-- /wp:group -->",
    "category": "My Patterns",
    "description": "",
    "sync_status": "unsynced",
    "created_at": "2026-03-29 10:10:56",
    "updated_at": "2026-03-29 10:10:56"
  }
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **404** — The requested resource does not exist.

  Schema (`application/json`):

  - _$ref: Error_

---

## GET `/email-patterns/categories`

**GET List Pattern Categories**

Return the distinct category names currently in use, sorted alphabetically.

This is derived from the patterns themselves, **not** from the stored category records — a category created via `POST /email-patterns/categories` does not appear here until at least one pattern uses it. The result is a flat array of strings with no ids; use the ids from `wp_pattern_category` when you need them.

<!-- fc:access -->

**Required capability:** `fcrm_read_emails`

_Enforced by `EmailPatternPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Category names in use.

  Schema (`application/json`):

  - `categories` (array<string>) — Distinct, alphabetically sorted category names.

  Example:

```json
{
  "categories": [
    "My Patterns",
    "Newsletters",
    "Promotions"
  ]
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_

---

## GET `/email-patterns`

**GET List Email Patterns**

List saved email block patterns, newest first.

Note the response envelope: `patterns` carries only `data` and `total`, **not** the full paginator. Page through it with `page` and `per_page` and use `total` to work out how many pages there are.

`search` matches against the serialised pattern value, so it hits the title, content, category, and description at once. LIKE wildcards in the term are escaped and matched literally.

<!-- fc:access -->

**Required capability:** `fcrm_read_emails`

_Enforced by `EmailPatternPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Case-insensitive substring match against the stored pattern value. |
| `page` | integer | no | Page number to return. |
| `per_page` | integer | no | Rows per page. |


**Responses**

- **200** — Matching patterns.

  Schema (`application/json`):

  - `patterns` (object)
    - `data` (array<EmailPattern>)
    - `total` (integer) — Total number of matching patterns across all pages.

  Example:

```json
{
  "patterns": {
    "data": [
      {
        "id": 179,
        "slug": "fluentcrm/hemes-179",
        "title": "Hemes",
        "content": "<!-- wp:paragraph -->\n<p>Welcome aboard.</p>\n<!-- /wp:paragraph -->",
        "category": "My Patterns",
        "description": "",
        "sync_status": "",
        "created_at": "2026-03-31 06:07:42",
        "updated_at": "2026-04-12 09:17:04"
      }
    ],
    "total": 7
  }
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_

---

## GET `/email-patterns/wp-format`

**GET List Patterns In wp_block Format**

Return every pattern shaped like a WordPress `wp_block` post.

This exists so the Gutenberg email editor can intercept its own reusable-block requests and be served FluentCRM patterns instead — it is a compatibility bridge, not the endpoint you want for general integration work. Use `GET /email-patterns` for that.

Two differences from the core `wp_block` shape are worth knowing: the response is a **bare array** with no envelope and no pagination, and the four date fields serialise as objects (`{ "date": …, "timezone_type": …, "timezone": … }`) rather than ISO strings, because the raw model timestamps are passed straight through.

<!-- fc:access -->

**Required capability:** `fcrm_read_emails`

_Enforced by `EmailPatternPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Every pattern, newest first.

  Schema (`application/json`):

  - array of WpBlockPattern

  Example:

```json
[
  {
    "id": 179,
    "date": {
      "date": "2026-03-31 06:07:42.000000",
      "timezone_type": 1,
      "timezone": "+00:00"
    },
    "date_gmt": {
      "date": "2026-03-31 06:07:42.000000",
      "timezone_type": 1,
      "timezone": "+00:00"
    },
    "modified": {
      "date": "2026-04-12 09:17:04.000000",
      "timezone_type": 1,
      "timezone": "+00:00"
    },
    "modified_gmt": {
      "date": "2026-04-12 09:17:04.000000",
      "timezone_type": 1,
      "timezone": "+00:00"
    },
    "slug": "fluentcrm/hemes-179",
    "status": "publish",
    "type": "wp_block",
    "link": "",
    "title": {
      "raw": "Hemes"
    },
    "content": {
      "raw": "<!-- wp:paragraph --><p>Welcome aboard.</p><!-- /wp:paragraph -->",
      "protected": false
    },
    "meta": {},
    "wp_pattern_sync_status": "",
    "wp_pattern_category": [
      12
    ]
  }
]
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_

---

## PUT `/email-patterns/{id}`

**PUT Update Email Pattern**

Update a pattern. Fields behave differently from one another, so read this before sending a partial payload:

- `title` and `content` are only applied when present, and each accepts either a plain string or `{ "raw": "…" }` (the shape the block editor sends).
- **`category` is applied unconditionally.** Omitting it *clears* the category rather than leaving it alone. Send the current value to preserve it.
- `description` is applied only when the key is present.
- `sync_status` can be set directly, or through `meta.wp_pattern_sync_status`, which wins when both are sent.
- `wp_pattern_category` (array of category ids) overrides `category`, resolving to the first matching category's name.

Changing the title also regenerates the slug as `fluentcrm/<sanitised-title>-<id>`.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `EmailPatternPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Pattern id. |


**Request body** (`application/json`, required)

- `title` (string) — New name. Accepts a string or `{"raw": "…"}`.
- `content` (string) — New block markup. Accepts a string or `{"raw": "…"}`.
- `category` (string) — Category name. Omitting this CLEARS the existing category.
- `description` (string) — New description.
- `sync_status` (string) — Sync status.
- `meta` (object)
  - `wp_pattern_sync_status` (string) — Sync status from the block editor. Takes precedence over `sync_status`.
- `wp_pattern_category` (array<integer>) — Category ids. Resolved to a name and used instead of `category`.

Example:

```json
{
  "title": "Hero with CTA",
  "category": "My Patterns",
  "description": "Updated copy."
}
```


**Responses**

- **200** — Pattern updated.

  Schema (`application/json`):

  - `message` (string) — Confirmation message.
  - `pattern` (EmailPattern)

  Example:

```json
{
  "message": "Pattern updated successfully",
  "pattern": {
    "id": 180,
    "slug": "fluentcrm/hero-with-cta-180",
    "title": "Hero with CTA",
    "content": "<!-- wp:heading --><h2>Big news</h2><!-- /wp:heading -->",
    "category": "My Patterns",
    "description": "Updated copy.",
    "sync_status": "unsynced",
    "created_at": "2026-08-04 09:12:00",
    "updated_at": "2026-08-04 09:20:11"
  }
}
```


- **401** — Not authenticated — missing or invalid credentials.

  Schema (`application/json`):

  - _$ref: Error_
- **403** — Authenticated but the user lacks the capability this route requires.

  Schema (`application/json`):

  - _$ref: Error_
- **404** — The requested resource does not exist.

  Schema (`application/json`):

  - _$ref: Error_
- **422** — Validation failed — the response message names the offending field.

  Schema (`application/json`):

  - _$ref: Error_

---
