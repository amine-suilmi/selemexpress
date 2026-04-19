// ══ ROUTER ══════════════════════════════════════════════
import { setCurrentPage } from './state.js';
import { buildExplorePage } from './pages/explore.js';
import { renderCart } from './pages/cart.js';
import { renderSaved } from './pages/saved.js';
import { buildOffersPage } from './pages/offers.js';
import { renderAccount } from './pages/account.js';

export function showPage(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  // btn is null when navigating to pages without a bottom-nav button (e.g. account)
  document.querySelectorAll('.bot-nav a').forEach(a => a.classList.remove('active'));
  if (btn) btn.classList.add('active');
  setCurrentPage(page);
  const el = document.getElementById('page-' + page);
  if (el) el.style.display = 'block';
  window.scrollTo(0, 0);
  document.getElementById('top-nav').classList.remove('hidden');
  if (page === 'explore') buildExplorePage();
  if (page === 'cart') renderCart();
  if (page === 'saved') renderSaved();
  if (page === 'offers') buildOffersPage();
  if (page === 'account') renderAccount();
  return false;
}

// Expose globally for inline onclick handlers
window.showPage = showPage;
