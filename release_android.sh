#!/usr/bin/env sh
cordova build android --release
rm -f platforms/android/ant-build/Cockpit.apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
-keystore cert/android/com.crunchbutton.cockpit.keystore \
-storepass ***REMOVED*** \
platforms/android/ant-build/CordovaApp-release-unsigned.apk \
com.crunchbutton.cockpit
~/android/sdk/build-tools/19.1.0/zipalign -v 4 platforms/android/ant-build/CordovaApp-release-unsigned.apk platforms/android/ant-build/Cockpit.apk
open platforms/android/ant-build/