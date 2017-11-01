# Cockpit Native
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fcrunchbutton%2Fcockpit-native.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fcrunchbutton%2Fcockpit-native?ref=badge_shield)


Cockpit Native built using Cordova and a dynamic updater. The app itself contacts the server to check version, and downloads a bundle of updated resources if it is updated. It uses Ionic only for resource generation.

There are Cockpit versions in both iOS and Android stores.

This repository is mostly for educational purposes. Though the complete source of this app works just fine!

---

## Install

```sh
npm install -g cordova ionic
cordova platform add ios
cordova platform add android
ionic resources
```

---

## Release
For iOS, use xcode for your releases. For Android, you can use the **release_android.sh** script. You will need to create an android keystore in the **cert** directory.

```sh
./release_android.sh
```

---

## Notes

Note that newer versions of Cordova require cocoapods installed. There is a pod required for the push plugin which will error out if you do not have cocoapods properly configured.

## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fcrunchbutton%2Fcockpit-native.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fcrunchbutton%2Fcockpit-native?ref=badge_large)