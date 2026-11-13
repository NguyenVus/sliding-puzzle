import type { StorageManager } from '../../storage/storage-manager';
import type { WoodTheme } from '../../storage/types';

export interface SettingsModalViewOptions {
  storageManager: StorageManager;
  onSoundChange: (enabled: boolean) => void;
  onThemeChange: (theme: WoodTheme) => void;
  onAnimationChange: (enabled: boolean) => void;
  onPictureNumbersChange: (enabled: boolean) => void;
  onResetProgress: () => void;
  onClose?: () => void;
}

export class SettingsModalView {
  private readonly container: HTMLElement;
  private readonly options: SettingsModalViewOptions;
  private modalEl: HTMLElement | null = null;

  constructor(container: HTMLElement, options: SettingsModalViewOptions) {
    this.container = container;
    this.options = options;
  }

  public isOpen(): boolean {
    return this.modalEl !== null;
  }

  public show(): void {
    this.close();

    const currentSettings = this.options.storageManager.getSettings();

    this.modalEl = document.createElement('div');
    this.modalEl.className = 'app-modal-backdrop settings-modal-backdrop';
    this.modalEl.setAttribute('role', 'dialog');
    this.modalEl.setAttribute('aria-modal', 'true');
    this.modalEl.setAttribute('aria-labelledby', 'settings-modal-title');

    this.modalEl.innerHTML = `
      <div class="app-modal-card settings-modal-card">
        <header class="app-modal-header">
          <div class="menu-brand-header">
            <span class="menu-brand-icon">⚙️</span>
            <div>
              <h2 id="settings-modal-title" class="app-modal-title">Cài Đặt</h2>
              <span class="menu-brand-sub">Tùy biến trải nghiệm trò chơi</span>
            </div>
          </div>
          <button type="button" id="settings-btn-close-x" class="modal-close-icon-btn" aria-label="Đóng cài đặt">✕</button>
        </header>

        <div class="settings-body-list">
          <!-- Sound FX -->
          <div class="setting-item-row">
            <div class="setting-item-label">
              <span class="setting-icon" id="sound-status-icon">${currentSettings.soundEnabled ? '🔊' : '🔇'}</span>
              <div>
                <span class="setting-title">Âm thanh hiệu ứng</span>
                <span class="setting-desc">Tiếng gõ gỗ và hợp âm chiến thắng</span>
              </div>
            </div>
            <label class="toggle-switch" aria-label="Bật/Tắt âm thanh">
              <input type="checkbox" id="setting-toggle-sound" ${currentSettings.soundEnabled ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Theme -->
          <div class="setting-item-col">
            <div class="setting-item-label">
              <span class="setting-icon">🎨</span>
              <div>
                <span class="setting-title">Giao diện bàn cờ</span>
                <span class="setting-desc">Chọn chất liệu gỗ yêu thích</span>
              </div>
            </div>
            <div class="theme-picker-group" role="radiogroup" aria-label="Chọn chủ đề gỗ">
              <button type="button" id="theme-btn-light" class="theme-choice-btn ${currentSettings.theme === 'wood-light' ? 'active' : ''}" data-theme="wood-light" aria-checked="${currentSettings.theme === 'wood-light'}">
                <span class="theme-sample wood-light-sample">🪵</span>
                <div class="theme-info">
                  <span class="theme-name">Gỗ Sáng (Sồi / Birch)</span>
                  <span class="theme-desc">Trang nhã, ấm áp, tinh tế</span>
                </div>
              </button>

              <button type="button" id="theme-btn-dark" class="theme-choice-btn ${currentSettings.theme === 'wood-dark' ? 'active' : ''}" data-theme="wood-dark" aria-checked="${currentSettings.theme === 'wood-dark'}">
                <span class="theme-sample wood-dark-sample">🪵</span>
                <div class="theme-info">
                  <span class="theme-name">Gỗ Tối (Walnut / Óc chó)</span>
                  <span class="theme-desc">Cổ điển, sang trọng, tương phản cao</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Animations -->
          <div class="setting-item-row">
            <div class="setting-item-label">
              <span class="setting-icon">⚡</span>
              <div>
                <span class="setting-title">Hiệu ứng chuyển động</span>
                <span class="setting-desc">Trượt mượt mà (Tắt để trượt tức thì)</span>
              </div>
            </div>
            <label class="toggle-switch" aria-label="Bật/Tắt hiệu ứng chuyển động">
              <input type="checkbox" id="setting-toggle-anim" ${currentSettings.animationEnabled ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Picture Mode Numbers -->
          <div class="setting-item-row">
            <div class="setting-item-label">
              <span class="setting-icon">🔢</span>
              <div>
                <span class="setting-title">Số phụ trong chế độ ảnh</span>
                <span class="setting-desc">Hiện số nhỏ ở góc ô để dễ nhận biết</span>
              </div>
            </div>
            <label class="toggle-switch" aria-label="Bật/Tắt số góc trong ghép ảnh">
              <input type="checkbox" id="setting-toggle-pic-num" ${currentSettings.pictureNumbersEnabled ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Reset Progress -->
          <div class="setting-item-col danger-zone">
            <div class="setting-item-label">
              <span class="setting-icon">🗑️</span>
              <div>
                <span class="setting-title">Dữ liệu trò chơi</span>
                <span class="setting-desc">Xóa toàn bộ điểm số và mở khóa lại từ Màn 1</span>
              </div>
            </div>
            <button type="button" id="btn-reset-data" class="btn btn-danger-action">
              Đặt lại tiến trình
            </button>
          </div>
        </div>

        <footer class="app-modal-footer">
          <button type="button" id="settings-btn-done" class="btn btn-primary modal-action-btn full-width">
            Đóng
          </button>
        </footer>
      </div>
    `;

    this.container.appendChild(this.modalEl);

    // Event listeners
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.close();
      }
    });

    const closeBtn = this.modalEl.querySelector<HTMLButtonElement>('#settings-btn-close-x');
    const doneBtn = this.modalEl.querySelector<HTMLButtonElement>('#settings-btn-done');
    closeBtn?.addEventListener('click', () => this.close());
    doneBtn?.addEventListener('click', () => this.close());

    // Sound toggle
    const soundToggle = this.modalEl.querySelector<HTMLInputElement>('#setting-toggle-sound');
    const soundIcon = this.modalEl.querySelector<HTMLElement>('#sound-status-icon');
    soundToggle?.addEventListener('change', () => {
      const enabled = soundToggle.checked;
      if (soundIcon) soundIcon.textContent = enabled ? '🔊' : '🔇';
      this.options.onSoundChange(enabled);
    });

    // Theme buttons
    const lightBtn = this.modalEl.querySelector<HTMLButtonElement>('#theme-btn-light');
    const darkBtn = this.modalEl.querySelector<HTMLButtonElement>('#theme-btn-dark');

    lightBtn?.addEventListener('click', () => {
      lightBtn.classList.add('active');
      lightBtn.setAttribute('aria-checked', 'true');
      darkBtn?.classList.remove('active');
      darkBtn?.setAttribute('aria-checked', 'false');
      this.options.onThemeChange('wood-light');
    });

    darkBtn?.addEventListener('click', () => {
      darkBtn.classList.add('active');
      darkBtn.setAttribute('aria-checked', 'true');
      lightBtn?.classList.remove('active');
      lightBtn?.setAttribute('aria-checked', 'false');
      this.options.onThemeChange('wood-dark');
    });

    // Animation toggle
    const animToggle = this.modalEl.querySelector<HTMLInputElement>('#setting-toggle-anim');
    animToggle?.addEventListener('change', () => {
      this.options.onAnimationChange(animToggle.checked);
    });

    // Picture numbers toggle
    const picNumToggle = this.modalEl.querySelector<HTMLInputElement>('#setting-toggle-pic-num');
    picNumToggle?.addEventListener('change', () => {
      this.options.onPictureNumbersChange(picNumToggle.checked);
    });

    // Reset progress
    const resetBtn = this.modalEl.querySelector<HTMLButtonElement>('#btn-reset-data');
    resetBtn?.addEventListener('click', () => {
      if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ điểm kỷ lục và đưa về Màn 1?')) {
        this.options.onResetProgress();
        this.close();
      }
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
