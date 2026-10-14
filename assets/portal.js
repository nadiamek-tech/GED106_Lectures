/* Course portal · shared by every course site (same file in each repo).
   Reads window.COURSE from assets/course-info.js. Only that file changes from course to course.
   Portal.header(cur)  sticky header: course code · Lectures · Labs · Exams · theme
   Portal.home()       main page: hero, 3 buttons, help agents, FAQ, calendar, CLOs and grades, submissions
   Portal.calendar(el) Portal.examCards(el) Portal.submissions(el)  pieces reused on other pages */
(function(){
  const C=window.COURSE; if(!C) return;
  const L=C.links||{}, TZ='Asia/Dubai';
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

  /* ---------- header ---------- */
  function header(cur){
    const el=document.getElementById('hub'); if(!el||el.children.length) return;
    const P=C.pages||{}, nav=[[P.lectures||'lectures.html','Lectures','lectures'],[P.labs||'labs.html','Labs','labs'],[P.exams||'exams.html','Exams','exams']];
    el.className='pt-hub'; el.innerHTML=`<div class="pt-hub-in"><a class="crs" href="index.html">${esc(C.code)}</a><nav aria-label="Course sections">${nav.map(([h,t,k])=>`<a href="${h}" ${k===cur?'aria-current="page"':''}>${t}</a>`).join('')}</nav><button type="button" class="pt-theme" title="Light or dark">◐</button></div>`;
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
    ask:{face:'🙂',t:'Ask me',s:'Find anything in the course',c:'var(--wk)'},
    help:{face:'🙋',t:'I need help',s:'A topic, Moodle, any problem',c:'#2E7D5B',
      what:['Which week or topic, and what you tried','A screenshot if something does not work','The reply comes to your CUD email'],
      url:()=>L.formHelp||L.form, btn:'Open the request form',
      mail:()=>mail('I need help','Name:\nStudent ID:\nSection:\nWeek / topic:\nMy question:\n')},
    absent:{face:'🗓️',t:'I will be absent',s:'Before or after the class',c:'#B4562F',
      what:['Date(s) and which class: lecture or lab','The reason','Your evidence (medical note, official letter)','Missed a quiz or exam? Choose that option in the form'],
      url:()=>L.formAbsent||L.form, btn:'Open the absence form',
      mail:()=>mail('Absence','Name:\nStudent ID:\nSection:\nDate(s) of absence:\nClass: lecture / lab\nReason:\nAssessment missed (if any):\nEvidence: attached / will bring\n')},
    meet:{face:'👩‍🏫',t:'Meet the professor',s:C.officeHours?'Office hours: '+C.officeHours:'Book a time',c:'#5B3FA8',
      what:[C.officeHours?'Office hours: '+C.officeHours:'',C.office?'Office: '+C.office:'','Book a slot, then bring your question ready'].filter(Boolean),
      url:()=>L.booking||L.formMeet, btn:'Book a time',
      mail:()=>mail('Meeting request','Name:\nStudent ID:\nSection:\nPreferred day and time:\nTopic:\n')},
    grades:{face:'📊',t:'Check my grades',s:'Student portal',c:'#1F6F8B',
      what:['Log in with your CUD account','Marks appear once grading is complete','A question about a mark? Use “I need help”'],
      url:()=>L.portal, btn:'Open the student portal'}
  };
  function agent(k){
    if(k==='ask'){ if(dlg&&dlg.open) dlg.close(); return C.ask&&C.ask(); }
    const a=AG[k], u=a.url&&a.url();
    const go=u?`<a class="pt-btn" href="${esc(u)}"${ext(u)}>${a.btn} ↗</a>`
      : a.mail?`<a class="pt-btn" href="${a.mail()}">Email the professor</a>` : `<span class="pt-btn" aria-disabled="true">Link coming soon</span>`;
    dialog(head(a.face,a.t,a.s)+`<p style="margin:0 0 4px"><b>Have this ready:</b></p><ul>${a.what.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="row">${go}</div>`
      +(k!=='grades'?`<p class="pt-note">${u?'All requests go to one form, so the professor sees them straight away.':'The form link is coming soon. Until then, email the professor: '+esc(C.email)}</p>`:''),a.c);
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
    dialog(head(a.type==='Lab'?'🧪':'📝',esc(a.name),a.date&&!a.done?until(a.date):'')+`<dl class="kv">${rows.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl><div class="row">${btns.join('')}</div>`
      +(a.done?'':`<p class="pt-note">Can't make it? <a href="#" data-agent="absent">Tell the professor →</a></p>`), a.type==='Lab'?'var(--good)':'var(--wk)');
  }
  const chip=id=>{ const a=byId(id); return a?`<button type="button" class="pt-chip ${a.type==='Lab'?'lab':''}" data-a="${id}">${a.type==='Lab'?'🧪':'📝'} ${esc(a.short||a.name)}<span class="i">ⓘ</span></button>`:''; };
  const wire=el=>el.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>assess(b.dataset.a)));

  function calendar(el){
    const cell=(x,l)=>{ if(!x) return `<td data-l="${l}"></td>`; const [t,h]=Array.isArray(x)?x:[x];
      return `<td data-l="${l}">${h?`<a href="${esc(h)}">${esc(t)}</a>`:`<span class="${C.soonLabel!==false&&!h?'soon':''}">${esc(t)}</span>`}</td>`; };
    el.innerHTML=`<div style="overflow-x:auto"><table class="pt-cal"><thead><tr><th>Week</th><th>Lecture</th><th>Lab</th><th>Assessment</th></tr></thead><tbody>${
      C.weeks.map(w=>`<tr class="${(w.ev||[]).length?'ex':''}"><td class="w">W${esc(w.w)}</td>${cell(w.lec,'Lecture')}${cell(w.lab,'Lab')}<td>${(w.ev||[]).length?`<div class="pt-ev">${w.ev.map(chip).join('')}</div>`:''}</td></tr>`).join('')
    }</tbody></table></div><div class="pt-legend"><span>📝 Lecture assessment</span><span>🧪 Lab assessment</span><span>Click an assessment for details. Linked topics are open now.</span></div>`;
    wire(el);
  }
  function examCards(el){
    el.innerHTML=A.map(a=>`<button type="button" class="pt-exam" data-a="${a.id}"><span>${typeTag(a.type)} <span class="pt-tag">${esc(a.weight)}</span>${a.done?' <span class="pt-tag done">Done</span>':''}</span><h3>${esc(a.name)}</h3><p>${esc(whenText(a))}</p>${a.covers?`<p>${esc(a.covers[0])}${a.covers.length>1?' …':''}</p>`:''}</button>`).join('');
    wire(el);
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
    const book=L.booking?`<a href="${esc(L.booking)}" target="_blank" rel="noopener">Book a time ↗</a>`:'Use <a href="#" data-agent="meet">Meet the professor</a>.';
    const weights=A.map(a=>`${esc(a.name)} · ${esc(a.weight)}`).join('<br>');
    const Q=[
      ['❓','I missed a quiz or an exam. What do I do?',`Tell the professor as soon as possible with <a href="#" data-agent="absent">I will be absent</a> and add your evidence (medical note or official letter). A make-up needs an accepted excuse, as in the CUD Student Handbook.`],
      ['✉️','What is the professor’s email?',`<a href="mailto:${esc(C.email)}">${esc(C.email)}</a> · ${esc(C.instructor)}`],
      ['🕑','When are office hours?',esc(C.officeHours||'Announced in class.')+(C.office?' · Office '+esc(C.office):'')],
      ['📅','How do I book office hours?',book],
      ['📝','What are the assessments?',weights+`<br><a href="#calendar">See them on the calendar →</a>`],
      ['📤','Where do I submit my work?',`On Moodle, through the buttons in <a href="#submissions">Upcoming submissions</a>. Never by email.`],
      ['📊','How do I check my grades?',L.portal?`<a href="${esc(L.portal)}" target="_blank" rel="noopener">Student portal ↗</a>`:'On the student portal (link coming soon).'],
      ['🚪','What if I miss classes?','Attendance is compulsory. Absent for 25% or more of classes: no final assessment (grade “FA”).'],
      ['🙋','I don’t understand a topic.',`Try <a href="#" data-agent="ask">Ask me</a> first, then <a href="#" data-agent="help">I need help</a> or office hours.`]
    ].concat((C.faqExtra||[]).map(x=>x.length===3?x:['💡',x[0],x[1]]));
    el.className='pt-faq';
    el.innerHTML=Q.map(([i,q,a])=>`<details><summary><span class="q" aria-hidden="true">${i}</span>${esc(q)}</summary><div>${a}</div></details>`).join('');
    el.querySelectorAll('[data-agent]').forEach(b=>b.addEventListener('click',e=>{ e.preventDefault(); agent(b.dataset.agent); }));
  }

  /* ---------- home ---------- */
  function home(){
    header('');
    const root=document.getElementById('portal'); const P=C.pages||{}, n=nextExam();
    root.className='pt pt-wrap';
    root.innerHTML=`
<section class="pt-hero"><span class="pt-eyebrow">${esc(C.eyebrow||C.code)}</span><h1>${esc(C.title[0])} <span>${esc(C.title[1]||'')}</span></h1><p class="pt-by">${esc(C.role||'Instructor')}: <b>${esc(C.instructor)}</b>${C.classTime?' · '+esc(C.classTime):''}</p>
${n?`<button type="button" class="pt-next" data-a="${n.id}"><b>Next: ${esc(n.name)}</b><span>${esc(dayShort(n.date))}${n.time!==false?' · '+esc(n.timeText||time(n.date)):''}${n.place?' · '+esc(n.place):''}</span><span class="mono">${until(n.date)}</span><b style="margin-left:auto">Details →</b></button>`:''}</section>
<div class="pt-big">
 <a href="${P.lectures||'lectures.html'}"><span class="ic" aria-hidden="true">🎧</span><b>Lectures</b><span>${esc(C.blurbs&&C.blurbs.lectures||'Narrated lectures, practice with answers.')}</span></a>
 <a href="${P.labs||'labs.html'}"><span class="ic" aria-hidden="true">🧪</span><b>Labs</b><span>${esc(C.blurbs&&C.blurbs.labs||'Step-by-step lab guides.')}</span></a>
 <a href="${P.exams||'exams.html'}"><span class="ic" aria-hidden="true">📝</span><b>Exams</b><span>${esc(C.blurbs&&C.blurbs.exams||'Dates, what is included, revision.')}</span></a>
</div>
<section class="pt-help" aria-label="Help"><form class="pt-find" role="search"><input type="search" placeholder="Search the course: a topic, a formula, a date" aria-label="Search the course" autocomplete="off"><button type="submit">Search</button></form><div class="pt-hits" aria-live="polite"></div><div class="pt-agents"></div></section>
<nav class="pt-jump" aria-label="On this page"><a href="#faq">FAQ</a><a href="#calendar">Calendar</a><a href="#clos">CLOs and grades</a><a href="#submissions">Submissions</a></nav>
<h2 id="faq">FAQ</h2><div id="pt-faq"></div>
<h2 id="calendar">Semester calendar</h2><p class="sub">Click an assessment to see what it includes.</p><div id="pt-cal"></div>
<h2 id="clos">CLOs and grades</h2><p class="sub">What you will be able to do by the end of the course.</p><div class="pt-clos">${C.clos.map(([k,t])=>`<div><b>${esc(k)}</b><span>${esc(t)}</span></div>`).join('')}</div>
<div class="pt-actions">${L.portal?`<a class="pt-btn" href="${esc(L.portal)}" target="_blank" rel="noopener">📊 Check my grades ↗</a>`:'<button type="button" class="pt-btn" data-agent="grades">📊 Check my grades</button>'}<a class="pt-btn ghost" href="#submissions">📤 Upcoming submissions</a></div>
<h2 id="submissions">Upcoming submissions</h2><p class="sub">Every submission is on Moodle. Use these buttons to go straight to the right place.</p><div class="pt-subs" id="pt-subs"></div>`;
    agents($('.pt-agents',root)); faq($('#pt-faq',root)); calendar($('#pt-cal',root)); submissions($('#pt-subs',root)); wire($('.pt-hero',root));
    root.querySelectorAll('.pt-actions [data-agent]').forEach(b=>b.addEventListener('click',()=>agent(b.dataset.agent)));
    const f=$('.pt-find',root), inp=$('input',f), hits=$('.pt-hits',root);
    const show=()=>{ const q=inp.value.trim(); if(!C.search){ return; } if(q.length<2){ hits.innerHTML=''; return; }
      const r=C.search(q)||[]; hits.innerHTML=r.slice(0,6).map(x=>`<a href="${esc(x.l)}"><b>${esc(x.t)}</b>${x.s?`<small>${esc(x.s)}</small>`:''}</a>`).join('')||'<p class="sub" style="margin:0">No match. Try one key word, or press 🙂 Ask me.</p>'; };
    inp.addEventListener('input',show);
    f.addEventListener('submit',e=>{ e.preventDefault(); if(C.search) show(); else if(C.openSearch) C.openSearch(inp.value); });
  }

  window.Portal={header,home,calendar,examCards,submissions,assess,agent,faq};
})();
