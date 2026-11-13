import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SoundSynthesizer } from '../../src/audio/sound-synthesizer';
import { StorageManager } from '../../src/storage/storage-manager';

describe('SoundSynthesizer', () => {
  let storage: StorageManager;

  beforeEach(() => {
    storage = new StorageManager();
    storage.resetAll();
  });

  it('initializes with settings from StorageManager', () => {
    storage.updateSettings({ soundEnabled: false });
    const synth = new SoundSynthesizer({ storageManager: storage });

    expect(synth.isMuted()).toBe(true);
    expect(synth.isSoundEnabled()).toBe(false);
  });

  it('toggles sound on and off and persists to StorageManager', () => {
    const synth = new SoundSynthesizer({ storageManager: storage });
    expect(synth.isSoundEnabled()).toBe(true);

    const newState = synth.toggleMute();
    expect(newState).toBe(false);
    expect(synth.isSoundEnabled()).toBe(false);
    expect(storage.getSettings().soundEnabled).toBe(false);

    const reToggled = synth.toggleMute();
    expect(reToggled).toBe(true);
    expect(synth.isSoundEnabled()).toBe(true);
    expect(storage.getSettings().soundEnabled).toBe(true);
  });

  it('runs safely without throwing when Web Audio API is unavailable', () => {
    const synth = new SoundSynthesizer();
    expect(() => synth.playTileSlide()).not.toThrow();
    expect(() => synth.playVictory()).not.toThrow();
    expect(() => synth.destroy()).not.toThrow();
  });

  it('creates audio nodes and synthesizes sound when AudioContext exists', () => {
    const mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    const mockContext = {
      currentTime: 10,
      state: 'running',
      destination: {},
      createGain: vi.fn(() => ({ ...mockGainNode })),
      createOscillator: vi.fn(() => ({ ...mockOscillator })),
      resume: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };

    const originalAudioContext = window.AudioContext;
    class MockAudioContext {
      constructor() {
        return mockContext as unknown as AudioContext;
      }
    }
    (window as unknown as { AudioContext: unknown }).AudioContext = MockAudioContext;

    try {
      const synth = new SoundSynthesizer();
      synth.playTileSlide();

      expect(mockContext.createOscillator).toHaveBeenCalled();
      expect(mockContext.createGain).toHaveBeenCalled();

      synth.playVictory();
      expect(mockContext.createOscillator).toHaveBeenCalledTimes(2 + 12); // 2 from slide + 12 from victory

      synth.setSoundEnabled(false);
      expect(synth.isMuted()).toBe(true);

      synth.destroy();
      expect(mockContext.close).toHaveBeenCalled();
    } finally {
      (window as unknown as { AudioContext: unknown }).AudioContext = originalAudioContext;
    }
  });

  it('cleans up event listeners and prevents recreation after destroy', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const synth = new SoundSynthesizer();
    synth.destroy();

    expect(removeSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));

    // After destruction, calling play methods should not throw or recreate context
    expect(() => synth.playTileSlide()).not.toThrow();
    expect(() => synth.playVictory()).not.toThrow();
    removeSpy.mockRestore();
  });
});
