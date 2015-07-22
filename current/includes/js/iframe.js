var WindowPressIframe;

jQuery(document).ready(function($){
	
var WINDOWPRESS_IFRAME = function () {
	//'use strict';

	var elementId=window.frameElement.getAttribute("iframe_id");
	
	//get edit/view links
				
	var extra_link=0;
	
	var extra_link_type=0;
		
		if ($('#wp-admin-bar-view').length > 0 ) {
			extra_link=$('#wp-admin-bar-view').find('a').attr('href');
			extra_link_type='view';
		}
		else if ($('#wp-admin-bar-preview').length > 0 ) {
			extra_link=$('#wp-admin-bar-preview').find('a').attr('href');
			extra_link_type='view';
		}
		else if (typeof windowpress_edit_link!=='undefined' && windowpress_edit_link!=0) {
			extra_link=windowpress_edit_link;
			extra_link_type='edit';
		}
						
	//call iframe load function
	parent.WindowPress.iframeLoad(elementId,windowpress_reduced_title,extra_link,extra_link_type);
	
	//register hooks
	$(window).on('unload', function() {
		$('body').off(); 
		$(window).off();
	});
	
	$('body').on('click', function() { parent.WindowPress.iframeContentClickListener(elementId); });
	
	var exceptions='.thickbox, #post-preview-windowpress';
	$('body').on('mousedown', 'a:not('+exceptions+')', parent.WindowPress.anchorMouseDownHandler);		
	$('body').on('mouseup', 'a:not('+exceptions+')', parent.WindowPress.anchorMouseUpHandlerIframe);
	$('body').on('click', 'a:not('+exceptions+')', parent.WindowPress.anchorClickHandlerIframe);
	
}

if ( top !== self && window.frameElement.getAttribute("Name")==="windowpress_iframe")
	WindowPressIframe = new WINDOWPRESS_IFRAME();
});
