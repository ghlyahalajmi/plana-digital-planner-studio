/* ==========================================================================
   PLANA — main.js
   Shell behaviour shared by every page: theme, navigation, scroll reveal,
   toasts, modals, form validation helpers, and the home page composition.
   ========================================================================== */
(function () {
  'use strict';
  const P = (window.PLANA = window.PLANA || {});

  /* ---- tiny DOM helpers ------------------------------------------------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  Object.assign(P, { $, $$, on });

  /* ---- localStorage with a safe fallback (private mode / disabled) ------ */
  const storage = {
    get(key, fallback) {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (e) { return false; }
    },
    remove(key) { try { localStorage.removeItem(key); } catch (e) {} }
  };
  P.storage = storage;

  /* ======================================================================
     THEME  — persisted, and respects the OS preference on a first visit
     ====================================================================== */
  const THEME_KEY = 'plana:theme';
  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    $$('[data-theme-toggle]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(mode === 'dark'));
      btn.setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }
  function initTheme() {
    const saved = storage.get(THEME_KEY, null);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));
    $$('[data-theme-toggle]').forEach(btn => on(btn, 'click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next); storage.set(THEME_KEY, next);
      toast(next === 'dark' ? 'Dark mode on' : 'Light mode on', 'Your preference is saved.');
    }));
  }

  /* ======================================================================
     NAVIGATION — sticky state, active link, mobile sheet
     ====================================================================== */
  function initNav() {
    const nav = $('.nav');
    if (nav) {
      const setStuck = () => nav.classList.toggle('is-stuck', window.scrollY > 8);
      setStuck(); on(window, 'scroll', setStuck, { passive: true });
    }
    const sheet = $('.mobile-nav');
    const openBtn = $('[data-nav-open]');
    if (!sheet || !openBtn) return;
    const close = () => { sheet.classList.remove('open'); document.body.classList.remove('is-locked'); openBtn.setAttribute('aria-expanded', 'false'); openBtn.focus(); };
    const open  = () => {
      sheet.classList.add('open'); document.body.classList.add('is-locked');
      openBtn.setAttribute('aria-expanded', 'true');
      const first = sheet.querySelector('a, button'); if (first) first.focus();
    };
    on(openBtn, 'click', open);
    $$('[data-nav-close], .mobile-nav .scrim', sheet).forEach(el => on(el, 'click', close));
    $$('.mobile-nav a.m-link').forEach(a => on(a, 'click', close));
    on(document, 'keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('open')) close(); });
  }

  /* ======================================================================
     SCROLL REVEAL — progressive enhancement over an IntersectionObserver
     ====================================================================== */
  let revealObserver = null;
  function observeReveals(root = document) {
    const items = $$('.reveal:not(.in)', root);
    if (!('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('in')); return; }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); revealObserver.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    items.forEach(el => revealObserver.observe(el));
  }
  P.observeReveals = observeReveals;

  /* ======================================================================
     TOASTS
     ====================================================================== */
  const ICONS = {
    info: '<path d="M12 8h.01M11 12h1v4h1"/><circle cx="12" cy="12" r="9"/>',
    ok:   '<path d="M20 6L9 17l-5-5"/>',
    err:  '<path d="M12 8v5m0 3h.01"/><circle cx="12" cy="12" r="9"/>'
  };
  function toast(title, message = '', type = 'info', ms = 3200) {
    let wrap = $('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; wrap.setAttribute('role', 'status'); wrap.setAttribute('aria-live', 'polite'); document.body.appendChild(wrap); }
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = `<span class="ico"><svg viewBox="0 0 24 24">${ICONS[type] || ICONS.info}</svg></span>
                    <span class="txt"><b>${P.esc ? P.esc(title) : title}</b>${message ? `<span>${P.esc ? P.esc(message) : message}</span>` : ''}</span>`;
    wrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    const kill = () => { el.classList.remove('in'); setTimeout(() => el.remove(), 300); };
    setTimeout(kill, ms);
    on(el, 'click', kill);
  }
  P.toast = toast;

  /* ======================================================================
     MODAL — one reusable dialog, with focus trap and Esc to close
     ====================================================================== */
  let lastFocused = null;
  function ensureModal() {
    let m = $('#plana-modal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'plana-modal'; m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Product preview');
    m.innerHTML = `<div class="scrim" data-modal-close></div>
      <div class="dialog">
        <button class="close" type="button" data-modal-close aria-label="Close preview">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div class="modal-content"></div>
      </div>`;
    document.body.appendChild(m);
    $$('[data-modal-close]', m).forEach(el => on(el, 'click', closeModal));
    on(document, 'keydown', e => {
      if (!m.classList.contains('open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Tab') {
        const f = $$('a[href], button:not([disabled]), input, select, textarea', m).filter(el => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    return m;
  }
  function openModal(html) {
    const m = ensureModal();
    lastFocused = document.activeElement;
    $('.modal-content', m).innerHTML = html;
    m.classList.add('open'); document.body.classList.add('is-locked');
    const focusable = $('.dialog button, .dialog a', m); if (focusable) focusable.focus();
    return m;
  }
  function closeModal() {
    const m = $('#plana-modal'); if (!m) return;
    m.classList.remove('open'); document.body.classList.remove('is-locked');
    if (lastFocused) lastFocused.focus();
  }
  P.openModal = openModal; P.closeModal = closeModal;

  /* Quick preview modal (delegated — works for cards rendered at any time) */
  on(document, 'click', e => {
    const btn = e.target.closest('[data-quick]');
    if (!btn) return;
    const p = P.getProduct(btn.dataset.quick); if (!p) return;
    openModal(`
      <div class="modal-split">
        <div class="modal-art">${P.plannerArt({ palette: p.palette, title: p.name, subtitle: p.category, motif: p.cover })}</div>
        <div class="modal-body">
          <span class="eyebrow">${P.esc(p.category)}</span>
          <h2 style="margin:12px 0 10px;font-size:1.7rem">${P.esc(p.name)}</h2>
          <span class="rating">${P.starsHTML(p.rating)} <b>${p.rating}</b> <span>(${p.reviews} reviews)</span></span>
          <p class="muted small" style="margin-top:14px">${P.esc(p.description.slice(0, 190))}…</p>
          <ul class="incl small" style="margin:18px 0">
            ${p.includes.slice(0, 3).map(i => `<li><span class="tick"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>${P.esc(i)}</li>`).join('')}
          </ul>
          <div class="row-between" style="margin-bottom:16px">
            <span class="price">${P.money(p.price)}${p.oldPrice ? `<span class="was">${P.money(p.oldPrice)}</span>` : ''}</span>
            <span class="pill-tag">${p.pages} pages</span>
          </div>
          <div class="row" style="gap:10px">
            <button class="btn btn-primary" type="button" data-add="${p.id}">Add to cart</button>
            <a class="btn btn-ghost" href="#product/${p.slug}">Full details</a>
          </div>
        </div>
      </div>`);
  });

  /* ======================================================================
     FORM VALIDATION — small, dependency-free, accessible
     ====================================================================== */
  const RULES = {
    required: v => v.trim().length > 0 || 'This field is required.',
    email:    v => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) || 'Enter a valid email address.',
    min3:     v => v.trim().length >= 3 || 'Please enter at least 3 characters.',
    card:     v => /^[\d ]{16,19}$/.test(v.trim()) || 'Enter a 16-digit card number.',
    expiry:   v => /^(0[1-9]|1[0-2])\/\d{2}$/.test(v.trim()) || 'Use MM/YY format.',
    cvc:      v => /^\d{3,4}$/.test(v.trim()) || 'Enter a 3–4 digit code.',
    pass:     v => v.length >= 8 || 'At least 8 characters.'
  };
  function validateField(input) {
    const rules = (input.dataset.rules || '').split('|').filter(Boolean);
    // .field is the labelled group; the input may sit inside a wrapper (.pw-wrap)
    const errEl = (input.closest('.field') || input.parentElement).querySelector('.field-error');
    for (const r of rules) {
      const res = RULES[r] ? RULES[r](input.value) : true;
      if (res !== true) {
        input.classList.add('invalid'); input.setAttribute('aria-invalid', 'true');
        if (errEl) errEl.textContent = res;
        return false;
      }
    }
    input.classList.remove('invalid'); input.removeAttribute('aria-invalid');
    if (errEl) errEl.textContent = '';
    return true;
  }
  function validateForm(form) {
    const fields = $$('[data-rules]', form);
    let ok = true, firstBad = null;
    fields.forEach(f => { if (!validateField(f)) { ok = false; if (!firstBad) firstBad = f; } });
    if (firstBad) firstBad.focus();
    return ok;
  }
  P.validateField = validateField; P.validateForm = validateForm;

  function initForms() {
    $$('[data-rules]').forEach(input => {
      on(input, 'blur', () => validateField(input));
      on(input, 'input', () => { if (input.classList.contains('invalid')) validateField(input); });
    });
    // Newsletter (present on several pages)
    $$('[data-newsletter]').forEach(form => on(form, 'submit', e => {
      e.preventDefault();
      if (!validateForm(form)) { toast('Check your email', 'That address does not look right.', 'err'); return; }
      const btn = $('button[type="submit"]', form);
      const email = $('input[type="email"]', form).value;
      btn.classList.add('is-loading'); btn.textContent = 'Joining';

      const done = res => {
        btn.classList.remove('is-loading');
        if (res && res.ok === false) {
          btn.textContent = 'Get 15% off';
          toast('Could not subscribe', res.message || 'Please try again.', 'err');
          return;
        }
        btn.textContent = 'Joined ✓';
        form.reset();
        toast('You are on the list', 'Your 15% welcome code is on its way.', 'ok');
        setTimeout(() => { btn.textContent = 'Get 15% off'; }, 2600);
      };

      if (P.db && P.db.enabled) P.db.subscribe(email, 'newsletter').then(done, () => done(null));
      else setTimeout(() => done(null), 900);
    }));
  }

  /* ======================================================================
     ROUTER — the whole site is one document; each "page" is a <section
     class="view">. Routes live in the hash so they stay linkable,
     bookmarkable and back-button friendly:

        #home                      #product/<slug>
        #shop?cat=Journals&fav=1   #plan?start=university
        #customize?from=<slug>     #about?to=faq
        #cart
     ====================================================================== */
  const ROUTES = {
    login:     { title: 'Sign in — PLANA' },
    home:      { title: 'PLANA — Plan better. Create more. Live lighter.' },
    shop:      { title: 'Shop digital planners — PLANA' },
    product:   { title: 'Product — PLANA' },
    plan:      { title: 'PLANA Match — find your perfect planner' },
    customize: { title: 'Build your custom planner — PLANA' },
    about:     { title: 'About PLANA — planners for the weeks that do not go to plan' },
    cart:      { title: 'Cart & checkout — PLANA' }
  };

  /** '#product/my-slug?x=1' -> { name:'product', param:'my-slug', params:{x:'1'} } */
  function parseHash() {
    const raw = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const [path, query] = raw.split('?');
    const [name, param] = path.split('/');
    const params = {};
    new URLSearchParams(query || '').forEach((v, k) => { params[k] = v; });
    return { name: ROUTES[name] ? name : 'home', param: param || '', params, raw };
  }

  /** Programmatic navigation — `PLANA.go('product/quiet-minimal-planner')`. */
  function go(route) {
    const next = '#' + String(route).replace(/^#/, '');
    if (location.hash === next) renderRoute();   // same hash fires no event
    else location.hash = next;
  }

  let firstRender = true;
  function renderRoute() {
    /* A hash that is not a route but *is* an element on screen (the skip
       link's #main, an in-view anchor) is treated as a plain anchor jump
       rather than a navigation. */
    const rawName = location.hash.replace(/^#\/?/, '').split('?')[0].split('/')[0];
    if (rawName && !ROUTES[rawName]) {
      const anchor = document.getElementById(rawName);
      if (anchor && !anchor.closest('.view[hidden]')) {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (anchor.tabIndex < 0) anchor.tabIndex = -1;
        anchor.focus({ preventScroll: true });
        return;
      }
    }

    const r = parseHash();

    /* ---- the gate: everything sits behind the login view ---- */
    if (P.auth) {
      const user = P.auth.current();
      if (!user && r.name !== 'login') {         // remember where they were going
        P.auth.remember('#' + r.raw);
        go('login');
        return;
      }
      if (user && r.name === 'login') { go('home'); return; }
    }
    document.body.classList.toggle('is-gated', r.name === 'login');

    $$('.view').forEach(v => { v.hidden = v.dataset.route !== r.name; });

    // The newsletter block is shared by every view except checkout
    const nl = $('#global-newsletter');
    if (nl) nl.hidden = r.name === 'cart' || r.name === 'login';

    document.title = ROUTES[r.name].title;

    $$('.nav-links a, .mobile-nav a.m-link').forEach(a => {
      const target = (a.getAttribute('href') || '').replace(/^#/, '').split('?')[0].split('/')[0];
      if (target === r.name) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    // Let each view controller react (render a product, apply filters, …)
    document.dispatchEvent(new CustomEvent('plana:route', { detail: r }));

    const view = $('#view-' + r.name);
    if (view) {
      view.classList.remove('page-fade'); void view.offsetWidth; view.classList.add('page-fade');
      observeReveals(view);
    }

    // Deep-link to a section inside a view (#about?to=faq)
    const target = r.params.to ? document.getElementById(r.params.to) : null;
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });

    // Move focus to the top of the new view so keyboard and screen-reader
    // users are not left where the previous view was.
    if (!firstRender) { const m = $('#main'); if (m) m.focus({ preventScroll: true }); }
    firstRender = false;
  }
  P.go = go; P.parseHash = parseHash;

  /* ======================================================================
     HOME PAGE — featured, best sellers, categories, testimonials
     ====================================================================== */
  const TESTIMONIALS = [
    { t: 'I have bought a lot of planners and abandoned most of them. The Balanced Student Planner is the first one I finished a whole semester with — the rest planner is what did it.', n: 'Layla A.', r: 'Engineering student, Kuwait University', c: 'var(--lav)' },
    { t: 'PLANA MATCH sent me to the Deep Work planner instead of the one I was about to buy. It was right. My meeting load is finally visible and I have two protected mornings a week.', n: 'Daniel M.', r: 'Product designer', c: 'var(--rose)' },
    { t: 'The custom builder is dangerous in the best way. I made a planner with exactly the six sections I use and nothing else. It took four minutes.', n: 'Noor S.', r: 'Freelance illustrator', c: 'var(--sage)' }
  ];

  function initHome() {
    const featured = $('#featured-grid');
    if (!featured) return; // not the home page

    const feat = P.PRODUCTS.filter(p => ['p01', 'p04', 'p02', 'p07'].includes(p.id));
    featured.innerHTML = feat.map((p, i) => P.productCardHTML(p).replace('reveal', `reveal reveal-d${(i % 4) + 1}`)).join('');

    const best = $('#best-grid');
    if (best) {
      const top = [...P.PRODUCTS].sort((a, b) => b.reviews * b.rating - a.reviews * a.rating).slice(0, 4);
      best.innerHTML = top.map((p, i) => P.productCardHTML(p).replace('reveal', `reveal reveal-d${(i % 4) + 1}`)).join('');
    }

    const cats = $('#cat-grid');
    if (cats) {
      const tints = ['var(--lav-soft)', 'var(--rose-soft)', 'var(--sage-soft)', 'var(--sand-soft)'];
      cats.innerHTML = P.CATEGORIES.map((c, i) => {
        const n = P.PRODUCTS.filter(p => p.category === c).length;
        return `<a class="cat-tile reveal reveal-d${(i % 4) + 1}" href="#shop?cat=${encodeURIComponent(c)}">
          <span class="orb" style="background:${tints[i % 4]}"></span>
          <div><h3>${P.esc(c)}</h3><span class="n">${n} product${n === 1 ? '' : 's'}</span></div>
          <span class="go">Browse <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>
        </a>`;
      }).join('');
    }

    const quotes = $('#quotes');
    if (quotes) {
      quotes.innerHTML = TESTIMONIALS.map((q, i) => `
        <figure class="quote reveal reveal-d${i + 1}">
          <p>${P.esc(q.t)}</p>
          <figcaption class="who">
            <span class="avatar" style="background:${q.c}">${q.n.charAt(0)}</span>
            <span><b>${P.esc(q.n)}</b><span>${P.esc(q.r)}</span></span>
          </figcaption>
        </figure>`).join('');
    }

    // Hero floating mockups
    const art = $('#hero-art');
    if (art) {
      const picks = ['p01', 'p04', 'p13'].map(P.getProduct);
      $$('.float-card', art).forEach((el, i) => {
        const p = picks[i]; if (!p) return;
        el.innerHTML = P.plannerArt({ palette: p.palette, title: p.name, subtitle: p.category, motif: p.cover });
      });
    }

    // Home "find your planner" teaser — 1 question, then hands off to the quiz
    const teaser = $('#teaser-options');
    if (teaser) {
      const opts = [
        { k: 'university', e: '🎓', l: 'University', d: 'Deadlines, revision, balance' },
        { k: 'work', e: '💼', l: 'Work', d: 'Meetings, deep work, delivery' },
        { k: 'personal', e: '🌿', l: 'Personal life', d: 'Habits, home, headspace' },
        { k: 'business', e: '✦', l: 'Business', d: 'Clients, content, numbers' }
      ];
      teaser.innerHTML = opts.map(o => `
        <button class="q-opt" type="button" data-teaser="${o.k}">
          <span class="emo" aria-hidden="true">${o.e}</span>
          <span><b>${o.l}</b><span>${o.d}</span></span>
        </button>`).join('');
      $$('[data-teaser]', teaser).forEach(b => on(b, 'click', () => {
        $$('[data-teaser]', teaser).forEach(x => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        setTimeout(() => { P.go('plan?start=' + b.dataset.teaser); }, 260);
      }));
    }

    observeReveals();
  }

  /* ======================================================================
     BOOT
     ====================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNav();
    initForms();
    initHome();
    observeReveals();

    // Router last, so every view controller is listening before the first
    // route — and only once any stored session has been restored, so the gate
    // makes its decision with the right answer the first time.
    const startRouter = () => {
      window.addEventListener('hashchange', renderRoute);
      renderRoute();
      document.documentElement.removeAttribute('data-booting');
    };
    if (P.auth && P.auth.ready && typeof P.auth.ready.then === 'function') {
      P.auth.ready.then(startRouter, startRouter);
    } else {
      startRouter();
    }

    // Year in footers
    $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  });
})();
