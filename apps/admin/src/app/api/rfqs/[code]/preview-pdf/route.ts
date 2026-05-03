import { NextResponse } from 'next/server'
import { auth } from '../../../../../lib/auth'
import { hasRole, ROLES } from '../../../../../lib/rbac'
import { renderEstimatePdf } from '@indus/pdf'
import { buildEstimateInputFromRfq } from '../../../../../lib/build-estimate-input'

type RouteContext = { params: Promise<{ code: string }> }

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await auth()
  if (!hasRole(session, ROLES.RFQ_REVIEW)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const { code } = await params

  const input = await buildEstimateInputFromRfq(code)
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
