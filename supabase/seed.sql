-- ============================================================================
--  PLANA — seed data
--  Generated from the live catalogue in js/products.js, so the database and
--  the front end agree exactly. Run after schema.sql.
--  Idempotent: re-running updates rather than duplicating.
-- ============================================================================

begin;

-- ---------------------------------------------------------- categories
insert into public.categories (slug, name, sort_order) values
  ('study-planners', 'Study Planners', 0),
  ('productivity', 'Productivity', 1),
  ('notion-templates', 'Notion Templates', 2),
  ('journals', 'Journals', 3),
  ('calendars', 'Calendars', 4),
  ('wellness', 'Wellness', 5),
  ('printables', 'Printables', 6),
  ('stationery', 'Stationery', 7)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

-- ------------------------------------------------------------ products
insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'balanced-student-planner', 'The Balanced Student Planner', c.id, 5.5, 8, 'popular'::product_badge,
  'Semester overview, class schedule and a gentle habit system in one file.',
  'Built with students who burn out by week six in mind. The Balanced Student Planner pairs a full semester map with light-touch weekly pages, so you always know what is coming without over-planning every hour. Assignment trackers, exam countdowns and a rest planner sit side by side — because balance is a system, not a mood.',
  148, 'PDF · GoodNotes · Notability', 'iPad, Android tablet, Windows, printable A4/A5', 'lavender', 'arch', 'weekly'
from public.categories c where c.slug = 'study-planners'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'focused-student-planner', 'The Focused Student Planner', c.id, 6.75, null, 'new'::product_badge,
  'Deep-work timetables, revision cycles and a spaced-repetition log.',
  'For the student who wants fewer, better study hours. Daily deep-work blocks, a spaced-repetition revision log and a distraction audit turn vague "study more" goals into a repeatable weekly loop you can actually finish before midnight.',
  186, 'PDF · GoodNotes · Notability', 'iPad, Android tablet, printable A4', 'navy', 'grid', 'daily'
from public.categories c where c.slug = 'study-planners'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'quiet-minimal-planner', 'Quiet — Minimal Daily Planner', c.id, 4.5, null, null,
  'One page a day. Three priorities. Nothing else competing for attention.',
  'Quiet strips planning back to what survives a busy day: three priorities, a short schedule strip and space to think. Type-led, monochrome, and deliberately empty — the page never asks you to fill it.',
  96, 'PDF · GoodNotes · Notion', 'Any PDF reader, printable A5', 'minimal', 'lines', 'daily'
from public.categories c where c.slug = 'productivity'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'notion-life-os', 'Notion Life OS', c.id, 10.5, 14.5, 'popular'::product_badge,
  'A connected Notion workspace for goals, projects, habits and study.',
  'Nine linked databases, one dashboard. Life OS connects yearly goals to quarterly outcomes, weekly reviews and daily tasks, so nothing you care about lives in an orphaned list. Includes a guided 20-minute setup walkthrough and a duplicate-and-go link.',
  9, 'Notion template (duplicate link)', 'Notion free & paid plans, web + mobile', 'dark', 'dots', 'dashboard'
from public.categories c where c.slug = 'notion-templates'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'notion-student-hub', 'Notion Student Hub', c.id, 8, null, 'new'::product_badge,
  'Courses, deadlines, notes and GPA tracking in a single dashboard.',
  'Every course gets a home: syllabus, lecture notes, deadlines and grades roll up into one semester dashboard with an at-a-glance GPA calculator and a "what is due this week" view that updates itself.',
  7, 'Notion template (duplicate link)', 'Notion free & paid plans', 'sage', 'dots', 'dashboard'
from public.categories c where c.slug = 'notion-templates'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'momentum-habit-tracker', 'Momentum Habit Tracker', c.id, 3.75, 5, 'sale'::product_badge,
  'Streaks, gentle restarts and a monthly reflection that keeps you going.',
  'Momentum is built around restarting well, not perfect streaks. Track up to twelve habits, see your consistency as colour, and end each month with a two-minute reflection that decides what stays and what goes.',
  64, 'PDF · GoodNotes · printable', 'iPad, printable A4/A5/Letter', 'pastel', 'grid', 'tracker'
from public.categories c where c.slug = 'productivity'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'clarity-goal-journal', 'Clarity Goal Journal', c.id, 5.75, null, null,
  'Quarterly goal setting with weekly check-ins and honest reviews.',
  'A journal for people who set goals in January and lose them by March. Clarity breaks the year into four workable quarters, each with a written intention, three measurable outcomes, weekly check-ins and a review that asks the uncomfortable questions.',
  120, 'PDF · GoodNotes · printable', 'iPad, printable A5', 'clay', 'arch', 'journal'
from public.categories c where c.slug = 'journals'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'deepwork-weekly-planner', 'Deep Work Weekly Planner', c.id, 6.5, null, null,
  'Time-blocked weeks for people whose calendar keeps eating their work.',
  'A weekly spread designed around protected blocks: two deep-work sessions a day, a shallow-work bucket, and an end-of-week audit that shows exactly where the hours actually went.',
  132, 'PDF · GoodNotes · Notability', 'iPad, Windows, printable A4', 'navy', 'lines', 'weekly'
