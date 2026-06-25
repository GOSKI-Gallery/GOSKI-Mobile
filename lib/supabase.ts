import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

function createNoopClient() {
  return createClient(
    "https://placeholder.supabase.co",
    "placeholder-anon-key",
    {
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
      db: { schema: 'laravel' },
    }
  );
}

export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "[Supabase] ERROR: EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY not defined.",
      { url: supabaseUrl ? `${supabaseUrl.slice(0, 20)}...` : "undefined", keyDefined: !!supabaseAnonKey }
    );
    return createNoopClient();
  }
  console.log("[Supabase] Cliente inicializado com URL:", supabaseUrl.slice(0, 30) + "...");
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    db: {
      schema: 'laravel',
    },
  });
})()

export async function ensureProfile(userId: string) {
  const { data: sessionData } = await supabase.auth.getSession()
  const user = sessionData?.session?.user
  if (!user) return

  const meta = user.user_metadata || {}
  const email = user.email || meta.email || `user_${userId.slice(0, 8)}@placeholder.local`
  const username = meta.username || email.split('@')[0]

  const { error } = await supabase.from('users').insert({
    id: userId,
    username,
    email,
    updated_at: new Date().toISOString(),
  })
  // Ignore PostgreSQL 23505 (unique_violation): this can happen when the profile
  // row already exists (e.g., retried sign-in / repeated ensureProfile call).
  // In this flow, duplicate-key means "already provisioned", which is acceptable.
  if (error && error.code !== '23505') {
    console.warn('[ensureProfile] insert error (RLS?):', error)
  }
}

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}
