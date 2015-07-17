===WindowPress - The wp-admin Desktop===
Contributors: helium-3
Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YVXX65YFACBFE
Tags: plugin, admin, page, sidebar, administration, dashboard, free, javascript, jquery, menu, mobile, navigation, performance, plugins, Post, posts, wordpress, backend, frontend
Requires at least: 3.8
Tested up to: 4.2.2
Stable tag: 1.2.1
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

The ultimate plugin for making website management faster and more efficient.

== Description ==
Are your tired of switching back and forth between frontend and backend of your website? Or maybe you sometimes end up with too many browser tabs opened. If you are looking for a plugin to speed up your website management tasks and improve your efficiency, you've come to the right place.

[youtube https://www.youtube.com/watch?v=RyluYf_MnIY]

= What's this plugin all about? =
The main goal of WindowPress is to keep everything organized and enclose all administration tasks in just one browser tab. This plugin achieves this by turning wp-admin into a desktop-like environment, in which you can open new windows with your website's internal pages. So for example in one browser tab you can view your website, customize it, add new content, manage comments, change settings etc. Clicking an adminbar or adminmenu link changes the location of the active window, which feels just like the normal WordPress administration area, however when you hold a click on a link, you will open it in a new window. Then you can easily switch between opened windows in the adminbar taskbar. 

= Admin menu sliding =
WindowPress adds a new feature to the admin menu (only for WindowPress admin area). You can hide admin menu and make it slide, so the pages in opened windows can be of full width. It can be easily turned on/off just like collapse menu feature.

= Flexibility =
WindowPress doesn't replace WordPress administration area. As you can see in the video, you can easily switch between WindowPress and traditional WordPress backend.

= Mobile support =
WindowPress works also on mobile devices, however please note that the mobile version may not work properly for you yet, as I only have one device to test it. If you find a bug please let me now in the support forum.

= Notice =
Make sure you always have the latest version of WindowPress before updating WordPress.


== Installation ==

1. Upload `windowpress` to the `/wp-content/plugins/` directory.
1. Activate the plugin through the 'Plugins' menu in WordPress.
1. Now you can access WindowPress from admin menu and adminbar.
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
5. You can have a custom background image to display when no windows are opened or all windows are minimized.

== Upgrade Notice ==

= 1.2.1 = 
Bug fix for: unable to change theme in the customizer (since v1.2)

= 1.2 =
new features: 

- set custom text to display instead of site title

- open new windows from non-panel links (by click holding)

multisite support:

- support for network wide activation

- links under menu my-sites will open in a new tab

under the hood: 

- javascript compatibility with strict mode

- wrapped the plugin in plugins_loaded hook

= 1.1 =
new feature: sortable taskbar buttons

new feature: switch between windows by scrolling the taskbar

fix: made WindowPress page content unselectable

= 1.0.1 =
design: corrected #wpcontent padding-left on admin pages

performance: removed unneeded content on admin pages

== Changelog ==

= 1.2.1 = 
Bug fix for: unable to change theme in the customizer (since v1.2)

= 1.2 =

Released: July 12 2015

new features: 

- set custom text to display instead of the site title

- open new windows from non-panel links (by click holding)

multisite support:

- support for network wide activation

- links under menu my-sites will open in a new tab

under the hood: 

- javascript compatibility with strict mode

- wrapped the plugin in plugins_loaded hook

= 1.1 =
Released: July 08 2015

new feature: sortable taskbar buttons

new feature: switch between windows by scrolling the taskbar

fix: made WindowPress page content unselectable

= 1.0.1 =
Released: June 30 2015

design: corrected padding on admin pages

performance: removed unneeded content on admin pages

= 1.0 =
Released: June 29 2015

Initial release 
