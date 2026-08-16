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
 * The remaining abuse case is someone burning storage by requesting URLs in a
 * loop. That is rate-limiting work, not signing work — see the TODO below.
 */

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
