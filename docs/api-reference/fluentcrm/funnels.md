# FluentCRM API — Automations (Funnels)

31 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/funnels/do-bulk-action`

**POST Bulk Action Funnels**

Perform a bulk action on multiple funnels. Supported actions: `change_funnel_status` (change status of selected funnels), `delete_funnels` (permanently delete selected funnels and all associated data), and `apply_labels` (attach labels to selected funnels).

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `action_name` (string) **required** _(enum: `change_funnel_status`, `delete_funnels`, `apply_labels`)_ — The bulk action to perform.
- `funnel_ids` (array<integer>) **required** — Array of funnel IDs to act on.
- `status` (string) _(enum: `draft`, `published`)_ — New status to set. Required when `action_name` is `change_funnel_status`.
- `labels` (array<integer>) — Array of label IDs to apply. Required when `action_name` is `apply_labels`.

Example:

```json
{
  "action_name": "change_funnel_status",
  "funnel_ids": [
    1,
    2,
    3
  ],
  "status": "published"
}
```


**Responses**

- **200** — Bulk action completed successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Status has been changed for the selected funnels"
}
```


- **422** — Invalid action or missing required parameters.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Please provide funnel IDs"
}
```



---

## PUT `/funnels/{id}/change-trigger`

**PUT Change Funnel Trigger**

Change the trigger of an existing automation funnel. This resets the funnel's settings and conditions to empty values. Returns an error if the new trigger name is the same as the current one.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |


**Request body** (`application/json`, required)

- `trigger_name` (string) **required** — The new trigger event name.
- `title` (string) **required** — Updated funnel title.

Example:

```json
{
  "trigger_name": "fluentcrm_contact_added_to_tags",
  "title": "Tag-Based Welcome Sequence"
}
```


**Responses**

- **200** — Trigger changed successfully.

  Schema (`application/json`):

  - `message` (string)
  - `funnel` (object)
    - `id` (integer) — Unique identifier for the funnel.
    - `title` (string) — Funnel title.
    - `trigger_name` (string) — The trigger event name that starts this funnel.
    - `status` (string) _(enum: `draft`, `published`)_ — Funnel status.
    - `conditions` (array<object>) — Funnel-level conditions.
      - _(object)_
    - `settings` (object) — Funnel settings.
      - _(object)_
    - `created_by` (integer) — WordPress user ID of the creator.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the funnel was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the funnel was last updated.
    - `subscribers_count` (integer) — Number of subscribers in this funnel.
    - `description` (string,null) — Funnel description stored as meta.
    - `labels` (array<FunnelLabel>) — Labels assigned to the funnel.

  Example:

```json
{
  "message": "Funnel Trigger has been successfully updated",
  "funnel": {
    "id": 1,
    "title": "Tag-Based Welcome Sequence",
    "trigger_name": "fluentcrm_contact_added_to_tags",
    "status": "draft",
    "conditions": [],
    "settings": [],
    "created_by": 1
  }
}
```


- **422** — Trigger name is the same or validation error.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Trigger name is same"
}
```



---

## POST `/funnels/{id}/clone`

**POST Clone Funnel**

Create a duplicate of an existing automation funnel. The cloned funnel is created in `draft` status with `[Copy]` prefixed to the title. All sequences, conditions, settings, and labels are duplicated.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID to clone. |


**Responses**

- **200** — Funnel cloned successfully.

  Schema (`application/json`):

  - `message` (string)
  - `funnel` (object)
    - `id` (integer) — Unique identifier for the funnel.
    - `title` (string) — Funnel title.
    - `trigger_name` (string) — The trigger event name that starts this funnel.
    - `status` (string) _(enum: `draft`, `published`)_ — Funnel status.
    - `conditions` (array<object>) — Funnel-level conditions.
      - _(object)_
    - `settings` (object) — Funnel settings.
      - _(object)_
    - `created_by` (integer) — WordPress user ID of the creator.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the funnel was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the funnel was last updated.
    - `subscribers_count` (integer) — Number of subscribers in this funnel.
    - `description` (string,null) — Funnel description stored as meta.
    - `labels` (array<FunnelLabel>) — Labels assigned to the funnel.

  Example:

```json
{
  "message": "Funnel has been successfully cloned",
  "funnel": {
    "id": 8,
    "title": "[Copy] Welcome Email Sequence",
    "trigger_name": "fluent_crm/contact_created",
    "status": "draft",
    "conditions": [],
    "settings": {},
    "created_by": 1,
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 10:00:00"
  }
}
```


- **404** — Funnel not found.

  Schema (`application/json`):

  - `message` (string)

---

## POST `/funnels`

**POST Create Funnel**

Create a new automation funnel. The funnel is created in `draft` status. If no title is provided, a default title is generated from the trigger label and current date.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `funnel` (object) **required**
  - `trigger_name` (string) **required** — The trigger event name that starts this funnel.
  - `title` (string) — Funnel title. If empty, auto-generated from the trigger label.
  - `description` (string) — Funnel description.

Example:

```json
{
  "funnel": {
    "trigger_name": "fluent_crm/contact_created",
    "title": "Welcome Email Sequence",
    "description": "Sends welcome emails to new contacts"
  }
}
```


**Responses**

- **200** — Funnel created successfully.

  Schema (`application/json`):

  - `funnel` (object)
    - `id` (integer) — Unique identifier for the funnel.
    - `title` (string) — Funnel title.
    - `trigger_name` (string) — The trigger event name that starts this funnel.
    - `status` (string) _(enum: `draft`, `published`)_ — Funnel status.
    - `conditions` (array<object>) — Funnel-level conditions.
      - _(object)_
    - `settings` (object) — Funnel settings.
      - _(object)_
    - `created_by` (integer) — WordPress user ID of the creator.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the funnel was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the funnel was last updated.
    - `subscribers_count` (integer) — Number of subscribers in this funnel.
    - `description` (string,null) — Funnel description stored as meta.
    - `labels` (array<FunnelLabel>) — Labels assigned to the funnel.
  - `message` (string)

  Example:

