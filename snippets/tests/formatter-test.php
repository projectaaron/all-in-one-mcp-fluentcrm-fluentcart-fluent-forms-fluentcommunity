<?php
/**
 * Formatting and caching, with neither Elementor nor FluentCRM present.
 *
 * Loading the snippet at all under those conditions is itself the test that
 * the site survives either plugin being deactivated.
 *
 * Run: php snippets/tests/formatter-test.php
 */

require __DIR__ . '/bootstrap.php';

/**
 * Override the stat registry before loading the snippet — every function in
 * it is function_exists-guarded, so defining this first wins. Lets the cache
 * tests below count exactly how often an "expensive" query actually runs.
 * The real count callbacks are tested directly further down.
 */
function mag_fcrm_stats() {
	return array(
		'total_subscribers' => array(
			'ttl'      => HOUR_IN_SECONDS,
			'callback' => 'test_counter',
		),
		'emails_sent'       => array(
			'ttl'      => 6 * HOUR_IN_SECONDS,
			'callback' => 'test_counter',
		),
	);
}

function test_counter() {
	if ( ! empty( $GLOBALS['source_broken'] ) ) {
		return null;  // stands in for FluentCRM being unavailable
	}
	$GLOBALS['queries']++;
	return 4242;
}

require __DIR__ . '/../fluentcrm-elementor-tags.php';

$n = 86362;    // live subscriber count
$e = 15525776; // live emails-sent count

echo "Subscriber count ({$n}):\n";
check( 'compact (default)', mag_fcrm_format_number( $n ), '86.3K' );
check( 'compact, nearest', mag_fcrm_format_number( $n, array( 'rounding' => 'nearest' ) ), '86.4K' );
check( 'compact, precision 0', mag_fcrm_format_number( $n, array( 'precision' => 0 ) ), '86K' );
check( 'compact, precision 2', mag_fcrm_format_number( $n, array( 'precision' => 2 ) ), '86.36K' );
check( 'exact', mag_fcrm_format_number( $n, array( 'format' => 'exact' ) ), '86,362' );
check( 'round (1000, down)', mag_fcrm_format_number( $n, array( 'format' => 'round' ) ), '86,000' );
check( 'round (1000, nearest)', mag_fcrm_format_number( $n, array( 'format' => 'round', 'rounding' => 'nearest' ) ), '86,000' );
check( 'round (100)', mag_fcrm_format_number( $n, array( 'format' => 'round', 'round_to' => 100 ) ), '86,300' );
check( 'round (10000)', mag_fcrm_format_number( $n, array( 'format' => 'round', 'round_to' => 10000 ) ), '80,000' );
check( 'raw', mag_fcrm_format_number( $n, array( 'format' => 'raw' ) ), '86362' );
check( 'suffix +', mag_fcrm_format_number( $n, array( 'format' => 'round', 'suffix' => '+' ) ), '86,000+' );
check( 'prefix and suffix', mag_fcrm_format_number( $n, array( 'prefix' => 'Over ', 'suffix' => ' readers' ) ), 'Over 86.3K readers' );
check( 'raw ignores prefix/suffix', mag_fcrm_format_number( $n, array( 'format' => 'raw', 'suffix' => '+' ) ), '86362' );

echo "\nEmails-sent count ({$e}) — millions:\n";
check( 'compact', mag_fcrm_format_number( $e ), '15.5M' );
check( 'compact, precision 0', mag_fcrm_format_number( $e, array( 'precision' => 0 ) ), '15M' );
check( 'compact, precision 2', mag_fcrm_format_number( $e, array( 'precision' => 2 ) ), '15.52M' );
check( 'exact', mag_fcrm_format_number( $e, array( 'format' => 'exact' ) ), '15,525,776' );
check( 'round to 1M', mag_fcrm_format_number( $e, array( 'format' => 'round', 'round_to' => 1000000 ) ), '15,000,000' );
check( 'round to 100k, suffix', mag_fcrm_format_number( $e, array( 'format' => 'round', 'round_to' => 100000, 'suffix' => '+' ) ), '15,500,000+' );
check( 'raw for Counter', mag_fcrm_format_number( $e, array( 'format' => 'raw' ) ), '15525776' );

echo "\nTrailing-zero trimming:\n";
check( 'exactly 86000 compact', mag_fcrm_format_number( 86000 ), '86K' );
check( '20000 compact (not "2K")', mag_fcrm_format_number( 20000 ), '20K' );
check( '20000 compact precision 0', mag_fcrm_format_number( 20000, array( 'precision' => 0 ) ), '20K' );
check( '100000 compact', mag_fcrm_format_number( 100000 ), '100K' );
check( '1000 compact', mag_fcrm_format_number( 1000 ), '1K' );

