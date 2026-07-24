<?php
/**
 * FluentCRM → Elementor dynamic tag: Total Email Subscribers
 *
 * Renders the live count of FluentCRM contacts with status "subscribed" —
 * the same figure FluentCRM's dashboard labels "Active Contacts" — so the
 * vanity number on the site stops being hardcoded in a dozen widgets.
 *
 * Two ways to use it:
 *   1. Elementor → any text field → the dynamic (database) icon →
 *      FluentCRM → Total Email Subscribers.       (requires Elementor Pro)
 *   2. [fluentcrm_subscribers] anywhere shortcodes run.
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
 * 1. Data — the cached count
 * ---------------------------------------------------------------------- */

if ( ! function_exists( 'mag_fcrm_total_subscribers' ) ) {
	/**
	 * Count FluentCRM contacts with status "subscribed", cached for an hour.
	 *
	 * @return int Subscriber count, or 0 if FluentCRM isn't available.
	 */
	function mag_fcrm_total_subscribers() {
		$cached = get_transient( 'mag_fcrm_total_subscribers' );

		if ( false !== $cached ) {
			return (int) $cached;
		}

		if ( ! class_exists( '\FluentCrm\App\Models\Subscriber' ) ) {
			return 0;
		}

		$count = (int) \FluentCrm\App\Models\Subscriber::where( 'status', 'subscribed' )->count();

		// Never cache a zero: a transient hiccup or a half-loaded FluentCRM
		// would otherwise pin the site to "0 subscribers" for a full hour.
		if ( $count > 0 ) {
			set_transient(
				'mag_fcrm_total_subscribers',
				$count,
				apply_filters( 'mag_fcrm_cache_ttl', HOUR_IN_SECONDS )
			);
		}

		return $count;
	}
}

if ( ! function_exists( 'mag_fcrm_flush_subscriber_cache' ) ) {
	/**
	 * Drop the cached count so the next render recalculates.
	 *
	 * @return void
	 */
	function mag_fcrm_flush_subscriber_cache() {
		delete_transient( 'mag_fcrm_total_subscribers' );
	}
}

// The hourly TTL is the real mechanism; these just make growth show up sooner.
add_action( 'fluent_crm/contact_created', 'mag_fcrm_flush_subscriber_cache' );
add_action( 'fluent_crm/subscriber_status_changed', 'mag_fcrm_flush_subscriber_cache' );

/* -------------------------------------------------------------------------
 * 2. Formatting
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
 * 3. The Elementor dynamic tag
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
		if ( ! class_exists( 'MAG_FCRM_Total_Subscribers_Tag' ) ) {

			class MAG_FCRM_Total_Subscribers_Tag extends \Elementor\Core\DynamicTags\Tag {

				public function get_name() {
					return 'fcrm-total-subscribers';
				}

				public function get_title() {
					return esc_html__( 'Total Email Subscribers', 'fluentcrm-elementor-tags' );
				}

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
								'compact' => esc_html__( 'Compact — 86.3K', 'fluentcrm-elementor-tags' ),
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
								100   => '100',
								500   => '500',
								1000  => '1,000',
								5000  => '5,000',
								10000 => '10,000',
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
							'description' => esc_html__( 'Rounding down keeps the claim true as the list grows.', 'fluentcrm-elementor-tags' ),
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
						mag_fcrm_format_number( mag_fcrm_total_subscribers(), $this->get_settings() )
					);
				}
			}
		}

		$dynamic_tags->register( new MAG_FCRM_Total_Subscribers_Tag() );
	}
);

/* -------------------------------------------------------------------------
 * 4. Shortcode — for everywhere Elementor doesn't reach
 * ---------------------------------------------------------------------- */

if ( ! function_exists( 'mag_fcrm_subscribers_shortcode' ) ) {
	/**
	 * [fluentcrm_subscribers format="round" round_to="1000" suffix="+"]
	 *
	 * @param array $atts Shortcode attributes, same names as the tag controls.
	 * @return string
	 */
	function mag_fcrm_subscribers_shortcode( $atts ) {
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
			'fluentcrm_subscribers'
		);

		return esc_html( mag_fcrm_format_number( mag_fcrm_total_subscribers(), $atts ) );
	}
}

add_shortcode( 'fluentcrm_subscribers', 'mag_fcrm_subscribers_shortcode' );
