# -*- coding: utf-8 -*-
"""
Крестики-Нолики (Tic-Tac-Toe) на Kivy для Android
100% РАБОЧАЯ СХЕМА ИСПРАВЛЕНИЯ РАСТЯГИВАНИЯ И СМЕЩЕНИЯ В ЛЕВЫЙ НИЖНИЙ УГОЛ НА ANDROID APK

ПРИЧИНА ПРОБЛЕМЫ:
1. Если в коде вызывается Window.size = (360, 640) на Android, движок SDL2 Kivy
   создаёт буфер рендеринга 360x640px вместо родного разрешения дисплея (например, 1080x2400).
   В Kivy точка (0,0) расположена в ЛЕВОМ НИЖНЕМ УГЛУ, поэтому весь интерфейс
   оказывается в углу, а остальной экран остаётся чёрным!
2. Фиксированные пиксели без dp() и sp() приводят к искажениям на экранах разной плотности.
3. Отсутствие корневого AnchorLayout/BoxLayout с size_hint=(1, 1).

РЕШЕНИЕ:
1. Условная установка Window.size ТОЛЬКО на десктопе:
   if platform not in ('android', 'ios'):
       Window.size = (380, 680)
2. Все размеры элементов задаются через dp(), а шрифты через sp().
3. Корневой контейнер занимает 100% экрана (size_hint=(1, 1)) с центрированием игрового поля.
"""

from kivy.app import App
from kivy.utils import platform
from kivy.core.window import Window
from kivy.metrics import dp, sp
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.anchorlayout import AnchorLayout
from kivy.graphics import Color, RoundedRectangle, Line

# -------------------------------------------------------------
# КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: устанавливаем Window.size ТОЛЬКО на ПК!
# На мобильных устройствах Android и iOS экран должен растягиваться на 100%.
# -------------------------------------------------------------
if platform not in ('android', 'ios'):
    Window.size = (380, 680)

# Цветовая палитра игры (соответствует визуалу)
BG_COLOR = (0.047, 0.071, 0.125, 1.0)       # #0c1220 Тёмный фон
CARD_BG = (0.086, 0.125, 0.208, 0.9)        # #162035 Карточка
CARD_BORDER = (0.18, 0.35, 0.60, 0.4)       # Граница карточки
CYAN_COLOR = (0.024, 0.714, 0.831, 1.0)     # #06b6d4 Игрок X
PINK_COLOR = (0.957, 0.247, 0.369, 1.0)     # #f43f5e Игрок O
GRAY_COLOR = (0.580, 0.639, 0.722, 1.0)     # #94a3b8 Текст ничьих
WHITE_COLOR = (1.0, 1.0, 1.0, 1.0)          # Белый текст
CELL_BG = (0.102, 0.157, 0.259, 0.85)       # Фон клеток 3x3
CELL_WIN_BG = (0.15, 0.35, 0.45, 0.95)      # Фон победной клетки


class StyledCard(BoxLayout):
    """Карточка со скруглёнными углами и фоном, адаптирующаяся под размер."""
    def __init__(self, bg_color=CARD_BG, border_color=CARD_BORDER, radius=dp(16), **kwargs):
        super(StyledCard, self).__init__(**kwargs)
        self.bg_color = bg_color
        self.border_color = border_color
        self.radius = radius
        with self.canvas.before:
            self.color_instruction = Color(*self.bg_color)
            self.rect_instruction = RoundedRectangle(pos=self.pos, size=self.size, radius=[self.radius])
            self.border_color_inst = Color(*self.border_color)
            self.border_inst = Line(rounded_rectangle=(self.x, self.y, self.width, self.height, self.radius), width=1)
        self.bind(pos=self._update_rect, size=self._update_rect)

    def _update_rect(self, *args):
        self.rect_instruction.pos = self.pos
        self.rect_instruction.size = self.size
        self.border_inst.rounded_rectangle = (self.x, self.y, self.width, self.height, self.radius)


