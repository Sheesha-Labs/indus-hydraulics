import { KIND_LABEL } from '@indus/ops-core'
import type { Route } from 'next'
import Link from 'next/link'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { listTemplates } from '../../../../server/documents/templates'

const DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Dubai',
})

/**
 * Settings › Document templates (board 57, S11-T05): the nine documents Indus issues, each with its number
 * pattern (read only: numbering is set in Settings › Numbering, C6) and the published version. A row opens
 * the editor. The settings sub-nav takes the board's left column (C41), so the document list is this page
 * and the editor is the next (decision).
 */
export default async function SettingsDocumentTemplatesPage() {
  await requireOpsUser().catch(signInFor(`/settings/document-templates`))
  const rows = await listTemplates()
  return (
    <div data-built="document-templates" className="flex max-w-[720px] flex-col gap-4">
      <p className="text-io-ink-2 m-0 text-[12.5px] leading-[1.5]">
        The same blocks and styles are used by all nine templates, so a change to the letterhead or
        bank details applies everywhere at once. Publishing affects only new renders; issued PDFs
        never change.
      </p>
      <section aria-labelledby="documents-eyebrow" className="flex flex-col gap-1">
        <h2 id="documents-eyebrow" className="io-eyebrow text-io-ink-3 m-0 mb-1">
          Documents
        </h2>
        <ul className="rounded-io-card border-io-line bg-io-card m-0 flex list-none flex-col border p-1.5">
          {rows.map((r) => (
            <li key={r.kind}>
              <Link
                href={`/settings/document-templates/${r.kind}` as Route}
                className="rounded-io-ctl hover:bg-io-paper io-focus flex items-center justify-between gap-4 px-2.5 py-2"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-[13px]">{KIND_LABEL[r.kind]}</span>
                  <span className="text-io-ink-3 text-[11px]">
                    {r.pattern ?? 'No number series'}
                    {r.revisionPattern ? ` · revision ${r.revisionPattern}` : ''}
                  </span>
                </span>
                <span className="text-io-ink-3 flex-none text-[12px]">
                  {r.version
                    ? `Version ${r.version}${r.publishedAt ? ` · ${DATE.format(r.publishedAt)}` : ''}`
                    : 'Not published'}
                  {r.hasDraft ? ' · unpublished changes' : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <p className="text-io-ink-3 m-0 text-[12px]">
        Numbers are set in{' '}
        <Link href="/settings/numbering" className="text-io-accent io-focus underline">
          Settings › Numbering
        </Link>
        .
      </p>
    </div>
  )
}
