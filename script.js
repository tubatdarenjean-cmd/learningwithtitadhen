const $=id=>document.getElementById(id);const KEY='tita-dhen-progress-v2';let saved={};let active=0;const persist=()=>{if(!window.academyEnrollmentReady)return;window.academySave?.(saved,active)};
window.academyProgressLoaded=(data)=>{saved=data||{};render()};
$('year').textContent=new Date().getFullYear();
$('modulePreview').innerHTML=modules.map((m,i)=>`<div class="module-preview"><b>${String(i+1).padStart(2,'0')}</b><span>${m.title}</span></div>`).join('');
function safe(t){return String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function done(i){return !!saved['done'+i]};function eligible(){return modules.every((_,i)=>done(i))}
function updateBonus(){let yes=eligible();$('bonusLocked').hidden=yes;$('bonusUnlocked').hidden=!yes;$('bonusSideText').textContent=yes?'UNLOCKED · YOUR GRADUATION GIFT':'LOCKED · COMPLETE ALL MODULES';let reopen=$('reopenGraduation');if(reopen)reopen.hidden=!yes;}
function render(){let m=modules[active];$('lessonNumber').textContent=`MODULE ${String(active+1).padStart(2,'0')} / ${String(modules.length).padStart(2,'0')}`;$('appTitle').textContent=m.title;$('lessonIntro').textContent=m.intro;
$('lessonList').innerHTML=m.sections.map((s,i)=>`<article class="teaching-section"><p class="section-count">LESSON ${String(i+1).padStart(2,'0')} / ${m.sections.length}</p><h4>${safe(s.title)}</h4><p>${safe(s.body)}</p><div class="worked-example"><b>LET'S SEE AN EXAMPLE</b><p>${safe(s.example)}</p></div><p class="tita-note"><b>Tita's reminder:</b> ${safe(s.note)}</p></article>`).join('');
$('taskText').textContent=m.task;$('taskNotes').value=saved['notes'+active]||'';$('quizQuestion').textContent=m.question;$('quizOptions').innerHTML='';m.options.forEach((x,i)=>{let b=document.createElement('button');b.className='quiz-option';b.textContent=`${String.fromCharCode(65+i)}. ${x}`;b.addEventListener('click',()=>{let right=i===m.correct;saved['quiz'+active]=right;persist();document.querySelectorAll('.quiz-option').forEach((btn,j)=>{btn.classList.toggle('correct',j===m.correct);btn.classList.toggle('wrong',j===i&&!right)});$('quizFeedback').textContent=(right?'Tama! ':'Not quite — try again. ')+m.explain;updateCompletion()});$('quizOptions').appendChild(b)});
$('quizFeedback').textContent=saved['quiz'+active]?'Quiz passed! Nice work — ready for your practice task.':'';$('completeModule').checked=done(active);$('nextModule').textContent=active===modules.length-1?'Back to module 1 ↗':'Next module →';$('sidebarModules').innerHTML='';modules.forEach((x,i)=>{let b=document.createElement('button');b.className='sidebar-module'+(i===active?' active':'');b.innerHTML=`<span class="index">${done(i)?'✓':String(i+1).padStart(2,'0')}</span><span>${safe(x.title)}</span>`;b.onclick=()=>{active=i;render()};$('sidebarModules').appendChild(b)});let n=modules.filter((_,i)=>done(i)).length;let p=Math.round(n/modules.length*100);$('progressNum').textContent=p+'%';$('progressBar').style.width=p+'%';updateCompletion();updateBonus()}
function updateCompletion(){let enough=($('taskNotes').value||'').trim().length>=40;let passed=!!saved['quiz'+active];$('completeModule').disabled=!(enough&&passed);$('completionHint').textContent=passed?(enough?'You can now confirm your completion.':'Write at least 40 characters in your practice response to continue.'):'Pass the quiz and write at least 40 characters in your practice workspace first.'}
$('taskNotes').addEventListener('input',e=>{saved['notes'+active]=e.target.value;persist();updateCompletion()});$('completeModule').addEventListener('change',e=>{if(e.target.checked&&(!$('taskNotes').value.trim()||!saved['quiz'+active]))return;const wasComplete=eligible();saved['done'+active]=e.target.checked;persist();render();if(!wasComplete&&eligible())showGraduation();});$('nextModule').addEventListener('click',()=>{active=(active+1)%modules.length;render();document.querySelector('.learning-main').scrollTo({top:0,behavior:'smooth'})});
function openCourse(){if(!window.academyEnrollmentReady){openLogin();if(window.academySessionLoading)authMessage('Checking your student access…');else authMessage('Complete your free student profile once to access the lessons.');return}render();$('loginOverlay').classList.remove('open');$('courseOverlay').classList.add('open');$('courseOverlay').setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}function closeCourse(){$('courseOverlay').classList.remove('open');$('courseOverlay').setAttribute('aria-hidden','true');document.body.style.overflow=''}function openLogin(){if(window.academyEnrollmentReady){openCourse();return;}$('loginOverlay').classList.add('open');$('loginOverlay').setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}function closeLogin(){$('loginOverlay').classList.remove('open');$('loginOverlay').setAttribute('aria-hidden','true');document.body.style.overflow=''}['startCourse','heroDemo','previewDashboard','footerStart'].forEach(id=>$(id).addEventListener('click',openCourse));$('appClose').onclick=closeCourse;$('appCloseMobile').onclick=closeCourse;$('loginBtn').onclick=openLogin;$('mobileLogin').onclick=()=>{ $('mobileLinks').classList.remove('show');openLogin()};$('loginClose').onclick=closeLogin;$('openDemoFromLogin').onclick=()=>{closeLogin();document.getElementById('course').scrollIntoView({behavior:'smooth'})};$('menuBtn').onclick=()=>{let e=$('mobileLinks');e.classList.toggle('show');$('menuBtn').setAttribute('aria-expanded',e.classList.contains('show'))};document.querySelectorAll('.mobile-links a').forEach(a=>a.onclick=()=>$('mobileLinks').classList.remove('show'));document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCourse();closeLogin()}});['loginOverlay','courseOverlay'].forEach(id=>$(id).addEventListener('click',e=>{if(e.target===$(id))id==='loginOverlay'?closeLogin():closeCourse()}));

