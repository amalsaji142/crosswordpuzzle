#!/usr/bin/env python3
"""
BYTECROSS - Computer Science Crossword Puzzle (Terminal CLI Edition)
20 Words (10 Across, 10 Down) • 15x15 Connected Grid
"""

import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(SCRIPT_DIR, "puzzle_data.json")

class CrosswordCLI:
    def __init__(self, data_path=DATA_FILE):
        with open(data_path, "r", encoding="utf-8") as f:
            self.data = json.load(f)

        self.rows = self.data["rows"]
        self.cols = self.data["cols"]
        self.words = self.data["words"]

        # Build solution matrix and lookup maps
        self.solution_grid = [[None for _ in range(self.cols)] for _ in range(self.rows)]
        self.cell_numbers = [[None for _ in range(self.cols)] for _ in range(self.rows)]
        self.word_map = {} # (number, direction) -> word_obj

        for w in self.words:
            dr = 0 if w["direction"] == "across" else 1
            dc = 1 if w["direction"] == "across" else 0
            key = (w["number"], w["direction"].lower())
            self.word_map[key] = w

            if self.cell_numbers[w["row"]][w["col"]] is None:
                self.cell_numbers[w["row"]][w["col"]] = w["number"]

            for i, ch in enumerate(w["word"]):
                r = w["row"] + dr * i
                c = w["col"] + dc * i
                self.solution_grid[r][c] = ch

        self.user_grid = [[None if self.solution_grid[r][c] is None else " " for c in range(self.cols)] for r in range(self.rows)]
        self.letter_hints_left = 3
        self.word_hints_left = 2

    def render_board(self):
        print("\n" + "=" * 55)
        print("     BYTECROSS • COMPUTER SCIENCE & TECH CROSSWORD")
        print("=" * 55)
        
        header = "    " + "".join(f"{c:2} " for c in range(self.cols))
        print(header)
        print("   +" + "---+" * self.cols)

        for r in range(self.rows):
            row_str = f"{r:2} |"
            for c in range(self.cols):
                if self.solution_grid[r][c] is None:
                    row_str += "###|"
                else:
                    num = self.cell_numbers[r][c]
                    val = self.user_grid[r][c]
                    if val != " ":
                        # Show entered letter
                        row_str += f" {val} |"
                    elif num is not None:
                        # Show clue number in 2 digits
                        row_str += f"{num:2} |"
                    else:
                        row_str += " . |"
            print(row_str)
            print("   +" + "---+" * self.cols)
        print("   Legend: [##]=Blocked  [1-20]=Word Start  [.]=Empty Letter")

    def print_clues(self):
        print("\n" + "-" * 55)
        print("ACROSS CLUES (10):")
        print("-" * 55)
        across = sorted([w for w in self.words if w["direction"] == "across"], key=lambda x: x["number"])
        for w in across:
            solved = self.is_word_solved(w)
            mark = "[DONE]" if solved else "[    ]"
            print(f" {mark} {w['number']:2}. {w['clue']} ({w['length']} letters)")

        print("\n" + "-" * 55)
        print("DOWN CLUES (10):")
        print("-" * 55)
        down = sorted([w for w in self.words if w["direction"] == "down"], key=lambda x: x["number"])
        for w in down:
            solved = self.is_word_solved(w)
            mark = "[DONE]" if solved else "[    ]"
            print(f" {mark} {w['number']:2}. {w['clue']} ({w['length']} letters)")
        print("-" * 55)

    def is_word_solved(self, w):
        dr = 0 if w["direction"] == "across" else 1
        dc = 1 if w["direction"] == "across" else 0
        for i, ch in enumerate(w["word"]):
            r = w["row"] + dr * i
            c = w["col"] + dc * i
            if self.user_grid[r][c] != ch:
                return False
        return True

    def solve_word(self, number, direction, answer):
        key = (number, direction.lower())
        if key not in self.word_map:
            print(f"Error: Clue {number} {direction.upper()} does not exist!")
            return False

        w = self.word_map[key]
        ans = answer.strip().upper()
        if len(ans) != w["length"]:
            print(f"Error: '{ans}' has length {len(ans)}, but {number} {direction.upper()} requires {w['length']} letters!")
            return False

        dr = 0 if w["direction"] == "across" else 1
        dc = 1 if w["direction"] == "across" else 0
        for i, ch in enumerate(ans):
            r = w["row"] + dr * i
            c = w["col"] + dc * i
            self.user_grid[r][c] = ch

        if ans == w["word"]:
            print(f"-> SUCCESS! '{ans}' is correct for {number} {direction.upper()}!")
        else:
            print(f"-> Placed '{ans}' into grid. Check your answer with 'check' command.")
        return True

    def check_progress(self):
        solved_count = sum(1 for w in self.words if self.is_word_solved(w))
        wrong_letters = 0
        filled_letters = 0

        for r in range(self.rows):
            for c in range(self.cols):
                if self.solution_grid[r][c] is not None and self.user_grid[r][c] != " ":
                    filled_letters += 1
                    if self.user_grid[r][c] != self.solution_grid[r][c]:
                        wrong_letters += 1

        print(f"\nProgress: {solved_count} / {len(self.words)} words solved.")
        print(f"Filled letters: {filled_letters}/111  |  Incorrect letters: {wrong_letters}")
        print(f"Hints remaining: {self.letter_hints_left}/3 Letter Hints  |  {self.word_hints_left}/2 Word Hints")
        if solved_count == len(self.words):
            print("\n" + "*" * 55)
            print("  CONGRATULATIONS! YOU SOLVED THE ENTIRE CROSSWORD!")
            print("*" * 55 + "\n")

    def hint_letter(self, number, direction):
        if self.letter_hints_left <= 0:
            print("-> Error: No Letter hints remaining! (All 3 used)")
            return False

        key = (number, direction.lower())
        if key not in self.word_map:
            print(f"Error: Clue {number} {direction.upper()} does not exist!")
            return False

        w = self.word_map[key]
        dr = 0 if w["direction"] == "across" else 1
        dc = 1 if w["direction"] == "across" else 0

        # Find first unsolved letter
        for i, ch in enumerate(w["word"]):
            r = w["row"] + dr * i
            c = w["col"] + dc * i
            if self.user_grid[r][c] != ch:
                self.user_grid[r][c] = ch
                self.letter_hints_left -= 1
                print(f"-> LETTER HINT ({self.letter_hints_left} left): Letter #{i + 1} of {number} {direction.upper()} is '{ch}' at ({r}, {c})")
                return True
        print(f"-> {number} {direction.upper()} is already completely solved!")
        return False

    def hint_word(self, number, direction):
        if self.word_hints_left <= 0:
            print("-> Error: No Word hints remaining! (All 2 used)")
            return False

        key = (number, direction.lower())
        if key not in self.word_map:
            print(f"Error: Clue {number} {direction.upper()} does not exist!")
            return False

        w = self.word_map[key]
        dr = 0 if w["direction"] == "across" else 1
        dc = 1 if w["direction"] == "across" else 0

        if self.is_word_solved(w):
            print(f"-> {number} {direction.upper()} is already completely solved!")
            return False

        for i, ch in enumerate(w["word"]):
            r = w["row"] + dr * i
            c = w["col"] + dc * i
            self.user_grid[r][c] = ch

        self.word_hints_left -= 1
        print(f"-> WORD HINT ({self.word_hints_left} left): Revealed full word '{w['word']}' for {number} {direction.upper()}!")
        return True

    def reveal_all(self):
        for r in range(self.rows):
            for c in range(self.cols):
                if self.solution_grid[r][c] is not None:
                    self.user_grid[r][c] = self.solution_grid[r][c]
        self.letter_hints_left = 0
        self.word_hints_left = 0
        print("-> All answers revealed!")

    def run_interactive(self):
        self.render_board()
        self.print_clues()
        print("\nCommands:")
        print("  solve <num> <across|down> <word>   (e.g., 'solve 1 across REGISTER' or '1a REGISTER')")
        print("  hint letter <num><a|d>             (e.g., 'hint letter 1a' - Max 3 letter hints)")
        print("  hint word <num><a|d>               (e.g., 'hint word 1a' - Max 2 word hints)")
        print("  hint <num><a|d>                    (Defaults to letter hint)")
        print("  board                              (Reprint the crossword grid)")
        print("  clues                              (Reprint all clues)")
        print("  check                              (Check accuracy, progress & hints remaining)")
        print("  reveal                             (Reveal full solution)")
        print("  quit / exit                        (Exit game)\n")

        while True:
            try:
                line = input("ByteCross> ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\nGoodbye!")
                break

            if not line:
                continue

            parts = line.split()
            cmd = parts[0].lower()

            if cmd in ["quit", "exit"]:
                print("Thanks for playing ByteCross!")
                break

            elif cmd in ["board", "show"]:
                self.render_board()

            elif cmd in ["clues", "hints"]:
                self.print_clues()

            elif cmd in ["check", "status"]:
                self.check_progress()

            elif cmd in ["reveal"]:
                self.reveal_all()
                self.render_board()
                self.check_progress()

            elif cmd in ["hint"]:
                if len(parts) < 2:
                    print("Usage: hint letter <1a> (3 max)  OR  hint word <1a> (2 max)")
                    continue

                mode = "letter"
                arg = parts[1]

                if parts[1].lower() in ["letter", "word"]:
                    mode = parts[1].lower()
                    if len(parts) < 3:
                        print(f"Usage: hint {mode} <1a|1d>")
                        continue
                    arg = parts[2]

                if arg[-1].lower() in ['a', 'd'] and arg[:-1].isdigit():
                    num = int(arg[:-1])
                    direction = "across" if arg[-1].lower() == 'a' else "down"
                elif len(parts) >= 3 and arg.isdigit():
                    num = int(arg)
                    direction = "across" if parts[2].lower().startswith("a") else "down"
                else:
                    print("Usage: hint letter <1a> (3 max)  OR  hint word <1a> (2 max)")
                    continue

                if mode == "word":
                    self.hint_word(num, direction)
                else:
                    self.hint_letter(num, direction)

                self.render_board()
                self.check_progress()

            elif cmd == "solve" or (cmd[:-1].isdigit() and cmd[-1].lower() in ['a', 'd']):
                if cmd == "solve":
                    if len(parts) < 4:
                        if len(parts) == 3 and (parts[1][:-1].isdigit() and parts[1][-1].lower() in ['a', 'd']):
                            arg = parts[1]
                            num = int(arg[:-1])
                            direction = "across" if arg[-1].lower() == 'a' else "down"
                            word = parts[2]
                        else:
                            print("Usage: solve <num> <across|down> <word>  or  solve 1a REGISTER")
                            continue
                    else:
                        num = int(parts[1])
                        direction = "across" if parts[2].lower().startswith("a") else "down"
                        word = parts[3]
                else:
                    # Short form like: 1a REGISTER
                    num = int(cmd[:-1])
                    direction = "across" if cmd[-1].lower() == 'a' else "down"
                    if len(parts) < 2:
                        print("Usage: <num><a|d> <word> (e.g. 1a REGISTER)")
                        continue
                    word = parts[1]

                self.solve_word(num, direction, word)
                self.render_board()
                self.check_progress()

            else:
                print(f"Unknown command '{cmd}'. Type 'board', 'clues', 'solve 1a WORD', 'hint 1a', 'check', or 'quit'.")

