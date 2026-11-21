import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

export type TagKind = 'assistant' | 'count' | 'level' | 'action' | 'ref' | 'lock'

export interface TagProps {
  kind: TagKind
  children: ReactNode
  className?: string
}

const KIND: Record<TagKind, string> = {
  assistant: 'bg-io-navy text-white tracking-[0.06em] uppercase',
  count: 'bg-io-accent-tint text-io-accent min-w-6 justify-center px-1.5 font-semibold',
  level: 'bg-io-card text-io-ink-2 border border-io-line text-[11px] font-normal',
  action: 'bg-io-accent-tint text-io-accent h-io-tag-action px-2 text-[11.5px]',
  ref: 'bg-io-fill text-io-ink-2 text-[11px] font-normal',
  lock: 'bg-io-fill text-io-ink-2 gap-1 text-[11px]',
}

/**
 * Status kit `ks-tag`: h 20, r 4, 10.5px 500. assistant = navy uppercase +.06em; count = accent tint 600,
 * min-w 24; level = white with a line border, 11px 400; action = h 22 11.5px accent tint; ref = fill 11px;
 * lock = fill with a lock icon.
 */
export default function Tag({ kind, children, className }: TagProps) {
  return (
    <span
      data-part="tag"
      data-kind={kind}
      className={cn(
        'h-io-tag rounded-io-tag inline-flex flex-none items-center px-[7px] text-[10.5px] font-medium whitespace-nowrap',
        KIND[kind],
        className
      )}
    >
      {kind === 'lock' ? (
        <Lock aria-hidden="true" className="size-3 flex-none" strokeWidth={1.75} />
      ) : null}
      {children}
    </span>
  )
}
