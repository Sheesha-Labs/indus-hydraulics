'use client'

import { T2Record } from '@indus/ops-ui/templates'
import { useSelectedLayoutSegments } from 'next/navigation'
import type { ReactNode } from 'react'

export interface RecordCockpitProps {
  /** RecordHeader for the record's kind (server-rendered by the record layout). */
  header: ReactNode
  /** The tender header (C9), shown on `tender/*` segments when the record is a tender. */
  tenderHeader?: ReactNode
  /** Headers for tabs whose primary differs (Questions: "Add question"), by first segment. */
  tabHeaders?: Readonly<Record<string, ReactNode>>
  /** AssistantStrip. */
  strip: ReactNode
  /** The 330 rail; dropped on bleed tabs. */
  rail: ReactNode
  /** Tab paths drawn edge to edge under the header (T5 Document on well: the Quotation tab). */
  bleed?: readonly string[]
  /** Tab paths drawn full width without the rail, in the normal body (board 113's history has its own column). */
  wide?: readonly string[]
  /**
   * First segments that are pages of the record but not tabs of its cockpit (an order's document review,
   * board 194, and its exceptions, 195–201): they render their own template, without the record header.
   */
  bare?: readonly string[]
  children: ReactNode
}

/**
 * The record layout's T2 frame (05 §6.2). A Next.js layout is not told which child segment it holds, so
 * this small client part reads the selected segments to decide what the layout cannot: the tender header
 * on tender sections, a bleed body for the document tab, and no cockpit for the record's own full pages.
 * The header, strip and rail stay server-rendered (passed in as nodes) and keep their state across tabs.
 */
export default function RecordCockpit({
  header,
  tenderHeader,
  tabHeaders = {},
  strip,
  rail,
  bleed = [],
  wide = [],
  bare = [],
  children,
}: RecordCockpitProps) {
  const segments = useSelectedLayoutSegments().filter((s) => !s.startsWith('('))
  const first = segments[0] ?? ''
  if (bare.includes(first)) return children
  const shown = first === 'tender' && tenderHeader ? tenderHeader : (tabHeaders[first] ?? header)
  if (bleed.includes(segments.join('/')))
    return (
      <T2Record header={shown} strip={strip} body="bleed">
        {children}
      </T2Record>
    )
  if (wide.includes(segments.join('/')))
    return (
      <T2Record header={shown} strip={strip}>
        {children}
      </T2Record>
    )
  return (
    <T2Record header={shown} strip={strip} rail={rail}>
      {children}
    </T2Record>
  )
}
