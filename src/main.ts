import './style.css';
import type { Board } from './core';
import {
  createSolved,
  getMovableTiles,
  isSolvable,
  isSolved,
  moveTile,
  scrambleBoard,
} from './core';

interface GameState {
  size: number;
  board: Board;
  moves: number;
  seed: number;
}

const state: GameState = {
  size: 3,
  board: createSolved(3),
  moves: 0,
  seed: 12345,
};

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('Root #app container not found');
}

function handleTileClick(index: number): void {
  const nextBoard = moveTile(state.board, index);
  if (nextBoard !== state.board) {
    state.board = nextBoard;
    state.moves += 1;
    render();
  }
}

function handleScramble(): void {
  state.seed = Math.floor(Math.random() * 100000);
  state.board = scrambleBoard(state.size, state.size * 25, state.seed);
  state.moves = 0;
  render();
}

function handleReset(): void {
  state.board = createSolved(state.size);
  state.moves = 0;
  render();
}

function handleSizeChange(newSize: number): void {
  if (newSize === state.size) return;
  state.size = newSize;
  state.board = createSolved(newSize);
  state.moves = 0;
  render();
}

function render(): void {
  const solved = isSolved(state.board);
  const solvable = isSolvable(state.board);
  const movable = new Set(getMovableTiles(state.board));
  const n = state.size;

  app!.innerHTML = `
    <header class="header">
      <h1>Sliding Puzzle</h1>
      <p>Multi-tile slide enabled & pure immutable logic</p>
    </header>

    <div class="size-selector">
      <span class="stat-label">Grid Size:</span>
      <button class="size-btn ${n === 3 ? 'active' : ''}" data-size="3">3 x 3</button>
      <button class="size-btn ${n === 4 ? 'active' : ''}" data-size="4">4 x 4</button>
      <button class="size-btn ${n === 5 ? 'active' : ''}" data-size="5">5 x 5</button>
    </div>

    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-label">Moves</span>
        <span class="stat-value">${state.moves}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Status</span>
        <span class="stat-value ${solved ? 'status-solved' : 'status-playing'}">
          ${solved ? 'Solved! 🎉' : 'Playing'}
        </span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Solvable</span>
        <span class="stat-value" style="color: ${solvable ? '#10b981' : '#ef4444'}">
          ${solvable ? 'Yes' : 'No'}
        </span>
      </div>
    </div>

    <div class="board-container">
      <div class="puzzle-grid" style="grid-template-columns: repeat(${n}, 1fr); grid-template-rows: repeat(${n}, 1fr);">
        ${state.board.tiles
          .map((tile, index) => {
            if (tile === 0) {
              return `<div class="tile empty" data-index="${index}"></div>`;
            }
            const isMovePossible = movable.has(index);
            return `
              <button
                class="tile ${isMovePossible ? 'movable' : ''}"
                data-index="${index}"
                ${isMovePossible ? '' : 'disabled'}
              >
                ${tile}
              </button>
            `;
          })
          .join('')}
      </div>
    </div>

    <div class="controls">
      <div class="control-row">
        <button id="btn-scramble" class="btn btn-primary">Scramble (Random)</button>
        <button id="btn-reset" class="btn">Reset (Solved)</button>
      </div>
    </div>
  `;

  // Attach event listeners
  const grid = app!.querySelector<HTMLDivElement>('.puzzle-grid');
  grid?.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-index]');
    if (target && target.dataset.index !== undefined) {
      const index = parseInt(target.dataset.index, 10);
      handleTileClick(index);
    }
  });

  app!.querySelector('#btn-scramble')?.addEventListener('click', handleScramble);
  app!.querySelector('#btn-reset')?.addEventListener('click', handleReset);

  app!.querySelectorAll<HTMLButtonElement>('.size-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sizeAttr = btn.getAttribute('data-size');
      if (sizeAttr) {
        handleSizeChange(parseInt(sizeAttr, 10));
      }
    });
  });
}

// Initial render
render();
