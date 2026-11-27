import type { DocumentData, Letterhead } from '@indus/ops-core'
import { cn } from '../lib/cn'
import EstimateLayout from './EstimateLayout'
import HouseLayout from './HouseLayout'
import ScaleFrame, { pageScaleClass, type DocScale } from './scale'
import type { DocStamp } from './Stamp'

export interface DocumentPageProps {
  data: DocumentData
  /** From the database (Settings › Company), never from code: the repository is public. */
  letterhead: Letterhead
  /** full 1 · m .6 · w .5542 · thumb .189 · z .7 (556 wide). Default: m for house, z for estimate. */
  scale?: DocScale
  /** Screen-only overlay; never part of an issued file. */
  stamp?: DocStamp
  /** 1-based rows of the items table; Why? and PO-check highlighting. */
  highlightRows?: readonly number[]
  /** Which page of a paginated render, and how many there are (running footer). */
  page?: number
  pageCount?: number
  /** False on a continuation page (paginate): a running header replaces the letterhead block. */
  first?: boolean
  className?: string
}

/**
 * One A4 page of a document Indus issues, rendered from DocumentData (ADR-14). The same data drives the
 * PDF in @indus/ops-pdf. Text stays real text at every scale, so it can be selected and read aloud; the
 * viewer offers "Download PDF" as the accessible equivalent of the scaled visual.
 */
export default function DocumentPage({
  data,
  letterhead,
  scale,
  stamp,
  highlightRows,
  page,
  pageCount,
  first,
  className,
}: DocumentPageProps) {
  const sc: DocScale = scale ?? (data.layout === 'estimate' ? 'z' : 'm')
  const common = {
    letterhead,
    ...(stamp ? { stamp } : {}),
    ...(highlightRows ? { highlightRows } : {}),
    ...(page !== undefined ? { page } : {}),
    ...(pageCount !== undefined ? { pageCount } : {}),
    ...(first !== undefined ? { first } : {}),
  }
  const pageClass = sc === 'full' ? cn(pageScaleClass(sc), className) : pageScaleClass(sc)
  const body =
    data.layout === 'estimate' ? (
      <EstimateLayout data={data} className={pageClass} {...common} />
    ) : (
      <HouseLayout data={data} dense={sc === 'm'} className={pageClass} {...common} />
    )
  return (
    <ScaleFrame scale={sc} {...(sc !== 'full' && className ? { className } : {})}>
      {body}
    </ScaleFrame>
  )
}
