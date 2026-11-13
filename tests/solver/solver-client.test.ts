import { describe, it, expect } from 'vitest';
import { createBoard, createSolved, isSolved, moveTile } from '../../src/core/board';
import { getNextHintTile, solvePuzzle } from '../../src/solver/solver';
import { SolverClient } from '../../src/solver/solver-client';

describe('Solver Client & High-Level Solver (src/solver/)', () => {
  it('getNextHintTile returns null for an already solved board', () => {
    const solved = createSolved(3);
    const hint = getNextHintTile(solved);
    expect(hint).toBeNull();
  });

  it('getNextHintTile returns the immediate winning move on a 1-move board', () => {
    const board = createBoard(3, [1, 2, 3, 4, 5, 6, 7, 0, 8]);
    const hint = getNextHintTile(board);
    expect(hint).toBe(8);

    const next = moveTile(board, hint!);
    expect(isSolved(next)).toBe(true);
  });

  it('solvePuzzle uses IDA* for 3x3 and returns optimal path', () => {
    const board = createBoard(3, [1, 2, 3, 4, 5, 6, 0, 7, 8]);
    const result = solvePuzzle(board);

    expect(result.solved).toBe(true);
    expect(result.moves).toHaveLength(2);
    expect(result.algorithm).toBe('ida-star');
  });

  it('SolverClient operates cleanly with in-thread fallback in happy-dom', async () => {
    const client = new SolverClient();
    const board = createBoard(3, [1, 2, 3, 4, 5, 6, 7, 0, 8]);

    const hint = await client.getHint(board);
    expect(hint).toBe(8);

    const solveRes = await client.solve(board);
    expect(solveRes.solved).toBe(true);
    expect(solveRes.moves).toEqual([8]);

    client.cancel();
    client.destroy();
  });
});
