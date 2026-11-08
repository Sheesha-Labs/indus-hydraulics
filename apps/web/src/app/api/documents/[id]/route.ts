import { NextResponse } from 'next/server'
import { db } from '@indus/db'
import { signedUrlFor } from '../../../../lib/supabase'
import { mediaUrl } from '../../../../lib/media'

/**
 * Download endpoint for product documents — datasheets, manuals, CAD files.
 *
 * The PDP used to resolve these itself: it read the session, decided whether
 * the visitor could have a gated document, and minted a Supabase signed URL
 * straight into the HTML. Two problems with that, and this route fixes both.
 *
 * 1. The session read made the PDP dynamic, which is most of why the whole
 *    catalogue was uncacheable.
 * 2. Signed URLs live five minutes (see `signedUrlFor`). The moment the PDP
 *    became cacheable, every download link in the cached HTML would be dead
 *    within five minutes of the page being generated. Minting per-request is
 *    not an optimisation here, it is the only correct behaviour.
 *
 * Gated documents. These used to require a customer sign-in. Customer
 * accounts were removed in 2026-11, so "gated" now means ON REQUEST: the
 * handler never mints a URL for one and sends the visitor to /contact
 * instead. Gated files sit in the private `product-documents` bucket, which
 * is not publicly readable, so this handler is still the only way to a working
 * URL — and for a gated document there is none. No document is exposed that
 * was not exposed before.
 */
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params

  const doc = await db.productDocument.findUnique({
    where: { id },
    select: {
      isGated: true,
      media: { select: { storagePath: true } },
    },
  })

  if (!doc) return new NextResponse('Not found', { status: 404 })

  if (doc.isGated) {
    return NextResponse.redirect(
      new URL('/contact', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
      { status: 307, headers: { 'cache-control': 'no-store' } },
    )
  }

  const path = doc.media.storagePath
  const isPrivateBucket = path.startsWith('product-documents/')
  const url = isPrivateBucket ? await signedUrlFor(path) : mediaUrl(path)

  if (!url) return new NextResponse('Document unavailable', { status: 404 })

  // no-store so neither the CDN nor the browser retains a redirect to a URL
  // that expires in five minutes, or one minted for a different visitor.
  return NextResponse.redirect(url, { status: 307, headers: { 'cache-control': 'no-store' } })
}
