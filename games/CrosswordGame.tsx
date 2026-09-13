import React, { useEffect, useMemo } from 'react';
import {
  useCrosswordGame,
  PUZZLE_DATA,
  SOLUTION_GRID,
  CELL_NUMBERS,
  CELL_TO_WORDS,
  CrosswordWord
} from './logic';
import './CrosswordGame.css';

export const CrosswordGame: React.FC = () => {
  const {
    puzzleData,
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
  } = useCrosswordGame();

  // Listen to window keyboard events
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => handleKeyDown(e);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleKeyDown]);

  // Across and Down words
  const acrossWords = useMemo(
    () => puzzleData.words.filter((w) => w.direction === 'across').sort((a, b) => a.number - b.number),
    [puzzleData.words]
  );
  const downWords = useMemo(
    () => puzzleData.words.filter((w) => w.direction === 'down').sort((a, b) => a.number - b.number),
    [puzzleData.words]
  );

  // Active word cell set for rapid lookup
  const activeWordCells = useMemo(() => {
    const set = new Set<string>();
    if (!activeWord) return set;
    const dr = activeWord.direction === 'across' ? 0 : 1;
    const dc = activeWord.direction === 'across' ? 1 : 0;
    for (let i = 0; i < activeWord.length; i++) {
      set.add(`${activeWord.row + dr * i},${activeWord.col + dc * i}`);
    }
    return set;
  }, [activeWord]);

  // Intersecting word cell set
  const intersectingWordCells = useMemo(() => {
    const set = new Set<string>();
    const otherDir = activeDirection === 'across' ? 'down' : 'across';
    const otherWord = CELL_TO_WORDS[activeCell.r]?.[activeCell.c]?.[otherDir];
    if (!otherWord) return set;
    const dr = otherWord.direction === 'across' ? 0 : 1;
    const dc = otherWord.direction === 'across' ? 1 : 0;
    for (let i = 0; i < otherWord.length; i++) {
      const cr = otherWord.row + dr * i;
      const cc = otherWord.col + dc * i;
      if (cr !== activeCell.r || cc !== activeCell.c) {
        set.add(`${cr},${cc}`);
      }
    }
    return set;
  }, [activeCell, activeDirection]);

  return (
    <div className="bytecross-wrapper">
      {/* Print Only Header */}
      <div className="print-header">
        <h1>Computer Science & Technology Crossword</h1>
        <p>Difficulty: Easy &bull; 20 Words (10 Across, 10 Down)</p>
      </div>

      {/* App Header */}
      <header className="bytecross-header">
        <div className="bytecross-header-container">
          <div className="logo-group">
            <div className="logo-icon">#</div>
            <div className="title-wrap">
              <h1>BYTECROSS</h1>
              <div className="badge-group">
                <span className="badge badge-topic">Computer Science & Tech</span>
                <span className="badge badge-diff">Easy &bull; 20 Words</span>
              </div>
            </div>
          </div>

          <div className="header-stats">
            <div className="stat-item" title="Elapsed Time">
              <span className="stat-label">Time:</span>
              <span className="stat-value">{formatTime(timerSeconds)}</span>
            </div>
            <div className="stat-item" title="Words Solved">
              <span className="stat-label">Progress:</span>
              <span className="stat-value">{solvedWordsCount} / 20</span>
            </div>
            <div className="stat-item" title="Hints Remaining: 3 Letter Hints & 2 Word Hints">
              <span className="stat-label">Hints:</span>
              <span className="stat-value">{letterHintsRemaining}L / {wordHintsRemaining}W</span>
            </div>
          </div>

          <div className="header-actions">
            <button
              className="btn-outline"
              onClick={() => setShowHelpModal(true)}
              title="How to Play & Shortcuts"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
              </svg>
              Help
            </button>
            <button
              className="btn-outline"
              onClick={() => window.print()}
              title="Print Blank Crossword"
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Layout */}
      <main className="bytecross-main">
        {/* Left Section: Board & Controls */}
        <section className="game-section">
          {/* Active Clue Banner */}
          <div className="active-clue-bar">
            <div className="active-clue-content">
              <span className="active-clue-tag">
                {activeWord ? `${activeWord.number} ${activeWord.direction.toUpperCase()}` : 'Select Clue'}
              </span>
              <span className="active-clue-text">
                {activeWord ? activeWord.clue : 'Select a clue or cell to begin'}
              </span>
            </div>
            {activeWord && (
              <span className="active-clue-len">({activeWord.length} letters)</span>
            )}
          </div>

          {/* 15x15 Crossword Board */}
          <div className="board-container">
            <div className="crossword-grid" role="grid" aria-label="Crossword Grid 15 by 15">
              {Array.from({ length: puzzleData.rows }).map((_, r) =>
                Array.from({ length: puzzleData.cols }).map((__, c) => {
                  const isBlocked = SOLUTION_GRID[r][c] === null;
                  const key = `${r},${c}`;

                  if (isBlocked) {
                    return <div key={key} className="grid-cell blocked" />;
                  }

                  const isActiveCell = activeCell.r === r && activeCell.c === c;
                  const isInWord = activeWordCells.has(key);
                  const isInIntersect = intersectingWordCells.has(key);
                  const isRevealed = revealedCells.has(key);
                  const status = cellStatus[key];

                  const classNames = [
                    'grid-cell',
                    isActiveCell ? 'active-cell' : '',
                    isInWord ? 'active-word' : '',
                    isInIntersect && !isInWord ? 'active-intersect' : '',
                    isRevealed ? 'revealed' : '',
                    status ? status : ''
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <div
                      key={key}
                      className={classNames}
                      onClick={() => handleCellClick(r, c)}
                    >
                      {CELL_NUMBERS[r][c] !== null && (
                        <span className="cell-number">{CELL_NUMBERS[r][c]}</span>
                      )}
                      <span className="cell-letter">{gridState[r][c]}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Toolbar Controls */}
          <div className="toolbar">
            <div className="btn-group">
              <button onClick={checkCurrentWord} title="Check if current word is correct">
                Check Word
              </button>
              <button onClick={checkEntirePuzzle} title="Check entire grid for incorrect letters">
                Check Puzzle
              </button>
            </div>
            <div className="btn-group">
              <button
                onClick={revealCurrentLetter}
                disabled={letterHintsRemaining <= 0}
                className={letterHintsRemaining <= 0 ? 'disabled' : ''}
                title="Reveal letter in current cell (Max 3 per game)"
              >
                Reveal Letter <span className="hint-badge">{letterHintsRemaining} left</span>
              </button>
              <button
                onClick={revealCurrentWord}
                disabled={wordHintsRemaining <= 0}
                className={wordHintsRemaining <= 0 ? 'disabled' : ''}
                title="Reveal full current word (Max 2 per game)"
              >
                Reveal Word <span className="hint-badge">{wordHintsRemaining} left</span>
              </button>
              <button
                onClick={revealAllPuzzle}
                className="btn-outline"
                title="Give up and reveal full solution"
              >
                Solve All
              </button>
            </div>
            <div className="btn-group">
              <button
                onClick={clearCurrentWord}
                className="btn-outline"
                title="Clear letters in current word"
              >
                Clear Word
              </button>
              <button
                onClick={() => setShowResetModal(true)}
                className="btn-outline"
                title="Reset the entire puzzle"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Right Section: Across & Down Clues */}
        <section className="clues-section">
          <div className="clues-header">
            <h2>Crossword Hints & Clues</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Click any clue to jump to word
            </span>
          </div>

          <div className="clue-columns">
            {/* Across Column */}
            <div className="clue-column">
              <h3>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    fillRule="evenodd"
                    d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
                  />
                </svg>
                Across (10)
              </h3>
              <ul className="clue-list">
                {acrossWords.map((w) => {
                  const isActive = activeWord?.number === w.number && activeWord?.direction === 'across';
                  const completed = isWordSolved(w);
                  return (
                    <li
                      key={`across-${w.number}`}
                      className={`clue-item ${isActive ? 'active' : ''} ${completed ? 'completed' : ''}`}
                      onClick={() => selectWord(w)}
                    >
                      <span className="clue-num">{w.number}.</span>
                      <span className="clue-text">
                        {w.clue} <span className="clue-len-tag">({w.length})</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Down Column */}
            <div className="clue-column">
              <h3>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    fillRule="evenodd"
                    d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"
                  />
                </svg>
                Down (10)
              </h3>
              <ul className="clue-list">
                {downWords.map((w) => {
                  const isActive = activeWord?.number === w.number && activeWord?.direction === 'down';
                  const completed = isWordSolved(w);
                  return (
                    <li
                      key={`down-${w.number}`}
                      className={`clue-item ${isActive ? 'active' : ''} ${completed ? 'completed' : ''}`}
                      onClick={() => selectWord(w)}
                    >
                      <span className="clue-num">{w.number}.</span>
                      <span className="clue-text">
                        {w.clue} <span className="clue-len-tag">({w.length})</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Victory Modal */}
      {showVictoryModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon">🏆</div>
            <h2>Puzzle Solved!</h2>
            <p>Outstanding work! You solved all 20 Computer Science words!</p>

            <div className="stats-grid">
              <div>
                <div className="stat-box-val">{formatTime(timerSeconds)}</div>
                <div className="stat-box-lbl">Total Time</div>
              </div>
              <div>
                <div className="stat-box-val">
                  {Math.max(10, Math.round(100 - hintsUsed * 1.5))}%
                </div>
                <div className="stat-box-lbl">Score</div>
              </div>
              <div>
                <div className="stat-box-val">{hintsUsed}</div>
                <div className="stat-box-lbl">Hints Used</div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={() => {
                  setShowVictoryModal(false);
                  resetPuzzle();
                }}
              >
                Play Again
              </button>
              <button className="btn-outline" onClick={() => setShowVictoryModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 580 }}>
            <div className="modal-icon">💡</div>
            <h2>How to Play & Controls</h2>
            <p>
              Solve this medium-difficulty Computer Science crossword puzzle featuring 20 words
              across systems, algorithms, networking, and data structures.
            </p>

            <div className="help-list">
              <div className="help-row">
                <span>Click Cell / Clue</span>
                <span>Selects cell and corresponding word</span>
              </div>
              <div className="help-row">
                <span>Click Current Cell / <kbd>Space</kbd></span>
                <span>Toggle between Across & Down direction</span>
              </div>
              <div className="help-row">
                <span>Letter Keys (<kbd>A</kbd> - <kbd>Z</kbd>)</span>
                <span>Fill cell and auto-advance to next letter</span>
              </div>
              <div className="help-row">
                <span><kbd>Backspace</kbd></span>
                <span>Erase current letter & move to previous cell</span>
              </div>
              <div className="help-row">
                <span><kbd>&larr;</kbd> <kbd>&uarr;</kbd> <kbd>&rarr;</kbd> <kbd>&darr;</kbd> Arrow Keys</span>
                <span>Navigate grid cells in any direction</span>
              </div>
              <div className="help-row">
                <span><kbd>Tab</kbd> / <kbd>Shift + Tab</kbd></span>
                <span>Jump to next / previous word</span>
              </div>
              <div className="help-row">
                <span><kbd>Enter</kbd></span>
                <span>Check current word accuracy</span>
              </div>
              <div className="help-row">
                <span>Hint Quota</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                  Max 3 Letter Hints & 2 Word Hints
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={() => setShowHelpModal(false)}>
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Reset Modal */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon">⚠️</div>
            <h2>Reset Puzzle?</h2>
            <p>This will erase all your current answers and reset the timer. Are you sure?</p>
            <div className="modal-actions">
              <button
                className="btn-primary"
                onClick={resetPuzzle}
                style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                Reset Everything
              </button>
              <button className="btn-outline" onClick={() => setShowResetModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && <div className="toast show">{toastMessage}</div>}
    </div>
  );
};

export default CrosswordGame;
