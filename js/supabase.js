/* ==========================================================================
   PLANA — supabase.js
   Connects the front end to Supabase, and degrades gracefully when it is not
   configured.

   The whole site is designed to work either way:
     · Configured  → real accounts, real sessions, data in Postgres.
     · Unconfigured→ the original local demo mode, so the portfolio build
                     still runs from a file:// double-click with no backend.

   Set the two values in index.html. The anon key is meant to be public — it
   identifies the project, it does not authorise anything. Row Level Security
   in supabase/schema.sql is what actually protects the data. The service_role
   key must NEVER appear in client code.
   ========================================================================== */
(function () {
  'use strict';
  /* What is wired up today:
       · recordMatch()  — every PLANA MATCH run is stored
       · subscribe()    — the newsletter form writes a real row
       · auth (js/auth.js) — real accounts, sessions and password reset

     Ready for the next phase, not yet driving the UI:
       · products() / productBySlug() — the shop still renders from
         js/products.js so the site works with no backend at all
       · favourites() / setFavourite()
       · placeOrder() — needs the cart mirrored into carts/cart_items first;
         the SQL function it calls already exists in supabase/schema.sql */

  const P = (window.PLANA = window.PLANA || {});
  const cfg = window.PLANA_SUPABASE || {};

  const configured = Boolean(
    cfg.url && cfg.anonKey &&
    /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(cfg.url.trim())
  );

  let client = null;
  if (configured && window.supabase && typeof window.supabase.createClient === 'function') {
    client = window.supabase.createClient(cfg.url.trim(), cfg.anonKey.trim(), {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
  }

  /**
   * PLANA.db.enabled tells every other module which mode it is running in.
   * Nothing else in the codebase talks to Supabase directly.
   */
  const db = {
    enabled: Boolean(client),
    client,
    configured,

    /** Why the connection is not live — shown once in the console, not to users. */
    reason() {
      if (client) return null;
      if (!configured) return 'No Supabase project configured (window.PLANA_SUPABASE in index.html).';
      if (!window.supabase) return 'The supabase-js library did not load.';
      return 'Unknown Supabase initialisation problem.';
    },

    /* ------------------------------------------------------------------ *
     * Catalogue                                                          *
     * The shop still renders from js/products.js so the site works        *
     * offline; when the database is live these read the same shape back   *
     * out of Postgres, which is what a second phase would switch over to. *
     * ------------------------------------------------------------------ */
    async products() {
      if (!client) return null;
      const { data, error } = await client
        .from('product_cards')
        .select('*')
        .order('name');
      if (error) { console.warn('[plana] products:', error.message); return null; }
      return data;
    },

    async productBySlug(slug) {
      if (!client) return null;
      const { data, error } = await client
        .from('products')
        .select('*, categories(name, slug), product_sections(label, sort_order), product_includes(label, sort_order)')
        .eq('slug', slug)
        .single();
      if (error) { console.warn('[plana] product:', error.message); return null; }
      return data;
    },

    /* ------------------------------------------------------------------ *
     * Engagement                                                          *
     * ------------------------------------------------------------------ */

    /** Record a PLANA MATCH run. Works signed out too (user_id stays null). */
    async recordMatch(answers, productSlug, score) {
      if (!client) return;
      const { data: { user } } = await client.auth.getUser();
      let productId = null;
      if (productSlug) {
        const { data } = await client.from('products').select('id').eq('slug', productSlug).single();
        productId = data ? data.id : null;
      }
      const { error } = await client.from('match_results').insert({
        user_id: user ? user.id : null,
        answers,
        recommended_product_id: productId,
        score
      });
      if (error) console.warn('[plana] match:', error.message);
    },

    async subscribe(email, source) {
      if (!client) return { ok: true, offline: true };
      const { error } = await client
        .from('newsletter_subscribers')
        .insert({ email: email.trim().toLowerCase(), source: source || 'footer' });
      // A duplicate is a success from the visitor's point of view.
      if (error && error.code !== '23505') return { ok: false, message: error.message };
      return { ok: true };
    },

    /* ------------------------------------------------------------------ *
     * Favourites — mirrored to the database so they follow the account    *
     * ------------------------------------------------------------------ */
    async favourites() {
      if (!client) return null;
      const { data, error } = await client.from('favourites').select('product_id, products(slug)');
      if (error) { console.warn('[plana] favourites:', error.message); return null; }
      return data.map(r => r.products && r.products.slug).filter(Boolean);
    },

    async setFavourite(slug, on) {
      if (!client) return;
      const { data: { user } } = await client.auth.getUser();
      if (!user) return;
      const { data: prod } = await client.from('products').select('id').eq('slug', slug).single();
      if (!prod) return;
      const { error } = on
        ? await client.from('favourites').upsert({ user_id: user.id, product_id: prod.id })
        : await client.from('favourites').delete().eq('user_id', user.id).eq('product_id', prod.id);
      if (error) console.warn('[plana] favourite:', error.message);
    },

    /* ------------------------------------------------------------------ *
     * Checkout                                                            *
     * The browser sends who you are and where to email the files. Prices, *
     * the discount and the total are recomputed inside place_order().     *
     * ------------------------------------------------------------------ */
    async placeOrder(details) {
      if (!client) return null;
      const { data, error } = await client.rpc('place_order', {
        p_email: details.email,
        p_first_name: details.firstName,
        p_last_name: details.lastName,
        p_country: details.country
      });
      if (error) return { ok: false, message: error.message };
      return { ok: true, order: data };
    }
  };

  P.db = db;

  if (!db.enabled) {
    console.info('[plana] Running in local demo mode — ' + db.reason());
  }
})();
