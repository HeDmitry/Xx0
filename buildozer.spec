[app]
# Название приложения
title = Крестики Нолики
# Только латиница/цифры
package.name = tictactoe
package.domain = org.example

source.dir = .
source.include_exts = py

# Зависимости приложения
requirements = python3,kivy

orientation = portrait
fullscreen = 0

# Android
android.api = 36
android.minapi = 23
android.ndk = 29
android.archs = arm64-v8a
android.accept_sdk_license = True
p4a.branch = develop

# Иконка не требуется: приложение соберётся и без неё.
# icon.filename = %(source.dir)s/data/icon.png

# Версия
version = 1.0.0

[buildozer]
log_level = 2
warn_on_root = 1
