[app]

# (string) Title of your application
title = Крестики-Нолики

# (string) Package name
package.name = tictactoe

# (string) Package domain (needed for android packaging)
package.domain = org.game

# (string) Source code where the main.py lives
source.dir = .

# (list) Source files to include (let empty to include all the files)
source.include_exts = py,png,jpg,kv,atlas,ttf

# (string) Application versioning
version = 1.0.0

# (list) Application requirements
# comma separated e.g. requirements = sqlite3,kivy
requirements = python3,kivy==2.3.0

# -----------------------------------------------------------------
# КРИТИЧЕСКИЕ НАСТРОЙКИ ДЛЯ КОРРЕКТНОГО РАСТЯГИВАНИЯ НА ANDROID:
# -----------------------------------------------------------------

# (string) Supported orientation (one of landscape, sensorLandscape, portrait or all)
# Для вертикальной игры обязательно задавать строго portrait!
orientation = portrait

# (bool) Indicate whether the screen should be kept on
# 0 = normal, 1 = keep screen on
keep_screen_on = 1

# (int) Fullscreen mode
# 0 = показывать стандартный статус-бар Android (рекомендуется для избежания багов viewport)
# 1 = полноэкранный режим
fullscreen = 0

# (list) Permissions
android.permissions = INTERNET

# (int) Android API to target
android.api = 33

# (int) Minimum API required
android.minapi = 21

# (int) Android NDK API to use
android.ndk_api = 21

# (bool) If True, then skip trying to update the Android SDK
android.skip_update = False

# (bool) If True, then automatically accept SDK license
android.accept_sdk_license = True

# (list) The Android archs to build for
android.archs = arm64-v8a, armeabi-v7a

# (list) Android application meta-data to set (key=value format)
# ВАЖНО: max_aspect позволяет приложению занимать экран современных телефонов (19.5:9, 20:9)
android.meta_data = android.max_aspect=2.4, android.resizeableActivity=true

# (bool) Android allow backup
android.allow_backup = True

# -----------------------------------------------------------------
[buildozer]

# (int) Log level (0 = error only, 1 = info, 2 = debug with command output)
log_level = 2

# (int) Display warning if buildozer is run as root (0 = False, 1 = True)
warn_on_root = 1

# (int) Display warning if buildozer is run as root (0 = False, 1 = True)
warn_on_root = 0
