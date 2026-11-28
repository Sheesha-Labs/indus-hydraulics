import { paginate, type DocumentData, type Letterhead } from '@indus/ops-core'
import { cn } from '../lib/cn'
import DocumentPage from './DocumentPage'
import type { DocScale } from './scale'
import type { DocStamp } from './Stamp'

export interface DocumentPagesProps {
  data: DocumentData
  letterhead: Letterhead
  scale?: DocScale
  /** Screen-only overlay (Superseded, Cancelled, Paid, Draft): never part of the data or an issued file. */
  stamp?: DocStamp
  className?: string
}

/**
 * Every page of a document, paginated exactly as the PDF is (paginate in @indus/ops-core, S11-T03): the same
 * rows on the same pages, the table header repeated, the page labels identical. Overlays are props.
 */
export default function DocumentPages({
  data,
  letterhead,
  scale,
  stamp,
  className,
}: DocumentPagesProps) {
  const pages = paginate(data)
  return (
    <div
      data-doc-pages={pages.length}
      className={cn('flex flex-col items-center gap-6', className)}
    >
      {pages.map((p) => (
        <DocumentPage
          key={p.page}
          data={p.data}
          letterhead={letterhead}
          {...(scale ? { scale } : {})}
          {...(stamp ? { stamp } : {})}
          page={p.page}
          pageCount={p.pageCount}
          first={p.first}
        />
      ))}
    </div>
  )
}
