import type { LevelConfig } from '../../levels/types';
import type { LevelRecord } from '../../storage/types';
import { getAllLevels } from '../../levels/level-manager';
import { renderIcon } from '../icons';

export interface LevelSelectViewOptions {
  onSelectLevel?: (levelId: number) => void;
  onSwitchToFreePlay?: () => void;
  onClose?: () => void;
}

export class LevelSelectView {
  private readonly container: HTMLElement;
  private readonly options: LevelSelectViewOptions;
  private modalEl: HTMLElement | null = null;
  private currentLevelId: number = 1;

  constructor(container: HTMLElement, options: LevelSelectViewOptions = {}) {
    this.container = container;
    this.options = options;
  }

  public show(params: {
    records: Record<number, LevelRecord>;
    currentLevelId?: number;
    currentMode?: 'campaign' | 'freeplay';
  }): void {
    this.close();
    this.currentLevelId = params.currentLevelId ?? 1;
    const isFreePlay = params.currentMode === 'freeplay';

    const levels = getAllLevels();
    const records = params.records;

    // Calculate total stars collected
    let totalStars = 0;
    let completedCount = 0;
    for (const lvl of levels) {
      const rec = records[lvl.id];
      if (rec && rec.completed) {
        completedCount++;
        totalStars += rec.stars || 0;
      }
    }

    this.modalEl = document.createElement('div');
    this.modalEl.className = 'level-select-modal';
    this.modalEl.setAttribute('role', 'dialog');
    this.modalEl.setAttribute('aria-modal', 'true');
    this.modalEl.setAttribute('aria-label', 'Chọn màn chơi');

    this.modalEl.innerHTML = `
      <div class="level-select-dialog">
        <header class="level-select-header">
          <div class="level-select-title-group">
            <h2 class="level-select-title">CHỌN MÀN CHƠI</h2>
            <div class="level-select-stats">
              <span class="stars-total-badge" aria-label="Tổng số sao đạt được: ${totalStars} trên 90">
                ${renderIcon('star', { size: 16, className: 'icon-gold' })} <strong id="total-stars-val">${totalStars}</strong>/90
              </span>
              <span class="progress-pill">Đã xong: ${completedCount}/30</span>
            </div>
          </div>
          <button type="button" class="btn btn-close-modal" id="btn-close-levels" aria-label="Đóng danh sách màn chơi">
            ${renderIcon('close', { size: 18 })}
          </button>
        </header>

        <div class="level-select-tabs" role="tablist">
          <button type="button" class="tab-btn ${isFreePlay ? '' : 'active'}" id="tab-levels" role="tab" aria-selected="${!isFreePlay}">
            <span class="btn-icon">${renderIcon('levels', { size: 18 })}</span> <span>Cấp Độ (30 Màn)</span>
          </button>
          <button type="button" class="tab-btn ${isFreePlay ? 'active' : ''}" id="tab-freeplay" role="tab" aria-selected="${isFreePlay}">
            <span class="btn-icon">${renderIcon('freeplay', { size: 18 })}</span> <span>Chế Độ Tự Do</span>
          </button>
        </div>

        <div class="level-select-content">
          <div class="levels-grid" id="levels-grid-container" role="grid" aria-label="Lưới 30 màn chơi">
            ${this.renderLevelCards(levels, records)}
          </div>
        </div>

        <footer class="level-select-footer">
          <button type="button" class="btn btn-primary" id="btn-resume-highest">
            <span class="btn-icon">${renderIcon('play', { size: 16 })}</span> <span>Tiếp tục màn ${params.currentLevelId ?? 1}</span>
          </button>
        </footer>
      </div>
    `;

    this.container.appendChild(this.modalEl);
    this.bindEvents();
  }

