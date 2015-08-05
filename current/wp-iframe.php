<?php
/**
* 
* This file loads on frontend pages if windowpress iframe session is set and user is capable of running WindowPress.
* Hides adminbar and outputs title meta that is used by WindowPress to set a title for a window.
* If page is not loaded inside iframe, it will be reloaded with a parameter telling to unset the session. 
* Also includes a small javascript for customizer to tell the parent page it loaded and it's ready. 
* 
* @package WindowPress
* @author Maciej Krawczyk
*/


defined('WINDOWPRESS_VERSION') or die();

class WindowPress_WP_Iframe {

	public function __construct() {
		
		$this->plugin_url=plugins_url().'/'.basename(dirname(dirname(__FILE__))).'/'.basename(dirname(__FILE__));

		show_admin_bar(false);
		
		//iframe script
		add_action('wp_enqueue_scripts',array($this,'iframe_script'));
		
		//iframe check
		add_action('wp_head',array($this,'iframe_check') );
		
		//get title
		add_filter( 'wp_title', array($this,'get_title'), 1, 2 );
		
		//inner customizer fix		
		add_action('wp_enqueue_scripts',array($this,'enqueue_jquery'));
		add_action('wp_footer',array($this,'inner_customizer_fix'));

	}
	
	
	
	public function iframe_check() {
		
		$this->get_reduced_title();
		$this->get_edit_link();
			
		?><script>

			if ( top === self ) { //if isnt iframe - refresh and disable iframe session
				
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
			var windowpress_edit_link='<?php echo $this->edit_link; ?>';
		</script><?php
	}
	
	
	public function enqueue_jquery() { //enqueue jquery for customizer fix
		wp_enqueue_script('jquery');
	}
	
	public function iframe_script() {
		wp_enqueue_script('windowpress-iframe', $this->plugin_url.'/includes/js/iframe.js', array('jquery'), WINDOWPRESS_VERSION, true );
	}

	public function inner_customizer_fix() {
		
		if (empty( $GLOBALS['wp_customize'])) return 0;
		?><script>
		jQuery(document).ready(function($){
			parent.WindowPress_customizer_fix.iframeLoadEmulation();
		});
		</script><?php
	}
	
	function get_title( $title, $sep ) {
		$this->title=trim(preg_replace('/[^A-Za-z0-9\- ]/', '', $title));
		return $title;
	}
	
	function get_edit_link() { //wp-includes/admin-bar.php
		
		global $wp_the_query;
		
		$current_object = $wp_the_query->get_queried_object();

		if ( empty( $current_object ) ) return;
		
		if ( ! empty( $current_object->post_type )
			&& ( $post_type_object = get_post_type_object( $current_object->post_type ) )
			&& current_user_can( 'edit_post', $current_object->ID )
			&& $post_type_object->show_ui && $post_type_object->show_in_admin_bar
			&& $edit_post_link = get_edit_post_link( $current_object->ID ) )
		{
	
				//'title' => $post_type_object->labels->edit_item,
				$this->edit_link=$edit_post_link;
		} 
		
		elseif ( ! empty( $current_object->taxonomy )
			&& ( $tax = get_taxonomy( $current_object->taxonomy ) )
			&& current_user_can( $tax->cap->edit_terms )
			&& $tax->show_ui
			&& $edit_term_link = get_edit_term_link( $current_object->term_id, $current_object->taxonomy ) )
		{

			//	'title' => $tax->labels->edit_item,
				$this->edit_link=$edit_term_link;

		}
		
	}


	function get_reduced_title() {
		global $wp_the_query;
		$current_object = $wp_the_query->get_queried_object();
		if (  is_home() || is_front_page()  ) $this->reduced_title = _x('Home','As in website home',$this->text_domain);
		elseif ( ! empty( $current_object->label ) ) $this->reduced_title=$current_object->label;
		elseif ( ! empty( $current_object->name ) ) $this->reduced_title=$current_object->name;
		elseif ( ! empty( $current_object->post_title ) ) $this->reduced_title=$current_object->post_title;
		elseif ( is_author() && (!empty($current_object->data) ) ) $this->reduced_title=$current_object->data->user_nicename;
		elseif ( is_archive() ) $this->reduced_title=$this->title;
		else $this->reduced_title=$this->title;
		
		if (is_preview()) $this->reduced_title=__('Preview: ',$this->text_domain).$this->reduced_title;
	}

	private $plugin_url;
	private $title;
	private $reduced_title;
	private $edit_link=0;

	private $text_domain='windowpress';



}

$WindowPress_WP_Iframe_Instance= new WindowPress_WP_Iframe();
?>
