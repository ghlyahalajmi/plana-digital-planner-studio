/* ==========================================================================
   PLANA — auth.js
   The entry gate: sign in, create an account, or continue as a guest.

   Two modes, one API:

     · Supabase configured → real accounts. supabase.auth handles password
       hashing, sessions, refresh tokens and email confirmation; a trigger in
       schema.sql creates the matching public.profiles row.

     · Not configured → the original local demo mode, so this portfolio piece
       still runs from a file:// double-click. Accounts live in localStorage
       and the password is only put through a one-way, non-cryptographic hash
       so it is not sitting there in plain text. That is honest demo
       behaviour, not security — and the form says so.

   Everything else in the app only ever calls PLANA.auth.*, so neither mode
   leaks outside this file.
   ========================================================================== */
(function () {
  'use strict';
  const P = (window.PLANA = window.PLANA || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

  const USERS_KEY   = 'plana:users';
  const SESSION_KEY = 'plana:user';
  const RETURN_KEY  = 'plana:returnTo';
  const GUEST_KEY   = 'plana:guest';
  const TAB_ONLY    = 'plana:session-only';

  /** Supabase client, or null in demo mode. */
  const SB = () => (P.db && P.db.enabled ? P.db.client : null);

  /* auth.js loads before main.js (the router asks it questions during boot),
     so it keeps its own small storage helper. */
  const local = {
    get(key, fallback) {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} },
    remove(key) { try { localStorage.removeItem(key); } catch (e) {} }
  };
  const tab = {
    get(key) { try { return JSON.parse(sessionStorage.getItem(key)); } catch (e) { return null; } },
    set(key, v) { try { sessionStorage.setItem(key, JSON.stringify(v)); } catch (e) {} },
    remove(key) { try { sessionStorage.removeItem(key); } catch (e) {} }
  };

  /* ======================================================================
     DEMO MODE STORAGE  (unused when Supabase is configured)
     ====================================================================== */
  const demo = {
    session: {
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
      clear() { try { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); } catch (e) {} }
    },
    /** djb2 — fast, non-cryptographic. Obfuscation for the demo only. */
    hash(str) {
      let h = 5381;
      for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
      return 'h' + (h >>> 0).toString(36);
    },
    users: () => local.get(USERS_KEY, []),
    save: list => local.set(USERS_KEY, list),
    seed() {
      const list = demo.users();
      if (!list.some(u => u.email === 'demo@plana.studio')) {
        list.push({ name: 'Demo Planner', email: 'demo@plana.studio', pass: demo.hash('plana1234'), at: Date.now() });
        demo.save(list);
      }
    }
  };

  /* ======================================================================
     SESSION STATE
     ====================================================================== */
  let sbUser = null;          // shaped { name, email } from the Supabase session
  let resolveReady;
  const ready = new Promise(r => { resolveReady = r; });

  function shape(user) {
    if (!user) return null;
    const meta = user.user_metadata || {};
    return {
      id: user.id,
      email: user.email,
      name: meta.full_name || (user.email || '').split('@')[0]
    };
  }

  /* auth.users carries the name only when the account was created through the
     sign-up form. public.profiles is the real source of truth for a display
     name — it also covers users added from the Supabase dashboard, and any
     later rename. One small query, then the header chip is correct. */
  async function hydrateProfile() {
    const client = SB();
    if (!client || !sbUser) return;
    try {
      const { data } = await client.from('profiles').select('full_name').eq('id', sbUser.id).single();
      if (data && data.full_name && data.full_name !== sbUser.name) {
        sbUser = Object.assign({}, sbUser, { name: data.full_name });
        paintAccount();
      }
    } catch (e) { /* the chip just keeps the metadata name */ }
  }

  const guest = {
    get() { return tab.get(GUEST_KEY); },
    set() {
      const g = { name: 'Guest', email: 'guest@plana.studio', guest: true };
      tab.set(GUEST_KEY, g);
      return g;
    },
    clear() { tab.remove(GUEST_KEY); }
  };

  /* ======================================================================
     PUBLIC API — the router calls current() synchronously on every route
     ====================================================================== */
  const auth = {
    /** Resolves once any existing session has been restored. */
    ready,

    mode: () => (SB() ? 'supabase' : 'demo'),

    current() {
      if (sbUser) return sbUser;
      const g = guest.get();
      if (g) return g;
      return SB() ? null : demo.session.get();
    },

    remember(route) { if (route && !/^#?login/.test(route)) local.set(RETURN_KEY, route); },
    takeReturn() {
      const r = local.get(RETURN_KEY, null);
      local.remove(RETURN_KEY);
      return r && r !== '#' ? r.replace(/^#/, '') : 'home';
    },

    async signIn(email, pass, persist) {
      const client = SB();
      if (!client) {
        const user = demo.users().find(u => u.email.toLowerCase() === String(email).trim().toLowerCase());
        if (!user) return { ok: false, field: 'email', message: 'No account found with that email.' };
        if (user.pass !== demo.hash(pass)) return { ok: false, field: 'pass', message: 'That password does not match.' };
        const safe = { name: user.name, email: user.email };
        demo.session.set(safe, persist);
        guest.clear();
        return { ok: true, user: safe };
      }

      const { data, error } = await client.auth.signInWithPassword({
        email: String(email).trim().toLowerCase(),
        password: pass
      });
      if (error) return { ok: false, field: friendlyField(error), message: friendlyMessage(error) };

      sbUser = shape(data.user);
      guest.clear();
      rememberPersistence(persist);
      await hydrateProfile();
      return { ok: true, user: sbUser };
    },

    async signUp(name, email, pass, persist) {
      const client = SB();
      const clean = String(email).trim().toLowerCase();

      if (!client) {
        const list = demo.users();
        if (list.some(u => u.email.toLowerCase() === clean)) {
          return { ok: false, field: 'email', message: 'An account already uses that email.' };
        }
        list.push({ name: String(name).trim(), email: clean, pass: demo.hash(pass), at: Date.now() });
        demo.save(list);
        const safe = { name: String(name).trim(), email: clean };
        demo.session.set(safe, persist);
        guest.clear();
        return { ok: true, user: safe };
      }

      const { data, error } = await client.auth.signUp({
        email: clean,
        password: pass,
        options: { data: { full_name: String(name).trim() } }
      });
      if (error) return { ok: false, field: friendlyField(error), message: friendlyMessage(error) };

      // With email confirmation switched on, sign-up returns no session.
      if (!data.session) {
        return { ok: true, needsConfirmation: true, user: { name: String(name).trim(), email: clean } };
      }
      sbUser = shape(data.user);
      guest.clear();
      rememberPersistence(persist);
      await hydrateProfile();
      return { ok: true, user: sbUser };
    },

    guest() { return guest.set(); },

    async signOut() {
      guest.clear();
      demo.session.clear();
      local.remove(TAB_ONLY); tab.remove(TAB_ONLY);
      const client = SB();
      if (client) { sbUser = null; await client.auth.signOut(); }
    }
  };
  P.auth = auth;

  /* Supabase always persists its session. "Keep me signed in" is honoured by
     marking session-only logins in both storages: a fresh tab has the
     localStorage marker but not the sessionStorage one, and gets signed out
     during boot. */
  function rememberPersistence(persist) {
    if (persist) { local.remove(TAB_ONLY); tab.remove(TAB_ONLY); }
    else { local.set(TAB_ONLY, true); tab.set(TAB_ONLY, true); }
  }

  function friendlyField(error) {
    const m = (error.message || '').toLowerCase();
    if (m.includes('failed to fetch') || m.includes('load failed') ||
        m.includes('networkerror') || error.name === 'AuthRetryableFetchError') return 'email';
    if (m.includes('already registered') || m.includes('already been registered')) return 'email';
    if (m.includes('email')) return 'email';
    return 'pass';
  }
  function friendlyMessage(error) {
    const m = (error.message || '').toLowerCase();
    // Network trouble must not surface as "Failed to fetch" or "Load failed".
    if (m.includes('failed to fetch') || m.includes('load failed') ||
        m.includes('networkerror') || m.includes('fetch failed') ||
        error.name === 'AuthRetryableFetchError') {
      return 'Could not reach the server. Check your connection and try again.';
    }
    if (m.includes('invalid login credentials')) return 'That email and password do not match an account.';
    if (m.includes('already registered') || m.includes('already been registered')) return 'An account already uses that email.';
    if (m.includes('email not confirmed')) return 'Confirm your email address first — check your inbox.';
    if (m.includes('password should be')) return 'Password must be at least 8 characters.';
    return error.message || 'Something went wrong. Try again.';
  }

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
     BOOT — restore whatever session exists before the router runs
     ====================================================================== */
  (async function restore() {
    const client = SB();
    if (!client) { demo.seed(); resolveReady(auth.current()); return; }
    try {
      const { data } = await client.auth.getSession();
      const session = data ? data.session : null;

      // Session-only login opened in a new tab: drop it.
      if (session && local.get(TAB_ONLY, false) && !tab.get(TAB_ONLY)) {
        await client.auth.signOut();
        local.remove(TAB_ONLY);
      } else if (session) {
        sbUser = shape(session.user);
        await hydrateProfile();
      }

      client.auth.onAuthStateChange((event, s) => {
        sbUser = s ? shape(s.user) : null;
        paintAccount();
        if (sbUser) hydrateProfile();
        if (event === 'SIGNED_OUT' && P.go) P.go('login');
      });
    } catch (e) {
      console.warn('[plana] session restore failed:', e.message);
    }
    resolveReady(auth.current());
  })();

  /* ======================================================================
     HEADER CHIP
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
  P.paintAccount = paintAccount;

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

    const out = async () => {
      const name = (auth.current() || {}).name || '';
      close();
      await auth.signOut();
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

    ['p01', 'p04'].forEach((id, i) => {
      const el = $('#auth-art-' + (i + 1));
      const p = P.getProduct(id);
      if (el && p) el.innerHTML = P.plannerArt({ palette: p.palette, title: p.name, subtitle: p.category, motif: p.cover });
    });

    // The note under the sign-in form should describe the mode actually running.
    const note = $('#auth-mode-note');
    if (note) {
      note.innerHTML = SB()
        ? '<span aria-hidden="true">🔒</span><span><b>Real accounts</b>Sign-in is handled by Supabase Auth — passwords are hashed server side and every table is protected by row level security.</span>'
        : '<span aria-hidden="true">🔐</span><span><b>Demo account</b>Use <code>demo@plana.studio</code> / <code>plana1234</code>, or create an account below. Accounts are stored in this browser only — never type a real password into a portfolio project.</span>';
    }

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

    function fieldError(input, message) {
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
      const err = input.closest('.field').querySelector('.field-error');
      if (err) err.textContent = message;
      input.focus();
    }

    function enter(user, message) {
      paintAccount();
      P.toast(message, user.guest ? 'Browsing as a guest — nothing is saved to an account.' : 'Welcome, ' + user.name + '.', 'ok');
      P.go(auth.takeReturn());
    }

    /* --- sign in --- */
    on($('#form-signin'), 'submit', async e => {
      e.preventDefault();
      const form = e.currentTarget;
      if (!P.validateForm(form)) { P.toast('Check your details', 'Both fields are needed to sign in.', 'err'); return; }
      const btn = $('#signin-btn');
      btn.classList.add('is-loading'); btn.textContent = 'Signing in';

      const res = await auth.signIn($('#login-email').value, $('#login-pass').value, $('#remember').checked);

      btn.classList.remove('is-loading'); btn.textContent = 'Sign in';
      if (!res.ok) {
        fieldError(res.field === 'email' ? $('#login-email') : $('#login-pass'), res.message);
        P.toast('Could not sign in', res.message, 'err');
        return;
      }
      form.reset();
      enter(res.user, 'Signed in');
    });

    /* --- create account --- */
    on($('#form-signup'), 'submit', async e => {
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

      const res = await auth.signUp($('#su-name').value, $('#su-email').value, pass.value, true);

      btn.classList.remove('is-loading'); btn.textContent = 'Create my account';
      if (!res.ok) {
        fieldError($('#su-email'), res.message);
        P.toast('Could not create account', res.message, 'err');
        return;
      }
      form.reset();
      meter.className = 'strength';

      if (res.needsConfirmation) {
        P.toast('Check your inbox', 'Confirm ' + res.user.email + ' to finish creating your account.', 'ok', 6000);
        showTab('signin');
        return;
      }
      enter(res.user, 'Account created');
    });

    /* --- guest + forgot password --- */
    $$('[data-guest]').forEach(b => on(b, 'click', () => enter(auth.guest(), 'Browsing as a guest')));

    on($('#forgot'), 'click', async () => {
      const client = SB();
      const email = $('#login-email').value.trim();
      if (!client) {
        P.toast('Password reset', 'A real reset needs a server — use demo@plana.studio / plana1234.', 'info', 4200);
        return;
      }
      if (!email) { P.toast('Enter your email first', 'We will send the reset link there.', 'err'); return; }
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + '/#login' });
      if (error) P.toast('Could not send reset', error.message, 'err');
      else P.toast('Reset link sent', 'Check ' + email + ' for the link.', 'ok', 5000);
    });

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
