import { audienceOf, KIND_SEQUENCE, TEMPLATE_KINDS, type DocKind } from '@indus/ops-core'
import { nextNumberFor } from '../../../../../server/numbering/sequences'
import { previewTerms } from '../../../../../server/terms/presets'
import { AccessError, requireOpsUser } from '../../../../../lib/access'
import { renderPreviewPdf } from '../../../../../server/documents/render'
import { getTemplateEditor, previewDocument } from '../../../../../server/documents/templates'

/**
 * `/api/documents/template-preview/<kind>` (S11-T05, board 57 "Preview with an enquiry"): the kind's sample
 * document as a DRAFT PDF through the saved draft template (or the published one with `?published=1`). It is
 * a sample until the kind's record mapper exists (S12 RFQ, S17 quotation, S24 order documents). Signed-in
 * people only (the proxy also requires the session); never stored, never cached.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'private, no-store' }

export async function GET(req: Request, { params }: { params: Promise<{ kind: string }> }) {
  let user
  try {
    user = await requireOpsUser()
  } catch (error) {
    if (error instanceof AccessError)
      return Response.json({ error: 'Sign in required' }, { status: 401, headers: NO_STORE })
    throw error
  }
  const { kind } = await params
  if (!(TEMPLATE_KINDS as readonly string[]).includes(kind))
    return new Response('Not found', { status: 404, headers: NO_STORE })
  const k = kind as DocKind
  const e = await getTemplateEditor(k)
  const published = new URL(req.url).searchParams.get('published') === '1'
  const def = !published && e.draft ? e.draft.definition : e.published.definition
  const terms = audienceOf(k) === 'client' ? await previewTerms() : null
  const data = previewDocument(k, def, {
    ...(terms ? { terms } : {}),
    signer: { name: user.name, role: user.role === 'owner' ? 'Owner' : 'Helper' },
    previewLabel: (await nextNumberFor(KIND_SEQUENCE[k])) ?? 'Next free number',
  })
  const bytes = await renderPreviewPdf(k, data, { template: false, signerId: user.id })
  return new Response(new Uint8Array(bytes), {
    headers: {
      ...NO_STORE,
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="template-preview-${k}.pdf"`,
    },
  })
}
