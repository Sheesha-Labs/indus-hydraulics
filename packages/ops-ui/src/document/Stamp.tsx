import { cn } from '../lib/cn'

export type DocStamp = 'Draft' | 'Superseded' | 'Paid'

const TONE: Record<DocStamp, string> = {
  Draft: 'text-io-ink-3',
  Superseded: 'text-io-bad-solid',
  Paid: 'text-io-ok-solid',
}

interface StampProps {
  stamp: DocStamp
  /** The house page multiplies the stamp into the paper; the Estimate look does not. */
  blend?: boolean
}

/**
 * A screen-only overlay (ADR-14): Draft exists only on previews, Superseded and Paid only on screens and
 * client pages, never in an issued file. It is rendered after the document content so it is not part of
 * the document's text order, and it is hidden in print.
 */
export default function Stamp({ stamp, blend = false }: StampProps) {
  return (
    <span
      data-doc-stamp={stamp}
      className={cn(
        'rounded-io-tag pointer-events-none absolute top-[140px] right-[60px] -rotate-[8deg] border-2 border-current px-3 py-1.5 text-[20px] leading-[1.45] font-semibold tracking-[.18em] uppercase opacity-75 print:hidden',
        blend && 'mix-blend-multiply',
        TONE[stamp]
      )}
    >
      {stamp}
    </span>
  )
}