echo "\nMagnitude boundaries:\n";
check( '999 stays bare', mag_fcrm_format_number( 999 ), '999' );
check( '1000 becomes K', mag_fcrm_format_number( 1000 ), '1K' );
check( '999999 stays K', mag_fcrm_format_number( 999999 ), '999.9K' );
check( '1000000 becomes M', mag_fcrm_format_number( 1000000 ), '1M' );
check( '112942 total contacts', mag_fcrm_format_number( 112942 ), '112.9K' );

echo "\nEdge cases:\n";
check( 'zero compact', mag_fcrm_format_number( 0 ), '0' );
check( 'zero compact precision 0', mag_fcrm_format_number( 0, array( 'precision' => 0 ) ), '0' );
check( 'zero exact', mag_fcrm_format_number( 0, array( 'format' => 'exact' ) ), '0' );
check( 'zero raw', mag_fcrm_format_number( 0, array( 'format' => 'raw' ) ), '0' );
check( 'negative compact (no -0.0K)', mag_fcrm_format_number( -1500 ), '-1.5K' );
check( 'negative raw', mag_fcrm_format_number( -42, array( 'format' => 'raw' ) ), '-42' );
check( 'round_to 0 does not divide by zero', mag_fcrm_format_number( $n, array( 'format' => 'round', 'round_to' => 0 ) ), '86,362' );
check( 'precision clamped above 3', mag_fcrm_format_number( $n, array( 'precision' => 99 ) ), '86.362K' );
check( 'precision clamped below 0', mag_fcrm_format_number( $n, array( 'precision' => -5 ) ), '86K' );
check( 'string input coerced', mag_fcrm_format_number( '86362' ), '86.3K' );
check( 'unknown format falls back to compact', mag_fcrm_format_number( $n, array( 'format' => 'nonsense' ) ), '86.3K' );

echo "\nCount callbacks with FluentCRM absent:\n";
check( 'subscriber count returns null', mag_fcrm_count_subscribers(), null );
check( 'emails-sent count returns null', mag_fcrm_count_emails_sent(), null );

echo "\nDegradation when the source is unavailable:\n";
reset_state();
$GLOBALS['source_broken'] = true;
check( 'subscribers returns 0', mag_fcrm_stat( 'total_subscribers' ), 0 );
check( 'emails sent returns 0', mag_fcrm_stat( 'emails_sent' ), 0 );
check( 'nothing was stored', get_option( 'mag_fcrm_stat_total_subscribers' ), false );
check( 'unknown stat key returns 0', mag_fcrm_stat( 'no_such_stat' ), 0 );
check( 'subscriber shortcode renders', call_user_func( $GLOBALS['shortcodes']['fluentcrm_subscribers'], array() ), '0' );
check( 'emails shortcode renders', call_user_func( $GLOBALS['shortcodes']['fluentcrm_emails_sent'], array() ), '0' );
check( 'shortcode honors atts', call_user_func( $GLOBALS['shortcodes']['fluentcrm_subscribers'], array( 'format' => 'exact', 'suffix' => '+' ) ), '0+' );
$GLOBALS['source_broken'] = false;

echo "\nHook registration:\n";
check( 'elementor register hook', isset( $GLOBALS['actions']['elementor/dynamic_tags/register'] ), true );
check( 'contact_created flush', in_array( 'mag_fcrm_flush_subscriber_cache', $GLOBALS['actions']['fluent_crm/contact_created'], true ), true );
check( 'status_changed flush', in_array( 'mag_fcrm_flush_subscriber_cache', $GLOBALS['actions']['fluent_crm/subscriber_status_changed'], true ), true );
check( 'cron refresh handler', in_array( 'mag_fcrm_refresh_stat', $GLOBALS['actions']['mag_fcrm_refresh_stat_event'], true ), true );
check( 'admin primer', in_array( 'mag_fcrm_prime_stats', $GLOBALS['actions']['admin_init'], true ), true );
check( 'no per-email flush hook', isset( $GLOBALS['actions']['fluent_crm/email_sent'] ), false );
check( 'both shortcodes registered', implode( ',', array_keys( $GLOBALS['shortcodes'] ) ), 'fluentcrm_subscribers,fluentcrm_emails_sent' );

/* -------------------------------------------------------------------------
 * Caching. The query counters are the point: an expensive count must never
 * run on a request that could have served a stale number instead.
 * ---------------------------------------------------------------------- */

