# FluentCRM API — Recurring Campaigns (Pro)

14 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/recurring-campaigns/do-bulk-action`

**POST Bulk Action Recurring Campaigns**

Perform a bulk action on multiple recurring campaigns. Supported actions are `apply_labels` (attach labels to campaigns) and `delete_campaigns` (delete campaigns and their child emails). When `select_all` is `true`, the action is applied to all recurring campaigns regardless of the `campaign_ids` provided. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `action_name` (string) **required** _(enum: `apply_labels`, `delete_campaigns`)_ — The bulk action to perform.
- `campaign_ids` (array<integer>) **required** — Array of recurring campaign IDs to apply the action to.
- `select_all` (string) _(enum: `true`, `false`)_ — When set to `true`, the action is applied to all recurring campaigns, ignoring `campaign_ids`.
- `labels` (array<integer>) — Array of label IDs to attach. Required when `action_name` is `apply_labels`.

Example:

```json
{
  "action_name": "apply_labels",
  "campaign_ids": [
    5,
    6
  ],
  "labels": [
    1,
    3
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
  "message": "Labels has been applied successfully"
}
```


- **422** — Validation error (e.g., no campaign IDs, no labels for apply_labels, invalid action).

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Please provide Recurring Campaign IDs"
}
```



---

## POST `/recurring-campaigns/{campaign_id}/change-status`

**POST Change Recurring Campaign Status**

Change the status of a recurring campaign between `active` and `draft`. When activating a campaign, the email subject and body must already be set. The next scheduled send time is recalculated upon status change. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `campaign_id` | integer | yes | The recurring campaign ID. |


**Request body** (`application/json`, required)

- `status` (string) **required** _(enum: `active`, `draft`)_ — The new status. Any value other than `active` is treated as `draft`.

Example:

```json
{
  "status": "active"
}
```


**Responses**

- **200** — Status changed successfully.

  Schema (`application/json`):

  - `message` (string) — Success message including the new status.
  - `new_status` (string) _(enum: `active`, `draft`)_ — The new campaign status.
  - `campaign` (RecurringCampaign)

  Example:

```json
{
  "message": "Campaign status has been changed to active",
  "new_status": "active",
  "campaign": {
    "id": 5,
    "title": "Weekly Newsletter",
    "status": "active",
    "scheduled_at": "2024-04-01 09:00:00",
    "email_subject": "Your Weekly Update",
    "email_body": "<p>Hello {{contact.first_name}}</p>",
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-25 11:00:00"
  }
}
```


- **404** — Recurring campaign not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — Validation error (e.g., activating a campaign with no email subject or body).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## POST `/recurring-campaigns`

**POST Create Recurring Campaign**

Create a new recurring email campaign. The campaign object must include a title, scheduling settings (type and time), and optionally sending conditions and subscriber settings. The title must be unique. The campaign is created in draft status. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `campaign` (object) **required** — The recurring campaign data. Can be a JSON object or a JSON-encoded string.
  - `title` (string) **required** — Campaign title. Must be unique across all recurring campaigns.
  - `settings` (object) **required**
    - `scheduling_settings` (object) **required**
      - `type` (string) **required** _(enum: `daily`, `weekly`, `monthly`, `yearly`)_ — Schedule type.
      - `day` (string) — Day for weekly schedules (e.g., `mon`).
      - `time` (string) **required** — Time of day (e.g., `09.00`).
      - `send_automatically` (string) _(enum: `yes`, `no`)_ — Whether to send automatically.
    - `sending_conditions` (array<object>) — Conditions that must be met before sending.
      - _(object)_
    - `subscribers_settings` (object) — Subscriber targeting settings.
      - `subscribers` (array<object>)
        - _(object)_
      - `excludedSubscribers` (array<object>)
        - _(object)_
      - `sending_filter` (string)
      - `dynamic_segment` (object)
        - _(object)_
      - `advanced_filters` (array<array<any>>)

Example:

```json
{
  "campaign": {
    "title": "Weekly Newsletter",
    "settings": {
      "scheduling_settings": {
        "type": "weekly",
        "day": "mon",
        "time": "09.00",
        "send_automatically": "yes"
      },
      "sending_conditions": [],
      "subscribers_settings": {
        "subscribers": [
          {
            "list": "all",
            "tag": "all"
          }
        ],
        "excludedSubscribers": [
          {
            "list": null,
            "tag": null
          }
        ],
        "sending_filter": "list_tag"
      }
    }
  }
}
```


**Responses**

- **200** — Recurring campaign created successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.
  - `campaign_id` (integer) — ID of the newly created recurring campaign.

  Example:

```json
{
  "message": "Recurring campaign has been created. Please setup the email contents now",
  "campaign_id": 5
}
```


- **422** — Validation error (e.g., title already exists, missing required fields).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_
  - `go_to_step` (integer) — Step index to navigate to in the UI.

---

## POST `/recurring-campaigns/delete-bulk`

**POST Delete Bulk Recurring Campaigns**

Delete multiple recurring campaigns by their IDs. Also deletes all child email campaigns (recurring mails) and their associated campaign emails. Fires the `fluent_crm/campaign_deleted` action for each deleted campaign and child. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `campaign_ids` (array<integer>) **required** — Array of recurring campaign IDs to delete.

Example:

```json
{
  "campaign_ids": [
    5,
    6,
    7
  ]
}
```


**Responses**

- **200** — Campaigns deleted successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.

  Example:

```json
{
  "message": "Selected Recurring Email Campaigns has been deleted"
}
```


- **422** — Validation error (e.g., no valid IDs provided).

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Please provide valid IDs"
}
```



---

## POST `/recurring-campaigns/{campaign_id}/duplicate`

**POST Duplicate Recurring Campaign**

Create a duplicate of an existing recurring campaign. The new campaign is created in draft status with a title prefixed by `[Duplicate]` and suffixed with the current date. All email content, UTM settings, design template, and labels are copied to the new campaign. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `campaign_id` | integer | yes | The recurring campaign ID to duplicate. |


**Responses**

- **200** — Campaign duplicated successfully.

  Schema (`application/json`):

  - `campaign` (RecurringCampaign)
  - `campaign_id` (integer) — ID of the newly created duplicate campaign.
  - `message` (string) — Success message.

  Example:

```json
{
  "campaign": {
    "id": 8,
    "title": "[Duplicate] Weekly Newsletter @ 2024-03-25",
    "slug": "duplicate-weekly-newsletter-2024-03-25",
    "status": "draft",
    "type": "recurring_campaign",
    "email_subject": "Your Weekly Update",
    "email_pre_header": "This week's highlights",
    "email_body": "<p>Hello {{contact.first_name}}</p>",
    "design_template": "simple",
    "utm_status": 1,
    "utm_source": "newsletter",
    "utm_medium": "email",
    "utm_campaign": "weekly-update",
    "utm_term": "",
    "utm_content": "",
    "created_at": "2024-03-25 11:00:00",
    "updated_at": "2024-03-25 11:00:00"
  },
  "campaign_id": 8,
  "message": "Selected Campaign has been successfully duplicated"
}
```


- **404** — Recurring campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/recurring-campaigns/{campaign_id}`

