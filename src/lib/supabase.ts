import 'react-native-url-polyfill/auto';
// Persists the auth session in SQLite-backed localStorage (no size limit, unlike SecureStore).
import 'expo-sqlite/localStorage/install';

import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Supabase client, or null when the env vars aren't set.
 * With no client the app still works fully offline; accounts and sync are just unavailable.
 */
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          storage: localStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export const isSyncConfigured = supabase !== null;
