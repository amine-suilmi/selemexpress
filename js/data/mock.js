// ══ STATIC FALLBACK DATA (overridden by DB on boot) ══════
// These are used only if the DB fetch fails.
// Real data comes from Supabase via fetchProducts() / fetchStores() etc.

export const stores          = [];
export const storeOffers     = {};
export const storeProducts   = {};
export const shoePool        = [];
export const slides          = [];
export const posterPool      = [];

export const categories = [
  "All", "Streetwear", "Luxury", "Minimalist",
  "Resort", "Avant-garde", "Heritage", "Essentials", "Designer"
];

export const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export const colorSwatches = [
  '#1a1a1a', '#ffffff', '#e8192c', '#1565c0',
  '#16a34a', '#d97706', '#9333ea', '#a8a29e'
];

export const notifs = [
  { id:1, storeId:1,    txt:'<strong>VLTG Studio</strong> just dropped the SS25 collection.',   time:'2 min ago',  unread:true  },
  { id:2, storeId:5,    txt:'<strong>BLOC Noir</strong> — Void Series. Only 20 pieces left.',   time:'1 hr ago',   unread:true  },
  { id:3, storeId:null, txt:'Your order <strong>#SE-2041</strong> has been shipped.',            time:'3 hrs ago',  unread:true  },
  { id:4, storeId:2,    txt:'<strong>Maison Kef</strong> silk edit — exclusive restock.',        time:'5 hrs ago',  unread:false },
  { id:5, storeId:null, txt:'🎉 You have a <strong>10 TND</strong> voucher on your next order.', time:'Yesterday',  unread:false },
  { id:6, storeId:8,    txt:'<strong>Arc Studio</strong> — The Coat is back for one week.',      time:'Yesterday',  unread:false },
  { id:7, storeId:null, txt:'Your review for <strong>#SE-2038</strong> helped 12 shoppers.',     time:'2 days ago', unread:false },
];
