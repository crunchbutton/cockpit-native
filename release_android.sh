#!/usr/bin/env sh
cordova build android --release
rm -f platforms/android/build/outputs/apk/Cockpit.apk
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
-keystore cert/android/com.crunchbutton.cockpit.keystore \
-storepass ***REMOVED*** \
platforms/android/build/outputs/apk/android-release-unsigned.apk \
com.crunchbutton.cockpit
~/android/sdk/build-tools/19.1.0/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk platforms/android/build/outputs/apk/Cockpit.apk
open platforms/android/build/outputs/apk/


#cd /Users/pererinha/Dev/cockpit-app
#./zipalign -v 4 /Users/pererinha/Dev/cockpit-app/platforms/android/build/outputs/apk/android-release-unsigned.apk /Users/pererinha/Dev/cockpit-app/platforms/android/build/outputs/apk/Cockpit.apk
#./aapt dump badging /Users/pererinha/Dev/cockpit-app/platforms/android/build/outputs/apk/Cockpit.apk