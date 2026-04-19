// ══ HOME PAGE ════════════════════════════════════════════
import { stores, slides, shoePool, posterPool, storeProducts,
         followedStores, savedItems, currentPage } from '../state.js';
import { escapeAttr, getProductGallery } from '../ui.js';

export function renderStoresScroll() {
  const ss = document.getElementById('stores-scroll');
  if (!ss) return;
  ss.innerHTML = '';
  [...stores]
    .sort((a, b) => (followedStores.has(a.id) ? 0 : 1) - (followedStores.has(b.id) ? 0 : 1))
    .forEach(s => {
      const d = document.createElement('div');
      d.className = 'store-item';
      d.innerHTML = `
        <div class="${followedStores.has(s.id) ? 'store-ring followed' : 'store-ring'}">
          <div class="store-inner">
            <img src="${s.img}" alt="${s.name}" loading="lazy">
          </div>
        </div>
        <span>${s.name}</span>`;
      d.addEventListener('click', () => window._openStoreModal(s));
      ss.appendChild(d);
    });
}

export function initSlider() {
  const hs = document.getElementById('hero-slider');
  if (!hs || !slides.length) return;
  hs.innerHTML = '';
  slides.forEach((sl, i) => {
    const d = document.createElement('div');
    d.className = 'slide' + (i === 0 ? ' active' : '');
    d.innerHTML = `
      <img class="slide-bg-img" src="${sl.img}" alt=""
        loading="${i === 0 ? 'eager' : 'lazy'}">
      <div class="slide-overlay"></div>
      <div class="slide-content">
        <span class="slide-tag">${sl.tag}</span>
        <h2>${sl.title}</h2>
        <p>${sl.sub}</p>
        <a href="#" class="slide-btn"
          onclick="window._toast('Shopping…');return false">${sl.btn} →</a>
      </div>`;
    hs.appendChild(d);
  });
  const ddots = document.createElement('div');
  ddots.className = 'slider-dots';
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => go(i));
    ddots.appendChild(d);
  });
  hs.appendChild(ddots);
  let cur = 0;
  function go(n) {
    document.querySelectorAll('.slide').forEach((s, i) => s.classList.toggle('active', i === n));
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === n));
    cur = n;
  }
  setInterval(() => go((cur + 1) % slides.length), 3200);
}

export function initFeed() {
  const feedWrapper = document.getElementById('feed-wrapper');
  if (!feedWrapper) return;

  let offset = 0, posterIdx = 0, loading = false;
  const CHUNK = 18;
  // Price variation for visual diversity
  const priceJ = [0, -10, 10, -5, 15, -15, 5, -20, 20, 8, -8, 12];

  function getShoe(i) {
    if (!shoePool.length) return null;
    const b = shoePool[i % shoePool.length];
    // Apply a small price jitter for visual variety but keep it positive
    const adjusted = Math.max(b.price + priceJ[i % priceJ.length], 10);
    return { ...b, price: adjusted };
  }

  function makeFeedPoster(p) {
    const storeId = p.storeId || p.store_id;
    const store = stores.find(s => s.id === storeId);
    if (!store) return null;
    const el = document.createElement('div');
    el.className = 'store-poster';
    el.innerHTML = `
      <img class="poster-bg" src="${p.bg}" alt="" loading="lazy">
      <div class="poster-overlay"></div>
      <div class="poster-store">
        <div class="poster-avatar"><img src="${store.img}" alt="${store.name}"></div>
        <div>
          <span class="poster-store-name">${store.name}</span>
          <span class="poster-store-tag">${store.tag}</span>
        </div>
      </div>
      <button class="poster-heart"
        onclick="event.stopPropagation();this.textContent=this.textContent==='🤍'?'❤️':'🤍'">
        🤍
      </button>
      <div class="poster-body">
        <span class="poster-badge">${p.badge}</span>
        <div class="poster-title">${p.title}</div>
        <div class="poster-sub">${p.sub}</div>
        <a class="poster-cta"
          onclick="event.stopPropagation();window._openStoreModal(window._stores.find(s=>s.id===${storeId}))">
          ${p.cta} →
        </a>
      </div>`;
    return el;
  }

  function loadMore() {
    if (loading || !shoePool.length) return;
    loading = true;
    document.getElementById('load-spinner').style.display = 'block';
    setTimeout(() => {
      // Insert a poster every chunk (except the first chunk)
      if (offset > 0 && posterPool.length) {
        const poster = makeFeedPoster(posterPool[posterIdx % posterPool.length]);
        if (poster) feedWrapper.appendChild(poster);
        posterIdx++;
      }

      const chunk = document.createElement('div');
      chunk.className = 'feed-chunk';

      for (let i = 0; i < CHUNK; i++) {
        const shoe = getShoe(offset + i);
        if (!shoe) continue;
        const card = document.createElement('div');
        card.className = 'feed-card';
        const isSaved = savedItems.has(shoe.id);
        card.innerHTML = `
          <img class="feed-img" src="${shoe.img}" alt="${shoe.name}" loading="lazy"
            onerror="this.src='https://placehold.co/300x300?text=?'">
          <button class="fav-btn"
            onclick="event.stopPropagation();window._toggleSave(${shoe.id},this)">
            ${isSaved ? '❤️' : '🤍'}
          </button>
          <div class="feed-price">${shoe.price} TND</div>`;
        card.addEventListener('click', () => window._openProductPanel(shoe));
        chunk.appendChild(card);
      }

      feedWrapper.appendChild(chunk);
      offset += CHUNK;
      loading = false;
      document.getElementById('load-spinner').style.display = 'none';
    }, 280);
  }

  new IntersectionObserver(e => {
    if (e[0].isIntersecting) loadMore();
  }, { rootMargin: '240px' }).observe(document.getElementById('load-spinner'));

  loadMore();
}

export function initScrollHideNav() {
  const topNav = document.getElementById('top-nav');
  window.addEventListener('scroll', () => {
    if (currentPage === 'home')
      window.scrollY > 70 ? topNav.classList.add('hidden') : topNav.classList.remove('hidden');
  }, { passive: true });
}
