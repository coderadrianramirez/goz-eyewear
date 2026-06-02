/* ============================================================
   GOZ — Main JavaScript
   ============================================================ */

'use strict';

/* ---- Navbar: scroll state ---- */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const threshold = 40;

  function updateNavbar() {
    navbar.classList.toggle('is-scrolled', window.scrollY > threshold);
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();
})();

/* ---- Navbar: mobile hamburger & drawer ---- */
(function initDrawer() {
  const hamburger = document.querySelector('.navbar__hamburger');
  const drawer    = document.querySelector('.navbar__drawer');
  const body      = document.body;
  if (!hamburger || !drawer) return;

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('is-open');
    drawer.classList.toggle('is-open', open);
    body.style.overflow = open ? 'hidden' : '';
    hamburger.setAttribute('aria-expanded', open);
  });

  // Close on drawer link click
  drawer.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('is-open');
      drawer.classList.remove('is-open');
      body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', false);
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      hamburger.classList.remove('is-open');
      drawer.classList.remove('is-open');
      body.style.overflow = '';
    }
  });
})();

/* ---- Hero: trigger Ken-Burns on load ---- */
(function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  window.addEventListener('load', () => hero.classList.add('is-loaded'));
})();

/* ---- Scroll-reveal (IntersectionObserver) ---- */
(function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
})();

