<?php
/**
 * Plugin Name: WindowPress
 * Plugin URI:  https://wordpress.org/plugins/windowpress
 * Description: Your WordPress in one place.
 * Version: 1.0
 * Author: Maciej Krawczyk
 * Author URI: https://profiles.wordpress.org/helium-3
 * License:GPLv2
=====================================================================================
Copyright (C) 2015 Maciej Krawczyk

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
=====================================================================================
*/

defined('ABSPATH') or die();


define('WINDOWPRESS_VER','1.00');

//Load the main plugin file if the current user is capable of running the plugin

if (basename($_SERVER["PHP_SELF"])==='wp-login.php') require(dirname(__FILE__).'/current/login.php'); //login functions

elseif (basename($_SERVER["PHP_SELF"])!=='press-this.php') {  //There's no purpose of running Press This! inside WindowPress

	if(!function_exists('wp_set_current_user')) require(ABSPATH . "wp-includes/pluggable.php"); 
		
	if (current_user_can('administrator')) require(dirname(__FILE__).'/current/core.php'); //plugin core
	
}
		
?>
