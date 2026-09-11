# BYTECROSS • Computer Science & Technology Crossword Puzzle

A fully organized, authentic crossword puzzle game themed around **Computer Science & Technology**. It features **20 carefully curated, medium-difficulty words** arranged in an authentic **15×15 connected grid** with **10 Across** and **10 Down** clues.

---

## 🎮 How to Play

You can play this game in two ways:
1. **Interactive Web App** (Recommended) — Rich UI with real-time feedback, keyboard navigation, timer, progress tracker, and print mode.
2. **Terminal CLI Game** — Text-based puzzle solver directly in your command line.

---

### Option 1: Play the Interactive Web Game

#### Quick Start (Zero Setup)
Simply open [`index.html`](file:///C:/Users/thoma/.gemini/antigravity/scratch/cs-crossword-puzzle/index.html) directly in any web browser (Chrome, Edge, Firefox, Safari). No web server or installation required!

```powershell
# In PowerShell:
Start-Process "C:\Users\thoma\.gemini\antigravity\scratch\cs-crossword-puzzle\index.html"
```

#### Alternatively with Python Local Server:
```bash
cd C:\Users\thoma\.gemini\antigravity\scratch\cs-crossword-puzzle
python -m http.server 8080
```
Then visit `http://localhost:8080` in your browser.

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

## 📋 Clues & Word Matrix (20 Words)

### ➡️ Across Clues (10 Words)
| # | Clue | Length | Answer |
| :-: | :--- | :-: | :--- |
| **1** | Smallest and fastest memory storage inside the CPU | 8 | `REGISTER` |
| **5** | Network security barrier monitoring incoming and outgoing traffic | 8 | `FIREWALL` |
| **6** | High-speed temporary storage layer to reduce memory latency | 5 | `CACHE` |
| **8** | Algorithm for training neural networks by calculating gradients | 8 | `BACKPROP` |
| **10** | Structured collection of data organized for efficient retrieval | 8 | `DATABASE` |
| **15** | Atomic unit created by lexical analysis during code parsing | 5 | `TOKEN` |
| **17** | Core component of an OS managing system resources and hardware | 6 | `KERNEL` |
| **18** | Synchronization lock preventing concurrent access to shared resources | 5 | `MUTEX` |
| **19** | Medium retaining digital information persistently or temporarily | 7 | `STORAGE` |
| **20** | Variable holding the memory address of another variable | 7 | `POINTER` |

### ⬇️ Down Clues (10 Words)
| # | Clue | Length | Answer |
| :-: | :--- | :-: | :--- |
| **2** | Last-In, First-Out (LIFO) linear data structure | 5 | `STACK` |
| **3** | Structural blueprint and constraint definition of a database | 6 | `SCHEMA` |
| **4** | Smallest unit of execution managed independently by an OS scheduler | 6 | `THREAD` |
| **7** | Software endpoint for sending and receiving network traffic | 6 | `SOCKET` |
| **9** | Formal set of rules governing data communication across networks | 8 | `PROTOCOL` |
| **11** | Standard technology for wired local area networks | 8 | `ETHERNET` |
| **12** | Key-value data structure providing average O(1) time complexity | 7 | `HASHMAP` |
| **13** | Binary data type representing truth values (true/false) | 7 | `BOOLEAN` |
| **14** | Data structure that speeds up query retrieval in databases | 5 | `INDEX` |
| **16** | Formatted unit of data routed through a computer network | 6 | `PACKET` |

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
├── index.html          # Interactive single-page web app
├── style.css           # Styling, dark tech theme, responsiveness, @media print
├── app.js              # Game logic, state manager, keyboard navigation, timer
├── puzzle_data.json    # Verified 15x15 layout, words, clues, and coordinates
├── crossword_cli.py    # Python terminal CLI edition
├── verify_puzzle.py    # Automated test script checking grid integrity
└── README.md           # Documentation, gameplay guide, and answer key
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
