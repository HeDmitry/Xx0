[app]

# (str) Title of your application
title = Крестики-нолики

# (str) Package name
package.name = tictactoe

# (str) Package domain (needed for android/ios packaging)
package.domain = org.hotseat

# (str) Source code where the main.py lives
source.dir = .

# (list) Source files to include (let empty to include all the files)
source.include_exts = py,png,jpg,kv,atlas,ttf,otf,json

# (str) Application versioning (method 1)
version = 1.0.0

# (list) Application requirements
# Python 3.14 is not compatible with Kivy 2.3.0 in buildozer/python-for-android CI builds,
# so we pin a compatible CPython 3.11 for Android.
requirements = python3==3.11.13,kivy==2.3.0

# (str) Presplash of the application
#presplash.filename = %(source.dir)s/data/presplash.png

# (str) Icon of the application
#icon.filename = %(source.dir)s/data/icon.png

# (str) Supported orientation (one of landscape, sensorLandscape, portrait or all)
orientation = portrait

# (bool) Indicate if the application should be fullscreen to not
fullscreen = 0

# (list) Permissions
android.permissions = INTERNET

# (int) Target Android API, should be as high as possible.
android.api = 34

# (int) Minimum API your APK / AAB will support.
android.minapi = 21

# (str) Android NDK version to use
android.ndk = 25b

# (bool) If True, then skip trying to update the Android sdk
# This can be useful to avoid excess Internet downloads or save time
# when an update is due and you just want to test/build your package
android.skip_update = False

# (bool) If True, then automatically accept SDK license
# agreements. This is intended for automation only. If set to False,
# the default, you will be shown the license when first running
# buildozer.
android.accept_sdk_license = True

# (list) The Android architectures to build for, choices: armeabi-v7a, arm64-v8a, x86, x86_64
# In GitHub Actions build arm64-v8a and armeabi-v7a covers 99%+ of devices
android.archs = arm64-v8a, armeabi-v7a

# (bool) enables Android auto backup feature (Android API >=23)
android.allow_backup = True

[buildozer]

# (int) Log level (0 = error only, 1 = info, 2 = debug (with compiler output))
log_level = 2

# (int) Display warning if buildozer is run as root (0 = False, 1 = True)
warn_on_root = 1
