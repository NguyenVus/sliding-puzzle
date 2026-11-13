import type { Board } from './types';
import { getBlankIndex } from './board';

/**
 * Counts the number of inversions in the tiles array, ignoring the empty tile (0).
 * An inversion is a pair of tiles (a, b) such that a appears before b and a > b.
 *
 * @param tiles - Array of tile numbers
 */
export function countInversions(tiles: readonly number[]): number {
  let inversions = 0;
  const filtered: number[] = [];
  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i] !== 0) {
      filtered.push(tiles[i]);
    }
  }

  const len = filtered.length;
  for (let i = 0; i < len; i++) {
    const tileI = filtered[i];
    for (let j = i + 1; j < len; j++) {
      if (tileI > filtered[j]) {
        inversions++;
      }
    }
  }

  return inversions;
}

/**
 * Checks whether an N x N sliding puzzle board is solvable from its current state.
 *
 * Mathematical rules:
 * 1. If N is odd (e.g. 3x3, 5x5):
 *    The puzzle is solvable if and only if the number of inversions is even.
 *
 * 2. If N is even (e.g. 4x4):
 *    Let blankRowFromBottom be the 1-based row index of the blank space counted from the bottom:
 *    - Solvable if blank is on an odd row from bottom (1, 3, ...) AND inversions is even.
 *    - Solvable if blank is on an even row from bottom (2, 4, ...) AND inversions is odd.
 *    Equivalently: (inversions + blankRowFromBottom) % 2 === 1.
 *
 * @param board - Board to evaluate
 * @returns true if board is solvable, false otherwise
 */
export function isSolvable(board: Board): boolean {
  const n = board.size ?? board.n;
  if (!Number.isInteger(n) || n < 2) {
    return false;
  }

  const total = n * n;
  if (board.tiles.length !== total) {
    return false;
  }

  // Validate that all numbers 0 .. total - 1 exist without duplicates
  const seen = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    const val = board.tiles[i];
    if (!Number.isInteger(val) || val < 0 || val >= total || seen[val] === 1) {
      return false;
    }
    seen[val] = 1;
  }

  const blankIndex = getBlankIndex(board);
  if (blankIndex === -1) {
    return false;
  }

  const inversions = countInversions(board.tiles);

  if (n % 2 !== 0) {
    // Odd grid width
    return inversions % 2 === 0;
  } else {
    // Even grid width
    const blankRowFromTop = Math.floor(blankIndex / n);
    const blankRowFromBottom = n - blankRowFromTop;
    return (inversions + blankRowFromBottom) % 2 === 1;
  }
}
