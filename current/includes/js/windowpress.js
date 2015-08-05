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
	
	//store simplified taskbar structure in an array, for faster window switching
	var taskbar_cache=[];

	var sidebar_slide_position;
	
	
	var settings={ 
		"sidebar_slide": parseInt(WindowPress_Data.sidebar_slide),
		"sidebar_slide_duration": parseInt(WindowPress_Data.sidebar_slide_duration),
		"sidebar_collapse": ( $('body').hasClass('folded') || ( $('body').hasClass('auto-fold') && $(window).width()<=960 ) ),
		"window_title_width": parseInt(WindowPress_Data.window_title_width),
		"taskbar_button_width": parseInt(WindowPress_Data.taskbar_button_width),
		"homepage": parseInt(WindowPress_Data.homepage),
		"homepage_url": WindowPress_Data.homepage_url,
		"mousehold_duration": parseInt(WindowPress_Data.mousehold_duration),
		"exit_prompt": parseInt(WindowPress_Data.exit_prompt),

	}
	
	var locale_text={
		"enable_menuslide": WindowPress_Data.text_enable_menuslide,
		"disable_menuslide": WindowPress_Data.text_disable_menuslide,
		"menu_settings": WindowPress_Data.text_menu_settings,
		"loading": WindowPress_Data.text_loading,
		"exit_prompt": WindowPress_Data.text_exit_prompt
	}
	
	var buttons_top_width=5*38; //in px
	var taskbar_button_width=settings["taskbar_button_width"];
	var taskbar_width;
	
	var anchor_selector;
 	var anchor_exceptions;

	
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
			var slide_button='<li id="windowpress-menuslide_toggle" ><div>'+WindowPress_Data.svgIcons['menu_slide_enable']+'</div><span class="wp-menu-name">'+locale_text["enable_menuslide"]+'</span></li>';
			$('#adminmenu').append(slide_button);
		
			if ( settings["sidebar_slide"] && $(window).width()>782 ) object.sidebarSlideEnable();
		
			if ($('body').hasClass('folded')) sidebar_slide_position='-36px';
			else sidebar_slide_position='-160px';
		}
		
		else settings["sidebar_slide"]=0;
		
		//windowpress menu fixes
		$('#toplevel_page_windowpress-settings li.wp-first-item > a').html(locale_text['menu_settings']);
		$('#toplevel_page_windowpress-settings li:last-child > a').attr({id: "windowpress-menu-exit", href: "index.php"});
		
		//select anchors that open new windows
 		anchor_exceptions='#wp-admin-bar-logout > a, #wp-admin-bar-my-account_exit > a, #windowpress-menu-exit, #wp-admin-bar-my-sites a';
 		if (is_desktop) anchor_selector="a[href!='#']:not("+anchor_exceptions+")";	
 		else if (is_touch) anchor_selector="a[href!='#']:not(.menupop > a, .wp-has-submenu > a, "+anchor_exceptions+")";
 
 		//make admin menu links absolute
 		var pattern=/^https?:\/\/|^\/\//i;
 		$('#adminmenu a').each(function() {
 			var href=$(this).attr('href');
 			if (!pattern.test(href)) $(this).attr('href',WindowPress_Data.admin_url+href);
 		});
 		
 		//add windowpressiframe to top level links
 		$(anchor_selector).each(function() {
 			var href=$(this).attr('href');	
 			if(href.indexOf('?')==-1) href+='?windowpressiframe=1';
 			else href+='&windowpressiframe=1';	
 			$(this).attr('href',href);
 		});
 			
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
	
		
		if(settings["homepage"]) {
			var url=settings["homepage_url"];
			if(url.indexOf('?')==-1) url+='?windowpressiframe=1';
 			else url+='&windowpressiframe=1';
 			object.windowCreateNew(url);
 		}

	}

	this.beforeshutdown = function() {
  		if (windowCount>1 && settings["exit_prompt"]==1) return locale_text["exit_prompt"];	
  	}
  	
	this.shutdown = function() {
 		//close all windows properly during unload
 		if (windowCount!==0) {
 			$('#windowpress-windows').children('.windowpress-window').each(function () { 
 				object.windowCloseExecute($(this).attr('id'));
 			});
 		}	
 	}

