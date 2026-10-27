/* Lesson page (same engine as MTH 105): one lecture = one page.
   Each topic follows the same pattern: Definition → Around us → Formula (maths) or Framework (other courses), step by step → What it means.
   The lecture ends with Takeaways and Practice.
   Learning supports (assets/supports.js) can split the page into sections or parts, and turn on the voice.
   Needs course.js (widgets W, theme) loaded first. */
(function(){
  const W=window.Lecture.W, esc=W.esc;
  const LS=window.LearningSupports||{on:()=>false,get:()=>null};
  const PARTS={def:'Definition',life:'Around us',formula:'Formula · solve it step by step',framework:'The framework · step by step',meaning:'What it means'};
  const el=(t,a={},html='')=>{ const e=document.createElement(t); Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v)); if(html) e.innerHTML=html; return e; };

  function figure(f){ const fig=el('figure',{class:'lfig'}); if(f.label) fig.appendChild(el('span',{class:'eyebrow'},esc(f.label)));
    const body=el('div'); if(f.html) body.innerHTML=f.html; fig.appendChild(body);
    if(f.caption) fig.appendChild(el('figcaption',{class:'caption'},f.caption));
    if(f.mindmap) W.mindmap(body,f.mindmap); if(f.flow) W.flow(body,f.flow,{});
    return {fig,build:()=>{ if(f.build) f.build(body,W); }}; }

  function part(kind,text,f,builds){
    const p=el('div',{class:'lpart lp-'+kind,'data-part':kind});
    p.appendChild(el('span',{class:'ltag'},PARTS[kind]));
    const row=el('div',{class:'lrow'+(f?'':' nofig')});
    if(text){ const t=el('div',{class:'ltext say'}); t.innerHTML=text; row.appendChild(t); }
    if(f){ const F=figure(f); row.appendChild(F.fig); builds.push(F.build); }
    p.appendChild(row); return p;
  }

  /* the same worked example, written like the professor's whiteboard: formula, what each symbol is, numbers in, answer, calculator */
  function boardVersion(el,F0){ if(!window.Board) return;
    const strip=h=>(h||'').replace(/^\s*<div class="m">([\s\S]*)<\/div>\s*$/,'$1');
    const lines=[`<div class="bd-l bd-f">${F0.f}</div>`];
    if(F0.parts&&F0.parts.length) lines.push(`<div class="bdec bd-parts">${F0.parts.map(([k,m])=>`<div><span class="g">⟶</span> ${m}</div>`).join('')}</div>`);
    if(F0.sub) lines.push(`<div class="bd-l">${F0.sub}</div>`);
    if(F0.ans) lines.push(`<div class="bd-l ans bd-ans">${strip(F0.ans)}</div>`);
    let calc=null;
    if(F0.keys&&window.CALC){ const entry=F0.keys.split(' ').filter(Boolean).filter(k=>k!=='=').join('').replace(/x²/g,'²').replace(/nCr/g,'C');
      try{ const v=CALC.parse(CALC.tokenize(entry.replace(/C/g,'C'),0)); if(isFinite(v)) calc=[entry.replace(/C/g,'C'),String(parseFloat(v.toPrecision(10))).replace('-','−')]; }catch(e){} }
    el.innerHTML=Board.make([{lines,calc}]);
  }
  window.Lesson={ mount(cfg){ window.__LESSON=cfg;
    document.title=cfg.pageTitle||document.title;
    document.body.classList.add('lesson');
    const builds=[];
    /* top bar: back link, contents, voice, theme */
    const bar=el('header',{class:'lbar'});
    const CC=window.COURSE_CREDS, cw=CC&&CC.weeks&&CC.weeks[cfg.week];
    const secs=cfg.topics.map(t=>({id:t.id,t:t.title})).concat(cfg.inClass?[{id:'in-class',t:'In class'}]:[]).concat([{id:'takeaways',t:'Takeaways'},{id:'practice',t:'Practice'}]).concat(cw?[{id:'keep-learning',t:'Keep learning'}]:[]);
    const num=id=>secs.findIndex(x=>x.id===id)+1;
    bar.innerHTML=`<div class="lbar-in"><a class="brand" href="${cfg.home||'lectures.html'}"><b>${esc(cfg.course||'MTH 105')}</b><span>← Lectures · Week ${cfg.week}</span></a>
      <nav class="lchips" aria-label="In this lecture">${secs.map((s,i)=>`<a href="#${s.id}" data-id="${s.id}"><span>${i+1}</span>${esc(s.t)}</a>`).join('')}</nav>
      <div class="lctl">${LS.on('voice')?'<button type="button" class="pill listen" id="listen">▶ Listen</button>':''}<button type="button" class="pill" id="theme" title="Light or dark">◐</button></div></div><div class="progress"><i></i></div>`;
    document.body.appendChild(bar);
    bar.querySelector('#theme').addEventListener('click',()=>GED102Theme.toggle());

    const main=el('main',{class:'lmain'});
    const head=el('section',{class:'lhead',id:'top'});
    head.innerHTML=`<span class="eyebrow">Week ${cfg.week} · ${esc(cfg.clo)}</span><h1>${esc(cfg.title)}</h1>
      <p class="lmeta">${esc(cfg.chapter)} · Instructor: <b>Eng. Nadia Mek</b></p>
      <p class="lintro say">${cfg.intro}</p>
      <div class="lplan"><span class="eyebrow">In this lecture</span><ol>${secs.map(s=>`<li><a href="#${s.id}">${esc(s.t)}</a></li>`).join('')}</ol>
      <p class="lhow">${cfg.how||'Every topic: <b>Definition</b> → <b>Around us</b> → <b>Formula, step by step</b> → <b>What it means</b>.'}</p></div>`;
    main.appendChild(head);
    /* key words before the lecture: one word per card, with a listen button */
    const KW=(window.KEYWORDS||{})[cfg.week];
    if(KW&&KW.length){ const k=el('section',{class:'lkw',id:'key-words'});
      k.innerHTML=`<span class="eyebrow">Key words for this week</span><p class="lkw-lead">Read these first. You can use them in your written answers.</p><div class="lkw-grid">${KW.map(([w,m,x],i)=>`<div class="lkw-c"><div class="lkw-w"><b>${w}</b>${window.speechSynthesis?`<button type="button" class="lkw-say" data-i="${i}" aria-label="Listen: ${esc(w.replace(/<[^>]+>/g,''))}">🔊</button>`:''}</div><p>${m}</p><p class="lkw-x">${x}</p></div>`).join('')}</div>`;
      k.querySelectorAll('.lkw-say').forEach(b=>b.onclick=()=>{ const [w,m]=KW[+b.dataset.i]; const say=t=>t.replace(/x̄/g,'x bar').replace(/Σ/g,'sigma').replace(/μ/g,'mu').replace(/σ/g,'sigma').replace(/s²/g,'s squared').replace(/A'/g,'A complement').replace(/−/g,' minus ').replace(/÷/g,' divided by ').replace(/×/g,' times ');
        speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(say(w)+'. '+say(m)); u.lang='en-GB'; speechSynthesis.speak(u); });
      main.appendChild(k); }

    cfg.topics.forEach((t,i)=>{
      const s=el('section',{class:'lsec',id:t.id}); s.appendChild(el('h2',{},`<span class="no">${i+1}</span>${esc(t.title)}`));
      if(t.demo) s.appendChild(el('div',{class:'ldemo'},`<b>Demonstrated in class</b><span>${t.demo}</span>`));
      if(t.def) s.appendChild(part('def',t.def,t.defFig||null,builds));
      if(t.life) s.appendChild(part('life',t.life.text,t.life.fig,builds));
      if(t.formula){ const p=el('div',{class:'lpart lp-formula','data-part':'formula'}); p.appendChild(el('span',{class:'ltag'},PARTS.formula));
        if(t.formulaNote){ const n=el('p',{class:'ltext say'}); n.innerHTML=t.formulaNote; p.appendChild(n); }
        /* one concept per box: an array of formulas gives one worked example each, one after the other */
        const list=Array.isArray(t.formula)?t.formula:[t.formula];
        list.forEach((Fx,k)=>{ const blk=el('div',{class:'lfx'});
          if(list.length>1) blk.appendChild(el('h3',{class:'lfx-h'},`<span>${k+1}</span>${Fx.name||''}`));
          if(Fx.note){ const n=el('p',{class:'ltext say'}); n.innerHTML=Fx.note; blk.appendChild(n); }
          const two=el('div',{class:'ltwo'}), box=el('div',{class:'ldecode'}), bw=el('div',{class:'lboard'});
          two.appendChild(el('div',{class:'lcol'},'<span class="eyebrow">Step by step</span>')).appendChild(box);
          two.appendChild(el('div',{class:'lcol'},'<span class="eyebrow">On the board</span>')).appendChild(bw);
          blk.appendChild(two); p.appendChild(blk); builds.push(()=>{ F.decode(box,Fx); boardVersion(bw,Fx); }); });
        s.appendChild(p); }
      /* non-maths courses: the textbook framework, one step per box, each applied to the same real case */
      if(t.steps){ const p=el('div',{class:'lpart lp-framework','data-part':'framework'}); p.appendChild(el('span',{class:'ltag'},PARTS.framework));
        if(t.stepsNote){ const n=el('p',{class:'ltext say'}); n.innerHTML=t.stepsNote; p.appendChild(n); }
        t.steps.forEach((x,k)=>{ const b=el('div',{class:'lstep'});
          b.innerHTML=`<div class="lstep-n">${k+1}</div><div class="lstep-b"><h3>${x.name}</h3><div class="lstep-two"><div><span class="eyebrow">The step</span><p class="say">${x.do}</p></div><div class="lstep-app"><span class="eyebrow">${esc(t.caseLabel||'Applied')}</span><p class="say">${x.app}</p></div></div></div>`;
          p.appendChild(b); });
        s.appendChild(p); }
      if(t.meaning) s.appendChild(part('meaning',t.meaning.text,t.meaning.fig,builds));
      main.appendChild(s);
    });

    if(cfg.inClass){
      const ic=cfg.inClass, sec=el('section',{class:'lsec lclass',id:'in-class'});
      sec.appendChild(el('h2',{},`<span class="no">${num('in-class')}</span>In class`));
      sec.appendChild(el('div',{class:'lc-paper'},`<span class="lc-stamp">On the board · on paper</span>
        <p class="lc-lead say">${ic.intro||'We solve these together in class. Bring the handout, or write in the box below each exercise.'}</p>
        <ol class="lc-how">${(ic.how||['<b>Watch</b> your professor demonstrate the method on the board.','<b>Try</b> it yourself on the handout or in the writing box.','<b>Check</b> the answer together in class. It is not posted online.']).map(x=>`<li>${x}</li>`).join('')}</ol>
        <div class="lc-btns">${ic.live===false?'':'<a class="lc-live" href="live.html" target="_blank" rel="noopener"><span class="lc-dot"></span>Live board</a>'}<button type="button" class="lc-print">Print handout</button></div>`));
      ic.items.forEach((x,i)=>{ const card=el('div',{class:'lc-ex'});
        card.innerHTML=`<div class="lc-exh"><b>Exercise ${i+1}</b>${x.draw?'<span class="lc-tag">Draw</span>':''}</div><p class="lc-q say">${x.q}</p>${x.tips?`<details class="lc-tips"><summary>Before you start</summary><ol>${x.tips.map(t=>`<li>${t}</li>`).join('')}</ol></details>`:''}<div class="lc-pad"></div><p class="lc-ans">Answer: solved together in class.</p>`;
        sec.querySelector('.lc-paper').appendChild(card);
        builds.push(()=>{ if(window.Pad) Pad.create(card.querySelector('.lc-pad'),{key:'inclass-'+i,bg:x.draw?'grid':'lines',height:x.draw?360:240,name:`week${cfg.week}-exercise${i+1}`}); }); });
      sec.querySelector('.lc-print').addEventListener('click',()=>{
        const w=window.open('','_blank'); if(!w) return;
        w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(cfg.course||'MTH 105')} · Week ${cfg.week} · In-class handout</title><style>
          body{font-family:Arial,sans-serif;margin:18mm;color:#111}h1{font-size:18px;margin:0}p.m{margin:4px 0 14px;color:#444;font-size:12px}
          .nm{display:flex;gap:24px;font-size:13px;margin-bottom:16px}.nm span{flex:1;border-bottom:1px solid #999;padding-bottom:2px}
          .ex{page-break-inside:avoid;margin-bottom:14px}.ex b{font-size:14px}.ex p{font-size:13px;margin:4px 0 6px}
          .box{border:1px solid #999;height:85mm}.grid{background-image:linear-gradient(#ccc 1px,transparent 1px),linear-gradient(90deg,#ccc 1px,transparent 1px);background-size:5mm 5mm}
          .lines{background-image:linear-gradient(transparent 7mm,#ccc 7mm);background-size:100% 7.25mm}
          @page{size:A4;margin:0}</style></head><body><h1>${esc(cfg.course||'MTH 105')} · Week ${cfg.week} · ${esc(cfg.title)}</h1><p class="m">In-class handout · Eng. Nadia Mek · solved together on the board</p>
          <div class="nm"><span>Name:</span><span>Student ID:</span><span>Section:</span></div>
          ${ic.items.map((x,i)=>`<div class="ex"><b>Exercise ${i+1}</b><p>${x.q}</p><div class="box ${x.draw?'grid':'lines'}"></div></div>`).join('')}
          <script>setTimeout(()=>print(),300)<\/script></body></html>`); w.document.close(); });
      /* missed this class: a calm way to catch up (its own box) */
      const PR=window.PROF||{}, mc=el('div',{class:'lmissed'});
      mc.innerHTML=`<span class="eyebrow">Missed this class?</span><p class="lm-lead">No problem. Catch up at your own pace, in this order:</p>
        <ol><li><b>Read the key words</b> at the <a href="#key-words">top of this page</a>.</li>
        <li><b>Go through the topics</b>, one at a time: ${cfg.topics.map(t=>`<a href="#${t.id}">${esc(t.title)}</a>`).join(' · ')}.</li>
        <li><b>Try the exercises above</b> in the writing box, or print the handout.</li>
        <li><b>Do the Practice</b> at the end. The model answers open after you try.</li>
        <li><b>Bring your questions</b> to office hours${PR.officeHours?`: ${esc(PR.officeHours)}${PR.office?' · '+esc(PR.office):''}`:''}. Every question is welcome.${PR.email?` Or email <a href="mailto:${PR.email}">${esc(PR.email)}</a>.`:''}</li></ol>`;
      sec.appendChild(mc);
      main.appendChild(sec);
    }

    const tk=el('section',{class:'lsec',id:'takeaways'}); tk.appendChild(el('h2',{},`<span class="no">${num('takeaways')}</span>Takeaways`));
    const tkb=el('div',{class:'lpart','data-part':'takeaways'}); const tkf=figure(cfg.takeaways); tkb.appendChild(tkf.fig); builds.push(tkf.build); tk.appendChild(tkb); main.appendChild(tk);
    const pr=el('section',{class:'lsec',id:'practice'}); pr.appendChild(el('h2',{},`<span class="no">${num('practice')}</span>Practice`));
    const prb=el('div',{class:'lpart','data-part':'practice'}); prb.appendChild(el('p',{class:'ltext say'},'Solve on paper first, then open the model working. Easy to hard.'));
    if(cfg.quiz){ const qb=el('div',{class:'lquiz'}); prb.appendChild(qb); builds.push(()=>W.quiz(qb,cfg.quiz)); }
    const pbox=el('div'); prb.appendChild(pbox); builds.push(()=>W.practice(pbox,cfg.practice,{label:cfg.practiceLabel||'Show answer',prefix:''})); pr.appendChild(prb);
    if(cfg.next) pr.appendChild(el('p',{class:'lnext'},cfg.next));
    main.appendChild(pr);
    /* optional micro-credential: this week's free unit (assets/credentials.js) */
    if(cw){ const bd=CC.badges.find(x=>x.id===cw.b), key=(cfg.credKey||'g106-cred-')+cfg.week, form=CC.form||'';
      const kl=el('section',{class:'lsec',id:'keep-learning'}); kl.appendChild(el('h2',{},`<span class="no">${num('keep-learning')}</span>Keep learning`));
      kl.appendChild(el('p',{class:'ltext say'},'Optional and free. This week’s topic continues in a free unit: open it, learn, then come back here for a class-activity bonus.'));
      const card=window.CredCard&&CredCard(cfg.week);
      if(card) kl.appendChild(card); main.appendChild(kl); }

    const pager=el('nav',{class:'lpager','aria-label':'Move through the lecture'}); main.appendChild(pager);
    document.body.appendChild(main);
    document.body.appendChild(el('p',{class:'support-note'},'This website is interactive course support. It does not replace classes, attendance or class activities.'));
    builds.forEach(b=>{ try{ b(); }catch(e){ console.error(e); } });

    /* view: whole page (default) · one section at a time · one part at a time */
    const view=LS.get('view')||'page';
    const sections=[...main.querySelectorAll('.lsec')];
    const units = view==='section' ? sections.map(s=>[s]) : view==='part' ? sections.flatMap(s=>[...s.querySelectorAll(':scope > .lpart')].map(p=>[s,p])) : null;
    let cur=0;
    const chips=[...bar.querySelectorAll('.lchips a')];
    const mark=id=>chips.forEach(c=>{ const on=c.dataset.id===id; c.classList.toggle('on',on); if(on&&c.scrollIntoView) c.scrollIntoView({block:'nearest',inline:'nearest'}); });
    const prog=f=>bar.querySelector('.progress i').style.width=(Math.max(0,Math.min(1,f))*100)+'%';
    function showUnit(i,scroll=true){
      cur=Math.max(0,Math.min(units.length-1,i)); const [s,p]=units[cur];
      sections.forEach(x=>x.hidden=x!==s);
      if(p) s.querySelectorAll(':scope > .lpart').forEach(x=>x.hidden=x!==p);
      head.hidden=cur!==0;
      mark(s.id); prog(units.length>1?cur/(units.length-1):1);
      const ttl=x=>x.querySelector('h2').innerText.replace(/^\d+\s*/,'');
      const lab=u=>!u?'':u[1]?`${sections.indexOf(u[0])+1} · ${u[1].querySelector('.ltag')?u[1].querySelector('.ltag').textContent.split(' · ')[0]:ttl(u[0])}`:ttl(u[0]);
      pager.innerHTML=`<button type="button" class="prev" ${cur===0?'disabled':''}><small>← Previous</small>${esc(lab(units[cur-1])||'Start')}</button><span class="pc">${cur+1} of ${units.length}</span><button type="button" class="next" ${cur===units.length-1?'disabled':''}><small>Next →</small>${esc(lab(units[cur+1])||'End')}</button>`;
      pager.querySelector('.prev').onclick=()=>showUnit(cur-1); pager.querySelector('.next').onclick=()=>showUnit(cur+1);
      try{ history.replaceState(null,'','#'+s.id); }catch(e){}
      if(scroll) window.scrollTo({top:0});
    }
    const target=()=>{ const h=decodeURIComponent(location.hash.slice(1)); if(!h) return null; const m=h.match(/^s(\d+)$/); return m?sections[Math.min(+m[1],sections.length-1)]:document.getElementById(h); };
    if(units){
      document.body.classList.add('lsplit');
      chips.forEach(c=>c.addEventListener('click',e=>{ e.preventDefault(); const i=units.findIndex(u=>u[0].id===c.dataset.id); if(i>=0) showUnit(i); }));
      head.querySelectorAll('.lplan a').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); const i=units.findIndex(u=>'#'+u[0].id===a.getAttribute('href')); if(i>=0) showUnit(i); }));
      addEventListener('keydown',e=>{ if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return; if(e.key==='ArrowRight') showUnit(cur+1); if(e.key==='ArrowLeft') showUnit(cur-1); });
      const t=target(); showUnit(t?Math.max(0,units.findIndex(u=>u[0]===t||u[0].contains(t))):0,false);
    } else {
      pager.remove();
      const t=target(); if(t) setTimeout(()=>t.scrollIntoView(),60);
      const io=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){ mark(e.target.id); try{ history.replaceState(null,'','#'+e.target.id); }catch(x){} } }); },{rootMargin:'-30% 0px -60% 0px'});
      sections.forEach(s=>io.observe(s));
      const onScroll=()=>{ const d=document.documentElement; prog(d.scrollTop/((d.scrollHeight-d.clientHeight)||1)); };
      addEventListener('scroll',onScroll,{passive:true}); onScroll();
      sections.forEach(s=>{ if(s.id) s.addEventListener('focusin',()=>{}); });
      addEventListener('hashchange',()=>{ const t2=target(); if(t2) t2.scrollIntoView(); });
    }

    /* optional voice (Learning supports → Read aloud) */
    const listen=bar.querySelector('#listen');
    if(listen){ const speechSynthesis=window.speechSynthesis||{cancel(){},speak(){},getVoices:()=>[]};
      const synth=speechSynthesis; let voice=null, on=false, q=[], qi=0, player=null, rec=null;
      const all=[...document.querySelectorAll('.say')], key=(location.pathname.split('/').pop()||'').replace(/\.html$/,'');
      fetch('audio/manifest.json').then(r=>r.ok?r.json():null).then(m=>{ const f=m&&m.pages&&m.pages[key]&&m.pages[key][0]; if(f&&f.length===all.length) rec=f; }).catch(()=>{});
      const pick=()=>{ const vs=synth.getVoices(); voice=vs.find(v=>/en-GB/.test(v.lang)&&/female|Serena|Kate|Libby|Sonia|Google UK English Female/i.test(v.name))||vs.find(v=>/^en/.test(v.lang))||null; };
      pick(); synth.onvoiceschanged=pick;
      const words=t=>t.replace(/x̄/g,'x bar').replace(/Σ/g,'sum of').replace(/σ/g,'sigma').replace(/μ/g,'mu').replace(/√/g,'square root of').replace(/−/g,' minus ').replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/²/g,' squared');
      const clear=()=>document.querySelectorAll('.speaking').forEach(x=>x.classList.remove('speaking'));
      const stop=()=>{ on=false; synth.cancel(); if(player){ player.pause(); player.onended=null; player=null; } clear(); listen.textContent='▶ Listen'; listen.setAttribute('aria-pressed','false'); };
      const visible=x=>!x.closest('[hidden]');
      const next=()=>{ clear(); if(!on) return; while(qi<q.length&&!visible(q[qi])) qi++; if(qi>=q.length){ if(units&&cur<units.length-1){ showUnit(cur+1); q=[...document.querySelectorAll('.say')]; qi=q.findIndex(visible); if(qi<0){ stop(); return; } } else { stop(); return; } }
        const x=q[qi++]; x.classList.add('speaking'); x.scrollIntoView({block:'center',behavior:'smooth'});
        const i=all.indexOf(x), file=rec&&rec[i];
        if(file){ player=new Audio('audio/'+file); player.onended=()=>{ if(on) next(); }; player.play().catch(()=>{ player=null; speakSynth(x); }); return; }
        speakSynth(x); };
      const speakSynth=x=>{ const u=new SpeechSynthesisUtterance(words(x.innerText)); if(voice) u.voice=voice; u.onend=()=>{ if(on) next(); }; u.onerror=()=>{ if(on) next(); }; synth.speak(u); };
      listen.addEventListener('click',()=>{ if(on){ stop(); return; } on=true; listen.textContent='❚❚ Pause'; listen.setAttribute('aria-pressed','true');
        q=[...document.querySelectorAll('.say')]; const top=innerHeight*0.2; qi=q.findIndex(x=>visible(x)&&x.getBoundingClientRect().bottom>top); if(qi<0) qi=0; next(); });
    }
  }};
})();
