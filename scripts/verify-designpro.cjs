const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH || 'C:/Users/Quoc Huy/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const url = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    fs.mkdirSync('.preview', { recursive: true });
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
      const title = page.locator('#hero-title');
      assert.ok(await title.isVisible());
      const text = await page.locator('.shiny-text').boundingBox();
      assert.ok(text.x >= 0 && text.x + text.width <= width, `Heading outside viewport at ${width}`);
      assert.ok(await page.locator('.shiny-text').evaluate(el => el.clientHeight < parseFloat(getComputedStyle(el).fontSize) * 1.3), `Product Leader must stay on one line at ${width}`);
      await page.screenshot({ path: `.preview/designpro-${width}.png` });
    }
    assert.ok(await page.locator('video').evaluate(v => v.autoplay && v.loop && v.muted && v.playsInline));
    await page.getByRole('button', { name: 'Apply for Next Enrollment' }).click();
    assert.ok(await page.getByRole('dialog').isVisible());
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: 'Courses' }).click();
    assert.ok(await page.getByRole('dialog').isVisible());
    await page.getByRole('button', { name: 'Close dialog' }).click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('video').paused);
    await page.screenshot({ path: '.preview/designpro-reduced-motion.png' });
    const videoState = await page.locator('video').evaluate(v => ({ readyState: v.readyState, error: v.error?.message || null, source: v.currentSrc }));
    await page.goto(`${url}/index_hub.html`);
    const lessonHref = await page.locator('a.pc-open').first().getAttribute('href');
    assert.ok(lessonHref.startsWith('parts/'));
    await page.locator('a.pc-open').first().click();
    assert.ok(page.url().includes('/parts/'));
    assert.ok(await page.locator('link[href="../assets/lingoreach.css"]').count());
    assert.deepEqual(errors, []);
    console.log('PASS: 320/390/768/1024/1440 layout, mobile navigation, enrollment dialog, reduced motion, video attributes, production lesson links; no JS errors.');
    console.log('Video:', JSON.stringify(videoState));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
