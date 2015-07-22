<?php
/**
* 
* Update actions
* 
* @package WindowPress
* @author Maciej Krawczyk
*/


	defined('ABSPATH') or die();
	
	
	
	$version=floatval($this->info['version']);

	//from v1.1 update action
	if ($version<=1.1) {
		$this->options['custom_site_title']=$this->default_settings['custom_site_title'];
		$this->options['custom_site_title_text']=$this->default_settings['custom_site_title_text'];
	}
	
	//from v1.2 update action
	if ($version<=1.2) {
		$this->options['wrap_menus']=$this->default_settings['wrap_menus'];
	}


	$this->info['version']=WINDOWPRESS_VER;
	update_option($this->info_name, $this->info);
	update_option($this->option_name, $this->options);


?>