window.closeStudentDashboard=closeCourse;

function showGraduation(){if(!window.academyEnrollmentReady)return;$('graduateName').textContent=window.academyStudentName||'future VA';$('graduationOverlay').classList.add('open');$('graduationOverlay').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('graduationContinue').focus()}
function closeGraduation(){$('graduationOverlay').classList.remove('open');$('graduationOverlay').setAttribute('aria-hidden','true');document.body.style.overflow=$('courseOverlay').classList.contains('open')?'hidden':''}
const titaSignatureSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="450 570 1200 1130" width="600" height="270"><path fill="#292027" d="M1597,935 1582,929 1554,944 1519,949 1444,980 1323,1018 1282,1010 1191,1019 1160,1035 1141,1036 1114,1052 1093,1056 1071,1071 1011,1090 986,1106 956,1115 948,1124 931,1126 909,1141 886,1147 872,1160 809,1142 777,1124 722,1067 720,1046 712,1033 712,1006 724,955 775,882 786,877 795,862 805,860 832,827 844,824 852,811 882,790 894,788 905,774 948,752 959,738 1017,714 1027,703 1121,670 1178,669 1215,688 1219,738 1207,808 1225,815 1237,784 1247,722 1239,685 1221,664 1177,645 1118,646 1063,664 957,717 946,732 922,740 850,788 782,848 720,917 702,950 687,998 686,1032 701,1074 744,1127 795,1158 840,1175 667,1269 565,1340 543,1368 552,1376 573,1373 610,1346 629,1342 648,1327 665,1324 684,1309 734,1288 746,1274 808,1252 867,1219 892,1215 906,1203 939,1197 1193,1198 1196,1204 1183,1218 1181,1230 1167,1240 1144,1282 1130,1293 1097,1347 1090,1369 1075,1380 1056,1424 1043,1436 1036,1463 1027,1470 1014,1523 1017,1536 1028,1545 1055,1537 1107,1502 1119,1487 1162,1466 1171,1452 1184,1448 1223,1413 1234,1411 1241,1398 1253,1395 1360,1306 1415,1246 1421,1223 1415,1203 1392,1190 1360,1182 1239,1177 1307,1086 1320,1044 1452,1002 1475,988 1501,985 1529,970 1587,958 1598,947Z M1054,1588 1042,1607 1024,1614 1022,1632 1049,1659 1063,1656 1065,1632 1076,1620 1077,1603 1070,1591Z M1486,823 1473,824 1458,837 1458,857 1473,873 1483,873 1497,856Z M258,1210 253,1197 213,1202 234,1216 253,1216Z M653,587 649,601 663,606 666,594Z"/></svg>';
async function titaSignatureImage(){
 return new Promise((resolve,reject)=>{
 const image=new Image(),uri='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(titaSignatureSvg);
 image.onload=()=>{try{const canvas=document.createElement('canvas');canvas.width=600;canvas.height=270;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,600,270);resolve(canvas.toDataURL('image/png'));}catch(e){reject(e)}};
 image.onerror=()=>reject(new Error('Signature could not be prepared.'));image.src=uri;
 });
}
$('certificateDownload').onclick=async()=>{
 const button=$('certificateDownload'),notice=$('certificateStatus');
 if(!window.academyEnrollmentReady||!eligible()){notice.textContent='Please complete all nine modules first.';return;}
 button.disabled=true;button.textContent='Creating your PDF…';notice.textContent='Saving and verifying your completed modules. Please wait…';
 try{
  if(!window.jspdf?.jsPDF)throw Error('The PDF library has not loaded. Refresh the page and retry.');
  await window.academySyncAllProgress(saved);
  const {data,error}=await academyClient.rpc('claim_academy_completion');
  if(error||!data?.length)throw Error(error?.message||'Could not verify completion yet.');
  const record=data[0];
  const name=($('authName').value||window.academyStudentName||'Student').trim();
  const date=new Date(record.completed_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
  const pdf=new window.jspdf.jsPDF({orientation:'landscape',unit:'pt',format:'a4'});
  const w=pdf.internal.pageSize.getWidth(),mid=w/2;
  pdf.setFillColor(255,255,255);pdf.rect(0,0,w,595,'F');
  pdf.setDrawColor(247,25,112);pdf.setLineWidth(2.4);pdf.rect(26,26,w-52,543);
  pdf.setLineWidth(.65);pdf.rect(35,35,w-70,525);
  pdf.setTextColor(191,12,83);pdf.setFont('helvetica','bold');pdf.setFontSize(13);pdf.text('LEARNING WITH TITA DHEN',mid,88,{align:'center'});
  pdf.setTextColor(42,26,35);pdf.setFont('times','normal');pdf.setFontSize(41);pdf.text('Certificate of Completion',mid,147,{align:'center'});
  pdf.setFont('helvetica','normal');pdf.setFontSize(13);pdf.text('This certificate is proudly presented to',mid,189,{align:'center'});
  pdf.setTextColor(224,17,91);pdf.setFont('times','bolditalic');pdf.setFontSize(name.length>35?25:35);
  const lines=pdf.splitTextToSize(name,620);pdf.text(lines.slice(0,2),mid,236,{align:'center'});
  pdf.setTextColor(54,42,49);pdf.setFont('helvetica','normal');pdf.setFontSize(12);
  pdf.text('for completing all nine learning modules and practice activities',mid,301,{align:'center'});
  pdf.setFont('helvetica','bold');pdf.text('SMM for Beginners · Learning With Tita Dhen',mid,322,{align:'center'});
  pdf.setFont('helvetica','normal');pdf.setFontSize(10);pdf.setTextColor(103,87,97);
  pdf.text('Completed on '+date,mid,350,{align:'center'});
  const sign=await titaSignatureImage();
  pdf.addImage(sign,'PNG',mid-95,360,190,85);
  pdf.setDrawColor(165,140,152);pdf.line(mid-120,450,mid+120,450);
  pdf.setTextColor(44,33,40);pdf.setFont('helvetica','bold');pdf.setFontSize(13);pdf.text('DHAREN TUBAT',mid,470,{align:'center'});
  pdf.setFont('helvetica','normal');pdf.setFontSize(10);pdf.text('Founder, Learning With Tita Dhen',mid,485,{align:'center'});
  pdf.setFontSize(8);pdf.setTextColor(105,95,99);
  pdf.text('Certificate ID: '+record.certificate_id,mid,525,{align:'center'});
  pdf.text('Academy course completion record · Not a professional accreditation · Practice work is not independently graded',mid,540,{align:'center'});
  pdf.save('Tita-Dhen-Certificate-'+name.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')+'.pdf');
  notice.textContent='Your PDF download has been started! Check your Downloads folder. You can download it again anytime. ♡';
 }catch(err){notice.textContent='Unable to download yet: '+err.message+' Please try again, or send this message to Tita Dhen.';}
 finally{button.disabled=false;button.textContent='Download my certificate (PDF) ♡';}
};
$('graduationContinue').onclick=closeGraduation;$('graduationClose').onclick=closeGraduation;$('graduationOverlay').addEventListener('click',e=>{if(e.target===$('graduationOverlay'))closeGraduation()});
window.closeGraduation=closeGraduation;

window.openStudentCourse=openCourse;
function refreshCourseButtons(enrolled){
 const buttons={heroDemo:['Enroll for free','Jump back to my lessons'],previewDashboard:['Enroll for free','Jump back to my lessons'],startCourse:['Start learning','Continue learning'],footerStart:["Let's get started",'Jump back to my lessons']};
 for(const [id,[before,after]] of Object.entries(buttons)){const btn=$(id);if(btn)btn.innerHTML=(enrolled?after:before)+' <span aria-hidden="true">↗</span>';}
}
window.academyRefreshCourseButtons=()=>{const enrolled=!!window.academyEnrollmentReady;refreshCourseButtons(enrolled);const n=window.academyStudentName||'';const top=$('loginBtn'),mobile=$('mobileLogin');if(top)top.textContent=enrolled?'My lessons ↗':'Enroll for free ↗';if(mobile)mobile.textContent=enrolled?'My lessons':'Enroll for free';for(const id of ['footerLogout']){const element=$(id);if(element)element.hidden=!enrolled;}};
window.addEventListener('academy:session-ready',e=>{const enrolled=!!e.detail?.enrolled;refreshCourseButtons(enrolled);const name=e.detail?.name||'';const desktop=$('loginBtn'),mobile=$('mobileLogin');if(desktop)desktop.textContent=enrolled?'Hi, '+name+'! My lessons ↗':'Enroll for free ↗';if(mobile)mobile.textContent=enrolled?'Hi, '+name+'! My lessons':'Enroll for free';for(const id of ['footerLogout']){const btn=$(id);if(btn)btn.hidden=!enrolled;}});

window.academyStudentProfileChanged=(name)=>{
 refreshCourseButtons(!!window.academyEnrollmentReady);
 const first=(name||'').trim();
 const header=$('loginBtn'),mobile=$('mobileLogin');
 if(header)header.textContent=first?'Hi, '+first+'! My lessons ↗' :'Enroll for free ↗';
 if(mobile)mobile.textContent=first?'Hi, '+first+'! My lessons' :'Enroll for free';
 for(const id of ['footerLogout']){const btn=$(id);if(btn)btn.hidden=!first;}
 let welcome=$('studentWelcome');
 if(!welcome){welcome=document.createElement('div');welcome.id='studentWelcome';welcome.style.cssText='margin:0 0 20px;padding:18px 22px;border-radius:14px;background:#fff1f7;border:1px solid #f9cfdf;color:#48263a;font-family:Poppins,sans-serif;';const target=$('lessonNumber');target?.parentNode.insertBefore(welcome,target);}
 if(welcome){welcome.textContent=first?'Welcome back, '+first+'! ♡ Ready for your next lesson?':'Welcome to your learning space! ♡';}
};


// Keep all enrollment CTAs synchronized with verified enrollment state.
window.academyRefreshCourseButtons?.();
if(window.academyEnrollmentReady)window.academyStudentProfileChanged(window.academyStudentName||'');
// Graduates may revisit the certificate without repeating the last lesson.
const revisit=document.createElement('button');revisit.type='button';revisit.id='reopenGraduation';revisit.className='btn btn-pink';revisit.textContent='View my graduation & certificate ♡';revisit.hidden=true;revisit.style.marginTop='14px';revisit.onclick=showGraduation;$('bonusSection').appendChild(revisit);updateBonus();
