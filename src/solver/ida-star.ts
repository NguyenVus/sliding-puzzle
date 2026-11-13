import type { Board } from '../core/types';
import { isSolved, getBlankIndex } from '../core/board';
import { calculateCombinedHeuristic } from './heuristic';
import type { SolverOptions, SolverResult } from './types';

/**
 * Solves the sliding puzzle using Iterative Deepening A* (IDA*) with
 * Manhattan Distance + Linear Conflict admissible heuristic.
 * Guarantees optimal (shortest length) solution.
 */
export function solveIdaStar(board: Board, options: SolverOptions = {}): SolverResult {
  const startTime = performance.now();
  const size = board.size;
  const timeoutMs = options.timeoutMs ?? 5000;
  const maxNodes = options.maxNodes ?? 1_000_000;
  const maxDepth = options.maxDepth ?? 80;
  const signal = options.signal;

  if (isSolved(board)) {
    return {
      solved: true,
      moves: [],
      nodesExplored: 0,
      timeMs: performance.now() - startTime,
      algorithm: 'ida-star',
    };
  }

  const currentTiles = [...board.tiles];
  let currentBlank = getBlankIndex(board);
  const path: number[] = [];
  let nodesExplored = 0;
  let isAbortedOrTimedOut = false;

  // Depth-first search step
  function search(g: number, threshold: number, prevBlank: number): number {
    if (signal?.aborted || isAbortedOrTimedOut) {
      return -2;
    }

    nodesExplored++;
    if ((nodesExplored & 2047) === 0) {
      if (performance.now() - startTime > timeoutMs || nodesExplored > maxNodes) {
        isAbortedOrTimedOut = true;
        return -2;
      }
    }

    const h = calculateCombinedHeuristic(size, currentTiles);
    const f = g + h;
    if (f > threshold) {
      return f;
    }
    if (h === 0) {
      return -1; // Found goal!
    }

    let minThreshold = Infinity;
    const blankRow = Math.floor(currentBlank / size);
    const blankCol = currentBlank % size;

    // Neighbors of blank: up, down, left, right
    const neighbors: number[] = [];
    if (blankRow > 0) neighbors.push((blankRow - 1) * size + blankCol);
    if (blankRow < size - 1) neighbors.push((blankRow + 1) * size + blankCol);
    if (blankCol > 0) neighbors.push(blankRow * size + (blankCol - 1));
    if (blankCol < size - 1) neighbors.push(blankRow * size + (blankCol + 1));

    for (let i = 0; i < neighbors.length; i++) {
      const nextTileIdx = neighbors[i];
      if (nextTileIdx === prevBlank) {
        continue; // Never immediately reverse the blank move
      }

      // Execute move
      const origBlank = currentBlank;
      const tileVal = currentTiles[nextTileIdx];
      currentTiles[origBlank] = tileVal;
      currentTiles[nextTileIdx] = 0;
      currentBlank = nextTileIdx;
      path.push(nextTileIdx);

      const t = search(g + 1, threshold, origBlank);
      if (t === -1) {
        return -1; // Solution found down this branch
      }
      if (t === -2) {
        return -2; // Timed out or cancelled
      }
      if (t < minThreshold) {
        minThreshold = t;
      }

      // Backtrack
      path.pop();
      currentTiles[nextTileIdx] = tileVal;
      currentTiles[origBlank] = 0;
      currentBlank = origBlank;
    }

    return minThreshold;
  }

  let threshold = calculateCombinedHeuristic(size, currentTiles);

  while (threshold <= maxDepth && !isAbortedOrTimedOut && !signal?.aborted) {
    const result = search(0, threshold, -1);
    if (result === -1) {
      return {
        solved: true,
        moves: [...path],
        nodesExplored,
        timeMs: performance.now() - startTime,
        algorithm: 'ida-star',
      };
    }
    if (result === -2 || result === Infinity) {
      break;
    }
    threshold = result;
  }

  return {
    solved: false,
    moves: [],
    nodesExplored,
    timeMs: performance.now() - startTime,
    algorithm: 'ida-star',
  };
}
