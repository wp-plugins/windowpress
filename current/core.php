<?php
/**
* 
* Main file. Selects objects to load.
* This file is loaded only if user is privileged to run WindowPress
* 
* @package WindowPress
* @author Maciej Krawczyk
*/

	defined('WINDOWPRESS_VERSION') or die();

 	//redirect from example.com/windowpress to example.com/wp-admin/admin.php?page=windowpress
 	//works only if website uses 'pretty links'
 	//since v1.4
 	function windowpress_page_redirect() {
 		
		$protocol='http://';
 		if (is_ssl()) $protocol='https://';
 		$current_url=rtrim($protocol.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'],'/');
 		$windowpress_url=rtrim(get_site_url(null,'windowpress'),'/');
 
 		if ($current_url===$windowpress_url) {
 			wp_redirect( admin_url('admin.php?page=windowpress'), 302 );
 			die();
 		}
  	}
  
  	
 	//this is used just for authorizing toggling iframe session with get request  early in the script execution
 	//and doesn't play any role on whether WindowPress will load or not
 	$_SESSION['windowpress_privileged']=1;


	if(is_admin()) { //if back-end
		
		if (!defined('IS_WINDOWPRESS')) {
			// activation and settings page
			require(dirname(__FILE__).'/settings.php'); 
			//ajax
			require(dirname(__FILE__).'/ajax.php');
		}

		//if WindowPress page
		if (defined('IS_WINDOWPRESS')) require(dirname(__FILE__).'/windowpress.php');

		//if iframe admin page 
		elseif ( defined('IS_WINDOWPRESS_IFRAME') ) require(dirname(__FILE__).'/admin-iframe.php');
	
		//if normal admin page
		else require(dirname(__FILE__).'/noiframe.php');
	}
	
	else { //if front-end
		
		//do redirect if nessecary
 		windowpress_page_redirect();

		//if iframe front-end
		if (  defined('IS_WINDOWPRESS_IFRAME') ) require(dirname(__FILE__).'/wp-iframe.php');

		//else if normal front-end page
		else require(dirname(__FILE__).'/noiframe.php');
	}


?>
