import { test, expect } from '@playwright/test';

test.describe('Picture Puzzle Mode E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.wood-board-frame');
  });

  test('activates picture mode and verifies tile background slices', async ({ page }) => {
    // Open Main Menu -> Picture Mode
    await page.locator('#btn-menu').click();
    await page.locator('#menu-btn-picture').click();

    const picModal = page.locator('.picture-modal-card');
    await expect(picModal).toBeVisible();
    await expect(picModal).toContainText('Chế Độ Ghép Ảnh');

    // Select "Rừng Thông" preset
    const pineCard = page.locator('[data-preset-id="preset-pine"]');
    await expect(pineCard).toBeVisible();
    await pineCard.click();

    // Click Apply
    await page.locator('#picture-btn-done').click();
    await expect(picModal).not.toBeVisible();

    // Verify tiles now have picture slices and corner badges
    const tiles = page.locator('.wood-tile');
    const firstTile = tiles.first();
    await expect(firstTile).toHaveClass(/is-picture-tile/);

    const cornerBadge = firstTile.locator('.tile-corner-badge');
    await expect(cornerBadge).toBeVisible();

    // Verify "Ảnh gốc" preview button is now visible on HUD
    const previewBtn = page.locator('#btn-preview-picture');
    await expect(previewBtn).toBeVisible();
  });

  test('opens and closes Picture Preview with guide grid', async ({ page }) => {
    // Enable picture mode via Menu
    await page.locator('#btn-menu').click();
    await page.locator('#menu-btn-picture').click();
    await page.locator('#picture-btn-done').click();

    // Click "Ảnh gốc" preview on HUD
    const previewBtn = page.locator('#btn-preview-picture');
    await previewBtn.click();

    const previewModal = page.locator('.picture-modal-card');
    await expect(previewModal).toBeVisible();
    await expect(previewModal).toContainText('Ảnh Gốc Hoàn Chỉnh');

    // Verify preview image and guide overlay exist
    const previewImg = page.locator('#main-preview-img');
    await expect(previewImg).toBeVisible();

    const overlay = page.locator('#preview-grid-overlay');
    await expect(overlay).toBeVisible();

    // Toggle overlay
    const overlayToggle = page.locator('#toggle-grid-overlay');
    await overlayToggle.uncheck();
    await expect(overlay).not.toBeVisible();

    // Close preview
    await page.locator('#picture-btn-done').click();
    await expect(previewModal).not.toBeVisible();
  });

  test('allows making moves in picture mode', async ({ page }) => {
    // Switch to picture mode
    await page.locator('#btn-menu').click();
    await page.locator('#menu-btn-picture').click();
    await page.locator('#picture-btn-done').click();

    // Get a movable tile
    const movableTile = page.locator('.wood-tile.movable').first();
    await expect(movableTile).toBeVisible();

    const initialMoves = await page.locator('#hud-moves-val').textContent();
    await movableTile.click();

    const updatedMoves = await page.locator('#hud-moves-val').textContent();
    expect(Number(updatedMoves)).toBe(Number(initialMoves) + 1);

    // Undo should work in picture mode as well
    const undoBtn = page.locator('#btn-undo');
    await expect(undoBtn).toBeEnabled();
    await undoBtn.click();

    const revertedMoves = await page.locator('#hud-moves-val').textContent();
    expect(Number(revertedMoves)).toBe(Number(initialMoves));
  });
});
