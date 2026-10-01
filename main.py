"""
Крестики-Нолики Hotseat (на двоих на одном устройстве)
Разработано на Python + Kivy для Android и Desktop.
Спокойный темный интерфейс с простой плоской палитрой,
подсчетом очков и экраном результата.
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
from kivy.utils import platform
from kivy.animation import Animation
from kivy.clock import Clock

# Размер окна задается только для тестирования на ПК.
# На Android/iOS размер окна определяет сама система.
if platform not in ('android', 'ios'):
    Window.size = (390, 720)

# Простая плоская палитра с сохраненной прозрачностью панелей.
COLOR_BG = (0.055, 0.065, 0.09, 1.0)
COLOR_PANEL = (0.10, 0.115, 0.15, 0.88)
COLOR_BORDER = (0.24, 0.27, 0.33, 0.72)
COLOR_CELL_BG = (0.12, 0.135, 0.17, 0.86)
COLOR_X = (0.36, 0.62, 0.92, 1.0)
COLOR_O = (0.92, 0.44, 0.44, 1.0)
COLOR_TEXT = (0.94, 0.95, 0.97, 1.0)
COLOR_MUTED = (0.62, 0.66, 0.72, 1.0)
COLOR_OVERLAY = (0.03, 0.04, 0.055, 0.70)

Window.clearcolor = COLOR_BG


class GameCell(Button):
    """Интерактивная клетка игрового поля."""

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
                Color(0.42, 0.50, 0.62, 0.22)
            else:
                Color(*COLOR_CELL_BG)
            RoundedRectangle(pos=self.pos, size=self.size, radius=[dp(14)])

            if self.is_winning:
                border = COLOR_X if self.symbol == "X" else COLOR_O
                Color(border[0], border[1], border[2], 0.85)
                Line(
                    rounded_rectangle=(
                        self.pos[0], self.pos[1], self.size[0], self.size[1], dp(14)
                    ),
                    width=dp(1.8),
                )
            else:
                Color(*COLOR_BORDER)
                Line(
                    rounded_rectangle=(
                        self.pos[0], self.pos[1], self.size[0], self.size[1], dp(14)
                    ),
                    width=dp(1.0),
                )

    def on_press(self):
        self.on_cell_click(self)

    def set_mark(self, symbol):
        """Установка символа X или O с короткой анимацией появления."""
        self.symbol = symbol
        color_hex = "5C9DF0" if symbol == "X" else "EB7070"
        self.text = f"[color={color_hex}]{symbol}[/color]"

        self.font_size = sp(18)
        anim = Animation(font_size=sp(50), duration=0.15, t='out_back') + \
               Animation(font_size=sp(46), duration=0.1, t='in_out_quad')
        anim.start(self)

    def highlight_win(self):
        """Подсветка выигрышной комбинации."""
        self.is_winning = True
        self.update_canvas()
        anim = Animation(font_size=sp(50), duration=0.2) + Animation(font_size=sp(46), duration=0.2)
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
    """Полупрозрачное всплывающее окно результата."""

    def __init__(self, title_text, subtitle_text, symbol, on_rematch, on_close, **kwargs):
        super().__init__(**kwargs)
        self.on_rematch = on_rematch
        self.on_close = on_close

        # Полупрозрачная затемняющая подложка.
        with self.canvas.before:
            Color(*COLOR_OVERLAY)
            RoundedRectangle(pos=self.pos, size=self.size)

        def update_overlay_bg(*_):
            self.canvas.before.clear()
            with self.canvas.before:
                Color(*COLOR_OVERLAY)
                RoundedRectangle(pos=self.pos, size=self.size)

        self.bind(pos=update_overlay_bg, size=update_overlay_bg)

        # Контейнер карточки.
        card = BoxLayout(
            orientation='vertical',
            padding=[dp(24), dp(28), dp(24), dp(24)],
            spacing=dp(16),
            size_hint=(0.86, None),
            height=dp(300),
            pos_hint={'center_x': 0.5, 'center_y': 0.5}
        )

        with card.canvas.before:
            Color(*COLOR_PANEL)
            RoundedRectangle(pos=card.pos, size=card.size, radius=[dp(22)])
            Color(*COLOR_BORDER)
            Line(
                rounded_rectangle=(
                    card.pos[0], card.pos[1], card.size[0], card.size[1], dp(22)
                ),
                width=dp(1.2),
            )

        def update_card_bg(*_):
            card.canvas.before.clear()
            with card.canvas.before:
                Color(*COLOR_PANEL)
                RoundedRectangle(pos=card.pos, size=card.size, radius=[dp(22)])
                Color(*COLOR_BORDER)
                Line(
                    rounded_rectangle=(
                        card.pos[0], card.pos[1], card.size[0], card.size[1], dp(22)
                    ),
                    width=dp(1.2),
                )

        card.bind(pos=update_card_bg, size=update_card_bg)

        # Заголовок результата.
        lbl_title = Label(
            text=title_text,
            font_size=sp(22),
            bold=True,
            color=COLOR_TEXT,
            size_hint_y=None,
            height=dp(34)
        )
        card.add_widget(lbl_title)

        # Подзаголовок с цветом текущего победителя.
        lbl_subtitle = Label(
            text=subtitle_text,
            font_size=sp(16),
            color=COLOR_X if symbol == "X" else (COLOR_O if symbol == "O" else COLOR_MUTED),
            bold=True,
            size_hint_y=None,
            height=dp(30)
        )
        card.add_widget(lbl_subtitle)

        # Кнопка продолжения.
        btn_rematch = Button(
            text="СЛЕДУЮЩИЙ РАУНД",
            font_size=sp(15),
            bold=True,
            size_hint_y=None,
            height=dp(50),
            background_color=(0, 0, 0, 0),
            color=COLOR_BG,
        )
        button_color = COLOR_X if symbol == "X" else (COLOR_O if symbol == "O" else COLOR_TEXT)
        with btn_rematch.canvas.before:
            Color(*button_color)
            RoundedRectangle(pos=btn_rematch.pos, size=btn_rematch.size, radius=[dp(12)])

        def update_btn_rematch(*_):
            btn_rematch.canvas.before.clear()
            with btn_rematch.canvas.before:
                Color(*button_color)
                RoundedRectangle(pos=btn_rematch.pos, size=btn_rematch.size, radius=[dp(12)])

        btn_rematch.bind(pos=update_btn_rematch, size=update_btn_rematch)
        btn_rematch.bind(on_release=lambda _: self.on_rematch())
        card.add_widget(btn_rematch)

        self.add_widget(card)


class TicTacToeApp(App):
    """Главный класс приложения Kivy."""

    def build(self):
        self.title = "Крестики-Нолики Hotseat"

        # Состояние игры.
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

        # Корневой контейнер.
        self.root_layout = FloatLayout()

        # Главная вертикальная колонка интерфейса.
        main_box = BoxLayout(
            orientation='vertical',
            padding=[dp(20), dp(24), dp(20), dp(20)],
            spacing=dp(16),
            size_hint=(1, 1)
        )

        # 1. Шапка приложения.
        header_box = BoxLayout(orientation='horizontal', size_hint_y=None, height=dp(38))
        lbl_app_name = Label(
            text="КРЕСТИКИ-НОЛИКИ",
            font_size=sp(17),
            bold=True,
            color=COLOR_TEXT,
            halign='left',
            valign='middle'
        )
        lbl_app_name.bind(size=lbl_app_name.setter('text_size'))

        self.lbl_round = Label(
            text=f"Раунд {self.round_number}",
            font_size=sp(13),
            color=COLOR_MUTED,
            halign='right',
            valign='middle'
        )
        self.lbl_round.bind(size=self.lbl_round.setter('text_size'))

        header_box.add_widget(lbl_app_name)
        header_box.add_widget(self.lbl_round)
        main_box.add_widget(header_box)

        # 2. Карточка текущего счета.
        score_panel = BoxLayout(
            orientation='horizontal',
            size_hint_y=None,
            height=dp(86),
            padding=[dp(12), dp(10), dp(12), dp(10)],
            spacing=dp(8)
        )
        with score_panel.canvas.before:
            Color(*COLOR_PANEL)
            RoundedRectangle(pos=score_panel.pos, size=score_panel.size, radius=[dp(18)])
            Color(*COLOR_BORDER)
            Line(
                rounded_rectangle=(
                    score_panel.pos[0], score_panel.pos[1], score_panel.size[0], score_panel.size[1], dp(18)
                ),
                width=dp(1),
            )

        def update_score_bg(*_):
            score_panel.canvas.before.clear()
            with score_panel.canvas.before:
                Color(*COLOR_PANEL)
                RoundedRectangle(pos=score_panel.pos, size=score_panel.size, radius=[dp(18)])
                Color(*COLOR_BORDER)
                Line(
                    rounded_rectangle=(
                        score_panel.pos[0], score_panel.pos[1], score_panel.size[0], score_panel.size[1], dp(18)
                    ),
                    width=dp(1),
                )

        score_panel.bind(pos=update_score_bg, size=update_score_bg)

        # Секция Игрока X.
        box_x = BoxLayout(orientation='vertical', spacing=dp(2))
        lbl_p1_title = Label(text="Игрок X", font_size=sp(12), color=COLOR_X, bold=True)
        self.lbl_score_x = Label(text="0", font_size=sp(26), color=COLOR_TEXT, bold=True)
        box_x.add_widget(lbl_p1_title)
        box_x.add_widget(self.lbl_score_x)

        # Секция ничьих.
        box_draw = BoxLayout(orientation='vertical', spacing=dp(2), size_hint_x=0.6)
        lbl_draw_title = Label(text="Ничьи", font_size=sp(11), color=COLOR_MUTED)
        self.lbl_score_draw = Label(text="0", font_size=sp(22), color=COLOR_MUTED, bold=True)
        box_draw.add_widget(lbl_draw_title)
        box_draw.add_widget(self.lbl_score_draw)

        # Секция Игрока O.
        box_o = BoxLayout(orientation='vertical', spacing=dp(2))
        lbl_p2_title = Label(text="Игрок O", font_size=sp(12), color=COLOR_O, bold=True)
        self.lbl_score_o = Label(text="0", font_size=sp(26), color=COLOR_TEXT, bold=True)
        box_o.add_widget(lbl_p2_title)
        box_o.add_widget(self.lbl_score_o)

        score_panel.add_widget(box_x)
        score_panel.add_widget(box_draw)
        score_panel.add_widget(box_o)
        main_box.add_widget(score_panel)

        # 3. Индикатор текущего хода.
        self.turn_panel = BoxLayout(
            orientation='horizontal',
            size_hint_y=None,
            height=dp(52),
            padding=[dp(16), dp(8), dp(16), dp(8)]
        )
        with self.turn_panel.canvas.before:
            Color(0.10, 0.115, 0.15, 0.72)
            RoundedRectangle(pos=self.turn_panel.pos, size=self.turn_panel.size, radius=[dp(14)])

        def update_turn_bg(*_):
            self.turn_panel.canvas.before.clear()
            with self.turn_panel.canvas.before:
                Color(0.10, 0.115, 0.15, 0.72)
                RoundedRectangle(pos=self.turn_panel.pos, size=self.turn_panel.size, radius=[dp(14)])

        self.turn_panel.bind(pos=update_turn_bg, size=update_turn_bg)

        self.lbl_turn = Label(
            text="Очередь: [color=5C9DF0][b]Игрок X[/b][/color]",
            markup=True,
            font_size=sp(15),
            color=COLOR_TEXT
        )
        self.turn_panel.add_widget(self.lbl_turn)
        main_box.add_widget(self.turn_panel)

        # 4. Игровое поле 3x3.
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
            cell = GameCell(index=i, on_cell_click=self.handle_cell_click)
            self.cells.append(cell)
            self.grid.add_widget(cell)

        board_container.add_widget(self.grid)
        main_box.add_widget(board_container)

        # 5. Нижняя панель действий.
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
            color=COLOR_TEXT
        )
        with btn_restart.canvas.before:
            Color(*COLOR_PANEL)
            RoundedRectangle(pos=btn_restart.pos, size=btn_restart.size, radius=[dp(12)])
            Color(*COLOR_BORDER)
            Line(
                rounded_rectangle=(
                    btn_restart.pos[0], btn_restart.pos[1], btn_restart.size[0], btn_restart.size[1], dp(12)
                ),
                width=dp(1),
            )

        def update_btn_restart(*_):
            btn_restart.canvas.before.clear()
            with btn_restart.canvas.before:
                Color(*COLOR_PANEL)
                RoundedRectangle(pos=btn_restart.pos, size=btn_restart.size, radius=[dp(12)])
                Color(*COLOR_BORDER)
                Line(
                    rounded_rectangle=(
                        btn_restart.pos[0], btn_restart.pos[1], btn_restart.size[0], btn_restart.size[1], dp(12)
                    ),
                    width=dp(1),
                )

        btn_restart.bind(pos=update_btn_restart, size=update_btn_restart)
        btn_restart.bind(on_release=lambda _: self.new_game_round())

        btn_reset_score = Button(
            text="СБРОС СЧЁТА",
            font_size=sp(13),
            bold=True,
            background_color=(0, 0, 0, 0),
            color=COLOR_MUTED
        )
        with btn_reset_score.canvas.before:
            Color(*COLOR_PANEL)
            RoundedRectangle(pos=btn_reset_score.pos, size=btn_reset_score.size, radius=[dp(12)])
            Color(*COLOR_BORDER)
            Line(
                rounded_rectangle=(
                    btn_reset_score.pos[0], btn_reset_score.pos[1], btn_reset_score.size[0], btn_reset_score.size[1], dp(12)
                ),
                width=dp(1),
            )

        def update_btn_reset(*_):
            btn_reset_score.canvas.before.clear()
            with btn_reset_score.canvas.before:
                Color(*COLOR_PANEL)
                RoundedRectangle(pos=btn_reset_score.pos, size=btn_reset_score.size, radius=[dp(12)])
                Color(*COLOR_BORDER)
                Line(
                    rounded_rectangle=(
                        btn_reset_score.pos[0], btn_reset_score.pos[1], btn_reset_score.size[0], btn_reset_score.size[1], dp(12)
                    ),
                    width=dp(1),
                )

        btn_reset_score.bind(pos=update_btn_reset, size=update_btn_reset)
        btn_reset_score.bind(on_release=lambda _: self.reset_all_scores())

        bottom_box.add_widget(btn_restart)
        bottom_box.add_widget(btn_reset_score)
        main_box.add_widget(bottom_box)

        self.root_layout.add_widget(main_box)
        return self.root_layout

    def handle_cell_click(self, cell):
        """Обработка клика по ячейке игрового поля."""
        if self.game_over:
            return
        if self.board[cell.index] != "":
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
                sub = "Игрок X одержал победу"
            else:
                self.score_o += 1
                self.lbl_score_o.text = str(self.score_o)
                title = "ПОБЕДА!"
                sub = "Игрок O одержал победу"

            self.lbl_turn.text = "[color=ECEFF3][b]Партия завершена![/b][/color]"
            Clock.schedule_once(lambda dt: self.show_result_overlay(title, sub, symbol), 0.35)
            return

        if "" not in self.board:
            self.game_over = True
            self.score_draws += 1
            self.lbl_score_draw.text = str(self.score_draws)
            self.lbl_turn.text = "[color=A0A6B0][b]Ничья в раунде[/b][/color]"
            Clock.schedule_once(lambda dt: self.show_result_overlay("НИЧЬЯ!", "Силы равны, победителя нет", "D"), 0.35)
            return

        if self.current_player == "X":
            self.current_player = "O"
            self.lbl_turn.text = "Очередь: [color=EB7070][b]Игрок O[/b][/color]"
        else:
            self.current_player = "X"
            self.lbl_turn.text = "Очередь: [color=5C9DF0][b]Игрок X[/b][/color]"

    def check_winner(self, player):
        """Проверка всех возможных выигрышных линий."""
        for combo in self.WIN_LINES:
            if (self.board[combo[0]] == player and
                self.board[combo[1]] == player and
                self.board[combo[2]] == player):
                return combo
        return None

    def show_result_overlay(self, title, subtitle, symbol):
        """Показ окна победы или ничьей."""
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
        """Закрытие окна результата."""
        if self.overlay:
            self.root_layout.remove_widget(self.overlay)
            self.overlay = None

    def new_game_round(self):
        """Старт нового раунда с очисткой поля."""
        self.dismiss_overlay()
        self.board = [""] * 9
        self.game_over = False
        self.round_number += 1
        self.lbl_round.text = f"Раунд {self.round_number}"

        self.current_player = "X" if (self.round_number % 2 != 0) else "O"
        if self.current_player == "X":
            self.lbl_turn.text = "Очередь: [color=5C9DF0][b]Игрок X[/b][/color]"
        else:
            self.lbl_turn.text = "Очередь: [color=EB7070][b]Игрок O[/b][/color]"

        for cell in self.cells:
            cell.reset()

    def reset_all_scores(self):
        """Полный сброс счета и перезапуск партии."""
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
