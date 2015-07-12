<?php
	if ( !defined( 'WP_UNINSTALL_PLUGIN' ) ) exit();
	
	
	function WindowPressUninstall() {
		
		$option_name = 'windowpress';
		delete_option( $option_name );
		$info_name='windowpress-info';
		delete_option($info_name);
		
	}

	
	
	
	global $wpdb;
				
	if (is_multisite()) { 
			
		$current_blog = $wpdb->blogid;
			
		$blogs = $wpdb->get_col("SELECT blog_id FROM $wpdb->blogs");
		
		foreach ($blogs as $blog) {
			switch_to_blog($blog);
			if (get_option('windowpress')) WindowPressUninstall();
		}
		
		switch_to_blog($current_blog);
	}
		
	elseif (get_option('windowpress')) WindowPressUninstall();
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
?>
