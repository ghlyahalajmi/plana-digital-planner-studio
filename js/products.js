/* ==========================================================================
   PLANA — products.js
   Catalogue data, SVG mockup engine, and rendering for Shop + Product pages.
   No images are shipped with this project: every planner "photo" is a vector
   mockup generated at runtime from the product's own palette + layout data.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. PALETTES — reusable colour stories used by products and the builder
   -------------------------------------------------------------------------- */
const PALETTES = {
  minimal:  { bg: '#F3F0EA', card: '#FFFFFF', ink: '#2A2724', a1: '#C9C2B6', a2: '#E7E1D7', a3: '#8C8478', label: 'Minimal' },
  pastel:   { bg: '#F7EFF3', card: '#FFFDFE', ink: '#4A3B41', a1: '#E3B7C0', a2: '#C9C0E8', a3: '#A8C8C4', label: 'Pastel' },
  lavender: { bg: '#F0EDF8', card: '#FFFFFF', ink: '#332E47', a1: '#9C8FC7', a2: '#CFC6EA', a3: '#E0B7C4', label: 'Lavender' },
  sage:     { bg: '#EDF2EA', card: '#FFFFFF', ink: '#2C352A', a1: '#92A98D', a2: '#C6D6C0', a3: '#D8C7A5', label: 'Sage' },
  dark:     { bg: '#1E1C22', card: '#2A2731', ink: '#F2EEE8', a1: '#B3A6E0', a2: '#3A3546', a3: '#D9AF7E', label: 'Dark' },
  colorful: { bg: '#FDF3E7', card: '#FFFFFF', ink: '#33291F', a1: '#E88B6A', a2: '#6FA8B5', a3: '#F0C36D', label: 'Colorful' },
  clay:     { bg: '#F6EDE6', card: '#FFFFFF', ink: '#3A2E27', a1: '#C98F73', a2: '#E8D4C6', a3: '#8FA3A8', label: 'Clay' },
  navy:     { bg: '#ECEFF5', card: '#FFFFFF', ink: '#232B3D', a1: '#5A6A96', a2: '#C3CCE2', a3: '#D3A98C', label: 'Navy' }
};

/* --------------------------------------------------------------------------
   2. CATALOGUE
   `match` holds the weights (0–5) used by the PLANA MATCH algorithm.
   -------------------------------------------------------------------------- */
