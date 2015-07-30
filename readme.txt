===WindowPress - The WordPress Desktop===
Contributors: helium-3
Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YVXX65YFACBFE
Tags: plugin, admin, page, sidebar, administration, dashboard, free, javascript, jquery, menu, mobile, navigation, performance, plugins, Post, posts, wordpress, backend, frontend
Requires at least: 3.8
Tested up to: 4.3
Stable tag: 1.3
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Turns your wp-admin into a desktop-like environment with wallpaper and taskbar, allowing you to handle multiple pages in one browser tab.

== Description ==

= What's this plugin all about? =
WindowPress turns WordPress administration area into a desktop-like environment in which you can open new windows with your website's internal pages. So for example in one browser tab you can view your website, customize it, add new content, manage comments, change settings etc. 
Clicking any link changes the location of the active window, which feels just like the normal WordPress administration area, however when you click and hold, you will open a new window. Then you can easily switch between opened windows in the taskbar, which is located in admin bar.

= Benefits over traditional adminstration area =
* **Multitasking made easy** - We often need to do more than one thing at the time, imagine Internet browsers without tab feature. WindowPress is for WordPress, what tabs are for Internet browsers. You no longer need to open multiple tabs in your browser to manage your website, now you can have everything organized in one place - WindowPress administration area.

* **No more switching back and forth between frontend and backend** - there's no more frontend and backend, just WindowPress. You can open any internal page, whether it's your website or an admin page.

* **Frontend admin menu** You have direct access to the admin menu while viewing your front page. 

* **Static admin menu and admin bar** Admin menu and admin bar are always intact - they never reload while you are browsing, only page content changes.

* **Admin menu sliding** WindowPress adds a new feature to the admin menu (only for WindowPress admin area). You can hide admin menu and make it slide, so the pages in opened windows can be of full width. It can be easily turned on/off just like collapse menu feature.

= WindowPress doesn't replace WordPress administration area =
WindowPress is just a top level admin page. You can access it anytime you want from the admin menu and exit it any time you want. 

= Mobile support =
WindowPress also works on mobile devices. On tablets it works just like on desktops, with an exception for admin menu sliding (for obvious reasons). On smartphones it adds a menu to the right side of the screen with active windows (you can view it in the screenshots section). Currently WindowPress may not function properly on your device, but this is going to change in the future.

== Installation ==

1. Upload `windowpress` to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.
1. Now you can access WindowPress from admin menu and admin bar.
1. You can adjust settings in WindowPress -> Settings .

== Frequently Asked Questions ==

= How to open a new window? =

Simply hold a click on a link (or touch a link if it's a touch device) until a new window opens. The duration of this event can be changed in the settings (Long Press Duration).

= Does WindowPress work on multisite? =

Yes, however WindowPress currently can only handle one website admin at a time. So as a network administrator, you will have to open WindowPress for each website you want to manage (by accessing their admin areas and clicking on WindowPress). Also keep in mind that WindowPress doesn't run on multisite Network Admin.


== Screenshots ==

1. Front-end page loaded in wp-admin, along with sliding admin menu.
2. The taskbar allows you to easily switch between opened windows.
3. Full width admin pages
4. WindowPress on a smartphone
5. You can set a custom background image to display when no windows are opened or all windows are minimized.

== Changelog ==

= 1.3 =
*Release Date - 22nd July, 2015*

* Added an option to wrap third-party admin bar menus into one 'Plugins' menu.
* Fixed a bug where 'Preview Changes' button didn't trigger post autosave, causing to display post preview without the most recent changes applied.
* Preview button/view changes button on the editor page will automatically open post preview in a new window.
* Added preview button in the admin bar for drafts.
* Added a 'Preview: ' suffix to the title of post preview.
* Middle and right mouse buttons clicks won't open new windows anymore.
* Prevented admin bar overflow on mobiles in multisite installations.
* Hover highlight for menu slide button.
* WordPress 4.3 support confirmed.
* Major change in javascript structure, accounting for better memory management.
* Moved IS_WINDOWPRESS constant to the root of the plugin (previously it was defined in plugins_loaded hook).

= 1.2.1 =
*Release Date - 17th July, 2015*

* Fixed a bug where theme couldn't be changed in customizer (in version 1.2).

= 1.2 =
*Release Date - 12th July, 2015*

* Added an option to set custom text to display instead of the site title in the admin bar.
* Ability to open new windows from non-panel links (by click holding).
* Added multisite support.
* Added support for network wide activation.
* Links under menu my-sites will open in a new tab.
* Javascript compatibility with strict mode.
* Wrapped the plugin in plugins_loaded hook.

= 1.1 =
*Release Date - 8th July, 2015*

* Made taskbar buttons sortable.
* Ability to switch between windows by scrolling the taskbar.
* Made WindowPress page content unselectable.

= 1.0.1 =
*Release Date - 30th June, 2015*

* Corrected padding on admin pages
* Removed unneeded content on admin pages

= 1.0 =
*Release Date - 29th June, 2015*

* Initial release
