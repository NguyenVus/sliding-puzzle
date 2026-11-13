import type { Board } from '../../core/types';
import { getMovableTiles, getBlankIndex } from '../../core/board';
import type { LayoutMetrics } from '../layout-manager';

export interface BoardViewOptions {
  onTileClick?: (index: number, tileValue: number) => void;
}

export class BoardView {
  public readonly container: HTMLElement;
  private readonly boardFrame: HTMLElement;
  private readonly slotsContainer: HTMLElement;
  private readonly tilesContainer: HTMLElement;
  private tileElements: Map<number, HTMLButtonElement> = new Map();
  private currentBoard: Board | null = null;
  private currentMetrics: LayoutMetrics = {
    boardSize: 320,
    tileSize: 90,
    gap: 6,
    padding: 10,
    fontSize: 36,
    gridSize: 3,
  };
  private onTileClick?: (index: number, tileValue: number) => void;
  private lastHandledActionTime = 0;

  constructor(container: HTMLElement, options: BoardViewOptions = {}) {
    this.container = container;
    this.onTileClick = options.onTileClick;

    // Create board DOM structure
    this.boardFrame = document.createElement('div');
    this.boardFrame.className = 'wood-board-frame';
    this.boardFrame.setAttribute('role', 'region');
    this.boardFrame.setAttribute('aria-label', 'Bàn cờ trượt phong cách gỗ sáng');

    this.slotsContainer = document.createElement('div');
    this.slotsContainer.className = 'board-slots-layer';
    this.slotsContainer.setAttribute('aria-hidden', 'true');

    this.tilesContainer = document.createElement('div');
    this.tilesContainer.className = 'board-tiles-layer';

    this.boardFrame.appendChild(this.slotsContainer);
    this.boardFrame.appendChild(this.tilesContainer);
    this.container.appendChild(this.boardFrame);

    this.setupEvents();
  }

  private setupEvents(): void {
    this.tilesContainer.addEventListener('click', (e) => {
      // Suppress duplicate synthetic click if a pointer tap was handled within 150ms
      if (performance.now() - this.lastHandledActionTime < 150) {
        return;
      }
      const target = (e.target as HTMLElement).closest<HTMLButtonElement>('.wood-tile');
      if (target && target.dataset.index !== undefined && target.dataset.tile !== undefined) {
        const index = parseInt(target.dataset.index, 10);
        const tileVal = parseInt(target.dataset.tile, 10);
        this.lastHandledActionTime = performance.now();
        if (this.onTileClick) {
          this.onTileClick(index, tileVal);
        }
      }
    });
  }

  public notifyActionHandled(): void {
    this.lastHandledActionTime = performance.now();
  }

  public updateMetrics(metrics: LayoutMetrics): void {
    this.currentMetrics = metrics;
    this.updateSlotPositions();
    if (this.currentBoard) {
      // Reposition tiles without slide animation when layout metrics change
      this.render(this.currentBoard, { animate: false });
    }
  }

  /**
   * Updates all background recessed wood slot positions to match current layout metrics.
   */
  private updateSlotPositions(): void {
    if (!this.currentBoard) return;
    const n = this.currentBoard.size;
    const total = n * n;
    const { tileSize, gap, padding } = this.currentMetrics;
    const slots = this.slotsContainer.children;
    for (let i = 0; i < total && i < slots.length; i++) {
      const row = Math.floor(i / n);
      const col = i % n;
      const x = padding + col * (tileSize + gap);
      const y = padding + row * (tileSize + gap);
      const slot = slots[i] as HTMLElement;
      slot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }

  /**
   * Renders the board state.
   * If animate is true, tiles smoothly slide using CSS transform ~120ms.
   */
  public render(board: Board, options: { animate?: boolean } = {}): void {
    const { animate = true } = options;
    const n = board.size;
    const totalTiles = n * n;
    const movableIndices = new Set(getMovableTiles(board));
    const isNewGrid = this.currentBoard === null || this.currentBoard.size !== n;

    this.currentBoard = board;

    if (isNewGrid) {
      this.rebuildDom(n);
    } else {
      this.updateSlotPositions();
    }

    const { tileSize, gap, padding } = this.currentMetrics;

    // Position each tile based on current 1D index
    for (let index = 0; index < totalTiles; index++) {
      const val = board.tiles[index];
      if (val === 0) continue; // Blank slot has no tile button

      let tileEl = this.tileElements.get(val);
      if (!tileEl) {
        tileEl = this.createTileElement(val);
        this.tileElements.set(val, tileEl);
        this.tilesContainer.appendChild(tileEl);
      }

      const row = Math.floor(index / n);
      const col = index % n;
      const x = padding + col * (tileSize + gap);
      const y = padding + row * (tileSize + gap);

      tileEl.dataset.index = String(index);
      tileEl.dataset.row = String(row);
      tileEl.dataset.col = String(col);
      tileEl.setAttribute('aria-label', `Ô số ${val}, hàng ${row + 1}, cột ${col + 1}`);

      const isMovable = movableIndices.has(index);
      if (isMovable) {
        tileEl.classList.add('movable');
        tileEl.setAttribute('aria-disabled', 'false');
      } else {
        tileEl.classList.remove('movable');
        tileEl.setAttribute('aria-disabled', 'true');
      }

      if (!animate) {
        tileEl.style.transition = 'none';
        tileEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        // Trigger reflow then restore transition
        void tileEl.offsetHeight;
        tileEl.style.transition = '';
      } else {
        tileEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    }
  }

  private rebuildDom(n: number): void {
    // Clear existing elements
    this.slotsContainer.innerHTML = '';
    this.tilesContainer.innerHTML = '';
    this.tileElements.clear();

    const total = n * n;
    const { tileSize, gap, padding } = this.currentMetrics;

    // Create background recessed wood slots
    for (let i = 0; i < total; i++) {
      const row = Math.floor(i / n);
      const col = i % n;
      const x = padding + col * (tileSize + gap);
      const y = padding + row * (tileSize + gap);

      const slot = document.createElement('div');
      slot.className = 'wood-slot';
      slot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      this.slotsContainer.appendChild(slot);
    }

    // Create tile buttons for values 1 .. total-1
    for (let val = 1; val < total; val++) {
      const tileEl = this.createTileElement(val);
      this.tileElements.set(val, tileEl);
      this.tilesContainer.appendChild(tileEl);
    }
  }

  private createTileElement(val: number): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wood-tile';
    btn.dataset.tile = String(val);
    btn.setAttribute('tabindex', '0');

    const numSpan = document.createElement('span');
    numSpan.className = 'tile-number';
    numSpan.textContent = String(val);
    btn.appendChild(numSpan);

    return btn;
  }

  public getBoardFrameElement(): HTMLElement {
    return this.boardFrame;
  }

  public getTileElementByValue(val: number): HTMLButtonElement | undefined {
    return this.tileElements.get(val);
  }

  public getTileElementByIndex(index: number): HTMLButtonElement | null {
    if (!this.currentBoard) return null;
    const val = this.currentBoard.tiles[index];
    if (val === 0) return null;
    return this.tileElements.get(val) ?? null;
  }

  public getBlankIndex(): number {
    return this.currentBoard ? getBlankIndex(this.currentBoard) : -1;
  }
}
