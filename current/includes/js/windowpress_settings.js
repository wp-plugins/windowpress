/**
* 
* Script for the settings page.
* 
* @package WindowPress
* @author Maciej Krawczyk
*/
jQuery(document).ready(function($){
		
var WINDOWPRESS_SETTINGS_PAGE = function () {
	
	
	//twitter button
	!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
	var timer=setTimeout(function() { $('#windowpress-twitter-follow').show(); },100);
	
	//show iframe settings notification
	if ( top !== self && window.frameElement.getAttribute("Name")==="windowpress_iframe") $('#windowpress-settings-iframe-notify').show();
	
	//Facebook share
	$('#windowpress-fbshare').on('click', function() {
		window.open(this.href,'fbshare','width=640,height=320');
		return false;
	});
	
	//Google +1
	$('#windowpress-plus1').on('click', function() {
		window.open(this.href,'googleplus1','width=800,height=600');
		return false;
	});
	
	
	//media uploader
	//snippet from http://www.webmaster-source.com/2013/02/06/using-the-wordpress-3-5-media-uploader-in-your-plugin-or-theme/
	var custom_uploader;

	$('#upload_image_button, #upload_image_preview').click(function(e) {

		e.preventDefault();

		//If the uploader object has already been created, reopen the dialog
		if (custom_uploader) {
			custom_uploader.open();
			return;
		}

		//Extend the wp.media object
		custom_uploader = wp.media.frames.file_frame = wp.media({
			title: 'Choose Image',
			button: {
				text: 'Choose Image'
			},
			multiple: false
		});

		//When a file is selected, grab the URL and set it as the text field's value
		custom_uploader.on('select', function() {
			attachment = custom_uploader.state().get('selection').first().toJSON();
			$('#upload_image').val(attachment.url);
			$('#upload_image_preview').attr('src',attachment.url); //update preview image
		});

		//Open the uploader dialog
		custom_uploader.open();

	});
	
}

WindowPress_settings_page = new WINDOWPRESS_SETTINGS_PAGE();


});