const PRODUCTS = [
  {
    id: 'p01', slug: 'balanced-student-planner', name: 'The Balanced Student Planner',
    category: 'Study Planners', price: 5.5, oldPrice: 8, rating: 4.9, reviews: 412, badge: 'popular',
    short: 'Semester overview, class schedule and a gentle habit system in one file.',
    description: 'Built with students who burn out by week six in mind. The Balanced Student Planner pairs a full semester map with light-touch weekly pages, so you always know what is coming without over-planning every hour. Assignment trackers, exam countdowns and a rest planner sit side by side — because balance is a system, not a mood.',
    pages: 148, format: 'PDF · GoodNotes · Notability', compat: 'iPad, Android tablet, Windows, printable A4/A5',
    includes: ['Semester + term overview spreads', 'Hyperlinked tabs and month index', 'Assignment & exam tracker', 'Weekly study/rest balance page', 'Habit tracker (5 habits)', '3 colour variants included'],
    sections: ['Semester Map', 'Weekly Planner', 'Assignments', 'Habit Tracker', 'Notes', 'Rest Planner'],
    tags: ['student', 'balance', 'semester'], palette: 'lavender', cover: 'arch', layout: 'weekly',
    match: { purpose: { university: 5, work: 2, personal: 3, fitness: 1, business: 1 },
             challenge: { time: 4, organization: 4, motivation: 3, goals: 3, balance: 5 },
             style: { minimal: 3, detailed: 4, visual: 3, flexible: 4 },
             cadence: { daily: 3, weekly: 5, monthly: 3 } }
  },
  {
    id: 'p02', slug: 'focused-student-planner', name: 'The Focused Student Planner',
    category: 'Study Planners', price: 6.75, oldPrice: null, rating: 4.8, reviews: 288, badge: 'new',
    short: 'Deep-work timetables, revision cycles and a spaced-repetition log.',
    description: 'For the student who wants fewer, better study hours. Daily deep-work blocks, a spaced-repetition revision log and a distraction audit turn vague "study more" goals into a repeatable weekly loop you can actually finish before midnight.',
    pages: 186, format: 'PDF · GoodNotes · Notability', compat: 'iPad, Android tablet, printable A4',
    includes: ['Daily deep-work timetable', 'Spaced-repetition revision log', 'Lecture note templates', 'Exam countdown dashboard', 'Distraction audit sheet', 'Printable A4 + A5 versions'],
    sections: ['Daily Timetable', 'Revision Log', 'Lecture Notes', 'Exam Countdown', 'Goals', 'Focus Audit'],
    tags: ['student', 'focus', 'exams'], palette: 'navy', cover: 'grid', layout: 'daily',
    match: { purpose: { university: 5, work: 3, personal: 1, fitness: 1, business: 2 },
             challenge: { time: 5, organization: 4, motivation: 3, goals: 4, balance: 2 },
             style: { minimal: 4, detailed: 5, visual: 2, flexible: 2 },
             cadence: { daily: 5, weekly: 4, monthly: 2 } }
  },
  {
    id: 'p03', slug: 'quiet-minimal-planner', name: 'Quiet — Minimal Daily Planner',
    category: 'Productivity', price: 4.5, oldPrice: null, rating: 4.7, reviews: 519, badge: null,
    short: 'One page a day. Three priorities. Nothing else competing for attention.',
    description: 'Quiet strips planning back to what survives a busy day: three priorities, a short schedule strip and space to think. Type-led, monochrome, and deliberately empty — the page never asks you to fill it.',
    pages: 96, format: 'PDF · GoodNotes · Notion', compat: 'Any PDF reader, printable A5',
    includes: ['365 undated daily pages', 'Three-priority framework', 'Light schedule strip', 'Weekly reset page', 'Notion companion board'],
    sections: ['Daily Page', 'Priorities', 'Weekly Reset', 'Notes'],
    tags: ['minimal', 'daily', 'focus'], palette: 'minimal', cover: 'lines', layout: 'daily',
    match: { purpose: { university: 2, work: 4, personal: 5, fitness: 2, business: 3 },
             challenge: { time: 4, organization: 3, motivation: 2, goals: 2, balance: 4 },
             style: { minimal: 5, detailed: 1, visual: 1, flexible: 4 },
             cadence: { daily: 5, weekly: 2, monthly: 1 } }
  },
  {
    id: 'p04', slug: 'notion-life-os', name: 'Notion Life OS',
    category: 'Notion Templates', price: 10.5, oldPrice: 14.5, rating: 5.0, reviews: 731, badge: 'popular',
    short: 'A connected Notion workspace for goals, projects, habits and study.',
    description: 'Nine linked databases, one dashboard. Life OS connects yearly goals to quarterly outcomes, weekly reviews and daily tasks, so nothing you care about lives in an orphaned list. Includes a guided 20-minute setup walkthrough and a duplicate-and-go link.',
    pages: 9, format: 'Notion template (duplicate link)', compat: 'Notion free & paid plans, web + mobile',
    includes: ['9 linked databases', 'Yearly → weekly goal cascade', 'Habit streak dashboard', 'Study & reading library', 'Weekly review automation', '20-minute setup walkthrough'],
    sections: ['Dashboard', 'Goals', 'Projects', 'Habit Tracker', 'Weekly Review', 'Library'],
    tags: ['notion', 'system', 'goals'], palette: 'dark', cover: 'dots', layout: 'dashboard',
    match: { purpose: { university: 3, work: 5, personal: 4, fitness: 3, business: 5 },
             challenge: { time: 3, organization: 5, motivation: 3, goals: 5, balance: 3 },
             style: { minimal: 2, detailed: 5, visual: 3, flexible: 4 },
             cadence: { daily: 3, weekly: 5, monthly: 4 } }
  },
  {
    id: 'p05', slug: 'notion-student-hub', name: 'Notion Student Hub',
    category: 'Notion Templates', price: 8, oldPrice: null, rating: 4.8, reviews: 344, badge: 'new',
    short: 'Courses, deadlines, notes and GPA tracking in a single dashboard.',
    description: 'Every course gets a home: syllabus, lecture notes, deadlines and grades roll up into one semester dashboard with an at-a-glance GPA calculator and a "what is due this week" view that updates itself.',
    pages: 7, format: 'Notion template (duplicate link)', compat: 'Notion free & paid plans',
    includes: ['Course & syllabus database', 'Deadline rollups by week', 'GPA calculator', 'Lecture note template', 'Reading tracker', 'Exam revision board'],
    sections: ['Semester Dashboard', 'Courses', 'Deadlines', 'Notes', 'Grades', 'Revision'],
    tags: ['notion', 'student', 'grades'], palette: 'sage', cover: 'dots', layout: 'dashboard',
    match: { purpose: { university: 5, work: 2, personal: 2, fitness: 1, business: 2 },
             challenge: { time: 3, organization: 5, motivation: 2, goals: 4, balance: 3 },
             style: { minimal: 2, detailed: 5, visual: 3, flexible: 3 },
             cadence: { daily: 2, weekly: 4, monthly: 4 } }
  },
  {
    id: 'p06', slug: 'momentum-habit-tracker', name: 'Momentum Habit Tracker',
    category: 'Productivity', price: 3.75, oldPrice: 5, rating: 4.6, reviews: 602, badge: 'sale',
    short: 'Streaks, gentle restarts and a monthly reflection that keeps you going.',
    description: 'Momentum is built around restarting well, not perfect streaks. Track up to twelve habits, see your consistency as colour, and end each month with a two-minute reflection that decides what stays and what goes.',
    pages: 64, format: 'PDF · GoodNotes · printable', compat: 'iPad, printable A4/A5/Letter',
    includes: ['12-habit monthly grids', 'Streak & consistency chart', 'Restart pages (no guilt)', 'Monthly reflection prompts', 'Mood + energy log'],
    sections: ['Habit Grid', 'Streaks', 'Mood Log', 'Monthly Reflection'],
    tags: ['habits', 'motivation', 'tracker'], palette: 'pastel', cover: 'grid', layout: 'tracker',
    match: { purpose: { university: 3, work: 3, personal: 5, fitness: 5, business: 2 },
             challenge: { time: 2, organization: 2, motivation: 5, goals: 4, balance: 4 },
             style: { minimal: 3, detailed: 2, visual: 5, flexible: 4 },
             cadence: { daily: 5, weekly: 3, monthly: 4 } }
  },
  {
    id: 'p07', slug: 'clarity-goal-journal', name: 'Clarity Goal Journal',
    category: 'Journals', price: 5.75, oldPrice: null, rating: 4.9, reviews: 267, badge: null,
    short: 'Quarterly goal setting with weekly check-ins and honest reviews.',
    description: 'A journal for people who set goals in January and lose them by March. Clarity breaks the year into four workable quarters, each with a written intention, three measurable outcomes, weekly check-ins and a review that asks the uncomfortable questions.',
    pages: 120, format: 'PDF · GoodNotes · printable', compat: 'iPad, printable A5',
    includes: ['4 quarterly goal maps', 'Weekly check-in spreads', 'Obstacle & support planner', 'Quarter review prompts', 'Year-in-review pages'],
    sections: ['Quarter Map', 'Goals', 'Weekly Check-in', 'Reflection', 'Notes'],
    tags: ['goals', 'journal', 'reflection'], palette: 'clay', cover: 'arch', layout: 'journal',
    match: { purpose: { university: 3, work: 4, personal: 5, fitness: 3, business: 4 },
             challenge: { time: 2, organization: 3, motivation: 4, goals: 5, balance: 4 },
             style: { minimal: 3, detailed: 3, visual: 2, flexible: 4 },
             cadence: { daily: 1, weekly: 4, monthly: 5 } }
  },
  {
    id: 'p08', slug: 'deepwork-weekly-planner', name: 'Deep Work Weekly Planner',
    category: 'Productivity', price: 6.5, oldPrice: null, rating: 4.8, reviews: 195, badge: null,
    short: 'Time-blocked weeks for people whose calendar keeps eating their work.',
    description: 'A weekly spread designed around protected blocks: two deep-work sessions a day, a shallow-work bucket, and an end-of-week audit that shows exactly where the hours actually went.',
    pages: 132, format: 'PDF · GoodNotes · Notability', compat: 'iPad, Windows, printable A4',
    includes: ['Time-blocked weekly spreads', 'Deep/shallow work split', 'Meeting load tracker', 'Weekly hour audit', 'Quarterly planning pages'],
    sections: ['Weekly Blocks', 'Priorities', 'Meetings', 'Hour Audit', 'Notes'],
    tags: ['work', 'time', 'focus'], palette: 'navy', cover: 'lines', layout: 'weekly',
    match: { purpose: { university: 3, work: 5, personal: 2, fitness: 1, business: 4 },
             challenge: { time: 5, organization: 4, motivation: 2, goals: 3, balance: 3 },
             style: { minimal: 3, detailed: 5, visual: 2, flexible: 2 },
             cadence: { daily: 4, weekly: 5, monthly: 2 } }
  },
  {
    id: 'p09', slug: 'pastel-monthly-calendar', name: 'Pastel Monthly Calendar Set',
    category: 'Calendars', price: 2.75, oldPrice: 4.25, rating: 4.5, reviews: 830, badge: 'sale',
    short: 'Twelve dated months plus an undated set, in four soft colourways.',
    description: 'Clean monthly grids with generous cells, a side column for the month\'s focus, and four colourways that match the rest of the PLANA library. Dated 2026 and undated versions included.',
    pages: 40, format: 'PDF · PNG · printable', compat: 'Print, tablet, desktop wallpaper sizes',
    includes: ['12 dated months (2026)', '12 undated months', '4 colourways', 'Wallpaper sizes (desktop + phone)', 'A4, A5 and Letter'],
    sections: ['Monthly Grid', 'Month Focus', 'Notes'],
    tags: ['calendar', 'printable', 'monthly'], palette: 'pastel', cover: 'grid', layout: 'monthly',
    match: { purpose: { university: 3, work: 3, personal: 4, fitness: 2, business: 2 },
             challenge: { time: 3, organization: 4, motivation: 1, goals: 2, balance: 3 },
             style: { minimal: 4, detailed: 1, visual: 4, flexible: 3 },
             cadence: { daily: 1, weekly: 2, monthly: 5 } }
  },
  {
    id: 'p10', slug: 'budget-finance-tracker', name: 'Budget & Finance Tracker',
    category: 'Productivity', price: 5.25, oldPrice: null, rating: 4.7, reviews: 221, badge: null,
    short: 'Monthly budgets, savings goals and a spending review that adds itself up.',
    description: 'A finance workbook for real life: monthly budget sheets, a savings-goal thermometer, subscription audit, and a spreadsheet companion with formulas already written so the totals maintain themselves.',
    pages: 72, format: 'PDF · XLSX · Google Sheets', compat: 'Excel, Google Sheets, printable A4',
    includes: ['Monthly budget sheets', 'Savings goal trackers', 'Subscription audit', 'Debt payoff planner', 'Spreadsheet with formulas'],
    sections: ['Budget', 'Savings', 'Spending Log', 'Subscriptions', 'Review'],
    tags: ['finance', 'budget', 'money'], palette: 'sage', cover: 'grid', layout: 'tracker',
    match: { purpose: { university: 2, work: 3, personal: 5, fitness: 1, business: 5 },
             challenge: { time: 1, organization: 5, motivation: 2, goals: 4, balance: 3 },
             style: { minimal: 3, detailed: 5, visual: 2, flexible: 2 },
             cadence: { daily: 1, weekly: 3, monthly: 5 } }
  },
  {
    id: 'p11', slug: 'strong-fitness-planner', name: 'Strong — Fitness & Wellness Planner',
    category: 'Wellness', price: 5, oldPrice: null, rating: 4.6, reviews: 178, badge: 'new',
    short: 'Training splits, progress logs and recovery tracking that respects rest.',
    description: 'Plan a training week you can repeat: split templates, progressive-overload logs, hydration and sleep tracking, and a recovery page that treats rest days as part of the programme rather than a failure.',
    pages: 88, format: 'PDF · GoodNotes · printable', compat: 'iPad, phone, printable A5',
    includes: ['Training split templates', 'Progressive overload logs', 'Body & energy check-ins', 'Meal planning pages', 'Sleep & recovery tracker'],
    sections: ['Training Split', 'Workout Log', 'Meals', 'Recovery', 'Goals'],
    tags: ['fitness', 'wellness', 'health'], palette: 'clay', cover: 'arch', layout: 'tracker',
    match: { purpose: { university: 1, work: 1, personal: 4, fitness: 5, business: 1 },
             challenge: { time: 2, organization: 3, motivation: 5, goals: 5, balance: 4 },
             style: { minimal: 2, detailed: 4, visual: 4, flexible: 3 },
             cadence: { daily: 5, weekly: 4, monthly: 2 } }
  },
  {
    id: 'p12', slug: 'studio-business-planner', name: 'Studio — Small Business Planner',
    category: 'Productivity', price: 8.75, oldPrice: 11.5, rating: 4.9, reviews: 143, badge: 'popular',
    short: 'Client pipeline, content calendar and monthly numbers for solo founders.',
    description: 'Everything a one-person studio needs to stop working from the inbox: a client pipeline, project trackers, a content calendar, and a monthly numbers page that turns invoices into a picture of the year.',
    pages: 164, format: 'PDF · Notion · XLSX', compat: 'Notion, Excel, iPad, printable A4',
    includes: ['Client pipeline board', 'Project & delivery trackers', '90-day content calendar', 'Monthly numbers dashboard', 'Invoice & expense log', 'Offer planning worksheets'],
    sections: ['Pipeline', 'Projects', 'Content Calendar', 'Numbers', 'Goals', 'Notes'],
    tags: ['business', 'freelance', 'clients'], palette: 'dark', cover: 'dots', layout: 'dashboard',
    match: { purpose: { university: 1, work: 4, personal: 1, fitness: 1, business: 5 },
             challenge: { time: 4, organization: 5, motivation: 3, goals: 5, balance: 3 },
             style: { minimal: 2, detailed: 5, visual: 3, flexible: 3 },
             cadence: { daily: 2, weekly: 5, monthly: 5 } }
  },
  {
    id: 'p13', slug: 'softlight-journal', name: 'Softlight Gratitude Journal',
    category: 'Journals', price: 4, oldPrice: null, rating: 4.8, reviews: 396, badge: null,
    short: 'Five quiet minutes a day: prompts, mood colour, and a weekly kindness page.',
    description: 'A gentle daily journal with morning and evening prompts, a mood colour strip, and weekly pages for the small things worth remembering. Designed to be finished, not to be perfect.',
    pages: 110, format: 'PDF · GoodNotes · printable', compat: 'iPad, phone, printable A5',
    includes: ['Morning & evening prompts', 'Mood colour strip', 'Weekly kindness page', 'Monthly memory spread', 'Undated — start any day'],
    sections: ['Daily Prompts', 'Mood Log', 'Weekly Memories', 'Reflection'],
    tags: ['journal', 'wellness', 'gratitude'], palette: 'pastel', cover: 'arch', layout: 'journal',
    match: { purpose: { university: 2, work: 1, personal: 5, fitness: 3, business: 1 },
             challenge: { time: 1, organization: 1, motivation: 5, goals: 2, balance: 5 },
             style: { minimal: 4, detailed: 1, visual: 4, flexible: 5 },
             cadence: { daily: 5, weekly: 3, monthly: 2 } }
  },
  {
    id: 'p14', slug: 'stationery-sticker-kit', name: 'Digital Stationery & Sticker Kit',
    category: 'Stationery', price: 3.5, oldPrice: null, rating: 4.7, reviews: 512, badge: null,
    short: '480 pre-cropped stickers, washi tapes and paper textures for any planner.',
    description: 'A kit that makes any planner feel like yours: 480 pre-cropped PNG stickers, 24 washi tapes, 12 paper textures and a set of header banners — all colour-matched to the PLANA palettes.',
    pages: 480, format: 'PNG · GoodNotes sticker book', compat: 'GoodNotes, Notability, Canva, Procreate',
    includes: ['480 pre-cropped PNG stickers', '24 washi tape strips', '12 paper textures', 'Header & date banners', 'GoodNotes sticker book file'],
    sections: ['Stickers', 'Washi', 'Textures', 'Banners'],
    tags: ['stationery', 'stickers', 'decor'], palette: 'colorful', cover: 'dots', layout: 'kit',
    match: { purpose: { university: 4, work: 2, personal: 4, fitness: 2, business: 2 },
             challenge: { time: 1, organization: 2, motivation: 4, goals: 1, balance: 2 },
             style: { minimal: 1, detailed: 2, visual: 5, flexible: 5 },
             cadence: { daily: 3, weekly: 3, monthly: 3 } }
  },
  {
    id: 'p15', slug: 'printable-desk-set', name: 'Printable Desk Set',
    category: 'Printables', price: 2.5, oldPrice: 3.75, rating: 4.4, reviews: 289, badge: 'sale',
    short: 'To-do pads, weekly dashboards and meal planners, ready to print.',
    description: 'Nine printable sheets that live next to a laptop: daily to-do pads, a weekly dashboard, meal planner, grocery list, and a project one-pager. Print once, refill forever.',
    pages: 9, format: 'PDF · print-ready', compat: 'A4, A5 and US Letter',
    includes: ['Daily to-do pad', 'Weekly dashboard', 'Meal planner + grocery list', 'Project one-pager', 'Ink-friendly versions'],
    sections: ['To-Do', 'Weekly Dashboard', 'Meals', 'Projects'],
    tags: ['printable', 'todo', 'desk'], palette: 'minimal', cover: 'lines', layout: 'weekly',
    match: { purpose: { university: 3, work: 4, personal: 4, fitness: 2, business: 3 },
             challenge: { time: 3, organization: 4, motivation: 2, goals: 2, balance: 3 },
             style: { minimal: 5, detailed: 2, visual: 2, flexible: 4 },
             cadence: { daily: 4, weekly: 5, monthly: 1 } }
  },
  {
    id: 'p16', slug: 'academic-year-bundle', name: 'Academic Year Mega Bundle',
    category: 'Study Planners', price: 12, oldPrice: 20.5, rating: 5.0, reviews: 154, badge: 'popular',
    short: 'Four best-selling student files bundled at 42% off.',
    description: 'The complete student stack: Balanced Student Planner, Focused Student Planner, Notion Student Hub and the Sticker Kit — bundled together for the whole academic year, with a shared colour system so everything matches.',
    pages: 820, format: 'PDF · Notion · PNG', compat: 'iPad, Notion, printable A4/A5',
    includes: ['Balanced Student Planner', 'Focused Student Planner', 'Notion Student Hub', 'Sticker & stationery kit', 'Bonus: exam survival guide', 'Lifetime free updates'],
    sections: ['Semester Map', 'Daily Timetable', 'Assignments', 'Revision Log', 'Habit Tracker', 'Stickers'],
    tags: ['bundle', 'student', 'value'], palette: 'lavender', cover: 'grid', layout: 'dashboard',
    match: { purpose: { university: 5, work: 2, personal: 2, fitness: 1, business: 1 },
             challenge: { time: 4, organization: 5, motivation: 4, goals: 4, balance: 4 },
             style: { minimal: 2, detailed: 5, visual: 4, flexible: 3 },
             cadence: { daily: 4, weekly: 5, monthly: 4 } }
  }
];

