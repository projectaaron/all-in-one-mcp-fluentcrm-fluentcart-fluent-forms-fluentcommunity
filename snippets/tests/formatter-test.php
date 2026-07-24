<?php
/**
 * Standalone harness: stub just enough WordPress to load the snippet with
 * neither Elementor nor FluentCRM present, then exercise the formatter.
 */

define( 'ABSPATH', __DIR__ );
define( 'HOUR_IN_SECONDS', 3600 );

$GLOBALS['actions']    = array();
$GLOBALS['shortcodes'] = array();
$GLOBALS['transients'] = array();

function get_transient( $k ) {
	return isset( $GLOBALS['transients'][ $k ] ) ? $GLOBALS['transients'][ $k ] : false;
}
function set_transient( $k, $v, $t ) {
	$GLOBALS['transients'][ $k ] = $v;
}
function delete_transient( $k ) {
	unset( $GLOBALS['transients'][ $k ] );
}
function apply_filters( $tag, $value ) {
	return $value;
}
function add_action( $tag, $cb, $prio = 10, $args = 1 ) {
	$GLOBALS['actions'][ $tag ][] = $cb;
}
function add_shortcode( $tag, $cb ) {
	$GLOBALS['shortcodes'][ $tag ] = $cb;
}
function shortcode_atts( $pairs, $atts, $sc = '' ) {
	$atts = (array) $atts;
	$out  = array();
	foreach ( $pairs as $name => $default ) {
		$out[ $name ] = array_key_exists( $name, $atts ) ? $atts[ $name ] : $default;
	}
	return $out;
}
function wp_parse_args( $args, $defaults = array() ) {
	return array_merge( $defaults, (array) $args );
}
function number_format_i18n( $n, $decimals = 0 ) {
	return number_format( $n, $decimals );
}
function esc_html( $s ) {
	return htmlspecialchars( $s, ENT_QUOTES );
}
function esc_html__( $s, $d = '' ) {
	return $s;
}

require __DIR__ . '/../fluentcrm-elementor-tags.php';

$fails = 0;
$pass  = 0;

function check( $label, $actual, $expected ) {
	global $fails, $pass;
	if ( $actual === $expected ) {
		$pass++;
		printf( "  ok   %-52s %s\n", $label, $actual );
	} else {
		$fails++;
		printf( "  FAIL %-52s got %s, want %s\n", $label, var_export( $actual, true ), var_export( $expected, true ) );
	}
}

$n = 86362; // the live count

echo "Live count ({$n}):\n";
check( 'compact (default)', mag_fcrm_format_number( $n ), '86.3K' );
check( 'compact, nearest', mag_fcrm_format_number( $n, array( 'rounding' => 'nearest' ) ), '86.4K' );
check( 'compact, precision 0', mag_fcrm_format_number( $n, array( 'precision' => 0 ) ), '86K' );
check( 'compact, precision 2', mag_fcrm_format_number( $n, array( 'precision' => 2 ) ), '86.36K' );
check( 'exact', mag_fcrm_format_number( $n, array( 'format' => 'exact' ) ), '86,362' );
check( 'round (1000, down)', mag_fcrm_format_number( $n, array( 'format' => 'round' ) ), '86,000' );
check( 'round (1000, nearest)', mag_fcrm_format_number( $n, array( 'format' => 'round', 'rounding' => 'nearest' ) ), '86,000' );
check( 'round (500)', mag_fcrm_format_number( $n, array( 'format' => 'round', 'round_to' => 500 ) ), '86,000' );
check( 'round (100)', mag_fcrm_format_number( $n, array( 'format' => 'round', 'round_to' => 100 ) ), '86,300' );
check( 'round (10000)', mag_fcrm_format_number( $n, array( 'format' => 'round', 'round_to' => 10000 ) ), '80,000' );
check( 'raw', mag_fcrm_format_number( $n, array( 'format' => 'raw' ) ), '86362' );
check( 'suffix +', mag_fcrm_format_number( $n, array( 'format' => 'round', 'suffix' => '+' ) ), '86,000+' );
check( 'prefix and suffix', mag_fcrm_format_number( $n, array( 'prefix' => 'Over ', 'suffix' => ' readers' ) ), 'Over 86.3K readers' );
check( 'raw ignores prefix/suffix', mag_fcrm_format_number( $n, array( 'format' => 'raw', 'suffix' => '+' ) ), '86362' );

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
check( '15525776 emails sent', mag_fcrm_format_number( 15525776 ), '15.5M' );
check( '112942 total contacts', mag_fcrm_format_number( 112942 ), '112.9K' );

echo "\nEdge cases:\n";
check( 'zero compact', mag_fcrm_format_number( 0 ), '0' );
check( 'zero compact precision 0', mag_fcrm_format_number( 0, array( 'precision' => 0 ) ), '0' );
check( 'zero exact', mag_fcrm_format_number( 0, array( 'format' => 'exact' ) ), '0' );
check( 'zero round', mag_fcrm_format_number( 0, array( 'format' => 'round' ) ), '0' );
check( 'zero raw', mag_fcrm_format_number( 0, array( 'format' => 'raw' ) ), '0' );
check( 'negative compact (no -0.0K)', mag_fcrm_format_number( -1500 ), '-1.5K' );
check( 'negative raw', mag_fcrm_format_number( -42, array( 'format' => 'raw' ) ), '-42' );
check( 'round_to 0 does not divide by zero', mag_fcrm_format_number( $n, array( 'format' => 'round', 'round_to' => 0 ) ), '86,362' );
check( 'precision clamped above 3', mag_fcrm_format_number( $n, array( 'precision' => 99 ) ), '86.362K' );
check( 'precision clamped below 0', mag_fcrm_format_number( $n, array( 'precision' => -5 ) ), '86K' );
check( 'string input coerced', mag_fcrm_format_number( '86362' ), '86.3K' );
check( 'unknown format falls back to compact', mag_fcrm_format_number( $n, array( 'format' => 'nonsense' ) ), '86.3K' );

echo "\nGraceful degradation (FluentCRM absent):\n";
check( 'count returns 0', mag_fcrm_total_subscribers(), 0 );
check( 'zero was not cached', get_transient( 'mag_fcrm_total_subscribers' ), false );
check( 'shortcode still renders', call_user_func( $GLOBALS['shortcodes']['fluentcrm_subscribers'], array() ), '0' );
check( 'shortcode honors atts', call_user_func( $GLOBALS['shortcodes']['fluentcrm_subscribers'], array( 'format' => 'exact', 'suffix' => '+' ) ), '0+' );

echo "\nHook registration:\n";
check( 'elementor register hook', isset( $GLOBALS['actions']['elementor/dynamic_tags/register'] ), true );
check( 'contact_created flush', in_array( 'mag_fcrm_flush_subscriber_cache', $GLOBALS['actions']['fluent_crm/contact_created'], true ), true );
check( 'status_changed flush', in_array( 'mag_fcrm_flush_subscriber_cache', $GLOBALS['actions']['fluent_crm/subscriber_status_changed'], true ), true );

echo "\nCaching behaviour:\n";
$GLOBALS['transients']['mag_fcrm_total_subscribers'] = 86362;
check( 'reads from cache', mag_fcrm_total_subscribers(), 86362 );
mag_fcrm_flush_subscriber_cache();
check( 'flush clears cache', get_transient( 'mag_fcrm_total_subscribers' ), false );

printf( "\n%d passed, %d failed\n", $pass, $fails );
exit( $fails > 0 ? 1 : 0 );
