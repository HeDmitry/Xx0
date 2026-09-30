# -*- coding: utf-8 -*-
"""
Крестики-Нолики (Xx0) на Kivy для Android
Адаптивный мобильный интерфейс: растягивается на 100% экрана,
не съезжает в угол, использует масштабируемые единицы dp/sp.
"""

import os
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.anchorlayout import AnchorLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.core.window import Window
from kivy.utils import get_color_from_hex
from kivy.clock import Clock
from kivy.metrics import dp, sp
from kivy.graphics import Color, RoundedRectangle
import random

# Цветовая гамма (совпадает с мобильной темой из приложения)
COLOR_BG = get_color_from_hex('#0A0F1D')       # Глубокий темный фон
COLOR_CARD = get_color_from_hex('#151E32')     # Карточки панелей
COLOR_CARD_BORDER = get_color_from_hex('#22314E')
COLOR_X = get_color_from_hex('#00E5FF')        # Яркий Cyan для X
COLOR_O = get_color_from_hex('#FF4081')        # Яркий Pink для O
COLOR_GRAY = get_color_from_hex('#94A3B8')     # Серый для ничьих
COLOR_TEXT = get_color_from_hex('#FFFFFF')     # Белый текст
COLOR_BTN_BG = get_color_from_hex('#1E293B')   # Кнопки поля
COLOR_ACCENT = get_color_from_hex('#4F46E5')   # Индиго акцент
COLOR_RESET = get_color_from_hex('#334155')    # Вторичная кнопка

class RoundedBox(BoxLayout):
    """Контейнер с красивым скругленным фоном"""
    def __init__(self, bg_color=COLOR_CARD, radius=16, **kwargs):
        super().__init__(**kwargs)
        self.bg_color = bg_color
        self.radius = radius
        with self.canvas.before:
            self.color_instruction = Color(*self.bg_color)
            self.rect = RoundedRectangle(pos=self.pos, size=self.size, radius=[dp(self.radius)])
        self.bind(pos=self._update_rect, size=self._update_rect)

    def _update_rect(self, *args):
        self.rect.pos = self.pos
        self.rect.size = self.size

