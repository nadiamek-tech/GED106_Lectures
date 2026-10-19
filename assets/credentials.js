/* GED 106 credential pathway: one free unit per week on the tools of the course.
   Verified Oct 2026: IBM SkillsBuild Data Fundamentals (free, Credly badge), Microsoft Learn Power BI modules
   (free, trophies on your Learn profile), Microsoft Support training for OneDrive, Forms and Excel (free, no badge: screenshot proof).
   Optional paid exams (for example Microsoft MO-211 Excel Expert or PL-300 Power BI) are not required. */
window.COURSE_CREDS = {
  form: '',  // Microsoft Forms link for proof submission (bonus). Paste it here.
  badges: [
    { id:'ibm', prov:'IBM SkillsBuild', name:'Data Fundamentals', proof:'Credly digital badge', done:8, url:'https://skillsbuild.org/college-students/course-catalog/data-fundamentals' },
    { id:'pbi', prov:'Microsoft Learn', name:'Power BI: analyse and design reports', proof:'Trophies on your Learn profile', done:13, url:'https://learn.microsoft.com/en-us/training/paths/build-power-bi-visuals-reports/' },
    { id:'m365', prov:'Microsoft 365', name:'OneDrive, Forms and Excel skills', proof:'Screenshot of your own work', done:14, url:'https://support.microsoft.com/en-us/office/microsoft-365-basics-video-training-396b8d9e-e118-42d0-8a0d-87d1f2f055fb' }
  ],
  weeks: {
    1: { b:'m365', mod:'OneDrive: save, sync and share your course files', part:'Video tutorials', url:'https://support.microsoft.com/en-us/office/onedrive-video-tutorials-1f608184-b7e6-43ca-8753-2ff679203132' },
    2: { b:'ibm', mod:'Data Fundamentals: create your account and begin', part:'Start', url:'https://skillsbuild.org/college-students/course-catalog/data-fundamentals' },
    3: { b:'m365', mod:'Microsoft Forms: create a new form or quiz', part:'Guide', url:'https://support.microsoft.com/en-us/office/create-a-new-form-or-quiz-3c39c220-e30e-401d-bb6f-c1861d5aea01' },
    4: { b:'pbi', mod:'Explore the analytics process that turns data into insights', part:'Module', url:'https://learn.microsoft.com/en-us/training/modules/data-analytics-microsoft/' },
    5: { b:'ibm', mod:'Data Fundamentals: continue', part:'Continue', url:'https://skillsbuild.org/college-students/course-catalog/data-fundamentals' },
    6: { b:'m365', mod:'Excel: learn to use Power Query and Power Pivot', part:'Guide', url:'https://support.microsoft.com/en-us/office/learn-to-use-power-query-and-power-pivot-in-excel-42d895c2-d1d7-41d0-88da-d1ed7ecc102d' },
    7: { b:'ibm', mod:'Data Fundamentals: continue', part:'Continue', url:'https://skillsbuild.org/college-students/course-catalog/data-fundamentals' },
    8: { b:'ibm', mod:'Data Fundamentals: finish and claim your badge', part:'Badge', url:'https://skillsbuild.org/college-students/course-catalog/data-fundamentals' },
    9: { b:'pbi', mod:'Get started building with Power BI', part:'Module', url:'https://learn.microsoft.com/en-us/training/modules/get-started-with-power-bi/' },
    10:{ b:'pbi', mod:'Design Power BI reports', part:'Module', url:'https://learn.microsoft.com/en-us/training/modules/power-bi-effective-reports/' },
    11:{ b:'pbi', mod:'Enhance Power BI report designs for the user experience', part:'Module', url:'https://learn.microsoft.com/en-us/training/modules/power-bi-effective-user-experience/' },
    12:{ b:'pbi', mod:'Perform analytics in Power BI', part:'Module', url:'https://learn.microsoft.com/en-us/training/modules/perform-analytics-power-bi/' },
    13:{ b:'pbi', mod:'Scope report design requirements', part:'Module', url:'https://learn.microsoft.com/en-us/training/modules/power-bi-effective-requirements/' },
    14:{ b:'m365', mod:'Microsoft 365 basics: work together on your project', part:'Video training', url:'https://support.microsoft.com/en-us/office/microsoft-365-basics-video-training-396b8d9e-e118-42d0-8a0d-87d1f2f055fb' },
    15:{ b:'all', mod:'Claim and share your three credentials', part:'Portfolio', url:'credentials.html' }
  }
};
