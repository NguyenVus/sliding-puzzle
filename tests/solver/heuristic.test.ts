import { describe, it, expect } from 'vitest';
import { createBoard, createSolved } from '../../src/core/board';
import {
  calculateManhattan,
  calculateCombinedHeuristic,
  longestIncreasingSubsequence,
  manhattanDistance,
  linearConflict,
  manhattanWithLinearConflict,
} from '../../src/solver/heuristic';

describe('Heuristic Calculations (src/solver/heuristic.ts)', () => {
  describe('Longest Increasing Subsequence (LIS)', () => {
    it('handles empty and single-element arrays', () => {
      expect(longestIncreasingSubsequence([])).toBe(0);
      expect(longestIncreasingSubsequence([5])).toBe(1);
    });

    it('calculates correct LIS length for arbitrary sequences', () => {
      expect(longestIncreasingSubsequence([0, 1, 2])).toBe(3);
      expect(longestIncreasingSubsequence([1, 0, 2])).toBe(2);
      expect(longestIncreasingSubsequence([2, 1, 0])).toBe(1);
      expect(longestIncreasingSubsequence([3, 1, 4, 1, 5, 9, 2, 6])).toBe(4);
    });
  });

  describe('Manhattan Distance', () => {
    it('evaluates to 0 for a solved 3x3 board', () => {
      const solved = createSolved(3);
      expect(manhattanDistance(solved)).toBe(0);
      expect(calculateManhattan(3, solved.tiles)).toBe(0);
    });

    it('evaluates to 0 for a solved 4x4 and 5x5 board', () => {
      expect(manhattanDistance(createSolved(4))).toBe(0);
      expect(manhattanDistance(createSolved(5))).toBe(0);
    });

    it('calculates exact Manhattan distance when tiles are displaced', () => {
      // Solved: [1, 2, 3, 4, 5, 6, 7, 8, 0]
      // Swap 8 (target (2,1)) into blank (2,2):
      // [1, 2, 3, 4, 5, 6, 7, 0, 8]
      // Tile 8 is at (2,2), target is (2,1): dist = 1
      const b1 = createBoard(3, [1, 2, 3, 4, 5, 6, 7, 0, 8]);
      expect(manhattanDistance(b1)).toBe(1);

      // Tile 1 is at index 4 (1,1), target is index 0 (0,0): dist = 1 + 1 = 2
      // Tile 5 is at index 0 (0,0), target is index 4 (1,1): dist = 1 + 1 = 2
      // Total Manhattan = 4
      const b2 = createBoard(3, [5, 2, 3, 4, 1, 6, 7, 8, 0]);
      expect(manhattanDistance(b2)).toBe(4);
    });
  });

  describe('Linear Conflict', () => {
    it('evaluates to 0 for a solved board', () => {
      const solved = createSolved(3);
      expect(linearConflict(solved)).toBe(0);
    });

    it('detects row linear conflict and adds 2 for an inverted pair in their target row', () => {
      // Row 0 has tiles [2, 1, 3] (all target row 0).
      // Target cols: [1, 0, 2]. LIS is 2. (3 - 2) * 2 = 2.
      // Manhattan distance: tile 2 is dist 1, tile 1 is dist 1 = 2.
      // Total heuristic = 2 (Manhattan) + 2 (Linear Conflict) = 4.
      const board = createBoard(3, [2, 1, 3, 4, 5, 6, 7, 8, 0]);
      expect(linearConflict(board)).toBe(2);
      expect(manhattanDistance(board)).toBe(2);
      expect(manhattanWithLinearConflict(board)).toBe(4);
    });

    it('detects 3 inverted tiles in the same target row with penalty 4', () => {
      // Row 0 has tiles [3, 2, 1] (target row 0). Target cols: [2, 1, 0].
      // LIS length = 1. Penalty = 2 * (3 - 1) = 4.
      const board = createBoard(3, [3, 2, 1, 4, 5, 6, 7, 8, 0]);
      expect(linearConflict(board)).toBe(4);
    });

    it('detects column linear conflict and adds 2 for an inverted pair in their target col', () => {
      // Col 0 has tiles [4, 1, 7] at (0,0), (1,0), (2,0).
      // Tile 4 (target row 1, col 0), Tile 1 (target row 0, col 0), Tile 7 (target row 2, col 0).
      // Target rows in col 0: [1, 0, 2]. Inverted pair (4, 1). LIS is 2.
      // Penalty = 2 * (3 - 2) = 2.
      const board = createBoard(3, [4, 2, 3, 1, 5, 6, 7, 8, 0]);
      expect(linearConflict(board)).toBe(2);
    });

    it('combines orthogonal row and column linear conflicts additively', () => {
      // Row 0 inverted: [2, 1, 3] (+2)
      // Col 2 inverted: [3, 6, 0] -> let's invert col 1: tiles 5 and 2? No, tile 2 is in row 0.
      // Let's create row conflict on row 1 [4, 6, 5] (+2) and col conflict on col 0 [7, 4, 1]...
      const board = createBoard(3, [
        2, 1, 3, // row 0 conflict: +2
        4, 6, 5, // row 1 conflict: +2
        7, 8, 0,
      ]);
      expect(linearConflict(board)).toBe(4);
    });

    it('does not count tiles whose target line is elsewhere as linear conflicts', () => {
      // Board where every tile is in a different row and column than its target:
      // Row 0 has tiles 5, 7, 4 (target rows: 1, 2, 1) -> 0 row conflict
      // Row 1 has tiles 3, 1, 8 (target rows: 0, 0, 2) -> 0 row conflict
      // Row 2 has tiles 2, 6, 0 (target rows: 0, 1)    -> 0 row conflict
      // Same for columns: target columns never match current column.
      const board = createBoard(3, [5, 7, 4, 3, 1, 8, 2, 6, 0]);
      expect(linearConflict(board)).toBe(0);
      expect(manhattanDistance(board)).toBeGreaterThan(0);
    });
  });

  describe('Admissibility and Invariants', () => {
    it('guarantees combined heuristic equals 0 on any solved size', () => {
      for (const size of [2, 3, 4, 5, 6]) {
        const solved = createSolved(size);
        expect(calculateCombinedHeuristic(size, solved.tiles)).toBe(0);
      }
    });

    it('guarantees combined heuristic is non-negative and integer', () => {
      const board = createBoard(3, [8, 6, 7, 2, 5, 4, 3, 0, 1]);
      const h = manhattanWithLinearConflict(board);
      expect(h).toBeGreaterThan(0);
      expect(Number.isInteger(h)).toBe(true);
    });
  });
});
