import { NextResponse } from 'next/server'
import { auth } from '../../../../../../lib/admin-auth'
import { hasRole, ROLES } from '../../../../../../lib/rbac'
import { renderEstimatePdf } from '@indus/pdf'
import { buildEstimateInputFromRfq, type EstimateOverrides } from '../../../../../../lib/build-estimate-input'

type RouteContext = { params: Promise<{ code: string }> }

/**
 * Streams a quote PDF preview for an RFQ. Two modes:
 *  - GET with no query params: render with RFQ + StoreSettings defaults
 *    (used by the static "Preview Quote PDF →" link on the detail page).
 *  - GET with composer query params: render with the engineer's current
 *    composer values without persisting anything (used by the live preview
 *    button inside the Send-Quote composer).
 *
 * Recognised query params (all optional):
 *   discountTotal, shipping, vatRatePct, validityDays
 *   subjectOverride, notesOverride, referenceLine
 */
export async function GET(req: Request, { params }: RouteContext) {
  const session = await auth()
  if (!hasRole(session, ROLES.RFQ_REVIEW)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { code } = await params

  const url = new URL(req.url)
  const overrides = parseOverridesFromQuery(url.searchParams)

  const input = await buildEstimateInputFromRfq(code, overrides)
  if (!input) return new NextResponse('RFQ not found', { status: 404 })

  try {
    const pdf = await renderEstimatePdf(input)
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${code}-preview.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[preview-pdf]', err)
    return new NextResponse('Failed to render PDF', { status: 500 })
  }
}

function parseOverridesFromQuery(sp: URLSearchParams): EstimateOverrides {
  const out: EstimateOverrides = {}

  const num = (key: string): number | undefined => {
    const raw = sp.get(key)
    if (raw === null || raw === '') return undefined
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }
  const str = (key: string): string | undefined => {
    const raw = sp.get(key)
    return raw && raw.length > 0 ? raw : undefined
  }

  const discount = num('discountTotal')
  if (discount !== undefined) out.discountTotal = discount
  const shipping = num('shipping')
  if (shipping !== undefined) out.shipping = shipping
  const vat = num('vatRatePct')
  if (vat !== undefined) out.vatRatePct = vat
  const validity = num('validityDays')
  if (validity !== undefined && Number.isInteger(validity)) {
    out.validityDays = validity
  }

  const subject = str('subjectOverride')
  if (subject !== undefined) out.subject = subject
  const notes = str('notesOverride')
  if (notes !== undefined) out.notes = notes
  const reference = str('referenceLine')
  if (reference !== undefined) out.referenceLine = reference

  return out
}
