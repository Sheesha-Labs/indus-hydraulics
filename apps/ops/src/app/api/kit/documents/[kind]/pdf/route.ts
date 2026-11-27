import { renderFixtures } from '@indus/ops-core/src/document/__fixtures__/kinds'
import { renderDocumentPdf } from '@indus/ops-pdf'
import { env } from '../../../../../../lib/env'

/**
 * /api/kit/documents/[kind]/pdf (S11-T03): a kit fixture's PDF, for the parity tests and for a look. Route
 * handlers live under api/ (route-tree rule); the proxy gates /api/kit like /_kit, and the handler checks the
 * gate again: 404 in production or without OPS_KIT=1.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const e = env()
  if (e.APP_ENV === 'production' || e.OPS_KIT !== '1')
    return new Response('Not found', { status: 404 })
  const { kind } = await params
  const f = renderFixtures().find((x) => x.name === kind)
  if (!f) return new Response('Not found', { status: 404 })
  const bytes = await renderDocumentPdf(f.data, f.letterhead, {}, { draft: f.draft ?? false })
  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${f.name}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
