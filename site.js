(()=>{
  'use strict';
  document.querySelectorAll('[data-year]').forEach(el=>{el.textContent=new Date().getFullYear()});

  const find=document.querySelector('[data-filter]');
  const releases=[...document.querySelectorAll('[data-release]')];
  const empty=document.querySelector('[data-empty]');
  const list=document.querySelector('.releases');
  let hot=null;
  const card=list?document.createElement('div'):null;
  function hideCard(){
    if(hot)hot.classList.remove('is-hot');
    hot=null;
    if(card)card.hidden=true;
  }
  function placeCard(el){
    const r=el.getBoundingClientRect();
    const w=card.offsetWidth,h=card.offsetHeight;
    let left=r.right-w;
    let top=r.top;
    if(left+w>innerWidth-12)left=innerWidth-w-12;
    if(left<12)left=12;
    if(top+h>innerHeight-12)top=Math.max(12,r.bottom-h);
    if(top<12)top=12;
    card.style.left=left+'px';
    card.style.top=top+'px';
  }
  function showCard(el){
    if(!card||!el||el.hidden)return;
    if(hot&&hot!==el)hot.classList.remove('is-hot');
    hot=el;
    el.classList.add('is-hot');
    const title=el.querySelector('h3');
    const img=card.querySelector('img');
    const cover=el.querySelector('.cover');
    img.src=cover?(cover.currentSrc||cover.src):'';
    img.alt=title?title.textContent:'';
    card.querySelector('[data-f="title"]').textContent=title?title.textContent:'';
    card.querySelector('[data-f="artist"]').textContent=(el.querySelector('.who')||{}).textContent||'';
    card.querySelector('[data-f="year"]').textContent=(el.querySelector('.year')||{}).textContent||'—';
    card.querySelector('[data-f="kind"]').textContent=(el.querySelector('.kind')||{}).textContent||'';
    card.hidden=false;
    placeCard(el);
  }
  if(card){
    card.className='release-card';
    card.hidden=true;
    card.setAttribute('aria-hidden','true');
    card.innerHTML='<img alt=""><dl><div><dt>Title</dt><dd data-f="title"></dd></div><div><dt>Artist</dt><dd data-f="artist"></dd></div><div><dt>Year</dt><dd data-f="year"></dd></div><div><dt>Format</dt><dd data-f="kind"></dd></div><div><dt>Label</dt><dd>Cube Music</dd></div></dl>';
    document.body.appendChild(card);
    releases.forEach(el=>{el.tabIndex=0});
    const fine=matchMedia('(hover:hover) and (pointer:fine)');
    list.addEventListener('pointerover',e=>{
      if(!fine.matches)return;
      const el=e.target.closest('.release');
      if(el&&list.contains(el))showCard(el);
    });
    list.addEventListener('pointerleave',e=>{
      if(!fine.matches)return;
      hideCard();
    });
    list.addEventListener('focusin',e=>{
      const el=e.target.closest('.release');
      if(el)showCard(el);
    });
    list.addEventListener('focusout',e=>{
      if(!list.contains(e.relatedTarget))hideCard();
    });
    list.addEventListener('click',e=>{
      if(fine.matches)return;
      const el=e.target.closest('.release');
      if(!el)return;
      if(hot===el)hideCard();
      else showCard(el);
    });
    addEventListener('scroll',()=>{if(hot)placeCard(hot)},{passive:true});
    addEventListener('resize',()=>{if(hot)placeCard(hot)});
  }
  if(find&&releases.length){
    find.addEventListener('input',()=>{
      const q=find.value.trim().toLowerCase();
      let shown=0;
      releases.forEach(el=>{
        const hit=!q||el.dataset.release.includes(q);
        el.hidden=!hit;
        if(hit)shown++;
      });
      if(empty)empty.hidden=shown>0;
      if(hot&&hot.hidden)hideCard();
    });
  }

  const form=document.getElementById('talent-form');
  if(!form)return;
  const err=document.getElementById('form-err');
  const receipt=document.getElementById('receipt');
  const bodyEl=document.getElementById('receipt-body');
  const mail=document.getElementById('mail-again');
  const copyBtn=document.getElementById('copy-profile');

  function profileText(data){
    const talents=data.getAll('Talent');
    const lines=[
      'Cube Music — talent profile',
      '',
      'Name: '+(data.get('Name')||''),
      'Artist name: '+(data.get('Artist name')||''),
      'Email: '+(data.get('Email')||''),
      'Phone: '+(data.get('Phone')||''),
      'Based in: '+(data.get('City')||''),
      'Talent: '+talents.join(', '),
      'Style: '+(data.get('Style')||''),
      'Looking for: '+(data.get('Looking for')||''),
      'Instagram: '+(data.get('Instagram')||''),
      'Work: '+(data.get('Work')||''),
      '',
      'About:',
      data.get('About')||''
    ];
    return lines.join('\n').trim();
  }

  form.addEventListener('submit',e=>{
    e.preventDefault();
    const data=new FormData(form);
    const talents=data.getAll('Talent').filter(Boolean);
    const email=(data.get('Email')||'').trim();
    const name=(data.get('Name')||'').trim();
    const work=(data.get('Work')||'').trim();
    if(!name||!email||!talents.length||!work){
      err.textContent='Add your name, email, at least one talent, and a link to your work.';
      return;
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      err.textContent='That email does not look complete.';
      return;
    }
    err.textContent='';
    const text=profileText(data);
    const artist=(data.get('Artist name')||name).trim();
    const href='mailto:info@cubemusic.tv?subject='+encodeURIComponent('Talent profile | '+artist)+'&body='+encodeURIComponent(text);
    try{sessionStorage.setItem('cube-talent-profile',text)}catch(_){}
    form.hidden=true;
    receipt.hidden=false;
    bodyEl.textContent=text;
    mail.href=href;
    location.href=href;
  });

  copyBtn.addEventListener('click',async()=>{
    const text=bodyEl.textContent||'';
    try{
      await navigator.clipboard.writeText(text);
      copyBtn.textContent='Copied';
    }catch(_){
      copyBtn.textContent='Select the note and copy it';
    }
  });
})();

