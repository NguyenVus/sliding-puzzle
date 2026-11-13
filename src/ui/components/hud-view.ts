import type { LevelConfig } from '../../levels/types';

export type GameMode = 'campaign' | 'freeplay';

export interface HudViewOptions {
  mode?: GameMode;
  currentSize?: number;
  currentLevel?: LevelConfig;
  onUndo?: () => void;
  onRestart?: () => void;
  onScramble?: () => void;
  onSizeChange?: (size: number) => void;
  onOpenLevelSelect?: () => void;
  onSwitchMode?: (mode: GameMode) => void;
}

export class HudView {
  private readonly topContainer: HTMLElement;
  private readonly controlsContainer: HTMLElement;
  private readonly options: HudViewOptions;

  private movesEl!: HTMLElement;
  private timerEl!: HTMLElement;
  private titleEl!: HTMLElement;
  private subtitleEl!: HTMLElement;

  private undoBtn!: HTMLButtonElement;
  private restartBtn!: HTMLButtonElement;
  private scrambleBtn!: HTMLButtonElement;
  private levelSelectBtn!: HTMLButtonElement;
  private modeToggleBtn!: HTMLButtonElement;
  private sizeButtons: HTMLButtonElement[] = [];

  private currentMode: GameMode = 'campaign';
  private currentSize = 3;

  constructor(
    topContainer: HTMLElement,
    controlsContainer: HTMLElement,
    options: HudViewOptions = {}
  ) {
    this.topContainer = topContainer;
    this.controlsContainer = controlsContainer;
    this.options = options;
    this.currentMode = options.mode ?? 'campaign';
    this.currentSize = options.currentSize ?? 3;

    this.renderTopHud();
    this.renderControls();
  }

  private renderTopHud(): void {
    this.topContainer.innerHTML = `
      <div class="hud-stats-group" role="region" aria-label="Thông số trò chơi">
        <div class="stat-card" id="stat-moves">
          <span class="stat-label">BƯỚC</span>
          <span class="stat-value" id="hud-moves-val">0</span>
        </div>
        <div class="hud-branding">
          <h1 class="game-title" id="hud-title">Gỗ Sáng</h1>
          <span class="game-subtitle" id="hud-subtitle">Sliding Puzzle</span>
        </div>
        <div class="stat-card" id="stat-timer">
          <span class="stat-label">THỜI GIAN</span>
          <span class="stat-value" id="hud-timer-val">00:00</span>
        </div>
      </div>
    `;

    this.movesEl = this.topContainer.querySelector('#hud-moves-val')!;
    this.timerEl = this.topContainer.querySelector('#hud-timer-val')!;
    this.titleEl = this.topContainer.querySelector('#hud-title')!;
    this.subtitleEl = this.topContainer.querySelector('#hud-subtitle')!;
  }

