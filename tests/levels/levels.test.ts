import { describe, it, expect } from 'vitest';
import {
  LEVELS,
  getAllLevels,
  getLevel,
  createLevelBoard,
  evaluateStars,
} from '../../src/levels';
import { isSolvable } from '../../src/core/solvability';
import { isSolved } from '../../src/core/board';

describe('Level System (src/levels)', () => {
  it('contains exactly 30 properly configured levels', () => {
    const levels = getAllLevels();
    expect(levels).toHaveLength(30);
    expect(LEVELS).toHaveLength(30);

    levels.forEach((lvl, idx) => {
      expect(lvl.id).toBe(idx + 1);
      expect(lvl.name).toBe(`Màn ${idx + 1}`);
      expect(lvl.seed).toBeGreaterThan(0);
      expect(lvl.parMoves).toBeGreaterThan(0);
      expect(lvl.targetTimeSec).toBeGreaterThan(0);
    });
  });

  it('configures levels 1-10 as 3x3 with increasing scramble steps from 10 to 80', () => {
    const levels = getAllLevels().slice(0, 10);
    expect(levels).toHaveLength(10);
    expect(levels[0].scrambleSteps).toBe(10);
    expect(levels[9].scrambleSteps).toBe(80);

    for (let i = 0; i < levels.length; i++) {
      expect(levels[i].size).toBe(3);
      if (i > 0) {
        expect(levels[i].scrambleSteps).toBeGreaterThanOrEqual(levels[i - 1].scrambleSteps);
      }
    }
  });

  it('configures levels 11-20 as 4x4 with increasing scramble steps from 30 to 200', () => {
    const levels = getAllLevels().slice(10, 20);
    expect(levels).toHaveLength(10);
    expect(levels[0].scrambleSteps).toBe(30);
    expect(levels[9].scrambleSteps).toBe(200);

    for (let i = 0; i < levels.length; i++) {
      expect(levels[i].size).toBe(4);
      if (i > 0) {
        expect(levels[i].scrambleSteps).toBeGreaterThanOrEqual(levels[i - 1].scrambleSteps);
      }
    }
  });

  it('configures levels 21-30 as 5x5 with increasing scramble steps from 80 to 400', () => {
    const levels = getAllLevels().slice(20, 30);
    expect(levels).toHaveLength(10);
    expect(levels[0].scrambleSteps).toBe(80);
    expect(levels[9].scrambleSteps).toBe(400);

    for (let i = 0; i < levels.length; i++) {
      expect(levels[i].size).toBe(5);
      if (i > 0) {
        expect(levels[i].scrambleSteps).toBeGreaterThanOrEqual(levels[i - 1].scrambleSteps);
      }
    }
  });

  it('assigns unique seeds to all 30 levels', () => {
    const levels = getAllLevels();
    const seeds = new Set(levels.map((l) => l.seed));
    expect(seeds.size).toBe(30);
  });

  it('retrieves levels by ID correctly', () => {
    expect(getLevel(1)?.name).toBe('Màn 1');
    expect(getLevel(15)?.name).toBe('Màn 15');
    expect(getLevel(30)?.name).toBe('Màn 30');
    expect(getLevel(0)).toBeUndefined();
    expect(getLevel(31)).toBeUndefined();
  });

  it('generates deterministic and solvable boards for all 30 levels', () => {
    for (let id = 1; id <= 30; id++) {
      const board1 = createLevelBoard(id);
      const board2 = createLevelBoard(id);

      // Determinism: same seed produces identical starting board
      expect(board1.tiles).toEqual(board2.tiles);
      expect(board1.size).toBe(getLevel(id)!.size);

      // Solvability: 100% solvable
      expect(isSolvable(board1)).toBe(true);

      // Must not be already solved
      expect(isSolved(board1)).toBe(false);
    }
  });

  describe('Star Evaluator (star-evaluator.ts)', () => {
    const config = getLevel(1)!; // parMoves: 12, targetTimeSec: 25

    it('awards 3 stars when moves <= par AND time <= targetTime', () => {
      const res1 = evaluateStars(10, 20, config);
      expect(res1.stars).toBe(3);
      expect(res1.achievedMovesPar).toBe(true);
      expect(res1.achievedTimePar).toBe(true);

      // Boundary condition: exactly par moves and target time
      const res2 = evaluateStars(12, 25, config);
      expect(res2.stars).toBe(3);
    });

    it('awards 2 stars when exceeding 3-star criteria but moves <= par * 1.5', () => {
      // Moves <= par (12), but time exceeded (30s > 25s)
      const res1 = evaluateStars(12, 30, config);
      expect(res1.stars).toBe(2);

      // Moves between par (12) and par*1.5 (18)
      const res2 = evaluateStars(15, 20, config);
      expect(res2.stars).toBe(2);

      // Exactly 1.5 * par moves
      const max2StarMoves = Math.round(config.parMoves * 1.5);
      const res3 = evaluateStars(max2StarMoves, 10, config);
      expect(res3.stars).toBe(2);
    });

    it('awards at most 1 star when hasUsedHint is true, regardless of moves and time', () => {
      // Perfect 3-star performance with moves=5, time=10s, but used hint
      const res1 = evaluateStars(5, 10, config, true);
      expect(res1.stars).toBe(1);
      expect(res1.hasUsedHint).toBe(true);

      // Boundary 3-star performance with used hint
      const res2 = evaluateStars(12, 25, config, true);
      expect(res2.stars).toBe(1);
    });
  });
});
