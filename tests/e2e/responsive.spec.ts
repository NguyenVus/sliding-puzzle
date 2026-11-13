import { test, expect } from '@playwright/test';

const testDevices = [
  { name: 'iPhone SE (Portrait)', id: 'iphone-se_portrait', width: 375, height: 667, isLandscape: false, type: 'phone' },
  { name: 'iPhone SE (Landscape)', id: 'iphone-se_landscape', width: 667, height: 375, isLandscape: true, type: 'phone' },
  { name: 'iPhone 15 (Portrait)', id: 'iphone-15_portrait', width: 393, height: 852, isLandscape: false, type: 'phone' },
  { name: 'iPhone 15 (Landscape)', id: 'iphone-15_landscape', width: 852, height: 393, isLandscape: true, type: 'phone' },
  { name: 'iPad mini (Portrait)', id: 'ipad-mini_portrait', width: 744, height: 1133, isLandscape: false, type: 'tablet' },
  { name: 'iPad mini (Landscape)', id: 'ipad-mini_landscape', width: 1133, height: 744, isLandscape: true, type: 'tablet' },
  { name: 'iPad Air (Portrait)', id: 'ipad-air_portrait', width: 820, height: 1180, isLandscape: false, type: 'tablet' },
  { name: 'iPad Air (Landscape)', id: 'ipad-air_landscape', width: 1180, height: 820, isLandscape: true, type: 'tablet' },
  { name: 'iPad Pro (Portrait)', id: 'ipad-pro_portrait', width: 1024, height: 1366, isLandscape: false, type: 'tablet' },
  { name: 'iPad Pro (Landscape)', id: 'ipad-pro_landscape', width: 1366, height: 1024, isLandscape: true, type: 'tablet' },
  { name: 'Desktop (Portrait 900x1440)', id: 'desktop_portrait', width: 900, height: 1440, isLandscape: false, type: 'desktop' },
  { name: 'Desktop (Landscape 1440x900)', id: 'desktop_landscape', width: 1440, height: 900, isLandscape: true, type: 'desktop' },
];

