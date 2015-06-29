<?php
/**
* 
* This file loads on admin pages if windowpress iframe session is set.
* Hides adminbar, admin menu and outputs title meta that is used by WindowPress to set a title for a window.
* If page is not loaded inside iframe, it will be reloaded with a parameter telling to unset the session. 
* 
* @package WindowPress
* @author Maciej Krawczyk
*/


defined('ABSPATH') or die();


class WindowPress_Admin_Iframe {

	public function __construct() {

		$this->options=get_option($this->option_name);
		$this->plugin_url=plugins_url().'/'.basename(dirname(dirname(__FILE__))).'/'.basename(dirname(__FILE__));
		$this->file=$file=basename($_SERVER["PHP_SELF"]);
		
		//hide admin menu and adminbar
		add_action('admin_head',array($this,'hide_admin_menu') );

		//page title for iframes
		add_filter( 'admin_title', array($this,'get_reduced_title'), 10, 2 );
		add_action('admin_head',array($this,'output_reduced_title') );
		add_action('customize_controls_print_scripts', array($this,'output_customizer_meta'));

		//iframe check
		add_action('admin_head',array($this,'iframe_check') );
		add_action('customize_controls_print_scripts',array($this,'iframe_check') );


		//fixes
		add_action( 'customize_controls_enqueue_scripts', array($this, 'customizer_fix') );
		//if WordPress advanced editor
		if($file==='post.php' || $file==='post-new.php')
			add_action( 'admin_enqueue_scripts', array($this, 'editor_fix') );

    }
    
	public function iframe_check() {
		?><script>

			if ( top === self ) { //if isnt iframe - reload as a normal page
					
				//hide body
				var style = document.createElement("style");
				style.innerHTML="body { display:none; }";
				document.getElementsByTagName("HEAD")[0].appendChild(style); 
				
				//reload
				var newUrl=window.location.href;	
				var newUrl1=newUrl.split("#")[0];
				var newUrl2=newUrl.split("#")[1];
				if(newUrl1.indexOf("?")==-1) newUrl1+="?windowpressiframe=0";
				else newUrl1+="&windowpressiframe=0";
						
				if (typeof newUrl2 === "undefined") newUrl=newUrl1;
				else newUrl=newUrl1+"#"+newUrl2;
		
				window.location.href=newUrl;		
			}
		</script><?php

	}

	public function customizer_fix() {		
		wp_enqueue_script( 'windowpress_customizer_fix', $this->plugin_url.'/includes/js/customizer_fix.js', array('jquery'), false, true );
	}
	
	public function editor_fix() {		
		wp_enqueue_script( 'windowpress_editor_fix', $this->plugin_url.'/includes/js/editor_fix.js', array('jquery'), false, true );
	}

	function output_customizer_meta() {
		?><meta name="reduced_title" content="Customizer" /><meta name="windowpress_iframe" content="true" /><?php
	}


	function get_reduced_title( $title, $sep ) {

		$reduced_title=get_admin_page_title();
		$reduced_title=trim(preg_replace('/[^A-Za-z0-9\- ]/', '', $reduced_title));
		
		if (empty($reduced_title))  $reduced_title='undefined';
		
		$this->reduced_title=$reduced_title;
		return $title;
	}

	function output_reduced_title() {
		echo '<meta name="reduced_title" content="'.$this->reduced_title.'" />';
		echo '<meta name="windowpress_iframe" content="true" />';

	}

	public function hide_admin_menu() {
		?><style>
			#adminmenuback { display: none; }
			#adminmenuwrap { display:none; }
			#wpcontent { margin-left:10px; }
			#wpadminbar { display:none; }
			#wpbody { padding-top:0px; }
			body { position:absolute; top:0px; left:0; right:0; }
		</style><?php
	}


	private $options;
	private $dbtab;
	private $file;



	private $option_name='windowpress';



}

$windowpress_admin_iframe=new WindowPress_Admin_Iframe();

?>
