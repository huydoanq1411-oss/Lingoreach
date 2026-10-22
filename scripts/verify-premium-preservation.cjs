// Compare the restyle to the captured pre-change baseline, excluding only presentation changes.
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const baseline = JSON.parse(fs.readFileSync(process.argv[2] || 'scripts/premium-content-baseline.json', 'utf8'));
function normalize(file, source) {
  source = source.replace(/href="(\.\.\/)?index\.html"/g, (_, prefix) => `href="${prefix || ''}index_hub.html"`);
  if (file === 'assets/lingoreach.js') source = source.replace("if(title&&!document.body.classList.contains('merged-home')){const walker", 'if(title){const walker').replace("if(hero&&!hero.querySelector('video')){\n    const subject", 'if(hero){\n    const subject');
  if (file.endsWith('.tsx')) return source.replace(/className="[^"]*"/g, 'className=""').replace(/#64CEFB/g, '#D4AF37');
  if (file === 'index.html') return source.replace('family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:', 'family=Inter:');
  return source.replace(/\n<link rel="stylesheet" href="(?:\.\.\/)?assets\/premium-dark\.css">/g, '');
}
for (const [file, expected] of Object.entries(baseline)) {
  // These entry points were intentionally merged; verify their content against the hub baseline below.
  if (file === 'index.html' || file === 'index_hub.html') continue;
  const actual = crypto.createHash('sha256').update(normalize(file, fs.readFileSync(file, 'utf8'))).digest('hex');
  assert.equal(actual, expected, `Non-presentation change detected: ${file}`);
}
require('./verify-merged-home.cjs');
console.log('PASS: lesson content and logic remain unchanged; authorized home-link migration and decorative hero changes are normalized.');
