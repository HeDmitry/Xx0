export interface ProjectFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const MAIN_PY_CODE = `"""
Крестики-Нолики Hotseat (на двоих на одном устройстве)
Разработано на Python + Kivy для Android и Desktop.
Современный темный неоновый интерфейс, плавная анимация ходов,
подсчет очков и экран победы/ничьей.
"""

from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.graphics import Color, RoundedRectangle, Line
from kivy.core.window import Window
from kivy.metrics import dp, sp
from kivy.animation import Animation
from kivy.clock import Clock

# Настройки окна для тестирования на ПК (вертикальная ориентация как на смартфоне)
Window.size = (390, 720)
Window.clearcolor = (0.05, 0.08, 0.14, 1.0)  # Глубокий темный фон (#0D1424)

# Цветовая палитра игры
COLOR_BG = (0.05, 0.08, 0.14, 1.0)
COLOR_PANEL = (0.09, 0.13, 0.22, 1.0)
COLOR_PANEL_BORDER = (0.16, 0.23, 0.36, 1.0)
COLOR_CELL_BG = (0.11, 0.16, 0.28, 1.0)
COLOR_X = (0.0, 0.94, 1.0, 1.0)          # Неоновый циановый (#00F0FF)
COLOR_O = (1.0, 0.18, 0.52, 1.0)         # Неоновый розово-коралловый (#FF2E84)
COLOR_TEXT_MUTED = (0.58, 0.65, 0.77, 1.0)
COLOR_TEXT_LIGHT = (0.95, 0.97, 1.0, 1.0)


class NeonCell(Button):
    """Интерактивная клетка игрового поля с анимацией масштабирования и подсветкой."""
    
    def __init__(self, index, on_cell_click, **kwargs):
        super().__init__(**kwargs)
        self.index = index
        self.on_cell_click = on_cell_click
        self.symbol = ""
        self.is_winning = False
        self.background_color = (0, 0, 0, 0)
        self.font_size = sp(46)
        self.bold = True
        self.markup = True

        self.bind(pos=self.update_canvas, size=self.update_canvas)
        self.update_canvas()

    def update_canvas(self, *args):
        self.canvas.before.clear()
        with self.canvas.before:
            if self.is_winning:
                Color(0.1, 0.45, 0.3, 0.65)
            else:
                Color(*COLOR_CELL_BG)
            RoundedRectangle(pos=self.pos, size=self.size, radius=[dp(16)])

            if self.is_winning:
                Color(0.2, 0.9, 0.5, 0.9)
                Line(rounded_rectangle=(self.pos[0], self.pos[1], self.size[0], self.size[1], dp(16)), width=dp(2.2))
            else:
                Color(*COLOR_PANEL_BORDER)
                Line(rounded_rectangle=(self.pos[0], self.pos[1], self.size[0], self.size[1], dp(16)), width=dp(1.2))

    def on_press(self):
        self.on_cell_click(self)

    def set_mark(self, symbol):
        """Установка символа X или O с эффектом плавной анимации."""
        self.symbol = symbol
        color_hex = "00F0FF" if symbol == "X" else "FF2E84"
        self.text = f"[color={color_hex}]{symbol}[/color]"
        
        self.font_size = sp(18)
        anim = Animation(font_size=sp(50), duration=0.15, t='out_back') + \\
               Animation(font_size=sp(46), duration=0.1, t='in_out_quad')
        anim.start(self)

    def highlight_win(self):
        """Подсветка победной ячейки пульсирующей анимацией."""
        self.is_winning = True
        self.update_canvas()
        anim = Animation(font_size=sp(54), duration=0.2) + Animation(font_size=sp(46), duration=0.2)
        anim.repeat = True
        anim.start(self)

    def reset(self):
        """Очистка ячейки."""
        Animation.stop_all(self)
        self.symbol = ""
        self.text = ""
        self.is_winning = False
        self.font_size = sp(46)
        self.update_canvas()


class ResultOverlay(FloatLayout):
    """Стильное всплывающее модальное окно победы или ничьей."""

    def __init__(self, title_text, subtitle_text, symbol, on_rematch, on_close, **kwargs):
        super().__init__(**kwargs)
        self.on_rematch = on_rematch
        self.on_close = on_close

        with self.canvas.before:
            Color(0.02, 0.04, 0.08, 0.82)
            RoundedRectangle(pos=(0, 0), size=Window.size)

        card = BoxLayout(
            orientation='vertical',
            padding=[dp(24), dp(28), dp(24), dp(24)],
            spacing=dp(16),
            size_hint=(0.86, None),
            height=dp(290),
            pos_hint={'center_x': 0.5, 'center_y': 0.5}
        )

        def update_card_bg(*_):
            card.canvas.before.clear()
            with card.canvas.before:
                Color(0.09, 0.13, 0.22, 0.98)
                RoundedRectangle(pos=card.pos, size=card.size, radius=[dp(24)])
                if symbol == "X":
                    Color(0.0, 0.94, 1.0, 0.5)
                elif symbol == "O":
                    Color(1.0, 0.18, 0.52, 0.5)
                else:
                    Color(0.5, 0.6, 0.7, 0.4)
                Line(rounded_rectangle=(card.pos[0], card.pos[1], card.size[0], card.size[1], dp(24)), width=dp(2.0))

        card.bind(pos=update_card_bg, size=update_card_bg)

        lbl_title = Label(
            text=title_text,
            font_size=sp(22),
            bold=True,
            color=COLOR_TEXT_LIGHT,
            size_hint_y=None,
            height=dp(34)
        )
        card.add_widget(lbl_title)

        lbl_subtitle = Label(
            text=subtitle_text,
            font_size=sp(16),
            color=COLOR_X if symbol == "X" else (COLOR_O if symbol == "O" else COLOR_TEXT_MUTED),
            bold=True,
            size_hint_y=None,
            height=dp(30)
        )
        card.add_widget(lbl_subtitle)

        lbl_hint = Label(
            text="Сыграем ещё один раунд?",
            font_size=sp(13),
            color=COLOR_TEXT_MUTED,
            size_hint_y=None,
            height=dp(26)
        )
        card.add_widget(lbl_hint)

        btn_rematch = Button(
            text="СЛЕДУЮЩИЙ РАУНД",
            font_size=sp(15),
            bold=True,
            size_hint_y=None,
            height=dp(50),
            background_color=(0, 0, 0, 0),
            color=(0.05, 0.08, 0.14, 1.0)
        )

        def update_btn_rematch(*_):
            btn_rematch.canvas.before.clear()
            with btn_rematch.canvas.before:
                if symbol == "X":
                    Color(*COLOR_X)
                elif symbol == "O":
                    Color(*COLOR_O)
                else:
                    Color(0.2, 0.78, 0.95, 1.0)
                RoundedRectangle(pos=btn_rematch.pos, size=btn_rematch.size, radius=[dp(14)])

        btn_rematch.bind(pos=update_btn_rematch, size=update_btn_rematch)
        btn_rematch.bind(on_release=lambda _: self.on_rematch())
        card.add_widget(btn_rematch)

        self.add_widget(card)


class TicTacToeApp(App):
    """Главный класс приложения Kivy."""

    def build(self):
        self.title = "Крестики-Нолики Hotseat"
        self.current_player = "X"
        self.board = [""] * 9
        self.game_over = False
        self.score_x = 0
        self.score_o = 0
        self.score_draws = 0
        self.round_number = 1
        self.overlay = None

        self.WIN_LINES = [
            (0, 1, 2), (3, 4, 5), (6, 7, 8),
            (0, 3, 6), (1, 4, 7), (2, 5, 8),
            (0, 4, 8), (2, 4, 6)
        ]

        self.root_layout = FloatLayout()
        main_box = BoxLayout(
            orientation='vertical',
            padding=[dp(20), dp(24), dp(20), dp(20)],
            spacing=dp(16),
            size_hint=(1, 1)
        )

        # 1. Шапка
        header_box = BoxLayout(orientation='horizontal', size_hint_y=None, height=dp(38))
        lbl_app_name = Label(
            text="КРЕСТИКИ-НОЛИКИ",
            font_size=sp(17),
            bold=True,
            color=COLOR_TEXT_LIGHT,
            halign='left',
            valign='middle'
        )
        lbl_app_name.bind(size=lbl_app_name.setter('text_size'))
        
        self.lbl_round = Label(
            text=f"Раунд {self.round_number}",
            font_size=sp(13),
            color=COLOR_TEXT_MUTED,
            halign='right',
            valign='middle'
        )
        self.lbl_round.bind(size=self.lbl_round.setter('text_size'))
        header_box.add_widget(lbl_app_name)
        header_box.add_widget(self.lbl_round)
        main_box.add_widget(header_box)

        # 2. Панель счёта
        score_panel = BoxLayout(
            orientation='horizontal',
            size_hint_y=None,
            height=dp(86),
            padding=[dp(12), dp(10), dp(12), dp(10)],
            spacing=dp(8)
        )
        def update_score_bg(*_):
            score_panel.canvas.before.clear()
            with score_panel.canvas.before:
                Color(*COLOR_PANEL)
                RoundedRectangle(pos=score_panel.pos, size=score_panel.size, radius=[dp(18)])
                Color(*COLOR_PANEL_BORDER)
                Line(rounded_rectangle=(score_panel.pos[0], score_panel.pos[1], score_panel.size[0], score_panel.size[1], dp(18)), width=dp(1))

        score_panel.bind(pos=update_score_bg, size=update_score_bg)

        box_x = BoxLayout(orientation='vertical', spacing=dp(2))
        lbl_p1_title = Label(text="Игрок 1 (X)", font_size=sp(12), color=COLOR_X, bold=True)
        self.lbl_score_x = Label(text="0", font_size=sp(26), color=COLOR_TEXT_LIGHT, bold=True)
        box_x.add_widget(lbl_p1_title)
        box_x.add_widget(self.lbl_score_x)

        box_draw = BoxLayout(orientation='vertical', spacing=dp(2), size_hint_x=0.6)
        lbl_draw_title = Label(text="Ничьи", font_size=sp(11), color=COLOR_TEXT_MUTED)
        self.lbl_score_draw = Label(text="0", font_size=sp(22), color=COLOR_TEXT_MUTED, bold=True)
        box_draw.add_widget(lbl_draw_title)
        box_draw.add_widget(self.lbl_score_draw)

        box_o = BoxLayout(orientation='vertical', spacing=dp(2))
        lbl_p2_title = Label(text="Игрок 2 (O)", font_size=sp(12), color=COLOR_O, bold=True)
        self.lbl_score_o = Label(text="0", font_size=sp(26), color=COLOR_TEXT_LIGHT, bold=True)
        box_o.add_widget(lbl_p2_title)
        box_o.add_widget(self.lbl_score_o)

        score_panel.add_widget(box_x)
        score_panel.add_widget(box_draw)
        score_panel.add_widget(box_o)
        main_box.add_widget(score_panel)

        # 3. Индикатор очереди
        self.turn_panel = BoxLayout(
            orientation='horizontal',
            size_hint_y=None,
            height=dp(52),
            padding=[dp(16), dp(8), dp(16), dp(8)]
        )
        def update_turn_bg(*_):
            self.turn_panel.canvas.before.clear()
            with self.turn_panel.canvas.before:
                Color(0.08, 0.12, 0.20, 1.0)
                RoundedRectangle(pos=self.turn_panel.pos, size=self.turn_panel.size, radius=[dp(14)])

        self.turn_panel.bind(pos=update_turn_bg, size=update_turn_bg)
        self.lbl_turn = Label(
            text="Очередь: [color=00F0FF][b]Игрок 1 (X)[/b][/color]",
            markup=True,
            font_size=sp(15),
            color=COLOR_TEXT_LIGHT
        )
        self.turn_panel.add_widget(self.lbl_turn)
        main_box.add_widget(self.turn_panel)

        # 4. Поле 3х3
        board_container = FloatLayout(size_hint=(1, 1))
        self.grid = GridLayout(
            cols=3,
            rows=3,
            spacing=dp(10),
            size_hint=(None, None),
            pos_hint={'center_x': 0.5, 'center_y': 0.5}
        )

        def resize_grid(*_):
            avail_w = board_container.width
            avail_h = board_container.height
            side = min(avail_w, avail_h, dp(340))
            self.grid.size = (side, side)

        board_container.bind(size=resize_grid)
        Clock.schedule_once(resize_grid, 0.05)

        self.cells = []
        for i in range(9):
            cell = NeonCell(index=i, on_cell_click=self.handle_cell_click)
            self.cells.append(cell)
            self.grid.add_widget(cell)

        board_container.add_widget(self.grid)
        main_box.add_widget(board_container)

        # 5. Кнопки управления
        bottom_box = BoxLayout(
            orientation='horizontal',
            size_hint_y=None,
            height=dp(48),
            spacing=dp(12)
        )

        btn_restart = Button(
            text="НОВАЯ ИГРА",
            font_size=sp(13),
            bold=True,
            background_color=(0, 0, 0, 0),
            color=COLOR_TEXT_LIGHT
        )
        def update_btn_restart(*_):
            btn_restart.canvas.before.clear()
            with btn_restart.canvas.before:
                Color(*COLOR_PANEL)
                RoundedRectangle(pos=btn_restart.pos, size=btn_restart.size, radius=[dp(12)])
                Color(*COLOR_PANEL_BORDER)
                Line(rounded_rectangle=(btn_restart.pos[0], btn_restart.pos[1], btn_restart.size[0], btn_restart.size[1], dp(12)), width=dp(1))

        btn_restart.bind(pos=update_btn_restart, size=update_btn_restart)
        btn_restart.bind(on_release=lambda _: self.new_game_round())

        btn_reset_score = Button(
            text="СБРОС СЧЁТА",
            font_size=sp(13),
            bold=True,
            background_color=(0, 0, 0, 0),
            color=COLOR_TEXT_MUTED
        )
        def update_btn_reset(*_):
            btn_reset_score.canvas.before.clear()
            with btn_reset_score.canvas.before:
                Color(0.12, 0.08, 0.12, 1.0)
                RoundedRectangle(pos=btn_reset_score.pos, size=btn_reset_score.size, radius=[dp(12)])
                Color(0.35, 0.18, 0.25, 0.8)
                Line(rounded_rectangle=(btn_reset_score.pos[0], btn_reset_score.pos[1], btn_reset_score.size[0], btn_reset_score.size[1], dp(12)), width=dp(1))

        btn_reset_score.bind(pos=update_btn_reset, size=update_btn_reset)
        btn_reset_score.bind(on_release=lambda _: self.reset_all_scores())

        bottom_box.add_widget(btn_restart)
        bottom_box.add_widget(btn_reset_score)
        main_box.add_widget(bottom_box)

        self.root_layout.add_widget(main_box)
        return self.root_layout

    def handle_cell_click(self, cell):
        if self.game_over or self.board[cell.index] != "":
            return

        symbol = self.current_player
        self.board[cell.index] = symbol
        cell.set_mark(symbol)

        winner_combo = self.check_winner(symbol)
        if winner_combo:
            self.game_over = True
            for idx in winner_combo:
                self.cells[idx].highlight_win()

            if symbol == "X":
                self.score_x += 1
                self.lbl_score_x.text = str(self.score_x)
                title = "ПОБЕДА!"
                sub = "Игрок 1 (X) победил!"
            else:
                self.score_o += 1
                self.lbl_score_o.text = str(self.score_o)
                title = "ПОБЕДА!"
                sub = "Игрок 2 (O) победил!"

            self.lbl_turn.text = "[color=22C55E][b]Партия завершена![/b][/color]"
            Clock.schedule_once(lambda dt: self.show_result_overlay(title, sub, symbol), 0.35)
            return

        if "" not in self.board:
            self.game_over = True
            self.score_draws += 1
            self.lbl_score_draw.text = str(self.score_draws)
            self.lbl_turn.text = "[color=94A3B8][b]Ничья в раунде[/b][/color]"
            Clock.schedule_once(lambda dt: self.show_result_overlay("НИЧЬЯ!", "Победителя нет", "D"), 0.35)
            return

        if self.current_player == "X":
            self.current_player = "O"
            self.lbl_turn.text = "Очередь: [color=FF2E84][b]Игрок 2 (O)[/b][/color]"
        else:
            self.current_player = "X"
            self.lbl_turn.text = "Очередь: [color=00F0FF][b]Игрок 1 (X)[/b][/color]"

    def check_winner(self, player):
        for combo in self.WIN_LINES:
            if (self.board[combo[0]] == player and
                self.board[combo[1]] == player and
                self.board[combo[2]] == player):
                return combo
        return None

    def show_result_overlay(self, title, subtitle, symbol):
        if self.overlay:
            self.root_layout.remove_widget(self.overlay)
        self.overlay = ResultOverlay(
            title_text=title,
            subtitle_text=subtitle,
            symbol=symbol,
            on_rematch=self.new_game_round,
            on_close=self.dismiss_overlay
        )
        self.root_layout.add_widget(self.overlay)

    def dismiss_overlay(self):
        if self.overlay:
            self.root_layout.remove_widget(self.overlay)
            self.overlay = None

    def new_game_round(self):
        self.dismiss_overlay()
        self.board = [""] * 9
        self.game_over = False
        self.round_number += 1
        self.lbl_round.text = f"Раунд {self.round_number}"
        self.current_player = "X" if (self.round_number % 2 != 0) else "O"
        if self.current_player == "X":
            self.lbl_turn.text = "Очередь: [color=00F0FF][b]Игрок 1 (X)[/b][/color]"
        else:
            self.lbl_turn.text = "Очередь: [color=FF2E84][b]Игрок 2 (O)[/b][/color]"
        for cell in self.cells:
            cell.reset()

    def reset_all_scores(self):
        self.score_x = 0
        self.score_o = 0
        self.score_draws = 0
        self.round_number = 0
        self.lbl_score_x.text = "0"
        self.lbl_score_o.text = "0"
        self.lbl_score_draw.text = "0"
        self.new_game_round()


if __name__ == '__main__':
    TicTacToeApp().run()
`;

