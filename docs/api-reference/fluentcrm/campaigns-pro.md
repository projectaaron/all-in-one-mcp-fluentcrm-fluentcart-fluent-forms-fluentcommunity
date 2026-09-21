# FluentCRM API — Campaign Actions (Pro)

7 endpoints. Base URL: `https://{website}/wp-json/fluent-crm/v2`. See the [FluentCRM overview](../fluentcrm.md) for auth and the full group list.

_Generated from the FluentCRM OpenAPI specs (developers.fluentcrm.com)._

---

## POST `/campaigns-pro/{id}/tag-actions`

**POST Campaign Tag Actions**

Add or remove tags from subscribers based on campaign activity (email opened, not opened, or link clicked). Only works on archived campaigns. Processes subscribers in paginated batches (default 50 per page) to handle large campaigns.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `CampaignPolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. Campaign must be in 'archived' status. |


**Request body** (`application/json`, required)

- `action_type` (string) **required** _(enum: `add_tags`, `remove_tags`)_ — Whether to add or remove the specified tags.
- `tags` (array<integer>) **required** — Array of tag IDs to add or remove.
- `activity_type` (string) **required** _(enum: `email_open`, `email_not_open`, `email_clicked`)_ — Filter subscribers by campaign activity type.
- `processing_page` (integer) **required** — Current processing page number (1-based). Used for batch processing.
- `link_ids` (array<integer>) — Required when activity_type is 'email_clicked'. Array of campaign URL IDs to filter by.

Example:

```json
{
  "action_type": "add_tags",
  "tags": [
    5,
    12
  ],
  "activity_type": "email_open",
  "processing_page": 1
}
```


**Responses**

- **200** — Tag action processed for the current batch.

  Schema (`application/json`):

  - `processed_page` (integer) — The page number that was just processed.
  - `processed_contacts` (integer) — Number of contacts processed in this batch.
  - `has_more` (boolean) — Whether there are more contacts to process.
  - `total_count` (integer,boolean) — Total number of matching contacts. Only returned on the first page (processing_page = 1), otherwise false.
  - `subscriber_ids` (array<integer>) — IDs of subscribers processed in this batch.

  Example:

```json
{
  "processed_page": 1,
  "processed_contacts": 50,
  "has_more": true,
  "total_count": 320,
  "subscriber_ids": [
    1,
    2,
    3,
    4,
    5
  ]
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — Validation error or campaign is not archived.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "You can do this action if campaign is in archived status only"
}
```



---

## GET `/campaigns-pro/posts/taxonomies`

**GET Dynamic Post Taxonomies**

Retrieve all public taxonomies and their terms for each registered public post type. Used by the email builder's dynamic post block to populate taxonomy filter options.

<!-- fc:access -->

**Required capability:** `fcrm_read_emails`

_Enforced by `CampaignPolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Responses**

- **200** — Taxonomies grouped by post type.

  Schema (`application/json`):

  - `taxonomies` (object) — Keyed by post type slug. Each post type contains a 'terms' object keyed by taxonomy slug, with arrays of term options.
    - _(object)_

  Example:

```json
{
  "taxonomies": {
    "post": {
      "terms": {
        "category": [
          {
            "value": "all",
            "label": "all"
          },
          {
            "value": 1,
            "label": "Uncategorized"
          },
          {
            "value": 5,
            "label": "Tutorials"
          }
        ],
        "post_tag": [
          {
            "value": "all",
            "label": "all"
          },
          {
            "value": 10,
            "label": "WordPress"
          }
        ]
      }
    }
  }
}
```



---

## GET `/campaigns-pro/posts`

**GET Dynamic Posts**

Retrieve WordPress posts for use in dynamic email content blocks. Supports filtering by post type, taxonomy terms, date range, and custom ordering. Returns post data along with available post types. Used by the email builder's dynamic post block.

<!-- fc:access -->

**Required capability:** `fcrm_read_emails`

