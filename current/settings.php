<?php
/**
* 
* adds WindowPress menu pages and settings
* Runs on every admin page, except windowpress
* 
* @package WindowPress
* @author Maciej Krawczyk
*/


defined('ABSPATH') or die();

class WindowPress_Settings {

	public function __construct() {

		$this->plugin_url=plugins_url().'/'.basename(dirname(dirname(__FILE__))).'/'.basename(dirname(__FILE__));
		$this->plugin_path=dirname(__FILE__);

		$this->options=get_option($this->option_name);
		$this->info=get_option($this->info_name);

		#default settings
		require($this->plugin_path.'/includes/php/default_settings.php');
		
		#update
		if ($this->options) { //plugin must be already installed
			if (!isset($this->info['version'])) $this->info['version']=1.1; //version tracking started with v1.2
			if ( WINDOWPRESS_VER!==$this->info['version'] )
				require(dirname(__FILE__).'/update.php'); 
		}
			
		//pages and settings
		add_action( 'admin_init', array( $this, 'add_settings_fields' ) );
		add_action( 'admin_menu', array( $this, 'add_pages' ) );
		
		//script for settings page
		if (isset($_GET['page']) && $_GET['page']===$this->settings_page_id && basename($_SERVER["PHP_SELF"])==='admin.php') {
			add_action('admin_enqueue_scripts',array($this,'enqueue_settings_scripts'));
		}

    }
    
    
    public function empty_func() { }
    
    
    
    public function add_pages() {
		add_menu_page( 'WindowPress', 'WindowPress', 'manage_options', 'windowpress', array($this,'empty_func'),null,'99.0145' );
		add_submenu_page( 'windowpress', __('WindowPress Settings',$this->text_domain), _x('Settings','As in: WindowPress -> Settings',$this->text_domain), 'manage_options', $this->settings_page_id, array($this,'windowpress_settings_page'));
	}
    
    


    public function enqueue_settings_scripts() {
		wp_enqueue_media();
		wp_enqueue_script('windowpress_settings', $this->plugin_url.'/includes/js/windowpress_settings.js', array('jquery'),WINDOWPRESS_VER);
		wp_enqueue_style( 'windowpress_settings', $this->plugin_url.'/includes/css/windowpress_settings.css', false, WINDOWPRESS_VER); 

	}
	    
