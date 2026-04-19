// ══ STORES API ══════════════════════════════════════════
import { supabase } from './supabase.js';

export async function fetchStores() {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('id');
  if (error) throw error;
  return data;
}

export async function fetchStoreOffers() {
  const { data, error } = await supabase
    .from('store_offers')
    .select('*')
    .order('created_at', { ascending: false }); // newest first
  if (error) throw error;
  // Return as { storeId: offer } — one offer per store (most recent)
  const map = {};
  data.forEach(o => {
    if (!map[o.store_id]) map[o.store_id] = o; // first = newest
  });
  return map;
}

export async function fetchStoreThumbnails() {
  // Also pull from actual products for stores that don't have static thumbnails
  const { data: thumbs, error: tErr } = await supabase
    .from('store_product_thumbnails')
    .select('*')
    .order('sort_order');
  if (tErr) throw tErr;

  const { data: prods, error: pErr } = await supabase
    .from('products')
    .select('id, store_id, price, img')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (pErr) throw pErr;

  // Build map: static thumbnails take priority, then fall back to real products
  const map = {};
  thumbs.forEach(t => {
    if (!map[t.store_id]) map[t.store_id] = [];
    map[t.store_id].push(t);
  });
  // Add real products for stores that have no static thumbnails
  prods.forEach(p => {
    if (!map[p.store_id]) {
      map[p.store_id] = [];
    }
    // Only add if fewer than 3 thumbnails exist
    if (map[p.store_id].length < 3) {
      const alreadyHas = map[p.store_id].some(t => t.img === p.img);
      if (!alreadyHas) map[p.store_id].push({ price: p.price, img: p.img, store_id: p.store_id });
    }
  });
  return map;
}

export async function followStore(storeId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from('follows')
    .insert({ store_id: storeId, user_id: user.id });
  if (error && error.code !== '23505') throw error;
}

export async function unfollowStore(storeId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('store_id', storeId)
    .eq('user_id', user.id);
  if (error) throw error;
}

export async function fetchUserFollows() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data, error } = await supabase
    .from('follows')
    .select('store_id')
    .eq('user_id', user.id);
  if (error) return new Set();
  return new Set(data.map(r => r.store_id));
}

export async function submitRating(storeId, rating) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from('store_ratings')
    .upsert({ store_id: storeId, rating, user_id: user.id },
             { onConflict: 'user_id,store_id' });
  if (error) throw error;
}
