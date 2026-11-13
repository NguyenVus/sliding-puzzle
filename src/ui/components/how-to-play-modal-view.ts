import { renderIcon } from '../icons';

export interface HowToPlayModalViewOptions {
  onClose?: () => void;
}

export class HowToPlayModalView {
  private readonly container: HTMLElement;
  private readonly options: HowToPlayModalViewOptions;
  private modalEl: HTMLElement | null = null;

  constructor(container: HTMLElement, options: HowToPlayModalViewOptions = {}) {
    this.container = container;
    this.options = options;
  }

  public isOpen(): boolean {
    return this.modalEl !== null;
  }

  public show(): void {
    this.close();

    this.modalEl = document.createElement('div');
    this.modalEl.className = 'app-modal-backdrop howtoplay-modal-backdrop';
    this.modalEl.setAttribute('role', 'dialog');
    this.modalEl.setAttribute('aria-modal', 'true');
    this.modalEl.setAttribute('aria-labelledby', 'howtoplay-modal-title');

    this.modalEl.innerHTML = `
      <div class="app-modal-card howtoplay-modal-card">
        <header class="app-modal-header">
          <div class="menu-brand-header">
            <span class="menu-brand-icon">${renderIcon('guide', { size: 24 })}</span>
            <div>
              <h2 id="howtoplay-modal-title" class="app-modal-title">Hướng Dẫn Luật Chơi</h2>
              <span class="menu-brand-sub">Luật chơi, cách tính sao & phím tắt</span>
            </div>
          </div>
          <button type="button" id="howtoplay-btn-close-x" class="modal-close-icon-btn" aria-label="Đóng hướng dẫn">${renderIcon('close', { size: 18 })}</button>
        </header>

        <div class="howtoplay-body-scroll">
          <!-- Section 1: Objective -->
          <section class="guide-section">
            <h3 class="guide-section-title"><span class="guide-title-icon">${renderIcon('target', { size: 18 })}</span> 1. Mục Tiêu Trò Chơi</h3>
            <p class="guide-text">
              Sắp xếp các ô số theo thứ tự tăng dần từ <strong>1 đến N² - 1</strong> theo chiều từ trái sang phải, từ trên xuống dưới. Vị trí góc dưới cùng bên phải là <strong>ô trống</strong>.
            </p>
          </section>

          <!-- Section 2: How to move -->
          <section class="guide-section">
            <h3 class="guide-section-title"><span class="guide-title-icon">${renderIcon('hand', { size: 18 })}</span> 2. Cách Di Chuyển Ô</h3>
            <ul class="guide-list">
              <li><strong>Nhấp hoặc Chạm:</strong> Nhấp trực tiếp vào bất kỳ ô nào nằm cạnh ô trống để trượt ô đó vào vị trí trống.</li>
              <li><strong>Vuốt (Swipe):</strong> Trên màn hình cảm ứng điện thoại hoặc máy tính bảng, bạn có thể vuốt ngón tay theo hướng muốn ô di chuyển.</li>
            </ul>
          </section>

          <!-- Section 3: Star Evaluation -->
          <section class="guide-section">
            <h3 class="guide-section-title"><span class="guide-title-icon">${renderIcon('trophy', { size: 18 })}</span> 3. Quy Tắc Tính Sao (Campaign Mode)</h3>
            <div class="guide-star-rules">
              <div class="star-rule-row">
                <span class="star-badge">★☆☆</span>
                <div class="star-rule-info">
                  <strong>1 Sao:</strong> Hoàn thành bàn cờ mà không giới hạn số bước và thời gian.
                </div>
              </div>
              <div class="star-rule-row">
                <span class="star-badge">★★☆</span>
                <div class="star-rule-info">
                  <strong>2 Sao:</strong> Đạt số bước chuẩn (≤ Par moves) <em>hoặc</em> thời gian chuẩn (≤ Target time).
                </div>
              </div>
              <div class="star-rule-row">
                <span class="star-badge">★★★</span>
                <div class="star-rule-info">
                  <strong>3 Sao:</strong> Đạt <strong>cả số bước chuẩn và thời gian chuẩn</strong>, tự mình giải không dùng Gợi ý.
                </div>
              </div>
            </div>
            <p class="guide-note">
              <em>⚠️ Lưu ý: Khi sử dụng nút <strong>Gợi ý (<span class="inline-icon">${renderIcon('hint', { size: 14 })}</span>)</strong> hoặc <strong>Tự giải (<span class="inline-icon">${renderIcon('auto-solve', { size: 14 })}</span>)</strong>, điểm tối đa màn chơi đó sẽ giới hạn ở mức 1 sao.</em>
            </p>
          </section>

          <!-- Section 4: Keyboard Shortcuts -->
          <section class="guide-section">
            <h3 class="guide-section-title"><span class="guide-title-icon">${renderIcon('keyboard', { size: 18 })}</span> 4. Phím Tắt Tiện Lợi (Máy tính)</h3>
            <div class="keyboard-shortcuts-grid">
              <div class="shortcut-item">
                <div class="key-combo"><kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> hoặc <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></div>
                <span class="shortcut-desc">Trượt ô kề vào ô trống</span>
              </div>
              <div class="shortcut-item">
                <div class="key-combo"><kbd>Z</kbd></div>
                <span class="shortcut-desc">Hoàn tác bước đi (Undo)</span>
              </div>
              <div class="shortcut-item">
                <div class="key-combo"><kbd>R</kbd></div>
                <span class="shortcut-desc">Chơi lại ván hiện tại (Restart)</span>
              </div>
              <div class="shortcut-item">
                <div class="key-combo"><kbd>H</kbd></div>
                <span class="shortcut-desc">Gợi ý nước đi tối ưu (Hint)</span>
              </div>
              <div class="shortcut-item">
                <div class="key-combo"><kbd>Esc</kbd></div>
                <span class="shortcut-desc">Đóng bảng thông báo / modal</span>
              </div>
            </div>
          </section>
        </div>

        <footer class="app-modal-footer">
          <button type="button" id="howtoplay-btn-done" class="btn btn-primary modal-action-btn full-width">
            Đã hiểu, Chơi ngay!
          </button>
        </footer>
      </div>
    `;

    this.container.appendChild(this.modalEl);

    // Close handlers
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    });

    const closeBtn = this.modalEl.querySelector<HTMLButtonElement>('#howtoplay-btn-close-x');
    const doneBtn = this.modalEl.querySelector<HTMLButtonElement>('#howtoplay-btn-done');
    closeBtn?.addEventListener('click', () => this.close());
    doneBtn?.addEventListener('click', () => this.close());
  }

  public close(): void {
    if (this.modalEl && this.modalEl.parentNode) {
      this.modalEl.parentNode.removeChild(this.modalEl);
      this.modalEl = null;
      this.options.onClose?.();
    }
  }
}