  private renderLevelCards(
    levels: readonly LevelConfig[],
    records: Record<number, LevelRecord>
  ): string {
    return levels
      .map((lvl) => {
        const rec = records[lvl.id];
        // Level 1 is always unlocked; otherwise unlocked if rec?.unlocked is true
        const isUnlocked = lvl.id === 1 || (rec?.unlocked ?? false);
        const isCurrent = lvl.id === this.currentLevelId;
        const stars = rec?.stars ?? 0;

        let starsHtml = '';
        if (isUnlocked) {
          starsHtml = `
            <div class="card-stars" aria-label="${stars} sao">
              <span class="star ${stars >= 1 ? 'filled' : 'empty'}">${stars >= 1 ? '★' : '☆'}</span>
              <span class="star ${stars >= 2 ? 'filled' : 'empty'}">${stars >= 2 ? '★' : '☆'}</span>
              <span class="star ${stars >= 3 ? 'filled' : 'empty'}">${stars >= 3 ? '★' : '☆'}</span>
            </div>
          `;
        } else {
          starsHtml = `<div class="card-lock-icon" aria-hidden="true">${renderIcon('lock', { size: 14 })}</div>`;
        }

        const sizeLabel = `${lvl.size}×${lvl.size}`;
        const cardClass = [
          'level-card',
          isUnlocked ? 'unlocked' : 'locked',
          isCurrent ? 'current' : '',
          rec?.completed ? 'completed' : '',
        ]
          .filter(Boolean)
          .join(' ');

        const buttonAria = isUnlocked
          ? `Màn ${lvl.id}, kích thước ${sizeLabel}, ${stars} sao`
          : `Màn ${lvl.id}, đã khóa`;

        const titleText = isUnlocked
          ? rec?.completed
            ? `Màn ${lvl.id} (${sizeLabel}) - Kỷ lục: ${rec.bestMoves} bước, ${rec.bestTimeSec}s (${stars}★)`
            : `Màn ${lvl.id} (${sizeLabel}) - Chưa hoàn thành`
          : `Màn ${lvl.id} - Đã khóa`;

        return `
          <button
            type="button"
            class="${cardClass}"
            data-level-id="${lvl.id}"
            ${isUnlocked ? '' : 'disabled'}
            aria-label="${buttonAria}"
            title="${titleText}"
          >
            <span class="card-num">${lvl.id}</span>
            <span class="card-size">${sizeLabel}</span>
            ${starsHtml}
          </button>
        `;
      })
      .join('');
  }

  private bindEvents(): void {
    if (!this.modalEl) return;

    // Close button
    this.modalEl.querySelector('#btn-close-levels')?.addEventListener('click', () => {
      this.close();
      this.options.onClose?.();
    });

    // Campaign tab
    this.modalEl.querySelector('#tab-levels')?.addEventListener('click', () => {
      const btnFree = this.modalEl?.querySelector('#tab-freeplay');
      const btnLvl = this.modalEl?.querySelector('#tab-levels');
      if (btnFree?.classList.contains('active')) {
        btnFree.classList.remove('active');
        btnFree.setAttribute('aria-selected', 'false');
        btnLvl?.classList.add('active');
        btnLvl?.setAttribute('aria-selected', 'true');
      }
    });

    // Free Play tab
    this.modalEl.querySelector('#tab-freeplay')?.addEventListener('click', () => {
      this.close();
      this.options.onSwitchToFreePlay?.();
    });

    // Resume button
    this.modalEl.querySelector('#btn-resume-highest')?.addEventListener('click', () => {
      const targetId = this.currentLevelId;
      this.close();
      this.options.onSelectLevel?.(targetId);
    });

    // Level buttons click
    const grid = this.modalEl.querySelector('#levels-grid-container');
    grid?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.level-card.unlocked');
      if (btn && btn.dataset.levelId) {
        const id = parseInt(btn.dataset.levelId, 10);
        this.close();
        this.options.onSelectLevel?.(id);
      }
    });

    // Close on backdrop click outside dialog
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.close();
        this.options.onClose?.();
      }
    });
  }

  public close(): void {
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
      this.modalEl = null;
    }
  }

  public isOpen(): boolean {
    return this.modalEl !== null;
  }
}
