<?php
/**
* 
* Handle plugin activation
* 
* @package WindowPress
* @author Maciej Krawczyk
*/


defined('WINDOWPRESS_VERSION') or die();



class WindowPress_Activate {
	
	public function __construct() {
		
		$this->plugin_url=plugins_url().'/'.basename(dirname(dirname(__FILE__))).'/'.basename(dirname(__FILE__));

		$this->plugin_path=dirname(__FILE__);
		
		if (is_multisite()) $this->multisite_enabled=1;
	
		#default settings
		require($this->plugin_path.'/includes/php/default_settings.php');
		
		register_activation_hook('windowpress/index.php',array($this,'sitewide_activation'));
		
		add_action( 'wpmu_new_blog', array($this,'new_blog'), 10, 6); 		


	}
	

	public function new_blog($blog_id, $user_id, $domain, $path, $site_id, $meta ) {
		global $wpdb;

		if (is_plugin_active_for_network('windowpress/index.php')) {
			$current_blog = $wpdb->blogid;
			switch_to_blog($blog_id);
			$this->install();
			switch_to_blog($current_blog);
		}
	}

	public function sitewide_activation($networkwide) {

		global $wpdb;
				
		if (is_multisite() && $networkwide) { 
			
			$current_blog = $wpdb->blogid;
			
			$blogs = $wpdb->get_col("SELECT blog_id FROM $wpdb->blogs");
		
			foreach ($blogs as $blog) {
				switch_to_blog($blog);
				$this->activate();

			}
		
			switch_to_blog($current_blog);
		}
		else $this->activate();

	}
	
	private function activate() {

		if (!get_option($this->option_name)) $this->install();

	}
	
	private function install() {
		$this->default_info['review_nag_time']=time()+2592000;
		$this->default_info['installed_timestamp']=time();
		$this->default_info['multisite_enabled']=$this->multisite_enabled;
		update_option($this->option_name, $this->default_settings);
		update_option($this->info_name, $this->default_info);
	}
	
	private $default_settings;
	private $default_info;
	private $option_name='windowpress';
	private $info_name='windowpress-info';
	private $plugin_path;
	private $plugin_url;
	private $multisite_enabled=0;
}

$WindowPress_Activate_Instance= new WindowPress_Activate();
