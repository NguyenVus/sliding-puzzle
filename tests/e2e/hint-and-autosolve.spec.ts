import { test, expect } from '@playwright/test';

test.describe('Hint & Auto-Solve Features (Phase 4 E2E Audit)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('Clicking Hint button highlights the recommended tile with pulsing glow', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    const hintBtn = page.locator('#btn-hint');
    await expect(hintBtn).toBeVisible();

    // Prior to hint, no tile has .hint-glow class
    await expect(page.locator('.wood-tile.hint-glow')).toHaveCount(0);

    // Click hint button
    await hintBtn.click();

    // Verify .hint-glow is present on one tile
    const glowingTile = page.locator('.wood-tile.hint-glow');
    await expect(glowingTile).toHaveCount(1);
    await expect(glowingTile).toBeVisible();

    // Screenshot of glowing hint tile
    await page.screenshot({ path: 'screenshots/hint_glow_highlight.png' });

    // Clicking the highlighted tile executes a move and clears the hint glow
    await glowingTile.click();
    await expect(page.locator('.wood-tile.hint-glow')).toHaveCount(0);
  });

  test('Pressing keyboard key "H" triggers hint highlight', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    await expect(page.locator('.wood-tile.hint-glow')).toHaveCount(0);

    // Press 'h'
    await page.keyboard.press('h');

    // Verify .hint-glow appears
    const glowingTile = page.locator('.wood-tile.hint-glow');
    await expect(glowingTile).toHaveCount(1);
    await expect(glowingTile).toBeVisible();
  });

  test('Using Hint penalizes star rating to maximum 1 star upon victory', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    // Ensure we are on Level 1 (campaign mode)
    await expect(page.locator('#hud-title')).toHaveText('Màn 1');

    // Click Hint button
    const hintBtn = page.locator('#btn-hint');
    await hintBtn.click();
    await expect(page.locator('.wood-tile.hint-glow')).toHaveCount(1);

    // Complete the level (under par moves and time)
    await page.evaluate(() => {
      window.__slidingPuzzleController?.forceSolvedStateForTesting();
    });

    const victoryModal = page.locator('.victory-modal-backdrop');
    await expect(victoryModal).toBeVisible();
    await page.waitForTimeout(300);

    // Verify exactly 1 star is earned (because hint was used)
    const earnedStars = victoryModal.locator('.v-star.earned');
    await expect(earnedStars).toHaveCount(1);

    // The other stars must NOT be earned
    const totalStars = victoryModal.locator('.v-star');
    await expect(totalStars).toHaveCount(3);

    // Take screenshot of victory modal with 1-star penalty
    await page.screenshot({ path: 'screenshots/victory_hint_1star_penalty.png' });
  });

  test('Auto-solve button starts solving and can be stopped', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    // Switch to Free Play 4x4 for a deep scramble
    const modeBtn = page.locator('#btn-mode-toggle');
    await modeBtn.click();
    await expect(page.locator('#hud-title')).toContainText('Tự Do');

    const solveBtn = page.locator('#btn-solve');
    await expect(solveBtn).toBeVisible();

    // Click auto-solve button
    await solveBtn.click();

    // Button should enter active solving state (displaying "Dừng")
    await expect(solveBtn).toHaveClass(/btn-active-solving/);
    await expect(page.locator('#btn-solve-text')).toHaveText('Dừng');

    // Wait a short moment for moves to animate
    await page.waitForTimeout(400);

    // Click to stop
    await solveBtn.click();
    await expect(solveBtn).not.toHaveClass(/btn-active-solving/);
    await expect(page.locator('#btn-solve-text')).toHaveText('Tự giải');
  });

  test('Auto-solve completes Level 1 automatically and triggers victory with 1 star', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    const solveBtn = page.locator('#btn-solve');
    await solveBtn.click();

    // Level 1 has 10 scramble steps, finishes within ~5 seconds
    const victoryModal = page.locator('.victory-modal-backdrop');
    await expect(victoryModal).toBeVisible({ timeout: 10000 });

    // Auto-solve counts as assistance -> max 1 star
    const earnedStars = victoryModal.locator('.v-star.earned');
    await expect(earnedStars).toHaveCount(1);
  });
});