```json
{
  "funnel": {
    "id": 5,
    "title": "Welcome Email Sequence",
    "trigger_name": "fluent_crm/contact_created",
    "status": "draft",
    "conditions": [],
    "settings": [],
    "created_by": 1,
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 10:00:00"
  },
  "message": "Funnel has been created. Please configure now"
}
```


- **422** — Validation error.

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## POST `/funnels/create-from-template`

**POST Create Funnel from Template**

Create a new automation funnel from a remote template. The template content URL is fetched, and the funnel is created in `draft` status with all sequences imported. Labels from the template are also imported or matched to existing labels.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `template` (object) **required**
  - `content` (string) **required** — URL pointing to the template JSON data. Must be from an allowed host (fluentcrm.com or wpmanageninja.com).

Example:

```json
{
  "template": {
    "content": "https://fluentcrm.com/wp-content/templates/welcome.json"
  }
}
```


**Responses**

- **200** — Funnel created from template successfully.

  Schema (`application/json`):

  - `funnel` (object)
    - `id` (integer) — Unique identifier for the funnel.
    - `title` (string) — Funnel title.
    - `trigger_name` (string) — The trigger event name that starts this funnel.
    - `status` (string) _(enum: `draft`, `published`)_ — Funnel status.
    - `conditions` (array<object>) — Funnel-level conditions.
      - _(object)_
    - `settings` (object) — Funnel settings.
      - _(object)_
    - `created_by` (integer) — WordPress user ID of the creator.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the funnel was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the funnel was last updated.
    - `subscribers_count` (integer) — Number of subscribers in this funnel.
    - `description` (string,null) — Funnel description stored as meta.
    - `labels` (array<FunnelLabel>) — Labels assigned to the funnel.
  - `message` (string)

  Example:

```json
{
  "funnel": {
    "id": 6,
    "title": "Welcome Email Series",
    "trigger_name": "fluent_crm/contact_created",
    "status": "draft",
    "created_by": 1,
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 10:00:00"
  },
  "message": "Funnel has been created from template"
}
```


- **422** — Template data could not be loaded.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Could not load template data. The template URL may be unavailable or not allowed."
}
```



---

## DELETE `/funnels/{id}`

**DELETE Delete Funnel**

Permanently delete an automation funnel by ID. This removes the funnel, all its sequences, subscribers, metrics, labels, and associated metadata. Also resets funnel indexes.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID to delete. |


**Responses**

- **200** — Funnel deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Funnel has been deleted"
}
```


- **404** — Funnel not found.

  Schema (`application/json`):

  - `message` (string)

---

## DELETE `/funnels/{id}/subscribers`

**DELETE Delete Funnel Subscribers**

Remove one or more subscribers from a specific automation funnel by their subscriber/contact IDs. Deletes the funnel subscriber records and associated metrics.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscriber_ids[]` | array<integer> | yes | Array of subscriber/contact IDs to remove from the funnel. |


**Responses**

- **200** — Subscribers removed from the funnel.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Subscriber has been removed from this automation funnel"
}
```


- **404** — Funnel not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — No subscriber IDs provided.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "subscriber_ids parameter is required"
}
```



---

## POST `/funnels/{id}/subscribers/{subscriber_id}/advance`

**POST Force Advance Funnel Subscriber**

Force a subscriber to advance to a specific sequence step in the funnel. The subscriber must be in `active` or `waiting` status (not `completed`, `cancelled`, or `pending`). If the subscriber is currently waiting on a benchmark, the benchmark is marked as skipped. The subscriber is then advanced to the target sequence and processing continues.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |
| `subscriber_id` | integer | yes | The subscriber/contact ID. |


**Request body** (`application/json`, required)

- `sequence_id` (integer) **required** — The target sequence ID to advance the subscriber to.

Example:

```json
{
  "sequence_id": 5
}
```


**Responses**

- **200** — Subscriber advanced successfully.

  Schema (`application/json`):

  - `message` (string)
  - `funnel_subscriber` (object) — Updated funnel subscriber record with current progress.
    - `id` (integer)
    - `funnel_id` (integer)
    - `subscriber_id` (integer)
    - `status` (string)
    - `last_sequence_id` (integer,null)
    - `next_sequence_id` (integer,null)
    - `next_execution_time` (string,null) _(format: date-time)_
    - `last_sequence` (object,null)
    - `next_sequence_item` (object,null)

  Example:

```json
{
  "message": "Subscriber has been advanced",
  "funnel_subscriber": {
    "id": 1,
    "funnel_id": 1,
    "subscriber_id": 42,
    "status": "active",
    "last_sequence_id": 5,
    "next_sequence_id": 6
  }
}
```


- **422** — Subscriber cannot be advanced.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "No corresponding subscriber found in this funnel"
}
```



---

## GET `/funnels/{id}`

**GET Get Funnel**

