import { NextResponse } from 'next/server'
import { db } from '@indus/db'
import { verifyQuoteAccessToken } from '@indus/domain'

type RouteContext = { params: Promise<{ code: string }> }

/**
 * Stream a quote PDF to the holder of a signed access token (`?token=...`)
 * for its parent RFQ — the link in the quote_sent email and on the
 * /quote/<code> status page. There are no customer accounts, so the token is
 * the only credential this route accepts.
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
      rfq: { select: { code: true } },
    },
  })

  if (!quote || !quote.pdfMedia) return new NextResponse('Not found', { status: 404 })

  // A quote raised from an inbound Enquiry has no parent RFQ and is an
  // internal document — it is not served here.
  if (!quote.rfq) return new NextResponse('Not found', { status: 404 })

  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const tokenCheck = token ? verifyQuoteAccessToken(token, quote.rfq.code) : null
  if (tokenCheck?.valid !== true) return new NextResponse('Unauthorized', { status: 401 })

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
