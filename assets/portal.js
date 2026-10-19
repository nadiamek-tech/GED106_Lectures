/* Course portal · shared by every course site (same file in each repo).
   Reads window.COURSE from assets/course-info.js. Only that file changes from course to course.
   Portal.header(cur)  sticky menu: code + title · Home · Lectures · Labs · Exams · extras (C.navExtra) · Theme
   Portal.home()       main page: hero, 3 buttons, help agents, FAQ, calendar, CLOs and grades, submissions
   Portal.calendar(el) Portal.examCards(el) Portal.submissions(el)  pieces reused on other pages */
(function(){
  const C=window.COURSE; if(!C) return;
  const PR=window.PROF||{};
  ['email','office','officeHours','bookingNote','schedule'].forEach(k=>{ if(C[k]==null&&PR[k]!=null) C[k]=PR[k]; });
  if(!C.instructor) C.instructor=PR.name;
  const L=Object.assign({},PR.links||{}); Object.entries(C.links||{}).forEach(([k,v])=>{ if(v) L[k]=v; });
  const TZ='Asia/Dubai';
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const $=(s,r=document)=>r.querySelector(s);
  const fmt=(iso,o)=>new Intl.DateTimeFormat('en-GB',Object.assign({timeZone:TZ},o)).format(new Date(iso));
  const dayLong=iso=>fmt(iso,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const dayShort=iso=>fmt(iso,{weekday:'short',day:'numeric',month:'short'});
  const time=iso=>fmt(iso,{hour:'numeric',minute:'2-digit',hour12:true}).replace(/\s?([ap])m/i,(m,a)=>' '+a.toUpperCase()+'M');
  const daysTo=iso=>Math.ceil((new Date(iso).getTime()-Date.now())/86400000);
  const until=iso=>{ const d=daysTo(iso); return d>1?d+' days to go':d===1?'Tomorrow':d===0?'Today':''; };
  const A=C.assess||[], byId=id=>A.find(a=>a.id===id);
  const typeTag=t=>`<span class="pt-tag ${t==='Lab'?'lab':'lec'}">${esc(t)}</span>`;
  const ext=u=>/^https?:/.test(u)?' target="_blank" rel="noopener"':'';

  const SV=d=>`<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const IC={
    ask:SV('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
    help:SV('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><path d="M12 17h.01"/>'),
    absent:SV('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M10 13.5l4 4M14 13.5l-4 4"/>'),
    meet:SV('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.5 3.6-5.5 7-5.5s6.2 2 7 5.5"/>'),
    grades:SV('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    lectures:SV('<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M10 8.5v5l4.5-2.5z"/><path d="M8 21h8"/>'),
    labs:SV('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 4v16"/>'),
    exams:SV('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 13l2 2 4-4"/>'),
    lec:SV('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 12h5M10 16h5"/>'),
    lab:SV('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 4v16"/>'),
    project:SV('<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M7 7h10M7 11h4M13 11h4v6h-4zM7 14h4M7 17h4"/>'),
    present:SV('<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8M7 12l3-3 2 2 4-4"/>'),
    toolkit:SV('<path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L3.5 17.5l3 3 5.7-5.7a4 4 0 0 0 5.3-5.3l-2.6 2.6-2.4-.6-.6-2.4z"/>')
  };
  /* main sections: C.nav = [{key,label,href,icon,blurb}] overrides Lectures/Labs/Exams */
  function NAV(){ const P=C.pages||{}, B=C.blurbs||{};
    return C.nav||[{key:'lectures',label:'Lectures',href:P.lectures||'lectures.html',icon:'lectures',blurb:B.lectures||'Narrated lectures, practice with answers.'},
      {key:'labs',label:'Labs',href:P.labs||'labs.html',icon:'labs',blurb:B.labs||'Step-by-step lab guides.'},
      {key:'exams',label:'Exams',href:P.exams||'exams.html',icon:'exams',blurb:B.exams||'Dates, what is included, revision.'}]; }
  /* ---------- header ---------- */
  function header(cur){
    const el=document.getElementById('hub'); if(!el||el.children.length) return;
    /* menu: Home · main sections · extras (C.navExtra = [[href,label,key]], e.g. My Credentials) · Theme */
    const nav=[['index.html','Home','home']].concat(NAV().map(n=>[n.href,n.label,n.key]),C.navExtra||[]);
    const sub=C.short||[].concat(C.title||[]).join(' ');
    el.className='pt-hub'; el.innerHTML=`<div class="pt-hub-in"><a class="crs" href="index.html"><b>${esc(C.code)}</b>${sub?`<span>${esc(sub)}</span>`:''}</a><nav aria-label="Course">${nav.map(([h,t,k])=>`<a href="${esc(h)}"${k===cur?' aria-current="page"':''}>${esc(t)}</a>`).join('')}</nav><button type="button" class="pt-theme" title="Light or dark">◐ Theme</button></div>`;
    el.querySelector('.pt-theme').addEventListener('click',()=>window.GED102Theme&&GED102Theme.toggle());
  }

  /* ---------- dialog ---------- */
  let dlg;
  function dialog(html,colour){
    if(!dlg){ dlg=document.createElement('dialog'); dlg.className='pt-dlg pt'; document.body.appendChild(dlg);
      dlg.addEventListener('click',e=>{ if(e.target===dlg||e.target.closest('.x')) dlg.close(); }); }
    dlg.style.setProperty('--ag',colour||'var(--wk)');
    dlg.innerHTML=`<div class="pt-dlg-in">${html}</div>`;
    dlg.querySelectorAll('[data-agent]').forEach(b=>b.addEventListener('click',e=>{ e.preventDefault(); agent(b.dataset.agent); }));
    if(dlg.open) dlg.close(); if(dlg.showModal) dlg.showModal(); else dlg.setAttribute('open','');
    const f=dlg.querySelector('.pt-btn'); if(f) f.focus();
  }
  const head=(face,t,s)=>`<div class="pt-dlg-head"><span class="face" aria-hidden="true">${face}</span><div><h3>${t}</h3>${s?`<small>${s}</small>`:''}</div><button type="button" class="x" aria-label="Close">×</button></div>`;

  /* ---------- agents ---------- */
  const mail=(subj,body)=>`mailto:${C.email}?subject=${encodeURIComponent('['+C.code+'] '+subj)}&body=${encodeURIComponent(body)}`;
  const AG={
    ask:{face:IC.ask,t:'Ask me',s:'Find anything in the course',c:'var(--wk)'},
    help:{face:IC.help,t:'General help',s:'A topic, Moodle, any problem',c:'#2E7D5B',
      what:['In the form, choose “General help”','Which week or topic, and what you tried','A screenshot if something does not work'],
      url:()=>L.formHelp||L.form, btn:'Open the form',
      mail:()=>mail('General help','Name:\nStudent ID:\nSection:\nWeek / topic:\nMy question:\n')},
    absent:{face:IC.absent,t:'I was / will be absent',s:'Missed class, quiz or exam',c:'#B4562F',
      what:['Date(s) and which class: lecture or lab','The assessment missed, if any','The reason and your evidence (medical note, official letter)'],
      url:()=>L.formAbsent||L.form, btn:'Open the form',
      mail:()=>mail('Absence','Name:\nStudent ID:\nSection:\nDate(s) of absence:\nClass: lecture / lab\nReason:\nAssessment missed (if any):\nEvidence: attached / will bring\n')},
    meet:{face:IC.meet,t:'Meet the professor',s:'Office hours and booking',c:'#5B3FA8'},
    grades:{face:IC.grades,t:'Check my grades',s:'Student portal',c:'#1F6F8B',
      what:['Log in with your CUD account','Marks appear once grading is complete','A question about a mark? Use “General help”'],
      url:()=>L.portal, btn:'Open the student portal'}
  };
  const DAYS=['Mon','Tue','Wed','Thu','Fri'];
  function week(){
    const S=C.schedule||[]; if(!S.length) return '';
    const h0=Math.min(...S.map(x=>x[1])), h1=Math.max(...S.map(x=>x[2])), hh=h=>(h>12?h-12:h)+(h>=12?' PM':' AM');
    const D=[0,1,2,3,4].filter(d=>S.some(x=>x[0]===d));
    let rows='';
    for(let h=h0;h<h1;h++){
      rows+=`<tr><th>${hh(h)}</th>`;
      for(const d of D){
        const e=S.find(x=>x[0]===d&&x[1]===h);
        if(e){ rows+=`<td rowspan="${e[2]-e[1]}" class="${e[4]==='oh'?'oh':'busy'}">${esc(e[3])}</td>`; }
        else if(!S.some(x=>x[0]===d&&x[1]<h&&x[2]>h)) rows+='<td></td>';
      }
      rows+='</tr>';
    }
    return `<div class="pt-week"><table><thead><tr><th></th>${D.map(d=>`<th>${DAYS[d]}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  function agent(k){
    if(k==='ask'){ if(dlg&&dlg.open) dlg.close(); return C.ask&&C.ask(); }
    const a=AG[k];
    if(k==='meet'){
      const u=L.booking;
      dialog(head(a.face,a.t,C.office?'Office hours in the '+esc(C.office):'')+week()
        +`<p class="pt-note" style="margin:10px 0 12px">${esc(C.bookingNote||'Email the professor to book a time.')}</p><div class="row">`
        +(u?`<a class="pt-btn" href="${esc(u)}"${ext(u)}>Book a time ↗</a>`:'')
        +`<a class="pt-btn${u?' ghost':''}" href="${mail('Booking request','Name:\nStudent ID:\nSection:\nBooking: office hours / library study room / incubator support session\nPreferred day and time:\nTopic:\n')}">Email to book</a></div>`,a.c);
      return;
    }
    const u=a.url&&a.url();
    const go=u?`<a class="pt-btn" href="${esc(u)}"${ext(u)}>${a.btn} ↗</a>`
      : a.mail?`<a class="pt-btn" href="${a.mail()}">Email the professor</a>` : `<span class="pt-btn" aria-disabled="true">Link coming soon</span>`;
    dialog(head(a.face,a.t,a.s)+`<p style="margin:0 0 4px"><b>Have this ready:</b></p><ul>${a.what.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="row">${go}</div>`
      +(k!=='grades'&&!u?`<p class="pt-note">Form link coming soon. Until then, email the professor: ${esc(C.email)}</p>`:''),a.c);
  }
  function agents(el){
    el.innerHTML=Object.entries(AG).map(([k,a])=>`<button type="button" class="pt-agent" data-k="${k}" style="--ag:${a.c}"><span class="face" aria-hidden="true">${a.face}</span><b>${a.t}</b><small>${esc(a.s)}</small></button>`).join('');
    el.querySelectorAll('.pt-agent').forEach(b=>b.addEventListener('click',()=>agent(b.dataset.k)));
  }

  /* ---------- assessments ---------- */
  function whenText(a){ return a.date?`${dayLong(a.date)}${a.time!==false?', '+(a.timeText||time(a.date)):''}`:(a.when||''); }
  function assess(id){
    const a=byId(id); if(!a) return;
    const rows=[['Type',typeTag(a.type)+(a.done?' <span class="pt-tag done">Done</span>':'')],['Weight',esc(a.weight)],['When',esc(whenText(a))],
      a.place?['Where',esc(a.place)]:null, a.covers?['Includes',a.covers.map(esc).join('<br>')]:null, a.format?['Format',esc(a.format)]:null, a.clos?['CLOs',esc(a.clos)]:null,
      a.submit?['Submit',a.submit.dueText?esc(a.submit.dueText)+' · on Moodle':'On Moodle']:null].filter(Boolean);
    const btns=(a.revise||[]).map(([t,h])=>`<a class="pt-btn ghost" href="${esc(h)}"${ext(h)}>${esc(t)} →</a>`);
    if(a.submit) btns.unshift(a.submit.link?`<a class="pt-btn" href="${esc(a.submit.link)}" target="_blank" rel="noopener">Submit on Moodle ↗</a>`:`<span class="pt-btn" aria-disabled="true">Moodle link coming soon</span>`);
    dialog(head(a.type==='Lab'?IC.lab:IC.lec,esc(a.name),a.date&&!a.done?until(a.date):'')+`<dl class="kv">${rows.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl><div class="row">${btns.join('')}</div>`
      +(a.done?'':`<p class="pt-note">Can't make it? <a href="#" data-agent="absent">Tell the professor →</a></p>`), a.type==='Lab'?'var(--good)':'var(--wk)');
  }
  const chip=id=>{ const a=byId(id); return a?`<button type="button" class="pt-chip ${a.type==='Lab'?'lab':''}" data-a="${id}">${esc(a.short||a.name)}<span class="i">ⓘ</span></button>`:''; };
  const wire=el=>el.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>assess(b.dataset.a)));

  function calendar(el){
    const cell=(x,l)=>{ if(!x) return `<td data-l="${l}"></td>`; const [t,h]=Array.isArray(x)?x:[x];
      return `<td data-l="${l}">${h?`<a href="${esc(h)}">${esc(t)}</a>`:`<span class="${C.soonLabel!==false&&!h?'soon':''}">${esc(t)}</span>`}</td>`; };
    const hasLab=C.weeks.some(w=>w.lab);
    el.innerHTML=`<div style="overflow-x:auto"><table class="pt-cal"><thead><tr><th>Week</th><th>Lecture</th>${hasLab?'<th>Lab</th>':''}<th>Assessment</th></tr></thead><tbody>${
      C.weeks.map(w=>`<tr class="${(w.ev||[]).length?'ex':''}"><td class="w">W${esc(w.w)}</td>${cell(w.lec,'Lecture')}${hasLab?cell(w.lab,'Lab'):''}<td>${(w.ev||[]).length?`<div class="pt-ev">${w.ev.map(chip).join('')}</div>`:''}</td></tr>`).join('')
    }</tbody></table></div><div class="pt-legend">${hasLab?'<span><i class="dot"></i>Lecture assessment</span><span><i class="dot lab"></i>Lab assessment</span>':''}<span>Click an assessment for details. Linked topics are open now.</span></div>`;
    wire(el);
  }
  function examCards(el){
    const n=nextExam();
    el.innerHTML=A.map(a=>`<div class="pt-exam" data-card="${a.id}"><span class="tags">${typeTag(a.type)} <span class="pt-tag">${esc(a.weight)}</span>${a.done?' <span class="pt-tag done">Done</span>':''}${n&&n.id===a.id?` <span class="pt-tag next">Next · ${until(a.date)}</span>`:''}</span><h3><button type="button" data-a="${a.id}">${esc(a.name)}</button></h3><p>${esc(whenText(a))}</p>${
      (a.revise||[]).length?`<span class="flags">${a.revise.map(([t,h])=>`<a class="pt-flag" href="${esc(h)}"${ext(h)}>${esc(t)} →</a>`).join('')}</span>`:''}</div>`).join('');
    wire(el);
    el.querySelectorAll('.pt-exam').forEach(c=>c.addEventListener('click',e=>{ if(!e.target.closest('a,button')) assess(c.dataset.card); }));
  }
  function submissions(el){
    const S=A.filter(a=>a.submit).sort((x,y)=>(x.submit.due||'9').localeCompare(y.submit.due||'9'));
    el.innerHTML=S.map(a=>{ const s=a.submit, past=s.due&&daysTo(s.due)<0;
      return `<div class="pt-sub ${past?'past':''}"><span>${typeTag(a.type)}</span><span class="w${String(a.weight).length>4?' sm':''}">${esc(a.weight)}</span><h3>${esc(a.name)}</h3><span class="due">Due: ${esc(s.dueText||(s.due?dayShort(s.due):'to be announced'))}${s.due&&!past?' · '+until(s.due):''}</span>${
        past?'<span class="pt-btn" aria-disabled="true">Closed</span>':s.link?`<a class="pt-btn" href="${esc(s.link)}" target="_blank" rel="noopener">Submit on Moodle ↗</a>`:'<span class="pt-btn" aria-disabled="true">Moodle link coming soon</span>'
      }<button type="button" class="pt-btn ghost" data-a="${a.id}">Details</button></div>`; }).join('')||'<p class="sub">Nothing to submit right now.</p>';
    wire(el);
  }
  function nextExam(){ return A.filter(a=>a.date&&!a.done&&daysTo(a.date)>=0).sort((x,y)=>x.date.localeCompare(y.date))[0]; }

  /* ---------- FAQ ---------- */
  function faq(el){
    const Q=[
      ['I missed a quiz or an exam. What do I do?',`Tell the professor as soon as possible with <a href="#" data-agent="absent">I was / will be absent</a> and add your evidence (medical note or official letter). A make-up needs an accepted excuse, as in the CUD Student Handbook.`],
      ['Is this an online course?',C.onlineAnswer||'No. Classes are on campus and taught on the board, and exams are on paper in class. Hybrid sessions happen only when the university announces them. This site supports your classes: notes, practice and dates.'],
      ['How do I contact or meet the professor?',`Email <a href="mailto:${esc(C.email)}">${esc(C.email)}</a>. Office hours: ${esc(C.officeHours||'announced in class')}${C.office?', '+esc(C.office):''}. <a href="#" data-agent="meet">See the weekly schedule and book</a>.`],
      ['What are the assessments?',`Each assessment, its weight and what it includes is on the <a href="${esc(C.assessPage||(C.pages||{}).exams||'exams.html')}">${esc(C.assessLabel||'Exams')}</a> page.`],
      ['What if I miss classes?','Attendance is compulsory. Absent for 25% or more of classes: no final assessment (grade “FA”).']
    ].concat((C.faqExtra||[]).map(x=>x.length===3?[x[1],x[2]]:x));
    el.className='pt-faq';
    el.innerHTML=Q.map(([q,a])=>`<details><summary>${esc(q)}</summary><div>${a}</div></details>`).join('');
    el.querySelectorAll('[data-agent]').forEach(b=>b.addEventListener('click',e=>{ e.preventDefault(); agent(b.dataset.agent); }));
  }

  /* ---------- home ---------- */
  function home(){
    header('home');
    const root=document.getElementById('portal'); const P=C.pages||{}, n=nextExam(), hl=!n&&C.highlight&&byId(C.highlight);
    root.className='pt pt-wrap';
    root.innerHTML=`
<section class="pt-hero"><span class="pt-eyebrow">${esc(C.eyebrow||C.code)}</span><h1>${esc(C.title[0])} <span>${esc(C.title[1]||'')}</span></h1><p class="pt-by">${esc(C.role||'Instructor')}: <b>${esc(C.instructor)}</b>${C.classTime?' · '+esc(C.classTime):''}</p>
${n?`<button type="button" class="pt-next" data-a="${n.id}"><b>Next: ${esc(n.name)}</b><span>${esc(dayShort(n.date))}${n.time!==false?' · '+esc(n.timeText||time(n.date)):''}${n.place?' · '+esc(n.place):''}</span><span class="mono">${until(n.date)}</span><b style="margin-left:auto">Details →</b></button>`:hl?`<button type="button" class="pt-next" data-a="${hl.id}"><b>Next: ${esc(hl.name)}</b><span>${esc(whenText(hl))}</span><b style="margin-left:auto">Details →</b></button>`:''}</section>
<div class="pt-big">${NAV().map(n=>`<a href="${esc(n.href)}"><span class="ic">${IC[n.icon]||IC.lec}</span><b>${esc(n.label)}</b><span>${esc(n.blurb||'')}</span></a>`).join('')}</div>
<section class="pt-help" aria-label="Help"><form class="pt-find" role="search"><input type="search" placeholder="Search the course: a topic, a formula, a date" aria-label="Search the course" autocomplete="off"><button type="submit">Search</button></form><div class="pt-hits" aria-live="polite"></div><div class="pt-agents"></div></section>
<nav class="pt-jump" aria-label="On this page"><a href="#faq">FAQ</a><a href="#calendar">Calendar</a><a href="#clos">CLOs</a><a href="#submissions">Submissions</a></nav>
<h2 id="faq">FAQ</h2><div id="pt-faq"></div>
<h2 id="calendar">Semester calendar</h2><p class="sub">Click an assessment to see what it includes.</p><div id="pt-cal"></div>
<h2 id="clos">Course learning outcomes</h2><p class="sub">What you will be able to do by the end of the course.</p><div class="pt-clos">${C.clos.map(([k,t])=>`<div><b>${esc(k)}</b><span>${esc(t)}</span></div>`).join('')}</div>
<h2 id="submissions">Upcoming submissions</h2><p class="sub">Every submission is on Moodle. Use these buttons to go straight to the right place.</p><div class="pt-subs" id="pt-subs"></div>`;
    agents($('.pt-agents',root)); faq($('#pt-faq',root)); calendar($('#pt-cal',root)); submissions($('#pt-subs',root)); wire($('.pt-hero',root));
    const f=$('.pt-find',root), inp=$('input',f), hits=$('.pt-hits',root);
    const show=()=>{ const q=inp.value.trim(); if(!C.search){ return; } if(q.length<2){ hits.innerHTML=''; return; }
      const r=C.search(q)||[]; hits.innerHTML=r.slice(0,6).map(x=>`<a href="${esc(x.l)}"><b>${esc(x.t)}</b>${x.s?`<small>${esc(x.s)}</small>`:''}</a>`).join('')||'<p class="sub" style="margin:0">No match. Try one key word, or use Ask me.</p>'; };
    inp.addEventListener('input',show);
    f.addEventListener('submit',e=>{ e.preventDefault(); if(C.search) show(); else if(C.openSearch) C.openSearch(inp.value); });
  }

  window.Portal={header,home,agents,calendar,examCards,submissions,assess,agent,faq};
})();