**GET Get Recurring Campaign**

Retrieve a single recurring campaign by ID. Returns the full campaign object including settings, email content, and all metadata. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `campaign_id` | integer | yes | The recurring campaign ID. |


**Responses**

- **200** — Recurring campaign details.

  Schema (`application/json`):

  - `campaign` (RecurringCampaign)

  Example:

```json
{
  "campaign": {
    "id": 5,
    "title": "Weekly Newsletter",
    "slug": "weekly-newsletter",
    "status": "active",
    "type": "recurring_campaign",
    "template_id": null,
    "email_subject": "Your Weekly Update",
    "email_pre_header": "This week's highlights",
    "email_body": "<p>Hello {{contact.first_name}},</p><p>Here is your weekly update.</p>",
    "recipients_count": 0,
    "utm_status": 1,
    "utm_source": "newsletter",
    "utm_medium": "email",
    "utm_campaign": "weekly-update",
    "utm_term": "",
    "utm_content": "",
    "design_template": "simple",
    "scheduled_at": "2024-04-01 09:00:00",
    "settings": {
      "mailer_settings": {
        "from_name": "",
        "from_email": "",
        "reply_to_name": "",
        "reply_to_email": "",
        "is_custom": "no"
      },
      "scheduling_settings": {
        "type": "weekly",
        "day": "mon",
        "time": "09.00",
        "send_automatically": "yes"
      },
      "sending_conditions": [],
      "subscribers_settings": {
        "subscribers": [
          {
            "list": "all",
            "tag": "all"
          }
        ],
        "excludedSubscribers": [
          {
            "list": null,
            "tag": null
          }
        ],
        "sending_filter": "list_tag"
      }
    },
    "created_by": 1,
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-20 14:30:00"
  }
}
```


