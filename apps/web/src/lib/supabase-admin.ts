import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
if (!SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')

let cached: SupabaseClient | null = null

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached
  cached = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

export const STORAGE_BUCKETS = {
  images: 'product-images',
  documents: 'product-documents',
} as const

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS]

/**
 * Uploads a file to a Supabase Storage bucket.
 * Returns the storagePath we persist on the Media row — for the public images
 * bucket this is the public URL; for private buckets it's the bucket-relative
 * path so we can re-mint signed URLs later.
 */
export async function uploadToStorage(
  bucket: StorageBucket,
  file: File,
  pathPrefix: string,
): Promise<{ storagePath: string; bytes: number; mimeType: string }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-180)
  const objectPath = `${pathPrefix}/${Date.now()}-${safeName}`

  const { error } = await supabaseAdmin().storage.from(bucket).upload(objectPath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'application/octet-stream',
  })
  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const storagePath =
    bucket === STORAGE_BUCKETS.images
      ? supabaseAdmin().storage.from(bucket).getPublicUrl(objectPath).data.publicUrl
      : `${bucket}/${objectPath}` // bucket-prefixed key — resolved via signed URL at read time

  return { storagePath, bytes: file.size, mimeType: file.type || 'application/octet-stream' }
}

/**
 * Same as `uploadToStorage`, but the caller picks the exact object name
 * (no timestamp prefix). Used by the competitor scraper at ingest time —
 * the user's brief was that saved image filenames must match the product
 * title (e.g. `bosch-rexroth-a10vso-1.jpg`).
 *
 * `objectName` is appended verbatim to `pathPrefix` — caller is responsible
 * for ensuring uniqueness within the prefix. We do NOT sanitize the name
 * here so the caller has full control; sanitize before passing in.
 */
export async function uploadToStorageWithName(
  bucket: StorageBucket,
  file: File,
  pathPrefix: string,
  objectName: string,
): Promise<{ storagePath: string; bytes: number; mimeType: string }> {
  const objectPath = `${pathPrefix}/${objectName}`

  const { error } = await supabaseAdmin().storage.from(bucket).upload(objectPath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'application/octet-stream',
  })
  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const storagePath =
    bucket === STORAGE_BUCKETS.images
      ? supabaseAdmin().storage.from(bucket).getPublicUrl(objectPath).data.publicUrl
      : `${bucket}/${objectPath}`

  return { storagePath, bytes: file.size, mimeType: file.type || 'application/octet-stream' }
}

/**
 * Removes an object given the storagePath we persisted. Handles both
 * formats (full public URL or "bucket/path") so callers don't need to care.
 */
export async function deleteFromStorage(storagePath: string): Promise<void> {
  const { bucket, key } = parseStoragePath(storagePath)
  if (!bucket || !key) return // external URL — nothing to delete on our side
  const { error } = await supabaseAdmin().storage.from(bucket).remove([key])
  if (error && !error.message.includes('not found')) {
    console.warn('[supabase] delete failed:', error.message)
  }
}

function parseStoragePath(storagePath: string): { bucket: string | null; key: string | null } {
  if (!storagePath) return { bucket: null, key: null }
  // Public URL: https://xxx.supabase.co/storage/v1/object/public/<bucket>/<key>
  const publicMatch = storagePath.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
  if (publicMatch) return { bucket: publicMatch[1]!, key: publicMatch[2]! }
  // bucket/key format
  const slashIdx = storagePath.indexOf('/')
  if (slashIdx > 0 && !storagePath.startsWith('http')) {
    return { bucket: storagePath.slice(0, slashIdx), key: storagePath.slice(slashIdx + 1) }
  }
  return { bucket: null, key: null }
}
