<?php
/**
 * FluentCRM → Elementor dynamic tags
 *
 * Puts live FluentCRM numbers into Elementor so the vanity figures on the
 * site stop being hardcoded in a dozen widgets.
 *
 *   Total Email Subscribers — contacts with status "subscribed"
 *   Total Emails Sent       — campaign emails with status "sent"
 *
 * Both match FluentCRM's own dashboard tiles exactly: they run the same
 * queries FluentCrm\App\Services\Stats::getCounts() runs.
 *
 * Two ways to use them:
 *   1. Elementor → any text field → the dynamic (database) icon →
 *      FluentCRM → …                                (requires Elementor Pro)
 *   2. [fluentcrm_subscribers] / [fluentcrm_emails_sent] anywhere
 *      shortcodes run.
 *
 * Install: paste into WPCode / Code Snippets as a PHP snippet, omitting the
 * opening <?php line above. See README.md in this directory.
 *
 * This file is WordPress-side PHP. It has nothing to do with the MCP server
 * in the rest of this repository and is not loaded by it.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* -------------------------------------------------------------------------
 * 1. The stat registry
 *
 * Adding a stat means adding an entry here plus a small tag subclass below.
 * Nothing else changes.
 * ---------------------------------------------------------------------- */

if ( ! function_exists( 'mag_fcrm_stats' ) ) {
	/**
	 * @return array<string, array{ttl:int, callback:callable}>
	 */
	function mag_fcrm_stats() {
		return array(
			'total_subscribers' => array(
				// Cheap: ~86k rows, indexed. Safe to recompute inline.
				'ttl'      => HOUR_IN_SECONDS,
				'callback' => 'mag_fcrm_count_subscribers',
			),
			'emails_sent'       => array(
				// Expensive: 15M+ rows. FluentCRM itself warns past 400k.
				// Never let a visitor wait on this one.
				'ttl'      => 6 * HOUR_IN_SECONDS,
				'callback' => 'mag_fcrm_count_emails_sent',
			),
		);
	}
}

if ( ! function_exists( 'mag_fcrm_count_subscribers' ) ) {
	/**
	 * @return int|null Null when FluentCRM isn't available.
	 */
	function mag_fcrm_count_subscribers() {
		if ( ! class_exists( '\FluentCrm\App\Models\Subscriber' ) ) {
			return null;
		}

		return (int) \FluentCrm\App\Models\Subscriber::where( 'status', 'subscribed' )->count();
	}
}

if ( ! function_exists( 'mag_fcrm_count_emails_sent' ) ) {
	/**
	 * @return int|null Null when FluentCRM isn't available.
	 */
	function mag_fcrm_count_emails_sent() {
		if ( ! class_exists( '\FluentCrm\App\Models\CampaignEmail' ) ) {
			return null;
		}

		return (int) \FluentCrm\App\Models\CampaignEmail::where( 'status', 'sent' )->count();
	}
}

/* -------------------------------------------------------------------------
 * 2. Caching — stale-while-revalidate
 *
 * Counting 15M campaign_emails rows takes seconds, so a visitor must never
 * be the one paying for it. Values live in an autoloaded option (already in
 * memory by the time a template renders). When one goes stale we serve the
 * old number and recompute in the background, so the only inline count is
 * the very first one — and the admin primer usually absorbs even that.
 * ---------------------------------------------------------------------- */

if ( ! function_exists( 'mag_fcrm_stat' ) ) {
	/**
	 * @param string $key Registry key.
	 * @return int
	 */
	function mag_fcrm_stat( $key ) {
		$stats = mag_fcrm_stats();

		if ( ! isset( $stats[ $key ] ) ) {
			return 0;
		}

		$ttl    = (int) apply_filters( 'mag_fcrm_cache_ttl', $stats[ $key ]['ttl'], $key );
		$stored = get_option( 'mag_fcrm_stat_' . $key );

		$has_value = is_array( $stored ) && isset( $stored['value'], $stored['at'] );
		$age       = $has_value ? ( time() - (int) $stored['at'] ) : PHP_INT_MAX;
		$flagged   = $has_value && ! empty( $stored['stale'] );

		if ( $has_value && ! $flagged && $age < $ttl ) {
			return (int) $stored['value'];
		}

		// Stale but usable: hand back the old number, refresh out of band.
		// Past 4x the TTL we stop trusting cron and just recompute — that's
		// the safety net for sites running with DISABLE_WP_CRON and no
		// server-side cron replacing it.
		if ( $has_value && $age < ( $ttl * 4 ) ) {
			mag_fcrm_schedule_stat_refresh( $key );
			return (int) $stored['value'];
		}

		$value = mag_fcrm_refresh_stat( $key );

		if ( null === $value ) {
			// FluentCRM unavailable — keep serving the last good number
			// rather than flashing a zero.
			return $has_value ? (int) $stored['value'] : 0;
		}

		return $value;
	}
}

