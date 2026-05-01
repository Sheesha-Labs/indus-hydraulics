import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

let cached: SupabaseClient | null = null

function supabase(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('Supabase env vars missing on storefront')
  }
  if (cached) return cached
  cached = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

/**
 * Mints a short-lived signed URL for a private bucket object.
 * Falls back to the raw storagePath if it's already a full URL (legacy URL-based docs).
 */
export async function signedUrlFor(storagePath: string, ttlSeconds = 60 * 5): Promise<string> {
  if (!storagePath) return ''
  if (storagePath.startsWith('http')) return storagePath
  const slashIdx = storagePath.indexOf('/')
  if (slashIdx <= 0) return storagePath
  const bucket = storagePath.slice(0, slashIdx)
  const key = storagePath.slice(slashIdx + 1)
  const { data, error } = await supabase().storage.from(bucket).createSignedUrl(key, ttlSeconds)
  if (error || !data) return ''
  return data.signedUrl
}
