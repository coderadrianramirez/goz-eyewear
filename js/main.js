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

/* ---- Cart counter (demo) ---- */
(function initCart() {
  const badge = document.querySelector('.nav-badge');
  let count = 0;

  document.querySelectorAll('.product-card__add').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      count++;
      if (badge) {
        badge.textContent = count;
        badge.style.transform = 'scale(1.4)';
        setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
      }

      // micro-feedback on button
      const original = btn.textContent;
      btn.textContent = 'Added';
      btn.style.background = 'var(--color-ink)';
      btn.style.borderColor = 'var(--color-ink)';
      btn.style.color = '#fff';

      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 1400);
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