//AJAX
//**********************************************************************************************************************



	var ajax_wait=0;
	var ajax_enqueued=0;
	var ajax_data={}
	var ajax_period=3000;
	

	this.ajaxEnqueue = function(data) {
		//enqueue data
		ajax_data=$.extend(ajax_data,data);
		
		if (ajax_wait===0) { //do request if allowed
			object.ajaxRequest();
		}
		else if (ajax_enqueued==0) { //enqueue new request, if it was not enqueued before
			ajax_enqueued=1;
			var ajax_request_timer=setTimeout(object.ajaxRequest,ajax_period);
		}
	}
	
	
	
	this.ajaxRequest = function() {
		if(ajax_wait===0 && $.isEmptyObject(ajax_data)==false) {
			ajax_wait=1;
			ajax_enqueued=0;
			
			var post={ 
				"action": 'windowpress_ajax', 
				"data" : ajax_data, 
			};

			$.post(WindowPress_Data.ajax_url, post);
			
			ajax_data={}; //empty data object
			var timer=setTimeout(function() { ajax_wait=0; },ajax_period);
		}
		
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
		taskbar_width=$('#wpadminbar').width()-$('#wp-admin-bar-root-default').width()-top_controls_width-1; //minus 1, to fix overflow issue on Windows
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
		taskbar_cache[0]=taskbar_cache.indexOf(elementId);
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
			taskbar_cache[0]=taskbar_cache.indexOf(elementId);
		}
		else taskbar_cache[0]=0; //no window is active
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
	
 	var taskbarScroll_skip=0;
 	
  
 	this.taskbarScroll = function(event) {
 		
 		var position;
  		
 		if (taskbar_cache[0]===0 ) {
 			position=windowCount;
  		}
  		else { 
  			if( event.originalEvent.detail > 0 || event.originalEvent.wheelDelta < 0 ) { //scroll down
 				position=taskbar_cache[0]-1;
  			} 
  			else { //scroll up
 				position=taskbar_cache[0]+1;
  			}
  		}
  		
 		if (!(position > 0 && position <= windowCount)) return;
 		 			
 		if (taskbarScroll_skip==0 ) {
 			object.windowOnTop($('#'+taskbar_cache[position]));
 			taskbarScroll_skip=1;
 			var timer=setTimeout(function() { 
 				taskbarScroll_skip=0; 
 				object.windowOnTop($('#'+taskbar_cache[taskbar_cache[0]]));
 				},60);
  		}
 		else taskbar_cache[0]=position;			
 	}
 	
 	this.taskbarCacheRearrange = function() {
 		var active_button_id=taskbar_cache[taskbar_cache[0]];
 		var k=1;
 		$('#windowpress-taskbar > li').each(function() {
 			taskbar_cache[k]=$(this).attr('id').slice(0, - 1);
 			k++;
 		});
 		taskbar_cache[0]=taskbar_cache.indexOf(active_button_id); 		
 	}


 	
 	//called by windowCreateNew, after windowCount++
 	this.taskbarCacheAppend = function(elementId) {
 		taskbar_cache[0]=windowCount;
		taskbar_cache[windowCount]=elementId;
 	}
 		
 	//called by windowCloseExecute, must run before windowCount--
 	this.taskbarCacheRemove = function(elementId) {
 		var deleted=0;
 		for (var k=1; k<=windowCount; k++) {			
 			if (deleted) taskbar_cache[k-1]=taskbar_cache[k];
 			else if (taskbar_cache[k]===elementId) deleted=1;
 		}
 		delete taskbar_cache[windowCount];
 		//taskbar_cache[0] will be updated by taskbarRefresh()	
  	}
	
	
	
	
	
	
