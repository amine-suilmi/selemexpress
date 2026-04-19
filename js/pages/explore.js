// ══ EXPLORE PAGE ════════════════════════════════════════
import { stores, storeOffers, storeProducts, categories,
         sizes, colorSwatches, followedStores, savedItems,
         shoePool, exploreCat, setExploreCat } from '../state.js';
import { toast, fmtFollowers, starsHTML, escapeAttr, getProductGallery } from '../ui.js';
import { addToCartFromPanel } from './cart.js';
import { toggleSave } from './saved.js';

export function toggleFollow(storeId, btn) {
  const store = stores.find(s => s.id === storeId);
  if (followedStores.has(storeId)) {
    followedStores.delete(storeId);
    btn.textContent = 'Follow';
    btn.classList.remove('following');
    toast('Unfollowed');
    window._db?.unfollowStore(storeId).catch(() => {});
  } else {
    followedStores.add(storeId);
    btn.textContent = 'Following ✓';
    btn.classList.add('following');
    toast('Following ' + (store?.name || '') + ' 🎉');
    window._db?.followStore(storeId).catch(() => {});
  }
  window._renderStoresScroll?.();
}

export function buildExplorePage() {
  const chips = document.getElementById('cat-chips');
  chips.innerHTML = '';
  categories.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'cat-chip' + (c === exploreCat ? ' active' : '');
    btn.textContent = c;
    btn.onclick = () => { setExploreCat(c); buildExplorePage(); };
    chips.appendChild(btn);
  });
  const filtered = exploreCat === 'All' ? stores : stores.filter(s => s.tag === exploreCat);
  renderStoreSearchGrid(filtered.length ? filtered : stores);
}

export function renderStoreSearchGrid(list) {
  const grid = document.getElementById('store-search-grid');
  grid.innerHTML = '';
  if (!list.length) {
    grid.innerHTML = `<p style="text-align:center;padding:30px;color:var(--text-2);font-size:.86rem">No stores found</p>`;
    return;
  }
  list.forEach(store => {
    const isFollowed = followedStores.has(store.id);
    const card = document.createElement('div');
    card.className = 'store-search-card';
    card.innerHTML = `
      <div class="store-search-av"><img src="${store.img}" alt="${store.name}" loading="lazy"
        onerror="this.src='https://placehold.co/56x56?text=?'"></div>
      <div class="store-search-info">
        <div class="store-search-name">${store.name}</div>
        <div class="store-search-meta">${store.tag} · ${fmtFollowers(store.followers)} followers</div>
        <div class="store-search-stars">${starsHTML(store.rating)} (${Number(store.rating).toFixed(1)})</div>
      </div>
      <button class="store-search-follow ${isFollowed ? 'following' : ''}"
        onclick="event.stopPropagation();window._toggleFollow(${store.id},this)">
        ${isFollowed ? 'Following ✓' : 'Follow'}
      </button>`;
    card.addEventListener('click', () => openStoreModal(store));
    grid.appendChild(card);
  });
}