Retrieve a single automation funnel by ID. Optionally includes blocks, block fields, funnel sequences, and composer context smart codes via the `with[]` parameter.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with[]` | array<string> | no | Include additional related data. Supported values: `blocks`, `block_fields`, `funnel_sequences`. |


**Responses**

- **200** — Funnel details with optional related data.

  Schema (`application/json`):

  - `funnel` (any)
  - `blocks` (object) — Available funnel action blocks. Only included when `with[]` contains `blocks`.
    - _(object)_
  - `block_fields` (object) — Field configurations for funnel blocks. Only included when `with[]` contains `block_fields`.
    - _(object)_
  - `funnel_sequences` (array<object>) — Formatted funnel sequence tree. Only included when `with[]` contains `funnel_sequences`.
    - `id` (integer) — Sequence ID.
    - `funnel_id` (integer) — Associated funnel ID.
    - `action_name` (string) — Action identifier.
    - `title` (string) — Sequence title.
    - `type` (string) _(enum: `action`, `conditional`, `benchmark`)_ — Sequence type.
    - `settings` (object) — Action-specific settings.
      - _(object)_
    - `conditions` (array<object>) — Step-level conditions.
      - _(object)_
    - `sequence` (integer) — Order position.
    - `delay` (integer) — Delay in seconds.
    - `c_delay` (integer) — Cumulative delay in seconds.
    - `status` (string) — Sequence status.
    - `parent_id` (integer) — Parent sequence ID (0 for root).
    - `condition_type` (string,null) — Branch type for conditional children.
    - `children` (object) — Child sequences for conditional blocks.
      - `yes` (array<FunnelSequence>)
      - `no` (array<FunnelSequence>)
    - `created_by` (integer)
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_
  - `composer_context_codes` (array<object>) — Smart codes available in the funnel context. Only included when `with[]` contains `block_fields`.
    - _(object)_

  Example:

```json
{
  "funnel": {
    "id": 1,
    "title": "Welcome Email Sequence",
    "trigger_name": "fluent_crm/contact_created",
    "status": "published",
    "conditions": [],
    "settings": {},
    "created_by": 1,
    "description": "Sends welcome emails to new contacts",
    "trigger": {
      "label": "Contact Created",
      "category": "CRM",
      "description": "Triggered when a new contact is created"
    },
    "created_at": "2024-01-15 10:30:00",
    "updated_at": "2024-03-01 14:30:00"
  }
}
```


- **404** — Funnel not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/funnels/all-activities`

**GET Get All Funnel Activities**

Retrieve a paginated list of all funnel subscriber activities across all funnels. Each activity includes the subscriber, funnel, sequences, and metrics. Supports filtering by search and status.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search activities by subscriber name or email. |
| `status` | string | no | Filter by funnel subscriber status. |
| `per_page` | integer | no | Number of activities per page. |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Paginated list of funnel activities.

  Schema (`application/json`):

  - `activities` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `data` (array<FunnelActivity>)

  Example:

```json
{
  "activities": {
    "total": 50,
    "per_page": 15,
    "current_page": 1,
    "last_page": 4,
    "data": [
      {
        "id": 1,
        "funnel_id": 1,
        "subscriber_id": 42,
        "status": "active",
        "last_sequence_id": 3,
        "next_sequence_id": 4,
        "created_at": "2024-03-01 10:00:00",
        "updated_at": "2024-03-01 14:30:00"
      }
    ]
  }
}
```



---

## GET `/funnels/{id}/email_reports`

**GET Get Funnel Email Reports**

Retrieve email performance reports for all email sequences within a specific funnel. Returns each email sequence with its associated campaign data including subject, stats, and tracking status.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |


**Responses**

- **200** — Email reports for the funnel.

  Schema (`application/json`):

  - `email_sequences` (array<object>) — List of email sequences with campaign data.
    - `id` (integer) — Sequence ID.
    - `funnel_id` (integer)
    - `action_name` (string) — Always `send_custom_email` for email sequences.
    - `title` (string)
    - `sequence` (integer) — Order position.
    - `settings` (object)
      - _(object)_
    - `campaign` (object) — Associated campaign data with performance stats.
      - `subject` (string) — Email subject line.
      - `id` (integer) — Campaign ID.
      - `stats` (object) — Campaign performance statistics.
        - `total` (integer) — Total emails sent.
        - `opens` (integer) — Total opens.
        - `clicks` (integer) — Total clicks.
        - `unsubscribes` (integer) — Total unsubscribes.
        - `revenue` (number) — Revenue generated.
      - `status` (string) — Campaign status.
      - `open_tracking_status` (string) — Open tracking enabled status.
      - `click_tracking_status` (string) — Click tracking enabled status.

  Example:

```json
{
  "email_sequences": [
    {
      "id": 5,
      "funnel_id": 1,
      "action_name": "send_custom_email",
      "title": "Send Welcome Email",
      "sequence": 2,
      "campaign": {
        "subject": "Welcome to Our Service!",
        "id": 10,
        "stats": {
          "total": 150,
          "opens": 89,
          "clicks": 32,
          "unsubscribes": 2,
          "revenue": 0
        },
        "status": "published",
        "open_tracking_status": "yes",
        "click_tracking_status": "yes"
      }
    }
  ]
}
```


