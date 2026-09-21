# FluentCRM API — Email Sequences (Pro)

19 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/sequences/{id}/subscribers`

**POST Add Sequence Subscribers**

Subscribe contacts to an email sequence. Supports filtering by lists, tags, dynamic segments, or advanced filters. Subscribers already enrolled in the sequence are automatically excluded. Processes subscribers in batches (default 200 per request) -- use pagination for large sets. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The sequence ID. |


**Request body** (`application/json`, required)

- `subscribers` (object) — Subscriber selection criteria including lists and tags.
  - `lists` (array<integer>) — List IDs to include.
  - `tags` (array<integer>) — Tag IDs to include.
- `excludedSubscribers` (object) — Subscriber exclusion criteria.
  - `lists` (array<integer>) — List IDs to exclude.
  - `tags` (array<integer>) — Tag IDs to exclude.
- `sending_filter` (string) _(enum: `list_tag`, `dynamic_segment`, `advanced_filters`; default: `list_tag`)_ — Filter type for selecting subscribers.
- `dynamic_segment` (object) — Dynamic segment configuration (when `sending_filter` is `dynamic_segment`).
  - _(object)_
- `advanced_filters` (array<object>) — Advanced filter groups (when `sending_filter` is `advanced_filters`).
  - _(object)_
- `page` (integer) _(default: `1`)_ — Page number for batch processing.

Example:

```json
{
  "subscribers": {
    "lists": [
      1,
      2
    ],
    "tags": [
      3
    ]
  },
  "excludedSubscribers": {
    "tags": [
      5
    ]
  },
  "sending_filter": "list_tag"
}
```


**Responses**

- **200** — Subscribers added to the sequence. Check `remaining` to determine if more batches need processing.

  Schema (`application/json`):

  - `total` (integer) — Total number of new subscribers to add (excluding already enrolled).
  - `remaining` (integer) — Number of subscribers remaining to process in subsequent requests.
  - `next_page` (integer) — Next page number for batch processing.
  - `page_total` (integer) — Total number of pages needed.
  - `in_total` (integer) — Total matching subscribers before excluding already enrolled.

  Example:

```json
{
  "total": 500,
  "remaining": 300,
  "next_page": 2,
  "page_total": 3,
  "in_total": 520
}
```


- **422** — No subscribers found matching the selection criteria.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "No Subscribers found based on your selection"
}
```



---

## POST `/sequences/do-bulk-action`

**POST Bulk Action Sequences**

Permanently delete multiple email sequences in bulk. Removes all associated sequence emails, campaign emails, URL metrics, and campaign metadata. Use `select_all` to delete all sequences. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `sequence_ids` (array<integer>) — Array of sequence IDs to delete.
- `select_all` (string) _(enum: `true`, `false`)_ — If `true`, deletes all sequences regardless of `sequence_ids`.

Example:

```json
{
  "sequence_ids": [
    1,
    2,
    5
  ]
}
```


**Responses**

- **200** — Sequences deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Selected Sequences has been deleted permanently"
}
```


- **422** — No sequence IDs provided.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Please provide email sequence IDs"
}
```



---

## POST `/sequences/sequence-email-update-create`

**POST Create or Update Sequence Email**

A fallback route that creates or updates a sequence email based on the `route_method` parameter. Use `create` to create a new email or `update` to update an existing one. This endpoint exists as a workaround for routes that need to handle both operations. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `route_method` (string) **required** _(enum: `create`, `update`)_ — Operation to perform.
- `sequence_id` (integer) **required** — The parent sequence ID.
- `mail_id` (integer) — The sequence email ID to update (required when `route_method` is `update`).
- `email` (object) **required** — Email data object (same structure as create/update sequence email endpoints).
  - `email_subject` (string) — Email subject line.
  - `email_pre_header` (string) — Email pre-header text.
  - `email_body` (string) — Email body content (HTML).
  - `design_template` (string) — Design template.
  - `template_id` (integer) — Template ID.
  - `settings` (object) — Email settings.
    - _(object)_
  - `utm_status` (integer)
  - `utm_source` (string)
  - `utm_medium` (string)
  - `utm_campaign` (string)
  - `utm_term` (string)
  - `utm_content` (string)
  - `_visual_builder_design` (object) — Visual builder design data.
    - _(object)_

