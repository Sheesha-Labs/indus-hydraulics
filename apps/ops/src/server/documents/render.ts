import 'server-only'
import {
  applyTemplate,
  type DocKind,
  type DocumentData,
  type TemplateDefinition,
} from '@indus/ops-core'
import { renderDocumentPdf } from '@indus/ops-pdf'
import { loadLetterhead } from './assets'
import { mailboxRoleFor } from './kinds'
import { getActiveTemplate } from './templates'

/**
 * Previews (S11-T04): the document as it would be issued, with "DRAFT" across every page and no number (the
 * caller passes the next free number as the preview label, ops.peek_number, S11-T08). A preview is never
 * stored: the bytes go straight to the person who asked. The kind's published template is applied unless the
 * caller passes a definition (a draft being edited) or `false` (data it has already applied one to).
 */
export async function renderPreviewPdf(
  kind: DocKind,
  data: DocumentData,
  opts: {
    currency?: string | null
    signerId?: string | null
    template?: TemplateDefinition | false
  } = {}
): Promise<Uint8Array> {
  const def =
    opts.template === false ? null : (opts.template ?? (await getActiveTemplate(kind)).definition)
  const shown = def ? applyTemplate(data, def) : data
  const { letterhead, assets } = await loadLetterhead({
    role: mailboxRoleFor(kind),
    currency: opts.currency ?? null,
    signerId: opts.signerId ?? null,
  })
  return renderDocumentPdf(shown, letterhead, assets, { draft: true })
}
