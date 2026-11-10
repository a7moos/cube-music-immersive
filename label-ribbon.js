(() => {
  'use strict';
  const source = document.querySelector('.releases');
  if (!source) return;
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Curated Top Hits only: one original Drive artwork per release.
  const topHits = [
    ["hani.jpg", "Ya Wel 3aly", "Hany Shaker"],
    ["ahmed-karim.jpg", "Meya Tany La", "Ahmed Saad & Karim"],
    ["nour-amar.jpg", "Shofto El Amar", "Moustafa Amar & Mohamed Nour"],
    ["tamer.jpg", "Adhak", "Tamer Hosny"],
    ["hamada.jpg", "Metahmelany", "Hamada Helal"],
    ["houda.jpg", "El Dalaa Wel Enbesat", "Houda Bondok"],
    ["nour.png", "Rouhi", "Mohamed Nour"],
    ["tarek.jpg", "W Nkhaf", "Tarek El Sheikh"],
    ["adawya.jpg", "Gowa Einy", "Mohamed Adaweya"],
    ["wama.jpg", "Rayha Gaya", "WAMA"],
    ["bahaa.jpg", "Al Beat Wehesh", "Bahaa Sultan"],
    ["bahaa-beat.jpg", "Al Beat Wehesh", "Bahaa Sultan"],
    ["marwa.jpg", "Bab El Ghorna", "Marwa Nasr, Amr Shiea & Anba"],
    ["marwa-rabna.jpg", "Rabna Yekfina", "Marwa Nasr & Mohamed Rashad"],
    ["gena.jpg", "Gena", "Haifa Wehbe"],
    ["sharmoofers.jpg", "Ramsis Paris", "Sharmoofers"]
];
  const releases = topHits.map(([file, title, artist]) => ({
    title, artist, year: '', kind: 'Top Hit',
    src: 'drive-labels/portrait-1220/' + file,
    search: (title + ' ' + artist).toLowerCase()
  }));

  const ribbon = document.createElement('div');
  ribbon.className = 'ribbon';
  const tile = '<i style="--i:0"></i><i style="--i:1"></i><i style="--i:2"></i><i style="--i:3"></i><i style="--i:4"></i><i style="--i:5"></i><i style="--i:6"></i><i style="--i:7"></i><i style="--i:8"></i>';
  ribbon.innerHTML = '<div class="ribbon-stage" role="region" aria-roledescription="carousel" aria-label="Release catalogue. Drag or use the arrow keys to browse." tabindex="0"><div class="ribbon-layer"></div></div><a class="cube-mark" href="index.html" aria-label="Cube Music home"><span class="cube-spin"><span class="cube-face cube-front">' + tile + '</span><span class="cube-face cube-back">' + tile + '</span><span class="cube-face cube-right">' + tile + '</span><span class="cube-face cube-left">' + tile + '</span><span class="cube-face cube-top">' + tile + '</span><span class="cube-face cube-bottom">' + tile + '</span></span></a><div class="scrub-track" role="slider" tabindex="0" aria-valuemin="0" aria-valuenow="0" aria-label="Drag to scrub the catalogue"><div class="scrub-tick"></div></div>';
  source.before(ribbon);
  source.hidden = true;

  const stage = ribbon.querySelector('.ribbon-stage');
  const layer = ribbon.querySelector('.ribbon-layer');
  const scrub = ribbon.querySelector('.scrub-track');
  const tick = ribbon.querySelector('.scrub-tick');
  const empty = document.querySelector('[data-empty]');
  const dialog = document.createElement('dialog');
  dialog.className = 'ribbon-dialog';
  dialog.setAttribute('aria-labelledby', 'release-detail-title');
  dialog.innerHTML = '<button class="ribbon-close" type="button">✕ CLOSE</button><div class="ribbon-detail"><div class="ribbon-detail-media"><img alt=""></div><div class="ribbon-detail-copy"><span class="k" data-detail-meta></span><h2 id="release-detail-title"></h2><p data-detail-artist></p><p class="ribbon-note">Cube Music · Record label</p></div></div>';
  document.body.append(dialog);
  dialog.querySelector('button').onclick = () => dialog.close();
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const b = dialog.getBoundingClientRect();
    if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => stage.focus({ preventScroll: true }));

  let filtered = [];
  let cards = [];
  let current = 0;
  let target = 0;
  let dragging = false;
  let dragged = false;
  let pointerStart = 0;
  let dragStart = 0;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;
  let pressed = null;
  let raf = 0;
  let previous = performance.now();
  let visible = true;
  let hoverSpeed = 0;

  const mod = (n, m) => ((n % m) + m) % m;
  const scale = () => (stage.clientWidth < 680 ? 1 : Math.min(1.2, Math.max(.72, stage.clientWidth / 2048)));
  const step = () => (stage.clientWidth < 680 ? stage.clientWidth * .685 : 308 * scale());

  function openRelease(index) {
    const item = filtered[index];
    if (!item) return;
    hoverSpeed = 0;
    const img = dialog.querySelector('img');
    img.src = item.src;
    img.alt = item.title + ' — ' + item.artist;
    dialog.querySelector('h2').textContent = item.title;
    dialog.querySelector('[data-detail-meta]').textContent = item.kind + '  /  ' + item.year + '  —  ' + String(index + 1).padStart(2, '0') + ' / ' + String(filtered.length).padStart(2, '0');
    dialog.querySelector('[data-detail-artist]').textContent = item.artist;
    if (!dialog.open) dialog.showModal();
  }

  function layout() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const mobile = w < 680;
    const s = scale();
    const spacing = step();
    const count = cards.length;
    if (!count) return;
    const cycle = spacing * count;
    const baseTop = h * (mobile ? .23 : .2145);
    cards.forEach((el, i) => {
      // Size by position so the middle three always share the same dimensions.
      const offset = i - current - Math.round((i - current) / count) * count;
      const edge = Math.max(0, Math.min(1, Math.abs(offset) - 1));
      const width = mobile ? Math.min(350, w * .66) : 305 * s;
      const height = width * ((453 - 98 * edge) / 305);
      let x = w / 2 - width / 2 + (i - current) * spacing;
      x += Math.round((w / 2 - (x + width / 2)) / cycle) * cycle;
      const center = x + width / 2;
      const outerDistance = Math.max(0, Math.abs(center - w / 2) - spacing);
      const norm = Math.sign(center - w / 2) * Math.min(1, outerDistance / Math.max(1, w / 2 - spacing));
      const bend = Math.pow(Math.min(Math.abs(norm), .87), 5);
      const y = baseTop - (mobile ? h * .055 : h * .075) * bend;
      const depth = -Math.pow(Math.abs(norm), 2) * (mobile ? 36 : 54);
      const turn = -norm * (mobile ? 13 : 8.3);
      const roll = -norm * (mobile ? 3.2 : 1.8);
      el.style.width = width.toFixed(2) + 'px';
      el.style.height = height.toFixed(2) + 'px';
      el.style.left = x.toFixed(2) + 'px';
      el.style.top = y.toFixed(2) + 'px';
      el.style.transform = 'translate3d(0,0,' + depth.toFixed(2) + 'px) rotateY(' + turn.toFixed(2) + 'deg) rotateZ(' + roll.toFixed(2) + 'deg)';
      el.style.zIndex = String(100 - Math.round(Math.abs(norm) * 20));
      const shown = x <= w + width && x >= -width * 2;
      el.hidden = !shown;
      el.tabIndex = shown ? 0 : -1;
    });
    const fraction = mod(current, count) / count;
    tick.style.left = (fraction * 100).toFixed(2) + '%';
    const index = mod(Math.round(current), count);
    scrub.setAttribute('aria-valuemax', String(count - 1));
    scrub.setAttribute('aria-valuenow', String(index));
    scrub.setAttribute('aria-valuetext', filtered[index].title + ', ' + filtered[index].artist);
  }

  function frame(t) {
    const dt = Math.min(55, t - previous);
    previous = t;
    const hovering = hoverSpeed !== 0 && visible && !dragging && !dialog.open && scrub.dataset.grabbing !== '1';
    if (hovering) target += hoverSpeed * dt / 1000;
    current += (target - current) * (reduced ? 1 : 1 - Math.exp(-dt * .0105));
    if (Math.abs(target - current) < .00002) current = target;
    layout();
    raf = hovering || Math.abs(target - current) > .00002 ? requestAnimationFrame(frame) : 0;
  }
  function wake() {
    if (!cards.length) return;
    if (!raf) {
      previous = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  function build(query) {
    const q = (query || '').trim().toLowerCase();
    filtered = releases.filter(item => !q || item.search.includes(q));
    layer.replaceChildren();
    cards = filtered.map((item, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'ribbon-card';
      el.dataset.index = String(i);
      el.setAttribute('aria-label', 'Open ' + item.title + ' by ' + item.artist);
      el.innerHTML = '<span class="ribbon-artist"></span><span class="ribbon-media"><img draggable="false" alt=""></span>';
      el.querySelector('.ribbon-artist').textContent = item.artist + ' / ' + item.title;
      const img = el.querySelector('img');
      img.src = item.src;
      img.alt = item.title;
      img.loading = i < 8 ? 'eager' : 'lazy';
      layer.append(el);
      return el;
    });
    current = q ? 0 : 8;
    target = current;
    empty.hidden = cards.length > 0;
    stage.hidden = cards.length === 0;
    scrub.hidden = cards.length < 2;
    if (cards.length) layout();
  }

  function scrubTo(event) {
    const rect = scrub.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    target = Math.floor(current / Math.max(1, cards.length)) * cards.length + fraction * (cards.length - .001);
    wake();
  }

  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !cards.length) return;
    hoverSpeed = 0;
    dragging = true;
    dragged = false;
    pointerStart = event.clientX;
    dragStart = target;
    lastX = event.clientX;
    lastT = performance.now();
    velocity = 0;
    pressed = event.target.closest('.ribbon-card');
    stage.setPointerCapture(event.pointerId);
    stage.classList.add('dragging');
  });
  stage.addEventListener('pointermove', event => {
    if (!dragging) return;
    const dx = event.clientX - pointerStart;
    if (Math.abs(dx) > 5) dragged = true;
    if (!dragged) return;
    const now = performance.now();
    velocity = (event.clientX - lastX) / Math.max(4, now - lastT);
    lastX = event.clientX;
    lastT = now;
    target = dragStart - dx / step();
    wake();
  });
  function finishDrag() {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('dragging');
    if (dragged) target -= Math.max(-2.8, Math.min(2.8, velocity * 190 / step()));
    else if (pressed) openRelease(Number(pressed.dataset.index));
    pressed = null;
    wake();
  }
  stage.addEventListener('pointerup', finishDrag);
  stage.addEventListener('pointercancel', finishDrag);

  // Hover near either side to circulate the ribbon; the middle is a rest zone.
  function steerHover(event) {
    if (event.pointerType !== 'mouse' || reduced || dragging) return;
    const rect = stage.getBoundingClientRect();
    const position = (event.clientX - rect.left) / rect.width * 2 - 1;
    hoverSpeed = Math.sign(position) * Math.max(0, (Math.abs(position) - .18) / .82) * .85;
    wake();
  }
  stage.addEventListener('pointerenter', steerHover);
  stage.addEventListener('pointermove', steerHover);
  stage.addEventListener('pointerleave', () => {
    hoverSpeed = 0;
    target = current;
  });

  stage.addEventListener('wheel', event => {
    if (!cards.length) return;
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) && !event.shiftKey) return;
    event.preventDefault();
    target += (event.shiftKey ? event.deltaY : event.deltaX) / (stage.clientWidth < 680 ? 240 : 370);
    wake();
  }, { passive: false });

  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); target += 1; wake(); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); target -= 1; wake(); }
    if (event.key === 'Home') { event.preventDefault(); target = Math.round(current) - mod(Math.round(current), cards.length); wake(); }
    if (event.key === 'End') { event.preventDefault(); target = Math.round(current) - mod(Math.round(current), cards.length) + cards.length - 1; wake(); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.open) dialog.close();
  });

  scrub.addEventListener('pointerdown', event => {
    scrub.setPointerCapture(event.pointerId);
    scrub.dataset.grabbing = '1';
    scrubTo(event);
  });
  scrub.addEventListener('pointermove', event => { if (scrub.dataset.grabbing === '1') scrubTo(event); });
  scrub.addEventListener('pointerup', () => { scrub.dataset.grabbing = '0'; });
  scrub.addEventListener('pointercancel', () => { scrub.dataset.grabbing = '0'; });
  scrub.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      target += event.key === 'ArrowRight' ? 1 : -1;
      wake();
    }
  });

  document.querySelector('[data-filter]').addEventListener('input', event => build(event.target.value));
  new ResizeObserver(() => { if (cards.length) layout(); }).observe(stage);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) wake();
  }).observe(stage);

  const cube = ribbon.querySelector('.cube-spin');
  let aimX = -.42;
  let aimY = -.38;
  let curX = aimX;
  let curY = aimY;
  let cubeRaf = 0;
  function drawCube(now) {
    curX += (aimX - curX) * (reduced ? 1 : .12);
    curY += (aimY - curY) * (reduced ? 1 : .12);
    const drift = reduced ? 0 : Math.sin(now / 1600) * 8;
    cube.style.transform = 'rotateX(' + (curY * 62).toFixed(2) + 'deg) rotateY(' + (curX * 78 + drift).toFixed(2) + 'deg)';
    cubeRaf = (!reduced && (Math.abs(aimX - curX) > .004 || Math.abs(aimY - curY) > .004)) ? requestAnimationFrame(drawCube) : 0;
    if (!cubeRaf && !reduced) cubeRaf = requestAnimationFrame(drawCube);
  }
  if (cube) drawCube(performance.now());
  ribbon.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !cube) return;
    const r = ribbon.getBoundingClientRect();
    aimX = (event.clientX - r.left) / r.width - .5;
    aimY = (event.clientY - r.top) / r.height - .5;
  });
  ribbon.addEventListener('pointerleave', () => {
    aimX = -.42;
    aimY = -.38;
  });
  build();
})();