export function openStoreModal(store) {
  const offer    = storeOffers[store.id];
  // Get thumbnails — prefer storeProducts map, fallback to shoePool products
  let products = storeProducts[store.id] || [];
  if (!products.length) {
    // Fallback: find real products from shoePool for this store
    products = shoePool
      .filter(p => p.storeId === store.id)
      .slice(0, 3)
      .map(p => ({ price: p.price, img: p.img }));
  }
  const isFollowed = followedStores.has(store.id);

  document.getElementById('modal-content').innerHTML = `
    <div class="sm-header">
      <div class="sm-logo"><img src="${store.img}" alt="${store.name}"
        onerror="this.src='https://placehold.co/56x56?text=?'"></div>
      <div class="sm-info">
        <div class="sm-name">${store.name}</div>
        <div class="sm-meta">
          <span class="sm-followers">${fmtFollowers(store.followers)} followers</span>
          <span>·</span><span>${store.tag}</span>
        </div>
        <div class="sm-stars" id="sm-stars-${store.id}">
          ${[1,2,3,4,5].map(n => `<span class="star ${n <= Number(store.rating) ? 'lit' : ''}" data-val="${n}"
            onmouseover="window._hoverStars(${store.id},${n})"
            onmouseout="window._unhoverStars(${store.id})"
            onclick="window._rateStore(${store.id},${n})">★</span>`).join('')}
        </div>
      </div>
      <button class="sm-follow-btn ${isFollowed ? 'following' : ''}"
        onclick="window._toggleFollow(${store.id},this)">
        ${isFollowed ? 'Following ✓' : 'Follow'}
      </button>
      <button class="sm-close-btn"
        onclick="document.getElementById('store-modal').classList.remove('open')">✕</button>
    </div>
    ${offer ? `
      <div class="sm-offer">
        <img src="${offer.bg}" alt="offer" loading="lazy"
          onerror="this.src='https://placehold.co/400x140?text=Offer'">
        <div class="sm-offer-overlay"></div>
        <div class="sm-offer-content">
          <span class="sm-offer-badge">${offer.badge || ''}</span>
          <div class="sm-offer-title">${offer.title || ''}</div>
          <div class="sm-offer-sub">${offer.sub || ''}</div>
        </div>
      </div>` : ''}
    <div class="sm-products-label">This Week's Models</div>
    <div class="sm-products">
      ${products.length ? products.map((p, i) => {
        // Find the matching product in shoePool so we can open the detail panel
        const realProd = shoePool.find(sp => sp.img === p.img && sp.storeId === store.id)
          || shoePool.find(sp => sp.storeId === store.id);
        const prodId   = realProd ? realProd.id : store.id * 100 + i;
        const prodName = realProd ? realProd.name : (store.name + ' Model ' + (i + 1));
        return `<div class="sm-prod" onclick="
          document.getElementById('store-modal').classList.remove('open');
          window._openProductPanel({id:${prodId},name:'${escapeAttr(prodName)}',price:${Number(p.price)},storeId:${store.id},img:'${p.img}'})">
          <img src="${p.img}" alt="shoe" loading="lazy"
            onerror="this.src='https://placehold.co/130x130?text=?'">
          <div class="sm-prod-price">${Number(p.price)} TND</div>
        </div>`;
      }).join('') : `<div style="padding:20px;color:#999;font-size:.8rem;text-align:center;">No products yet</div>`}
    </div>`;
  document.getElementById('store-modal').classList.add('open');
}

export function hoverStars(storeId, n) {
  document.querySelectorAll(`#sm-stars-${storeId} .star`).forEach(s => {
    const v = parseInt(s.dataset.val);
    s.classList.toggle('hover-lit', v <= n && !s.classList.contains('lit'));
  });
}

export function unhoverStars(storeId) {
  document.querySelectorAll(`#sm-stars-${storeId} .star`).forEach(s =>
    s.classList.remove('hover-lit'));
}

export function rateStore(storeId, rating) {
  const store = stores.find(s => s.id === storeId);
  if (store) store.rating = rating;
  document.querySelectorAll(`#sm-stars-${storeId} .star`).forEach(s => {
    const v = parseInt(s.dataset.val);
    s.classList.toggle('lit', v <= rating);
    s.classList.remove('hover-lit');
  });
  toast(`Rated ${rating} ★`);
  window._db?.submitRating(storeId, rating).catch(() => {});
}

export function closeStoreModal(e) {
  if (e.target === document.getElementById('store-modal'))
    document.getElementById('store-modal').classList.remove('open');
}