_Enforced by `CampaignPolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `post_type` | string | no | WordPress post type to query (e.g., 'post', 'page', or any custom post type). |
| `per_page` | integer | no | Number of posts to return. |
| `orderBy` | string | no | Field to order posts by (e.g., 'date', 'title', 'modified'). |
| `order` | string | no | Sort direction. |
| `days` | string | no | Only include posts from the last N days. Use '0' or omit for no date restriction. |
| `excerptLength` | string | no | Number of words for the post excerpt. |
| `taxTypes` | array<object> | no | Taxonomy filter. Nested array where each entry maps taxonomy slugs to arrays of term names. |
| `operator` | string | no | Logical operator for combining taxonomy queries. |


**Responses**

- **200** — List of posts and available post types.

  Schema (`application/json`):

  - `posts` (array<object>)
    - `post_title` (string)
    - `post_excerpt` (string)
    - `comment_count` (integer)
    - `date` (string)
    - `thumbnail` (string,boolean) — Post thumbnail URL, or false if none.
    - `author_avatar` (string) — Author avatar URL.
    - `author` (string) — Author display name.
  - `post_types` (array<object>)
    - `value` (string)
    - `label` (string)

  Example:

```json
{
  "posts": [
    {
      "post_title": "Getting Started Guide",
      "post_excerpt": "Learn how to set up your account and get started with our platform...",
      "comment_count": 12,
      "date": "March 1, 2024",
      "thumbnail": "https://example.com/wp-content/uploads/2024/03/guide.jpg",
      "author_avatar": "https://secure.gravatar.com/avatar/abc123",
      "author": "John Doe"
    }
  ],
  "post_types": [
    {
      "value": "post",
      "label": "Posts"
    },
    {
      "value": "page",
      "label": "Pages"
    }
  ]
}
```



---

## GET `/campaigns-pro/products`

**GET Dynamic Products**

Retrieve WooCommerce products for use in dynamic email content blocks. Supports filtering by product category. Returns product data along with available product taxonomies. Requires WooCommerce to be active.

<!-- fc:access -->

**Required capability:** `fcrm_read_emails`

_Enforced by `CampaignPolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Query parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `per_page` | integer | no | Number of products to return. |
| `taxType` | string | no | Product category term ID to filter by. Use 'all' or omit for no filtering. |


**Responses**

- **200** — List of products and available product taxonomies.

  Schema (`application/json`):

  - `products` (array<object>)
    - `name` (string) — Product title.
    - `price_html` (string) — Formatted price HTML.
    - `product_link` (string) — Product permalink.
    - `short_description` (string) — Product short description or trimmed description.
    - `image` (string,boolean) — Product image URL, or false if none.
  - `taxonomies` (object) — Product taxonomies keyed by post type, containing terms grouped by taxonomy slug.
    - _(object)_

  Example:

```json
{
  "products": [
    {
      "name": "Premium Plugin License",
      "price_html": "<span class=\"woocommerce-Price-amount\">$49.00</span>",
      "product_link": "https://example.com/product/premium-plugin/",
      "short_description": "<p>Get access to all premium features with a yearly license.</p>",
      "image": "https://example.com/wp-content/uploads/2024/03/plugin.jpg"
    }
  ],
  "taxonomies": {
    "product": {
      "terms": {
        "product_cat": [
          {
            "value": 15,
            "label": "Plugins"
          },
          {
            "value": 16,
            "label": "Themes"
          }
        ]
      }
    }
  }
}
```



---

## POST `/campaigns-pro/{id}/resend-emails`

**POST Resend Campaign Emails**

Resend specific campaign emails by their IDs. Only emails with 'sent' or 'failed' status can be resent. Each email is set back to 'scheduled' status and the email processor is triggered for the associated subscriber.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `CampaignPolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Request body** (`application/json`, required)

- `email_ids` (array<integer>) **required** — Array of campaign email IDs to resend.

Example:

```json
{
  "email_ids": [
    101,
    102,
    103
  ]
}
```


**Responses**

- **200** — Emails rescheduled for resending.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Email has been resent"
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — No matching emails found, subscriber not found, or email body is empty.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sorry! No emails found"
}
```



---

## POST `/campaigns-pro/{id}/resend-failed-emails`

**POST Resend Failed Emails**

Reschedule all failed campaign emails for resending. Sets failed emails back to 'scheduled' status and changes the campaign status to 'working' so the email processor picks them up again.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `CampaignPolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Responses**

- **200** — Failed emails rescheduled successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "5 Emails has been scheduled to resend"
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — No failed emails found for this campaign.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sorry no failed campaign emails found"
}
```



---

## POST `/campaigns-pro/{id}/resend-unopened-emails`

**POST Resend Unopened Emails**

Reschedule all unopened campaign emails for resending. Finds emails with 'sent' or 'failed' status that have not been opened (is_open = 0), sets them back to 'scheduled' status, and triggers the email processor for each subscriber.

<!-- fc:access -->

**Required capability:** `fcrm_manage_emails`

_Enforced by `CampaignPolicy::verifyRequest()`, the policy default for this route group._

**Requires:** FluentCampaign Pro. Without it the route does not exist.

<!-- /fc:access -->

**Auth:** ApplicationPasswords

**Path parameters**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | integer | yes | The campaign ID. |


**Responses**

- **200** — Unopened emails rescheduled successfully.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Unopened Emails has been resent"
}
```


- **404** — Campaign not found.

  Schema (`application/json`):

  - `message` (string)
- **422** — No unopened emails found for this campaign.

  Schema (`application/json`):

  - `message` (string)

  Example:

```json
{
  "message": "Sorry! No unopened emails found"
}
```



---
