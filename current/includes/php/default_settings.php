<?php

		defined('ABSPATH') or die();


		$this->default_settings=array(
			'login_redirect' => 0,
			'add_adminbar_link' => 1,
			'wallpaper' => $this->plugin_url.'/includes/assets/wallpapers/Dybbolsbro_Station_by_SirPecanGum.jpg',
			'homepage' => 0,
			'homepage_url' => '/wp-admin',
			'custom_site_title' => 0,
			'custom_site_title_text' => 'Site',
			'sidebar_slide_start' => 1,
			'sidebar_slide_duration' => 200,
			'mousehold_duration' => 350,
			'taskbar_button_width' => 150,
			'window_title_width' => 200
		);
		
		$this->default_info=array('version'=>WINDOWPRESS_VER);


?>
