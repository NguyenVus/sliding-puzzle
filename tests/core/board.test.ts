import { describe, it, expect } from 'vitest';
import {
  createBoard,
  createSolved,
  getBlankIndex,
  isSolved,
  getMovableTiles,
  getMovableIndices,
  getMovableTileValues,
  moveTile,
} from '../../src/core/board';

describe('Board creation & basic queries', () => {
  it('creates solved boards for various sizes', () => {
    const b3 = createSolved(3);
    expect(b3.size).toBe(3);
    expect(b3.n).toBe(3);
    expect(b3.tiles).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 0]);

    const b4 = createSolved(4);
    expect(b4.size).toBe(4);
    expect(b4.tiles.length).toBe(16);
    expect(b4.tiles[15]).toBe(0);
    expect(b4.tiles.slice(0, 15)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    ]);
  });

  it('rejects invalid dimensions for createSolved and createBoard', () => {
    expect(() => createSolved(1)).toThrow();
    expect(() => createSolved(0)).toThrow();
    expect(() => createSolved(-3)).toThrow();
    expect(() => createSolved(3.5)).toThrow();

    expect(() => createBoard(3, [1, 2, 3, 4, 5, 6, 7, 8])).toThrow();
  });

  it('freezes board and tiles to prevent mutation', () => {
    const b = createSolved(3);
    expect(Object.isFrozen(b)).toBe(true);
    expect(Object.isFrozen(b.tiles)).toBe(true);
  });

  it('identifies blank tile index correctly', () => {
    const b = createSolved(3);
    expect(getBlankIndex(b)).toBe(8);

    const b2 = createBoard(2, [0, 1, 2, 3]);
    expect(getBlankIndex(b2)).toBe(0);
  });

  it('correctly checks isSolved', () => {
    const b = createSolved(3);
    expect(isSolved(b)).toBe(true);

    const swapped = createBoard(3, [2, 1, 3, 4, 5, 6, 7, 8, 0]);
    expect(isSolved(swapped)).toBe(false);

    const blankMoved = createBoard(3, [1, 2, 3, 4, 5, 6, 7, 0, 8]);
    expect(isSolved(blankMoved)).toBe(false);
  });
});

describe('getMovableTiles', () => {
  it('returns tiles in same row and column when blank is in corner (3x3 bottom-right)', () => {
    // 1 2 3
    // 4 5 6
    // 7 8 0 (blank at index 8)
    const b = createSolved(3);
    const movable = getMovableTiles(b);

    // Row 2: index 6 (7), index 7 (8)
    // Col 2: index 2 (3), index 5 (6)
    expect(movable.sort()).toEqual([2, 5, 6, 7]);
    expect(getMovableIndices(b).sort()).toEqual([2, 5, 6, 7]);
    expect(getMovableTileValues(b).sort()).toEqual([3, 6, 7, 8]);
  });

  it('returns correct movable tiles when blank is at center (3x3)', () => {
    // 1 2 3
    // 4 0 6 (blank at index 4)
    // 7 8 5
    const b = createBoard(3, [1, 2, 3, 4, 0, 6, 7, 8, 5]);
    const movable = getMovableTiles(b);

    // Row 1: index 3 (4), index 5 (6)
    // Col 1: index 1 (2), index 7 (8)
    expect(movable.sort()).toEqual([1, 3, 5, 7]);
  });

  it('returns correct movable tiles when blank is at top-left corner (0,0)', () => {
    // 0 1 2
    // 3 4 5
    // 6 7 8
    const b = createBoard(3, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const movable = getMovableTiles(b);

    // Row 0: index 1, index 2
    // Col 0: index 3, index 6
    expect(movable.sort()).toEqual([1, 2, 3, 6]);
  });

  it('returns 2*(N-1) movable tiles on any N x N board', () => {
    const b4 = createSolved(4);
    expect(getMovableTiles(b4).length).toBe(2 * (4 - 1)); // 6

    const b5 = createSolved(5);
    expect(getMovableTiles(b5).length).toBe(2 * (5 - 1)); // 8
  });
});

describe('moveTile single-step sliding', () => {
  it('moves single tile horizontally into blank', () => {
    // [1, 2, 3, 4, 5, 6, 7, 8, 0] -> click index 7 (tile 8)
    const b = createSolved(3);
    const next = moveTile(b, 7);

    expect(next.tiles).toEqual([1, 2, 3, 4, 5, 6, 7, 0, 8]);
    expect(b.tiles).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 0]); // immutable
  });

  it('moves single tile vertically into blank', () => {
    // [1, 2, 3, 4, 5, 6, 7, 8, 0] -> click index 5 (tile 6)
    const b = createSolved(3);
    const next = moveTile(b, 5);

    expect(next.tiles).toEqual([1, 2, 3, 4, 5, 0, 7, 8, 6]);
    expect(b.tiles[5]).toBe(6); // immutable
  });

  it('does nothing when clicking the blank tile itself', () => {
    const b = createSolved(3);
    const next = moveTile(b, 8);
    expect(next.tiles).toEqual(b.tiles);
  });

  it('does nothing when clicking an invalid or unaligned tile', () => {
    const b = createSolved(3);
    // blank is at (2, 2) (index 8).
    // (0, 0) index 0 is diagonally opposite, not same row or col
    const next = moveTile(b, 0);
    expect(next.tiles).toEqual(b.tiles);

    // (1, 1) index 4 is also diagonal
    expect(moveTile(b, 4).tiles).toEqual(b.tiles);

    // out of bounds indices
    expect(moveTile(b, -1).tiles).toEqual(b.tiles);
    expect(moveTile(b, 99).tiles).toEqual(b.tiles);
  });
});

