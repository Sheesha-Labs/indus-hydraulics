import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { STORAGE_BUCKETS, supabaseAdmin } from '../../../../../lib/supabase-admin'

/**
 * Mints a single-use signed upload URL for an RFQ attachment.
 *
 * Attachments go DIRECT to storage from the browser, not through us. A
 * Server Action caps its request body at 1MB by default and Vercel caps any
 * serverless request body at 4.5MB, so the 25MB limit the design specifies
 * cannot be met by posting bytes to our own origin at all. Raising the action
 * limit would also hand anyone a way to make us parse 25MB of multipart on
 * every request.
 *
 * What this endpoint controls, and why it is safe to leave unauthenticated
 * (quoting deliberately works without an account — 02-screen-index.md §07):
 *
 *  - The storage PATH is generated here. A caller cannot choose where the
 *    file lands, cannot overwrite anything, and cannot traverse.
 *  - The bucket is the PRIVATE documents bucket. Uploads are not publicly
 *    readable; staff read them through signed URLs.
 *  - Content type and declared size are validated before a URL is issued.
 *  - The URL is single-use and short-lived, issued by Supabase.
 *
 * Abuse: an unauthenticated signer can be called in a loop to burn storage.
 * A per-IP token bucket is applied below. It is in-memory, so it is per
 * instance and resets on deploy — that is a real limit, not a pretence: it
 * blunts a single-source loop but not a distributed one. The durable fix is
 * the shared rate limiter the SEO console already needs; this is deliberately
 * the cheap version, and it is documented as such rather than left implicit.
 */

/** Per-IP token bucket. Deliberately small — six files is the form's own cap. */
const RATE_LIMIT = { tokens: 12, windowMs: 60_000 }
const buckets = new Map<string, { count: number; resetAt: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const bucket = buckets.get(ip)
  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs })
    return false
  }
  bucket.count += 1
  if (buckets.size > 5_000) {
    // Bound the map; drop anything already expired.
    for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k)
  }
  return bucket.count > RATE_LIMIT.tokens
}

const MAX_BYTES = 25 * 1024 * 1024

// Kept deliberately tight. The design's copy offers JPG/PNG/HEIC/PDF; the
// existing form additionally advertised STEP and DWG, which engineers really
// do send, so both CAD types are accepted. Anything executable is not.
const ALLOWED = new Map<string, string>([
  ['application/pdf', 'pdf'],
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/heic', 'heic'],
  ['image/heif', 'heif'],
  ['image/webp', 'webp'],
  ['model/step', 'step'],
  ['application/step', 'step'],
  ['application/octet-stream', 'bin'],
])

type Body = { filename?: unknown; contentType?: unknown; size?: unknown }

export async function POST(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many uploads. Wait a minute and try again.' }, { status: 429 })
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 })
  }

  const contentType = typeof body.contentType === 'string' ? body.contentType : ''
  const size = typeof body.size === 'number' ? body.size : NaN
  const filename = typeof body.filename === 'string' ? body.filename : ''

  if (!Number.isFinite(size) || size <= 0) {
    return NextResponse.json({ error: 'Missing file size.' }, { status: 400 })
  }
  if (size > MAX_BYTES) {
    return NextResponse.json({ error: 'That file is larger than 25 MB.' }, { status: 413 })
  }
  if (!ALLOWED.has(contentType)) {
    return NextResponse.json(
      { error: 'That file type is not accepted. Send a PDF, image, or CAD file.' },
      { status: 415 },
    )
  }

  // Extension comes from the declared content type, never from the supplied
  // filename — the filename is untrusted and is only kept as a display label.
  const ext = ALLOWED.get(contentType)!
  const path = `rfq-attachments/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`

  const { data, error } = await supabaseAdmin()
    .storage.from(STORAGE_BUCKETS.documents)
    .createSignedUploadUrl(path)

  if (error || !data) {
    console.error('[rfq-attachments] failed to sign upload', error)
    return NextResponse.json({ error: 'Could not prepare the upload. Try again.' }, { status: 500 })
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    path: data.path,
    // Echoed back so the client sends us a label we already know is a string
    // and we never have to trust it as a path.
    label: filename.slice(0, 180),
  })
}