from public.categories c where c.slug = 'productivity'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'pastel-monthly-calendar', 'Pastel Monthly Calendar Set', c.id, 2.75, 4.25, 'sale'::product_badge,
  'Twelve dated months plus an undated set, in four soft colourways.',
  'Clean monthly grids with generous cells, a side column for the month''s focus, and four colourways that match the rest of the PLANA library. Dated 2026 and undated versions included.',
  40, 'PDF · PNG · printable', 'Print, tablet, desktop wallpaper sizes', 'pastel', 'grid', 'monthly'
from public.categories c where c.slug = 'calendars'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'budget-finance-tracker', 'Budget & Finance Tracker', c.id, 5.25, null, null,
  'Monthly budgets, savings goals and a spending review that adds itself up.',
  'A finance workbook for real life: monthly budget sheets, a savings-goal thermometer, subscription audit, and a spreadsheet companion with formulas already written so the totals maintain themselves.',
  72, 'PDF · XLSX · Google Sheets', 'Excel, Google Sheets, printable A4', 'sage', 'grid', 'tracker'
from public.categories c where c.slug = 'productivity'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'strong-fitness-planner', 'Strong — Fitness & Wellness Planner', c.id, 5, null, 'new'::product_badge,
  'Training splits, progress logs and recovery tracking that respects rest.',
  'Plan a training week you can repeat: split templates, progressive-overload logs, hydration and sleep tracking, and a recovery page that treats rest days as part of the programme rather than a failure.',
  88, 'PDF · GoodNotes · printable', 'iPad, phone, printable A5', 'clay', 'arch', 'tracker'
from public.categories c where c.slug = 'wellness'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'studio-business-planner', 'Studio — Small Business Planner', c.id, 8.75, 11.5, 'popular'::product_badge,
  'Client pipeline, content calendar and monthly numbers for solo founders.',
  'Everything a one-person studio needs to stop working from the inbox: a client pipeline, project trackers, a content calendar, and a monthly numbers page that turns invoices into a picture of the year.',
  164, 'PDF · Notion · XLSX', 'Notion, Excel, iPad, printable A4', 'dark', 'dots', 'dashboard'
from public.categories c where c.slug = 'productivity'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'softlight-journal', 'Softlight Gratitude Journal', c.id, 4, null, null,
  'Five quiet minutes a day: prompts, mood colour, and a weekly kindness page.',
  'A gentle daily journal with morning and evening prompts, a mood colour strip, and weekly pages for the small things worth remembering. Designed to be finished, not to be perfect.',
  110, 'PDF · GoodNotes · printable', 'iPad, phone, printable A5', 'pastel', 'arch', 'journal'
from public.categories c where c.slug = 'journals'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'stationery-sticker-kit', 'Digital Stationery & Sticker Kit', c.id, 3.5, null, null,
  '480 pre-cropped stickers, washi tapes and paper textures for any planner.',
  'A kit that makes any planner feel like yours: 480 pre-cropped PNG stickers, 24 washi tapes, 12 paper textures and a set of header banners — all colour-matched to the PLANA palettes.',
  480, 'PNG · GoodNotes sticker book', 'GoodNotes, Notability, Canva, Procreate', 'colorful', 'dots', 'kit'
from public.categories c where c.slug = 'stationery'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'printable-desk-set', 'Printable Desk Set', c.id, 2.5, 3.75, 'sale'::product_badge,
  'To-do pads, weekly dashboards and meal planners, ready to print.',
  'Nine printable sheets that live next to a laptop: daily to-do pads, a weekly dashboard, meal planner, grocery list, and a project one-pager. Print once, refill forever.',
  9, 'PDF · print-ready', 'A4, A5 and US Letter', 'minimal', 'lines', 'weekly'
from public.categories c where c.slug = 'printables'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;

insert into public.products (slug, name, category_id, price_kd, old_price_kd, badge,
  short, description, pages, file_format, compatibility, palette, cover_motif, layout)
select 'academic-year-bundle', 'Academic Year Mega Bundle', c.id, 12, 20.5, 'popular'::product_badge,
  'Four best-selling student files bundled at 42% off.',
  'The complete student stack: Balanced Student Planner, Focused Student Planner, Notion Student Hub and the Sticker Kit — bundled together for the whole academic year, with a shared colour system so everything matches.',
  820, 'PDF · Notion · PNG', 'iPad, Notion, printable A4/A5', 'lavender', 'grid', 'dashboard'
from public.categories c where c.slug = 'study-planners'
on conflict (slug) do update set
  name = excluded.name, price_kd = excluded.price_kd, old_price_kd = excluded.old_price_kd,
  badge = excluded.badge, short = excluded.short, description = excluded.description,
  pages = excluded.pages, file_format = excluded.file_format,
  compatibility = excluded.compatibility, palette = excluded.palette,
  cover_motif = excluded.cover_motif, layout = excluded.layout;


