// ══ SHARED STATE ════════════════════════════════════════
// All data starts null/empty; app.js fills it from Supabase on boot.

export let stores          = [];
export let storeOffers     = {};
export let storeProducts   = {};   // thumbnails map
export let shoePool        = [];
export let slides          = [];
export let posterPool      = [];
export const categories    = ["All","Streetwear","Luxury","Minimalist","Resort","Avant-garde","Heritage","Essentials","Designer"];
export const sizes         = ["XS","S","M","L","XL","XXL"];
export const colorSwatches = ['#1a1a1a','#ffffff','#e8192c','#1565c0','#16a34a','#d97706','#9333ea','#a8a29e'];

export const followedStores = new Set();
export let cartItems        = [];
export let savedItems       = new Set();
export let currentPage      = 'home';
export let exploreCat       = 'All';
export let loggedInUser     = null;   // { id, email, name, isAmbassador, ambassadorCode }
export let savedAddress     = '';
export let addressModalSource  = 'cart';
export let editingCartIndex    = null;

// ── Setters ──────────────────────────────────────────────
export function setStores(d)          { stores = d; }
export function setStoreOffers(d)     { storeOffers = d; }
export function setStoreProducts(d)   { storeProducts = d; }
export function setShoePool(d)        { shoePool = d; }
export function setSlides(d)          { slides = d; }
export function setPosterPool(d)      { posterPool = d; }
export function setCurrentPage(p)     { currentPage = p; }
export function setExploreCat(c)      { exploreCat = c; }
export function setLoggedInUser(u)    { loggedInUser = u; }
export function setSavedAddress(a)    { savedAddress = a; }
export function setAddressModalSource(s) { addressModalSource = s; }
export function setEditingCartIndex(i)   { editingCartIndex = i; }
export function setCartItems(arr)     { cartItems = arr; }
export function setSavedItems(set)    { savedItems = set; }