	public function windowpress_settings_page() {
		
		$windowpress_url=urlencode('https://wordpress.org/plugins/windowpress');
		
		$twitter_text=urlencode('I enhanced my #WordPress administration area with this awesome #plugin #windowpress');

		
		echo '<div class="wrap">';
		echo '<h2>'.__('WindowPress Settings',$this->text_domain).'</h2>';		
		settings_errors();
			
		?>
			
		<div id="windowpress-settings-about">
						
			<h2>WindowPress v<?php echo WINDOWPRESS_VER; ?></h2>
			
			<div class="about-row-1">

				<div class="about-section">
				<p>Follow me on Twitter to keep up with the news</p>
				<a id="windowpress-twitter-follow" style="display:none;" href="https://twitter.com/windowpress" class="twitter-follow-button" data-show-count="false" data-size="large">Follow @windowpress</a>
				</div>

				<div class="about-section">
					<p>You can easily help WindowPress grow by telling about it your friends.</p>
					<?php
					echo "<a id='windowpress-fbshare' class='social-icon' href='http://www.facebook.com/sharer.php?u=$windowpress_url' title='Share on Facebook'><img src='".$this->plugin_url."/includes/assets/social-icons/facebook.png' /></a>";
					echo "<a id='windowpress-plus1' class='social-icon' href='https://plus.google.com/share?url=$windowpress_url' title='Recommend on Google+'><img src='".$this->plugin_url."/includes/assets/social-icons/google-plus.png' /></a>";
					echo "<a class='social-icon' href='https://twitter.com/intent/tweet?text=$twitter_text&url=$windowpress_url&via=windowpress' title='Share on Twitter'><img src='".$this->plugin_url."/includes/assets/social-icons/twitter.png' /></a>";
					?>
					<div class="clear"></div>
				</div>

				<div class="clear"></div>
	
			</div>
			
	
			<div class="about-row-2">

				<div class="about-section">
				<p>I plan to keep WindowPress actively developed. If you like this plugin and find it useful, please consider donating.</p>
				<a class="button button-blue mobile-button-noborder-right" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YVXX65YFACBFE" target="_blank">Donate</a>
				</div>
			
				<div class="about-section">
				<p>Think WindowPress is awesome? Please consider leaving a 5-star review.</p>
				<a class="button button-red mobile-button-noborder-left mobile-button-noborder-right" href="https://wordpress.org/support/view/plugin-reviews/windowpress?rate=5#postform" target="_blank">Review</a>
				</div>
			
				<div class="about-section">
				<p>Need help, found a bug? Check the Support Forum and Frequently Asked Questions.</p>
				<a class="button button-green button-half button-left mobile-button-noborder-left" href="https://wordpress.org/support/plugin/windowpress" target="_blank">Forum</a>
				<a class="button button-orange button-half button-right" href="https://wordpress.org/plugins/windowpress/faq/" target="_blank">FAQ</a>
				</div>
			
			</div>
			
		</div>
		
		
		<div id="windowpress-settings-options">
			
			<?php echo '<p id="windowpress-settings-iframe-notify" style="display:none;">'.__('Note that WindowPress must be reloaded for changes to take effect.',$this->text_domain).'</p>'; ?>

			<form method="post" action="options.php"><?php
			settings_fields($this->option_group);
			do_settings_sections($this->settings_page_id);
			submit_button();
			?></form>
		</div>
		
		
		<?php
				
		echo '</div>';//wpwrap

	}
    

   	public function add_settings_fields() {
		
		
		register_setting( $this->option_group, $this->option_name, array( $this, 'sanitize_input'));
		
		#general settings
		add_settings_section($this->section_general,__('General Settings',$this->text_domain), array($this,'empty_func'),$this->settings_page_id);
		
		add_settings_field('login_redirect',__('Login redirect',$this->text_domain),array( $this, 'check_callback' ),$this->settings_page_id,$this->section_general,
		array('login_redirect',__('Redirect to WindowPress after login.',$this->text_domain)));

		add_settings_field('add_adminbar_link',__('Add adminbar link',$this->text_domain),array( $this, 'check_callback' ),$this->settings_page_id,$this->section_general,
		array('add_adminbar_link',__('Include WindowPress link in WordPress Adminbar',$this->text_domain)));

		add_settings_field('wallpaper',__('Wallpaper',$this->text_domain),array( $this, 'image_callback' ),$this->settings_page_id,$this->section_general,
		array('wallpaper',__('Enter a URL or upload an image.',$this->text_domain)));
		
		add_settings_field('homepage',__('Enable Homepage',$this->text_domain),array( $this, 'check_callback' ),$this->settings_page_id,$this->section_general,
		array('homepage',__('Load internal URL of your choice automatically on start.',$this->text_domain)));
		
		add_settings_field('homepage_url',__('Homepage URL',$this->text_domain),array( $this, 'internal_url_callback' ),$this->settings_page_id,$this->section_general,
		array('homepage_url',''));

		add_settings_field('custom_site_title',__('Custom site title',$this->text_domain),array( $this, 'check_callback' ),$this->settings_page_id,$this->section_general,
		array('custom_site_title',''));
		
		add_settings_field('custom_site_title_text',__('',$this->text_domain),array( $this, 'text_callback' ),$this->settings_page_id,$this->section_general,
		array('custom_site_title_text',__('Display custom text instead of the site title in WindowPress site menu. Useful if your website has a long title, limiting the taskbar width. Leave empty to display just the home icon.',$this->text_domain),''));

		add_settings_field('wrap_menus',__('Wrap plugin menus',$this->text_domain),array( $this, 'check_callback' ),$this->settings_page_id,$this->section_general,
		array('wrap_menus','Sava space for the taskbar by wrapping plugin menus into a submenu.'));

		#interface settings
		add_settings_section($this->section_interface,__('Interface Settings',$this->text_domain), array($this,'empty_func') ,$this->settings_page_id);

		add_settings_field('sidebar_slide_start',__('Menu Slide on Start',$this->text_domain),array( $this, 'check_callback' ),$this->settings_page_id,$this->section_interface,
		array('sidebar_slide_start',__('Turn on menu sliding automatically on start.',$this->text_domain)));

		add_settings_field('sidebar_slide_duration',__('Menu Slide Duration',$this->text_domain),array( $this, 'text_callback' ),$this->settings_page_id,$this->section_interface,
		array('sidebar_slide_duration','','ms'));
		
		add_settings_field('mousehold_duration',__('Long Press Duration',$this->text_domain),array( $this, 'text_callback' ),$this->settings_page_id,$this->section_interface,
		array('mousehold_duration',__('Set how long click must be held to open a new window.',$this->text_domain),'ms'));

		add_settings_field('taskbar_button_width',__('Taskbar Button Width',$this->text_domain),array( $this, 'text_callback' ),$this->settings_page_id,$this->section_interface,
		array('taskbar_button_width',__('Maximum width of a taskbar button.',$this->text_domain),'px'));

		add_settings_field('window title width',__('Window Title Width',$this->text_domain),array( $this, 'text_callback' ),$this->settings_page_id,$this->section_interface,
		array('window_title_width',__('Width of the window title box in the top right corner',$this->text_domain),'px'));

	}
    	
