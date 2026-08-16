import * as React from 'react'
import { cn } from './lib/utils'

export interface DiffViewProps {
  before: string | null | undefined
  after: string | null | undefined
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

/**
 * Side-by-side text diff used by the AI Suggest accept/reject UI and the
 * audit log revert button. No third-party diff library — for SEO meta
 * fields the values are short enough that a plain side-by-side block is
 * easier to read than a token-level diff.
 */
export function DiffView({
  before,
  after,
  beforeLabel = 'Current',
  afterLabel = 'Suggested',
  className,
}: DiffViewProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 text-[12px]', className)}>
      <div className="border border-ih-border bg-ih-surface-2 p-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ih-muted mb-2">
          {beforeLabel}
        </div>
        <div className="whitespace-pre-wrap text-ih-muted">
          {before ?? <em>(empty)</em>}
        </div>
      </div>
      <div className="border border-ih-accent bg-ih-accent-soft/20 p-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ih-accent mb-2">
          {afterLabel}
        </div>
        <div className="whitespace-pre-wrap text-ih-ink-2">
          {after ?? <em>(empty)</em>}
        </div>
      </div>
    </div>
  )
}
