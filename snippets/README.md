# WordPress snippets

Standalone PHP for the WordPress site. **Nothing here is part of the MCP
server** — it isn't compiled, imported, tested by `npm test`, or shipped in the
`.mcpb` extension. The repo just holds the canonical copy so changes are
reviewable and version-controlled.

---

## `fluentcrm-elementor-tags.php`

Puts live FluentCRM numbers into Elementor as dynamic tags, so vanity figures
stop being hardcoded in a dozen widgets and update themselves.

| Tag | What it counts | Live value |
|---|---|---|
| **Total Email Subscribers** | contacts with status `subscribed` | 86,362 |
| **Total Emails Sent** | campaign emails with status `sent` | 15,525,776 |

Both run the same queries as FluentCRM's own dashboard tiles
(`FluentCrm\App\Services\Stats::getCounts()`), so the numbers match what you see
in wp-admin.

### Install

Paste the file into any PHP snippet manager, **omitting the opening `<?php`
line**:

| Where | How |
|---|---|
| **WPCode** | Code Snippets → Add New → Add Your Custom Code → type **PHP Snippet** → paste → Auto Insert / Run Everywhere → Activate |
| **Code Snippets** | Snippets → Add New → paste → "Run snippet everywhere" → Save and Activate |
| **Child theme** | Append to `functions.php`, keeping the `<?php` line only if the file doesn't already have one |

Nothing to configure. It self-checks: if FluentCRM isn't active the counts
return `0` rather than erroring, and if Elementor isn't active the dynamic tags
simply don't register while the shortcodes keep working.

### Use them in Elementor

Requires **Elementor Pro** — dynamic tags register through Elementor's core API,
but the dynamic-content picker in the editor is a Pro feature.

Edit any text field → click the **dynamic** (database) icon → **FluentCRM** →
pick a tag.

Both tags share the same controls:

| Control | Default | Notes |
|---|---|---|
| **Format** | Compact | `86.3K` / `86,362` / `86,000` / `86362` |
| **Decimal places** | 1 | Compact only, 0–3 |
| **Round to nearest** | 1,000 | Rounded only; up to 1,000,000 for the emails figure |
| **Rounding** | Down | Down never overstates the real number |
| **Prefix** / **Suffix** | — | e.g. suffix `+` → `86.3K+` |

> **Counter widget:** its "Ending Number" is a number field and can't parse
> `86.3K`. Set **Format → Raw digits** there, and let the widget's own
> thousands-separator option handle the commas.

### Use them anywhere else

```
[fluentcrm_subscribers]                                  → 86.3K
[fluentcrm_subscribers format="exact"]                   → 86,362
[fluentcrm_subscribers format="round" suffix="+"]        → 86,000+
[fluentcrm_subscribers prefix="Join " suffix=" people"]  → Join 86.3K people

[fluentcrm_emails_sent]                                  → 15.5M
[fluentcrm_emails_sent format="exact"]                   → 15,525,776
[fluentcrm_emails_sent format="round" round_to="1000000" suffix="+"]
                                                         → 15,000,000+
```

Attribute names match the Elementor controls exactly.

### Why it rounds down

`86,362` renders as `86.3K`, not `86.4K`. A marketing number should never claim
more than you have — and rounding down means the figure stays true between cache
refreshes. Pass `rounding="nearest"` if you'd rather have `86.4K`.

### Caching

Counting subscribers is cheap. Counting **sent emails is not** — that table has
15.5M rows, and FluentCRM itself warns once it passes 400,000. A visitor must
never be the one waiting on that query.

So values are stored in an autoloaded option (already in memory by the time a
template renders) and refreshed **stale-while-revalidate**:

- **Fresh** → served straight from the option.
- **Stale** → the *old* number is served immediately and a one-off WP-Cron job
  recomputes in the background. No visitor waits.
- **Very stale** (past 4× the TTL) → recomputed inline. This is the safety net
  for sites running `DISABLE_WP_CRON` without a server-side cron replacing it.
- **First ever run** → primed on an admin page load, so the one unavoidable
  slow count happens to a logged-in admin rather than a visitor.
- **Source unavailable** → the last good number keeps being served, so a
  FluentCRM hiccup can't flash a `0` on the site.

TTLs: subscribers 1 hour, emails sent 6 hours. The subscriber count is also
marked stale on `fluent_crm/contact_created` and
`fluent_crm/subscriber_status_changed`, so signups show up without waiting out
the hour. Emails-sent is deliberately **not** hooked that way — it would fire
once per recipient in the middle of a campaign.

To change a TTL:

```php
add_filter( 'mag_fcrm_cache_ttl', function ( $ttl, $key ) {
	return 'emails_sent' === $key ? DAY_IN_SECONDS : $ttl;
}, 10, 2 );
```

To force a recount from other code: `mag_fcrm_refresh_stat( 'emails_sent' );`

### Adding another stat

Three steps, no other changes:

1. Add a count function returning `int`, or `null` when FluentCRM is missing.
   The useful FluentCRM scopes are `filterByStatues( [ 'subscribed' ] )`,
   `filterByLists( [ $id ] )` and `filterByTags( [ $id ] )`.
2. Register it in `mag_fcrm_stats()` with a TTL.
3. Add an 8-line subclass of `MAG_FCRM_Count_Tag` declaring `$stat_key`,
   `get_name()` and `get_title()`, and register it alongside the others.

Formatting, controls, caching and background refresh are all inherited.

### Verifying

On the site: `[fluentcrm_subscribers format="exact"]` and
`[fluentcrm_emails_sent format="exact"]` should match the "Active Contacts" and
"Emails Sent" tiles on the FluentCRM dashboard.

Before editing the snippet, run the harnesses in `tests/`. They stub WordPress,
Elementor and FluentCRM, so they need nothing installed — no WordPress, no
composer, no PHPUnit:

```sh
php -l snippets/fluentcrm-elementor-tags.php
php snippets/tests/formatter-test.php    # 84 assertions: formatting + cache behaviour
php snippets/tests/elementor-test.php    # 28 assertions: tag registration + rendering
```

`formatter-test.php` loads the snippet with neither plugin present, which is
what proves the site survives Elementor being deactivated.
`elementor-test.php` runs the real count callbacks against a stubbed FluentCRM
and asserts the queries built are `status = subscribed` and `status = sent` —
the same ones FluentCRM's dashboard runs.
