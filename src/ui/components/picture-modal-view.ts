import type { PictureManager } from '../../picture/picture-manager';
import type { PresetCategory } from '../../picture/presets';

export interface PictureModalViewOptions {
  pictureManager: PictureManager;
  gridSize: number;
  onSelectPreset: (presetId: string) => void;
  onUploadCustom: (dataUrl: string) => void;
  onApply?: () => void;
  onDisablePictureMode?: () => void;
  onClose?: () => void;
}

/**
 * Optimizes custom uploaded images by center-cropping to square
 * and capping dimensions to max 1024px to ensure smooth 60fps rendering and low RAM usage.
 */
function processCustomImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string') {
        reject(new Error('Invalid file content'));
        return;
      }

      // If SVG or environment lacks full Canvas image decoding, use raw data URL
      if (
        file.type === 'image/svg+xml' ||
        typeof document === 'undefined' ||
        typeof Image === 'undefined'
      ) {
        resolve(result);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 1024;
          const minSide = Math.min(img.width, img.height);
          const outDim = Math.min(maxDim, minSide);
          canvas.width = outDim;
          canvas.height = outDim;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }

          // Center-crop to square
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, outDim, outDim);

          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          resolve(canvas.toDataURL(outputType, 0.92));
        } catch {
          resolve(result);
        }
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

export class PictureModalView {
  private readonly container: HTMLElement;
  private readonly options: PictureModalViewOptions;
  private modalEl: HTMLElement | null = null;
  private isPreviewOnly = false;
  private hasCustomSelected = false;
  private selectedCategory: 'all' | PresetCategory = 'all';

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
    this.hasCustomSelected = pm.hasCustomImage();
    const size = customGridSize ?? this.options.gridSize;

    this.modalEl = document.createElement('div');
    this.modalEl.className = 'app-modal-backdrop picture-modal-backdrop';
    this.modalEl.setAttribute('role', 'dialog');
    this.modalEl.setAttribute('aria-modal', 'true');
    this.modalEl.setAttribute('aria-labelledby', 'picture-modal-title');

