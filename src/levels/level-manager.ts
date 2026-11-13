import type { Board } from '../core/types';
import { isSolved } from '../core/board';
import { scrambleBoard } from '../core/scramble';
import { LEVELS } from './levels-data';
import type { LevelConfig } from './types';

export function getAllLevels(): readonly LevelConfig[] {
  return LEVELS;
}

export function getLevel(id: number): LevelConfig | undefined {
  return LEVELS.find((lvl) => lvl.id === id);
}

/**
 * Creates a deterministic, solvable starting board for the given level.
 * Using a fixed unique seed guarantees exact reproducibility.
 */
export function createLevelBoard(id: number): Board {
  const config = getLevel(id);
  if (!config) {
    throw new Error(`Level with id ${id} not found.`);
  }

  let board = scrambleBoard(config.size, config.scrambleSteps, config.seed);
  let salt = 1;
  while (isSolved(board)) {
    board = scrambleBoard(config.size, config.scrambleSteps, config.seed + salt);
    salt++;
  }

  return board;
}
