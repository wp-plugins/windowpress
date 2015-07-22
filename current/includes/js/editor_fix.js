//add event listener for editor iframe


jQuery(document).ready(function($){


var WINDOWPRESS_EDITOR_FIX = function () {

	var iframe_id=window.frameElement.getAttribute("iframe_id");

	
	//load and ready don't work for this iframe, so the only way is to set a timeout
	
	var timer=setTimeout(function() { 
		$('#content_ifr').contents().on('click',function() { parent.WindowPress.iframeContentClickListener(iframe_id); });
	},500);
	
	$(window).on('unload', function() {
		$('#content_ifr').contents().off();
		$(window).off();
	});
	
	var is_desktop=(!(('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)));

	/*editor toolbar has incorrect position when scrolling down the page due to removal of wpadminbar
	this is just a temporary fix, better solution will be provided in an update*/
	if (is_desktop) {
		
		var style='#wp-content-editor-tools { position:absolute !important; top:0 !important; }';
		style+='#mceu_28 { position:absolute !important; top:0 !important; }';
		
		
		$('head').append('<style>'+style+'</style>');
		
	}

}


WindowPress_editor_fix = new WINDOWPRESS_EDITOR_FIX();


});
