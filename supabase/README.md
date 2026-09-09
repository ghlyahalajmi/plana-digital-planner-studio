# PLANA — Supabase setup

Four steps, about five minutes.

## 1. Create the project

[database.new](https://database.new) → pick a region close to Kuwait
(`eu-central-1` is the usual choice) and save the database password somewhere
safe.

## 2. Run the SQL

Supabase dashboard → **SQL Editor** → paste and run, in this order:

1. `schema.sql` — tables, row level security, the `place_order()` function
2. `seed.sql` — 8 categories, 16 products, 79 sections, 86 includes,
   272 match weights, 3 promo codes

Both are idempotent: running them again updates rather than duplicates.

## 3. Point the site at it

**Project Settings → API**, then fill in the two values at the top of
`index.html`:

```js
window.PLANA_SUPABASE = {
  url: 'https://YOUR-PROJECT.supabase.co',
  anonKey: 'eyJhbGciOi...'          // the anon public key
};
```

Both are safe in client code — the anon key only identifies the project, and
row level security decides what it can touch. **Never put the `service_role`
key in the browser.** Leave the values blank and the site falls back to local
demo mode, which is how it runs with no backend at all.

## 4. Authentication settings

**Authentication → Providers → Email**:

- *Confirm email* **on** is the safer default; the sign-up form handles it and
  tells people to check their inbox.
- Turn it **off** if you want a portfolio reviewer to be able to create an
  account and land straight in the app.

**Authentication → URL Configuration** → add your site URL
(`https://plana-digital-planner-studio.vercel.app`) so password-reset links
come back to the right place.

---

## What the schema covers

| Area | Tables |
| --- | --- |
| People | `profiles` (+ Supabase's own `auth.users`) |
| Catalogue | `categories`, `products`, `product_sections`, `product_includes`, `product_match_weights`, `product_files` |
| Social proof | `reviews`, and the `product_cards` view that averages them |
| Shopping | `favourites`, `custom_planners`, `carts`, `cart_items`, `promo_codes` |
| Orders | `orders`, `order_items`, `entitlements` |
| Engagement | `match_results`, `newsletter_subscribers` |

Four decisions worth pointing at in a code review:

1. **`numeric(6,3)`, never `float`.** The dinar carries three decimals and
   floating point rounds wrong. Totals settle in whole fils.
2. **`order_items` snapshots the name and price.** Products get re-priced; a
   past order must not change because of it.
3. **There is no INSERT policy on `orders`.** Orders are created only by
   `place_order()`, which recomputes the subtotal, the promo discount and the
   total from the catalogue. A client that could insert its own order could
   also set the total to zero.
4. **`product_files` is readable only through `entitlements`.** The real
   planner PDFs belong in a private Storage bucket handed out as signed URLs,
   never a guessable public path.

## Status

Live once configured: authentication (sign up, sign in, reset, sessions),
`match_results`, `newsletter_subscribers`.

Scaffolded, ready for the next phase: reading the catalogue from Postgres
instead of `js/products.js`, syncing favourites and the cart to the account,
and running checkout through `place_order()`.
