#!/usr/bin/env sh

#cordova create cockpit com.crunchbutton.cockpit Cockpit


phonegap create cockpit2 com.crunchbutton.cockpit Cockpit
cd cockpit2

#phonegap local plugin add org.apache.cordova.file-transfer
#phonegap local plugin add org.apache.cordova.network-information
#phonegap local plugin add org.apache.cordova.media
#phonegap local plugin add org.apache.cordova.vibration
#phonegap local plugin add org.apache.cordova.splashscreen


phonegap plugin add https://github.com/apache/cordova-plugin-geolocation
phonegap plugin add https://github.com/apache/cordova-plugin-file
phonegap plugin add https://github.com/apache/cordova-plugin-file-transfer
phonegap plugin add https://github.com/apache/cordova-plugin-network-information
phonegap plugin add https://github.com/apache/cordova-plugin-media
phonegap plugin add https://github.com/apache/cordova-plugin-splashscreen
phonegap plugin add https://github.com/apache/cordova-plugin-vibration
phonegap plugin add https://github.com/apache/cordova-plugin-dialogs
phonegap plugin add https://github.com/apache/cordova-plugin-inappbrowser
phonegap plugin add https://github.com/apache/cordova-plugin-device



#phonegap plugin add https://github.com/arzynik/PushPlugin
#phonegap local plugin add https://github.com/phonegap-build/PushPlugin
phonegap plugin add https://github.com/phonegap/phonegap-plugin-push
phonegap plugin add https://github.com/apache/cordova-plugin-statusbar
phonegap plugin add https://github.com/bgta/net.bgta.phonegap.appversion
# phonegap plugin add https://github.com/christocracy/cordova-plugin-background-geolocation.git
phonegap plugin add cordova-plugin-mauron85-background-geolocation
phonegap plugin add https://github.com/crosswalk-project/cordova-plugin-crosswalk-webview

# AppAvailability - #6355
cordova plugin add https://github.com/ohh2ahh/AppAvailability.git

#https://git-wip-us.apache.org/repos/asf/cordova-plugin-device.git

#org.apache.cordova.dialogs



phonegap build ios




#   add to Info.plst
#
#	<key>UIStatusBarStyle</key>
#	<string>UIStatusBarStyleLightContent</string>
#	<key>UIStatusBarHidden</key>
#	<false/>
#	<key>UIViewControllerBasedStatusBarAppearance</key>
#	<false/>
# <key>NSAppTransportSecurity</key> // http://stackoverflow.com/questions/32631184/the-resource-could-not-be-loaded-because-the-app-transport-security-policy-requi
#		<Dictionary>
# 		<key>NSAllowsArbitraryLoads</key>
# 		<yes/>

# change launch screen file in xcode to MainViewController