// ══ SAVED PAGE ════════════════════════════════════════════
import { shoePool, stores } from '../data/mock.js';
import { savedItems, cartItems } from '../state.js';
import { toast, getSavedAspect, updateCartBadge } from '../ui.js';
import { openProductPanel } from './explore.js';

export function toggleSave(id, btn) {
  if (savedItems.has(id)) {
    savedItems.delete(id);
    btn.textContent = '🤍';
    toast('Removed from saved');
  } else {
    savedItems.add(id);
    btn.textContent = '❤️';
    toast('Saved ❤️');
  }
}

export function renderSaved() {
  const wrap = document.getElementById('saved-wrap');
  if (!savedItems.size) {
    wrap.innerHTML = `<div class="saved-empty"><div class="big-ic">🤍</div><h3>Nothing saved yet</h3><p>Tap the heart on any shoe to save it here.</p></div>`;
    return;
  }
  const items = shoePool.filter(s => savedItems.has(s.id));
  wrap.innerHTML = `<div class="saved-grid">${items.map(shoe => `
    <div class="saved-card" onclick="window._openProductPanel(window._shoePool.find(s=>s.id===${shoe.id}))">
      <img class="saved-img" style="aspect-ratio:${getSavedAspect(shoe.id)}" src="${shoe.img}" alt="${shoe.name}" loading="lazy">
      <button class="saved-remove" onclick="event.stopPropagation();window._toggleSave(${shoe.id},this);window._renderSaved()">❤️</button>
      <div class="saved-info"><div class="saved-name">${shoe.name}</div><div class="saved-price">${shoe.price} TND</div></div>
    </div>`).join('')}</div>`;
}

export function addAllToCart() {
  if (!savedItems.size) { toast('Nothing saved yet'); return; }
  const items = shoePool.filter(s => savedItems.has(s.id));
  items.forEach(shoe => {
    const store = stores.find(s => s.id === shoe.storeId) || stores[0];
    const existing = cartItems.find(i => i.id === shoe.id && i.size === '40' && String(i.storeId) === String(store.id) && i.color === '#1a1a1a');
    if (existing) existing.qty++;
    else cartItems.push({ id: shoe.id, name: shoe.name, price: shoe.price, img: shoe.img, storeName: store.name, storeId: store.id, size: '40', color: '#1a1a1a', qty: 1 });
  });
  updateCartBadge(cartItems);
  toast(`${items.length} items added to cart 🛒`);
}
