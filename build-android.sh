#!/bin/sh
cordova build android --release
rm -f platforms/android/out/Cockpit.apk
zipalign -v 4 platforms/android/out/Cockpit-release-unaligned.apk platforms/android/out/Cockpit.apk
open platforms/android/out/
