<?php
/**
* 
* Redirect administrators to WindowPress after login, if selected in the settings.
* 
* @package WindowPress
* @author Maciej Krawczyk
*/


defined('ABSPATH') or die();


class WindowPress_Login {
	
	public function __construct() {
		
		$this->options=get_option($this->option_name);
		if ($this->options['login_redirect']) add_filter( 'login_redirect', array($this,'login_redirect'), 10, 3 );
	}
	
	function login_redirect( $redirect_to, $request, $user ) {
		
		global $user;
	
		if ( isset( $user->roles ) && is_array( $user->roles ) ) {
			
			if ( in_array( 'administrator', $user->roles ) ) return admin_url('admin.php?page=windowpress');
			else return $redirect_to;
		} 
	
		else return $redirect_to;
	
	}
	
	private $options;
	private $option_name='windowpress';

}

$windowpress_login= new WindowPress_Login();

?>
