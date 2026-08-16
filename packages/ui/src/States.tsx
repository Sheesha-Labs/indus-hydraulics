'use client'

import * as React from 'react'
import { cn } from './lib/utils'
import { Note } from './Surface'

/**
 * Empty, loading and error states.
 *
 * 03-interactions-and-states.md §5 calls this "the largest gap in the package
 * and you are expected to close it" — every table in the designs is full and
 * every search succeeds. These are built to the language rather than drawn.
 *
 * The rules that matter:
 *  - Empty is centred in its region: a mono eyebrow stating the condition, one
 *    plain sentence explaining why, one action. No illustration.
 *  - Loading is skeletons, not spinners, and deliberately NOT animated — a
 *    static block that appears for 200ms is calmer than one that shimmers.
 *    Spinners live inside buttons only.
 *  - Error is inline within the failed region. A partial failure never becomes
 *    a full-page takeover.
 */

/* ─── Empty ────────────────────────────────────────────────────────────── */

export interface EmptyStateProps {
  /** The condition, in mono caps. e.g. "NO RESULTS". */
  condition: string
  /** One sentence, plain terms, explaining why. */
  message: React.ReactNode
  /** Exactly one action. */
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ condition, message, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-16 text-center', className)}>
      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">{condition}</p>
      <p className="max-w-[46ch] text-[15px] leading-relaxed text-ih-ink-2">{message}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}

/* ─── Skeleton ─────────────────────────────────────────────────────────── */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: 'sm' | 'md' | 'lg' | 'full'
}

/**
 * A surface-2 block at the real dimensions of the content it replaces. No
 * shimmer, by decision. Always give it a size — a skeleton that collapses
 * lets the page jump when the content lands, which is the thing skeletons
 * exist to prevent.
 */
export function Skeleton({ className, radius = 'sm', ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-ih-surface-2',
        radius === 'sm' && 'rounded-sm',
        radius === 'md' && 'rounded-md',
        radius === 'lg' && 'rounded-lg',
        radius === 'full' && 'rounded-full',
        className
      )}
      {...props}
    />
  )
}

/** Product grid placeholder — eight cards at the real card size. */
export function SkeletonProductGrid({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-4 lg:grid-cols-4', className)} aria-busy="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-ih-border bg-ih-surface">
          <Skeleton className="aspect-square rounded-none" />
          <div className="flex flex-col gap-2 px-4 pb-4 pt-3.5">
            <Skeleton className="h-[10px] w-20" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Table placeholder — six rows at row height. */
export function SkeletonTableRows({ rows = 6, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} aria-busy="true">
          {Array.from({ length: columns }, (_, c) => (
            <td key={c} className="border-b border-ih-border px-4 py-3.5">
              <Skeleton className={cn('h-3.5', c === 0 ? 'w-32' : 'w-20')} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

/* ─── Error ────────────────────────────────────────────────────────────── */

export interface InlineErrorProps {
  message: React.ReactNode
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function InlineError({ message, onRetry, retryLabel = 'Try again', className }: InlineErrorProps) {
  return (
    <Note tone="danger" role="alert" className={cn('flex items-center justify-between gap-4', className)}>
      <span>{message}</span>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="shrink-0 font-medium underline underline-offset-2">
          {retryLabel}
        </button>
      ) : null}
    </Note>
  )
}

/* ─── Stale data ───────────────────────────────────────────────────────── */

/**
 * Where a figure is cached, show when it was read. An engineer trusting a
 * stale stock number is a real cost — 03 §5 calls this out specifically.
 */
export function StaleAt({ at, className }: { at: Date | string; className?: string }) {
  const iso = typeof at === 'string' ? at : at.toISOString()
  return (
    <time dateTime={iso} className={cn('font-mono text-[10.5px] text-ih-muted', className)}>
      as at {iso.slice(0, 16).replace('T', ' ')} GST
    </time>
  )
}

/* ─── Skip link ────────────────────────────────────────────────────────── */

/**
 * Required on every page (03 §2). Visually hidden until focused, then a
 * standard focused control at top-left. The target must exist: give the page's
 * <main> id="main".
 */
export function SkipToContent({ targetId = 'main' }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:fixed focus:left-4 focus:top-4 focus:z-[100]',
        'focus:inline-flex focus:h-10 focus:items-center focus:rounded-md',
        'focus:bg-ih-accent focus:px-[18px] focus:text-[13.5px] focus:font-medium focus:text-ih-accent-fg',
        'focus:ring-[3px] focus:ring-ih-accent-soft focus:outline-none'
      )}
    >
      Skip to content
    </a>
  )
}
