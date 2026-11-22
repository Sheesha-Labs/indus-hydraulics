// Card kit types (05 §3.4). Shared by the parts; exported from ./index.ts.
import type { ReactNode } from 'react'
import type { LinkSpec, MarkTone } from '../types'

/** null: no mark column (kit '-'). */
export type Mark = MarkTone | null

export interface ListItem {
  key: string
  mark?: Mark
  title: ReactNode
  sub?: ReactNode
  /** Right-hand text (12 ink-3), or a link in accent. */
  right?: ReactNode | LinkSpec
}

export interface KVPair {
  label: string
  value: ReactNode
  /** 11.5 ink-3 after the value. */
  sub?: ReactNode
  /** link: accent (a link when href is set). bad: the value is a problem, in the bad colour. */
  emphasis?: 'link' | 'bad'
  href?: string
}

/** Label column widths for KV rows: a closed set, because a width class cannot be built at runtime. */
export type KVLabelWidth = 110 | 130 | 160