const CATEGORIES = ['Study Planners', 'Productivity', 'Notion Templates', 'Journals', 'Calendars', 'Wellness', 'Printables', 'Stationery'];

/* --------------------------------------------------------------------------
   3. SVG MOCKUP ENGINE
   Every product visual is drawn from data — no image files, infinitely
   themable, and it stays crisp at any size. `plannerArt()` is shared by the
   shop cards, the product gallery, the cart and the custom planner builder.
   -------------------------------------------------------------------------- */

/** Greedy word-wrap for SVG <text>, which has no automatic wrapping. */
function wrapWords(text, maxChars, maxLines) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if (!line.length) { line = w; continue; }
    if ((line + ' ' + w).length <= maxChars) line += ' ' + w;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/\s+\S*$/, '') + '…';
    return kept;
  }
  return lines;
}

function esc(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Decorative motif drawn on the cover. */
function coverMotif(motif, pal, x, y, w, h) {
  const cx = x + w / 2;
  switch (motif) {
    case 'arch':
      return `
        <path d="M ${cx - 42} ${y + h * 0.62} v -${h * 0.20} a 42 42 0 0 1 84 0 v ${h * 0.20} z" fill="${pal.a1}" opacity=".9"/>
        <circle cx="${cx}" cy="${y + h * 0.30}" r="16" fill="${pal.bg}" opacity=".85"/>
        <rect x="${cx - 42}" y="${y + h * 0.62}" width="84" height="4" rx="2" fill="${pal.a3}" opacity=".7"/>`;
    case 'grid': {
      let g = '';
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        const on = (r + c) % 3 === 0;
        g += `<rect x="${cx - 44 + c * 24}" y="${y + h * 0.30 + r * 24}" width="18" height="18" rx="5"
                fill="${on ? pal.a1 : pal.a2}" opacity="${on ? .95 : .6}"/>`;
      }
      return g;
    }
    case 'lines': {
      let g = `<circle cx="${cx}" cy="${y + h * 0.30}" r="21" fill="none" stroke="${pal.a1}" stroke-width="2.5"/>`;
      for (let i = 0; i < 5; i++) {
        const w2 = 76 - i * 11;
        g += `<rect x="${cx - w2 / 2}" y="${y + h * 0.44 + i * 13}" width="${w2}" height="3.5" rx="2"
                fill="${i === 0 ? pal.a1 : pal.a2}"/>`;
      }
      return g;
    }
    default: { // dots
      let g = '';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
        const d = Math.abs(r - 2) + Math.abs(c - 2);
        g += `<circle cx="${cx - 44 + c * 22}" cy="${y + h * 0.30 + r * 22}" r="${d < 2 ? 6 : 4}"
                fill="${d < 2 ? pal.a1 : pal.a2}" opacity="${d < 3 ? .95 : .55}"/>`;
      }
      return g;
    }
  }
}

