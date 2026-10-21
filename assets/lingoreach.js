/* Progressive enhancements; legacy lesson data, handlers and storage keys stay intact. */
(() => {
  'use strict';
  const CONFIG = Object.freeze({duration:320,reveal:700,count:850,maxDPR:1.5,renderScale:.8,minScale:.4,particles:18,tilt:3,confetti:80,celebration:1800,slowFrames:45,fastFrames:180,effectsKey:'lingoreach_effects'});
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const media=matchMedia('(prefers-reduced-motion: reduce)'), fine=matchMedia('(hover:hover) and (pointer:fine)');
  const read=(key,fallback)=>{try{return localStorage.getItem(key)??fallback;}catch{return fallback;}};
  const save=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
  let enabled=read(CONFIG.effectsKey,'on')!=='off', reduced=media.matches, toastTimer, stopCelebration=()=>{};
  const active=()=>enabled&&!reduced;
  const animations=new Set();
  function animate(el,frames,options={}){if(!active()||!el.animate)return;const a=el.animate(frames,{duration:CONFIG.duration,easing:'cubic-bezier(.23,1,.32,1)',...options});animations.add(a);a.finished.catch(()=>{}).finally(()=>animations.delete(a));return a;}
  function syncEffects(){document.documentElement.classList.toggle('lr-effects-off',!active());if(!active()){animations.forEach(a=>a.cancel());stopCelebration();$$('.part-card').forEach(c=>c.style.transform='');}document.dispatchEvent(new Event('lr-effects'));}
  function toast(message){let el=$('.lr-toast');if(!el){el=document.createElement('div');el.className='lr-toast';el.setAttribute('role','status');document.body.append(el);}clearTimeout(toastTimer);el.hidden=false;el.textContent=message;animate(el,[{opacity:0,transform:'translate(-50%,8px)'},{opacity:1,transform:'translate(-50%,0)'}]);toastTimer=setTimeout(()=>el.hidden=true,2600);}
  function control(text,label,handler){const b=document.createElement('button');b.type='button';b.className='lr-control';b.textContent=text;b.setAttribute('aria-label',label);b.addEventListener('click',handler);return b;}
  const toolbar=$('.topbar .controls, .topbar .topbar-actions, .topbar .actions, .topnav .nav-actions')||$('.topbar,.topnav');
  if(toolbar){const controls=document.createElement('div');controls.className='lr-controls';toolbar.append(controls);
    if(!document.body.hasAttribute('data-theme')){document.body.setAttribute('data-theme',read('empath_theme','light'));const themeButton=control('Sáng / tối','Chuyển giao diện sáng / tối',()=>{const next=document.body.dataset.theme==='dark'?'light':'dark';document.body.dataset.theme=next;save('empath_theme',next);});themeButton.id='darkToggle';controls.append(themeButton);}
    const effects=control('Hiệu ứng','Bật hoặc tắt hiệu ứng',()=>{enabled=!enabled;save(CONFIG.effectsKey,enabled?'on':'off');effects.setAttribute('aria-pressed',String(enabled));syncEffects();toast(enabled?'Đã bật hiệu ứng':'Đã tắt hiệu ứng');});effects.setAttribute('aria-pressed',String(enabled));controls.append(effects);
    if($('.sidebar')){const focus=control('Tập trung','Ẩn hoặc hiện mục lục để tập trung đọc',()=>{const on=document.body.classList.toggle('lr-focus');focus.setAttribute('aria-pressed',String(on));});focus.setAttribute('aria-pressed','false');controls.prepend(focus);}
  }
  media.addEventListener('change',event=>{reduced=event.matches;syncEffects();});syncEffects();
  // Theme transition wraps the existing handler; the original theme key remains authoritative.
  const theme=$('#darkToggle');
  if(theme){theme.setAttribute('aria-label','Chuyển giao diện sáng / tối');theme.addEventListener('click',e=>{
    if(!active()||!document.startViewTransition||e.__lrTheme)return;
    e.stopImmediatePropagation();const x=e.clientX||innerWidth/2,y=e.clientY||32;
    const transition=document.startViewTransition(()=>{const event=new MouseEvent('click',{bubbles:true});event.__lrTheme=true;theme.dispatchEvent(event);});
    transition.ready.then(()=>{if(!active())return;animate(document.documentElement,[{clipPath:`circle(0px at ${x}px ${y}px)`},{clipPath:`circle(${Math.hypot(innerWidth,innerHeight)}px at ${x}px ${y}px)`}],{duration:480,pseudoElement:'::view-transition-new(root)'});}).catch(()=>{});
  },true);}
  // Chapters reveal once when entering the viewport. No hidden-content dependency.
  const revealed=new WeakSet();
  const revealObserver=new IntersectionObserver(entries=>{entries.forEach(({target,isIntersecting})=>{if(!isIntersecting)return;if(active())target.classList.add('lr-reveal');revealObserver.unobserve(target);});},{threshold:.06});
  function reveals(root=document){$$('.chapter,.part-card,.example-block,.lr-table-wrap',root).forEach(el=>{if(!revealed.has(el)){revealed.add(el);revealObserver.observe(el);}});}
  $$('table').forEach(table=>{if(table.parentElement.matches('.table-wrap,.table-responsive,.lr-table-wrap'))return;const wrap=document.createElement('div');wrap.className='lr-table-wrap';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','Bảng kiến thức — cuộn ngang để xem đầy đủ');table.before(wrap);wrap.append(table);});reveals();
  // Scroll work is coalesced into a single frame; legacy scroll handlers remain untouched.
  let scrollPending=false;
  function scrollUpdate(){scrollPending=false;document.body.classList.toggle('lr-scrolled',scrollY>40);}
  addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(scrollUpdate);}},{passive:true});scrollUpdate();
  const sidebar=$('.sidebar');
  if(sidebar){const links=$$('a[href^="#"]',sidebar),sections=links.map(a=>{try{return document.getElementById(decodeURIComponent(a.hash.slice(1)));}catch{return null;}}).filter(Boolean);const marker=document.createElement('span');marker.className='lr-toc-marker';marker.setAttribute('aria-hidden','true');sidebar.append(marker);
    const visible=new Set();const spy=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?visible.add(e.target):visible.delete(e.target));const current=sections.find(s=>visible.has(s));if(!current)return;links.forEach(a=>{const on=a.hash==='#'+current.id;a.classList.toggle('lr-current',on);if(on){a.setAttribute('aria-current','location');const r=a.getBoundingClientRect();marker.style.transform=`translateY(${r.top-sidebar.getBoundingClientRect().top+sidebar.scrollTop+(r.height-24)/2}px)`;}else a.removeAttribute('aria-current');});},{rootMargin:'-80px 0px -50% 0px'});sections.forEach(s=>spy.observe(s));
    const menu=$('#menuToggle');if(menu){menu.setAttribute('aria-controls',sidebar.id||'sidebar');menu.setAttribute('aria-expanded','false');menu.addEventListener('click',()=>menu.setAttribute('aria-expanded',String(sidebar.classList.contains('open'))));}
    addEventListener('keydown',e=>{if(e.key==='Escape'&&sidebar.classList.contains('open')){sidebar.classList.remove('open');menu?.setAttribute('aria-expanded','false');menu?.focus();}});
  }
  function count(el){const value=el.textContent.trim();if(!/^\d+[+%]?$/.test(value)||!active())return;const target=parseInt(value),suffix=value.replace(/^\d+/,'');let start;const step=t=>{if(!active()){el.textContent=value;return;}start??=t;const p=Math.min(1,(t-start)/CONFIG.count);el.textContent=Math.round(target*(1-(1-p)**3))+suffix;if(p<1)requestAnimationFrame(step);};requestAnimationFrame(step);}
  function countScore(el){if(!el||!active())return;const value=el.textContent.trim(),match=value.match(/^(\d+)\/(\d+)$/);if(!match)return;let start,last=value;const step=t=>{if(el.textContent!==last||!el.closest('.show'))return;if(!active()){el.textContent=value;return;}start??=t;const p=Math.min(1,(t-start)/CONFIG.count);last=`${Math.round(Number(match[1])*(1-(1-p)**3))}/${match[2]}`;el.textContent=last;if(p<1)requestAnimationFrame(step);};requestAnimationFrame(step);}
  $$('.hero-stat b').forEach(count);
  const title=$('.hero-hub h1');if(title){const walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);let order=0;nodes.forEach(node=>{const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{if(!word.trim()){fragment.append(document.createTextNode(word));return;}const span=document.createElement('span');span.className='lr-word';span.style.setProperty('--word-delay',`${order++*35}ms`);span.textContent=word;fragment.append(span);});node.replaceWith(fragment);});title.classList.add('lr-hero-ready');}
  // Hub: retain existing search/filter semantics, add keyboard navigation, matching and FLIP.
  const search=$('#searchInput'), cards=$$('.part-card');
  cards.forEach(card=>{const check=$('.pc-check',card);if(check){check.insertAdjacentHTML('beforeend','<svg class="lr-ring" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14"/><circle cx="16" cy="16" r="14"/></svg>');check.setAttribute('aria-pressed',String(check.classList.contains('done')));check.addEventListener('click',()=>{check.setAttribute('aria-pressed',String(check.classList.contains('done')));toast(check.classList.contains('done')?'Đã lưu: hoàn thành bài học':'Đã lưu thay đổi tiến độ');});}
    const index=document.createElement('div');index.className='lr-card-index';index.textContent=`PHẦN ${String(card.dataset.num).padStart(2,'0')}`;const level=document.createElement('span');level.className='lr-level';level.textContent=card.dataset.cat==='core'?'Nền tảng':card.dataset.cat==='advanced'?'Nâng cao':'Công cụ';index.append(level);card.prepend(index);const border=document.createElement('span');border.className='lr-card-border';border.setAttribute('aria-hidden','true');border.innerHTML='<span class="lr-border-light"></span>';card.append(border);
  });
  if(search&&cards.length){
    search.setAttribute('aria-label','Tìm bài học, công cụ hoặc chủ đề');search.setAttribute('aria-keyshortcuts','Control+k Meta+k');
    const help=document.createElement('span');help.className='lr-search-help';help.textContent='Ctrl / ⌘ K để tìm · Enter để mở';search.after(help);
    const countLabel=$('#searchCount');countLabel?.setAttribute('aria-live','polite');
    const empty=document.createElement('div');empty.className='lr-empty';empty.hidden=true;empty.innerHTML='<svg viewBox="0 0 100 70" fill="none" aria-hidden="true"><path d="M12 15Q30 7 49 20Q68 7 88 15V57Q68 49 49 62Q30 49 12 57Z" stroke="currentColor" stroke-width="2"/><path d="M49 20V62M22 26L39 29M22 36L39 39M61 29L78 26M61 39L78 36" stroke="currentColor"/></svg><p>Chưa tìm thấy bài học phù hợp.<br>Thử một từ khóa ngắn hơn hoặc chọn “Tất cả”.</p>';
    $('.section-wrap')?.append(empty);
    const suggestions=document.createElement('nav');suggestions.className='lr-suggestions';suggestions.setAttribute('aria-label','Gợi ý bài học');suggestions.hidden=true;help.after(suggestions);
    function suggest(){suggestions.replaceChildren();const matched=cards.filter(c=>!c.classList.contains('hidden')).slice(0,5);suggestions.hidden=!search.value.trim()||!matched.length||document.activeElement!==search;matched.forEach(c=>{const link=$('a.pc-open',c);if(!link)return;const a=document.createElement('a');a.href=link.getAttribute('href');a.textContent=$('h3',c).textContent;suggestions.append(a);});}
    search.addEventListener('focus',suggest);search.addEventListener('blur',()=>setTimeout(()=>{if(!suggestions.contains(document.activeElement))suggestions.hidden=true;},150));
    const original=new Map(cards.map(c=>[c,$$('h3,p',c).map(el=>({el,text:el.textContent}))]));let rects=new Map();
    function remember(){rects=new Map(cards.filter(c=>!c.classList.contains('hidden')).map(c=>[c,c.getBoundingClientRect()]));}
    function decorate(){const term=search.value.trim().toLowerCase();let shown=0;cards.forEach(card=>{if(!card.classList.contains('hidden')){shown++;const old=rects.get(card),now=card.getBoundingClientRect();if(old)animate(card,[{transform:`translate(${old.x-now.x}px,${old.y-now.y}px)`},{transform:'none'}]);else animate(card,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}]);}
      original.get(card).forEach(({el,text})=>{el.textContent='';let cursor=0,index=term?text.toLowerCase().indexOf(term):-1;while(index>=0){el.append(document.createTextNode(text.slice(cursor,index)));const mark=document.createElement('mark');mark.textContent=text.slice(index,index+term.length);el.append(mark);cursor=index+term.length;index=text.toLowerCase().indexOf(term,cursor);}el.append(document.createTextNode(text.slice(cursor)));});});empty.hidden=shown>0;remember();suggest();}
    remember();search.addEventListener('beforeinput',remember);search.addEventListener('input',decorate);
    $$('.filter-chip').forEach(chip=>{chip.addEventListener('pointerdown',remember);chip.addEventListener('keydown',remember);chip.addEventListener('click',()=>{decorate();animate(chip,[{transform:'scale(.96)'},{transform:'scale(1)'}],{duration:160});});});
    addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();search.focus();search.select();}});
    search.addEventListener('keydown',e=>{if(e.key==='Escape'){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));search.blur();}if(e.key==='Enter'){const link=cards.find(c=>!c.classList.contains('hidden'))?.querySelector('a.pc-open');link?.click();}if(e.key==='ArrowDown'){e.preventDefault();cards.find(c=>!c.classList.contains('hidden'))?.querySelector('a.pc-open')?.focus();}});
  }
  // Animated pill indicator uses only transform and opacity after measuring its destination.
  const pills=$$('.filter-chip'),pillHost=pills[0]?.parentElement;
  if(pillHost){pillHost.classList.add('lr-pill-host');const indicator=document.createElement('span');indicator.className='lr-pill-indicator';indicator.setAttribute('aria-hidden','true');pillHost.prepend(indicator);let previous;
    function movePill(){const selected=pills.find(p=>p.classList.contains('active'));if(!selected)return;const host=pillHost.getBoundingClientRect(),r=selected.getBoundingClientRect(),x=r.left-host.left,y=r.top-host.top;indicator.style.width=r.width+'px';indicator.style.height=r.height+'px';indicator.style.transform=`translate(${x}px,${y}px)`;if(previous)animate(indicator,[{transform:`translate(${previous.x}px,${previous.y}px)`},{transform:`translate(${x}px,${y}px)`}]);previous={x,y};}
    pills.forEach(p=>p.addEventListener('click',movePill));new ResizeObserver(movePill).observe(pillHost);movePill();
  }
  // Formula sequence explains affirmative / negative / interrogative without altering the text.
  $$('.tense-formula').forEach(group=>{$$('.tf-card',group).forEach((card,i)=>{card.style.setProperty('--formula-order',i);card.classList.add('lr-formula-step');});});
  const flip=$('#flipCard');if(flip){flip.tabIndex=0;flip.setAttribute('role','button');flip.setAttribute('aria-label','Lật thẻ từ vựng');flip.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();flip.click();}});const scene=flip.parentElement;scene.addEventListener('pointermove',e=>{if(!active()||!fine.matches)return;const r=scene.getBoundingClientRect();scene.style.transform=`perspective(1200px) rotateX(${-(e.clientY-r.top-r.height/2)/r.height*CONFIG.tilt}deg) rotateY(${(e.clientX-r.left-r.width/2)/r.width*CONFIG.tilt}deg)`;});scene.addEventListener('pointerleave',()=>scene.style.transform='');document.addEventListener('lr-effects',()=>scene.style.transform='');}
  // Pointer effects are limited to fine pointers, reset on exit and effects changes.
  cards.forEach(card=>{let frame;card.addEventListener('pointermove',e=>{if(!active()||!fine.matches)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1000px) rotateX(${-y*CONFIG.tilt}deg) rotateY(${x*CONFIG.tilt}deg) translateY(-2px)`;$('.lr-border-light',card).style.transform=`translate(${e.clientX-r.left-100}px,${e.clientY-r.top-100}px)`;});});card.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);card.style.transform='';});});
  $$('.pc-open:not(.unavailable),.start-btn').forEach(button=>{let frame;button.addEventListener('pointermove',e=>{if(!active()||!fine.matches)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const r=button.getBoundingClientRect();button.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.04}px,${(e.clientY-r.top-r.height/2)*.06}px)`;});});const reset=()=>{cancelAnimationFrame(frame);button.style.transform='';};button.addEventListener('pointerleave',reset);document.addEventListener('lr-effects',reset);});
  $$('.example-block').forEach(example=>{const copy=control('Sao chép','Sao chép ví dụ',async()=>{const text=[...example.childNodes].filter(n=>n!==copy).map(n=>n.textContent).join('').trim();try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);else{const input=document.createElement('textarea');input.value=text;input.style.cssText='position:fixed;opacity:0;pointer-events:none';document.body.append(input);input.select();const success=document.execCommand('copy');input.remove();copy.focus({preventScroll:true});if(!success)throw new Error('copy');}toast('Đã sao chép ví dụ');}catch{toast('Chưa thể sao chép. Bạn có thể chọn nội dung và nhấn Ctrl/Cmd+C.');}});copy.classList.add('lr-copy');example.append(copy);});
  document.addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;
    if(button.matches('.pc-check')){button.setAttribute('aria-pressed',String(button.classList.contains('done')));toast(button.classList.contains('done')?'Đã lưu: hoàn thành bài học':'Đã lưu thay đổi tiến độ');}
    if(active()&&!button.matches('.pc-check')){const position=getComputedStyle(button).position;if(position==='static')button.style.position='relative';const ripple=document.createElement('span');ripple.className='lr-ripple';ripple.setAttribute('aria-hidden','true');button.append(ripple);setTimeout(()=>ripple.remove(),500);}
  });
  // Feedback follows actual answer classes, never guesses from button wording.
  const quizContainer=$('#quizContainer')||$('.quiz-container');let progress;
  if(quizContainer){progress=document.createElement('div');progress.className='lr-quiz-progress';progress.setAttribute('role','progressbar');progress.setAttribute('aria-label','Tiến độ trả lời');progress.innerHTML='<span></span>';quizContainer.before(progress);}
  const states=new WeakMap();let lastResult='';
  function feedback(el){const correct=el.classList.contains('correct'),wrong=el.classList.contains('wrong');const state=correct?'correct':wrong?'wrong':'';if(state&&states.get(el)!==state){states.set(el,state);if(active()){el.classList.add('lr-'+state);setTimeout(()=>el.classList.remove('lr-'+state),500);}}else if(!state)states.delete(el);}
  const observer=new MutationObserver(records=>{let quizChanged=false;
    for(const record of records){if(record.type==='attributes'){const el=record.target;if(el.matches('.quiz-opt,.option-btn,.quiz-option')){feedback(el);quizChanged=true;}if(el.id==='finalScore'&&el.classList.contains('show')){const text=$('#finalScoreText')?.textContent||'';if(text!==lastResult){lastResult=text;const m=text.match(/(\d+)\s*\/\s*(\d+)/);if(m&&Number(m[2])&&Number(m[1])/Number(m[2])>=.9)celebrate();countScore($('#finalScoreText'));}}}
      else for(const n of record.addedNodes)if(n.nodeType===1&&!n.matches('.lr-ripple,.lr-toast,.lr-confetti')){reveals(n);if(n.matches('.quiz-box,.quiz-q')||n.querySelector('.quiz-q')){quizChanged=true;lastResult='';}}
    }
    if(quizChanged&&progress){const questions=$$('.quiz-q',quizContainer),answered=questions.filter(q=>$('[data-locked="1"]',q)).length;progress.firstElementChild.style.transform=`scaleX(${questions.length?answered/questions.length:0})`;progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax',String(questions.length));progress.setAttribute('aria-valuenow',String(answered));}
  });observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  function celebrate(){if(!active())return;stopCelebration();const canvas=document.createElement('canvas');canvas.className='lr-confetti';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);const ctx=canvas.getContext('2d');if(!ctx){canvas.remove();return;}const dpr=Math.min(devicePixelRatio||1,CONFIG.maxDPR);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;ctx.scale(dpr,dpr);const colors=['#237e75','#e5b75e','#e2604f'];const dots=Array.from({length:CONFIG.confetti},()=>({x:innerWidth/2,y:innerHeight*.3,vx:(Math.random()-.5)*12,vy:-Math.random()*9-2,r:Math.random()*5+2,c:colors[Math.floor(Math.random()*3)]}));let frame,start;
    stopCelebration=()=>{cancelAnimationFrame(frame);canvas.remove();};function step(t){if(!active()||document.hidden){stopCelebration();return;}start??=t;ctx.clearRect(0,0,innerWidth,innerHeight);dots.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.16;ctx.fillStyle=p.c;ctx.globalAlpha=Math.max(0,1-(t-start)/CONFIG.celebration);ctx.fillRect(p.x,p.y,p.r,p.r*1.6);});if(t-start<CONFIG.celebration)frame=requestAnimationFrame(step);else stopCelebration();}frame=requestAnimationFrame(step);
  }
  // Hero shader: a single quad, domain-warped fBm, adaptive resolution, CSS fallback.
  const hero=$('.hero-hub,.hero');
  if(hero){
    const subject=hero.textContent.toLowerCase();let pattern='wave';
    if(/ngữ pháp|thì \(tenses\)|grammar/.test(subject))pattern='grid';else if(/từ vựng|vocabulary|flashcard/.test(subject))pattern='network';else if(/ielts|toeic|quiz|luyện thi/.test(subject))pattern='target';
    hero.dataset.lrPattern=pattern;
    const art=document.createElementNS('http://www.w3.org/2000/svg','svg');art.setAttribute('viewBox','0 0 400 240');art.setAttribute('aria-hidden','true');art.classList.add('lr-topic-art');
    const shapes={grid:'<path d="M0 60H400M0 120H400M0 180H400M80 0V240M160 0V240M240 0V240M320 0V240"/><path d="M0 210L80 170L160 185L240 80L320 100L400 10"/>',network:'<path d="M40 170L110 55L230 100L350 45M110 55L150 210L230 100L355 190L350 45M40 170L150 210L355 190"/><circle cx="40" cy="170" r="8"/><circle cx="110" cy="55" r="12"/><circle cx="230" cy="100" r="16"/><circle cx="350" cy="45" r="8"/><circle cx="150" cy="210" r="8"/><circle cx="355" cy="190" r="12"/>',target:'<circle cx="210" cy="120" r="100"/><circle cx="210" cy="120" r="72"/><circle cx="210" cy="120" r="44"/><path d="M210 0V65M210 175V240M90 120H155M265 120H330M210 120L264 72"/>',wave:'<path d="M0 120Q25 10 50 120T100 120T150 120T200 120T250 120T300 120T350 120T400 120M0 145Q25 65 50 145T100 145T150 145T200 145T250 145T300 145T350 145T400 145"/>'};
    art.innerHTML=shapes[pattern];hero.prepend(art);heroArt(hero);
  }
  function heroArt(hero){
    const weak=(navigator.hardwareConcurrency||4)<=2||(navigator.deviceMemory&&navigator.deviceMemory<=2);
    if(weak)return;
    const canvas=document.createElement('canvas'),letters=document.createElement('canvas');canvas.className='lr-hero-canvas';letters.className='lr-letter-canvas';[canvas,letters].forEach(c=>{c.setAttribute('aria-hidden','true');hero.prepend(c);});
    const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'}),ctx=letters.getContext('2d');
    if(!gl||!ctx){canvas.remove();letters.remove();return;}
    const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs=`precision mediump float;uniform vec2 res,mouse;uniform float time,seed;uniform vec3 teal,gold,ink;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.02+1.7;a*=.5;}return v;}
      void main(){vec2 uv=gl_FragCoord.xy/res;vec2 p=vec2(uv.x*2.8,uv.y*1.8)+mouse*.05;float t=time*.07;float n=fbm(p+fbm(p+vec2(t,-t)+seed));float wave=sin(uv.x*9.+n*5.+t*2.+seed)*.14+.46;float ribbon=exp(-abs(uv.y-wave)*11.);float lines=pow(.5+.5*sin((uv.y-wave)*95.),12.)*ribbon;vec3 color=mix(ink,teal,n*.55+ribbon*.3);color=mix(color,gold,lines*.24*uv.x);gl_FragColor=vec4(color,1.);}`;
    function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;}
    const vertex=shader(gl.VERTEX_SHADER,vs),fragment=shader(gl.FRAGMENT_SHADER,fs);if(!vertex||!fragment){canvas.remove();letters.remove();return;}
    const program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){canvas.remove();letters.remove();return;}gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const uniforms=Object.fromEntries(['res','mouse','time','seed','teal','gold','ink'].map(k=>[k,gl.getUniformLocation(program,k)]));
    const page=decodeURIComponent(location.pathname).split('/').pop(),seed=[...page].reduce((n,c)=>n+c.charCodeAt(0),0)%31;
    gl.uniform1f(uniforms.seed,seed);
    function color(name){const raw=getComputedStyle(document.documentElement).getPropertyValue(name).trim();const hex=raw.replace('#','');return [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)/255);}
    gl.uniform3fv(uniforms.teal,color('--hero-teal'));gl.uniform3fv(uniforms.gold,color('--hero-gold'));gl.uniform3fv(uniforms.ink,color('--hero-ink'));
    let scale=CONFIG.renderScale,w=1,h=1,visible=false,frame=0,previous=0,slow=0,fast=0,px=0,py=0,lost=false;
    const glyphs=['A','B','ə','æ','あ','ア','θ','ʃ'];const particles=Array.from({length:CONFIG.particles},(_,i)=>({x:((i*73+seed*7)%101)/101,y:((i*47+seed)%97)/97,size:12+(i%4)*4,glyph:glyphs[i%glyphs.length]}));
    function resize(){w=hero.clientWidth;h=hero.clientHeight;const d=Math.min(devicePixelRatio||1,CONFIG.maxDPR);canvas.width=Math.max(1,Math.round(w*d*scale));canvas.height=Math.max(1,Math.round(h*d*scale));letters.width=Math.round(w*d);letters.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(uniforms.res,canvas.width,canvas.height);}
    new ResizeObserver(resize).observe(hero);resize();
    hero.addEventListener('pointermove',e=>{if(!fine.matches)return;const r=hero.getBoundingClientRect();px=(e.clientX-r.left)/w-.5;py=(e.clientY-r.top)/h-.5;},{passive:true});hero.addEventListener('pointerleave',()=>{px=py=0;});
    function draw(t){frame=0;if(!active()||!visible||document.hidden||lost)return;const delta=previous?t-previous:16.7;previous=t;if(delta>20){slow++;fast=0;}else if(delta<18){fast++;slow=0;}if(slow>CONFIG.slowFrames&&scale>CONFIG.minScale){scale=Math.max(CONFIG.minScale,scale-.1);slow=0;resize();}if(fast>CONFIG.fastFrames&&scale<CONFIG.renderScale){scale=Math.min(CONFIG.renderScale,scale+.05);fast=0;resize();}
      gl.uniform1f(uniforms.time,t/1000);gl.uniform2f(uniforms.mouse,px,py+Math.min(scrollY,600)/3000);gl.drawArrays(gl.TRIANGLES,0,6);ctx.clearRect(0,0,w,h);ctx.fillStyle='#efc87e';particles.forEach((p,i)=>{ctx.font=`${p.size}px Georgia`;ctx.globalAlpha=.15+(i%3)*.08;ctx.fillText(p.glyph,((p.x+t*.000009*(i%2?1:-1)+1)%1)*w+px*6,((p.y+t*.000004)%1)*h+py*6);});frame=requestAnimationFrame(draw);
    }
    function resume(){cancelAnimationFrame(frame);frame=0;previous=0;if(active()&&visible&&!document.hidden&&!lost)frame=requestAnimationFrame(draw);}
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();}).observe(hero);document.addEventListener('visibilitychange',resume);document.addEventListener('lr-effects',resume);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;resume();canvas.style.display='none';letters.style.display='none';});addEventListener('pagehide',()=>cancelAnimationFrame(frame));
  }
  // Optional live microphone analysis: permission is requested only via this explicit control.
  if(/part1[678]_/.test(location.pathname)&&navigator.mediaDevices?.getUserMedia){
    const host=$('.content')||$('main');if(host){const section=document.createElement('section');section.className='box';section.innerHTML='<strong>Sóng âm trực tiếp</strong><p>Quan sát cường độ giọng nói qua micro của bạn.</p>';const canvas=document.createElement('canvas');canvas.className='lr-audio';canvas.setAttribute('aria-label','Biểu đồ sóng âm từ micro');let stream,context,analyser,frame=0,visible=true,busy=false;const button=control('Bật sóng âm micro','Cho phép micro để hiển thị sóng âm trực tiếp',async()=>{
      if(busy)return;if(stream){stop();return;}busy=true;button.disabled=true;let acquired;
      try{acquired=await navigator.mediaDevices.getUserMedia({audio:true});const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){acquired.getTracks().forEach(t=>t.stop());throw new Error('unsupported');}context=new Audio();stream=acquired;analyser=context.createAnalyser();analyser.fftSize=256;context.createMediaStreamSource(stream).connect(analyser);await context.resume();button.textContent='Tắt sóng âm micro';button.setAttribute('aria-pressed','true');render();}catch{acquired?.getTracks().forEach(t=>t.stop());stop();toast('Không thể mở micro. Kiểm tra quyền truy cập trong trình duyệt.');}finally{busy=false;button.disabled=false;}
    });button.setAttribute('aria-pressed','false');section.append(button,canvas);const hero=$('.hero',host);hero?hero.after(section):host.prepend(section);
      function stop(){cancelAnimationFrame(frame);stream?.getTracks().forEach(t=>t.stop());stream=null;if(context&&context.state!=='closed')context.close().catch(()=>{});context=null;button.textContent='Bật sóng âm micro';button.setAttribute('aria-pressed','false');}
      function render(){cancelAnimationFrame(frame);if(!stream||!active()||document.hidden||!visible)return;const d=Math.min(devicePixelRatio||1,CONFIG.maxDPR),w=canvas.clientWidth,h=64;if(canvas.width!==Math.round(w*d)){canvas.width=Math.round(w*d);canvas.height=h*d;}const ctx=canvas.getContext('2d');if(!ctx)return;ctx.setTransform(d,0,0,d,0,0);const data=new Uint8Array(analyser.frequencyBinCount);analyser.getByteTimeDomainData(data);ctx.clearRect(0,0,w,h);ctx.lineWidth=2;ctx.strokeStyle=getComputedStyle(section).getPropertyValue('--teal');ctx.beginPath();data.forEach((v,i)=>{const x=i/(data.length-1)*w,y=v/255*h;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();frame=requestAnimationFrame(render);}
      new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;render();}).observe(section);document.addEventListener('lr-effects',()=>{if(!active())stop();else render();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});addEventListener('pagehide',stop);
    }
  }
})();