    const presetsListHtml = presets
      .map(
        (p) => {
          const isMatchingCategory =
            this.selectedCategory === 'all' || p.category === this.selectedCategory;
          const isSelected = !this.hasCustomSelected && p.id === activePresetId;
          return `
            <button type="button"
              class="preset-choice-card ${isSelected ? 'active' : ''}"
              data-preset-id="${p.id}"
              data-category="${p.category}"
              style="${isMatchingCategory ? 'display: flex;' : 'display: none;'}"
              aria-label="Chọn tranh ${p.name}">
              <div class="preset-thumb-frame">
                <img src="${p.thumbnail}" alt="${p.name}" class="preset-thumb-img" loading="lazy" />
              </div>
              <div class="preset-card-details">
                <span class="preset-category-badge">${p.categoryLabel ?? ''}</span>
                <span class="preset-name">${p.name}</span>
              </div>
            </button>
          `;
        }
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
                  .map((_, i) =>
                    i === size * size - 1
                      ? `<div class="grid-cell-guide blank-cell"><span class="cell-num cell-blank-guide">Trống</span></div>`
                      : `<div class="grid-cell-guide"><span class="cell-num">${i + 1}</span></div>`
                  )
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
            <div class="selection-section-header">
              <h3 class="selection-section-title">Chọn Tranh Mẫu (${presets.length} tranh)</h3>
            </div>

            <!-- Category Filter Bar -->
            <div class="category-filter-bar" role="tablist" aria-label="Lọc tranh theo chủ đề">
              <button type="button" class="category-tab-btn ${this.selectedCategory === 'all' ? 'active' : ''}" data-category="all" role="tab" aria-selected="${this.selectedCategory === 'all'}">
                <span class="category-tab-icon">✨</span>
                <span class="category-tab-label">Tất cả</span>
              </button>
              <button type="button" class="category-tab-btn ${this.selectedCategory === 'animals' ? 'active' : ''}" data-category="animals" role="tab" aria-selected="${this.selectedCategory === 'animals'}">
                <span class="category-tab-icon">🐾</span>
                <span class="category-tab-label">Động vật</span>
              </button>
              <button type="button" class="category-tab-btn ${this.selectedCategory === 'nature' ? 'active' : ''}" data-category="nature" role="tab" aria-selected="${this.selectedCategory === 'nature'}">
                <span class="category-tab-icon">🌄</span>
                <span class="category-tab-label">Thiên nhiên</span>
              </button>
              <button type="button" class="category-tab-btn ${this.selectedCategory === 'space' ? 'active' : ''}" data-category="space" role="tab" aria-selected="${this.selectedCategory === 'space'}">
                <span class="category-tab-icon">🚀</span>
                <span class="category-tab-label">Vũ trụ</span>
              </button>
              <button type="button" class="category-tab-btn ${this.selectedCategory === 'art' ? 'active' : ''}" data-category="art" role="tab" aria-selected="${this.selectedCategory === 'art'}">
                <span class="category-tab-icon">🎨</span>
                <span class="category-tab-label">Nghệ thuật</span>
              </button>
            </div>

            <!-- Responsive Gallery Grid -->
            <div class="presets-gallery-grid" id="presets-gallery-grid">
              ${presetsListHtml}
            </div>

            <div class="custom-upload-box">
              <input type="file" id="custom-image-file-input" accept="image/png, image/jpeg, image/webp, image/svg+xml" class="visually-hidden" />
              <label for="custom-image-file-input" class="btn btn-upload-image" tabindex="0" role="button">
                <span class="btn-icon">📁</span>
                <span>Tải ảnh từ thiết bị của bạn...</span>
              </label>
            </div>

            <!-- Option to disable Picture Mode and return to classic numbered tiles -->
            <div class="picture-disable-mode-box">
              <button type="button" id="picture-btn-disable-mode" class="btn btn-classic-numbers">
                <span class="btn-icon">🔢</span>
                <span>Trở về xếp số cổ điển (Tắt ảnh)</span>
              </button>
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
    const disableModeBtn = this.modalEl.querySelector<HTMLButtonElement>('#picture-btn-disable-mode');

    closeBtn?.addEventListener('click', () => this.close());

    doneBtn?.addEventListener('click', () => {
      if (!this.isPreviewOnly) {
        if (this.hasCustomSelected) {
          if (this.options.onApply) {
            this.options.onApply();
          } else {
            this.options.onUploadCustom(pm.getActivePictureUrl());
          }
        } else {
          this.options.onSelectPreset(pm.getActivePresetId());
        }
      }
      this.close();
    });

    disableModeBtn?.addEventListener('click', () => {
      this.options.onDisablePictureMode?.();
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

    // Category filter logic
    const categoryBtns = this.modalEl.querySelectorAll<HTMLButtonElement>('.category-tab-btn');
    const presetCards = this.modalEl.querySelectorAll<HTMLButtonElement>('.preset-choice-card');

    categoryBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.category as 'all' | PresetCategory;
        if (!cat) return;
        this.selectedCategory = cat;

        categoryBtns.forEach((b) => {
          const isCurrent = b === btn;
          b.classList.toggle('active', isCurrent);
          b.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        });

        presetCards.forEach((card) => {
          const cardCat = card.dataset.category;
          const isVisible = cat === 'all' || cardCat === cat;
          card.style.display = isVisible ? 'flex' : 'none';
        });
      });
    });

    // Preset selection
    presetCards.forEach((btn) => {
      btn.addEventListener('click', () => {
        const presetId = btn.dataset.presetId;
        if (presetId) {
          presetCards.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.hasCustomSelected = false;
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
    fileInput?.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (file) {
        try {
          const optimizedDataUrl = await processCustomImageFile(file);
          presetCards.forEach((b) => b.classList.remove('active'));
          this.hasCustomSelected = true;
          this.options.onUploadCustom(optimizedDataUrl);
          const previewImg = this.modalEl?.querySelector<HTMLImageElement>('#main-preview-img');
          if (previewImg) {
            previewImg.src = optimizedDataUrl;
          }
        } catch (err) {
          console.error('Failed to process custom image:', err);
        } finally {
          fileInput.value = '';
        }
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
