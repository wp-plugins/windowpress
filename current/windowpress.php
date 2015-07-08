<?php
/**
* 
* WindowPress page
* Makes modifications to adminbar, adds javascript and css
* 
* @package WindowPress
* @author Maciej Krawczyk
*/


defined('ABSPATH') or die();



class WindowPress {

	public function __construct() {

		#configuration
		$this->options=get_option($this->option_name);
		$this->plugin_url=plugins_url().'/'.basename(dirname(dirname(__FILE__))).'/'.basename(dirname(__FILE__));
		$this->plugin_path=dirname(__FILE__);
		$this->wp_admin_url=get_site_url(null,'wp-admin/');
		
		
		global $current_user ;
        $user_id = $current_user->ID;
        		
		#start windowpress iframe session
		if (!isset($_SESSION['windowpressiframe'])) $_SESSION['windowpressiframe']=1;
		
		
		#customize adminbar
		add_action( 'admin_bar_menu', array($this,'windowpress_adminbar'), 999 );
		add_action( 'wp_before_admin_bar_render', array($this,'adminbar_menu_site') );

		//menu pages
		add_action('admin_menu',array($this,'add_pages'));

	
		#prevent loading WindowPress inside iframe
		add_action('admin_head', array($this,'iframe_check'));

		#javascript, css and html
		add_action( 'admin_enqueue_scripts', array($this, 'include_scripts') );
		add_action('admin_head', array($this,'inline_css'));
		add_action('admin_footer',array($this,'admin_footer') );
		
		#notices
		add_action('admin_head', array($this,'noticewindow_style'));

		if (isset($_POST['firstuse_notice_viewed'])) add_user_meta($user_id, 'windowpress_firstuse_notice_viewed', 1, true);
		
		if (!get_user_meta($user_id, 'windowpress_firstuse_notice_viewed') )add_action('admin_footer', array($this,'firstuse_notice'));
		else add_action('admin_footer', array($this,'nojs_notice'));


	}

	public function include_scripts() {
		
		//CSS
		wp_enqueue_style( 'windowpress', $this->plugin_url.'/includes/css/windowpress.css' ); 
		wp_enqueue_style( 'windowpress_menu_icon', $this->plugin_url.'/includes/css/menu_icon.css' );
		
		//main script
		wp_enqueue_script( $this->main_script, $this->plugin_url.'/includes/js/windowpress.js', array('jquery','jquery-ui-sortable' ), false, true ); 



		//get icons to include as inline svg
		$icons=array("arrow_left"=>"","arrow_right"=>"","close"=>"","close2"=>"","refresh"=>"","edit"=>"","view"=>"","menu_slide"=>"","menu"=>"");

		foreach ($icons as $key=>&$val) $val=file_get_contents($this->plugin_path.'/includes/assets/icons/'.$key.'.svg');
		unset($val);

		wp_localize_script( $this->main_script, 'PHP',
		array( 
			//configuration
			'plugin_url' => $this->plugin_url,
			'svgIcons' => $icons,
			'defaultWindowType' => 'maximized',
			'sidebar_slide' => $this->options['sidebar_slide_start'],
			'sidebar_slide_duration' => $this->options['sidebar_slide_duration'],
			'taskbar_button_width' => $this->options['taskbar_button_width'],
			'window_title_width' => $this->options['window_title_width'],
			'homepage' => $this->options['homepage'],
			'homepage_url'=> get_home_url().$this->options['homepage_url'],
			'mousehold_duration' => $this->options['mousehold_duration'],
			
			//locale
			'text_disable_menuslide' => __('Disable sliding',$this->text_domain),
			'text_enable_menuslide' => __('Enable sliding', $this->text_domain),
			'text_menu_settings' => _x('Settings','As in: WindowPress -> Settings',$this->text_domain),
			'text_loading' => __('Loading...',$this->text_domain)
		));


	}


	public function iframe_check() {
			
		?><script>
			if ( top !== self) { //if inside iframe
				var style = document.createElement("style");
				style.innerHTML="body { display:none !important; }";
				document.getElementsByTagName("HEAD")[0].appendChild(style); 
				window.location.href="about:blank";
				}
		</script><?php
	}
	

