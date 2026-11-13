export interface MenuModalViewOptions {
  onSelectCampaign: () => void;
  onSelectFreePlay: () => void;
  onSelectPictureMode: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onClose?: () => void;
}

export class MenuModalView {
  private readonly container: HTMLElement;
  private readonly options: MenuModalViewOptions;
  private modalEl: HTMLElement | null = null;

  constructor(container: HTMLElement, options: MenuModalViewOptions) {
    this.container = container;
    this.options = options;
  }

  public isOpen(): boolean {
    return this.modalEl !== null;
  }

  public show(): void {
    this.close();

    this.modalEl = document.createElement('div');
    this.modalEl.className = 'app-modal-backdrop main-menu-backdrop';
    this.modalEl.setAttribute('role', 'dialog');
    this.modalEl.setAttribute('aria-modal', 'true');
    this.modalEl.setAttribute('aria-labelledby', 'main-menu-title');

    this.modalEl.innerHTML = `
      <div class="app-modal-card main-menu-card">
        <header class="app-modal-header">
          <div class="menu-brand-header">
            <span class="menu-brand-icon">🪵</span>
            <div>
              <h2 id="main-menu-title" class="app-modal-title">Menu Trò Chơi</h2>
              <span class="menu-brand-sub">Sliding Puzzle · Phong Cách Gỗ</span>
            </div>
          </div>
          <button type="button" id="menu-btn-close-x" class="modal-close-icon-btn" aria-label="Đóng menu">✕</button>
        </header>

        <nav class="main-menu-nav" aria-label="Menu chính">
          <button type="button" id="menu-btn-campaign" class="menu-item-btn btn-primary-gradient">
            <span class="menu-item-icon">🏆</span>
            <div class="menu-item-content">
              <span class="menu-item-title">Chơi theo màn</span>
              <span class="menu-item-desc">30 cấp độ từ 3×3 đến 8×8 thử thách</span>
            </div>
            <span class="menu-item-arrow">›</span>
          </button>

          <button type="button" id="menu-btn-freeplay" class="menu-item-btn">
            <span class="menu-item-icon">🎲</span>
            <div class="menu-item-content">
              <span class="menu-item-title">Chơi tự do</span>
              <span class="menu-item-desc">Tùy chọn kích thước 3×3 đến 8×8 ngẫu nhiên</span>
            </div>
            <span class="menu-item-arrow">›</span>
          </button>

          <button type="button" id="menu-btn-picture" class="menu-item-btn">
            <span class="menu-item-icon">🖼️</span>
            <div class="menu-item-content">
              <span class="menu-item-title">Chế độ ghép ảnh</span>
              <span class="menu-item-desc">Ghép tranh nghệ thuật hoặc tải ảnh của bạn</span>
            </div>
            <span class="menu-item-arrow">›</span>
          </button>

          <button type="button" id="menu-btn-settings" class="menu-item-btn">
            <span class="menu-item-icon">⚙️</span>
            <div class="menu-item-content">
              <span class="menu-item-title">Cài đặt</span>
              <span class="menu-item-desc">Âm thanh, chủ đề gỗ sáng/tối, hoạt họa</span>
            </div>
            <span class="menu-item-arrow">›</span>
          </button>

          <button type="button" id="menu-btn-howtoplay" class="menu-item-btn">
            <span class="menu-item-icon">📖</span>
            <div class="menu-item-content">
              <span class="menu-item-title">Hướng dẫn luật chơi</span>
              <span class="menu-item-desc">Luật xếp số, cách tính sao & phím tắt</span>
            </div>
            <span class="menu-item-arrow">›</span>
          </button>
        </nav>
      </div>
    `;

    this.container.appendChild(this.modalEl);

    // Event listeners
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    });

    const closeBtn = this.modalEl.querySelector<HTMLButtonElement>('#menu-btn-close-x');
    closeBtn?.addEventListener('click', () => this.close());

    const campaignBtn = this.modalEl.querySelector<HTMLButtonElement>('#menu-btn-campaign');
    campaignBtn?.addEventListener('click', () => {
      this.close();
      this.options.onSelectCampaign();
    });

    const freePlayBtn = this.modalEl.querySelector<HTMLButtonElement>('#menu-btn-freeplay');
    freePlayBtn?.addEventListener('click', () => {
      this.close();
      this.options.onSelectFreePlay();
    });

    const pictureBtn = this.modalEl.querySelector<HTMLButtonElement>('#menu-btn-picture');
    pictureBtn?.addEventListener('click', () => {
      this.close();
      this.options.onSelectPictureMode();
    });

    const settingsBtn = this.modalEl.querySelector<HTMLButtonElement>('#menu-btn-settings');
    settingsBtn?.addEventListener('click', () => {
      this.close();
      this.options.onOpenSettings();
    });

    const howToPlayBtn = this.modalEl.querySelector<HTMLButtonElement>('#menu-btn-howtoplay');
    howToPlayBtn?.addEventListener('click', () => {
      this.close();
      this.options.onOpenHowToPlay();
    });
  }

  public close(): void {
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
      this.modalEl = null;
      this.options.onClose?.();
    }
  }
}
