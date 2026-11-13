import type { Board, PRNG } from './types';
import { createSolved, getBlankIndex, getMovableTiles, moveTile } from './board';
import { createMulberry32 } from './random';

/**
 * Scrambles a board by applying `steps` valid random moves starting from a solved state
 * (or from the provided board). Never immediately reverses the previous move, guaranteeing
 * that every scrambled board is fully solvable.
 *
 * @param boardOrSize - An existing Board or a dimension N (creates solved board of size N)
 * @param steps - Number of random moves to perform (default 100)
 * @param seedOrPrng - Seed number for Mulberry32 or custom PRNG function
 * @returns Scrambled immutable Board
 */
export function scrambleBoard(
  boardOrSize: Board | number = 3,
  steps: number = 100,
  seedOrPrng?: number | PRNG
): Board {
  const currentBoard =
    typeof boardOrSize === 'number'
      ? createSolved(boardOrSize)
      : boardOrSize;

  if (steps <= 0) {
    return currentBoard;
  }

  const prng: PRNG =
    typeof seedOrPrng === 'number'
      ? createMulberry32(seedOrPrng)
      : typeof seedOrPrng === 'function'
      ? seedOrPrng
      : Math.random;

  let board = currentBoard;
  let previousBlankIndex = -1;

  for (let step = 0; step < steps; step++) {
    const currentBlankIndex = getBlankIndex(board);
    const movable = getMovableTiles(board);

    // Prevent immediately undoing the move that was just made
    const validMoves =
      previousBlankIndex >= 0
        ? movable.filter((tileIndex) => tileIndex !== previousBlankIndex)
        : movable;

    const choices = validMoves.length > 0 ? validMoves : movable;
    if (choices.length === 0) {
      break;
    }

    const choiceIdx = Math.floor(prng() * choices.length);
    const tileToMove = choices[choiceIdx];

    previousBlankIndex = currentBlankIndex;
    board = moveTile(board, tileToMove);
  }

  return board;
}
