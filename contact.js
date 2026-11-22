(() => {
  'use strict';
  const HOUSE = 'info@cubemusic.tv';
  const ENDPOINT = 'https://formsubmit.co/ajax/' + HOUSE;
  const MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ABOUT_MAP = {
    'Record label': 'A record',
    'Talent agency': 'Talent',
    Production: 'Production',
    'Music production': 'Production',
    Events: 'Events',
    'Events & concerts': 'Events',
    Publishing: 'Publishing',
    Distribution: 'Distribution',
    Talent: 'Talent'
  };

  function $(id) {
    return document.getElementById(id);
  }

  function mailtoHref(subject, body) {
    return 'mailto:' + HOUSE + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  async function sendHouse(fields, subject) {
    if (fields.website) return { ok: true, spam: true };
    const payload = Object.assign({
      _subject: subject,
      _template: 'table',
      _captcha: 'false',
      _honey: '',
      Page: location.href
    }, fields);
    delete payload.website;
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    let json = null;
    try { json = await res.json(); } catch (_) {}
    if (!res.ok || (json && json.success === 'false') || (json && json.ok === false)) {
      throw new Error((json && (json.message || (json.error && json.error.message))) || 'Could not send');
    }
    return json || { ok: true };
  }

  function setBusy(btn, busy, label) {
    if (!btn) return;
    btn.disabled = busy;
    btn.setAttribute('aria-busy', busy ? 'true' : 'false');
    if (label) btn.textContent = label;
  }

  function ensureTalkDialog() {
    if ($('talk-dialog')) return $('talk-dialog');
    const dialog = document.createElement('dialog');
    dialog.className = 'talk-dialog';
    dialog.id = 'talk-dialog';
    dialog.setAttribute('aria-labelledby', 'talk-title');
    dialog.innerHTML =
      '<div class="talk-chrome">' +
        '<span class="k" id="talk-k">Let’s talk</span>' +
        '<button class="close-talk" type="button" data-close-talk>Close</button>' +
      '</div>' +
      '<div class="talk-scroll">' +
        '<form id="talk-form" class="sheet" novalidate>' +
          '<h2 id="talk-title">Write to the house.</h2>' +
          '<p class="prose">Booking, press, partnerships, or a question. This goes to info@cubemusic.tv.</p>' +
          '<div class="pair">' +
            '<label class="field"><span>Name</span><input name="Name" type="text" autocomplete="name" enterkeyhint="next" required></label>' +
            '<label class="field"><span>Email</span><input name="Email" type="email" autocomplete="email" inputmode="email" enterkeyhint="next" required></label>' +
          '</div>' +
          '<label class="field"><span>Phone <i>(optional)</i></span><input name="Phone" type="tel" autocomplete="tel" inputmode="tel"></label>' +
          '<label class="field"><span>About</span>' +
            '<select name="About">' +
              '<option>Booking</option><option>Press</option><option>A partnership</option>' +
              '<option>A record</option><option>Production</option><option>Events</option>' +
              '<option>Publishing</option><option>Distribution</option><option>Talent</option>' +
              '<option>Something else</option>' +
            '</select>' +
          '</label>' +
          '<label class="field"><span>Message</span><textarea name="Message" required placeholder="What do you want to talk about?" enterkeyhint="send"></textarea></label>' +
          '<input class="hp" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<p class="err" id="talk-err" role="alert"></p>' +
          '<div class="form-row">' +
            '<button class="submit" type="submit">Send the note</button>' +
            '<p class="note">Sent straight to the house. You stay on this page.</p>' +
          '</div>' +
        '</form>' +
        '<div id="talk-receipt" hidden>' +
          '<span class="k">Note</span>' +
          '<h2>It’s with the house.</h2>' +
          '<p class="prose">The note is on its way to info@cubemusic.tv. Keep a copy if you want one.</p>' +
          '<pre id="talk-body"></pre>' +
          '<div class="hero-actions">' +
            '<button class="submit" id="talk-copy" type="button">Copy note</button>' +
            '<a class="panel-link" id="talk-mail" href="mailto:info@cubemusic.tv">Open mail ↗</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(dialog);
    return dialog;
  }

  function bindTalk() {
    const triggers = [...document.querySelectorAll('[data-open-talk], #talk, #panel-mail')];
    if (!triggers.length && !$('talk-dialog')) return;
    const dialog = ensureTalkDialog();
    const form = $('talk-form');
    const err = $('talk-err');
    const receipt = $('talk-receipt');
    const bodyEl = $('talk-body');
    const kicker = $('talk-k');
    const submitBtn = form.querySelector('[type="submit"]');
    const about = form.querySelector('[name="About"]');
    const copyBtn = $('talk-copy');
    const mailLink = $('talk-mail');
    const idleLabel = submitBtn ? submitBtn.textContent : 'Send the note';

    function openTalk(topic) {
      const mapped = ABOUT_MAP[topic] || topic || '';
      if (kicker) kicker.textContent = mapped && mapped !== 'Something else' ? mapped : 'Let’s talk';
      if (about) {
        const match = [...about.options].some(o => o.value === mapped);
        about.value = match ? mapped : (mapped ? 'Something else' : about.options[0].value);
      }
      form.hidden = false;
      receipt.hidden = true;
      if (err) err.textContent = '';
      setBusy(submitBtn, false, idleLabel);
      if (!dialog.open) dialog.showModal();
      const first = form.querySelector('input:not(.hp)');
      if (first) setTimeout(() => first.focus(), 40);
    }

    triggers.forEach(el => {
      el.addEventListener('click', event => {
        event.preventDefault();
        openTalk(el.dataset.topic || el.dataset.openTalk || '');
      });
    });
    dialog.querySelector('[data-close-talk]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    addEventListener('keydown', event => {
      if (event.key === 'Escape' && dialog.open) dialog.close();
    });

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const data = new FormData(form);
      const name = (data.get('Name') || '').trim();
      const email = (data.get('Email') || '').trim();
      const message = (data.get('Message') || '').trim();
      const phone = (data.get('Phone') || '').trim();
      const aboutVal = (data.get('About') || '').trim();
      if (!name || !email || !message) {
        err.textContent = 'Add your name, email, and a message.';
        return;
      }
      if (!MAIL_RE.test(email)) {
        err.textContent = 'That email does not look complete.';
        return;
      }
      err.textContent = '';
      const text = [
        'Cube Music — let’s talk',
        '',
        'Name: ' + name,
        'Email: ' + email,
        phone ? 'Phone: ' + phone : '',
        'About: ' + aboutVal,
        '',
        'Message:',
        message
      ].filter((line, i, arr) => line !== '' || (arr[i - 1] && arr[i - 1] !== '')).join('\n').trim();
      const subject = (aboutVal ? aboutVal + ' | ' : 'Let’s talk | ') + name;
      if (mailLink) mailLink.href = mailtoHref(subject, text);
      bodyEl.textContent = text;
      setBusy(submitBtn, true, 'Sending…');
      try {
        await sendHouse({
          Name: name,
          Email: email,
          Phone: phone,
          About: aboutVal,
          Message: message,
          _replyto: email,
          website: data.get('website')
        }, 'Cube Music | ' + subject);
        form.hidden = true;
        receipt.hidden = false;
        receipt.querySelector('h2').textContent = 'It’s with the house.';
        receipt.querySelector('.prose').textContent = 'The note is on its way to info@cubemusic.tv. Keep a copy if you want one.';
      } catch (_) {
        receipt.querySelector('h2').textContent = 'Ready when you are.';
        receipt.querySelector('.prose').textContent = 'The page could not send it from here. Copy the note or open it in your mail app.';
        form.hidden = true;
        receipt.hidden = false;
      } finally {
        setBusy(submitBtn, false, idleLabel);
      }
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(bodyEl.textContent || '');
          copyBtn.textContent = 'Copied';
        } catch (_) {
          copyBtn.textContent = 'Select the note and copy it';
        }
      });
    }
  }

  function bindTalent() {
    const form = $('talent-form');
    if (!form) return;
    const err = $('form-err');
    const receipt = $('receipt');
    const bodyEl = $('receipt-body');
    const mail = $('mail-again');
    const copyBtn = $('copy-profile');
    const submitBtn = form.querySelector('[type="submit"]');
    const idleLabel = submitBtn ? submitBtn.textContent : 'Send profile';
    const note = form.querySelector('.note');
    if (note) note.textContent = 'Sent straight to info@cubemusic.tv. You stay on this page.';

    if (!form.querySelector('.hp')) {
      const honey = document.createElement('input');
      honey.className = 'hp';
      honey.name = 'website';
      honey.type = 'text';
      honey.tabIndex = -1;
      honey.autocomplete = 'off';
      honey.setAttribute('aria-hidden', 'true');
      form.appendChild(honey);
    }

    function profileText(data) {
      const talents = data.getAll('Talent').filter(Boolean);
      return [
        'Cube Music — talent profile',
        '',
        'Name: ' + (data.get('Name') || ''),
        'Artist name: ' + (data.get('Artist name') || ''),
        'Email: ' + (data.get('Email') || ''),
        'Phone: ' + (data.get('Phone') || ''),
        'Based in: ' + (data.get('City') || ''),
        'Talent: ' + talents.join(', '),
        'Style: ' + (data.get('Style') || ''),
        'Looking for: ' + (data.get('Looking for') || ''),
        'Instagram: ' + (data.get('Instagram') || ''),
        'Work: ' + (data.get('Work') || ''),
        '',
        'About:',
        data.get('About') || ''
      ].join('\n').trim();
    }

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const data = new FormData(form);
      const talents = data.getAll('Talent').filter(Boolean);
      const email = (data.get('Email') || '').trim();
      const name = (data.get('Name') || '').trim();
      const work = (data.get('Work') || '').trim();
      if (!name || !email || !talents.length || !work) {
        err.textContent = 'Add your name, email, at least one talent, and a link to your work.';
        return;
      }
      if (!MAIL_RE.test(email)) {
        err.textContent = 'That email does not look complete.';
        return;
      }
      err.textContent = '';
      const text = profileText(data);
      const artist = (data.get('Artist name') || name).trim();
      const subject = 'Talent profile | ' + artist;
      try { sessionStorage.setItem('cube-talent-profile', text); } catch (_) {}
      bodyEl.textContent = text;
      if (mail) mail.href = mailtoHref(subject, text);
      setBusy(submitBtn, true, 'Sending…');
      const fields = {
        Name: name,
        'Artist name': data.get('Artist name') || '',
        Email: email,
        Phone: data.get('Phone') || '',
        City: data.get('City') || '',
        Talent: talents.join(', '),
        Style: data.get('Style') || '',
        'Looking for': data.get('Looking for') || '',
        Instagram: data.get('Instagram') || '',
        Work: work,
        About: data.get('About') || '',
        _replyto: email,
        website: data.get('website')
      };
      try {
        await sendHouse(fields, 'Cube Music | ' + subject);
        form.hidden = true;
        receipt.hidden = false;
        receipt.querySelector('h2').textContent = 'Profile sent.';
        receipt.querySelector('.prose').textContent = 'The house has it at info@cubemusic.tv. Keep a copy if you want one.';
      } catch (_) {
        form.hidden = true;
        receipt.hidden = false;
        receipt.querySelector('h2').textContent = 'Ready to send.';
        receipt.querySelector('.prose').textContent = 'The page could not send it from here. Copy the profile or open it in your mail app.';
      } finally {
        setBusy(submitBtn, false, idleLabel);
      }
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(bodyEl.textContent || '');
          copyBtn.textContent = 'Copied';
        } catch (_) {
          copyBtn.textContent = 'Select the note and copy it';
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { bindTalk(); bindTalent(); });
  } else {
    bindTalk();
    bindTalent();
  }
})();
