// ══ UI UTILITIES ════════════════════════════════════════

export function toast(msg) {
  const t = document.getElementById('toast-el');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

export function fmtFollowers(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n;
}

export function starsHTML(rating) {
  return [1, 2, 3, 4, 5].map(n => n <= rating ? '★' : '☆').join('');
}

export function getColorName(color) {
  const map = {
    '#1a1a1a': 'Black', '#ffffff': 'White', '#e8192c': 'Red',
    '#1565c0': 'Blue', '#16a34a': 'Green', '#d97706': 'Orange',
    '#9333ea': 'Purple', '#a8a29e': 'Stone'
  };
  return map[(color || '').toLowerCase()] || 'Selected';
}

export function getSavedAspect(id) {
  const ratios = ['4 / 5', '1 / 1.25', '1 / 1', '4 / 6', '1 / 1.4'];
  return ratios[id % ratios.length];
}

export function escapeAttr(txt) {
  return String(txt || '').replace(/'/g, '`');
}

export function generateAmbassadorCode(name) {
  return 'SEL-' + String(name || 'user').replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 6) + '-' + Math.floor(1000 + Math.random() * 9000);
}

export function getProductGallery(shoe, storeProducts) {
  const related = (storeProducts[shoe.storeId] || []).map(p => p.img);
  return [...new Set([shoe.img, ...related])].slice(0, 4);
}

export function updateCartBadge(cartItems) {
  const total = cartItems.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cart-badge');
  badge.textContent = total;
  badge.classList.toggle('show', total > 0);
}

export function updateNotifDot(notifs) {
  document.getElementById('notif-dot').style.display = notifs.some(n => n.unread) ? 'block' : 'none';
}
