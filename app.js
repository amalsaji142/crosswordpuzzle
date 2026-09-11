/**
 * BYTECROSS - Computer Science & Technology Crossword Puzzle
 * 15x15 Grid with 20 Words (10 Across, 10 Down)
 */

// Puzzle Data Specification
const PUZZLE_DATA = {
  title: "Computer Science & Tech Crossword",
  topic: "Computer Science & Technology",
  difficulty: "Medium",
  rows: 15,
  cols: 15,
  words: [
    { number: 1, direction: "across", word: "REGISTER", clue: "Smallest and fastest memory storage inside the CPU", row: 0, col: 6, length: 8 },
    { number: 2, direction: "down", word: "STACK", clue: "Last-In, First-Out (LIFO) linear data structure", row: 0, col: 10, length: 5 },
    { number: 3, direction: "down", word: "SCHEMA", clue: "Structural blueprint and constraint definition of a database", row: 2, col: 0, length: 6 },
    { number: 4, direction: "down", word: "THREAD", clue: "Smallest unit of execution managed independently by an OS scheduler", row: 2, col: 3, length: 6 },
    { number: 5, direction: "across", word: "FIREWALL", clue: "Network security barrier monitoring incoming and outgoing traffic", row: 2, col: 5, length: 8 },
    { number: 6, direction: "across", word: "CACHE", clue: "High-speed temporary storage layer to reduce memory latency", row: 3, col: 0, length: 5 },
    { number: 7, direction: "down", word: "SOCKET", clue: "Software endpoint for sending and receiving network traffic", row: 3, col: 13, length: 6 },
    { number: 8, direction: "across", word: "BACKPROP", clue: "Algorithm for training neural networks by calculating gradients", row: 4, col: 7, length: 8 },
    { number: 9, direction: "down", word: "PROTOCOL", clue: "Formal set of rules governing data communication across networks", row: 4, col: 11, length: 8 },
    { number: 10, direction: "across", word: "DATABASE", clue: "Structured collection of data organized for efficient retrieval", row: 6, col: 2, length: 8 },
    { number: 11, direction: "down", word: "ETHERNET", clue: "Standard technology for wired local area networks", row: 6, col: 9, length: 8 },
    { number: 12, direction: "down", word: "HASHMAP", clue: "Key-value data structure providing average O(1) time complexity", row: 8, col: 1, length: 7 },
    { number: 13, direction: "down", word: "BOOLEAN", clue: "Binary data type representing truth values (true/false)", row: 8, col: 4, length: 7 },
    { number: 14, direction: "down", word: "INDEX", clue: "Data structure that speeds up query retrieval in databases", row: 8, col: 7, length: 5 },
    { number: 15, direction: "across", word: "TOKEN", clue: "Atomic unit created by lexical analysis during code parsing", row: 9, col: 3, length: 5 },
    { number: 16, direction: "down", word: "PACKET", clue: "Formatted unit of data routed through a computer network", row: 9, col: 14, length: 6 },
    { number: 17, direction: "across", word: "KERNEL", clue: "Core component of an OS managing system resources and hardware", row: 11, col: 6, length: 6 },
    { number: 18, direction: "across", word: "MUTEX", clue: "Synchronization lock preventing concurrent access to shared resources", row: 12, col: 1, length: 5 },
    { number: 19, direction: "across", word: "STORAGE", clue: "Medium retaining digital information persistently or temporarily", row: 13, col: 8, length: 7 },
    { number: 20, direction: "across", word: "POINTER", clue: "Variable holding the memory address of another variable", row: 14, col: 1, length: 7 }
  ]
};

