import { test, expect } from '@playwright/test';

test.describe('Levels System & Free Play Mode Audit', () => {
  test('Level Select screen displays 30 levels, locks, and responsive columns', async ({ page }) => {
    // 1. Mobile viewport (iPhone SE 375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const openBtn = page.locator('#btn-level-select');
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    const modal = page.locator('.level-select-modal');
    await expect(modal).toBeVisible();

    // Check 30 level cards
    const cards = page.locator('.level-card');
    await expect(cards).toHaveCount(30);

    // Level 1 is unlocked, Level 2..30 are locked
    await expect(page.locator('.level-card[data-level-id="1"]')).toHaveClass(/unlocked/);
    await expect(page.locator('.level-card[data-level-id="2"]')).toHaveClass(/locked/);
    await expect(page.locator('.level-card[data-level-id="2"]')).toBeDisabled();
    await expect(page.locator('.level-card[data-level-id="30"]')).toHaveClass(/locked/);

    // Verify 5 columns on mobile phone
    const colCountMobile = await page.evaluate(() => {
      const grid = document.querySelector('.levels-grid')!;
      const style = window.getComputedStyle(grid);
      return style.gridTemplateColumns.split(' ').length;
    });
    expect(colCountMobile).toBe(5);

    // Save mobile screenshot
    await page.screenshot({ path: 'screenshots/level_select_mobile.png' });

    // 2. Desktop viewport (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(200);

    // Verify 10 columns on wide desktop
    const colCountDesktop = await page.evaluate(() => {
      const grid = document.querySelector('.levels-grid')!;
      const style = window.getComputedStyle(grid);
      return style.gridTemplateColumns.split(' ').length;
    });
    expect(colCountDesktop).toBe(10);

    // Save desktop screenshot
    await page.screenshot({ path: 'screenshots/level_select_desktop.png' });

    // Select Level 1 to play
    await page.locator('.level-card[data-level-id="1"]').click();
    await expect(modal).not.toBeVisible();
    await expect(page.locator('#hud-title')).toHaveText('Màn 1');
  });

  test('Sequential level progression: completing Level 1 unlocks Level 2 with stars', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    // Ensure we are on Level 1
    await expect(page.locator('#hud-title')).toHaveText('Màn 1');

    // Force victory for testing
    await page.evaluate(() => {
      window.__slidingPuzzleController?.forceSolvedStateForTesting();
    });

    const victoryModal = page.locator('.victory-modal-backdrop');
    await expect(victoryModal).toBeVisible();

    // Check stars rendered
    await expect(victoryModal.locator('.victory-stars-row')).toBeVisible();
    const earnedStars = victoryModal.locator('.v-star.earned');
    expect(await earnedStars.count()).toBeGreaterThanOrEqual(1);

    // Check celebratory new record badge is displayed
    await expect(victoryModal.locator('#modal-new-record-badge')).toBeVisible();
    await expect(victoryModal.locator('#modal-new-record-badge')).toContainText('KỶ LỤC MỚI');

    // Click "Màn tiếp theo" button
    const nextBtn = victoryModal.locator('#modal-btn-next');
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    await expect(victoryModal).not.toBeVisible();

    // Verify we transitioned to Level 2
    await expect(page.locator('#hud-title')).toHaveText('Màn 2');

    // Re-open level select and verify Level 1 has stars and Level 2 is unlocked
    await page.locator('#btn-level-select').click();
    await expect(page.locator('.level-select-modal')).toBeVisible();

    await expect(page.locator('.level-card[data-level-id="1"] .card-stars .star.filled')).toHaveCount(3);
    await expect(page.locator('.level-card[data-level-id="2"]')).toHaveClass(/unlocked/);
    await expect(page.locator('.level-card[data-level-id="2"]')).toBeEnabled();
    await expect(page.locator('.level-card[data-level-id="3"]')).toHaveClass(/locked/);

    await page.screenshot({ path: 'screenshots/level_unlocked_progression.png' });
  });

  test('Free Play Mode: 8x8 board on iPhone SE (375x667) and iPhone 15 (393x852)', async ({ page }) => {
    // 1. Test iPhone SE (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Switch to Free Play mode
    await page.locator('#btn-mode-toggle').click();
    const sizeGroup = page.locator('#size-selector-group');
    await expect(sizeGroup).toBeVisible();

    // Select 8x8 size
    const btn8 = page.locator('.size-btn[data-size="8"]');
    await expect(btn8).toBeVisible();
    await btn8.click();
    await page.waitForTimeout(300);

    // Verify 63 wood tiles rendered (values 1 to 63)
    const tiles8 = page.locator('.wood-tile');
    await expect(tiles8).toHaveCount(63);

    // Check 1: No horizontal scrollbar on iPhone SE
    const noHScrollSE = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(noHScrollSE, 'No horizontal scroll on iPhone SE 8x8').toBe(true);

    // Check 2: No text overflow on any tile numbers 1-63
    const textOverflowCountSE = await page.evaluate(() => {
      const numbers = Array.from(document.querySelectorAll('.tile-number'));
      let overflows = 0;
      for (const num of numbers) {
        if (num.scrollWidth > num.clientWidth + 2) {
          overflows++;
        }
      }
      return overflows;
    });
    expect(textOverflowCountSE, 'No tile number overflow on iPhone SE 8x8').toBe(0);

    // Check 3: Board fits fully within visible screen
    const boardBoundsSE = await page.locator('.wood-board-frame').boundingBox();
    expect(boardBoundsSE).not.toBeNull();
    expect(boardBoundsSE!.x).toBeGreaterThanOrEqual(0);
    expect(boardBoundsSE!.x + boardBoundsSE!.width).toBeLessThanOrEqual(375);

    // Save screenshot for iPhone SE 8x8
    await page.screenshot({ path: 'screenshots/freeplay_8x8_iphone_se.png' });

    // 2. Test iPhone 15 (393x852)
    await page.setViewportSize({ width: 393, height: 852 });
    await page.waitForTimeout(300);

    const noHScroll15 = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    expect(noHScroll15, 'No horizontal scroll on iPhone 15 8x8').toBe(true);

    // Check interaction on 8x8: click movable tile
    const movableTile = page.locator('.wood-tile.movable').first();
    await expect(movableTile).toBeVisible();
    await movableTile.click();
    await page.waitForTimeout(200);

    const movesText = await page.locator('#hud-moves-val').textContent();
    expect(movesText).toBe('1');

    // Save screenshot for iPhone 15 8x8
    await page.screenshot({ path: 'screenshots/freeplay_8x8_iphone_15.png' });

    // 3. Test victory on 8x8 Free Play
    await page.evaluate(() => {
      window.__slidingPuzzleController?.forceSolvedStateForTesting();
    });
    const victoryModal = page.locator('.victory-modal-backdrop');
    await expect(victoryModal).toBeVisible();
    await expect(victoryModal.locator('.victory-title')).toHaveText('HOÀN THÀNH BÀN 8×8!');
    await expect(victoryModal.locator('#modal-new-record-badge')).toBeVisible();

    await page.screenshot({ path: 'screenshots/freeplay_8x8_victory.png' });
  });

  test('Modal blocks keyboard inputs and preserves game state', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const initialMoves = await page.locator('#hud-moves-val').textContent();
    expect(initialMoves).toBe('0');

    // Open Level Select modal
    await page.locator('#btn-level-select').click();
    await expect(page.locator('.level-select-modal')).toBeVisible();

    // Send directional and action keystrokes while modal is active
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('w');
    await page.keyboard.press('z');
    await page.keyboard.press('r');

    // Dismiss modal with Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('.level-select-modal')).not.toBeVisible();

    // Verify moves counter remained 0 and status is still ready
    const afterMoves = await page.locator('#hud-moves-val').textContent();
    expect(afterMoves).toBe('0');
  });
});