-- ------------------------------------- sections, includes, match weights
-- Rebuilt from scratch each run so the lists cannot drift.
delete from public.product_sections;
delete from public.product_includes;
delete from public.product_match_weights;

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Semester Map', 0 from public.products where slug = 'balanced-student-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Weekly Planner', 1 from public.products where slug = 'balanced-student-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Assignments', 2 from public.products where slug = 'balanced-student-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Habit Tracker', 3 from public.products where slug = 'balanced-student-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Notes', 4 from public.products where slug = 'balanced-student-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Rest Planner', 5 from public.products where slug = 'balanced-student-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Semester + term overview spreads', 0 from public.products where slug = 'balanced-student-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Hyperlinked tabs and month index', 1 from public.products where slug = 'balanced-student-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Assignment & exam tracker', 2 from public.products where slug = 'balanced-student-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Weekly study/rest balance page', 3 from public.products where slug = 'balanced-student-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Habit tracker (5 habits)', 4 from public.products where slug = 'balanced-student-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, '3 colour variants included', 5 from public.products where slug = 'balanced-student-planner';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 5),
     ('purpose'::match_dimension, 'work', 2),
     ('purpose'::match_dimension, 'personal', 3),
     ('purpose'::match_dimension, 'fitness', 1),
     ('purpose'::match_dimension, 'business', 1),
     ('challenge'::match_dimension, 'time', 4),
     ('challenge'::match_dimension, 'organization', 4),
     ('challenge'::match_dimension, 'motivation', 3),
     ('challenge'::match_dimension, 'goals', 3),
     ('challenge'::match_dimension, 'balance', 5),
     ('style'::match_dimension, 'minimal', 3),
     ('style'::match_dimension, 'detailed', 4),
     ('style'::match_dimension, 'visual', 3),
     ('style'::match_dimension, 'flexible', 4),
     ('cadence'::match_dimension, 'daily', 3),
     ('cadence'::match_dimension, 'weekly', 5),
     ('cadence'::match_dimension, 'monthly', 3)
  ) as v(dimension, option_key, weight)
  where p.slug = 'balanced-student-planner';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Daily Timetable', 0 from public.products where slug = 'focused-student-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Revision Log', 1 from public.products where slug = 'focused-student-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Lecture Notes', 2 from public.products where slug = 'focused-student-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Exam Countdown', 3 from public.products where slug = 'focused-student-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Goals', 4 from public.products where slug = 'focused-student-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Focus Audit', 5 from public.products where slug = 'focused-student-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Daily deep-work timetable', 0 from public.products where slug = 'focused-student-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Spaced-repetition revision log', 1 from public.products where slug = 'focused-student-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Lecture note templates', 2 from public.products where slug = 'focused-student-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Exam countdown dashboard', 3 from public.products where slug = 'focused-student-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Distraction audit sheet', 4 from public.products where slug = 'focused-student-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Printable A4 + A5 versions', 5 from public.products where slug = 'focused-student-planner';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 5),
     ('purpose'::match_dimension, 'work', 3),
     ('purpose'::match_dimension, 'personal', 1),
     ('purpose'::match_dimension, 'fitness', 1),
     ('purpose'::match_dimension, 'business', 2),
     ('challenge'::match_dimension, 'time', 5),
     ('challenge'::match_dimension, 'organization', 4),
     ('challenge'::match_dimension, 'motivation', 3),
     ('challenge'::match_dimension, 'goals', 4),
     ('challenge'::match_dimension, 'balance', 2),
     ('style'::match_dimension, 'minimal', 4),
     ('style'::match_dimension, 'detailed', 5),
     ('style'::match_dimension, 'visual', 2),
     ('style'::match_dimension, 'flexible', 2),
     ('cadence'::match_dimension, 'daily', 5),
     ('cadence'::match_dimension, 'weekly', 4),
     ('cadence'::match_dimension, 'monthly', 2)
  ) as v(dimension, option_key, weight)
  where p.slug = 'focused-student-planner';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Daily Page', 0 from public.products where slug = 'quiet-minimal-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Priorities', 1 from public.products where slug = 'quiet-minimal-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Weekly Reset', 2 from public.products where slug = 'quiet-minimal-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Notes', 3 from public.products where slug = 'quiet-minimal-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, '365 undated daily pages', 0 from public.products where slug = 'quiet-minimal-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Three-priority framework', 1 from public.products where slug = 'quiet-minimal-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Light schedule strip', 2 from public.products where slug = 'quiet-minimal-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Weekly reset page', 3 from public.products where slug = 'quiet-minimal-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Notion companion board', 4 from public.products where slug = 'quiet-minimal-planner';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 2),
     ('purpose'::match_dimension, 'work', 4),
     ('purpose'::match_dimension, 'personal', 5),
     ('purpose'::match_dimension, 'fitness', 2),
     ('purpose'::match_dimension, 'business', 3),
     ('challenge'::match_dimension, 'time', 4),
     ('challenge'::match_dimension, 'organization', 3),
     ('challenge'::match_dimension, 'motivation', 2),
     ('challenge'::match_dimension, 'goals', 2),
     ('challenge'::match_dimension, 'balance', 4),
     ('style'::match_dimension, 'minimal', 5),
     ('style'::match_dimension, 'detailed', 1),
     ('style'::match_dimension, 'visual', 1),
     ('style'::match_dimension, 'flexible', 4),
     ('cadence'::match_dimension, 'daily', 5),
     ('cadence'::match_dimension, 'weekly', 2),
     ('cadence'::match_dimension, 'monthly', 1)
  ) as v(dimension, option_key, weight)
  where p.slug = 'quiet-minimal-planner';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Dashboard', 0 from public.products where slug = 'notion-life-os';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Goals', 1 from public.products where slug = 'notion-life-os';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Projects', 2 from public.products where slug = 'notion-life-os';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Habit Tracker', 3 from public.products where slug = 'notion-life-os';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Weekly Review', 4 from public.products where slug = 'notion-life-os';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Library', 5 from public.products where slug = 'notion-life-os';
