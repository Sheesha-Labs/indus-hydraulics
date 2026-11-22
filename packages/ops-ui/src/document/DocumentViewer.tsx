'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface DocumentViewerProps {
  fileName: string
  pageCount: number
  /** Controlled page (1-based). Leave unset to let the viewer keep its own page. */
  page?: number
  /** Starting page when uncontrolled. */
  defaultPage?: number
  onPageChange?: (page: number) => void
  /** Eyebrow line above the pages ("Original as received", "Preview"). */
  caption?: string
  /** Bar actions, e.g. "Download PDF": the accessible equivalent of the scaled page. */
  actions?: ReactNode
  /** Size of the well. Default 540 × 760 (the kit's), w-io-well on T5. */
  className?: string
  /** The pages: DocumentPage at scale m, or an original (scan, client PO) as received. */
  children: ReactNode
}

/**
 * The grey well documents sit in (T5, Review previews): file name, page buttons, optional caption, pages
 * centred. Received paper (client POs, supplier quotes) is shown here as the original, never re-rendered.
 */
export default function DocumentViewer({
  fileName,
  pageCount,
  page,
  defaultPage = 1,
  onPageChange,
  caption,
  actions,
  className,
  children,
}: DocumentViewerProps) {
  const [ownPage, setOwnPage] = useState(defaultPage)
  const current = page ?? ownPage
  const go = (n: number) => {
    if (page === undefined) setOwnPage(n)
    onPageChange?.(n)
  }
  const pages = Array.from({ length: Math.max(1, pageCount) }, (_, i) => i + 1)
  return (
    <section
      aria-label={`Document ${fileName}`}
      data-doc-viewer
      className={cn(
        'bg-io-well flex h-[760px] min-h-0 w-[540px] flex-col items-center gap-3.5 overflow-y-auto px-5 pt-3.5 pb-5 [scrollbar-width:thin]',
        className
      )}
    >
      <div className="text-io-ink-2 flex items-center justify-between gap-3 self-stretch text-[12px]">
        <span className="truncate text-[11px]">{fileName}</span>
        <div className="flex flex-none items-center gap-2">
          {actions}
          <nav aria-label="Pages" className="flex gap-1">
            {pages.map((n) => {
              const on = n === current
              return (
                <button
                  key={n}
                  type="button"
                  aria-label={`Page ${n} of ${pages.length}`}
                  aria-current={on ? 'page' : undefined}
                  data-state={on ? 'on' : 'off'}
                  onClick={() => go(n)}
                  className={cn(
                    'io-focus rounded-io-tag border-io-stroke bg-io-card grid h-6 min-w-6 place-items-center border px-1.5 text-[10.5px]',
                    on && 'border-io-navy bg-io-navy text-white'
                  )}
                >
                  {n}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
      {caption ? (
        // ink-2: ink-3 on the grey well is 3.75:1, under AA.
        <div className="text-io-ink-2 -mb-1.5 self-stretch text-[10px] tracking-[.1em] uppercase">
          {caption}
        </div>
      ) : null}
      {children}
    </section>
  )
}
