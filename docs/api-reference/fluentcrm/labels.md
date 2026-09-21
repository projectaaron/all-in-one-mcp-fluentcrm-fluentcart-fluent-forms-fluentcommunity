# FluentCRM API — Labels

4 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/labels`

**POST Create Label**

Create a new global label. Labels are stored in the `fc_terms` table with `taxonomy_name` of `global_label`. The `slug`, `title`, and `color` fields are sanitized server-side.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `CustomFieldsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `label` (object) **required** — The label data to create.
  - `slug` (string) **required** — URL-friendly unique identifier for the label.
  - `title` (string) **required** — Display name of the label.
  - `color` (string) **required** — Hex color code (e.g., `#ff4444`).

Example:

```json
{
  "label": {
    "slug": "high-priority",
    "title": "High Priority",
    "color": "#ff4444"
  }
}
```


**Responses**

- **200** — Label created successfully.

  Schema (`application/json`):

  - `label` (object)
    - `id` (integer) — Unique identifier for the label.
    - `parent_id` (integer,null) — Parent label ID for hierarchical labels.
    - `slug` (string) — URL-friendly unique identifier.
    - `title` (string) — Display name of the label.
    - `description` (string,null) — Optional description.
    - `position` (integer) — Sort order position.
    - `settings` (object) — Label settings including visual properties.
      - `color` (string) — Hex color code for the label.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the label was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the label was last updated.
  - `message` (string) — Success message.

  Example:

```json
{
  "label": {
    "id": 3,
    "parent_id": null,
    "slug": "high-priority",
    "title": "High Priority",
    "description": null,
    "position": null,
    "settings": {
      "color": "#ff4444"
    },
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 10:00:00"
  },
  "message": "Label has been created successfully"
}
```



---

## DELETE `/labels/{id}`

**DELETE Delete Label**

Permanently delete a label by ID. This removes the label from the `fc_terms` table. Any funnel associations referencing this label are not automatically removed by this endpoint.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `CustomFieldsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The label ID to delete. |


**Responses**

- **200** — Label deleted successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.

  Example:

```json
{
  "message": "Label has been deleted successfully"
}
```


- **404** — Label not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/labels`

**GET List Labels**

Retrieve all global labels ordered by their position. Labels are used to categorize and organize automation funnels and other objects within FluentCRM.

<!-- fc:access -->

**Required capability:** any FluentCRM permission — the route only checks that the user holds at least one.

Gated on the user holding ANY FluentCRM permission, not one specific capability.

_Enforced by `CustomFieldsPolicy::getlabels()`._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — List of all labels.

  Schema (`application/json`):

  - `labels` (array<Label>) — Array of label objects ordered by position.

  Example:

```json
{
  "labels": [
    {
      "id": 1,
      "parent_id": null,
      "slug": "high-priority",
      "title": "High Priority",
      "description": null,
      "position": 0,
      "settings": {
        "color": "#ff4444"
      },
      "created_at": "2024-03-01 10:00:00",
      "updated_at": "2024-03-01 10:00:00"
    },
    {
      "id": 2,
      "parent_id": null,
      "slug": "onboarding",
      "title": "Onboarding",
      "description": null,
      "position": 1,
      "settings": {
        "color": "#44bb44"
      },
      "created_at": "2024-03-01 11:00:00",
      "updated_at": "2024-03-01 11:00:00"
    }
  ]
}
```



---

## PUT `/labels/{id}`

**PUT Update Label**

Update an existing label's slug, title, and color. The label must exist or a 404 error is returned. All fields are sanitized server-side.

<!-- fc:access -->

**Required capability:** `fcrm_manage_settings`

_Enforced by `CustomFieldsPolicy::verifyRequest()`, the policy default for this route group._

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The label ID to update. |


**Request body** (`application/json`, required)

- `label` (object) **required** — The updated label data.
  - `slug` (string) **required** — Updated URL-friendly identifier.
  - `title` (string) **required** — Updated display name.
  - `color` (string) **required** — Updated hex color code (e.g., `#44bb44`).

Example:

```json
{
  "label": {
    "slug": "high-priority",
    "title": "High Priority (Updated)",
    "color": "#ff6600"
  }
}
```


**Responses**

- **200** — Label updated successfully.

  Schema (`application/json`):

  - `label` (object)
    - `id` (integer) — Unique identifier for the label.
    - `parent_id` (integer,null) — Parent label ID for hierarchical labels.
    - `slug` (string) — URL-friendly unique identifier.
    - `title` (string) — Display name of the label.
    - `description` (string,null) — Optional description.
    - `position` (integer) — Sort order position.
    - `settings` (object) — Label settings including visual properties.
      - `color` (string) — Hex color code for the label.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the label was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the label was last updated.
  - `message` (string) — Success message.

  Example:

```json
{
  "label": {
    "id": 1,
    "parent_id": null,
    "slug": "high-priority",
    "title": "High Priority (Updated)",
    "description": null,
    "position": 0,
    "settings": {
      "color": "#ff6600"
    },
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-02 14:30:00"
  },
  "message": "Labels have been updated successfully"
}
```


- **404** — Label not found.

  Schema (`application/json`):

  - `message` (string)

---
