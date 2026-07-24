# WordPress snippets

Standalone PHP for the WordPress site. **Nothing here is part of the MCP
server** — it isn't compiled, imported, tested by `npm test`, or shipped in the
`.mcpb` extension. The repo just holds the canonical copy so changes are
reviewable and version-controlled.

---

## `fluentcrm-elementor-tags.php`

Puts the live FluentCRM subscriber count into Elementor as a dynamic tag, so
the vanity number ("join 86,000+ readers") stops being hardcoded in a dozen
widgets and updates itself as the list grows.

The number is **contacts with status `subscribed`** — the same figure
FluentCRM's own dashboard calls "Active Contacts."

### Install

Paste the file into any PHP snippet manager, **omitting the opening `<?php`
line**:

| Where | How |
|---|---|
| **WPCode** | Code Snippets → Add New → Add Your Custom Code → type **PHP Snippet** → paste → Auto Insert / Run Everywhere → Activate |
| **Code Snippets** | Snippets → Add New → paste → "Run snippet everywhere" → Save and Activate |
| **Child theme** | Append to `functions.php`, keeping the `<?php` line only if the file doesn't already have one |

Nothing to configure. It self-checks: if FluentCRM isn't active it returns `0`
rather than erroring, and if Elementor isn't active the dynamic tag simply
doesn't register while the shortcode keeps working.

### Use it in Elementor

Requires **Elementor Pro** — dynamic tags register through Elementor's core API,
but the dynamic-content picker in the editor is a Pro feature.

Edit any text field → click the **dynamic** (database) icon → **FluentCRM →
Total Email Subscribers**.

Controls on the tag:

| Control | Default | Notes |
|---|---|---|
| **Format** | Compact | `86.3K` / `86,362` / `86,000` / `86362` |
| **Decimal places** | 1 | Compact only, 0–3 |
| **Round to nearest** | 1,000 | Rounded only |
| **Rounding** | Down | Down never overstates the real number |
| **Prefix** / **Suffix** | — | e.g. suffix `+` → `86.3K+` |

> **Counter widget:** its "Ending Number" is a number field and can't parse
> `86.3K`. Set **Format → Raw digits** there, and let the widget's own
> thousands-separator option handle the commas.

### Use it anywhere else

```
[fluentcrm_subscribers]                                → 86.3K
[fluentcrm_subscribers format="exact"]                 → 86,362
[fluentcrm_subscribers format="round" suffix="+"]      → 86,000+
[fluentcrm_subscribers format="round" round_to="5000"] → 85,000
[fluentcrm_subscribers format="raw"]                   → 86362
[fluentcrm_subscribers prefix="Join " suffix=" people"] → Join 86.3K people
```

Attribute names match the Elementor controls exactly.

### Why it rounds down

`86,362` renders as `86.3K`, not `86.4K`. A marketing number should never claim
more than you have — and rounding down means the figure stays true between cache
refreshes. Pass `rounding="nearest"` if you'd rather have `86.4K`.

### Caching

The count is cached in a transient for **1 hour**, so page loads never hit the
database for it. The cache also clears immediately on `fluent_crm/contact_created`
and `fluent_crm/subscriber_status_changed`, so new signups show up right away.

To change the TTL:

```php
add_filter( 'mag_fcrm_cache_ttl', function () {
	return 15 * MINUTE_IN_SECONDS;
} );
```

To force a refresh from other code: `mag_fcrm_flush_subscriber_cache();`

### Adding another stat

The data and formatting layers are separate, so a second stat is small. Add a
count function alongside `mag_fcrm_total_subscribers()` — the useful FluentCRM
scopes are `filterByStatues( [ 'subscribed' ] )`, `filterByLists( [ $id ] )` and
`filterByTags( [ $id ] )` — then a tag class that calls it. Everything else
(formatting, controls, caching pattern, shortcode) is reusable as-is.

### Verifying

On the site: `[fluentcrm_subscribers format="exact"]` should match FluentCRM →
Contacts filtered to **Subscribed**, and the "Active Contacts" tile on the
FluentCRM dashboard.

Before editing the snippet, run the harnesses in `tests/` — they stub
WordPress, Elementor and FluentCRM, so they need nothing installed:

```sh
php -l snippets/fluentcrm-elementor-tags.php
php snippets/tests/formatter-test.php    # 46 assertions: every format, rounding, edge case
php snippets/tests/elementor-test.php    # 17 assertions: tag registration, controls, rendering
```

`formatter-test.php` also loads the snippet with neither plugin present, which
is what proves the site survives Elementor being deactivated.