	public function inline_css() {

        global $_wp_admin_css_colors;
		$scheme=get_user_option('admin_color');
		$colors= $_wp_admin_css_colors[$scheme]->colors;
		$icon_colors= $_wp_admin_css_colors[$scheme]->icon_colors;
		
		$wallpaper='';
		if(!empty($this->options['wallpaper'])) $wallpaper='body { background:url("'.$this->options['wallpaper'].'") !important; }';
		
		//scheme specific tweaks
		$tsk_btn_bg=$colors[0];
		$tsk_btn_bg_active=$colors[2];
		$btn_normal=$colors[3];
		$btn_disabled=$colors[0];

		
		if ($scheme=='light') $tsk_btn_bg=$colors[1];
		elseif ($scheme=='blue') { 
			$tsk_btn_bg=$colors[1]; $tsk_btn_bg_active=$colors[0]; 
			$btn_normal=$colors[0]; $btn_disabled=$colors[3]; 
		}

		echo "<style>
			#windowpress-maximized_tops path, #windowpress-maximized_tops rect { fill: $btn_normal; }
			#windowpress-maximized_tops button[disabled] path, #windowpress-maximized_tops button[disabled] rect{ fill: $btn_disabled; }


			#windowpress-taskbar li.taskbar { background: $tsk_btn_bg; }
			#windowpress-taskbar li.taskbar_active { background: $tsk_btn_bg_active; }
			
			#windowpress-menuslide_toggle span { color: $icon_colors[base]; }
			#windowpress-menuslide_toggle path { fill: $icon_colors[base]; }
				
				
			@media screen and (max-width:782px) { #windowpress-taskbar { background: $colors[1] !important; } }
			#windowpress-taskbar button.taskbar { 	border-left-color:$colors[1]; }
			
			#windowpress-taskbar li.taskbar path { fill: $tsk_btn_bg_active; }
			#windowpress-taskbar li.taskbar_active path { fill:$tsk_btn_bg; }
			
			$wallpaper;

		</style>";

    }


	
	
	public function adminbar_menu_site() {
			
		//add profile, logout and exit links to site-name menu and remove unnessecary menus

		global $wp_admin_bar;
		
		//edit site-name - change site name to "Site", to save space for the taskbar
		$site_name=$wp_admin_bar->get_node('site-name');
		$site_name->title=_x('Site','As in: WWW site',$this->text_domain);
		$wp_admin_bar->remove_menu('site-name');
		//$wp_admin_bar->add_menu($site_name); it will be added later
		
		//add edit-profile to site-name
		$edit_profile=$wp_admin_bar->get_node('edit-profile');
		$edit_profile->parent='site-name';
		$wp_admin_bar->remove_menu('edit-profile');
		$wp_admin_bar->add_menu($edit_profile);

		//add logout to site-name
		$logout=$wp_admin_bar->get_node('logout');
		$logout->parent='site-name';
		$wp_admin_bar->remove_menu('logout');
		$wp_admin_bar->add_menu($logout);


		//add exit to site-name
		$wp_admin_bar->add_menu(array('id'=>'my-account_exit', 'parent'=>'site-name', 'title'=>__('Exit WindowPress',$this->text_domain), 'href'=>$this->wp_admin_url.'?windowpressiframe=0' ));

		//remove unnessecary menus
		$wp_admin_bar->remove_menu('wp-logo');
		$wp_admin_bar->remove_menu('my-account');
		$wp_admin_bar->remove_menu('user-info');
		$wp_admin_bar->remove_menu('user-actions');
		
		
		
		//menus need to be reordered, because site-name was edited
		
		$menu_toggle=$wp_admin_bar->get_node('menu-toggle');
		$wp_admin_bar->remove_menu('menu-toggle');
		$menus=$wp_admin_bar->get_nodes();
		
		//site-name, menu-toggle dont exist at this point
		
		//remove remaining menus
		foreach ($menus as $menu) { $wp_admin_bar->remove_menu($menu->id); } 
		
		$wp_admin_bar->add_menu($menu_toggle);
		$wp_admin_bar->add_menu($site_name);

		//add the rest
		foreach ($menus as $menu) { $wp_admin_bar->add_menu($menu); }
		

	}
	

	public function add_pages() {
		//the goal of this function is to create a pseudo windowpress page, so windowpress is not the current submenu
		//The other benefit is, that the toplevel link points to the settings now
				
		add_menu_page( 'WindowPress', 'WindowPress', 'manage_options', 'windowpress', array($this,'empty_func'),null,'99.0145' );
		remove_menu_page('windowpress');
		
		
		add_menu_page( 'WindowPress', 'WindowPress', 'manage_options', 'windowpress-settings', array($this,'empty_func'),null,'99.0145' );


		add_submenu_page( 'windowpress-settings', 'Exit', _x('Exit','As in: WindowPress -> Exit',$this->text_domain), 'manage_options', 'windowpress_exit', array($this,'empty_func'));

		
		

	}
	public function empty_func() {  }


	public function windowpress_adminbar($wp_admin_bar) {


		$menu_button='<div id="windowpress-windowlist_toggle"><button type="button">'.file_get_contents($this->plugin_path.'/includes/assets/icons/menu.svg').'</button></div>';

		$windowpress = array(
		'id'    => 'windowpress',
		'parent' => 'top-secondary',
		'title' => $menu_button.'<div id="windowpress-maximized_tops"></div><ul id="windowpress-taskbar" style="display:none;"></ul>',
		'meta'  => array( 'class' => '' )
		);
		$wp_admin_bar->add_node($windowpress);



	}


	public function admin_footer() {
		echo '<div id="windowpress-windows"></div>';
	}
	

	public function noticewindow_style() {	?>
		
		<script>
			var style = document.createElement("style");
			style.innerHTML="#windowpress-noticewindow.nojs-notice { display:none !important; }";
			document.getElementsByTagName("HEAD")[0].appendChild(style); 
		</script>
		
		<style>
			#windowpress-noticewindow{
				background: rgba(0,0,0,0.3);
				width:auto;
				height:100%;
				position:fixed;
				left:0;
				top:0;
				right:0;
				z-index: 9999999999;
				
			}
			#windowpress-noticewindow > div {
				position:relative;
				top: 50%;
				transform: translateY(-50%);
				margin-left:auto;
				margin-right:auto;
				background:white;
				width:783px;
				height:400px;
				box-sizing:border-box;
				padding:20px;	
			}
			#windowpress-noticewindow .button {
				position:absolute;
				bottom:20px;
				right:20px;
				width:200px; 
				height:auto;
				box-sizing:border-box;
				font-size:20px;
				padding: 10px 10px 10px 10px;
				display:block;
				text-align:center;
			}
			@media screen and (max-width:782px) {
				#windowpress-noticewindow > div {
					width:100%;
				}
			}
		</style><?php 
	}
		
	public function firstuse_notice() { 
		
		echo '<div id="windowpress-noticewindow"><div>';
		echo '<h1>'.__('Welcome to WindowPress',$this->text_domain).'</h1>';
		echo '<p>'.__('Here are some rules to get you started:',$this->text_domain).'</p>';
		echo '<p>- '.__('If no window is active, clicking a link in the adminbar or admin menu will open a new window',$this->text_domain).'</p>';
		echo '<p>- '.__('If there\'s an active window, clicking a link changes the location of the current window. To open a new window, you have to click (or touch) a link and hold it until a new window opens.',$this->text_domain).'</p>';
		echo '<p>'.__('Enjoy!',$this->text_domain).'</p>';

		
		echo '<form method="post" action="'.$this->wp_admin_url.'admin.php?page=windowpress">';
		echo '<input type="hidden" name="firstuse_notice_viewed" value="1" />';
		echo '<input type="submit" class="button button-primary"  value="'.__('Got it',$this->text_domain).'" /></form>'; 

		echo '</div></div>';
	}

	public function nojs_notice() {
		
		echo '<div id="windowpress-noticewindow" class="nojs-notice"><div>';
		echo '<h1>'.__('Javascript is disabled!',$this->text_domain).'</h1>';
		echo '<p>'.__('WindowPress requires javascript to work. Enable it now and reload this page.',$this->text_domain).'</p>';
		
		echo '</div></div>';
		
		
		
	}



	private $options;
	private $wp_admin_url;
	private $plugin_url;
	private $plugin_path;
	
	
	private $option_name='windowpress';
	private $text_domain='windowpress';
	

	private $main_script='windowpress_script';

	

}

$windowpress= new WindowPress();





?>
