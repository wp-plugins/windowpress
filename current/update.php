<?php
/**
* 
* Update actions
* 
* @package WindowPress
* @author Maciej Krawczyk
*/


	defined('WINDOWPRESS_VERSION') or die();
	
	
	$version=floatval($this->info['version']);

	//1.2 update action
	if ($version<=1.1) {
		$this->options['custom_site_title']=$this->default_settings['custom_site_title'];
		$this->options['custom_site_title_text']=$this->default_settings['custom_site_title_text'];
	}
	
	//v1.3 update action
	if ($version<=1.2) {
		$this->options['wrap_menus']=$this->default_settings['wrap_menus'];
	}
	
	//v1.4 update action
	if ($version<=1.3) {
		$multisite_enabled=0;
		if (is_multisite()) $multisite_enabled=1;
		$this->options['exit_prompt']=$this->default_settings['exit_prompt'];
		$this->info['installed_timestamp']=time();
		$this->info['review_nag_time']=time()+2592000;
		$this->info['multisite_enabled']=$multisite_enabled;
	}

	$this->info['version']=WINDOWPRESS_VERSION;
	update_option($this->info_name, $this->info);
	update_option($this->option_name, $this->options);


?>
