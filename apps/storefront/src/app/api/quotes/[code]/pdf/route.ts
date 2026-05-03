import { NextResponse } from 'next/server'
import { auth } from '../../../../../lib/auth'
import { db } from '@indus/db'

type RouteContext = { params: Promise<{ code: string }> }

/**
 * Stream a quote PDF to the customer who owns the parent RFQ. Gated by the
 * account-contact session (no signed-link fallback yet — non-logged-in
 * recipients will be bounced to /sign-in).
 */
export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth()
  if (!session?.user?.accountId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { code } = await params

  const quote = await db.quote.findUnique({
    where: { code },
    include: {
      pdfMedia: true,
      rfq: { select: { accountId: true, code: true } },
    },
  })

  if (!quote || !quote.pdfMedia) return new NextResponse('Not found', { status: 404 })
  if (quote.rfq.accountId !== session.user.accountId) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return new NextResponse('Storage misconfigured', { status: 500 })

  const publicUrl = `${url}/storage/v1/object/public/quotes/${quote.pdfMedia.storagePath}`
  const upstream = await fetch(publicUrl)
  if (!upstream.ok) return new NextResponse('Failed to fetch PDF', { status: 502 })

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
