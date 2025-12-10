 
const $=s=>document.querySelector(s);const $$=s=>Array.from(document.querySelectorAll(s));
const i18n={
  ar:{app_title:'التذكيرات',next_label:'أقرب تذكير:',add_button:'إضافة تذكير',popover_title:'إضافة تذكير',list_title:'قائمة التذكيرات',title_label:'العنوان',type_label:'النوع',start_label:'البداية',start_started:'بدأت',start_schedule:'تاريخ بداية',due_label:'آخر موعد للتسليم',delivery_label:'طريقة التسليم',delivery_inperson:'حضوري',room_placeholder:'رقم القاعة',points_label:'الدرجة',points_placeholder:'مثلاً 25%',priority_label:'الأهمية',priority_critical:'مهم جداً',priority_normal:'مهم',priority_low:'غير مهم',details_label:'التفاصيل/المطلوب',details_placeholder:'اكتب المطلوب',images_label:'صور للمطلوب',submit:'إضافة',reset:'مسح',loading_text:'جاري التحميل…',sync_failed:'فشلت المزامنة',due_prefix:'التسليم: ',delivery_prefix:'التسليم: ',room_prefix:'القاعة: ',points_prefix:'الدرجة: ',left_prefix:'متبقي: ',seconds_suffix:' ثانية',overdue:'متأخر',no_reminders:'لا يوجد تذكيرات',toggle_aria:'عرض التفاصيل',type_exam:'اختبار',type_assignment:'اسايمنت/واجبات',type_report:'ريبورت/تقرير',type_final:'اختبار نهائي',contact_title:'معلومات التواصل مع المطور AHMAD',wa_label:'واتساب',telegram_try:'جرّب أيضاً بوت التحضير التلقائي',telegram_label:'UAttend'},
  en:{app_title:'Reminders',next_label:'Next due:',add_button:'Add Reminder',popover_title:'Add Reminder',list_title:'Reminders',title_label:'Title',type_label:'Type',start_label:'Start',start_started:'Started',start_schedule:'Start date',due_label:'Due date',delivery_label:'Delivery',delivery_inperson:'In person',room_placeholder:'Room number',points_label:'Points',points_placeholder:'e.g. 25%',priority_label:'Priority',priority_critical:'Very important',priority_normal:'Important',priority_low:'Not important',details_label:'Details',details_placeholder:'Describe requirements',images_label:'Images',submit:'Add',reset:'Clear',loading_text:'Loading…',sync_failed:'Sync failed',due_prefix:'Due: ',delivery_prefix:'Delivery: ',room_prefix:'Room: ',points_prefix:'Points: ',left_prefix:'Left: ',seconds_suffix:' s',overdue:'Overdue',no_reminders:'No reminders',toggle_aria:'Show details',type_exam:'Exam',type_assignment:'Assignment',type_report:'Report',type_final:'Final',contact_title:'Contact with developer AHMAD',wa_label:'WhatsApp',telegram_try:'Try also the auto attendance bot',telegram_label:'UAttend'}
};
// overrides
i18n.ar.title_label='العنوان (اختياري)';
i18n.ar.subject_label='اسم المادة';
i18n.ar.type_exam='اختبار شهري';
i18n.ar.type_presentation='برزنتيشن/عرض تقديمي';
i18n.ar.day_suffix=' يوم ';
i18n.ar.hour_suffix=' ساعة ';
i18n.ar.minute_suffix=' دقيقة ';
i18n.en.title_label='Title (optional)';
i18n.en.subject_label='Subject';
i18n.en.type_exam='Monthly Exam';
i18n.en.type_presentation='Presentation';
i18n.ar.type_project='مشروع/بروجكت';
i18n.en.type_project='Project';
i18n.en.day_suffix=' d ';
i18n.en.hour_suffix=' h ';
i18n.en.minute_suffix=' m ';
// labels for details expansion
i18n.ar.more_details='المزيد من التفاصيل';
i18n.en.more_details='More details';
i18n.ar.no_details='لا يوجد تفاصيل';
i18n.en.no_details='No details';
i18n.ar.expired_title='التذكيرات المنتهية';
i18n.en.expired_title='Expired Reminders';
i18n.ar.elapsed_prefix='منذ: ';
i18n.en.elapsed_prefix='Elapsed: ';
i18n.ar.no_expired='لا يوجد تذكيرات منتهية';
i18n.en.no_expired='No expired reminders';
i18n.ar.contact_hint='تواصل معنا';
i18n.en.contact_hint='Contact Us';
i18n.ar.footer_rights='جميع الحقوق محفوظة لـ Ahmad Alhomsi © 2025';
i18n.en.footer_rights='All rights reserved to Ahmad Alhomsi © 2025';
let fsdb=null;let authReady=Promise.resolve();
 
