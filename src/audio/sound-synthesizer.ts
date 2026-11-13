import type { StorageManager } from '../storage/storage-manager';

export interface SoundSynthesizerOptions {
  storageManager?: StorageManager;
  defaultMuted?: boolean;
}

export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private soundEnabled: boolean = true;
  private storageManager?: StorageManager;
  private unlockListenerAttached = false;
  private unlockHandler: (() => void) | null = null;
  private isDestroyed = false;

  constructor(options: SoundSynthesizerOptions = {}) {
    this.storageManager = options.storageManager;
    if (this.storageManager) {
      const settings = this.storageManager.getSettings();
      this.soundEnabled = settings.soundEnabled;
    } else if (options.defaultMuted !== undefined) {
      this.soundEnabled = !options.defaultMuted;
    }

    this.attachAutoplayUnlock();
  }

  /**
   * Safe AudioContext getter with lazy initialization.
   */
  private getAudioContext(): AudioContext | null {
    if (this.isDestroyed) {
      return null;
    }

    if (this.ctx) {
      return this.ctx;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    try {
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.soundEnabled ? 0.35 : 0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
      this.masterGain = null;
    }

    return this.ctx;
  }

  /**
   * Listens for user gestures to unlock AudioContext if suspended by browser autoplay policy.
   */
  private attachAutoplayUnlock(): void {
    if (typeof window === 'undefined' || this.unlockListenerAttached || this.isDestroyed) {
      return;
    }

    this.unlockListenerAttached = true;
    this.unlockHandler = () => {
      void this.resumeContext();
      this.detachAutoplayUnlock();
    };

    window.addEventListener('pointerdown', this.unlockHandler, { once: true, passive: true });
    window.addEventListener('keydown', this.unlockHandler, { once: true, passive: true });
    window.addEventListener('touchstart', this.unlockHandler, { once: true, passive: true });
  }

  private detachAutoplayUnlock(): void {
    if (typeof window === 'undefined' || !this.unlockHandler) {
      return;
    }

    window.removeEventListener('pointerdown', this.unlockHandler);
    window.removeEventListener('keydown', this.unlockHandler);
    window.removeEventListener('touchstart', this.unlockHandler);
    this.unlockHandler = null;
    this.unlockListenerAttached = false;
  }

  /**
   * Explicitly resumes the audio context.
   */
  public async resumeContext(): Promise<void> {
    if (this.isDestroyed) return;
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Ignored if browser blocks resume
      }
    }
  }

  public isMuted(): boolean {
    return !this.soundEnabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(enabled ? 0.35 : 0, now);
    }
    if (this.storageManager) {
      this.storageManager.updateSettings({ soundEnabled: enabled });
    }
  }

  public toggleMute(): boolean {
    const nextState = !this.soundEnabled;
    this.setSoundEnabled(nextState);
    return this.soundEnabled;
  }

  /**
   * Synthesizes an organic wood click/tap sound.
   * Characteristics: Short attack (~2ms), natural wood resonance (500-800Hz),
   * quick decay (~40ms), and subtle random pitch fluctuation (±8%) to prevent fatigue.
   */
  public playTileSlide(): void {
    if (!this.soundEnabled || this.isDestroyed) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const t = Math.max(ctx.currentTime, 0) + 0.002;
    // Micro pitch variation: +/- 8%
    const variation = 1 + (Math.random() - 0.5) * 0.16;
    const baseFreq = 540 * variation;

    // 1. Resonant wood body oscillator (triangle for woody hollow timbre)
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq * 1.5, t);
    // Rapid pitch drop mimicking a physical wooden impact strike
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, t + 0.045);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.001, t);
    oscGain.gain.linearRampToValueAtTime(0.8, t + 0.002);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.048);

    // 2. High snap transient (filtered square for sharp surface contact)
    const snapOsc = ctx.createOscillator();
    snapOsc.type = 'sine';
    snapOsc.frequency.setValueAtTime(1400 * variation, t);
    snapOsc.frequency.exponentialRampToValueAtTime(300, t + 0.015);

    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0.5, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.015);

    // Connect nodes
    osc.connect(oscGain);
    snapOsc.connect(snapGain);

    oscGain.connect(this.masterGain);
    snapGain.connect(this.masterGain);

    osc.start(t);
    snapOsc.start(t);

    osc.stop(t + 0.05);
    snapOsc.stop(t + 0.02);
  }

  /**
   * Synthesizes a bright, inspiring victory fanfare/chime arpeggio.
   * Plays a sequence of harmonic chime notes with shimmering marimba/bell decay.
   */
  public playVictory(): void {
    if (!this.soundEnabled || this.isDestroyed) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const t = Math.max(ctx.currentTime, 0) + 0.002;

    // Victory arpeggio: G4 -> C5 -> E5 -> G5 -> C6 (Joyful major triad fanfare)
    const notes = [
      { freq: 392.0, time: 0.0, duration: 0.35, gain: 0.35 }, // G4
      { freq: 523.25, time: 0.09, duration: 0.35, gain: 0.4 }, // C5
      { freq: 659.25, time: 0.18, duration: 0.35, gain: 0.45 }, // E5
      { freq: 783.99, time: 0.27, duration: 0.5, gain: 0.5 }, // G5
      { freq: 1046.5, time: 0.38, duration: 1.2, gain: 0.65 }, // C6 (Final bell)
      { freq: 1318.5, time: 0.42, duration: 1.1, gain: 0.4 }, // E6 harmony
    ];

    for (const note of notes) {
      const noteStart = t + note.time;

      // Primary sine tone for crystal purity
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, noteStart);

      // Subtle overtone (bell/chime shimmer)
      const overtone = ctx.createOscillator();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(note.freq * 2.76, noteStart);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.linearRampToValueAtTime(note.gain, noteStart + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.duration);

      const overGain = ctx.createGain();
      overGain.gain.setValueAtTime(0.0001, noteStart);
      overGain.gain.linearRampToValueAtTime(note.gain * 0.25, noteStart + 0.008);
      overGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.duration * 0.6);

      osc.connect(gain);
      overtone.connect(overGain);

      gain.connect(this.masterGain);
      overGain.connect(this.masterGain);

      osc.start(noteStart);
      overtone.start(noteStart);

      osc.stop(noteStart + note.duration);
      overtone.stop(noteStart + note.duration * 0.6);
    }
  }

  /**
   * Clean up Web Audio nodes and listeners.
   */
  public destroy(): void {
    this.isDestroyed = true;
    this.detachAutoplayUnlock();
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        void this.ctx.close();
      } catch {}
    }
    this.ctx = null;
    this.masterGain = null;
  }
}

let _defaultSoundSynthesizer: SoundSynthesizer | null = null;
export const defaultSoundSynthesizer: SoundSynthesizer = new Proxy({} as SoundSynthesizer, {
  get(_target, prop) {
    if (!_defaultSoundSynthesizer) {
      _defaultSoundSynthesizer = new SoundSynthesizer();
    }
    const val = Reflect.get(_defaultSoundSynthesizer, prop);
    return typeof val === 'function' ? val.bind(_defaultSoundSynthesizer) : val;
  },
});
