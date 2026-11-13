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

  test('switches back from Picture Mode to Classic Number Mode', async ({ page }) => {
    // 1. Enable picture mode
    await page.locator('#btn-menu').click();
    await page.locator('#menu-btn-picture').click();
    await page.locator('#picture-btn-done').click();

    // Verify picture mode active
    await expect(page.locator('.wood-tile').first()).toHaveClass(/is-picture-tile/);

    // 2. Open picture modal and click "Trở về xếp số cổ điển"
    await page.locator('#btn-menu').click();
    await page.locator('#menu-btn-picture').click();
    const disableBtn = page.locator('#picture-btn-disable-mode');
    await expect(disableBtn).toBeVisible();
    await disableBtn.click();

    // 3. Board tiles must return to classic number style
    await expect(page.locator('.wood-tile').first()).not.toHaveClass(/is-picture-tile/);
    await expect(page.locator('#btn-preview-picture')).not.toBeVisible();
  });

  test('uploads custom image and preserves it upon clicking done', async ({ page }) => {
    await page.locator('#btn-menu').click();
    await page.locator('#menu-btn-picture').click();

    // Upload a custom SVG image via the file input
    const fileInput = page.locator('#custom-image-file-input');
    await fileInput.setInputFiles('tests/fixtures/sample.svg');

    // Wait for preview image to update
    const previewImg = page.locator('#main-preview-img');
    await expect(previewImg).toHaveAttribute('src', /data:image\/svg\+xml/);

    // Click "Áp Dụng & Chơi Ngay"
    await page.locator('#picture-btn-done').click();
    await expect(page.locator('.picture-modal-card')).not.toBeVisible();

    // Verify first tile has the custom uploaded image, NOT fuji preset
    const firstTile = page.locator('.wood-tile.is-picture-tile').first();
    await expect(firstTile).toBeVisible();
    const bgStyle = await firstTile.evaluate((el) => el.style.backgroundImage);
    expect(bgStyle).toContain('data:image/svg+xml');
  });

  test('filters presets by category and selects diverse themes (Animals, Space, Art)', async ({ page }) => {
    // Open Main Menu -> Picture Mode
    await page.locator('#btn-menu').click();
    await page.locator('#menu-btn-picture').click();

    const picModal = page.locator('.picture-modal-card');
    await expect(picModal).toBeVisible();

    // Verify all 10 preset cards are present
    const presetCards = page.locator('.preset-choice-card');
    await expect(presetCards).toHaveCount(10);

    // 1. Filter by Animals
    const animalsTab = page.locator('.category-tab-btn[data-category="animals"]');
    await expect(animalsTab).toBeVisible();
    await animalsTab.click();
    await expect(animalsTab).toHaveClass(/active/);

    const catCard = page.locator('[data-preset-id="preset-cat"]');
    const spaceCard = page.locator('[data-preset-id="preset-astronaut"]');
    await expect(catCard).toBeVisible();
    await expect(spaceCard).not.toBeVisible();

    // 2. Filter by Space
    const spaceTab = page.locator('.category-tab-btn[data-category="space"]');
    await spaceTab.click();
    await expect(spaceCard).toBeVisible();
    await expect(catCard).not.toBeVisible();

    // Select Astronaut preset
    await spaceCard.click();
    await expect(spaceCard).toHaveClass(/active/);

    // 3. Filter by Art
    const artTab = page.locator('.category-tab-btn[data-category="art"]');
    await artTab.click();
    const starryCard = page.locator('[data-preset-id="preset-starry"]');
    await expect(starryCard).toBeVisible();

    // Select Starry Night preset
    await starryCard.click();
    await expect(starryCard).toHaveClass(/active/);

    // Click Apply
    await page.locator('#picture-btn-done').click();
    await expect(picModal).not.toBeVisible();

    // Verify board is in picture mode with active Starry Night preset
    const firstTile = page.locator('.wood-tile.is-picture-tile').first();
    await expect(firstTile).toBeVisible();
  });
});
