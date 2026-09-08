# PLANA — Digital Planner Studio

A premium, fully functional storefront and planning experience for a fictional
digital-product brand, built with **HTML, CSS and vanilla JavaScript only** —
no frameworks, no build step, no backend, no external APIs.

> Portfolio project · Front-End Development & UI/UX

---

## Run it

Open `index.html` in a browser, or serve the folder for a clean origin
(recommended, so `localStorage` behaves exactly like production):

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

---

## One page, eight views

The whole site is a **single HTML document**. Each "page" — including the
login screen — is a `<section class="view">` inside it, and a small hash router in `main.js` shows
one at a time — so navigation is instant, state (cart, filters, builder) never
reloads, and every view still has its own linkable, bookmarkable, back-button
friendly URL.

| Route | View |
| --- | --- |
| `#login` · `#login?tab=signup` | **The entry gate** — sign in, create an account, or continue as a guest |
| `#home` | Hero, featured products, categories, PLANA Match teaser, best sellers, testimonials |
| `#shop` · `#shop?cat=Journals&sort=rating&fav=1` | Search, category / price filters, sorting, favourites, quick preview |
| `#product/<slug>` | Product details with an interactive preview gallery |
| `#plan` · `#plan?start=university` | **PLANA MATCH** — the four-question recommendation engine |
| `#customize` · `#customize?from=<slug>` | Custom planner builder with a live SVG preview and live pricing |
| `#about` · `#about?to=faq` | Brand story, stats, timeline, team, FAQ |
| `#cart` · `#cart?to=checkout` | Cart, promo codes, checkout with validation, order confirmation |

**Everything sits behind the login view.** On first load the router checks for a
session; if there is none it remembers where you were heading, sends you to
`#login`, and drops you back on that exact route once you are in — so
`#product/notion-life-os` still works as a shared link, it just asks who you
are first. While the gate is up, the announcement bar, nav, newsletter and
footer are hidden so the screen is only the sign-in experience.

The shop writes its own filters back into the hash as you use it, so a filtered
view can be copied and shared. A hash that is not a route but *is* an element
on screen (the skip link's `#main`) is treated as a plain anchor jump instead
of a navigation.

## Code

```
index.html        The whole site: shared shell (nav, newsletter, footer) + 8 view sections
css/style.css     Design system: tokens → base → components → page blocks → auth → responsive
js/products.js    Catalogue data, SVG mockup engine, shop + product-detail controllers
js/auth.js        Sign in / sign up / guest, session handling, the header account menu
js/main.js        Router + gate, theme, nav, scroll reveal, toasts, modal, validation, home
js/cart.js        Cart & wishlist state, cart drawer, cart view, checkout flow
js/planner.js     PLANA MATCH scoring engine + the custom planner builder
```

Each view controller is initialised once and then reacts to a `plana:route`
event, so the product view re-renders per slug, the shop applies incoming
filters, the builder re-seeds from `?from=`, and the cart rebuilds itself after
an order.

### The mockup engine
There are **no image files in this project**. Every planner cover, spread and
inner page is generated as SVG at runtime by `plannerArt()` in `products.js`,
from the product's palette, motif, layout and section list. That is why the
custom builder can preview a planner that does not exist yet, and why every
visual stays crisp at any size and adapts to dark mode.

### The PLANA MATCH algorithm
Each product declares a 0–5 weight for every possible answer across four
dimensions. Answers are combined as a weighted sum:

| Dimension | Weight |
| --- | --- |
| What you are planning for | ×1.30 |
| Your biggest challenge | ×1.15 |
| How you prefer to plan | ×1.00 |
| Your planning rhythm | ×0.85 |

The score is normalised against the theoretical maximum, nudged slightly by
rating and review volume so ties break sensibly, and mapped onto a 58–98%
match band. The winning product's reasons, suggested sections, weekly
structure and productivity tips are all generated from the same answers, so
the explanation always agrees with the recommendation.

## Accounts (demo only)

| | |
| --- | --- |
| Demo login | `demo@plana.studio` / `plana1234` |
| Create account | Name, email, password with a live strength meter, confirmation, terms |
| Guest | One click into the app; the session lasts for the tab only |
| Keep me signed in | On → `localStorage`; off → `sessionStorage` |

There is no server, so this is **not real authentication**: accounts live in
this browser and the password is only run through a one-way, non-cryptographic
string hash so it is not sitting in storage as plain text. The form says so
out loud — never type a real password into a portfolio project.

## Features

- A login gate with sign in, account creation, guest access and a header
  account menu, with the intended route remembered across the sign-in
- Product search, multi-category filtering, price filtering and six sort modes,
  with the URL kept in sync so a filtered view can be shared
- Cart with quantities, promo codes (`PLANA15`, `STUDENT20`, `BUNDLE10`),
  slide-out drawer and a validated checkout that ends in a confirmation state
- Wishlist / favourites, persisted and reflected everywhere on the page
- Custom planner builder: type, theme, layout, sections, structure and cover,
  with a live preview, a transparent price breakdown and a saved draft
- Dark / light mode, applied before first paint so the page never flashes
- Toasts, modals, loading states, empty states, breadcrumbs, focus-visible
  styling, keyboard-navigable gallery tabs, `prefers-reduced-motion` support
- `localStorage` persistence for the cart, favourites, theme, saved build and
  last match result
- Responsive from 390px to 1920px with no horizontal scrolling on any view

## Notes

PLANA is fictional. The checkout is a demo: no payment is processed, no
network request is made, and nothing leaves the browser.
