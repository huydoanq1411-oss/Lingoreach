const { chromium } = require(process.env.PLAYWRIGHT_CORE_PATH || 'C:/Users/Quoc Huy/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const files = ['index.html', 'quiz.html', 'tu_vung.html', 'tra_tu_vung.html', ...fs.readdirSync(path.join(root, 'parts')).map(n => `parts/${n}`)].filter(file => fs.statSync(path.join(root, file)).size);
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    fs.mkdirSync('.preview/premium', { recursive: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const errors = [], contrast = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const file of files) {
      await page.goto(pathToFileURL(path.join(root, file)).href, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(80);
      assert.equal(await page.locator('link[href$="premium-dark.css"]').count(), 1, file);
      assert.ok(await page.evaluate(() => {
        const c = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).map(Number);
        return c.slice(0, 3).every(n => n < 30);
      }), `Dark background missing: ${file}`);
      const illegible = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => {
        if (!['SCRIPT', 'STYLE', 'CANVAS', 'SVG'].includes(el.tagName) && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && el.getBoundingClientRect().width && el.getBoundingClientRect().height) {
          const c = getComputedStyle(el).color.match(/[\d.]+/g)?.map(Number);
          return c && c.slice(0, 3).every(n => n < 105) && (c.length < 4 || c[3] > .5);
        }
        return false;
      }).slice(0, 15).map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.trim().slice(0, 70), color: getComputedStyle(el).color })));
      if (illegible.length) contrast.push({ file, elements: illegible });
      if (['index.html', 'quiz.html', 'tu_vung.html', 'tra_tu_vung.html', 'parts/part3_tenses.html', 'parts/part19_flashcard_trainer.html', 'parts/part29_real_ai_chatbot.html'].includes(file)) {
        for (const width of [1440, 390]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.screenshot({ path: `.preview/premium/${path.basename(file, '.html')}-${width}.png` });
        }
        await page.setViewportSize({ width: 1440, height: 1000 });
      }
    }
    fs.writeFileSync('.preview/premium/contrast-review.json', JSON.stringify(contrast, null, 2));
    assert.deepEqual(errors, []);
    console.log(`PASS: all ${files.length} populated legacy pages load the dark theme without JS errors. ${contrast.length} pages flagged for dark text review.`);
    console.log(JSON.stringify(contrast));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
