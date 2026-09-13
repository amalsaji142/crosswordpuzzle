import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

export type Direction = 'across' | 'down';

export interface CrosswordWord {
  number: number;
  direction: Direction;
  word: string;
  clue: string;
  row: number;
  col: number;
  length: number;
}

export interface PuzzleData {
  title: string;
  topic: string;
  difficulty: string;
  rows: number;
  cols: number;
  words: CrosswordWord[];
}

export interface CellPosition {
  r: number;
  c: number;
}

export const PUZZLE_DATA: PuzzleData = {
  title: "Computer Science & Tech Crossword",
  topic: "Computer Science & Technology",
  difficulty: "Easy",
  rows: 15,
  cols: 15,
  words: [
    { number: 1, direction: "down", word: "DATABASE", clue: "Organized digital storage of information and records", row: 0, col: 0, length: 8 },
    { number: 2, direction: "down", word: "CODING", clue: "Writing instructions in a programming language for a computer to run", row: 0, col: 2, length: 6 },
    { number: 3, direction: "down", word: "REBOOT", clue: "Restarting a computer to fix glitches or apply updates", row: 0, col: 8, length: 6 },
    { number: 4, direction: "across", word: "PIXEL", clue: "The smallest single point of color on a screen", row: 0, col: 10, length: 5 },
    { number: 5, direction: "down", word: "INTERNET", clue: "Worldwide network connecting millions of computers together", row: 0, col: 11, length: 8 },
    { number: 6, direction: "across", word: "SERVER", clue: "A central computer that serves web pages or files to clients", row: 1, col: 4, length: 6 },
    { number: 6, direction: "down", word: "SEARCH", clue: "Typing a query into Google or a browser to find information", row: 1, col: 4, length: 6 },
    { number: 7, direction: "across", word: "BROWSER", clue: "Software like Chrome or Edge used to view websites", row: 3, col: 6, length: 7 },
    { number: 8, direction: "across", word: "BINARY", clue: "Number system made up of only 0s and 1s", row: 4, col: 0, length: 6 },
    { number: 9, direction: "across", word: "BUTTON", clue: "Clickable graphic on a screen that triggers an action", row: 5, col: 6, length: 6 },
    { number: 10, direction: "down", word: "CLOUD", clue: "Online servers where you store data instead of local hard drives", row: 5, col: 13, length: 5 },
    { number: 11, direction: "across", word: "PYTHON", clue: "Popular beginner-friendly programming language named after a comedy group", row: 7, col: 9, length: 6 },
    { number: 11, direction: "down", word: "PASSWORD", clue: "Secret code used to lock and protect your account", row: 7, col: 9, length: 8 },
    { number: 12, direction: "down", word: "BACKUP", clue: "A duplicate copy of files saved to prevent data loss", row: 8, col: 1, length: 6 },
    { number: 13, direction: "down", word: "LAPTOP", clue: "A portable computer you can carry and use on your lap", row: 9, col: 5, length: 6 },
    { number: 14, direction: "across", word: "SYSTEM", clue: "A combination of hardware and software working together", row: 10, col: 7, length: 6 },
    { number: 15, direction: "down", word: "EMAIL", clue: "Electronic mail sent over the internet", row: 10, col: 11, length: 5 },
    { number: 16, direction: "across", word: "OUTPUT", clue: "Information displayed or produced by a computer", row: 12, col: 0, length: 6 },
    { number: 17, direction: "across", word: "DOMAIN", clue: "A website address like google.com or wikipedia.org", row: 12, col: 8, length: 6 },
    { number: 18, direction: "across", word: "UPLOAD", clue: "Sending a file or photo from your device to the internet", row: 14, col: 4, length: 6 }
  ]
};

