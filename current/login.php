<?php
/**
* 
* Redirect administrators to WindowPress after login, if selected in the settings.
* Clear session on logout.
* 
* @package WindowPress
* @author Maciej Krawczyk
*/


defined('WINDOWPRESS_VERSION') or die();


class WindowPress_Login {
	
	public function __construct() {
		
		$this->options=get_option($this->option_name);
		if ($this->options['login_redirect']) add_filter( 'login_redirect', array($this,'login_redirect'), 10, 3 );
		
		add_action('wp_logout', array($this,'logout'));

	}
	
	function login_redirect( $redirect_to, $request, $user ) {
		
		global $user;
	
		if ( isset( $user->roles ) && is_array( $user->roles ) ) {
			
			if ( in_array( 'administrator', $user->roles ) ) return admin_url('admin.php?page=windowpress');
			else return $redirect_to;
		}
		else return $redirect_to;
	}
	
	public function logout() {
		if ( !session_id() ) session_start();
		if (isset($_SESSION['windowpressiframe'])) unset($_SESSION['windowpressiframe']);
		if (isset($_SESSION['windowpress_privileged'])) unset($_SESSION['windowpress_privileged']);
	}
	
	private $options;
	private $option_name='windowpress';

}

$WindowPress_Login_Instance= new WindowPress_Login();
?>