insert into public.product_includes (product_id, label, sort_order)
  select id, '9 linked databases', 0 from public.products where slug = 'notion-life-os';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Yearly → weekly goal cascade', 1 from public.products where slug = 'notion-life-os';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Habit streak dashboard', 2 from public.products where slug = 'notion-life-os';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Study & reading library', 3 from public.products where slug = 'notion-life-os';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Weekly review automation', 4 from public.products where slug = 'notion-life-os';
insert into public.product_includes (product_id, label, sort_order)
  select id, '20-minute setup walkthrough', 5 from public.products where slug = 'notion-life-os';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 3),
     ('purpose'::match_dimension, 'work', 5),
     ('purpose'::match_dimension, 'personal', 4),
     ('purpose'::match_dimension, 'fitness', 3),
     ('purpose'::match_dimension, 'business', 5),
     ('challenge'::match_dimension, 'time', 3),
     ('challenge'::match_dimension, 'organization', 5),
     ('challenge'::match_dimension, 'motivation', 3),
     ('challenge'::match_dimension, 'goals', 5),
     ('challenge'::match_dimension, 'balance', 3),
     ('style'::match_dimension, 'minimal', 2),
     ('style'::match_dimension, 'detailed', 5),
     ('style'::match_dimension, 'visual', 3),
     ('style'::match_dimension, 'flexible', 4),
     ('cadence'::match_dimension, 'daily', 3),
     ('cadence'::match_dimension, 'weekly', 5),
     ('cadence'::match_dimension, 'monthly', 4)
  ) as v(dimension, option_key, weight)
  where p.slug = 'notion-life-os';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Semester Dashboard', 0 from public.products where slug = 'notion-student-hub';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Courses', 1 from public.products where slug = 'notion-student-hub';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Deadlines', 2 from public.products where slug = 'notion-student-hub';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Notes', 3 from public.products where slug = 'notion-student-hub';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Grades', 4 from public.products where slug = 'notion-student-hub';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Revision', 5 from public.products where slug = 'notion-student-hub';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Course & syllabus database', 0 from public.products where slug = 'notion-student-hub';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Deadline rollups by week', 1 from public.products where slug = 'notion-student-hub';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'GPA calculator', 2 from public.products where slug = 'notion-student-hub';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Lecture note template', 3 from public.products where slug = 'notion-student-hub';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Reading tracker', 4 from public.products where slug = 'notion-student-hub';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Exam revision board', 5 from public.products where slug = 'notion-student-hub';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 5),
     ('purpose'::match_dimension, 'work', 2),
     ('purpose'::match_dimension, 'personal', 2),
     ('purpose'::match_dimension, 'fitness', 1),
     ('purpose'::match_dimension, 'business', 2),
     ('challenge'::match_dimension, 'time', 3),
     ('challenge'::match_dimension, 'organization', 5),
     ('challenge'::match_dimension, 'motivation', 2),
     ('challenge'::match_dimension, 'goals', 4),
     ('challenge'::match_dimension, 'balance', 3),
     ('style'::match_dimension, 'minimal', 2),
     ('style'::match_dimension, 'detailed', 5),
     ('style'::match_dimension, 'visual', 3),
     ('style'::match_dimension, 'flexible', 3),
     ('cadence'::match_dimension, 'daily', 2),
     ('cadence'::match_dimension, 'weekly', 4),
     ('cadence'::match_dimension, 'monthly', 4)
  ) as v(dimension, option_key, weight)
  where p.slug = 'notion-student-hub';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Habit Grid', 0 from public.products where slug = 'momentum-habit-tracker';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Streaks', 1 from public.products where slug = 'momentum-habit-tracker';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Mood Log', 2 from public.products where slug = 'momentum-habit-tracker';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Monthly Reflection', 3 from public.products where slug = 'momentum-habit-tracker';
