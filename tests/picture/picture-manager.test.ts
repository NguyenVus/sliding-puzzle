import { describe, it, expect, beforeEach } from 'vitest';
import { PictureManager } from '../../src/picture/picture-manager';
import { StorageManager } from '../../src/storage/storage-manager';

describe('PictureManager', () => {
  let storage: StorageManager;
  let manager: PictureManager;

  beforeEach(() => {
    storage = new StorageManager();
    storage.resetAll();
    manager = new PictureManager(storage);
  });

  it('initializes with default preset and disabled picture mode', () => {
    expect(manager.isEnabled()).toBe(false);
    expect(manager.isNumbersVisible()).toBe(true);
    expect(manager.getActivePresetId()).toBe('preset-fuji');
    expect(manager.getPresets().length).toBeGreaterThanOrEqual(3);
  });

  it('toggles picture mode on and off and persists to storage', () => {
    expect(manager.toggleEnabled()).toBe(true);
    expect(manager.isEnabled()).toBe(true);
    expect(storage.getSettings().pictureModeEnabled).toBe(true);

    expect(manager.toggleEnabled()).toBe(false);
    expect(manager.isEnabled()).toBe(false);
    expect(storage.getSettings().pictureModeEnabled).toBe(false);
  });

  it('initializes picture mode state from storage when preconfigured', () => {
    storage.updateSettings({ pictureModeEnabled: true });
    const configuredManager = new PictureManager(storage);
    expect(configuredManager.isEnabled()).toBe(true);
  });

  it('selects preset and updates storage', () => {
    manager.selectPreset('preset-pine');
    expect(manager.getActivePresetId()).toBe('preset-pine');
    expect(storage.getSettings().selectedPictureId).toBe('preset-pine');
  });

  it('supports custom uploaded image and reverts if cleared', () => {
    const customData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    manager.setCustomImage(customData);
    expect(manager.getActivePictureUrl()).toBe(customData);

    manager.clearCustomImage();
    expect(manager.getActivePictureUrl()).toContain('data:image/svg+xml');
  });

  it('calculates accurate background coordinates for tile slices', () => {
    manager.setEnabled(true);
    const metrics = {
      boardSize: 320,
      tileSize: 90,
      gap: 6,
      padding: 10,
      fontSize: 36,
      gridSize: 3,
    };

    // Tile 1 at (0, 0)
    const bg1 = manager.getTileBackground(1, 3, metrics);
    expect(bg1).not.toBeNull();
    // Inner size: 3*90 + 2*6 = 282px
    expect(bg1?.backgroundSize).toBe('282px 282px');
    expect(bg1?.backgroundPosition).toBe('-0px -0px');

    // Tile 2 at (0, 1) -> x = 1 * (90 + 6) = 96, y = 0
    const bg2 = manager.getTileBackground(2, 3, metrics);
    expect(bg2?.backgroundPosition).toBe('-96px -0px');

    // Tile 4 at (1, 0) -> x = 0, y = 96
    const bg4 = manager.getTileBackground(4, 3, metrics);
    expect(bg4?.backgroundPosition).toBe('-0px -96px');

    // Tile 8 at (2, 1) -> x = 96, y = 192
    const bg8 = manager.getTileBackground(8, 3, metrics);
    expect(bg8?.backgroundPosition).toBe('-96px -192px');

    // Blank (0) or out of bounds returns null
    expect(manager.getTileBackground(0, 3, metrics)).toBeNull();
    expect(manager.getTileBackground(9, 3, metrics)).toBeNull();
  });
});
