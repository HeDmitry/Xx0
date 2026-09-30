[app]

title = Крестики-нолики
package.name = tictactoe
package.domain = org.hotseat
source.dir = .
source.include_exts = py,png,jpg,kv,atlas,ttf,otf,json
version = 1.0.0

requirements = python3==3.11.13,kivy==2.3.0

orientation = portrait
fullscreen = 0
android.permissions = INTERNET
android.api = 34
android.minapi = 21
android.ndk = 25b
android.skip_update = False
android.accept_sdk_license = True
android.archs = arm64-v8a, armeabi-v7a
android.allow_backup = True

[buildozer]
log_level = 2
warn_on_root = 1
