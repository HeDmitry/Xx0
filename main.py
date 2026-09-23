from kivy.app import App
from kivy.clock import Clock
from kivy.core.window import Window
from kivy.metrics import dp, sp
from kivy.properties import BooleanProperty, ListProperty, NumericProperty, StringProperty
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.gridlayout import GridLayout
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.widget import Widget


class CellButton(Button):
    index = NumericProperty(0)
    state = StringProperty("")
    winning = BooleanProperty(False)
    dark = BooleanProperty(True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.background_normal = ""
        self.background_down = ""
        self.border = (0, 0, 0, 0)
        self.font_name = "Roboto"
        self.halign = "center"
        self.valign = "middle"
        self.bind(state=self._refresh, winning=self._refresh, dark=self._refresh)
        self._refresh()

    def _refresh(self, *_):
        if self.winning:
            self.background_color = (0.20, 0.67, 0.40, 1) if self.dark else (0.24, 0.62, 0.34, 1)
        else:
            self.background_color = (0.12, 0.15, 0.20, 1) if self.dark else (0.93, 0.95, 0.98, 1)

        if self.state == "X":
            self.color = (0.36, 0.75, 1, 1) if self.dark else (0.05, 0.32, 0.70, 1)
        elif self.state == "O":
            self.color = (1, 0.46, 0.53, 1) if self.dark else (0.78, 0.12, 0.22, 1)
        else:
            self.color = (0.75, 0.78, 0.84, 1) if self.dark else (0.38, 0.42, 0.49, 1)

        self.text = self.state
        self.font_size = sp(50)
        self.bold = True


class TicTacToeUI(BoxLayout):
    dark = BooleanProperty(True)
    x_name = StringProperty("Игрок 1")
    o_name = StringProperty("Игрок 2")
    x_score = NumericProperty(0)
    o_score = NumericProperty(0)
    draws = NumericProperty(0)

    BG_DARK = (0.055, 0.07, 0.10, 1)
    PANEL_DARK = (0.08, 0.10, 0.14, 1)
    TEXT_DARK = (0.93, 0.95, 0.98, 1)
    MUTED_DARK = (0.62, 0.67, 0.74, 1)
    ACCENT = (0.25, 0.65, 1.0, 1)
    RED = (1.0, 0.34, 0.42, 1)

    BG_LIGHT = (0.95, 0.96, 0.98, 1)
    PANEL_LIGHT = (1, 1, 1, 1)
    TEXT_LIGHT = (0.10, 0.12, 0.16, 1)
    MUTED_LIGHT = (0.40, 0.44, 0.50, 1)

    def __init__(self, **kwargs):
        super().__init__(orientation="vertical", spacing=dp(12), padding=[dp(14), dp(14), dp(14), dp(12)], **kwargs)
        self.board = ["", "", "", "", "", "", "", "", ""]
        self.current = "X"
        self.game_over = False
        self.winning_cells = []
        self._build_ui()
        self._update_theme()
        self._update_turn()

    def _label(self, text="", size=14, bold=False, color=None):
        label = Label(text=text, font_size=sp(size), bold=bold, color=color or self.TEXT_DARK)
        label.halign = "center"
        label.valign = "middle"
        label.bind(size=lambda inst, value: setattr(inst, "text_size", value))
        return label

    def _build_ui(self):
        title_row = BoxLayout(size_hint_y=None, height=dp(48), spacing=dp(8))
        self.title = self._label("КРЕСТИКИ • НОЛИКИ", size=22, bold=True)
        title_row.add_widget(self.title)
        self.theme_button = Button(text="☾", font_size=sp(22), size_hint_x=None, width=dp(52), background_normal="")
        self.theme_button.bind(on_release=self.toggle_theme)
        title_row.add_widget(self.theme_button)
        self.add_widget(title_row)

        names_row = BoxLayout(size_hint_y=None, height=dp(62), spacing=dp(10))
        self.x_input = TextInput(text=self.x_name, hint_text="Имя X", multiline=False, font_size=sp(16), padding=[dp(12), dp(12)], background_normal="", background_active="", foreground_color=self.TEXT_DARK, cursor_color=self.ACCENT)
        self.o_input = TextInput(text=self.o_name, hint_text="Имя O", multiline=False, font_size=sp(16), padding=[dp(12), dp(12)], background_normal="", background_active="", foreground_color=self.TEXT_DARK, cursor_color=self.RED)
        self.x_input.bind(text=self._name_changed)
        self.o_input.bind(text=self._name_changed)
        names_row.add_widget(self.x_input)
        names_row.add_widget(self.o_input)
        self.add_widget(names_row)

        score_row = BoxLayout(size_hint_y=None, height=dp(70), spacing=dp(10))
        self.x_score_label = self._label("X\n0", size=18, bold=True)
        self.draw_label = self._label("Ничьи\n0", size=15, bold=True)
        self.o_score_label = self._label("O\n0", size=18, bold=True)
        score_row.add_widget(self.x_score_label)
        score_row.add_widget(self.draw_label)
        score_row.add_widget(self.o_score_label)
        self.add_widget(score_row)

        self.status = self._label("", size=18, bold=True)
        self.add_widget(self.status)

        board_wrap = BoxLayout(size_hint=(1, 1), padding=dp(4))
        self.grid = GridLayout(cols=3, rows=3, spacing=dp(7), padding=dp(3))
        self.cells = []
        for i in range(9):
            cell = CellButton(index=i, dark=self.dark)
            cell.bind(on_release=self.make_move)
            self.cells.append(cell)
            self.grid.add_widget(cell)
        board_wrap.add_widget(self.grid)
        self.add_widget(board_wrap)

        buttons_row = BoxLayout(size_hint_y=None, height=dp(54), spacing=dp(10))
        self.new_round_button = self._action_button("Новая партия")
        self.reset_button = self._action_button("Сбросить счёт")
        self.new_round_button.bind(on_release=lambda *_: self.new_round())
        self.reset_button.bind(on_release=lambda *_: self.reset_scores())
        buttons_row.add_widget(self.new_round_button)
        buttons_row.add_widget(self.reset_button)
        self.add_widget(buttons_row)

        footer = self._label("Один телефон • передавайте его после каждого хода", size=12)
        footer.size_hint_y = None
        footer.height = dp(26)
        self.add_widget(footer)
        self.footer = footer

    def _action_button(self, text):
        btn = Button(text=text, font_size=sp(15), bold=True, background_normal="")
        return btn

    def _name_changed(self, *_):
        self.x_name = self.x_input.text.strip() or "Игрок 1"
        self.o_name = self.o_input.text.strip() or "Игрок 2"
        if not self.game_over:
            self._update_turn()

    def toggle_theme(self, *_):
        self.dark = not self.dark
        self._update_theme()

    def _update_theme(self):
        if self.dark:
            bg = self.BG_DARK
            panel = self.PANEL_DARK
            text = self.TEXT_DARK
            muted = self.MUTED_DARK
            self.theme_button.background_color = (0.13, 0.16, 0.22, 1)
            self.theme_button.color = text
            self.title.color = text
            self.status.color = text
            self.footer.color = muted
        else:
            bg = self.BG_LIGHT
            panel = self.PANEL_LIGHT
            text = self.TEXT_LIGHT
            muted = self.MUTED_LIGHT
            self.theme_button.background_color = (0.88, 0.90, 0.94, 1)
            self.theme_button.color = text
            self.title.color = text
            self.status.color = text
            self.footer.color = muted

        Window.clearcolor = bg
        self.x_score_label.color = text
        self.draw_label.color = muted
        self.o_score_label.color = text
        for inp in (self.x_input, self.o_input):
            inp.background_color = panel
            inp.foreground_color = text
        for cell in self.cells:
            cell.dark = self.dark
        for btn in (self.new_round_button, self.reset_button):
            btn.background_color = (0.13, 0.16, 0.22, 1) if self.dark else (0.88, 0.90, 0.94, 1)
            btn.color = text

    def _update_turn(self):
        name = self.x_name if self.current == "X" else self.o_name
        if self.current == "X":
            self.status.text = f"Ход: {name}  •  X"
            self.status.color = (0.36, 0.75, 1, 1) if self.dark else (0.05, 0.32, 0.70, 1)
        else:
            self.status.text = f"Ход: {name}  •  O"
            self.status.color = (1, 0.46, 0.53, 1) if self.dark else (0.78, 0.12, 0.22, 1)

    def make_move(self, cell):
        if self.game_over or self.board[cell.index]:
            return

        self.board[cell.index] = self.current
        cell.state = self.current

        winner, line = self.check_winner()
        if winner:
            self.game_over = True
            self.winning_cells = line
            for i in line:
                self.cells[i].winning = True
            winner_name = self.x_name if winner == "X" else self.o_name
            self.status.text = f"Победа: {winner_name}  •  {winner}"
            self.status.color = (0.20, 0.67, 0.40, 1)
            if winner == "X":
                self.x_score += 1
            else:
                self.o_score += 1
            self._update_score_labels()
            return

        if all(self.board):
            self.game_over = True
            self.draws += 1
            self._update_score_labels()
            self.status.text = "Ничья 🤝"
            self.status.color = self.MUTED_DARK if self.dark else self.MUTED_LIGHT
            return

        self.current = "O" if self.current == "X" else "X"
        self._update_turn()

    def check_winner(self):
        combos = (
            (0, 1, 2), (3, 4, 5), (6, 7, 8),
            (0, 3, 6), (1, 4, 7), (2, 5, 8),
            (0, 4, 8), (2, 4, 6),
        )
        for a, b, c in combos:
            if self.board[a] and self.board[a] == self.board[b] == self.board[c]:
                return self.board[a], [a, b, c]
        return None, []

    def new_round(self, *_):
        self.board = ["", "", "", "", "", "", "", "", ""]
        self.current = "X"
        self.game_over = False
        self.winning_cells = []
        for cell in self.cells:
            cell.state = ""
            cell.winning = False
        self._update_turn()

    def reset_scores(self, *_):
        self.x_score = 0
        self.o_score = 0
        self.draws = 0
        self._update_score_labels()
        self.new_round()

    def _update_score_labels(self):
        self.x_score_label.text = f"X\n{self.x_score}"
        self.draw_label.text = f"Ничьи\n{self.draws}"
        self.o_score_label.text = f"O\n{self.o_score}"


class TicTacToeApp(App):
    title = "Крестики Нолики"

    def build(self):
        Window.minimum_width = dp(320)
        Window.minimum_height = dp(560)
        ui = TicTacToeUI()
        ui.bind(size=self._on_root_resize)
        return ui

    def _on_root_resize(self, instance, size):
        # На очень маленьких экранах немного уменьшаем шрифты, чтобы всё помещалось.
        if size[1] < dp(650):
            instance.title.font_size = sp(19)
            instance.status.font_size = sp(16)
        else:
            instance.title.font_size = sp(22)
            instance.status.font_size = sp(18)


if __name__ == "__main__":
    TicTacToeApp().run()