describe('moveTile multi-tile sliding', () => {
  it('slides 2 tiles horizontally at once towards blank (3x3)', () => {
    // 1 2 3
    // 4 5 6
    // 7 8 0 (blank at index 8)
    // Click index 6 (tile 7). Tiles 7 and 8 should slide right!
    // Expected row 2: [0, 7, 8]
    const b = createSolved(3);
    const next = moveTile(b, 6);

    expect(next.tiles).toEqual([1, 2, 3, 4, 5, 6, 0, 7, 8]);
  });

  it('slides 2 tiles vertically at once towards blank (3x3)', () => {
    // 1 2 3
    // 4 5 6
    // 7 8 0 (blank at index 8)
    // Click index 2 (tile 3). Tiles 3 and 6 should slide down!
    // Expected col 2: [0, 3, 6]
    const b = createSolved(3);
    const next = moveTile(b, 2);

    expect(next.tiles).toEqual([1, 2, 0, 4, 5, 3, 7, 8, 6]);
  });

  it('slides 3 tiles at once horizontally to the left (4x4)', () => {
    // Row 0: [0, 1, 2, 3] (blank at col 0, index 0)
    // User clicks index 3 (tile 3). Tiles 1, 2, 3 shift left towards blank!
    // New Row 0 should be: [1, 2, 3, 0]
    const tiles = [
      0, 1, 2, 3,
      4, 5, 6, 7,
      8, 9, 10, 11,
      12, 13, 14, 15,
    ];
    const b = createBoard(4, tiles);
    const next = moveTile(b, 3);

    expect(next.tiles.slice(0, 4)).toEqual([1, 2, 3, 0]);
    expect(next.tiles.slice(4)).toEqual(tiles.slice(4));
  });

  it('slides 3 tiles at once horizontally to the right (4x4)', () => {
    // Row 0: [1, 2, 3, 0] (blank at col 3, index 3)
    // User clicks index 0 (tile 1). Tiles 1, 2, 3 shift right towards blank!
    // New Row 0 should be: [0, 1, 2, 3]
    const tiles = [
      1, 2, 3, 0,
      4, 5, 6, 7,
      8, 9, 10, 11,
      12, 13, 14, 15,
    ];
    const b = createBoard(4, tiles);
    const next = moveTile(b, 0);

    expect(next.tiles.slice(0, 4)).toEqual([0, 1, 2, 3]);
  });

  it('slides 3 tiles at once vertically up (4x4)', () => {
    // Blank at (0, 0) index 0.
    // User clicks (3, 0) index 12. Tiles at (1,0), (2,0), (3,0) shift up!
    const tiles = [
      0, 1, 2, 3,
      4, 5, 6, 7,
      8, 9, 10, 11,
      12, 13, 14, 15,
    ];
    const b = createBoard(4, tiles);
    const next = moveTile(b, 12);

    expect(next.tiles[0]).toBe(4);
    expect(next.tiles[4]).toBe(8);
    expect(next.tiles[8]).toBe(12);
    expect(next.tiles[12]).toBe(0);
  });

  it('slides 3 tiles at once vertically down (4x4)', () => {
    // Blank at (3, 0) index 12.
    // User clicks (0, 0) index 0. Tiles at (0,0), (1,0), (2,0) shift down!
    const tiles = [
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      0, 13, 14, 15,
    ];
    const b = createBoard(4, tiles);
    const next = moveTile(b, 0);

    expect(next.tiles[0]).toBe(0);
    expect(next.tiles[4]).toBe(1);
    expect(next.tiles[8]).toBe(5);
    expect(next.tiles[12]).toBe(9);
  });
});
