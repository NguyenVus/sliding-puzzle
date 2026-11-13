import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HapticFeedback } from '../../src/haptics/haptic-feedback';
import { StorageManager, STORAGE_KEY } from '../../src/storage';

describe('HapticFeedback (src/haptics/haptic-feedback.ts)', () => {
  let vibrateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    vibrateMock = vi.fn().mockReturnValue(true);
    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrateMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('detects vibration API support correctly', () => {
    const haptic = new HapticFeedback();
    expect(haptic.isSupported()).toBe(true);
  });

  it('handles environment without navigator.vibrate gracefully without throwing', () => {
    // Delete vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const haptic = new HapticFeedback();
    expect(haptic.isSupported()).toBe(false);
    expect(haptic.vibrateSlide()).toBe(false);
    expect(haptic.vibrateSnap()).toBe(false);
    expect(haptic.vibrateVictory()).toBe(false);
    expect(haptic.vibrateButton()).toBe(false);
    expect(() => haptic.destroy()).not.toThrow();
  });

  it('triggers ultra-light 10ms haptic feedback on vibrateSlide', () => {
    const haptic = new HapticFeedback();
    const result = haptic.vibrateSlide();
    expect(result).toBe(true);
    expect(vibrateMock).toHaveBeenCalledWith(10);
  });

  it('triggers 15ms snap haptic feedback when a tile snaps to solved index', () => {
    const haptic = new HapticFeedback();
    const result = haptic.vibrateSnap();
    expect(result).toBe(true);
    expect(vibrateMock).toHaveBeenCalledWith(15);
  });

  it('triggers victory fanfare rhythm pattern [40, 60, 40, 60, 80]', () => {
    const haptic = new HapticFeedback();
    const result = haptic.vibrateVictory();
    expect(result).toBe(true);
    expect(vibrateMock).toHaveBeenCalledWith([40, 60, 40, 60, 80]);
  });

  it('triggers crisp 8ms micro-tap on UI button press', () => {
    const haptic = new HapticFeedback();
    const result = haptic.vibrateButton();
    expect(result).toBe(true);
    expect(vibrateMock).toHaveBeenCalledWith(8);
  });

  it('respects enabled / disabled state', () => {
    const haptic = new HapticFeedback();
    expect(haptic.isEnabled()).toBe(true);

    haptic.setEnabled(false);
    expect(haptic.isEnabled()).toBe(false);
    expect(vibrateMock).toHaveBeenCalledWith(0);
    vibrateMock.mockClear();

    const result = haptic.vibrateSlide();
    expect(result).toBe(false);
    expect(vibrateMock).not.toHaveBeenCalled();

    haptic.toggle();
    expect(haptic.isEnabled()).toBe(true);
    haptic.vibrateSlide();
    expect(vibrateMock).toHaveBeenCalledWith(10);
  });

  it('initializes from StorageManager user settings', () => {
    const storage = new StorageManager();
    storage.updateSettings({ hapticEnabled: false });

    const haptic = new HapticFeedback({ storageManager: storage });
    expect(haptic.isEnabled()).toBe(false);

    storage.updateSettings({ hapticEnabled: true });
    const haptic2 = new HapticFeedback({ storageManager: storage });
    expect(haptic2.isEnabled()).toBe(true);
  });

  it('catches and suppresses browser security errors during vibrate', () => {
    vibrateMock.mockImplementation(() => {
      throw new Error('NotAllowedError: user gesture required');
    });

    const haptic = new HapticFeedback();
    expect(() => haptic.vibrateSlide()).not.toThrow();
    expect(haptic.vibrateSlide()).toBe(false);
  });

  it('cancels active vibration pattern on destroy', () => {
    const haptic = new HapticFeedback();
    haptic.destroy();
    expect(vibrateMock).toHaveBeenCalledWith(0);
  });
});
