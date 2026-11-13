export interface LayoutMetrics {
  boardSize: number;
  tileSize: number;
  gap: number;
  padding: number;
  fontSize: number;
  tileRadius?: number;
  gridSize: number;
}

export interface LayoutManagerOptions {
  gridSize?: number;
  maxBoardSize?: number;
  minBoardSize?: number;
  onLayoutChange?: (metrics: LayoutMetrics) => void;
}

/**
 * Manages responsive layout calculations for the sliding puzzle board.
 * Uses ResizeObserver and viewport metrics to dynamically compute
 * pixel-perfect square board dimensions and updates CSS custom properties.
 * Game state is preserved entirely across screen resize or device orientation changes.
 */
export class LayoutManager {
  private readonly targetElement: HTMLElement;
  private readonly containerElement: HTMLElement;
  private gridSize: number;
  private readonly maxBoardSize: number;
  private readonly minBoardSize: number;
  private readonly onLayoutChange?: (metrics: LayoutMetrics) => void;
  private resizeObserver: ResizeObserver | null = null;
  private currentMetrics: LayoutMetrics;

  constructor(
    containerElement: HTMLElement,
    targetElement: HTMLElement = containerElement,
    options: LayoutManagerOptions = {}
  ) {
    this.containerElement = containerElement;
    this.targetElement = targetElement;
    this.gridSize = options.gridSize ?? 3;
    this.maxBoardSize = options.maxBoardSize ?? 600;
    this.minBoardSize = options.minBoardSize ?? 260;
    this.onLayoutChange = options.onLayoutChange;

    this.currentMetrics = {
      boardSize: 320,
      tileSize: 90,
      gap: 6,
      padding: 10,
      fontSize: 36,
      gridSize: this.gridSize,
    };

    this.init();
  }

