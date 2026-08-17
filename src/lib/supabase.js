import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Tiger Profile CRUD ────────────────────────────────────────

/**
 * Fetch all tiger profiles from the database.
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export async function getTigers() {
  const { data, error } = await supabase
    .from('tigers')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

/**
 * Fetch a single tiger profile by its ID.
 * @param {string} id - The tiger's unique identifier (e.g. 'TGR-01').
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function getTigerById(id) {
  const { data, error } = await supabase
    .from('tigers')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

/**
 * Insert a new tiger profile into the database.
 * @param {Object} data - Tiger profile fields matching the 'tigers' table schema.
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function createTiger(data) {
  const { data: created, error } = await supabase
    .from('tigers')
    .insert(data)
    .select()
    .single();
  return { data: created, error };
}

/**
 * Update an existing tiger profile.
 * @param {string} id - The tiger's unique identifier.
 * @param {Object} data - Partial fields to update.
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function updateTiger(id, data) {
  const { data: updated, error } = await supabase
    .from('tigers')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  return { data: updated, error };
}

/**
 * Delete a tiger profile from the database.
 * @param {string} id - The tiger's unique identifier.
 * @returns {Promise<{error: Object|null}>}
 */
export async function deleteTiger(id) {
  const { error } = await supabase
    .from('tigers')
    .delete()
    .eq('id', id);
  return { error };
}

// ── Tiger Sightings (Observations) ────────────────────────────

/**
 * Fetch all sightings for a specific tiger.
 * @param {string} tigerId - The tiger's unique identifier.
 * @returns {Promise<{data: Array, error: Object|null}>}
 */
export async function getTigerSightings(tigerId) {
  const { data, error } = await supabase
    .from('sightings')
    .select('*')
    .eq('tiger_id', tigerId)
    .order('created_at', { ascending: false });
  return { data, error };
}

/**
 * Insert a new tiger sighting/observation into the database.
 * @param {Object} data - Sighting fields matching the 'sightings' table schema.
 * @returns {Promise<{data: Object|null, error: Object|null}>}
 */
export async function createTigerSighting(data) {
  const { data: created, error } = await supabase
    .from('sightings')
    .insert(data)
    .select()
    .single();
  return { data: created, error };
}

// ── Tiger Image Storage ───────────────────────────────────────

/**
 * Upload a tiger image file to Supabase Storage and return its public URL.
 * @param {File} file - The image file to upload.
 * @param {string} tigerId - The tiger's unique identifier (used for path namespacing).
 * @returns {Promise<{url: string|null, error: Object|null}>}
 */
export async function uploadTigerImage(file, tigerId) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${tigerId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('tiger-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return { url: null, error: uploadError };
  }

  const { data: urlData } = supabase.storage
    .from('tiger-images')
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl, error: null };
}