insert into public.product_includes (product_id, label, sort_order)
  select id, '12-habit monthly grids', 0 from public.products where slug = 'momentum-habit-tracker';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Streak & consistency chart', 1 from public.products where slug = 'momentum-habit-tracker';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Restart pages (no guilt)', 2 from public.products where slug = 'momentum-habit-tracker';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Monthly reflection prompts', 3 from public.products where slug = 'momentum-habit-tracker';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Mood + energy log', 4 from public.products where slug = 'momentum-habit-tracker';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 3),
     ('purpose'::match_dimension, 'work', 3),
     ('purpose'::match_dimension, 'personal', 5),
     ('purpose'::match_dimension, 'fitness', 5),
     ('purpose'::match_dimension, 'business', 2),
     ('challenge'::match_dimension, 'time', 2),
     ('challenge'::match_dimension, 'organization', 2),
     ('challenge'::match_dimension, 'motivation', 5),
     ('challenge'::match_dimension, 'goals', 4),
     ('challenge'::match_dimension, 'balance', 4),
     ('style'::match_dimension, 'minimal', 3),
     ('style'::match_dimension, 'detailed', 2),
     ('style'::match_dimension, 'visual', 5),
     ('style'::match_dimension, 'flexible', 4),
     ('cadence'::match_dimension, 'daily', 5),
     ('cadence'::match_dimension, 'weekly', 3),
     ('cadence'::match_dimension, 'monthly', 4)
  ) as v(dimension, option_key, weight)
  where p.slug = 'momentum-habit-tracker';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Quarter Map', 0 from public.products where slug = 'clarity-goal-journal';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Goals', 1 from public.products where slug = 'clarity-goal-journal';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Weekly Check-in', 2 from public.products where slug = 'clarity-goal-journal';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Reflection', 3 from public.products where slug = 'clarity-goal-journal';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Notes', 4 from public.products where slug = 'clarity-goal-journal';
insert into public.product_includes (product_id, label, sort_order)
  select id, '4 quarterly goal maps', 0 from public.products where slug = 'clarity-goal-journal';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Weekly check-in spreads', 1 from public.products where slug = 'clarity-goal-journal';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Obstacle & support planner', 2 from public.products where slug = 'clarity-goal-journal';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Quarter review prompts', 3 from public.products where slug = 'clarity-goal-journal';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Year-in-review pages', 4 from public.products where slug = 'clarity-goal-journal';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 3),
     ('purpose'::match_dimension, 'work', 4),
     ('purpose'::match_dimension, 'personal', 5),
     ('purpose'::match_dimension, 'fitness', 3),
     ('purpose'::match_dimension, 'business', 4),
     ('challenge'::match_dimension, 'time', 2),
     ('challenge'::match_dimension, 'organization', 3),
     ('challenge'::match_dimension, 'motivation', 4),
     ('challenge'::match_dimension, 'goals', 5),
     ('challenge'::match_dimension, 'balance', 4),
     ('style'::match_dimension, 'minimal', 3),
     ('style'::match_dimension, 'detailed', 3),
     ('style'::match_dimension, 'visual', 2),
     ('style'::match_dimension, 'flexible', 4),
     ('cadence'::match_dimension, 'daily', 1),
     ('cadence'::match_dimension, 'weekly', 4),
     ('cadence'::match_dimension, 'monthly', 5)
  ) as v(dimension, option_key, weight)
  where p.slug = 'clarity-goal-journal';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Weekly Blocks', 0 from public.products where slug = 'deepwork-weekly-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Priorities', 1 from public.products where slug = 'deepwork-weekly-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Meetings', 2 from public.products where slug = 'deepwork-weekly-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Hour Audit', 3 from public.products where slug = 'deepwork-weekly-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Notes', 4 from public.products where slug = 'deepwork-weekly-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Time-blocked weekly spreads', 0 from public.products where slug = 'deepwork-weekly-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Deep/shallow work split', 1 from public.products where slug = 'deepwork-weekly-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Meeting load tracker', 2 from public.products where slug = 'deepwork-weekly-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Weekly hour audit', 3 from public.products where slug = 'deepwork-weekly-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Quarterly planning pages', 4 from public.products where slug = 'deepwork-weekly-planner';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 3),
     ('purpose'::match_dimension, 'work', 5),
     ('purpose'::match_dimension, 'personal', 2),
     ('purpose'::match_dimension, 'fitness', 1),
     ('purpose'::match_dimension, 'business', 4),
     ('challenge'::match_dimension, 'time', 5),
     ('challenge'::match_dimension, 'organization', 4),
     ('challenge'::match_dimension, 'motivation', 2),
     ('challenge'::match_dimension, 'goals', 3),
     ('challenge'::match_dimension, 'balance', 3),
     ('style'::match_dimension, 'minimal', 3),
     ('style'::match_dimension, 'detailed', 5),
     ('style'::match_dimension, 'visual', 2),
     ('style'::match_dimension, 'flexible', 2),
     ('cadence'::match_dimension, 'daily', 4),
     ('cadence'::match_dimension, 'weekly', 5),
     ('cadence'::match_dimension, 'monthly', 2)
  ) as v(dimension, option_key, weight)
  where p.slug = 'deepwork-weekly-planner';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Monthly Grid', 0 from public.products where slug = 'pastel-monthly-calendar';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Month Focus', 1 from public.products where slug = 'pastel-monthly-calendar';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Notes', 2 from public.products where slug = 'pastel-monthly-calendar';
