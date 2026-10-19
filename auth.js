/* Public browser credentials only; never place a service-role key here. */
const academyClient=window.supabase.createClient('https://gumdxsauchiyhmdyvltj.supabase.co','sb_publishable_cKFcoAILjlQCrX9ZpIi8-g_4j9HSqK_');
let academyUser=null;let saveTimer=null;let accountProgress={};window.academyEnrollmentReady=false;
const field=id=>document.getElementById(id);
function authMessage(s){field('authNotice').textContent=s}
function toggleAccount(){let on=!!academyUser;field('authFields').hidden=on;field('authSignout').hidden=!on;field('accountStatus').textContent=on?`Signed in as ${academyUser.email}. Your course progress will sync across devices.`:'Create your free student account or sign in to continue your course on any device.'}
async function loadProgress(){if(!academyUser||!window.academyEnrollmentReady){window.academyProgressLoaded?.({});return}let {data,error}=await academyClient.from('lesson_progress').select('module_id,lesson_id,completed').eq('user_id',academyUser.id);if(error){authMessage(error.message);return}let saved={};for(const x of data||[]){const i=Number(x.module_id.replace('module-',''));if(x.lesson_id==='completion')saved['done'+i]=x.completed;if(x.lesson_id==='quiz')saved['quiz'+i]=x.completed}let notes=await academyClient.from('assignment_drafts').select('module_id,response').eq('user_id',academyUser.id);if(!notes.error)for(const x of notes.data||[]){const i=Number(x.module_id.replace('module-',''));saved['notes'+i]=x.response}accountProgress=saved;window.academyProgressLoaded?.(saved)}
window.academySave=(current,i)=>{if(!academyUser||!window.academyEnrollmentReady)return;clearTimeout(saveTimer);saveTimer=setTimeout(async()=>{const uid=academyUser?.id;if(!uid)return;const module_id='module-'+i;const updates=[{user_id:uid,module_id,lesson_id:'completion',completed:!!current['done'+i]},{user_id:uid,module_id,lesson_id:'quiz',completed:!!current['quiz'+i]}];const [r1,r2]=await Promise.all([academyClient.from('lesson_progress').upsert(updates),academyClient.from('assignment_drafts').upsert({user_id:uid,module_id,response:current['notes'+i]||''})]);if(r1.error||r2.error)field('saveMessage').textContent='Cloud save failed. Check connection.';else field('saveMessage').textContent='Saved to your student account ✓';},650)};
const signupButton=field('authSignup');
function showSignupResult(kind,message){
  let panel=field('signupResult');
  if(!panel){panel=document.createElement('div');panel.id='signupResult';panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');panel.style.cssText='margin:16px 0;padding:16px 18px;border-radius:12px;line-height:1.6;border:1px solid #f71970;background:#fff1f6;color:#31222a;white-space:pre-line';field('authNotice').insertAdjacentElement('beforebegin',panel)}
  panel.hidden=false;panel.textContent=message;panel.style.borderColor=kind==='error'?'#b42318':'#f71970';panel.style.background=kind==='error'?'#fff4f2':'#fff1f6';
  authMessage(message);
}
async function busyButton(button,promiseAction){if(button.disabled)return;const original=button.textContent;button.disabled=true;button.textContent='Please wait…';try{await promiseAction()}catch(e){showSignupResult('error','Something went wrong: '+(e?.message||'Please try again.'))}finally{button.disabled=false;button.textContent=original}}
signupButton.onclick=()=>busyButton(signupButton,async()=>{
 const email=field('authEmail').value.trim(),password=field('authPassword').value,name=field('authName').value.trim();
 if(!name||!email||password.length<8){showSignupResult('error','Please enter your name, email, and a password of at least 8 characters.');return;}
 if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)){showSignupResult('error','Please enter a valid email address.');return;}
 showSignupResult('info','Creating your free student account…');
 const {data,error}=await academyClient.auth.signUp({email,password,options:{data:{display_name:name,marketing_opt_in:field('authMarketing').checked},emailRedirectTo:location.origin+location.pathname}});
 if(error){const limited=error.status===429||/rate limit|too many/i.test(error.message);
 showSignupResult('error',limited?'We could not send your verification email because our email service has reached its sending limit. Please try later. Tita Dhen is working on improving this — no need to keep clicking.':'Registration could not be completed: '+error.message);return;}
 if(data.session){await refreshStudentAccess(data.session);showSignupResult('success','Welcome to Learning With Tita Dhen! Your student account is ready. Open the course dashboard to begin.');return;}
 showSignupResult('success','Almost there, future VA! ♡\\n\\nCheck your email inbox (and Spam or Promotions) for a verification link. Click it to activate your account, then return here and choose Sign in.\\n\\nIf the message does not arrive, avoid submitting repeatedly. Contact Tita Dhen for assistance.');
});
field('authSignin').onclick=async()=>{const {error}=await academyClient.auth.signInWithPassword({email:field('authEmail').value.trim(),password:field('authPassword').value});authMessage(error?error.message:'Welcome back! Your progress is loading.')};
field('authSignout').onclick=async()=>{await academyClient.auth.signOut();authMessage('Signed out successfully.')};
field('authUpdatePassword').onclick=async()=>{const password=field('authPassword').value;if(password.length<8){authMessage('Use at least 8 characters.');return}const {error}=await academyClient.auth.updateUser({password});authMessage(error?error.message:'Password updated. You can now continue learning.');if(!error){field('authUpdatePassword').hidden=true;field('authFields').hidden=true}};
field('authReset').onclick=async()=>{const email=field('authEmail').value.trim();if(!email){authMessage('Enter your email first.');return}const {error}=await academyClient.auth.resetPasswordForEmail(email,{...(location.protocol==='https:' || location.hostname==='localhost' ? {redirectTo:location.origin+location.pathname} : {})});authMessage(error?error.message:'If this email has an account, you will receive password recovery instructions.')};
let authSequence=0;
async function refreshStudentAccess(session){
  const sequence=++authSequence;
  window.academyEnrollmentReady=false;
  academyUser=session?.user||null;
  toggleAccount();
  if(!academyUser){window.academyProgressLoaded?.({});window.closeStudentDashboard?.();return;}
  // The enrollment profile is created only during signup, not on arbitrary sign-in.
  // A signed-in account without an enrollment record cannot open the course.
  const {data,error}=await academyClient.from('student_profiles').select('user_id').eq('user_id',academyUser.id).maybeSingle();
  if(sequence!==authSequence)return;
  if(error){authMessage('Could not verify enrollment. Please try again.');window.closeStudentDashboard?.();return;}
  if(!data){authMessage('This account is not enrolled. Please register for the free academy.');window.closeStudentDashboard?.();return;}
  window.academyEnrollmentReady=true;
  await loadProgress();
  authMessage('You are enrolled! Your private student dashboard is ready.');
}
academyClient.auth.onAuthStateChange((event,session)=>{
  if(event==='PASSWORD_RECOVERY'){
    field('authFields').hidden=false;field('authName').hidden=true;field('authEmail').hidden=true;
    field('authSignup').hidden=true;field('authSignin').hidden=true;field('authReset').hidden=true;
    field('authPassword').value='';field('authPassword').placeholder='Enter a new password';
    field('authUpdatePassword').hidden=false;authMessage('Enter your new password (8+ characters), then select Update password.');
  }
  setTimeout(()=>refreshStudentAccess(session),0);
});
academyClient.auth.getSession().then(({data})=>refreshStudentAccess(data.session));
