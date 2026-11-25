(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const storage = {
    get(key, fallback = '') {try {return localStorage.getItem(`java21:${key}`) ?? fallback;} catch {return fallback;}},
    set(key, value) {try {localStorage.setItem(`java21:${key}`,value);return true;} catch {return false;}}
  };
  const page = document.body.dataset.page;
  if(/^ch\d{2}$/.test(page)&&['#chapter-quiz','#free-resources','#practice-questions'].includes(location.hash)){
    location.replace(`${page}-practice.html${location.hash==='#practice-questions'?'#book-practice':location.hash}`);
    return;
  }
  let complete;
  try {complete = JSON.parse(storage.get('complete','[]'));if(!Array.isArray(complete)) complete=[];} catch {complete=[];}
  const toast = message => {const el=$('.toast');el.textContent=message;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),2400);};
  function updateCompletion() {
    $$('[data-chapter]').forEach(el=>el.classList.toggle('is-complete',complete.includes(el.dataset.chapter)));
    if($('#completion-count')) $('#completion-count').textContent=complete.length;
    const button=$('#complete-chapter');
    if(button){const done=complete.includes(button.dataset.id);button.setAttribute('aria-pressed',String(done));button.querySelector('span').textContent=done?'Completed · mark unread':'Mark chapter complete';}
    $$('.chapter-row').forEach(el=>{const done=complete.includes(el.dataset.id);el.classList.toggle('is-complete',done);if(done){el.querySelector('.row-state').innerHTML='Completed <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12l4 4L19 6"/></svg>';}});
  }
  updateCompletion();
  $('#complete-chapter')?.addEventListener('click',e=>{
    const id=e.currentTarget.dataset.id;
    complete=complete.includes(id)?complete.filter(x=>x!==id):[...complete,id];
    if(!storage.set('complete',JSON.stringify(complete))) toast('Progress could not be saved in this browser.');
    updateCompletion();
  });
  const last=storage.get('last');
  if(/^ch\d{2}(?:-practice)?$/.test(page)) storage.set('last',page);
  if(page==='index' && /^ch\d{2}(?:-practice)?$/.test(last)) {
    const link=$('.continue-link');link.href=last+'.html';link.querySelector('span').textContent=last.endsWith('-practice')?`Continue practice ${Number(last.slice(2,4))}.1`:`Continue chapter ${Number(last.slice(2,4))}`;
  }
  const notes=$('#notes');
  if(notes){notes.value=storage.get(`notes:${page}`);notes.addEventListener('input',()=>{
    $('.notes-status').textContent=storage.set(`notes:${page}`,notes.value)?'Saved in this browser only.':'Unable to save. Copy your notes before leaving this page.';
  });}
  let size=Number(storage.get('size','0'));if(![0,1,2].includes(size))size=0;
  function setSize(){document.documentElement.style.setProperty('--body-size',`${(innerWidth<=600?18:19)+size*2}px`);$('#text-size').setAttribute('aria-label',size===2?'Reset reading text size':'Increase reading text size');}
  setSize();addEventListener('resize',setSize);
  $('#text-size').addEventListener('click',()=>{size=(size+1)%3;storage.set('size',String(size));setSize();toast(['Standard text','Larger text','Largest text'][size]);});
  const focus=$('#focus-mode');
  focus.addEventListener('click',()=>{const active=document.body.classList.toggle('focus-reading');focus.setAttribute('aria-pressed',String(active));focus.textContent=active?'Exit focus':'Focus';updateProgress();});
  $('#print-page').addEventListener('click',()=>window.print());
  // Print answer explanations even when their disclosures are closed.
  let closedAnswers=[];
  addEventListener('beforeprint',()=>{closedAnswers=$$('.answer-item:not([open])');closedAnswers.forEach(el=>el.open=true);});
  addEventListener('afterprint',()=>closedAnswers.forEach(el=>el.open=false));
  const menu=$('.menu-button'), scrim=$('.nav-scrim'), sidebar=$('#chapter-nav');
  function syncSidebar(){const open=document.body.classList.contains('nav-open');sidebar.inert=!open;$('.workspace').inert=open;if(open)sidebar.setAttribute('aria-modal','true');else sidebar.removeAttribute('aria-modal');}
  function closeMenu(){document.body.classList.remove('nav-open');menu.setAttribute('aria-expanded','false');scrim.hidden=true;syncSidebar();}
  syncSidebar();
  menu.addEventListener('click',()=>{const open=document.body.classList.toggle('nav-open');menu.setAttribute('aria-expanded',String(open));scrim.hidden=!open;syncSidebar();if(open)$('#chapter-nav a').focus({preventScroll:true});});
  scrim.addEventListener('click',()=>{closeMenu();menu.focus({preventScroll:true});});
  $('.close-menu').addEventListener('click',()=>{closeMenu();menu.focus({preventScroll:true});});
  document.addEventListener('keydown',e=>{
    const open=document.body.classList.contains('nav-open');
    if(e.key==='Escape' && open){closeMenu();menu.focus({preventScroll:true});}
    if(e.key==='Tab' && open){const items=[...sidebar.querySelectorAll('a,button')];const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus({preventScroll:true});sidebar.querySelector('nav').scrollTop=sidebar.querySelector('nav').scrollHeight;}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus({preventScroll:true});}}
    if(e.key==='/' && !open && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && $('#chapter-search')){e.preventDefault();$('#chapter-search').focus();}
  });
  const toc=$('.contents details');const narrow=matchMedia('(max-width:1000px)');if(toc){toc.open=!narrow.matches;narrow.addEventListener('change',()=>{toc.open=!narrow.matches;});}
  function updateProgress(){const total=document.documentElement.scrollHeight-innerHeight;document.documentElement.style.setProperty('--progress',total>0?Math.min(1,scrollY/total):0);}
  addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',updateProgress);updateProgress();
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){$$('.toc-link').forEach(a=>a.classList.toggle('current',a.hash==='#'+entry.target.id));}});},{rootMargin:'-70px 0px -65% 0px'});$$('.prose h2,.prose h3,.quiz-question').forEach(h=>observer.observe(h));}
  $$('.copy-code').forEach(button=>button.addEventListener('click',async()=>{
    const text=button.closest('.code-block').querySelector('code').textContent;
    try {
      let copied=false;
      if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(text);copied=true;}catch{}}
      if(!copied){const temp=document.createElement('textarea');temp.value=text;temp.style.position='fixed';temp.style.opacity='0';document.body.append(temp);temp.select();copied=document.execCommand('copy');temp.remove();button.focus();}
      if(!copied)throw Error();
      button.querySelector('span').textContent='Copied';setTimeout(()=>button.querySelector('span').textContent='Copy',1800);
    }catch{toast('Copy unavailable. Select the code to copy it.');}
  }));
  $('#chapter-search')?.addEventListener('input',e=>{
    const query=e.target.value.trim().toLowerCase();let count=0;
    $$('.chapter-row').forEach(row=>{const item=window.STUDY_SEARCH.find(d=>d.id===row.dataset.id);const matches=!query || `${item.title} ${item.text}`.toLowerCase().includes(query);(row.closest('.chapter-entry')||row).hidden=!matches;if(matches)count++;});
    $('#no-results').hidden=count>0;$('.search-status').textContent=query?`${count} chapter${count===1?'':'s'} matching “${e.target.value.trim()}”`:'';
  });
  $$('.quiz-form').forEach(form=>{
    const fields=[...form.querySelectorAll('.quiz-question')];
    const score=form.querySelector('.quiz-score');
    const key=`quiz:${form.dataset.quiz}:v1`;
    const reviewedKey=`${key}:reviewed`;
    const reviewed=new Set();
    let savedReviewed;
    try{savedReviewed=JSON.parse(storage.get(reviewedKey,'[]'));}catch{savedReviewed=[];}
    let saved;
    try{saved=JSON.parse(storage.get(key,'[]'));}catch{saved=[];}
    if(Array.isArray(saved))fields.forEach((field,i)=>{
      const answers=Array.isArray(saved[i])?saved[i]:[];
      field.querySelectorAll('input').forEach(input=>{input.checked=answers.includes(Number(input.value));});
    });
    const selections=()=>fields.map(field=>[...field.querySelectorAll('input:checked')].map(input=>Number(input.value)));
    const clearFeedback=field=>{
      reviewed.delete(field);
      field.querySelector('.quiz-feedback').hidden=true;
      field.querySelectorAll('.quiz-option').forEach(option=>option.classList.remove('is-answer','is-wrong'));
      const check=field.querySelector('.quiz-check');
      if(check){check.hidden=false;check.disabled=!field.querySelector('input:checked');}
    };
    const reviewQuestion=field=>{
      const answer=field.dataset.answer.split(',').map(Number);
      const selected=[...field.querySelectorAll('input:checked')].map(input=>Number(input.value));
      if(selected.length===0){clearFeedback(field);return;}
      reviewed.add(field);
      const check=field.querySelector('.quiz-check');
      if(check)check.hidden=true;
      const matched=selected.length===answer.length&&answer.every(value=>selected.includes(value));
      const partial=selected.length<answer.length&&selected.every(value=>answer.includes(value));
      const verdict=field.querySelector('.quiz-verdict');
      const result=matched?'Correct':partial?'Partly correct':'Incorrect';
      verdict.textContent=`${result}. ${answer.length>1?'Correct answers':'Correct answer'}: ${answer.map(value=>String.fromCharCode(65+value)).join(', ')}.${partial?` Select ${answer.length} answers for this question.`:''}`;
      verdict.className=`quiz-verdict ${matched?'correct':partial?'partial':'incorrect'}`;
      field.querySelectorAll('.quiz-option').forEach((option,i)=>{
        option.classList.toggle('is-answer',answer.includes(i));
        option.classList.toggle('is-wrong',selected.includes(i)&&!answer.includes(i));
      });
      field.querySelector('.quiz-feedback').hidden=false;
    };
    const updateScore=()=>{
      let correct=0,unanswered=0;
      fields.forEach(field=>{
        const answer=field.dataset.answer.split(',').map(Number);
        const selected=[...field.querySelectorAll('input:checked')].map(input=>Number(input.value));
        if(!reviewed.has(field))unanswered++;
        else if(selected.length===answer.length&&answer.every(value=>selected.includes(value)))correct++;
      });
      score.textContent=`${fields.length-unanswered} of ${fields.length} answered · ${correct} correct`;
      updateProgress();
    };
    const saveSelections=()=>{
      if(!storage.set(key,JSON.stringify(selections())))toast('Selections could not be saved in this browser.');
      storage.set(reviewedKey,JSON.stringify(fields.map((field,i)=>reviewed.has(field)?i:null).filter(i=>i!==null)));
    };
    fields.forEach((field,i)=>{
      clearFeedback(field);
      if(!field.querySelector('.quiz-check')||(Array.isArray(savedReviewed)&&savedReviewed.includes(i)))reviewQuestion(field);
    });
    updateScore();
    form.addEventListener('submit',event=>event.preventDefault());
    form.addEventListener('change',event=>{
      const field=event.target.closest('.quiz-question');
      if(!field)return;
      if(field.querySelector('.quiz-check'))clearFeedback(field);
      else reviewQuestion(field);
      updateScore();
      saveSelections();
    });
    form.addEventListener('click',event=>{
      const check=event.target.closest('.quiz-check');
      if(check){
        const field=check.closest('.quiz-question');
        reviewQuestion(field);
        updateScore();
        saveSelections();
        field.querySelector('.quiz-retry').focus({preventScroll:true});
        return;
      }
      const option=event.target.closest('.quiz-option[data-selectable]');
      if(option&&event.target.tagName!=='INPUT'&&!event.target.closest('a,button')&&!window.getSelection()?.toString()){
        const input=option.querySelector('input');
        input.focus({preventScroll:true});
        input.click();
        return;
      }
      if(!event.target.closest('.quiz-retry'))return;
      const field=event.target.closest('.quiz-question');
      field.querySelectorAll('input').forEach(input=>{input.checked=false;});
      clearFeedback(field);
      updateScore();
      saveSelections();
      field.querySelector('input').focus({preventScroll:true});
    });
    form.addEventListener('reset',()=>{
      fields.forEach(field=>{field.querySelectorAll('input').forEach(input=>{input.checked=false;});clearFeedback(field);});
      storage.set(key,'[]');
      storage.set(reviewedKey,'[]');
      updateScore();
    });
  });
  $('.reset-all-quizzes')?.addEventListener('click',()=>{
    const forms=$$('.quiz-form');
    if(!forms.length||!confirm('Reset all questions on this page? Your saved selections will be cleared.'))return;
    forms.forEach(form=>form.reset());
    toast('All questions reset');
    forms[0].closest('section')?.scrollIntoView({block:'start'});
  });
})();
