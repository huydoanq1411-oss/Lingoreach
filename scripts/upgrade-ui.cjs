/* Idempotent file:// migration. Only CSS and shared asset links are changed. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = fs.readdirSync(root).filter(n => /^(part.*|index_hub|quiz|tu_vung|tra_tu_vung)\.html$/.test(n));
// Read balanced top-level rules, including media/keyframe blocks, without parsing declarations.
function rules(css) {
  const out = []; let start = 0, depth = 0, quote = '', comment = false;
  for (let i=0;i<css.length;i++) {
    const c=css[i], next=css[i+1];
    if(comment){if(c==='*'&&next==='/'){comment=false;i++;}continue;}
    if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote='';continue;}
    if(c==='/'&&next==='*'){comment=true;i++;continue;}
    if(c==='"'||c==="'"){quote=c;continue;}
    if(c==='{')depth++;
    if(c==='}'&&--depth===0){out.push({start,end:i+1,text:css.slice(start,i+1)});start=i+1;}
  }
  return out;
}
const clean=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').trim();
const counts=new Map(), pages=[];
for(const name of files){
  const html=fs.readFileSync(path.join(root,name),'utf8');
  if(!html.trim()){pages.push({name,skip:'empty'});continue;}
  const match=/<style>([\s\S]*?)<\/style>/.exec(html);
  if(!match){pages.push({name,skip:'no inline style'});continue;}
  const parsed=rules(match[1]); const seen=new Set(parsed.map(r=>clean(r.text)));
  for(const r of seen)counts.set(r,(counts.get(r)||0)+1);
  pages.push({name,html,match,parsed});
}
const common=[...counts].filter(([r,n])=>n>=8&&r).map(([r])=>r);
const sharedFile=path.join(root,'assets/lingoreach.css');
let shared=fs.readFileSync(sharedFile,'utf8');
if(common.length){
  const previous=/\/\* shared legacy begin \*\/[\s\S]*?\/\* shared legacy end \*\/\s*/;
  const block='/* shared legacy begin */\n@layer legacy {\n'+common.join('\n')+'\n}\n/* shared legacy end */\n';
  if(previous.test(shared)){
    const old=shared.match(previous)[0];
    const additions=common.filter(rule=>!old.includes(rule));
    if(additions.length)shared=shared.replace(previous,old.replace('\n}\n/* shared legacy end */','\n'+additions.join('\n')+'\n}\n/* shared legacy end */'));
  }else shared=block+shared;
  fs.writeFileSync(sharedFile,shared);
}
const commonSet=new Set(common), report=[];
for(const p of pages){
  if(p.skip){report.push(`${p.name}: skipped (${p.skip})`);continue;}
  let css=p.match[1];
  for(const r of [...p.parsed].reverse())if(commonSet.has(clean(r.text)))css=css.slice(0,r.start)+css.slice(r.end);
  let html=p.html.replace(p.match[0],'<style>'+css+'</style>');
  if(!html.includes('href="assets/lingoreach.css"'))html=html.replace('</head>','<link rel="stylesheet" href="assets/lingoreach.css">\n<script src="assets/lingoreach.js" defer></script>\n</head>');
  fs.writeFileSync(path.join(root,p.name),html);
  report.push(`${p.name}: updated; ${p.parsed.filter(r=>commonSet.has(clean(r.text))).length} shared rules extracted`);
}
fs.writeFileSync(path.join(root,'assets/ui-migration-report.txt'),report.join('\n')+'\n');
console.log(report.join('\n'));