    public function text_callback($args) { $option_id=$args[0]; $description=$args[1]; $units=$args[2];
			
		$value='';
		if (isset($this->options[$option_id])) $value=esc_attr($this->options[$option_id]);
		if (empty($units)) { $width='500px'; $units=null; }
		else $width='50px';
		echo "<input class=\"text-input\" type=\"text\" id=\"$option_id\" name=\"".$this->option_name."[$option_id]\" style=\"width:$width;\" value=\"$value\" /><p class=\"units\">$units</p><div class=\"clear\"></div>";
		if(!empty($description)) echo "<p class='description'>$description</p>";
		
	}
    
	public function internal_url_callback($args) { $option_id=$args[0]; $description=$args[1];
			
		$value='';
		if (isset($this->options[$option_id])) $value=esc_attr($this->options[$option_id]);
		$width='100px';
		echo get_home_url()."<input type=\"text\" id=\"$option_id\" name=\"".$this->option_name."[$option_id]\" style=\"width:$width;\" value=\"$value\" />";
		if(!empty($description)) echo "<p class='description'>$description</p>";
		
	}
    
       public function check_callback($args) { $option_id=$args[0]; $description=$args[1];	
		$value=0;
		if (isset($this->options[$option_id])) $value=esc_attr($this->options[$option_id]);
		if ($value=='1') $checked='checked="checked"'; 
		else $checked=null;
		echo "<input type=\"checkbox\"  name=\"".$this->option_name."[$option_id]\" value=\"1\" $checked>";
		if(!empty($description)) echo "<p class='description'>$description</p>";

    }
    

