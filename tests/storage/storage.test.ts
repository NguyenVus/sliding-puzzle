import { describe, it, expect, beforeEach } from 'vitest';
import { StorageManager, STORAGE_KEY } from '../../src/storage';

describe('Storage System (src/storage)', () => {
  let storage: StorageManager;

  beforeEach(() => {
    // Clear localStorage if present
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    storage = new StorageManager();
  });

  it('initializes with default data where Level 1 is unlocked and levels 2-30 are locked', () => {
    expect(storage.isLevelUnlocked(1)).toBe(true);
    for (let i = 2; i <= 30; i++) {
      expect(storage.isLevelUnlocked(i)).toBe(false);
    }

    const rec1 = storage.getLevelRecord(1);
    expect(rec1.unlocked).toBe(true);
    expect(rec1.completed).toBe(false);
    expect(rec1.stars).toBe(0);

    const rec2 = storage.getLevelRecord(2);
    expect(rec2.unlocked).toBe(false);
    expect(rec2.completed).toBe(false);
  });

  it('records victory on Level 1, saves stats, and unlocks Level 2', () => {
    const result = storage.recordLevelVictory(1, 10, 15, 3);

    expect(result.isFirstClear).toBe(true);
    expect(result.unlockedNext).toBe(true);
    expect(result.nextLevelId).toBe(2);
    expect(result.stars).toBe(3);

    // Verify level 1 record
    const rec1 = storage.getLevelRecord(1);
    expect(rec1.completed).toBe(true);
    expect(rec1.stars).toBe(3);
    expect(rec1.bestMoves).toBe(10);
    expect(rec1.bestTimeSec).toBe(15);

    // Verify level 2 is now unlocked
    expect(storage.isLevelUnlocked(2)).toBe(true);
    expect(storage.isLevelUnlocked(3)).toBe(false);
  });

  it('updates best records when replay achieves better performance', () => {
    // First clear: 20 moves, 40s, 2 stars
    storage.recordLevelVictory(1, 20, 40, 2);

    // Replay 1: Worse moves (25) and time (50s) -> should not overwrite
    const r1 = storage.recordLevelVictory(1, 25, 50, 1);
    expect(r1.isNewRecord).toBe(false);
    const recAfterWorse = storage.getLevelRecord(1);
    expect(recAfterWorse.bestMoves).toBe(20);
    expect(recAfterWorse.bestTimeSec).toBe(40);
    expect(recAfterWorse.stars).toBe(2);

    // Replay 2: Better moves (14) and 3 stars -> should update
    const r2 = storage.recordLevelVictory(1, 14, 30, 3);
    expect(r2.isNewRecord).toBe(true);
    const recAfterBetter = storage.getLevelRecord(1);
    expect(recAfterBetter.bestMoves).toBe(14);
    expect(recAfterBetter.bestTimeSec).toBe(30);
    expect(recAfterBetter.stars).toBe(3);
  });

  it('handles completion of level 30 without throwing', () => {
    const res = storage.recordLevelVictory(30, 250, 400, 3);
    expect(res.unlockedNext).toBe(false);
    expect(res.nextLevelId).toBeNull();
    expect(storage.isLevelUnlocked(30)).toBe(true);
  });

  it('stores and retrieves Free Play records by size', () => {
    expect(storage.getFreePlayRecord(4)).toBeNull();

    storage.recordFreePlayVictory(4, 55, 62);
    const rec1 = storage.getFreePlayRecord(4);
    expect(rec1?.bestMoves).toBe(55);
    expect(rec1?.bestTimeSec).toBe(62);

    storage.recordFreePlayVictory(4, 45, 70); // better moves
    const rec2 = storage.getFreePlayRecord(4);
    expect(rec2?.bestMoves).toBe(45);
    expect(rec2?.bestTimeSec).toBe(62); // kept best time
  });

  it('resets progress back to default state', () => {
    storage.recordLevelVictory(1, 10, 15, 3);
    storage.recordLevelVictory(2, 12, 18, 3);
    expect(storage.isLevelUnlocked(3)).toBe(true);

    storage.resetAll();

    expect(storage.isLevelUnlocked(1)).toBe(true);
    expect(storage.isLevelUnlocked(2)).toBe(false);
    expect(storage.isLevelUnlocked(3)).toBe(false);
    expect(storage.getLevelRecord(1).completed).toBe(false);
  });

  it('falls back safely to in-memory storage if localStorage is blocked or throws', () => {
    // Create an instance and deliberately disable localStorage
    const isolatedStorage = new StorageManager();
    // Simulate localStorage throwing on setItem
    const originalSetItem = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error('QuotaExceeded or SecurityError in private browsing');
    };

    try {
      isolatedStorage.recordLevelVictory(1, 8, 12, 3);
      expect(isolatedStorage.isLevelUnlocked(2)).toBe(true);
      expect(isolatedStorage.getLevelRecord(1).bestMoves).toBe(8);
    } finally {
      window.localStorage.setItem = originalSetItem;
    }
  });

  it('rejects invalid level IDs for isLevelUnlocked', () => {
    expect(storage.isLevelUnlocked(0)).toBe(false);
    expect(storage.isLevelUnlocked(-5)).toBe(false);
    expect(storage.isLevelUnlocked(31)).toBe(false);
    expect(storage.isLevelUnlocked(NaN)).toBe(false);
    expect(storage.isLevelUnlocked(1.5)).toBe(false);
  });

  it('handles corrupted or non-object localStorage values gracefully', () => {
    window.localStorage.setItem(STORAGE_KEY, 'null');
    const dataNull = storage.load();
    expect(dataNull.unlockedMaxLevel).toBe(1);
    expect(dataNull.levels[1].unlocked).toBe(true);

    window.localStorage.setItem(STORAGE_KEY, '"hello world"');
    const dataStr = storage.load();
    expect(dataStr.unlockedMaxLevel).toBe(1);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, unlockedMaxLevel: NaN, levels: null })
    );
    const dataNaN = storage.load();
    expect(dataNaN.unlockedMaxLevel).toBe(1);
  });

  it('properly records and updates Free Play records when starting from 0', () => {
    storage.recordFreePlayVictory(5, 42, 60);
    const rec1 = storage.getFreePlayRecord(5);
    expect(rec1?.bestMoves).toBe(42);
    expect(rec1?.bestTimeSec).toBe(60);

    const isNew = storage.recordFreePlayVictory(5, 38, 70);
    expect(isNew).toBe(true);
    const rec2 = storage.getFreePlayRecord(5);
    expect(rec2?.bestMoves).toBe(38);
    expect(rec2?.bestTimeSec).toBe(60);
  });
});