export const BUILDOZER_SPEC_CODE = `[app]

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

# (str) Application versioning
version = 1.0.0

# (list) Application requirements
# comma separated e.g. requirements = sqlite3,kivy
requirements = python3,kivy==2.3.0

# (str) Supported orientation (one of landscape, sensorLandscape, portrait or all)
orientation = portrait

# (bool) Indicate if the application should be fullscreen
fullscreen = 0

# (list) Permissions
android.permissions = INTERNET

# (int) Target Android API
android.api = 34

# (int) Minimum API your APK will support
android.minapi = 21

# (str) Android NDK version to use
android.ndk = 25b

# (bool) Automatically accept SDK license agreements for CI/CD
android.accept_sdk_license = True

# (list) The Android architectures to build for (ARM64 and ARMv7 cover 99%+ of smartphones)
android.archs = arm64-v8a, armeabi-v7a

# (bool) enables Android auto backup feature
android.allow_backup = True

[buildozer]

# (int) Log level (0 = error only, 1 = info, 2 = debug)
log_level = 2

# (int) Display warning if buildozer is run as root
warn_on_root = 1
`;

export const REQUIREMENTS_TXT_CODE = `kivy>=2.3.0
`;

export const GITHUB_WORKFLOW_CODE = `name: Сборка Android APK (Buildozer)

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch: # Ручной запуск сборки в один клик

jobs:
  build:
    name: Buildozer Android APK
    runs-on: ubuntu-22.04

    steps:
      - name: Клонирование репозитория
        uses: actions/checkout@v4

      - name: Настройка кэша ccache и buildozer
        uses: actions/cache@v4
        with:
          path: |
            ~/.buildozer
            ~/.gradle
            .buildozer
          key: \${{ runner.os }}-buildozer-\${{ hashFiles('buildozer.spec') }}
          restore-keys: |
            \${{ runner.os }}-buildozer-

      - name: Сборка APK с помощью Buildozer Action
        uses: ArtemSBulgakov/buildozer-action@v1
        id: buildozer
        with:
          workdir: .
          buildozer_version: master

      - name: Выгрузка готового APK файла как артефакта
        uses: actions/upload-artifact@v4
        with:
          name: TicTacToe-Hotseat-Android-APK
          path: \${{ steps.buildozer.outputs.filename }}
`;

