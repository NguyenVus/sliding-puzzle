import { test, expect } from '@playwright/test';

test.describe('Main Menu, Settings, and Themes E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.wood-board-frame');
  });

  test('opens Main Menu and navigates to How-to-Play guide', async ({ page }) => {
    // 1. Click Menu button on Top HUD
    const menuBtn = page.locator('#btn-menu');
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // 2. Main Menu modal should be visible
    const menuModal = page.locator('.main-menu-card');
    await expect(menuModal).toBeVisible();
    await expect(menuModal).toContainText('Chơi theo màn');
    await expect(menuModal).toContainText('Chơi tự do');
    await expect(menuModal).toContainText('Chế độ ghép ảnh');
    await expect(menuModal).toContainText('Cài đặt');
    await expect(menuModal).toContainText('Hướng dẫn luật chơi');

    // Trophy icon in "Chơi theo màn" must NOT be white (#ffffff) on light cream button
    const trophyIcon = page.locator('#menu-btn-campaign .menu-item-icon .game-icon');
    await expect(trophyIcon).toBeVisible();
    const trophyColor = await trophyIcon.evaluate((el) => window.getComputedStyle(el).color);
    expect(trophyColor).not.toBe('rgb(255, 255, 255)');
    expect(trophyColor).toBe('rgb(61, 21, 4)'); // Matches theme text #3d1504

    // 3. Click How-To-Play
    await page.locator('#menu-btn-howtoplay').click();
    await expect(menuModal).not.toBeVisible();

    // 4. How-To-Play modal should open
    const guideModal = page.locator('.howtoplay-modal-card');
    await expect(guideModal).toBeVisible();
    await expect(guideModal).toContainText('Mục Tiêu Trò Chơi');
    await expect(guideModal).toContainText('Quy Tắc Tính Sao');
    await expect(guideModal).toContainText('Phím Tắt Tiện Lợi');

    // Close guide
    await page.locator('#howtoplay-btn-done').click();
    await expect(guideModal).not.toBeVisible();
  });

  test('toggles themes across all 5 luxury board themes', async ({ page }) => {
    // Default theme should be wood-light
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'wood-light');

    // Open Settings via top HUD button
    const settingsBtn = page.locator('#btn-settings');
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();

    const settingsModal = page.locator('.settings-modal-card');
    await expect(settingsModal).toBeVisible();

    // 1. Switch to Dark Walnut
    const darkBtn = page.locator('#theme-btn-dark');
    await darkBtn.click();
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'wood-dark');
    await expect(darkBtn).toHaveClass(/active/);

    // 2. Switch to Marble & Gold
    const marbleBtn = page.locator('#theme-btn-marble');
    await marbleBtn.click();
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'marble-gold');
    await expect(marbleBtn).toHaveClass(/active/);

    // 3. Switch to Tatami & Sakura
    const tatamiBtn = page.locator('#theme-btn-tatami');
    await tatamiBtn.click();
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'tatami-sakura');
    await expect(tatamiBtn).toHaveClass(/active/);

    // 4. Switch to Neon Cyberpunk
    const neonBtn = page.locator('#theme-btn-neon');
    await neonBtn.click();
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'neon-cyberpunk');
    await expect(neonBtn).toHaveClass(/active/);

    // 5. Switch back to Light Wood
    const lightBtn = page.locator('#theme-btn-light');
    await lightBtn.click();
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'wood-light');
    await expect(lightBtn).toHaveClass(/active/);

    // Close settings
    await page.locator('#settings-btn-done').click();
    await expect(settingsModal).not.toBeVisible();
  });

  test('toggles haptic feedback in Settings', async ({ page }) => {
    await page.locator('#btn-settings').click();
    const hapticToggle = page.locator('#setting-toggle-haptic');
    const hapticIcon = page.locator('#haptic-status-icon');

    // Initially checked
    await expect(hapticToggle).toBeChecked();
    await expect(hapticIcon).toHaveText('📳');

    // Uncheck haptic feedback
    await hapticToggle.uncheck();
    await expect(hapticToggle).not.toBeChecked();
    await expect(hapticIcon).toHaveText('📴');

    // Re-check haptic feedback
    await hapticToggle.check();
    await expect(hapticToggle).toBeChecked();
    await expect(hapticIcon).toHaveText('📳');

    await page.locator('#settings-btn-done').click();
  });

  test('toggles sound on Top HUD and in Settings', async ({ page }) => {
    const hudSoundBtn = page.locator('#btn-sound-toggle');
    const hudSoundIcon = page.locator('#btn-sound-icon');

    // Initially unmuted
    await expect(hudSoundIcon).toHaveText('🔊');

    // 1. Toggle via HUD
    await hudSoundBtn.click();
    await expect(hudSoundIcon).toHaveText('🔇');

    // 2. Open Settings and verify toggle switch is unchecked
    await page.locator('#btn-settings').click();
    const soundToggle = page.locator('#setting-toggle-sound');
    await expect(soundToggle).not.toBeChecked();

    // Re-enable sound inside Settings
    await soundToggle.check();
    await page.locator('#settings-btn-done').click();

    // HUD icon should reflect unmuted state
    await expect(hudSoundIcon).toHaveText('🔊');
  });

  test('toggles animations in Settings', async ({ page }) => {
    await page.locator('#btn-settings').click();
    const animToggle = page.locator('#setting-toggle-anim');

    // Uncheck animations
    await animToggle.uncheck();
    await expect(page.locator('body')).toHaveAttribute('data-animations', 'false');

    // Re-check animations
    await animToggle.check();
    await expect(page.locator('body')).toHaveAttribute('data-animations', 'true');

    await page.locator('#settings-btn-done').click();
  });

  test('toggles picture mode in Settings', async ({ page }) => {
    await page.locator('#btn-settings').click();
    const picModeToggle = page.locator('#setting-toggle-pic-mode');

    // Initially unchecked
    await expect(picModeToggle).not.toBeChecked();

    // Turn picture mode on
    await picModeToggle.check();
    await page.locator('#settings-btn-done').click();

    // Board tiles should now be picture tiles
    await expect(page.locator('.wood-tile').first()).toHaveClass(/is-picture-tile/);

    // Re-open settings and turn off
    await page.locator('#btn-settings').click();
    await picModeToggle.uncheck();
    await page.locator('#settings-btn-done').click();

    // Tiles should return to classic
    await expect(page.locator('.wood-tile').first()).not.toHaveClass(/is-picture-tile/);
  });
});
