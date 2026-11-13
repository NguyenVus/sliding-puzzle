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
    expect(() => synth.playSlide()).not.toThrow();
    expect(() => synth.playMove()).not.toThrow();
    expect(() => synth.playVictory()).not.toThrow();
    expect(() => synth.playButtonClick()).not.toThrow();
    expect(() => synth.playClick()).not.toThrow();
    expect(() => synth.playButtonTick()).not.toThrow();
    expect(() => synth.playUndo()).not.toThrow();
    expect(() => synth.destroy()).not.toThrow();
  });

  it('synthesizes warm wooden thock for tile sliding with attack transient and body resonance', () => {
    const createdOscillators: Array<{
      type: string;
      frequency: {
        setValueAtTime: ReturnType<typeof vi.fn>;
        exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
      };
      connect: ReturnType<typeof vi.fn>;
      start: ReturnType<typeof vi.fn>;
      stop: ReturnType<typeof vi.fn>;
    }> = [];

    const mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockFilterNode = {
      type: 'lowpass',
      frequency: { setValueAtTime: vi.fn() },
      Q: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
    };

    const mockContext = {
      currentTime: 10,
      state: 'running',
      destination: {},
      createGain: vi.fn(() => ({ ...mockGainNode })),
      createBiquadFilter: vi.fn(() => ({ ...mockFilterNode })),
      createOscillator: vi.fn(() => {
        const osc = {
          type: 'sine',
          frequency: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
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

      // 3 oscillators: transient sine + transient triangle + resonant triangle body
      expect(createdOscillators.length).toBe(3);
      expect(mockContext.createBiquadFilter).toHaveBeenCalled();

      const [attackSine, attackTri, bodyOsc] = createdOscillators;
      expect(attackSine.type).toBe('sine');
      expect(attackTri.type).toBe('triangle');
      expect(bodyOsc.type).toBe('triangle');

      // Attack transient pitch glide: ~650Hz gliding to ~280Hz
      const attackSineStartCall = attackSine.frequency.setValueAtTime.mock.calls[0];
      const attackSineRampCall = attackSine.frequency.exponentialRampToValueAtTime.mock.calls[0];
      expect(attackSineStartCall[0]).toBeGreaterThanOrEqual(650 * 0.96 - 1);
      expect(attackSineStartCall[0]).toBeLessThanOrEqual(650 * 1.04 + 1);
      expect(attackSineRampCall[0]).toBeGreaterThanOrEqual(280 * 0.96 - 1);
      expect(attackSineRampCall[0]).toBeLessThanOrEqual(280 * 1.04 + 1);

      const attackTriStartCall = attackTri.frequency.setValueAtTime.mock.calls[0];
      const attackTriRampCall = attackTri.frequency.exponentialRampToValueAtTime.mock.calls[0];
      expect(attackTriStartCall[0]).toBeGreaterThanOrEqual(650 * 0.96 - 1);
      expect(attackTriStartCall[0]).toBeLessThanOrEqual(650 * 1.04 + 1);
      expect(attackTriRampCall[0]).toBeGreaterThanOrEqual(280 * 0.96 - 1);
      expect(attackTriRampCall[0]).toBeLessThanOrEqual(280 * 1.04 + 1);

      // Body resonance: within warm 220Hz - 320Hz range
      const bodyFreqCall = bodyOsc.frequency.setValueAtTime.mock.calls[0];
      expect(bodyFreqCall[0]).toBeGreaterThanOrEqual(220);
      expect(bodyFreqCall[0]).toBeLessThanOrEqual(320);

      // Test aliases playSlide and playMove
      const slideSpy = vi.spyOn(synth, 'playTileSlide');
      synth.playSlide();
      expect(slideSpy).toHaveBeenCalledTimes(1);
      synth.playMove();
      expect(slideSpy).toHaveBeenCalledTimes(2);
      slideSpy.mockRestore();

      synth.destroy();
    } finally {
      (window as unknown as { AudioContext: unknown }).AudioContext = originalAudioContext;
    }
  });

  it('synthesizes Major 9th chime arpeggio for playVictory', () => {
    const createdOscillators: Array<{
      type: string;
      frequency: {
        setValueAtTime: ReturnType<typeof vi.fn>;
        exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
      };
    }> = [];

    const mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockFilterNode = {
      type: 'lowpass',
      frequency: { setValueAtTime: vi.fn() },
      Q: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
    };

    const mockContext = {
      currentTime: 10,
      state: 'running',
      destination: {},
      createGain: vi.fn(() => ({ ...mockGainNode })),
      createBiquadFilter: vi.fn(() => ({ ...mockFilterNode })),
      createOscillator: vi.fn(() => {
        const osc = {
          type: 'sine',
          frequency: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
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
      synth.playVictory();

      // 6 notes arpeggio (C5, E5, G5, B5, D6, C6) with 2 oscillators each = 12 oscillators
      expect(createdOscillators.length).toBe(12);

      const fundamentalFreqs = [523.25, 659.25, 783.99, 987.77, 1174.66, 1046.5];
      for (let i = 0; i < fundamentalFreqs.length; i++) {
        const fundamentalOsc = createdOscillators[i * 2];
        expect(fundamentalOsc.frequency.setValueAtTime).toHaveBeenCalledWith(
          fundamentalFreqs[i],
          expect.any(Number)
        );
      }

      synth.destroy();
    } finally {
      (window as unknown as { AudioContext: unknown }).AudioContext = originalAudioContext;
    }
  });

  it('synthesizes soft wooden tick for button clicks and aliases', () => {
    const createdOscillators: Array<{
      type: string;
      frequency: {
        setValueAtTime: ReturnType<typeof vi.fn>;
        exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
      };
    }> = [];

    const mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockFilterNode = {
      type: 'lowpass',
      frequency: { setValueAtTime: vi.fn() },
      Q: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
    };

    const mockContext = {
      currentTime: 10,
      state: 'running',
      destination: {},
      createGain: vi.fn(() => ({ ...mockGainNode })),
      createBiquadFilter: vi.fn(() => ({ ...mockFilterNode })),
      createOscillator: vi.fn(() => {
        const osc = {
          type: 'sine',
          frequency: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
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
      synth.playButtonClick();

      expect(createdOscillators.length).toBe(1);
      expect(createdOscillators[0].type).toBe('triangle');

      // Test click aliases
      const clickSpy = vi.spyOn(synth, 'playButtonClick');
      synth.playClick();
      expect(clickSpy).toHaveBeenCalledTimes(1);
      synth.playButtonTick();
      expect(clickSpy).toHaveBeenCalledTimes(2);
      clickSpy.mockRestore();

      synth.destroy();
    } finally {
      (window as unknown as { AudioContext: unknown }).AudioContext = originalAudioContext;
    }
  });

  it('synthesizes graceful upward tone for playUndo', () => {
    const createdOscillators: Array<{
      type: string;
      frequency: {
        setValueAtTime: ReturnType<typeof vi.fn>;
        exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
      };
    }> = [];

    const mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockFilterNode = {
      type: 'lowpass',
      frequency: { setValueAtTime: vi.fn() },
      Q: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
    };

    const mockContext = {
      currentTime: 10,
      state: 'running',
      destination: {},
      createGain: vi.fn(() => ({ ...mockGainNode })),
      createBiquadFilter: vi.fn(() => ({ ...mockFilterNode })),
      createOscillator: vi.fn(() => {
        const osc = {
          type: 'sine',
          frequency: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
        createdOscillators.push(osc);
        return osc;
      }),
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
      synth.playUndo();

      // Ascending dual-tone (fundamental + overtone)
      expect(createdOscillators.length).toBe(2);
      expect(createdOscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(392, expect.any(Number));
      expect(createdOscillators[0].frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(587.33, expect.any(Number));

      synth.destroy();
    } finally {
      (window as unknown as { AudioContext: unknown }).AudioContext = originalAudioContext;
    }
  });

  it('suppresses all sound synthesis when muted', () => {
    const mockContext = {
      currentTime: 10,
      state: 'running',
      destination: {},
      createGain: vi.fn(),
      createOscillator: vi.fn(),
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
      const synth = new SoundSynthesizer({ defaultMuted: true });
      expect(synth.isMuted()).toBe(true);

      synth.playTileSlide();
      synth.playSlide();
      synth.playMove();
      synth.playVictory();
      synth.playButtonClick();
      synth.playClick();
      synth.playUndo();

      expect(mockContext.createOscillator).not.toHaveBeenCalled();
      synth.destroy();
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
    expect(() => synth.playButtonClick()).not.toThrow();
    expect(() => synth.playUndo()).not.toThrow();
    removeSpy.mockRestore();
  });
});
