/**
* 
* Main WindowPress script.
* 
* @package WindowPress
* @author Maciej Krawczyk
*/

var WindowPress;

jQuery(document).ready(function($){

var WINDOWPRESS = function () {

	var iframeHistory=[];
	var windowNum=0; 
	var windowCount=0;
	var Z=999999; //initial window z-index

	var sidebar_slide_position;
	
	
	var settings={ 
		"sidebar_slide": parseInt(PHP.sidebar_slide),
		"sidebar_slide_duration": parseInt(PHP.sidebar_slide_duration),
		"sidebar_collapse": ( $('body').hasClass('folded') || ( $('body').hasClass('auto-fold') && $(window).width()<=960 ) ),
		"window_title_width": parseInt(PHP.window_title_width),
		"taskbar_button_width": parseInt(PHP.taskbar_button_width),
		"homepage": parseInt(PHP.homepage),
		"homepage_url": PHP.homepage_url,
		"mousehold_duration": parseInt(PHP.mousehold_duration)
	}
	
	var locale_text={
		"enable_menuslide": PHP.text_enable_menuslide,
		"disable_menuslide": PHP.text_disable_menuslide,
		"menu_settings": PHP.text_menu_settings,
		"loading": PHP.text_loading
	}
	
	var buttons_top_width=5*38; //in px
	var taskbar_button_width=settings["taskbar_button_width"];
	var taskbar_width;

	
	var object=this;
	
	//get information about the screen
	var is_touch= (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
	var is_desktop=(!is_touch);
	var is_tablet=(is_touch && $(window).width() > 782 );
	var is_mobile=(is_touch && $(window).width() < 783 );
	
	var link_click=true;
	var link_mouseholdTimeout;
		
	var resizeTimeout;


	this.init = function() {
		
		//remove wordpress style from taskbar items		
		$('#wp-admin-bar-windowpress').children('div').removeClass('ab-item ab-empty-item');
		
		
		//sidebar slide - only for normal screens
		if (is_desktop) {

			//add hide/show panel button
			var slide_button='<li id="windowpress-menuslide_toggle" ><div>'+PHP.svgIcons['menu_slide']+'</div><span class="wp-menu-name">'+locale_text["enable_menuslide"]+'</span></li>';
			$('#adminmenu').append(slide_button);
		
			if ( settings["sidebar_slide"] && $(window).width()>782 ) object.sidebarSlideEnable();
		
			if ($('body').hasClass('folded')) sidebar_slide_position='-36px';
			else sidebar_slide_position='-160px';
		}
		
		else settings["sidebar_slide"]=0;
		
		//windowpress menu fixes
		$('#toplevel_page_windowpress-settings li.wp-first-item > a').html(locale_text['menu_settings']);
		$('#toplevel_page_windowpress-settings li:last-child > a').attr({id: "windowpress-menu-exit", href: "index.php"});

		//remove return param from customizer links
		$('#menu-appearance a.hide-if-no-customize').attr('href','customize.php');
		
		//this may return incorrect result as some external script changes root-default width on start
		//that's why it's called one more time with a timeout
		object.taskbarWidth();
		
		$('#windowpress-taskbar').sortable({
			handle:"button.taskbar", 
			cancel:"",
			axis:"x",
			zIndex:999999,
			containment: "parent",
			tolerance: "pointer",
			revert:300
		}); 
		
		
		object.registerHooks();
		
		var initTimer=setTimeout(function() { //set a small timeout to get correct taskbar width
			object.taskbarWidth();
		},200);
	
		if(settings["homepage"]) object.windowCreateNew(settings["homepage_url"]);

	}







//WINDOWS AND TASKBAR
//********************************************************************************************************************

	this.resizeHandler = function() { //screen resize
		clearTimeout(resizeTimeout);
		resizeTimeout=setTimeout(function() {
			
			if (is_touch) { //tablet and mobile definitions are based on screen width, so they need to be updated everytime
				is_tablet=($(window).width() > 782 );
				is_mobile=($(window).width() < 783 );
			}
			
			object.taskbarWidth(); //update taskbar width

			object.taskbarOverflowAgent();
			object.sidebarCollapseAgent();
			
			//disable sidebar sliding if screen is too small
			if (is_desktop && $(window).width()<783 && settings["sidebar_slide"]) object.sidebarSlideDisable();
		},100);
	}


	this.taskbarWidth = function() { //set correct taskbar width - called on init and on  window resize
		var top_controls_width=buttons_top_width;
		if ($(window).width()>1000) top_controls_width+=settings["window_title_width"];
		taskbar_width=$('#wpadminbar').width()-$('#wp-admin-bar-root-default').width()-top_controls_width;
		$('#windowpress-taskbar').css("width",taskbar_width+"px");	
	}
	
	this.taskbarOverflowAgent = function() { //prevent taskbar overflow, runs when window count changes or screen width changes
		
		if (is_mobile || !windowCount) return; //this function has no purpose for mobile screens
	
		var taskbar_width_needed=settings["taskbar_button_width"]*windowCount;
		
		if (taskbar_width_needed > taskbar_width) { //if overflow reached
			taskbar_button_width=Math.floor(taskbar_width/windowCount); //divide widths equally
		}
		else taskbar_button_width=settings["taskbar_button_width"]; //restore default value

		//apply widths
		$('#windowpress-taskbar').find('li.taskbar').css('width',taskbar_button_width+'px');
		
	}


	//z-index 0 means that window is minimized

	this.windowActivate = function(elementId) { //make selected window active
		$('#windowpress-taskbar').find('li.taskbar_active').removeClass('taskbar_active');
		$('#'+elementId+'t').addClass('taskbar_active');
		$('#windowpress-maximized_tops .maximized_top').hide();
		$('#'+elementId+'c').show();
	}


	this.windowDeactivate = function() { //runs after a window is closed or minimized

		$('#windowpress-maximized_tops').find('.maximized_top').hide();

		//select window that has the biggest z-index and activate it
		var a;
		var elementId=0;
		var z=1;
		$('#windowpress-windows').children('.windowpress-window').each(function () { 
			if ( $(this).css('z-index') != 0 ) {
				a=$(this).css('z-index');
				if (  a>= z ) { z=a; elementId=this.id;  }
			}
		});
		
		$('#windowpress-taskbar').find('li.taskbar_active').removeClass('taskbar_active');
		$('#windowpress-maximized_tops').find('.maximized_top').hide();

		if (elementId != 0 ) {
			Z=z;
			$('#'+elementId+'t').addClass('taskbar_active');
			$('#'+elementId+'c').show();
			$('#'+elementId).show();
		}
	}


	this.windowOnTop = function($element) { //runs everytime user clicks window and iframe
		//if window isnt on top
		if ( (parseInt($element.css('z-index')) < Z) || ($element.css('z-index')==0) ) {
			Z++;			
			$('#windowpress-windows .windowpress-window').hide();	
			$element.show();
			$element.css('z-index',Z);
			this.windowActivate($element.attr('id'));
		}
	}


	this.windowMinimize = function($element) {
		$element.hide();
		$element.css('z-index','0');
		object.windowDeactivate();
	}


	this.taskbarClick = function(button) {	
		var elementId=$(button).parent().attr('id').slice(0, - 1);
		var $element=$('#'+elementId);
		if ( $element.css('display') == 'none' ){ object.windowOnTop($element); }
		else {
			if ( $element.css('z-index') == Z ) { object.windowMinimize($element); }
			else { object.windowOnTop($element); }
		}
	}
	
	
	this.getTopWindow = function() {
		var elementId=0;
		$('#windowpress-windows .windowpress-window').each( function () {
			if ( parseInt($(this).css('z-index')) == Z ) {
				elementId=this.id;
				return 0;
			}
		});
		return elementId;
	}
	
	this.taskbarScroll = function(event) { 
		
		var $active_button=$('#windowpress-taskbar').children('li.taskbar_active');
		
		var buttonId;
		
		if ($active_button.length===0 ) {
			buttonId=$('#windowpress-taskbar').find('li:last').attr('id');	
		}
		else { 
		
			if( event.originalEvent.detail > 0 || event.originalEvent.wheelDelta < 0 ) { //scroll down
			buttonId=$active_button.prev().attr('id');
			} 
			else { //scroll up
				buttonId=$active_button.next().attr('id');
			}
	
		}
			
		if (typeof buttonId !== 'undefined') {
			var elementId=buttonId.slice(0, - 1);		
			object.windowOnTop($('#'+elementId));
		}
		
	}
	
	
	
	
	
	
//WINDOW CREATE, CLOSE, HANDLING LINKS
//**********************************************************************************************************************

	this.anchorMouseDownHandler = function() {	//for parent and iframes anchors
		link_click=true;
		var anchor=this;
		link_mouseholdTimeout = setTimeout(function() {
			object.windowInit(anchor.href);
			link_click=false;
		},settings["mousehold_duration"]);
		return false;
	}
	
	this.anchorMouseUpHandler = function() { //for parent anchors only
		if(link_click) object.windowChangeLocation(this.href);
		clearTimeout(link_mouseholdTimeout);
		return false;
	}
	
	//in iframes links must be fired from click event, otherwise anchors that have custom events will behave unexpectedly
	this.anchorMouseUpHandlerIframe = function() { //for iframe anchors only
		clearTimeout(link_mouseholdTimeout);
		return false;
	}
	
	this.anchorClickHandlerIframe = function() { //for iframe anchors only
		if(link_click) object.windowChangeLocation(this.href);
		return false;
	}

	this.isLinkLocal = function(href) {
		var regExp = new RegExp("//" + location.host + "($|/)");
		var isLocal = (href.substring(0,4) === "http") ? regExp.test(href) : true;
		return isLocal;
	}
	
	
	this.openNewTab = function(href) {
		var win=window.open(href, '_blank');
		win.focus();
	}


	this.windowChangeLocation = function(url, elementId) { 
	//runs when clicking an anchor when a window is open and not hidden or on click inside iframe
	
	
		if(typeof elementId === 'undefined') elementId=object.getTopWindow();

		//create new window, if there's no active window
		if (elementId===0) { object.windowInit(url); return 0; }
		
		//hide menus
		if (is_touch) {
			object.menupopDisable();
			if (is_tablet) object.opensubDisable();
			else if(is_mobile) { object.responsiveMenuHide(); object.windowlistDisable(); }
		}


		//open new tab and exit if anchor leads outside or leads to Press This!
		if ( !object.isLinkLocal(url) || url.indexOf('press-this.php')>=0 ) { 
			object.openNewTab(url);
			return 0;
		}

		//change location of current window
		 $('#'+elementId).find('iframe').get(0).contentWindow.location=url;

	}


	this.windowInit = function(url) { //runs when holding on an anchor or clicking an anchor when there are no windows open
		
		//hide menus
		if (is_touch) {
			object.menupopDisable();
			if (is_tablet) object.opensubDisable();
			else if(is_mobile) { object.responsiveMenuHide(); object.windowlistDisable(); }
		}

		//open new tab and exit if anchor leads outside
		if ( !object.isLinkLocal(url) ) { 
			object.openNewTab(url);
			return 0;
		}

		var duplicate=0;
		var link_location=url;


		var tempClass=(url).replace('/^[a-z0-9]+$/i');

		$('#windowpress-windows').children('.windowpress-window').each(function () {
			var $iframe=$(this).find('iframe')

			if ( ($iframe.get(0).contentWindow.location == link_location) || ($iframe.hasClass(tempClass)) ) {
				duplicate=1;
				object.windowOnTop($(this));
				return 0;
			}
		});
		//create new window
		if (duplicate ==0 ) { object.windowCreateNew(url); }
		return false;
	}


	//get current additional class for windows, such as noslide-nofolded
	this.getMaximizedClass = function() {
		
		if (settings["sidebar_slide"]) {
			if ( settings["sidebar_collapse"] ) return 'slide-folded';
			else return 'slide-nofolded';
		}
		else {
			if ( settings["sidebar_collapse"] ) return 'noslide-folded';
			else return 'noslide-nofolded';
		}
		
	}


	this.windowGetControls = function() {

		var element='';

		element+='<div class="window_buttons_right">';
		element+='<button type="button" class="button_close">'+PHP.svgIcons["close"]+'</button>';
		element+='</div>';

		element+='<div class="window_title" style="width:'+settings["window_title_width"]+'px;">'+locale_text["loading"]+'</div>';

		element+='<div class="window_buttons_left">';
		element+='<button type="button" class="button_goback" disabled>'+PHP.svgIcons["arrow_left"]+'</button>';
		element+='<button type="button" class="button_goforward" disabled>'+PHP.svgIcons["arrow_right"]+'</button>';
		element+='<button type="button" class="button_refresh">'+PHP.svgIcons["refresh"]+'</button>';
		element+='</div>';

		return element;
	}


	this.windowCreateNew = function(url) {
			
		var window_class='windowpress-window windowpress-window-'+object.getMaximizedClass();

		windowNum++;
		windowCount++;
		object.taskbarOverflowAgent();

		var elementId='windowpress-window'+windowNum;
		iframeHistory[windowNum]=[]; //create history for new window

		//temp class is provided to prevent opening multiple windows from the same panel link
		var tempClass=(url).replace('/^[a-z0-9]+$/i');

		//create window alement
		var controls=object.windowGetControls();
		var element='<div class="'+window_class+'" id="'+elementId+'" style="z-index:0">';
		element+='<div class="iframe_wrapper"><iframe src="" class="'+tempClass+'" name="windowpress_iframe" iframe_id="windowpress-window'+windowNum+'" title="windowpress-first-open"></frame></div>';
		element+='</div>';
		$('#windowpress-windows').append(element);
		
		var $element=$('#'+elementId);

		//top controls
		var controlsId=elementId+'c';
		var top_controls='<div id="'+controlsId+'" class="maximized_top" >'+controls+'</div>';
		$('#windowpress-maximized_tops').append(top_controls);

		//create new taskbar element
		var taskbarItemId=elementId+'t';
		var taskbarItem='<li id="'+taskbarItemId+'" class="taskbar" style="width:'+taskbar_button_width+'px;"><button type="button" class="taskbar ui-sortable-handle">'+locale_text["loading"]+'</button><button class="close">'+PHP.svgIcons["close2"]+'</button></li>';
		$('#windowpress-taskbar').append(taskbarItem);

		object.windowOnTop($element);

		//iframe load hook
		$element.find('iframe').on('load', function(){ object.iframeReload(elementId); });
			
		$element.find('iframe').get(0).contentWindow.location = url;

	}


	this.windowClose = function($element) {
		//WordPress cant tell if iframe is being detached, but it can detect changes to contentWindow.location
		//iframe location is directed to about:blank, WordPress detects an attempt to navigate away
		// when iframe location happens to be about:blank, iframeReload() calls windowCloseExecute()

		var elementId=$element.attr('id');
		var $iframe=$element.find('iframe');
		$iframe.contents().off();

		//change iframe location to tell WordPress that user navigates away from this page
		$iframe.get(0).contentWindow.location.href='about:blank';
	}


	this.windowCloseExecute = function($element) {
		
		windowCount--;
		object.taskbarOverflowAgent();

		var elementId=$element.attr('id');
		var numericId=parseInt(elementId.replace('windowpress-window',''));
		var buttonId=elementId+'t';
		var topId=elementId+'c';

		$element.remove();
		$('#'+buttonId).remove();
		object.windowDeactivate();
		$('#'+topId).remove();

		delete iframeHistory[numericId];
	}


	this.windowSetTitle = function(elementId,title) {
		$('#'+elementId+'c .window_title').get(0).innerHTML=title;
		//update taskbar icon title		
		$('#'+elementId+'t').children('button.taskbar').get(0).innerHTML=title;
	}




//IFRAMES, HISTORY
//********************************************************************************************************************
	this.windowGoBack = function ($element) {

		var elementId=$element.attr('id');

		//get new src
		var numericId=parseInt(elementId.replace('windowpress-window',''));
		var k=parseInt(iframeHistory[numericId][0]);
		var newSrc=iframeHistory[numericId][k-1];
		
		var $iframe=$element.find('iframe');
		$iframe.get(0).contentWindow.location=newSrc;
	}
	
	this.windowGoForward = function ($element) {

		var elementId=$element.attr('id');

		//get new src
		var numericId=parseInt(elementId.replace('windowpress-window',''));
		var k=parseInt(iframeHistory[numericId][0]);
		var newSrc=iframeHistory[numericId][k+1];

		var $iframe=$element.find('iframe');
		$iframe.get(0).contentWindow.location=newSrc;
	}

	this.windowRefresh = function (elementId) { 	
		$('#'+elementId).find('iframe').get(0).contentDocument.location.reload(true);
	}


	
	this.iframeContentClickListener = function(elementId) {
		
		var $element=$('#'+elementId);
		
		if (is_touch) {
			object.menupopDisable();	
			object.opensubDisable();
			if (is_mobile) {
				object.windowlistDisable();
				object.responsiveMenuHide();			
			}
		}
	}
	
	this.iframeBeforeUnload = function(elementId) {
		
		//Set loading... title
		object.windowSetTitle(elementId,locale_text["loading"]);
		
	}
	
	
	this.iframeUnload = function(elementId) { 
		
		var $iframe=$('#'+elementId).find('iframe');
		var iframeWindow=$iframe.get(0).contentWindow;
				
		$iframe.contents().off();
		$(iframeWindow).off();
	}
	


	this.iframeReload = function(elementId) { //handle iframe reload: manage history for going back/foward in an iframe, update taskbar item
		
		
	var $iframe=$('#'+elementId+' iframe');
	var newSrc=$iframe.get(0).contentWindow.location.href;
	
	//close window if requested
	if (newSrc=='about:blank') { object.windowCloseExecute($('#'+elementId)); return 0; }
	

	
	$iframe.ready(function(){ 
		
	
		var iframeWindow=$iframe.get(0).contentWindow;

		$(iframeWindow).on('beforeunload', function(){ object.iframeBeforeUnload(elementId); });
	
		//register unload event
		$(iframeWindow).on('unload', function(){ object.iframeUnload(elementId); });
	
	
		//don't do anything with normal WordPress pages, because they automatically reload themselves as iframe pages
		if ( $iframe.contents().find('meta[name=windowpress_noiframe]').length ) return 0;
		

		var $element=$('#'+elementId); //window element
		var numericId=parseInt(elementId.replace('windowpress-window',''));
		var history=iframeHistory[numericId];
		

		$iframe.removeClass(); //remove temporary id class


		$iframe.contents().on('click', 'body', function() { object.iframeContentClickListener(elementId); });

		//anchor click event
		$iframe.contents().on('click', 'a', object.anchorClickHandlerIframe);
		$iframe.contents().on('mousedown', 'a', object.anchorMouseDownHandler);
		$iframe.contents().on('mouseup', 'a', object.anchorMouseUpHandlerIframe);

		
		
		
		//disable prev/next buttons if not already
		$('#'+elementId+' .button_goback').prop('disabled', true);
		$('#'+elementId+' .button_goforward').prop('disabled', true);

		$('#'+elementId+'c .button_goback').prop('disabled', true);
		$('#'+elementId+'c .button_goforward').prop('disabled', true);

		
		
		//get window title	
		var title;
		if ( $iframe.contents().find('meta[name=reduced_title]').length ) title=$iframe.contents().find('meta[name=reduced_title]').attr('content');
		else if ( $iframe.contents().find('title').length ) title=$iframe.contents().find('title').html();
		else title='undefined';

		//set window title
		object.windowSetTitle(elementId,title);
		$iframe.attr('title',title); //hidden title, currently not used

		
		title=null;


		//add edit/view button

		var extra_button=0;
	
		//edit button
		$element.find('.button_edit').remove();
		$('#'+elementId+'c').find('.button_edit').remove();
		
		var $adminbar_edit=$iframe.contents().find('meta[name=edit_link]');
		
		if ($adminbar_edit.length > 0 ) {
			var link=$adminbar_edit.attr('content');
			var $edit_button='<a href="'+link+'" class="button_edit">'+PHP.svgIcons["edit"]+'</a>';
			
			$element.find('.window_buttons_left').append($edit_button);	
			$('#'+elementId+'c').children('.window_buttons_left').prepend($edit_button);
			extra_button=1;
			$edit_button=null;
			link=null;
		}
		$adminbar_edit=null;
		
		//view button
		$element.find('.button_view').remove();
		$('#'+elementId+'c').find('.button_view').remove();
		
		var $adminbar_view=$iframe.contents().find('#wp-admin-bar-view');
		if ($adminbar_view.length > 0 ) {
			
			var link=$adminbar_view.find('a').attr('href');
			var $view_button='<a href="'+link+'" class="button_view">'+PHP.svgIcons["view"]+'</a>';
			
			$element.find('.window_buttons_left').append($view_button);
			$('#'+elementId+'c').children('.window_buttons_left').prepend($view_button);
			extra_button=1;
			$view_button=null;
			link=null;
		}
		$adminbar_view=null;

		if (extra_button) $('#'+elementId+'c').find('.button_refresh').addClass('button_refresh-autohide');
		else $('#'+elementId+'c').find('.button_refresh').removeClass('button_refresh-autohide');

		//navigate through history

		if ( history.length > 0 ) {

			var oldKey=parseInt(history[0]);
			var newKey;

			//if went back
			if ( newSrc ==history[oldKey-1]) { newKey=oldKey-1; }

			//if went forward
			else if ( newSrc == history[oldKey+1]) { newKey=oldKey+1; }

			//if refresh
			else if ( newSrc ==history[oldKey]) {	newKey=oldKey; }

			//if new link
			else {
				newKey=oldKey+1;
				//delete forward history
				for ( var l=history.length-1; l> newKey; l--) { delete iframeHistory[numericId][l]; }
			}

			history[0]=newKey;
			history[newKey]=newSrc;

			//enable buttons - each button can be clicked once until iframe reloads and makes them available again

			//if back history available
			if (newKey>1) { 
				$('#'+elementId+' .button_goback').prop('disabled', false);
				$('#'+elementId+'c .button_goback').prop('disabled', false);

			}

			//if forward history available
			if (newKey < history.length-1 ) { 
				$('#'+elementId+' .button_goforward').prop('disabled', false);
				$('#'+elementId+'c .button_goforward').prop('disabled', false);
			}

			iframeHistory[numericId]=history;

		}
		else { //there's no iframe history for this window yet

			iframeHistory[numericId][0]=1; //current location key number
			iframeHistory[numericId][1]=newSrc;	//current location
		}


	});//endof iframe ready


	}//endof function
	
	
	
	
	
	
//INTERFACE
//******************************************************************************************************************
	
//sidebar
	
	this.sidebarSlideEnable = function() {
		settings["sidebar_slide"]=1;
		$('#windowpress-menuslide_toggle span').get(0).innerHTML=locale_text["disable_menuslide"];
		$('#adminmenuwrap').addClass('windowpress-menu-slide');
		$('#adminmenuback').addClass('windowpress-menu-slide');
		//remove additional classes if any
		$('.windowpress-window').removeClass().addClass('windowpress-window');
		//set correct maximized window class
		$('.windowpress-window').addClass('windowpress-window-'+object.getMaximizedClass());
			
	}
		
	this.sidebarSlideDisable = function() {
		
		settings["sidebar_slide"]=0;
		$('#windowpress-menuslide_toggle span').get(0).innerHTML=locale_text["enable_menuslide"];
		$('#adminmenuwrap').removeClass('windowpress-menu-slide');
		$('#adminmenuback').removeClass('windowpress-menu-slide');
		//remove additional classes if any
		$('.windowpress-window').removeClass().addClass('windowpress-window');
		//set correct maximized window class
		$('.windowpress-window').addClass('windowpress-window-'+object.getMaximizedClass());
		$('#adminmenuwrap').css('left','0px');
			
	}
	
	this.sidebarSlideToggle = function() {
		
		if ( $('#adminmenuwrap').hasClass('windowpress-menu-slide') ) { object.sidebarSlideDisable(); }
		else { object.sidebarSlideEnable(); }
		
	}
	
	this.sidebarCollapseToggle = function() {
				
		if (settings["sidebar_collapse"]) {
			sidebar_slide_position='-160px';
			settings["sidebar_collapse"]=false;
		}
		else {
			sidebar_slide_position='-36px';
			settings["sidebar_collapse"]=true;
			
		}
		//set correct maximized window class
		$('.windowpress-window').removeClass().addClass('windowpress-window');
		$('.windowpress-window').addClass('windowpress-window-'+object.getMaximizedClass());
		
		
		
	}
	
	this.sidebarCollapseAgent = function() {
		//detect if menu folded/unfolded automatically
			
		var collapsed = ( $('body').hasClass('folded') || ( $('body').hasClass('auto-fold') && $(window).width()<=960 ) );
		var collapsed_settings=settings["sidebar_collapse"];
			
		//toggle collapse if settings do not match
		if ( collapsed !== collapsed_settings ) { 
			object.sidebarCollapseToggle();
			if(is_desktop) $('#adminmenuwrap').css('left','0px');
		}
	}
	
	
	
	this.menupopToggle = function($element) {
		//some hacks to get around wordpress events
		if ($element.hasClass('windowpress_hover')) { $element.removeClass('windowpress_hover'); $element.removeClass('hover'); }
		else { $element.addClass('windowpress_hover'); $element.addClass('hover'); }
	}
	
	this.menupopDisable = function() {
		$('.windowpress_hover').removeClass('hover windowpress_hover');
	}
	
	this.opensubToggle = function($element) {
				
		if (!is_tablet) return;
		
		//close submenu
		if ($element.hasClass('windowpress_opensub')) { 
			$element.removeClass('windowpress_opensub'); 
			$element.removeClass('opensub'); 
			$element.find('.wp-submenu').hide();
			
		}
		//open submenu
		else { 
			object.opensubDisable(); //disable other submenus
			$element.addClass('windowpress_opensub'); 
			$element.addClass('hover');
			$element.find('.wp-submenu').show();
		}
	
	}
	
	
	this.opensubDisable = function() {
						
		if (!is_tablet) return;

		$('.windowpress_opensub').find('.wp-submenu').hide();
		$('.windowpress_opensub').removeClass('opensub windowpress_opensub');
		
	}
	
	this.responsiveMenuHide = function() {
		
		if ($('#wpwrap').hasClass('wp-responsive-open')) $('#wp-admin-bar-menu-toggle').trigger('click');

	}


	this.windowlistToggle = function() { $('#windowpress-taskbar').toggle();}
	this.windowlistDisable = function() { $('#windowpress-taskbar').hide();}





//HOOKS
//***************************************************************************************************************
	this.registerHooks = function() {
			
	//resize event
	$(window).on('resize', object.resizeHandler);


	//sidebar sliding
	if (is_desktop) { //using #wpwrap instead of #adminmenumain to provide backwards compatibility 
		$('#wpwrap').on('mouseenter', '#adminmenuwrap.windowpress-menu-slide', function() { $('#adminmenuwrap').stop(true, false).animate({left: "0px"},settings["sidebar_slide_duration"]); });
		$('#wpwrap').on('mouseleave', '#adminmenuwrap.windowpress-menu-slide', function() { $('#adminmenuwrap').stop(true, false).animate({left: sidebar_slide_position},settings["sidebar_slide_duration"]); });
		$('#adminmenu').on('click','#windowpress-menuslide_toggle', function() { object.sidebarSlideToggle(); });
	}
	
	$('#adminmenu').on('click','#collapse-menu', function() { object.sidebarCollapseToggle(); });
	
	
	//mobile windowlist
	$('#windowpress-windowlist_toggle').on('click', function() { object.windowlistToggle(); });
	
	//touch devices button compatibility
	$('#wpadminbar').off();
	if (is_touch) {
		$('#wpadminbar').on('click','.menupop > a', function() { object.menupopToggle( $(this).parents('.menupop') );  });
		$('body').on('click', '#wpwrap:not(.menupop, .menupop > a)', function() { object.menupopDisable(); } );
		
		$('#adminmenu').on('click','.wp-has-submenu > a', function() { object.opensubToggle( $(this).parents('.wp-has-submenu') ); });
		$('body').on('click', '#wpwrap:not(.wp-has-submenu, .wp-has-submenu > a)', function() { object.opensubDisable(); } );
	}
	

	//anchors
	var exceptions='#wp-admin-bar-logout > a, #wp-admin-bar-my-account_exit > a, #windowpress-menu-exit, #wp-admin-bar-my-sites a';
	
	var anchor_selector;
	if (is_desktop) anchor_selector="a[href!='#']:not("+exceptions+")";	
	else if (is_touch) anchor_selector="a[href!='#']:not(.menupop > a, .wp-has-submenu > a, "+exceptions+")";


	if (is_touch) { 
		$("body").on("contextmenu", anchor_selector, function(e) { return false; });
	}


	$("body").on('mousedown', anchor_selector, object.anchorMouseDownHandler);
	
	$("body").on('mouseup', anchor_selector, object.anchorMouseUpHandler);

	$("body").on("click", "a[href!='#']:not("+exceptions+")", function() {  return false;  });
	
	$("body").on("click", "#wp-admin-bar-my-sites a", function() {  object.openNewTab(this.href); return false;  });



//TASKBAR BUTTONS

	var taskbar_click_event='click';

	if (is_desktop) {
		
		taskbar_click_event='mousedown';
	
		var taskbarClickTimeout;

		$('#windowpress-taskbar').on( "sortstart", function( event, ui ) { 
		
			clearTimeout(taskbarClickTimeout);
			var $li=ui.item;
		
			if (!$li.hasClass('taskbar_active')) {
				var button=$li.children('button.taskbar').get(0);
				object.taskbarClick(button);
			}
	
		} );
	
		//scroll between windows
		$('#windowpress-taskbar').on( 'DOMMouseScroll mousewheel', object.taskbarScroll);
	
	}

	$('#windowpress-taskbar').on(taskbar_click_event, 'button.taskbar', function() { 
		var button=this;
		taskbarClickTimeout=setTimeout(function() { object.taskbarClick(button); },100);
	});
		
	//close button - mobile menu 
	$('#windowpress-taskbar').on('click', 'button.close', function() { 
		var elementId=$(this).parent().attr('id');
		elementId=elementId.slice(0, - 1);
		object.windowClose( $('#'+elementId) ); 
	});
	

//WINDOW TOP BUTTONS

//go back
	$('#windowpress-maximized_tops').on('click', '.button_goback', function() { 
		var elementId=$(this).parents('.maximized_top').attr('id');
		elementId=elementId.slice(0, - 1);
		object.windowGoBack( $('#'+elementId) ); 
});
//go foward
	$('#windowpress-maximized_tops').on('click', '.button_goforward', function() { 
		var elementId=$(this).parents('.maximized_top').attr('id');
		elementId=elementId.slice(0, - 1);
		object.windowGoForward( $('#'+elementId) ); 
});
//refresh
	$('#windowpress-maximized_tops').on('click', '.button_refresh', function() { 
		var elementId=$(this).parents('.maximized_top').attr('id');
		elementId=elementId.slice(0, - 1);
		object.windowRefresh(elementId);
});
//close window 
	$('#windowpress-maximized_tops').on('click', '.button_close', function() { 
		var elementId=$(this).parents('.maximized_top').attr('id');
		elementId=elementId.slice(0, - 1);
		object.windowClose( $('#'+elementId) ); 
	});


	
	}//endoffunction


};//end of class



WindowPress = new WINDOWPRESS();

WindowPress.init();


}); //endof jquery
