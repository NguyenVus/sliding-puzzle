import type { Board } from '../core/types';

/**
 * Calculates length of the Longest Increasing Subsequence in O(k log k).
 * Used to determine the minimum number of tiles that must leave a line
 * (row or column) to resolve all linear conflicts while preserving admissibility.
 */
export function longestIncreasingSubsequence(arr: readonly number[]): number {
  if (arr.length <= 1) {
    return arr.length;
  }
  const tails: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];
    let l = 0;
    let r = tails.length;
    while (l < r) {
      const mid = (l + r) >> 1;
      if (tails[mid] < x) {
        l = mid + 1;
      } else {
        r = mid;
      }
    }
    tails[l] = x;
  }
  return tails.length;
}

/**
 * Computes pure Manhattan Distance for all non-empty tiles.
 * Tile 0 (empty) is ignored.
 */
export function calculateManhattan(size: number, tiles: readonly number[]): number {
  let md = 0;
  for (let i = 0; i < tiles.length; i++) {
    const val = tiles[i];
    if (val === 0) continue;
    const targetIdx = val - 1;
    const targetRow = Math.floor(targetIdx / size);
    const targetCol = targetIdx % size;
    const currRow = Math.floor(i / size);
    const currCol = i % size;
    md += Math.abs(currRow - targetRow) + Math.abs(currCol - targetCol);
  }
  return md;
}

/**
 * Computes Linear Conflict penalty for rows and columns.
 *
 * For each row r, finds all tiles whose target row is r, ordered by current column.
 * If target columns are not strictly increasing, at least one tile must temporarily
 * leave row r and return, costing at least 2 extra orthogonal moves.
 *
 * Admissibility:
 * By computing 2 * (count - LIS(targetCols)), we find the exact minimum number
 * of tile excursions needed to eliminate all inversions in that row.
 * Because row conflicts require vertical moves (+2 vertical) and column conflicts
 * require horizontal moves (+2 horizontal), they are orthogonal to each other and to
 * Manhattan distance. Thus the combined heuristic is admissible (h(n) <= h*(n)).
 */
export function calculateLinearConflict(size: number, tiles: readonly number[]): number {
  let penalty = 0;

  // 1. Row Linear Conflicts
  for (let r = 0; r < size; r++) {
    const targetCols: number[] = [];
    const rowOffset = r * size;
    for (let c = 0; c < size; c++) {
      const val = tiles[rowOffset + c];
      if (val === 0) continue;
      const targetIdx = val - 1;
      const targetRow = Math.floor(targetIdx / size);
      if (targetRow === r) {
        targetCols.push(targetIdx % size);
      }
    }
    if (targetCols.length > 1) {
      const lisLen = longestIncreasingSubsequence(targetCols);
      penalty += 2 * (targetCols.length - lisLen);
    }
  }

  // 2. Column Linear Conflicts
  for (let c = 0; c < size; c++) {
    const targetRows: number[] = [];
    for (let r = 0; r < size; r++) {
      const val = tiles[r * size + c];
      if (val === 0) continue;
      const targetIdx = val - 1;
      const targetCol = targetIdx % size;
      if (targetCol === c) {
        targetRows.push(Math.floor(targetIdx / size));
      }
    }
    if (targetRows.length > 1) {
      const lisLen = longestIncreasingSubsequence(targetRows);
      penalty += 2 * (targetRows.length - lisLen);
    }
  }

  return penalty;
}

/**
 * Computes combined Manhattan Distance + Linear Conflict.
 */
export function calculateCombinedHeuristic(size: number, tiles: readonly number[]): number {
  return calculateManhattan(size, tiles) + calculateLinearConflict(size, tiles);
}

/**
 * Public Board-oriented helper functions.
 */
export function manhattanDistance(board: Board): number {
  return calculateManhattan(board.size, board.tiles);
}

export function linearConflict(board: Board): number {
  return calculateLinearConflict(board.size, board.tiles);
}

export function manhattanWithLinearConflict(board: Board): number {
  return calculateCombinedHeuristic(board.size, board.tiles);
}