Example:

```json
{
  "route_method": "create",
  "sequence_id": 1,
  "email": {
    "email_subject": "Day 2: Tips & Tricks",
    "email_body": "<p>Here are some tips...</p>",
    "design_template": "simple",
    "template_id": 0,
    "settings": {
      "timings": {
        "delay_unit": "days",
        "delay": "2",
        "is_anytime": "yes",
        "sending_time": ""
      }
    }
  }
}
```


**Responses**

- **200** — Sequence email created or updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `email` (SequenceEmail)

  Example:

```json
{
  "message": "Sequence email has been created",
  "email": {
    "id": 13,
    "parent_id": 1,
    "title": "Day 2: Tips & Tricks",
    "type": "sequence_mail",
    "status": "published",
    "email_subject": "Day 2: Tips & Tricks",
    "email_body": "<p>Here are some tips...</p>",
    "delay": 172800,
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 10:00:00"
  }
}
```


- **422** — Invalid route_method or data.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Invalid route_method"
}
```



---

## POST `/sequences`

**POST Create Sequence**

Create a new email sequence. The title must be unique across all campaigns. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `title` (string) **required** — Sequence title. Must be unique across all campaigns.

Example:

```json
{
  "title": "Welcome Onboarding Sequence"
}
```


**Responses**

- **200** — Sequence created successfully.

  Schema (`application/json`):

  - `sequence` (Sequence)
  - `message` (string)

  Example:

```json
{
  "sequence": {
    "id": 10,
    "title": "Welcome Onboarding Sequence",
    "slug": "welcome-onboarding-sequence",
    "status": "draft",
    "type": "email_sequence",
    "design_template": "simple",
    "settings": {
      "mailer_settings": {
        "from_name": "",
        "from_email": "",
        "reply_to_name": "",
        "reply_to_email": "",
        "is_custom": "no"
      }
    },
    "created_by": 1,
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 10:00:00"
  },
  "message": "Sequence has been created"
}
```


- **422** — Validation error (e.g., title is missing or not unique).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "title": [
      "The title has already been taken."
    ]
  }
}
```



---

## POST `/sequences/{id}/email`

**POST Create Sequence Email**

Create a new email within an email sequence. The email data is passed inside an `email` object. The title is automatically set from the email_subject. Mailer settings are inherited from the parent sequence. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The parent sequence ID. |


**Request body** (`application/json`, required)

- `email` (object) **required** — Email data object.
  - `email_subject` (string) **required** — Email subject line.
  - `email_pre_header` (string) — Email pre-header text.
  - `email_body` (string) **required** — Email body content (HTML).
  - `design_template` (string) — Design template (e.g., `simple`, `visual_builder`).
  - `template_id` (integer) — Template ID (0 if none).
  - `settings` (object) — Email settings including timing configuration.
    - `timings` (object)
      - `delay_unit` (string) _(enum: `days`, `hours`, `minutes`, `weeks`)_
      - `delay` (string,integer) — Delay value in the specified unit.
      - `is_anytime` (string) _(enum: `yes`, `no`)_
      - `sending_time` (any) — Sending time or time range.
      - `selected_days_only` (string) _(enum: `yes`, `no`)_
      - `allowed_days` (array<string>)
  - `utm_status` (integer) — Enable UTM tracking (1 = enabled, 0 = disabled).
  - `utm_source` (string) — UTM source parameter.
  - `utm_medium` (string) — UTM medium parameter.
  - `utm_campaign` (string) — UTM campaign parameter.
  - `utm_term` (string) — UTM term parameter.
  - `utm_content` (string) — UTM content parameter.
  - `_visual_builder_design` (object) — Visual builder design data (only when `design_template` is `visual_builder`).
    - _(object)_
  - `title` (string) — Accepted but ignored — the server overwrites `title` with `email_subject` before saving, so the email's title always mirrors its subject.