	public function image_callback($args) {
		$option_id=$args[0]; 
		$description=$args[1];	
		if (isset($this->options[$option_id])) $value=esc_attr($this->options[$option_id]);
		else $value=null;
		echo "
		<img id=\"upload_image_preview\" src=\"$value\" style=\"height:100px; \" /><br />
		<label for=\"upload_image\" style=\"\">
		<input id=\"upload_image\" type=\"text\" size=\"36\" name=\"".$this->option_name."[$option_id]\" value=\"$value\" />
		<input id=\"upload_image_button\" class=\"button\" type=\"button\" value=\"Upload Image\" />
		</label>
		";
		
		if(!empty($description)) echo "<p class='description'>$description</p>";
	}
	
	
	public function sanitize_input($input) {
		
		$new_input = array();
		
		#error messages
		$int_incorrect_value_error=__('allowing values between %d and %d',$this->text_domain);
		$notnum_error=__('input is not a number',$this->text_domain);
		$incorrect_url_error=__('input is not a valid URL',$this->text_domain);
		
		
		#validate integer inputs
		$int_inputs=array(
			'sidebar_slide_duration'=>__('Menu Slide Duration',$this->text_domain), 
			'mousehold_duration'=>__('Long Press Duration',$this->text_domain), 
			'taskbar_button_width'=>__('Taskbar Button Width',$this->text_domain), 
			'window_title_width'=>__('Window Title Width',$this->text_domain)
		);
		foreach ($int_inputs as $field=>$name) { if (isset($input[$field])) {
			$num=$input[$field];
			$error_message='';
			if (!is_numeric($num)) $error_message=$name.': '.$notnum_error;
			else {
				#set limits
				$lower_limit=0;
				$upper_limit=2000;
				if ($field==='sidebar_slide_duration') $upper_limit=1000;
				elseif ($field==='taskbar_button_width') $lower_limit=20; //it can be even as wide as the screen, because it's automatically reduced by js
				elseif ($field==='window_title_width') $upper_limit=500;
				$num=intval($num);
				if ($num>=$lower_limit && $num<=$upper_limit) $new_input[$field]=$num;
				else $error_message=$name.': '.sprintf($int_incorrect_value_error,$lower_limit,$upper_limit);
			}	
			if(!empty($error_message)) {
				$new_input[$field]=$this->options[$field];
				add_settings_error($field,esc_attr('settings_error'),$error_message,'error');
			}
						
		} }
		
		
		//sanitize checkboxes
		$check_inputs=array(
			'login_redirect'=>'', 
			'add_adminbar_link'=>'', 
			'homepage'=>'', 
			'sidebar_slide_start'=>'',
			'custom_site_title'=>'',
			'wrap_menus'=>''
		);
		foreach ($check_inputs as $field=>$name) {
			if (isset($input[$field]) && intval($input[$field])===1) $new_input[$field]=intval($input[$field]);
			else $new_input[$field]=0;
		}
		
		
		//validate url
		$url_inputs=array(
			'wallpaper'=>__('Wallpaper',$this->text_domain), 
			'homepage_url'=>__('Homepage URL',$this->text_domain)
		);
		foreach ($url_inputs as $field=>$name) { if (isset($input[$field])) {
			if ($field==='homepage_url') $url=get_home_url().$input[$field];
			else $url=$input[$field];
			$url=htmlspecialchars($url);
			if ($field==='wallpaper' and empty($url)) $new_input[$field]='';
			elseif(in_array(parse_url($url, PHP_URL_SCHEME),array('http','https')) && filter_var($url, FILTER_VALIDATE_URL) !== false) {
				$new_input[$field]=$input[$field]; }
			else {
				$error_message=$name.': '.$incorrect_url_error;
				add_settings_error($field,esc_attr('settings_error'),$error_message,'error');
				$new_input[$field]=$this->options[$field];
			}
		}}
		
		//text inputs
		$text_inputs=array(
			'custom_site_title_text'=>__('Custom site title',$this->text_domain), 
		);
		foreach ($text_inputs as $field=>$name) { if (isset($input[$field])) {

			$new_input[$field]=sanitize_text_field($input[$field]);
						
		} }
		
		return $new_input;
	} //endof sanitize_input


	private $default_settings;
	private $default_info;


	private $options;
	private $info;
	
	private $option_name='windowpress';
	private $info_name='windowpress-info';
	
	
	private $plugin_url;



	private $text_domain='windowpress';


	
	private $option_group='windowpress_settings';
	private $section_general='windowpress_settings_general';
	private $section_interface='windowpress_settings_interface';
	private $settings_page_id='windowpress-settings';
	


}

$windowpress_settings= new WindowPress_Settings();
