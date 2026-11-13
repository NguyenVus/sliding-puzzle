import type { LevelConfig } from '../../levels/types';
import { renderIcon } from '../icons';

export type GameMode = 'campaign' | 'freeplay';

export interface HudViewOptions {
  mode?: GameMode;
  currentSize?: number;
  currentLevel?: LevelConfig;
  soundEnabled?: boolean;
  isPictureMode?: boolean;
  onUndo?: () => void;
  onRestart?: () => void;
  onScramble?: () => void;
  onHint?: () => void;
  onAutoSolve?: () => void;
  onSizeChange?: (size: number) => void;
  onOpenLevelSelect?: () => void;
  onSwitchMode?: (mode: GameMode) => void;
  onOpenMenu?: () => void;
  onToggleSound?: () => void;
  onOpenSettings?: () => void;
  onPreviewPicture?: () => void;
}

export class HudView {
  private readonly topContainer: HTMLElement;
  private readonly controlsContainer: HTMLElement;
  private readonly options: HudViewOptions;

  private movesEl!: HTMLElement;
  private timerEl!: HTMLElement;
  private titleEl!: HTMLElement;
  private subtitleEl!: HTMLElement;

  private menuBtn!: HTMLButtonElement;
  private soundBtn!: HTMLButtonElement;
  private soundIconEl!: HTMLElement;
  private settingsBtn!: HTMLButtonElement;
  private previewPicBtn!: HTMLButtonElement;

  private undoBtn!: HTMLButtonElement;
  private restartBtn!: HTMLButtonElement;
  private scrambleBtn!: HTMLButtonElement;
  private hintBtn!: HTMLButtonElement;
  private hintTextEl!: HTMLElement;
  private solveBtn!: HTMLButtonElement;
  private solveIconEl!: HTMLElement;
  private solveTextEl!: HTMLElement;
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
    const isMuted = this.options.soundEnabled === false;
    const isPic = this.options.isPictureMode === true;

