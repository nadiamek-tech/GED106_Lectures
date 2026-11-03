/* Writing pad: write with a finger, stylus or mouse on any phone, tablet or laptop.
   Pad.create(el, {key, bg:'grid'|'lines'|'plain', height})
   Pen, eraser, undo, clear, paper choice, full screen, save as image. The drawing is kept on this device only. */
(function(){
  const css=`
.pad{border:1px solid var(--line);border-radius:12px;background:var(--surface);overflow:hidden;margin-top:8px}
.pad-tools{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:6px 8px;border-bottom:1px solid var(--line);font-family:var(--f-display);font-size:.84rem}
.pad-tools button,.pad-tools select{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:8px;padding:5px 9px;font:inherit;cursor:pointer}
.pad-tools button[aria-pressed="true"]{background:var(--wk);border-color:var(--wk);color:var(--on-wk,#fff)}
.pad-tools .sp{flex:1}
.pad-wrap{position:relative;touch-action:none}
.pad canvas{display:block;width:100%;touch-action:none;cursor:crosshair}
.pad.full{position:fixed;inset:0;z-index:200;border-radius:0;display:flex;flex-direction:column;margin:0}
.pad.full .pad-wrap{flex:1}
.pad.full canvas{height:100%!important}
.pad-note{font-family:var(--f-display);font-size:.76rem;color:var(--muted);padding:4px 10px 6px}
@media print{.pad-tools,.pad-note{display:none}}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  const get=k=>{ try{ return localStorage.getItem(k); }catch(e){ return null; } };
  const set=(k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} };
  const ink=()=>getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()||'#111';

  function draw(el,o={}){
    const key='pad:'+location.pathname+':'+(o.key||'x'); let bg=get(key+':bg')||o.bg||'grid';
    el.innerHTML=`<div class="pad"><div class="pad-tools"><button type="button" data-t="pen" aria-pressed="true">Pen</button><button type="button" data-t="eraser" aria-pressed="false">Eraser</button><button type="button" class="undo">Undo</button><button type="button" class="clear">Clear</button>
      <select aria-label="Paper"><option value="grid">Graph paper</option><option value="lines">Lined</option><option value="plain">Plain</option></select><span class="sp"></span><button type="button" class="fs">Full screen</button><button type="button" class="save">Save image</button></div>
      <div class="pad-wrap"><canvas aria-label="Writing area: write with your finger, stylus or mouse"></canvas></div><div class="pad-note">Write with your finger or a stylus. Saved on this device only; “Save image” to keep or upload it.</div></div>`;
    const pad=el.querySelector('.pad'), cv=el.querySelector('canvas'), ctx=cv.getContext('2d'), sel=el.querySelector('select');
    sel.value=bg;
    let tool='pen', drawing=false, last=null, hist=[], H=o.height||260, ink_=null;
    const paper=()=>{ const w=cv.width, h=cv.height, r=devicePixelRatio||1; ctx.save(); ctx.setTransform(1,0,0,1,0,0);
      const cs=getComputedStyle(document.documentElement); ctx.fillStyle=cs.getPropertyValue('--surface').trim()||'#fff'; ctx.fillRect(0,0,w,h);
      if(bg!=='plain'){ ctx.strokeStyle=cs.getPropertyValue('--line').trim()||'#ddd'; ctx.lineWidth=1;
        const s=(bg==='grid'?20:30)*r; ctx.beginPath(); for(let y=s;y<h;y+=s){ ctx.moveTo(0,y); ctx.lineTo(w,y); } if(bg==='grid') for(let x=s;x<w;x+=s){ ctx.moveTo(x,0); ctx.lineTo(x,h); } ctx.stroke(); }
      ctx.restore(); };
    let strokes=[]; /* vector strokes so resizing and paper changes redraw cleanly */
    try{ strokes=JSON.parse(get(key)||'[]'); }catch(e){ strokes=[]; }
    const redraw=()=>{ paper(); const r=devicePixelRatio||1;
      strokes.forEach(s=>{ ctx.save(); ctx.globalCompositeOperation='source-over'; ctx.strokeStyle=s.e?(getComputedStyle(document.documentElement).getPropertyValue('--surface').trim()||'#fff'):(ink_||ink()); ctx.lineCap='round'; ctx.lineJoin='round';
        for(let i=1;i<s.p.length;i++){ const [x0,y0]=s.p[i-1], [x1,y1,pr]=s.p[i]; ctx.lineWidth=(s.e?18:(1.2+2.6*(pr||.5)))*r; ctx.beginPath(); ctx.moveTo(x0*cv.width,y0*cv.height); ctx.lineTo(x1*cv.width,y1*cv.height); ctx.stroke(); }
        ctx.restore(); }); };
    const size=()=>{ const r=devicePixelRatio||1, w=cv.clientWidth||600, h=pad.classList.contains('full')?cv.clientHeight:H; cv.style.height=h+'px'; cv.width=Math.round(w*r); cv.height=Math.round(h*r); redraw(); };
    const pos=e=>{ const b=cv.getBoundingClientRect(); return [(e.clientX-b.left)/b.width,(e.clientY-b.top)/b.height,e.pressure&&e.pointerType!=='mouse'?e.pressure:.5]; };
    let cur=null;
    cv.addEventListener('pointerdown',e=>{ e.preventDefault(); cv.setPointerCapture(e.pointerId); drawing=true; cur={e:tool==='eraser',p:[pos(e)]}; strokes.push(cur); });
    cv.addEventListener('pointermove',e=>{ if(!drawing) return; e.preventDefault(); const evs=e.getCoalescedEvents?e.getCoalescedEvents():[e];
      evs.forEach(ev=>{ const p=pos(ev), q=cur.p[cur.p.length-1]; cur.p.push(p); const r=devicePixelRatio||1;
        ctx.save(); ctx.strokeStyle=cur.e?(getComputedStyle(document.documentElement).getPropertyValue('--surface').trim()||'#fff'):ink(); ctx.lineCap='round'; ctx.lineWidth=(cur.e?18:(1.2+2.6*p[2]))*r;
        ctx.beginPath(); ctx.moveTo(q[0]*cv.width,q[1]*cv.height); ctx.lineTo(p[0]*cv.width,p[1]*cv.height); ctx.stroke(); ctx.restore(); }); });
    const end=()=>{ if(!drawing) return; drawing=false; cur=null; set(key,JSON.stringify(strokes.slice(-400))); };
    cv.addEventListener('pointerup',end); cv.addEventListener('pointercancel',end); cv.addEventListener('pointerleave',end);
    el.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ tool=b.dataset.t; el.querySelectorAll('[data-t]').forEach(x=>x.setAttribute('aria-pressed',x===b)); });
    el.querySelector('.undo').onclick=()=>{ strokes.pop(); set(key,JSON.stringify(strokes)); redraw(); };
    el.querySelector('.clear').onclick=()=>{ strokes=[]; set(key,'[]'); redraw(); };
    sel.onchange=()=>{ bg=sel.value; set(key+':bg',bg); redraw(); };
    const fs=el.querySelector('.fs');
    fs.onclick=()=>{ const on=!pad.classList.contains('full'); pad.classList.toggle('full',on); fs.textContent=on?'Close':'Full screen'; document.body.style.overflow=on?'hidden':''; setTimeout(size,30); };
    el.querySelector('.save').onclick=()=>{ const a=document.createElement('a'); a.download=(o.name||'my-working')+'.png'; a.href=cv.toDataURL('image/png'); a.click(); };
    addEventListener('resize',()=>{ clearTimeout(cv._t); cv._t=setTimeout(size,120); });
    new MutationObserver(()=>setTimeout(redraw,30)).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    requestAnimationFrame(size);
  }
  /* Shell: choose Write (pen/finger) or Type (phone keyboard); Hide/Show keeps the page short. */
  const css2=`
.pbx{margin-top:8px;border:1px solid var(--line);border-radius:12px;background:var(--surface);font-family:var(--f-display)}
.pbx-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:7px 9px}
.pbx-bar b{font-size:.9rem;margin-right:4px}
.pbx-bar button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:999px;padding:5px 12px;font:600 .84rem var(--f-display);cursor:pointer}
.pbx-bar button[aria-pressed="true"]{background:var(--wk);border-color:var(--wk);color:var(--on-wk,#fff)}
.pbx-bar .pbx-hide{margin-left:auto;border-radius:8px}
.pbx-body{padding:0 8px 8px}
.pbx .pad{margin-top:0}
.pbx textarea{display:block;width:100%;box-sizing:border-box;min-height:180px;resize:vertical;border:1px solid var(--line);border-radius:10px;padding:10px 12px;background:var(--bg);color:var(--ink);font:1rem/1.6 var(--f-display)}
.pbx-tt{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px;font-size:.78rem;color:var(--muted)}
.pbx-tt button{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:8px;padding:4px 10px;font:600 .8rem var(--f-display);cursor:pointer}
@media print{.pbx-bar{display:none}}`;
  const st2=document.createElement('style'); st2.textContent=css2; document.head.appendChild(st2);
  function create(el,o={}){
    const key='pad:'+location.pathname+':'+(o.key||'x');
    let mode=get(key+':mode'); if(mode===null) mode=o.open?'write':'';
    el.innerHTML=`<div class="pbx"><div class="pbx-bar"><b>Your answer</b><button type="button" data-m="write" aria-pressed="false">✎ Write</button><button type="button" data-m="type" aria-pressed="false">⌨ Type</button><button type="button" class="pbx-hide">Hide</button></div>
      <div class="pbx-body" hidden><div class="pbx-w" hidden></div><div class="pbx-t" hidden><textarea aria-label="Type your answer" placeholder="Type your answer here, like in your phone notes…"></textarea>
      <div class="pbx-tt"><button type="button" class="pbx-copy">Copy</button><button type="button" class="pbx-dl">Save as file</button><span>Saved on this device only.</span></div></div></div></div>`;
    const body=el.querySelector('.pbx-body'), w=el.querySelector('.pbx-w'), t=el.querySelector('.pbx-t'), ta=el.querySelector('textarea'), hide=el.querySelector('.pbx-hide');
    ta.value=get(key+':text')||''; ta.addEventListener('input',()=>set(key+':text',ta.value));
    el.querySelector('.pbx-copy').onclick=()=>{ try{ navigator.clipboard.writeText(ta.value); }catch(e){ ta.select(); document.execCommand('copy'); } };
    el.querySelector('.pbx-dl').onclick=()=>{ const a=document.createElement('a'); a.download=(o.name||'my-answer')+'.txt'; a.href=URL.createObjectURL(new Blob([ta.value],{type:'text/plain'})); a.click(); };
    let built=false;
    const show=m=>{ mode=m; set(key+':mode',m); body.hidden=!m; hide.hidden=!m;
      el.querySelectorAll('[data-m]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m===m));
      w.hidden=m!=='write'; t.hidden=m!=='type';
      if(m==='write'){ if(!built){ built=true; draw(w,o); } else dispatchEvent(new Event('resize')); } };
    el.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>show(b.dataset.m));
    hide.onclick=()=>show('');
    show(mode);
  }
  window.Pad={create};
})();
