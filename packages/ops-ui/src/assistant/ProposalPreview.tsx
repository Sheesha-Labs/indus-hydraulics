import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import type { PreviewLine } from './types'

export interface ProposalPreviewProps {
  /** Eyebrow: "Preview · email 1 of 5". */
  title: string
  lines?: PreviewLine[]
  /**
   * Richer previews (an A4 thumbnail, a price table, a diff) render here after the lines. The kit's own
   * preview is lines only.
   */
  children?: ReactNode
  className?: string
}

const LINE: Record<NonNullable<PreviewLine['kind']>, string> = {
  plain: '',
  bold: 'font-medium',
  muted: 'text-io-ink-2',
  link: 'text-io-accent text-[12px]',
}

/**
 * Assistant kit `ka-pv`: a paper box (line, radius 6, 12×14) with an eyebrow title and lines that are
 * plain, bold, muted or a link (accent 12). A link line with an href is a real link. Shared.
 */
export default function ProposalPreview({
  title,
  lines = [],
  children,
  className,
}: ProposalPreviewProps) {
  return (
    <section
      data-part="preview"
      aria-label={title}
      className={cn(
        'border-io-line rounded-io-ctl bg-io-paper flex flex-col gap-1.5 border px-3.5 py-3 text-[12.5px] leading-[1.45]',
        className
      )}
    >
      <span className="io-eyebrow">{title}</span>
      {lines.map((l) => {
        const kind = l.kind ?? 'plain'
        if (kind === 'link' && l.href)
          return (
            <Link
              key={l.key}
              href={l.href as Route}
              className={cn(LINE.link, 'io-focus rounded-io-tag self-start hover:underline')}
            >
              {l.text}
            </Link>
          )
        return (
          <span key={l.key} className={LINE[kind]}>
            {l.text}
          </span>
        )
      })}
      {children}
    </section>
  )
}
