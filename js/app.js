// ══ APP ENTRY POINT ══════════════════════════════════════
import {
  stores, shoePool, storeOffers, storeProducts, slides, posterPool,
  followedStores, cartItems, savedItems, editingCartIndex,
  setStores, setShoePool, setStoreOffers, setStoreProducts,
  setSlides, setPosterPool, setLoggedInUser, setSavedItems, setCartItems
} from './state.js';

import { toast, updateNotifDot, updateCartBadge } from './ui.js';
import { showPage } from './router.js';

import { fetchStores, fetchStoreOffers, fetchStoreThumbnails,
         followStore, unfollowStore, fetchUserFollows, submitRating } from './api/stores.api.js';
import { fetchProducts, fetchSlides, fetchPosters } from './api/products.api.js';
import { signIn, signUp, signOut, signInWithProvider,
         getCurrentUser, getProfile, updateProfile, onAuthStateChange } from './api/auth.api.js';
import { fetchCart, upsertCartItem, deleteCartItem, clearCart,
         fetchSaved, saveItem, unsaveItem, insertOrders } from './api/cart.api.js';

import { renderStoresScroll, initSlider, initFeed, initScrollHideNav } from './pages/home.js';
import { toggleFollow, handleSearch, openStoreModal, openProductPanel,
         selectColor, selectSize, moveProductGallery, closeProdPanel,
         hoverStars, unhoverStars, rateStore, closeStoreModal } from './pages/explore.js';
import { renderCart, changeQty, removeCartItem, checkout,
         addToCartFromPanel, openCartEdit, selectCartEditColor,
         selectCartEditSize, saveCartEdit, closeCartEdit } from './pages/cart.js';
import { toggleSave, renderSaved, addAllToCart } from './pages/saved.js';
import { buildOffersPage, toggleFollowPost, sharePost } from './pages/offers.js';
import { switchAuthTab, doLogin, doRegister, doSocialLogin, doLogout,
         renderAccount, openAddressModal, closeAddressModal,
         useSavedAddress, saveAddress, toggleAmbassador, getAmbassadorLink } from './pages/account.js';

// ── Notifications (static for now) ──────────────────────
const notifs = [
  {id:1,storeId:1,txt:'<strong>StepUp TN</strong> posted a new flash sale — up to 50% off sneakers!',time:'2 min ago',unread:true},
  {id:2,storeId:3,txt:'<strong>RunFast</strong> you follow just added 3 new models this week.',time:'1 hr ago',unread:true},
  {id:3,storeId:null,txt:'Your order <strong>#SE-2041</strong> has been shipped. Delivery tomorrow.',time:'3 hrs ago',unread:true},
  {id:4,storeId:5,txt:'<strong>LuxFeet</strong> exclusive drop: Luxury Heels 30% off today only.',time:'5 hrs ago',unread:false},
  {id:5,storeId:null,txt:'🎉 You have a <strong>10 TND</strong> voucher ready on your next order.',time:'Yesterday',unread:false},
  {id:6,storeId:2,txt:'<strong>Urban Sole</strong> restocked your saved item — Vans Old Skool.',time:'Yesterday',unread:false},
  {id:7,storeId:null,txt:'Your review for order <strong>#SE-2038</strong> helped 12 shoppers.',time:'2 days ago',unread:false},
];

// ── Expose globals for inline onclick= attributes ────────
window._stores             = stores;
window._shoePool           = shoePool;
window._toast              = toast;
window._renderStoresScroll = renderStoresScroll;
window._toggleFollow       = toggleFollow;
window._openStoreModal     = openStoreModal;
window._openProductPanel   = openProductPanel;
window._selectColor        = selectColor;
window._selectSize         = selectSize;
window._moveProductGallery = moveProductGallery;
window._hoverStars         = hoverStars;
window._unhoverStars       = unhoverStars;
window._rateStore          = rateStore;
window._addToCartFromPanel = addToCartFromPanel;
window._toggleSave         = toggleSave;
window._renderSaved        = renderSaved;
window._changeQty          = changeQty;
window._removeCartItem     = removeCartItem;
window._checkout           = checkout;
window._openCartEdit       = openCartEdit;
window._selectCartEditColor = selectCartEditColor;
window._selectCartEditSize  = selectCartEditSize;
window._saveCartEdit       = saveCartEdit;
window._toggleFollowPost   = toggleFollowPost;
window._sharePost          = sharePost;
window._getAmbassadorLink  = getAmbassadorLink;
window._cartState          = () => ({ editingCartIndex });

