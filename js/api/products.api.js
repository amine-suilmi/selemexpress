// ══ PRODUCTS API ════════════════════════════════════════
import { supabase } from './supabase.js';

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, stores(name, tag, img)')
    .eq('is_active', true)
    .order('store_id')
    .order('id');
  if (error) throw error;
  return data.map(p => ({
    id:        p.id,
    name:      p.name,
    price:     Number(p.price),
    storeId:   p.store_id,
    img:       p.img,
    storeName: p.stores?.name,
    storeTag:  p.stores?.tag,
    storeImg:  p.stores?.img,
    colors:    Array.isArray(p.colors) ? p.colors : [],
    sizes:     Array.isArray(p.sizes)  ? p.sizes  : [],
    photos:    (p.photos && typeof p.photos === 'object') ? p.photos : {},
  }));
}

export async function fetchSlides() {
  const { data, error } = await supabase
    .from('slides')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data;
}

export async function fetchPosters() {
  const { data, error } = await supabase
    .from('posters')
    .select('*, stores(name, tag, img)')
    .order('id');
  if (error) throw error;
  return data.map(p => ({ ...p, storeId: p.store_id }));
}