/** Inner-page artwork for gallery / builder previews. */
function pageArt(kind, pal, x, y, w, h, sections) {
  const ink = pal.ink, a1 = pal.a1, a2 = pal.a2, a3 = pal.a3;
  let s = '';
  const line = (px, py, pw, op = .5, col = a2, ph = 3) =>
    `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="1.6" fill="${col}" opacity="${op}"/>`;

  if (kind === 'weekly') {
    s += `<text x="${x + 12}" y="${y + 20}" font-size="9" letter-spacing="1.6" fill="${ink}" opacity=".55" font-family="system-ui, sans-serif">WEEK 14</text>`;
    for (let c = 0; c < 4; c++) {
      const cw = (w - 34) / 4, cx = x + 12 + c * (cw + 6);
      s += `<rect x="${cx}" y="${y + 30}" width="${cw}" height="${h - 74}" rx="6" fill="${pal.bg}" opacity=".8"/>`;
      s += `<rect x="${cx}" y="${y + 30}" width="${cw}" height="12" rx="6" fill="${c === 1 ? a1 : a2}" opacity="${c === 1 ? .9 : .55}"/>`;
      for (let l = 0; l < 5; l++) s += line(cx + 6, y + 52 + l * 11, cw - 12 - (l % 2) * 8, .5);
    }
    s += `<rect x="${x + 12}" y="${y + h - 36}" width="${w - 24}" height="22" rx="7" fill="${a3}" opacity=".35"/>`;
    s += line(x + 20, y + h - 27, 60, .8, ink);
  } else if (kind === 'monthly') {
    s += `<text x="${x + 12}" y="${y + 20}" font-size="10" fill="${ink}" opacity=".6" font-family="system-ui, sans-serif">OCTOBER</text>`;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
      const cw = (w - 30) / 7, ch = (h - 52) / 5;
      const on = (r * 7 + c) % 9 === 3;
      s += `<rect x="${x + 12 + c * cw}" y="${y + 30 + r * ch}" width="${cw - 3}" height="${ch - 3}" rx="3.5"
              fill="${on ? a1 : pal.bg}" opacity="${on ? .85 : .85}" stroke="${a2}" stroke-width=".7"/>`;
    }
  } else if (kind === 'habit') {
    s += `<text x="${x + 12}" y="${y + 20}" font-size="9" letter-spacing="1.6" fill="${ink}" opacity=".55" font-family="system-ui, sans-serif">HABITS</text>`;
    for (let r = 0; r < 5; r++) {
      s += line(x + 12, y + 34 + r * 20, 42, .45, ink, 4);
      for (let c = 0; c < 10; c++) {
        const done = (r * 3 + c) % 4 !== 0;
        s += `<circle cx="${x + 66 + c * ((w - 90) / 10)}" cy="${y + 36 + r * 20}" r="5"
                fill="${done ? a1 : 'none'}" stroke="${a2}" stroke-width="1.2" opacity="${done ? .95 : .8}"/>`;
      }
    }
    s += `<rect x="${x + 12}" y="${y + h - 30}" width="${(w - 24) * .68}" height="8" rx="4" fill="${a3}" opacity=".8"/>`;
    s += `<rect x="${x + 12}" y="${y + h - 30}" width="${w - 24}" height="8" rx="4" fill="${a2}" opacity=".35"/>`;
  } else if (kind === 'sections') {
    const list = (sections || []).slice(0, 6);
    s += `<text x="${x + 12}" y="${y + 20}" font-size="9" letter-spacing="1.6" fill="${ink}" opacity=".55" font-family="system-ui, sans-serif">CONTENTS</text>`;
    list.forEach((name, i) => {
      s += `<rect x="${x + 12}" y="${y + 30 + i * 21}" width="${w - 24}" height="17" rx="5" fill="${i === 0 ? a1 : pal.bg}" opacity="${i === 0 ? .85 : .9}" stroke="${a2}" stroke-width=".7"/>`;
      s += `<text x="${x + 20}" y="${y + 42 + i * 21}" font-size="8.5" fill="${i === 0 ? pal.card : ink}" opacity=".9" font-family="system-ui, sans-serif">${esc(name)}</text>`;
    });
  } else { // notes
    for (let l = 0; l < 11; l++) s += line(x + 12, y + 26 + l * 15, w - 24 - (l % 3) * 26, .4);
    s += `<circle cx="${x + w - 30}" cy="${y + h - 28}" r="14" fill="${a1}" opacity=".8"/>`;
  }
  return s;
}

