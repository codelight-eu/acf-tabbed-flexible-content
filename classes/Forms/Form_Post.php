<?php
namespace ACF_Tabbed_FC_Fields\Forms;

use ACF_Tabbed_FC_Fields\ACF_Tabbed_FC_Fields;

class Form_Post extends \acf_form_post {

	/**
	 * Cached flag for post edit mode
	 * @var boolean|null $is_valid
	 */
	protected $is_valid;
	
	public function __construct() {
		$this->is_valid = null;
		// DO NOT CALL parent::__construct()
	}	
	
	public function validate_page() {
		global $pagenow;
		
		if('admin.php' === $pagenow)
			$this->is_valid = true;
		
		if (is_null ( $this->is_valid ))
			$this->is_valid = parent::validate_page ();
		
		return $this->is_valid;
	}
	
	public function admin_enqueue_scripts() {
		parent::admin_enqueue_scripts ();
		
		if ($this->validate_page ())
			$this->enqueueAssets (); // Enqueue jQuery tabs, custom models etc..
	}
	
	protected function enqueueAssets() {
		$script_debug = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG;
		$build_dir = 'build/' . ($script_debug ? 'dev' : 'dist');
		
		wp_enqueue_script ( 'jquery-ui-tabs' );
		wp_enqueue_script ( 'jquery-ui-sortable' );

		wp_enqueue_style ( ACF_Tabbed_FC_Fields::PLUGIN_SLUG,
				plugin_dir_url ( __FILE__ ) . '../../assets/'.
				$build_dir .'/styles/index.css' );
		
		wp_enqueue_script ( ACF_Tabbed_FC_Fields::PLUGIN_SLUG, plugin_dir_url ( __FILE__ ) .
				'../../assets/' . $build_dir . '/scripts/index.js', array (
				'jquery',
				'underscore',
				'jquery-ui-tabs',
				'jquery-ui-sortable',
				'acf-pro-input',
				'acf-input'
		) );
	}
}