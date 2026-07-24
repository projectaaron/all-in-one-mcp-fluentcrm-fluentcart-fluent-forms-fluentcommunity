<?php
/**
 * Stub Elementor and FluentCRM, load the snippet, then fire the registration
 * callback — twice, to prove the class_exists guard survives a snippet
 * manager re-evaluating the code on save.
 *
 * Unlike formatter-test.php this one lets the REAL count callbacks run, so
 * the queries they build are checked against what FluentCRM's own
 * Stats::getCounts() runs.
 *
 * Run: php snippets/tests/elementor-test.php
 */

namespace {
	require __DIR__ . '/bootstrap.php';
}

/* ---- Elementor stubs ---- */
namespace Elementor\Core\DynamicTags {
	abstract class Tag {
		public $controls = array();
		public $settings = array();
		public function __construct( array $data = array() ) {
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

/* ---- FluentCRM stubs, so the real count callbacks run ---- */
namespace FluentCrm\App\Models {

	class Query {
		public $rows;
		public function __construct( $rows ) {
			$this->rows = $rows; }
		public function count() {
			return $this->rows; }
	}

	class Subscriber {
		public static $where = array();
		public static function where( $col, $val ) {
			self::$where = array( $col, $val );
			return new Query( 86362 );
		}
	}

	class CampaignEmail {
		public static $where = array();
		public static function where( $col, $val ) {
			self::$where = array( $col, $val );
			return new Query( 15525776 );
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

	echo "Count callbacks against stubbed FluentCRM:\n";
	check( 'subscriber count', mag_fcrm_count_subscribers(), 86362 );
	check( '  ... queried status = subscribed', implode( ' = ', \FluentCrm\App\Models\Subscriber::$where ), 'status = subscribed' );
	check( 'emails-sent count', mag_fcrm_count_emails_sent(), 15525776 );
	check( '  ... queried status = sent', implode( ' = ', \FluentCrm\App\Models\CampaignEmail::$where ), 'status = sent' );

	echo "\nFirst registration:\n";
	$callback = $GLOBALS['actions']['elementor/dynamic_tags/register'][0];
	$mgr      = new FakeTagsManager();
	$callback( $mgr );

	check( 'FluentCRM group registered', isset( $mgr->groups['fluentcrm'] ), true );
	check( 'group title', $mgr->groups['fluentcrm']['title'], 'FluentCRM' );
	check( 'both tags registered', implode( ',', array_keys( $mgr->tags ) ), 'fcrm-total-subscribers,fcrm-emails-sent' );

	$subs   = $mgr->tags['fcrm-total-subscribers'];
	$emails = $mgr->tags['fcrm-emails-sent'];

	check( 'subscribers title', $subs->get_title(), 'Total Email Subscribers' );
	check( 'emails title', $emails->get_title(), 'Total Emails Sent' );
	check( 'shared group', implode( ',', $emails->get_group() ), 'fluentcrm' );
	check( 'categories: text + number', implode( ',', $emails->get_categories() ), 'text,number' );
	check( 'shared controls', implode( ',', array_keys( $emails->controls ) ), 'format,precision,round_to,rounding,prefix,suffix' );
	check( 'default format is compact', $emails->controls['format']['default'], 'compact' );
	check( 'raw option present for Counter', isset( $emails->controls['format']['options']['raw'] ), true );
	check( 'prefix hidden on raw', $emails->controls['prefix']['condition']['format!'], 'raw' );
	check( 'round_to offers millions', isset( $emails->controls['round_to']['options'][1000000] ), true );

	echo "\nRendering:\n";
	reset_state();

	ob_start();
	$subs->render();
	check( 'subscribers, default', ob_get_clean(), '86.3K' );

	ob_start();
	$emails->render();
	check( 'emails sent, default', ob_get_clean(), '15.5M' );

	$emails->settings = array( 'format' => 'raw' );
	ob_start();
	$emails->render();
	check( 'emails sent, raw for Counter', ob_get_clean(), '15525776' );

	$emails->settings = array( 'format' => 'round', 'round_to' => 1000000, 'suffix' => '+' );
	ob_start();
	$emails->render();
	check( 'emails sent, rounded to millions', ob_get_clean(), '15,000,000+' );

	$subs->settings = array( 'format' => 'exact' );
	ob_start();
	$subs->render();
	check( 'subscribers, exact', ob_get_clean(), '86,362' );

	echo "\nRendering caches rather than re-querying:\n";
	check( 'subscribers stored', get_option( 'mag_fcrm_stat_total_subscribers' )['value'], 86362 );
	check( 'emails stored', get_option( 'mag_fcrm_stat_emails_sent' )['value'], 15525776 );

	// Move the underlying numbers. A cached render must not notice.
	\FluentCrm\App\Models\Subscriber::$where   = array();
	\FluentCrm\App\Models\CampaignEmail::$where = array();

	$subs->settings = array();
	ob_start();
	$subs->render();
	check( 'second render served from cache', ob_get_clean(), '86.3K' );
	check( '  ... and never touched the model', \FluentCrm\App\Models\Subscriber::$where, array() );

	$emails->settings = array();
	ob_start();
	$emails->render();
	check( 'emails second render from cache', ob_get_clean(), '15.5M' );
	check( '  ... and never touched the model', \FluentCrm\App\Models\CampaignEmail::$where, array() );

	echo "\nSecond registration (snippet manager re-save):\n";
	$mgr2 = new FakeTagsManager();
	$callback( $mgr2 );
	check( 'no redeclaration fatal', implode( ',', array_keys( $mgr2->tags ) ), 'fcrm-total-subscribers,fcrm-emails-sent' );

	summary();
}
