// ══ STORES API ══════════════════════════════════════════
// Placeholder functions — replace with real API calls

import { supabase } from './supabase.js'

export async function fetchStores() {
  const { data, error } = await supabase
    .from('stores')
    .select('*')

  if (error) {
    console.error('ERROR:', error)
    return []
  }

  console.log('DATA:', data)
  return data
}

export async function fetchStoreById(id) {
  // TODO: fetch a single store by id
  return null;
}

export async function followStore(storeId, userId) {
  // TODO: record follow in backend
  return null;
}

export async function unfollowStore(storeId, userId) {
  // TODO: record unfollow in backend
  return null;
}

export async function rateStore(storeId, userId, rating) {
  // TODO: submit store rating to backend
  return null;
}
