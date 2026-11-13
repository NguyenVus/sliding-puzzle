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
   * Synthesizes an organic, warm wooden "thock" slide sound.
   *
   * Acoustic parameters:
   * - Attack / Transient: Warm dual oscillator (sine + triangle) pitch glide
   *   from ~650Hz down to ~280Hz in 15ms for tactile mechanical wood contact
   *   without harsh/glassy frequencies.
   * - Body / Resonance: Hollow woody triangle oscillator in the 220Hz-320Hz range
   *   (centered around ~270Hz) with gentle lowpass filtering and crisp 45ms-60ms decay
   *   for an ASMR tactile snap.
   * - Pitch Variation: Subtle +/- 4% random deviation between consecutive slides
   *   to feel natural, dynamic, and non-fatiguing.
   */
  public playTileSlide(): void {
    if (!this.soundEnabled || this.isDestroyed) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const t = Math.max(ctx.currentTime, 0) + 0.002;
    // Micro pitch variation: +/- 4% (0.96 to 1.04)
    const variation = 1 + (Math.random() - 0.5) * 0.08;

    // Gentle lowpass filter to remove harsh highs and accentuate warm wood resonance
    let outputNode: AudioNode = this.masterGain;
    let filterNode: BiquadFilterNode | null = null;
    if (typeof ctx.createBiquadFilter === 'function') {
      filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(920 * variation, t);
      filterNode.Q.setValueAtTime(1.2, t);
      filterNode.connect(this.masterGain);
      outputNode = filterNode;
    }

    // 1. Attack / Transient: sine + triangle glide 650Hz -> 280Hz in 15ms
    const attackStartFreq = 650 * variation;
    const attackEndFreq = 280 * variation;

    // 1a. Attack sine (tactile solid contact mass)
    const attackSine = ctx.createOscillator();
    attackSine.type = 'sine';
    attackSine.frequency.setValueAtTime(attackStartFreq, t);
    attackSine.frequency.exponentialRampToValueAtTime(attackEndFreq, t + 0.015);

    const attackSineGain = ctx.createGain();
    attackSineGain.gain.setValueAtTime(0.0001, t);
    attackSineGain.gain.linearRampToValueAtTime(0.35, t + 0.002);
    attackSineGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);

    attackSine.connect(attackSineGain);
    attackSineGain.connect(outputNode);
    attackSine.start(t);
    attackSine.stop(t + 0.022);

    // 1b. Attack triangle (tactile mechanical wood grain texture)
    const attackTri = ctx.createOscillator();
    attackTri.type = 'triangle';
    attackTri.frequency.setValueAtTime(attackStartFreq, t);
    attackTri.frequency.exponentialRampToValueAtTime(attackEndFreq, t + 0.015);

    const attackTriGain = ctx.createGain();
    attackTriGain.gain.setValueAtTime(0.0001, t);
    attackTriGain.gain.linearRampToValueAtTime(0.15, t + 0.002);
    attackTriGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);

    attackTri.connect(attackTriGain);
    attackTriGain.connect(outputNode);
    attackTri.start(t);
    attackTri.stop(t + 0.02);

    // 2. Body / Resonance: warm hollow wood body (triangle wave at ~270Hz in 220Hz-320Hz range)
    const bodyBaseFreq = 270 * variation;
    const bodyOsc = ctx.createOscillator();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(bodyBaseFreq, t);
    bodyOsc.frequency.exponentialRampToValueAtTime(bodyBaseFreq * 0.85, t + 0.05);

    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.0001, t);
    bodyGain.gain.linearRampToValueAtTime(0.5, t + 0.003);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(outputNode);
    bodyOsc.start(t);
    bodyOsc.stop(t + 0.058);

    // Disconnect filter after sound completion to prevent audio graph leaks
    if (filterNode) {
      const cleanup = () => {
        try {
          filterNode?.disconnect();
        } catch {}
      };
      bodyOsc.onended = cleanup;
      setTimeout(cleanup, 100);
    }
  }

  /**
   * Alias for playTileSlide() conforming to task specifications.
   */
  public playSlide(): void {
    this.playTileSlide();
  }

  /**
   * Alias for playTileSlide() conforming to task specifications.
   */
  public playMove(): void {
    this.playTileSlide();
  }

  /**
   * Synthesizes a bright, luxurious, and uplifting victory chime arpeggio.
   *
   * Harmonic structure:
   * Major 9th chime sequence: C5 -> E5 -> G5 -> B5 -> D6 -> C6 (resolution).
   * Warm marimba / celesta / music box timbre with soft attack, crystalline overtones,
   * and a prolonged resonant decay for satisfying sense of achievement.
   */
  public playVictory(): void {
    if (!this.soundEnabled || this.isDestroyed) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    // 60ms breathing room after the final tile slide impact
    const t = Math.max(ctx.currentTime, 0) + 0.06;

    // Celesta / music box filter for crystal warmth
    let outputNode: AudioNode = this.masterGain;
    let filterNode: BiquadFilterNode | null = null;
    if (typeof ctx.createBiquadFilter === 'function') {
      filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(3600, t);
      filterNode.Q.setValueAtTime(0.7, t);
      filterNode.connect(this.masterGain);
      outputNode = filterNode;
    }

    // Victory Major 9th arpeggio resolving to triumphant C6:
    // C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), B5 (987.77Hz), D6 (1174.66Hz), C6 (1046.50Hz)
    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.45, gain: 0.24 }, // C5
      { freq: 659.25, time: 0.08, duration: 0.45, gain: 0.26 }, // E5
      { freq: 783.99, time: 0.16, duration: 0.5, gain: 0.28 }, // G5
      { freq: 987.77, time: 0.24, duration: 0.55, gain: 0.32 }, // B5
      { freq: 1174.66, time: 0.32, duration: 0.65, gain: 0.36 }, // D6
      { freq: 1046.5, time: 0.44, duration: 1.4, gain: 0.5 }, // C6 (Majestic resolution bell)
    ];

    for (const note of notes) {
      const noteStart = t + note.time;

      // 1. Fundamental warm bell/celesta sine wave
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, noteStart);

      // 2. Harmonic chime overtone (marimba/celesta modal overtone ~2.76x)
      const overtone = ctx.createOscillator();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(note.freq * 2.756, noteStart);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.linearRampToValueAtTime(note.gain, noteStart + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.duration);

      const overGain = ctx.createGain();
      overGain.gain.setValueAtTime(0.0001, noteStart);
      overGain.gain.linearRampToValueAtTime(note.gain * 0.22, noteStart + 0.006);
      overGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.duration * 0.45);

      osc.connect(gain);
      overtone.connect(overGain);

      gain.connect(outputNode);
      overGain.connect(outputNode);

      osc.start(noteStart);
      overtone.start(noteStart);

      osc.stop(noteStart + note.duration);
      overtone.stop(noteStart + note.duration * 0.45);
    }

    if (filterNode) {
      const cleanup = () => {
        try {
          filterNode?.disconnect();
        } catch {}
      };
      setTimeout(cleanup, 2100);
    }
  }

  /**
   * Synthesizes a subtle, pleasant soft wooden tick for button clicks and interactions.
   */
  public playButtonClick(): void {
    if (!this.soundEnabled || this.isDestroyed) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const t = Math.max(ctx.currentTime, 0) + 0.002;

    let outputNode: AudioNode = this.masterGain;
    let filterNode: BiquadFilterNode | null = null;
    if (typeof ctx.createBiquadFilter === 'function') {
      filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(1400, t);
      filterNode.connect(this.masterGain);
      outputNode = filterNode;
    }

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(720, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.012);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.024);

    osc.connect(gain);
    gain.connect(outputNode);

    osc.start(t);
    osc.stop(t + 0.025);

    if (filterNode) {
      const cleanup = () => {
        try {
          filterNode?.disconnect();
        } catch {}
      };
      osc.onended = cleanup;
      setTimeout(cleanup, 60);
    }
  }

  /**
   * Alias for playButtonClick()
   */
  public playClick(): void {
    this.playButtonClick();
  }

  /**
   * Alias for playButtonClick()
   */
  public playButtonTick(): void {
    this.playButtonClick();
  }

  /**
   * Synthesizes an elegant, ethereal upward wooden swoosh/tone for undo actions.
   */
  public playUndo(): void {
    if (!this.soundEnabled || this.isDestroyed) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const t = Math.max(ctx.currentTime, 0) + 0.002;

    let outputNode: AudioNode = this.masterGain;
    let filterNode: BiquadFilterNode | null = null;
    if (typeof ctx.createBiquadFilter === 'function') {
      filterNode = ctx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(1800, t);
      filterNode.connect(this.masterGain);
      outputNode = filterNode;
    }

    // Graceful ascending tone: G4 (392Hz) -> D5 (587.33Hz) in 35ms
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(392, t);
    osc1.frequency.exponentialRampToValueAtTime(587.33, t + 0.035);

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.0001, t);
    gain1.gain.linearRampToValueAtTime(0.28, t + 0.004);
    gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);

    // Subtle harmonic shimmer for lightness: G5 (784Hz) -> D6 (1174.66Hz) in 35ms
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(784, t);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, t + 0.035);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.0001, t);
    gain2.gain.linearRampToValueAtTime(0.12, t + 0.004);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

    osc1.connect(gain1);
    osc2.connect(gain2);

    gain1.connect(outputNode);
    gain2.connect(outputNode);

    osc1.start(t);
    osc2.start(t);

    osc1.stop(t + 0.08);
    osc2.stop(t + 0.065);

    if (filterNode) {
      const cleanup = () => {
        try {
          filterNode?.disconnect();
        } catch {}
      };
      osc1.onended = cleanup;
      setTimeout(cleanup, 120);
    }
  }

  /**
   * Clean up Web Audio nodes and listeners.
   */
  public destroy(): void {
    this.isDestroyed = true;
    this.detachAutoplayUnlock();
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {}
    }
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
