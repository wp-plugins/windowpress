/**
* 
* This script is a fix for the customizer.
* Adds a click event to the customizer iframe contents
* Hijacks change theme button, so it doesn't change the top window location.
* 
* @package WindowPress
* @author Maciej Krawczyk
*/


jQuery(document).ready(function($){



var WINDOWPRESS_CUSTOMIZER_FIX = function () {
	
	var iframe_id=window.frameElement.getAttribute("iframe_id");

	
	var iframeContents;
	

	//customize-preview load event
	this.iframeLoadEmulation = function () { 
		
		if (typeof iframeContents !=='undefined') {
			iframeContents.off();
			iframeContents=null;
		}
		
		iframeContents=$('#customize-preview').find('iframe').contents();
		iframeContents.on('click', function(){ parent.WindowPress.iframeContentClickListener(iframe_id); });
	}
	
	//hijack 'change theme' button click

	$('li.customize-control.customize-control-theme').off('click' ); //need to filter it better in the future, as theme-details button is off too


	$('li.customize-control.customize-control-theme').on('click', function() {
						
		var url=$(this).children('div.theme').attr('data-preview-url');
		
		parent.WindowPress.windowChangeLocation(url,iframe_id);			
	});
	
}


WindowPress_customizer_fix = new WINDOWPRESS_CUSTOMIZER_FIX();




});
