import { AccessError, requireOpsUser } from '../../../../lib/access'
import { signedUrlForFile } from '../../../../server/storage/files'
import { verifyLocalUrl, writeLocalObject } from '../../../../server/storage/local-storage'
import { getStorage, usesLocalStorage } from '../../../../server/storage/storage'

/**
 * `/api/files/<id>` (ADR-21): a stored file for a signed-in person. `/api/files` is on the proxy's
 * public prefix list because this route verifies its caller itself: no session → 401; an unknown or
 * purged file → 404; otherwise a 302 to a 60-second signed Storage URL, never cached. (Document-token
 * access for client pages arrives in S18.)
 *
 * `/api/files/local` is the local-development stand-in for Storage's signed URLs
 * (server/storage/local-storage.ts): it answers only while that stand-in is the active storage, which
 * is never in production or preview, and only for an unexpired HMAC-signed query.
 */
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'private, no-store' }

/** C19 ceiling: the largest object any Ops bucket takes. */
const LOCAL_MAX_BYTES = 25 * 1024 * 1024

async function signedIn(): Promise<Response | null> {
  try {
    await requireOpsUser()
    return null
  } catch (error) {
    if (error instanceof AccessError) {
      return Response.json({ error: 'Sign in required' }, { status: 401, headers: NO_STORE })
    }
    throw error
  }
}

const notFound = () => new Response('Not found', { status: 404, headers: NO_STORE })

/** A stored file id (UUID) or the local stand-in's path; anything else is not a file. */
const FILE_ID = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|local)$/i

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // A malformed id is not a file: 404 before the session check (nothing to protect, no database).
  if (!FILE_ID.test(id)) return notFound()
  const refused = await signedIn()
  if (refused) return refused

  if (id === 'local') {
    if (!usesLocalStorage()) return notFound()
    const grant = verifyLocalUrl(new URL(request.url).searchParams, 'get')
    if (!grant) return notFound()
    const stream = await getStorage().openRead(grant.bucket, grant.key)
    if (!stream) return notFound()
    return new Response(stream, {
      headers: { ...NO_STORE, 'Content-Type': contentType(grant.key) },
    })
  }

  const url = await signedUrlForFile(id)
  if (!url) return notFound()
  return new Response(null, { status: 302, headers: { ...NO_STORE, Location: url } })
}

/** Local development only: the PUT half of a local signed upload URL. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (id !== 'local') return notFound()
  const refused = await signedIn()
  if (refused) return refused
  if (!usesLocalStorage()) return notFound()
  const grant = verifyLocalUrl(new URL(request.url).searchParams, 'put')
  if (!grant) return notFound()
  const bytes = new Uint8Array(await request.arrayBuffer())
  if (bytes.length > LOCAL_MAX_BYTES) {
    return new Response('Too large', { status: 413, headers: NO_STORE })
  }
  await writeLocalObject(grant.bucket, grant.key, bytes)
  return new Response(null, { status: 200, headers: NO_STORE })
}

function contentType(key: string): string {
  if (key.endsWith('.png')) return 'image/png'
  if (/\.jpe?g$/.test(key)) return 'image/jpeg'
  return 'application/octet-stream'
}
