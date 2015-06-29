<?php
/**
* 
* Main file. Selects objects to load.
* 
* @package WindowPress
* @author Maciej Krawczyk
*/

	defined('ABSPATH') or die();

	if ( !session_id() ) session_start();

	//toggle iframe mode on/off if requested
	if (isset($_GET['windowpressiframe'])) {
		if ($_GET['windowpressiframe']==1) $_SESSION['windowpressiframe']=1;
		elseif ($_GET['windowpressiframe']==0 and (isset($_SESSION['windowpressiframe']))) unset($_SESSION['windowpressiframe']);
	}


	if(is_admin()) { 
		
		//if WindowPress is running
		define('IS_WINDOWPRESS', (isset($_GET['page']) and $_GET['page']=='windowpress' and basename($_SERVER["PHP_SELF"])==='admin.php'));

		if (!IS_WINDOWPRESS) {
			// activation and settings page
			require(dirname(__FILE__).'/settings.php'); 
		}

		if (IS_WINDOWPRESS) require(dirname(__FILE__).'/windowpress.php');

		//if iframe admin page 
		elseif ( isset($_SESSION['windowpressiframe'] ) ) require(dirname(__FILE__).'/admin-iframe.php');
	
		//if normal admin page
		else require(dirname(__FILE__).'/admin-noiframe.php');
	}

	//if iframe front end
	elseif (  isset($_SESSION['windowpressiframe']) ) require(dirname(__FILE__).'/wp-iframe.php');

	//else if normal frontend page
	else require(dirname(__FILE__).'/wp-noiframe.php');


?>
