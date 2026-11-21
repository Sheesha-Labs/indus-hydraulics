import { cn } from '../lib/cn'
import type { MarkTone } from '../types'

export interface CheckProps {
  mark: MarkTone
  size?: 'md' | 'lg'
  /** Read by screen readers in place of the glyph: "Passed", "Warning", "Checking", "Not started". */
  label: string
  className?: string
}

const GLYPH: Record<MarkTone, string> = {
  ok: '✓',
  warn: '!',
  bad: '✕',
  n: '–',
  acc: '✓',
  run: '',
  todo: '',
}

const MARK: Record<MarkTone, string> = {
  ok: 'bg-io-ok-tint text-io-ok-mark',
  warn: 'bg-io-warn-tint text-io-warn',
  bad: 'bg-io-bad-tint text-io-bad',
  n: 'bg-io-fill text-io-ink-2',
  acc: 'bg-io-accent-tint text-io-accent',
  run: 'io-spin border-[1.5px] border-io-accent border-r-transparent',
  todo: 'bg-io-card border border-io-stroke',
}

/**
 * Status kit `ks-ci`: a 16px (lg 20) circle with ✓ ! ✕ – at 10px (12) 700; `run` is a turning accent ring,
 * `todo` an empty stroke ring. The glyph is decorative; the required label carries the meaning.
 */
export default function Check({ mark, size = 'md', label, className }: CheckProps) {
  return (
    <span
      role="img"
      aria-label={label}
      data-part="check"
      data-mark={mark}
      className={cn(
        'rounded-io-pill inline-grid flex-none place-items-center leading-none font-bold not-italic',
        size === 'lg' ? 'size-5 text-[12px]' : 'size-4 text-[10px]',
        MARK[mark],
        className
      )}
    >
      {GLYPH[mark] ? <span aria-hidden="true">{GLYPH[mark]}</span> : null}
    </span>
  )
}
