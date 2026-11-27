import 'server-only'
import type { DocumentData } from '@indus/ops-core'
import { renderDocumentPdf } from '@indus/ops-pdf'
import type { DocKind } from '@indus/ops-core'
import { loadLetterhead } from './assets'
import { mailboxRoleFor } from './kinds'

/**
 * Previews (S11-T04): the document as it would be issued, with "DRAFT" across every page and no number (the
 * caller passes the next free number as the preview label, ops.peek_number, S11-T08). A preview is never
 * stored: the bytes go straight to the person who asked.
 */
export async function renderPreviewPdf(
  kind: DocKind,
  data: DocumentData,
  opts: { currency?: string | null; signerId?: string | null } = {}
): Promise<Uint8Array> {
  const { letterhead, assets } = await loadLetterhead({
    role: mailboxRoleFor(kind),
    currency: opts.currency ?? null,
    signerId: opts.signerId ?? null,
  })
  return renderDocumentPdf(data, letterhead, assets, { draft: true })
}
