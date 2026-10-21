/* Verify the migration against a Git revision from before the UI upgrade. */
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),revision=process.argv[2]||'e047f08';let checked=0;
function content(s){return s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<link rel="stylesheet" href="assets\/lingoreach.css">\s*/g,'').replace(/<script src="assets\/lingoreach.js" defer><\/script>\s*/g,'').replace(/\r\n/g,'\n');}
for(const file of fs.readdirSync(root).filter(n=>n.endsWith('.html'))){const original=execFileSync('git',['show',`${revision}:${file}`],{cwd:root,encoding:'utf8',maxBuffer:8e6});const current=fs.readFileSync(path.join(root,file),'utf8');assert.equal(content(current),content(original),`${file}: lesson markup or inline JavaScript changed`);checked++;}
console.log(`${checked} files: original lesson markup, text, inline JavaScript and storage keys are byte-equivalent after excluding styles and asset links.`);
