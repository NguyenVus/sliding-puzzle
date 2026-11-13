import { describe, it, expect } from 'vitest';
import { createBoard, createSolved, isSolved, moveTile } from '../../src/core/board';
import { solveIdaStar } from '../../src/solver/ida-star';

describe('IDA* Solver (src/solver/ida-star.ts)', () => {
  it('returns solved: true with 0 moves for an already solved board', () => {
    const solved = createSolved(3);
    const result = solveIdaStar(solved);
    expect(result.solved).toBe(true);
    expect(result.moves).toEqual([]);
    expect(result.algorithm).toBe('ida-star');
  });

  it('solves a 1-move board optimally', () => {
    // Solved: [1, 2, 3, 4, 5, 6, 7, 8, 0]
    // Move 8 into 0: [1, 2, 3, 4, 5, 6, 7, 0, 8]
    const board = createBoard(3, [1, 2, 3, 4, 5, 6, 7, 0, 8]);
    const result = solveIdaStar(board);

    expect(result.solved).toBe(true);
    expect(result.moves).toHaveLength(1);
    expect(result.moves[0]).toBe(8); // Tile at index 8 (value 8) moves left

    // Verify move execution
    const nextBoard = moveTile(board, result.moves[0]);
    expect(isSolved(nextBoard)).toBe(true);
  });

  it('solves standard 2-move and 3-move 3x3 configurations optimally', () => {
    // 2-move configuration:
    // [1, 2, 3, 4, 5, 6, 0, 7, 8] -> 7 moves left to 6, 8 moves left to 7
    const b2 = createBoard(3, [1, 2, 3, 4, 5, 6, 0, 7, 8]);
    const r2 = solveIdaStar(b2);
    expect(r2.solved).toBe(true);
    expect(r2.moves).toHaveLength(2);

    let curr = b2;
    for (const move of r2.moves) {
      curr = moveTile(curr, move);
    }
    expect(isSolved(curr)).toBe(true);

    // 3-move configuration:
    // [1, 2, 3, 0, 4, 6, 7, 5, 8]
    const b3 = createBoard(3, [1, 2, 3, 0, 4, 6, 7, 5, 8]);
    const r3 = solveIdaStar(b3);
    expect(r3.solved).toBe(true);
    expect(r3.moves).toHaveLength(3);

    curr = b3;
    for (const move of r3.moves) {
      curr = moveTile(curr, move);
    }
    expect(isSolved(curr)).toBe(true);
  });

  it('solves the famous worst-case 31-move 3x3 instance optimally', () => {
    // Standard literature hardest 8-puzzle configuration requiring exactly 31 optimal moves:
    // [8, 6, 7, 2, 5, 4, 3, 0, 1]
    const hardBoard = createBoard(3, [8, 6, 7, 2, 5, 4, 3, 0, 1]);
    const result = solveIdaStar(hardBoard, { timeoutMs: 10000 });

    expect(result.solved).toBe(true);
    expect(result.moves).toHaveLength(31);
    expect(result.timeMs).toBeLessThan(3000); // Usually completes in ~15-50ms

    // Verify valid sequential execution reaches solved state
    let curr = hardBoard;
    for (let step = 0; step < result.moves.length; step++) {
      const tileIndex = result.moves[step];
      const next = moveTile(curr, tileIndex);
      expect(next).not.toBe(curr); // Each move must be valid
      curr = next;
    }
    expect(isSolved(curr)).toBe(true);
  });

  it('respects AbortSignal to cancel execution promptly', async () => {
    const controller = new AbortController();
    const hardBoard = createBoard(3, [8, 6, 7, 2, 5, 4, 3, 0, 1]);

    // Abort immediately
    controller.abort();
    const result = solveIdaStar(hardBoard, { signal: controller.signal });

    expect(result.solved).toBe(false);
  });
});
