import { Fragment } from 'react'
import { cn } from '../lib/cn'
import ModKey from './ModKey'

export interface KbdProps {
  /** "⌘K", "esc", "G R", "N", "⌘↵". ⌘ renders "Ctrl+" off macOS. */
  keys: string
  className?: string
}

/**
 * Controls kit `kc-kbd`: h 20, min-w 22, 1px line border, radius 4, 11px ink-3. Shared; only the ⌘ glyph
 * is a client island (it needs the platform). The keys sit in one inner span so the kit's 3px gap never
 * splits "⌘" from "K".
 */
export default function Kbd({ keys, className }: KbdProps) {
  const parts = keys.split('⌘')
  return (
    <kbd
      className={cn(
        // font-sans: browsers default <kbd> to another family; Ops is Geist everywhere.
        'border-io-line rounded-io-tag bg-io-card text-io-ink-3 inline-flex h-5 min-w-[22px] items-center justify-center gap-[3px] border px-1.5 font-sans text-[11px] font-normal whitespace-nowrap',
        className
      )}
    >
      <span>
        {parts.map((part, i) => (
          // The split is positional and fixed for a given `keys` string, so the index is a stable key.
          <Fragment key={i}>
            {i > 0 ? <ModKey /> : null}
            {part}
          </Fragment>
        ))}
      </span>
    </kbd>
  )
}
