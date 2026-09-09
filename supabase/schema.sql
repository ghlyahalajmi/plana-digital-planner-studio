-- ============================================================================
--  PLANA — Supabase schema
--  Run once in the Supabase SQL editor (or `supabase db push`), then seed.sql.
--
--  Conventions used throughout:
--    · Money is numeric(6,3) — Kuwaiti dinar carries three decimals (fils).
--      Never float: 0.1 + 0.2 must not cost the customer a fils.
--    · Every table has RLS enabled. The anon key is public by design, so the
--      policies below are the actual security boundary, not an extra.
--    · Catalogue tables are world-readable; anything belonging to a person is
--      readable only by that person.
-- ============================================================================

-- ---------------------------------------------------------------- extensions
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- case-insensitive email

-- --------------------------------------------------------------------- types
do $$ begin
  create type product_badge as enum ('popular', 'new', 'sale');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('pending', 'paid', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  -- the four questions PLANA MATCH asks
  create type match_dimension as enum ('purpose', 'challenge', 'style', 'cadence');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------- utilities
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;


-- ============================================================================
--  1. PEOPLE
-- ============================================================================

-- Supabase Auth owns credentials in auth.users; this holds everything else.
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  country       text,
  marketing_opt_in boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- A row appears the moment someone signs up; full_name comes from the
-- metadata the sign-up form passes.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, country)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'country'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================================
--  2. CATALOGUE
--  Today this lives in a 16-object array in js/products.js, so every price
--  change is a redeploy. Here it is data.
-- ============================================================================

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       text not null,
  sort_order int  not null default 0
);

create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  category_id   uuid not null references public.categories(id) on delete restrict,

  price_kd      numeric(6,3) not null check (price_kd >= 0),
  old_price_kd  numeric(6,3)          check (old_price_kd is null or old_price_kd > price_kd),
  currency      char(3) not null default 'KWD',

  badge         product_badge,
  short         text not null,
  description   text not null,

  pages         int  not null check (pages > 0),
  file_format   text not null,
  compatibility text not null,

  -- drives the generated SVG mockups (no image files in this project)
  palette       text not null default 'lavender',
  cover_motif   text not null default 'arch',
  layout        text not null default 'weekly',

  is_active     boolean not null default true,
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx   on public.products(is_active) where is_active;
-- powers the shop's free-text search
create index if not exists products_search_idx on public.products
  using gin (to_tsvector('english', name || ' ' || short || ' ' || description));

-- "Sections inside" and "What's included" — ordered lists, so their own rows.
create table if not exists public.product_sections (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label      text not null,
  sort_order int  not null default 0,
  unique (product_id, label)
);

create table if not exists public.product_includes (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label      text not null,
  sort_order int  not null default 0
);

-- The PLANA MATCH model: each product scores 0–5 against every possible
-- answer. Keeping it in a table means the recommendations can be tuned
-- without shipping new JavaScript.
create table if not exists public.product_match_weights (
  product_id uuid not null references public.products(id) on delete cascade,
  dimension  match_dimension not null,
  option_key text not null,
  weight     smallint not null check (weight between 0 and 5),
  primary key (product_id, dimension, option_key)
);

-- The actual downloadable files live in a private Storage bucket; this table
-- records what belongs to what.
create table if not exists public.product_files (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  storage_path text not null,            -- e.g. planner-files/p01/balanced-student.pdf
  label        text not null,
  byte_size    bigint,
  created_at   timestamptz not null default now()
);


-- ============================================================================
--  3. REVIEWS  (the site currently hard-codes rating + review count)
-- ============================================================================

create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  rating     smallint not null check (rating between 1 and 5),
  title      text,
  body       text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)           -- one review per person per product
);

create index if not exists reviews_product_idx on public.reviews(product_id) where is_approved;

-- One query for the whole shop grid: product + its rating summary.
create or replace view public.product_cards as
select
  p.id, p.slug, p.name, p.price_kd, p.old_price_kd, p.currency, p.badge,
  p.short, p.pages, p.palette, p.cover_motif, p.layout, p.is_active,
  c.name as category,
  c.slug as category_slug,
  coalesce(round(avg(r.rating) filter (where r.is_approved), 1), 0) as rating,
  count(r.*) filter (where r.is_approved)                           as reviews_count
from public.products p
join public.categories c on c.id = p.category_id
left join public.reviews r on r.product_id = p.id
where p.is_active
group by p.id, c.name, c.slug;


-- ============================================================================
--  4. SHOPPING
--  Guests keep their cart in localStorage; once signed in it lives here, so
--  it survives a new device. That is the whole point of the login gate.
-- ============================================================================

create table if not exists public.favourites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- A planner built in the custom studio. Priced server-side, same as products.
create table if not exists public.custom_planners (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  planner_type text not null,            -- student | work | personal | fitness | business
  theme      text not null,
  layout     text not null,
  motif      text not null,
  structure  text not null,
  goal       text,
  sections   text[] not null default '{}',
  price_kd   numeric(6,3) not null check (price_kd >= 0),
  created_at timestamptz not null default now()
);

create index if not exists custom_planners_user_idx on public.custom_planners(user_id);

