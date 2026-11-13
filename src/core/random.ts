import type { PRNG } from './types';

/**
 * Creates a deterministic Mulberry32 pseudo-random number generator.
 * Mulberry32 is a simple 32-bit PRNG with great distribution and high performance.
 *
 * @param seed - 32-bit integer seed value
 * @returns PRNG function returning a floating-point number in [0, 1)
 */
export function createMulberry32(seed: number): PRNG {
  let s = (Math.floor(seed) >>> 0) || 1;
  return function mulberry32(): number {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates an integer uniformly distributed in [min, max] inclusive.
 *
 * @param prng - PRNG function
 * @param min - Minimum integer (inclusive)
 * @param max - Maximum integer (inclusive)
 */
export function randomInt(prng: PRNG, min: number, max: number): number {
  if (min > max) {
    throw new Error(`min (${min}) cannot be greater than max (${max})`);
  }
  return Math.floor(prng() * (max - min + 1)) + min;
}
