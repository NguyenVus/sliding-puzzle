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
    expect(manager.getPresets().length).toBe(10);
  });

  it('provides 10 diverse presets across animals, space, nature, and art categories', () => {
    const presets = manager.getPresets();
    expect(presets.length).toBe(10);

    const categories = new Set(presets.map((p) => p.category));
    expect(categories.has('animals')).toBe(true);
    expect(categories.has('nature')).toBe(true);
    expect(categories.has('space')).toBe(true);
    expect(categories.has('art')).toBe(true);

    const expectedIds = [
      'preset-fuji',
      'preset-cat',
      'preset-corgi',
      'preset-panda',
      'preset-astronaut',
      'preset-cosmic',
      'preset-aurora',
      'preset-pine',
      'preset-wave',
      'preset-starry',
    ];

    for (const expectedId of expectedIds) {
      const preset = presets.find((p) => p.id === expectedId);
      expect(preset).toBeDefined();
      expect(preset?.name.length).toBeGreaterThan(0);
      expect(preset?.categoryLabel).toBeDefined();
      expect(preset?.thumbnail).toContain('data:image/svg+xml');
      expect(preset?.url).toContain('data:image/svg+xml');
    }
  });

  it('ensures all 10 preset SVGs are well-formed valid XML documents without parser errors', () => {
    const presets = manager.getPresets();
    const parser = new DOMParser();

    for (const preset of presets) {
      expect(preset.url.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
      const rawSvg = decodeURIComponent(preset.url.replace('data:image/svg+xml;charset=utf-8,', ''));
      expect(rawSvg).toContain('<svg');
      expect(rawSvg).toContain('</svg>');

      const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
      const parserErrors = doc.querySelectorAll('parsererror');
      expect(parserErrors.length).toBe(0);

      const svgEl = doc.querySelector('svg');
      expect(svgEl).not.toBeNull();
      expect(svgEl?.getAttribute('viewBox')).toBe('0 0 600 600');
      expect(svgEl?.getAttribute('width')).toBe('600');
      expect(svgEl?.getAttribute('height')).toBe('600');
    }
  });

  it('selects newly added presets such as cat and starry night', () => {
    manager.selectPreset('preset-cat');
    expect(manager.getActivePresetId()).toBe('preset-cat');
    expect(manager.getActivePictureUrl()).toContain('data:image/svg+xml');

    manager.selectPreset('preset-starry');
    expect(manager.getActivePresetId()).toBe('preset-starry');
    expect(manager.getActivePictureUrl()).toContain('data:image/svg+xml');
  });

  it('safely falls back to default preset if storage contains unknown preset ID', () => {
    storage.updateSettings({ selectedPictureId: 'corrupted-nonexistent-id' });
    const safeManager = new PictureManager(storage);
    expect(safeManager.getActivePresetId()).toBe('preset-fuji');
    expect(safeManager.getActivePictureUrl()).toContain('data:image/svg+xml');
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
