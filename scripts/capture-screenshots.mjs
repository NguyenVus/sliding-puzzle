import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const screenshotsDir = path.resolve(rootDir, 'screenshots');

const devices = [
  { name: 'iPhone-SE', portrait: { width: 375, height: 667 }, landscape: { width: 667, height: 375 } },
  { name: 'iPhone-15', portrait: { width: 393, height: 852 }, landscape: { width: 852, height: 393 } },
  { name: 'iPad-mini', portrait: { width: 744, height: 1133 }, landscape: { width: 1133, height: 744 } },
  { name: 'iPad-Air', portrait: { width: 820, height: 1180 }, landscape: { width: 1180, height: 820 } },
  { name: 'iPad-Pro', portrait: { width: 1024, height: 1366 }, landscape: { width: 1366, height: 1024 } },
  { name: 'Desktop', portrait: { width: 900, height: 1440 }, landscape: { width: 1440, height: 900 } },
];

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

async function startServer() {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const npmCmd = isWindows ? 'npm.cmd' : 'npm';
    const server = spawn(npmCmd, ['run', 'preview', '--', '--port', '4173'], {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    let started = false;
    server.stdout.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('4173') || msg.includes('http://localhost:')) {
        if (!started) {
          started = true;
          resolve(server);
        }
      }
    });

    server.stderr.on('data', (data) => {
      console.error('[server err]', data.toString());
    });

    server.on('error', reject);

    setTimeout(() => {
      if (!started) {
        started = true;
        resolve(server);
      }
    }, 3500);
  });
}

