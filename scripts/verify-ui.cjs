// Browser acceptance checks against real local file:// pages, no server or build.
const {chromium}=require(process.env.PLAYWRIGHT_CORE_PATH||'C:/Users/Quoc Huy/AppData/Roaming/npm/node_modules/@playwright/cli/node_modules/playwright-core');
const fs=require('node:fs');const path=require('node:path');const {pathToFileURL}=require('node:url');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),url=n=>pathToFileURL(path.join(root,n)).href;
const screenshot=file=>path.join(require('node:os').tmpdir(),'lingoreach-'+file);let runningBrowser;
(async()=>{const browser=runningBrowser=await chromium.launch({channel:'msedge',headless:true});const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const results=[];
  async function open(file){await page.goto(url(file),{waitUntil:'domcontentloaded'});await page.waitForTimeout(250);}
  await open('index_hub.html');const total=await page.locator('.part-card').count();assert.equal(total,41);
  await page.keyboard.press('Control+k');assert.equal(await page.locator('#searchInput').evaluate(e=>e===document.activeElement),true);
  await page.locator('#searchInput').fill('ngữ pháp');assert.ok(await page.locator('.part-card:not(.hidden)').count()<total);assert.ok(await page.locator('mark').count()>0);
  await page.locator('#searchInput').fill('zzzz-no-lesson');assert.equal(await page.locator('.lr-empty').isVisible(),true);await page.locator('#searchInput').fill('');
  await page.locator('.filter-chip[data-filter="tool"]').click();assert.equal(await page.locator('.part-card:not(.hidden):not([data-cat="tool"])').count(),0);await page.locator('.filter-chip[data-filter="all"]').click();
  await page.locator('.pc-check').first().click();assert.equal(await page.locator('.pc-check').first().getAttribute('aria-pressed'),'true');await page.reload({waitUntil:'domcontentloaded'});await page.waitForTimeout(150);assert.equal(await page.locator('.pc-check').first().getAttribute('aria-pressed'),'true');
  await page.locator('#darkToggle').click();await page.waitForTimeout(650);assert.equal(await page.locator('body').getAttribute('data-theme'),'dark');
  await page.screenshot({path:screenshot('hub-dark.png')});await page.locator('#darkToggle').click();await page.waitForTimeout(650);
  for(const width of [360,768,1440]){await page.setViewportSize({width,height:900});await page.waitForTimeout(200);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Hub overflow at ${width}`);await page.screenshot({path:screenshot(`hub-${width}.png`)});}results.push('Hub: search, shortcut, empty state, filters, persisted progress, themes, 360/768/1440 layout');
  await open('part3_tenses.html');await page.locator('.lr-control').filter({hasText:'Tập trung'}).click();assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('lr-focus')));await page.locator('.lr-control').filter({hasText:'Tập trung'}).click();
  for(const width of [360,1440]){await page.setViewportSize({width,height:900});await page.waitForTimeout(350);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Tenses overflow ${width}`);await page.screenshot({path:screenshot(`tenses-${width}.png`)});}results.push('Tenses: focus mode and responsive layout');
  await open('part19_flashcard_trainer.html');await page.locator('#flipCard').click();assert.ok(await page.locator('#flipCard').evaluate(e=>e.classList.contains('flipped')));await page.screenshot({path:screenshot('flashcard.png')});await page.locator('.fc-rate-btn.good').click();assert.ok(await page.evaluate(()=>localStorage.getItem('empath_flashcard_progress')));results.push('Flashcards: original flip and spaced-repetition persistence');
  await open('quiz.html');await page.locator('#numQuestions').selectOption('10');await page.locator('#startBtn').click();assert.equal(await page.locator('.quiz-q').count(),10);
  const answers=await page.evaluate(()=>currentQuestions.map(q=>q.correct));
  for(let i=0;i<answers.length;i++)await page.locator('.quiz-q').nth(i).locator('.quiz-opt').nth(answers[i]).click();
  assert.equal(await page.locator('.lr-quiz-progress').getAttribute('aria-valuenow'),'10');await page.waitForFunction(()=>document.getElementById('finalScoreText').textContent==='10/10');await page.screenshot({path:screenshot('quiz.png')});results.push('Quiz: question generation, answering, progress and perfect-score result');
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.documentElement.classList.contains('lr-effects-off'));await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.documentElement.classList.contains('lr-effects-off'));await page.locator('.lr-control').filter({hasText:'Hiệu ứng'}).click();await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.documentElement.classList.contains('lr-effects-off'));results.push('Reduced motion and persisted effects switch');
  const overflows=[];await page.setViewportSize({width:360,height:800});
  for(const file of fs.readdirSync(root).filter(n=>n.endsWith('.html')&&fs.statSync(path.join(root,n)).size)){await open(file);const has=await page.locator('link[href="assets/lingoreach.css"]').count();assert.equal(has,1,file);if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))overflows.push(file);}
  assert.deepEqual(overflows,[],'Mobile overflow');results.push('All 41 nonempty pages fit a 360px viewport');
  assert.deepEqual(errors,[]);results.push('All 41 nonempty HTML pages load without JavaScript page errors');
  fs.writeFileSync(path.join(root,'assets/ui-verification.txt'),results.join('\n')+'\n');console.log(results.join('\n'));await browser.close();
})().catch(async e=>{console.error(e);await runningBrowser?.close();process.exit(1)});