Example:

```json
{
  "email": {
    "email_subject": "Day 1: Getting Started",
    "email_pre_header": "Your first steps",
    "email_body": "<p>Welcome! Here is how to get started...</p>",
    "design_template": "simple",
    "template_id": 0,
    "settings": {
      "timings": {
        "delay_unit": "days",
        "delay": "1",
        "is_anytime": "yes",
        "sending_time": ""
      }
    }
  }
}
```


**Responses**

- **200** — Sequence email created successfully.

  Schema (`application/json`):

  - `message` (string)
  - `email` (SequenceEmail)

  Example:

```json
{
  "message": "Sequence email has been created",
  "email": {
    "id": 12,
    "parent_id": 1,
    "title": "Day 1: Getting Started",
    "type": "sequence_mail",
    "status": "published",
    "email_subject": "Day 1: Getting Started",
    "email_pre_header": "Your first steps",
    "email_body": "<p>Welcome! Here is how to get started...</p>",
    "delay": 86400,
    "design_template": "simple",
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 10:00:00"
  }
}
```


- **422** — Invalid request data.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Invalid Request"
}
```



---

## DELETE `/sequences/{id}`

**DELETE Delete Sequence**

Permanently delete an email sequence by ID. This also deletes all associated sequence emails, campaign emails, URL metrics, sequence trackers, and campaign metadata. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_manage_email_delete`

_Enforced by `SequencePolicy::delete()`._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The sequence ID to delete. |


**Responses**

- **200** — Sequence deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Email sequence successfully deleted"
}
```



---

## DELETE `/sequences/{id}/email/{email_id}`

**DELETE Delete Sequence Email**

Permanently delete a sequence email by ID. This also removes all associated campaign emails, URL metrics, and campaign metadata. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_manage_email_delete`

_Enforced by `SequencePolicy::delete()`._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The parent sequence ID. |
| `email_id` | integer | yes | The sequence email ID to delete. |


**Responses**

- **200** — Sequence email deleted successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Email sequence successfully deleted"
}
```



---

## POST `/sequences/{id}/duplicate`

**POST Duplicate Sequence**

Create a duplicate of an existing email sequence, including all its sequence emails and visual builder designs. The duplicated sequence title is prefixed with `[Duplicate]`. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The sequence ID to duplicate. |


**Responses**

- **200** — Sequence duplicated successfully.

  Schema (`application/json`):

  - `sequence` (Sequence)
  - `message` (string)

  Example:

```json
{
  "sequence": {
    "id": 11,
    "title": "[Duplicate] Welcome Sequence",
    "slug": "duplicate-welcome-sequence",
    "status": "draft",
    "type": "email_sequence",
    "design_template": "simple",
    "settings": {
      "mailer_settings": {
        "from_name": "",
        "from_email": "",
        "reply_to_name": "",
        "reply_to_email": "",
        "is_custom": "no"
      }
    },
    "created_at": "2024-03-02 14:00:00",
    "updated_at": "2024-03-02 14:00:00"
  },
  "message": "Selected sequence has been successfully duplicated"
}
```



---

## POST `/sequences/{id}/email/duplicate`

**POST Duplicate Sequence Email**

Create a duplicate of an existing sequence email within the same sequence. The duplicated email title is prefixed with `[Duplicate]`. Visual builder designs are also copied. Requires FluentCampaign Pro.

The duplicate is created from the stored record, not from the request: only `email_id` is read. The copy's title is the original's prefixed with `[Duplicate] `.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The sequence email ID to duplicate (note: despite the route parameter name, this is the email ID, not the sequence ID). |


**Request body** (`application/json`, required)

- `email_id` (integer) **required** — Id of the sequence email to duplicate. Required — a missing or zero value returns 422. The id is resolved scoped to the sequence in the path, so an email from another sequence returns 404.

Example:

```json
{
  "email_id": 41
}
```


**Responses**

- **200** — Sequence email duplicated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `email` (SequenceEmail)

  Example:

```json
{
  "message": "Sequence email has been duplicated",
  "email": {
    "id": 5,
    "parent_id": 1,
    "title": "Welcome Email",
    "type": "sequence_mail",
    "status": "published",
    "email_subject": "Welcome Email",
    "email_body": "<p>Welcome!</p>",
    "delay": 0,
    "design_template": "simple",
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 10:00:00"
  }
}
```



---

## GET `/sequences/{id}`

**GET Get Sequence**

Retrieve a single email sequence by ID. Optionally include the sequence emails and their individual statistics. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_read_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The sequence ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with[]` | array<string> | no | Include additional data. Use `sequence_emails` to include the sequence's emails. Use `email_stats` (requires `sequence_emails`) to include per-email statistics. |