export const README_MD_CODE = `# 🎮 Крестики-нолики Hotseat (Python + Kivy)

Автономное мобильное и десктопное приложение «Крестики-нолики» на двоих игроков для одного устройства (Hotseat) с современным неоновым темным интерфейсом.

---

## 📁 Структура репозитория для GitHub Actions

Для сборки APK в вашем репозитории должны быть загружены файлы:

\`\`\`text
├── main.py                     # Логика игры и неоновый UI на Kivy
├── buildozer.spec              # Конфигурация сборки Buildozer под Android
├── requirements.txt            # Зависимости Python
├── .github/
│   └── workflows/
│       └── build-apk.yml       # Автоматическая сборка APK в облаке GitHub Actions
└── README.md                   # Инструкция
\`\`\`

---

## 🚀 Пошаговая инструкция: сборка APK в GitHub Actions

Вам **не нужно** настраивать Linux, Android SDK или NDK на своём ПК — серверы GitHub бесплатно соберут APK:

### 1. Создайте репозиторий на GitHub
1. Перейдите на [github.com](https://github.com) и нажмите **«New»** (Создать репозиторий).
2. Задайте имя, например \`tictactoe-hotseat\`, выберите Public и нажмите **«Create repository»**.

### 2. Загрузите файлы
1. Нажмите кнопку **«Upload files»** или выполните git push.
2. Загрузите файлы \`main.py\`, \`buildozer.spec\`, \`requirements.txt\` и файл \`.github/workflows/build-apk.yml\`.
   *(Или скачайте готовый .zip архив из нашей студии в 1 клик и распакуйте в проект)*.

### 3. Запустите сборку
1. Перейдите во вкладку **«Actions»** в вашем репозитории на GitHub.
2. Выберите слева воркфлоу **«Сборка Android APK (Buildozer)»**.
3. Нажмите кнопку **«Run workflow»**.
4. GitHub выделит виртуальную машину и запустит сборку (первая сборка займет около 10–12 минут).

### 4. Скачайте APK файл
1. По окончании сборки появится зеленый значок успеха \`✓\`.
2. Кликните на завершенный запуск.
3. Внизу в разделе **«Artifacts»** скачайте **\`TicTacToe-Hotseat-Android-APK\`** — внутри будет готовый \`.apk\` файл для установки на любой Android смартфон!

---

## 💻 Локальный запуск на компьютере (ПК)

1. Установите зависимости:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`
2. Запустите игру:
   \`\`\`bash
   python main.py
   \`\`\`
`;

export const PROJECT_FILES: ProjectFile[] = [
  {
    name: 'main.py',
    path: 'main.py',
    language: 'python',
    description: 'Основной код игры на Python/Kivy: логика Hotseat, неоновый UI, анимации, экран победы и счет.',
    content: MAIN_PY_CODE,
  },
  {
    name: 'buildozer.spec',
    path: 'buildozer.spec',
    language: 'ini',
    description: 'Конфигурация Buildozer для сборки APK (ориентация portrait, Android API 34, ARM64/ARMv7).',
    content: BUILDOZER_SPEC_CODE,
  },
  {
    name: 'requirements.txt',
    path: 'requirements.txt',
    language: 'text',
    description: 'Список зависимостей Python для компиляции и локального запуска.',
    content: REQUIREMENTS_TXT_CODE,
  },
  {
    name: 'build-apk.yml',
    path: '.github/workflows/build-apk.yml',
    language: 'yaml',
    description: 'Скрипт GitHub Actions для бесплатной автоматической сборки APK в облаке с выгрузкой артефакта.',
    content: GITHUB_WORKFLOW_CODE,
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Подробная пошаговая инструкция на русском языке по запуску на ПК и сборке APK на GitHub.',
    content: README_MD_CODE,
  },
];
