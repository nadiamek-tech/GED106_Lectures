/* Professor details shared by every course site (same file in each repo).
   Change office hours, links or the weekly schedule here once; copy the file to each repo. */
window.PROF={
  name:'Eng. Nadia Mek', email:'Nadia.mekhfi@cud.ac.ae', office:'HUB Office',
  officeHours:'Mon 11–12 · Tue 1–3 PM · Thu 1–3 PM',
  bookingNote:'To book office hours, a library study room or an incubator support session, email the professor first.',
  links:{
    portal:'https://cudportal.cud.ac.ae/student/',
    form:'https://forms.cloud.microsoft/r/ntbY8WvQne'   /* one form: Assessment missed / absence, and General help */
  },
  /* weekly timetable: [day 0=Mon…4=Fri, start hour, end hour, label, kind] kind: oh = office hours */
  schedule:[
    [0,9,11,'Lecture · HUB'],[0,11,12,'Office hours','oh'],[0,12,15,'Lecture · MGT'],
    [1,11,13,'Lecture · HUB'],[1,13,15,'Office hours','oh'],[1,15,17,'Lab · Incubator'],
    [2,11,17,'Lab · MGT'],
    [3,9,11,'Lab · MGT'],[3,13,15,'Office hours','oh'],[3,15,17,'Lecture · HUB']
  ]
};
