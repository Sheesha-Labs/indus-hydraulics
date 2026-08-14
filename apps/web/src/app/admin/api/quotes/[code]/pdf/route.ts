import { NextResponse } from 'next/server'
import { auth } from '../../../../../../lib/admin-auth'
import { hasRole, ROLES } from '../../../../../../lib/rbac'
import { db } from '@indus/db'

type RouteContext = { params: Promise<{ code: string }> }

/**
 * Stream a previously-issued quote PDF to staff. Reads the public Supabase
 * Storage URL from the Quote.pdfMedia row and proxies it (so the response is
 * cookie-protected by the admin auth middleware rather than world-readable).
 */
export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth()
  if (!hasRole(session, ROLES.RFQ_REVIEW)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { code } = await params

  // The Quote.code may contain "/" (e.g. INDUS/Q26387) — Next.js URL-decodes
  // it for us, so the param matches what's in the DB.
  const quote = await db.quote.findUnique({
    where: { code },
    include: { pdfMedia: true },
  })

  if (!quote || !quote.pdfMedia) return new NextResponse('Not found', { status: 404 })

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return new NextResponse('Storage misconfigured', { status: 500 })

  const publicUrl = `${url}/storage/v1/object/public/quotes/${quote.pdfMedia.storagePath}`
  const upstream = await fetch(publicUrl)
  if (!upstream.ok) return new NextResponse('Failed to fetch PDF from storage', { status: 502 })

  const buf = await upstream.arrayBuffer()
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${quote.code.replace(/[^A-Za-z0-9_-]+/g, '-')}.pdf"`,
      'Cache-Control': 'private, max-age=60',
    },
  })
}
