/* One lecture = one page (shared add-on, same file in every course repo).
   Load after course.js and before the page script. It wraps Lecture.mount:
   - default: every scene stacked on one page, no side menu, numbered topic chips on top, progress line;
   - Learning supports "One topic at a time" / "One step at a time": one scene at a time with Previous / Next;
   - Listen appears only when the student turns on "Read aloud (AI voice)";
   - practice methods from Learning supports (guided steps, one question at a time, calm start, read aloud). */
(function(){
  if(!window.Lecture) return;
  const LS=window.LearningSupports||{on:()=>false,get:()=>null};
  const W=Lecture.W, esc=W.esc;
  const view=LS.get('view')||'page', voice=LS.on('voice');
  const css=`
body.op .toc{display:none!important}
body.op .shell{grid-template-columns:minmax(0,1fr)!important;max-width:1180px}
body.op-page .stage>.pager,body.op-page .kbd{display:none}
.op-sec{border-top:1px solid var(--line);padding:30px 0 6px;scroll-margin-top:84px}
.op-sec:first-child{border-top:0;padding-top:6px}
.op-head{padding:14px 0 8px}
.op-head h1{font-family:var(--f-display);font-size:clamp(1.9rem,4.6vw,3rem);font-weight:800;letter-spacing:-.03em;line-height:1.04;margin:6px 0}
.op-head .meta{font-family:var(--f-display);color:var(--muted);font-size:.92rem}
.op-chips{display:flex;gap:6px;overflow-x:auto;flex:1;min-width:0;scrollbar-width:thin;padding:2px 0}
.op-chips a{flex:none;display:inline-flex;gap:6px;align-items:center;font-family:var(--f-display);font-size:.82rem;text-decoration:none;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:5px 11px;background:var(--surface);white-space:nowrap}
.op-chips a span{font-family:var(--f-mono);font-size:.7rem}
.op-chips a.on{color:var(--on-wk,#fff);background:var(--wk);border-color:var(--wk)}
body.op .bar-in{flex-wrap:nowrap}
body.op .bar .seg,body.op .bar .seg-label,body.op #cont{display:none!important}
body.op-novoice #listen{display:none!important}
.prac .qb{display:flex;gap:6px;flex:none}
.prac .spk{padding:4px 9px}
.calm-start{border:1px solid var(--line);border-radius:10px;background:var(--surface);padding:10px 12px;font-family:var(--f-display);font-size:.92rem}
.calm-start summary{cursor:pointer;font-weight:700}
.calm-start textarea{width:100%;min-height:70px;border:1px solid var(--line);border-radius:8px;padding:8px;font:inherit;background:var(--bg);color:var(--ink)}
.calm-start .re{color:var(--muted)}
.prac .pnav{display:flex;align-items:center;justify-content:space-between;gap:8px;font-family:var(--f-display)}
.prac .pnav .pc{font-weight:700}
.prac .selfmon{display:grid;gap:4px;margin-top:10px;padding-top:8px;border-top:1px dashed var(--line);font-size:.86rem;color:var(--muted)}
.prac .selfmon label{display:flex;gap:8px;align-items:center;color:var(--ink)}
.guide{margin-top:8px}.gsteps{margin:0;padding-left:22px;display:grid;gap:6px}
.gsteps>li{display:list-item}.gsteps>li.todo,.gsteps>li.done{color:var(--muted)}
.gsteps>li>b{color:inherit}.gsteps>li.cur>b{color:var(--wk)}.gsteps>li.done>b::after{content:" ✓";color:var(--good)}
.wsteps{display:grid;gap:6px;margin-top:6px}.wsteps .ws{display:block;border-left:3px solid var(--wk);padding:4px 10px;background:var(--wk-soft);border-radius:4px}
.wsteps .ws b{display:inline;color:var(--ink);font-size:inherit}
.gbtn{margin-top:8px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}.gok{color:var(--good);font-weight:700}
.support-note{max-width:1180px;margin:0 auto;padding:14px 20px 90px;border-top:1px solid var(--line);font-family:var(--f-display);font-size:.84rem;color:var(--muted);text-align:center}
@media (max-width:620px){body.op .bar-in{flex-wrap:wrap}.op-chips{order:3;flex-basis:100%}}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  /* practice methods (same as MTH 105), wording for text-based courses */
  const STAGES=window.GUIDE_STAGES||[
    ['Read','What is the question asking? Underline the key words.'],
    ['Plan','Which concept, model or framework from the lecture applies?'],
    ['Answer','Write your answer in your own words, with one example.'],
    ['Compare','Open the model answer one point at a time. Which points did you have?'],
    ['Check','Did you answer every part of the question, with an example?']];
  const say=t=>{ if(!window.speechSynthesis) return; speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(t)); };
  const spk=`<button type="button" class="btn ghost spk" title="Read aloud" aria-label="Read aloud"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg></button>`;
  const basePractice=W.practice;
  W.practice=function(el,items,opts={}){
    const guided=LS.on('guided'), single=LS.on('single'), calm=LS.on('calmstart'), aloud=voice;
    if(!guided&&!single&&!calm&&!aloud) return basePractice.call(W,el,items,opts);
    const label=opts.label||'Show hint', prefix=opts.prefix===undefined?'<b>A strong answer includes:</b> ':opts.prefix;
    el.innerHTML=`<div class="prac${single?' single':''}">${calm?`<details class="calm-start" open><summary>Before you start · 2 minutes</summary><p>Write down any worries about this topic. Nobody sees it and it is not saved. Writing worries down before a test frees working memory (Ramirez &amp; Beilock, 2011).</p><textarea rows="3" aria-label="Your worries (not saved)"></textarea><p class="re">A faster heartbeat means your body is getting ready to perform. This is practice, not a test.</p><button type="button" class="btn calm-go">Start</button></details>`:''}${single?`<div class="pnav"><button type="button" class="btn ghost pv">← Previous</button><span class="pc"></span><button type="button" class="btn ghost nx">Next →</button></div>`:''}${items.map((it,i)=>`<div class="pq"><div class="row"><span class="qt">${opts.numbered===false?'':`<b>Q${i+1}</b> `}${it.type?`<span class="tag">${it.type}</span> `:''}${it.q}</span><span class="qb">${aloud?spk:''}${guided?'':`<button type="button" class="btn ghost show">${calm?'Compare with the model answer':label}</button>`}</span></div>${guided?'<div class="guide"></div>':''}<div class="hint" hidden>${prefix}${it.hint}</div>${single?`<div class="selfmon"><span>Before moving on:</span><label><input type="checkbox"> I answered what was asked</label><label><input type="checkbox"> I used a term or model from the lecture</label><label><input type="checkbox"> I gave an example</label></div>`:''}</div>`).join('')}</div>`;
    el.querySelectorAll('.pq .show').forEach(b=>b.addEventListener('click',()=>{ const h=b.closest('.pq').querySelector('.hint'); h.hidden=!h.hidden; b.textContent=h.hidden?(calm?'Compare with the model answer':label):'Hide'; }));
    el.querySelectorAll('.pq .spk').forEach(b=>b.addEventListener('click',()=>say(b.closest('.pq').querySelector('.qt').innerText)));
    const cg=el.querySelector('.calm-go'); if(cg) cg.addEventListener('click',()=>{ const d=el.querySelector('.calm-start'); d.querySelector('textarea').value=''; d.open=false; });
    if(guided) el.querySelectorAll('.pq').forEach(pq=>{
      const tmp=document.createElement('div'); tmp.innerHTML=pq.querySelector('.hint').innerHTML;
      const blocks=[...tmp.children].filter(c=>/^(DIV|P|UL|OL|TABLE)$/.test(c.tagName));
      let parts=blocks.length>1?blocks.map(c=>c.outerHTML):(tmp.querySelector('ul,ol')?[...tmp.querySelectorAll('li')].map(l=>l.innerHTML):tmp.innerHTML.split(/(?<=[.;:])\s+(?=[A-Z<])/).filter(x=>x.trim()));
      if(!parts.length) parts=[tmp.innerHTML];
      const g=pq.querySelector('.guide'); let s=0,k=0;
      const draw=()=>{ g.innerHTML=`<ol class="gsteps">${STAGES.map(([t,d],i)=>`<li class="${i<s?'done':i===s?'cur':'todo'}"><b>${t}</b>${i<=s?` <span>${d}</span>`:''}${i===3&&s>=3?`<div class="wsteps">${parts.slice(0,k).map(x=>`<div class="ws">${x}</div>`).join('')}</div>`:''}</li>`).join('')}</ol><div class="gbtn">${s<3?'<button type="button" class="btn g-next">Done: next stage →</button>':s===3?(k<parts.length?`<button type="button" class="btn g-step">Show point ${k+1} of ${parts.length}</button>`:'<button type="button" class="btn g-next">Done: check →</button>'):'<span class="gok">Finished. Try the next question without the steps.</span>'}${aloud?' '+spk:''}</div>`;
        const n=g.querySelector('.g-next'); if(n) n.onclick=()=>{ s++; draw(); };
        const p=g.querySelector('.g-step'); if(p) p.onclick=()=>{ k++; draw(); };
        const sp=g.querySelector('.spk'); if(sp) sp.onclick=()=>{ const c=g.querySelector('li.cur')||g.querySelector('li:last-child'); say(c.innerText); }; };
      draw(); });
    if(single){ const qs=[...el.querySelectorAll('.pq')]; let c=0; const pc=el.querySelector('.pc');
      const show=()=>{ qs.forEach((q,i)=>q.hidden=i!==c); pc.textContent=`Question ${c+1} of ${qs.length}`; el.querySelector('.pv').disabled=c===0; el.querySelector('.nx').disabled=c===qs.length-1; };
      el.querySelector('.pv').onclick=()=>{ if(c>0){ c--; show(); } }; el.querySelector('.nx').onclick=()=>{ if(c<qs.length-1){ c++; show(); } }; show(); }
  };

  const mount=Lecture.mount;
  Lecture.mount=function(cfg){
    document.body.classList.add('op'); if(!voice) document.body.classList.add('op-novoice');
    try{ localStorage.setItem('ged102-cont','1'); }catch(e){}
    const hash=location.hash;
    mount.call(Lecture,cfg);
    if(!document.querySelector('.support-note')) document.body.appendChild(Object.assign(document.createElement('p'),{className:'support-note',textContent:'This website is interactive course support. It does not replace classes, attendance or class activities.'}));
    if(view!=='page') return;
    document.body.classList.add('op-page');
    const stage=document.getElementById('stage'), toc=document.querySelector('.toc'), btns=[...toc.querySelectorAll('ol li button')];
    const page=document.createElement('div'); page.className='op-page';
    const head=document.createElement('section'); head.className='op-head';
    head.innerHTML=[...toc.children].filter(x=>x.tagName!=='OL'&&!x.classList.contains('toclogo')).map(x=>x.outerHTML).join('');
    page.appendChild(head);
    const navs=[];
    btns.forEach((b,i)=>{ b.click();
      const sec=document.createElement('section'); sec.className='op-sec'; sec.id='s'+i;
      [...stage.childNodes].forEach(n=>{ if(!(n.classList&&n.classList.contains('pager'))) sec.appendChild(n); });
      const eb=sec.querySelector('.scene-head .eyebrow'); if(eb) eb.remove();
      navs.push((b.querySelector('.t')&&b.querySelector('.t').childNodes[0].textContent)||('Part '+(i+1)));
      page.appendChild(sec); });
    stage.innerHTML=''; stage.appendChild(page);
    addEventListener('keydown',e=>{ if(e.key==='ArrowRight'||e.key==='ArrowLeft') e.stopImmediatePropagation(); },true);
    /* top chips */
    const barIn=document.querySelector('.bar .bar-in'), brand=barIn&&barIn.querySelector('.brand');
    const chips=document.createElement('nav'); chips.className='op-chips'; chips.setAttribute('aria-label','In this lecture');
    chips.innerHTML=navs.map((t,i)=>`<a href="#s${i}" data-i="${i}"><span>${i+1}</span>${esc(t)}</a>`).join('');
    if(brand) brand.after(chips);
    const secs=[...page.querySelectorAll('.op-sec')], cs=[...chips.querySelectorAll('a')];
    const mark=i=>cs.forEach((c,j)=>{ c.classList.toggle('on',j===i); if(j===i&&c.scrollIntoView) c.scrollIntoView({block:'nearest',inline:'nearest'}); });
    const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ const i=secs.indexOf(e.target); mark(i); try{ history.replaceState(null,'','#s'+i); }catch(x){} } }),{rootMargin:'-30% 0px -60% 0px'});
    secs.forEach(s=>io.observe(s));
    const prog=document.querySelector('.bar .progress i');
    const onScroll=()=>{ const d=document.documentElement; if(prog) prog.style.width=(d.scrollTop/((d.scrollHeight-d.clientHeight)||1)*100)+'%'; };
    addEventListener('scroll',onScroll,{passive:true});
    const m=hash.match(/^#s(\d+)$/); const t=m?secs[Math.min(+m[1],secs.length-1)]:null;
    window.scrollTo({top:0}); if(t) setTimeout(()=>t.scrollIntoView(),80); onScroll();
    /* voice in page mode: read every paragraph from where the student is, recorded audio when available */
    const old=document.getElementById('listen'); if(!old||!voice) return;
    const listen=old.cloneNode(true); old.replaceWith(listen); listen.textContent='▶ Listen';
    let rec=null, on=false, q=[], qi=0, player=null; const synth=window.speechSynthesis;
    const key=(location.pathname.split('/').pop()||'index').replace(/\.html$/,'');
    fetch('audio/manifest.json').then(r=>r.ok?r.json():null).then(mf=>{ if(mf&&mf.pages&&mf.pages[key]) rec=mf.pages[key]; }).catch(()=>{});
    const paras=()=>secs.flatMap((s,si)=>[...s.querySelectorAll('.narr .para, .narr .think')].filter(e=>!e.querySelector('table')).map((e,pi)=>({e,si,pi})));
    const clear=()=>document.querySelectorAll('.speaking').forEach(x=>x.classList.remove('speaking'));
    const stop=()=>{ on=false; if(synth) synth.cancel(); if(player){ player.pause(); player.onended=null; player=null; } clear(); listen.textContent='▶ Listen'; listen.setAttribute('aria-pressed','false'); };
    const next=()=>{ clear(); if(!on) return; if(qi>=q.length){ stop(); return; }
      const {e,si,pi}=q[qi++]; e.classList.add('speaking'); e.scrollIntoView({block:'center',behavior:'smooth'});
      const f=rec&&rec[si]&&rec[si].length===secs[si].querySelectorAll('.narr .para, .narr .think').length?rec[si][pi]:null;
      if(f){ player=new Audio('audio/'+f); player.onended=()=>{ if(on) next(); }; player.play().catch(()=>{ player=null; speakS(e); }); return; }
      speakS(e); };
    const speakS=e=>{ if(!synth){ next(); return; } const u=new SpeechSynthesisUtterance(e.innerText); u.onend=()=>{ if(on) next(); }; u.onerror=()=>{ if(on) next(); }; synth.cancel(); setTimeout(()=>synth.speak(u),60); window.__opU=u; };
    listen.addEventListener('click',()=>{ if(on){ stop(); return; } on=true; listen.textContent='❚❚ Pause'; listen.setAttribute('aria-pressed','true');
      q=paras(); qi=Math.max(0,q.findIndex(x=>x.e.getBoundingClientRect().bottom>innerHeight*0.2)); next(); });
  };
})();
