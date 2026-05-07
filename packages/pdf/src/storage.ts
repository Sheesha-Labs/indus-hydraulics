import { createClient } from '@supabase/supabase-js'
import { db } from '@indus/db'

/** Bucket name for generated quote PDFs. Created on first upload. */
export const QUOTES_BUCKET = 'quotes'

export type UploadResult = {
  mediaId: string
  storagePath: string
  publicUrl: string
}

/**
 * Upload a generated quote PDF to Supabase Storage and create a Media row.
 * Returns the Media id so callers can wire it into Quote.pdfMediaId.
 *
 * Will be used by Day 4's "Send Quote" composer. Day 2 includes it so the
 * helper is ready and tested.
 */
export async function uploadQuotePdf(input: {
  pdf: Buffer
  /** Filename without extension, e.g. "INDUS-Q26386-r1". */
  fileSlug: string
  /** Optional rfqId/quoteId for traceability. */
  meta?: { rfqId?: string; quoteId?: string }
}): Promise<UploadResult> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required to upload PDFs')
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const safeSlug = input.fileSlug.replace(/[^A-Za-z0-9_-]+/g, '-')
  const ts = Date.now()
  const storagePath = `${new Date().getUTCFullYear()}/${safeSlug}-${ts}.pdf`

  // Self-heal: create the bucket on first run so there's no manual setup.
  // Bucket is private; downloads go through the admin's RBAC-gated route.
  const { data: existingBucket } = await supabase.storage.getBucket(QUOTES_BUCKET)
  if (!existingBucket) {
    const { error: createErr } = await supabase.storage.createBucket(QUOTES_BUCKET, {
      public: false,
      fileSizeLimit: 10 * 1024 * 1024,
    })
    if (createErr && !/already exists/i.test(createErr.message)) {
      throw new Error(`Supabase bucket create failed: ${createErr.message}`)
    }
  }

  const { error: uploadErr } = await supabase.storage
    .from(QUOTES_BUCKET)
    .upload(storagePath, input.pdf, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadErr) {
    throw new Error(`Supabase upload failed: ${uploadErr.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(QUOTES_BUCKET).getPublicUrl(storagePath)

  const media = await db.media.create({
    data: {
      kind: 'document',
      mimeType: 'application/pdf',
      originalFilename: `${safeSlug}.pdf`,
      storagePath,
      bytes: input.pdf.byteLength,
    },
  })

  return { mediaId: media.id, storagePath, publicUrl }
}
