import type { StarRating } from '../levels/types';

export interface LevelRecord {
  levelId: number;
  stars: StarRating;
  bestMoves: number;
  bestTimeSec: number;
  unlocked: boolean;
  completed: boolean;
}

export interface FreePlayRecord {
  bestMoves: number;
  bestTimeSec: number;
}

export interface GameStorageData {
  version: number;
  unlockedMaxLevel: number;
  levels: Record<number, LevelRecord>;
  freePlayBest: Record<number, FreePlayRecord>;
}

export interface LevelVictoryResult {
  isNewRecord: boolean;
  isFirstClear: boolean;
  unlockedNext: boolean;
  nextLevelId: number | null;
  stars: StarRating;
  previousRecord: LevelRecord | null;
}
