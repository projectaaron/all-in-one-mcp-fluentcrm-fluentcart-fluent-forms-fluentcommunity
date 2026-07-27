<?php
/**
 * Just enough WordPress to load the snippet outside WordPress.
 *
 * Shared by formatter-test.php and elementor-test.php. Nothing here tries to
 * be faithful beyond what the snippet actually touches.
 */

define( 'ABSPATH', __DIR__ );
define( 'HOUR_IN_SECONDS', 3600 );

$GLOBALS['actions']    = array();
$GLOBALS['shortcodes'] = array();
$GLOBALS['options']    = array();
$GLOBALS['cron']       = array();
$GLOBALS['queries']    = 0;   // how many times a count callback actually ran

/* ---- options ---- */
function get_option( $k, $default = false ) {
	return array_key_exists( $k, $GLOBALS['options'] ) ? $GLOBALS['options'][ $k ] : $default;
}
function update_option( $k, $v, $autoload = null ) {
	$GLOBALS['options'][ $k ] = $v;
	return true;
}
function delete_option( $k ) {
	unset( $GLOBALS['options'][ $k ] );
	return true;
}

/* ---- cron ---- */
function wp_next_scheduled( $hook, $args = array() ) {
	$key = $hook . '|' . wp_json_encode( $args );
	return isset( $GLOBALS['cron'][ $key ] ) ? $GLOBALS['cron'][ $key ] : false;
}
function wp_schedule_single_event( $ts, $hook, $args = array() ) {
	$GLOBALS['cron'][ $hook . '|' . wp_json_encode( $args ) ] = $ts;
	return true;
}
function wp_json_encode( $v ) {
	return json_encode( $v );
}

/* ---- hooks & shortcodes ---- */
function add_action( $tag, $cb, $prio = 10, $args = 1 ) {
	$GLOBALS['actions'][ $tag ][] = $cb;
}
function add_shortcode( $tag, $cb ) {
	$GLOBALS['shortcodes'][ $tag ] = $cb;
}
function apply_filters( $tag, $value ) {
	return $value;
}

/* ---- misc ---- */
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

/* ---- assertions ---- */
$GLOBALS['pass']  = 0;
$GLOBALS['fails'] = 0;

function check( $label, $actual, $expected ) {
	if ( $actual === $expected ) {
		$GLOBALS['pass']++;
		$shown = is_scalar( $actual ) && ! is_bool( $actual ) ? (string) $actual : var_export( $actual, true );
		printf( "  ok   %-52s %s\n", $label, preg_replace( '/\s+/', ' ', $shown ) );
	} else {
		$GLOBALS['fails']++;
		printf( "  FAIL %-52s got %s, want %s\n", $label, var_export( $actual, true ), var_export( $expected, true ) );
	}
}

function summary() {
	printf( "\n%d passed, %d failed\n", $GLOBALS['pass'], $GLOBALS['fails'] );
	exit( $GLOBALS['fails'] > 0 ? 1 : 0 );
}

/**
 * Backdate a stored stat so staleness can be tested without stubbing time().
 */
function age_stat( $key, $seconds ) {
	$GLOBALS['options'][ 'mag_fcrm_stat_' . $key ]['at'] = time() - $seconds;
}

function reset_state() {
	$GLOBALS['options'] = array();
	$GLOBALS['cron']    = array();
	$GLOBALS['queries'] = 0;
}