class TicTacToeApp(App):
    def build(self):
        Window.clearcolor = BG_COLOR
        self.title = "Крестики-Нолики"

        # Состояние игры
        self.board = [""] * 9
        self.current_player = "X"
        self.game_over = False
        self.winning_combo = []

        # Счёт
        self.score_x = 0
        self.score_draw = 0
        self.score_o = 0

        # Корневой контейнер с безопасными отступами и size_hint=(1, 1)
        root = AnchorLayout(anchor_x='center', anchor_y='center', size_hint=(1, 1))

        # Главный вертикальный блок
        main_layout = BoxLayout(
            orientation='vertical',
            size_hint=(1, 1),
            padding=[dp(18), dp(20), dp(18), dp(20)],
            spacing=dp(14)
        )

        # 1. Заголовок "КРЕСТИКИ-НОЛИКИ"
        self.title_label = Label(
            text="КРЕСТИКИ-НОЛИКИ",
            font_size=sp(22),
            bold=True,
            color=WHITE_COLOR,
            size_hint=(1, None),
            height=dp(36),
            halign='center',
            valign='middle'
        )
        self.title_label.bind(size=self.title_label.setter('text_size'))
        main_layout.add_widget(self.title_label)

        # 2. Карточка счёта (Игрок X, Ничьи, Игрок O)
        score_card = StyledCard(
            orientation='vertical',
            size_hint=(1, None),
            height=dp(94),
            padding=[dp(12), dp(10), dp(12), dp(10)],
            spacing=dp(6)
        )

        # Подписи игроков
        header_row = BoxLayout(orientation='horizontal', size_hint=(1, None), height=dp(24))
        lbl_x = Label(text="Игрок X", font_size=sp(14), bold=True, color=CYAN_COLOR)
        lbl_draw = Label(text="Ничьи", font_size=sp(14), color=GRAY_COLOR)
        lbl_o = Label(text="Игрок O", font_size=sp(14), bold=True, color=PINK_COLOR)
        header_row.add_widget(lbl_x)
        header_row.add_widget(lbl_draw)
        header_row.add_widget(lbl_o)
        score_card.add_widget(header_row)

        # Значения счёта
        scores_row = BoxLayout(orientation='horizontal', size_hint=(1, None), height=dp(42))
        self.val_x = Label(text=str(self.score_x), font_size=sp(28), bold=True, color=WHITE_COLOR)
        self.val_draw = Label(text=str(self.score_draw), font_size=sp(28), bold=True, color=WHITE_COLOR)
        self.val_o = Label(text=str(self.score_o), font_size=sp(28), bold=True, color=WHITE_COLOR)
        scores_row.add_widget(self.val_x)
        scores_row.add_widget(self.val_draw)
        scores_row.add_widget(self.val_o)
        score_card.add_widget(scores_row)

        main_layout.add_widget(score_card)

        # 3. Индикатор очереди
        self.turn_card = StyledCard(
            orientation='horizontal',
            size_hint=(1, None),
            height=dp(48),
            padding=[dp(16), dp(6)],
            radius=dp(12)
        )
        self.turn_label = Label(
            text="Очередь: [color=06b6d4]Игрок X[/color]",
            markup=True,
            font_size=sp(16),
            bold=True,
            halign='center',
            valign='middle'
        )
        self.turn_label.bind(size=self.turn_label.setter('text_size'))
        self.turn_card.add_widget(self.turn_label)
        main_layout.add_widget(self.turn_card)

        # 4. Адаптивное игровое поле 3x3
        # Оборачиваем в AnchorLayout, чтобы сетка была ровно по центру и квадратной
        grid_container = AnchorLayout(anchor_x='center', anchor_y='center', size_hint=(1, 1))

        self.grid = GridLayout(cols=3, spacing=dp(8), size_hint=(None, None))
        self.buttons = []
        for i in range(9):
            btn = Button(
                text="",
                font_size=sp(42),
                bold=True,
                background_normal='',
                background_color=CELL_BG
            )
            btn.bind(on_release=lambda instance, idx=i: self.make_move(idx))
            self.buttons.append(btn)
            self.grid.add_widget(btn)

        grid_container.add_widget(self.grid)
        # Динамически вычисляем идеальный квадрат для поля при изменении размера экрана
        grid_container.bind(size=self._update_grid_size)
        main_layout.add_widget(grid_container)

        # 5. Кнопки управления ("НОВАЯ ИГРА", "СБРОС СЧЁТА")
        btn_row = BoxLayout(orientation='horizontal', size_hint=(1, None), height=dp(52), spacing=dp(12))

        self.btn_new = Button(
            text="НОВАЯ ИГРА",
            font_size=sp(14),
            bold=True,
            background_normal='',
            background_color=(0.14, 0.22, 0.35, 1.0),
            color=WHITE_COLOR
        )
        self.btn_new.bind(on_release=lambda x: self.reset_board())

        self.btn_reset = Button(
            text="СБРОС СЧЁТА",
            font_size=sp(14),
            bold=True,
            background_normal='',
            background_color=(0.20, 0.14, 0.20, 1.0),
            color=GRAY_COLOR
        )
        self.btn_reset.bind(on_release=lambda x: self.reset_all_scores())

        btn_row.add_widget(self.btn_new)
        btn_row.add_widget(self.btn_reset)
        main_layout.add_widget(btn_row)

        root.add_widget(main_layout)
        return root

    def _update_grid_size(self, instance, value):
        # Идеальный квадрат с учётом пропорций экрана
        w, h = instance.size
        side = min(w, h) - dp(8)
        self.grid.size = (side, side)

    def make_move(self, index):
        if self.game_over or self.board[index] != "":
            return

        self.board[index] = self.current_player
        btn = self.buttons[index]
        btn.text = self.current_player

        if self.current_player == "X":
            btn.color = CYAN_COLOR
        else:
            btn.color = PINK_COLOR

        winner, combo = self.check_winner()
        if winner:
            self.game_over = True
            self.winning_combo = combo
            for c in combo:
                self.buttons[c].background_color = CELL_WIN_BG

            if winner == "X":
                self.score_x += 1
                self.val_x.text = str(self.score_x)
                self.turn_label.text = "[color=06b6d4]Победа Игрока X![/color]"
            else:
                self.score_o += 1
                self.val_o.text = str(self.score_o)
                self.turn_label.text = "[color=f43f5e]Победа Игрока O![/color]"
            return

        if "" not in self.board:
            self.game_over = True
            self.score_draw += 1
            self.val_draw.text = str(self.score_draw)
            self.turn_label.text = "[color=94a3b8]Ничья![/color]"
            return

        # Переход хода
        self.current_player = "O" if self.current_player == "X" else "X"
        if self.current_player == "X":
            self.turn_label.text = "Очередь: [color=06b6d4]Игрок X[/color]"
        else:
            self.turn_label.text = "Очередь: [color=f43f5e]Игрок O[/color]"

    def check_winner(self):
        combos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  # горизонтали
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  # вертикали
            [0, 4, 8], [2, 4, 6]              # диагонали
        ]
        for c in combos:
            if self.board[c[0]] != "" and self.board[c[0]] == self.board[c[1]] == self.board[c[2]]:
                return self.board[c[0]], c
        return None, []

    def reset_board(self):
        self.board = [""] * 9
        self.game_over = False
        self.winning_combo = []
        self.current_player = "X"
        self.turn_label.text = "Очередь: [color=06b6d4]Игрок X[/color]"
        for btn in self.buttons:
            btn.text = ""
            btn.background_color = CELL_BG

    def reset_all_scores(self):
        self.reset_board()
        self.score_x = 0
        self.score_draw = 0
        self.score_o = 0
        self.val_x.text = "0"
        self.val_draw.text = "0"
        self.val_o.text = "0"


if __name__ == '__main__':
    TicTacToeApp().run()
