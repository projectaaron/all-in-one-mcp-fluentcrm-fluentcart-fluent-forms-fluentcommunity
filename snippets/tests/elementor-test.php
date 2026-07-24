<?php
/**
 * Stub Elementor's dynamic-tag API, load the snippet, then fire the
 * registration callback — twice, to prove the class_exists guard survives a
 * snippet manager re-evaluating the code on save.
 */

namespace {
	define( 'ABSPATH', __DIR__ );
	define( 'HOUR_IN_SECONDS', 3600 );

	$GLOBALS['actions']    = array();
	$GLOBALS['transients'] = array();

	function get_transient( $k ) {
		return isset( $GLOBALS['transients'][ $k ] ) ? $GLOBALS['transients'][ $k ] : false; }
	function set_transient( $k, $v, $t ) {
		$GLOBALS['transients'][ $k ] = $v; }
	function delete_transient( $k ) {
		unset( $GLOBALS['transients'][ $k ] ); }
	function apply_filters( $tag, $value ) {
		return $value; }
	function add_action( $tag, $cb, $prio = 10, $args = 1 ) {
		$GLOBALS['actions'][ $tag ][] = $cb; }
	function add_shortcode( $tag, $cb ) {}
	function shortcode_atts( $pairs, $atts, $sc = '' ) {
		return array_merge( $pairs, (array) $atts ); }
	function wp_parse_args( $args, $defaults = array() ) {
		return array_merge( $defaults, (array) $args ); }
	function number_format_i18n( $n, $d = 0 ) {
		return number_format( $n, $d ); }
	function esc_html( $s ) {
		return htmlspecialchars( $s, ENT_QUOTES ); }
	function esc_html__( $s, $d = '' ) {
		return $s; }
}

/* ---- Elementor stubs ---- */
namespace Elementor\Core\DynamicTags {
	abstract class Tag {
		public $controls = array();
		public $settings = array();
		public function __construct() {
			$this->register_controls();
		}
		protected function register_controls() {}
		public function add_control( $id, $args ) {
			$this->controls[ $id ] = $args;
		}
		public function get_settings() {
			$out = array();
			foreach ( $this->controls as $id => $args ) {
				$out[ $id ] = isset( $this->settings[ $id ] ) ? $this->settings[ $id ]
					: ( isset( $args['default'] ) ? $args['default'] : '' );
			}
			return $out;
		}
	}
}

namespace Elementor\Modules\DynamicTags {
	class Module {
		const TEXT_CATEGORY   = 'text';
		const NUMBER_CATEGORY = 'number';
	}
}

namespace Elementor {
	class Controls_Manager {
		const SELECT = 'select';
		const NUMBER = 'number';
		const TEXT   = 'text';
	}
}

/* ---- FluentCRM stub, so the count path runs for real ---- */
namespace FluentCrm\App\Models {
	class Subscriber {
		public static $lastColumn = null;
		public static $lastStatus = null;
		public static function where( $col, $val ) {
			self::$lastColumn = $col;
			self::$lastStatus = $val;
			return new self();
		}
		public function count() {
			return 86362;
		}
	}
}

namespace {

	class FakeTagsManager {
		public $groups = array();
		public $tags   = array();
		public function register_group( $name, $args ) {
			$this->groups[ $name ] = $args; }
		public function register( $tag ) {
			$this->tags[ $tag->get_name() ] = $tag; }
	}

	require __DIR__ . '/../fluentcrm-elementor-tags.php';

	$fails = 0;
	$pass  = 0;
	function check( $label, $actual, $expected ) {
		global $fails, $pass;
		if ( $actual === $expected ) {
			$pass++;
			printf( "  ok   %-50s %s\n", $label, is_bool( $actual ) ? var_export( $actual, true ) : $actual );
		} else {
			$fails++;
			printf( "  FAIL %-50s got %s, want %s\n", $label, var_export( $actual, true ), var_export( $expected, true ) );
		}
	}

	$callback = $GLOBALS['actions']['elementor/dynamic_tags/register'][0];

	echo "First registration:\n";
	$mgr = new FakeTagsManager();
	$callback( $mgr );

	check( 'FluentCRM group registered', isset( $mgr->groups['fluentcrm'] ), true );
	check( 'group title', $mgr->groups['fluentcrm']['title'], 'FluentCRM' );
	check( 'tag registered', isset( $mgr->tags['fcrm-total-subscribers'] ), true );

	$tag = $mgr->tags['fcrm-total-subscribers'];
	check( 'tag title', $tag->get_title(), 'Total Email Subscribers' );
	check( 'tag group', implode( ',', $tag->get_group() ), 'fluentcrm' );
	check( 'categories: text + number', implode( ',', $tag->get_categories() ), 'text,number' );
	check( 'controls registered', implode( ',', array_keys( $tag->controls ) ), 'format,precision,round_to,rounding,prefix,suffix' );
	check( 'default format is compact', $tag->controls['format']['default'], 'compact' );
	check( 'raw option present for Counter', isset( $tag->controls['format']['options']['raw'] ), true );
	check( 'prefix hidden on raw', $tag->controls['prefix']['condition']['format!'], 'raw' );

	echo "\nRendering against stubbed FluentCRM (86,362):\n";
	ob_start();
	$tag->render();
	check( 'default render', ob_get_clean(), '86.3K' );

	check( 'queried column', \FluentCrm\App\Models\Subscriber::$lastColumn, 'status' );
	check( 'queried value', \FluentCrm\App\Models\Subscriber::$lastStatus, 'subscribed' );
	check( 'count was cached', get_transient( 'mag_fcrm_total_subscribers' ), 86362 );

	$tag->settings = array( 'format' => 'raw' );
	ob_start();
	$tag->render();
	check( 'raw render for Counter widget', ob_get_clean(), '86362' );

	$tag->settings = array( 'format' => 'round', 'suffix' => '+' );
	ob_start();
	$tag->render();
	check( 'rounded render with suffix', ob_get_clean(), '86,000+' );

	echo "\nSecond registration (snippet manager re-save):\n";
	$mgr2 = new FakeTagsManager();
	$callback( $mgr2 );
	check( 'no redeclaration fatal', isset( $mgr2->tags['fcrm-total-subscribers'] ), true );

	printf( "\n%d passed, %d failed\n", $pass, $fails );
	exit( $fails > 0 ? 1 : 0 );
}
