<?php
/**
* 
* Handle ajax requests
* This file is wrapped in core.php, meaning user is already authenticated as administrator
* 
* @package WindowPress
* @author Maciej Krawczyk
*/

defined('WINDOWPRESS_VERSION') or die();


class WindowPress_Ajax {

	public function __construct() {

		
		$this->options=get_option($this->option_name);
		$this->info=get_option($this->info_name);

		add_action( 'wp_ajax_windowpress_ajax', array($this,'windowpress_ajax_callback') );
		
		
	}
			
	
	function windowpress_ajax_callback() {
				
		if (isset($_POST['data'])) {
			$data=$_POST['data'];
						
			if(isset($data['review_nag'])) {
				$value=intval($data['review_nag']);
				if ($value===0) $this->info['review_nag_time']=0; //disable review nag completely
				elseif($value===1) $this->info['review_nag_time']=time()+2592000; //shedule nag to 1 month in the future
			}
			
			update_option($this->info_name,$this->info);
		}
		wp_die();
	}
	
	private $plugin_path;	
	private $options;
	private $info;
	
	private $option_name='windowpress';
	private $info_name='windowpress-info';
}

$WindowPress_Ajax_Instance= new WindowPress_Ajax();


?>
