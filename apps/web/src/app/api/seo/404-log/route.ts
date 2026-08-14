import { NextResponse } from 'next/server'
import { db } from '@indus/db'

/**
 * Records 404s into NotFoundLog. Storefront's not-found.tsx fires a
 * sendBeacon to this endpoint on render. Repeated visits to the same
 * path bump `hits` and `lastSeenAt` rather than creating new rows.
 *
 * Best-effort: a 404 page is already failing the request, so we don't
 * want logging to add another failure mode. Validation errors return
 * 400 silently; everything else returns 200.
 */
export const runtime = 'nodejs'

const MAX_PATH = 1000
const MAX_REFERER = 1000
const MAX_UA = 400

export async function POST(req: Request) {
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const body = payload as Record<string, unknown>
  const path =
    typeof body.path === 'string' ? body.path.slice(0, MAX_PATH) : ''
  if (!path || !path.startsWith('/')) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const referer =
    typeof body.referer === 'string' ? body.referer.slice(0, MAX_REFERER) : null
  const userAgent =
    typeof body.userAgent === 'string' ? body.userAgent.slice(0, MAX_UA) : null

  try {
    const now = new Date()
    await db.notFoundLog.upsert({
      where: { path },
      create: {
        path,
        referer,
        userAgent,
        hits: 1,
        firstSeenAt: now,
        lastSeenAt: now,
      },
      update: {
        hits: { increment: 1 },
        lastSeenAt: now,
        // Refresh referer/UA only when missing — keep the FIRST observed
        // values once set, so the admin sees what found this 404 originally.
        ...(referer ? {} : { referer: null }),
      },
    })
  } catch {
    // Swallow errors — the storefront has already rendered the 404.
  }
  return NextResponse.json({ ok: true })
}
