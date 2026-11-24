import type { Route } from 'next'
import Link from 'next/link'
import type { MouseEvent } from 'react'
import { cn } from '../lib/cn'
import type { WhyReason } from './types'

export interface WhyListProps {
  reasons: WhyReason[]
  /**
   * Inside the Why? drawer a reason's link switches to its source instead of navigating. The link stays a
   * real <a>, so a modified click (new tab) and a click before hydration still follow it.
   */
  onEvidence?: (evidenceId: string) => void
  className?: string
}

/** Where an evidence link points: the Why? drawer route, intercepted by the @drawer slot (S02). */
export function evidenceHref(evidenceId: string): string {
  return `/why/${encodeURIComponent(evidenceId)}`
}

/**
 * Assistant kit `ka-why`: 4px ink-3 dots, 12.5/1.45 ink-2, gap 7. Each reason may end in an evidence link
 * (accent 12, "… ↗"): a real <a href="/why/<evidenceId>">, so it works before hydration, opens in a new
 * tab, and the @drawer slot can intercept it. Shared.
 */
export default function WhyList({ reasons, onEvidence, className }: WhyListProps) {
  return (
    <ul data-part="why" className={cn('m-0 flex list-none flex-col gap-[7px] p-0', className)}>
      {reasons.map((r, i) => (
        <li
          key={`${i}:${r.evidence?.evidenceId ?? ''}`}
          className={cn(
            'text-io-ink-2 grid grid-cols-[8px_minmax(0,1fr)] gap-2 text-[12.5px] leading-[1.45]',
            'before:rounded-io-pill before:bg-io-ink-3 before:mt-2 before:size-1 before:content-[""]'
          )}
        >
          <span>
            {r.text}
            {r.evidence ? (
              <Link
                href={evidenceHref(r.evidence.evidenceId) as Route}
                {...(onEvidence
                  ? {
                      onClick: (e: MouseEvent<HTMLAnchorElement>) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
                        e.preventDefault()
                        onEvidence(r.evidence!.evidenceId)
                      },
                    }
                  : {})}
                className="text-io-accent io-focus rounded-io-tag ml-1.5 text-[12px] whitespace-nowrap hover:underline"
              >
                {r.evidence.label} <span aria-hidden="true">↗</span>
              </Link>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  )
}
