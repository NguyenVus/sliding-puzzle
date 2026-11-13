import type { SwipeDirection } from './pointer-handler';

export interface KeyboardHandlerOptions {
  onDirectionMove: (direction: SwipeDirection) => void;
  onUndo: () => void;
  onRestart: () => void;
  onHint?: () => void;
  onEscape?: () => void;
}

export class KeyboardHandler {
  private readonly options: KeyboardHandlerOptions;
  private isEnabled = true;

  constructor(options: KeyboardHandlerOptions) {
    this.options = options;
    this.init();
  }

  private init(): void {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (!this.isEnabled) return;

    // Do not intercept keystrokes if the user is typing into an input or textarea
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable)
    ) {
      return;
    }

    const key = e.key.toLowerCase();
    const code = e.code;

    // Directional slide
    if (code === 'ArrowUp' || key === 'w' || key === 'arrowup') {
      e.preventDefault();
      this.options.onDirectionMove('up');
      return;
    }
    if (code === 'ArrowDown' || key === 's' || key === 'arrowdown') {
      e.preventDefault();
      this.options.onDirectionMove('down');
      return;
    }
    if (code === 'ArrowLeft' || key === 'a' || key === 'arrowleft') {
      e.preventDefault();
      this.options.onDirectionMove('left');
      return;
    }
    if (code === 'ArrowRight' || key === 'd' || key === 'arrowright') {
      e.preventDefault();
      this.options.onDirectionMove('right');
      return;
    }

    // Undo: Z or Ctrl+Z / Cmd+Z
    if (key === 'z') {
      e.preventDefault();
      this.options.onUndo();
      return;
    }

    // Restart: R
    if (key === 'r') {
      e.preventDefault();
      this.options.onRestart();
      return;
    }

    // Hint: H
    if (key === 'h') {
      e.preventDefault();
      this.options.onHint?.();
      return;
    }

    // Escape: dismiss modals
    if (key === 'escape') {
      if (this.options.onEscape) {
        e.preventDefault();
        this.options.onEscape();
      }
    }
  };

  public destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}
