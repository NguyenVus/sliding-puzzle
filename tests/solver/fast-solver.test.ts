import { describe, it, expect } from 'vitest';
import { createBoard, createSolved, isSolved, moveTile } from '../../src/core/board';
import { scrambleBoard } from '../../src/core/scramble';
import { solveFast } from '../../src/solver/fast-solver';

describe('Fast Solver (src/solver/fast-solver.ts)', () => {
  it('returns solved: true with 0 moves for solved board', () => {
    const solved = createSolved(4);
    const result = solveFast(solved);
    expect(result.solved).toBe(true);
    expect(result.moves).toEqual([]);
    expect(result.algorithm).toBe('fast');
  });

  it('solves simple 3x3 configurations rapidly', () => {
    const board = createBoard(3, [1, 2, 3, 4, 5, 6, 7, 0, 8]);
    const result = solveFast(board);

    expect(result.solved).toBe(true);
    expect(result.moves).toHaveLength(1);
    expect(result.moves[0]).toBe(8);

    const next = moveTile(board, result.moves[0]);
    expect(isSolved(next)).toBe(true);
  });

  it('solves 4x4 boards within high performance bounds and verifies solution', () => {
    // Deterministic 4x4 scramble with seed
    const board = scrambleBoard(4, 20, 12345);
    const result = solveFast(board, { timeoutMs: 5000 });

    expect(result.solved).toBe(true);
    expect(result.moves.length).toBeGreaterThan(0);
    expect(result.timeMs).toBeLessThan(1000);

    let curr = board;
    for (const move of result.moves) {
      curr = moveTile(curr, move);
    }
    expect(isSolved(curr)).toBe(true);
  });

  it('solves 5x5 boards within acceptable time bounds', () => {
    // 5x5 scramble
    const board = scrambleBoard(5, 25, 67890);
    const result = solveFast(board, { timeoutMs: 5000 });

    expect(result.solved).toBe(true);
    expect(result.moves.length).toBeGreaterThan(0);

    let curr = board;
    for (const move of result.moves) {
      curr = moveTile(curr, move);
    }
    expect(isSolved(curr)).toBe(true);
  });

  it('stops and returns partial results if maxNodes limit is reached', () => {
    const board = scrambleBoard(4, 40, 9999);
    // Setting maxNodes very low forces early exit
    const result = solveFast(board, { maxNodes: 5 });

    expect(result.solved).toBe(false);
    expect(result.nodesExplored).toBeLessThanOrEqual(10);
  });
});