**Responses**

- **200** — Sequence details.

  Schema (`application/json`):

  - `sequence` (Sequence)
  - `sequence_emails` (array<SequenceEmail>) — Sequence emails ordered by delay (only included when `with[]=sequence_emails`). Returned **only** when `with[]=sequence_emails` is requested.

  Example:

```json
{
  "sequence": {
    "id": 1,
    "title": "Welcome Sequence",
    "slug": "welcome-sequence",
    "status": "draft",
    "type": "email_sequence",
    "design_template": "simple",
    "settings": {
      "mailer_settings": {
        "from_name": "",
        "from_email": "",
        "reply_to_name": "",
        "reply_to_email": "",
        "is_custom": "no"
      }
    },
    "created_by": 1,
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 10:00:00"
  },
  "sequence_emails": [
    {
      "id": 5,
      "parent_id": 1,
      "title": "Welcome Email",
      "type": "sequence_mail",
      "status": "published",
      "email_subject": "Welcome Email",
      "email_pre_header": "Thanks for joining us",
      "email_body": "<p>Welcome!</p>",
      "delay": 0,
      "design_template": "simple",
      "created_at": "2024-03-01 10:00:00",
      "updated_at": "2024-03-01 10:00:00",
      "stats": {
        "total": 200,
        "sent": 150,
        "clicks": 45,
        "views": 120,
        "unsubscribers": 2,
        "revenue": false
      }
    }
  ]
}
```



---

## GET `/sequences/{id}/email/{email_id}`

**GET Get Sequence Email**

Retrieve a single sequence email by ID within a sequence. Optionally include the parent sequence data. If email_id is 0, returns an empty template for creating a new email. For visual builder emails, the `_visual_builder_design` field is included. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_read_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The parent sequence ID. |
| `email_id` | integer | yes | The sequence email ID. Use `0` to get an empty template. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `with[]` | array<string> | no | Include additional data. Use `sequence` to include the parent sequence. |


**Responses**

- **200** — Sequence email details.

  Schema (`application/json`):

  - `sequence` (any) — Parent sequence (only when `with[]=sequence`).
  - `email` (SequenceEmail)

  Example:

```json
{
  "sequence": {
    "id": 1,
    "title": "Welcome Sequence",
    "status": "draft",
    "type": "email_sequence"
  },
  "email": {
    "id": 5,
    "parent_id": 1,
    "title": "Welcome Email",
    "type": "sequence_mail",
    "status": "published",
    "design_template": "simple",
    "email_subject": "Welcome Email",
    "email_pre_header": "Thanks for joining",
    "email_body": "<p>Welcome to our community!</p>",
    "delay": 0,
    "settings": {
      "action_triggers": [],
      "timings": {
        "delay_unit": "days",
        "delay": "0",
        "is_anytime": "yes",
        "sending_time": ""
      },
      "template_config": {}
    },
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-01 10:00:00"
  }
}
```