- **404** — Recurring campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/recurring-campaigns/{campaign_id}/emails/{email_id}`

**GET Get Recurring Campaign Email**

Retrieve a single child email from a recurring campaign. Returns both the parent recurring campaign and the specific email. If the email has a `scheduled` status and its scheduled time has passed, its status is automatically updated to `working`. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `campaign_id` | integer | yes | The parent recurring campaign ID. |
| `email_id` | integer | yes | The child email ID. |


**Responses**

- **200** — Recurring campaign email details.

  Schema (`application/json`):

  - `campaign` (RecurringCampaign)
  - `email` (RecurringMail)

  Example:

```json
{
  "campaign": {
    "id": 5,
    "title": "Weekly Newsletter",
    "status": "active",
    "type": "recurring_campaign",
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-25 11:00:00"
  },
  "email": {
    "id": 20,
    "parent_id": 5,
    "title": "Weekly Newsletter",
    "slug": "weekly-newsletter-20240325",
    "type": "recurring_mail",
    "status": "sent",
    "email_subject": "Your Weekly Update - March 25",
    "email_pre_header": "",
    "email_body": "<p>Hello {{contact.first_name}}</p>",
    "recipients_count": 150,
    "design_template": "simple",
    "scheduled_at": "2024-03-25 09:00:00",
    "settings": {
      "mailer_settings": {
        "from_name": "",
        "from_email": "",
        "reply_to_name": "",
        "reply_to_email": "",
        "is_custom": "no"
      }
    },
    "created_at": "2024-03-25 08:00:00",
    "updated_at": "2024-03-25 09:30:00"
  }
}
```


- **404** — Recurring campaign or email not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/recurring-campaigns/{campaign_id}/emails`

**GET Get Recurring Campaign Emails**

Retrieve a paginated list of child email campaigns (recurring mails) for a recurring campaign. Non-draft emails are returned paginated. On the first page, draft emails are also included separately. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `campaign_id` | integer | yes | The recurring campaign ID. |


**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of results per page. |
| `page` | integer | no | Page number for pagination. When page is 1, draft emails are included in a separate `drafts` field. |


**Responses**

- **200** — List of recurring campaign emails.

  Schema (`application/json`):

  - `emails` (object) — Paginated non-draft emails.
    - `total` (integer)
    - `per_page` (integer)
    - `current_page` (integer)
    - `last_page` (integer)
    - `next_page_url` (string,null)
    - `prev_page_url` (string,null)
    - `from` (integer,null)
    - `to` (integer,null)
    - `data` (array<RecurringMail>)
  - `drafts` (array<RecurringMail>) — Draft emails for this recurring campaign. Only included when `page` is 1.

  Example:

```json
{
  "emails": {
    "total": 10,
    "per_page": 15,
    "current_page": 1,
    "last_page": 1,
    "next_page_url": null,
    "prev_page_url": null,
    "from": 1,
    "to": 10,
    "data": [
      {
        "id": 20,
        "parent_id": 5,
        "title": "Weekly Newsletter",
        "slug": "weekly-newsletter-20240325",
        "type": "recurring_mail",
        "status": "sent",
        "email_subject": "Your Weekly Update - March 25",
        "email_pre_header": "",
        "email_body": "<p>Hello {{contact.first_name}}</p>",
        "recipients_count": 150,
        "scheduled_at": "2024-03-25 09:00:00",
        "created_at": "2024-03-25 08:00:00",
        "updated_at": "2024-03-25 09:30:00"
      }
    ]
  },
  "drafts": [
    {
      "id": 22,
      "parent_id": 5,
      "title": "Weekly Newsletter",
      "slug": "weekly-newsletter-20240401",
      "type": "recurring_mail",
      "status": "draft",
      "email_subject": "Your Weekly Update - April 1",
      "email_pre_header": "",
      "email_body": "<p>Hello {{contact.first_name}}</p>",
      "recipients_count": 0,
      "scheduled_at": null,
      "created_at": "2024-03-28 08:00:00",
      "updated_at": "2024-03-28 08:00:00"
    }
  ]
}
```