- **404** — Funnel not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/funnels/{id}/report`

**GET Get Funnel Report**

Retrieve statistical reporting data for a specific automation funnel. Returns aggregated stats generated by the Reporting service.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |


**Responses**

- **200** — Funnel report statistics.

  Schema (`application/json`):

  - `stats` (object) — Aggregated funnel statistics from the Reporting service.
    - _(object)_

  Example:

```json
{
  "stats": {}
}
```



---

## GET `/funnels/{id}/subscribers/{contact_id}`

**GET Get Funnel Subscriber Reporting**

Retrieve detailed reporting for a specific subscriber within a funnel. Returns the subscriber's funnel progress, metrics, and all funnel sequences.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |
| `contact_id` | integer | yes | The subscriber/contact ID. |


**Responses**

- **200** — Subscriber reporting data.

  Schema (`application/json`):

  - `funnel_subscriber` (object,null) — The funnel subscriber record with progress details, or null if the subscriber is not in this funnel.
    - `id` (integer)
    - `funnel_id` (integer)
    - `subscriber_id` (integer)
    - `status` (string) _(enum: `active`, `completed`, `cancelled`, `pending`, `waiting`)_
    - `last_sequence_id` (integer,null)
    - `next_sequence_id` (integer,null)
    - `next_execution_time` (string,null) _(format: date-time)_
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_
    - `last_sequence` (object,null)
    - `next_sequence_item` (object,null)
    - `metrics` (array<object>)
      - `id` (integer)
      - `funnel_id` (integer)
      - `sequence_id` (integer)
      - `subscriber_id` (integer)
      - `benchmark_value` (number)
      - `benchmark_currency` (string)
      - `status` (string)
      - `notes` (string,null)
      - `created_at` (string) _(format: date-time)_
      - `updated_at` (string) _(format: date-time)_
  - `sequences` (array<object>) — All sequences in this funnel ordered by position.
    - `id` (integer) — Sequence ID.
    - `funnel_id` (integer) — Associated funnel ID.
    - `action_name` (string) — Action identifier.
    - `title` (string) — Sequence title.
    - `type` (string) _(enum: `action`, `conditional`, `benchmark`)_ — Sequence type.
    - `settings` (object) — Action-specific settings.
      - _(object)_
    - `conditions` (array<object>) — Step-level conditions.
      - _(object)_
    - `sequence` (integer) — Order position.
    - `delay` (integer) — Delay in seconds.
    - `c_delay` (integer) — Cumulative delay in seconds.
    - `status` (string) — Sequence status.
    - `parent_id` (integer) — Parent sequence ID (0 for root).
    - `condition_type` (string,null) — Branch type for conditional children.
    - `children` (object) — Child sequences for conditional blocks.
      - `yes` (array<FunnelSequence>)
      - `no` (array<FunnelSequence>)
    - `created_by` (integer)
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_

  Example:

```json
{
  "funnel_subscriber": {
    "id": 1,
    "funnel_id": 1,
    "subscriber_id": 42,
    "status": "active",
    "last_sequence_id": 3,
    "next_sequence_id": 4,
    "next_execution_time": "2024-03-02 10:00:00",
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 14:30:00",
    "metrics": []
  },
  "sequences": []
}
```


- **404** — Funnel or subscriber not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/funnels/{id}/subscribers`

**GET Get Funnel Subscribers**

Retrieve a paginated list of subscribers enrolled in a specific automation funnel. Includes subscriber details, sequence progress, and metrics. Supports filtering by search, status, and sequence ID. Optionally includes the funnel object and sequence list.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search subscribers by name or email. |
| `status` | string | no | Filter by funnel subscriber status. Use `all` to include all statuses. |
| `sequence_id` | integer | no | Filter subscribers that have metrics for a specific sequence ID. |
| `with[]` | array<string> | no | Include additional data. Supported values: `funnel`, `sequences`. |
| `per_page` | integer | no | Number of subscribers per page. |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Paginated list of funnel subscribers.

  Schema (`application/json`):

  - `funnel_subscribers` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `data` (array<object>)
      - `id` (integer) — Funnel subscriber ID.
      - `funnel_id` (integer) — Associated funnel ID.
      - `subscriber_id` (integer) — Associated subscriber/contact ID.
      - `status` (string) _(enum: `active`, `completed`, `cancelled`, `pending`, `waiting`)_ — Current status in the funnel.
      - `last_sequence_id` (integer,null) — ID of the last executed sequence.
      - `next_sequence_id` (integer,null) — ID of the next sequence to execute.
      - `next_execution_time` (string,null) _(format: date-time)_ — Scheduled time for next sequence execution.
      - `created_at` (string) _(format: date-time)_
      - `updated_at` (string) _(format: date-time)_
      - `subscriber` (object) — The associated contact object.
        - _(object)_
      - `last_sequence` (object,null) — The last executed sequence object.
      - `next_sequence_item` (object,null) — The next sequence item object.
      - `funnel` (object)
        - `id` (integer) — Unique identifier for the funnel.
        - `title` (string) — Funnel title.
        - `trigger_name` (string) — The trigger event name that starts this funnel.
        - `status` (string) _(enum: `draft`, `published`)_ — Funnel status.
        - `conditions` (array<object>) — Funnel-level conditions.
          - _(object)_
        - `settings` (object) — Funnel settings.
          - _(object)_
        - `created_by` (integer) — WordPress user ID of the creator.
        - `created_at` (string) _(format: date-time)_ — Timestamp when the funnel was created.
        - `updated_at` (string) _(format: date-time)_ — Timestamp when the funnel was last updated.
        - `subscribers_count` (integer) — Number of subscribers in this funnel.
        - `description` (string,null) — Funnel description stored as meta.
        - `labels` (array<FunnelLabel>) — Labels assigned to the funnel.
      - `metrics` (array<FunnelMetric>) — Funnel metrics for this subscriber.
  - `funnel` (object)
    - `id` (integer) — Unique identifier for the funnel.
    - `title` (string) — Funnel title.
    - `trigger_name` (string) — The trigger event name that starts this funnel.
    - `status` (string) _(enum: `draft`, `published`)_ — Funnel status.
    - `conditions` (array<object>) — Funnel-level conditions.
      - _(object)_
    - `settings` (object) — Funnel settings.
      - _(object)_
    - `created_by` (integer) — WordPress user ID of the creator.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the funnel was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the funnel was last updated.
    - `subscribers_count` (integer) — Number of subscribers in this funnel.
    - `description` (string,null) — Funnel description stored as meta.
    - `labels` (array<FunnelLabel>) — Labels assigned to the funnel.
  - `sequences` (array<object>) — List of funnel sequences ordered by position. Only included when `with[]` contains `sequences`.
    - `id` (integer) — Sequence ID.
    - `funnel_id` (integer) — Associated funnel ID.
    - `action_name` (string) — Action identifier.
    - `title` (string) — Sequence title.
    - `type` (string) _(enum: `action`, `conditional`, `benchmark`)_ — Sequence type.
    - `settings` (object) — Action-specific settings.
      - _(object)_
    - `conditions` (array<object>) — Step-level conditions.
      - _(object)_
    - `sequence` (integer) — Order position.
    - `delay` (integer) — Delay in seconds.
    - `c_delay` (integer) — Cumulative delay in seconds.
    - `status` (string) — Sequence status.
    - `parent_id` (integer) — Parent sequence ID (0 for root).
    - `condition_type` (string,null) — Branch type for conditional children.
    - `children` (object) — Child sequences for conditional blocks.
      - `yes` (array<FunnelSequence>)
      - `no` (array<FunnelSequence>)
    - `created_by` (integer)
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_

  Example:

```json
{
  "funnel_subscribers": {
    "total": 120,
    "per_page": 15,
    "current_page": 1,
    "last_page": 8,
    "data": []
  }
}
```


- **404** — Funnel not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/funnels/{id}/syncable-counts`

**GET Get Funnel Syncable Counts**

Get the count of subscribers who completed the funnel but stopped before the latest action step. These subscribers can potentially be synced to new steps added to the funnel. Only counts subscribers with `completed` funnel status and `subscribed` contact status.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |


**Responses**

- **200** — Count of syncable subscribers.

  Schema (`application/json`):

  - `syncable_count` (integer) — Number of completed subscribers that can be synced to new steps.

  Example:

```json
{
  "syncable_count": 25
}
```


- **404** — Funnel not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/funnels/templates`

**GET Get Funnel Templates**

Retrieve available funnel templates from the remote template repository. Returns templates filtered by active plugin dependencies, all templates, and allowed dependency categories.

**Auth:** ApplicationPasswords

**Responses**

- **200** — List of funnel templates.

  Schema (`application/json`):

  - `templates` (array<FunnelTemplate>) — Templates filtered to only those whose dependencies are satisfied by active plugins.
  - `all` (array<FunnelTemplate>) — All available templates regardless of dependencies.
  - `cats` (array<string>) — List of allowed dependency categories based on active plugins.

  Example:

```json
{
  "templates": [
    {
      "id": 1,
      "title": "Welcome Email Series",
      "short_description": "A 3-part welcome email series for new subscribers.",
      "type": "email_sequence",
      "dependencies": [],
      "content": "https://fluentcrm.com/wp-content/templates/welcome.json",
      "link": "https://fluentcrm.com/templates/welcome-email-series/",
      "media": "",
      "status": "publish"
    }
  ],
  "all": [],
  "cats": [
    "fluentforms",
    "woocommerce",
    "fluentcrm_pro"
  ]
}
```



---

## GET `/funnels/triggers`

**GET Get Funnel Triggers**

Retrieve all available funnel trigger definitions. Returns a map of trigger names to their configuration objects including labels, categories, and descriptions.

**Auth:** ApplicationPasswords

**Responses**

- **200** — Map of available funnel triggers.

  Schema (`application/json`):

  - `triggers` (object) — Map of trigger definitions keyed by trigger name.
    - _(object)_

  Example:

```json
{
  "triggers": {
    "fluent_crm/contact_created": {
      "label": "Contact Created",
      "category": "CRM",
      "description": "Triggered when a new contact is created"
    },
    "fluentcrm_contact_added_to_tags": {
      "label": "Tag Applied",
      "category": "CRM",
      "description": "Triggered when a tag is applied to a contact"
    }
  }
}
```



---

## GET `/funnels/subscriber/{subscriber_id}/automations`

**GET Get Subscriber Automations**

