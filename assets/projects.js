/* GED 106 project bank (10 per section) and dashboard sketch renderer, shared by lab-11.html and project-report.html */
const K='https://www.kaggle.com/datasets/';
/* sec, theme, title, source name, url, one row, key columns, 3 questions, 3 visuals, Power BI tip */
const P=[
 // ---------- Section 201 ----------
 {id:'netflix',sec:'201',th:'Entertainment',t:'Netflix: what is on?',src:'Kaggle · Netflix Movies and TV Shows',url:K+'shivamb/netflix-shows',row:'one title on Netflix',cols:'type, title, country, date_added, release_year, rating, duration, listed_in',
  qs:['Is Netflix adding more movies or more TV shows each year?','Which countries produce the most titles?','Which age ratings are most common?'],viz:['Line, one line per type','Sorted bar, top 10 countries','Column or donut (group small ratings)'],
  tip:'The <code>country</code> column can hold several countries. Use <span class="k">Split Column</span> → By delimiter (comma), then Unpivot.'},
 {id:'spotify23',sec:'201',th:'Music',t:'Most-streamed songs of 2023',src:'Kaggle · Most Streamed Spotify Songs 2023',url:K+'nelgiriyewithana/top-spotify-songs-2023',row:'one song',cols:'track_name, artist(s)_name, released_year, released_month, streams, in_spotify_playlists, bpm',
  qs:['Which artists have the most streams?','In which month are hit songs released?','Do songs in more playlists get more streams?'],viz:['Sorted bar, top 10 artists','Column by month (time order)','Scatter: playlists vs streams'],
  tip:'Set <code>streams</code> to Whole Number; one bad row turns into Error → <span class="k">Remove Errors</span>.'},
 {id:'coffee',sec:'201',th:'Daily life',t:'Coffee shop sales',src:'Kaggle · Coffee Sales (Maven Analytics)',url:K+'ahmedabbas757/coffee-sales',row:'one transaction',cols:'transaction_date, transaction_time, transaction_qty, store_location, unit_price, product_category, product_type',
  qs:['What is the busiest hour of the day?','Which product category earns most?','Which store sells most?'],viz:['Column by hour','Sorted bar','Column or bar, 3 stores'],
  tip:'Make a <b>Revenue</b> column: <span class="k">Add Column</span> → <span class="k">Custom Column</span> → <code>[transaction_qty] * [unit_price]</code>.'},
 {id:'supermarket',sec:'201',th:'Shopping',t:'Supermarket sales (Carrefour-style)',src:'Kaggle · Supermarket Sales',url:K+'aungpyaeap/supermarket-sales',row:'one invoice',cols:'Branch, City, Customer type, Product line, Unit price, Quantity, Total, Date, Time, Payment, Rating',
  qs:['Which product line brings the most sales?','Do members spend more than normal customers?','How do customers pay?'],viz:['Sorted bar','Column, 2 customer types','Donut, 3 payment types'],
  tip:'Use a <b>Matrix</b> with Branch in rows and Product line in columns to compare the three branches.'},
 {id:'students',sec:'201',th:'Education',t:'Students’ exam scores',src:'Kaggle · Students Performance in Exams',url:K+'spscientist/students-performance-in-exams',row:'one student',cols:'gender, parental level of education, lunch, test preparation course, math score, reading score, writing score',
  qs:['Does a test-preparation course raise scores?','How are math scores spread?','Do reading and writing scores move together?'],viz:['Clustered column: completed vs none','Histogram (columns of score bins)','Scatter: reading vs writing'],
  tip:'For a histogram: <span class="k">New group</span> on math score with bin size 10, then a column chart of the bins.'},
 {id:'worldcup',sec:'201',th:'Sport',t:'FIFA World Cup history',src:'Kaggle · FIFA World Cup',url:K+'abecklas/fifa-world-cup',row:'one tournament (WorldCups.csv)',cols:'Year, Country, Winner, GoalsScored, QualifiedTeams, MatchesPlayed, Attendance',
  qs:['Are World Cups getting more goals?','Which countries won most?','How did attendance grow?'],viz:['Line by year','Sorted bar of winners (count)','Line or column by year'],
  tip:'<code>Attendance</code> may use dots as thousand separators: <span class="k">Replace Values</span> "." → nothing, then Whole Number.'},
 {id:'youtube',sec:'201',th:'Social media',t:'Top YouTube channels',src:'Kaggle · Global YouTube Statistics 2023',url:K+'nelgiriyewithana/global-youtube-statistics-2023',row:'one channel (top 1,000)',cols:'Youtuber, subscribers, video views, category, uploads, Country',
  qs:['Which categories have the most top channels?','Which countries host the most top channels?','Do more uploads mean more views?'],viz:['Sorted bar','Sorted bar, top 10 (or map)','Scatter: uploads vs views'],
  tip:'Open the CSV with <span class="k">Get data</span> → <span class="k">Text/CSV</span>; if letters look broken, set File Origin to <b>65001: UTF-8</b>.'},
 {id:'tourism',sec:'201',th:'UAE',t:'UAE tourism vs the GCC',src:'World Bank · International tourism, arrivals',url:'https://data.worldbank.org/indicator/ST.INT.ARVL?locations=AE-SA-QA-OM-BH-KW',row:'one country (years as columns)',cols:'Country Name, Country Code, 1995 … 2020',
  qs:['How did visitor numbers to the UAE change over time?','How does the UAE compare with other GCC countries?','How big was the 2020 drop?'],viz:['Line, UAE','Line, one line per country (or sorted bar for one year)','Card: % change 2019 → 2020'],
  tip:'Years are columns: select Country Name and Code → <span class="k">Unpivot Other Columns</span> (as in the Power BI lab). Remove the 4 header rows first.'},
 {id:'games',sec:'201',th:'Gaming',t:'Video game sales',src:'Kaggle · Video Game Sales',url:K+'gregorut/videogamesales',row:'one game on one platform',cols:'Name, Platform, Year, Genre, Publisher, NA_Sales, EU_Sales, JP_Sales, Other_Sales, Global_Sales',
  qs:['Which genre sells most worldwide?','Which platforms sold most?','Do regions prefer different genres?'],viz:['Sorted bar','Sorted bar, top 10','Matrix or clustered bar: genre × region'],
  tip:'Unpivot the four region columns into <b>Region</b> and <b>Sales</b> to compare regions in one chart.'},
 {id:'airline',sec:'201',th:'Travel',t:'Airline passenger satisfaction',src:'Kaggle · Airline Passenger Satisfaction',url:K+'teejmahal20/airline-passenger-satisfaction',row:'one passenger survey',cols:'Customer Type, Type of Travel, Class, Flight Distance, Inflight wifi service, Seat comfort, Departure Delay in Minutes, satisfaction',
  qs:['What share of passengers are satisfied?','Does class (Business, Eco) change satisfaction?','Which service has the lowest rating?'],viz:['Donut, 2 parts','100% stacked column by class','Sorted bar of average ratings'],
  tip:'Use the <b>train.csv</b> file only. For average ratings, drag each service column into Values and set <span class="k">Average</span>.'},
 // ---------- Section 202 ----------
 {id:'imdb',sec:'202',th:'Entertainment',t:'IMDb top 1000 films',src:'Kaggle · IMDB Top 1000 Movies and TV Shows',url:K+'harshitshankhdhar/imdb-dataset-of-top-1000-movies-and-tv-shows',row:'one film',cols:'Series_Title, Released_Year, Genre, IMDB_Rating, Director, No_of_Votes, Gross',
  qs:['Which genres appear most in the top 1000?','Do higher-rated films earn more?','Which directors have the most films?'],viz:['Sorted bar','Scatter: rating vs gross','Sorted bar, top 10'],
  tip:'<code>Gross</code> has commas: <span class="k">Replace Values</span> "," → nothing, then Whole Number. <code>Genre</code> holds several genres: split by comma.'},
 {id:'spotifyg',sec:'202',th:'Music',t:'Spotify songs by genre',src:'Kaggle · Spotify Tracks Dataset',url:K+'maharshipandya/-spotify-tracks-dataset',row:'one track',cols:'artists, track_name, popularity, explicit, danceability, energy, track_genre',
  qs:['Which genres are most popular?','Are danceable songs also high-energy?','What share of songs are explicit?'],viz:['Sorted bar of average popularity, top 10','Scatter: danceability vs energy','Donut, 2 parts'],
  tip:'114 genres is too many: use the <b>Top N</b> filter (top 10 by average popularity) in the Filters pane.'},
 {id:'pizza',sec:'202',th:'Daily life',t:'Pizza place sales',src:'Kaggle · Pizza Place Sales (Maven Analytics)',url:K+'mysarahmadbhat/pizza-place-sales',row:'4 linked tables: orders, order_details, pizzas, pizza_types',cols:'order_id, date, time · order_details_id, pizza_id, quantity · size, price · name, category',
  qs:['What are the busiest days and hours?','Which pizzas sell most?','Which size do customers prefer?'],viz:['Column by day, column by hour','Sorted bar, top 10','Donut by size'],
  tip:'Four tables: open <span class="k">Model view</span> and check the links (order_id, pizza_id, pizza_type_id), as in the Week 11 lecture.'},
 {id:'olympics',sec:'202',th:'Sport',t:'120 years of the Olympics',src:'Kaggle · 120 Years of Olympic History',url:K+'heesoo37/120-years-of-olympic-history-athletes-and-results',row:'one athlete in one event',cols:'Name, Sex, Age, Team, NOC, Year, Season, Sport, Event, Medal',
  qs:['Which countries won the most medals?','How did women’s participation change over time?','Which sports give the most medals?'],viz:['Sorted bar, top 10','Line: women athletes by year','Sorted bar'],
  tip:'Filter <code>Medal</code> to remove “NA” before counting medals; filter Season = Summer to keep it simple.'},
 {id:'happiness',sec:'202',th:'World',t:'World Happiness Report',src:'Kaggle · World Happiness Report',url:K+'unsdsn/world-happiness',row:'one country in one year',cols:'Country, Happiness Score (or Score), GDP per capita, Social support, Healthy life expectancy, Freedom',
  qs:['Which countries are happiest, and where is the UAE?','Do richer countries score higher?','Which factor matters most?'],viz:['Sorted bar, top 15, UAE highlighted','Scatter: GDP vs score','Bar of factor averages'],
  tip:'Use one year’s file (e.g. 2019.csv) to start: column names change between years.'},
 {id:'f1',sec:'202',th:'Sport',t:'Formula 1 champions',src:'Kaggle · Formula 1 World Championship',url:K+'rohanrao/formula-1-world-championship-1950-2020',row:'linked tables: races, results, drivers, constructors',cols:'raceId, year · driverId, constructorId, points, position · surname · name',
  qs:['Which drivers won most races?','Which teams dominate each decade?','How many races per season over time?'],viz:['Sorted bar, top 10','Matrix: team × decade','Line by year'],
  tip:'Load results, races, drivers and constructors; link them in <span class="k">Model view</span> by their ID columns.'},
 {id:'internet',sec:'202',th:'UAE',t:'Who is online? Internet use',src:'Our World in Data · Share of the population using the Internet',url:'https://ourworldindata.org/grapher/share-of-individuals-using-the-internet',row:'one country in one year',cols:'Entity, Code, Year, Share of the population using the Internet',
  qs:['How fast did internet use grow in the UAE?','How does the UAE compare with the world?','Which countries are still below 50%?'],viz:['Line, UAE vs World','Line, two lines','Sorted bar or map, latest year'],
  tip:'On the chart page: <span class="k">Download</span> → <b>Full data (CSV)</b>. Filter Entity to the countries you need.'},
 {id:'ev',sec:'202',th:'Cars',t:'Electric cars on the road',src:'Data.gov · Electric Vehicle Population Data (Washington State)',url:'https://catalog.data.gov/dataset/electric-vehicle-population-data',row:'one registered electric car',cols:'Make, Model, Model Year, Electric Vehicle Type, Electric Range, County',
  qs:['Which brands are most common?','How fast are EVs growing by model year?','Fully electric or plug-in hybrid?'],viz:['Sorted bar, top 10','Column by model year','Donut, 2 parts'],
  tip:'The file is large (200,000+ rows): Power BI handles it; Excel is slow. Use <span class="k">Get data</span> → Text/CSV.'},
 {id:'renew',sec:'202',th:'Energy',t:'Renewable energy share',src:'Our World in Data · Renewables share of energy',url:'https://ourworldindata.org/grapher/renewable-share-energy',row:'one country in one year',cols:'Entity, Code, Year, Renewables (% equivalent primary energy)',
  qs:['How has the UAE’s renewable share changed?','Which countries lead?','Is the world speeding up?'],viz:['Line, UAE','Sorted bar, latest year','Line, World'],
  tip:'Rows like “World” or “Europe” are groups, not countries: filter them out for country rankings (they have no Code).'},
 {id:'bikes',sec:'202',th:'City life',t:'City bike rentals and weather',src:'UCI · Seoul Bike Sharing Demand',url:'https://archive.ics.uci.edu/dataset/560/seoul+bike+sharing+demand',row:'one hour in one day',cols:'Date, Rented Bike Count, Hour, Temperature, Humidity, Rainfall, Seasons, Holiday',
  qs:['At what hours are bikes rented most?','Do warmer days bring more rentals?','Which season is busiest?'],viz:['Column by hour','Scatter: temperature vs rentals','Column, 4 seasons'],
  tip:'Dates are day/month/year: set the column type with <span class="k">Using Locale</span> → English (United Kingdom).'}
];
const VIZ=['Card','Bar (sorted)','Column','Line','Donut','Table / Matrix','Scatter'];
/* ---------- dashboard sketch tool ---------- */
const MINI={'Card':(x,y,w,h)=>`<rect x="${x+w*.15}" y="${y+h*.3}" width="${w*.7}" height="${h*.4}" rx="6" fill="var(--wk-soft)" stroke="var(--wk)"/><text x="${x+w/2}" y="${y+h/2+6}" text-anchor="middle" font-size="18" font-weight="800" fill="var(--wk)">123</text>`,
 'Bar (sorted)':(x,y,w,h)=>[.9,.7,.55,.4,.25].map((v,i)=>`<rect x="${x+12}" y="${y+12+i*(h-24)/5}" width="${(w-24)*v}" height="${(h-24)/5*.65}" fill="var(--wk)" fill-opacity="${i?0.5:1}"/>`).join(''),
 'Column':(x,y,w,h)=>[.5,.8,.6,.95,.4,.7].map((v,i)=>`<rect x="${x+12+i*(w-24)/6}" y="${y+h-12-(h-24)*v}" width="${(w-24)/6*.65}" height="${(h-24)*v}" fill="var(--wk)" fill-opacity=".75"/>`).join(''),
 'Line':(x,y,w,h)=>`<polyline points="${[.3,.45,.4,.65,.6,.85].map((v,i)=>`${x+14+i*(w-28)/5},${y+h-14-(h-28)*v}`).join(' ')}" fill="none" stroke="var(--wk)" stroke-width="3"/>`,
 'Donut':(x,y,w,h)=>{ const r=Math.min(w,h)/2-14; return `<circle cx="${x+w/2}" cy="${y+h/2}" r="${r}" fill="none" stroke="var(--wk)" stroke-width="${r*.5}" stroke-dasharray="${2*Math.PI*r*.55} ${2*Math.PI*r}"/><circle cx="${x+w/2}" cy="${y+h/2}" r="${r}" fill="none" stroke="var(--muted)" stroke-opacity=".4" stroke-width="${r*.5}" stroke-dasharray="0 ${2*Math.PI*r*.55} ${2*Math.PI*r*.45}"/>`; },
 'Table / Matrix':(x,y,w,h)=>[0,1,2,3,4].map(i=>`<rect x="${x+12}" y="${y+12+i*(h-24)/5}" width="${w-24}" height="${(h-24)/5}" fill="${i?'none':'var(--wk-soft)'}" stroke="var(--line)"/>`).join('')+`<line x1="${x+w/2}" y1="${y+12}" x2="${x+w/2}" y2="${y+h-12}" stroke="var(--line)"/>`,
 'Scatter':(x,y,w,h)=>[[.1,.2],[.2,.3],[.3,.35],[.4,.5],[.5,.45],[.6,.6],[.7,.7],[.8,.75],[.9,.85],[.35,.25],[.65,.55]].map(([a,b])=>`<circle cx="${x+12+(w-24)*a}" cy="${y+h-12-(h-24)*b}" r="4" fill="var(--wk)"/>`).join('')};