test.describe('Responsive Layout & Interaction Audit', () => {
  for (const dev of testDevices) {
    test(`verifies layout on ${dev.name}`, async ({ page }) => {
      await page.setViewportSize({ width: dev.width, height: dev.height });
      await page.goto('/');

      // Wait for board to render
      await expect(page.locator('.wood-board-frame')).toBeVisible();

      // Check 1: No horizontal scrollbar
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll, `Horizontal scrollbar detected on ${dev.name}`).toBe(false);

      // Check 2: All buttons meet minimum 44x44px touch target
      const smallButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons
          .filter((b) => {
            const r = b.getBoundingClientRect();
            return r.width > 0 && r.height > 0 && (r.width < 43.5 || r.height < 43.5);
          })
          .map((b) => b.innerText.trim() || b.getAttribute('aria-label') || 'unnamed');
      });
      expect(smallButtons, `Touch targets under 44x44px found on ${dev.name}`).toHaveLength(0);

      // Check 3: No text overflow on HUD labels and buttons
      const textOverflowViolations = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('.game-title, .stat-card, .btn'));
        const overflowed: string[] = [];
        for (const el of elements) {
          if (el.scrollWidth > el.clientWidth + 2) {
            overflowed.push(el.textContent?.trim() || 'unnamed');
          }
        }
        return overflowed;
      });
      expect(textOverflowViolations, `Text overflow detected on ${dev.name}`).toHaveLength(0);

      // Check 4: Board and controls position in landscape
      // On phone and tablet landscape, board must be on the left and info/controls on the right
      if (dev.isLandscape && dev.type !== 'desktop') {
        const layoutAlignment = await page.evaluate(() => {
          const board = document.querySelector('.board-area')!.getBoundingClientRect();
          const top = document.querySelector('.hud-top')!.getBoundingClientRect();
          const bottom = document.querySelector('.hud-bottom')!.getBoundingClientRect();
          return {
            boardX: board.x,
            topX: top.x,
            bottomX: bottom.x,
            boardRight: board.right,
          };
        });
        expect(
          layoutAlignment.boardX < layoutAlignment.topX,
          `In landscape, board should be on the left of info panel on ${dev.name}`
        ).toBe(true);
        expect(
          layoutAlignment.boardX < layoutAlignment.bottomX,
          `In landscape, board should be on the left of controls on ${dev.name}`
        ).toBe(true);
      }

      // Check 5: Save standard viewport screenshot
      const shotPath = `screenshots/${dev.id}_${dev.width}x${dev.height}.png`;
      await page.screenshot({ path: shotPath });

      // Check 6: Interactivity - Click movable tile slides and increments moves
      const movableTile = page.locator('.wood-tile.movable').first();
      await expect(movableTile).toBeVisible();
      await movableTile.click();
      await page.waitForTimeout(150); // wait for 120ms animation

      const movesVal = await page.locator('#hud-moves-val').textContent();
      expect(movesVal).toBe('1');

      // Check 7: Undo button is enabled after move and restores state
      const undoBtn = page.locator('#btn-undo');
      await expect(undoBtn).toBeEnabled();
      await undoBtn.click();
      await page.waitForTimeout(150);

      const movesAfterUndo = await page.locator('#hud-moves-val').textContent();
      expect(movesAfterUndo).toBe('0');

      // Check 8: Victory celebration modal on representative devices
      if (dev.id === 'iphone-15_portrait' || dev.id === 'desktop_landscape') {
        await page.evaluate(() => {
          window.__slidingPuzzleController?.forceSolvedStateForTesting();
        });
        await page.waitForSelector('.victory-modal-backdrop');
        await page.waitForTimeout(300);

        const victoryPath = `screenshots/${dev.id}_victory.png`;
        await page.screenshot({ path: victoryPath });
      }

      // Check 9: Free Play mode HUD button dimensions and no-overflow audit
      await page.goto('/');
      await page.click('#btn-mode-toggle');
      await page.waitForSelector('#size-selector-group');

      const freePlayAudit = await page.evaluate(() => {
        const checkEqual = (selector: string) => {
          const els = Array.from(document.querySelectorAll<HTMLElement>(selector));
          if (els.length <= 1) return { equalWidth: true, equalHeight: true };
          const rects = els.map((e) => e.getBoundingClientRect());
          const widths = rects.map((r) => r.width);
          const heights = rects.map((r) => r.height);
          const maxW = Math.max(...widths), minW = Math.min(...widths);
          const maxH = Math.max(...heights), minH = Math.min(...heights);
          return {
            equalWidth: maxW - minW < 1.0, // allow 1px subpixel variation across fractional grid columns
            equalHeight: maxH - minH < 0.5,
          };
        };

        const overflowed: string[] = [];
        const buttons = Array.from(document.querySelectorAll<HTMLElement>('.btn'));
        for (const btn of buttons) {
          if (btn.scrollWidth > btn.clientWidth + 1) {
            overflowed.push(btn.textContent?.trim() || 'btn');
          }
        }

        return {
          actions: checkEqual('.action-btn'),
          sizes: checkEqual('.size-btn'),
          navs: checkEqual('.nav-btn'),
          overflowed,
        };
      });

      expect(freePlayAudit.overflowed, `Text overflow in Free Play on ${dev.name}`).toHaveLength(0);
      expect(freePlayAudit.actions.equalHeight, `Action buttons height mismatch on ${dev.name}`).toBe(true);
      if (!dev.isLandscape || dev.type === 'desktop') {
        expect(freePlayAudit.actions.equalWidth, `Action buttons width mismatch on ${dev.name}`).toBe(true);
      }
      expect(freePlayAudit.sizes.equalHeight, `Size buttons height mismatch on ${dev.name}`).toBe(true);
      expect(freePlayAudit.sizes.equalWidth, `Size buttons width mismatch on ${dev.name}`).toBe(true);
      expect(freePlayAudit.navs.equalHeight, `Nav buttons height mismatch on ${dev.name}`).toBe(true);
      expect(freePlayAudit.navs.equalWidth, `Nav buttons width mismatch on ${dev.name}`).toBe(true);
    });
  }
});