/**
 * Master artwork generator.
 * @param {Object} o  { palette, title, subtitle, motif, layout, sections, kind, badge }
 * @returns {String}  SVG markup (viewBox 400×340)
 */
function plannerArt(o = {}) {
  const pal = typeof o.palette === 'string' ? (PALETTES[o.palette] || PALETTES.minimal) : (o.palette || PALETTES.minimal);
  const kind = o.kind || 'cover';
  const title = o.title || 'Planner';
  const sub = o.subtitle || '';
  const uid = 'g' + Math.random().toString(36).slice(2, 8);

  let inner = '';
  if (kind === 'cover') {
    const bx = 112, by = 30, bw = 176, bh = 280;
    const lines = wrapWords(title, 15, 3);
    inner = `
      <rect x="${bx + 7}" y="${by + 9}" width="${bw}" height="${bh}" rx="12" fill="${pal.ink}" opacity=".10"/>
      <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="12" fill="${pal.card}"/>
      <rect x="${bx}" y="${by}" width="15" height="${bh}" rx="12" fill="${pal.a1}"/>
      <rect x="${bx + 11}" y="${by}" width="6" height="${bh}" fill="${pal.a1}" opacity=".45"/>
      ${coverMotif(o.motif || 'arch', pal, bx, by, bw, bh)}
      ${lines.map((l, i) => `<text x="${bx + bw / 2 + 6}" y="${by + bh * 0.74 + i * 20}" text-anchor="middle"
          font-family="Fraunces, Georgia, serif" font-size="17" fill="${pal.ink}">${esc(l)}</text>`).join('')}
      ${sub ? `<text x="${bx + bw / 2 + 6}" y="${by + bh - 26}" text-anchor="middle" font-family="system-ui, sans-serif"
          font-size="8.5" letter-spacing="2.4" fill="${pal.ink}" opacity=".5">${esc(sub.toUpperCase())}</text>` : ''}
      ${[0, 1, 2].map(i => `<rect x="${bx + bw - 4}" y="${by + 54 + i * 44}" width="12" height="34" rx="4"
          fill="${[pal.a1, pal.a3, pal.a2][i]}" opacity=".9"/>`).join('')}`;
  } else if (kind === 'spread') {
    inner = `
      <rect x="26" y="34" width="348" height="272" rx="14" fill="${pal.card}"/>
      <line x1="200" y1="42" x2="200" y2="298" stroke="${pal.a2}" stroke-width="1" opacity=".8"/>
      ${pageArt(o.left || 'weekly', pal, 30, 40, 166, 260, o.sections)}
      ${pageArt(o.right || 'habit', pal, 204, 40, 166, 260, o.sections)}`;
  } else {
    inner = `
      <rect x="52" y="26" width="296" height="288" rx="14" fill="${pal.card}"/>
      ${pageArt(kind, pal, 62, 36, 276, 268, o.sections)}`;
  }

  return `<svg viewBox="0 0 400 340" xmlns="http://www.w3.org/2000/svg" role="img"
      aria-label="${esc(title)} preview" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${pal.bg}"/>
        <stop offset="100%" stop-color="${pal.a2}" stop-opacity=".75"/>
      </linearGradient>
    </defs>
    <rect width="400" height="340" fill="url(#${uid})"/>
    <circle cx="60" cy="52" r="46" fill="${pal.a3}" opacity=".22"/>
    <circle cx="352" cy="292" r="60" fill="${pal.a1}" opacity=".18"/>
    ${inner}
  </svg>`;
}

