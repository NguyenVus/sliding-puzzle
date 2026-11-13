import type {
  BoardTheme,
  FreePlayRecord,
  GameStorageData,
  LevelRecord,
  LevelVictoryResult,
  UserSettings,
} from './types';
import type { StarRating } from '../levels/types';

export const STORAGE_KEY = 'sliding_puzzle_progress_v1';
export const TOTAL_LEVELS = 30;

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  hapticEnabled: true,
  theme: 'wood-light',
  animationEnabled: true,
  pictureModeEnabled: false,
  pictureNumbersEnabled: true,
  selectedPictureId: 'preset-fuji',
};

export const VALID_THEMES: readonly BoardTheme[] = [
  'wood-light',
  'wood-dark',
  'marble-gold',
  'tatami-sakura',
  'neon-cyberpunk',
];

export class StorageManager {
  private inMemoryFallback: Map<string, string> = new Map();
  private isLocalStorageAvailable: boolean;

  constructor() {
    this.isLocalStorageAvailable = this.checkLocalStorage();
  }

  private checkLocalStorage(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      const testKey = '__puzzle_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private getItem(key: string): string | null {
    if (this.isLocalStorageAvailable) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return this.inMemoryFallback.get(key) ?? null;
      }
    }
    return this.inMemoryFallback.get(key) ?? null;
  }

  private setItem(key: string, value: string): void {
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fallback to in-memory on QuotaExceeded or security errors
        this.inMemoryFallback.set(key, value);
      }
    } else {
      this.inMemoryFallback.set(key, value);
    }
  }

  private removeItem(key: string): void {
    if (this.isLocalStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
      } catch {}
    }
    this.inMemoryFallback.delete(key);
  }

  public getDefaultData(): GameStorageData {
    const levels: Record<number, LevelRecord> = {};
    for (let id = 1; id <= TOTAL_LEVELS; id++) {
      levels[id] = {
        levelId: id,
        stars: 0,
        bestMoves: 0,
        bestTimeSec: 0,
        unlocked: id === 1,
        completed: false,
      };
    }

    return {
      version: 1,
      unlockedMaxLevel: 1,
      levels,
      freePlayBest: {},
      settings: { ...DEFAULT_SETTINGS },
    };
  }

  public load(): GameStorageData {
    const raw = this.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = this.getDefaultData();
      this.save(initial);
      return initial;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        const initial = this.getDefaultData();
        this.save(initial);
        return initial;
      }

      const defaults = this.getDefaultData();
      const rawMax = Number(parsed.unlockedMaxLevel);
      const unlockedMaxLevel = Number.isFinite(rawMax)
        ? Math.min(TOTAL_LEVELS, Math.max(1, Math.floor(rawMax)))
        : 1;

      const rawSettings =
        parsed.settings && typeof parsed.settings === 'object' ? parsed.settings : {};
      const mergedSettings: UserSettings = {
        ...DEFAULT_SETTINGS,
        ...rawSettings,
      };

      if (!VALID_THEMES.includes(mergedSettings.theme)) {
        mergedSettings.theme = DEFAULT_SETTINGS.theme;
      }
      if (typeof mergedSettings.hapticEnabled !== 'boolean') {
        mergedSettings.hapticEnabled = DEFAULT_SETTINGS.hapticEnabled;
      }

      const merged: GameStorageData = {
        version: typeof parsed.version === 'number' ? parsed.version : defaults.version,
        unlockedMaxLevel,
        levels: { ...defaults.levels, ...(parsed.levels && typeof parsed.levels === 'object' ? parsed.levels : {}) },
        freePlayBest: { ...(parsed.freePlayBest && typeof parsed.freePlayBest === 'object' ? parsed.freePlayBest : {}) },
        settings: mergedSettings,
      };

      // Always guarantee Level 1 is unlocked
      merged.levels[1] = {
        ...(merged.levels[1] ?? defaults.levels[1]),
        unlocked: true,
      };

      // Ensure all levels up to unlockedMaxLevel have unlocked = true
      for (let i = 1; i <= merged.unlockedMaxLevel && i <= TOTAL_LEVELS; i++) {
        if (!merged.levels[i]) {
          merged.levels[i] = {
            levelId: i,
            stars: 0,
            bestMoves: 0,
            bestTimeSec: 0,
            unlocked: true,
            completed: false,
          };
        } else {
          merged.levels[i].unlocked = true;
        }
      }

      return merged;
    } catch {
      const initial = this.getDefaultData();
      this.save(initial);
      return initial;
    }
  }

  public save(data: GameStorageData): void {
    try {
      this.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Graceful silently handled via fallback
    }
  }

  public isLevelUnlocked(levelId: number): boolean {
    if (!Number.isInteger(levelId) || levelId < 1 || levelId > TOTAL_LEVELS) {
      return false;
    }
    if (levelId === 1) return true;

    const data = this.load();
    if (levelId <= data.unlockedMaxLevel) {
      return true;
    }

    const rec = data.levels[levelId];
    return rec?.unlocked ?? false;
  }

  public getLevelRecord(levelId: number): LevelRecord {
    const data = this.load();
    const existing = data.levels[levelId];
    if (existing) {
      return existing;
    }

    return {
      levelId,
      stars: 0,
      bestMoves: 0,
      bestTimeSec: 0,
      unlocked: levelId === 1,
      completed: false,
    };
  }

  public getAllLevelRecords(): Record<number, LevelRecord> {
    const data = this.load();
    return data.levels;
  }

  public recordLevelVictory(
    levelId: number,
    moves: number,
    timeSec: number,
    stars: StarRating
  ): LevelVictoryResult {
    const data = this.load();
    const existing = data.levels[levelId] ?? {
      levelId,
      stars: 0,
      bestMoves: 0,
      bestTimeSec: 0,
      unlocked: true,
      completed: false,
    };

    const previousRecord: LevelRecord = { ...existing };
    const isFirstClear = !existing.completed;

    let isNewRecord = false;
    if (isFirstClear) {
      isNewRecord = true;
    } else {
      if (stars > existing.stars) isNewRecord = true;
      if (moves < existing.bestMoves) isNewRecord = true;
      if (timeSec < existing.bestTimeSec) isNewRecord = true;
    }

    const updatedStars = Math.max(existing.stars, stars) as StarRating;
    const updatedBestMoves =
      existing.bestMoves === 0 ? moves : Math.min(existing.bestMoves, moves);
    const updatedBestTimeSec =
      existing.bestTimeSec === 0 ? timeSec : Math.min(existing.bestTimeSec, timeSec);

    data.levels[levelId] = {
      levelId,
      stars: updatedStars,
      bestMoves: updatedBestMoves,
      bestTimeSec: updatedBestTimeSec,
      unlocked: true,
      completed: true,
    };

    let unlockedNext = false;
    let nextLevelId: number | null = null;

    if (levelId < TOTAL_LEVELS) {
      nextLevelId = levelId + 1;
      if (data.unlockedMaxLevel < nextLevelId) {
        data.unlockedMaxLevel = nextLevelId;
        unlockedNext = true;
      }
      if (!data.levels[nextLevelId]) {
        data.levels[nextLevelId] = {
          levelId: nextLevelId,
          stars: 0,
          bestMoves: 0,
          bestTimeSec: 0,
          unlocked: true,
          completed: false,
        };
      } else {
        data.levels[nextLevelId].unlocked = true;
      }
    }

    this.save(data);

    return {
      isNewRecord,
      isFirstClear,
      unlockedNext,
      nextLevelId,
      stars,
      previousRecord: isFirstClear ? null : previousRecord,
    };
  }

  public recordFreePlayVictory(
    size: number,
    moves: number,
    timeSec: number
  ): boolean {
    const data = this.load();
    const existing = data.freePlayBest[size];

    let isNewRecord = false;
    if (!existing || existing.bestMoves === 0) {
      isNewRecord = true;
      data.freePlayBest[size] = { bestMoves: moves, bestTimeSec: timeSec };
    } else {
      const bestMoves = existing.bestMoves > 0 ? Math.min(existing.bestMoves, moves) : moves;
      const bestTimeSec = existing.bestTimeSec > 0 ? Math.min(existing.bestTimeSec, timeSec) : timeSec;
      if (bestMoves < existing.bestMoves || bestTimeSec < existing.bestTimeSec) {
        isNewRecord = true;
      }
      data.freePlayBest[size] = { bestMoves, bestTimeSec };
    }

    this.save(data);
    return isNewRecord;
  }

  public getFreePlayRecord(size: number): FreePlayRecord | null {
    const data = this.load();
    return data.freePlayBest[size] ?? null;
  }

  public getSettings(): UserSettings {
    const data = this.load();
    return { ...DEFAULT_SETTINGS, ...data.settings };
  }

  public updateSettings(partial: Partial<UserSettings>): UserSettings {
    const data = this.load();
    const updated: UserSettings = {
      ...DEFAULT_SETTINGS,
      ...data.settings,
      ...partial,
    };
    if (!VALID_THEMES.includes(updated.theme)) {
      updated.theme = DEFAULT_SETTINGS.theme;
    }
    if (typeof updated.hapticEnabled !== 'boolean') {
      updated.hapticEnabled = DEFAULT_SETTINGS.hapticEnabled;
    }
    data.settings = updated;
    this.save(data);
    return updated;
  }

  public resetAll(): void {
    this.removeItem(STORAGE_KEY);
    this.save(this.getDefaultData());
  }
}

export const defaultStorage = new StorageManager();
