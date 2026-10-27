/* GED 106 credential pathway: one free unit per week on the tools of the course.
   Launched in Week 8: Weeks 1–8 units are the catch-up list (finish by Week 11), then one unit a week. Badge targets: IBM Week 12, Power BI Week 13, Microsoft 365 Week 14.
   Verified Oct 2026: IBM SkillsBuild Data Fundamentals (free, Credly badge), Microsoft Learn Power BI modules
   (free, trophies on your Learn profile), Microsoft Support training for OneDrive, Forms and Excel (free, no badge: screenshot proof).
   Optional paid exams (for example Microsoft MO-211 Excel Expert or PL-300 Power BI) are not required. */
window.COURSE_CREDS = {
  form: '',  // Microsoft Forms link for proof submission (bonus). Paste it here.
  start: 8,  // week the pathway was introduced in class
  /* cert = where the credential itself lives (the link students share); free = verified free to learn AND free credential */
  badges: [
    { id:'ibm', prov:'IBM SkillsBuild', name:'Data Fundamentals', proof:'Credly digital badge', done:12, free:true,
      url:'https://skillsbuild.org/college-students/course-catalog/data-fundamentals',
      cert:'https://www.credly.com/org/ibm-skillsbuild/badge/data-fundamentals', certLabel:'The badge on Credly',
      sign:'Create a free IBM SkillsBuild account (18+), then accept the badge on Credly when IBM emails you.' },
    { id:'pbi', prov:'Microsoft Learn', name:'Power BI: analyse and design reports', proof:'Badges and a trophy on your Learn profile', done:13, free:true,
      url:'https://learn.microsoft.com/en-us/training/paths/build-power-bi-visuals-reports/',
      cert:'https://learn.microsoft.com/en-us/users/me/', certLabel:'Your Learn profile › Achievements',
      sign:'Sign in to Microsoft Learn with your CUD Microsoft 365 account. Each module gives a badge; the full path gives a trophy.' },
    { id:'m365', prov:'Microsoft 365', name:'OneDrive, Forms and Excel skills', proof:'Screenshot of your own work', done:14, free:true,
      url:'https://support.microsoft.com/en-us/office/microsoft-365-basics-video-training-396b8d9e-e118-42d0-8a0d-87d1f2f055fb',
      cert:'', certLabel:'none (skills practice; your screenshot is the proof)',
      sign:'Use your CUD Microsoft 365 account. There is no certificate: your screenshot is the proof.' }
  ],
  weeks: {
    1: { b:'m365', mod:'OneDrive: save, sync and share your course files', part:'Video tutorials', url:'https://support.microsoft.com/en-us/office/onedrive-video-tutorials-1f608184-b7e6-43ca-8753-2ff679203132', learn:'Save, sync and share files in OneDrive.', show:'Your GED106 folder in OneDrive, shared with a classmate.' },
    2: { b:'ibm', mod:'Data Fundamentals: create your account and begin', part:'Start', url:'https://skillsbuild.org/college-students/course-catalog/data-fundamentals', learn:'Start the course: what data is and how it is used.', show:'Your enrolled course page.' },
    3: { b:'m365', mod:'Microsoft Forms: create a new form or quiz', part:'Guide', url:'https://support.microsoft.com/en-us/office/create-a-new-form-or-quiz-3c39c220-e30e-401d-bb6f-c1861d5aea01', learn:'Build a form or quiz and share it.', show:'A three-question form you made.' },
    4: { b:'pbi', mod:'Explore the analytics process that turns data into insights', part:'Module', url:'https://learn.microsoft.com/en-us/training/modules/data-analytics-microsoft/', learn:'The roles and steps that turn data into insights.', show:'The module marked complete.' },
    5: { b:'ibm', mod:'Data Fundamentals: continue', part:'Continue', url:'https://skillsbuild.org/college-students/course-catalog/data-fundamentals', learn:'The data analysis process.', show:'Your course progress page.' },
    6: { b:'m365', mod:'Excel: learn to use Power Query and Power Pivot', part:'Guide', url:'https://support.microsoft.com/en-us/office/learn-to-use-power-query-and-power-pivot-in-excel-42d895c2-d1d7-41d0-88da-d1ed7ecc102d', learn:'Import and shape data with Power Query; build a data model with Power Pivot.', show:'A table you imported with Power Query.' },
    7: { b:'ibm', mod:'Data Fundamentals: continue', part:'Continue', url:'https://skillsbuild.org/college-students/course-catalog/data-fundamentals', learn:'Clean, refine and visualise data.', show:'Your course progress page.' },
    8: { b:'ibm', mod:'Data Fundamentals: finish and claim your badge', part:'Badge', url:'https://skillsbuild.org/college-students/course-catalog/data-fundamentals', learn:'The final assessment, then claim your badge.', show:'Your Credly badge link.' },
    9: { b:'pbi', mod:'Get started building with Power BI', part:'Module', url:'https://learn.microsoft.com/en-us/training/modules/get-started-with-power-bi/', learn:'What Power BI is and how to build a first report.', show:'The module marked complete.' },
    10:{ b:'pbi', mod:'Design Power BI reports', part:'Module', url:'https://learn.microsoft.com/en-us/training/modules/power-bi-effective-reports/', learn:'Layout and visuals for a clear report.', show:'The module marked complete.' },
    11:{ b:'pbi', mod:'Enhance Power BI report designs for the user experience', part:'Module', url:'https://learn.microsoft.com/en-us/training/modules/power-bi-effective-user-experience/', learn:'Make a report easy to use.', show:'The module marked complete.' },
    12:{ b:'pbi', mod:'Perform analytics in Power BI', part:'Module', url:'https://learn.microsoft.com/en-us/training/modules/perform-analytics-power-bi/', learn:'Find patterns, trends and outliers in Power BI.', show:'The module marked complete.' },
    13:{ b:'pbi', mod:'Scope report design requirements', part:'Module', url:'https://learn.microsoft.com/en-us/training/modules/power-bi-effective-requirements/', learn:'Who will use a report, and what they need from it.', show:'The module, and the path trophy.' },
    14:{ b:'m365', mod:'Microsoft 365 basics: work together on your project', part:'Video training', url:'https://support.microsoft.com/en-us/office/microsoft-365-basics-video-training-396b8d9e-e118-42d0-8a0d-87d1f2f055fb', learn:'Work together on files: share, co-edit, comment.', show:'Your team file with everyone\'s edits.' },
    15:{ b:'all', mod:'Claim and share your three credentials', part:'Portfolio', url:'credentials.html', learn:'Collect your badges and add them to your CV or LinkedIn.', show:'Your Credly link and Learn profile link.' }
  }
};