// labels for expired section and elapsed
i18n.ar.expired_title='التذكيرات المنتهية';
i18n.en.expired_title='Expired Reminders';
i18n.ar.elapsed_prefix='منذ: ';
i18n.en.elapsed_prefix='Elapsed: ';
i18n.ar.no_expired='لا يوجد تذكيرات منتهية';
i18n.en.no_expired='No expired reminders';
const state={reminders:[],map:new Map(),expiredMap:new Map(),lang:localStorage.getItem('lang')||'ar',dev:false};
let uiBound=false;
const fmtDate=t=>new Date(t).toLocaleString(state.lang==='ar'?'ar-SA':'en-US',{hour12:false});
const fmtTime=t=>new Date(t).toLocaleTimeString(state.lang==='ar'?'ar-SA':'en-US',{hour12:false,hour:'2-digit',minute:'2-digit'});
const fmtTimeEn=t=>new Date(t).toLocaleTimeString('en-US',{hour12:false,hour:'2-digit',minute:'2-digit'});
const fmtDateOnly=t=>{const d=new Date(t);const dd=String(d.getDate()).padStart(2,'0');const mm=String(d.getMonth()+1).padStart(2,'0');const yy=d.getFullYear();return `${dd}/${mm}/${yy}`};
const fmtDayName=t=>new Date(t).toLocaleDateString(state.lang==='ar'?'ar-SA':'en-US',{weekday:'long'});
const untilSeconds=t=>Math.floor((new Date(t).getTime()-Date.now())/1000);
const id=()=>Math.random().toString(36).slice(2)+Date.now().toString(36);
const toDataUrls=files=>Promise.all(Array.from(files).map(f=>new Promise(r=>{const fr=new FileReader();fr.onload=e=>r(e.target.result);fr.readAsDataURL(f);}))); 
const toBase64s=files=>Promise.all(Array.from(files).map(f=>new Promise(r=>{const fr=new FileReader();fr.onload=e=>{const s=String(e.target.result||'');const b=s.includes(',')?s.split(',')[1]:s;r({base64:b,name:f.name})};fr.readAsDataURL(f);}))); 
const uploadImages=async(files)=>{if(!files||!files.length)return[];const key=(window.imgbbKey||localStorage.getItem('imgbbKey')||'').trim();const b64=await toBase64s(files);const durls=await toDataUrls(files);if(!key)return durls;const urls=[];for(let i=0;i<b64.length;i++){try{const fd=new FormData();fd.append('image',b64[i].base64);fd.append('name',b64[i].name||('img-'+Date.now()));const endpoint='https://api.imgbb.com/1/upload?key='+encodeURIComponent(key);const res=await fetch(endpoint,{method:'POST',body:fd});if(!res.ok)throw new Error('upload');const data=await res.json();const u=(data&&data.data&&(data.data.display_url||data.data.url))||null;urls.push(u||durls[i])}catch(_){urls.push(durls[i])}}return urls}; 
const loadPublic=async()=>{try{const res=await fetch('reminders.json',{cache:'no-store'});if(!res.ok)return null;const arr=await res.json();return Array.isArray(arr)?arr:null}catch(_){return null}};
const initFirebase=()=>{try{const cfg=window.firebaseConfig||{};if(!cfg||!cfg.projectId){fsdb=null;return}firebase.initializeApp(cfg);fsdb=firebase.firestore();try{fsdb.settings({experimentalForceLongPolling:true})}catch(_){ }authReady=firebase.auth().signInAnonymously().catch(()=>{})}catch(_){fsdb=null}};
const dbOps={init:async()=>{},getAll:async()=>{if(!fsdb)return [];const snap=await fsdb.collection('reminders').orderBy('dueAt','asc').get();return snap.docs.map(d=>d.data())},add:async(obj)=>{if(!fsdb)return;await fsdb.collection('reminders').doc(String(obj.id)).set(obj,{merge:true})},delete:async(id)=>{if(!fsdb)return;await fsdb.collection('reminders').doc(String(id)).delete()}};
const typeLabel=v=>{const mapAr={'اختبار شهري':'type_exam','اسايمنت':'type_assignment','ريبورت':'type_report','برزنتيشن/عرض تقديمي':'type_presentation','اختبار نهائي':'type_final','مشروع':'type_project','بروجكت':'type_project'};const key=mapAr[v]||null;return key?i18n[state.lang][key]:(v||'')};
const render=()=>{
  const list=$('#reminders');
  const expiredList=$('#expired');
  list.innerHTML='';
  expiredList.innerHTML='';
  state.map.clear();
  state.expiredMap.clear();
  const rank=p=>p==='critical'?0:p==='normal'?1:2;
  const now=Date.now();
  const sorted=[...state.reminders].sort((a,b)=>{const ta=new Date(a.dueAt).getTime();const tb=new Date(b.dueAt).getTime();if(ta!==tb)return ta-tb;return rank(a.priority)-rank(b.priority)});
  const upcoming=sorted.filter(r=>new Date(r.dueAt).getTime()>=now);
  const expired=sorted.filter(r=>new Date(r.dueAt).getTime()<now);
  const renderGroup=(items,rootList,isExpired)=>{
    if(items.length===0)return;
    const groups=new Map();
    items.forEach(rem=>{const key=new Date(rem.dueAt).toISOString().slice(0,10);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(rem)});
    let first=true;
    groups.forEach((gi)=>{
      if(!first){const sep=document.createElement('div');sep.className='group-divider';rootList.appendChild(sep)}
      first=false;
      const header=document.createElement('div');
      header.className='group-header';
      const date=fmtDateOnly(gi[0].dueAt);
      const day=fmtDayName(gi[0].dueAt);
      header.innerHTML=`<span class="day">${day}</span><span class="date date-large">${date}</span>`;
      rootList.appendChild(header);
      gi.forEach(rem=>{
        const tpl=document.getElementById('reminderTemplate');
        const node=tpl.content.cloneNode(true);
        const root=node.querySelector('.reminder-item');
        const title=node.querySelector('.title');
        const type=node.querySelector('.type');
        const due=node.querySelector('.due');
        const countdown=node.querySelector('.countdown');
        const expandToggle=node.querySelector('.expand-toggle');
        const expandable=node.querySelector('.expandable');
        const delivery=node.querySelector('.delivery');
        const room=node.querySelector('.room');
        const points=node.querySelector('.points');
        const details=node.querySelector('.details');
        const images=node.querySelector('.images');
        title.textContent=rem.title;
        type.textContent=typeLabel(rem.type);
        due.textContent=fmtTimeEn(rem.dueAt);
        delivery.textContent=i18n[state.lang].delivery_prefix+(rem.delivery==='حضوري'?i18n[state.lang].delivery_inperson:rem.delivery);
        room.textContent=rem.delivery==='حضوري'&&rem.room?(i18n[state.lang].room_prefix+rem.room):'';
        points.textContent=i18n[state.lang].points_prefix+rem.points+'%';
        delivery.classList.toggle('hidden',!delivery.textContent);
        room.classList.toggle('hidden',!room.textContent);
        points.classList.toggle('hidden',!points.textContent);
        details.textContent=rem.details||'';
        images.innerHTML=(rem.images||[]).map(src=>`<img src="${src}" onerror="this.style.display='none'">`).join('');
        images.querySelectorAll('img').forEach(img=>img.addEventListener('click',()=>openImgPreview(img.src)));
        const expandText=node.querySelector('.expand-text');
        if(expandText)expandText.textContent=i18n[state.lang].more_details;
        expandToggle?.addEventListener('click',()=>{
          expandToggle.classList.toggle('active');
          const open=expandable.classList.toggle('open');
          details.classList.toggle('hidden',!open);
          images.classList.toggle('hidden',!open);
          if(open){if(!details.textContent && !images.innerHTML){details.textContent=i18n[state.lang].no_details}}
        });
        root.dataset.id=rem.id;
        root.dataset.due=rem.dueAt;
        countdown.textContent='';
        if(rem.priority==='critical')root.classList.add('p-critical');
        else if(rem.priority==='low')root.classList.add('p-low');
        if(state.dev){const del=document.createElement('button');del.className='delete-btn';del.textContent='🗑';del.addEventListener('click',async()=>{try{await dbOps.delete(rem.id);state.reminders=await dbOps.getAll();render()}catch(_){}});const head=root.querySelector('.reminder-head');head?.appendChild(del)}
        rootList.appendChild(node);
        if(isExpired){state.expiredMap.set(rem.id,{countdownEl:countdown,dueAt:rem.dueAt})}
        else {state.map.set(rem.id,{countdownEl:countdown,dueAt:rem.dueAt})}
      });
    });
  };
  renderGroup(upcoming,list,false);
  renderGroup(expired,expiredList,true);
  updateTicks();
};
let popoverEl=null,overlayEl=null,imgPreviewEl=null,contactEl=null;
const updateOverlay=()=>{const anyOpen=(popoverEl && !popoverEl.classList.contains('hidden'))||(imgPreviewEl && !imgPreviewEl.classList.contains('hidden'))||(contactEl && !contactEl.classList.contains('hidden'));if(overlayEl){overlayEl.classList.toggle('hidden',!anyOpen)}};
const openPop=()=>{popoverEl?.classList.remove('hidden');updateOverlay()};
const closePop=()=>{popoverEl?.classList.add('hidden');overlayEl?.classList.add('hidden')};
const updateTicks=()=>{const now=Date.now();let next=null;const pad=n=>String(n).padStart(2,'0');state.map.forEach((v)=>{const secs=Math.floor((new Date(v.dueAt).getTime()-now)/1000);if(secs>0){const d=Math.floor(secs/86400);let r=secs%86400;const h=Math.floor(r/3600);r%=3600;const m=Math.floor(r/60);const s=r%60;const text=i18n[state.lang].left_prefix+d+i18n[state.lang].day_suffix+pad(h)+':'+pad(m)+':'+pad(s);v.countdownEl.textContent=text;v.countdownEl.classList.remove('overdue');v.countdownEl.classList.add('ok');if(next===null||secs<next)next=secs}else{v.countdownEl.textContent=i18n[state.lang].overdue;v.countdownEl.classList.remove('ok');v.countdownEl.classList.add('overdue')}});state.expiredMap.forEach((v)=>{const secs=Math.floor((now - new Date(v.dueAt).getTime())/1000);const d=Math.floor(secs/86400);let r=secs%86400;const h=Math.floor(r/3600);r%=3600;const m=Math.floor(r/60);const s=r%60;const text=i18n[state.lang].elapsed_prefix+d+i18n[state.lang].day_suffix+pad(h)+':'+pad(m)+':'+pad(s);v.countdownEl.textContent=text;v.countdownEl.classList.add('overdue');v.countdownEl.classList.remove('ok')});const nextEl=$('#nextCountdown');if(next===null){nextEl.textContent=i18n[state.lang].no_reminders}else{const d=Math.floor(next/86400);let r=next%86400;const h=Math.floor(r/3600);r%=3600;const m=Math.floor(r/60);const s=r%60;nextEl.textContent=d+i18n[state.lang].day_suffix+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')}};
const tick=()=>{updateTicks()};
const bindForm=()=>{
  const f=$('#reminderForm');
  const btnSubmit=$('#btnSubmit');
  const btnReset=$('#btnReset');
  let isSubmitting=false;
  const startModeEls=$$('input[name="startMode"]');
  const startAtEl=$('#startAt');
  const deliveryEls=$$('input[name="delivery"]');
  const roomEl=$('#room');
  const toggleStart=()=>{const mode=startModeEls.find(x=>x.checked)?.value;if(mode==='schedule'){startAtEl.classList.remove('hidden');startAtEl.required=true}else{startAtEl.classList.add('hidden');startAtEl.required=false}};
  const toggleRoom=()=>{const del=deliveryEls.find(x=>x.checked)?.value;if(del==='حضوري'){roomEl.disabled=false;roomEl.placeholder=i18n[state.lang].room_placeholder}else{roomEl.disabled=true;roomEl.value=''}};
  startModeEls.forEach(x=>x.addEventListener('change',toggleStart));
  deliveryEls.forEach(x=>x.addEventListener('change',toggleRoom));
  toggleStart();
  toggleRoom();
  f.addEventListener('submit',async e=>{
    e.preventDefault();
    if(isSubmitting)return; isSubmitting=true;
    if(btnSubmit){btnSubmit.disabled=true;btnSubmit.textContent=i18n[state.lang].loading_text}
    if(btnReset){btnReset.disabled=true}
    const subject=f.subject.value.trim();
    const title=f.title.value.trim();
    const type=f.type.value;
    const startMode=f.querySelector('input[name="startMode"]:checked').value;
    const startAt=startMode==='schedule'?f.startAt.value:null;
    const dueAt=f.dueAt.value;
    const delivery=f.querySelector('input[name="delivery"]:checked').value;
    const room=delivery==='حضوري'?f.room.value.trim():'';
    const points=Number(f.points.value||0);
    const priority=f.priority.value;
    const details=f.details.value.trim();
    const files=f.images.files;
    if(!(subject||title)||!dueAt){
      isSubmitting=false;
      if(btnSubmit){btnSubmit.disabled=false;btnSubmit.textContent=i18n[state.lang].submit}
      if(btnReset){btnReset.disabled=false}
      return;
    }
    const imgs=files&&files.length?await uploadImages(files):[];
    const obj={id:id(),subject,title:(subject?(subject+(title?' — '+title:'')):title),type,startAt:startMode==='started'?new Date().toISOString():startAt,dueAt:new Date(dueAt).toISOString(),delivery,room,points,priority,details,images:imgs};
    try{
      await dbOps.add(obj);
      state.reminders=await dbOps.getAll();
      render();
      f.reset();
      toggleStart();
      toggleRoom();
      closePop();
      if(btnSubmit)btnSubmit.textContent=i18n[state.lang].submit;
    }catch(_){
      if(btnSubmit)btnSubmit.textContent=i18n[state.lang].sync_failed;
    }
    isSubmitting=false;
    if(btnSubmit)btnSubmit.disabled=false;
    if(btnReset)btnReset.disabled=false;
  });
};
const bindPopover=()=>{popoverEl=$('#addPopover');overlayEl=$('#overlay');const btn=$('#openAdd');const addClose=$('#addClose');if(btn&&!btn.dataset.bound){btn.dataset.bound='1';btn.addEventListener('click',()=>openPop())}if(addClose&&!addClose.dataset.bound){addClose.dataset.bound='1';addClose.addEventListener('click',()=>closePop())}overlayEl?.addEventListener('click',()=>{closePop();closeImgPreview();closeContact();overlayEl.classList.add('hidden')});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePop();closeImgPreview();closeContact();overlayEl.classList.add('hidden')}})};
const openImgPreview=(src)=>{if(!imgPreviewEl){imgPreviewEl=document.createElement('div');imgPreviewEl.id='imgPreview';imgPreviewEl.className='img-preview-modal hidden';document.body.appendChild(imgPreviewEl);imgPreviewEl.addEventListener('click',e=>{if(e.target===imgPreviewEl)closeImgPreview()})}imgPreviewEl.innerHTML='<button class="img-preview-close" aria-label="Close">✕</button><img src="'+src+'" />';const btn=imgPreviewEl.querySelector('.img-preview-close');btn?.addEventListener('click',()=>closeImgPreview());imgPreviewEl.classList.remove('hidden');overlayEl?.classList.remove('hidden')};
const closeImgPreview=()=>{if(imgPreviewEl){try{imgPreviewEl.remove()}catch(_){imgPreviewEl.classList.add('hidden')}imgPreviewEl=null}if(overlayEl){overlayEl.classList.add('hidden');overlayEl.style.display='none'}};
const openContact=()=>{contactEl=$('#contactPopover');if(contactEl){const t=$('#contactTitle');const wl1=$('#wa1Label');const wl2=$('#wa2Label');const tl=$('#tgLabel');if(t)t.textContent=i18n[state.lang].contact_title;if(wl1)wl1.textContent=i18n[state.lang].wa_label;if(wl2)wl2.textContent=i18n[state.lang].wa_label;if(tl)tl.textContent=i18n[state.lang].telegram_label;contactEl.classList.remove('hidden');updateOverlay()}};
const closeContact=()=>{contactEl=$('#contactPopover');if(contactEl)contactEl.classList.add('hidden');overlayEl?.classList.add('hidden')};
const applyFooter=()=>{const ft=document.getElementById('footerRights');if(ft)ft.textContent=i18n[state.lang].footer_rights};
const bindDevActivator=()=>{const ft=document.getElementById('footerRights');const badge=document.getElementById('devBadge');let clicks=[];if(ft&&!ft.dataset.bound){ft.dataset.bound='1';ft.addEventListener('click',()=>{const now=Date.now();clicks=clicks.filter(t=>now-t<=3000);clicks.push(now);if(clicks.length>=5){state.dev=true;badge?.classList.remove('hidden');render()}})}};
const applyContactI18n=()=>{const t=$('#contactTitle');const wl1=$('#wa1Label');const wl2=$('#wa2Label');const tl=$('#tgLabel');const tt=$('#tgTry');const ch=$('#contactHint');if(t)t.textContent=i18n[state.lang].contact_title;if(wl1)wl1.textContent=i18n[state.lang].wa_label;if(wl2)wl2.textContent=i18n[state.lang].wa_label;if(tl)tl.textContent=i18n[state.lang].telegram_label;if(tt)tt.textContent=i18n[state.lang].telegram_try;if(ch)ch.textContent=i18n[state.lang].contact_hint};
const applyI18n=()=>{document.documentElement.lang=state.lang;document.documentElement.dir=state.lang==='ar'?'rtl':'ltr';document.title=i18n[state.lang].app_title;const appTitle=$('#appTitle');const nextLabel=$('#nextLabel');const openAdd=$('#openAdd');const langIcon=$('#langIcon');const popTitle=$('#popoverTitle');const lblTitle=$('#lblTitle');const lblType=$('#lblType');const lblStart=$('#lblStart');const lblStartStarted=$('#lblStartStarted');const lblStartSchedule=$('#lblStartSchedule');const lblDue=$('#lblDue');const lblDelivery=$('#lblDelivery');const lblDeliveryInPerson=$('#lblDeliveryInPerson');const lblPoints=$('#lblPoints');const lblPriority=$('#lblPriority');const lblDetails=$('#lblDetails');const lblImages=$('#lblImages');const btnSubmit=$('#btnSubmit');const btnReset=$('#btnReset');const listTitle=$('#listTitle');const roomEl=$('#room');const pointsEl=$('#points');const detailsEl=$('#details');const optExam=$('#optExam');const optAssignment=$('#optAssignment');const optReport=$('#optReport');const optFinal=$('#optFinal');const optPC=$('#optPriorityCritical');const optPN=$('#optPriorityNormal');const optPL=$('#optPriorityLow');if(appTitle)appTitle.textContent=i18n[state.lang].app_title;if(nextLabel)nextLabel.textContent=i18n[state.lang].next_label;if(openAdd)openAdd.textContent=i18n[state.lang].add_button;if(langIcon)langIcon.textContent='🌐';if(popTitle)popTitle.textContent=i18n[state.lang].popover_title;if(lblTitle)lblTitle.textContent=i18n[state.lang].title_label;if(lblType)lblType.textContent=i18n[state.lang].type_label;if(lblStart)lblStart.textContent=i18n[state.lang].start_label;if(lblStartStarted)lblStartStarted.textContent=i18n[state.lang].start_started;if(lblStartSchedule)lblStartSchedule.textContent=i18n[state.lang].start_schedule;if(lblDue)lblDue.textContent=i18n[state.lang].due_label;if(lblDelivery)lblDelivery.textContent=i18n[state.lang].delivery_label;if(lblDeliveryInPerson)lblDeliveryInPerson.textContent=i18n[state.lang].delivery_inperson;if(lblPoints)lblPoints.textContent=i18n[state.lang].points_label;if(lblPriority)lblPriority.textContent=i18n[state.lang].priority_label;if(lblDetails)lblDetails.textContent=i18n[state.lang].details_label;if(lblImages)lblImages.textContent=i18n[state.lang].images_label;if(btnSubmit)btnSubmit.textContent=i18n[state.lang].submit;if(btnReset)btnReset.textContent=i18n[state.lang].reset;if(listTitle)listTitle.textContent=i18n[state.lang].list_title;if(roomEl)roomEl.placeholder=i18n[state.lang].room_placeholder;if(pointsEl)pointsEl.placeholder=i18n[state.lang].points_placeholder;if(detailsEl)detailsEl.placeholder=i18n[state.lang].details_placeholder;if(optExam)optExam.textContent=i18n[state.lang].type_exam;if(optAssignment)optAssignment.textContent=i18n[state.lang].type_assignment;if(optReport)optReport.textContent=i18n[state.lang].type_report;if(optFinal)optFinal.textContent=i18n[state.lang].type_final;if(optPC)optPC.textContent=i18n[state.lang].priority_critical;if(optPN)optPN.textContent=i18n[state.lang].priority_normal;if(optPL)optPL.textContent=i18n[state.lang].priority_low};
const applySubjectLabel=()=>{const lblSubject=$('#lblSubject');if(lblSubject)lblSubject.textContent=i18n[state.lang].subject_label;const lblTitle=$('#lblTitle');if(lblTitle)lblTitle.textContent=i18n[state.lang].title_label;const optExam=$('#optExam');if(optExam)optExam.textContent=i18n[state.lang].type_exam;const optAssign=$('#optAssignment');if(optAssign)optAssign.textContent=i18n[state.lang].type_assignment;const optReport=$('#optReport');if(optReport)optReport.textContent=i18n[state.lang].type_report;const optPresent=$('#optPresentation');if(optPresent)optPresent.textContent=i18n[state.lang].type_presentation;const optFinal=$('#optFinal');if(optFinal)optFinal.textContent=i18n[state.lang].type_final;const optProject=$('#optProject');if(optProject)optProject.textContent=i18n[state.lang].type_project;const expiredTitle=$('#expiredTitle');if(expiredTitle)expiredTitle.textContent=i18n[state.lang].expired_title};
const bindLangIcon=()=>{const btn=$('#langIcon');if(btn){btn.addEventListener('click',()=>{state.lang=state.lang==='ar'?'en':'ar';localStorage.setItem('lang',state.lang);applyI18n();applySubjectLabel();applyContactI18n();applyFooter();render()})}};
const bindContact=()=>{const btn=$('#contactIcon');const close=$('#contactClose');const wa1=$('#wa1');const wa2=$('#wa2');const tg=$('#tg');if(btn)btn.addEventListener('click',()=>openContact());if(close)close.addEventListener('click',()=>closeContact());const openLink=u=>window.open(u,'_blank');if(wa1)wa1.addEventListener('click',()=>{wa1.classList.add('glow','green');openLink('https://wa.me/966500900329')});if(wa2)wa2.addEventListener('click',()=>{wa2.classList.add('glow','green');openLink('https://wa.me/601120721104')});if(tg)tg.addEventListener('click',()=>{tg.classList.add('glow','blue');openLink('https://t.me/UAttend_bot')})};
const startRealtime=()=>{try{fsdb.collection('reminders').orderBy('dueAt','asc').onSnapshot(snap=>{state.reminders=snap.docs.map(d=>d.data());render()})}catch(_){}}
const boot=async()=>{await dbOps.init();applyI18n();applySubjectLabel();applyFooter();applyContactI18n();if(!uiBound){bindForm();bindPopover();bindLangIcon();bindContact();bindDevActivator();uiBound=true}initFirebase();await authReady;startRealtime();state.reminders=await dbOps.getAll();render();setInterval(tick,1000)};
document.addEventListener('DOMContentLoaded',boot);