    this.topContainer.innerHTML = `
      <div class="hud-top-bar">
        <button type="button" id="btn-menu" class="btn hud-icon-btn nav-menu-btn" aria-label="Mở Menu trò chơi">
          <span class="btn-icon">${renderIcon('menu', { size: 18 })}</span>
          <span class="btn-text">Menu</span>
        </button>

        <div class="hud-top-actions">
          <button type="button" id="btn-preview-picture" class="btn hud-icon-btn btn-preview-pic" aria-label="Xem ảnh gốc hoàn chỉnh" style="${isPic ? 'display: inline-flex;' : 'display: none;'}">
            <span class="btn-icon">${renderIcon('preview', { size: 18 })}</span>
            <span class="btn-text">Ảnh gốc</span>
          </button>
          <button type="button" id="btn-sound-toggle" class="btn hud-icon-btn btn-square" aria-label="Bật/Tắt âm thanh">
            <span class="btn-icon" id="btn-sound-icon">${renderIcon(isMuted ? 'volume-off' : 'volume-on')}<span class="sr-only">${isMuted ? '🔇' : '🔊'}</span></span>
          </button>
          <button type="button" id="btn-settings" class="btn hud-icon-btn btn-square" aria-label="Cài đặt">
            <span class="btn-icon">${renderIcon('settings', { size: 20 })}</span>
          </button>
        </div>
      </div>

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

    this.menuBtn = this.topContainer.querySelector('#btn-menu')!;
    this.soundBtn = this.topContainer.querySelector('#btn-sound-toggle')!;
    this.soundIconEl = this.topContainer.querySelector('#btn-sound-icon')!;
    this.settingsBtn = this.topContainer.querySelector('#btn-settings')!;
    this.previewPicBtn = this.topContainer.querySelector('#btn-preview-picture')!;

    this.menuBtn.addEventListener('click', () => this.options.onOpenMenu?.());
    this.soundBtn.addEventListener('click', () => this.options.onToggleSound?.());
    this.settingsBtn.addEventListener('click', () => this.options.onOpenSettings?.());
    this.previewPicBtn.addEventListener('click', () => this.options.onPreviewPicture?.());
  }

  private renderControls(): void {
    this.controlsContainer.innerHTML = `
      <div class="hud-actions-panel" role="toolbar" aria-label="Bảng điều khiển">
        <!-- Mode Navigation Bar -->
        <div class="mode-nav-bar">
          <button type="button" id="btn-level-select" class="btn nav-btn" aria-label="Mở danh sách 30 màn chơi">
            <span class="btn-icon">${renderIcon('levels', { size: 18 })}</span>
            <span class="btn-text">Chọn màn</span>
          </button>
          <button type="button" id="btn-mode-toggle" class="btn nav-btn" aria-label="Chuyển sang chế độ Tự do">
            <span class="btn-icon" id="mode-toggle-icon">${renderIcon('freeplay', { size: 18 })}</span>
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
          <button type="button" id="btn-hint" class="btn action-btn" aria-label="Gợi ý nước đi tiếp theo (phím H)">
            <span class="btn-icon">${renderIcon('hint', { size: 18 })}</span>
            <span class="btn-text" id="btn-hint-text">Gợi ý</span>
          </button>
          <button type="button" id="btn-undo" class="btn action-btn" aria-label="Hoàn tác bước đi (Z)" disabled>
            <span class="btn-icon">${renderIcon('undo', { size: 18 })}</span>
            <span class="btn-text">Hoàn tác</span>
          </button>
          <button type="button" id="btn-restart" class="btn action-btn" aria-label="Chơi lại ván hiện tại (R)">
            <span class="btn-icon">${renderIcon('restart', { size: 18 })}</span>
            <span class="btn-text">Chơi lại</span>
          </button>
          <button type="button" id="btn-solve" class="btn action-btn" aria-label="Tự động giải bàn cờ">
            <span class="btn-icon" id="btn-solve-icon">${renderIcon('auto-solve', { size: 18 })}</span>
            <span class="btn-text" id="btn-solve-text">Tự giải</span>
          </button>
          <button type="button" id="btn-scramble" class="btn action-btn btn-primary" aria-label="Trộn ván mới">
            <span class="btn-icon">${renderIcon('shuffle', { size: 18 })}</span>
            <span class="btn-text" id="btn-scramble-text">Ván mới</span>
          </button>
        </div>
      </div>
    `;

    this.undoBtn = this.controlsContainer.querySelector('#btn-undo')!;
    this.restartBtn = this.controlsContainer.querySelector('#btn-restart')!;
    this.scrambleBtn = this.controlsContainer.querySelector('#btn-scramble')!;
    this.hintBtn = this.controlsContainer.querySelector('#btn-hint')!;
    this.hintTextEl = this.controlsContainer.querySelector('#btn-hint-text')!;
    this.solveBtn = this.controlsContainer.querySelector('#btn-solve')!;
    this.solveIconEl = this.controlsContainer.querySelector('#btn-solve-icon')!;
    this.solveTextEl = this.controlsContainer.querySelector('#btn-solve-text')!;
    this.levelSelectBtn = this.controlsContainer.querySelector('#btn-level-select')!;
    this.modeToggleBtn = this.controlsContainer.querySelector('#btn-mode-toggle')!;

    this.sizeButtons = Array.from(
      this.controlsContainer.querySelectorAll<HTMLButtonElement>('.size-btn')
    );

    // Initial size button state
    this.setSize(this.currentSize);

    // Event listeners
    this.hintBtn.addEventListener('click', () => this.options.onHint?.());
    this.undoBtn.addEventListener('click', () => this.options.onUndo?.());
    this.restartBtn.addEventListener('click', () => this.options.onRestart?.());
    this.solveBtn.addEventListener('click', () => this.options.onAutoSolve?.());
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
    const toggleIcon = this.controlsContainer.querySelector('#mode-toggle-icon');
    const toggleText = this.controlsContainer.querySelector('#mode-toggle-text');
    const scrambleText = this.controlsContainer.querySelector('#btn-scramble-text');

    if (mode === 'campaign') {
      if (sizeGroup) sizeGroup.style.display = 'none';
      if (toggleIcon) toggleIcon.innerHTML = renderIcon('freeplay', { size: 18 });
      if (toggleText) toggleText.textContent = 'Tự do';
      if (scrambleText) scrambleText.textContent = 'Ván mới';

      if (levelConfig) {
        this.setLevel(levelConfig);
      }
    } else {
      if (sizeGroup) sizeGroup.style.display = 'grid';
      if (toggleIcon) toggleIcon.innerHTML = renderIcon('levels', { size: 18 });
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

  public setAutoSolving(isSolving: boolean): void {
    if (this.solveBtn && this.solveTextEl && this.solveIconEl) {
      if (isSolving) {
        this.solveBtn.classList.add('btn-active-solving');
        this.solveBtn.setAttribute('aria-label', 'Dừng tự động giải');
        this.solveIconEl.innerHTML = renderIcon('pause', { size: 18 });
        this.solveTextEl.textContent = 'Dừng';
      } else {
        this.solveBtn.classList.remove('btn-active-solving');
        this.solveBtn.setAttribute('aria-label', 'Tự động giải bàn cờ');
        this.solveIconEl.innerHTML = renderIcon('auto-solve', { size: 18 });
        this.solveTextEl.textContent = 'Tự giải';
      }
    }
  }

  public setHintLoading(isLoading: boolean): void {
    if (this.hintBtn && this.hintTextEl) {
      this.hintBtn.disabled = isLoading;
      this.hintTextEl.textContent = isLoading ? '...' : 'Gợi ý';
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

  public setSoundEnabled(enabled: boolean): void {
    if (this.soundIconEl) {
      this.soundIconEl.innerHTML = `${renderIcon(enabled ? 'volume-on' : 'volume-off')}<span class="sr-only">${enabled ? '🔊' : '🔇'}</span>`;
    }
  }

  public setPictureModeActive(active: boolean): void {
    if (this.previewPicBtn) {
      this.previewPicBtn.style.display = active ? 'inline-flex' : 'none';
    }
  }
}