/* ---- Show more / less products ---- */
(function initShowMore() {
  const btn      = document.getElementById('show-more-btn');
  const hidden   = document.querySelectorAll('.product-card.is-hidden');
  if (!btn || !hidden.length) return;

  let expanded = false;

  btn.addEventListener('click', () => {
    expanded = !expanded;

    hidden.forEach((card, i) => {
      if (expanded) {
        card.classList.remove('is-hidden');
        card.classList.add('reveal-extra');
        // Re-observe for scroll reveal
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.transition = `opacity 0.45s ease-out ${i * 80}ms, transform 0.45s ease-out ${i * 80}ms`;
          }, 20);
        });
      } else {
        card.classList.add('is-hidden');
        card.classList.remove('reveal-extra');
        card.style.cssText = '';
      }
    });

    // Update button label
    btn.innerHTML = expanded
      ? `Ver menos <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`
      : `Ver Colección Completa <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;

    if (expanded) {
      setTimeout(() => {
        hidden[0]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  });
})();

/* ---- Product filters ---- */
(function initFilters() {
  const filters = document.querySelectorAll('.filter-btn');
  if (!filters.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const target = btn.dataset.filter;
      const cards  = document.querySelectorAll('.product-card');

      cards.forEach(card => {
        const matches = target === 'all' || card.dataset.category === target;
        card.style.opacity    = '0';
        card.style.transform  = 'translateY(10px)';

        setTimeout(() => {
          card.style.display  = matches ? '' : 'none';
        }, 180);

        if (matches) {
          requestAnimationFrame(() => {
            setTimeout(() => {
              card.style.opacity   = '1';
              card.style.transform = 'translateY(0)';
            }, 200);
          });
        }
      });
    });
  });
})();

/* ---- Wishlist toggle ---- */
(function initWishlist() {
  document.querySelectorAll('.product-card__wish').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      btn.classList.toggle('is-active');
      const active = btn.classList.contains('is-active');
      btn.setAttribute('aria-label', active ? 'Remove from wishlist' : 'Add to wishlist');
    });
  });
})();

/* ---- Cart System ---- */
(function initCart() {

  /* -- State -- */
  const cart = [];   // { id, name, collection, price, qty, color }

  /* -- DOM refs -- */
  const navBadge      = document.querySelector('.nav-badge');
  const cartBtn       = document.querySelector('.nav-cart');
  const overlay       = document.getElementById('cart-overlay');
  const drawer        = document.getElementById('cart-drawer');
  const closeBtn      = document.getElementById('cart-close');
  const drawerCount   = document.getElementById('cart-drawer-count');
  const cartEmpty     = document.getElementById('cart-empty');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartFoot      = document.getElementById('cart-foot');
  const cartTotal     = document.getElementById('cart-total');
  const continueBtns  = document.querySelectorAll('#cart-continue-btn, #cart-empty-cta');

  /* -- Open / Close -- */
  function openCart() {
    drawer.hidden = false;
    requestAnimationFrame(() => {
      overlay.classList.add('is-open');
      drawer.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeCart() {
    overlay.classList.remove('is-open');
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { drawer.hidden = true; }, 300);
    cartBtn?.focus();
  }

  cartBtn?.addEventListener('click', openCart);
  overlay?.addEventListener('click', closeCart);
  closeBtn?.addEventListener('click', closeCart);
  continueBtns.forEach(b => b?.addEventListener('click', () => { closeCart(); }));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer && !drawer.hidden) closeCart();
  });

  /* -- Render -- */
  function renderCart() {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

    // Nav badge
    if (navBadge) {
      navBadge.textContent = totalItems;
      navBadge.style.transform = 'scale(1.5)';
      setTimeout(() => { navBadge.style.transform = 'scale(1)'; }, 200);
    }

    // Drawer count
    if (drawerCount) drawerCount.textContent = totalItems;

    // Empty / items toggle
    const hasItems = cart.length > 0;
    cartEmpty.style.display     = hasItems ? 'none' : '';
    cartItemsList.style.display = hasItems ? '' : 'none';
    cartFoot.style.display      = hasItems ? '' : 'none';

    // Total
    if (cartTotal) cartTotal.textContent = `$${total.toLocaleString('es-MX')} MXN`;

    // Build items HTML
    if (hasItems) {
      cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item__thumb" aria-hidden="true">
            ${item.svg}
          </div>
          <div class="cart-item__info">
            <span class="cart-item__collection">${item.collection}</span>
            <p class="cart-item__name">${item.name}</p>
            <span class="cart-item__color">${item.color}</span>
            <div class="cart-item__qty">
              <button class="qty-btn qty-dec" data-id="${item.id}" aria-label="Disminuir cantidad">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn qty-inc" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
            </div>
          </div>
          <div class="cart-item__right">
            <span class="cart-item__price">$${(item.price * item.qty).toLocaleString('es-MX')}</span>
            <button class="cart-item__remove" data-id="${item.id}" aria-label="Eliminar ${item.name}">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </div>
      `).join('');

      // Qty & remove events
      cartItemsList.querySelectorAll('.qty-inc').forEach(btn => {
        btn.addEventListener('click', () => { changeQty(btn.dataset.id, 1); });
      });
      cartItemsList.querySelectorAll('.qty-dec').forEach(btn => {
        btn.addEventListener('click', () => { changeQty(btn.dataset.id, -1); });
      });
      cartItemsList.querySelectorAll('.cart-item__remove').forEach(btn => {
        btn.addEventListener('click', () => { removeItem(btn.dataset.id); });
      });
    }
  }

  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeItem(id);
    else renderCart();
  }

  function removeItem(id) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx > -1) cart.splice(idx, 1);
    renderCart();
  }

  /* -- Minimal SVG thumbnails per product type -- */
  const svgThumbs = {
    round: `<svg viewBox="0 0 140 80" fill="none">
      <g stroke="#2C2C2C" stroke-width="1.3">
        <rect x="5" y="12" width="52" height="56" rx="26" fill="rgba(44,44,44,0.04)"/>
        <rect x="83" y="12" width="52" height="56" rx="26" fill="rgba(44,44,44,0.04)"/>
        <path d="M57 40 Q70 34 83 40" stroke-width="1.1"/>
        <line x1="5" y1="40" x2="-4" y2="42" stroke-width="1"/>
        <line x1="135" y1="40" x2="144" y2="42" stroke-width="1"/>
      </g></svg>`,
    square: `<svg viewBox="0 0 140 80" fill="none">
      <g stroke="#2C2C2C" stroke-width="1.3">
        <rect x="5" y="15" width="54" height="50" rx="5" fill="rgba(44,44,44,0.04)"/>
        <rect x="81" y="15" width="54" height="50" rx="5" fill="rgba(44,44,44,0.04)"/>
        <line x1="59" y1="40" x2="81" y2="40" stroke-width="1.1"/>
        <line x1="5" y1="40" x2="-4" y2="42" stroke-width="1"/>
        <line x1="135" y1="40" x2="144" y2="42" stroke-width="1"/>
      </g></svg>`,
    oval: `<svg viewBox="0 0 140 80" fill="none">
      <g stroke="#2C2C2C" stroke-width="1.3">
        <ellipse cx="36" cy="40" rx="31" ry="24" fill="rgba(44,44,44,0.04)"/>
        <ellipse cx="104" cy="40" rx="31" ry="24" fill="rgba(44,44,44,0.04)"/>
        <path d="M67 40 Q70 34 73 40" stroke-width="1.1"/>
        <line x1="5" y1="40" x2="-4" y2="42"/>
        <line x1="135" y1="40" x2="144" y2="42"/>
      </g></svg>`,
  };

  /* -- Add to cart hook -- */
  document.querySelectorAll('.product-card__add').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const card       = btn.closest('.product-card');
      const name       = card.querySelector('.product-card__name')?.textContent.trim() || 'Lente GOZ';
      const collection = card.querySelector('.product-card__collection')?.textContent.trim() || 'Colección';
      const priceText  = card.querySelector('.product-card__price')?.textContent || '$0';
      const priceNum   = parseInt(priceText.replace(/\D/g, ''), 10) || 0;
      const category   = card.dataset.category || 'sol';
      const id         = name.toLowerCase().replace(/\s+/g, '-');
      const color      = card.querySelector('.color-swatch.is-active')?.title
                         || card.querySelector('.color-swatch')?.title
                         || 'Onyx';

      // Thumbnail SVG by category
      const svgKey = category === 'optico' ? 'square' : category === 'sol' ? 'oval' : 'round';

      const existing = cart.find(i => i.id === id);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ id, name, collection, price: priceNum, qty: 1, color, svg: svgThumbs[svgKey] });
      }

      renderCart();
      openCart();

      // Button micro-feedback
      const orig = btn.textContent;
      btn.textContent = '✓ Agregado';
      btn.style.cssText = 'background:var(--color-ink);border-color:var(--color-ink);color:#fff';
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.cssText = '';
      }, 1500);
    });
  });

  // Color swatch active toggle
  document.querySelectorAll('.product-card').forEach(card => {
    card.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        card.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('is-active'));
        swatch.classList.add('is-active');
      });
    });
  });

})();

