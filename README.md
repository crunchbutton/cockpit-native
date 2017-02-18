# Cockpit Native

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

## Build

In order to build that app, we need to build against specific version of web so that it can download all the necessary assets. The **build.php** contains all the information and paths about that you will need. The build target is used to download code and assets, and bundle them with the app. This way there is no need to have any external http requests other than our rest.

```sh
./build.php dev
```
or
```sh
./build.php live
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