<?php
/**
 * Plugin Name: ACF Tabbed Flexible Content
 * Version: 0.1
 * Description: Flexible Content Fields in tabbed interface
 * Author: Mati Kärner
 * Author URI: www.adaptive.ee
 * Plugin URI: www.adaptive.ee
 * Text Domain: acf-tabbed-fc-fields
 * Domain Path: /languages
 * @package ACF Tabbed Flexible Content Fields
 */
require_once plugin_dir_path ( __FILE__ ) . 'functions.php';
require_once plugin_dir_path ( __FILE__ ) . 'vendor/autoload.php';

/**
 * Init
 */
add_action ( 'acf/init', function () {
	new ACF_Tabbed_FC_Fields\ACF_Tabbed_FC_Fields ();
} );
