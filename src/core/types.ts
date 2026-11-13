/**
 * Represents the immutable state of an N x N sliding puzzle board.
 */
export interface Board {
  /** Dimension N of the board (N x N) */
  readonly size: number;
  /** Dimension N alias for size */
  readonly n: number;
  /** Flattened 1D array of length N*N containing numbers 0 to N*N - 1, where 0 is empty */
  readonly tiles: readonly number[];
}

/**
 * Pseudo-random number generator function returning a float in [0, 1).
 */
export type PRNG = () => number;