insert into public.product_includes (product_id, label, sort_order)
  select id, '12 dated months (2026)', 0 from public.products where slug = 'pastel-monthly-calendar';
insert into public.product_includes (product_id, label, sort_order)
  select id, '12 undated months', 1 from public.products where slug = 'pastel-monthly-calendar';
insert into public.product_includes (product_id, label, sort_order)
  select id, '4 colourways', 2 from public.products where slug = 'pastel-monthly-calendar';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Wallpaper sizes (desktop + phone)', 3 from public.products where slug = 'pastel-monthly-calendar';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'A4, A5 and Letter', 4 from public.products where slug = 'pastel-monthly-calendar';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 3),
     ('purpose'::match_dimension, 'work', 3),
     ('purpose'::match_dimension, 'personal', 4),
     ('purpose'::match_dimension, 'fitness', 2),
     ('purpose'::match_dimension, 'business', 2),
     ('challenge'::match_dimension, 'time', 3),
     ('challenge'::match_dimension, 'organization', 4),
     ('challenge'::match_dimension, 'motivation', 1),
     ('challenge'::match_dimension, 'goals', 2),
     ('challenge'::match_dimension, 'balance', 3),
     ('style'::match_dimension, 'minimal', 4),
     ('style'::match_dimension, 'detailed', 1),
     ('style'::match_dimension, 'visual', 4),
     ('style'::match_dimension, 'flexible', 3),
     ('cadence'::match_dimension, 'daily', 1),
     ('cadence'::match_dimension, 'weekly', 2),
     ('cadence'::match_dimension, 'monthly', 5)
  ) as v(dimension, option_key, weight)
  where p.slug = 'pastel-monthly-calendar';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Budget', 0 from public.products where slug = 'budget-finance-tracker';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Savings', 1 from public.products where slug = 'budget-finance-tracker';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Spending Log', 2 from public.products where slug = 'budget-finance-tracker';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Subscriptions', 3 from public.products where slug = 'budget-finance-tracker';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Review', 4 from public.products where slug = 'budget-finance-tracker';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Monthly budget sheets', 0 from public.products where slug = 'budget-finance-tracker';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Savings goal trackers', 1 from public.products where slug = 'budget-finance-tracker';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Subscription audit', 2 from public.products where slug = 'budget-finance-tracker';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Debt payoff planner', 3 from public.products where slug = 'budget-finance-tracker';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Spreadsheet with formulas', 4 from public.products where slug = 'budget-finance-tracker';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 2),
     ('purpose'::match_dimension, 'work', 3),
     ('purpose'::match_dimension, 'personal', 5),
     ('purpose'::match_dimension, 'fitness', 1),
     ('purpose'::match_dimension, 'business', 5),
     ('challenge'::match_dimension, 'time', 1),
     ('challenge'::match_dimension, 'organization', 5),
     ('challenge'::match_dimension, 'motivation', 2),
     ('challenge'::match_dimension, 'goals', 4),
     ('challenge'::match_dimension, 'balance', 3),
     ('style'::match_dimension, 'minimal', 3),
     ('style'::match_dimension, 'detailed', 5),
     ('style'::match_dimension, 'visual', 2),
     ('style'::match_dimension, 'flexible', 2),
     ('cadence'::match_dimension, 'daily', 1),
     ('cadence'::match_dimension, 'weekly', 3),
     ('cadence'::match_dimension, 'monthly', 5)
  ) as v(dimension, option_key, weight)
  where p.slug = 'budget-finance-tracker';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Training Split', 0 from public.products where slug = 'strong-fitness-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Workout Log', 1 from public.products where slug = 'strong-fitness-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Meals', 2 from public.products where slug = 'strong-fitness-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Recovery', 3 from public.products where slug = 'strong-fitness-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Goals', 4 from public.products where slug = 'strong-fitness-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Training split templates', 0 from public.products where slug = 'strong-fitness-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Progressive overload logs', 1 from public.products where slug = 'strong-fitness-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Body & energy check-ins', 2 from public.products where slug = 'strong-fitness-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Meal planning pages', 3 from public.products where slug = 'strong-fitness-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Sleep & recovery tracker', 4 from public.products where slug = 'strong-fitness-planner';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 1),
     ('purpose'::match_dimension, 'work', 1),
     ('purpose'::match_dimension, 'personal', 4),
     ('purpose'::match_dimension, 'fitness', 5),
     ('purpose'::match_dimension, 'business', 1),
     ('challenge'::match_dimension, 'time', 2),
     ('challenge'::match_dimension, 'organization', 3),
     ('challenge'::match_dimension, 'motivation', 5),
     ('challenge'::match_dimension, 'goals', 5),
     ('challenge'::match_dimension, 'balance', 4),
     ('style'::match_dimension, 'minimal', 2),
     ('style'::match_dimension, 'detailed', 4),
     ('style'::match_dimension, 'visual', 4),
     ('style'::match_dimension, 'flexible', 3),
     ('cadence'::match_dimension, 'daily', 5),
     ('cadence'::match_dimension, 'weekly', 4),
     ('cadence'::match_dimension, 'monthly', 2)
  ) as v(dimension, option_key, weight)
  where p.slug = 'strong-fitness-planner';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Pipeline', 0 from public.products where slug = 'studio-business-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Projects', 1 from public.products where slug = 'studio-business-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Content Calendar', 2 from public.products where slug = 'studio-business-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Numbers', 3 from public.products where slug = 'studio-business-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Goals', 4 from public.products where slug = 'studio-business-planner';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Notes', 5 from public.products where slug = 'studio-business-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Client pipeline board', 0 from public.products where slug = 'studio-business-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Project & delivery trackers', 1 from public.products where slug = 'studio-business-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, '90-day content calendar', 2 from public.products where slug = 'studio-business-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Monthly numbers dashboard', 3 from public.products where slug = 'studio-business-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Invoice & expense log', 4 from public.products where slug = 'studio-business-planner';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Offer planning worksheets', 5 from public.products where slug = 'studio-business-planner';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 1),
     ('purpose'::match_dimension, 'work', 4),
     ('purpose'::match_dimension, 'personal', 1),
     ('purpose'::match_dimension, 'fitness', 1),
     ('purpose'::match_dimension, 'business', 5),
     ('challenge'::match_dimension, 'time', 4),
     ('challenge'::match_dimension, 'organization', 5),
     ('challenge'::match_dimension, 'motivation', 3),
     ('challenge'::match_dimension, 'goals', 5),
     ('challenge'::match_dimension, 'balance', 3),
     ('style'::match_dimension, 'minimal', 2),
     ('style'::match_dimension, 'detailed', 5),
     ('style'::match_dimension, 'visual', 3),
     ('style'::match_dimension, 'flexible', 3),
     ('cadence'::match_dimension, 'daily', 2),
     ('cadence'::match_dimension, 'weekly', 5),
     ('cadence'::match_dimension, 'monthly', 5)
  ) as v(dimension, option_key, weight)
  where p.slug = 'studio-business-planner';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Daily Prompts', 0 from public.products where slug = 'softlight-journal';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Mood Log', 1 from public.products where slug = 'softlight-journal';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Weekly Memories', 2 from public.products where slug = 'softlight-journal';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Reflection', 3 from public.products where slug = 'softlight-journal';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Morning & evening prompts', 0 from public.products where slug = 'softlight-journal';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Mood colour strip', 1 from public.products where slug = 'softlight-journal';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Weekly kindness page', 2 from public.products where slug = 'softlight-journal';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Monthly memory spread', 3 from public.products where slug = 'softlight-journal';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Undated — start any day', 4 from public.products where slug = 'softlight-journal';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 2),
     ('purpose'::match_dimension, 'work', 1),
     ('purpose'::match_dimension, 'personal', 5),
     ('purpose'::match_dimension, 'fitness', 3),
     ('purpose'::match_dimension, 'business', 1),
     ('challenge'::match_dimension, 'time', 1),
     ('challenge'::match_dimension, 'organization', 1),
     ('challenge'::match_dimension, 'motivation', 5),
     ('challenge'::match_dimension, 'goals', 2),
     ('challenge'::match_dimension, 'balance', 5),
     ('style'::match_dimension, 'minimal', 4),
     ('style'::match_dimension, 'detailed', 1),
     ('style'::match_dimension, 'visual', 4),
     ('style'::match_dimension, 'flexible', 5),
     ('cadence'::match_dimension, 'daily', 5),
     ('cadence'::match_dimension, 'weekly', 3),
     ('cadence'::match_dimension, 'monthly', 2)
  ) as v(dimension, option_key, weight)
  where p.slug = 'softlight-journal';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Stickers', 0 from public.products where slug = 'stationery-sticker-kit';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Washi', 1 from public.products where slug = 'stationery-sticker-kit';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Textures', 2 from public.products where slug = 'stationery-sticker-kit';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Banners', 3 from public.products where slug = 'stationery-sticker-kit';