async function run() {
  console.log('🚀 Starting responsive audit and screenshot capture...');
  await ensureDir(screenshotsDir);

  const server = await startServer();
  console.log('🌐 Local preview server running on port 4173');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const errors = [];
  let capturedCount = 0;

  try {
    for (const dev of devices) {
      for (const orientation of ['portrait', 'landscape']) {
        const vp = dev[orientation];
        const page = await browser.newPage({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 2, // Retina display
        });

        await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
        await page.waitForSelector('.wood-board-frame');
        await page.waitForTimeout(300);

        // 1. Verify No Horizontal Scrollbar
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        if (hasHorizontalScroll) {
          const errMsg = `[FAIL] Horizontal scrollbar detected on ${dev.name} (${orientation}: ${vp.width}x${vp.height})`;
          console.error(errMsg);
          errors.push(errMsg);
        } else {
          console.log(`✓ [Scroll Check] ${dev.name} ${orientation} (${vp.width}x${vp.height}): No horizontal scrollbar`);
        }

        // 2. Verify Touch Targets >= 44x44px for buttons
        const buttonViolations = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const violations = [];
          for (const btn of buttons) {
            const rect = btn.getBoundingClientRect();
            // Ignore hidden or 0x0 buttons
            if (rect.width === 0 && rect.height === 0) continue;
            // Allow slight subpixel leeway of 0.5px
            if (rect.width < 43.5 || rect.height < 43.5) {
              violations.push({
                text: btn.innerText.trim() || btn.getAttribute('aria-label') || 'unnamed',
                width: rect.width,
                height: rect.height,
              });
            }
          }
          return violations;
        });

        if (buttonViolations.length > 0) {
          const errMsg = `[FAIL] Touch target < 44x44 on ${dev.name} (${orientation}): ${JSON.stringify(buttonViolations)}`;
          console.error(errMsg);
          errors.push(errMsg);
        } else {
          console.log(`✓ [Touch Target Check] ${dev.name} ${orientation}: All buttons >= 44x44px`);
        }

        // 3. Verify No Text Overflow
        const textOverflowViolations = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('.game-title, .stat-card, .btn'));
          const overflowed = [];
          for (const el of elements) {
            if (el.scrollWidth > el.clientWidth + 2) {
              overflowed.push({
                text: el.textContent?.trim(),
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
              });
            }
          }
          return overflowed;
        });

        if (textOverflowViolations.length > 0) {
          const errMsg = `[FAIL] Text overflow detected on ${dev.name} (${orientation}): ${JSON.stringify(textOverflowViolations)}`;
          console.error(errMsg);
          errors.push(errMsg);
        } else {
          console.log(`✓ [Text Overflow Check] ${dev.name} ${orientation}: No text overflow`);
        }

        // 3b. Verify Landscape Side Panel Alignment (Board on left, info/controls on right)
        if (orientation === 'landscape' && dev.name !== 'Desktop') {
          const alignment = await page.evaluate(() => {
            const board = document.querySelector('.board-area')?.getBoundingClientRect();
            const top = document.querySelector('.hud-top')?.getBoundingClientRect();
            const bottom = document.querySelector('.hud-bottom')?.getBoundingClientRect();
            if (!board || !top || !bottom) return { ok: false };
            return {
              ok: board.x < top.x && board.x < bottom.x,
              boardX: board.x,
              topX: top.x,
              bottomX: bottom.x
            };
          });
          if (!alignment.ok) {
            const errMsg = `[FAIL] Board not on left in landscape on ${dev.name}: ${JSON.stringify(alignment)}`;
            console.error(errMsg);
            errors.push(errMsg);
          } else {
            console.log(`✓ [Landscape Alignment Check] ${dev.name}: Board on left, side panel on right`);
          }
        }

        // 4. Capture standard screenshot
        const screenshotPath = path.join(
          screenshotsDir,
          `${dev.name.toLowerCase()}_${orientation}_${vp.width}x${vp.height}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: false });
        capturedCount++;
        console.log(`📸 Saved screenshot: ${path.basename(screenshotPath)}`);

        // 5. Test interaction: click movable tile
        const movableTile = page.locator('.wood-tile.movable').first();
        if (await movableTile.count()) {
          await movableTile.click();
          await page.waitForTimeout(150); // wait for 120ms slide transition
          const movesText = await page.locator('#hud-moves-val').textContent();
          if (movesText !== '1') {
            errors.push(`[FAIL] Move click failed to increment move count on ${dev.name}`);
          }
        }

        // 6. Capture victory celebration on iPhone 15 & Desktop
        if ((dev.name === 'iPhone-15' && orientation === 'portrait') || (dev.name === 'Desktop' && orientation === 'landscape')) {
          await page.evaluate(() => {
            window.__slidingPuzzleController?.forceSolvedStateForTesting();
          });
          await page.waitForSelector('.victory-modal-backdrop');
          await page.waitForTimeout(400); // confetti burst

          const victoryPath = path.join(
            screenshotsDir,
            `${dev.name.toLowerCase()}_${orientation}_victory.png`
          );
          await page.screenshot({ path: victoryPath, fullPage: false });
          capturedCount++;
          console.log(`🎉 Saved victory screenshot: ${path.basename(victoryPath)}`);
        }

        await page.close();
      }
    }

    // Capture Dedicated Level Select & Free Play 8x8 screenshots
    console.log('\n🎮 Capturing Level Select and 8x8 Free Play screenshots...');
    const extraPage = await browser.newPage({
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 2,
    });

    await extraPage.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await extraPage.waitForSelector('.wood-board-frame');

    // 1. Level select mobile
    await extraPage.click('#btn-level-select');
    await extraPage.waitForSelector('.level-select-modal');
    const lvlMobilePath = path.join(screenshotsDir, 'level_select_mobile.png');
    await extraPage.screenshot({ path: lvlMobilePath });
    capturedCount++;
    console.log(`📸 Saved screenshot: ${path.basename(lvlMobilePath)}`);

    // 2. Level select desktop
    await extraPage.setViewportSize({ width: 1440, height: 900 });
    await extraPage.waitForTimeout(200);
    const lvlDeskPath = path.join(screenshotsDir, 'level_select_desktop.png');
    await extraPage.screenshot({ path: lvlDeskPath });
    capturedCount++;
    console.log(`📸 Saved screenshot: ${path.basename(lvlDeskPath)}`);

    // 3. Free Play 8x8 iPhone SE
    await extraPage.setViewportSize({ width: 375, height: 667 });
    await extraPage.click('#btn-close-levels');
    await extraPage.click('#btn-mode-toggle');
    await extraPage.waitForSelector('#size-selector-group');
    await extraPage.click('.size-btn[data-size="8"]');
    await extraPage.waitForTimeout(300);
    const free8SEPath = path.join(screenshotsDir, 'freeplay_8x8_iphone_se.png');
    await extraPage.screenshot({ path: free8SEPath });
    capturedCount++;
    console.log(`📸 Saved screenshot: ${path.basename(free8SEPath)}`);

    // Capture HUD close-up on iPhone SE (Freeplay)
    const hudSE = extraPage.locator('.hud-bottom');
    const hudSEPath = path.join(screenshotsDir, 'hud_bottom_iphone_se_freeplay.png');
    await hudSE.screenshot({ path: hudSEPath });
    capturedCount++;
    console.log(`📸 Saved screenshot: ${path.basename(hudSEPath)}`);

    // 4. Free Play 8x8 iPhone 15
    await extraPage.setViewportSize({ width: 393, height: 852 });
    await extraPage.waitForTimeout(200);
    const free815Path = path.join(screenshotsDir, 'freeplay_8x8_iphone_15.png');
    await extraPage.screenshot({ path: free815Path });
    capturedCount++;
    console.log(`📸 Saved screenshot: ${path.basename(free815Path)}`);

    // Capture HUD close-up on iPhone 15 (Campaign)
    await extraPage.click('#btn-mode-toggle');
    await extraPage.waitForTimeout(200);
    const hud15 = extraPage.locator('.hud-bottom');
    const hud15Path = path.join(screenshotsDir, 'hud_bottom_iphone_15_campaign.png');
    await hud15.screenshot({ path: hud15Path });
    capturedCount++;
    console.log(`📸 Saved screenshot: ${path.basename(hud15Path)}`);
    await extraPage.click('#btn-mode-toggle'); // Switch back to Freeplay for victory
    await extraPage.waitForTimeout(200);

    // 5. Free Play 8x8 victory
    await extraPage.evaluate(() => {
      window.__slidingPuzzleController?.forceSolvedStateForTesting();
    });
    await extraPage.waitForSelector('.victory-modal-backdrop');
    await extraPage.waitForTimeout(300);
    const free8VicPath = path.join(screenshotsDir, 'freeplay_8x8_victory.png');
    await extraPage.screenshot({ path: free8VicPath });
    capturedCount++;
    console.log(`🎉 Saved screenshot: ${path.basename(free8VicPath)}`);

    await extraPage.close();

    // 6. Phase 5 New Features Screenshots (Menu, Settings, Themes, Picture Mode)
    console.log('\n🎨 Capturing Phase 5 features (Menu, Settings, Themes, Picture Mode)...');
    const p5Page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    await p5Page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await p5Page.waitForSelector('.wood-board-frame');

    // 6a. Main Menu Modal
    await p5Page.click('#btn-menu');
    await p5Page.waitForSelector('.main-menu-card');
    const menuPath = path.join(screenshotsDir, 'main_menu_modal.png');
    await p5Page.screenshot({ path: menuPath });
    capturedCount++;
    console.log(`📸 Saved screenshot: ${path.basename(menuPath)}`);

    // 6b. How-To-Play Guide Modal
    await p5Page.click('#menu-btn-howtoplay');
    await p5Page.waitForSelector('.howtoplay-modal-card');
    const howToPlayPath = path.join(screenshotsDir, 'how_to_play_modal.png');
    await p5Page.screenshot({ path: howToPlayPath });
    capturedCount++;
    console.log(`📸 Saved screenshot: ${path.basename(howToPlayPath)}`);
    await p5Page.click('#howtoplay-btn-done');

    // 6c. Settings Modal
    await p5Page.click('#btn-settings');
    await p5Page.waitForSelector('.settings-modal-card');
    const settingsPath = path.join(screenshotsDir, 'settings_modal.png');
    await p5Page.screenshot({ path: settingsPath });
    capturedCount++;
    console.log(`📸 Saved screenshot: ${path.basename(settingsPath)}`);

    // 6d. Switch to Dark Walnut Theme
    await p5Page.click('#theme-btn-dark');
    await p5Page.waitForTimeout(100);
    await p5Page.click('#settings-btn-done');
    await p5Page.waitForTimeout(200);
    const darkWalnutPath = path.join(screenshotsDir, 'theme_dark_walnut_desktop.png');
    await p5Page.screenshot({ path: darkWalnutPath });
    capturedCount++;
    console.log(`📸 Saved screenshot: ${path.basename(darkWalnutPath)}`);

    // 6e. Switch to Picture Puzzle Mode (Rừng thông preset)
    await p5Page.click('#btn-menu');
    await p5Page.waitForSelector('.main-menu-card');
    await p5Page.click('#menu-btn-picture');
    await p5Page.waitForSelector('.picture-modal-card');
    await p5Page.click('[data-preset-id="preset-pine"]');
    await p5Page.click('#picture-btn-done');
    await p5Page.waitForTimeout(300);
    const pictureModePath = path.join(screenshotsDir, 'picture_mode_gameplay.png');
    await p5Page.screenshot({ path: pictureModePath });
    capturedCount++;
    console.log(`📸 Saved screenshot: ${path.basename(pictureModePath)}`);

    // 6f. Picture Mode "Xem ảnh gốc" Preview
    await p5Page.click('#btn-preview-picture');
    await p5Page.waitForSelector('.picture-modal-card');
    await p5Page.waitForTimeout(200);
    const picturePreviewPath = path.join(screenshotsDir, 'picture_mode_preview.png');
    await p5Page.screenshot({ path: picturePreviewPath });
    capturedCount++;
    console.log(`📸 Saved screenshot: ${path.basename(picturePreviewPath)}`);
    await p5Page.click('#picture-btn-done');

    await p5Page.close();
  } finally {
    await browser.close();
    server.kill();
  }

  console.log('\n==========================================');
  console.log(`Total screenshots captured: ${capturedCount}`);
  if (errors.length === 0) {
    console.log('✅ ALL RESPONSIVE & PLAYWRIGHT CHECKS PASSED 100%!');
    process.exit(0);
  } else {
    console.error(`❌ ${errors.length} checks failed:`);
    errors.forEach((err) => console.error('  -', err));
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