if ( ! function_exists( 'mag_fcrm_refresh_stat' ) ) {
	/**
	 * Recompute one stat and store it.
	 *
	 * @param string $key Registry key.
	 * @return int|null Null when the source is unavailable (nothing stored).
	 */
	function mag_fcrm_refresh_stat( $key ) {
		$stats = mag_fcrm_stats();

		if ( ! isset( $stats[ $key ] ) || ! is_callable( $stats[ $key ]['callback'] ) ) {
			return null;
		}

		$value = call_user_func( $stats[ $key ]['callback'] );

		if ( null === $value ) {
			return null;
		}

		update_option(
			'mag_fcrm_stat_' . $key,
			array(
				'value' => (int) $value,
				'at'    => time(),
			),
			true // Autoloaded: read on nearly every render, two ints.
		);

		return (int) $value;
	}
}

if ( ! function_exists( 'mag_fcrm_schedule_stat_refresh' ) ) {
	/**
	 * @param string $key Registry key.
	 * @return void
	 */
	function mag_fcrm_schedule_stat_refresh( $key ) {
		if ( ! wp_next_scheduled( 'mag_fcrm_refresh_stat_event', array( $key ) ) ) {
			wp_schedule_single_event( time() + 30, 'mag_fcrm_refresh_stat_event', array( $key ) );
		}
	}
}

add_action( 'mag_fcrm_refresh_stat_event', 'mag_fcrm_refresh_stat' );

if ( ! function_exists( 'mag_fcrm_mark_stat_stale' ) ) {
	/**
	 * Flag a stat for refresh without discarding its value.
	 *
	 * Deleting would force the next visitor to pay for the recount; this way
	 * they get the old number and cron does the work. The already-stale check
	 * keeps a bulk import from writing the option once per contact.
	 *
	 * @param string $key Registry key.
	 * @return void
	 */
	function mag_fcrm_mark_stat_stale( $key ) {
		$option = 'mag_fcrm_stat_' . $key;
		$stored = get_option( $option );

		if ( ! is_array( $stored ) || ! empty( $stored['stale'] ) ) {
			return;
		}

		$stored['stale'] = true;
		update_option( $option, $stored, true );

		mag_fcrm_schedule_stat_refresh( $key );
	}
}

if ( ! function_exists( 'mag_fcrm_flush_subscriber_cache' ) ) {
	/**
	 * @return void
	 */
	function mag_fcrm_flush_subscriber_cache() {
		mag_fcrm_mark_stat_stale( 'total_subscribers' );
	}
}

// New signups show up without waiting out the TTL. Deliberately NOT hooked
// for emails_sent: that would fire once per recipient mid-campaign.
add_action( 'fluent_crm/contact_created', 'mag_fcrm_flush_subscriber_cache' );
add_action( 'fluent_crm/subscriber_status_changed', 'mag_fcrm_flush_subscriber_cache' );

if ( ! function_exists( 'mag_fcrm_prime_stats' ) ) {
	/**
	 * Compute any stat that has never been computed, on an admin request.
	 *
	 * The first count has to happen somewhere; better an admin waiting on
	 * wp-admin than a visitor waiting on the homepage. No-ops once primed.
	 *
	 * @return void
	 */
	function mag_fcrm_prime_stats() {
		foreach ( array_keys( mag_fcrm_stats() ) as $key ) {
			if ( ! is_array( get_option( 'mag_fcrm_stat_' . $key ) ) ) {
				mag_fcrm_refresh_stat( $key );
			}
		}
	}
}

add_action( 'admin_init', 'mag_fcrm_prime_stats' );

/* -------------------------------------------------------------------------
 * 3. Formatting
 * ---------------------------------------------------------------------- */

