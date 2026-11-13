import type { PictureManager } from '../../picture/picture-manager';

export interface PictureModalViewOptions {
  pictureManager: PictureManager;
  gridSize: number;
  onSelectPreset: (presetId: string) => void;
  onUploadCustom: (dataUrl: string) => void;
  onClose?: () => void;
}

export class PictureModalView {
  private readonly container: HTMLElement;
  private readonly options: PictureModalViewOptions;
  private modalEl: HTMLElement | null = null;
  private isPreviewOnly = false;

  constructor(container: HTMLElement, options: PictureModalViewOptions) {
    this.container = container;
    this.options = options;
  }

  public isOpen(): boolean {
    return this.modalEl !== null;
  }

  /**
   * Opens the picture modal in "Preview Original Image" mode.
   */
  public showPreview(gridSize?: number): void {
    this.isPreviewOnly = true;
    this.render(gridSize);
  }

  /**
   * Opens the picture modal in "Select / Upload Picture" mode.
   */
  public showSelector(gridSize?: number): void {
    this.isPreviewOnly = false;
    this.render(gridSize);
  }

  private render(customGridSize?: number): void {
    this.close();

    const pm = this.options.pictureManager;
    const presets = pm.getPresets();
    const activeUrl = pm.getActivePictureUrl();
    const activePresetId = pm.getActivePresetId();
    const size = customGridSize ?? this.options.gridSize;

    this.modalEl = document.createElement('div');
    this.modalEl.className = 'app-modal-backdrop picture-modal-backdrop';
    this.modalEl.setAttribute('role', 'dialog');
    this.modalEl.setAttribute('aria-modal', 'true');
    this.modalEl.setAttribute('aria-labelledby', 'picture-modal-title');

    const presetsListHtml = presets
      .map(
        (p) => `
        <button type="button" class="preset-choice-card ${p.id === activePresetId ? 'active' : ''}" data-preset-id="${p.id}">
          <div class="preset-thumb-frame">
            <img src="${p.thumbnail}" alt="${p.name}" class="preset-thumb-img" />
          </div>
          <span class="preset-name">${p.name}</span>
        </button>
      `
      )
      .join('');

    const titleText = this.isPreviewOnly ? 'Ảnh Gốc Hoàn Chỉnh' : 'Chế Độ Ghép Ảnh';
    const subText = this.isPreviewOnly
      ? `Hình ảnh mẫu lưới ${size}×${size} để bạn tham khảo vị trí`
      : 'Chọn bức tranh nghệ thuật hoặc tải ảnh của chính bạn';

    this.modalEl.innerHTML = `
      <div class="app-modal-card picture-modal-card">
        <header class="app-modal-header">
          <div class="menu-brand-header">
            <span class="menu-brand-icon">🖼️</span>
            <div>
              <h2 id="picture-modal-title" class="app-modal-title">${titleText}</h2>
              <span class="menu-brand-sub">${subText}</span>
            </div>
          </div>
          <button type="button" id="picture-btn-close-x" class="modal-close-icon-btn" aria-label="Đóng bảng ảnh">✕</button>
        </header>

        <div class="picture-modal-body">
          <!-- Main Picture Preview with Wood Frame -->
          <div class="picture-preview-showcase">
            <div class="wood-framed-image" id="wood-framed-image-preview">
              <img id="main-preview-img" src="${activeUrl}" alt="Ảnh ghép gốc" class="full-preview-image" />
              <div class="preview-grid-overlay" id="preview-grid-overlay" style="--overlay-grid-size: ${size};">
                ${Array.from({ length: size * size })
                  .map((_, i) => `<div class="grid-cell-guide"><span class="cell-num">${i + 1}</span></div>`)
                  .join('')}
              </div>
            </div>
            <div class="preview-actions-bar">
              <label class="toggle-guide-label">
                <input type="checkbox" id="toggle-grid-overlay" checked />
                <span>Hiện đường kẻ hướng dẫn ${size}×${size}</span>
              </label>
            </div>
          </div>

          <!-- Preset & Upload Selection -->
          <div class="picture-selection-section" ${this.isPreviewOnly ? 'style="display: none;"' : ''}>
            <h3 class="selection-section-title">Chọn Tranh Mẫu:</h3>
            <div class="presets-gallery-grid">
              ${presetsListHtml}
            </div>

            <div class="custom-upload-box">
              <input type="file" id="custom-image-file-input" accept="image/png, image/jpeg, image/webp, image/svg+xml" class="visually-hidden" />
              <label for="custom-image-file-input" class="btn btn-upload-image" tabindex="0" role="button">
                <span class="btn-icon">📁</span>
                <span>Tải ảnh từ thiết bị của bạn...</span>
              </label>
            </div>
          </div>
        </div>

        <footer class="app-modal-footer">
          <button type="button" id="picture-btn-done" class="btn btn-primary modal-action-btn full-width">
            ${this.isPreviewOnly ? 'Đóng' : 'Áp Dụng & Chơi Ngay'}
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

    const closeBtn = this.modalEl.querySelector<HTMLButtonElement>('#picture-btn-close-x');
    const doneBtn = this.modalEl.querySelector<HTMLButtonElement>('#picture-btn-done');
    closeBtn?.addEventListener('click', () => this.close());
    doneBtn?.addEventListener('click', () => {
      if (!this.isPreviewOnly) {
        this.options.onSelectPreset(pm.getActivePresetId());
      }
      this.close();
    });

    // Grid toggle
    const gridToggle = this.modalEl.querySelector<HTMLInputElement>('#toggle-grid-overlay');
    const gridOverlay = this.modalEl.querySelector<HTMLElement>('#preview-grid-overlay');
    gridToggle?.addEventListener('change', () => {
      if (gridOverlay) {
        gridOverlay.style.display = gridToggle.checked ? 'grid' : 'none';
      }
    });

    // Preset selection
    const presetButtons = this.modalEl.querySelectorAll<HTMLButtonElement>('.preset-choice-card');
    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const presetId = btn.dataset.presetId;
        if (presetId) {
          presetButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.options.onSelectPreset(presetId);
          const previewImg = this.modalEl?.querySelector<HTMLImageElement>('#main-preview-img');
          if (previewImg) {
            previewImg.src = pm.getActivePictureUrl();
          }
        }
      });
    });

    // Custom upload
    const fileInput = this.modalEl.querySelector<HTMLInputElement>('#custom-image-file-input');
    fileInput?.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            presetButtons.forEach((b) => b.classList.remove('active'));
            this.options.onUploadCustom(result);
            const previewImg = this.modalEl?.querySelector<HTMLImageElement>('#main-preview-img');
            if (previewImg) {
              previewImg.src = result;
            }
          }
        };
        reader.readAsDataURL(file);
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
