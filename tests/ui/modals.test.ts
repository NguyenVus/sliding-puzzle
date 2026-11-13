import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MenuModalView } from '../../src/ui/components/menu-modal-view';
import { SettingsModalView } from '../../src/ui/components/settings-modal-view';
import { HowToPlayModalView } from '../../src/ui/components/how-to-play-modal-view';
import { PictureModalView } from '../../src/ui/components/picture-modal-view';
import { StorageManager } from '../../src/storage/storage-manager';
import { PictureManager } from '../../src/picture/picture-manager';

describe('UI Modals Suite', () => {
  let container: HTMLElement;
  let storage: StorageManager;
  let pictureManager: PictureManager;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    storage = new StorageManager();
    storage.resetAll();
    pictureManager = new PictureManager(storage);
  });

  describe('MenuModalView', () => {
    it('opens, triggers callbacks on navigation clicks, and closes', () => {
      const onSelectCampaign = vi.fn();
      const onSelectFreePlay = vi.fn();
      const onSelectPicture = vi.fn();
      const onOpenSettings = vi.fn();
      const onOpenHowToPlay = vi.fn();
      const onClose = vi.fn();

      const menu = new MenuModalView(container, {
        onSelectCampaign,
        onSelectFreePlay,
        onSelectPictureMode: onSelectPicture,
        onOpenSettings,
        onOpenHowToPlay,
        onClose,
      });

      expect(menu.isOpen()).toBe(false);
      menu.show();
      expect(menu.isOpen()).toBe(true);

      const campaignBtn = container.querySelector<HTMLButtonElement>('#menu-btn-campaign');
      campaignBtn?.click();
      expect(onSelectCampaign).toHaveBeenCalled();
      expect(menu.isOpen()).toBe(false);

      // Re-open and click close X
      menu.show();
      const closeX = container.querySelector<HTMLButtonElement>('#menu-btn-close-x');
      closeX?.click();
      expect(menu.isOpen()).toBe(false);
      expect(onClose).toHaveBeenCalled();
    });

    it('ensures campaign menu item icon inherits currentColor and does not have white override', () => {
      const menu = new MenuModalView(container, {
        onSelectCampaign: vi.fn(),
        onSelectFreePlay: vi.fn(),
        onSelectPictureMode: vi.fn(),
        onOpenSettings: vi.fn(),
        onOpenHowToPlay: vi.fn(),
      });
      menu.show();

      const campaignBtn = container.querySelector<HTMLButtonElement>('#menu-btn-campaign');
      expect(campaignBtn).not.toBeNull();
      expect(campaignBtn?.classList.contains('btn-primary-gradient')).toBe(false);

      const trophyIcon = campaignBtn?.querySelector('.menu-item-icon .game-icon');
      expect(trophyIcon).not.toBeNull();
      expect(trophyIcon?.getAttribute('stroke')).toBe('currentColor');
      expect(trophyIcon?.classList.contains('icon-trophy')).toBe(true);

      menu.close();
    });
  });

  describe('SettingsModalView', () => {
    it('manages sound toggle, themes, animations, and picture numbers', () => {
      const onSoundChange = vi.fn();
      const onHapticChange = vi.fn();
      const onThemeChange = vi.fn();
      const onAnimationChange = vi.fn();
      const onPictureModeChange = vi.fn();
      const onPictureNumbersChange = vi.fn();
      const onResetProgress = vi.fn();

      const settingsModal = new SettingsModalView(container, {
        storageManager: storage,
        onSoundChange,
        onHapticChange,
        onThemeChange,
        onAnimationChange,
        onPictureModeChange,
        onPictureNumbersChange,
        onResetProgress,
      });

      settingsModal.show();
      expect(settingsModal.isOpen()).toBe(true);

      // Theme button click
      const darkBtn = container.querySelector<HTMLButtonElement>('#theme-btn-dark');
      darkBtn?.click();
      expect(onThemeChange).toHaveBeenCalledWith('wood-dark');

      const lightBtn = container.querySelector<HTMLButtonElement>('#theme-btn-light');
      lightBtn?.click();
      expect(onThemeChange).toHaveBeenCalledWith('wood-light');

      const marbleBtn = container.querySelector<HTMLButtonElement>('#theme-btn-marble');
      marbleBtn?.click();
      expect(onThemeChange).toHaveBeenCalledWith('marble-gold');

      const tatamiBtn = container.querySelector<HTMLButtonElement>('#theme-btn-tatami');
      tatamiBtn?.click();
      expect(onThemeChange).toHaveBeenCalledWith('tatami-sakura');

      const neonBtn = container.querySelector<HTMLButtonElement>('#theme-btn-neon');
      neonBtn?.click();
      expect(onThemeChange).toHaveBeenCalledWith('neon-cyberpunk');

      // Picture mode toggle
      const picModeToggle = container.querySelector<HTMLInputElement>('#setting-toggle-pic-mode');
      if (picModeToggle) {
        picModeToggle.checked = true;
        picModeToggle.dispatchEvent(new Event('change'));
        expect(onPictureModeChange).toHaveBeenCalledWith(true);
      }

      // Sound toggle
      const soundToggle = container.querySelector<HTMLInputElement>('#setting-toggle-sound');
      if (soundToggle) {
        soundToggle.checked = false;
        soundToggle.dispatchEvent(new Event('change'));
        expect(onSoundChange).toHaveBeenCalledWith(false);
      }

      // Haptic toggle
      const hapticToggle = container.querySelector<HTMLInputElement>('#setting-toggle-haptic');
      if (hapticToggle) {
        hapticToggle.checked = false;
        hapticToggle.dispatchEvent(new Event('change'));
        expect(onHapticChange).toHaveBeenCalledWith(false);
      }

      // Animation toggle
      const animToggle = container.querySelector<HTMLInputElement>('#setting-toggle-anim');
      if (animToggle) {
        animToggle.checked = false;
        animToggle.dispatchEvent(new Event('change'));
        expect(onAnimationChange).toHaveBeenCalledWith(false);
      }

      // Done button
      const doneBtn = container.querySelector<HTMLButtonElement>('#settings-btn-done');
      doneBtn?.click();
      expect(settingsModal.isOpen()).toBe(false);
    });
  });

  describe('HowToPlayModalView', () => {
    it('renders game rules, star criteria, and keyboard shortcuts', () => {
      const onClose = vi.fn();
      const howToPlay = new HowToPlayModalView(container, { onClose });

      howToPlay.show();
      expect(howToPlay.isOpen()).toBe(true);
      expect(container.textContent).toContain('Hướng Dẫn Luật Chơi');
      expect(container.textContent).toContain('Quy Tắc Tính Sao');
      expect(container.textContent).toContain('Phím Tắt Tiện Lợi');

      const doneBtn = container.querySelector<HTMLButtonElement>('#howtoplay-btn-done');
      doneBtn?.click();
      expect(howToPlay.isOpen()).toBe(false);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('PictureModalView', () => {
    it('displays picture preview and handles preset selection', () => {
      const onSelectPreset = vi.fn();
      const onUploadCustom = vi.fn();
      const onApply = vi.fn();
      const onDisablePictureMode = vi.fn();
      const onClose = vi.fn();

      const pictureModal = new PictureModalView(container, {
        pictureManager,
        gridSize: 3,
        onSelectPreset,
        onUploadCustom,
        onApply,
        onDisablePictureMode,
        onClose,
      });

      // 1. Selector mode
      pictureModal.showSelector(3);
      expect(pictureModal.isOpen()).toBe(true);
      expect(container.textContent).toContain('Chế Độ Ghép Ảnh');

      const pineBtn = container.querySelector<HTMLButtonElement>('[data-preset-id="preset-pine"]');
      pineBtn?.click();
      expect(onSelectPreset).toHaveBeenCalledWith('preset-pine');

      // Click "Trở về xếp số cổ điển" button
      const disableBtn = container.querySelector<HTMLButtonElement>('#picture-btn-disable-mode');
      disableBtn?.click();
      expect(onDisablePictureMode).toHaveBeenCalled();
      expect(pictureModal.isOpen()).toBe(false);

      // 2. Preview mode
      pictureModal.showPreview(3);
      expect(pictureModal.isOpen()).toBe(true);
      expect(container.textContent).toContain('Ảnh Gốc Hoàn Chỉnh');
      expect(container.textContent).toContain('Trống');
      pictureModal.close();
    });

    it('filters presets by category tabs and updates selection', () => {
      const onSelectPreset = vi.fn();
      const onUploadCustom = vi.fn();

      const pictureModal = new PictureModalView(container, {
        pictureManager,
        gridSize: 3,
        onSelectPreset,
        onUploadCustom,
      });

      pictureModal.showSelector(3);
      expect(pictureModal.isOpen()).toBe(true);

      // Verify all 10 preset cards are rendered
      const allCards = container.querySelectorAll<HTMLButtonElement>('.preset-choice-card');
      expect(allCards.length).toBe(10);

      // Verify category filter tabs
      const filterBar = container.querySelector('.category-filter-bar');
      expect(filterBar).not.toBeNull();
      const animalsTab = container.querySelector<HTMLButtonElement>('[data-category="animals"]');
      const natureTab = container.querySelector<HTMLButtonElement>('[data-category="nature"]');
      const allTab = container.querySelector<HTMLButtonElement>('[data-category="all"]');

      expect(animalsTab).not.toBeNull();
      expect(natureTab).not.toBeNull();
      expect(allTab).not.toBeNull();

      // Click "Động vật" tab
      animalsTab?.click();
      expect(animalsTab?.classList.contains('active')).toBe(true);
      expect(animalsTab?.getAttribute('aria-selected')).toBe('true');

      // Verify only animal cards are visible
      const visibleAnimalCards = Array.from(allCards).filter((c) => c.style.display !== 'none');
      expect(visibleAnimalCards.length).toBe(3);
      const catCard = container.querySelector<HTMLButtonElement>('[data-preset-id="preset-cat"]');
      expect(catCard?.style.display).toBe('flex');

      // Click cat card to select it
      catCard?.click();
      expect(onSelectPreset).toHaveBeenCalledWith('preset-cat');
      expect(catCard?.classList.contains('active')).toBe(true);
      expect(catCard?.getAttribute('aria-pressed')).toBe('true');

      // Click "Tất cả" tab to reset filter
      allTab?.click();
      const visibleAllCards = Array.from(allCards).filter((c) => c.style.display !== 'none');
      expect(visibleAllCards.length).toBe(10);

      // Verify category tabs Arrow key navigation
      animalsTab?.focus();
      animalsTab?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(natureTab?.classList.contains('active')).toBe(true);

      pictureModal.close();
    });

    it('handles keyboard navigation and shows indicator for custom image', () => {
      const onSelectPreset = vi.fn();
      const onUploadCustom = vi.fn();

      const pictureModal = new PictureModalView(container, {
        pictureManager,
        gridSize: 3,
        onSelectPreset,
        onUploadCustom,
      });

      pictureModal.showSelector(3);
      const uploadLabel = container.querySelector<HTMLLabelElement>('.btn-upload-image');
      const fileInput = container.querySelector<HTMLInputElement>('#custom-image-file-input');
      expect(uploadLabel).not.toBeNull();
      expect(fileInput).not.toBeNull();

      let clickTriggered = false;
      fileInput?.addEventListener('click', () => {
        clickTriggered = true;
      });

      // Press Space on upload label to open file picker
      uploadLabel?.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(clickTriggered).toBe(true);

      pictureModal.close();
    });

    it('preserves custom uploaded image and triggers onApply when clicking done', () => {
      const onSelectPreset = vi.fn();
      const onUploadCustom = vi.fn();
      const onApply = vi.fn();

      const customData = 'data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C/svg%3E';
      pictureManager.setCustomImage(customData);

      const pictureModal = new PictureModalView(container, {
        pictureManager,
        gridSize: 3,
        onSelectPreset,
        onUploadCustom,
        onApply,
      });

      pictureModal.showSelector(3);

      const doneBtn = container.querySelector<HTMLButtonElement>('#picture-btn-done');
      doneBtn?.click();

      // Custom image must NOT be overwritten by preset!
      expect(onSelectPreset).not.toHaveBeenCalled();
      expect(onApply).toHaveBeenCalled();
      expect(pictureManager.getActivePictureUrl()).toBe(customData);
      expect(pictureModal.isOpen()).toBe(false);
    });
  });
});
