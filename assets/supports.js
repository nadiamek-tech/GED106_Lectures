/* Learning supports (universal design for learning).
   Students choose supports, never a diagnosis. Choices stay in this browser only (localStorage), nothing is sent.
   Load before course.js on every page: <script src="assets/supports.js"></script> */
(function(){
  const KEY='learning-supports', root=document.documentElement;
  /* [key, label, what changes, why (evidence), method?] method = changes how practice works (page reloads) */
  const SW=[
    ['guided','Guided steps','Each practice question becomes a short step-by-step routine, with the model answer shown one step at a time.','Problem-solving routines (Montague, 2008) and step-by-step worked examples with “which rule is this?” prompts (Atkinson, Renkl & Merrill, 2003).',1],
    ['single','One question at a time','Practice shows one question, a progress count and a short self-check before moving on.','Smaller chunks reduce working-memory load; self-monitoring improved results for college students with ADHD (Scheithauer & Kelley, 2017).',1],
    ['calmstart','Calm start','A 2-minute “write your worries” box before practice; answers become “compare with model working”.','Expressive writing before a test raised anxious students’ scores (Ramirez & Beilock, 2011); low-stakes retrieval practice lowers test anxiety (Agarwal et al., 2014).',1],
    ['voice','Read aloud (AI voice)','Adds a Listen button to lectures and a speaker button to each practice question and step, with symbols in words (x̄ = “x bar”).','Hearing and seeing the text together reduces the reading load of word problems.',1],
    ['font','Readable font','Clearer letter shapes.'],
    ['space','Extra spacing','More space between lines and words.'],
    ['numbers','Bigger numbers and formulas','Formulas and figures easier to read.'],
    ['large','Larger text','About 15% bigger.'],
    ['contrast','High contrast','Stronger text and borders.'],
    ['calm','Calm colours, no scores','Muted colours; quiz scores hidden.'],
    ['motion','Reduce motion','No animations.'],
    ['focus','Focus mode','Hides the scene list and side buttons.'],
    ['resume','Resume where I left off','Reopens the last scene you viewed.']
  ];
  const PRESETS=[
    ['Number support','Step-by-step solving',['guided','numbers','space']],
    ['Focus support','One thing at a time',['single','focus','motion','resume']],
    ['Calm mode','Maths anxiety',['calmstart','calm','motion']],
    ['Reading support','Reading and dyslexia',['voice','font','space','large']],
    ['Vision support','Low vision',['large','contrast','voice']]
  ];
  const load=()=>{ try{ return JSON.parse(localStorage.getItem(KEY))||{}; }catch(e){ return {}; } };
  const save=s=>{ try{ localStorage.setItem(KEY,JSON.stringify(s)); }catch(e){} };
  let st=load();
  window.LearningSupports={on:k=>!!st[k],get:k=>st[k]};

  /* styles */
  const css=`
html[data-sup-font]{--f-body:"Atkinson Hyperlegible",Verdana,Arial,sans-serif;--f-display:"Atkinson Hyperlegible",Verdana,Arial,sans-serif}
html[data-sup-large]{font-size:115%}
html[data-sup-large] body{font-size:19.5px}
html[data-sup-space] :is(p,li,td,th,dd,summary,.para,.narr,small,label){line-height:1.9!important;letter-spacing:.03em;word-spacing:.12em}
html[data-sup-numbers] :is(.m,.frac,.keys kbd,.out b,.tbl td,.pt-cal td,code,.mono){font-size:1.15em;letter-spacing:.04em;font-variant-numeric:tabular-nums lining-nums}
html[data-sup-numbers] .m{line-height:2.1!important}
html[data-sup-contrast]{--muted:var(--ink);--line:#4b5563}
@media (prefers-color-scheme:dark){html[data-sup-contrast]:not([data-theme="light"]){--line:#a3adb8;--bg:#000;--surface:#0b0b0b}}
html[data-sup-contrast][data-theme="dark"]{--line:#a3adb8;--bg:#000;--surface:#0b0b0b}
html[data-sup-contrast] a{text-decoration:underline!important}
html[data-sup-calm]{--wk:#4E6E7E!important;--wk-soft:rgba(78,110,126,.10)!important;--wk-d:#9DB8C6;--wk-soft-d:rgba(157,184,198,.14);--good:#4E7A64;--bad:#7A5A5A}
html[data-sup-calm] :is(.score,.fc-score){display:none!important}
html[data-sup-motion] *,html[data-sup-motion] *::before,html[data-sup-motion] *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
html[data-sup-focus] .toc{display:none!important}
html[data-sup-focus] .shell{grid-template-columns:minmax(0,1fr)!important;max-width:980px}
html[data-sup-focus] .ca-btn{display:none!important}
html[data-sup-focus] .chips .chip:not(:first-child){display:none}
.ls-btn{position:fixed;left:max(16px,env(safe-area-inset-left,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:61;display:flex;align-items:center;gap:8px;border:1px solid var(--line,#ccc);border-radius:999px;padding:9px 14px 9px 10px;background:var(--surface,#fff);color:var(--ink,#111);font:700 .9rem var(--f-display,Arial);cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.18)}
.ls-btn[data-on]{border-color:var(--wk,#2F5BD3);color:var(--wk,#2F5BD3)}
.ls-dlg{border:0;padding:0;border-radius:20px;width:min(560px,calc(100vw - 24px));max-height:calc(100vh - 24px);background:var(--surface,#fff);color:var(--ink,#111);box-shadow:0 20px 60px rgba(0,0,0,.35);font-family:var(--f-display,Arial)}
.ls-dlg::backdrop{background:rgba(10,15,20,.55)}
.ls-in{padding:18px 20px 20px;display:grid;gap:14px}
.ls-head{display:flex;align-items:flex-start;gap:10px}
.ls-head h2{margin:0;font-size:1.25rem}
.ls-head p{margin:2px 0 0;color:var(--muted,#555);font-size:.88rem}
.ls-x{margin-left:auto;flex:none;border:1px solid var(--line,#ccc);background:var(--bg,#fff);color:var(--ink,#111);border-radius:50%;width:34px;height:34px;cursor:pointer;font-size:1.1rem}
.ls-pre{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.ls-pre button{border:1.5px solid var(--line,#ccc);background:var(--bg,#fff);color:var(--ink,#111);border-radius:14px;padding:10px 12px;text-align:left;cursor:pointer;font:inherit;display:grid;gap:2px}
.ls-pre button b{font-size:.95rem}
.ls-pre button small{color:var(--muted,#555);font-size:.78rem}
.ls-pre button[aria-pressed="true"]{border-color:var(--wk,#2F5BD3);background:var(--wk-soft,#eef)}
.ls-h{font-size:.78rem;font-family:var(--f-mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--muted,#555);margin:0}
.ls-sw{display:grid;gap:2px}
.ls-sw label{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px;padding:7px 2px;border-bottom:1px solid var(--line,#ddd);cursor:pointer}
.ls-sw label span small{display:block;color:var(--muted,#555);font-size:.8rem}
.ls-sw label span em{display:block;font-style:normal;color:var(--muted,#555);font-size:.74rem;margin-top:2px;border-left:2px solid var(--wk,#2F5BD3);padding-left:6px}
.ls-sw input{width:20px;height:20px;accent-color:var(--wk,#2F5BD3)}
.ls-speed{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.ls-speed button{border:1px solid var(--line,#ccc);background:var(--bg,#fff);color:var(--ink,#111);border-radius:999px;padding:6px 12px;cursor:pointer;font:inherit;font-size:.86rem}
.ls-speed button[aria-pressed="true"]{background:var(--wk,#2F5BD3);border-color:var(--wk,#2F5BD3);color:var(--on-wk,#fff)}
.ls-foot{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;font-size:.82rem;color:var(--muted,#555)}
.ls-foot button{border:1px solid var(--line,#ccc);background:transparent;color:var(--ink,#111);border-radius:10px;padding:7px 12px;cursor:pointer;font:inherit}
@media (max-width:480px){.ls-btn span{display:none}.ls-btn{padding:10px}}
@media print{.ls-btn{display:none}}`;
  const style=document.createElement('style'); style.textContent=css; document.head.appendChild(style);

  let fontLink=null;
  function apply(){
    SW.forEach(([k])=>{ if(st[k]) root.setAttribute('data-sup-'+k,''); else root.removeAttribute('data-sup-'+k); });
    if(st.font&&!fontLink){ fontLink=document.createElement('link'); fontLink.rel='stylesheet'; fontLink.href='https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap'; document.head.appendChild(fontLink); }
    const b=document.querySelector('.ls-btn'); if(b){ if(SW.some(([k])=>st[k])||(st.rate&&st.rate!==1)) b.setAttribute('data-on',''); else b.removeAttribute('data-on'); }
  }
  apply();

  /* narration speed: recorded audio and browser speech */
  const rate=()=>st.rate||1;
  const play=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){ try{ this.playbackRate=rate(); }catch(e){} return play.apply(this,arguments); };
  if(window.speechSynthesis){ const sp=speechSynthesis.speak.bind(speechSynthesis); speechSynthesis.speak=u=>{ try{ u.rate=(u.rate||1)*rate(); }catch(e){} sp(u); }; }

  /* resume: reopen the last scene of this page */
  const pg='ls-last:'+location.pathname;
  if(st.resume&&!location.hash){ try{ const h=localStorage.getItem(pg); if(h) history.replaceState(null,'',h); }catch(e){} }
  const rs=history.replaceState;
  const keep=()=>{ try{ if(/^#[\w-]+$/.test(location.hash)) localStorage.setItem(pg,location.hash); }catch(e){} };
  keep(); addEventListener('hashchange',keep);
  history.replaceState=function(a,b,url){ const r=rs.apply(this,arguments); try{ if(url&&/^#[\w-]+$/.test(String(url))) localStorage.setItem(pg,String(url)); }catch(e){} return r; };

  /* panel */
  let dlg;
  let methodChanged=false;
  function render(){
    const on=k=>!!st[k];
    const row=([k,t,d,why])=>`<label><span>${t}<small>${d}</small>${why?`<em>${why}</em>`:''}</span><input type="checkbox" data-k="${k}" ${on(k)?'checked':''}></label>`;
    dlg.innerHTML=`<div class="ls-in"><div class="ls-head"><div><h2>Learning supports</h2><p>Choose how you study. Saved on this device only; nothing is sent.</p></div><button type="button" class="ls-x" aria-label="Close">×</button></div>
<p class="ls-h">Quick settings</p>
<div class="ls-pre">${PRESETS.map(([t,s,ks],i)=>`<button type="button" data-p="${i}" aria-pressed="${ks.every(on)}"><b>${t}</b><small>${s}</small></button>`).join('')}</div>
<p class="ls-h">How you practise</p>
<div class="ls-sw">${SW.filter(x=>x[4]).map(row).join('')}</div>
<p class="ls-h">How the page looks</p>
<div class="ls-sw">${SW.filter(x=>!x[4]).map(row).join('')}</div>
<p class="ls-h">How a lecture is shown</p>
<div class="ls-speed" role="group" aria-label="Lecture view">${[['page','Whole lecture on one page'],['section','One topic at a time'],['part','One step at a time']].map(([v,t])=>`<button type="button" data-v="${v}" aria-pressed="${(st.view||'page')===v}">${t}</button>`).join('')}</div>
<div class="ls-speed"><span class="ls-h" style="margin-right:6px">Voice speed</span>${[[0.8,'Slower'],[1,'Normal'],[1.2,'Faster']].map(([r,t])=>`<button type="button" data-r="${r}" aria-pressed="${rate()===r}">${t}</button>`).join('')}</div>
<div class="ls-foot"><span>Practice changes apply when you close this panel.</span><button type="button" class="ls-reset">Reset all</button></div></div>`;
    dlg.querySelector('.ls-x').onclick=()=>dlg.close();
    const isM=k=>SW.some(x=>x[0]===k&&x[4])||k==='focus';
    dlg.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{ const ks=PRESETS[b.dataset.p][2], all=ks.every(on); ks.forEach(k=>{ st[k]=!all; if(isM(k)) methodChanged=true; }); if(PRESETS[b.dataset.p][0]==='Focus support'){ st.view=all?'page':'section'; methodChanged=true; } commit(); });
    dlg.querySelectorAll('[data-k]').forEach(c=>c.onchange=()=>{ st[c.dataset.k]=c.checked; if(isM(c.dataset.k)) methodChanged=true; commit(); });
    dlg.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{ st.rate=+b.dataset.r; commit(); document.querySelectorAll('audio,video').forEach(m=>{ try{ m.playbackRate=rate(); }catch(e){} }); });
    dlg.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{ st.view=b.dataset.v; methodChanged=true; commit(); });
    dlg.querySelector('.ls-reset').onclick=()=>{ if(SW.some(x=>x[4]&&st[x[0]])||st.view) methodChanged=true; st={}; commit(); };
  }
  function commit(){ save(st); apply(); const f=document.activeElement&&document.activeElement.dataset; const key=f&&(f.k||f.p||f.r); render(); if(key!=null){ const el=dlg.querySelector(`[data-k="${key}"],[data-p="${key}"],[data-r="${key}"]`); if(el) el.focus(); } }
  function build(){
    const b=document.createElement('button'); b.type='button'; b.className='ls-btn'; b.setAttribute('aria-haspopup','dialog');
    b.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="4.5" r="1.8"/><path d="M5 8.5l7 1.5 7-1.5M12 10v5l-3 6M12 15l3 6"/></svg><span>Learning supports</span>';
    dlg=document.createElement('dialog'); dlg.className='ls-dlg'; dlg.setAttribute('aria-label','Learning supports');
    dlg.addEventListener('click',e=>{ if(e.target===dlg) dlg.close(); });
    dlg.addEventListener('close',()=>{ if(methodChanged){ methodChanged=false; if(document.querySelector('.prac,.lmain')) location.reload(); } });
    document.body.append(b,dlg); apply();
    b.onclick=()=>{ render(); if(dlg.showModal) dlg.showModal(); else dlg.setAttribute('open',''); const f=dlg.querySelector('.ls-pre button'); if(f) f.focus(); };
  }
  function note(){ if(document.body.textContent.includes('does not replace classes')) return;
    const n=document.createElement('p'); n.className='support-note'; n.textContent='This website is interactive course support. It does not replace classes, attendance or class activities.';
    n.style.cssText='max-width:1180px;margin:0 auto;padding:14px 20px 90px;border-top:1px solid var(--line,#ddd);font-family:var(--f-display,Arial);font-size:.84rem;color:var(--muted,#666);text-align:center'; document.body.appendChild(n); }
  const start=()=>{ build(); setTimeout(note,300); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
