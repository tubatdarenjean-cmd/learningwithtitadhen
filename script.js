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
$('certificateDownload').onclick=async()=>{
 if(!window.academyEnrollmentReady||!eligible()){alert('Finish all nine modules before receiving your certificate.');return;}
 const tab=window.open('','_blank');
 if(!tab){alert('Please allow pop-ups to print your certificate.');return;}
 tab.document.write('<p style="font-family:Arial;padding:32px">Checking your saved course completion… ♡</p>');
 const {data,error}=await academyClient.rpc('claim_academy_completion');
 if(error||!data?.length){tab.document.body.textContent='Certificate not ready: '+(error?.message||'Unable to confirm saved completion.');return;}
 const record=data[0];
 const fullName=$('authName').value.trim()||window.academyStudentName||'Student';
 const date=new Date(record.completed_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
 const escapedName=safe(fullName),escapedDate=safe(date),escapedId=safe(record.certificate_id);
 tab.document.open();
 tab.document.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Learning With Tita Dhen — Course Completion</title><style>@page{size:landscape;margin:14mm}body{margin:0;font-family:Arial,sans-serif;color:#332633;background:white}.certificate{border:8px double #f71970;min-height:160mm;box-sizing:border-box;padding:30px 45px;text-align:center}.brand{font-size:16px;letter-spacing:4px;color:#d41467}.ornament{color:#f71970;font-size:29px;margin:12px}h1{font-family:Georgia,serif;font-size:48px;font-weight:400;margin:18px 0 10px}.name{font-family:Georgia,serif;font-size:40px;color:#f71970;margin:18px 0;border-bottom:1px solid #e6b5cb;display:inline-block;padding:0 45px 9px}.message{font-size:18px;line-height:1.6}.foot{margin-top:25px;font-size:13px}.note{font-size:10px;color:#776c70;margin-top:22px}@media print{button{display:none}}button{margin:14px;padding:12px 25px;border:0;background:#f71970;color:white;cursor:pointer}</style></head><body><div class="certificate"><div class="brand">♡ LEARNING WITH TITA DHEN</div><div class="ornament">✦ ♡ ✦</div><h1>Certificate of Completion</h1><p class="message">This certificate proudly celebrates</p><div class="name">'+escapedName+'</div><p class="message">for completing all nine learning modules and practice activities<br>in the <b>Learning With Tita Dhen — SMM for Beginners</b> course.</p><p class="foot">Completed on '+escapedDate+' · Keep learning. Keep practicing. Kaya mo yan! ♡</p><p class="note">Academy certificate ID: '+escapedId+'<br>A course completion record, not an accredited professional certification. Certificate records completion tracked by the academy. Practice tasks are not independently graded.</p></div><button onclick="window.print()">Save or Print Certificate</button></body></html>');
 tab.document.close();
 tab.focus();
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
