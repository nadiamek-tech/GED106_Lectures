/* GED 106 · course settings for the course portal (assets/portal.js).
   To update the site, edit only this file. Empty links show "coming soon" until you paste them. */
window.COURSE={
  code:'GED 106', title:['Smart Decisions:','Data Literacy & Visualization'], eyebrow:'GED 106 · Fall 2026 · 3 credit hours · on campus',
  instructor:'Eng. Nadia Mek', classTime:'Wednesday 5–7 PM',
  pages:{lectures:'lectures.html', labs:'labs.html', exams:'exams.html'},
  short:'Data Literacy & Visualization',
  navExtra:[['credentials.html','My Credentials','credentials']],
  blurbs:{lectures:'Notes to review each class, with activities and quick checks.', labs:'Microsoft Forms and Excel, step by step.', exams:'Dates, what each assessment includes, revision.'},

  links:{
    booking:'',     /* optional booking page; empty = students email to book */
    moodle:''
  },
  /* email, office hours, schedule, portal and form links come from assets/professor.js */

  ask:()=>window.CourseAssistant&&CourseAssistant.open(),
  search:q=>{ if(!window.CourseAssistant) return []; const r=CourseAssistant.search(q);
    return r.kb.slice(0,3).filter(x=>x.s>=1).map(x=>({t:x.e.q,s:x.e.a,l:x.e.l}))
      .concat(r.idx.slice(0,5).map(x=>({t:x.e.pt+' · '+x.e.n,s:x.e.t.slice(0,140),l:x.e.l}))); },
  openSearch:q=>window.CourseAssistant&&CourseAssistant.open(q),

  assess:[
    {id:'quiz1',name:'Quiz 1',type:'Lecture',weight:'Part of 30%',when:'Week 5',done:true,covers:['Weeks 1–4: the world of data, the four pillars, data collection and surveys, the four levels of analytics'],clos:'1, 2, 3',format:'In class, on paper',revise:[['Practice Quiz 1','practice-quiz1.html']]},
    {id:'lab',name:'Excel Lab Assignment',short:'Lab assignment',type:'Lab',weight:'Part of 30%',when:'Week 6',covers:['Sorting, filtering and cleaning a data set in Excel (Labs 4–6)'],clos:'2, 3, 4',
      submit:{link:'',due:'',dueText:'Week 6'},revise:[['Lab 6','lab-06.html']]},
    {id:'mid',name:'Midterm Examination',short:'Midterm',type:'Lecture',weight:'20%',date:'2026-10-23T15:00:00+04:00',timeText:'3:00–4:30 PM',place:'Hub Zones',
      covers:['Weeks 1–8','The four levels of analytics','Reading data from tables and charts','Data dictionary, data literacy, data protection, surveys','Survey questions: find the error and fix it','The five principles of data ethics'],
      format:'In class, on paper · 90 minutes · closed book · 20 marks',clos:'2, 3',revise:[['Midterm review','review.html'],['Midterm practice','practice-midterm.html']]},
    {id:'lab9',name:'Graded lab · Week 9',short:'Graded lab',type:'Lab',weight:'Part of 30%',when:'Week 9',covers:['Project scoping and data set selection'],clos:'3, 4',revise:[['Lab 9','lab-09.html']]},
    {id:'quiz2',name:'Quiz 2',type:'Lecture',weight:'Part of 30%',when:'Week 12',covers:['Data-informed decision-making','Charts and graphics','Data visualization and storytelling','Begin your data and analytics journey'],clos:'1, 2, 3',format:'In class, on paper'},
    {id:'lab12',name:'Graded lab · Week 12',short:'Graded lab',type:'Lab',weight:'Part of 30%',when:'Week 12',covers:['Feedback and refinement of your project report'],clos:'4, 5'},
    {id:'draft',name:'Project draft',type:'Lab',weight:'Part of 20%',when:'Week 13',covers:['Problem, data set, first charts and storyboard'],clos:'4, 5',
      submit:{link:'',due:'',dueText:'Week 13'}},
    {id:'proj',name:'Final project: report and presentation',short:'Final project',type:'Lab',weight:'20%',when:'Weeks 14–15',covers:['Report with a data dashboard and insights','Group presentation'],clos:'4, 5',
      submit:{link:'',due:'',dueText:'Week 15'}}
  ],

  weeks:[
    {w:'1', lec:['The world of data','week-01.html'], lab:['Course tools and platforms','lab-01.html']},
    {w:'2', lec:['The four pillars of data literacy','week-02.html'], lab:['Microsoft Forms and Excel basics','lab-02.html']},
    {w:'3', lec:['Data collection and surveys','week-03.html'], lab:['Survey design in Microsoft Forms','lab-03.html']},
    {w:'4', lec:['The four levels of analytics','week-04.html'], lab:['Data collection and exporting','lab-04.html']},
    {w:'5', lec:['Reading and speaking data','week-05.html'], lab:['Sorting and filtering data','lab-05.html'], ev:['quiz1']},
    {w:'6', lec:['The three Cs of data literacy','week-06.html'], lab:['Data cleaning and preparation','lab-06.html'], ev:['lab']},
    {w:'7', lec:['Data ethics 1','week-07.html'], lab:['Basic analytical functions in Excel','lab-07.html']},
    {w:'8', lec:['Data ethics 2','week-08.html'], ev:['mid']},
    {w:'9', lec:['Data-informed decision-making','week-09.html'], lab:['Project scoping and data set selection','lab-09.html'], ev:['lab9']},
    {w:'10', lec:'Charts and graphics', lab:'Data visualization techniques'},
    {w:'11', lec:'Data visualization and storytelling', lab:'Drafting project reports'},
    {w:'12', lec:'Begin your data and analytics journey', lab:'Feedback and refinement', ev:['quiz2','lab12']},
    {w:'13', lec:'Planning capstone projects', lab:'Presentation skills', ev:['draft']},
    {w:'14', lec:'Developing data projects', lab:'Final project presentation'},
    {w:'15', lec:'Project presentations', lab:'Final presentations and feedback', ev:['proj']}
  ],

  clos:[
    ['CLO 1','Explain the core principles of data literacy, including ethical use, governance, and regulatory impact in various sectors.'],
    ['CLO 2','Interpret basic data and visualizations using appropriate terms and everyday examples.'],
    ['CLO 3','Apply descriptive and diagnostic analytics to solve interdisciplinary problems.'],
    ['CLO 4','Use data tools (e.g., Microsoft Excel, Forms) to clean, organize, and present simple datasets.'],
    ['CLO 5','Design an interactive data visualization dashboard.']
  ],

  faqExtra:[
    ['What are the textbooks?','Morrow (2024) <i>Be Data Literate</i> (2nd ed.) · Sosulski (2019) <i>Data Visualization Made Simple</i> · Klidas &amp; Hanegan (2022) <i>Data Literacy in Practice</i>.'],
    ['What do I need for the labs?','Your CUD Microsoft 365 account: Excel, Forms and OneDrive.'],
    ['Can I earn credentials in this course?','Yes, optional and free: IBM Data Fundamentals, Power BI modules on Microsoft Learn, and OneDrive, Forms and Excel skills. One unit a week, with a class-activity bonus for each proof. <a href="credentials.html">My Credentials →</a>']
  ]
};
