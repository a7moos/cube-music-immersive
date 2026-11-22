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

})();
