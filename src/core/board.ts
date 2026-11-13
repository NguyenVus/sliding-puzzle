import type { Board } from './types';

/**
 * Creates an immutable Board instance.
 *
 * @param size - Dimension N of the N x N board (must be >= 2)
 * @param tiles - Array of length N*N containing permutations of 0..(N*N - 1)
 */
export function createBoard(size: number, tiles: readonly number[]): Board {
  if (!Number.isInteger(size) || size < 2) {
    throw new Error(`Board size must be an integer >= 2, received: ${size}`);
  }
  const totalTiles = size * size;
  if (tiles.length !== totalTiles) {
    throw new Error(`Expected ${totalTiles} tiles for a ${size}x${size} board, received ${tiles.length}`);
  }

  const seen = new Uint8Array(totalTiles);
  for (let i = 0; i < totalTiles; i++) {
    const val = tiles[i];
    if (!Number.isInteger(val) || val < 0 || val >= totalTiles) {
      throw new Error(`Tile at index ${i} has invalid value: ${val}`);
    }
    if (seen[val] === 1) {
      throw new Error(`Duplicate tile value: ${val}`);
    }
    seen[val] = 1;
  }

  return Object.freeze({
    size,
    n: size,
    tiles: Object.freeze([...tiles]),
  });
}

/**
 * Creates a solved board of size N x N: [1, 2, ..., N*N - 1, 0].
 *
 * @param n - Size of the board (>= 2)
 */
export function createSolved(n: number): Board {
  if (!Number.isInteger(n) || n < 2) {
    throw new Error(`Board size must be an integer >= 2, received: ${n}`);
  }
  const total = n * n;
  const tiles: number[] = new Array(total);
  for (let i = 0; i < total - 1; i++) {
    tiles[i] = i + 1;
  }
  tiles[total - 1] = 0;

  return createBoard(n, tiles);
}

/**
 * Returns the 1D index of the empty tile (0) in the board.
 */
export function getBlankIndex(board: Board): number {
  return board.tiles.indexOf(0);
}

/**
 * Checks whether the board matches the solved target state: [1, 2, ..., N*N - 1, 0].
 */
export function isSolved(board: Board): boolean {
  const n = board.size ?? board.n;
  if (!Number.isInteger(n) || n < 2) {
    return false;
  }
  const total = n * n;
  if (!board.tiles || board.tiles.length !== total) {
    return false;
  }
  for (let i = 0; i < total - 1; i++) {
    if (board.tiles[i] !== i + 1) {
      return false;
    }
  }
  return board.tiles[total - 1] === 0;
}

/**
 * Returns the list of indices of tiles that can be moved (tiles in the same row
 * or column as the empty space, excluding the empty space itself).
 */
export function getMovableTiles(board: Board): number[] {
  const n = board.size ?? board.n;
  if (!Number.isInteger(n) || n < 2) {
    return [];
  }
  const total = n * n;
  if (!board.tiles || board.tiles.length !== total) {
    return [];
  }
  const blankIdx = getBlankIndex(board);
  if (blankIdx === -1) {
    return [];
  }

  const blankRow = Math.floor(blankIdx / n);
  const blankCol = blankIdx % n;
  const movable: number[] = [];

  for (let i = 0; i < total; i++) {
    if (i === blankIdx) {
      continue;
    }
    const r = Math.floor(i / n);
    const c = i % n;
    if (r === blankRow || c === blankCol) {
      movable.push(i);
    }
  }

  return movable;
}

/**
 * Alias for getMovableTiles.
 */
export const getMovableIndices = getMovableTiles;

/**
 * Returns the numerical values of all movable tiles.
 */
export function getMovableTileValues(board: Board): number[] {
  return getMovableTiles(board).map((index) => board.tiles[index]);
}

/**
 * Moves the tile at `index`. If the tile is in the same row or column as the
 * blank space, shifts all tiles between it and the blank space towards the blank space.
 * Returns a new immutable Board without mutating the original board.
 * If the move is invalid or index is out of bounds or blank itself, returns the original board.
 *
 * @param board - Current board
 * @param index - Index of the clicked tile (0 to N*N - 1)
 */
export function moveTile(board: Board, index: number): Board {
  const n = board.size ?? board.n;
  if (!Number.isInteger(n) || n < 2) {
    return board;
  }
  const total = n * n;
  if (!board.tiles || board.tiles.length !== total) {
    return board;
  }

  if (!Number.isInteger(index) || index < 0 || index >= total) {
    return board;
  }

  const blankIndex = getBlankIndex(board);
  if (blankIndex === -1 || blankIndex === index) {
    return board;
  }

  const blankRow = Math.floor(blankIndex / n);
  const blankCol = blankIndex % n;
  const clickRow = Math.floor(index / n);
  const clickCol = index % n;

  // Tile must be in the same row or column as the blank
  if (clickRow !== blankRow && clickCol !== blankCol) {
    return board;
  }

  // Determine shift step direction from blank towards clicked tile
  const step =
    clickRow === blankRow
      ? clickCol > blankCol
        ? 1
        : -1
      : clickRow > blankRow
      ? n
      : -n;

  const newTiles = [...board.tiles];
  let curr = blankIndex;
  while (curr !== index) {
    const next = curr + step;
    newTiles[curr] = newTiles[next];
    curr = next;
  }
  newTiles[index] = 0;

  return createBoard(n, newTiles);
}