// DB API exposed for page modules
window._db = { followStore, unfollowStore, submitRating,
               upsertCartItem, deleteCartItem, clearCart, insertOrders,
               saveItem, unsaveItem, fetchSaved, fetchCart, updateProfile };

// Functions called directly from HTML attributes
window.showPage           = showPage;
window.switchAuthTab      = switchAuthTab;
window.doLogin            = doLogin;
window.doRegister         = doRegister;
window.doSocialLogin      = doSocialLogin;
window.doLogout           = doLogout;
window.openAddressModal   = openAddressModal;
window.closeAddressModal  = closeAddressModal;
window.useSavedAddress    = useSavedAddress;
window.saveAddress        = saveAddress;
window.toggleAmbassador   = toggleAmbassador;
window.closeCartEdit      = closeCartEdit;
window.closeProdPanel     = closeProdPanel;
window.closeStoreModal    = closeStoreModal;
window.handleSearch       = handleSearch;
window.addAllToCart       = addAllToCart;

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
function openNotifs()         { buildNotifList(); document.getElementById('notif-panel').classList.add('open'); }
function closeNotifs()        { document.getElementById('notif-panel').classList.remove('open'); }
function closeNotifsOutside(e){ if (e.target === document.getElementById('notif-panel')) closeNotifs(); }

window.openNotifs         = openNotifs;
window.closeNotifs        = closeNotifs;
window.closeNotifsOutside = closeNotifsOutside;

// ── Loading overlay helpers ──────────────────────────────
function showLoader() { document.getElementById('app-loader').style.display = 'flex'; }
function hideLoader() { document.getElementById('app-loader').style.display = 'none'; }

// ── Bootstrap ────────────────────────────────────────────
async function boot() {
  showLoader();
  try {
    // 1. Fetch all public data in parallel
    const [rawStores, rawOffers, rawThumbs, rawProducts, rawSlides, rawPosters] = await Promise.all([
      fetchStores(),
      fetchStoreOffers(),
      fetchStoreThumbnails(),
      fetchProducts(),
      fetchSlides(),
      fetchPosters(),
    ]);

    setStores(rawStores);
    setStoreOffers(rawOffers);
    setStoreProducts(rawThumbs);
    setShoePool(rawProducts);
    setSlides(rawSlides);
    setPosterPool(rawPosters);

    // Keep window references in sync after state mutation
    window._stores  = rawStores;
    window._shoePool = rawProducts;

    // 2. Check current auth session
    const user = await getCurrentUser();
    if (user) {
      const profile = await getProfile(user.id);
      setLoggedInUser({
        id: user.id,
        email: user.email,
        name: profile?.name || user.email.split('@')[0],
        isAmbassador: profile?.is_ambassador || false,
        ambassadorCode: profile?.ambassador_code || null,
        savedAddress: profile?.saved_address || '',
      });

      // Load user-specific data
      const [followed, saved] = await Promise.all([
        fetchUserFollows(),
        fetchSaved(user.id),
      ]);
      followed.forEach(id => followedStores.add(id));
      setSavedItems(saved);
    }

    // 3. Render UI
    renderStoresScroll();
    initSlider();
    initFeed();
    initScrollHideNav();
    updateNotifDot(notifs);

  } catch (err) {
    console.error('Boot error:', err);
    toast('Could not load data. Check your connection.');
  } finally {
    hideLoader();
  }
}

// 4. React to auth changes (login/logout anywhere)
onAuthStateChange(async (user) => {
  if (user) {
    const profile = await getProfile(user.id);
    setLoggedInUser({
      id: user.id,
      email: user.email,
      name: profile?.name || user.email.split('@')[0],
      isAmbassador: profile?.is_ambassador || false,
      ambassadorCode: profile?.ambassador_code || null,
    });
    const [followed, saved] = await Promise.all([
      fetchUserFollows(),
      fetchSaved(user.id),
    ]);
    followedStores.clear();
    followed.forEach(id => followedStores.add(id));
    setSavedItems(saved);
    renderStoresScroll();
    updateCartBadge(cartItems);
    renderAccount();
  } else {
    setLoggedInUser(null);
    followedStores.clear();
    setSavedItems(new Set());
    setCartItems([]);
    updateCartBadge([]);
    renderStoresScroll();
    renderAccount();
  }
});

boot();
