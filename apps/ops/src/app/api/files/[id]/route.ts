import { sha256Hex } from '../../../../lib/crypto'
import { AccessError, requireOpsUser } from '../../../../lib/access'
import type { OpsUser } from '../../../../lib/access-core'
import { hit } from '../../../../server/access/rate-limit'
import { mayOpenFile } from '../../../../server/documents/access'
import { verifyFileToken } from '../../../../server/documents/file-token'
import { fileForServing, SIGNED_URL_SECONDS } from '../../../../server/storage/files'
import { verifyLocalUrl, writeLocalObject } from '../../../../server/storage/local-storage'
import { getStorage, usesLocalStorage } from '../../../../server/storage/storage'

/**
 * `/api/files/<id>` (ADR-21, S11-T04): a stored file for a signed-in person, or for anyone holding a scoped
 * token for that file (`?t=`, ten minutes at most, server/documents/file-token.ts). `/api/files` is on the
 * proxy's public prefix list because this route verifies its caller itself: no session and no token → 401; a
 * bad or expired token → 403; a file the person may not open (internal cost documents for a Helper without
 * margins) → 403; an unknown or purged file → 404. Otherwise a 302 to a 60-second signed Storage URL that
 * saves under the stored file name, or the bytes inline (`?inline=1`, the document viewer and the letterhead
 * logo); never cached. Rate limited per person and per token.
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

const PORTAL_KEY =
  /^supplier\/[0-9a-f-]{36}\/request\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(pdf|png|jpe?g)$/

/** A stored file id (UUID) or the local stand-in's path; anything else is not a file. */
const FILE_ID = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|local)$/i

const RATE = { windowSeconds: 60, max: 120 } as const

async function caller(
  request: Request
): Promise<{ user: OpsUser | null; token: string | null } | Response> {
  const token = new URL(request.url).searchParams.get('t')
  if (token) return { user: null, token }
  try {
    return { user: await requireOpsUser(), token: null }
  } catch (error) {
    if (error instanceof AccessError) {
      return Response.json({ error: 'Sign in required' }, { status: 401, headers: NO_STORE })
    }
    throw error
  }
}

const forbidden = () => new Response('Forbidden', { status: 403, headers: NO_STORE })

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // A malformed id is not a file: 404 before the session check (nothing to protect, no database).
  if (!FILE_ID.test(id)) return notFound()

  if (id === 'local') {
    const refused = await signedIn()
    if (refused) return refused
    if (!usesLocalStorage()) return notFound()
    const grant = verifyLocalUrl(new URL(request.url).searchParams, 'get')
    if (!grant) return notFound()
    const stream = await getStorage().openRead(grant.bucket, grant.key)
    if (!stream) return notFound()
    return new Response(stream, {
      headers: { ...NO_STORE, 'Content-Type': contentType(grant.key) },
    })
  }

  const who = await caller(request)
  if (who instanceof Response) return who
  if (who.token) {
    const check = verifyFileToken(who.token)
    if (!check.ok || check.fileId !== id) return forbidden()
  }
  const limited = !(await hit(
    who.user ? `file-user:${who.user.id}` : `file-token:${sha256Hex(who.token!)}`,
    RATE
  ))
  if (limited)
    return new Response('Too many requests', {
      status: 429,
      headers: { ...NO_STORE, 'Retry-After': '60' },
    })

  const file = await fileForServing(id)
  if (!file) return notFound()
  if (who.user && !mayOpenFile(who.user, file.kinds)) return forbidden()

  if (new URL(request.url).searchParams.get('inline') === '1') {
    const stream = await getStorage().openRead(file.bucket, file.path)
    if (!stream) return notFound()
    return new Response(stream, {
      headers: {
        ...NO_STORE,
        'Content-Type': file.mimeType,
        'Content-Disposition': `inline; filename="${file.filename.replace(/"/g, '')}"`,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }
  const url = await getStorage().createSignedUrl(file.bucket, file.path, SIGNED_URL_SECONDS, {
    download: file.filename,
  })
  if (!url) return notFound()
  return new Response(null, { status: 302, headers: { ...NO_STORE, Location: url } })
}

/** Local development only: the PUT half of a local signed upload URL. */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (id !== 'local') return notFound()
  if (!usesLocalStorage()) return notFound()
  const grant = verifyLocalUrl(new URL(request.url).searchParams, 'put')
  if (!grant) return notFound()
  // S10: a supplier on /u has no session; like a Storage signed upload URL in production, the signed grant for the
  // portal's own prefix (supplier/<id>/request/<requestId>/…) is the credential. Every other PUT needs a session.
  if (!PORTAL_KEY.test(grant.key)) {
    const refused = await signedIn()
    if (refused) return refused
  }
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
