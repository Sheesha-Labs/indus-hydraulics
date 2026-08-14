import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const IMAGES_BUCKET = 'product-images'
let cached: SupabaseClient | null = null

function client(): SupabaseClient {
  if (cached) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

export async function uploadScraperImage(
  file: File,
  productId: string,
  filename: string,
): Promise<{ storagePath: string; bytes: number; mimeType: string }> {
  const objectPath = `products/${productId}/${filename}`
  const { error } = await client().storage.from(IMAGES_BUCKET).upload(objectPath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'application/octet-stream',
  })
  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const storagePath = client().storage.from(IMAGES_BUCKET).getPublicUrl(objectPath).data.publicUrl
  return {
    storagePath,
    bytes: file.size,
    mimeType: file.type || 'application/octet-stream',
  }
}

export async function deleteScraperImage(storagePath: string): Promise<void> {
  const marker = `/storage/v1/object/public/${IMAGES_BUCKET}/`
  const markerIndex = storagePath.indexOf(marker)
  if (markerIndex < 0) return
  const objectPath = storagePath.slice(markerIndex + marker.length)
  if (!objectPath) return
  const { error } = await client().storage.from(IMAGES_BUCKET).remove([objectPath])
  if (error && !error.message.toLowerCase().includes('not found')) {
    console.warn('[scraper/storage] delete failed:', error.message)
  }
}
