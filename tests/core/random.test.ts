import { describe, it, expect } from 'vitest';
import { createMulberry32, randomInt } from '../../src/core/random';

describe('Mulberry32 PRNG', () => {
  it('is completely reproducible with the same seed', () => {
    const prngA = createMulberry32(42);
    const prngB = createMulberry32(42);

    for (let i = 0; i < 50; i++) {
      expect(prngA()).toBe(prngB());
    }
  });

  it('produces different sequences for different seeds, including seed 0 and 1', () => {
    const prng0 = createMulberry32(0);
    const prng1 = createMulberry32(1);

    const values0 = Array.from({ length: 10 }, () => prng0());
    const values1 = Array.from({ length: 10 }, () => prng1());

    expect(values0).not.toEqual(values1);

    const prngA = createMulberry32(12345);
    const prngB = createMulberry32(54321);

    const valuesA = Array.from({ length: 10 }, () => prngA());
    const valuesB = Array.from({ length: 10 }, () => prngB());

    expect(valuesA).not.toEqual(valuesB);
  });

  it('is completely reproducible with seed 0', () => {
    const prngA = createMulberry32(0);
    const prngB = createMulberry32(0);

    for (let i = 0; i < 50; i++) {
      expect(prngA()).toBe(prngB());
    }
  });

  it('handles negative seeds deterministically via 32-bit wrap', () => {
    const prngNeg = createMulberry32(-42);
    const prngWrapped = createMulberry32(-42 >>> 0);

    for (let i = 0; i < 20; i++) {
      expect(prngNeg()).toBe(prngWrapped());
    }
  });

  it('generates values strictly in [0, 1)', () => {
    const prng = createMulberry32(987654321);
    for (let i = 0; i < 1000; i++) {
      const val = prng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});

describe('randomInt', () => {
  it('generates integers within [min, max] inclusive', () => {
    const prng = createMulberry32(777);
    const results = new Set<number>();

    for (let i = 0; i < 300; i++) {
      const val = randomInt(prng, 3, 7);
      expect(Number.isInteger(val)).toBe(true);
      expect(val).toBeGreaterThanOrEqual(3);
      expect(val).toBeLessThanOrEqual(7);
      results.add(val);
    }

    // Over 300 iterations, all values [3, 4, 5, 6, 7] should be hit
    expect(results.size).toBe(5);
  });

  it('throws when min > max', () => {
    const prng = createMulberry32(1);
    expect(() => randomInt(prng, 10, 5)).toThrow();
  });

  it('throws when min or max are non-integers', () => {
    const prng = createMulberry32(1);
    expect(() => randomInt(prng, 1.5, 5)).toThrow(/must be integers/);
    expect(() => randomInt(prng, 1, 5.5)).toThrow(/must be integers/);
  });
});