- **422** — Sequence email not found.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sequence email could not be found"
}
```



---

## GET `/sequences/{id}/subscribers`

**GET Get Sequence Subscribers**

Retrieve a paginated list of subscribers enrolled in a specific email sequence. Each record includes the sequence tracker data and the associated subscriber. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_read_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The sequence ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of records per page. |
| `page` | integer | no | Page number for pagination. |
| `search` | string | no | Search the enrolled contacts. |
| `status` | string | no | Filter by enrolment status. `all` is treated as no filter. |
| `sort_by` | string | no | Column to sort by. Anything outside the allowed set falls back to `id`. |
| `sort_type` | string | no | Sort direction. Anything other than `ASC` is treated as `DESC`. |


**Responses**

- **200** — Paginated list of sequence subscribers with tracker data.

  Schema (`application/json`):

  - `total` (integer) — Total number of subscribers in this sequence.
  - `per_page` (integer) — Number of records per page.
  - `current_page` (integer) — Current page number.
  - `last_page` (integer) — Last page number.
  - `next_page_url` (string,null)
  - `prev_page_url` (string,null)
  - `from` (integer)
  - `to` (integer)
  - `data` (array<SequenceTracker>)
  - `first_page_url` (string) — URL of the first page.
  - `last_page_url` (string) — URL of the last page.
  - `path` (string) — Base path the paginator built its URLs from.
  - `links` (array<object>) — Rendered pagination links.
    - `url` (string,null) — Target page URL, or null for a disabled control.
    - `label` (string) — Link label.
    - `active` (boolean) — True for the current page.

  Example:

```json
{
  "total": 50,
  "per_page": 15,
  "current_page": 1,
  "last_page": 4,
  "next_page_url": "/wp-json/fluent-crm/v2/sequences/1/subscribers?page=2",
  "prev_page_url": null,
  "from": 1,
  "to": 15,
  "data": [
    {
      "id": 1,
      "campaign_id": 1,
      "subscriber_id": 42,
      "last_sequence_id": 5,
      "next_sequence_id": 6,
      "status": "active",
      "last_executed_time": "2024-03-01 10:00:00",
      "next_execution_time": "2024-03-02 10:00:00",
      "created_at": "2024-03-01 10:00:00",
      "updated_at": "2024-03-01 10:00:00",
      "subscriber": {
        "id": 42,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "status": "subscribed",
        "photo": "https://www.gravatar.com/avatar/abc123"
      }
    }
  ]
}
```



---

## GET `/sequences/subscriber/{subscriber_id}/sequences`

**GET Get Subscriber Sequences**

Retrieve all email sequences that a specific subscriber is enrolled in, including their tracking status, last/next sequence email details. Returns paginated sequence tracker records. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_read_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `subscriber_id` | integer | yes | The subscriber (contact) ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of records per page. |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Paginated list of sequence trackers for the subscriber.

  Schema (`application/json`):

  - `sequence_trackers` (object)
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `next_page_url` (string,null)
    - `prev_page_url` (string,null)
    - `from` (integer)
    - `to` (integer)
    - `data` (array<object>)
      - `id` (integer) — Tracker ID.
      - `campaign_id` (integer) — Parent sequence ID.
      - `subscriber_id` (integer) — Subscriber ID.
      - `last_sequence_id` (integer,null) — ID of the last sent sequence email.
      - `next_sequence_id` (integer,null) — ID of the next sequence email to send.
      - `status` (string) _(enum: `active`, `completed`, `cancelled`)_
      - `last_executed_time` (string,null) _(format: date-time)_
      - `next_execution_time` (string,null) _(format: date-time)_
      - `notes` (array,null) — Execution notes/history.
      - `created_at` (string) _(format: date-time)_
      - `updated_at` (string) _(format: date-time)_
      - `sequence` (Sequence)
      - `last_sequence` (SequenceEmail)
      - `next_sequence` (SequenceEmail)

  Example:

```json
{
  "sequence_trackers": {
    "total": 2,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "next_page_url": null,
    "prev_page_url": null,
    "from": 1,
    "to": 2,
    "data": [
      {
        "id": 1,
        "campaign_id": 5,
        "subscriber_id": 42,
        "last_sequence_id": 10,
        "next_sequence_id": 11,
        "status": "active",
        "last_executed_time": "2024-03-01 10:00:00",
        "next_execution_time": "2024-03-03 10:00:00",
        "notes": [],
        "created_at": "2024-03-01 10:00:00",
        "updated_at": "2024-03-01 10:00:00",
        "sequence": {
          "id": 5,
          "title": "Welcome Sequence"
        },
        "last_sequence": {
          "id": 10,
          "title": "Welcome Email"
        },
        "next_sequence": {
          "id": 11,
          "title": "Follow-up Email"
        }
      }
    ]
  }
}
```



---

## GET `/sequences`

**GET List Sequences**

Retrieve a paginated list of email sequences. Optionally include statistics (email count, subscriber count, revenue) for each sequence. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_read_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `order` | string | no | Sort direction. |
| `orderBy` | string | no | Column to sort by. |
| `search` | string | no | Search sequences by title. |
| `with[]` | array<string> | no | Include additional data. Use `stats` to include email count, subscriber count, and revenue for each sequence. |
| `per_page` | integer | no | Number of sequences per page. |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Paginated list of sequences.

  Schema (`application/json`):

  - `sequences` (object)
    - `total` (integer) — Total number of sequences.
    - `per_page` (integer) — Number of sequences per page.
    - `current_page` (integer) — Current page number.
    - `last_page` (integer) — Last page number.
    - `next_page_url` (string,null) — URL for the next page, or null if on the last page.
    - `prev_page_url` (string,null) — URL for the previous page, or null if on the first page.
    - `from` (integer) — Starting record index on this page.
    - `to` (integer) — Ending record index on this page.
    - `data` (array<Sequence>)

  Example:

```json
{
  "sequences": {
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
        "title": "Welcome Sequence",
        "slug": "welcome-sequence",
        "status": "draft",
        "type": "email_sequence",
        "design_template": "simple",
        "settings": {
          "mailer_settings": {
            "from_name": "",
            "from_email": "",
            "reply_to_name": "",
            "reply_to_email": "",
            "is_custom": "no"
          }
        },
        "created_by": 1,
        "created_at": "2024-03-01 10:00:00",
        "updated_at": "2024-03-01 10:00:00",
        "stats": {
          "emails": 3,
          "subscribers": 150,
          "revenue": {
            "amount": "0",
            "currency": ""
          }
        }
      }
    ]
  }
}
```



---

## POST `/sequences/{id}/reapply`

**POST Reapply Sequence**

Re-apply an email sequence to subscribers who have completed it. This finds the next unsent email after the last completed one and reactivates completed subscribers to receive it. Only reactivates subscribers whose contact status is `subscribed`. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The sequence ID. |


**Responses**

- **200** — Sequence re-applied successfully. Returns debug/calculation data.

  Schema (`application/json`):

  - `result` (object) — Debug data with calculation details.
    - `next_email` (object)
      - `id` (integer) — Next email ID.
      - `delay` (integer) — Delay in seconds.
      - `title` (string) — Email title.
    - `last_completed` (object)
      - `id` (integer) — Last completed email ID.
      - `delay` (integer) — Delay in seconds.
      - `title` (string) — Email title.
      - `last_executed` (string) _(format: date-time)_ — When the last email was executed.
    - `calculations` (object)
      - `delay_offset` (integer) — Delay offset in seconds between last and next email.
      - `sequence_start_time` (string) _(format: date-time)_
      - `next_time_from_last_execution` (string) _(format: date-time)_
      - `next_time_from_start` (string) _(format: date-time)_
      - `time_difference` (integer) — Difference in seconds between the two calculation methods.
    - `update_result` (object)
      - `subscribers_updated` (integer) — Number of subscribers reactivated.
  - `message` (string)

  Example:

```json
{
  "result": {
    "next_email": {
      "id": 8,
      "delay": 259200,
      "title": "Day 3: Advanced Tips"
    },
    "last_completed": {
      "id": 7,
      "delay": 172800,
      "title": "Day 2: Getting Started",
      "last_executed": "2024-03-02 10:00:00"
    },
    "calculations": {
      "delay_offset": 86400,
      "sequence_start_time": "2024-02-29 10:00:00",
      "next_time_from_last_execution": "2024-03-03 10:00:00",
      "next_time_from_start": "2024-03-03 10:00:00",
      "time_difference": 0
    },
    "update_result": {
      "subscribers_updated": 25
    }
  },
  "message": "Sequences have been re-applied"
}
```


- **422** — No completed sequences found to re-apply.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "No sequences found to re-apply"
}
```