/* One guided card per unit: Do → Learn → Return. Used by the lecture pages (course.js, lesson.js) and the Week 8 activity.
   CredCard(week) returns an element; ticks are saved on this device only. */
window.CredCard=function(week,opts){ opts=opts||{};
  const C=window.COURSE_CREDS, x=C&&C.weeks[week]; if(!x) return null;
  const b=C.badges.find(y=>y.id===x.b)||{prov:'All providers',name:'your credentials',proof:'',cert:'',certLabel:'',sign:''};
  const key='g106-cred-'+week, get=()=>{ try{ return localStorage.getItem(key); }catch(e){ return null; } }, set=v=>{ try{ localStorage.setItem(key,v); }catch(e){} };
  const ext=u=>/^http/.test(u)?' target="_blank" rel="noopener"':'';
  const back=opts.back||(location.pathname.split('/').pop()||'index.html');
  const el=document.createElement('div'); el.className='cred cred-g';
  el.innerHTML=`<div class="cred-flags"><span>Optional</span><span>Not graded</span><span>Free only</span></div>
    <span class="eyebrow">${b.prov} · Week ${week}</span><b class="cred-t">${x.mod}</b>
    <ol class="cred-go">
      <li><b>Do</b><span>Open the unit${b.sign?'. '+b.sign:'.'}</span><a class="btn" href="${x.url}"${ext(x.url)}>Open the unit ↗</a></li>
      <li><b>Learn</b><span>${x.learn||''}</span></li>
      <li><b>Return</b><span>Come back to this page, tick Done, and send a screenshot of <i>${(x.show||'your progress').replace(/\.$/,'').replace(/^./,c=>c.toLowerCase())}</i>.</span>
        <span class="row">${C.form?`<a class="btn ghost" href="${C.form}" target="_blank" rel="noopener">Submit proof ↗</a>`:`<span class="btn ghost" aria-disabled="true" style="opacity:.55;cursor:default">Proof form: link coming soon</span>`}<label class="cred-done"><input type="checkbox" ${get()==='1'?'checked':''}> Done</label></span></li>
    </ol>
    <p class="cred-cert"><b>Certificate:</b> ${b.cert?`<a href="${b.cert}" target="_blank" rel="noopener">${b.certLabel} ↗</a>`:b.certLabel} · counts toward <i>${b.name}</i>.</p>
    <p class="cred-free">Take it only if it is free. If any page asks you to pay, stop: you do not need it for this course. Not doing it never affects your grade.</p>
    <a class="cred-all" href="credentials.html">All weeks and certificates →</a>`;
  el.querySelector('.cred-done input').addEventListener('change',e=>set(e.target.checked?'1':'0'));
  return el; };
