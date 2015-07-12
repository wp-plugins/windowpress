<?php
/**
* 
* This file loads on admin pages if windowpress iframe session is not set.
* If page is loaded in WindowPress, it will be reloaded with parameter telling to set the session. 
* Adds WindowPress adminbar link.
* 
* @package WindowPress
* @author Maciej Krawczyk
*/


defined('ABSPATH') or die();

class WindowPress_Admin_Noiframe {

	public function __construct() {
		
		$this->options=get_option($this->option_name);
		$this->plugin_url=plugins_url().'/'.basename(dirname(dirname(__FILE__))).'/'.basename(dirname(__FILE__));
			
		//add WindowPress link to adminbar
		if ($this->options['add_adminbar_link'] && !is_network_admin()) add_action( 'wp_before_admin_bar_render', array($this,'add_adminbar_link') );
		
		//menu icon
		add_action( 'admin_enqueue_scripts', array($this, 'add_style') );


		//iframe check
		add_action('admin_head',array($this,'iframe_check') );	
		add_action('customize_controls_print_scripts',array($this,'iframe_check') );
		
	}
	
	

	public function iframe_check() {
		
		echo '<meta name="windowpress_noiframe" content="true" />';

		?><script>

		if ( top !== self && window.frameElement.getAttribute("Name")==="windowpress_iframe") { //if inside windowpress iframe
			
			//hide body
			var style = document.createElement("style");
			style.innerHTML="body { display:none; }";
			document.getElementsByTagName("HEAD")[0].appendChild(style); 
				
			//reload	
			var newUrl=window.location.href;	
			var newUrl1=newUrl.split("#")[0];
			var newUrl2=newUrl.split("#")[1];
			if(newUrl1.indexOf("?")==-1) newUrl1+="?windowpressiframe=1";
			else newUrl1+="&windowpressiframe=1";
						
			if (typeof newUrl2 === "undefined") newUrl=newUrl1;
			else newUrl=newUrl1+"#"+newUrl2;
		
			window.location.href=newUrl;
		}
		</script><?php
	
	}


	public function add_style() { 
		
		wp_enqueue_style( 'windowpress_menu_icon', $this->plugin_url.'/includes/css/menu_icon.css' ); 
		
		
	}
	
	public function add_adminbar_link() {
			
		global $wp_admin_bar;
		$wp_admin_bar->add_menu(array('id'=>'windowpress', 'parent'=>'', 'title'=>'<span class="ab-icon"></span><span class="ab-label">WindowPress</span>', 'href'=>admin_url('admin.php?page=windowpress')));
	}

	private $options;
	private $option_name='windowpress';
	private $plugin_url;
	

}

$windowpress_admin_noiframe= new WindowPress_Admin_Noiframe();
?>
