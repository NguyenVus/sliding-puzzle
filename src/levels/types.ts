export interface LevelConfig {
  id: number;
  name: string;
  size: number;
  scrambleSteps: number;
  seed: number;
  parMoves: number;
  targetTimeSec: number;
}

export type StarRating = 0 | 1 | 2 | 3;

export interface StarEvaluation {
  stars: StarRating;
  movesPar: number;
  timeParSec: number;
  achievedMovesPar: boolean;
  achievedTimePar: boolean;
}
