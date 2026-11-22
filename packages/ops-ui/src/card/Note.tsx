import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface NoteProps {
  /** assistant (default): accent wash. warn: note-warn. plain: paper with a line. */
  tone?: 'assistant' | 'warn' | 'plain'
  /** A bold lead-in: "On send ·". */
  title?: string
  children: ReactNode
  className?: string
}

const TONE = {
  assistant: 'bg-io-accent-wash',
  warn: 'bg-io-note-warn',
  plain: 'bg-io-paper border-io-line border',
} as const

/** Card kit note (`kr-nt`): p 10×12, radius 6, 12.5/1.45 ink-2, title 500 in ink. */
export default function Note({ tone = 'assistant', title, children, className }: NoteProps) {
  return (
    <div
      role="note"
      data-part="note"
      data-tone={tone}
      className={cn(
        'rounded-io-ctl text-io-ink-2 w-full px-3 py-2.5 text-[12.5px] leading-[1.45]',
        TONE[tone],
        className
      )}
    >
      {title ? <b className="text-io-ink font-medium">{title}</b> : null}
      {title ? ' ' : null}
      {children}
    </div>
  )
}