// Precompute static layout matrices
export const { SOLUTION_GRID, CELL_NUMBERS, CELL_TO_WORDS } = (() => {
  const rows = PUZZLE_DATA.rows;
  const cols = PUZZLE_DATA.cols;

  const solutionGrid: (string | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  const cellNumbers: (number | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
  const cellToWords: { across?: CrosswordWord; down?: CrosswordWord }[][] = Array.from(
    { length: rows },
    () => Array.from({ length: cols }, () => ({}))
  );

  PUZZLE_DATA.words.forEach((w) => {
    const dr = w.direction === 'across' ? 0 : 1;
    const dc = w.direction === 'across' ? 1 : 0;

    if (cellNumbers[w.row][w.col] === null) {
      cellNumbers[w.row][w.col] = w.number;
    }

    for (let i = 0; i < w.word.length; i++) {
      const r = w.row + dr * i;
      const c = w.col + dc * i;
      solutionGrid[r][c] = w.word[i];
      cellToWords[r][c][w.direction] = w;
    }
  });

  return { SOLUTION_GRID: solutionGrid, CELL_NUMBERS: cellNumbers, CELL_TO_WORDS: cellToWords };
})();

export function useCrosswordGame() {
  const rows = PUZZLE_DATA.rows;
  const cols = PUZZLE_DATA.cols;
  const words = PUZZLE_DATA.words;

  // State
  const [gridState, setGridState] = useState<string[][]>(() =>
    Array.from({ length: rows }, () => Array(cols).fill(''))
  );
  const [activeCell, setActiveCell] = useState<CellPosition>({ r: 0, c: 10 });
  const [activeDirection, setActiveDirection] = useState<Direction>('across');
  const [revealedCells, setRevealedCells] = useState<Set<string>>(() => new Set());
  const [cellStatus, setCellStatus] = useState<Record<string, 'correct' | 'incorrect'>>({});
  
  // Strict Hint Quotas: 3 Letter Hints, 2 Word Hints
  const [letterHintsRemaining, setLetterHintsRemaining] = useState<number>(3);
  const [wordHintsRemaining, setWordHintsRemaining] = useState<number>(2);
  const [hintsUsed, setHintsUsed] = useState<number>(0);

  // Timer & Game Progress
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Modals & Notifications
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && !isCompleted) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isCompleted]);

  // Active word calculation
  const getActiveWord = useCallback((): CrosswordWord | null => {
    const { r, c } = activeCell;
    const mapping = CELL_TO_WORDS[r]?.[c];
    if (!mapping) return null;
    return mapping[activeDirection] || mapping[activeDirection === 'across' ? 'down' : 'across'] || null;
  }, [activeCell, activeDirection]);

  const activeWord = useMemo(() => getActiveWord(), [getActiveWord]);

  // Is word completely solved
  const isWordSolved = useCallback((w: CrosswordWord, currentGrid = gridState): boolean => {
    const dr = w.direction === 'across' ? 0 : 1;
    const dc = w.direction === 'across' ? 1 : 0;
    for (let i = 0; i < w.length; i++) {
      if (currentGrid[w.row + dr * i][w.col + dc * i] !== w.word[i]) {
        return false;
      }
    }
    return true;
  }, [gridState]);

  // Count solved words
  const solvedWordsCount = useMemo(() => {
    return words.filter((w) => isWordSolved(w)).length;
  }, [words, isWordSolved]);

  // Check completion
  useEffect(() => {
    if (solvedWordsCount === 20 && !isCompleted) {
      setIsCompleted(true);
      setIsTimerRunning(false);
      setTimeout(() => {
        setShowVictoryModal(true);
      }, 400);
    }
  }, [solvedWordsCount, isCompleted]);

  // Cell click handler
  const handleCellClick = useCallback((r: number, c: number) => {
    if (SOLUTION_GRID[r][c] === null) return;

    const availableWords = CELL_TO_WORDS[r][c];

    if (activeCell.r === r && activeCell.c === c) {
      // Toggle direction if cell supports both
      if (availableWords.across && availableWords.down) {
        setActiveDirection((prev) => (prev === 'across' ? 'down' : 'across'));
      }
    } else {
      setActiveCell({ r, c });
      // Keep current direction if valid; otherwise switch
      if (!availableWords[activeDirection]) {
        setActiveDirection(availableWords.across ? 'across' : 'down');
      }
    }
  }, [activeCell, activeDirection]);

  // Word selection from clues panel
  const selectWord = useCallback((w: CrosswordWord) => {
    setActiveDirection(w.direction);
    const dr = w.direction === 'across' ? 0 : 1;
    const dc = w.direction === 'across' ? 1 : 0;

    let targetCell: CellPosition = { r: w.row, c: w.col };
    for (let i = 0; i < w.length; i++) {
      const cr = w.row + dr * i;
      const cc = w.col + dc * i;
      if (!gridState[cr][cc]) {
        targetCell = { r: cr, c: cc };
        break;
      }
    }
    setActiveCell(targetCell);
  }, [gridState]);

  // Move inside active word
  const moveInActiveWord = useCallback((step: number) => {
    const currentWord = getActiveWord();
    if (!currentWord) return;

    const dr = currentWord.direction === 'across' ? 0 : 1;
    const dc = currentWord.direction === 'across' ? 1 : 0;

    const currentIndex = currentWord.direction === 'across'
      ? activeCell.c - currentWord.col
      : activeCell.r - currentWord.row;

    const nextIndex = currentIndex + step;
    if (nextIndex >= 0 && nextIndex < currentWord.length) {
      setActiveCell({
        r: currentWord.row + dr * nextIndex,
        c: currentWord.col + dc * nextIndex
      });
    }
  }, [activeCell, getActiveWord]);

  // Jump to next or previous word
  const jumpNextWord = useCallback((delta: number) => {
    const currentWord = getActiveWord();
    if (!currentWord) return;

    const currentIndex = words.findIndex(
      (w) => w.number === currentWord.number && w.direction === currentWord.direction
    );
    const nextIndex = (currentIndex + delta + words.length) % words.length;
    selectWord(words[nextIndex]);
  }, [getActiveWord, words, selectWord]);

  // Check Current Word
  const checkCurrentWord = useCallback(() => {
    const currentWord = getActiveWord();
    if (!currentWord) return;

    const dr = currentWord.direction === 'across' ? 0 : 1;
    const dc = currentWord.direction === 'across' ? 1 : 0;
    let allCorrect = true;
    let anyEmpty = false;
    const nextStatus = { ...cellStatus };

    for (let i = 0; i < currentWord.length; i++) {
      const cr = currentWord.row + dr * i;
      const cc = currentWord.col + dc * i;
      const key = `${cr},${cc}`;
      const entered = gridState[cr][cc];
      const correct = SOLUTION_GRID[cr][cc];

      if (!entered) {
        anyEmpty = true;
        allCorrect = false;
        continue;
      }

      if (entered === correct) {
        nextStatus[key] = 'correct';
      } else {
        allCorrect = false;
        nextStatus[key] = 'incorrect';
      }
    }

    setCellStatus(nextStatus);

    if (allCorrect) {
      showToast(`Great job! "${currentWord.word}" is correct!`);
    } else if (anyEmpty) {
      showToast('Word is incomplete.');
    } else {
      showToast(`Some letters in "${currentWord.number} ${currentWord.direction}" are incorrect.`);
    }
  }, [getActiveWord, cellStatus, gridState, showToast]);

  // Check Entire Puzzle
  const checkEntirePuzzle = useCallback(() => {
    let wrongCount = 0;
    let filledCount = 0;
    const nextStatus: Record<string, 'correct' | 'incorrect'> = {};

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (SOLUTION_GRID[r][c] !== null) {
          const entered = gridState[r][c];
          if (entered) {
            filledCount++;
            if (entered === SOLUTION_GRID[r][c]) {
              nextStatus[`${r},${c}`] = 'correct';
            } else {
              wrongCount++;
              nextStatus[`${r},${c}`] = 'incorrect';
            }
          }
        }
      }
    }

    setCellStatus(nextStatus);

    if (wrongCount === 0 && filledCount === 111) {
      showToast('All words completed and correct!');
    } else if (wrongCount === 0) {
      showToast(`All ${filledCount} entered letters are currently correct! Keep going.`);
    } else {
      showToast(`Found ${wrongCount} incorrect letter${wrongCount > 1 ? 's' : ''}.`);
    }
  }, [gridState, rows, cols, showToast]);

  // Reveal Letter Hint (Quota: 3)
  const revealCurrentLetter = useCallback(() => {
    if (letterHintsRemaining <= 0) {
      showToast('No Letter hints remaining! (All 3 used)');
      return;
    }

    const { r, c } = activeCell;
    const correctLetter = SOLUTION_GRID[r][c];
    if (!correctLetter) return;

    if (gridState[r][c] === correctLetter && revealedCells.has(`${r},${c}`)) {
      showToast('This cell is already revealed!');
      return;
    }

    const nextRemaining = letterHintsRemaining - 1;
    setLetterHintsRemaining(nextRemaining);
    setHintsUsed((prev) => prev + 1);

    const nextGrid = gridState.map((rowArr, ri) =>
      rowArr.map((val, ci) => (ri === r && ci === c ? correctLetter : val))
    );
    setGridState(nextGrid);

    setRevealedCells((prev) => new Set(prev).add(`${r},${c}`));
    setCellStatus((prev) => {
      const copy = { ...prev };
      delete copy[`${r},${c}`];
      return copy;
    });

    showToast(`Revealed letter '${correctLetter}' (${nextRemaining} letter hints left)`);
    moveInActiveWord(1);
  }, [activeCell, letterHintsRemaining, gridState, revealedCells, showToast, moveInActiveWord]);

  // Reveal Word Hint (Quota: 2)
  const revealCurrentWord = useCallback(() => {
    if (wordHintsRemaining <= 0) {
      showToast('No Word hints remaining! (All 2 used)');
      return;
    }

    const currentWord = getActiveWord();
    if (!currentWord) return;

    if (isWordSolved(currentWord)) {
      showToast(`"${currentWord.word}" is already solved!`);
      return;
    }

    const nextRemaining = wordHintsRemaining - 1;
    setWordHintsRemaining(nextRemaining);
    setHintsUsed((prev) => prev + currentWord.length);

    const dr = currentWord.direction === 'across' ? 0 : 1;
    const dc = currentWord.direction === 'across' ? 1 : 0;

    const nextGrid = gridState.map((rowArr) => [...rowArr]);
    const nextRevealed = new Set(revealedCells);
    const nextStatus = { ...cellStatus };

    for (let i = 0; i < currentWord.length; i++) {
      const cr = currentWord.row + dr * i;
      const cc = currentWord.col + dc * i;
      nextGrid[cr][cc] = currentWord.word[i];
      nextRevealed.add(`${cr},${cc}`);
      delete nextStatus[`${cr},${cc}`];
    }

    setGridState(nextGrid);
    setRevealedCells(nextRevealed);
    setCellStatus(nextStatus);

    showToast(`Revealed word: "${currentWord.word}" (${nextRemaining} word hints left)`);
  }, [wordHintsRemaining, getActiveWord, isWordSolved, gridState, revealedCells, cellStatus, showToast]);

  // Reveal All / Solve All
  const revealAllPuzzle = useCallback(() => {
    const nextGrid = gridState.map((rowArr, r) =>
      rowArr.map((_, c) => SOLUTION_GRID[r][c] || '')
    );
    const allRevealed = new Set<string>();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (SOLUTION_GRID[r][c] !== null) {
          allRevealed.add(`${r},${c}`);
        }
      }
    }

    setGridState(nextGrid);
    setRevealedCells(allRevealed);
    setCellStatus({});
    setLetterHintsRemaining(0);
    setWordHintsRemaining(0);
    setHintsUsed(111);
    showToast('All words revealed.');
  }, [gridState, rows, cols, showToast]);

  // Clear Word
  const clearCurrentWord = useCallback(() => {
    const currentWord = getActiveWord();
    if (!currentWord) return;

    const dr = currentWord.direction === 'across' ? 0 : 1;
    const dc = currentWord.direction === 'across' ? 1 : 0;

    const nextGrid = gridState.map((rowArr) => [...rowArr]);
    const nextStatus = { ...cellStatus };

    for (let i = 0; i < currentWord.length; i++) {
      const cr = currentWord.row + dr * i;
      const cc = currentWord.col + dc * i;
      nextGrid[cr][cc] = '';
      delete nextStatus[`${cr},${cc}`];
    }

    setGridState(nextGrid);
    setCellStatus(nextStatus);
    setActiveCell({ r: currentWord.row, c: currentWord.col });
  }, [getActiveWord, gridState, cellStatus]);

  // Reset Puzzle
  const resetPuzzle = useCallback(() => {
    setGridState(Array.from({ length: rows }, () => Array(cols).fill('')));
    setRevealedCells(new Set());
    setCellStatus({});
    setLetterHintsRemaining(3);
    setWordHintsRemaining(2);
    setHintsUsed(0);
    setTimerSeconds(0);
    setIsCompleted(false);
    setIsTimerRunning(true);
    setActiveCell({ r: 0, c: 10 });
    setActiveDirection('across');
    setShowResetModal(false);
    showToast('Puzzle has been reset.');
  }, [rows, cols, showToast]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      if (showHelpModal || showResetModal || showVictoryModal) {
        if (e.key === 'Escape') {
          setShowHelpModal(false);
          setShowResetModal(false);
          setShowVictoryModal(false);
        }
        return;
      }

      const { r, c } = activeCell;

      // Typing letters [A-Za-z]
      if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        const letter = e.key.toUpperCase();

        setGridState((prev) =>
          prev.map((rowArr, ri) =>
            rowArr.map((val, ci) => (ri === r && ci === c ? letter : val))
          )
        );

        setCellStatus((prev) => {
          if (prev[`${r},${c}`]) {
            const copy = { ...prev };
            delete copy[`${r},${c}`];
            return copy;
          }
          return prev;
        });

        moveInActiveWord(1);
        return;
      }

      // Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (gridState[r][c] !== '') {
          setGridState((prev) =>
            prev.map((rowArr, ri) =>
              rowArr.map((val, ci) => (ri === r && ci === c ? '' : val))
            )
          );
        } else {
          moveInActiveWord(-1);
          const currentWord = getActiveWord();
          if (currentWord) {
            const dr = currentWord.direction === 'across' ? 0 : 1;
            const dc = currentWord.direction === 'across' ? 1 : 0;
            const curIdx = currentWord.direction === 'across' ? c - currentWord.col : r - currentWord.row;
            if (curIdx > 0) {
              const pr = currentWord.row + dr * (curIdx - 1);
              const pc = currentWord.col + dc * (curIdx - 1);
              setGridState((prev) =>
                prev.map((rowArr, ri) =>
                  rowArr.map((val, ci) => (ri === pr && ci === pc ? '' : val))
                )
              );
            }
          }
        }
        return;
      }

      // Space: Toggle direction
      if (e.key === ' ') {
        e.preventDefault();
        const available = CELL_TO_WORDS[r]?.[c];
        if (available?.across && available?.down) {
          setActiveDirection((prev) => (prev === 'across' ? 'down' : 'across'));
        }
        return;
      }

      // Arrow navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const dr = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
        const dc = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;

        let nr = r + dr;
        let nc = c + dc;
        while (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (SOLUTION_GRID[nr][nc] !== null) {
            setActiveCell({ r: nr, c: nc });
            if (dr !== 0 && CELL_TO_WORDS[nr][nc].down) setActiveDirection('down');
            if (dc !== 0 && CELL_TO_WORDS[nr][nc].across) setActiveDirection('across');
            break;
          }
          nr += dr;
          nc += dc;
        }
        return;
      }

      // Tab / Shift+Tab
      if (e.key === 'Tab') {
        e.preventDefault();
        jumpNextWord(e.shiftKey ? -1 : 1);
        return;
      }

      // Enter: Check Word
      if (e.key === 'Enter') {
        e.preventDefault();
        checkCurrentWord();
        return;
      }
    },
    [
      activeCell,
      gridState,
      showHelpModal,
      showResetModal,
      showVictoryModal,
      moveInActiveWord,
      jumpNextWord,
      checkCurrentWord,
      getActiveWord,
      rows,
      cols
    ]
  );

  // Time format helper (mm:ss)
  const formatTime = useCallback((totalSecs: number): string => {
    const mins = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const secs = (totalSecs % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, []);

  return {
    puzzleData: PUZZLE_DATA,
    gridState,
    activeCell,
    activeDirection,
    activeWord,
    revealedCells,
    cellStatus,
    letterHintsRemaining,
    wordHintsRemaining,
    hintsUsed,
    timerSeconds,
    isCompleted,
    solvedWordsCount,
    showHelpModal,
    setShowHelpModal,
    showResetModal,
    setShowResetModal,
    showVictoryModal,
    setShowVictoryModal,
    toastMessage,
    handleCellClick,
    selectWord,
    handleKeyDown,
    checkCurrentWord,
    checkEntirePuzzle,
    revealCurrentLetter,
    revealCurrentWord,
    revealAllPuzzle,
    clearCurrentWord,
    resetPuzzle,
    formatTime,
    isWordSolved
  };
}