  private init(): void {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.recalculate();
      });
      this.resizeObserver.observe(this.containerElement);
      if (document.body && document.body !== this.containerElement) {
        this.resizeObserver.observe(document.body);
      }
    }

    window.addEventListener('resize', this.handleWindowResize);
    window.addEventListener('orientationchange', this.handleWindowResize);

    // Initial calculation
    this.recalculate();
  }

  private handleWindowResize = (): void => {
    this.recalculate();
  };

  /**
   * Updates the current grid size N (e.g. 3, 4, 5) and triggers layout recalculation.
   */
  public setGridSize(size: number): void {
    if (size !== this.gridSize && size >= 2) {
      this.gridSize = size;
      this.recalculate();
    }
  }

  /**
   * Recalculates board dimensions based on available viewport & container space,
   * applying clamp() limits and updating CSS custom variables.
   */
  public recalculate(): LayoutMetrics {
    const rect = this.containerElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 360;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 640;

    const isLandscape = viewportWidth > viewportHeight && viewportHeight <= 950;

    let maxAvailableW: number;
    let maxAvailableH: number;

    if (isLandscape) {
      // Landscape layout: board on left, side panel (~200-280px) on right
      const sidePanelW = Math.min(280, Math.max(190, viewportWidth * 0.30));
      maxAvailableW = Math.max(180, viewportWidth - sidePanelW - 48);
      maxAvailableH = Math.max(180, viewportHeight - 24);
    } else {
      // Portrait layout: HUD top, board middle, controls bottom
      const verticalReserved = Math.max(160, Math.min(260, viewportHeight * 0.28));
      maxAvailableW = Math.max(180, viewportWidth - 24);
      maxAvailableH = Math.max(180, viewportHeight - verticalReserved);
    }

    // If container element has distinct constrained bounding bounds, respect them
    if (rect.width > 0 && rect.width < maxAvailableW) {
      maxAvailableW = rect.width;
    }
    if (rect.height > 0 && rect.height < maxAvailableH) {
      maxAvailableH = rect.height;
    }

    const margin = 16;
    const availableWidth = Math.max(160, maxAvailableW - margin);
    const availableHeight = Math.max(160, maxAvailableH - margin);

    // Board must be square: aspect-ratio 1:1
    const rawDim = Math.min(availableWidth, availableHeight);
    const effectiveMin = Math.min(this.minBoardSize, Math.max(160, rawDim));
    const clampedDim = Math.max(effectiveMin, Math.min(this.maxBoardSize, rawDim));

    // Calculate gap and board frame padding proportionally based on grid size
    let gap: number;
    let padding: number;
    if (this.gridSize >= 7) {
      gap = Math.max(2, Math.min(5, Math.round(clampedDim * 0.010)));
      padding = Math.max(4, Math.min(8, Math.round(clampedDim * 0.016)));
    } else if (this.gridSize >= 5) {
      gap = Math.max(3, Math.min(6, Math.round(clampedDim * 0.013)));
      padding = Math.max(6, Math.min(10, Math.round(clampedDim * 0.020)));
    } else {
      gap = Math.max(4, Math.min(10, Math.round(clampedDim * 0.018)));
      padding = Math.max(6, Math.min(14, Math.round(clampedDim * 0.026)));
    }

    // Tile size: exact integer to prevent rounding glitches
    const availableForTiles = clampedDim - 2 * padding - (this.gridSize - 1) * gap;
    const tileSize = Math.max(16, Math.floor(availableForTiles / this.gridSize));

    // Pixel-perfect fitted board size
    const boardSize = tileSize * this.gridSize + (this.gridSize - 1) * gap + 2 * padding;

    // Responsive font size
    let fontMultiplier: number;
    let tileRadius: number;
    if (this.gridSize <= 3) {
      fontMultiplier = 0.44;
      tileRadius = 12;
    } else if (this.gridSize === 4) {
      fontMultiplier = 0.40;
      tileRadius = 10;
    } else if (this.gridSize === 5) {
      fontMultiplier = 0.36;
      tileRadius = 8;
    } else if (this.gridSize === 6) {
      fontMultiplier = 0.34;
      tileRadius = 6;
    } else if (this.gridSize === 7) {
      fontMultiplier = 0.32;
      tileRadius = 5;
    } else {
      fontMultiplier = 0.30;
      tileRadius = 4;
    }

    const fontSize = Math.max(10, Math.round(tileSize * fontMultiplier));

    this.currentMetrics = {
      boardSize,
      tileSize,
      gap,
      padding,
      fontSize,
      tileRadius,
      gridSize: this.gridSize,
    };

    // Apply CSS custom properties to targetElement and root
    this.applyStyles(this.currentMetrics);

    if (this.onLayoutChange) {
      this.onLayoutChange(this.currentMetrics);
    }

    return this.currentMetrics;
  }

  private applyStyles(m: LayoutMetrics): void {
    const elStyle = this.targetElement.style;
    elStyle.setProperty('--board-size', `${m.boardSize}px`);
    elStyle.setProperty('--tile-size', `${m.tileSize}px`);
    elStyle.setProperty('--font-size', `${m.fontSize}px`);
    elStyle.setProperty('--tile-font-size', `${m.fontSize}px`);
    elStyle.setProperty('--tile-gap', `${m.gap}px`);
    elStyle.setProperty('--tile-padding', `${m.padding}px`);
    if (m.tileRadius !== undefined) {
      elStyle.setProperty('--tile-radius', `${m.tileRadius}px`);
    }

    // Also set on root element so all components can share sizing
    const docStyle = document.documentElement.style;
    docStyle.setProperty('--board-size', `${m.boardSize}px`);
    docStyle.setProperty('--tile-size', `${m.tileSize}px`);
    docStyle.setProperty('--font-size', `${m.fontSize}px`);
    docStyle.setProperty('--tile-font-size', `${m.fontSize}px`);
    docStyle.setProperty('--tile-gap', `${m.gap}px`);
    docStyle.setProperty('--tile-padding', `${m.padding}px`);
    if (m.tileRadius !== undefined) {
      docStyle.setProperty('--tile-radius', `${m.tileRadius}px`);
    }
  }

  public getMetrics(): LayoutMetrics {
    return { ...this.currentMetrics };
  }

  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    window.removeEventListener('resize', this.handleWindowResize);
    window.removeEventListener('orientationchange', this.handleWindowResize);
  }
}
