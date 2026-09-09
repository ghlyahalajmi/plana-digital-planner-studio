/* ==========================================================================
   PLANA — planner.js
   Two experiences live here:
     A. PLANA MATCH  — a four-question recommendation engine (#plan)
     B. CUSTOM PLANNER BUILDER — a live, data-driven planner preview
                                  (#customize)
   Both are pure client-side logic: scoring rules, weights and copy banks.
   ========================================================================== */
(function () {
  'use strict';
  const P = (window.PLANA = window.PLANA || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ======================================================================
     A. PLANA MATCH
     ====================================================================== */

  /** The questionnaire. `dim` maps each question onto a scoring dimension. */
  const QUESTIONS = [
    {
      dim: 'purpose', title: 'What are you planning for?',
      hint: 'Pick the part of life that needs the most structure right now.',
      options: [
        { k: 'university', e: '🎓', l: 'University',    d: 'Lectures, deadlines, revision' },
        { k: 'work',       e: '💼', l: 'Work',          d: 'Projects, meetings, deep work' },
        { k: 'personal',   e: '🌿', l: 'Personal life', d: 'Home, habits, headspace' },
        { k: 'fitness',    e: '🏃', l: 'Fitness',       d: 'Training, food, recovery' },
        { k: 'business',   e: '✦',  l: 'Business',      d: 'Clients, content, numbers' }
      ]
    },
    {
      dim: 'challenge', title: 'What is your biggest challenge?',
      hint: 'Be honest — this is what the recommendation is built around.',
      options: [
        { k: 'time',         e: '⏳', l: 'Time management', d: 'The day disappears' },
        { k: 'organization', e: '🗂', l: 'Organization',    d: 'Things live in ten places' },
        { k: 'motivation',   e: '🔥', l: 'Motivation',      d: 'Starting is the hard part' },
        { k: 'goals',        e: '🎯', l: 'Tracking goals',  d: 'Plans fade after week two' },
        { k: 'balance',      e: '⚖️', l: 'Balancing everything', d: 'Something always slips' }
      ]
    },
    {
      dim: 'style', title: 'How do you prefer to plan?',
      hint: 'There is no right answer — only the one you will keep using.',
      options: [
        { k: 'minimal',  e: '◻️', l: 'Minimal',  d: 'Few boxes, lots of air' },
        { k: 'detailed', e: '▦',  l: 'Detailed', d: 'Every field, filled in' },
        { k: 'visual',   e: '🎨', l: 'Visual',   d: 'Colour, stickers, charts' },
        { k: 'flexible', e: '🌊', l: 'Flexible', d: 'Undated, forgiving pages' }
      ]
    },
    {
      dim: 'cadence', title: 'What is your planning rhythm?',
      hint: 'How often do you actually sit down with a planner?',
      options: [
        { k: 'daily',   e: '☀️', l: 'Daily',   d: 'A page every morning' },
        { k: 'weekly',  e: '📆', l: 'Weekly',  d: 'One sit-down on Sunday' },
        { k: 'monthly', e: '🌙', l: 'Monthly', d: 'Zoomed out, big picture' }
      ]
    }
  ];

  /* Dimension weights — purpose matters most, rhythm is a tie-breaker. */
  const DIM_WEIGHTS = { purpose: 1.3, challenge: 1.15, style: 1.0, cadence: .85 };

  /* Copy banks used to explain the result in the user's own terms. */
  const CHALLENGE_COPY = {
    time:         { why: 'time-blocked pages so the day stops disappearing', section: 'Time Blocks',
                    tip: 'Block two protected hours before you open any inbox — the rest of the day negotiates around them.' },
    organization: { why: 'one index that gathers everything into a single place', section: 'Master Index',
                    tip: 'Give every open loop exactly one home. Two homes means it will be forgotten in both.' },
    motivation:   { why: 'streaks and gentle restarts that keep momentum visible', section: 'Streak Tracker',
                    tip: 'Shrink the habit until it is boring, then never miss twice in a row.' },
    goals:        { why: 'a goal cascade that ties this week to what you actually want', section: 'Goal Cascade',
                    tip: 'Write goals as a finished outcome with a date, not as an activity you might do.' },
    balance:      { why: 'a rest planner treated as seriously as the work pages', section: 'Rest Planner',
                    tip: 'Schedule recovery first. Everything else expands to fill whatever space is left.' }
  };
  const STYLE_COPY = {
    minimal:  'uncluttered spreads with room to breathe',
    detailed: 'granular fields for people who like the whole picture filled in',
    visual:   'colour coding, trackers and charts you can read at a glance',
    flexible: 'undated pages that forgive a skipped week'
  };
  const CADENCE_COPY = {
    daily:   'a daily rhythm with a light weekly review',
    weekly:  'a weekly sit-down that sets the whole week in one pass',
    monthly: 'a monthly overview with quick weekly check-ins'
  };
  const PURPOSE_COPY = {
    university: 'university life', work: 'work and delivery', personal: 'personal life',
    fitness: 'training and recovery', business: 'running your business'
  };

  /** Weekly structures suggested per rhythm + purpose. */
  function weekStructure(a) {
    const base = {
      daily:   ['Plan', 'Deep work', 'Deep work', 'Deep work', 'Review', 'Light', 'Rest'],
      weekly:  ['Set up', 'Push', 'Push', 'Admin', 'Finish', 'Buffer', 'Reset'],
      monthly: ['Review', 'Build', 'Build', 'Build', 'Report', 'Open', 'Rest']
    }[a.cadence];
    const overlay = {
      university: ['Lectures', 'Study', 'Study', 'Assignments', 'Revision', 'Catch-up', 'Off'],
      work:       ['Planning', 'Deep work', 'Meetings', 'Deep work', 'Wrap-up', 'Personal', 'Off'],
      personal:   ['Reset', 'Habits', 'Habits', 'Errands', 'Social', 'Slow', 'Off'],
      fitness:    ['Push', 'Pull', 'Rest', 'Legs', 'Cardio', 'Mobility', 'Recover'],
      business:   ['Pipeline', 'Client work', 'Client work', 'Content', 'Numbers', 'Admin', 'Off']
    }[a.purpose];
    return base.map((b, i) => ({ day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i], label: overlay[i], mode: b }));
  }

  /**
   * Score every product against the four answers.
   * Each product declares a 0–5 weight per option; we take a weighted sum,
   * normalise it against the theoretical maximum, and map it onto a
   * believable 64–98% match band.
   * @returns {Array} products sorted best-first, each with `.score`
   */
  function scoreProducts(answers) {
    const maxRaw = Object.values(DIM_WEIGHTS).reduce((s, w) => s + w * 5, 0);
    return P.PRODUCTS.map(p => {
      let raw = 0;
      for (const dim in DIM_WEIGHTS) {
        const table = p.match[dim] || {};
        raw += (table[answers[dim]] || 0) * DIM_WEIGHTS[dim];
      }
      // small nudge for well-reviewed products so ties break sensibly
      const trust = (p.rating - 4.4) * 0.6 + Math.min(p.reviews, 800) / 4000;
      const pct = Math.round(64 + (raw / maxRaw) * 33 + trust);
      return Object.assign({}, p, { score: Math.max(58, Math.min(98, pct)), raw });
    }).sort((a, b) => b.score - a.score || b.rating - a.rating);
  }

  /** Human-readable reasons, generated from the answers + winning product. */
  function reasons(p, a) {
    const out = [];
    out.push(`Built for ${PURPOSE_COPY[a.purpose]} — ${p.sections.slice(0, 3).join(', ').toLowerCase()} are already in the file.`);
    out.push(`Answers your biggest challenge with ${CHALLENGE_COPY[a.challenge].why}.`);
    out.push(`Matches a ${a.style} planning style: ${STYLE_COPY[a.style]}.`);
    out.push(`Designed around ${CADENCE_COPY[a.cadence]}.`);
    if (p.badge === 'popular') out.push(`${p.reviews} people with similar answers rated it ${p.rating}/5.`);
    return out;
  }

  function recommendedSections(p, a) {
    const extra = CHALLENGE_COPY[a.challenge].section;
    const styleExtra = { visual: 'Colour Key', detailed: 'Weekly Metrics', minimal: 'One-Line Journal', flexible: 'Undated Pages' }[a.style];
    return [...new Set([...p.sections, extra, styleExtra])].slice(0, 8);
  }

  function tips(a) {
    const bank = [
      CHALLENGE_COPY[a.challenge].tip,
      a.cadence === 'daily'
        ? 'Close the day by writing tomorrow’s three priorities — planning is cheaper the night before.'
        : a.cadence === 'weekly'
          ? 'Run a 20-minute weekly review at the same time each week. Consistency beats length.'
          : 'End each month by deleting one commitment. A plan that only grows eventually collapses.',
      a.style === 'minimal'
        ? 'Leave one page blank every week on purpose. Empty space is where thinking happens.'
        : 'Use a maximum of four colours. Past that, colour coding stops meaning anything.'
    ];
    return bank;
  }

  function initMatch() {
    const mount = $('#quiz-mount'); if (!mount) return;

    const answers = {};
    let step = 0;

    // The home page teaser can pre-answer question one (#plan?start=work)
    const routeParams = () => (P.parseHash ? P.parseHash().params : {});
    function preAnswer(key) {
      if (!key || !QUESTIONS[0].options.some(o => o.k === key)) return false;
      Object.keys(answers).forEach(k => delete answers[k]);
      answers.purpose = key; step = 1;
      return true;
    }
    preAnswer(routeParams().start);

    function progress() {
      const done = Object.keys(answers).length;
      return Math.round((done / QUESTIONS.length) * 100);
    }

    function renderQuestion() {
      const q = QUESTIONS[step];
      mount.innerHTML = `
        <div class="quiz-card" role="group" aria-labelledby="q-title">
          <div class="q-head">
            <span class="q-step">Question ${step + 1} of ${QUESTIONS.length}</span>
            <div class="q-dots" aria-hidden="true">
              ${QUESTIONS.map((_, i) => `<i class="${i === step ? 'on' : (i < step ? 'done' : '')}"></i>`).join('')}
            </div>
          </div>
          <div class="bar"><i style="width:${progress()}%"></i></div>
          <h2 class="q-title" id="q-title">${q.title}</h2>
          <p class="muted small" style="margin-top:-18px;margin-bottom:26px">${q.hint}</p>
          <div class="q-options">
            ${q.options.map(o => `
              <button class="q-opt" type="button" data-opt="${o.k}" aria-pressed="${answers[q.dim] === o.k}">
                <span class="emo" aria-hidden="true">${o.e}</span>
                <span><b>${o.l}</b><span>${o.d}</span></span>
              </button>`).join('')}
          </div>
          <div class="q-nav">
            <button class="btn btn-ghost btn-sm" type="button" id="q-back" ${step === 0 ? 'disabled' : ''}>← Back</button>
            <button class="btn btn-primary btn-sm" type="button" id="q-next" ${answers[q.dim] ? '' : 'disabled'}>
              ${step === QUESTIONS.length - 1 ? 'See my match' : 'Next →'}
            </button>
          </div>
        </div>`;

      $$('[data-opt]', mount).forEach(btn => btn.addEventListener('click', () => {
        answers[q.dim] = btn.dataset.opt;
        $$('[data-opt]', mount).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
        $('#q-next').disabled = false;
        $('.bar > i', mount).style.width = progress() + '%';
        setTimeout(next, 280); // gentle auto-advance, Next still available
      }));
      $('#q-back').addEventListener('click', () => { if (step > 0) { step--; renderQuestion(); } });
      $('#q-next').addEventListener('click', next);

      const first = $('.q-opt', mount); if (first && step > 0) first.focus();
    }

    function next() {
      const q = QUESTIONS[step];
      if (!answers[q.dim]) return;
      if (step < QUESTIONS.length - 1) { step++; renderQuestion(); }
      else runCalculation();
    }

    /* A short, honest "calculating" state — it is doing real work, but the
       pause also gives the reveal some weight. */
    function runCalculation() {
      const msgs = ['Reading your answers…', 'Scoring 16 planners…', 'Weighing layout against rhythm…', 'Building your preview…'];
      mount.innerHTML = `<div class="quiz-card q-loading">
        <div class="ring" role="progressbar" aria-label="Calculating your match"></div>
        <h2 style="font-size:1.5rem">Finding your PLANA MATCH</h2>
        <p class="msg" id="calc-msg">${msgs[0]}</p>
      </div>`;
      let i = 0;
      const t = setInterval(() => {
        i++;
        const el = $('#calc-msg');
        if (el && msgs[i]) el.textContent = msgs[i];
        if (i >= msgs.length) { clearInterval(t); showResult(); }
      }, 480);
    }

    function showResult() {
      const ranked = scoreProducts(answers);
      const win = ranked[0], runners = ranked.slice(1, 3);
      const secs = recommendedSections(win, answers);
      const week = weekStructure(answers);
      P.storage.set('plana:match', { answers, slug: win.slug, score: win.score, at: Date.now() });

      mount.innerHTML = `
      <div class="match-result">
        <div class="quiz-card">
          <div class="row-between" style="margin-bottom:26px">
            <span class="eyebrow" style="margin:0">Your PLANA Match</span>
            <button class="btn btn-ghost btn-sm" type="button" id="retake">Retake quiz</button>
          </div>

          <div class="match-hero">
            <div>
              <div class="score-ring">
                <svg viewBox="0 0 200 200" aria-hidden="true">
                  <defs><linearGradient id="matchGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="var(--lav)"/><stop offset="100%" stop-color="var(--rose)"/>
                  </linearGradient></defs>
                  <circle class="track" cx="100" cy="100" r="86"/>
                  <circle class="val" id="score-arc" cx="100" cy="100" r="86"
                          stroke-dasharray="${2 * Math.PI * 86}" stroke-dashoffset="${2 * Math.PI * 86}"/>
                </svg>
                <div class="num"><b id="score-num">0%</b><span>Match</span></div>
              </div>
            </div>
            <div>
              <span class="badge badge-pop">✨ Your best fit</span>
              <h2 style="margin:14px 0 10px">${P.esc(win.name)}</h2>
              <p class="muted">${P.esc(win.short)}</p>
              <div class="row" style="margin-top:14px;gap:14px">
                <span class="rating">${P.starsHTML(win.rating)} <b>${win.rating}</b> <span>(${win.reviews})</span></span>
                <span class="price">${P.money(win.price)}</span>
              </div>
              <div class="row" style="margin-top:20px">
                <button class="btn btn-primary" type="button" data-add="${win.id}">Add to cart</button>
                <a class="btn btn-ghost" href="#customize?from=${win.slug}">Customise it</a>
                <a class="btn btn-soft btn-sm" href="#product/${win.slug}">Details</a>
              </div>
            </div>
          </div>
        </div>

        <div class="grid g-2 section-sm" style="align-items:start">
          <div class="card card-pad">
            <span class="eyebrow">Why it matches</span>
            <ul class="why-list" style="margin-top:18px">
              ${reasons(win, answers).map((r, i) => `<li style="animation-delay:${.15 + i * .09}s"><span class="sp" aria-hidden="true">✓</span><span>${P.esc(r)}</span></li>`).join('')}
            </ul>
            <div class="divider" style="margin:18px 0"></div>
            <span class="eyebrow">Sections we suggest</span>
            <div class="row" style="margin-top:14px">${secs.map(s => `<span class="pill-tag">${P.esc(s)}</span>`).join('')}</div>
          </div>

          <div class="card card-pad">
            <span class="eyebrow">Your planner preview</span>
            <div style="border-radius:var(--r-lg);overflow:hidden;margin-top:16px;background:var(--surface-2)">
              ${P.plannerArt({ palette: win.palette, kind: 'spread', left: answers.cadence === 'monthly' ? 'monthly' : 'weekly', right: answers.challenge === 'motivation' ? 'habit' : 'sections', sections: secs })}
            </div>
            <span class="eyebrow" style="margin-top:22px">Suggested weekly structure</span>
            <div class="week-grid">
              ${week.map(d => `<div class="week-cell"><b>${d.day}</b><span>${d.label}</span></div>`).join('')}
            </div>
          </div>
        </div>

        <div class="card card-pad">
          <span class="eyebrow">Productivity tips for you</span>
          <div class="grid g-3" style="margin-top:18px">
            ${tips(answers).map((t, i) => `<div class="value" style="background:var(--surface-2)">
              <span class="ic" aria-hidden="true" style="background:var(--accent-soft);font-size:1rem;display:grid;place-items:center">${['①', '②', '③'][i]}</span>
              <p class="small" style="color:var(--ink-2)">${P.esc(t)}</p></div>`).join('')}
          </div>
        </div>

        <div class="section-sm">
          <span class="eyebrow">Also strong for you</span>
          <div class="runner-ups">
            ${runners.map(r => `<a class="runner" href="#product/${r.slug}">
              <span class="mini">${P.plannerArt({ palette: r.palette, title: r.name, subtitle: r.category, motif: r.cover })}</span>
              <span><b>${P.esc(r.name)}</b><span>${r.score}% match · ${P.money(r.price)}</span></span>
            </a>`).join('')}
          </div>
        </div>
      </div>`;

      // Animate the ring + the number (setTimeout, so it still runs if the
      // tab was backgrounded while the result was being calculated)
      setTimeout(() => {
        const arc = $('#score-arc'), C = 2 * Math.PI * 86;
        arc.style.strokeDashoffset = C - (win.score / 100) * C;
        // Count up on animation frames, then snap to the final value — so a
        // backgrounded tab (where frames and timers are throttled) can never
        // leave the number stranded behind the ring.
        const num = $('#score-num');
        const started = performance.now(), DUR = 1100;
        let done = false;
        const finish = () => { if (!done) { done = true; num.textContent = win.score + '%'; } };
        (function tick(now) {
          if (done) return;
          const t2 = Math.min(1, (now - started) / DUR);
          const eased = 1 - Math.pow(1 - t2, 3);
          num.textContent = Math.round(win.score * eased) + '%';
          if (t2 < 1) requestAnimationFrame(tick); else finish();
        })(started);
        setTimeout(finish, DUR + 400);
      }, 60);

      $('#retake').addEventListener('click', () => {
        Object.keys(answers).forEach(k => delete answers[k]);
        step = 0; renderQuestion();
        mount.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      mount.scrollIntoView({ behavior: 'smooth', block: 'start' });
      P.toast('Match found', win.name + ' · ' + win.score + '% fit', 'ok');
    }

    // Offer to restore a previous result rather than making people redo it
    const prev = P.storage.get('plana:match', null);
    const prevBar = $('#prev-match');
    if (prev && prevBar && P.getProduct(prev.slug)) {
      const pp = P.getProduct(prev.slug);
      prevBar.hidden = false;
      prevBar.innerHTML = `<div class="note" style="justify-content:space-between;align-items:center">
        <span>Last time you matched with <b>${P.esc(pp.name)}</b> at ${prev.score}%.</span>
        <a class="btn btn-soft btn-sm" href="#product/${pp.slug}">View it</a>
      </div>`;
    }

    // Re-entering #plan?start=… from the home teaser restarts with that answer
    document.addEventListener('plana:route', e => {
      if (e.detail.name !== 'plan') return;
      if (preAnswer(e.detail.params.start)) renderQuestion();
    });

    renderQuestion();
  }

  /* ======================================================================
     B. CUSTOM PLANNER BUILDER
     ====================================================================== */
  const BUILD = {
    types: [
      { k: 'student',  l: 'Student',  d: 'Semester, assignments, revision', base: 5, sections: ['Semester Map', 'Assignments', 'Study Tracker'] },
      { k: 'work',     l: 'Work',     d: 'Projects, meetings, deep work',   base: 5.5, sections: ['Weekly Planner', 'Projects', 'Notes'] },
      { k: 'personal', l: 'Personal', d: 'Habits, home, headspace',          base: 4.25, sections: ['Habit Tracker', 'Notes', 'Mood Log'] },
      { k: 'fitness',  l: 'Fitness',  d: 'Training, meals, recovery',        base: 4.5, sections: ['Workout Log', 'Meals', 'Recovery'] },
      { k: 'business', l: 'Business', d: 'Clients, content, numbers',        base: 6.75, sections: ['Pipeline', 'Content Calendar', 'Finance'] }
    ],
    themes: ['minimal', 'pastel', 'lavender', 'sage', 'dark', 'colorful', 'clay', 'navy'],
    layouts: [
      { k: 'daily',     l: 'Daily pages',   d: 'One page per day', add: 1.25 },
      { k: 'weekly',    l: 'Weekly spread', d: 'Seven columns, one view', add: 0.75 },
      { k: 'monthly',   l: 'Monthly grid',  d: 'Zoomed out overview', add: 0 },
      { k: 'dashboard', l: 'Dashboard',     d: 'Everything on one screen', add: 1.5 }
    ],
    sections: ['Goals', 'Habit Tracker', 'Weekly Planner', 'Study Tracker', 'Finance', 'Notes',
               'Meal Planner', 'Mood Log', 'Reading List', 'Projects', 'Gratitude', 'Time Blocks'],
    motifs: [
      { k: 'arch', l: 'Arch' }, { k: 'grid', l: 'Grid' }, { k: 'lines', l: 'Lines' }, { k: 'dots', l: 'Dots' }
    ],
    structures: [
      { k: 'mon', l: 'Week starts Monday' },
      { k: 'sun', l: 'Week starts Sunday' },
      { k: 'flex', l: 'Undated / flexible' }
    ]
  };

  function initBuilder() {
    const panel = $('#build-panel'); if (!panel) return;

    const routeParams = () => (P.parseHash ? P.parseHash().params : {});
    const seed = P.getProduct(routeParams().from);

    const cfg = {
      type: 'student',
      theme: seed ? seed.palette : 'lavender',
      layout: seed ? (BUILD.layouts.some(l => l.k === seed.layout) ? seed.layout : 'weekly') : 'weekly',
      motif: seed ? seed.cover : 'arch',
      structure: 'mon',
      name: seed ? 'My ' + seed.name.replace(/^The\s+/, '') : 'My Planner',
      goal: '',
      sections: seed ? seed.sections.slice(0, 4) : ['Goals', 'Habit Tracker', 'Weekly Planner', 'Notes'],
      view: 'cover'
    };
    if (seed && !BUILD.sections.includes(cfg.sections[0])) {
      cfg.sections = cfg.sections.filter(s => BUILD.sections.includes(s));
      if (!cfg.sections.length) cfg.sections = ['Goals', 'Notes'];
    }

    /* ---- pricing model: transparent and rule-based ---- */
    function pricing() {
      const type = BUILD.types.find(t => t.k === cfg.type);
      const layout = BUILD.layouts.find(l => l.k === cfg.layout);
      const included = 3;
      const extras = Math.max(0, cfg.sections.length - included);
      const rows = [
        { l: type.l + ' base file', v: type.base },
        { l: layout.l + ' layout', v: layout.add },
        { l: `${extras} extra section${extras === 1 ? '' : 's'} (${included} included)`, v: extras * 0.5 },
        { l: cfg.theme === 'dark' ? 'Dark + light versions' : 'Colour theme', v: cfg.theme === 'dark' ? 0.75 : 0 }
      ];
      const total = rows.reduce((s, r) => s + r.v, 0);
      return { rows, total, pages: 48 + cfg.sections.length * 14 + (cfg.layout === 'daily' ? 120 : cfg.layout === 'weekly' ? 52 : 12) };
    }

    /* ---- panel markup ---- */
    panel.innerHTML = `
      <div class="build-group">
        <header><span class="step-n">1</span><h3>Planner type</h3></header>
        <div class="tile-opts" id="b-types">
          ${BUILD.types.map(t => `<label class="opt">
            <input type="radio" name="b-type" value="${t.k}" ${cfg.type === t.k ? 'checked' : ''}>
            <span class="mark" aria-hidden="true"></span>
            <span class="opt-text"><b>${t.l}</b><span>${t.d}</span></span>
          </label>`).join('')}
        </div>
      </div>

      <div class="build-group">
        <header><span class="step-n">2</span><h3>Colour theme</h3></header>
        <div class="swatches" id="b-themes">
          ${BUILD.themes.map(t => {
            const pal = P.PALETTES[t];
            return `<label class="swatch">
              <input type="radio" name="b-theme" value="${t}" ${cfg.theme === t ? 'checked' : ''}>
              <span class="chipc" aria-hidden="true">
                <span style="background:${pal.bg}"></span><span style="background:${pal.a1}"></span>
                <span style="background:${pal.a2}"></span><span style="background:${pal.a3}"></span>
              </span>
              <small>${pal.label}</small>
            </label>`;
          }).join('')}
        </div>
      </div>

      <div class="build-group">
        <header><span class="step-n">3</span><h3>Layout</h3></header>
        <div class="tile-opts" id="b-layouts">
          ${BUILD.layouts.map(l => `<label class="opt">
            <input type="radio" name="b-layout" value="${l.k}" ${cfg.layout === l.k ? 'checked' : ''}>
            <span class="mark" aria-hidden="true"></span>
            <span class="opt-text"><b>${l.l}</b><span>${l.d}${l.add ? ' · +' + P.money(l.add) : ''}</span></span>
          </label>`).join('')}
        </div>
      </div>

      <div class="build-group">
        <header><span class="step-n">4</span><h3>Sections <span class="muted small" style="font-weight:400">— first 3 included</span></h3></header>
        <div class="tile-opts" id="b-sections">
          ${BUILD.sections.map(s => `<label class="opt">
            <input type="checkbox" name="b-section" value="${s}" ${cfg.sections.includes(s) ? 'checked' : ''}>
            <span class="mark" aria-hidden="true"></span>
            <span class="opt-text"><b>${s}</b></span>
          </label>`).join('')}
        </div>
        <p class="xs muted" style="margin-top:12px" id="sec-count"></p>
      </div>

      <div class="build-group">
        <header><span class="step-n">5</span><h3>Structure &amp; cover</h3></header>
        <div class="grid g-2" style="gap:16px">
          <div class="field">
            <label for="b-structure">Weekly structure</label>
            <select class="select" id="b-structure">
              ${BUILD.structures.map(s => `<option value="${s.k}" ${cfg.structure === s.k ? 'selected' : ''}>${s.l}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="b-motif">Cover style</label>
            <select class="select" id="b-motif">
              ${BUILD.motifs.map(m => `<option value="${m.k}" ${cfg.motif === m.k ? 'selected' : ''}>${m.l}</option>`).join('')}
            </select>
          </div>
          <div class="field" style="grid-column:1/-1">
            <label for="b-name">Cover title</label>
            <input class="input" id="b-name" maxlength="34" value="${P.esc(cfg.name)}" data-rules="required|min3">
            <span class="field-error" aria-live="polite"></span>
          </div>
          <div class="field" style="grid-column:1/-1">
            <label for="b-goal">Your focus this season <span class="muted" style="font-weight:400">(optional — printed on the first page)</span></label>
            <input class="input" id="b-goal" maxlength="60" placeholder="e.g. Finish the semester without all-nighters" value="${P.esc(cfg.goal)}">
          </div>
        </div>
      </div>`;

    /* ---- live preview ---- */
    const stage = $('#preview-stage');
    const meta = $('#preview-meta');
    const breakdown = $('#price-break');

    function art() {
      const shared = { palette: cfg.theme, sections: cfg.sections, motif: cfg.motif };
      if (cfg.view === 'cover') return P.plannerArt(Object.assign({ title: cfg.name, subtitle: BUILD.types.find(t => t.k === cfg.type).l }, shared));
      if (cfg.view === 'sections') return P.plannerArt(Object.assign({ kind: 'sections' }, shared));
      const leftMap = { daily: 'notes', weekly: 'weekly', monthly: 'monthly', dashboard: 'sections' };
      return P.plannerArt(Object.assign({ kind: 'spread', left: leftMap[cfg.layout], right: cfg.sections.includes('Habit Tracker') ? 'habit' : 'notes' }, shared));
    }

    function paint(flash) {
      const pr = pricing();
      stage.innerHTML = art();
      if (flash) { stage.classList.remove('flash'); void stage.offsetWidth; stage.classList.add('flash'); }
      meta.innerHTML = `
        <div>
          <b style="font-family:var(--font-display);font-size:1.25rem">${P.esc(cfg.name)}</b>
          <div class="xs muted">${BUILD.types.find(t => t.k === cfg.type).l} · ${BUILD.layouts.find(l => l.k === cfg.layout).l} · ~${pr.pages} pages</div>
        </div>
        <span class="price">${P.money(pr.total)}</span>`;
      breakdown.innerHTML = pr.rows.map(r => `<div><span>${P.esc(r.l)}</span><span class="tabular">${r.v ? P.money(r.v) : 'Included'}</span></div>`).join('')
        + `<div class="total"><span>Your planner</span><span class="tabular">${P.money(pr.total)}</span></div>`;
      $('#sec-count').textContent = `${cfg.sections.length} selected · ${cfg.sections.join(', ') || 'none yet'}`;
      $$('#chosen-sections').forEach(el => {
        el.innerHTML = cfg.sections.length
          ? cfg.sections.map(s => `<span class="pill-tag">${P.esc(s)}</span>`).join('')
          : '<span class="xs muted">Pick at least one section to build your planner.</span>';
      });
      const addBtn = $('#build-add');
      if (addBtn) addBtn.textContent = `Add to cart · ${P.money(pr.total)}`;
    }

    /* ---- wire the controls ---- */
    panel.addEventListener('change', e => {
      const t = e.target;
      if (t.name === 'b-type') {
        cfg.type = t.value;
        // suggest the sections that belong to this planner type, without wiping choices
        BUILD.types.find(x => x.k === t.value).sections.forEach(s => {
          if (BUILD.sections.includes(s) && !cfg.sections.includes(s)) cfg.sections.push(s);
        });
        $$('#b-sections input').forEach(i => { i.checked = cfg.sections.includes(i.value); });
      }
      if (t.name === 'b-theme') cfg.theme = t.value;
      if (t.name === 'b-layout') cfg.layout = t.value;
      if (t.name === 'b-section') {
        if (t.checked) cfg.sections.push(t.value);
        else cfg.sections = cfg.sections.filter(s => s !== t.value);
      }
      if (t.id === 'b-structure') cfg.structure = t.value;
      if (t.id === 'b-motif') cfg.motif = t.value;
      paint(true);
      save();
    });
    panel.addEventListener('input', e => {
      if (e.target.id === 'b-name') { cfg.name = e.target.value || 'My Planner'; paint(false); save(); }
      if (e.target.id === 'b-goal') { cfg.goal = e.target.value; save(); }
    });

    $$('[data-view-btn]').forEach(btn => btn.addEventListener('click', () => {
      cfg.view = btn.dataset.viewBtn;
      $$('[data-view-btn]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      paint(true);
    }));

    function save() { P.storage.set('plana:build', cfg); }

    /* ---- add the finished planner to the cart ---- */
    const addBtn = $('#build-add');
    if (addBtn) addBtn.addEventListener('click', () => {
      const nameInput = $('#b-name');
      if (!P.validateField(nameInput)) { P.toast('Name your planner', 'A cover title of at least 3 characters.', 'err'); nameInput.focus(); return; }
      if (!cfg.sections.length) { P.toast('Pick a section', 'A planner needs at least one section.', 'err'); return; }
      addBtn.classList.add('is-loading');
      setTimeout(() => {
        addBtn.classList.remove('is-loading');
        P.store.add({
          key: 'custom-' + Date.now().toString(36),
          name: cfg.name, price: pricing().total, palette: cfg.theme, motif: cfg.motif,
          sections: cfg.sections.slice(), themeLabel: P.PALETTES[cfg.theme].label,
          type: cfg.type, layout: cfg.layout, structure: cfg.structure, goal: cfg.goal
        });
        P.toast('Custom planner added', cfg.name + ' · ' + cfg.sections.length + ' sections', 'ok');
        P.openCart();
      }, 480);
    });

    const resetBtn = $('#build-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => {
      P.storage.remove('plana:build');
      Object.assign(cfg, { type: 'student', theme: 'lavender', layout: 'weekly', motif: 'arch',
        structure: 'mon', name: 'My Planner', goal: '', sections: ['Goals', 'Habit Tracker', 'Weekly Planner', 'Notes'] });
      syncInputs(); paint(true);
      P.toast('Builder reset', 'Back to the default planner.', 'info');
    });

    /** Push the current config back into the form controls. */
    function syncInputs() {
      $$('input[name="b-type"]').forEach(i => { i.checked = i.value === cfg.type; });
      $$('input[name="b-theme"]').forEach(i => { i.checked = i.value === cfg.theme; });
      $$('input[name="b-layout"]').forEach(i => { i.checked = i.value === cfg.layout; });
      $$('input[name="b-section"]').forEach(i => { i.checked = cfg.sections.includes(i.value); });
      $('#b-structure').value = cfg.structure; $('#b-motif').value = cfg.motif;
      $('#b-name').value = cfg.name; $('#b-goal').value = cfg.goal || '';
    }

    /* A product's own section names do not all exist in the builder, so a
       seeded build is topped up to a usable starting point. */
    const TYPE_BY_CATEGORY = {
      'Study Planners': 'student', 'Notion Templates': 'work', 'Productivity': 'work',
      'Wellness': 'fitness', 'Journals': 'personal', 'Calendars': 'personal',
      'Printables': 'personal', 'Stationery': 'personal'
    };
    const TOP_UP = ['Goals', 'Habit Tracker', 'Weekly Planner', 'Notes'];

    /** "Customise it" on a product or a match result seeds the builder. */
    function seedFrom(product) {
      cfg.type = product.tags.includes('business') ? 'business' : (TYPE_BY_CATEGORY[product.category] || 'personal');
      cfg.theme = product.palette;
      cfg.layout = BUILD.layouts.some(l => l.k === product.layout) ? product.layout : 'weekly';
      cfg.motif = product.cover;
      cfg.name = 'My ' + product.name.replace(/^The\s+/, '').split('—')[0].trim();
      const secs = product.sections.filter(x => BUILD.sections.includes(x));
      const typeSecs = BUILD.types.find(t => t.k === cfg.type).sections.filter(x => BUILD.sections.includes(x));
      cfg.sections = [...new Set([...secs, ...typeSecs, ...TOP_UP])].slice(0, Math.max(4, secs.length));
      syncInputs(); paint(true); save();
      P.toast('Starting from ' + product.name, 'Change anything you like.', 'info');
    }

    // Restore a previous build (unless the builder was opened from a product)
    if (!seed) {
      const saved = P.storage.get('plana:build', null);
      if (saved && saved.sections) { Object.assign(cfg, saved); syncInputs(); }
    } else {
      seedFrom(seed);
    }

    document.addEventListener('plana:route', e => {
      if (e.detail.name !== 'customize') return;
      const from = P.getProduct(e.detail.params.from);
      if (from) seedFrom(from);
    });

    paint(false);
  }

  /* ---- boot ---- */
  document.addEventListener('DOMContentLoaded', () => { initMatch(); initBuilder(); });

  // exported for reuse / testing
  Object.assign(P, { scoreProducts, QUESTIONS, BUILD });
})();