export function openProductPanel(shoe) {
  // Try to find the full product with photos from shoePool
  const fullProduct = shoePool.find(p => p.id === shoe.id) || shoe;
  const store  = stores.find(s => s.id === (shoe.storeId || shoe.store_id)) || stores[0];
  const isSaved = savedItems.has(shoe.id);

  // Build gallery: owner photos first, then thumbnails from storeProducts
  let gallery = [];
  if (fullProduct.photos && typeof fullProduct.photos === 'object') {
    const photoValues = Object.values(fullProduct.photos);
    photoValues.forEach(arr => {
      if (Array.isArray(arr)) arr.forEach(url => { if (url && !gallery.includes(url)) gallery.push(url); });
    });
  }
  if (!gallery.length) {
    gallery = getProductGallery(shoe, storeProducts);
  }
  if (!gallery.length) gallery = [shoe.img];

  document.getElementById('prod-content').innerHTML = `
    <div class="pd-gallery-wrap">
      <button class="pd-close-btn"
        onclick="document.getElementById('prod-panel').classList.remove('open')"
        aria-label="Close product">✕ <span>Close</span></button>
      <div class="pd-gallery" id="pd-gallery">
        ${gallery.map((img, idx) => `
          <div class="pd-gallery-slide">
            <img class="pd-img" src="${img}"
              alt="${shoe.name} photo ${idx + 1}"
              loading="${idx === 0 ? 'eager' : 'lazy'}"
              onerror="this.src='https://placehold.co/400x400?text=?'">
          </div>`).join('')}
      </div>
      ${gallery.length > 1 ? `
        <button class="pd-gallery-btn prev" onclick="window._moveProductGallery(-1)">‹</button>
        <button class="pd-gallery-btn next" onclick="window._moveProductGallery(1)">›</button>
        <div class="pd-gallery-dots" id="pd-gallery-dots">
          ${gallery.map((_, i) => `<span class="pd-gallery-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
        </div>` : ''}
    </div>
    <div class="pd-body">
      <div class="pd-store-row"
        onclick="document.getElementById('prod-panel').classList.remove('open');
                 window._openStoreModal(window._stores.find(s=>s.id===${store.id}))">
        <div class="pd-store-av"><img src="${store.img}" alt="${store.name}"
          onerror="this.src='https://placehold.co/28x28?text=?'"></div>
        <span class="pd-store-name">${store.name} · ${store.tag} ›</span>
      </div>
      <div class="pd-price">${shoe.price} TND</div>
      <div class="pd-name">${shoe.name || 'Shoe Model'}</div>
      <div class="pd-option-group">
        <div class="pd-colors-label">Color</div>
        <div class="pd-colors" id="pd-colors">
          ${colorSwatches.map((c, i) => `
            <div class="color-swatch ${i === 0 ? 'selected' : ''}"
              style="background:${c};${c === '#ffffff' ? 'border:1.5px solid #ddd;' : ''}"
              onclick="window._selectColor(this,'${c}')" title="${c}"></div>`).join('')}
        </div>
      </div>
      <div class="pd-option-group">
        <div class="pd-sizes-label">Size (EU)</div>
        <div class="pd-sizes">
          ${sizes.map((s, i) => `
            <button class="size-btn ${i === 4 ? 'selected' : ''}"
              onclick="window._selectSize(this)">${s}</button>`).join('')}
        </div>
      </div>
      <div class="pd-actions">
        <button class="pd-cart-btn"
          onclick="window._addToCartFromPanel(${shoe.id},'${escapeAttr(shoe.name || 'Shoe')}',${shoe.price},'${shoe.img}','${escapeAttr(store.name)}',${store.id})">
          Add to Cart 🛒
        </button>
        <button class="pd-save-btn" id="pd-save-${shoe.id}"
          onclick="window._toggleSave(${shoe.id},this)">
          ${isSaved ? '❤️' : '🤍'}
        </button>
      </div>
    </div>`;
  document.getElementById('prod-panel').classList.add('open');
  const galleryEl = document.getElementById('pd-gallery');
  if (galleryEl) {
    galleryEl.scrollLeft = 0;
    galleryEl.addEventListener('scroll', syncProductGalleryDots, { passive: true });
    syncProductGalleryDots();
  }
}

export function selectColor(el) {
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
}

export function selectSize(btn) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

export function moveProductGallery(dir) {
  const gallery = document.getElementById('pd-gallery');
  if (!gallery) return;
  gallery.scrollBy({ left: dir * gallery.clientWidth, behavior: 'smooth' });
}

export function syncProductGalleryDots() {
  const gallery = document.getElementById('pd-gallery');
  const dots = [...document.querySelectorAll('.pd-gallery-dot')];
  if (!gallery || !dots.length) return;
  const idx = Math.round(gallery.scrollLeft / Math.max(gallery.clientWidth, 1));
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

export function closeProdPanel(e) {
  if (e.target === document.getElementById('prod-panel'))
    document.getElementById('prod-panel').classList.remove('open');
}

export function handleSearch(q) {
  const qLow = q.trim().toLowerCase();
  window.showPage('explore', document.querySelectorAll('.bot-nav a')[1]);
  const results = qLow
    ? stores.filter(s => s.name.toLowerCase().includes(qLow) || s.tag.toLowerCase().includes(qLow))
    : stores;
  renderStoreSearchGrid(results);
}