Retrieve a paginated list of all automation funnels a specific subscriber/contact is enrolled in, including the associated funnel details and sequence progress.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscriber_id` | integer | yes | The subscriber/contact ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of automations per page. |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Paginated list of subscriber automations.

  Schema (`application/json`):

  - `automations` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `data` (array<object>)
      - `id` (integer) — Funnel subscriber record ID.
      - `funnel_id` (integer)
      - `subscriber_id` (integer)
      - `status` (string) _(enum: `active`, `completed`, `cancelled`, `pending`, `waiting`)_
      - `last_sequence_id` (integer,null)
      - `next_sequence_id` (integer,null)
      - `next_execution_time` (string,null) _(format: date-time)_
      - `created_at` (string) _(format: date-time)_
      - `updated_at` (string) _(format: date-time)_
      - `funnel` (object)
        - `id` (integer) — Unique identifier for the funnel.
        - `title` (string) — Funnel title.
        - `trigger_name` (string) — The trigger event name that starts this funnel.
        - `status` (string) _(enum: `draft`, `published`)_ — Funnel status.
        - `conditions` (array<object>) — Funnel-level conditions.
          - _(object)_
        - `settings` (object) — Funnel settings.
          - _(object)_
        - `created_by` (integer) — WordPress user ID of the creator.
        - `created_at` (string) _(format: date-time)_ — Timestamp when the funnel was created.
        - `updated_at` (string) _(format: date-time)_ — Timestamp when the funnel was last updated.
        - `subscribers_count` (integer) — Number of subscribers in this funnel.
        - `description` (string,null) — Funnel description stored as meta.
        - `labels` (array<FunnelLabel>) — Labels assigned to the funnel.
      - `last_sequence` (object,null) — The last executed sequence.
      - `next_sequence_item` (object,null) — The next sequence item.

  Example:

```json
{
  "automations": {
    "total": 2,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "data": [
      {
        "id": 1,
        "funnel_id": 1,
        "subscriber_id": 42,
        "status": "active",
        "last_sequence_id": 3,
        "next_sequence_id": 4,
        "next_execution_time": "2024-03-02 10:00:00",
        "created_at": "2024-03-01 10:00:00",
        "updated_at": "2024-03-01 14:30:00"
      }
    ]
  }
}
```



---

## POST `/funnels/import`

**POST Import Funnel**

Import an automation funnel from exported data. Creates a new funnel in `draft` status with all sequences and labels from the provided data.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `funnel` (object) **required** — Funnel data including title, trigger_name, conditions, settings, and labels.
  - `title` (string) — Funnel title.
  - `trigger_name` (string) — Trigger event name.
  - `conditions` (array<object>) — Funnel conditions.
    - _(object)_
  - `settings` (object) — Funnel settings.
    - _(object)_
  - `labels` (array<object>) — Labels to import or match.
    - `slug` (string)
    - `title` (string)
    - `color` (string)
- `sequences` (array,string) **required** — Array of funnel sequence objects, or a JSON string that will be parsed.

Example:

```json
{
  "funnel": {
    "title": "Imported Funnel",
    "trigger_name": "fluent_crm/contact_created",
    "conditions": [],
    "settings": {}
  },
  "sequences": []
}
```


**Responses**

- **200** — Funnel imported successfully.

  Schema (`application/json`):

  - `message` (string)
  - `funnel` (object)
    - `id` (integer) — Unique identifier for the funnel.
    - `title` (string) — Funnel title.
    - `trigger_name` (string) — The trigger event name that starts this funnel.
    - `status` (string) _(enum: `draft`, `published`)_ — Funnel status.
    - `conditions` (array<object>) — Funnel-level conditions.
      - _(object)_
    - `settings` (object) — Funnel settings.
      - _(object)_
    - `created_by` (integer) — WordPress user ID of the creator.
    - `created_at` (string) _(format: date-time)_ — Timestamp when the funnel was created.
    - `updated_at` (string) _(format: date-time)_ — Timestamp when the funnel was last updated.
    - `subscribers_count` (integer) — Number of subscribers in this funnel.
    - `description` (string,null) — Funnel description stored as meta.
    - `labels` (array<FunnelLabel>) — Labels assigned to the funnel.

  Example:

```json
{
  "message": "Funnel has been successfully imported",
  "funnel": {
    "id": 7,
    "title": "Imported Funnel",
    "trigger_name": "fluent_crm/contact_created",
    "status": "draft",
    "created_by": 1,
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 10:00:00"
  }
}
```



---

## GET `/funnels`

**GET List Funnels**

Retrieve a paginated list of automation funnels. Supports sorting, searching by title, and filtering by label IDs. Optionally includes trigger definitions.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `sort_by` | string | no | Column to sort by. |
| `sort_type` | string | no | Sort direction. |
| `search` | string | no | Search funnels by title (partial match). |
| `labels[]` | array<integer> | no | Filter funnels by label IDs. |
| `with[]` | array<string> | no | Include additional related data. Supported values: `triggers`. |
| `per_page` | integer | no | Number of funnels per page. |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Paginated list of funnels.

  Schema (`application/json`):

  - `funnels` (object)
    - `total` (integer) — Total number of funnels matching the query.
    - `per_page` (integer) — Number of funnels per page.
    - `current_page` (integer) — Current page number.
    - `last_page` (integer) — Last page number.
    - `next_page_url` (string,null) — URL for the next page, or null if on the last page.
    - `prev_page_url` (string,null) — URL for the previous page, or null if on the first page.
    - `from` (integer) — Starting record index on this page.
    - `to` (integer) — Ending record index on this page.
    - `data` (array<Funnel>)
  - `triggers` (object) — Map of trigger definitions keyed by trigger name. Only included when `with[]` contains `triggers`.
    - _(object)_

  Example:

```json
{
  "funnels": {
    "total": 5,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "next_page_url": null,
    "prev_page_url": null,
    "from": 1,
    "to": 5,
    "data": [
      {
        "id": 1,
        "title": "Welcome Email Sequence",
        "trigger_name": "fluent_crm/contact_created",
        "status": "published",
        "conditions": [],
        "settings": {},
        "created_by": 1,
        "created_at": "2024-01-15 10:30:00",
        "updated_at": "2024-03-01 14:30:00",
        "subscribers_count": 120,
        "description": "Sends welcome emails to new contacts",
        "labels": [
          {
            "id": 1,
            "title": "Onboarding",
            "slug": "onboarding",
            "color": "#4CAF50"
          }
        ]
      }
    ]
  }
}
```



---

## POST `/funnels/remove-bulk-subscribers`

**POST Remove Bulk Subscribers from Funnels**

Remove multiple subscribers from their associated automation funnels by funnel subscriber IDs. Also deletes the related funnel metrics for each removed subscriber.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `funnel_subscriber_ids` (array<integer>) **required** — Array of funnel subscriber IDs to remove.

Example:

```json
{
  "funnel_subscriber_ids": [
    1,
    2,
    3
  ]
}
```


**Responses**

- **200** — Subscribers removed successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Selected subscribers have been removed from this automation funnel"
}
```