insert into public.product_includes (product_id, label, sort_order)
  select id, '480 pre-cropped PNG stickers', 0 from public.products where slug = 'stationery-sticker-kit';
insert into public.product_includes (product_id, label, sort_order)
  select id, '24 washi tape strips', 1 from public.products where slug = 'stationery-sticker-kit';
insert into public.product_includes (product_id, label, sort_order)
  select id, '12 paper textures', 2 from public.products where slug = 'stationery-sticker-kit';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Header & date banners', 3 from public.products where slug = 'stationery-sticker-kit';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'GoodNotes sticker book file', 4 from public.products where slug = 'stationery-sticker-kit';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 4),
     ('purpose'::match_dimension, 'work', 2),
     ('purpose'::match_dimension, 'personal', 4),
     ('purpose'::match_dimension, 'fitness', 2),
     ('purpose'::match_dimension, 'business', 2),
     ('challenge'::match_dimension, 'time', 1),
     ('challenge'::match_dimension, 'organization', 2),
     ('challenge'::match_dimension, 'motivation', 4),
     ('challenge'::match_dimension, 'goals', 1),
     ('challenge'::match_dimension, 'balance', 2),
     ('style'::match_dimension, 'minimal', 1),
     ('style'::match_dimension, 'detailed', 2),
     ('style'::match_dimension, 'visual', 5),
     ('style'::match_dimension, 'flexible', 5),
     ('cadence'::match_dimension, 'daily', 3),
     ('cadence'::match_dimension, 'weekly', 3),
     ('cadence'::match_dimension, 'monthly', 3)
  ) as v(dimension, option_key, weight)
  where p.slug = 'stationery-sticker-kit';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'To-Do', 0 from public.products where slug = 'printable-desk-set';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Weekly Dashboard', 1 from public.products where slug = 'printable-desk-set';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Meals', 2 from public.products where slug = 'printable-desk-set';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Projects', 3 from public.products where slug = 'printable-desk-set';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Daily to-do pad', 0 from public.products where slug = 'printable-desk-set';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Weekly dashboard', 1 from public.products where slug = 'printable-desk-set';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Meal planner + grocery list', 2 from public.products where slug = 'printable-desk-set';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Project one-pager', 3 from public.products where slug = 'printable-desk-set';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Ink-friendly versions', 4 from public.products where slug = 'printable-desk-set';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 3),
     ('purpose'::match_dimension, 'work', 4),
     ('purpose'::match_dimension, 'personal', 4),
     ('purpose'::match_dimension, 'fitness', 2),
     ('purpose'::match_dimension, 'business', 3),
     ('challenge'::match_dimension, 'time', 3),
     ('challenge'::match_dimension, 'organization', 4),
     ('challenge'::match_dimension, 'motivation', 2),
     ('challenge'::match_dimension, 'goals', 2),
     ('challenge'::match_dimension, 'balance', 3),
     ('style'::match_dimension, 'minimal', 5),
     ('style'::match_dimension, 'detailed', 2),
     ('style'::match_dimension, 'visual', 2),
     ('style'::match_dimension, 'flexible', 4),
     ('cadence'::match_dimension, 'daily', 4),
     ('cadence'::match_dimension, 'weekly', 5),
     ('cadence'::match_dimension, 'monthly', 1)
  ) as v(dimension, option_key, weight)
  where p.slug = 'printable-desk-set';

