import { NextResponse } from 'next/server'
import { auth } from '../../../../../lib/auth'
import { db } from '@indus/db'
import { verifyQuoteAccessToken } from '@indus/domain'

type RouteContext = { params: Promise<{ code: string }> }

/**
 * Stream a quote PDF to either:
 *  (a) the logged-in account contact who owns the parent RFQ, or
 *  (b) a holder of a signed access token (`?token=...`) for that RFQ — used
 *      by the link in the quote_sent email so a forwarded recipient can
 *      download the PDF without an account.
 *
 * The token's signed payload is the rfq code. We look up the quote, then
 * verify the token against the quote's parent rfq.code.
 */
export async function GET(req: Request, { params }: RouteContext) {
  const { code } = await params

  const quote = await db.quote.findUnique({
    where: { code },
    include: {
      pdfMedia: true,
      rfq: { select: { accountId: true, code: true } },
    },
  })

  if (!quote || !quote.pdfMedia) return new NextResponse('Not found', { status: 404 })

  // This viewer authorises against the customer account on the parent RFQ.
  // A quote raised from an inbound Enquiry has no customer account behind it
  // and is an internal document — it is not served here.
  if (!quote.rfq) return new NextResponse('Not found', { status: 404 })

  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const tokenCheck = token ? verifyQuoteAccessToken(token, quote.rfq.code) : null
  const hasValidToken = tokenCheck?.valid === true

  if (!hasValidToken) {
    const session = await auth()
    if (!session?.user?.accountId) return new NextResponse('Unauthorized', { status: 401 })
    if (quote.rfq.accountId !== session.user.accountId) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return new NextResponse('Storage misconfigured', { status: 500 })

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/quotes/${quote.pdfMedia.storagePath}`
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
