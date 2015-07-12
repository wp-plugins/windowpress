<?php
/**
* 
* Handle plugin activation
* 
* @package WindowPress
* @author Maciej Krawczyk
*/


defined('ABSPATH') or die();



class WindowPress_Activate {
	
	public function __construct() {
		
		$this->plugin_url=plugins_url().'/'.basename(dirname(dirname(__FILE__))).'/'.basename(dirname(__FILE__));

		$this->plugin_path=dirname(__FILE__);
	
		#default settings
		require($this->plugin_path.'/includes/php/default_settings.php');
		
		register_activation_hook('windowpress/index.php',array($this,'activate'));
		
		add_action( 'wpmu_new_blog', array($this,'new_blog'), 10, 6); 		


	}
	

	function new_blog($blog_id, $user_id, $domain, $path, $site_id, $meta ) {
		global $wpdb;

		if (is_plugin_active_for_network('windowpress/index.php')) {
			$current_blog = $wpdb->blogid;
			switch_to_blog($blog_id);
			$this->install();
			switch_to_blog($current_blog);
		}
	}

	public function activate($networkwide) {

		global $wpdb;
				
		if (is_multisite() && $networkwide) { 
			
			$current_blog = $wpdb->blogid;
			
			$blogs = $wpdb->get_col("SELECT blog_id FROM $wpdb->blogs");
		
			foreach ($blogs as $blog) {
				switch_to_blog($blog);
				if (!get_option($this->option_name)) $this->install();
			}
		
			switch_to_blog($current_blog);
		}
		elseif (!get_option($this->option_name)) $this->install();

	}
	
	public function install() {
		update_option($this->option_name, $this->default_settings);
		update_option($this->info_name, $this->default_info);
	}
	
	private $default_settings;
	private $default_info;
	private $option_name='windowpress';
	private $info_name='windowpress-info';
	private $plugin_path;
	private $plugin_url;
}

$windowpress_activate= new WindowPress_Activate();