class TicTacToeApp(App):
    def build(self):
        self.title = "Крестики-Нолики Xx0"
        Window.clearcolor = COLOR_BG
        
        # Состояние игры
        self.board = [""] * 9
        self.current_player = "X"
        self.game_over = False
        self.vs_ai = True
        self.score_x = 0
        self.score_o = 0
        self.score_draws = 0

        # КОРНЕВОЙ КОНТЕЙНЕР:
        # size_hint=(1, 1) гарантирует заполнение ВСЕГО экрана Android,
        # предотвращая съезжание интерфейса в нижний левый угол!
        root = BoxLayout(
            orientation='vertical',
            size_hint=(1, 1),
            padding=[dp(16), dp(20), dp(16), dp(16)],
            spacing=dp(12)
        )

        # 1. Заголовок
        self.title_label = Label(
            text="[b]КРЕСТИКИ-НОЛИКИ[/b]",
            markup=True,
            font_size=sp(24),
            size_hint=(1, None),
            height=dp(36),
            color=COLOR_TEXT
        )
        root.add_widget(self.title_label)

        # 2. Кнопка переключения режима (AI / 2 Игрока)
        self.mode_btn = Button(
            text="Режим: Против Бота (AI)",
            font_size=sp(13),
            size_hint=(1, None),
            height=dp(38),
            background_normal='',
            background_color=COLOR_ACCENT,
            color=COLOR_TEXT
        )
        self.mode_btn.bind(on_release=self.toggle_mode)
        root.add_widget(self.mode_btn)

        # 3. Карточка счёта (Игрок X, Ничьи, Игрок O)
        score_card = RoundedBox(
            bg_color=COLOR_CARD,
            radius=16,
            orientation='vertical',
            size_hint=(1, None),
            height=dp(86),
            padding=[dp(12), dp(8)]
        )

        headers_box = BoxLayout(orientation='horizontal', size_hint=(1, 0.4))
        self.lbl_head_x = Label(
            text="[b][color=00E5FF]Игрок X[/color][/b]",
            markup=True,
            font_size=sp(13),
            halign='center'
        )
        self.lbl_head_draw = Label(
            text="[b][color=94A3B8]Ничьи[/color][/b]",
            markup=True,
            font_size=sp(13),
            halign='center'
        )
        self.lbl_head_o = Label(
            text="[b][color=FF4081]Игрок O[/color][/b]",
            markup=True,
            font_size=sp(13),
            halign='center'
        )
        headers_box.add_widget(self.lbl_head_x)
        headers_box.add_widget(self.lbl_head_draw)
        headers_box.add_widget(self.lbl_head_o)
        score_card.add_widget(headers_box)

        scores_box = BoxLayout(orientation='horizontal', size_hint=(1, 0.6))
        self.score_x_lbl = Label(text="0", font_size=sp(24), bold=True, color=COLOR_TEXT)
        self.score_draw_lbl = Label(text="0", font_size=sp(24), bold=True, color=COLOR_TEXT)
        self.score_o_lbl = Label(text="0", font_size=sp(24), bold=True, color=COLOR_TEXT)
        scores_box.add_widget(self.score_x_lbl)
        scores_box.add_widget(self.score_draw_lbl)
        scores_box.add_widget(self.score_o_lbl)
        score_card.add_widget(scores_box)
        root.add_widget(score_card)

        # 4. Статус хода: "Очередь: Игрок X"
        status_card = RoundedBox(
            bg_color=COLOR_CARD,
            radius=12,
            size_hint=(1, None),
            height=dp(44),
            padding=[dp(12), dp(4)]
        )
        self.status_label = Label(
            text="Очередь: [b][color=00E5FF]Игрок X[/color][/b]",
            markup=True,
            font_size=sp(16),
            halign='center',
            color=COLOR_TEXT
        )
        status_card.add_widget(self.status_label)
        root.add_widget(status_card)

        # 5. Игровое поле 3x3 — центрированное и квадратное
        # AnchorLayout удерживает квадратную сетку ровно по центру экрана
        grid_anchor = AnchorLayout(
            anchor_x='center',
            anchor_y='center',
            size_hint=(1, 1)
        )

        self.grid = GridLayout(
            cols=3,
            spacing=dp(10),
            size_hint=(None, None)
        )

        # Автоматическая адаптация размера сетки под ширину и высоту экрана
        def update_grid_size(*args):
            avail_w = grid_anchor.width - dp(16)
            avail_h = grid_anchor.height - dp(16)
            board_size = max(dp(240), min(avail_w, avail_h, dp(420)))
            self.grid.size = (board_size, board_size)

        grid_anchor.bind(size=update_grid_size)
        Clock.schedule_once(update_grid_size, 0.1)

        self.buttons = []
        for i in range(9):
            btn = Button(
                text="",
                font_size=sp(42),
                bold=True,
                background_normal='',
                background_color=COLOR_BTN_BG,
                color=COLOR_TEXT
            )
            btn.bind(on_release=lambda b, idx=i: self.on_cell_clicked(idx))
            self.buttons.append(btn)
            self.grid.add_widget(btn)

        grid_anchor.add_widget(self.grid)
        root.add_widget(grid_anchor)

        # 6. Нижняя панель действий: "НОВАЯ ИГРА" и "СБРОС СЧЁТА"
        # Размещены горизонтально с равной шириной, больше не накладываются друг на друга!
        bottom_bar = BoxLayout(
            orientation='horizontal',
            size_hint=(1, None),
            height=dp(50),
            spacing=dp(12)
        )

        self.new_game_btn = Button(
            text="НОВАЯ ИГРА",
            font_size=sp(13),
            bold=True,
            size_hint=(0.5, 1),
            background_normal='',
            background_color=COLOR_ACCENT,
            color=COLOR_TEXT
        )
        self.new_game_btn.bind(on_release=lambda _: self.reset_board())
        bottom_bar.add_widget(self.new_game_btn)

        self.reset_score_btn = Button(
            text="СБРОС СЧЁТА",
            font_size=sp(13),
            bold=True,
            size_hint=(0.5, 1),
            background_normal='',
            background_color=COLOR_RESET,
            color=COLOR_TEXT
        )
        self.reset_score_btn.bind(on_release=lambda _: self.reset_scores())
        bottom_bar.add_widget(self.reset_score_btn)

        root.add_widget(bottom_bar)

        return root

    def toggle_mode(self, instance):
        self.vs_ai = not self.vs_ai
        if self.vs_ai:
            self.mode_btn.text = "Режим: Против Бота (AI)"
            self.lbl_head_o.text = "[b][color=FF4081]Бот O[/color][/b]"
        else:
            self.mode_btn.text = "Режим: 2 Игрока"
            self.lbl_head_o.text = "[b][color=FF4081]Игрок O[/color][/b]"
        self.reset_board()

    def on_cell_clicked(self, idx):
        if self.board[idx] != "" or self.game_over:
            return

        self.make_move(idx, self.current_player)

        winner = self.check_winner(self.board)
        if winner:
            self.finish_game(winner)
            return

        if "" not in self.board:
            self.finish_game("draw")
            return

        # Переход хода
        self.current_player = "O" if self.current_player == "X" else "X"
        self.update_status_display()

        # Ход бота
        if self.vs_ai and self.current_player == "O" and not self.game_over:
            Clock.schedule_once(lambda dt: self.ai_move(), 0.35)

    def make_move(self, idx, player):
        self.board[idx] = player
        btn = self.buttons[idx]
        btn.text = player
        if player == "X":
            btn.color = COLOR_X
            btn.background_color = get_color_from_hex('#0F2942')
        else:
            btn.color = COLOR_O
            btn.background_color = get_color_from_hex('#3A0D28')

    def ai_move(self):
        if self.game_over:
            return

        move = self.find_best_move()
        if move is not None:
            self.make_move(move, "O")

            winner = self.check_winner(self.board)
            if winner:
                self.finish_game(winner)
                return

            if "" not in self.board:
                self.finish_game("draw")
                return

            self.current_player = "X"
            self.update_status_display()

    def find_best_move(self):
        # 1. Победа бота в 1 ход
        for i in range(9):
            if self.board[i] == "":
                self.board[i] = "O"
                if self.check_winner(self.board) == "O":
                    self.board[i] = ""
                    return i
                self.board[i] = ""

        # 2. Блокировка победы игрока X
        for i in range(9):
            if self.board[i] == "":
                self.board[i] = "X"
                if self.check_winner(self.board) == "X":
                    self.board[i] = ""
                    return i
                self.board[i] = ""

        # 3. Центр
        if self.board[4] == "":
            return 4

        # 4. Углы
        corners = [0, 2, 6, 8]
        empty_corners = [c for c in corners if self.board[c] == ""]
        if empty_corners:
            return random.choice(empty_corners)

        # 5. Любая свободная клетка
        free = [i for i, v in enumerate(self.board) if v == ""]
        return random.choice(free) if free else None

    def check_winner(self, b):
        lines = [
            (0, 1, 2), (3, 4, 5), (6, 7, 8),
            (0, 3, 6), (1, 4, 7), (2, 5, 8),
            (0, 4, 8), (2, 4, 6)
        ]
        for x, y, z in lines:
            if b[x] and b[x] == b[y] == b[z]:
                return b[x]
        return None

    def finish_game(self, result):
        self.game_over = True
        if result == "draw":
            self.score_draws += 1
            self.status_label.text = "[b][color=F59E0B]НИЧЬЯ![/color][/b]"
        else:
            if result == "X":
                self.score_x += 1
                color = "00E5FF"
            else:
                self.score_o += 1
                color = "FF4081"
            self.status_label.text = f"Победил [b][color={color}]Игрок {result}[/color][/b]!"

        self.update_score_labels()

    def update_score_labels(self):
        self.score_x_lbl.text = str(self.score_x)
        self.score_draw_lbl.text = str(self.score_draws)
        self.score_o_lbl.text = str(self.score_o)

    def update_status_display(self):
        col = "00E5FF" if self.current_player == "X" else "FF4081"
        self.status_label.text = f"Очередь: [b][color={col}]Игрок {self.current_player}[/color][/b]"

    def reset_board(self):
        self.board = [""] * 9
        self.game_over = False
        self.current_player = "X"
        for btn in self.buttons:
            btn.text = ""
            btn.background_color = COLOR_BTN_BG
            btn.color = COLOR_TEXT
        self.update_status_display()

    def reset_scores(self):
        self.score_x = 0
        self.score_o = 0
        self.score_draws = 0
        self.update_score_labels()
        self.reset_board()

if __name__ == '__main__':
    TicTacToeApp().run()

if __name__ == '__main__':
    TicTacToeApp().run()