echo "\nCaching — fresh:\n";
reset_state();
check( 'first read computes', mag_fcrm_stat( 'total_subscribers' ), 4242 );
check( '  ... ran the query once', $GLOBALS['queries'], 1 );
check( 'second read is cached', mag_fcrm_stat( 'total_subscribers' ), 4242 );
check( '  ... did not re-run it', $GLOBALS['queries'], 1 );
check( 'no refresh scheduled while fresh', wp_next_scheduled( 'mag_fcrm_refresh_stat_event', array( 'total_subscribers' ) ), false );

echo "\nCaching — stale serves the old value and refreshes in background:\n";
age_stat( 'total_subscribers', 2 * HOUR_IN_SECONDS ); // TTL is 1h
check( 'stale read still returns a number', mag_fcrm_stat( 'total_subscribers' ), 4242 );
check( '  ... WITHOUT running the query', $GLOBALS['queries'], 1 );
check( '  ... and scheduled a refresh', is_int( wp_next_scheduled( 'mag_fcrm_refresh_stat_event', array( 'total_subscribers' ) ) ), true );

echo "\nCaching — emails_sent gets the longer TTL:\n";
reset_state();
mag_fcrm_stat( 'emails_sent' );
age_stat( 'emails_sent', 2 * HOUR_IN_SECONDS );
check( 'still fresh at 2h', mag_fcrm_stat( 'emails_sent' ), 4242 );
check( '  ... no requery', $GLOBALS['queries'], 1 );
age_stat( 'emails_sent', 7 * HOUR_IN_SECONDS );
check( 'stale at 7h', mag_fcrm_stat( 'emails_sent' ), 4242 );
check( '  ... still no inline requery', $GLOBALS['queries'], 1 );
check( '  ... refresh scheduled instead', is_int( wp_next_scheduled( 'mag_fcrm_refresh_stat_event', array( 'emails_sent' ) ) ), true );

echo "\nCaching — cron evidently dead, recompute inline:\n";
reset_state();
mag_fcrm_stat( 'total_subscribers' );
age_stat( 'total_subscribers', 5 * HOUR_IN_SECONDS ); // past 4x TTL
check( 'value still correct', mag_fcrm_stat( 'total_subscribers' ), 4242 );
check( '  ... and it did recompute', $GLOBALS['queries'], 2 );

echo "\nCaching — marking stale keeps the old number:\n";
reset_state();
mag_fcrm_stat( 'total_subscribers' );
mag_fcrm_flush_subscriber_cache();
$stored = get_option( 'mag_fcrm_stat_total_subscribers' );
check( 'value survived the flush', $stored['value'], 4242 );
check( 'flagged stale', ! empty( $stored['stale'] ), true );
check( 'refresh scheduled', is_int( wp_next_scheduled( 'mag_fcrm_refresh_stat_event', array( 'total_subscribers' ) ) ), true );
check( 'stale read serves old value', mag_fcrm_stat( 'total_subscribers' ), 4242 );
check( '  ... without querying', $GLOBALS['queries'], 1 );

echo "\nCaching — repeat flushes do not thrash the option:\n";
$before = $GLOBALS['options']['mag_fcrm_stat_total_subscribers'];
mag_fcrm_flush_subscriber_cache();
mag_fcrm_flush_subscriber_cache();
check( 'already-stale flush is a no-op', $GLOBALS['options']['mag_fcrm_stat_total_subscribers'], $before );

echo "\nCaching — the cron event recomputes and clears the flag:\n";
mag_fcrm_refresh_stat( 'total_subscribers' );
$stored = get_option( 'mag_fcrm_stat_total_subscribers' );
check( 'query ran', $GLOBALS['queries'], 2 );
check( 'stale flag cleared', isset( $stored['stale'] ), false );
check( 'timestamp refreshed', ( time() - $stored['at'] ) < 5, true );

echo "\nCaching — source disappears after a good read:\n";
reset_state();
mag_fcrm_stat( 'total_subscribers' );
age_stat( 'total_subscribers', 99 * HOUR_IN_SECONDS );
$GLOBALS['source_broken'] = true;
check( 'serves last good number, not 0', mag_fcrm_stat( 'total_subscribers' ), 4242 );
$GLOBALS['source_broken'] = false;

echo "\nAdmin primer:\n";
reset_state();
mag_fcrm_prime_stats();
check( 'primed both stats', $GLOBALS['queries'], 2 );
mag_fcrm_prime_stats();
check( 'second prime is a no-op', $GLOBALS['queries'], 2 );

summary();