- **404** — Recurring campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## GET `/recurring-campaigns`

**GET List Recurring Campaigns**

Retrieve a paginated list of recurring email campaigns. Supports filtering by search term and labels, and sorting by column and direction. Each campaign includes an `emails_count` of child mail campaigns and formatted labels. If the campaign is active with manual sending, a `has_draft` flag indicates whether a draft email exists. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `search` | string | no | Search recurring campaigns by title. |
| `order` | string | no | Sort direction. |
| `orderBy` | string | no | Column to sort by. |
| `labels[]` | array<integer> | no | Filter by label IDs. |
| `per_page` | integer | no | Number of results per page. |
| `page` | integer | no | Page number for pagination. |


**Responses**

- **200** — Paginated list of recurring campaigns.

  Schema (`application/json`):

  - `campaigns` (object)
    - `total` (integer) — Total number of recurring campaigns.
    - `per_page` (integer) — Number of results per page.
    - `current_page` (integer) — Current page number.
    - `last_page` (integer) — Last page number.
    - `next_page_url` (string,null) — URL for the next page, or null if on the last page.
    - `prev_page_url` (string,null) — URL for the previous page, or null if on the first page.
    - `from` (integer) — Starting record index on this page.
    - `to` (integer) — Ending record index on this page.
    - `data` (array<RecurringCampaign>)

  Example:

```json
{
  "campaigns": {
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
        "title": "Weekly Newsletter",
        "status": "active",
        "settings": {
          "scheduling_settings": {
            "type": "weekly",
            "day": "mon",
            "time": "09.00",
            "send_automatically": "yes"
          },
          "sending_conditions": [],
          "subscribers_settings": {}
        },
        "scheduled_at": "2024-04-01 09:00:00",
        "created_at": "2024-03-01 10:00:00",
        "emails_count": 12,
        "has_draft": false,
        "labels": [
          {
            "id": 1,
            "slug": "newsletter",
            "title": "Newsletter",
            "color": "#409EFF"
          }
        ]
      }
    ]
  }
}
```



---

## PUT `/recurring-campaigns/{campaign_id}/emails/{email_id}`

**PUT Patch Recurring Campaign Email Status**

Update the status of a specific child email in a recurring campaign. Only allows status transitions between `draft` and `cancelled`. The email's current status must be either `draft` or `cancelled`, and the target status must also be one of those two values. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `campaign_id` | integer | yes | The parent recurring campaign ID. |
| `email_id` | integer | yes | The child email ID. |


**Request body** (`application/json`, required)

- `status` (string) **required** _(enum: `draft`, `cancelled`)_ — The new status. Only `draft` and `cancelled` transitions are allowed.

Example:

```json
{
  "status": "cancelled"
}
```


**Responses**

- **200** — Email status changed successfully.

  Schema (`application/json`):

  - `message` (string) — Success message including the new status.

  Example:

```json
{
  "message": "Email status has been changed to cancelled"
}
```


- **404** — Recurring campaign or email not found.

  Schema (`application/json`):

  - `message` (string)

---

## POST `/recurring-campaigns/update-campaign-data`

**POST Update Recurring Campaign Email Data**

Update the email content and settings for an existing recurring campaign. Includes email body, subject, pre-header, UTM parameters, template, footer settings, and design template. The campaign's next scheduled send time is recalculated based on the scheduling settings. Footer content must include an unsubscribe or manage subscription URL if a custom footer is enabled. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Request body** (`application/json`, required)

