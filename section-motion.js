(() => {
  'use strict';
  const heroes = [...document.querySelectorAll('main > .hero')];
  const labelPage = !!document.getElementById('catalogue');

  const sections = [...document.querySelectorAll('body[data-section-effects] main > .block')];
  sections.forEach(section => section.classList.add('motion-section'));
  const faces = [
    ['front', 'var(--accent)'],
    ['back', '#16af69'],
    ['right', '#3c8ad8'],
    ['left', '#ff7a18'],
    ['top', '#f4f1ea'],
    ['bottom', '#f3e927']
  ];
  const tiles = Array.from({ length: 9 }, (_, i) => `<i style="--i:${i}"></i>`).join('');
  const cube = `<div class="face-cube" aria-hidden="true"><div class="face-spin">${faces.map(([name, color]) => `<div class="face-side face-${name}" style="--tile:${color}">${tiles}</div>`).join('')}</div></div>`;
  heroes.forEach(hero => {
    if (labelPage) return;
    hero.classList.add('motion-hero');
    if (!hero.querySelector('.face-cube')) hero.insertAdjacentHTML('beforeend', cube);
  });
  const house = [
    ['label.html', '01', 'Label', '#ee383e'],
    ['talent.html', '02', 'Talent', '#16af69'],
    ['production.html', '03', 'Production', '#3c8ad8'],
    ['events.html', '04', 'Events', '#f3e927'],
    ['publishing.html', '05', 'Publishing', '#f4f1ea'],
    ['distribution.html', '06', 'Distribution', '#ff7a18']
  ];
  const foot = document.querySelector('main + .foot, .foot');
  if (foot && !document.getElementById('stage')) {
    const here = (location.pathname.split('/').pop() || 'index.html');
    const nav = document.createElement('nav');
    nav.className = 'house';
    nav.setAttribute('aria-label', 'The house');
    nav.innerHTML = house.map(([href, n, name, color]) => `<a href="${href}" style="--sw:${color}"${here === href ? ' aria-current="page"' : ''}><span>${n}</span>${name}</a>`).join('');
    foot.before(nav);
  }
  const spinEl = document.querySelector('.face-spin');
  const copies = [...document.querySelectorAll('main > .block > h2, main > .block > .k, main > .block > .prose, .catalogue-head')];
  copies.forEach(el => el.classList.add('motion-copy'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (spinEl && !reduced.matches) {
    const stage = spinEl.closest('.hero');
    let cubeAimX = -.42, cubeAimY = -.3, cubeX = -.42, cubeY = -.3, drift = 0;
    stage.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const rect = stage.getBoundingClientRect();
      cubeAimX = (event.clientX - rect.left) / rect.width - .5;
      cubeAimY = (event.clientY - rect.top) / rect.height - .5;
    });
    stage.addEventListener('pointerleave', () => { cubeAimX = -.42; cubeAimY = -.3; });
    const turn = () => {
      cubeX += (cubeAimX - cubeX) * .12;
      cubeY += (cubeAimY - cubeY) * .12;
      drift += .008;
      spinEl.style.transform = `rotateX(${(-22 + cubeY * 48).toFixed(2)}deg) rotateY(${(-32 + cubeX * 72 + Math.sin(drift) * 8).toFixed(2)}deg)`;
      requestAnimationFrame(turn);
    };
    requestAnimationFrame(turn);
  }
  const clamp = n => Math.max(0, Math.min(1, n));
  const ambient = document.createElement('div');
  ambient.className = 'ambient-gradient';
  ambient.setAttribute('aria-hidden', 'true');
  document.body.prepend(ambient);
  document.body.classList.add('has-ambient-motion');
  const home = !!document.querySelector('#stage');
  if (home) document.body.classList.add('home-ambient');
  const beats = home ? [...document.querySelectorAll('.beat[data-beat="face"]')] : [];
  const colors = ['#ee383e','#16af69','#3c8ad8','#f3e927','#f4f1ea','#ff7a18'];
  let pointerX = 75, pointerY = 30, aimX = 75, aimY = 30;
  let scheduled = false;
  addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reduced.matches) return;
    aimX = clamp(event.clientX / innerWidth) * 100;
    aimY = clamp(event.clientY / innerHeight) * 100;
    schedule();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    aimX = 75; aimY = 30; schedule();
  });
  function render() {
    scheduled = false;
    const vh = innerHeight;
    pointerX += (aimX - pointerX) * .09;
    pointerY += (aimY - pointerY) * .09;
    document.body.style.setProperty('--pointer-x', pointerX.toFixed(2) + '%');
    document.body.style.setProperty('--pointer-y', pointerY.toFixed(2) + '%');
    if (beats.length) {
      const active = beats.find(beat => {
        const rect = beat.getBoundingClientRect();
        return rect.top < vh * .6 && rect.bottom > vh * .4;
      });
      ambient.style.setProperty('--ambient-color', active ? colors[Number(active.dataset.i)] : '#ee383e');
    }
    heroes.forEach(hero => {
      // Layout coordinates are independent of the animated bounding box.
      const top = hero.offsetTop - scrollY;
      const progress = reduced.matches ? 0 : clamp(-top / Math.max(1, hero.offsetHeight));
      hero.style.setProperty('--hero-tilt', (progress * 4).toFixed(3) + 'deg');
      hero.style.setProperty('--hero-scale', (1 - progress * .04).toFixed(4));
      hero.style.setProperty('--hero-opacity', (1 - progress * .12).toFixed(4));
      hero.style.setProperty('--glow-x', (progress * -70).toFixed(2) + 'px');
      hero.style.setProperty('--glow-y', (progress * 65).toFixed(2) + 'px');
    });
    sections.forEach(section => {
      const top = section.offsetTop - scrollY;
      const progress = reduced.matches ? 0 : clamp(-top / Math.max(1, section.offsetHeight));
      section.style.setProperty('--section-tilt', (progress * 2).toFixed(3) + 'deg');
      section.style.setProperty('--section-scale', (1 - progress * .025).toFixed(4));
      section.style.setProperty('--section-opacity', (1 - progress * .12).toFixed(4));
    });
    copies.forEach(el => {
      const rect = el.getBoundingClientRect();
      const progress = reduced.matches ? 1 : clamp((vh - rect.top) / (vh * .24));
      el.style.setProperty('--copy-y', ((1 - progress) * 28).toFixed(2) + 'px');
      el.style.setProperty('--copy-opacity', (.4 + progress * .6).toFixed(3));
    });
    if (!reduced.matches && (Math.abs(aimX - pointerX) > .02 || Math.abs(aimY - pointerY) > .02)) schedule();
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(render); }
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  reduced.addEventListener('change', schedule);
  render();
})();
