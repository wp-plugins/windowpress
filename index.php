<?php
/**
 * Plugin Name: WindowPress
 * Plugin URI:  https://wordpress.org/plugins/windowpress
 * Description: Your WordPress in one place.
 * Version: 1.4
 * Author: Maciej Krawczyk
 * Author URI: https://profiles.wordpress.org/helium-3
 * License:GPLv2
=====================================================================================
Copyright (C) 2015 Maciej Krawczyk
All Rights Reserved

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with WordPress; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
======================================================================================
*/

	defined('ABSPATH') or die();

	define('WINDOWPRESS_VERSION','1.4');

	if ( !session_id() ) session_start();

	//toggle iframe mode on/off if requested
	if (isset($_GET['windowpressiframe']) && isset($_SESSION['windowpress_privileged']) ) {
		if ($_GET['windowpressiframe']==1 ) $_SESSION['windowpressiframe']=1;
		elseif ($_GET['windowpressiframe']==0 and (isset($_SESSION['windowpressiframe']))) unset($_SESSION['windowpressiframe']);
	}
	
	//define conditional constants
	if (basename($_SERVER["PHP_SELF"])==='admin.php' && isset($_GET['page']) && $_GET['page']==='windowpress' && !defined('IS_WINDOWPRESS_PAGE'))
		define('IS_WINDOWPRESS',true);
	elseif ( isset($_SESSION['windowpressiframe']) && !defined('IS_WINDOWPRESS_IFRAME'))
		define('IS_WINDOWPRESS_IFRAME',true);

	function WindowPressInit() { 
		
		if (basename($_SERVER["PHP_SELF"])==='wp-login.php') require(dirname(__FILE__).'/current/login.php'); //login functions

		elseif (current_user_can('administrator') && basename($_SERVER["PHP_SELF"])!=='press-this.php') require(dirname(__FILE__).'/current/core.php'); //plugin core
		
	}


	//activation hook
	if (is_admin()) require(dirname(__FILE__).'/current/activate.php');


	add_action('plugins_loaded','WindowPressInit');
		
?>
