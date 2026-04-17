// ══ ACCOUNT PAGE ════════════════════════════════════════
import { loggedInUser, savedAddress, addressModalSource, setLoggedInUser, setSavedAddress, setAddressModalSource } from '../state.js';
import { toast, generateAmbassadorCode } from '../ui.js';
import { renderCart } from './cart.js';

export function switchAuthTab(tab, btn) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('form-login').classList.toggle('hidden', tab !== 'login');
  document.getElementById('form-register').classList.toggle('hidden', tab !== 'register');
}

export function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pw = document.getElementById('login-pw').value;
  if (!email || !pw) { toast('Please fill in all fields'); return; }
  setLoggedInUser({ name: email.split('@')[0], email, isAmbassador: loggedInUser?.isAmbassador || false, ambassadorCode: loggedInUser?.ambassadorCode || generateAmbassadorCode(email) });
  toast('Welcome back! 👋');
  renderAccount();
}

export function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pw = document.getElementById('reg-pw').value;
  const pw2 = document.getElementById('reg-pw2').value;
  if (!name || !email || !pw) { toast('Please fill in all fields'); return; }
  if (pw !== pw2) { toast('Passwords do not match'); return; }
  if (pw.length < 6) { toast('Password too short'); return; }
  setLoggedInUser({ name, email, isAmbassador: false, ambassadorCode: generateAmbassadorCode(name) });
  toast('Account created! 🎉');
  renderAccount();
}

export function doSocialLogin(provider) {
  setLoggedInUser({ name: 'Guest User', email: 'guest@selemexpress.com', isAmbassador: false, ambassadorCode: generateAmbassadorCode(provider) });
  toast('Signed in with ' + provider + ' ✓');
  renderAccount();
}

export function doLogout() {
  setLoggedInUser(null);
  toast('Signed out');
  renderAccount();
}

export function renderAccount() {
  const formsWrap = document.getElementById('auth-forms-wrap');
  const profileView = document.getElementById('profile-view');
  if (loggedInUser) {
    formsWrap.classList.add('hidden');
    profileView.classList.add('show');
    document.getElementById('profile-name').textContent = loggedInUser.name;
    document.getElementById('profile-email').textContent = loggedInUser.email;
    const badge = document.getElementById('ambassador-badge');
    const btn = document.getElementById('ambassador-toggle-btn');
    if (badge && btn) {
      badge.textContent = loggedInUser.isAmbassador ? `Ambassador active · ${loggedInUser.ambassadorCode}` : 'Ambassador account required';
      btn.textContent = loggedInUser.isAmbassador ? 'Copy My Ambassador Link' : 'Activate Ambassador Account';
    }
  } else {
    formsWrap.classList.remove('hidden');
    profileView.classList.remove('show');
  }
}

export function openAddressModal(source = 'cart') {
  setAddressModalSource(source);
  document.getElementById('address-current-box').textContent = savedAddress || 'No address saved yet.';
  document.getElementById('address-input').value = savedAddress || '';
  document.getElementById('address-modal').classList.add('open');
}

export function closeAddressModal(e) {
  if (e.target === document.getElementById('address-modal'))
    document.getElementById('address-modal').classList.remove('open');
}

export function useSavedAddress() {
  document.getElementById('address-modal').classList.remove('open');
  if (addressModalSource === 'cart') renderCart();
  toast(savedAddress ? 'Using saved address ✓' : 'No saved address yet');
}

export function saveAddress() {
  const value = document.getElementById('address-input').value.trim();
  if (!value) { toast('Please enter an address'); return; }
  setSavedAddress(value);
  document.getElementById('address-modal').classList.remove('open');
  if (addressModalSource === 'cart') renderCart();
  renderAccount();
  toast('Address updated ✓');
}

export function toggleAmbassador() {
  if (!loggedInUser) { toast('Please sign in first'); window.showPage('account', document.querySelectorAll('.bot-nav a')[4]); return; }
  if (!loggedInUser.isAmbassador) {
    loggedInUser.isAmbassador = true;
    loggedInUser.ambassadorCode = loggedInUser.ambassadorCode || generateAmbassadorCode(loggedInUser.name);
    renderAccount();
    toast('Ambassador account activated ✓');
    return;
  }
  const link = `${location.origin}${location.pathname}?ref=${loggedInUser.ambassadorCode}`;
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(link).catch(() => {});
  toast('Your ambassador link is ready 🔗');
}

export function getAmbassadorLink(storeId) {
  if (!loggedInUser) { toast('Please sign in first'); window.showPage('account', document.querySelectorAll('.bot-nav a')[4]); return; }
  if (!loggedInUser.isAmbassador) { toast('Ambassador account required'); window.showPage('account', document.querySelectorAll('.bot-nav a')[4]); return; }
  const store = window._stores?.find(s => s.id === storeId);
  const link = `${location.origin}${location.pathname}?ref=${loggedInUser.ambassadorCode}&store=${storeId}`;
  if (navigator.share) { navigator.share({ title: 'SelemExpress Ambassador Link', text: `Shop ${store?.name || 'this store'} with my special link`, url: link }).catch(() => {}); }
  else if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(link).catch(() => {}); }
  toast('Special ambassador link ready · You earn 5% per sale');
}
