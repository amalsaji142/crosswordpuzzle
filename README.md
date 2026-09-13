# BYTECROSS • Computer Science & Technology Crossword Puzzle

A fully organized, authentic crossword puzzle game themed around **Computer Science & Technology**. It features **20 carefully curated, medium-difficulty words** arranged in an authentic **15×15 connected grid** with **10 Across** and **10 Down** clues.

---

## 🎮 How to Play

You can use this game in two ways:
1. **React TypeScript Component (`.tsx`)** (Recommended) — Drop `<CrosswordGame />` directly into your React / Next.js / Vite application with full state management in `games/logic.tsx`.
2. **Terminal CLI Game** — Text-based puzzle solver directly in your command line.

---

### Option 1: Use in React / TypeScript Application

The game is modularized inside the [`games/`](file:///C:/Users/thoma/.gemini/antigravity/scratch/cs-crossword-puzzle/games/) folder:
- **`games/logic.tsx`**: Contains all game logic, state management hook `useCrosswordGame()`, strict hint quotas (3 letter hints & 2 word hints), cell calculations, timer, and validation.
- **`games/CrosswordGame.tsx`**: Full interactive TSX component with keyboard navigation, active word highlights, modal popups, and print layout.
- **`games/CrosswordGame.css`**: Complete responsive dark tech theme & print media stylesheet.

#### Example Usage:
```tsx
import React from 'react';
import { CrosswordGame } from './games';

export default function App() {
  return (
    <main>
      <CrosswordGame />
    </main>
  );
}
```

Or consume the logic hook separately for custom UI:
```tsx
import { useCrosswordGame } from './games/logic';

export function CustomCrossword() {
  const {
    gridState,
    activeCell,
    activeWord,
    letterHintsRemaining,
    wordHintsRemaining,
    handleCellClick,
    checkCurrentWord,
    revealCurrentLetter
  } = useCrosswordGame();

  // Render custom UI using the hook
}
```

#### Controls & Shortcuts
| Action | Key / Gesture |
| :--- | :--- |
| **Select Cell / Clue** | Click any playable grid cell or click any clue in the list |
| **Toggle Direction** | Click the active cell again or press <kbd>Space</kbd> |
| **Enter Letter** | Type <kbd>A</kbd> – <kbd>Z</kbd> (automatically advances to the next cell) |
| **Erase Letter** | Press <kbd>Backspace</kbd> (erases and moves back) |
| **Navigate Grid** | Arrow keys (<kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd>) |
| **Next / Prev Word** | <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> |
| **Check Current Word** | Press <kbd>Enter</kbd> or click **Check Word** |
| **Letter Hints (Quota: 3)** | Click **Reveal Letter** (reveals letter in current cell, max 3 per game) |
| **Word Hints (Quota: 2)** | Click **Reveal Word** (reveals the entire active word, max 2 per game) |
| **Print** | Click **Print** to generate a clean, paper-ready worksheet |

---

### Option 2: Play the Terminal CLI Game

Run the interactive Python CLI:

```bash
cd C:\Users\thoma\.gemini\antigravity\scratch\cs-crossword-puzzle
python crossword_cli.py
```

#### CLI Commands
- `solve <num> <across|down> <word>` or `<num><a|d> <word>`  
  *(e.g., `solve 1 across REGISTER` or `1a REGISTER`)*
- `hint letter <num><a|d>` or `hint <num><a|d>` *(reveals next letter; max 3 uses per game)*
- `hint word <num><a|d>` *(reveals complete word; max 2 uses per game)*
- `board` *(re-render the ASCII 15×15 grid)*
- `clues` *(display all Across and Down clues with completion status)*
- `check` *(show count of solved words, letter accuracy, and remaining hint quotas)*
- `reveal` *(reveal the full solution)*
- `quit` *(exit the game)*

---

## 📋 Clues & Word Matrix (20 Easy Words)

### ➡️ Across Clues (10 Words)
| # | Clue | Length | Answer |
| :-: | :--- | :-: | :--- |
| **4** | The smallest single point of color on a screen | 5 | `PIXEL` |
| **6** | A central computer that serves web pages or files to clients | 6 | `SERVER` |
| **7** | Software like Chrome or Edge used to view websites | 7 | `BROWSER` |
| **8** | Number system made up of only 0s and 1s | 6 | `BINARY` |
| **9** | Clickable graphic on a screen that triggers an action | 6 | `BUTTON` |
| **11** | Popular beginner-friendly programming language named after a comedy group | 6 | `PYTHON` |
| **14** | A combination of hardware and software working together | 6 | `SYSTEM` |
| **16** | Information displayed or produced by a computer | 6 | `OUTPUT` |
| **17** | A website address like google.com or wikipedia.org | 6 | `DOMAIN` |
| **18** | Sending a file or photo from your device to the internet | 6 | `UPLOAD` |

### ⬇️ Down Clues (10 Words)
| # | Clue | Length | Answer |
| :-: | :--- | :-: | :--- |
| **1** | Organized digital storage of information and records | 8 | `DATABASE` |
| **2** | Writing instructions in a programming language for a computer to run | 6 | `CODING` |
| **3** | Restarting a computer to fix glitches or apply updates | 6 | `REBOOT` |
| **5** | Worldwide network connecting millions of computers together | 8 | `INTERNET` |
| **6** | Typing a query into Google or a browser to find information | 6 | `SEARCH` |
| **10** | Online servers where you store data instead of local hard drives | 5 | `CLOUD` |
| **11** | Secret code used to lock and protect your account | 8 | `PASSWORD` |
| **12** | A duplicate copy of files saved to prevent data loss | 6 | `BACKUP` |
| **13** | A portable computer you can carry and use on your lap | 6 | `LAPTOP` |
| **15** | Electronic mail sent over the internet | 5 | `EMAIL` |

---

## 🖨️ Printable Classroom / Worksheet Mode

Want to use this as a physical handout or test for students / friends?
1. Open [`index.html`](file:///C:/Users/thoma/.gemini/antigravity/scratch/cs-crossword-puzzle/index.html) in your browser.
2. Click the **Print** button in the top-right header or press <kbd>Ctrl</kbd> + <kbd>P</kbd>.
3. The page automatically hides all UI controls, toolbars, and answers, rendering a clean black-and-white 15×15 blank crossword grid alongside nicely organized Across and Down clue columns ready for printing on A4 or Letter paper.

---

## 📁 Project Structure

```
cs-crossword-puzzle/
├── games/
│   ├── logic.tsx           # Complete game logic, hooks, state, hint quotas & types
│   ├── CrosswordGame.tsx   # Interactive React TypeScript crossword component
│   ├── CrosswordGame.css   # Dark tech theme, grid layout & print styling
│   └── index.ts            # Barrel export for easy imports
├── package.json            # Package manifest with React dependencies
├── tsconfig.json           # TypeScript configuration
├── puzzle_data.json        # Verified 15x15 layout, words, clues, and coordinates
├── crossword_cli.py        # Python terminal CLI edition
├── verify_puzzle.py        # Automated test script checking grid integrity
└── README.md               # Documentation, gameplay guide, and answer key
```

---

## 🔬 Automated Verification

Run the test suite to verify grid geometry, word intersections, bounds, and numbering:

```bash
python verify_puzzle.py
```
Outputs:
```text
Verifying Crossword: 'Computer Science & Tech Crossword' (15x15)
  [OK] 20 words total: 10 Across, 10 Down
  [OK] All 20 words fit within 15x15 grid with 0 letter conflicts
  [OK] Total filled letter cells: 111
  [OK] Fully connected crossword graph (all 20 words intersect seamlessly)
  [OK] Standard crossword numbering strictly verified (Numbers 1 to 20)
ALL VERIFICATIONS PASSED SUCCESSFULLY!
```
