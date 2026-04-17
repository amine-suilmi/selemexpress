// ══ SHARED STATE ════════════════════════════════════════

export const followedStores = new Set([1, 3, 5]);
export let cartItems = [];
export let savedItems = new Set();
export let currentPage = 'home';
export let exploreCat = 'All';
export let loggedInUser = null;
export let savedAddress = '';
export let addressModalSource = 'cart';
export let editingCartIndex = null;

export function setCurrentPage(p) { currentPage = p; }
export function setExploreCat(c) { exploreCat = c; }
export function setLoggedInUser(u) { loggedInUser = u; }
export function setSavedAddress(a) { savedAddress = a; }
export function setAddressModalSource(s) { addressModalSource = s; }
export function setEditingCartIndex(i) { editingCartIndex = i; }
export function setCartItems(arr) { cartItems = arr; }
export function setSavedItems(set) { savedItems = set; }