- **422** — No funnel subscriber IDs provided.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Please provide funnel subscriber IDs"
}
```



---

## POST `/funnels/funnel/save-email-action-fallback`

**POST Save Email Action (Fallback)**

Fallback endpoint to save a funnel email action when the funnel ID is provided in the request body instead of the URL path. Creates or updates a funnel email campaign associated with the funnel.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `funnel_id` (integer) **required** — The funnel ID this email action belongs to.
- `action_data` (object,string) **required** — Email action data object or JSON string. Must include `campaign` object with email details.
  - `campaign` (object) — Campaign data including email subject, body, settings.
    - `id` (integer,null) — Existing campaign ID for updates, null for new.
    - `email_subject` (string)
    - `email_pre_header` (string)
    - `email_body` (string)
    - `design_template` (string)
    - `settings` (object)
      - _(object)_
  - `mailer_settings` (object) — Email mailer settings.
    - _(object)_

Example:

```json
{
  "funnel_id": 1,
  "action_data": {
    "campaign": {
      "email_subject": "Welcome!",
      "email_body": "<p>Hello {{contact.first_name}}</p>",
      "design_template": "simple"
    }
  }
}
```


**Responses**

- **200** — Email action saved successfully.

  Schema (`application/json`):

  - `type` (string) _(enum: `created`, `updated`)_ — Whether the campaign was created or updated.
  - `reference_campaign` (integer) — The funnel campaign ID.
  - `campaign` (object) — The campaign data.
    - _(object)_

  Example:

```json
{
  "type": "created",
  "reference_campaign": 10,
  "campaign": {
    "email_subject": "Welcome!",
    "email_body": "<p>Hello {{contact.first_name}}</p>"
  }
}
```



---

## POST `/funnels/{id}/sequences/save-email-action`

**POST Save Funnel Email Action**

Create or update a funnel email campaign associated with a specific funnel. If a campaign ID is provided and matches the funnel, it updates the existing campaign; otherwise, it creates a new one. Also handles visual builder design data.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |


**Request body** (`application/json`, required)

- `action_data` (object,string) **required** — Email action data object or JSON string containing campaign details.
  - `campaign` (object) — Campaign data.
    - `id` (integer,null) — Existing campaign ID for updates.
    - `email_subject` (string) — Email subject line.
    - `email_pre_header` (string) — Email pre-header text.
    - `email_body` (string) — Email HTML body content.
    - `design_template` (string) — Design template type (e.g., `simple`, `visual_builder`).
    - `settings` (object) — Campaign settings.
      - _(object)_
    - `_visual_builder_design` (object) — Visual builder design data. Only used when `design_template` is `visual_builder`.
      - _(object)_
  - `mailer_settings` (object) — Email mailer configuration.
    - _(object)_

Example:

```json
{
  "action_data": {
    "campaign": {
      "email_subject": "Welcome to Our Service!",
      "email_body": "<p>Hello {{contact.first_name}},</p><p>Welcome!</p>",
      "design_template": "simple",
      "settings": {}
    },
    "mailer_settings": {}
  }
}
```


**Responses**

- **200** — Email action saved successfully.

  Schema (`application/json`):

  - `type` (string) _(enum: `created`, `updated`)_ — Whether the campaign was created or updated.
  - `reference_campaign` (integer) — The funnel campaign ID.
  - `campaign` (object) — The saved campaign data.
    - _(object)_

  Example:

```json
{
  "type": "created",
  "reference_campaign": 10,
  "campaign": {
    "email_subject": "Welcome to Our Service!",
    "email_body": "<p>Hello {{contact.first_name}},</p><p>Welcome!</p>"
  }
}
```



---

## POST `/funnels/{id}/sequences`

**POST Save Funnel Sequences**

Save or update the sequences (action steps) for a specific automation funnel. This replaces all existing sequences with the provided data and returns the formatted sequence tree with conditional branches.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |


**Request body** (`application/json`, required)

- `sequences` (array<object>) — Array of sequence objects to save.
  - `action_name` (string) — The action identifier for this sequence step.
  - `title` (string) — Human-readable title for the sequence.
  - `type` (string) _(enum: `action`, `conditional`, `benchmark`)_ — Sequence type.
  - `settings` (object) — Action-specific settings.
    - _(object)_
  - `delay` (integer) — Delay in seconds before executing this step.
  - `parent_id` (integer,null) — Parent sequence ID for conditional branches.
  - `condition_type` (string,null) — Branch type: `yes` or `no` for conditional children.
- `conditions` (array<object>) — Funnel-level conditions.
  - _(object)_
- `settings` (object) — Funnel settings.
  - _(object)_
- `status` (string) _(enum: `draft`, `published`)_ — Funnel status to set.

Example:

```json
{
  "sequences": [
    {
      "action_name": "fluentcrm_wait_times",
      "title": "Wait 1 Day",
      "type": "action",
      "settings": {
        "wait_type": "unit_wait",
        "wait_time_amount": 1,
        "wait_time_unit": "days"
      }
    },
    {
      "action_name": "send_custom_email",
      "title": "Send Welcome Email",
      "type": "action",
      "settings": {
        "reference_campaign": 10
      }
    }
  ],
  "status": "published"
}
```


**Responses**

- **200** — Sequences saved successfully.

  Schema (`application/json`):

  - `sequences` (array<object>)
    - `id` (integer) — Sequence ID.
    - `funnel_id` (integer) — Associated funnel ID.
    - `action_name` (string) — Action identifier.
    - `title` (string) — Sequence title.
    - `type` (string) _(enum: `action`, `conditional`, `benchmark`)_ — Sequence type.
    - `settings` (object) — Action-specific settings.
      - _(object)_
    - `conditions` (array<object>) — Step-level conditions.
      - _(object)_
    - `sequence` (integer) — Order position.
    - `delay` (integer) — Delay in seconds.
    - `c_delay` (integer) — Cumulative delay in seconds.
    - `status` (string) — Sequence status.
    - `parent_id` (integer) — Parent sequence ID (0 for root).
    - `condition_type` (string,null) — Branch type for conditional children.
    - `children` (object) — Child sequences for conditional blocks.
      - `yes` (array<FunnelSequence>)
      - `no` (array<FunnelSequence>)
    - `created_by` (integer)
    - `created_at` (string) _(format: date-time)_
    - `updated_at` (string) _(format: date-time)_
  - `message` (string)

  Example:

```json
{
  "sequences": [],
  "message": "Sequence successfully updated"
}
```



---

## POST `/funnels/funnel/save-funnel-sequences`

**POST Save Funnel Sequences (Fallback)**

Fallback endpoint to save funnel sequences when the funnel ID is provided in the request body instead of the URL path. Delegates to the same logic as the primary save sequences endpoint.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `funnel_id` (integer) **required** — The funnel ID to save sequences for.
- `sequences` (array<FunnelSequenceInput>) — Array of sequence objects to save.
- `conditions` (array<object>) — Funnel-level conditions.
  - _(object)_
- `settings` (object) — Funnel settings.
  - _(object)_
- `status` (string) _(enum: `draft`, `published`)_ — Funnel status to set.

Example:

```json
{
  "funnel_id": 1,
  "sequences": [],
  "status": "published"
}
```


**Responses**

- **200** — Sequences saved successfully.

  Schema (`application/json`):

  - `sequences` (array<FunnelSequence>)
  - `message` (string)

  Example:

```json
{
  "sequences": [],
  "message": "Sequence successfully updated"
}
```



---

## POST `/funnels/send-test-webhook`

**POST Send Test Webhook**

Send a test webhook request to a remote URL using sample subscriber data. Uses the current user's email to find a subscriber, or falls back to any subscribed contact. Supports GET and POST methods with custom headers and body data. Body data can be subscriber data or custom key-value pairs.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `data` (object) **required**
  - `remote_url` (string) **required** _(format: uri)_ — The webhook URL to send the test request to.
  - `sending_method` (string) _(enum: `GET`, `POST`)_ — HTTP method for the webhook request.
  - `request_format` (string) _(enum: `default`, `json`)_ — Request body format. When `json` with POST method, sends Content-Type as `application/json`.
  - `body_data_type` (string) _(enum: `subscriber_data`, `custom`)_ — `subscriber_data` sends the full subscriber object; `custom` sends key-value pairs from `body_data_values`.
  - `body_data_values` (array<object>) — Custom key-value pairs for the request body. Used when `body_data_type` is `custom`.
    - `data_key` (string) — Field name.
    - `data_value` (string) — Field value. Supports SmartCode parsing (e.g., `{{contact.email}}`).
  - `header_type` (string) _(enum: `no_header`, `with_headers`)_ — Whether to include custom headers.
  - `header_data` (array<object>) — Custom headers. Used when `header_type` is `with_headers`.
    - `data_key` (string) — Header name.
    - `data_value` (string) — Header value. Supports SmartCode parsing.

Example:

```json
{
  "data": {
    "remote_url": "https://hooks.example.com/webhook",
    "sending_method": "POST",
    "request_format": "json",
    "body_data_type": "subscriber_data",
    "body_data_values": [],
    "header_type": "no_header",
    "header_data": []
  }
}
```


**Responses**

- **200** — Test webhook sent successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Test Webhook has been sent successfully"
}
```