---

## DELETE `/sequences/{id}/subscribers`

**DELETE Remove Sequence Subscribers**

Remove subscribers from an email sequence. Subscribers can be identified by tracker IDs or subscriber IDs. Removes the sequence tracker records for the specified subscribers. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_manage_email_delete`

_Enforced by `SequencePolicy::deleteSubscribes()`._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The sequence ID. |


**Request body** (`application/json`, required)

- `tracker_ids` (array<integer>) — Sequence tracker IDs to remove. Takes priority over `subscriber_ids`.
- `subscriber_ids` (array<integer>) — Subscriber IDs to remove from the sequence. Used only if `tracker_ids` is not provided.

Example:

```json
{
  "subscriber_ids": [
    42,
    55,
    68
  ]
}
```


**Responses**

- **200** — Subscribers removed from the sequence.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Selected subscribers has been successfully removed from this sequence"
}
```



---

## PUT `/sequences/{id}`

**PUT Update Sequence**

Update an existing email sequence's title, settings, or mailer configuration. If mailer settings are changed, they are propagated to all sequence emails. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The sequence ID. |


**Request body** (`application/json`, required)

- `title` (string) **required** — Sequence title.
- `settings` (object) — Sequence settings. If mailer_settings are changed, all child sequence emails will be updated.
  - `mailer_settings` (object)
    - `from_name` (string) — Sender name.
    - `from_email` (string) — Sender email address.
    - `reply_to_name` (string) — Reply-to name.
    - `reply_to_email` (string) — Reply-to email address.
    - `is_custom` (string) _(enum: `yes`, `no`)_ — Whether custom mailer settings are enabled.

