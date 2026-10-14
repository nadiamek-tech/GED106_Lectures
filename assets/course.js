/* Narrated lecture engine (shared by GED 102 and GED 106). cfg.course sets the brand code.
   A week page calls Lecture.mount({...}) with its scenes. Each scene:
   { title, kind:'lecture'|'activity'|'check', minutes, narration:[html...], think, notes:[...], src,
     fig:{label, html?, build?(el, W)}, wide:bool } */
(function(){
  const store = {
    get(k){ try{ return localStorage.getItem(k) }catch(e){ return null } },
    set(k,v){ try{ localStorage.setItem(k,v) }catch(e){} }
  };
  const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const h = (tag, attrs={}, html='') => { const e=document.createElement(tag); for(const k in attrs){ if(k==='class') e.className=attrs[k]; else if(k.startsWith('on')) e.addEventListener(k.slice(2),attrs[k]); else e.setAttribute(k,attrs[k]); } if(html) e.innerHTML=html; return e; };

  /* ---------- theme (shared with hub) ---------- */
  function applyTheme(t){ if(t==='light'||t==='dark') document.documentElement.setAttribute('data-theme',t); else document.documentElement.removeAttribute('data-theme'); }
  function currentDark(){ const t=document.documentElement.getAttribute('data-theme'); if(t) return t==='dark'; return matchMedia('(prefers-color-scheme: dark)').matches; }
  applyTheme(store.get('ged102-theme'));
  function toggleTheme(){ const t=currentDark()?'light':'dark'; applyTheme(t); store.set('ged102-theme',t); }

  /* ---------- widgets ---------- */
  const W = {
    esc, h,
    quiz(el, qs){
      const wrap=h('div',{class:'quiz'}); let answered=0, right=0;
      const score=h('p',{class:'score'},`Score: 0 / ${qs.length}`);
      qs.forEach((q,qi)=>{
        const box=h('div',{class:'q'}); box.appendChild(h('h4',{},`${qi+1}. ${q.q}`));
        const opts=h('div',{class:'opts'}); const why=h('div',{class:'why feedback',hidden:''});
        q.o.forEach((o,oi)=>{
          const b=h('button',{class:'opt',type:'button'},esc(o));
          b.addEventListener('click',()=>{
            const ok=[].concat(q.a); /* q.a may be one index or an array of accepted indexes */
            opts.querySelectorAll('button').forEach((x,xi)=>{x.disabled=true; if(ok.includes(xi)) x.classList.add('right');});
            if(!ok.includes(oi)) b.classList.add('wrong'); else right++;
            answered++; why.hidden=false; why.innerHTML=(ok.includes(oi)?'<b>Correct.</b> ':'<b>Not quite.</b> ')+q.why;
            score.textContent=`Score: ${right} / ${qs.length}`+(answered===qs.length?(right===qs.length?' · full marks':' · review the scenes you missed'):'');
          });
          opts.appendChild(b);
        });
        box.append(opts,why); wrap.appendChild(box);
      });
      wrap.appendChild(score); el.appendChild(wrap);
    },
    sort(el, {buckets, items, reveal='Show suggested answers'}){
      const wrap=h('div',{class:'sort'}); const picks=new Array(items.length).fill(null);
      items.forEach((it,i)=>{
        const row=h('div',{class:'item'}); row.appendChild(h('p',{},it.t));
        const ch=h('div',{class:'choices'});
        buckets.forEach((b,bi)=>{ const bt=h('button',{type:'button','aria-pressed':'false'},esc(b)); bt.addEventListener('click',()=>{picks[i]=bi; ch.querySelectorAll('button').forEach((x,xi)=>x.setAttribute('aria-pressed',xi===bi))}); ch.appendChild(bt); });
        const why=h('div',{class:'why',hidden:''});
        row.append(ch,why); wrap.appendChild(row); it._why=why;
      });
      const btn=h('button',{class:'btn ghost',type:'button'},reveal);
      btn.addEventListener('click',()=>{ items.forEach((it,i)=>{ const ok=picks[i]===it.a; it._why.hidden=false; it._why.innerHTML=`<span class="tag ${picks[i]==null?'':ok?'good':'warn'}">${picks[i]==null?'not sorted':ok?'matches':'different view'}</span> Suggested: <b>${esc(buckets[it.a])}</b>. ${it.why}`; }); });
      wrap.appendChild(h('div',{class:'row'})).appendChild(btn);
      el.appendChild(wrap);
    },
    worksheet(el, {id, fields, title='Worksheet'}){
      const wrap=h('div',{class:'ws'}); const key='ged102-ws-'+id;
      let saved={}; try{ saved=JSON.parse(store.get(key)||'{}') }catch(e){}
      fields.forEach((f,i)=>{ const d=h('div',{class:'f'}); const fid=`${id}-${i}`;
        d.appendChild(h('label',{for:fid},esc(f.l))); if(f.hint) d.appendChild(h('small',{},esc(f.hint)));
        const ta=h('textarea',{id:fid,rows:f.rows||2}); ta.value=saved[i]||''; ta.placeholder=f.ph||'';
        ta.addEventListener('input',()=>{saved[i]=ta.value; store.set(key,JSON.stringify(saved));});
        d.appendChild(ta); wrap.appendChild(d); });
      const out=h('div',{class:'feedback',hidden:''});
      const copy=h('button',{class:'btn',type:'button'},'Copy my answers');
      copy.addEventListener('click',()=>{
        const txt=title+'\n\n'+fields.map((f,i)=>`${f.l}\n${(wrap.querySelector('#'+id+'-'+i).value||'—')}`).join('\n\n');
        const done=()=>{out.hidden=false; out.textContent='Copied. Paste it into your Moodle submission or group document.';};
        const fallback=()=>{ out.hidden=false; out.innerHTML=''; const ta=h('textarea',{rows:6}); ta.value=txt; out.append('Copying is blocked here. Select the text below and copy it:',ta); ta.select(); };
        try{ navigator.clipboard.writeText(txt).then(done,fallback);}catch(e){fallback()}
      });
      wrap.append(h('div',{class:'row'}),out); wrap.children[wrap.children.length-2].appendChild(copy);
      el.appendChild(wrap);
    },
    agenda(el, rows){
      const total=rows.reduce((a,r)=>a+r[1],0); let acc=0;
      const col=k=>k==='a'?'var(--wk)':k==='b'?'var(--line)':k==='c'?'var(--good)':'var(--muted)';
      el.innerHTML=`<div class="stack ui">${rows.map(([t,m,k])=>{ const s=acc; acc+=m; return `<div style="display:grid;grid-template-columns:minmax(0,1fr) 46px;gap:8px;align-items:center"><div><div style="font-size:.86rem;margin-bottom:3px">${t}</div><div style="height:10px;background:var(--sunk);border-radius:3px;position:relative"><div style="position:absolute;left:${s/total*100}%;width:${m/total*100}%;top:0;bottom:0;border-radius:3px;background:${col(k)}"></div></div></div><span class="mono" style="text-align:right">${m}′</span></div>`; }).join('')}
       <div class="legend" style="margin-top:4px"><span><i style="background:var(--muted)"></i>lecture</span><span><i style="background:var(--wk)"></i>activity</span><span><i style="background:var(--good)"></i>check</span><span>Total ${total} min</span></div></div>`;
    },
    picker(el, groups, hint='Select any item to see a real example.'){
      const keys=Object.keys(groups);
      el.innerHTML=`<div class="picker">${keys.map(k=>`<div><h4>${k}</h4>${groups[k].map((x,i)=>`<button type="button" data-k="${esc(k)}" data-i="${i}" aria-pressed="false">${x[0]}</button>`).join('')}</div>`).join('')}</div><div class="pick-detail">${hint}</div>`;
      const bs=el.querySelectorAll('.picker button'), d=el.querySelector('.pick-detail');
      bs.forEach(b=>b.addEventListener('click',()=>{ bs.forEach(x=>x.setAttribute('aria-pressed',x===b)); const [t,body]=groups[b.dataset.k][+b.dataset.i]; d.innerHTML=`<b>${t}</b>${keys.length>1?` · <span class="tag">${b.dataset.k}</span>`:''}<p>${body}</p>`; }));
      if(bs[0]) bs[0].click();
    },
    accordion(el, items){
      el.innerHTML=`<div class="acc">${items.map((it,i)=>`<details ${i===0?'open':''}><summary>${it.t}</summary>${it.s?`<p class="mono" style="color:var(--muted)">${it.s}</p>`:''}<p>${it.d}</p>${it.l?`<p><span class="tag good">Lesson</span> ${it.l}</p>`:''}</details>`).join('')}</div>`;
    },
    practice(el, items, opts={}){
      const label=opts.label||'Show hint', prefix=opts.prefix===undefined?'<b>A strong answer includes:</b> ':opts.prefix, qn=opts.numbered===false?'':'Q';
      el.innerHTML=`<div class="prac">${items.map((it,i)=>`<div class="pq"><div class="row"><span>${qn?`<b>Q${i+1}</b> `:''}${it.type?`<span class="tag">${it.type}</span> `:''}${it.q}</span><button type="button" class="btn ghost" data-i="${i}">${label}</button></div><div class="hint" hidden>${prefix}${it.hint}</div></div>`).join('')}</div>`;
      el.querySelectorAll('.pq button').forEach(b=>b.addEventListener('click',()=>{ const h=b.closest('.pq').querySelector('.hint'); h.hidden=!h.hidden; b.textContent=h.hidden?label:'Hide'; }));
    },
    flashcards(el, cards){
      el.innerHTML=`<div class="fc-tools"><label style="display:flex;gap:6px;align-items:center"><input type="checkbox" class="fc-mode"> Self-test: hide the meanings</label><span class="mono fc-score"></span></div><div class="fc">${cards.map(([t,d])=>`<button type="button"><b>${t}</b><span>${d}</span></button>`).join('')}</div>`;
      const grid=el.querySelector('.fc'), score=el.querySelector('.fc-score');
      const upd=()=>{ const k=grid.querySelectorAll('.known').length; score.textContent=grid.classList.contains('test')?`${k} / ${cards.length} known`:''; };
      el.querySelector('.fc-mode').addEventListener('change',e=>{ grid.classList.toggle('test',e.target.checked); grid.querySelectorAll('button').forEach(b=>b.classList.remove('open','known')); upd(); });
      grid.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{ if(!grid.classList.contains('test')) return; if(b.classList.contains('open')) b.classList.toggle('known'); else b.classList.add('open'); upd(); }));
    },
    order(el, items, prompt='Click the events in the order they happened, oldest first.'){
      const sorted=[...items].sort((a,b)=>a.y-b.y); let next=0;
      const shuffled=[...items].sort(()=>Math.random()-.5);
      el.innerHTML=`<p class="ui" style="margin:0 0 8px">${prompt}</p><div class="order">${shuffled.map(it=>`<button type="button" data-y="${it.y}">${it.t}</button>`).join('')}</div><div class="feedback" style="margin-top:10px"></div>`;
      const fb=el.querySelector('.feedback'); let miss=0;
      fb.textContent=`0 of ${items.length} placed`;
      el.querySelectorAll('.order button').forEach(b=>b.addEventListener('click',()=>{
        if(b.classList.contains('done')) return;
        if(+b.dataset.y===sorted[next].y){ b.classList.add('done'); b.innerHTML=`<span class="yr">${b.dataset.y}</span> · ${b.innerHTML}`; next++; fb.textContent= next===items.length?`Done with ${miss} wrong click${miss===1?'':'s'}.`:`${next} of ${items.length} placed`; }
        else { miss++; b.classList.remove('no'); void b.offsetWidth; b.classList.add('no'); }
      }));
    },
    video(el, v){
      const embed=/github\.io$|^localhost$|^127\./.test(location.hostname);
      const url=`https://www.youtube.com/watch?v=${v.id}${v.start?`&t=${v.start}s`:''}`;
      const box=h('div',{class:'video'});
      box.innerHTML=(embed?`<div class="vframe"><iframe src="https://www.youtube-nocookie.com/embed/${v.id}${v.start?`?start=${v.start}`:''}" title="${esc(v.title)}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`
        :`<a class="vcard" href="${url}" target="_blank" rel="noopener"><span class="vplay">▶</span><span><b>Watch on YouTube ↗</b><small>Opens in a new tab</small></span></a>`)
        +`<div class="vmeta"><span class="eyebrow">Watch · ${esc(v.by)}</span><b>${esc(v.title)}</b>${v.why?`<p>${v.why}</p>`:''}${embed?`<a href="${url}" target="_blank" rel="noopener">Open on YouTube ↗</a>`:''}</div>`;
      el.appendChild(box);
    },
    flow(el, steps, opts={}){
      const wrap=h('div',{class:'flow ui'});
      wrap.innerHTML=`<div class="fsteps">${steps.map((s,i)=>`<button type="button" class="fstep" data-i="${i}"><span class="fn">${i+1}</span><b>${s.t}</b>${s.s?`<small>${s.s}</small>`:''}</button>`).join('<span class="farrow" aria-hidden="true">→</span>')}</div>
        <div class="row" style="margin-top:10px"><button type="button" class="btn fplay">▶ Play the flow</button>${opts.note?`<span class="mono" style="color:var(--muted)">${opts.note}</span>`:''}</div><div class="fdetail feedback" style="margin-top:8px">Press play, or click any step.</div>`;
      const bs=[...wrap.querySelectorAll('.fstep')], d=wrap.querySelector('.fdetail'); let timer=null;
      const show=i=>{ bs.forEach((b,j)=>{ b.classList.toggle('on',j===i); b.classList.toggle('done',j<i); }); d.innerHTML=`<b>Step ${i+1} · ${steps[i].t}.</b> ${steps[i].d||''}`; };
      bs.forEach((b,i)=>b.addEventListener('click',()=>{ clearInterval(timer); timer=null; show(i); }));
      wrap.querySelector('.fplay').addEventListener('click',()=>{ clearInterval(timer); let i=0; show(0); timer=setInterval(()=>{ i++; if(i>=steps.length){ clearInterval(timer); timer=null; return; } show(i); },2200); });
      el.appendChild(wrap);
    },
    mindmap(el, {center, branches}){
      const wrap=h('div',{class:'mmap'}); el.appendChild(wrap); let sel=0;
      const narrow=()=> (el.clientWidth||600) < 560;
      const draw=()=>{
        if(narrow()){
          wrap.innerHTML=`<div class="mm-center">${esc(center)}</div><div class="acc">${branches.map((b,i)=>`<details ${i===sel?'open':''}><summary>${esc(b.t)}</summary><ul>${b.items.map(x=>`<li>${x}</li>`).join('')}</ul></details>`).join('')}</div>`; return; }
        const W0=660, n=branches.length, H=Math.max(300, n*58+40), cy=H/2;
        const by=i=>40+(H-80)*(n===1?.5:i/(n-1));
        const leaves=branches[sel].items, m=leaves.length, ly=j=>cy+(j-(m-1)/2)*Math.min(46,(H-40)/Math.max(m,1));
        let svg=`<svg viewBox="0 0 ${W0} ${H}" role="img" aria-label="Mind map: ${esc(center)}">`;
        branches.forEach((b,i)=>{ svg+=`<path d="M150 ${cy} C200 ${cy} 190 ${by(i)} 240 ${by(i)}" fill="none" stroke="${i===sel?'var(--wk)':'var(--line)'}" stroke-width="${i===sel?3:2}"/>`; });
        leaves.forEach((x,j)=>{ svg+=`<path d="M410 ${by(sel)} C440 ${by(sel)} 430 ${ly(j)} 462 ${ly(j)}" fill="none" stroke="var(--wk)" stroke-width="1.5" opacity=".7"/>`; });
        svg+=`<rect x="14" y="${cy-34}" width="136" height="68" rx="34" fill="var(--wk)"/><foreignObject x="20" y="${cy-30}" width="124" height="60"><div xmlns="http://www.w3.org/1999/xhtml" class="mm-c">${esc(center)}</div></foreignObject>`;
        branches.forEach((b,i)=>{ svg+=`<g class="mm-b" data-i="${i}" tabindex="0" role="button" aria-pressed="${i===sel}"><rect x="240" y="${by(i)-20}" width="170" height="40" rx="10" fill="${i===sel?'var(--wk-soft)':'var(--bg)'}" stroke="${i===sel?'var(--wk)':'var(--line)'}" stroke-width="1.5"/><foreignObject x="246" y="${by(i)-18}" width="158" height="36"><div xmlns="http://www.w3.org/1999/xhtml" class="mm-t">${esc(b.t)}</div></foreignObject></g>`; });
        leaves.forEach((x,j)=>{ svg+=`<circle cx="466" cy="${ly(j)}" r="4" fill="var(--wk)"/><foreignObject x="474" y="${ly(j)-21}" width="182" height="42"><div xmlns="http://www.w3.org/1999/xhtml" class="mm-l">${x}</div></foreignObject>`; });
        svg+='</svg>'; wrap.innerHTML=svg+`<p class="mono" style="color:var(--muted);margin:4px 0 0">Click a branch to open it.</p>`;
        wrap.querySelectorAll('.mm-b').forEach(g=>{ const go=()=>{ sel=+g.dataset.i; draw(); }; g.addEventListener('click',go); g.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();go();} }); });
      };
      draw(); requestAnimationFrame(draw); let rt; addEventListener('resize',()=>{ clearTimeout(rt); rt=setTimeout(()=>{ if(document.body.contains(wrap)) draw(); },150); });
    },
    /* Horizontal bar chart drawn to scale: rows [[label, value]], optional hl (index), unit, max */
    bars(el, {rows, unit='', max, hl=-1, note}){
      const m=max||Math.max(...rows.map(r=>r[1]));
      el.insertAdjacentHTML('beforeend',`<div class="hbars ui">${rows.map(([l,v],i)=>`<div class="hb${i===hl?' on':''}"><span class="hl">${l}</span><span class="ht"><i style="width:${v/m*100}%"></i></span><span class="hv">${v}${unit}</span></div>`).join('')}${note?`<p class="mono hn">${note}</p>`:''}</div>`);
    },
    /* Journal finding card: returns HTML */
    study({cite, finding, stat, label='From the literature'}){
      return `<div class="study"><span class="eyebrow">${label}</span>${stat?`<b class="sstat">${stat}</b>`:''}<p>${finding}</p><cite>${cite}</cite></div>`;
    },
    poll(el, {q, opts, reveal}){
      const wrap=h('div',{class:'poll ui'}); wrap.appendChild(h('p',{style:'margin:0 0 4px;font-weight:600'},esc(q)));
      const msg=h('div',{class:'feedback',hidden:''});
      opts.forEach((o,i)=>{ const b=h('button',{class:'o',type:'button','aria-pressed':'false'},`<span>${esc(o)}</span><span class="tag">${String.fromCharCode(65+i)}</span>`);
        b.addEventListener('click',()=>{ wrap.querySelectorAll('button.o').forEach(x=>x.setAttribute('aria-pressed',x===b)); msg.hidden=false; msg.innerHTML=reveal(i); });
        wrap.appendChild(b); });
      wrap.appendChild(msg); el.appendChild(wrap);
    }
  };

  /* ---------- narration (Web Speech API) ---------- */
  const synth = window.speechSynthesis;
  let speaking=false, queue=[], qi=0, voice=null;
  function pickVoice(){ if(!synth) return; const vs=synth.getVoices(); voice=vs.find(v=>/en-GB/.test(v.lang)&&/female|Serena|Kate|Libby|Sonia|Google UK English Female/i.test(v.name))||vs.find(v=>/^en/.test(v.lang))||null; }
  if(synth){ pickVoice(); synth.onvoiceschanged=pickVoice; }

  /* ---------- mount ---------- */
  const box=(cls,lbl)=>html=>`<div class="box ${cls}"><b class="lbl">${lbl}</b>${html}</div>`;
  const B = { plain:box('plain','In plain words'), ex:box('ex','Simple example'), exam:box('exam','Remember for the exam'), risk:box('plain','Risks and ethics') };
  window.Lecture = { W, B, mount(cfg){
    document.title = cfg.pageTitle || document.title;
    const S = cfg.scenes; let cur = 0;
    const seen = new Set(JSON.parse(store.get('ged102-seen-'+cfg.id)||'[]'));
    document.body.dataset.layout = 'even';
    

    const bar=h('header',{class:'bar'});
    bar.innerHTML=`<div class="bar-in">
      <a class="brand" href="index.html" title="Back to the course map"><b>${esc(cfg.course||'GED 102')}</b><span>← Course home · ${esc(cfg.short)}</span></a>
      <div class="controls">
        <button type="button" class="pill listen" id="listen" aria-pressed="false" title="Reads each scene aloud and moves on to the next; press again to pause">▶ Listen</button>
        <button type="button" class="pill" id="find" title="Search the course or ask a question">⌕ Search</button>
        <button type="button" class="pill" id="theme" title="Switch light or dark">◐ Theme</button>
      </div></div><div class="progress"><i></i></div>`;
    document.body.appendChild(bar);

    const shell=h('div',{class:'shell'});
    const toc=h('nav',{class:'toc','aria-label':'Scenes'});
    toc.innerHTML=`<div class="eyebrow">Week ${cfg.week} · CLO ${cfg.clo}</div><h1>${esc(cfg.title)}</h1>
      <div class="meta">${esc(cfg.meta)}</div><div class="meta">Instructor: <b>${esc(cfg.instructor||'Eng. Nadia Mek')}</b></div>`;
    const ol=h('ol'); toc.appendChild(ol);
    S.forEach((s,i)=>{ const li=h('li'); const b=h('button',{type:'button'},`<span class="n">${String(i).padStart(2,'0')}</span><span class="t">${esc(s.nav||s.title)}${s.kind&&s.kind!=='lecture'?`<span class="kind">${{check:'quiz',activity:'activity',exam:'exam',review:'review'}[s.kind]}</span>`:''}</span>`); b.addEventListener('click',()=>go(i)); li.appendChild(b); ol.appendChild(li); });
    const stage=h('main',{class:'stage',id:'stage'});
    shell.append(toc,stage); document.body.appendChild(shell);
    document.body.appendChild(h('p',{class:'support-note'},'This website is interactive course support. It does not replace classes, attendance or class activities.'));

    // controls
    const segBtns=bar.querySelectorAll('.seg button');
    const setLayout=l=>{ document.body.dataset.layout=l; };
    

    bar.querySelector('#theme').addEventListener('click',toggleTheme);
    bar.querySelector('#find').addEventListener('click',()=>CourseSearch.open());
    const listen=bar.querySelector('#listen');
    listen.addEventListener('click',()=>{ speaking?stop():speak(); });

    // Natural recorded narration (Kokoro TTS, pre-generated into audio/) with browser speech as fallback.
    const pageKey=(location.pathname.split('/').pop()||'index').replace(/\.html$/,'');
    let rec=null, player=null;
    fetch('audio/manifest.json').then(r=>r.ok?r.json():null).then(m=>{ if(m&&m.pages&&m.pages[pageKey]){ rec=m.pages[pageKey]; listen.title='Natural narration'; } }).catch(()=>{});
    const paras=()=>[...stage.querySelectorAll('.narr .para, .narr .think')].filter(e=>!e.querySelector('table'));
    const clear=()=>stage.querySelectorAll('.speaking').forEach(e=>e.classList.remove('speaking'));

    function stop(){ speaking=false; if(synth) synth.cancel(); if(player){ player.pause(); player.onended=null; player=null; } listen.setAttribute('aria-pressed','false'); listen.textContent='▶ Listen'; clear(); }
    function speak(){
      const files=rec&&rec[cur];
      if(!files&&!synth){ listen.textContent='Narration not supported in this browser'; return; }
      if(synth) synth.cancel(); speaking=true; listen.setAttribute('aria-pressed','true'); listen.textContent='❚❚ Pause';
      if(document.body.dataset.layout==='diagram') setLayout('even');
      queue=paras(); qi=0;
      (files&&files.length===queue.length) ? nextRec(files) : next();
    }
    function finish(){
      clear();
      if(cur<S.length-1){ go(cur+1); setTimeout(speak,500); }
      else stop();
    }
    function nextRec(files){
      clear(); if(!speaking) return;
      if(qi>=queue.length){ finish(); return; }
      const el=queue[qi]; const src='audio/'+files[qi]; qi++;
      el.classList.add('speaking'); el.scrollIntoView({block:'nearest',behavior:'smooth'});
      player=new Audio(src); player.onended=()=>{ if(speaking) nextRec(files); };
      player.play().catch(()=>{ player=null; qi--; next(); });
    }
    function next(){
      clear();
      if(!speaking) return;
      if(qi>=queue.length){ finish(); return; }
      if(!synth){ stop(); return; }
      const el=queue[qi++]; el.classList.add('speaking'); el.scrollIntoView({block:'nearest',behavior:'smooth'});
      const u=new SpeechSynthesisUtterance(el.innerText.replace(/^Pause and think\s*/i,'Pause and think. ')); if(voice) u.voice=voice; u.rate=0.98;
      u.onend=()=>{ if(speaking) next(); }; u.onerror=()=>{ if(speaking) next(); };
      synth.speak(u);
    }

    function render(){
      const s=S[cur]; stop(); stage.innerHTML='';
      const kindLabel={lecture:'Lecture',activity:'In-class activity',check:'Check your understanding',exam:'Exam takeaways',review:'Review'}[s.kind||'lecture'];
      const head=h('div',{class:'scene-head'});
      head.innerHTML=`<div><div class="eyebrow">Scene ${cur} of ${S.length-1}</div><h2>${s.title}</h2></div>
        <div class="chips"><span class="chip k-${s.kind||'lecture'}">${kindLabel}</span>${s.minutes?`<span class="chip">${s.minutes} min</span>`:''}</div>`;
      stage.appendChild(head);
      const hasFig=!!(s.fig||s.lit||s.chart);
      const split=h('div',{class:'split'+(hasFig?'':' nofig')+(s.wide?' wide':'')+(s.full?' full':'')});
      const narr=h('div',{class:'narr'});
      (s.narration||[]).forEach((p,i)=>{ const isList=/^\s*<(ul|div|table)/.test(p); const d=h('div',{class:'para'+(i===0&&!isList?' lead':'')}); d.innerHTML=p; narr.appendChild(d); });
      if(s.think) narr.appendChild(h('div',{class:'think'},`<span class="eyebrow">Pause and think</span>${s.think}`));
      if(s.video){ const vd=h('div',{class:'videos'}); [].concat(s.video).forEach(v=>W.video(vd,v)); narr.appendChild(vd); }
      if(s.src) narr.appendChild(h('div',{class:'src'},s.src));
      if(s.notes) narr.appendChild(h('div',{class:'notes'},`<span class="eyebrow">Teacher notes${s.minutes?` · ${s.minutes} min`:''}</span><ul>${s.notes.map(n=>`<li>${n}</li>`).join('')}</ul>`));
      split.appendChild(narr);
      if(hasFig){ const fg=s.fig||{}; const f=h('figure',{class:'fig',style:'margin:0'}); const lbl=s.litLabel||fg.label; if(lbl) f.appendChild(h('span',{class:'eyebrow'},esc(lbl)));
        if(s.lit){ const lt=h('div',{style:'margin-top:10px'}); lt.innerHTML=s.lit; f.appendChild(lt); }
        if(s.chart){ const ch=h('div',{style:'margin:10px 0 18px'}); f.appendChild(ch); W.bars(ch,s.chart); }
        if(s.fig && (s.lit||s.chart) && s.fig.label && s.litLabel) f.appendChild(h('span',{class:'eyebrow',style:'display:block;margin-top:8px'},esc(s.fig.label)));
        if(fg.mindmap){ const mm=h('div',{style:'margin-bottom:18px'}); f.appendChild(mm); W.mindmap(mm,fg.mindmap); }
        if(fg.flow){ const fl=h('div',{style:'margin-bottom:18px'}); f.appendChild(fl); W.flow(fl,fg.flow,{note:fg.flowNote}); }
        const body=h('div'); if(fg.html) body.innerHTML=fg.html; f.appendChild(body); if(fg.caption) f.appendChild(h('figcaption',{class:'caption'},fg.caption)); split.appendChild(f); if(fg.build) fg.build(body,W); }
      stage.appendChild(split);
      const pager=h('div',{class:'pager'});
      const prev=h('button',{type:'button',class:'prev'},`<small>← Previous</small>${cur>0?esc(S[cur-1].nav||S[cur-1].title):'Start'}`); prev.disabled=cur===0; prev.addEventListener('click',()=>go(cur-1));
      const nxt=h('button',{type:'button',class:'next'},`<small>Next →</small>${cur<S.length-1?esc(S[cur+1].nav||S[cur+1].title):'End of lecture'}`); nxt.disabled=cur===S.length-1; nxt.addEventListener('click',()=>go(cur+1));
      pager.append(prev,h('span',{class:'kbd'},'← → keys'),nxt); stage.appendChild(pager);
      ol.querySelectorAll('li').forEach((li,i)=>{ li.querySelector('button').setAttribute('aria-current',i===cur); li.classList.toggle('seen',seen.has(i)); });
      const cb=ol.children[cur].querySelector('button'); if(cb.scrollIntoView && innerWidth<900) cb.scrollIntoView({block:'nearest',inline:'center'});
      bar.querySelector('.progress i').style.width=(cur/(S.length-1)*100)+'%';
      seen.add(cur); store.set('ged102-seen-'+cfg.id,JSON.stringify([...seen]));
    }
    function go(i,fromHash){ if(i<0||i>=S.length) return; cur=i; render(); if(!fromHash) try{ history.replaceState(null,'','#s'+i);}catch(e){} window.scrollTo({top:0}); }
    addEventListener('keydown',e=>{ if(/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return; if(e.key==='ArrowRight') go(cur+1); if(e.key==='ArrowLeft') go(cur-1); });
    const m=location.hash.match(/^#s(\d+)$/); go(m?Math.min(+m[1],S.length-1):0,true);
  }};

  /* ---------- course search + ask (works offline: index in assets/search-index.js) ---------- */
  const CourseSearch=(()=>{
    const STOP=new Set('a an the of to in on for and or is are was were be what which who why how do does did i my me we you it this that with from by as at about can should difference between vs versus'.split(' '));
    const stem=w=>w.replace(/(ing|ed|es|s)$/,'');
    const toks=q=>q.toLowerCase().replace(/[^a-z0-9%\- ]/g,' ').split(/\s+/).filter(w=>w&&!STOP.has(w)).map(stem);
    let box=null;
    function load(cb){ if(window.SEARCH_INDEX) return cb(); const sc=document.createElement('script'); sc.src='assets/search-index.js'; sc.onload=cb; sc.onerror=cb; document.head.appendChild(sc); }
    function rank(q){
      const I=window.SEARCH_INDEX||{pages:[],terms:[]}, ts=toks(q); if(!ts.length) return {defs:[],hits:[]};
      const has=(txt,t)=>txt.toLowerCase().split(/[^a-z0-9%\-]+/).some(w=>stem(w)===t);
      let dl=I.terms.map(d=>{ let sc=0; ts.forEach(t=>{ if(has(d.g,t)) sc+=3; else if(has(d.d,t)) sc+=0.5; }); return {d,sc,full:ts.every(t=>has(d.g,t))}; }).filter(x=>x.sc>=3);
      if(dl.some(x=>x.full)) dl=dl.filter(x=>x.full);
      const defs=dl.sort((a,b)=>b.sc-a.sc).slice(0,3).map(x=>x.d);
      const hits=I.pages.map(e=>{ let sc=0, all=true; ts.forEach(t=>{ const inT=has(e.t,t), inX=has(e.x,t); if(inT) sc+=4; if(inX) sc+=1; if(!inT&&!inX) all=false; }); if(all&&ts.length>1) sc+=3; return {e,sc}; }).filter(x=>x.sc>0).sort((a,b)=>b.sc-a.sc).slice(0,8).map(x=>x.e);
      return {defs,hits};
    }
    const snip=(x,ts)=>{ const lw=x.toLowerCase(); let i=-1; for(const t of ts){ i=lw.indexOf(t); if(i>=0) break; } const st=Math.max(0,i-60); return (st?'…':'')+esc(x.slice(st,st+170))+(x.length>st+170?'…':''); };
    function draw(){ const q=box.querySelector('input').value, out=box.querySelector('.sr-out');
      if(!q.trim()){ out.innerHTML=`<p class="sr-hint">Type a term or a question, for example “mean or median”, “non-response bias”, “VLOOKUP”.</p>`; return; }
      const {defs,hits}=rank(q), ts=toks(q);
      out.innerHTML=(defs.length?defs.map(d=>`<div class="sr-def"><b>${esc(d.g)}</b><span>${esc(d.d)}</span></div>`).join(''):'')
        +(hits.length?`<ol class="sr-list">${hits.map(e=>`<li><a href="${e.p}#s${e.s}"><b>${esc(e.t)}</b><small>${esc(e.w)}</small><span>${snip(e.x,ts)}</span></a></li>`).join('')}</ol>`:(defs.length?'':`<p class="sr-hint">No match in the course pages. Try a shorter word.</p>`));
    }
    function open(q){
      if(!box){ box=document.createElement('div'); box.className='sr-wrap'; box.innerHTML=`<div class="sr" role="dialog" aria-modal="true" aria-label="Search the course">
        <div class="sr-top"><input type="search" id="sr-q" placeholder="Search the course or ask a question" autocomplete="off"><button type="button" class="pill sr-x" aria-label="Close">✕</button></div>
        <div class="sr-out"></div>
        <div class="sr-ask">Still unsure? Ask Eng. Nadia: <span class="mono">Nadia.mekhfi@cud.ac.ae</span> <button type="button" class="pill sr-copy">Copy email</button></div></div>`;
        document.body.appendChild(box);
        const inp=box.querySelector('input'); let tm; inp.addEventListener('input',()=>{ clearTimeout(tm); tm=setTimeout(draw,120); });
        box.querySelector('.sr-x').addEventListener('click',close); box.addEventListener('click',e=>{ if(e.target===box) close(); });
        box.addEventListener('keydown',e=>{ if(e.key==='Escape') close(); });
        box.querySelector('.sr-copy').addEventListener('click',e=>{ const b=e.target; const done=()=>b.textContent='Copied'; try{ navigator.clipboard.writeText('Nadia.mekhfi@cud.ac.ae').then(done,()=>b.textContent='Select the address to copy'); }catch(err){ b.textContent='Select the address to copy'; } });
        box.addEventListener('click',e=>{ const a=e.target.closest('a'); if(a&&a.getAttribute('href').split('#')[0]===(location.pathname.split('/').pop()||'index.html')){ close(); setTimeout(()=>location.reload(),0); } });
      }
      box.hidden=false; const inp=box.querySelector('input'); if(q!=null) inp.value=q; load(()=>draw()); setTimeout(()=>inp.focus(),30);
    }
    function close(){ if(box) box.hidden=true; }
    addEventListener('keydown',e=>{ if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){ e.preventDefault(); open(); } });
    return {open,close};
  })();
  window.CourseSearch=CourseSearch;
  window.GED102Theme = { toggle: toggleTheme };
})();