(()=>{
  const triggers=[...document.querySelectorAll('[data-open-talk]')];
  if(!triggers.length||document.getElementById('talk-dialog'))return;
  const holder=document.createElement('div');
  holder.innerHTML=`<dialog class="talk-dialog" id="talk-dialog" aria-labelledby="talk-title">
    <button class="close-talk" type="button" data-close-talk>Close</button>
    <form id="talk-form" class="sheet" novalidate>
      <span class="k" id="talk-k">Let’s talk</span>
      <h2 id="talk-title">Write to the house.</h2>
      <p class="prose">This stays on the page. Mail opens only if you choose it after the note is ready.</p>
      <div class="pair">
        <label class="field"><span>Name</span><input name="Name" type="text" autocomplete="name" required></label>
        <label class="field"><span>Email</span><input name="Email" type="email" autocomplete="email" required></label>
      </div>
      <label class="field"><span>Message</span><textarea name="Message" required placeholder="What do you want to talk about?"></textarea></label>
      <p class="err" id="talk-err" role="alert"></p>
      <div class="form-row">
        <button class="submit" type="submit">Send the note</button>
        <p class="note">Nothing is mailed until you open it yourself. Addressed to info@cubemusic.tv.</p>
      </div>
    </form>
    <div id="talk-receipt" hidden>
      <span class="k">Note</span>
      <h2>Ready when you are.</h2>
      <p class="prose">Copy this and send it to info@cubemusic.tv, or open it in your mail app.</p>
      <pre id="talk-body"></pre>
      <div class="hero-actions">
        <button class="submit" id="talk-copy" type="button">Copy note</button>
        <button class="link" id="talk-mail" type="button">Open mail ↗</button>
      </div>
    </div>
  </dialog>`;
  document.body.appendChild(holder.firstElementChild);
  const dialog=document.getElementById('talk-dialog');
  const form=document.getElementById('talk-form');
  const err=document.getElementById('talk-err');
  const receipt=document.getElementById('talk-receipt');
  const bodyEl=document.getElementById('talk-body');
  const kicker=document.getElementById('talk-k');
  let topic='';
  let href='mailto:info@cubemusic.tv';
  function openTalk(next){
    topic=next||'';
    kicker.textContent=topic?topic:'Let’s talk';
    form.hidden=false;
    receipt.hidden=true;
    if(!dialog.open)dialog.showModal();
  }
  triggers.forEach(el=>el.addEventListener('click',event=>{
    event.preventDefault();
    openTalk(el.dataset.topic||'');
  }));
  dialog.querySelector('[data-close-talk]').addEventListener('click',()=>dialog.close());
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const data=new FormData(form);
    const name=(data.get('Name')||'').trim();
    const email=(data.get('Email')||'').trim();
    const message=(data.get('Message')||'').trim();
    if(!name||!email||!message){err.textContent='Add your name, email, and a message.';return}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){err.textContent='That email does not look complete.';return}
    err.textContent='';
    const text=['Cube Music — '+(topic||'let’s talk'),'','Name: '+name,'Email: '+email,'','Message:',message].join('\n');
    const subject=(topic?topic+' | ':'')+name;
    href='mailto:info@cubemusic.tv?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(text);
    bodyEl.textContent=text;
    form.hidden=true;
    receipt.hidden=false;
  });
  document.getElementById('talk-copy').addEventListener('click',async()=>{
    const button=document.getElementById('talk-copy');
    try{await navigator.clipboard.writeText(bodyEl.textContent||'');button.textContent='Copied'}
    catch(_){button.textContent='Select the note and copy it'}
  });
  document.getElementById('talk-mail').addEventListener('click',()=>{location.href=href});
})();