Example:

```json
{
  "title": "Updated Welcome Sequence",
  "settings": {
    "mailer_settings": {
      "from_name": "Support Team",
      "from_email": "support@example.com",
      "reply_to_name": "",
      "reply_to_email": "",
      "is_custom": "yes"
    }
  }
}
```


**Responses**

- **200** — Sequence updated successfully.

  Schema (`application/json`):

  - `sequence` (Sequence)
  - `message` (string)

  Example:

```json
{
  "sequence": {
    "id": 1,
    "title": "Updated Welcome Sequence",
    "slug": "welcome-sequence",
    "status": "draft",
    "type": "email_sequence",
    "settings": {
      "mailer_settings": {
        "from_name": "Support Team",
        "from_email": "support@example.com",
        "reply_to_name": "",
        "reply_to_email": "",
        "is_custom": "yes"
      }
    },
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-02 14:00:00"
  },
  "message": "Sequence has been updated"
}
```


- **422** — Validation error.

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## PUT `/sequences/{id}/email/{email_id}`

**PUT Update Sequence Email**

Update an existing sequence email's subject, body, settings, and UTM parameters. The title is automatically set from the email_subject. Mailer settings are inherited from the parent sequence. Requires FluentCampaign Pro.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The parent sequence ID. |
| `email_id` | integer | yes | The sequence email ID. |


**Request body** (`application/json`, required)

