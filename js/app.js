// ══ APP ENTRY POINT ══════════════════════════════════════
import { stores, notifs, shoePool } from './data/mock.js';
import { cartItems, savedItems, editingCartIndex } from './state.js';
import { toast, updateNotifDot } from './ui.js';
import { showPage } from './router.js';
import { renderStoresScroll, initSlider, initFeed, initScrollHideNav } from './pages/home.js';
import {
  toggleFollow, handleSearch, openStoreModal, openProductPanel,
  selectColor, selectSize, moveProductGallery, closeProdPanel,
  hoverStars, unhoverStars, rateStore, closeStoreModal
} from './pages/explore.js';
import { renderCart, changeQty, removeCartItem, checkout, addToCartFromPanel, openCartEdit, selectCartEditColor, selectCartEditSize, saveCartEdit, closeCartEdit } from './pages/cart.js';
import { toggleSave, renderSaved, addAllToCart } from './pages/saved.js';
import { buildOffersPage, toggleFollowPost, sharePost } from './pages/offers.js';
import {
  switchAuthTab, doLogin, doRegister, doSocialLogin, doLogout,
  renderAccount, openAddressModal, closeAddressModal, useSavedAddress,
  saveAddress, toggleAmbassador, getAmbassadorLink
} from './pages/account.js';

// ── Expose globals for inline onclick= handlers ──────────
// (needed because HTML is not processed by a bundler)
window._stores       = stores;
window._shoePool     = shoePool;
window._renderStoresScroll = renderStoresScroll;
window._toast        = toast;
window._toggleFollow = toggleFollow;
window._openStoreModal    = openStoreModal;
window._openProductPanel  = openProductPanel;
window._selectColor       = selectColor;
window._selectSize        = selectSize;
window._moveProductGallery = moveProductGallery;
window._hoverStars        = hoverStars;
window._unhoverStars      = unhoverStars;
window._rateStore         = rateStore;
window._addToCartFromPanel = addToCartFromPanel;
window._toggleSave        = toggleSave;
window._renderSaved       = renderSaved;
window._changeQty         = changeQty;
window._removeCartItem    = removeCartItem;
window._checkout          = checkout;
window._openCartEdit      = openCartEdit;
window._selectCartEditColor = selectCartEditColor;
window._selectCartEditSize  = selectCartEditSize;
window._saveCartEdit      = saveCartEdit;
window._toggleFollowPost  = toggleFollowPost;
window._sharePost         = sharePost;
window._getAmbassadorLink = getAmbassadorLink;

// Provide saveCartEdit with access to editingCartIndex from state
window._cartState = () => ({ editingCartIndex });

// ── Expose functions called from HTML attributes ─────────
window.switchAuthTab     = switchAuthTab;
window.doLogin           = doLogin;
window.doRegister        = doRegister;
window.doSocialLogin     = doSocialLogin;
window.doLogout          = doLogout;
window.openAddressModal  = openAddressModal;
window.closeAddressModal = closeAddressModal;
window.useSavedAddress   = useSavedAddress;
window.saveAddress       = saveAddress;
window.toggleAmbassador  = toggleAmbassador;
window.closeCartEdit     = closeCartEdit;
window.closeProdPanel    = closeProdPanel;
window.closeStoreModal   = closeStoreModal;
window.handleSearch      = handleSearch;
window.addAllToCart      = addAllToCart;

// ── Notifications ────────────────────────────────────────
function buildNotifList() {
  const list = document.getElementById('notif-list');
  list.innerHTML = '';
  notifs.forEach(n => {
    const store = n.storeId ? stores.find(s => s.id === n.storeId) : null;
    const item = document.createElement('div');
    item.className = 'notif-item' + (n.unread ? ' unread' : '');
    item.innerHTML = `<div class="notif-ic ${store ? '' : 'sys'}">${store ? `<img src="${store.img}" alt="${store.name}">` : '📦'}</div><div class="notif-txt"><p>${n.txt}</p><time>${n.time}</time></div>${n.unread ? '<div class="unread-dot"></div>' : ''}`;
    item.addEventListener('click', () => {
      n.unread = false;
      item.classList.remove('unread');
      item.querySelector('.unread-dot')?.remove();
      updateNotifDot(notifs);
      if (store) { closeNotifs(); openStoreModal(store); }
    });
    list.appendChild(item);
  });
}

function openNotifs() {
  buildNotifList();
  document.getElementById('notif-panel').classList.add('open');
}
function closeNotifs() {
  document.getElementById('notif-panel').classList.remove('open');
}
function closeNotifsOutside(e) {
  if (e.target === document.getElementById('notif-panel')) closeNotifs();
}

window.openNotifs          = openNotifs;
window.closeNotifs         = closeNotifs;
window.closeNotifsOutside  = closeNotifsOutside;

// ── Bootstrap ────────────────────────────────────────────
renderStoresScroll();
initSlider();
initFeed();
initScrollHideNav();
updateNotifDot(notifs);