/* ---- Newsletter form (demo) ---- */
(function initNewsletter() {
  const form = document.querySelector('.footer__newsletter-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    const btn   = form.querySelector('button');

    if (!input.value.trim()) return;

    btn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="20 6 9 17 4 12"/></svg>`;
    btn.style.background = 'var(--color-gold)';
    btn.style.color = '#fff';
    input.value = '';
    input.placeholder = 'Thank you for subscribing';
    input.disabled = true;
  });
})();

/* ---- Product Detail Modal ---- */
(function initProductModal() {
  const backdrop  = document.getElementById('pmodal-backdrop');
  const modal     = document.getElementById('pmodal');
  const closeBtn  = document.getElementById('pmodal-close');
  if (!modal) return;

  let currentCard = null;

  const kingCrown  = `<svg viewBox="0 0 40 28" fill="#C9A84C" width="26" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M3,24 L3,16.5 L10,7 L15.5,14.5 L20,2 L24.5,14.5 L30,7 L37,16.5 L37,24 Z"/><rect x="3" y="22.5" width="34" height="4" rx="1.2"/><circle cx="20" cy="2" r="2.5"/><circle cx="10" cy="7.5" r="2"/><circle cx="30" cy="7.5" r="2"/><circle cx="3" cy="17" r="1.8"/><circle cx="37" cy="17" r="1.8"/><ellipse cx="12" cy="24.5" rx="2" ry="1.1" fill="rgba(0,0,0,0.28)"/><ellipse cx="20" cy="24.5" rx="2" ry="1.1" fill="rgba(0,0,0,0.28)"/><ellipse cx="28" cy="24.5" rx="2" ry="1.1" fill="rgba(0,0,0,0.28)"/></svg>`;
  const queenCrown = `<svg viewBox="0 0 40 28" fill="#C9A84C" width="26" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M3,24 Q3,14 9,9 Q12.5,6.5 15,11 Q17,4 20,2 Q23,4 25,11 Q27.5,6.5 31,9 Q37,14 37,24 Z"/><rect x="3" y="22.5" width="34" height="4" rx="1.2"/><circle cx="20" cy="2" r="2.5"/><circle cx="9" cy="9.5" r="2"/><circle cx="31" cy="9.5" r="2"/><circle cx="15" cy="11.5" r="1.5"/><circle cx="25" cy="11.5" r="1.5"/><ellipse cx="12" cy="24.5" rx="2" ry="1.1" fill="rgba(0,0,0,0.28)"/><ellipse cx="20" cy="24.5" rx="2" ry="1.1" fill="rgba(0,0,0,0.28)"/><ellipse cx="28" cy="24.5" rx="2" ry="1.1" fill="rgba(0,0,0,0.28)"/></svg>`;

  function openModal(card) {
    currentCard = card;
    const d = card.dataset;

    // Breadcrumb name
    document.getElementById('pmodal-breadcrumb-name').textContent = d.name;

    // Crown
    const gender = d.gender;
    const crownEl = document.getElementById('pmodal-crown');
    crownEl.innerHTML = gender === 'male' ? kingCrown : gender === 'female' ? queenCrown : '';
    crownEl.style.display = gender ? '' : 'none';

    // Collection, name, price, origin
    document.getElementById('pmodal-collection').textContent = d.collection;
    document.getElementById('pmodal-name').textContent       = d.name;
    document.getElementById('pmodal-price').textContent      = `$${parseInt(d.price).toLocaleString('es-MX')} MXN`;
    document.getElementById('pmodal-origin').textContent     = d.origen || 'Hecho a mano';
    document.getElementById('pmodal-desc').textContent       = d.desc || '';

    // Specs
    const specs = document.getElementById('pmodal-specs');
    specs.innerHTML = `
      <div class="pmodal__spec"><dt>Material</dt><dd>${d.material || '—'}</dd></div>
      <div class="pmodal__spec"><dt>Lente</dt><dd>${d.lente || '—'}</dd></div>
      <div class="pmodal__spec"><dt>Peso</dt><dd>${d.peso || '—'}</dd></div>
      <div class="pmodal__spec"><dt>Origen</dt><dd>${d.origen || '—'}</dd></div>
    `;

    // Colors
    const colors     = (d.colors || '').split(',');
    const colorNames = (d.colorNames || d['color-names'] || '').split(',');
    const colorsEl   = document.getElementById('pmodal-colors');
    colorsEl.innerHTML = colors.map((c, i) => `
      <button class="pmodal__color-swatch${i === 0 ? ' is-active' : ''}"
        style="background:${c.trim()};"
        title="${colorNames[i] || ''}"
        aria-label="Color ${colorNames[i] || i + 1}"
        data-color="${colorNames[i] || ''}"
      ></button>
    `).join('');

    colorsEl.querySelectorAll('.pmodal__color-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        colorsEl.querySelectorAll('.pmodal__color-swatch').forEach(s => s.classList.remove('is-active'));
        sw.classList.add('is-active');
      });
    });

    // Image: use the primary SVG from the card
    const imgEl = card.querySelector('.product-card__img');
    document.getElementById('pmodal-img').innerHTML = imgEl
      ? `<div style="width:100%;max-width:500px;">${imgEl.innerHTML}</div>`
      : '';

    // Thumbnails: primary + hover
    const primary = card.querySelector('.product-card__img');
    const hover   = card.querySelector('.product-card__img-hover');
    const thumbsEl = document.getElementById('pmodal-thumbs');
    thumbsEl.innerHTML = [primary, hover].filter(Boolean).map((el, i) =>
      `<div class="pmodal__thumb${i === 0 ? ' is-active' : ''}" data-idx="${i}">
        <svg viewBox="0 0 300 140" style="width:44px;" fill="none" opacity="0.7">
          ${el.querySelector('svg')?.innerHTML || ''}
        </svg>
      </div>`
    ).join('');

    // Open
    modal.hidden = false;
    requestAnimationFrame(() => {
      backdrop.classList.add('is-open');
      modal.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    backdrop.classList.remove('is-open');
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 520);
  }

  // Wire close
  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  // Wire "Agregar al Carrito" from modal
  document.getElementById('pmodal-add-btn')?.addEventListener('click', () => {
    if (!currentCard) return;
    const addBtn = currentCard.querySelector('.product-card__add');
    if (addBtn) addBtn.click();
    closeModal();
  });

  // Open modal on card name/image click
  function attachCardClick(card) {
    const trigger = card.querySelector('.product-card__img-wrap');
    const nameEl  = card.querySelector('.product-card__name');

    [trigger, nameEl].forEach(el => {
      el?.addEventListener('click', e => {
        if (e.target.closest('.product-card__wish') || e.target.closest('.product-card__add')) return;
        openModal(card);
      });
    });
  }

  document.querySelectorAll('.product-card').forEach(attachCardClick);

  // Re-attach after show-more reveals new cards
  const showMoreBtn = document.getElementById('show-more-btn');
  showMoreBtn?.addEventListener('click', () => {
    setTimeout(() => {
      document.querySelectorAll('.product-card.is-hidden').forEach(attachCardClick);
      document.querySelectorAll('.product-card:not(.is-hidden)').forEach(attachCardClick);
    }, 100);
  });
})();

/* ---- Smooth anchor scroll (Escape hatch for older browsers) ---- */
(function initAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
