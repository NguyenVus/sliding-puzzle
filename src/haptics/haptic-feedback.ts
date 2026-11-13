import type { StorageManager } from '../storage/storage-manager';

export interface HapticFeedbackOptions {
  storageManager?: StorageManager;
  defaultEnabled?: boolean;
}

/**
 * Mobile Haptic Feedback Manager using navigator.vibrate.
 * Provides tactile mechanical physical sensations for tile sliding,
 * home-position snapping, UI button taps, and victory celebrations.
 */
export class HapticFeedback {
  private enabled: boolean = true;
  private storageManager?: StorageManager;

  constructor(options: HapticFeedbackOptions = {}) {
    this.storageManager = options.storageManager;
    if (this.storageManager) {
      const settings = this.storageManager.getSettings();
      this.enabled = settings.hapticEnabled ?? true;
    } else if (options.defaultEnabled !== undefined) {
      this.enabled = options.defaultEnabled;
    }
  }

  /**
   * Checks whether the browser and device support the Vibration API.
   */
  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  /**
   * Returns whether haptic feedback is currently enabled by user settings.
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Enables or disables haptic feedback.
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.destroy();
    }
  }

  /**
   * Toggles haptic feedback on or off.
   */
  public toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * Triggers a vibration pattern if enabled and supported.
   * Gracefully catches any browser security / gesture errors.
   */
  public vibrate(pattern: number | number[]): boolean {
    if (!this.enabled || !this.isSupported()) {
      return false;
    }
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }

  /**
   * Ultra-light 10ms haptic impulse when sliding a mechanical wooden tile.
   */
  public vibrateSlide(): boolean {
    return this.vibrate(10);
  }

  /**
   * Satisfying 15ms click impulse when a tile snaps into its correct target index.
   */
  public vibrateSnap(): boolean {
    return this.vibrate(15);
  }

  /**
   * Celebratory victory rhythm pattern [40, 60, 40, 60, 80] matching fanfare music.
   */
  public vibrateVictory(): boolean {
    return this.vibrate([40, 60, 40, 60, 80]);
  }

  /**
   * Crisp 8ms micro-tap on UI button interaction.
   */
  public vibrateButton(): boolean {
    return this.vibrate(8);
  }

  /**
   * Cancels active vibration patterns and releases resources.
   */
  public destroy(): void {
    if (this.isSupported()) {
      try {
        navigator.vibrate(0);
      } catch {}
    }
  }
}

export const defaultHaptics = new HapticFeedback();
