import type { Board } from '../core/types';
import { isSolved, getBlankIndex } from '../core/board';
import { calculateCombinedHeuristic } from './heuristic';
import { solveIdaStar } from './ida-star';
import { solveFast } from './fast-solver';
import type { SolverOptions, SolverResult } from './types';

/**
 * High-level unified puzzle solver.
 * Automatically chooses optimal algorithm based on board size and time constraints.
 */
export function solvePuzzle(board: Board, options: SolverOptions = {}): SolverResult {
  const size = board.size;
  const algorithm = options.algorithm ?? 'auto';

  if (isSolved(board)) {
    return {
      solved: true,
      moves: [],
      nodesExplored: 0,
      timeMs: 0,
      algorithm: algorithm === 'auto' ? 'ida-star' : algorithm,
    };
  }

  if (algorithm === 'ida-star') {
    return solveIdaStar(board, options);
  }

  if (algorithm === 'fast') {
    return solveFast(board, options);
  }

  // Auto mode
  if (size <= 3) {
    return solveIdaStar(board, options);
  }

  if (size === 4) {
    // Try optimal IDA* with short timeout first (e.g. 500ms)
    const idaResult = solveIdaStar(board, {
      ...options,
      timeoutMs: Math.min(500, options.timeoutMs ?? 500),
      maxNodes: Math.min(100_000, options.maxNodes ?? 100_000),
    });

    if (idaResult.solved) {
      return idaResult;
    }

    // Fallback to fast solver
    return solveFast(board, options);
  }

  // 5x5 and higher
  return solveFast(board, options);
}

/**
 * Finds the immediate next tile to move for a Hint.
 * Guarantees a valid adjacent movable tile index or null if already solved.
 */
export function getNextHintTile(board: Board, options: SolverOptions = {}): number | null {
  if (isSolved(board)) {
    return null;
  }

  const result = solvePuzzle(board, options);
  if (result.moves.length > 0) {
    return result.moves[0];
  }

  // Fallback: 1-ply greedy heuristic evaluation among blank's neighbors
  const size = board.size;
  const blankIdx = getBlankIndex(board);
  if (blankIdx === -1) return null;

  const blankRow = Math.floor(blankIdx / size);
  const blankCol = blankIdx % size;
  const neighbors: number[] = [];
  if (blankRow > 0) neighbors.push((blankRow - 1) * size + blankCol);
  if (blankRow < size - 1) neighbors.push((blankRow + 1) * size + blankCol);
  if (blankCol > 0) neighbors.push(blankRow * size + (blankCol - 1));
  if (blankCol < size - 1) neighbors.push(blankRow * size + (blankCol + 1));

  let bestTile: number | null = null;
  let minH = Infinity;

  for (let i = 0; i < neighbors.length; i++) {
    const tileIdx = neighbors[i];
    const testTiles = [...board.tiles];
    testTiles[blankIdx] = testTiles[tileIdx];
    testTiles[tileIdx] = 0;
    const h = calculateCombinedHeuristic(size, testTiles);
    if (h < minH) {
      minH = h;
      bestTile = tileIdx;
    }
  }

  return bestTile;
}
