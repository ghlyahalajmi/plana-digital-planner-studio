/* ==========================================================================
   PLANA — auth.js
   The entry gate: sign in, create an account, or continue as a guest.

   IMPORTANT — this is a front-end portfolio demo, not real authentication.
   There is no server: "accounts" live in this browser's storage and the
   password is only run through a one-way string hash so it is not sitting in
   localStorage in plain text. That is enough to make the flow honest and
   demonstrable, and nowhere near enough for real credentials — which is why
   the UI says so, out loud, on the form.
   ========================================================================== */
(function () {
  'use strict';
  const P = (window.PLANA = window.PLANA || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

  const USERS_KEY  = 'plana:users';
  const SESSION_KEY = 'plana:user';
  const RETURN_KEY = 'plana:returnTo';

  /* auth.js loads before main.js (the router asks it questions during boot),
     so it keeps its own small storage helper rather than depending on
     PLANA.storage being defined yet. */
  const local = {
    get(key, fallback) {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} },
    remove(key) { try { localStorage.removeItem(key); } catch (e) {} }
  };

  /* A session either persists ("keep me signed in") or lasts for the tab. */
  const session = {
    get() {
      try {
        const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },
    set(user, persist) {
      try {
        const raw = JSON.stringify(user);
        if (persist) { localStorage.setItem(SESSION_KEY, raw); sessionStorage.removeItem(SESSION_KEY); }
        else { sessionStorage.setItem(SESSION_KEY, raw); localStorage.removeItem(SESSION_KEY); }
      } catch (e) {}
    },
    clear() {
      try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    }
  };

  /** djb2 — a fast, non-cryptographic hash. Demo obfuscation only. */
  function hash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return 'h' + (h >>> 0).toString(36);
  }

  const users = () => local.get(USERS_KEY, []);
  const saveUsers = list => local.set(USERS_KEY, list);

  /* Seed the demo account once, so the form always has something that works. */
  (function seed() {
    const list = users();
    if (!list.some(u => u.email === 'demo@plana.studio')) {
      list.push({ name: 'Demo Planner', email: 'demo@plana.studio', pass: hash('plana1234'), at: Date.now() });
      saveUsers(list);
    }
  })();

  /* ======================================================================
     API — the router asks these questions before rendering any view
     ====================================================================== */
  const auth = {
    current: () => session.get(),
    remember(route) { if (route && !/^#?login/.test(route)) local.set(RETURN_KEY, route); },
    takeReturn() {
      const r = local.get(RETURN_KEY, null);
      local.remove(RETURN_KEY);
      return r && r !== '#' ? r.replace(/^#/, '') : 'home';
    },

    signIn(email, pass, persist) {
      const user = users().find(u => u.email.toLowerCase() === String(email).trim().toLowerCase());
      if (!user) return { ok: false, field: 'email', message: 'No account found with that email.' };
      if (user.pass !== hash(pass)) return { ok: false, field: 'pass', message: 'That password does not match.' };
      const safe = { name: user.name, email: user.email };
      session.set(safe, persist);
      return { ok: true, user: safe };
    },

    signUp(name, email, pass, persist) {
      const list = users();
      const clean = String(email).trim().toLowerCase();
      if (list.some(u => u.email.toLowerCase() === clean)) {
        return { ok: false, field: 'email', message: 'An account already uses that email.' };
      }
      list.push({ name: String(name).trim(), email: clean, pass: hash(pass), at: Date.now() });
      saveUsers(list);
      const safe = { name: String(name).trim(), email: clean };
      session.set(safe, persist);
      return { ok: true, user: safe };
    },

    guest() {
      const safe = { name: 'Guest', email: 'guest@plana.studio', guest: true };
      session.set(safe, false);
      return safe;
    },

    signOut() { session.clear(); }
  };
  P.auth = auth;

  /** 0–4 score used by the strength meter. */
  function strength(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw) || (/[a-z]/.test(pw) && /[A-Z]/.test(pw))) s++;
    return Math.min(4, s);
  }

  /* ======================================================================
     HEADER CHIP — who is signed in, and how to leave
     ====================================================================== */
  function paintAccount() {
    const user = auth.current();
    const wrap = $('#account');
    if (!wrap) return;
    wrap.hidden = !user;
    $$('[data-signout]').forEach(b => { b.hidden = !user; });
    if (!user) return;
    $$('[data-user-name]').forEach(el => { el.textContent = user.name; });
    $$('[data-user-email]').forEach(el => { el.textContent = user.guest ? 'Browsing as a guest' : user.email; });
    $$('[data-user-initial]').forEach(el => { el.textContent = (user.name || '?').charAt(0).toUpperCase(); });
  }

  function initAccountMenu() {
    const btn = $('#account-btn'), pop = $('#account-pop');
    if (!btn || !pop) return;
    const close = () => { pop.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    on(btn, 'click', e => {
      e.stopPropagation();
      const open = pop.hidden;
      pop.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
    on(document, 'click', e => { if (!pop.hidden && !pop.contains(e.target)) close(); });
    on(document, 'keydown', e => { if (e.key === 'Escape') close(); });
    $$('a', pop).forEach(a => on(a, 'click', close));

    const out = () => {
      const name = (auth.current() || {}).name || '';
      auth.signOut();
      close();
      paintAccount();
      P.toast('Signed out', name ? 'See you soon, ' + name + '.' : '', 'info');
      P.go('login');
    };
    on($('#signout-btn'), 'click', out);
    $$('[data-signout]').forEach(b => on(b, 'click', out));
  }

  /* ======================================================================
     THE FORMS
     ====================================================================== */
  function initAuthView() {
    const view = $('#view-auth');
    if (!view) return;

    // Two planner mockups on the brand side
    ['p01', 'p04'].forEach((id, i) => {
      const el = $('#auth-art-' + (i + 1));
      const p = P.getProduct(id);
      if (el && p) el.innerHTML = P.plannerArt({ palette: p.palette, title: p.name, subtitle: p.category, motif: p.cover });
    });

    /* --- tabs --- */
    const panels = { signin: $('#form-signin'), signup: $('#form-signup') };
    const copy = {
      signin: ['Sign in to PLANA', 'Your planners, favourites and custom builds — all in one place.'],
      signup: ['Create your account', 'It takes about twenty seconds, and your cart comes with you.']
    };
    function showTab(key) {
      $$('[data-auth-tab]').forEach(t => t.setAttribute('aria-selected', String(t.dataset.authTab === key)));
      Object.keys(panels).forEach(k => { panels[k].hidden = k !== key; });
      $('#auth-title').textContent = copy[key][0];
      $('#auth-sub').textContent = copy[key][1];
      const first = $('input', panels[key]); if (first) first.focus();
    }
    $$('[data-auth-tab]').forEach(t => on(t, 'click', () => showTab(t.dataset.authTab)));

    /* --- show / hide password --- */
    $$('[data-pw-toggle]').forEach(btn => on(btn, 'click', () => {
      const input = document.getElementById(btn.dataset.pwToggle);
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Hide' : 'Show';
      btn.setAttribute('aria-pressed', String(show));
      input.focus();
    }));

    /* --- strength meter --- */
    const suPass = $('#su-pass'), meter = $('#pw-strength'), meterLabel = $('#pw-strength-label');
    const LABELS = ['Too short to be useful.', 'Weak — add a few more characters.', 'Getting there — add a number.', 'Good password.', 'Strong password.'];
    on(suPass, 'input', () => {
      const s = suPass.value ? strength(suPass.value) : 0;
      meter.className = 'strength s' + s;
      meterLabel.textContent = suPass.value ? LABELS[s] : 'Use 8+ characters, with a number for a stronger password.';
    });

    /* --- helper: put an error under a specific field --- */
    function fieldError(input, message) {
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
      const err = input.closest('.field').querySelector('.field-error');
      if (err) err.textContent = message;
      input.focus();
    }

    /** Land the user in the app after a successful sign in / sign up. */
    function enter(user, message) {
      paintAccount();
      P.toast(message, user.guest ? 'Browsing as a guest — nothing is saved to an account.' : 'Welcome, ' + user.name + '.', 'ok');
      P.go(auth.takeReturn());
    }

    /* --- sign in --- */
    on($('#form-signin'), 'submit', e => {
      e.preventDefault();
      const form = e.currentTarget;
      if (!P.validateForm(form)) { P.toast('Check your details', 'Both fields are needed to sign in.', 'err'); return; }
      const btn = $('#signin-btn');
      btn.classList.add('is-loading'); btn.textContent = 'Signing in';
      setTimeout(() => {
        const res = auth.signIn($('#login-email').value, $('#login-pass').value, $('#remember').checked);
        btn.classList.remove('is-loading'); btn.textContent = 'Sign in';
        if (!res.ok) {
          fieldError(res.field === 'email' ? $('#login-email') : $('#login-pass'), res.message);
          P.toast('Could not sign in', res.message, 'err');
          return;
        }
        form.reset();
        enter(res.user, 'Signed in');
      }, 700);
    });

    /* --- create account --- */
    on($('#form-signup'), 'submit', e => {
      e.preventDefault();
      const form = e.currentTarget;
      const pass = $('#su-pass'), pass2 = $('#su-pass2'), terms = $('#su-terms');
      let ok = P.validateForm(form);

      if (ok && pass.value !== pass2.value) { fieldError(pass2, 'The two passwords do not match.'); ok = false; }
      $('#terms-error').textContent = '';
      if (ok && !terms.checked) { $('#terms-error').textContent = 'Please accept the terms to continue.'; terms.focus(); ok = false; }
      if (!ok) { P.toast('Almost there', 'Please fix the highlighted fields.', 'err'); return; }

      const btn = $('#signup-btn');
      btn.classList.add('is-loading'); btn.textContent = 'Creating account';
      setTimeout(() => {
        const res = auth.signUp($('#su-name').value, $('#su-email').value, pass.value, true);
        btn.classList.remove('is-loading'); btn.textContent = 'Create my account';
        if (!res.ok) {
          fieldError($('#su-email'), res.message);
          P.toast('Could not create account', res.message, 'err');
          return;
        }
        form.reset();
        meter.className = 'strength';
        enter(res.user, 'Account created');
      }, 900);
    });

    /* --- guest + forgot password --- */
    $$('[data-guest]').forEach(b => on(b, 'click', () => enter(auth.guest(), 'Browsing as a guest')));
    on($('#forgot'), 'click', () => {
      P.toast('Password reset', 'A real reset needs a server — use demo@plana.studio / plana1234.', 'info', 4200);
    });

    // Deep link straight to the sign-up tab with #login?tab=signup
    document.addEventListener('plana:route', e => {
      if (e.detail.name !== 'login') return;
      showTab(e.detail.params.tab === 'signup' ? 'signup' : 'signin');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initAuthView();
    initAccountMenu();
    paintAccount();
  });
})();
