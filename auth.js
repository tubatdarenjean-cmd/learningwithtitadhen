/* Password-free student enrollment. Supabase anonymous sessions persist in this browser. */
const academyClient=window.supabase.createClient('https://gumdxsauchiyhmdyvltj.supabase.co','sb_publishable_cKFcoAILjlQCrX9ZpIi8-g_4j9HSqK_');
const field=id=>document.getElementById(id);
let academyUser=null, saveTimer=null, authSequence=0;
window.academyEnrollmentReady=false;
window.academySessionLoading=true;
window.academyStudentName='';
function authMessage(message){const el=field('authNotice');el.textContent=message;el.style.display='block';el.style.padding='12px 14px';el.style.marginTop='12px';el.style.borderRadius='9px';el.style.background='#fff0f5';el.style.color='#6d1235';el.style.fontWeight='600';el.setAttribute('role','status');el.setAttribute('aria-live','polite');}
function fillProfile(data){
 if(!data)return;
 field('authName').value=data.display_name||'';
 field('authEmail').value=data.contact_email||'';
 field('authExperience').value=data.experience_level||'';
 field('authMarketing').checked=!!data.marketing_opt_in;
 field('authPrivacy').checked=!!data.privacy_accepted_at;
}
async function loadProgress(){
 if(!academyUser||!window.academyEnrollmentReady){window.academyProgressLoaded?.({});return;}
 const [lessons,notes]=await Promise.all([
  academyClient.from('lesson_progress').select('module_id,lesson_id,completed').eq('user_id',academyUser.id),
  academyClient.from('assignment_drafts').select('module_id,response').eq('user_id',academyUser.id)
 ]);
 if(lessons.error||notes.error){authMessage('Unable to load progress. Please refresh.');return;}
 const saved={};
 for(const x of lessons.data||[]){const i=Number(x.module_id.replace('module-',''));if(x.lesson_id==='completion')saved['done'+i]=x.completed;if(x.lesson_id==='quiz')saved['quiz'+i]=x.completed;}
 for(const x of notes.data||[]){const i=Number(x.module_id.replace('module-',''));saved['notes'+i]=x.response;}
 window.academyProgressLoaded?.(saved);
}
window.academySave=(current,i)=>{
 if(!academyUser||!window.academyEnrollmentReady)return;
 clearTimeout(saveTimer);
 saveTimer=setTimeout(async()=>{
  const user_id=academyUser?.id;if(!user_id)return;
  const module_id='module-'+i;
  const [a,b]=await Promise.all([
   academyClient.from('lesson_progress').upsert([{user_id,module_id,lesson_id:'completion',completed:!!current['done'+i]},{user_id,module_id,lesson_id:'quiz',completed:!!current['quiz'+i]}]),
   academyClient.from('assignment_drafts').upsert({user_id,module_id,response:current['notes'+i]||''})
  ]);
  field('saveMessage').textContent=a.error||b.error?'Progress save failed. Please retry.':'Saved in this browser-linked student account ✓';
 },650);
};
async function verifyAccess(session){
 const seq=++authSequence;
 academyUser=session?.user||null;window.academyEnrollmentReady=false;
 if(!academyUser){window.academySessionLoading=false;window.academyStudentName='';window.academyStudentProfileChanged?.('');window.academyRefreshCourseButtons?.();window.dispatchEvent(new CustomEvent('academy:session-ready',{detail:{enrolled:false,name:''}}));window.closeGraduation?.();window.academyProgressLoaded?.({});window.closeStudentDashboard?.();return;}
 const {data,error}=await academyClient.from('student_profiles').select('display_name,contact_email,experience_level,marketing_opt_in,privacy_accepted_at,profile_completed').eq('user_id',academyUser.id).maybeSingle();
 if(seq!==authSequence)return;
 if(error||!data){window.academySessionLoading=false;authMessage('Could not load student profile. Try refreshing the page.');window.closeStudentDashboard?.();return;}
 fillProfile(data);
 window.academySessionLoading=false;
 window.academyEnrollmentReady=!!(data.profile_completed&&data.display_name&&data.contact_email&&data.experience_level&&data.privacy_accepted_at);
 if(!window.academyEnrollmentReady){
  authMessage('Complete your student information to unlock the lessons.');
  window.closeStudentDashboard?.();
  return;
 }
 window.academyStudentName=data.display_name.trim().split(/\s+/)[0];
 window.academyStudentProfileChanged?.(window.academyStudentName);
 window.academyRefreshCourseButtons?.();
 window.dispatchEvent(new CustomEvent('academy:session-ready',{detail:{enrolled:true,name:window.academyStudentName}}));
 authMessage('Welcome back, '+window.academyStudentName+'! Your lessons are ready.');
 await loadProgress();
}
const academyTurnstileSiteKey='0x4AAAAAAFbfslHa6qPAxK7p';
let academyCaptchaToken='',academyCaptchaWidget=null;
function initializeAcademyCaptcha(){
 if(!window.turnstile||!field('academyTurnstile')){setTimeout(initializeAcademyCaptcha,300);return;}
 if(academyCaptchaWidget!==null)return;
 academyCaptchaWidget=window.turnstile.render('#academyTurnstile',{
  sitekey:academyTurnstileSiteKey,
  callback:token=>{academyCaptchaToken=token;},
  'expired-callback':()=>{academyCaptchaToken='';authMessage('The security check expired. Please verify again.');},
  'error-callback':()=>{academyCaptchaToken='';authMessage('Security check unavailable. Please refresh and try again.');}
 });
}
initializeAcademyCaptcha();
field('authSignup').onclick=async()=>{
 const button=field('authSignup');
 if(button.disabled)return;
 const display_name=field('authName').value.trim(),contact_email=field('authEmail').value.trim().toLowerCase(),experience_level=field('authExperience').value,marketing_opt_in=field('authMarketing').checked;
 const missing=[];if(display_name.length<2)missing.push('your name');if(!contact_email.includes('@')||!contact_email.split('@')[1]?.includes('.'))missing.push('a valid email');if(!experience_level)missing.push('your VA experience');if(!field('authPrivacy').checked)missing.push('privacy acknowledgement');if(missing.length){authMessage('Please check: '+missing.join(', ')+'.');return;}
 if(!academyCaptchaToken){authMessage('Please complete the security verification above before enrolling.');return;}
 button.disabled=true;button.textContent='Saving your student profile…';
 try{
  let {data:{session}}=await academyClient.auth.getSession();
  if(!session){const create=await academyClient.auth.signInAnonymously({options:{captchaToken:academyCaptchaToken}});if(create.error)throw create.error;session=create.data.session;}
  if(!session?.user?.id)throw Error('Could not establish your student session.');
  const user_id=session.user.id;
  // The auth signup trigger creates the blank student profile; upsert handles eventual consistency.
  const {data:updatedProfile,error}=await academyClient.from('student_profiles').update({display_name,contact_email,experience_level,marketing_opt_in,privacy_accepted_at:new Date().toISOString(),profile_completed:true,updated_at:new Date().toISOString()}).eq('user_id',user_id).select('user_id').maybeSingle();
  if(error)throw error;
  if(!updatedProfile)throw Error('Your student profile was not saved. Please refresh and try again.');
  await verifyAccess(session);
  if(!window.academyEnrollmentReady)throw Error('Student profile could not be confirmed. Please retry.');
  authMessage('You’re enrolled, future VA! ♡ Your lessons are now unlocked. Progress stays on this browser.');
  field('loginOverlay').classList.remove('open');
  field('loginOverlay').setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  window.academyRefreshCourseButtons?.();
  if(typeof window.openStudentCourse==='function')window.openStudentCourse();
 }catch(e){
  authMessage(/Anonymous sign-ins are disabled|anonymous/i.test(e.message)?'Anonymous student access must be enabled in Supabase Authentication → Providers → Anonymous Sign-Ins.':('Could not enroll: '+e.message));
 }finally{if(window.turnstile&&academyCaptchaWidget!==null){window.turnstile.reset(academyCaptchaWidget);academyCaptchaToken='';}button.disabled=false;button.textContent='Save my profile & start learning →';}
};
async function academyLogout(){
 if(!window.confirm('Log out of Learning With Tita Dhen? This password-free account cannot be recovered if you log out, so you may permanently lose your saved lessons and progress. Continue?'))return;
 try{const {error}=await academyClient.auth.signOut();if(error)throw error;window.academyEnrollmentReady=false;window.academyStudentName='';window.academyStudentProfileChanged?.('');window.academyRefreshCourseButtons?.();window.closeStudentDashboard?.();window.closeGraduation?.();authMessage('You have logged out. Enroll again to start a new browser-linked student account.');}catch(e){authMessage('Could not log out: '+e.message);}
}
['headerLogout','mobileLogout','courseLogout'].forEach(id=>{const b=field(id);if(b)b.onclick=academyLogout;});
academyClient.auth.onAuthStateChange((event,session)=>setTimeout(()=>verifyAccess(session),0));
// onAuthStateChange supplies INITIAL_SESSION; avoid a second, potentially stale session request.
