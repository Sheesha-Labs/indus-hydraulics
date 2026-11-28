import { paginate, type DocKind, type DocumentData, type Letterhead } from '@indus/ops-core'
import { DocumentPage } from '@indus/ops-ui/document'

interface TemplatePreviewProps {
  kind: DocKind
  data: DocumentData
  letterhead: Letterhead
}

const SAMPLE_UNTIL: Partial<Record<DocKind, string>> = {
  quotation: 'S17',
  rfq: 'S12',
}

/**
 * Board 57's layout preview: page 1 of the kind's sample document through the working template, at scale s
 * (334 × 472), paginated as the PDF is. A sample until the kind's record mapper exists, and it says so.
 */
export default function TemplatePreview({ kind, data, letterhead }: TemplatePreviewProps) {
  const pages = paginate(data)
  const first = pages[0]!
  return (
    <aside
      aria-label="Layout preview"
      className="bg-io-well border-io-line -mr-8 flex flex-col items-center gap-2.5 border-l px-4 pt-4 pb-6"
    >
      <span className="io-eyebrow text-io-ink-2 self-stretch">Layout preview</span>
      <DocumentPage
        data={first.data}
        letterhead={letterhead}
        scale="s"
        page={first.page}
        pageCount={first.pageCount}
        first
      />
      <p className="text-io-ink-2 m-0 text-center text-[12px] leading-[1.45]">
        Page 1 of {first.pageCount} · a sample {SAMPLE_UNTIL[kind] ? 'enquiry' : 'order'} until
        records print through this template. The same blocks and styles are used by all nine
        templates, so a change to the letterhead or bank details applies everywhere at once.
      </p>
    </aside>
  )
}
