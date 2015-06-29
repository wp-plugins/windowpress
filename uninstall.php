<?php
	if ( !defined( 'WP_UNINSTALL_PLUGIN' ) ) exit();
	$option_name = 'windowpress';
	delete_option( $option_name );
?>