  private renderControls(): void {
    this.controlsContainer.innerHTML = `
      <div class="hud-actions-panel" role="toolbar" aria-label="Bảng điều khiển">
        <!-- Mode Navigation Bar -->
        <div class="mode-nav-bar">
          <button type="button" id="btn-level-select" class="btn nav-btn" aria-label="Mở danh sách 30 màn chơi">
            <span class="btn-icon">🏆</span>
            <span class="btn-text">Chọn màn</span>
          </button>
          <button type="button" id="btn-mode-toggle" class="btn nav-btn" aria-label="Chuyển sang chế độ Tự do">
            <span class="btn-icon">🎲</span>
            <span class="btn-text" id="mode-toggle-text">Tự do</span>
          </button>
        </div>

        <!-- Size Selector (active in Free Play mode) -->
        <div class="size-selector-group" id="size-selector-group" role="radiogroup" aria-label="Chọn kích thước bàn cờ" style="display: none;">
          <button type="button" class="btn size-btn" data-size="3" aria-label="Bàn cờ 3 x 3">3×3</button>
          <button type="button" class="btn size-btn" data-size="4" aria-label="Bàn cờ 4 x 4">4×4</button>
          <button type="button" class="btn size-btn" data-size="5" aria-label="Bàn cờ 5 x 5">5×5</button>
          <button type="button" class="btn size-btn" data-size="6" aria-label="Bàn cờ 6 x 6">6×6</button>
          <button type="button" class="btn size-btn" data-size="7" aria-label="Bàn cờ 7 x 7">7×7</button>
          <button type="button" class="btn size-btn" data-size="8" aria-label="Bàn cờ 8 x 8">8×8</button>
        </div>

        <!-- Game Action Buttons -->
        <div class="action-buttons-group">
          <button type="button" id="btn-undo" class="btn action-btn" aria-label="Hoàn tác bước đi (Z)" disabled>
            <span class="btn-icon">↩</span>
            <span class="btn-text">Hoàn tác</span>
          </button>
          <button type="button" id="btn-restart" class="btn action-btn" aria-label="Chơi lại ván hiện tại (R)">
            <span class="btn-icon">↺</span>
            <span class="btn-text">Chơi lại</span>
          </button>
          <button type="button" id="btn-scramble" class="btn action-btn btn-primary" aria-label="Trộn ván mới">
            <span class="btn-icon">⚡</span>
            <span class="btn-text" id="btn-scramble-text">Ván mới</span>
          </button>
        </div>
      </div>
    `;

    this.undoBtn = this.controlsContainer.querySelector('#btn-undo')!;
    this.restartBtn = this.controlsContainer.querySelector('#btn-restart')!;
    this.scrambleBtn = this.controlsContainer.querySelector('#btn-scramble')!;
    this.levelSelectBtn = this.controlsContainer.querySelector('#btn-level-select')!;
    this.modeToggleBtn = this.controlsContainer.querySelector('#btn-mode-toggle')!;

    this.sizeButtons = Array.from(
      this.controlsContainer.querySelectorAll<HTMLButtonElement>('.size-btn')
    );

    // Initial size button state
    this.setSize(this.currentSize);

    // Event listeners
    this.undoBtn.addEventListener('click', () => this.options.onUndo?.());
    this.restartBtn.addEventListener('click', () => this.options.onRestart?.());
    this.scrambleBtn.addEventListener('click', () => this.options.onScramble?.());
    this.levelSelectBtn.addEventListener('click', () => this.options.onOpenLevelSelect?.());
    this.modeToggleBtn.addEventListener('click', () => {
      const nextMode = this.currentMode === 'campaign' ? 'freeplay' : 'campaign';
      this.options.onSwitchMode?.(nextMode);
    });

    this.sizeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const size = parseInt(btn.dataset.size ?? '3', 10);
        this.setSize(size);
        this.options.onSizeChange?.(size);
      });
    });
  }

  public setMode(
    mode: GameMode,
    levelConfig?: LevelConfig,
    freePlaySize?: number
  ): void {
    this.currentMode = mode;
    const sizeGroup = this.controlsContainer.querySelector<HTMLElement>('#size-selector-group');
    const toggleText = this.controlsContainer.querySelector('#mode-toggle-text');
    const scrambleText = this.controlsContainer.querySelector('#btn-scramble-text');

    if (mode === 'campaign') {
      if (sizeGroup) sizeGroup.style.display = 'none';
      if (toggleText) toggleText.textContent = 'Tự do';
      if (scrambleText) scrambleText.textContent = 'Ván mới';

      if (levelConfig) {
        this.setLevel(levelConfig);
      }
    } else {
      if (sizeGroup) sizeGroup.style.display = 'flex';
      if (toggleText) toggleText.textContent = 'Cấp độ';
      if (scrambleText) scrambleText.textContent = 'Trộn mới';

      const size = freePlaySize ?? this.currentSize;
      this.currentSize = size;
      this.setSize(size);
      if (this.titleEl) this.titleEl.textContent = `Tự Do ${size}×${size}`;
      if (this.subtitleEl) this.subtitleEl.textContent = `Bàn cờ ${size}×${size} ngẫu nhiên`;
    }
  }

  public setLevel(config: LevelConfig): void {
    this.currentSize = config.size;
    if (this.titleEl) {
      this.titleEl.textContent = config.name;
    }
    if (this.subtitleEl) {
      this.subtitleEl.textContent = `${config.size}×${config.size} · Chuẩn: ≤${config.parMoves}b · ${config.targetTimeSec}s`;
    }
  }

  public setMoves(moves: number): void {
    if (this.movesEl) {
      this.movesEl.textContent = String(moves);
    }
  }

  public setTime(seconds: number): void {
    if (this.timerEl) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const mm = String(mins).padStart(2, '0');
      const ss = String(secs).padStart(2, '0');
      this.timerEl.textContent = `${mm}:${ss}`;
    }
  }

  public setCanUndo(canUndo: boolean): void {
    if (this.undoBtn) {
      this.undoBtn.disabled = !canUndo;
    }
  }

  public setSize(size: number): void {
    this.currentSize = size;
    this.sizeButtons.forEach((btn) => {
      const btnSize = parseInt(btn.dataset.size ?? '0', 10);
      if (btnSize === size) {
        btn.classList.add('active');
        btn.setAttribute('aria-checked', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-checked', 'false');
      }
    });

    if (this.currentMode === 'freeplay') {
      if (this.titleEl) this.titleEl.textContent = `Tự Do ${size}×${size}`;
      if (this.subtitleEl) this.subtitleEl.textContent = `Bàn cờ ${size}×${size} ngẫu nhiên`;
    }
  }
}
