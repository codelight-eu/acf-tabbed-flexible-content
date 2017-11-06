<?php

namespace ACF_Tabbed_FC_Fields;

class ACF_Tabbed_FC_Fields {
	
	const PLUGIN_SLUG = 'acf-tabbed-fc-fields';
	
	public function __construct() {
		$this->hooks_and_filters ();
	}
	
	protected function hooks_and_filters() {
		add_action ( 'admin_enqueue_scripts', array (
				$this,
				'replace_form_post_scripts' 
		), 0 );
		
		add_filter ( 'acf/location/screen', array (
				$this,
				'acf_settings_page' 
		), 10, 2 );
		
		foreach ( range ( 0, 10 ) as $p )
			remove_filter_by_class ( 'acf/render_field/type=flexible_content',
					'acf_field_flexible_content', 'render_field', $p );
		
		add_action ( 'acf/render_field/type=flexible_content', array (
				$this,
				'render_flexible_content_field' 
		), 10 );
	}
	
	protected function override_acf_form_post() {
		// Remove hook
		remove_filter_by_class ( 'admin_enqueue_scripts',
				'acf_form_post', 'admin_enqueue_scripts', 10 );
		
		$this->admin_enqueue_scripts ();
	}
	
	public function replace_form_post_scripts() {
		global $pagenow;
		
		// Override ACF behavior
		if (in_array ( $pagenow, array (
				'post.php',
				'post-new.php',
				'admin.php' 
		) )) {
			$this->override_acf_form_post ();
		}
	}
				
	public function acf_settings_page($args, $field_group) {
		global $pagenow;
		
		if(isset($args['options_page']) && in_array ( $pagenow, array (
				'admin.php' 
		) )) {
			$this->override_acf_form_post ();
		}	
		
		return $args;
	}
	
	public function admin_enqueue_scripts() {
		$acf_form_post = new Forms\Form_Post ();
		$acf_form_post->admin_enqueue_scripts ();
	}
	
	public function render_flexible_content_field($field) {
		$fc_field = new Fields\Flexible_Content ();
		$fc_field->render_field ( $field );
	}
}