class CrosswordGame {
  constructor(data) {
    this.data = data;
    this.rows = data.rows;
    this.cols = data.cols;
    this.words = data.words;

    // Build letter solution matrix and word mappings
    this.solutionGrid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
    this.cellNumbers = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
    this.cellToWords = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null).map(() => ({})));

    // Populate solution grid and metadata
    this.words.forEach(w => {
      const dr = w.direction === "across" ? 0 : 1;
      const dc = w.direction === "across" ? 1 : 0;
      
      // Starting cell gets clue number
      if (!this.cellNumbers[w.row][w.col]) {
        this.cellNumbers[w.row][w.col] = w.number;
      }

      for (let i = 0; i < w.word.length; i++) {
        const r = w.row + dr * i;
        const c = w.col + dc * i;
        this.solutionGrid[r][c] = w.word[i];
        this.cellToWords[r][c][w.direction] = w;
      }
    });

    // Player State
    this.gridState = Array(this.rows).fill(null).map(() => Array(this.cols).fill(""));
    this.revealedCells = new Set();
    this.activeCell = { r: 0, c: 6 }; // Default to first word (1 Across)
    this.activeDirection = "across";
    this.hintsUsed = 0;
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.gameCompleted = false;

    // Hint Quotas (3 Letter Hints, 2 Word Hints)
    this.letterHintsRemaining = 3;
    this.wordHintsRemaining = 2;

    // DOM Elements
    this.gridEl = document.getElementById("crossword-grid");
    this.acrossListEl = document.getElementById("across-clues");
    this.downListEl = document.getElementById("down-clues");
    this.activeClueNumEl = document.getElementById("active-clue-num");
    this.activeClueTextEl = document.getElementById("active-clue-text");
    this.activeClueLenEl = document.getElementById("active-clue-len");
    this.timerDisplayEl = document.getElementById("timer-display");
    this.progressDisplayEl = document.getElementById("progress-display");
    this.hintsDisplayEl = document.getElementById("hints-display");
    this.btnHintLetter = document.getElementById("btn-hint-letter");
    this.btnHintWord = document.getElementById("btn-hint-word");
    this.badgeHintLetter = document.getElementById("badge-hint-letter");
    this.badgeHintWord = document.getElementById("badge-hint-word");

    this.init();
  }

  init() {
    this.renderGrid();
    this.renderClues();
    this.bindEvents();
    this.loadSavedState();
    this.updateHintButtons();
    this.startTimer();
    this.selectWord(this.words[0]); // Select 1 Across initially
    this.updateProgress();
  }

  updateHintButtons() {
    if (this.badgeHintLetter) {
      this.badgeHintLetter.textContent = `${this.letterHintsRemaining} left`;
    }
    if (this.btnHintLetter) {
      this.btnHintLetter.disabled = this.letterHintsRemaining <= 0;
    }
    if (this.badgeHintWord) {
      this.badgeHintWord.textContent = `${this.wordHintsRemaining} left`;
    }
    if (this.btnHintWord) {
      this.btnHintWord.disabled = this.wordHintsRemaining <= 0;
    }
    if (this.hintsDisplayEl) {
      this.hintsDisplayEl.textContent = `${this.letterHintsRemaining}L / ${this.wordHintsRemaining}W`;
    }
  }

  renderGrid() {
    this.gridEl.innerHTML = "";
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cellEl = document.createElement("div");
        cellEl.className = "grid-cell";
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;

        if (this.solutionGrid[r][c] === null) {
          cellEl.classList.add("blocked");
        } else {
          // Number indicator
          if (this.cellNumbers[r][c]) {
            const numEl = document.createElement("span");
            numEl.className = "cell-number";
            numEl.textContent = this.cellNumbers[r][c];
            cellEl.appendChild(numEl);
          }

          // Letter container
          const letterEl = document.createElement("span");
          letterEl.className = "cell-letter";
          letterEl.textContent = this.gridState[r][c] || "";
          cellEl.appendChild(letterEl);

          cellEl.addEventListener("click", () => this.handleCellClick(r, c));
        }

        this.gridEl.appendChild(cellEl);
      }
    }
  }

  renderClues() {
    this.acrossListEl.innerHTML = "";
    this.downListEl.innerHTML = "";

    const acrossWords = this.words.filter(w => w.direction === "across").sort((a, b) => a.number - b.number);
    const downWords = this.words.filter(w => w.direction === "down").sort((a, b) => a.number - b.number);

    acrossWords.forEach(w => {
      const item = this.createClueItem(w);
      this.acrossListEl.appendChild(item);
    });

    downWords.forEach(w => {
      const item = this.createClueItem(w);
      this.downListEl.appendChild(item);
    });
  }

  createClueItem(wordObj) {
    const li = document.createElement("li");
    li.className = "clue-item";
    li.id = `clue-${wordObj.direction}-${wordObj.number}`;
    li.innerHTML = `
      <span class="clue-num">${wordObj.number}.</span>
      <span class="clue-text">${wordObj.clue} <span class="clue-len-tag">(${wordObj.length})</span></span>
    `;
    li.addEventListener("click", () => {
      this.selectWord(wordObj);
    });
    return li;
  }

  bindEvents() {
    // Keyboard Input
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // Toolbar Buttons
    document.getElementById("btn-check-word").addEventListener("click", () => this.checkCurrentWord());
    document.getElementById("btn-check-puzzle").addEventListener("click", () => this.checkEntirePuzzle());
    document.getElementById("btn-hint-letter").addEventListener("click", () => this.revealCurrentLetter());
    document.getElementById("btn-hint-word").addEventListener("click", () => this.revealCurrentWord());
    document.getElementById("btn-reveal-all").addEventListener("click", () => this.revealAllPuzzle());
    document.getElementById("btn-clear-word").addEventListener("click", () => this.clearCurrentWord());
    
    // Reset Modal
    document.getElementById("btn-reset").addEventListener("click", () => {
      document.getElementById("reset-modal").classList.add("open");
    });
    document.getElementById("btn-cancel-reset").addEventListener("click", () => {
      document.getElementById("reset-modal").classList.remove("open");
    });
    document.getElementById("btn-confirm-reset").addEventListener("click", () => {
      this.resetPuzzle();
      document.getElementById("reset-modal").classList.remove("open");
    });

    // Help Modal
    document.getElementById("btn-help").addEventListener("click", () => {
      document.getElementById("help-modal").classList.add("open");
    });
    document.getElementById("btn-close-help").addEventListener("click", () => {
      document.getElementById("help-modal").classList.remove("open");
    });

    // Victory Modal
    document.getElementById("btn-win-replay").addEventListener("click", () => {
      document.getElementById("victory-modal").classList.remove("open");
      this.resetPuzzle();
    });
    document.getElementById("btn-win-close").addEventListener("click", () => {
      document.getElementById("victory-modal").classList.remove("open");
    });

    // Print
    document.getElementById("btn-print").addEventListener("click", () => {
      window.print();
    });
  }

  handleCellClick(r, c) {
    if (this.solutionGrid[r][c] === null) return;

    const availableWords = this.cellToWords[r][c];

    // If clicking the currently active cell, toggle direction if both exist
    if (this.activeCell.r === r && this.activeCell.c === c) {
      if (availableWords.across && availableWords.down) {
        this.activeDirection = this.activeDirection === "across" ? "down" : "across";
      }
    } else {
      this.activeCell = { r, c };
      // Keep current direction if valid for new cell; otherwise switch to the available one
      if (!availableWords[this.activeDirection]) {
        this.activeDirection = availableWords.across ? "across" : "down";
      }
    }

    this.updateSelection();
  }

  selectWord(wordObj) {
    this.activeDirection = wordObj.direction;
    
    // Find the first unfilled cell in this word, or default to word start
    const dr = wordObj.direction === "across" ? 0 : 1;
    const dc = wordObj.direction === "across" ? 1 : 0;
    let targetCell = { r: wordObj.row, c: wordObj.col };

    for (let i = 0; i < wordObj.length; i++) {
      const cr = wordObj.row + dr * i;
      const cc = wordObj.col + dc * i;
      if (!this.gridState[cr][cc]) {
        targetCell = { r: cr, c: cc };
        break;
      }
    }

    this.activeCell = targetCell;
    this.updateSelection();
  }

  getActiveWord() {
    const { r, c } = this.activeCell;
    return this.cellToWords[r][c][this.activeDirection] || 
           this.cellToWords[r][c][this.activeDirection === "across" ? "down" : "across"];
  }

  updateSelection() {
    const activeWord = this.getActiveWord();
    if (!activeWord) return;

    // Ensure activeDirection matches current activeWord
    this.activeDirection = activeWord.direction;

    // Clear all highlight classes
    document.querySelectorAll(".grid-cell").forEach(el => {
      el.classList.remove("active-cell", "active-word", "active-intersect");
    });
    document.querySelectorAll(".clue-item").forEach(el => el.classList.remove("active"));

    // Highlight active word cells
    const dr = activeWord.direction === "across" ? 0 : 1;
    const dc = activeWord.direction === "across" ? 1 : 0;
    for (let i = 0; i < activeWord.length; i++) {
      const cr = activeWord.row + dr * i;
      const cc = activeWord.col + dc * i;
      const cellEl = this.getCellEl(cr, cc);
      if (cellEl) {
        cellEl.classList.add("active-word");
      }
    }

    // Highlight active cell
    const currentCellEl = this.getCellEl(this.activeCell.r, this.activeCell.c);
    if (currentCellEl) {
      currentCellEl.classList.add("active-cell");
    }

    // Highlight intersecting word cells subtly
    const otherDirection = this.activeDirection === "across" ? "down" : "across";
    const otherWord = this.cellToWords[this.activeCell.r][this.activeCell.c][otherDirection];
    if (otherWord) {
      const odr = otherWord.direction === "across" ? 0 : 1;
      const odc = otherWord.direction === "across" ? 1 : 0;
      for (let i = 0; i < otherWord.length; i++) {
        const cr = otherWord.row + odr * i;
        const cc = otherWord.col + odc * i;
        if (cr !== this.activeCell.r || cc !== this.activeCell.c) {
          const cellEl = this.getCellEl(cr, cc);
          if (cellEl && !cellEl.classList.contains("active-word")) {
            cellEl.classList.add("active-intersect");
          }
        }
      }
    }

    // Update Active Clue Bar
    this.activeClueNumEl.textContent = `${activeWord.number} ${activeWord.direction.toUpperCase()}`;
    this.activeClueTextEl.textContent = activeWord.clue;
    this.activeClueLenEl.textContent = `(${activeWord.length} letters)`;

    // Highlight and scroll to clue in list
    const activeClueEl = document.getElementById(`clue-${activeWord.direction}-${activeWord.number}`);
    if (activeClueEl) {
      activeClueEl.classList.add("active");
      activeClueEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  handleKeyDown(e) {
    // Ignore key presses if inside a modal
    if (document.querySelector(".modal-overlay.open")) {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("open"));
      }
      return;
    }

    const { r, c } = this.activeCell;
    const activeWord = this.getActiveWord();

    // Letter Input [A-Z]
    if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      const letter = e.key.toUpperCase();
      this.setCellValue(r, c, letter);

      // Clear any incorrect styling on edit
      const cellEl = this.getCellEl(r, c);
      if (cellEl) cellEl.classList.remove("incorrect", "correct");

      this.moveInActiveWord(1);
      this.checkWordAutoCompletion(activeWord);
      this.saveState();
      return;
    }

    // Backspace
    if (e.key === "Backspace") {
      e.preventDefault();
      if (this.gridState[r][c] !== "") {
        this.setCellValue(r, c, "");
      } else {
        this.moveInActiveWord(-1);
        this.setCellValue(this.activeCell.r, this.activeCell.c, "");
      }
      const cellEl = this.getCellEl(this.activeCell.r, this.activeCell.c);
      if (cellEl) cellEl.classList.remove("incorrect", "correct");
      this.saveState();
      return;
    }

    // Spacebar: Toggle Across / Down
    if (e.key === " ") {
      e.preventDefault();
      const available = this.cellToWords[r][c];
      if (available.across && available.down) {
        this.activeDirection = this.activeDirection === "across" ? "down" : "across";
        this.updateSelection();
      }
      return;
    }

    // Arrow Navigation
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      const dr = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
      const dc = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      
      let nr = r + dr;
      let nc = c + dc;
      // Skip blocked cells in the arrow direction
      while (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
        if (this.solutionGrid[nr][nc] !== null) {
          this.activeCell = { r: nr, c: nc };
          if (dr !== 0 && this.cellToWords[nr][nc].down) this.activeDirection = "down";
          if (dc !== 0 && this.cellToWords[nr][nc].across) this.activeDirection = "across";
          this.updateSelection();
          break;
        }
        nr += dr;
        nc += dc;
      }
      return;
    }

    // Tab / Shift+Tab: Jump between words
    if (e.key === "Tab") {
      e.preventDefault();
      this.jumpNextWord(e.shiftKey ? -1 : 1);
      return;
    }

    // Enter: Check active word
    if (e.key === "Enter") {
      e.preventDefault();
      this.checkCurrentWord();
      return;
    }
  }

  moveInActiveWord(step) {
    const activeWord = this.getActiveWord();
    if (!activeWord) return;

    const dr = activeWord.direction === "across" ? 0 : 1;
    const dc = activeWord.direction === "across" ? 1 : 0;

    // Calculate index within word
    const currentIndex = activeWord.direction === "across" ? 
      (this.activeCell.c - activeWord.col) : (this.activeCell.r - activeWord.row);

    const nextIndex = currentIndex + step;
    if (nextIndex >= 0 && nextIndex < activeWord.length) {
      this.activeCell = {
        r: activeWord.row + dr * nextIndex,
        c: activeWord.col + dc * nextIndex
      };
      this.updateSelection();
    }
  }

  jumpNextWord(delta) {
    const currentIndex = this.words.findIndex(w => 
      w.number === this.getActiveWord().number && w.direction === this.getActiveWord().direction
    );
    const nextIndex = (currentIndex + delta + this.words.length) % this.words.length;
    this.selectWord(this.words[nextIndex]);
  }

  setCellValue(r, c, letter) {
    this.gridState[r][c] = letter;
    const cellEl = this.getCellEl(r, c);
    if (cellEl) {
      const letterSpan = cellEl.querySelector(".cell-letter");
      if (letterSpan) letterSpan.textContent = letter;
    }
  }

  getCellEl(r, c) {
    return this.gridEl.querySelector(`[data-row='${r}'][data-col='${c}']`);
  }

  checkCurrentWord() {
    const word = this.getActiveWord();
    if (!word) return;

    const dr = word.direction === "across" ? 0 : 1;
    const dc = word.direction === "across" ? 1 : 0;
    let allCorrect = true;
    let anyEmpty = false;

    for (let i = 0; i < word.length; i++) {
      const cr = word.row + dr * i;
      const cc = word.col + dc * i;
      const entered = this.gridState[cr][cc];
      const correct = this.solutionGrid[cr][cc];
      const cellEl = this.getCellEl(cr, cc);

      if (!entered) {
        anyEmpty = true;
        allCorrect = false;
        continue;
      }

      if (entered === correct) {
        cellEl.classList.remove("incorrect");
        cellEl.classList.add("correct");
      } else {
        allCorrect = false;
        cellEl.classList.remove("correct");
        cellEl.classList.add("incorrect");
      }
    }

    if (allCorrect) {
      this.showToast(`Great job! "${word.word}" is correct!`);
      this.markWordCompleted(word);
      this.checkPuzzleCompletion();
    } else if (anyEmpty) {
      this.showToast(`Word is incomplete.`);
    } else {
      this.showToast(`Some letters in "${word.number} ${word.direction}" are incorrect.`);
    }
  }

  checkEntirePuzzle() {
    let wrongCount = 0;
    let filledCount = 0;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.solutionGrid[r][c] !== null) {
          const entered = this.gridState[r][c];
          const cellEl = this.getCellEl(r, c);
          cellEl.classList.remove("correct", "incorrect");

          if (entered) {
            filledCount++;
            if (entered === this.solutionGrid[r][c]) {
              cellEl.classList.add("correct");
            } else {
              wrongCount++;
              cellEl.classList.add("incorrect");
            }
          }
        }
      }
    }

    if (wrongCount === 0 && filledCount === 111) {
      this.checkPuzzleCompletion();
    } else if (wrongCount === 0) {
      this.showToast(`All ${filledCount} entered letters are currently correct! Keep going.`);
    } else {
      this.showToast(`Found ${wrongCount} incorrect letter${wrongCount > 1 ? "s" : ""}.`);
    }
  }

  revealCurrentLetter() {
    if (this.letterHintsRemaining <= 0) {
      this.showToast("No Letter hints remaining! (All 3 used)");
      return;
    }

    const { r, c } = this.activeCell;
    const correctLetter = this.solutionGrid[r][c];
    if (!correctLetter) return;

    if (this.gridState[r][c] === correctLetter && this.revealedCells.has(`${r},${c}`)) {
      this.showToast("This cell is already revealed!");
      return;
    }

    this.letterHintsRemaining--;
    this.hintsUsed++;
    this.updateHintButtons();

    this.setCellValue(r, c, correctLetter);
    this.revealedCells.add(`${r},${c}`);

    const cellEl = this.getCellEl(r, c);
    if (cellEl) {
      cellEl.classList.remove("incorrect");
      cellEl.classList.add("revealed", "correct");
    }

    this.showToast(`Revealed letter '${correctLetter}' (${this.letterHintsRemaining} letter hints left)`);
    this.moveInActiveWord(1);
    this.checkWordAutoCompletion(this.getActiveWord());
    this.saveState();
  }

  revealCurrentWord() {
    if (this.wordHintsRemaining <= 0) {
      this.showToast("No Word hints remaining! (All 2 used)");
      return;
    }

    const word = this.getActiveWord();
    if (!word) return;

    // Check if word is already completely correct
    const dr = word.direction === "across" ? 0 : 1;
    const dc = word.direction === "across" ? 1 : 0;
    let alreadySolved = true;
    for (let i = 0; i < word.length; i++) {
      if (this.gridState[word.row + dr * i][word.col + dc * i] !== word.word[i]) {
        alreadySolved = false;
        break;
      }
    }

    if (alreadySolved) {
      this.showToast(`"${word.word}" is already solved!`);
      return;
    }

    this.wordHintsRemaining--;
    this.hintsUsed += word.length;
    this.updateHintButtons();

    for (let i = 0; i < word.length; i++) {
      const cr = word.row + dr * i;
      const cc = word.col + dc * i;
      this.setCellValue(cr, cc, word.word[i]);
      this.revealedCells.add(`${cr},${cc}`);
      const cellEl = this.getCellEl(cr, cc);
      if (cellEl) {
        cellEl.classList.remove("incorrect");
        cellEl.classList.add("revealed", "correct");
      }
    }

    this.markWordCompleted(word);
    this.showToast(`Revealed word: "${word.word}" (${this.wordHintsRemaining} word hints left)`);
    this.checkPuzzleCompletion();
    this.saveState();
  }

  revealAllPuzzle() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.solutionGrid[r][c] !== null) {
          this.setCellValue(r, c, this.solutionGrid[r][c]);
          const cellEl = this.getCellEl(r, c);
          if (cellEl) {
            cellEl.classList.remove("incorrect");
            cellEl.classList.add("correct", "revealed");
          }
        }
      }
    }

    this.letterHintsRemaining = 0;
    this.wordHintsRemaining = 0;
    this.updateHintButtons();
    this.words.forEach(w => this.markWordCompleted(w));
    this.hintsUsed = 111;
    this.showToast("All words revealed.");
    this.checkPuzzleCompletion();
    this.saveState();
  }

  clearCurrentWord() {
    const word = this.getActiveWord();
    if (!word) return;

    const dr = word.direction === "across" ? 0 : 1;
    const dc = word.direction === "across" ? 1 : 0;

    for (let i = 0; i < word.length; i++) {
      const cr = word.row + dr * i;
      const cc = word.col + dc * i;
      // Don't clear intersecting letters of other completed words unless necessary
      this.setCellValue(cr, cc, "");
      const cellEl = this.getCellEl(cr, cc);
      if (cellEl) {
        cellEl.classList.remove("correct", "incorrect", "revealed");
      }
    }

    this.unmarkWordCompleted(word);
    this.activeCell = { r: word.row, c: word.col };
    this.updateSelection();
    this.saveState();
  }

  resetPuzzle() {
    this.gridState = Array(this.rows).fill(null).map(() => Array(this.cols).fill(""));
    this.revealedCells.clear();
    this.hintsUsed = 0;
    this.timerSeconds = 0;
    this.gameCompleted = false;

    document.querySelectorAll(".grid-cell").forEach(el => {
      el.classList.remove("correct", "incorrect", "revealed", "active-cell", "active-word", "active-intersect");
      const span = el.querySelector(".cell-letter");
      if (span) span.textContent = "";
    });

    document.querySelectorAll(".clue-item").forEach(el => el.classList.remove("completed", "active"));

    localStorage.removeItem("bytecross_saved_game");
    this.letterHintsRemaining = 3;
    this.wordHintsRemaining = 2;
    this.updateHintButtons();
    this.selectWord(this.words[0]);
    this.updateProgress();
    this.showToast("Puzzle has been reset.");
  }

  checkWordAutoCompletion(word) {
    if (!word) return;
    const dr = word.direction === "across" ? 0 : 1;
    const dc = word.direction === "across" ? 1 : 0;
    let wordEntered = "";

    for (let i = 0; i < word.length; i++) {
      const cr = word.row + dr * i;
      const cc = word.col + dc * i;
      wordEntered += this.gridState[cr][cc];
    }

    if (wordEntered === word.word) {
      this.markWordCompleted(word);
      this.checkPuzzleCompletion();
    } else {
      this.unmarkWordCompleted(word);
    }
    this.updateProgress();
  }

  markWordCompleted(word) {
    const clueEl = document.getElementById(`clue-${word.direction}-${word.number}`);
    if (clueEl) clueEl.classList.add("completed");
    this.updateProgress();
  }

  unmarkWordCompleted(word) {
    const clueEl = document.getElementById(`clue-${word.direction}-${word.number}`);
    if (clueEl) clueEl.classList.remove("completed");
    this.updateProgress();
  }

  updateProgress() {
    let completedCount = 0;
    this.words.forEach(w => {
      const dr = w.direction === "across" ? 0 : 1;
      const dc = w.direction === "across" ? 1 : 0;
      let matched = true;
      for (let i = 0; i < w.length; i++) {
        if (this.gridState[w.row + dr * i][w.col + dc * i] !== w.word[i]) {
          matched = false;
          break;
        }
      }
      if (matched) {
        completedCount++;
        const clueEl = document.getElementById(`clue-${w.direction}-${w.number}`);
        if (clueEl) clueEl.classList.add("completed");
      }
    });

    this.progressDisplayEl.textContent = `${completedCount} / ${this.words.length}`;
    return completedCount;
  }

  checkPuzzleCompletion() {
    const solvedCount = this.updateProgress();
    if (solvedCount === 20 && !this.gameCompleted) {
      this.gameCompleted = true;
      clearInterval(this.timerInterval);

      // Show Victory Modal
      document.getElementById("win-time").textContent = this.formatTime(this.timerSeconds);
      const score = Math.max(10, Math.round(100 - (this.hintsUsed * 1.5)));
      document.getElementById("win-score").textContent = `${score}%`;
      document.getElementById("win-hints").textContent = this.hintsUsed;

      setTimeout(() => {
        document.getElementById("victory-modal").classList.add("open");
      }, 400);
    }
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.gameCompleted) {
        this.timerSeconds++;
        this.timerDisplayEl.textContent = this.formatTime(this.timerSeconds);
      }
    }, 1000);
  }

  formatTime(totalSecs) {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, "0");
    const secs = (totalSecs % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  saveState() {
    const state = {
      gridState: this.gridState,
      revealed: Array.from(this.revealedCells),
      timerSeconds: this.timerSeconds,
      hintsUsed: this.hintsUsed,
      letterHintsRemaining: this.letterHintsRemaining,
      wordHintsRemaining: this.wordHintsRemaining
    };
    try {
      localStorage.setItem("bytecross_saved_game", JSON.stringify(state));
    } catch (e) {
      // Ignore local storage errors if disabled
    }
  }

  loadSavedState() {
    try {
      const saved = localStorage.getItem("bytecross_saved_game");
      if (saved) {
        const state = JSON.parse(saved);
        this.gridState = state.gridState || this.gridState;
        this.revealedCells = new Set(state.revealed || []);
        this.timerSeconds = state.timerSeconds || 0;
        this.hintsUsed = state.hintsUsed || 0;
        if (state.letterHintsRemaining !== undefined) this.letterHintsRemaining = state.letterHintsRemaining;
        if (state.wordHintsRemaining !== undefined) this.wordHintsRemaining = state.wordHintsRemaining;
        this.timerDisplayEl.textContent = this.formatTime(this.timerSeconds);

        // Update DOM cells
        for (let r = 0; r < this.rows; r++) {
          for (let c = 0; c < this.cols; c++) {
            if (this.gridState[r][c]) {
              const cellEl = this.getCellEl(r, c);
              if (cellEl) {
                const span = cellEl.querySelector(".cell-letter");
                if (span) span.textContent = this.gridState[r][c];
                if (this.revealedCells.has(`${r},${c}`)) {
                  cellEl.classList.add("revealed");
                }
              }
            }
          }
        }
      }
    } catch (e) {
      // Ignore
    }
  }
}

// Start Game on Page Load
document.addEventListener("DOMContentLoaded", () => {
  window.crossword = new CrosswordGame(PUZZLE_DATA);
});