if ( ! function_exists( 'mag_fcrm_format_number' ) ) {
	/**
	 * Format a count for display.
	 *
	 * Rounding defaults to "down" everywhere, so a vanity number can never
	 * overstate the real one: 86,362 renders as 86.3K, not 86.4K.
	 *
	 * @param int   $number Raw count.
	 * @param array $args   format: compact|exact|round|raw, precision,
	 *                      round_to, rounding: down|nearest, prefix, suffix.
	 * @return string
	 */
	function mag_fcrm_format_number( $number, $args = array() ) {
		$args = wp_parse_args(
			$args,
			array(
				'format'    => 'compact',
				'precision' => 1,
				'round_to'  => 1000,
				'rounding'  => 'down',
				'prefix'    => '',
				'suffix'    => '',
			)
		);

		$number    = (int) $number;
		$abs       = abs( $number );
		$sign      = $number < 0 ? '-' : '';
		$precision = max( 0, min( 3, (int) $args['precision'] ) );
		$round_dn  = 'nearest' !== $args['rounding'];

		switch ( $args['format'] ) {
			case 'raw':
				// Digits only — Elementor's Counter widget can't parse "86.3K".
				return (string) ( $sign . $abs );

			case 'exact':
				$value = number_format_i18n( $abs );
				break;

			case 'round':
				$step  = max( 1, (int) $args['round_to'] );
				$value = number_format_i18n(
					$round_dn ? intdiv( $abs, $step ) * $step : (int) ( round( $abs / $step ) * $step )
				);
				break;

			case 'compact':
			default:
				if ( $abs >= 1000000 ) {
					$divisor = 1000000;
					$unit    = 'M';
				} elseif ( $abs >= 1000 ) {
					$divisor = 1000;
					$unit    = 'K';
				} else {
					$divisor = 1;
					$unit    = '';
				}

				$factor = pow( 10, $precision );
				$scaled = $abs / $divisor;
				$scaled = $round_dn ? floor( $scaled * $factor ) / $factor : round( $scaled * $factor ) / $factor;

				$value = number_format( $scaled, $precision, '.', '' );

				// Trim a trailing ".0" so 86,000 reads "86K" — but only past the
				// decimal point, or "20" would get chewed down to "2".
				if ( false !== strpos( $value, '.' ) ) {
					$value = rtrim( rtrim( $value, '0' ), '.' );
				}

				if ( '' === $value ) {
					$value = '0';
				}

				$value .= $unit;
				break;
		}

		return $args['prefix'] . $sign . $value . $args['suffix'];
	}
}

/* -------------------------------------------------------------------------
 * 4. The Elementor dynamic tags
 * ---------------------------------------------------------------------- */

