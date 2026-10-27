/* Concept graphics: one small infographic per concept, drawn in SVG so it follows light/dark mode.
   CG.svg(w,h,body,aria) wraps; helpers draw cards, labels, arrows, ticks, crosses, pills and bell curves. */
(function(){
  const F='font-family="Schibsted Grotesk,Arial,sans-serif"', M='font-family="JetBrains Mono,Consolas,monospace"';
  const esc=s=>String(s).replace(/&(?!#?\w+;)/g,'&amp;').replace(/</g,'&lt;');
  const svg=(w,h,body,aria)=>`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(aria||'Concept graphic')}"><defs><marker id="cg-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>${body}</svg>`;
  const card=(x,y,w,h,col='var(--wk)',o={})=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r??14}" fill="${col}" fill-opacity="${o.op??0.1}" stroke="${col}" stroke-opacity="${o.sop??0.55}" stroke-width="${o.sw??1.5}"/>`;
  const text=(x,y,s,o={})=>`<text x="${x}" y="${y}" text-anchor="${o.a||'start'}" ${o.mono?M:F} font-size="${o.s||14}" font-weight="${o.w||400}" fill="${o.c||'var(--ink)'}"${o.it?' font-style="italic"':''}>${s}</text>`;
  const arrow=(x1,y1,x2,y2,col='var(--muted)',w=2)=>`<path d="M${x1},${y1} L${x2},${y2}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#cg-ah)"/>`;
  const curveArrow=(x1,y1,cx,cy,x2,y2,col='var(--muted)',w=2)=>`<path d="M${x1},${y1} Q${cx},${cy} ${x2},${y2}" stroke="${col}" stroke-width="${w}" fill="none" marker-end="url(#cg-ah)"/>`;
  const tick=(cx,cy,r=12,col='var(--c3)')=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/><path d="M${cx-r*.45},${cy} l${r*.32},${r*.34} l${r*.6},${-r*.66}" stroke="var(--surface)" stroke-width="${r*.22}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const cross=(cx,cy,r=12,col='#C62828')=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/><path d="M${cx-r*.38},${cy-r*.38} l${r*.76},${r*.76} M${cx+r*.38},${cy-r*.38} l${-r*.76},${r*.76}" stroke="var(--surface)" stroke-width="${r*.22}" stroke-linecap="round"/>`;
  const pill=(x,y,w,h,s,col='var(--wk)',o={})=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${col}" fill-opacity="${o.op??1}"/>${text(x+w/2,y+h/2+(o.s||14)*0.36,s,{a:'middle',s:o.s||14,w:700,c:o.c||'var(--surface)',mono:o.mono})}`;
  /* bell curve between x0 and x1, axis at y=base, peak height h; returns points along the curve (for paths and shading) */
  const bellPts=(x0,x1,base,h,n=120)=>{ const pts=[]; for(let i=0;i<=n;i++){ const z=-3.6+7.2*i/n, x=x0+(x1-x0)*i/n; pts.push([x,base-h*Math.exp(-z*z/2)]); } return pts; };
  const zx=(x0,x1,z)=>x0+(x1-x0)*(z+3.6)/7.2;
  const bell=(x0,x1,base,h,o={})=>{ const p=bellPts(x0,x1,base,h); return `<path d="M${p.map(q=>q.join(',')).join(' L')}" fill="none" stroke="${o.col||'var(--wk)'}" stroke-width="${o.w||2.6}"/>`; };
  /* shaded area under the bell between z-values a and b */
  const bellArea=(x0,x1,base,h,a,b,col='var(--wk)',op=0.35)=>{ const p=bellPts(x0,x1,base,h,240).filter(([x])=>x>=zx(x0,x1,a)-1e-6&&x<=zx(x0,x1,b)+1e-6); if(!p.length) return ''; return `<path d="M${p[0][0]},${base} L${p.map(q=>q.join(',')).join(' L')} L${p[p.length-1][0]},${base} Z" fill="${col}" fill-opacity="${op}"/>`; };
  const axis=(x0,x1,y,col='var(--ink)')=>`<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="${col}" stroke-width="1.5"/>`;
  const brace=(x1,x2,y,up=true,col='var(--wk)')=>{ const d=up?-8:8, m=(x1+x2)/2; return `<path d="M${x1},${y} q0,${d} 8,${d} L${m-6},${y+d} q6,0 6,${d} q0,${-d} 6,${-d} L${x2-8},${y+d} q8,0 8,${-d}" fill="none" stroke="${col}" stroke-width="2"/>`; };
  window.CG={svg,card,text,arrow,curveArrow,tick,cross,pill,bell,bellArea,bellPts,zx,axis,brace,esc};
})();