/* --------------------------------------------------------------------------
   4. CATALOGUE HELPERS
   -------------------------------------------------------------------------- */
/* Kuwaiti dinar is quoted to three decimal places (1 KD = 1000 fils). */
const CURRENCY = { code: 'KD', decimals: 3 };
const money = n => CURRENCY.code + ' ' + Number(n).toFixed(CURRENCY.decimals);
const getProduct = key => PRODUCTS.find(p => p.slug === key || p.id === key) || null;

function starsHTML(rating) {
  const full = Math.round(rating);
  let out = '<span class="stars" aria-hidden="true">';
  for (let i = 1; i <= 5; i++) {
    out += `<svg class="${i <= full ? '' : 'empty'}" viewBox="0 0 24 24"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5L2.5 9.5l6.6-.9z"/></svg>`;
  }
  return out + '</span>';
}

function productCardHTML(p, opts = {}) {
  const fav = window.PLANA && PLANA.store ? PLANA.store.isFav(p.id) : false;
  const badgeMap = { popular: ['badge-pop', 'Popular'], new: ['badge-new', 'New'], sale: ['badge-sale', 'Sale'] };
  const b = badgeMap[p.badge];
  return `
  <article class="card card-lift p-card reveal" data-id="${p.id}">
    <div class="thumb">
      <div class="thumb-badges">
        ${b ? `<span class="badge ${b[0]}">${b[1]}</span>` : ''}
        ${p.oldPrice ? `<span class="badge badge-dark">Save ${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>` : ''}
      </div>
      <button class="fav" type="button" data-fav="${p.id}" aria-pressed="${fav}"
        aria-label="${fav ? 'Remove' : 'Add'} ${esc(p.name)} ${fav ? 'from' : 'to'} favourites">
        <svg viewBox="0 0 24 24"><path d="M12 20.5S3.8 15.4 3.8 9.9A4.6 4.6 0 0 1 12 7.2a4.6 4.6 0 0 1 8.2 2.7c0 5.5-8.2 10.6-8.2 10.6z"/></svg>
      </button>
      <a href="#product/${p.slug}" aria-label="View ${esc(p.name)}">${plannerArt({ palette: p.palette, title: p.name, subtitle: p.category, motif: p.cover })}</a>
      <div class="quick">
        <button class="btn btn-soft btn-sm btn-block" type="button" data-quick="${p.id}">Quick preview</button>
      </div>
    </div>
    <div class="body">
      <span class="cat">${esc(p.category)}</span>
      <h3><a href="#product/${p.slug}">${esc(p.name)}</a></h3>
      <p class="desc">${esc(p.short)}</p>
      <div class="row" style="gap:10px">
        <span class="rating">${starsHTML(p.rating)} <b>${p.rating}</b> <span>(${p.reviews})</span></span>
      </div>
      <div class="foot">
        <span class="price">${money(p.price)}${p.oldPrice ? `<span class="was">${money(p.oldPrice)}</span>` : ''}</span>
        <button class="btn btn-primary btn-sm" type="button" data-add="${p.id}">Add to cart</button>
      </div>
    </div>
  </article>`;
}

/* Expose for the other modules (main.js / cart.js / planner.js) */
window.PLANA = window.PLANA || {};
Object.assign(window.PLANA, { PRODUCTS, CATEGORIES, PALETTES, plannerArt, productCardHTML, starsHTML, money, getProduct, esc, wrapWords });

/* ==========================================================================
   5. SHOP CONTROLLER
   Search + multi-category filter + price + sort, all client side, with the
   URL kept in sync so a filtered view can be shared or bookmarked.
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /** Upper bound of the price filter, in KD — matches the range input. */
  const MAX_PRICE = 13;

  function initShop() {
    const grid = $('#shop-grid');
    if (!grid) return;

    const routeParams = () => (window.PLANA.parseHash ? PLANA.parseHash().params : {});
    const params = routeParams();
    const state = {
      q: params.q || '',
      cats: new Set(params.cat ? [params.cat] : []),
      max: Number(params.max) || MAX_PRICE,
      sort: params.sort || 'featured',
      favOnly: params.fav === '1'
    };

    /* ---- build the filter sidebar from the catalogue itself ---- */
    const catList = $('#cat-filters');
    catList.innerHTML = CATEGORIES.map(c => {
      const n = PRODUCTS.filter(p => p.category === c).length;
      return `<label class="opt">
        <input type="checkbox" value="${esc(c)}" ${state.cats.has(c) ? 'checked' : ''}>
        <span class="mark" aria-hidden="true"></span>
        <span class="opt-text"><b>${esc(c)}</b><span>${n} product${n === 1 ? '' : 's'}</span></span>
      </label>`;
    }).join('');

    const priceInput = $('#price-range');
    const priceOut = $('#price-out');
    priceInput.value = state.max;
    priceOut.textContent = money(state.max);

    const sortSel = $('#sort-select');
    sortSel.value = state.sort;
    const searchInput = $('#shop-search');
    searchInput.value = state.q;

    /* ---- filtering + sorting ---- */
    function results() {
      const q = state.q.trim().toLowerCase();
      let list = PRODUCTS.filter(p => {
        if (state.cats.size && !state.cats.has(p.category)) return false;
        if (p.price > state.max) return false;
        if (state.favOnly && !PLANA.store.isFav(p.id)) return false;
        if (!q) return true;
        return (p.name + ' ' + p.short + ' ' + p.category + ' ' + p.tags.join(' ') + ' ' + p.sections.join(' '))
          .toLowerCase().includes(q);
      });
      const sorters = {
        'featured':   (a, b) => (b.badge === 'popular') - (a.badge === 'popular') || b.rating - a.rating,
        'price-asc':  (a, b) => a.price - b.price,
        'price-desc': (a, b) => b.price - a.price,
        'rating':     (a, b) => b.rating - a.rating || b.reviews - a.reviews,
        'reviews':    (a, b) => b.reviews - a.reviews,
        'new':        (a, b) => (b.badge === 'new') - (a.badge === 'new')
      };
      return list.sort(sorters[state.sort] || sorters.featured);
    }

    /* Keep the hash in step with the filters so a filtered shop stays
       linkable. replaceState never fires hashchange, so this cannot loop. */
    function syncURL() {
      if (document.getElementById('view-shop').hidden) return;
      const p = new URLSearchParams();
      if (state.q) p.set('q', state.q);
      if (state.cats.size === 1) p.set('cat', [...state.cats][0]);
      if (state.max !== MAX_PRICE) p.set('max', state.max);
      if (state.sort !== 'featured') p.set('sort', state.sort);
      if (state.favOnly) p.set('fav', '1');
      const qs = p.toString();
      history.replaceState(null, '', '#shop' + (qs ? '?' + qs : ''));
    }

    function renderChips() {
      const wrap = $('#active-filters');
      const chips = [];
      state.cats.forEach(c => chips.push(`<span class="tag-x">${esc(c)}<button type="button" data-clear-cat="${esc(c)}" aria-label="Remove ${esc(c)} filter">×</button></span>`));
      if (state.q) chips.push(`<span class="tag-x">“${esc(state.q)}”<button type="button" data-clear-q aria-label="Clear search">×</button></span>`);
      if (state.max < MAX_PRICE) chips.push(`<span class="tag-x">Under ${money(state.max)}<button type="button" data-clear-price aria-label="Clear price filter">×</button></span>`);
      if (state.favOnly) chips.push(`<span class="tag-x">Favourites only<button type="button" data-clear-fav aria-label="Show all products">×</button></span>`);
      wrap.innerHTML = chips.length ? chips.join('') + `<button class="chip" type="button" id="clear-all">Clear all</button>` : '';
    }

    let loadTimer = null;
    function render(showLoading = true) {
      const list = results();
      renderChips();
      $('#result-count').textContent = list.length + ' planner' + (list.length === 1 ? '' : 's');
      syncURL();

      const paint = () => {
        if (!list.length) {
          grid.style.display = 'block';
          grid.innerHTML = `<div class="card card-pad empty">
            <span class="art" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
            </span>
            <h3>No planners match that</h3>
            <p>Try a wider price range, or clear a filter or two. Every PLANA file is under KD 13.</p>
            <button class="btn btn-ghost btn-sm" type="button" id="empty-reset">Reset filters</button>
          </div>`;
          const r = $('#empty-reset');
          if (r) r.addEventListener('click', resetAll);
          return;
        }
        grid.style.display = '';
        grid.innerHTML = list.map((p, i) => productCardHTML(p).replace('reveal', `reveal reveal-d${(i % 4) + 1}`)).join('');
        PLANA.observeReveals(grid);
      };

      if (showLoading) {
        grid.style.display = '';
        grid.innerHTML = Array.from({ length: 6 }, () => '<div class="skeleton sk-card"></div>').join('');
        clearTimeout(loadTimer);
        loadTimer = setTimeout(paint, 260);   // brief, deliberate loading state
      } else paint();
    }

    /* ---- events ---- */
    let debounce = null;
    searchInput.addEventListener('input', () => {
      state.q = searchInput.value;
      $('.search-wrap').classList.toggle('has-value', !!state.q);
      clearTimeout(debounce);
      debounce = setTimeout(() => render(), 220);
    });
    $('.search-clear').addEventListener('click', () => {
      state.q = ''; searchInput.value = ''; $('.search-wrap').classList.remove('has-value'); searchInput.focus(); render();
    });
    catList.addEventListener('change', e => {
      const cb = e.target.closest('input[type="checkbox"]'); if (!cb) return;
      cb.checked ? state.cats.add(cb.value) : state.cats.delete(cb.value);
      render();
    });
    priceInput.addEventListener('input', () => { priceOut.textContent = money(priceInput.value); });
    priceInput.addEventListener('change', () => { state.max = Number(priceInput.value); render(); });
    sortSel.addEventListener('change', () => { state.sort = sortSel.value; render(false); });
    const favToggle = $('#fav-only');
    if (favToggle) {
      favToggle.checked = state.favOnly;
      favToggle.addEventListener('change', () => { state.favOnly = favToggle.checked; render(); });
    }
    $('#active-filters').addEventListener('click', e => {
      const c = e.target.closest('[data-clear-cat]');
      if (c) { state.cats.delete(c.dataset.clearCat); $$('input', catList).forEach(i => { if (i.value === c.dataset.clearCat) i.checked = false; }); render(); }
      if (e.target.closest('[data-clear-q]')) { state.q = ''; searchInput.value = ''; render(); }
      if (e.target.closest('[data-clear-price]')) { state.max = MAX_PRICE; priceInput.value = MAX_PRICE; priceOut.textContent = money(MAX_PRICE); render(); }
      if (e.target.closest('[data-clear-fav]')) { state.favOnly = false; if (favToggle) favToggle.checked = false; render(); }
      if (e.target.closest('#clear-all')) resetAll();
    });
    function resetAll() {
      state.q = ''; state.cats.clear(); state.max = MAX_PRICE; state.sort = 'featured'; state.favOnly = false;
      searchInput.value = ''; priceInput.value = MAX_PRICE; priceOut.textContent = money(MAX_PRICE); sortSel.value = 'featured';
      $$('input', catList).forEach(i => { i.checked = false; });
      if (favToggle) favToggle.checked = false;
      $('.search-wrap').classList.remove('has-value');
      render();
    }
    const mBtn = $('#filter-toggle');
    if (mBtn) mBtn.addEventListener('click', () => {
      const open = $('.filters').classList.toggle('open');
      mBtn.setAttribute('aria-expanded', String(open));
      mBtn.textContent = open ? 'Hide filters' : 'Filters';
    });

    // favourites list can change from a heart click — keep "favourites only" honest
    document.addEventListener('plana:cartchange', () => { if (state.favOnly) render(false); });

    /* Arriving at #shop?cat=… from anywhere else applies those filters. */
    function applyRoute(p) {
      state.q = p.q || '';
      state.cats = new Set(p.cat ? [p.cat] : []);
      state.max = Number(p.max) || MAX_PRICE;
      state.sort = p.sort || 'featured';
      state.favOnly = p.fav === '1';
      searchInput.value = state.q;
      priceInput.value = state.max; priceOut.textContent = money(state.max);
      sortSel.value = state.sort;
      if (favToggle) favToggle.checked = state.favOnly;
      $$('input', catList).forEach(i => { i.checked = state.cats.has(i.value); });
      $('.search-wrap').classList.toggle('has-value', !!state.q);
      render(true);
    }
    document.addEventListener('plana:route', e => {
      if (e.detail.name === 'shop') applyRoute(e.detail.params);
    });

    if (state.q) $('.search-wrap').classList.add('has-value');
    render(true);
  }

  /* ==========================================================================
     6. PRODUCT DETAIL CONTROLLER
     ========================================================================== */
  /** Renders the product view for a slug — called by the router. */
  function renderProduct(slug) {
    const root = $('#product-root'); if (!root) return;
    const p = getProduct(slug);

    if (!p) {
      root.innerHTML = `<div class="container"><div class="card card-pad empty" style="margin:60px auto;max-width:560px">
        <span class="art" aria-hidden="true">🔍</span>
        <h3>We could not find that planner</h3>
        <p>The link may be out of date. The full library is one click away.</p>
        <a class="btn btn-primary" href="#shop">Back to the shop</a>
      </div></div>`;
      document.title = 'Not found — PLANA';
      return;
    }

    document.title = p.name + ' — PLANA';
    const views = [
      { key: 'cover',  label: 'Cover',   art: () => plannerArt({ palette: p.palette, title: p.name, subtitle: p.category, motif: p.cover }) },
      { key: 'spread', label: 'Spread',  art: () => plannerArt({ palette: p.palette, kind: 'spread', left: p.layout === 'monthly' ? 'monthly' : 'weekly', right: 'habit' }) },
      { key: 'inside', label: 'Monthly', art: () => plannerArt({ palette: p.palette, kind: 'monthly' }) },
      { key: 'index',  label: 'Contents', art: () => plannerArt({ palette: p.palette, kind: 'sections', sections: p.sections }) }
    ];
    const isFav = PLANA.store.isFav(p.id);

    root.innerHTML = `
    <div class="container">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="#home">Home</a><span class="sep">/</span>
        <a href="#shop">Shop</a><span class="sep">/</span>
        <a href="#shop?cat=${encodeURIComponent(p.category)}">${esc(p.category)}</a><span class="sep">/</span>
        <span aria-current="page">${esc(p.name)}</span>
      </nav>

      <div class="pd-grid section-sm">
        <div class="gallery">
          <div class="stage" id="pd-stage">${views[0].art()}</div>
          <div class="thumbs" role="tablist" aria-label="Product preview images">
            ${views.map((v, i) => `<button role="tab" type="button" data-view="${i}" aria-selected="${i === 0}" aria-label="${v.label} view">${v.art()}</button>`).join('')}
          </div>
        </div>

        <div class="pd-info">
          <div class="row" style="gap:10px">
            <span class="eyebrow" style="margin:0">${esc(p.category)}</span>
            ${p.badge ? `<span class="badge badge-${p.badge === 'popular' ? 'pop' : p.badge}">${p.badge === 'popular' ? 'Best seller' : p.badge}</span>` : ''}
          </div>
          <h1>${esc(p.name)}</h1>
          <div class="row" style="gap:14px">
            <span class="rating">${starsHTML(p.rating)} <b>${p.rating}</b> <span>· ${p.reviews} reviews</span></span>
            <span class="pill-tag">${p.pages} pages</span>
          </div>
          <div class="pd-price">
            <span class="now">${money(p.price)}</span>
            ${p.oldPrice ? `<span class="muted" style="text-decoration:line-through">${money(p.oldPrice)}</span>
              <span class="badge badge-sale">Save ${money(p.oldPrice - p.price)}</span>` : ''}
          </div>
          <p class="lede">${esc(p.description)}</p>

          <div class="spec-grid">
            <div class="spec"><b>Pages</b><span>${p.pages}</span></div>
            <div class="spec"><b>Format</b><span>${esc(p.format)}</span></div>
            <div class="spec"><b>Compatibility</b><span>${esc(p.compat)}</span></div>
            <div class="spec"><b>Delivery</b><span>Instant download</span></div>
          </div>

          <h3 style="font-family:var(--font-sans);font-size:1rem;margin-bottom:12px">What's included</h3>
          <ul class="incl">
            ${p.includes.map(i => `<li><span class="tick"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>${esc(i)}</li>`).join('')}
          </ul>

          <div class="buy-row">
            <button class="btn btn-primary btn-lg" type="button" data-add="${p.id}" data-open-cart="false">Add to cart · ${money(p.price)}</button>
            <button class="btn btn-dark btn-lg" type="button" id="buy-now">Buy now</button>
            <button class="btn btn-icon fav" style="position:static;width:52px;height:52px" type="button" data-fav="${p.id}" aria-pressed="${isFav}" aria-label="Save to favourites">
              <svg viewBox="0 0 24 24"><path d="M12 20.5S3.8 15.4 3.8 9.9A4.6 4.6 0 0 1 12 7.2a4.6 4.6 0 0 1 8.2 2.7c0 5.5-8.2 10.6-8.2 10.6z"/></svg>
            </button>
          </div>

          <div class="trust">
            <div>✓ Instant download</div><div>✓ Lifetime updates</div><div>✓ Works on iPad & print</div>
          </div>

          <div style="margin-top:32px">
            <details class="acc" open><summary>Sections inside</summary>
              <div class="acc-body"><div class="row">${p.sections.map(s => `<span class="pill-tag">${esc(s)}</span>`).join('')}</div></div>
            </details>
            <details class="acc"><summary>How do I use this file?</summary>
              <div class="acc-body">Import the PDF into GoodNotes, Notability or any annotation app, or print the A4/A5 pages. Notion templates arrive as a duplicate link — one click and the workspace is yours.</div>
            </details>
            <details class="acc"><summary>Refunds & updates</summary>
              <div class="acc-body">Digital files are non-refundable once downloaded, but every update to this planner is free for life and lands in the same download link. Something not working? Email hello@plana.studio and we will fix it.</div>
            </details>
          </div>
        </div>
      </div>

      <section class="section-sm">
        <div class="section-head"><div class="title-wrap"><span class="eyebrow">Pairs well with</span><h2>Complete the system</h2></div>
          <a class="link-arrow" href="#shop">All planners →</a></div>
        <div class="product-grid" id="related-grid"></div>
      </section>
    </div>`;

    // Gallery tabs — click and keyboard (arrow keys move between views)
    const stage = $('#pd-stage');
    const tabs = $$('[data-view]');
    function select(i) {
      tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
      stage.innerHTML = views[i].art();
    }
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[next].focus(); select(next);
      });
    });

    $('#buy-now').addEventListener('click', function () {
      this.classList.add('is-loading');
      PLANA.store.add(p.id, 1);
      setTimeout(() => { PLANA.go('cart'); }, 500);
    });

    const related = PRODUCTS
      .filter(x => x.id !== p.id)
      .map(x => ({ x, s: (x.category === p.category ? 3 : 0) + x.tags.filter(t => p.tags.includes(t)).length }))
      .sort((a, b) => b.s - a.s || b.x.rating - a.x.rating)
      .slice(0, 4).map(o => o.x);
    $('#related-grid').innerHTML = related.map(x => productCardHTML(x)).join('');
    PLANA.observeReveals(root);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initShop();
    // The product view is rebuilt every time its route is visited
    document.addEventListener('plana:route', e => {
      if (e.detail.name === 'product') renderProduct(e.detail.param);
    });
  });

  window.PLANA = window.PLANA || {};
  window.PLANA.renderProduct = renderProduct;
})();
