export interface WinStats {
  moves: number;
  timeFormatted: string;
  size: number;
  mode?: 'campaign' | 'freeplay';
  levelId?: number;
  stars?: number;
  parMoves?: number;
  targetTimeSec?: number;
  isNewRecord?: boolean;
  unlockedNext?: boolean;
  nextLevelId?: number | null;
}

export interface ModalViewOptions {
  onRestart?: () => void;
  onNewGame?: () => void;
  onNextLevel?: (nextLevelId: number) => void;
  onOpenLevelSelect?: () => void;
  onClose?: () => void;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
}

export class ModalView {
  private readonly container: HTMLElement;
  private readonly options: ModalViewOptions;
  private modalEl: HTMLElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private animationFrameId: number | null = null;
  private particles: ConfettiParticle[] = [];

  constructor(container: HTMLElement, options: ModalViewOptions = {}) {
    this.container = container;
    this.options = options;
  }

  public showVictory(stats: WinStats): void {
    this.close();

    const isCampaign = stats.mode !== 'freeplay';
    const stars = stats.stars ?? 3;

    // Create modal wrapper
    this.modalEl = document.createElement('div');
    this.modalEl.className = 'victory-modal-backdrop';
    this.modalEl.setAttribute('role', 'dialog');
    this.modalEl.setAttribute('aria-modal', 'true');
    this.modalEl.setAttribute('aria-labelledby', 'victory-title');

    let titleText = 'XUẤT SẮC!';
    let subtitleText = 'Bạn đã hoàn thành câu đố';

    if (isCampaign && stats.levelId !== undefined) {
      titleText = `CHIẾN THẮNG MÀN ${stats.levelId}!`;
      if (stars === 3) {
        subtitleText = 'Xuất sắc! Đạt chuẩn 3 sao tối đa ⭐⭐⭐';
      } else if (stars === 2) {
        subtitleText = 'Rất tốt! Hoàn thành xuất sắc 2 sao ⭐⭐';
      } else {
        subtitleText = 'Chúc mừng bạn đã vượt qua màn chơi! ⭐';
      }
    } else {
      titleText = `HOÀN THÀNH BÀN ${stats.size}×${stats.size}!`;
      subtitleText = stats.isNewRecord
        ? 'Tuyệt vời! Bạn đã thiết lập kỷ lục mới!'
        : 'Chúc mừng bạn đã giải thành công bàn cờ!';
    }

    const newRecordBadgeHtml = stats.isNewRecord
      ? `<div class="new-record-badge" id="modal-new-record-badge">🏅 KỶ LỤC MỚI!</div>`
      : '';

    let starsDisplayHtml = '';
    if (isCampaign) {
      starsDisplayHtml = `
        <div class="victory-stars-row" aria-label="${stars} trên 3 sao">
          <span class="v-star ${stars >= 1 ? 'earned' : 'empty'}">${stars >= 1 ? '★' : '☆'}</span>
          <span class="v-star ${stars >= 2 ? 'earned' : 'empty'}">${stars >= 2 ? '★' : '☆'}</span>
          <span class="v-star ${stars >= 3 ? 'earned' : 'empty'}">${stars >= 3 ? '★' : '☆'}</span>
        </div>
      `;
    }

    const movesSubtext = stats.parMoves ? `<span class="stat-sub">Chuẩn: ≤${stats.parMoves}</span>` : '';
    const timeSubtext = stats.targetTimeSec ? `<span class="stat-sub">Mục tiêu: ≤${stats.targetTimeSec}s</span>` : '';

    let actionButtonsHtml = '';
    if (isCampaign && stats.nextLevelId) {
      actionButtonsHtml = `
        <button type="button" id="modal-btn-next" class="btn btn-primary modal-action-btn">
          ▶ Màn tiếp theo
        </button>
        <button type="button" id="modal-btn-restart" class="btn modal-action-btn">
          ↺ Chơi lại
        </button>
        <button type="button" id="modal-btn-levels" class="btn modal-action-btn">
          🏆 Chọn màn
        </button>
        <button type="button" id="modal-btn-close" class="btn modal-action-btn btn-ghost" aria-label="Đóng bảng kết quả">
          Xem lại bàn cờ
        </button>
      `;
    } else {
      actionButtonsHtml = `
        <button type="button" id="modal-btn-new" class="btn btn-primary modal-action-btn">
          ⚡ Ván mới
        </button>
        <button type="button" id="modal-btn-restart" class="btn modal-action-btn">
          ↺ Chơi lại
        </button>
        <button type="button" id="modal-btn-levels" class="btn modal-action-btn">
          🏆 Chọn màn
        </button>
        <button type="button" id="modal-btn-close" class="btn modal-action-btn btn-ghost" aria-label="Đóng bảng kết quả">
          Xem lại bàn cờ
        </button>
      `;
    }

    this.modalEl.innerHTML = `
      <div class="victory-card">
        <div class="victory-ribbon">
          <span class="victory-badge" aria-hidden="true">🏆</span>
          ${newRecordBadgeHtml}
          <h2 id="victory-title" class="victory-title">${titleText}</h2>
          <p class="victory-subtitle">${subtitleText}</p>
        </div>

        ${starsDisplayHtml}

        <div class="victory-stats-grid">
          <div class="stat-box">
            <span class="box-label">Thời gian</span>
            <span class="box-value">${stats.timeFormatted}</span>
            ${timeSubtext}
          </div>
          <div class="stat-box">
            <span class="box-label">Số bước đi</span>
            <span class="box-value">${stats.moves}</span>
            ${movesSubtext}
          </div>
          <div class="stat-box">
            <span class="box-label">Kích thước</span>
            <span class="box-value">${stats.size} × ${stats.size}</span>
          </div>
        </div>

        <div class="victory-actions">
          ${actionButtonsHtml}
        </div>
      </div>
    `;

    // Create and attach confetti canvas
    this.canvasEl = document.createElement('canvas');
    this.canvasEl.className = 'confetti-canvas';
    this.modalEl.appendChild(this.canvasEl);
    this.container.appendChild(this.modalEl);

    // Attach event listeners
    this.modalEl.querySelector('#modal-btn-next')?.addEventListener('click', () => {
      const nextId = stats.nextLevelId;
      this.close();
      if (nextId) {
        this.options.onNextLevel?.(nextId);
      }
    });

    this.modalEl.querySelector('#modal-btn-new')?.addEventListener('click', () => {
      this.close();
      this.options.onNewGame?.();
    });

    this.modalEl.querySelector('#modal-btn-restart')?.addEventListener('click', () => {
      this.close();
      this.options.onRestart?.();
    });

    this.modalEl.querySelector('#modal-btn-levels')?.addEventListener('click', () => {
      this.close();
      this.options.onOpenLevelSelect?.();
    });

    this.modalEl.querySelector('#modal-btn-close')?.addEventListener('click', () => {
      this.close();
      this.options.onClose?.();
    });

    // Start confetti burst
    this.startConfetti();
  }

