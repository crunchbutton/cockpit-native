#!/usr/bin/env sh

#cordova create cockpit com.crunchbutton.cockpit Cockpit


phonegap create cockpit com.crunchbutton.cockpit Cockpit

phonegap local plugin add org.apache.cordova.file-transfer
phonegap local plugin add org.apache.cordova.network-information
phonegap local plugin add org.apache.cordova.media
phonegap local plugin add org.apache.cordova.vibration
phonegap local plugin add org.apache.cordova.splashscreen

phonegap local plugin add https://github.com/phonegap-build/PushPlugin
#phonegap local plugin add https://github.com/phonegap-build/StatusBarPlugin
phonegap local plugin add https://github.com/j-mcnally/cordova-statusTap
phonegap local plugin add https://github.com/bgta/net.bgta.phonegap.appversion
phonegap local plugin add https://github.com/christocracy/cordova-plugin-background-geolocation.git


#https://git-wip-us.apache.org/repos/asf/cordova-plugin-device.git

#org.apache.cordova.dialogs

#org.apache.cordova.inappbrowser




#   add to Info.plst
#
#	<key>UIStatusBarStyle</key>
#	<string>UIStatusBarStyleLightContent</string>
#	<key>UIStatusBarHidden</key>
#	<false/>
#	<key>UIViewControllerBasedStatusBarAppearance</key>
#	<false/>
#


# change launch screen file in xcode to MainViewController