- **422** — Validation error or webhook failed.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Remote URL is required"
}
```



---

## POST `/funnels/{id}/sync-new-steps`

**POST Sync Funnel New Steps**

Sync completed subscribers to newly added steps in a funnel. Requires the funnel to be in `published` status and FluentCRM Pro to be active. Re-enrolls completed subscribers that stopped before the latest steps.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |


**Responses**

- **200** — Steps synced successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Synced successfully"
}
```


- **422** — Funnel not published or Pro not active.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Funnel status need to be published"
}
```



---

## PUT `/funnels/{id}/update-labels`

**PUT Update Funnel Labels**

Attach or detach labels from a specific automation funnel. Use the `action` parameter to specify whether to attach or detach the provided label IDs.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |


**Request body** (`application/json`, required)

- `action` (string) **required** _(enum: `attach`, `detach`)_ — Whether to attach or detach the labels.
- `label_ids` (array<integer>) **required** — Array of label IDs to attach or detach.

Example:

```json
{
  "action": "attach",
  "label_ids": [
    1,
    3
  ]
}
```


**Responses**

- **200** — Labels updated successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Labels has been updated"
}
```


- **404** — Funnel not found.

  Schema (`application/json`):

  - `message` (string)

---

## PUT `/funnels/{id}`

**PUT Update Funnel Property**

Update the status of an automation funnel. Only allows changing between `draft` and `published` statuses. Returns an error if the funnel already has the requested status.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |


**Request body** (`application/json`, required)

- `status` (string) **required** _(enum: `draft`, `published`)_ — The new status for the funnel.

Example:

```json
{
  "status": "published"
}
```


**Responses**

- **200** — Status updated successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Status has been updated to published"
}
```


- **404** — Funnel not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — Invalid status value or same status.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Funnel already have the same status"
}
```



---

## PUT `/funnels/{id}/subscribers/{subscriber_id}/status`

**PUT Update Funnel Subscription Status**

Update the status of a subscriber within a specific funnel. Cannot change status if the subscriber is already in `completed` state. Allowed target statuses are `active`, `completed`, and `cancelled`.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |
| `subscriber_id` | integer | yes | The subscriber/contact ID. |


**Request body** (`application/json`, required)

- `status` (string) **required** _(enum: `active`, `completed`, `cancelled`)_ — The new subscription status.

Example:

```json
{
  "status": "cancelled"
}
```


**Responses**

- **200** — Status updated successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Status has been updated to cancelled"
}
```


- **422** — Invalid status or subscriber already completed.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Invalid subscription status"
}
```



---

## PUT `/funnels/funnel/{id}/title`

**PUT Update Funnel Title**

Update the title of an automation funnel. Returns an error if the new title is the same as the current title.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The funnel ID. |


**Request body** (`application/json`, required)

- `title` (string) **required** — The new funnel title.

Example:

```json
{
  "title": "Updated Funnel Name"
}
```


**Responses**

- **200** — Title updated successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Title has been updated to Updated Funnel Name"
}
```


- **404** — Funnel not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — Title is the same as the current title.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Funnel already have the same title"
}
```



---
