// Idempotent migration: keep lesson-to-lesson links local and point shared files up one level.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const destination = path.resolve(root, 'parts');
if (path.dirname(destination) !== root) throw new Error('Parts must stay inside this workspace');
fs.mkdirSync(destination, { recursive: true });
for (const name of fs.readdirSync(root).filter(name => /^part\d.*\.html$/.test(name))) {
  const source = path.resolve(root, name);
  const target = path.resolve(destination, name);
  if (path.dirname(source) !== root || path.dirname(target) !== destination) throw new Error('Unexpected lesson path');
  if (fs.existsSync(target)) throw new Error(`Refusing to overwrite ${target}`);
  fs.renameSync(source, target);
}
const rootPages = fs.readdirSync(root).filter(name => name.endsWith('.html') && name !== 'index.html');
for (const name of rootPages) {
  const file = path.join(root, name);
  const html = fs.readFileSync(file, 'utf8').replace(/(["'`])(?:\.\/)?(part\d[^"'`\s]*\.html)/g, '$1parts/$2');
  fs.writeFileSync(file, html);
}
for (const name of fs.readdirSync(destination).filter(name => name.endsWith('.html'))) {
  const file = path.join(destination, name);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/(["'`])(?:\.\/)?assets\//g, '$1../assets/');
  html = html.replace(/(["'`])(?:\.\/)?(index_hub|quiz|tu_vung|tra_tu_vung)\.html/g, '$1../$2.html');
  fs.writeFileSync(file, html);
}
console.log(`Organized ${fs.readdirSync(destination).length} lessons in parts/`);
