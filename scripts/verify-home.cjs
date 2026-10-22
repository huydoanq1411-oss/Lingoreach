const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH || 'C:/Users/Quoc Huy/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const url = process.env.PREVIEW_URL || 'http://127.0.0.1:5173';
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${url}/index.html`, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('.part-card').count(), 41);
    assert.ok(await page.locator('h1').innerText().then(text => text.includes('Tài Liệu Tiếng Anh')));
    fs.mkdirSync('.preview/unified', { recursive: true });
    for (const size of [{width:320,height:900},{width:390,height:844},{width:768,height:900},{width:1440,height:900},{width:844,height:390}]) {
      await page.setViewportSize(size);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow: ${size.width}`);
      await page.screenshot({ path: `.preview/unified/home-${size.width}.png` });
    }
    await page.locator('#searchInput').fill('zzzz-no-lesson');
    assert.equal(await page.locator('.part-card:not(.hidden)').count(), 0);
    await page.locator('#searchInput').fill('');
    await page.locator('.filter-chip[data-filter="tool"]').click();
    assert.equal(await page.locator('.part-card:not(.hidden):not([data-cat="tool"])').count(), 0);
    await page.locator('.filter-chip[data-filter="all"]').click();
    await page.locator('.pc-check').first().click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('.pc-check').first().getAttribute('aria-pressed'), 'true');
    assert.ok(await page.locator('video').evaluate(v => v.paused && v.loop && v.muted && v.playsInline));
    await page.locator('a.pc-open').first().click();
    assert.ok(page.url().includes('/parts/'));
    await page.locator('a[href="../index.html"]').first().click();
    assert.equal(await page.locator('.part-card').count(), 41);
    await page.goto(`${url}/index_hub.html?legacy=1#library`);
    await page.waitForURL('**/index.html?legacy=1#library');
    assert.equal(await page.locator('.part-card').count(), 41);
    assert.deepEqual(errors, []);
    console.log('PASS: static homepage at 320/390/768/1440 and landscape; all 41 cards, search, filters, persisted progress, reduced motion, lesson return links, and old URL redirect.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
