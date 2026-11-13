import type { LevelConfig, StarEvaluation, StarRating } from './types';

/**
 * Evaluates performance against level targets.
 * - 3 stars: moves <= parMoves AND timeSec <= targetTimeSec
 * - 2 stars: moves <= Math.round(parMoves * 1.5)
 * - 1 star: completed the level
 */
export function evaluateStars(
  moves: number,
  timeSec: number,
  config: LevelConfig,
  hasUsedHint: boolean = false
): StarEvaluation {
  const achievedMovesPar = moves <= config.parMoves;
  const achievedTimePar = timeSec <= config.targetTimeSec;

  let stars: StarRating;
  if (hasUsedHint) {
    stars = 1;
  } else if (achievedMovesPar && achievedTimePar) {
    stars = 3;
  } else if (moves <= Math.round(config.parMoves * 1.5)) {
    stars = 2;
  } else {
    stars = 1;
  }

  return {
    stars,
    movesPar: config.parMoves,
    timeParSec: config.targetTimeSec,
    achievedMovesPar,
    achievedTimePar,
    hasUsedHint,
  };
}