- `campaign_id` (integer) **required** — ID of the recurring campaign to update.
- `campaign` (object) **required** — Campaign data to update. Can be a JSON object or a JSON-encoded string.
  - `title` (string) — Campaign title.
  - `email_subject` (string) **required** — Email subject line.
  - `email_body` (string) **required** — Email body content (HTML).
  - `email_pre_header` (string) — Email pre-header text.
  - `template_id` (integer) — Email template ID.
  - `utm_status` (integer) — Whether UTM tracking is enabled (1 = enabled, 0 = disabled).
  - `utm_source` (string) — UTM source parameter.
  - `utm_medium` (string) — UTM medium parameter.
  - `utm_campaign` (string) — UTM campaign parameter.
  - `utm_term` (string) — UTM term parameter.
  - `utm_content` (string) — UTM content parameter.
  - `design_template` (string) — Design template (e.g., `simple`, `visual_builder`).
  - `settings` (object) — Campaign settings including scheduling and footer configuration.
    - `scheduling_settings` (object)
      - `type` (string) _(enum: `daily`, `weekly`, `monthly`, `yearly`)_
      - `day` (string)
      - `time` (string)
      - `send_automatically` (string) _(enum: `yes`, `no`)_
    - `footer_settings` (object) — Custom footer settings. If `custom_footer` is `yes`, `footer_content` must include `##crm.manage_subscription_url##` or `##crm.unsubscribe_url##`.
      - `custom_footer` (string) _(enum: `yes`, `no`)_
      - `footer_content` (string)

Example:

```json
{
  "campaign_id": 5,
  "campaign": {
    "title": "Weekly Newsletter",
    "email_subject": "Your Weekly Update",
    "email_body": "<p>Hello {{contact.first_name}},</p><p>Here is your weekly update.</p>",
    "email_pre_header": "This week's highlights",
    "design_template": "simple",
    "utm_status": 1,
    "utm_source": "newsletter",
    "utm_medium": "email",
    "utm_campaign": "weekly-update",
    "settings": {
      "scheduling_settings": {
        "type": "weekly",
        "day": "mon",
        "time": "09.00",
        "send_automatically": "yes"
      }
    }
  }
}
```


**Responses**

- **200** — Campaign email data updated successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.
  - `campaign` (RecurringCampaign)

  Example:

```json
{
  "message": "Email data has been updated",
  "campaign": {
    "id": 5,
    "title": "Weekly Newsletter",
    "email_subject": "Your Weekly Update",
    "email_body": "<p>Hello {{contact.first_name}},</p><p>Here is your weekly update.</p>",
    "email_pre_header": "This week's highlights",
    "status": "draft",
    "design_template": "simple",
    "scheduled_at": "2024-04-01 09:00:00",
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-20 14:30:00"
  }
}
```


- **422** — Validation error (e.g., missing email subject or body, invalid footer content).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---

## POST `/recurring-campaigns/{campaign_id}/emails/update-email`

**POST Update Recurring Campaign Email**

Update a child email within a recurring campaign. Supports two steps: `edit` for updating the email body, design template, and settings; and `review` for updating the email subject, scheduled time, status, and settings. When using the `review` step with `pending-scheduled` status, the parent recurring campaign must be active. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `campaign_id` | integer | yes | The parent recurring campaign ID. |


**Request body** (`application/json`, required)

- `step` (string) **required** _(enum: `edit`, `review`)_ — The update step. `edit` updates email body and design. `review` updates subject, schedule, and status.
- `email` (object) **required** — Email data to update. Can be a JSON object or a JSON-encoded string.
  - `id` (integer) **required** — The child email ID.
  - `email_body` (string) — Email body content (HTML). Required for `edit` step.
  - `email_subject` (string) — Email subject line. Required for `review` step.
  - `scheduled_at` (string) _(format: date-time)_ — Scheduled send time. Required for `review` step. If in the past, it is set to the current time.
  - `status` (string) _(enum: `draft`, `pending-scheduled`, `cancelled`)_ — Email status. Required for `review` step. Use `pending-scheduled` to schedule for sending.
  - `settings` (object) — Email settings including mailer configuration.
    - _(object)_
  - `design_template` (string) — Design template (e.g., `simple`, `visual_builder`). Used in `edit` step.

Example:

```json
{
  "step": "edit",
  "email": {
    "id": 22,
    "email_body": "<p>Updated email content for {{contact.first_name}}</p>",
    "design_template": "simple",
    "settings": {
      "mailer_settings": {
        "from_name": "",
        "from_email": "",
        "reply_to_name": "",
        "reply_to_email": "",
        "is_custom": "no"
      }
    }
  }
}
```


**Responses**

