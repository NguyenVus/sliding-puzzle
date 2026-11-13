export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface PointerHandlerOptions {
  getTileSize: () => number;
  getGridSize: () => number;
  onTap: (index: number, tileValue: number) => void;
  onSwipe: (direction: SwipeDirection, startIndex: number | null, tileValue: number | null) => void;
}

export class PointerHandler {
  private readonly targetElement: HTMLElement;
  private readonly options: PointerHandlerOptions;
  private activePointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private startIndex: number | null = null;
  private startTileVal: number | null = null;
  private lastTouchEndTime = 0;

  constructor(targetElement: HTMLElement, options: PointerHandlerOptions) {
    this.targetElement = targetElement;
    this.options = options;

    this.init();
  }

  private init(): void {
    const el = this.targetElement;

    // Apply strict non-scrolling touch behaviors on board element
    el.style.touchAction = 'none';
    el.style.overscrollBehavior = 'none';

    el.addEventListener('pointerdown', this.handlePointerDown);
    el.addEventListener('pointermove', this.handlePointerMove);
    el.addEventListener('pointerup', this.handlePointerUp);
    el.addEventListener('pointercancel', this.handlePointerCancel);

    // Prevent double-tap zoom on iOS/mobile browsers
    el.addEventListener('touchend', this.preventDoubleTapZoom, { passive: false });
    el.addEventListener('dblclick', this.preventDblClick);
  }

  private handlePointerDown = (e: PointerEvent): void => {
    // Only track single primary pointer at a time
    if (this.activePointerId !== null && this.activePointerId !== e.pointerId) {
      return;
    }

    this.activePointerId = e.pointerId;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startTime = performance.now();

    // Find touched tile if any
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-index]');
    if (target && target.dataset.index !== undefined) {
      this.startIndex = parseInt(target.dataset.index, 10);
      this.startTileVal = target.dataset.tile ? parseInt(target.dataset.tile, 10) : null;
    } else {
      this.startIndex = null;
      this.startTileVal = null;
    }

    try {
      this.targetElement.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if element is not in DOM or capture not allowed
    }
  };

  private handlePointerMove = (e: PointerEvent): void => {
    if (this.activePointerId !== e.pointerId) return;
    // We track the gesture; no default behavior allowed
    e.preventDefault();
  };

  private handlePointerUp = (e: PointerEvent): void => {
    if (this.activePointerId !== e.pointerId) return;

    try {
      this.targetElement.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    const dx = e.clientX - this.startX;
    const dy = e.clientY - this.startY;
    const dist = Math.hypot(dx, dy);
    const duration = performance.now() - this.startTime;

    const tileSize = this.options.getTileSize();
    // Dynamic swipe threshold: 25% of current tile size (minimum 15px)
    const threshold = Math.max(15, tileSize * 0.25);

    if (dist >= threshold) {
      // Swipe gesture recognized
      const direction: SwipeDirection =
        Math.abs(dx) >= Math.abs(dy)
          ? dx > 0
            ? 'right'
            : 'left'
          : dy > 0
          ? 'down'
          : 'up';

      this.options.onSwipe(direction, this.startIndex, this.startTileVal);
    } else if (duration < 500 && this.startIndex !== null && this.startTileVal !== null) {
      // Tap / click gesture recognized
      this.options.onTap(this.startIndex, this.startTileVal);
    }

    this.resetPointer();
  };

  private handlePointerCancel = (e: PointerEvent): void => {
    if (this.activePointerId === e.pointerId) {
      try {
        this.targetElement.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      this.resetPointer();
    }
  };

  private resetPointer(): void {
    this.activePointerId = null;
    this.startIndex = null;
    this.startTileVal = null;
  }

  private preventDoubleTapZoom = (e: TouchEvent): void => {
    const now = performance.now();
    if (now - this.lastTouchEndTime <= 300) {
      e.preventDefault();
    }
    this.lastTouchEndTime = now;
  };

  private preventDblClick = (e: MouseEvent): void => {
    e.preventDefault();
  };

  public destroy(): void {
    const el = this.targetElement;
    el.removeEventListener('pointerdown', this.handlePointerDown);
    el.removeEventListener('pointermove', this.handlePointerMove);
    el.removeEventListener('pointerup', this.handlePointerUp);
    el.removeEventListener('pointercancel', this.handlePointerCancel);
    el.removeEventListener('touchend', this.preventDoubleTapZoom);
    el.removeEventListener('dblclick', this.preventDblClick);
  }
}