create table if not exists public.carts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  promo_code text,
  updated_at timestamptz not null default now()
);

create trigger carts_updated_at before update on public.carts
  for each row execute function public.set_updated_at();

create table if not exists public.cart_items (
  id                uuid primary key default gen_random_uuid(),
  cart_id           uuid not null references public.carts(id) on delete cascade,
  product_id        uuid references public.products(id) on delete cascade,
  custom_planner_id uuid references public.custom_planners(id) on delete cascade,
  qty               int  not null default 1 check (qty between 1 and 20),
  added_at          timestamptz not null default now(),
  -- exactly one of the two, never both, never neither
  constraint cart_item_target check (num_nonnulls(product_id, custom_planner_id) = 1),
  unique (cart_id, product_id),
  unique (cart_id, custom_planner_id)
);

create table if not exists public.promo_codes (
  code        text primary key,
  label       text not null,
  percent_off numeric(5,2) not null check (percent_off > 0 and percent_off <= 100),
  is_active   boolean not null default true,
  valid_from  timestamptz,
  valid_until timestamptz,
  max_uses    int,
  times_used  int not null default 0
);


-- ============================================================================
--  5. ORDERS
-- ============================================================================

create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id      uuid references auth.users(id) on delete set null,

  email        text not null,
  first_name   text not null,
  last_name    text not null,
  country      text not null,

  subtotal_kd  numeric(8,3) not null check (subtotal_kd >= 0),
  discount_kd  numeric(8,3) not null default 0 check (discount_kd >= 0),
  total_kd     numeric(8,3) not null check (total_kd >= 0),
  currency     char(3) not null default 'KWD',
  promo_code   text references public.promo_codes(code),

  status       order_status not null default 'pending',
  created_at   timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders(user_id, created_at desc);

-- Names and prices are SNAPSHOTS. Products get re-priced; a past order must
-- never change because of it.
create table if not exists public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders(id) on delete cascade,
  product_id        uuid references public.products(id) on delete set null,
  custom_planner_id uuid references public.custom_planners(id) on delete set null,
  name_snapshot     text not null,
  unit_price_kd     numeric(6,3) not null check (unit_price_kd >= 0),
  qty               int not null check (qty > 0)
);

-- "Lifetime access to every file you download" — this table is that promise.
create table if not exists public.entitlements (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete cascade,
  order_id      uuid references public.orders(id) on delete set null,
  granted_at    timestamptz not null default now(),
  download_count int not null default 0,
  last_downloaded_at timestamptz,
  unique (user_id, product_id)
);


-- ============================================================================
--  6. ENGAGEMENT
-- ============================================================================

-- Every quiz run. Comparing what the model recommends against what people
-- actually buy is how the weights get tuned.
create table if not exists public.match_results (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid references auth.users(id) on delete set null,
  answers                 jsonb not null,     -- {purpose, challenge, style, cadence}
  recommended_product_id  uuid references public.products(id) on delete set null,
  score                   smallint not null check (score between 0 and 100),
  created_at              timestamptz not null default now()
);

create index if not exists match_results_product_idx on public.match_results(recommended_product_id);

create table if not exists public.newsletter_subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        citext,
  source       text not null default 'footer',
  is_confirmed boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (email)
);


-- ============================================================================
--  7. ROW LEVEL SECURITY
--  The anon key ships inside the page, so these policies are the security
--  model. Enable first, then grant back exactly what is safe.
-- ============================================================================

alter table public.profiles              enable row level security;
alter table public.categories            enable row level security;
alter table public.products              enable row level security;
alter table public.product_sections      enable row level security;
alter table public.product_includes      enable row level security;
alter table public.product_match_weights enable row level security;
alter table public.product_files         enable row level security;
alter table public.reviews               enable row level security;
alter table public.favourites            enable row level security;
alter table public.custom_planners       enable row level security;
alter table public.carts                 enable row level security;
alter table public.cart_items            enable row level security;
alter table public.promo_codes           enable row level security;
alter table public.orders                enable row level security;
alter table public.order_items           enable row level security;
alter table public.entitlements          enable row level security;
alter table public.match_results         enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- The view must run as the caller, or it would quietly bypass the policies
-- on the tables underneath it.
alter view public.product_cards set (security_invoker = on);

-- ---------------------------------------------------------------- catalogue
-- Anyone, signed in or not, can browse the shop.
create policy "catalogue is public" on public.categories            for select using (true);
create policy "catalogue is public" on public.products              for select using (is_active);
create policy "catalogue is public" on public.product_sections      for select using (true);
create policy "catalogue is public" on public.product_includes      for select using (true);
create policy "catalogue is public" on public.product_match_weights for select using (true);
create policy "active promos are public" on public.promo_codes      for select using (is_active);

-- Files are NOT public: you get the path only if you own the product.
create policy "files follow entitlements" on public.product_files for select
  using (exists (
    select 1 from public.entitlements e
    where e.product_id = product_files.product_id and e.user_id = auth.uid()
  ));

-- ------------------------------------------------------------------ reviews
create policy "approved reviews are public" on public.reviews for select
  using (is_approved or user_id = auth.uid());