const toViz=v=>{ const M=[[/scatter/i,'Scatter'],[/donut|pie/i,'Donut'],[/line/i,'Line'],[/column|histogram/i,'Column'],[/bar/i,'Bar (sorted)'],[/matrix|table/i,'Table / Matrix'],[/card/i,'Card']]; let best=null,bi=1e9; M.forEach(([r,n])=>{ const i=v.search(r); if(i>=0&&i<bi){bi=i;best=n;} }); return best||'Column'; };
const esc=s=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;');
function wrap(s,n){ const w=String(s||'').split(' '), L=['']; w.forEach(x=>{ if((L[L.length-1]+' '+x).trim().length>n) L.push(x); else L[L.length-1]=(L[L.length-1]+' '+x).trim(); }); return L.slice(0,2); }
function sketch(d){ const Wd=760,H=520, ff='font-family="Schibsted Grotesk,Arial,sans-serif"';
  const box=(x,y,w,h,q,v,big)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="var(--surface)" stroke="var(--line)"/>`+wrap(q,big?60:38).map((l,i)=>`<text x="${x+10}" y="${y+20+i*15}" font-size="12" font-weight="700" fill="var(--ink)" ${ff}>${esc(l)}</text>`).join('')+`<text x="${x+w-10}" y="${y+h-8}" text-anchor="end" font-size="10" fill="var(--muted)" ${ff}>${esc(v)}</text>`+(MINI[v]?MINI[v](x,y+40,w,h-56):'');
  let s=`<svg viewBox="0 0 ${Wd} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Dashboard sketch" ${ff}><rect x="1" y="1" width="${Wd-2}" height="${H-2}" rx="14" fill="var(--bg)" stroke="var(--line)" stroke-width="2"/>`;
  s+=`<text x="18" y="36" font-size="20" font-weight="800" fill="var(--ink)">${esc(d.title||'Your title = your main message')}</text><text x="18" y="56" font-size="11" fill="var(--muted)">${esc(d.sub||'')}</text>`;
  s+=`<rect x="560" y="16" width="184" height="34" rx="8" fill="var(--wk-soft)" stroke="var(--wk)"/><text x="652" y="38" text-anchor="middle" font-size="11" font-weight="700" fill="var(--ink)">Slicer: ${esc(d.slicer||'…')}</text>`;
  d.kpi.forEach((k,i)=>{ const x=18+i*244; s+=`<rect x="${x}" y="70" width="232" height="64" rx="10" fill="var(--wk-soft)"/><text x="${x+116}" y="100" text-anchor="middle" font-size="20" font-weight="800" fill="var(--wk)">123</text><text x="${x+116}" y="122" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(k||'KPI '+(i+1))}</text>`; });
  s+=box(18,148,440,180,d.q[0],d.v[0],true)+box(470,148,272,180,d.q[1],d.v[1])+box(18,340,440,166,d.q[2],d.v[2],true)+box(470,340,272,166,d.q[3],d.v[3]);
  return s+'</svg>'; }
/* render the sketch to a PNG data URL (light colours, for files) */
function sketchPNG(d){ return new Promise((res,rej)=>{ const C={'--bg':'#FFFFFF','--surface':'#F7F9FB','--line':'#D6DEE6','--ink':'#14202B','--muted':'#5D6B78','--wk':'#0E7490','--wk-soft':'#E3F1F5'};
  let src=sketch(d); Object.keys(C).forEach(v=>{ src=src.split(`var(${v})`).join(C[v]); });
  const img=new Image(), url=URL.createObjectURL(new Blob([src],{type:'image/svg+xml'}));
  img.onload=()=>{ const c=document.createElement('canvas'); c.width=1520; c.height=1040; const x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height); x.drawImage(img,0,0,c.width,c.height); URL.revokeObjectURL(url); res({src:c.toDataURL('image/jpeg',.9),w:1520,h:1040}); };
  img.onerror=rej; img.src=url; }); }

const getP=id=>P.find(x=>x.id===id);

/* Teams per project, published by the professor (id: 'Team name'). Empty until teams are confirmed. */
const TEAMS={};