def run_tests():
    cli = CrosswordCLI()
    print("Testing CrosswordCLI headless with hint quotas...")
    # Solve word 1 across
    res = cli.solve_word(1, "across", "REGISTER")
    assert res is True
    assert cli.is_word_solved(cli.word_map[(1, "across")]) is True

    # Test Letter hints: exactly 3 available
    assert cli.letter_hints_left == 3
    assert cli.hint_letter(2, "down") is True # 1st hint used
    assert cli.letter_hints_left == 2
    assert cli.hint_letter(2, "down") is True # 2nd hint used
    assert cli.letter_hints_left == 1
    assert cli.hint_letter(2, "down") is True # 3rd hint used
    assert cli.letter_hints_left == 0
    # 4th letter hint should be rejected
    assert cli.hint_letter(2, "down") is False

    # Test Word hints: exactly 2 available
    assert cli.word_hints_left == 2
    assert cli.hint_word(3, "down") is True # 1st word hint used
    assert cli.word_hints_left == 1
    assert cli.hint_word(4, "down") is True # 2nd word hint used
    assert cli.word_hints_left == 0
    # 3rd word hint should be rejected
    assert cli.hint_word(5, "across") is False

    # Test full reveal
    cli.reveal_all()
    assert all(cli.is_word_solved(w) for w in cli.words)
    print("All CLI tests including hint quotas passed successfully!")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        run_tests()
    else:
        app = CrosswordCLI()
        app.run_interactive()
