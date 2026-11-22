import type { ReactNode } from 'react'
import Spinner from '../controls/Spinner'
import { cn } from '../lib/cn'

export type InlineKind = 'loading' | 'error' | 'empty' | 'saved'

export interface InlineStateProps {
  kind: InlineKind
  /** Default per kind: "Loading…", "Couldn’t save.", "Nothing here yet.", "Saved". */
  text?: string
  /** A link-style action after the text, e.g. <Button variant="link" size="sm">Retry now</Button>. */
  action?: ReactNode
  className?: string
}

export const INLINE_DEFAULT_TEXT: Record<InlineKind, string> = {
  loading: 'Loading…',
  error: 'Couldn’t save.',
  empty: 'Nothing here yet.',
  saved: 'Saved',
}

/**
 * States kit Inline (`ke-il`): a 12.5 ink-3 status line inside a card or under a control. A spinner for
 * loading, bad ink for an error, an optional link action. Shared; role="status", so a change is announced
 * politely.
 */
export default function InlineState({ kind, text, action, className }: InlineStateProps) {
  return (
    <div
      role="status"
      data-part="inline-state"
      data-kind={kind}
      className={cn(
        'flex items-center gap-2 py-2.5 text-[12.5px] leading-[1.45]',
        kind === 'error' ? 'text-io-bad' : 'text-io-ink-3',
        className
      )}
    >
      {kind === 'loading' ? <Spinner className="text-io-accent" /> : null}
      <span>{text ?? INLINE_DEFAULT_TEXT[kind]}</span>
      {action}
    </div>
  )
}
