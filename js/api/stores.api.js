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
    .select('*');
  if (error) throw error;
  // Return as { storeId: offer } map
  return Object.fromEntries(data.map(o => [o.store_id, o]));
}

export async function fetchStoreThumbnails() {
  const { data, error } = await supabase
    .from('store_product_thumbnails')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  // Return as { storeId: [thumb,...] } map
  const map = {};
  data.forEach(t => {
    if (!map[t.store_id]) map[t.store_id] = [];
    map[t.store_id].push(t);
  });
  return map;
}

export async function followStore(storeId) {
  const { error } = await supabase
    .from('follows')
    .insert({ store_id: storeId });
  if (error && error.code !== '23505') throw error; // ignore duplicate
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
  if (error) throw error;
  return new Set(data.map(r => r.store_id));
}

export async function submitRating(storeId, rating) {
  const { error } = await supabase
    .from('store_ratings')
    .upsert({ store_id: storeId, rating }, { onConflict: 'user_id,store_id' });
  if (error) throw error;
}
