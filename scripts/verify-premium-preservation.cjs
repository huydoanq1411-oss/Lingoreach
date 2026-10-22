// Compare the restyle to the captured pre-change baseline, excluding only presentation changes.
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const baseline = JSON.parse(fs.readFileSync(process.argv[2] || 'scripts/premium-content-baseline.json', 'utf8'));
function normalize(file, source) {
  if (file.endsWith('.tsx')) return source.replace(/className="[^"]*"/g, 'className=""').replace(/#64CEFB/g, '#D4AF37');
  if (file === 'index.html') return source.replace('family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:', 'family=Inter:');
  return source.replace(/\n<link rel="stylesheet" href="(?:\.\.\/)?assets\/premium-dark\.css">/g, '');
}
for (const [file, expected] of Object.entries(baseline)) {
  const actual = crypto.createHash('sha256').update(normalize(file, fs.readFileSync(file, 'utf8'))).digest('hex');
  assert.equal(actual, expected, `Non-presentation change detected: ${file}`);
}
console.log(`PASS: ${Object.keys(baseline).length} files preserve all original content, data, routes, scripts, handlers, and state logic; only CSS links, font loading, classes, and shine color differ.`);
