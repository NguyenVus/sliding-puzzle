import type { StorageManager } from '../../storage/storage-manager';
import type { BoardTheme } from '../../storage/types';

export interface SettingsModalViewOptions {
  storageManager: StorageManager;
  onSoundChange: (enabled: boolean) => void;
  onHapticChange?: (enabled: boolean) => void;
  onThemeChange: (theme: BoardTheme) => void;
  onAnimationChange: (enabled: boolean) => void;
  onPictureModeChange?: (enabled: boolean) => void;
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

          <!-- Haptic Feedback -->
          <div class="setting-item-row">
            <div class="setting-item-label">
              <span class="setting-icon" id="haptic-status-icon">${currentSettings.hapticEnabled ? '📳' : '📴'}</span>
              <div>
                <span class="setting-title">Rung phản hồi (Haptic)</span>
                <span class="setting-desc">Cảm giác xúc giác khi trượt ô và chạm nút (Mobile)</span>
              </div>
            </div>
            <label class="toggle-switch" aria-label="Bật/Tắt rung phản hồi">
              <input type="checkbox" id="setting-toggle-haptic" ${currentSettings.hapticEnabled ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Theme -->
          <div class="setting-item-col">
            <div class="setting-item-label">
              <span class="setting-icon">🎨</span>
              <div>
                <span class="setting-title">Giao diện bàn cờ</span>
                <span class="setting-desc">Chọn phong cách và chất liệu yêu thích</span>
              </div>
            </div>
            <div class="theme-picker-group" role="radiogroup" aria-label="Chọn chủ đề bàn cờ">
              <button type="button" id="theme-btn-light" class="theme-choice-btn ${currentSettings.theme === 'wood-light' ? 'active' : ''}" data-theme="wood-light" aria-checked="${currentSettings.theme === 'wood-light'}">
                <span class="theme-sample wood-light-sample">🌲</span>
                <div class="theme-info">
                  <span class="theme-name">Gỗ Sáng (Wood Light)</span>
                  <span class="theme-desc">Trang nhã, ấm áp, thanh lịch</span>
                </div>
              </button>

              <button type="button" id="theme-btn-dark" class="theme-choice-btn ${currentSettings.theme === 'wood-dark' ? 'active' : ''}" data-theme="wood-dark" aria-checked="${currentSettings.theme === 'wood-dark'}">
                <span class="theme-sample wood-dark-sample">🪵</span>
                <div class="theme-info">
                  <span class="theme-name">Gỗ Óc Chó (Wood Dark)</span>
                  <span class="theme-desc">Cổ điển, sang trọng, tương phản cao</span>
                </div>
              </button>

              <button type="button" id="theme-btn-marble" class="theme-choice-btn ${currentSettings.theme === 'marble-gold' ? 'active' : ''}" data-theme="marble-gold" aria-checked="${currentSettings.theme === 'marble-gold'}">
                <span class="theme-sample marble-gold-sample">🏛️</span>
                <div class="theme-info">
                  <span class="theme-name">Cẩm Thạch Vàng (Marble & Gold)</span>
                  <span class="theme-desc">Đá trắng vân mây, mạ vàng ánh kim hoàng gia</span>
                </div>
              </button>

              <button type="button" id="theme-btn-tatami" class="theme-choice-btn ${currentSettings.theme === 'tatami-sakura' ? 'active' : ''}" data-theme="tatami-sakura" aria-checked="${currentSettings.theme === 'tatami-sakura'}">
                <span class="theme-sample tatami-sakura-sample">🌸</span>
                <div class="theme-info">
                  <span class="theme-name">Tatami Anh Đào (Tatami & Sakura)</span>
                  <span class="theme-desc">Chiếu cói truyền thống, thông & đỏ sakura</span>
                </div>
              </button>

              <button type="button" id="theme-btn-neon" class="theme-choice-btn ${currentSettings.theme === 'neon-cyberpunk' ? 'active' : ''}" data-theme="neon-cyberpunk" aria-checked="${currentSettings.theme === 'neon-cyberpunk'}">
                <span class="theme-sample neon-cyberpunk-sample">🌌</span>
                <div class="theme-info">
                  <span class="theme-name">Neon Cyberpunk (Dark Glow)</span>
                  <span class="theme-desc">Kính mờ bóng tối, viền LED xanh ngọc & tím hồng</span>
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

          <!-- Picture Mode -->
          <div class="setting-item-row">
            <div class="setting-item-label">
              <span class="setting-icon">🖼️</span>
              <div>
                <span class="setting-title">Chế độ ghép ảnh</span>
                <span class="setting-desc">Ghép tranh nghệ thuật thay vì số (Tắt để xếp số)</span>
              </div>
            </div>
            <label class="toggle-switch" aria-label="Bật/Tắt chế độ ghép ảnh">
              <input type="checkbox" id="setting-toggle-pic-mode" ${currentSettings.pictureModeEnabled ? 'checked' : ''} />
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

    // Haptic toggle
    const hapticToggle = this.modalEl.querySelector<HTMLInputElement>('#setting-toggle-haptic');
    const hapticIcon = this.modalEl.querySelector<HTMLElement>('#haptic-status-icon');
    hapticToggle?.addEventListener('change', () => {
      const enabled = hapticToggle.checked;
      if (hapticIcon) hapticIcon.textContent = enabled ? '📳' : '📴';
      this.options.onHapticChange?.(enabled);
    });

    // Theme buttons
    const themeButtons: Array<{ id: string; theme: BoardTheme }> = [
      { id: 'theme-btn-light', theme: 'wood-light' },
      { id: 'theme-btn-dark', theme: 'wood-dark' },
      { id: 'theme-btn-marble', theme: 'marble-gold' },
      { id: 'theme-btn-tatami', theme: 'tatami-sakura' },
      { id: 'theme-btn-neon', theme: 'neon-cyberpunk' },
    ];

    themeButtons.forEach(({ id, theme }) => {
      const btn = this.modalEl?.querySelector<HTMLButtonElement>(`#${id}`);
      btn?.addEventListener('click', () => {
        themeButtons.forEach(({ id: otherId }) => {
          const otherBtn = this.modalEl?.querySelector<HTMLButtonElement>(`#${otherId}`);
          if (otherBtn) {
            const isActive = otherId === id;
            otherBtn.classList.toggle('active', isActive);
            otherBtn.setAttribute('aria-checked', String(isActive));
          }
        });
        this.options.onThemeChange(theme);
      });
    });

    // Animation toggle
    const animToggle = this.modalEl.querySelector<HTMLInputElement>('#setting-toggle-anim');
    animToggle?.addEventListener('change', () => {
      this.options.onAnimationChange(animToggle.checked);
    });

    // Picture mode toggle
    const picModeToggle = this.modalEl.querySelector<HTMLInputElement>('#setting-toggle-pic-mode');
    picModeToggle?.addEventListener('change', () => {
      this.options.onPictureModeChange?.(picModeToggle.checked);
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
