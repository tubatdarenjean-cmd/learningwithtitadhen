/* Password-free student enrollment. Supabase anonymous sessions persist in this browser. */
const academyClient=window.supabase.createClient('https://gumdxsauchiyhmdyvltj.supabase.co','sb_publishable_cKFcoAILjlQCrX9ZpIi8-g_4j9HSqK_');
const field=id=>document.getElementById(id);
let academyUser=null, saveTimer=null, authSequence=0;
window.academyEnrollmentReady=false;
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
 if(!academyUser){window.academyProgressLoaded?.({});window.closeStudentDashboard?.();return;}
 const {data,error}=await academyClient.from('student_profiles').select('display_name,contact_email,experience_level,marketing_opt_in,privacy_accepted_at,profile_completed').eq('user_id',academyUser.id).maybeSingle();
 if(seq!==authSequence)return;
 if(error||!data){authMessage('Could not load student profile. Try refreshing the page.');window.closeStudentDashboard?.();return;}
 fillProfile(data);
 window.academyEnrollmentReady=!!(data.profile_completed&&data.display_name&&data.contact_email&&data.experience_level&&data.privacy_accepted_at);
 if(!window.academyEnrollmentReady){
  authMessage('Complete your student information to unlock the lessons.');
  window.closeStudentDashboard?.();
  return;
 }
 authMessage('Your profile is saved. You can now access your lessons!');
 await loadProgress();
}
field('authSignup').onclick=async()=>{
 const button=field('authSignup');
 if(button.disabled)return;
 const display_name=field('authName').value.trim(),contact_email=field('authEmail').value.trim().toLowerCase(),experience_level=field('authExperience').value,marketing_opt_in=field('authMarketing').checked;
 if(display_name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)||!experience_level||!field('authPrivacy').checked){authMessage('Please complete your name, valid email, experience level, and privacy acknowledgement.');return;}
 button.disabled=true;button.textContent='Saving your student profile…';
 try{
  let {data:{session}}=await academyClient.auth.getSession();
  if(!session){const create=await academyClient.auth.signInAnonymously();if(create.error)throw create.error;session=create.data.session;}
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
  if(typeof window.openStudentCourse==='function')window.openStudentCourse();
 }catch(e){
  authMessage(/Anonymous sign-ins are disabled|anonymous/i.test(e.message)?'Anonymous student access must be enabled in Supabase Authentication → Providers → Anonymous Sign-Ins.':('Could not enroll: '+e.message));
 }finally{button.disabled=false;button.textContent='Save my profile & start learning →';}
};
academyClient.auth.onAuthStateChange((event,session)=>setTimeout(()=>verifyAccess(session),0));
academyClient.auth.getSession().then(({data})=>verifyAccess(data.session));
