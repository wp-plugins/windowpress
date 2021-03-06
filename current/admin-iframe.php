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

defined('WINDOWPRESS_VERSION') or die();

class WindowPress_Admin_Iframe {

	public function __construct() {

		$this->options=get_option($this->option_name);
		$this->info=get_option($this->info_name);

		$this->plugin_url=plugins_url().'/'.basename(dirname(dirname(__FILE__))).'/'.basename(dirname(__FILE__));
		$this->file=$file=basename($_SERVER["PHP_SELF"]);
		
		
		
		#page title for iframes
		if ( $this->file==='customize.php') $this->reduced_title=__('Customizer',$this->text_domain);
		else add_filter( 'admin_title', array($this,'get_reduced_title'), 10, 2 );

		#iframe check
		add_action('admin_head',array($this,'iframe_check') );
		add_action('customize_controls_print_scripts',array($this,'iframe_check') );
				
		#iframe javascript
		add_action('admin_enqueue_scripts',array($this,'iframe_script'));
		add_action('customize_controls_enqueue_scripts',array($this,'iframe_script'));

		#fixes
		add_action( 'customize_controls_enqueue_scripts', array($this, 'customizer_fix') );
		//if WordPress advanced editor
		if($file==='post.php' || $file==='post-new.php') {
			if($file==='post.php') add_action('admin_footer', array($this, 'preview_link'));
			add_action( 'admin_enqueue_scripts', array($this, 'editor_fix') );	
		}
			
		#hide admin menu and adminbar
		add_action('admin_head',array($this,'hide_admin_menu') );	
		//dequeue admin bar script and style, as it's not needed
		add_action( 'admin_enqueue_scripts', array($this,'dequeue_unused_scripts') );
		//remove unused menu contents
		add_action( 'wp_before_admin_bar_render', array($this,'remove_adminbar_menus') ); 
	//	add_action( 'admin_menu', array($this,'remove_adminmenu_menus') ); 
	
		//ask the user to leave a review after 30 days since installation
		if ($this->info['review_nag_time']!=0 && $this->info['review_nag_time']<time()) { 
			add_action('admin_notices', array($this,'review_nag'));
			add_action('admin_footer', array($this,'review_nag_js'));
		}
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
			
			var windowpress_reduced_title='<?php echo $this->reduced_title; ?>';

		</script><?php

	}
	
	public function iframe_script() {
		wp_enqueue_script('windowpress-iframe', $this->plugin_url.'/includes/js/iframe.js', array('jquery'), WINDOWPRESS_VERSION, true );
	}

	public function customizer_fix() {		
		wp_enqueue_script( 'windowpress_customizer_fix', $this->plugin_url.'/includes/js/customizer_fix.js', array('jquery'), WINDOWPRESS_VERSION, true );
	}
	
	public function editor_fix() {		
		wp_enqueue_script( 'windowpress_editor_fix', $this->plugin_url.'/includes/js/editor_fix.js', array('jquery'), WINDOWPRESS_VERSION, true );
	}
	
		public function preview_link() {
		global $post;
		$nonce = wp_create_nonce( 'post_preview_' . $post->ID);
		echo $nonce;
		$args='preview=true&preview_id='.$post->ID.'&preview_nonce='.$nonce;
		
		?><
		<script>
		jQuery(document).ready(function($) {
			
			//hijack preview from wordpress
			$('#post-preview').attr('id', 'post-preview-windowpress');
			
			var $preview=$('#post-preview-windowpress');
			
			var preview_link=$preview.attr('href')+'?<?php echo $args; ?>';
			
			$preview.removeAttr('target');
						
			$preview.attr('href',preview_link);
			
			$('body').on('click', '#post-preview-windowpress',function() { 
				if (wp.autosave) wp.autosave.server.triggerSave();
				var timer=setTimeout(function() {
					parent.WindowPress.windowInit(preview_link, 1);
				},150);
				return false;
			});
			
		});
			
		</script><?php		
	}

	function get_reduced_title( $title, $sep ) {

		$reduced_title=get_admin_page_title();
		$reduced_title=trim(preg_replace('/[^A-Za-z0-9\- ]/', '', $reduced_title));
		
		if (!empty($reduced_title))  $this->reduced_title=$reduced_title;
		
		return $title;
	}
	
	public function dequeue_unused_scripts() {
		wp_dequeue_script('admin-bar');
		wp_dequeue_style('admin-bar');

	}

	function remove_adminmenu_menus() {
		global $menu;
		$menu=array(0=>0);
	}

 	function remove_adminbar_menus() {
 		global $wp_admin_bar;
 		$view=$wp_admin_bar->get_node('view');
		$preview=$wp_admin_bar->get_node('preview');
 		$menus=$wp_admin_bar->get_nodes();
 		foreach ($menus as $menu) { $wp_admin_bar->remove_menu($menu->id); } 
 		$wp_admin_bar->add_node($view);
		$wp_admin_bar->add_node($preview);
 	}

	public function hide_admin_menu() {
		?><style>
			#adminmenuback { display: none !important; }
 			#adminmenuwrap { display:none !important; }
 			#wpwrap #wpcontent { margin-left:0px !important; padding-left:20px !important; }
 			#wpadminbar { display:none !important; }
 			#wpbody { padding-top:0px; }
  			body { position:absolute; top:0px; left:0; right:0; }
		</style><?php
	}
	
	function review_nag(){
		?>
         <div id="windowpress-review-nag" class="updated">
         <p class="notice">Hi, I noticed you've been using WindowPress for a while – that’s awesome! Could you please do me a BIG favor and give it a 5-star rating on WordPress.org? Just to help me spread the word and boost my motivation.</p>
         <p class="signature"><i>~Maciej Krawczyk</i></p>
         <p class="links">
			<a id="windowpress-review-now" href="#">Ok, you deserve it</a>&nbsp;&nbsp;&nbsp;
			<a id="windowpress-review-later" href="#">Maybe later</a>&nbsp;&nbsp;&nbsp;
			<a id="windowpress-review-done" href="#">I already did</a>
         </p>
         </div>
         <?php
	}
	
	public function review_nag_js() {

		
		?><
		<script>
		jQuery(document).ready(function($) {
						
			$('#windowpress-review-now').on('click',function() {
				$('#windowpress-review-nag .links, #windowpress-review-nag .signature').remove();
				$('#windowpress-review-nag .notice').html('Thank you!');
				parent.WindowPress.ajaxEnqueue({"review_nag":1});
				parent.WindowPress.openNewTab('https://wordpress.org/support/view/plugin-reviews/windowpress?rate=5#postform');
				return false;
			});
			
			$('#windowpress-review-later').on('click',function() {
				parent.WindowPress.ajaxEnqueue({"review_nag":1});
				$('#windowpress-review-nag').remove();
				return false;
			});
			
			$('#windowpress-review-done').on('click',function() {
				parent.WindowPress.ajaxEnqueue({"review_nag":0});
				$('#windowpress-review-nag').remove();
				return false;
			});
			
			
		});
			
		</script><?php		
	}
	
	private $text_domain='windowpress';

	
	private $reduced_title='undefined';
	
	private $options;
	private $dbtab;
	private $file;

	private $option_name='windowpress';
	private $info_name='windowpress-info';
	private $info;

}

$WindowPress_Admin_Iframe_Instance=new WindowPress_Admin_Iframe();
?>