- `email` (object) **required** — Email data object.
  - `email_subject` (string) **required** — Email subject line.
  - `email_pre_header` (string) — Email pre-header text.
  - `email_body` (string) **required** — Email body content (HTML).
  - `design_template` (string) — Design template (e.g., `simple`, `visual_builder`).
  - `template_id` (integer) — Template ID (0 if none).
  - `settings` (object) — Email settings including timing configuration.
    - `timings` (object)
      - `delay_unit` (string) _(enum: `days`, `hours`, `minutes`, `weeks`)_
      - `delay` (string,integer) — Delay value in the specified unit.
      - `is_anytime` (string) _(enum: `yes`, `no`)_
      - `sending_time` (any) — Sending time or time range.
      - `selected_days_only` (string) _(enum: `yes`, `no`)_
      - `allowed_days` (array<string>)
  - `utm_status` (integer) — Enable UTM tracking (1 = enabled, 0 = disabled).
  - `utm_source` (string) — UTM source parameter.
  - `utm_medium` (string) — UTM medium parameter.
  - `utm_campaign` (string) — UTM campaign parameter.
  - `utm_term` (string) — UTM term parameter.
  - `utm_content` (string) — UTM content parameter.
  - `_visual_builder_design` (object) — Visual builder design data (only when `design_template` is `visual_builder`).
    - _(object)_
  - `title` (string) — Accepted but ignored — the server overwrites `title` with `email_subject` before saving, so the email's title always mirrors its subject.

Example:

```json
{
  "email": {
    "email_subject": "Day 1: Getting Started (Updated)",
    "email_pre_header": "Updated pre-header",
    "email_body": "<p>Updated content...</p>",
    "design_template": "simple",
    "template_id": 0,
    "settings": {
      "timings": {
        "delay_unit": "days",
        "delay": "1",
        "is_anytime": "yes",
        "sending_time": ""
      }
    }
  }
}
```


**Responses**

- **200** — Sequence email updated successfully.

  Schema (`application/json`):

  - `message` (string)
  - `email` (SequenceEmail)

  Example:

```json
{
  "message": "Sequence email has been updated",
  "email": {
    "id": 12,
    "parent_id": 1,
    "title": "Day 1: Getting Started (Updated)",
    "type": "sequence_mail",
    "status": "published",
    "email_subject": "Day 1: Getting Started (Updated)",
    "email_pre_header": "Updated pre-header",
    "email_body": "<p>Updated content...</p>",
    "delay": 86400,
    "design_template": "simple",
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-02 14:00:00"
  }
}
```


- **422** — Invalid request data.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "invalid data type"
}
```



---

## PATCH `/sequences/{id}/email/{email_id}/delay`

**PATCH Update Sequence Email Delay**

<Badge type="warning" text="Pro" />

Change only the wait time before a sequence email sends, without touching its subject, body, or any other setting. This is what drag-to-reorder in the sequence builder calls.

The email is looked up scoped to the sequence in the path, so an id from another sequence returns 404 rather than being edited.

An unrecognised `delay_unit` silently falls back to `days` rather than erroring. Note that `Months` is **capitalised** in the accepted list — `months` is not recognised and will be treated as `days`.

The value is written to `settings.timings` on the email record.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `SequencePolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | Sequence id. |
| `email_id` | integer | yes | Sequence email id. Must belong to the sequence above. |


**Request body** (`application/json`, required)

- `delay` (string) _(default: `0`)_ — How long to wait, as a number.
- `delay_unit` (string) _(enum: `minutes`, `hours`, `days`, `weeks`, `Months`; default: `days`)_ — Unit for `delay`. Unrecognised values fall back to `days`. `Months` is capitalised.

Example:

```json
{
  "delay": "3",
  "delay_unit": "days"
}
```


**Responses**

- **200** — Wait time updated.

  Schema (`application/json`):

  - `message` (string) — Confirmation message.
  - `email` (object)
    - `id` (integer) — Sequence email id.
    - `parent_id` (integer) — Owning sequence id.
    - `title` (string) — Email title.
    - `settings` (object)
      - `timings` (object)
        - `delay` (string) — Stored delay value.
        - `delay_unit` (string) — Stored delay unit.

  Example:

```json
{
  "message": "Wait time has been updated",
  "email": {
    "id": 41,
    "parent_id": 38,
    "title": "Day 5 follow-up",
    "settings": {
      "timings": {
        "delay": "3",
        "delay_unit": "days"
      }
    }
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