- **200** — Email updated successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.

  Example:

```json
{
  "message": "Email body has been successfully updated"
}
```


- **404** — Recurring campaign or email not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — Validation error (e.g., empty email body, missing required fields, inactive parent campaign).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

  Example:

```json
{
  "message": "Recurring campaign status is set to draft. You can not publish this email. Please make your recurring campaign status as active first."
}
```



---

## PUT `/recurring-campaigns/{campaign_id}/update-labels`

**PUT Update Recurring Campaign Labels**

Attach or detach labels from a recurring campaign. Use the `action` parameter to specify whether to attach or detach the provided label IDs. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `campaign_id` | integer | yes | The recurring campaign ID. |


**Request body** (`application/json`, required)

- `action` (string) **required** _(enum: `attach`, `detach`)_ — Whether to attach or detach labels.
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

  - `message` (string) — Success message.

  Example:

```json
{
  "message": "Labels has been updated"
}
```


- **404** — Recurring campaign not found.

  Schema (`application/json`):

  - `message` (string)

---

## POST `/recurring-campaigns/{campaign_id}/update-settings`

**POST Update Recurring Campaign Settings**

Update the title and settings (scheduling, sending conditions, subscriber targeting) for a recurring campaign. The title must be unique across all recurring campaigns. The next scheduled send time is recalculated based on the new scheduling settings. Requires FluentCampaign Pro.

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `campaign_id` | integer | yes | The recurring campaign ID. |


**Request body** (`application/json`, required)

- `campaign` (object) **required** — Campaign settings data. Can be a JSON object or a JSON-encoded string.
  - `title` (string) **required** — Campaign title. Must be unique across all recurring campaigns.
  - `settings` (object) **required**
    - `scheduling_settings` (object) **required**
      - `type` (string) **required** _(enum: `daily`, `weekly`, `monthly`, `yearly`)_ — Schedule type.
      - `day` (string) — Day for weekly schedules (e.g., `mon`).
      - `time` (string) **required** — Time of day (e.g., `09.00`).
      - `send_automatically` (string) _(enum: `yes`, `no`)_ — Whether to send automatically.
    - `sending_conditions` (array<object>) — Conditions that must be met before sending.
      - _(object)_
    - `subscribers_settings` (object) — Subscriber targeting settings.
      - `subscribers` (array<object>)
        - _(object)_
      - `excludedSubscribers` (array<object>)
        - _(object)_
      - `sending_filter` (string)
      - `dynamic_segment` (object)
        - _(object)_
      - `advanced_filters` (array<array<any>>)
    - `mailer_settings` (object)
      - `from_name` (string)
      - `from_email` (string)
      - `reply_to_name` (string)
      - `reply_to_email` (string)
      - `is_custom` (string) _(enum: `yes`, `no`)_

Example:

```json
{
  "campaign": {
    "title": "Weekly Newsletter - Updated",
    "settings": {
      "scheduling_settings": {
        "type": "weekly",
        "day": "tue",
        "time": "10.00",
        "send_automatically": "yes"
      },
      "sending_conditions": [],
      "subscribers_settings": {
        "subscribers": [
          {
            "list": "1",
            "tag": "all"
          }
        ],
        "excludedSubscribers": [
          {
            "list": null,
            "tag": null
          }
        ],
        "sending_filter": "list_tag"
      }
    }
  }
}
```


**Responses**

- **200** — Settings updated successfully.

  Schema (`application/json`):

  - `message` (string) — Success message.
  - `campaign` (RecurringCampaign)

  Example:

```json
{
  "message": "Settings has been updated",
  "campaign": {
    "id": 5,
    "title": "Weekly Newsletter - Updated",
    "status": "active",
    "scheduled_at": "2024-04-02 10:00:00",
    "settings": {
      "scheduling_settings": {
        "type": "weekly",
        "day": "tue",
        "time": "10.00",
        "send_automatically": "yes"
      }
    },
    "created_at": "2024-03-01 10:00:00",
    "updated_at": "2024-03-25 11:00:00"
  }
}
```


- **404** — Recurring campaign not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — Validation error (e.g., duplicate title, missing required scheduling fields).

  Schema (`application/json`):

  - `message` (string)
  - `errors` (object)
    - _(object)_

---
