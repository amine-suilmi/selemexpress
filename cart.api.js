// ══ CART API ════════════════════════════════════════════
import { supabase } from './supabase.js';

export async function fetchCart(userId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, products(id, name, price, img, store_id, stores(name))')
    .eq('user_id', userId);
  if (error) throw error;
  return data.map(r => ({
    id: r.id,
    productId: r.product_id,
    name: r.products.name,
    price: Number(r.products.price),
    img: r.products.img,
    storeId: r.products.store_id,
    storeName: r.products.stores?.name,
    size: r.size,
    color: r.color,
    qty: r.qty,
  }));
}

export async function upsertCartItem(userId, productId, size, color, qty) {
  const { error } = await supabase
    .from('cart_items')
    .upsert({ user_id: userId, product_id: productId, size, color, qty },
             { onConflict: 'user_id,product_id,size,color' });
  if (error) throw error;
}

export async function deleteCartItem(id) {
  const { error } = await supabase.from('cart_items').delete().eq('id', id);
  if (error) throw error;
}

export async function clearCart(userId) {
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
  if (error) throw error;
}

export async function fetchSaved(userId) {
  const { data, error } = await supabase
    .from('saved_items')
    .select('product_id')
    .eq('user_id', userId);
  if (error) throw error;
  return new Set(data.map(r => r.product_id));
}

export async function saveItem(userId, productId) {
  const { error } = await supabase
    .from('saved_items')
    .insert({ user_id: userId, product_id: productId });
  if (error && error.code !== '23505') throw error;
}

export async function unsaveItem(userId, productId) {
  const { error } = await supabase
    .from('saved_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  if (error) throw error;
}
