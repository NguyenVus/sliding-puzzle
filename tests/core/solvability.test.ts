import { describe, it, expect } from 'vitest';
import { countInversions, isSolvable } from '../../src/core/solvability';
import { createSolved, createBoard } from '../../src/core/board';

describe('countInversions', () => {
  it('returns 0 for solved sequences', () => {
    expect(countInversions([1, 2, 3, 4, 5, 6, 7, 8, 0])).toBe(0);
    expect(countInversions([0, 1, 2, 3])).toBe(0);
  });

  it('correctly counts inversions ignoring the blank 0', () => {
    // [2, 1, 0, 3] -> only (2, 1) inverted -> 1 inversion
    expect(countInversions([2, 1, 0, 3])).toBe(1);

    // [3, 2, 1, 0] -> (3,2), (3,1), (2,1) -> 3 inversions
    expect(countInversions([3, 2, 1, 0])).toBe(3);

    // Standard 3x3: [1, 8, 2, 0, 4, 3, 7, 6, 5]
    // Inversions: (8,2), (8,4), (8,3), (8,7), (8,6), (8,5), (4,3), (7,6), (7,5), (6,5) = 10
    expect(countInversions([1, 8, 2, 0, 4, 3, 7, 6, 5])).toBe(10);
  });
});

describe('isSolvable on odd boards (N = 3)', () => {
  it('returns true for solved 3x3 board', () => {
    const board = createSolved(3);
    expect(isSolvable(board)).toBe(true);
  });

  it('returns true for standard solvable 3x3 configuration', () => {
    const board = createBoard(3, [1, 8, 2, 0, 4, 3, 7, 6, 5]);
    expect(isSolvable(board)).toBe(true);
  });

  it('returns false for standard unsolvable 3x3 configuration', () => {
    const board = createBoard(3, [8, 1, 2, 0, 4, 3, 7, 6, 5]);
    expect(isSolvable(board)).toBe(false);
  });

  it('swapping two tiles flips solvability on 3x3', () => {
    // Solved board: swap tiles 1 and 2
    const swapped = createBoard(3, [2, 1, 3, 4, 5, 6, 7, 8, 0]);
    expect(isSolvable(swapped)).toBe(false);

    // Swapping another pair (7 and 8) makes it 2 swaps (even) -> solvable again!
    const doubleSwapped = createBoard(3, [2, 1, 3, 4, 5, 6, 8, 7, 0]);
    expect(isSolvable(doubleSwapped)).toBe(true);
  });
});

describe('isSolvable on even boards (N = 4)', () => {
  it('returns true for solved 4x4 board', () => {
    const board = createSolved(4);
    expect(isSolvable(board)).toBe(true);
  });

  it('detects Sam Loyd 15-puzzle (14 and 15 swapped) as unsolvable', () => {
    // Classic 15-puzzle unsolvable case: blank is on last row (row 1 from bottom),
    // inversions = 1 (odd) -> unsolvable
    const tiles = [
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 15, 14, 0,
    ];
    const board = createBoard(4, tiles);
    expect(isSolvable(board)).toBe(false);
  });

  it('handles blank on even row from bottom correctly', () => {
    // Row 2 from bottom (blank at index 11, which is row 2 from top):
    // Tiles: [1..11, 0, 13, 14, 15, 12]
    // Inversions: 13>12, 14>12, 15>12 = 3 (odd).
    // Blank row from bottom = 4 - 2 = 2 (even).
    // Even row + odd inversions => solvable!
    const solvableTiles = [
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 0,
      13, 14, 15, 12,
    ];
    expect(isSolvable(createBoard(4, solvableTiles))).toBe(true);

    // Swap 14 and 15 -> inversions becomes 2 (even).
    // Even row + even inversions => unsolvable!
    const unsolvableTiles = [
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 0,
      13, 15, 14, 12,
    ];
    expect(isSolvable(createBoard(4, unsolvableTiles))).toBe(false);
  });

  it('handles blank on top row (row 4 from bottom, even row) correctly', () => {
    // Blank at index 0 (row 0 from top, row 4 from bottom).
    // [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 14]
    // Inversions = 1 (15 > 14).
    // Even row (4) + odd inversions (1) => solvable!
    const tiles = [
      0, 1, 2, 3,
      4, 5, 6, 7,
      8, 9, 10, 11,
      12, 13, 15, 14,
    ];
    expect(isSolvable(createBoard(4, tiles))).toBe(true);
  });
});

describe('isSolvable invalid boards', () => {
  it('returns false for duplicate tiles or missing 0', () => {
    const duplicates = {
      size: 3,
      n: 3,
      tiles: [1, 1, 3, 4, 5, 6, 7, 8, 0],
    };
    expect(isSolvable(duplicates)).toBe(false);

    const noBlank = {
      size: 3,
      n: 3,
      tiles: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    };
    expect(isSolvable(noBlank)).toBe(false);
  });

  it('returns false for invalid length or dimension', () => {
    const wrongLength = {
      size: 3,
      n: 3,
      tiles: [1, 2, 3, 4, 5, 6, 7, 0],
    };
    expect(isSolvable(wrongLength)).toBe(false);

    const badDim = {
      size: 1,
      n: 1,
      tiles: [0],
    };
    expect(isSolvable(badDim)).toBe(false);
  });
});
