import { describe, it, expect } from 'vitest';
import { scrambleBoard } from '../../src/core/scramble';
import { createSolved, isSolved } from '../../src/core/board';
import { isSolvable } from '../../src/core/solvability';

describe('scrambleBoard', () => {
  it('is completely reproducible with the same seed', () => {
    const board1 = scrambleBoard(3, 50, 42);
    const board2 = scrambleBoard(3, 50, 42);

    expect(board1.tiles).toEqual(board2.tiles);

    const board3 = scrambleBoard(4, 80, 9999);
    const board4 = scrambleBoard(4, 80, 9999);
    expect(board3.tiles).toEqual(board4.tiles);
  });

  it('produces different permutations with different seeds, including seed 0 and 1', () => {
    const board0 = scrambleBoard(3, 50, 0);
    const board1 = scrambleBoard(3, 50, 1);
    expect(board0.tiles).not.toEqual(board1.tiles);

    const boardA = scrambleBoard(3, 50, 111);
    const boardB = scrambleBoard(3, 50, 222);

    expect(boardA.tiles).not.toEqual(boardB.tiles);
  });

  it('is completely reproducible with seed 0', () => {
    const board0a = scrambleBoard(3, 40, 0);
    const board0b = scrambleBoard(3, 40, 0);
    expect(board0a.tiles).toEqual(board0b.tiles);
  });

  it('every scrambled board is guaranteed to be solvable (N = 3)', () => {
    for (let seed = 1; seed <= 25; seed++) {
      const board = scrambleBoard(3, 60, seed * 100 + 7);
      expect(isSolvable(board)).toBe(true);
      expect(isSolved(board)).toBe(false);
    }
  });

  it('every scrambled board is guaranteed to be solvable (N = 4)', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const board = scrambleBoard(4, 80, seed * 333 + 1);
      expect(isSolvable(board)).toBe(true);
      expect(isSolved(board)).toBe(false);
    }
  });

  it('every scrambled board is guaranteed to be solvable (N = 5)', () => {
    for (let seed = 1; seed <= 10; seed++) {
      const board = scrambleBoard(5, 100, seed * 777 + 9);
      expect(isSolvable(board)).toBe(true);
    }
  });

  it('handles steps <= 0 by returning initial board without modification', () => {
    const solved = createSolved(3);
    const result0 = scrambleBoard(solved, 0, 123);
    expect(result0.tiles).toEqual(solved.tiles);

    const resultNeg = scrambleBoard(solved, -5, 123);
    expect(resultNeg.tiles).toEqual(solved.tiles);

    const resultNaN = scrambleBoard(solved, NaN, 123);
    expect(resultNaN.tiles).toEqual(solved.tiles);
  });

  it('scrambles correctly under large step counts', () => {
    const board = scrambleBoard(4, 500, 12345);
    expect(isSolvable(board)).toBe(true);
    expect(isSolved(board)).toBe(false);
  });

  it('never immediately undoes the move just made during scramble', () => {
    // A generator that always selects choice 0 would cycle back and forth if reversals were allowed
    const greedyPrng = () => 0;
    const b0 = createSolved(3);
    // After 2 steps, without reversal prevention, it would oscillate A -> B -> A
    const b2 = scrambleBoard(b0, 2, greedyPrng);
    expect(b2.tiles).not.toEqual(b0.tiles);

    // Test across several seeds that every scramble produces a solvable board
    for (const seed of [10, 20, 30, 40, 50]) {
      const board = scrambleBoard(3, 40, seed);
      expect(isSolvable(board)).toBe(true);
    }
  });

  it('preserves immutability of the original board', () => {
    const original = createSolved(3);
    const originalTilesSnapshot = [...original.tiles];

    scrambleBoard(original, 50, 123);

    expect(original.tiles).toEqual(originalTilesSnapshot);
  });

  it('accepts an existing Board instance or dimension number', () => {
    const solved4 = createSolved(4);
    const scrambledFromBoard = scrambleBoard(solved4, 30, 42);
    const scrambledFromSize = scrambleBoard(4, 30, 42);

    expect(scrambledFromBoard.tiles).toEqual(scrambledFromSize.tiles);
  });
});
