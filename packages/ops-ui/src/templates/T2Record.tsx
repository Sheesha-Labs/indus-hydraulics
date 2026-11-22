import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { TEMPLATE_BODY, TEMPLATE_COLUMN, TEMPLATE_ROOT, TEMPLATE_TOP } from './frame'

interface T2RecordBase {
  /** Shell `RecordHeader` (kind enquiry | order | tender) with the record's tabs. */
  header: ReactNode
  /** Shell `AssistantStrip`: what the Assistant did on the record. */
  strip: ReactNode
  banner?: ReactNode
  /** The tab body. Tabs swap only this. */
  children: ReactNode
  railLabel?: string
}

/**
 * `body` 'padded' (default): the 28px gutter, 16 above and below, and the rail. 'bleed': no gutter and no
 * rail, for a tab whose template draws its own frame edge to edge (T5 Document on well).
 */
export type T2RecordProps = T2RecordBase &
  (
    | {
        body?: 'padded'
        /**
         * The 330 rail: facts Card, the collapsed ProposalCard, Timeline. The record `layout.tsx` renders
         * it, not the page, so it persists across tab navigations (05 §6.2).
         */
        rail?: ReactNode
      }
    | { body: 'bleed'; rail?: never }
  )

/**
 * Template T2 · Record cockpit (L2 t2a, t2b): RecordHeader, the Assistant strip, then the tab body with the
 * 330 rail at its right (`1fr · 330`, gap 16, padding 16 / 28).
 */
export default function T2Record({
  header,
  strip,
  banner,
  children,
  rail,
  railLabel = 'Record facts',
  body = 'padded',
}: T2RecordProps) {
  return (
    <div data-template="T2" className={TEMPLATE_ROOT}>
      <div data-slot="header" className={TEMPLATE_TOP}>
        {header}
        {strip}
      </div>
      {banner ? (
        <div data-slot="banner" className="flex-none">
          {banner}
        </div>
      ) : null}
      <div
        data-slot="body"
        data-body={body}
        className={
          body === 'bleed'
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
            : cn(
                TEMPLATE_BODY,
                rail ? 'grid-cols-[minmax(0,1fr)_var(--io-w-rail)]' : 'grid-cols-[minmax(0,1fr)]'
              )
        }
      >
        <div data-slot="tab" className={body === 'bleed' ? 'flex min-h-0 flex-1' : TEMPLATE_COLUMN}>
          {children}
        </div>
        {rail && body === 'padded' ? (
          <aside data-slot="rail" aria-label={railLabel} className={TEMPLATE_COLUMN}>
            {rail}
          </aside>
        ) : null}
      </div>
    </div>
  )
}
