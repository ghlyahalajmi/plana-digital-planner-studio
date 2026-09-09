/* ==========================================================================
   PLANA — cart.js
   Cart + wishlist state (persisted in localStorage), the slide-out cart
   drawer, the cart page, and the checkout flow with validation.
   ========================================================================== */
(function () {
  'use strict';
  const P = (window.PLANA = window.PLANA || {});
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

  const CART_KEY = 'plana:cart';
  const FAV_KEY  = 'plana:favs';
  const PROMOS = { PLANA15: { off: .15, label: '15% welcome' }, STUDENT20: { off: .20, label: '20% student' }, BUNDLE10: { off: .10, label: '10% bundle' } };
  const VAT_RATE = 0; // digital goods: price shown is the price paid

  /* Money is settled in whole fils (1 KD = 1000 fils). Rounding every total
     to the fils keeps the summary honest: subtotal − discount always equals
     the total the customer is charged, with no fractional remainder. */
  const fils = n => Math.round(n * 1000) / 1000;

  /* ======================================================================
     STATE
     ====================================================================== */
  const store = {
    items: P.storage.get(CART_KEY, []),
    favs:  P.storage.get(FAV_KEY, []),
    promo: null,

    save() {
      P.storage.set(CART_KEY, this.items);
      P.storage.set(FAV_KEY, this.favs);
      document.dispatchEvent(new CustomEvent('plana:cartchange'));
    },

    /** Add a catalogue product or a custom-built planner. */
    add(idOrCustom, qty = 1) {
      if (typeof idOrCustom === 'object') {        // custom planner
        const c = idOrCustom;
        this.items.push({ key: c.key, id: c.key, qty, custom: c });
      } else {
        const found = this.items.find(i => i.key === idOrCustom);
        if (found) found.qty += qty;
        else this.items.push({ key: idOrCustom, id: idOrCustom, qty });
      }
      this.save();
    },
    remove(key) { this.items = this.items.filter(i => i.key !== key); this.save(); },
    setQty(key, qty) {
      const it = this.items.find(i => i.key === key); if (!it) return;
      it.qty = Math.max(1, Math.min(20, qty));
      this.save();
    },
    clear() { this.items = []; this.promo = null; this.save(); },
    count() { return this.items.reduce((n, i) => n + i.qty, 0); },

    /** Resolve a cart line into displayable data (catalogue or custom). */
    detail(item) {
      if (item.custom) {
        return { name: item.custom.name, price: item.custom.price, category: 'Custom Planner',
                 meta: item.custom.sections.length + ' sections · ' + item.custom.themeLabel,
                 art: () => P.plannerArt({ palette: item.custom.palette, title: item.custom.name, subtitle: 'Custom', motif: item.custom.motif }),
                 href: '#customize' };
      }
      const p = P.getProduct(item.id);
      if (!p) return null;
      return { name: p.name, price: p.price, category: p.category, meta: p.pages + ' pages · ' + p.format.split('·')[0].trim(),
               art: () => P.plannerArt({ palette: p.palette, title: p.name, subtitle: p.category, motif: p.cover }),
               href: '#product/' + p.slug };
    },

    subtotal() {
      return fils(this.items.reduce((sum, i) => {
        const d = this.detail(i); return d ? sum + d.price * i.qty : sum;
      }, 0));
    },
    discount() {
      if (!this.promo || !PROMOS[this.promo]) return 0;
      return fils(this.subtotal() * PROMOS[this.promo].off);
    },
    total() { return fils(Math.max(0, this.subtotal() - this.discount()) * (1 + VAT_RATE)); },

    /* wishlist */
    isFav(id) { return this.favs.includes(id); },
    toggleFav(id) {
      const i = this.favs.indexOf(id);
      if (i > -1) this.favs.splice(i, 1); else this.favs.push(id);
      this.save();
      return this.favs.includes(id);
    }
  };
  P.store = store;
  P.PROMOS = PROMOS;

  /* ======================================================================
     BADGES
     ====================================================================== */
  function paintBadges(pop) {
    const n = store.count();
    $$('[data-cart-count]').forEach(el => {
      el.textContent = n;
      el.classList.toggle('on', n > 0);
      if (pop && n > 0) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
    });
    const f = store.favs.length;
    $$('[data-fav-count]').forEach(el => { el.textContent = f; el.classList.toggle('on', f > 0); });
    // keep every heart on the page in sync
    $$('[data-fav]').forEach(btn => btn.setAttribute('aria-pressed', String(store.isFav(btn.dataset.fav))));
  }

  /* ======================================================================
     CART DRAWER
     ====================================================================== */
  function ensureDrawer() {
    let d = $('#cart-drawer');
    if (d) return d;
    d = document.createElement('div');
    d.id = 'cart-drawer'; d.className = 'drawer'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Shopping cart');
    d.innerHTML = `<div class="scrim" data-drawer-close></div>
      <aside class="panel">
        <header class="d-head">
          <div><h3 style="font-size:1.25rem">Your cart</h3><span class="xs muted" data-drawer-sub></span></div>
          <button class="icon-btn" type="button" data-drawer-close aria-label="Close cart">
            <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </header>
        <div class="d-body" data-drawer-body></div>
        <footer class="d-foot" data-drawer-foot></footer>
      </aside>`;
    document.body.appendChild(d);
    $$('[data-drawer-close]', d).forEach(el => on(el, 'click', closeDrawer));
    on(document, 'keydown', e => { if (e.key === 'Escape' && d.classList.contains('open')) closeDrawer(); });
    return d;
  }
  function renderDrawer() {
    const d = ensureDrawer();
    const body = $('[data-drawer-body]', d), foot = $('[data-drawer-foot]', d), sub = $('[data-drawer-sub]', d);
    sub.textContent = store.count() ? store.count() + ' item' + (store.count() === 1 ? '' : 's') : 'Nothing here yet';
    if (!store.items.length) {
      body.innerHTML = `<div class="empty">
        <span class="art" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12l2 5H4z"/><path d="M5 7v13h14V7"/><path d="M9 11h6"/></svg>
        </span>
        <h3>Your cart is empty</h3>
        <p class="small">Browse the shop, or let PLANA MATCH pick a planner that actually fits your week.</p>
        <div class="row" style="justify-content:center;margin-top:8px">
          <a class="btn btn-primary btn-sm" href="#shop">Explore planners</a>
          <a class="btn btn-ghost btn-sm" href="#plan">Take the quiz</a>
        </div>
      </div>`;
      foot.innerHTML = '';
      return;
    }
    body.innerHTML = store.items.map(lineHTML).join('');
    foot.innerHTML = `
      <div class="sum-row"><span>Subtotal</span><b class="tabular">${P.money(store.subtotal())}</b></div>
      <div class="sum-row"><span>Delivery</span><span>Instant download</span></div>
      <a class="btn btn-primary btn-block" href="#cart">Checkout · ${P.money(store.total())}</a>
      <button class="btn btn-ghost btn-block btn-sm" type="button" data-drawer-close>Keep browsing</button>`;
    $$('[data-drawer-close]', foot).forEach(el => on(el, 'click', closeDrawer));
  }
  function openDrawer() {
    const d = ensureDrawer(); renderDrawer();
    d.classList.add('open'); document.body.classList.add('is-locked');
    const btn = $('.d-head button', d); if (btn) btn.focus();
  }
  function closeDrawer() {
    const d = $('#cart-drawer'); if (!d) return;
    d.classList.remove('open'); document.body.classList.remove('is-locked');
  }
  P.openCart = openDrawer;

  /* ======================================================================
     LINE ITEM MARKUP (shared by drawer + cart page)
     ====================================================================== */
  function lineHTML(item) {
    const d = store.detail(item); if (!d) return '';
    return `<div class="line" data-line="${item.key}">
      <a class="mini" href="${d.href}" aria-hidden="true" tabindex="-1">${d.art()}</a>
      <div>
        <h4><a href="${d.href}">${P.esc(d.name)}</a></h4>
        <div class="meta">${P.esc(d.meta)}</div>
        <div class="row" style="margin-top:8px;gap:10px">
          <span class="qty">
            <button type="button" data-dec="${item.key}" aria-label="Decrease quantity">−</button>
            <span aria-live="polite">${item.qty}</span>
            <button type="button" data-inc="${item.key}" aria-label="Increase quantity">+</button>
          </span>
          <button class="rm" type="button" data-rm="${item.key}">Remove</button>
        </div>
      </div>
      <div class="row-end" style="text-align:right">
        <b class="tabular">${P.money(d.price * item.qty)}</b>
      </div>
    </div>`;
  }

  /* ======================================================================
     DELEGATED ACTIONS — work for any card, anywhere, at any time
     ====================================================================== */
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) {
      const p = P.getProduct(add.dataset.add);
      if (!p) return;
      add.classList.add('is-loading');
      const label = add.textContent;
      setTimeout(() => {
        store.add(p.id, 1);
        add.classList.remove('is-loading');
        add.textContent = 'Added ✓';
        setTimeout(() => { add.textContent = label; }, 1500);
        P.toast('Added to cart', p.name, 'ok');
        if (add.dataset.openCart !== 'false') openDrawer();
      }, 320);
      return;
    }
    const fav = e.target.closest('[data-fav]');
    if (fav) {
      const nowFav = store.toggleFav(fav.dataset.fav);
      fav.classList.remove('beat'); void fav.offsetWidth; fav.classList.add('beat');
      const p = P.getProduct(fav.dataset.fav);
      P.toast(nowFav ? 'Saved to favourites' : 'Removed from favourites', p ? p.name : '', nowFav ? 'ok' : 'info', 2000);
      return;
    }
    const openC = e.target.closest('[data-open-cart]');
    if (openC) { e.preventDefault(); openDrawer(); return; }

    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), rm = e.target.closest('[data-rm]');
    if (inc || dec) {
      const key = (inc || dec).dataset[inc ? 'inc' : 'dec'];
      const it = store.items.find(i => i.key === key); if (!it) return;
      store.setQty(key, it.qty + (inc ? 1 : -1));
    }
    if (rm) {
      const d = store.detail(store.items.find(i => i.key === rm.dataset.rm) || {});
      store.remove(rm.dataset.rm);
      P.toast('Removed', d ? d.name : 'Item removed from your cart', 'info', 2200);
    }
  });

  /* ======================================================================
     CART PAGE
     ====================================================================== */
  function renderCartPage() {
    const root = $('#cart-root'); if (!root) return;
    const wishWrap = $('#wishlist-root');

    if (!store.items.length) {
      root.innerHTML = `<div class="card card-pad empty" style="grid-column:1/-1">
        <span class="art" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12l2 5H4z"/><path d="M5 7v13h14V7"/><path d="M9 11h6"/></svg>
        </span>
        <h3>Your cart is empty</h3>
        <p>Nothing to check out yet. Start with a best seller, or find your match in two minutes.</p>
        <div class="row" style="justify-content:center;margin-top:10px">
          <a class="btn btn-primary" href="#shop">Explore planners</a>
          <a class="btn btn-ghost" href="#plan">Take PLANA MATCH</a>
        </div>
      </div>`;
    } else {
      root.innerHTML = `
        <div class="cart-layout">
          <div class="stack">
            <div class="row-between">
              <h2 style="font-size:1.5rem">${store.count()} item${store.count() === 1 ? '' : 's'}</h2>
              <button class="rm" type="button" id="clear-cart">Clear cart</button>
            </div>
            <div class="stack" id="cart-lines">${store.items.map(lineHTML).join('')}</div>
            <div class="note">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/></svg>
              <span>Digital delivery — files land in your inbox the moment payment clears, plus lifetime access to updates.</span>
            </div>
          </div>
          <aside class="summary">
            <h3 style="font-size:1.2rem;margin-bottom:14px">Order summary</h3>
            <div class="sum-row"><span>Subtotal</span><b class="tabular">${P.money(store.subtotal())}</b></div>
            <div class="sum-row"><span>Delivery</span><span>Free · instant</span></div>
            ${store.promo ? `<div class="sum-row" style="color:var(--ok)"><span>Promo ${store.promo}</span><b class="tabular">−${P.money(store.discount())}</b></div>` : ''}
            <form class="promo-row" id="promo-form" novalidate>
              <label class="sr-only" for="promo">Promo code</label>
              <input class="input" id="promo" placeholder="Promo code" autocomplete="off">
              <button class="btn btn-soft btn-sm" type="submit">Apply</button>
            </form>
            <div class="sum-row total"><span>Total</span><b class="tabular">${P.money(store.total())}</b></div>
            <a class="btn btn-primary btn-block" href="#cart?to=checkout" style="margin-top:16px">Continue to checkout</a>
            <p class="xs muted" style="margin-top:12px;text-align:center">Try code <b>PLANA15</b> or <b>STUDENT20</b></p>
          </aside>
        </div>`;

      on($('#clear-cart'), 'click', () => {
        store.clear();
        P.toast('Cart cleared', 'Everything removed.', 'info');
      });
      on($('#promo-form'), 'submit', e => {
        e.preventDefault();
        const code = $('#promo').value.trim().toUpperCase();
        if (PROMOS[code]) { store.promo = code; P.toast('Promo applied', PROMOS[code].label + ' off your order.', 'ok'); renderCartPage(); }
        else P.toast('Invalid code', 'That promo code does not exist.', 'err');
      });
    }

    // Checkout section visibility follows the cart state
    const checkout = $('#checkout-section');
    if (checkout) checkout.hidden = !store.items.length;

    // Wishlist strip
    if (wishWrap) {
      const favs = store.favs.map(P.getProduct).filter(Boolean);
      wishWrap.parentElement.hidden = favs.length === 0;
      wishWrap.innerHTML = favs.map(p => P.productCardHTML(p)).join('');
      P.observeReveals(wishWrap);
    }
    paintCheckoutTotals();
  }

  function paintCheckoutTotals() {
    $$('[data-checkout-total]').forEach(el => { el.textContent = P.money(store.total()); });
  }

  /* ======================================================================
     CHECKOUT
     ====================================================================== */
  let cartViewHTML = null;     // pristine markup of the cart view
  let showingSuccess = false;  // true once an order has been "placed"

  function initCheckout() {
    const form = $('#checkout-form'); if (!form) return;

    // Light input masking keeps the form feeling considered
    const card = $('#cc-number', form);
    on(card, 'input', () => {
      card.value = card.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    });
    const exp = $('#cc-exp', form);
    on(exp, 'input', () => {
      let v = exp.value.replace(/\D/g, '').slice(0, 4);
      if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
      exp.value = v;
    });

    on(form, 'submit', e => {
      e.preventDefault();
      if (!P.validateForm(form)) { P.toast('Almost there', 'Please fix the highlighted fields.', 'err'); return; }
      const btn = $('#pay-btn', form);
      btn.classList.add('is-loading'); btn.textContent = 'Processing';
      setTimeout(() => {
        const email = $('#email', form).value.trim();
        const orderTotal = P.money(store.total());
        const orderNo = 'PLANA-' + Math.floor(100000 + Math.random() * 899999);
        const itemCount = store.count();
        store.clear();
        const page = $('#cart-page');
        showingSuccess = true;
        page.innerHTML = `<div class="container"><div class="card card-pad success" style="max-width:620px;margin-inline:auto">
          <span class="tickbig" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></span>
          <h1 style="font-size:2rem">Order confirmed</h1>
          <p class="lede" style="margin:12px auto 0">${itemCount} file${itemCount === 1 ? '' : 's'} are on their way to <b>${P.esc(email)}</b>. Your download links never expire.</p>
          <div class="spec-grid" style="max-width:420px;margin:28px auto">
            <div class="spec"><b>Order</b><span>${orderNo}</span></div>
            <div class="spec"><b>Total paid</b><span>${orderTotal}</span></div>
            <div class="spec"><b>Delivery</b><span>Instant download</span></div>
            <div class="spec"><b>Support</b><span>hello@plana.studio</span></div>
          </div>
          <div class="row" style="justify-content:center">
            <a class="btn btn-primary" href="#shop">Continue shopping</a>
            <a class="btn btn-ghost" href="#customize">Build another planner</a>
          </div>
        </div></div>`;
        window.scrollTo({ top: 0, behavior: 'auto' });
        P.toast('Payment successful', 'Check your inbox for the download links.', 'ok', 5000);
      }, 1400);
    });
  }

  /* ======================================================================
     BOOT
     ====================================================================== */
  document.addEventListener('plana:cartchange', () => {
    paintBadges(true);
    if ($('#cart-drawer') && $('#cart-drawer').classList.contains('open')) renderDrawer();
    if ($('#cart-root')) renderCartPage();
  });

  /* Returning to #cart after an order clears the confirmation screen and
     rebuilds the cart view from its pristine markup. */
  document.addEventListener('plana:route', e => {
    if (e.detail.name !== 'cart') return;
    if (showingSuccess) {
      $('#cart-page').innerHTML = cartViewHTML;
      showingSuccess = false;
      initCheckout();
      $$('[data-rules]', $('#cart-page')).forEach(input => {
        on(input, 'blur', () => P.validateField(input));
        on(input, 'input', () => { if (input.classList.contains('invalid')) P.validateField(input); });
      });
    }
    renderCartPage();
  });

  document.addEventListener('DOMContentLoaded', () => {
    const page = $('#cart-page');
    if (page) cartViewHTML = page.innerHTML;
    paintBadges(false);
    renderCartPage();
    initCheckout();
  });
})();
