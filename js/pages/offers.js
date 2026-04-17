// ══ OFFERS PAGE ═════════════════════════════════════════
import { stores, storeOffers } from '../data/mock.js';
import { followedStores, loggedInUser } from '../state.js';
import { toast, fmtFollowers } from '../ui.js';
import { openStoreModal } from './explore.js';

const shareSVG = `<svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;

export function buildOffersPage() {
  const feed = document.getElementById('offers-feed');
  feed.innerHTML = '';
  [...stores].sort(() => Math.random() - .5).forEach(store => {
    const offer = storeOffers[store.id];
    if (!offer) return;
    const isFollowed = followedStores.has(store.id);
    const likes = Math.floor(Math.random() * 900) + 50;
    const post = document.createElement('div');
    post.className = 'offer-post';
    post.innerHTML = `
      <div class="op-header">
        <div class="op-avatar" onclick="window._openStoreModal(window._stores.find(s=>s.id===${store.id}))"><img src="${store.img}" alt="${store.name}" loading="lazy"></div>
        <div class="op-store-info" onclick="window._openStoreModal(window._stores.find(s=>s.id===${store.id}))">
          <div class="op-store-name">${store.name}</div>
          <div class="op-store-tag">${store.tag} · Explore</div>
        </div>
        <button class="op-follow-btn ${isFollowed ? 'following' : ''}" onclick="window._toggleFollowPost(${store.id},this)">${isFollowed ? 'Following ✓' : 'Follow'}</button>
      </div>
      <img class="op-img" src="${offer.bg}" alt="${offer.title}" loading="lazy" onclick="window._openStoreModal(window._stores.find(s=>s.id===${store.id}))">
      <div class="op-actions">
        <button class="op-action-btn like-btn">🤍</button>
        <button class="op-share-btn" onclick="window._sharePost('${store.name}')" title="Share">${shareSVG}</button>
        <button class="op-link-btn" onclick="event.stopPropagation();window._getAmbassadorLink(${store.id})" title="Copy my ambassador link">🔗</button>
      </div>
      <div class="op-likes like-label">${fmtFollowers(likes)} likes</div>
      <div class="op-caption">
        <span class="op-badge">${offer.badge}</span><br>
        <span class="store-bold">${store.name}</span>
        <span> ${offer.title} — ${offer.sub}</span><br>
        <span class="op-cta" onclick="window._openStoreModal(window._stores.find(s=>s.id===${store.id}))">Shop Now →</span>
      </div>`;
    let liked = false;
    const heartBtn = post.querySelector('.like-btn');
    const labelEl = post.querySelector('.like-label');
    heartBtn.addEventListener('click', () => {
      liked = !liked;
      heartBtn.textContent = liked ? '❤️' : '🤍';
      labelEl.textContent = fmtFollowers(liked ? likes + 1 : likes) + ' likes';
    });
    feed.appendChild(post);
  });
}

export function toggleFollowPost(storeId, btn) {
  if (followedStores.has(storeId)) {
    followedStores.delete(storeId);
    btn.textContent = 'Follow';
    btn.classList.remove('following');
    toast('Unfollowed');
  } else {
    followedStores.add(storeId);
    btn.textContent = 'Following ✓';
    btn.classList.add('following');
    toast('Following ' + stores.find(s => s.id === storeId).name + ' 🎉');
  }
  window._renderStoresScroll?.();
}

export function sharePost(name) {
  if (navigator.share) navigator.share({ title: 'SelemExpress Explore', text: 'Check out ' + name + ' on SelemExpress!', url: location.href }).catch(() => {});
  else toast('Link copied! 🔗');
}
