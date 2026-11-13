import { DEFAULT_PICTURE_PRESETS, type PicturePreset } from './presets';
import type { LayoutMetrics } from '../ui/layout-manager';
import type { StorageManager } from '../storage/storage-manager';

export interface PictureTileBackground {
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
}

export class PictureManager {
  private activePresetId: string = 'preset-fuji';
  private customImageUrl: string | null = null;
  private isPictureModeEnabled: boolean = false;
  private showNumbersInPicture: boolean = true;
  private storageManager?: StorageManager;

  constructor(storageManager?: StorageManager) {
    this.storageManager = storageManager;
    if (this.storageManager) {
      const settings = this.storageManager.getSettings();
      this.isPictureModeEnabled = settings.pictureModeEnabled ?? false;
      this.showNumbersInPicture = settings.pictureNumbersEnabled;
      if (settings.selectedPictureId) {
        this.activePresetId = settings.selectedPictureId;
      }
    }
  }

  public isEnabled(): boolean {
    return this.isPictureModeEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.isPictureModeEnabled = enabled;
    if (this.storageManager) {
      this.storageManager.updateSettings({ pictureModeEnabled: enabled });
    }
  }

  public toggleEnabled(): boolean {
    const nextState = !this.isPictureModeEnabled;
    this.setEnabled(nextState);
    return this.isPictureModeEnabled;
  }

  public hasCustomImage(): boolean {
    return this.customImageUrl !== null;
  }

  public isNumbersVisible(): boolean {
    return this.showNumbersInPicture;
  }

  public setNumbersVisible(visible: boolean): void {
    this.showNumbersInPicture = visible;
    if (this.storageManager) {
      this.storageManager.updateSettings({ pictureNumbersEnabled: visible });
    }
  }

  public getPresets(): PicturePreset[] {
    return DEFAULT_PICTURE_PRESETS;
  }

  public getActivePictureUrl(): string {
    if (this.customImageUrl) {
      return this.customImageUrl;
    }
    const preset = DEFAULT_PICTURE_PRESETS.find((p) => p.id === this.activePresetId);
    return preset ? preset.url : DEFAULT_PICTURE_PRESETS[0].url;
  }

  public getActivePresetId(): string {
    return this.activePresetId;
  }

  public selectPreset(presetId: string): void {
    this.activePresetId = presetId;
    this.customImageUrl = null;
    if (this.storageManager) {
      this.storageManager.updateSettings({ selectedPictureId: presetId });
    }
  }

  public setCustomImage(dataUrl: string): void {
    this.customImageUrl = dataUrl;
  }

  public clearCustomImage(): void {
    this.customImageUrl = null;
  }

  /**
   * Calculates the exact background slice for tile `tileValue` in an `N x N` grid.
   * `tileValue` runs from 1 to N^2-1.
   */
  public getTileBackground(
    tileValue: number,
    gridSize: number,
    metrics: LayoutMetrics
  ): PictureTileBackground | null {
    if (!this.isPictureModeEnabled || tileValue <= 0 || tileValue >= gridSize * gridSize) {
      return null;
    }

    const { tileSize, gap } = metrics;
    const innerSize = gridSize * tileSize + (gridSize - 1) * gap;

    // Tile value 1 is at (0, 0), tile 2 is at (0, 1), etc.
    const origIndex = tileValue - 1;
    const origRow = Math.floor(origIndex / gridSize);
    const origCol = origIndex % gridSize;

    const x = origCol * (tileSize + gap);
    const y = origRow * (tileSize + gap);

    return {
      backgroundImage: `url("${this.getActivePictureUrl()}")`,
      backgroundSize: `${innerSize}px ${innerSize}px`,
      backgroundPosition: `-${x}px -${y}px`,
    };
  }
}

export const defaultPictureManager = new PictureManager();