  public close(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.particles = [];

    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
      this.modalEl = null;
    }
    this.canvasEl = null;
  }

  public isOpen(): boolean {
    return this.modalEl !== null;
  }

  private startConfetti(): void {
    if (!this.canvasEl) return;
    const canvas = this.canvasEl;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    // Celebratory palette
    const colors = ['#f59e0b', '#d97706', '#b45309', '#10b981', '#ef4444', '#fef3c7', '#3b82f6'];
    const count = 90;

    this.particles = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI / 180) * (200 + Math.random() * 140);
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x: width * 0.5 + (Math.random() - 0.5) * 60,
        y: height * 0.45 + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        alpha: 1,
      });
    }

    const startTime = performance.now();
    const duration = 3200;

    const renderFrame = (now: number): void => {
      const elapsed = now - startTime;
      if (elapsed > duration) {
        ctx.clearRect(0, 0, width, height);
        this.animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);
      const gravity = 0.22;
      const drag = 0.985;

      for (const p of this.particles) {
        p.vy += gravity;
        p.vx *= drag;
        p.vy *= drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        if (elapsed > duration - 800) {
          p.alpha = Math.max(0, (duration - elapsed) / 800);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      this.animationFrameId = requestAnimationFrame(renderFrame);
    };

    this.animationFrameId = requestAnimationFrame(renderFrame);
  }
}