add_action(
	'elementor/dynamic_tags/register',
	function ( $dynamic_tags ) {

		$dynamic_tags->register_group(
			'fluentcrm',
			array( 'title' => esc_html__( 'FluentCRM', 'fluentcrm-elementor-tags' ) )
		);

		// Declared here, not at file scope: the parent class doesn't exist until
		// Elementor loads, and a top-level "extends" would fatal the site the
		// moment Elementor is deactivated or mid-update. The class_exists guard
		// covers snippet managers, which re-evaluate this code on every save.
		if ( ! class_exists( 'MAG_FCRM_Count_Tag' ) ) {

			abstract class MAG_FCRM_Count_Tag extends \Elementor\Core\DynamicTags\Tag {

				/**
				 * Key into mag_fcrm_stats(). Set by each subclass.
				 *
				 * @var string
				 */
				protected $stat_key = '';

				public function get_group() {
					return array( 'fluentcrm' );
				}

				public function get_categories() {
					return array(
						\Elementor\Modules\DynamicTags\Module::TEXT_CATEGORY,
						\Elementor\Modules\DynamicTags\Module::NUMBER_CATEGORY,
					);
				}

				protected function register_controls() {
					$this->add_control(
						'format',
						array(
							'label'   => esc_html__( 'Format', 'fluentcrm-elementor-tags' ),
							'type'    => \Elementor\Controls_Manager::SELECT,
							'default' => 'compact',
							'options' => array(
								'compact' => esc_html__( 'Compact — 86.3K / 15.5M', 'fluentcrm-elementor-tags' ),
								'exact'   => esc_html__( 'Exact — 86,362', 'fluentcrm-elementor-tags' ),
								'round'   => esc_html__( 'Rounded — 86,000', 'fluentcrm-elementor-tags' ),
								'raw'     => esc_html__( 'Raw digits — 86362 (use for Counter widgets)', 'fluentcrm-elementor-tags' ),
							),
						)
					);

					$this->add_control(
						'precision',
						array(
							'label'     => esc_html__( 'Decimal places', 'fluentcrm-elementor-tags' ),
							'type'      => \Elementor\Controls_Manager::NUMBER,
							'default'   => 1,
							'min'       => 0,
							'max'       => 3,
							'condition' => array( 'format' => 'compact' ),
						)
					);

					$this->add_control(
						'round_to',
						array(
							'label'     => esc_html__( 'Round to nearest', 'fluentcrm-elementor-tags' ),
							'type'      => \Elementor\Controls_Manager::SELECT,
							'default'   => 1000,
							'options'   => array(
								100     => '100',
								500     => '500',
								1000    => '1,000',
								5000    => '5,000',
								10000   => '10,000',
								100000  => '100,000',
								1000000 => '1,000,000',
							),
							'condition' => array( 'format' => 'round' ),
						)
					);

					$this->add_control(
						'rounding',
						array(
							'label'       => esc_html__( 'Rounding', 'fluentcrm-elementor-tags' ),
							'type'        => \Elementor\Controls_Manager::SELECT,
							'default'     => 'down',
							'options'     => array(
								'down'    => esc_html__( 'Down — never overstate', 'fluentcrm-elementor-tags' ),
								'nearest' => esc_html__( 'Nearest', 'fluentcrm-elementor-tags' ),
							),
							'description' => esc_html__( 'Rounding down keeps the claim true as the number grows.', 'fluentcrm-elementor-tags' ),
							'condition'   => array( 'format' => array( 'compact', 'round' ) ),
						)
					);

					$this->add_control(
						'prefix',
						array(
							'label'     => esc_html__( 'Prefix', 'fluentcrm-elementor-tags' ),
							'type'      => \Elementor\Controls_Manager::TEXT,
							'default'   => '',
							'condition' => array( 'format!' => 'raw' ),
						)
					);

					$this->add_control(
						'suffix',
						array(
							'label'       => esc_html__( 'Suffix', 'fluentcrm-elementor-tags' ),
							'type'        => \Elementor\Controls_Manager::TEXT,
							'default'     => '',
							'placeholder' => '+',
							'condition'   => array( 'format!' => 'raw' ),
						)
					);
				}

				public function render() {
					echo esc_html(
						mag_fcrm_format_number( mag_fcrm_stat( $this->stat_key ), $this->get_settings() )
					);
				}
			}

			class MAG_FCRM_Total_Subscribers_Tag extends MAG_FCRM_Count_Tag {

				protected $stat_key = 'total_subscribers';

				public function get_name() {
					return 'fcrm-total-subscribers';
				}

				public function get_title() {
					return esc_html__( 'Total Email Subscribers', 'fluentcrm-elementor-tags' );
				}
			}

			class MAG_FCRM_Emails_Sent_Tag extends MAG_FCRM_Count_Tag {

				protected $stat_key = 'emails_sent';

				public function get_name() {
					return 'fcrm-emails-sent';
				}

				public function get_title() {
					return esc_html__( 'Total Emails Sent', 'fluentcrm-elementor-tags' );
				}
			}
		}

		$dynamic_tags->register( new MAG_FCRM_Total_Subscribers_Tag() );
		$dynamic_tags->register( new MAG_FCRM_Emails_Sent_Tag() );
	}
);

/* -------------------------------------------------------------------------
 * 5. Shortcodes — for everywhere Elementor doesn't reach
 * ---------------------------------------------------------------------- */

if ( ! function_exists( 'mag_fcrm_stat_shortcode' ) ) {
	/**
	 * @param string $key  Registry key.
	 * @param array  $atts Shortcode attributes, same names as the tag controls.
	 * @param string $tag  Shortcode name, for shortcode_atts filtering.
	 * @return string
	 */
	function mag_fcrm_stat_shortcode( $key, $atts, $tag ) {
		$atts = shortcode_atts(
			array(
				'format'    => 'compact',
				'precision' => 1,
				'round_to'  => 1000,
				'rounding'  => 'down',
				'prefix'    => '',
				'suffix'    => '',
			),
			$atts,
			$tag
		);

		return esc_html( mag_fcrm_format_number( mag_fcrm_stat( $key ), $atts ) );
	}
}

add_shortcode(
	'fluentcrm_subscribers',
	function ( $atts ) {
		return mag_fcrm_stat_shortcode( 'total_subscribers', $atts, 'fluentcrm_subscribers' );
	}
);

add_shortcode(
	'fluentcrm_emails_sent',
	function ( $atts ) {
		return mag_fcrm_stat_shortcode( 'emails_sent', $atts, 'fluentcrm_emails_sent' );
	}
);