insert into public.product_sections (product_id, label, sort_order)
  select id, 'Semester Map', 0 from public.products where slug = 'academic-year-bundle';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Daily Timetable', 1 from public.products where slug = 'academic-year-bundle';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Assignments', 2 from public.products where slug = 'academic-year-bundle';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Revision Log', 3 from public.products where slug = 'academic-year-bundle';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Habit Tracker', 4 from public.products where slug = 'academic-year-bundle';
insert into public.product_sections (product_id, label, sort_order)
  select id, 'Stickers', 5 from public.products where slug = 'academic-year-bundle';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Balanced Student Planner', 0 from public.products where slug = 'academic-year-bundle';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Focused Student Planner', 1 from public.products where slug = 'academic-year-bundle';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Notion Student Hub', 2 from public.products where slug = 'academic-year-bundle';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Sticker & stationery kit', 3 from public.products where slug = 'academic-year-bundle';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Bonus: exam survival guide', 4 from public.products where slug = 'academic-year-bundle';
insert into public.product_includes (product_id, label, sort_order)
  select id, 'Lifetime free updates', 5 from public.products where slug = 'academic-year-bundle';
insert into public.product_match_weights (product_id, dimension, option_key, weight)
  select p.id, v.dimension, v.option_key, v.weight from public.products p,
  (values
     ('purpose'::match_dimension, 'university', 5),
     ('purpose'::match_dimension, 'work', 2),
     ('purpose'::match_dimension, 'personal', 2),
     ('purpose'::match_dimension, 'fitness', 1),
     ('purpose'::match_dimension, 'business', 1),
     ('challenge'::match_dimension, 'time', 4),
     ('challenge'::match_dimension, 'organization', 5),
     ('challenge'::match_dimension, 'motivation', 4),
     ('challenge'::match_dimension, 'goals', 4),
     ('challenge'::match_dimension, 'balance', 4),
     ('style'::match_dimension, 'minimal', 2),
     ('style'::match_dimension, 'detailed', 5),
     ('style'::match_dimension, 'visual', 4),
     ('style'::match_dimension, 'flexible', 3),
     ('cadence'::match_dimension, 'daily', 4),
     ('cadence'::match_dimension, 'weekly', 5),
     ('cadence'::match_dimension, 'monthly', 4)
  ) as v(dimension, option_key, weight)
  where p.slug = 'academic-year-bundle';

-- --------------------------------------------------------- promo codes
insert into public.promo_codes (code, label, percent_off) values
  ('PLANA15',   '15% welcome', 15.00),
  ('STUDENT20', '20% student', 20.00),
  ('BUNDLE10',  '10% bundle',  10.00)
on conflict (code) do update set label = excluded.label, percent_off = excluded.percent_off;

commit;