//WINDOW CREATE, CLOSE, HANDLING LINKS
//**********************************************************************************************************************

	this.anchorMouseDownHandler = function(e) {	//for parent and iframes anchors
		if (e.which===1 || is_touch) {
			link_click=true;
			var anchor=this;
			link_mouseholdTimeout = setTimeout(function() {
				object.windowInit(anchor.href);
				link_click=false;
			},settings["mousehold_duration"]);
		
			return false;
		}
	}
	
	this.anchorMouseUpHandler = function(e) { //for parent anchors only
		if (e.which===1 || is_touch) {
			if(link_click) object.windowChangeLocation(this.href);
			clearTimeout(link_mouseholdTimeout);
			return false;
		}
	}
	
	//in iframes links must be fired from click event, otherwise anchors that have custom events will behave unexpectedly
	
	this.anchorMouseUpHandlerIframe = function(e) { //for iframe anchors only
		if (e.which===1 || is_touch) {
			clearTimeout(link_mouseholdTimeout);
			return false;
		}
	}
	
	this.anchorClickHandlerIframe = function(e) { //for iframe anchors only
		if (e.which===1 || is_touch) {
			if(link_click) object.windowChangeLocation(this.href);
			return false;
		}
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


	this.windowChangeLocation = function(url, elementId, refreshIfDuplicate) { 
	//runs when clicking an anchor when a window is open and not hidden or on click inside iframe
	
	
		if(typeof elementId === 'undefined') elementId=object.getTopWindow();
		
		if(typeof refreshIfDuplicate === 'undefined') refreshIfDuplicate=0;


		//create new window, if there's no active window
		if (elementId===0) { object.windowInit(url, refreshIfDuplicate); return 0; }
		
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
		
		//Set loading... title
		object.windowSetTitle(elementId,locale_text["loading"]);

		//change location of current window
		 $('#'+elementId).find('iframe').get(0).contentWindow.location=url;

	}


	this.windowInit = function(url, refreshIfDuplicate) { //runs when holding on an anchor or clicking an anchor when there are no windows open
		
		if(typeof refreshIfDuplicate === 'undefined') refreshIfDuplicate=0;

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
				if (refreshIfDuplicate) WindowPress.windowRefresh($(this).attr('id'));
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
		element+='<button type="button" class="button_close">'+WindowPress_Data.svgIcons["close"]+'</button>';
		element+='</div>';

		element+='<div class="window_title" style="width:'+settings["window_title_width"]+'px;">'+locale_text["loading"]+'</div>';

		element+='<div class="window_buttons_left">';
		element+='<button type="button" class="button_goback" disabled>'+WindowPress_Data.svgIcons["arrow_left"]+'</button>';
		element+='<button type="button" class="button_goforward" disabled>'+WindowPress_Data.svgIcons["arrow_right"]+'</button>';
		element+='<button type="button" class="button_refresh">'+WindowPress_Data.svgIcons["refresh"]+'</button>';
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
		element+='<div class="iframe_wrapper"><iframe src="" class="'+tempClass+'" name="windowpress_iframe" iframe_id="windowpress-window'+windowNum+'"></frame></div>';
		element+='</div>';
		$('#windowpress-windows').append(element);
		
		var $element=$('#'+elementId);

		//top controls
		var controlsId=elementId+'c';
		var top_controls='<div id="'+controlsId+'" class="maximized_top" >'+controls+'</div>';
		$('#windowpress-maximized_tops').append(top_controls);

		//create new taskbar element
		var taskbarItemId=elementId+'t';
		var taskbarItem='<li id="'+taskbarItemId+'" class="taskbar" style="width:'+taskbar_button_width+'px;"><button type="button" class="taskbar ui-sortable-handle">'+locale_text["loading"]+'</button><button class="close">'+WindowPress_Data.svgIcons["close2"]+'</button></li>';
		$('#windowpress-taskbar').append(taskbarItem);	
 		object.taskbarCacheAppend(elementId);

		object.windowOnTop($element);
			
		$element.find('iframe').get(0).contentWindow.location = url;

	}


	this.windowClose = function($element) {
		//WordPress cant tell if iframe is being detached, but it can detect changes to contentWindow.location
		//iframe location is directed to about:blank, WordPress detects an attempt to navigate away
		// when iframe location happens to be about:blank, iframeReload() calls windowCloseExecute()

		var elementId=$element.attr('id');
		var $iframe=$element.find('iframe');

		//change iframe location to tell WordPress that user navigates away from this page
		$iframe.get(0).contentWindow.location.href='about:blank';
		
		
		var timer=setTimeout(function() {
			if ($iframe.get(0).contentWindow.location.href=='about:blank') object.windowCloseExecute(elementId);
		},30);
		
		//second timer, just in case about:blank fails to load in 30ms
		var timer2=setTimeout(function() {
			if ($('#'+elementId).length && $iframe.get(0).contentWindow.location.href=='about:blank') object.windowCloseExecute(elementId);
		},150);
	}


	this.windowCloseExecute = function(elementId) {
		
		object.taskbarCacheRemove(elementId);
		windowCount--;
		object.taskbarOverflowAgent();

		var $element=$('#'+elementId);
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
		
		//Set loading... title
		object.windowSetTitle(elementId,locale_text["loading"]);
		
		var $iframe=$element.find('iframe');
		$iframe.get(0).contentWindow.location=newSrc;
	}
	
	this.windowGoForward = function ($element) {

		var elementId=$element.attr('id');

		//get new src
		var numericId=parseInt(elementId.replace('windowpress-window',''));
		var k=parseInt(iframeHistory[numericId][0]);
		var newSrc=iframeHistory[numericId][k+1];
		
		//Set loading... title
		object.windowSetTitle(elementId,locale_text["loading"]);

		var $iframe=$element.find('iframe');
		$iframe.get(0).contentWindow.location=newSrc;
	}

	this.windowRefresh = function (elementId) { 	
		
		//Set loading... title
		object.windowSetTitle(elementId,locale_text["loading"]);
		
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
	

	this.iframeLoad = function(elementId,title,extra_link,extra_link_type) {
	
	
		var $iframe=$('#'+elementId+' iframe');
		
		var newSrc=$iframe.get(0).contentWindow.location.href;
		
		var $element=$('#'+elementId); //window element
		var numericId=parseInt(elementId.replace('windowpress-window',''));
		var history=iframeHistory[numericId];


		//set window title
		object.windowSetTitle(elementId,title);
		
		$iframe.removeClass(); //remove temporary id class
		
		//disable prev/next buttons if not already
		$('#'+elementId+'c .button_goback').prop('disabled', true);
		$('#'+elementId+'c .button_goforward').prop('disabled', true);
		
		
		//add edit/view button
		$element.find('.button_extra').remove();
		$('#'+elementId+'c').find('.button_extra').remove();
		
		if (extra_link_type!=0) {
			$('#'+elementId+'c').find('.button_refresh').addClass('button_refresh-autohide');
			
			if(extra_link_type=='view') {
				var $view_button='<a href="'+extra_link+'" class="button_extra button_view">'+WindowPress_Data.svgIcons["view"]+'</a>';
				$('#'+elementId+'c').children('.window_buttons_left').prepend($view_button);
			}
			else if (extra_link_type=='edit') {
				var $edit_button='<a href="'+extra_link+'" class="button_extra button_edit">'+WindowPress_Data.svgIcons["edit"]+'</a>';
				$('#'+elementId+'c').children('.window_buttons_left').prepend($edit_button);
			}
			
			
		}
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

	}

	
	
	
	
	
	
//INTERFACE
//******************************************************************************************************************
	
//sidebar
	
	this.sidebarSlideEnable = function() {
		settings["sidebar_slide"]=1;
 		$('#windowpress-menuslide_toggle span').html(locale_text["disable_menuslide"]);
 		$('#windowpress-menuslide_toggle > div').html(WindowPress_Data.svgIcons["menu_slide_disable"]);
		$('#adminmenuwrap').addClass('windowpress-menu-slide');
		$('#adminmenuback').addClass('windowpress-menu-slide');
		//remove additional classes if any
		$('.windowpress-window').removeClass().addClass('windowpress-window');
		//set correct maximized window class
		$('.windowpress-window').addClass('windowpress-window-'+object.getMaximizedClass());
			
	}
		
	this.sidebarSlideDisable = function() {
		
		settings["sidebar_slide"]=0;
		$('#windowpress-menuslide_toggle span').html(locale_text["enable_menuslide"]);
 		$('#windowpress-menuslide_toggle > div').html(WindowPress_Data.svgIcons["menu_slide_enable"]);
		$('#adminmenuwrap').removeClass('windowpress-menu-slide');
		$('#adminmenuback').removeClass('windowpress-menu-slide');
		//remove additional classes if any
		$('.windowpress-window').removeClass().addClass('windowpress-window');
		//set correct maximized window class
		$('.windowpress-window').addClass('windowpress-window-'+object.getMaximizedClass());
! 		$('#adminmenuwrap').css({left:"0px",paddingRight:"0px"});			
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
	if (is_desktop) {
 		$('#wpwrap').on('mouseenter', '#adminmenuwrap.windowpress-menu-slide', function() { $('#adminmenuwrap').stop(true, false).animate({left: "0px", paddingRight: "0px"},settings["sidebar_slide_duration"]); });
 		$('#wpwrap').on('mouseleave', '#adminmenuwrap.windowpress-menu-slide', function() { $('#adminmenuwrap').stop(true, false).animate({left: sidebar_slide_position, paddingRight: "5px"},settings["sidebar_slide_duration"]); });
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

	if (is_touch) { 
		$("body").on("contextmenu", anchor_selector, function(e) { return false; });
	}


	$("body").on('mousedown', anchor_selector, object.anchorMouseDownHandler);
	
	$("body").on('mouseup', anchor_selector, object.anchorMouseUpHandler);

	$("body").on("click", "a[href!='#']:not("+anchor_exceptions+")", function() {  return false;  });
	
	$("body").on("click", "#wp-admin-bar-my-sites a", function() {  object.openNewTab(this.href); return false;  });



//TASKBAR BUTTONS

	var taskbar_click_event='click';
	
	var taskbarClickTimeout;


	if (is_desktop) {
		
		taskbar_click_event='mousedown';
	
		$('#windowpress-taskbar').on( "sortstart", function( event, ui ) { 
		
			clearTimeout(taskbarClickTimeout);
			var $li=ui.item;
		
			if (!$li.hasClass('taskbar_active')) {
				var button=$li.children('button.taskbar').get(0);
				object.taskbarClick(button);
			}
	
		} );
		$('#windowpress-taskbar').on( "sortstop", function( event, ui ) { object.taskbarCacheRearrange(); });
	
		//scroll between windows
		$('#windowpress-taskbar').on( 'DOMMouseScroll mousewheel', object.taskbarScroll);
	
	}

	$('#windowpress-taskbar').on(taskbar_click_event, 'button.taskbar', function(e) { 
 		if (e.which===1 || is_touch) { 	//if lmb or touch
			var button=this;
			taskbarClickTimeout=setTimeout(function() { object.taskbarClick(button); },100);
		}
		else if (e.which===2) { //if middle mouse button
 			var elementId=$(this).parent().attr('id').slice(0, - 1);
 			var $element=$('#'+elementId);
 			object.windowClose($element);
 		}
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
	
	$(window).on('beforeunload',object.beforeshutdown);
	
 	$(window).on('unload',object.shutdown);


	
	}//endoffunction


};//end of class



WindowPress = new WINDOWPRESS();

WindowPress.init();


}); //endof jquery