create policy "write your own review" on public.reviews for insert
  with check (user_id = auth.uid());

create policy "edit your own review" on public.reviews for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "delete your own review" on public.reviews for delete
  using (user_id = auth.uid());

-- ----------------------------------------------------------------- profiles
create policy "read your own profile" on public.profiles for select
  using (id = auth.uid());

create policy "update your own profile" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- ------------------------------------------------- favourites & saved builds
create policy "own favourites" on public.favourites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own custom planners" on public.custom_planners for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- --------------------------------------------------------------------- cart
create policy "own cart" on public.carts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own cart items" on public.cart_items for all
  using (exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid()));

-- ------------------------------------------------------------------- orders
-- Read only. There is deliberately no INSERT policy: orders are created by
-- place_order() below, which recomputes every figure from the catalogue.
-- A client that could insert its own order could also set the total to zero.
create policy "read your own orders" on public.orders for select
  using (user_id = auth.uid());

create policy "read your own order items" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid()));

create policy "read your own entitlements" on public.entitlements for select
  using (user_id = auth.uid());

-- --------------------------------------------------------------- engagement
-- Quiz results can be recorded by signed-out visitors too, but nobody can
-- read anyone else's.
create policy "anyone can record a match" on public.match_results for insert
  with check (user_id is null or user_id = auth.uid());

create policy "read your own matches" on public.match_results for select
  using (user_id = auth.uid());

create policy "anyone can subscribe" on public.newsletter_subscribers for insert
  with check (true);


-- ============================================================================
--  8. CHECKOUT
--  The one piece of real business logic. The browser sends who it is and
--  where to email the files — nothing else. Prices, the discount and the
--  total are all recomputed here from the catalogue, so editing a price in
--  DevTools changes nothing that matters.
-- ============================================================================

create or replace function public.place_order(
  p_email      text,
  p_first_name text,
  p_last_name  text,
  p_country    text
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user      uuid := auth.uid();
  v_cart      public.carts;
  v_order     public.orders;
  v_subtotal  numeric(8,3) := 0;
  v_discount  numeric(8,3) := 0;
  v_percent   numeric(5,2) := 0;
  v_number    text;
begin
  if v_user is null then
    raise exception 'You must be signed in to place an order';
  end if;

  select * into v_cart from public.carts where user_id = v_user;
  if v_cart is null then
    raise exception 'No cart to check out';
  end if;

  -- Line totals straight from the catalogue, never from the request.
  select coalesce(sum(coalesce(p.price_kd, cp.price_kd) * ci.qty), 0)
    into v_subtotal
  from public.cart_items ci
  left join public.products        p  on p.id  = ci.product_id
  left join public.custom_planners cp on cp.id = ci.custom_planner_id
  where ci.cart_id = v_cart.id;

  if v_subtotal <= 0 then
    raise exception 'Your cart is empty';
  end if;

  -- Promo validity is decided here as well.
  if v_cart.promo_code is not null then
    select percent_off into v_percent
    from public.promo_codes
    where code = v_cart.promo_code
      and is_active
      and (valid_from  is null or valid_from  <= now())
      and (valid_until is null or valid_until >= now())
      and (max_uses    is null or times_used   < max_uses);
    v_percent := coalesce(v_percent, 0);
  end if;

  -- Round to whole fils so subtotal - discount = total, exactly.
  v_discount := round(v_subtotal * v_percent / 100, 3);
  v_number   := 'PLANA-' || lpad((floor(random() * 900000) + 100000)::text, 6, '0');

  insert into public.orders (order_number, user_id, email, first_name, last_name,
                             country, subtotal_kd, discount_kd, total_kd, promo_code, status)
  values (v_number, v_user, p_email, p_first_name, p_last_name,
          p_country, v_subtotal, v_discount, v_subtotal - v_discount,
          case when v_percent > 0 then v_cart.promo_code end, 'paid')
  returning * into v_order;

  -- Snapshot the lines.
  insert into public.order_items (order_id, product_id, custom_planner_id,
                                  name_snapshot, unit_price_kd, qty)
  select v_order.id, ci.product_id, ci.custom_planner_id,
         coalesce(p.name, cp.name),
         coalesce(p.price_kd, cp.price_kd),
         ci.qty
  from public.cart_items ci
  left join public.products        p  on p.id  = ci.product_id
  left join public.custom_planners cp on cp.id = ci.custom_planner_id
  where ci.cart_id = v_cart.id;

  -- Grant lifetime access to each catalogue product bought.
  insert into public.entitlements (user_id, product_id, order_id)
  select v_user, ci.product_id, v_order.id
  from public.cart_items ci
  where ci.cart_id = v_cart.id and ci.product_id is not null
  on conflict (user_id, product_id) do nothing;

  if v_percent > 0 then
    update public.promo_codes set times_used = times_used + 1
    where code = v_cart.promo_code;
  end if;

  delete from public.cart_items where cart_id = v_cart.id;
  update public.carts set promo_code = null where id = v_cart.id;

  return v_order;
end $$;

revoke all on function public.place_order(text, text, text, text) from public, anon;
grant execute on function public.place_order(text, text, text, text) to authenticated;
