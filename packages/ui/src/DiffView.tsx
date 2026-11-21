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
      <div className="border-ih-border bg-ih-surface-2 border p-3">
        <div className="text-ih-muted mb-2 font-mono text-[10px] tracking-[0.1em] uppercase">
          {beforeLabel}
        </div>
        <div className="text-ih-muted whitespace-pre-wrap">{before ?? <em>(empty)</em>}</div>
      </div>
      <div className="border-ih-accent bg-ih-accent-soft/20 border p-3">
        <div className="text-ih-accent mb-2 font-mono text-[10px] tracking-[0.1em] uppercase">
          {afterLabel}
        </div>
        <div className="text-ih-ink-2 whitespace-pre-wrap">{after ?? <em>(empty)</em>}</div>
      </div>
    </div>
  )
}
