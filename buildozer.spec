[app]

# (str) Title of your application
title = Tic Tac Toe Xx0

# (str) Package name
package.name = tictactoe

# (str) Package domain (needed for android/ios packaging)
package.domain = org.hedmitry.xx0

# (str) Source code where the main.py lives
source.dir = .

# (list) Source files to include (let empty to include all the files)
source.include_exts = py,png,jpg,kv,atlas,json,wav,mp3

# (list) List of inclusions using pattern matching
#source.include_patterns = assets/*,images/*.png

# (str) Application versioning (method 1)
version = 1.0.0

# (list) Application requirements
# КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ:
# НЕ пишите python3==3.11.13!
# Указывайте просто python3, тогда p4a согласует python3 и hostpython3 автоматически.
requirements = python3,kivy==2.3.0,pillow

# (str) Presplash of the application
#presplash.filename = %(source.dir)s/data/presplash.png

# (str) Icon of the application
#icon.filename = %(source.dir)s/data/icon.png

# (str) Supported orientation (one of landscape, sensorLandscape, portrait or all)
orientation = portrait

# (bool) Indicate if the application should be fullscreen
fullscreen = 0

#
# Android specific
#

# (bool) If True, then skip trying to update the Android sdk
# This can be useful to avoid excess downloads or save time
android.skip_update = False

# (bool) If True, then automatically accept SDK license
# agreements. This is intended for automation only.
android.accept_sdk_license = True

# (str) The Android arch to build for, choices: armeabi-v7a, arm64-v8a, x86, x86_64
# Для ускорения сборки и поддержки 99% современных телефонов:
android.archs = arm64-v8a, armeabi-v7a

# (int) Target Android API, should be as high as possible.
android.api = 34

# (int) Minimum API your APK / AAB will support.
android.minapi = 21

# (int) Android SDK version to use
#android.sdk = 34

# (str) Android NDK version to use
android.ndk = 25b

# (str) python-for-android branch to use (стабильный релиз с гарантированным Python 3.11.5 для Kivy 2.3.0)
p4a.branch = release-2024.01.21

# (list) Permissions
android.permissions = VIBRATE

# (bool) Copy library instead of making a libpymodules.so
android.copy_libs = 1

[buildozer]

# (int) Log level (0 = error only, 1 = info, 2 = debug with command output)
log_level = 2

# (int) Display warning if buildozer is run as root (0 = False, 1 = True)
warn_on_root = 0
