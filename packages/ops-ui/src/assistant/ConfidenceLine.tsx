import { cn } from '../lib/cn'
import type { ConfidenceLineProps } from './types'

/**
 * Assistant kit `ka-cf`: 12.5 ink-3; the level word 500 in ink (Unsure in warn) and the reason after it.
 * Confidence is always a word computed by code checks, never a percentage: the component prints only the
 * level and the reason it is given. Shared.
 */
export default function ConfidenceLine({ level, reason, className }: ConfidenceLineProps) {
  return (
    <p
      data-part="confidence"
      data-level={level}
      className={cn('text-io-ink-3 m-0 text-[12.5px] leading-[1.45]', className)}
    >
      <span className="sr-only">Confidence: </span>
      <b className={cn('mr-1.5 font-medium', level === 'Unsure' ? 'text-io-warn' : 'text-io-ink')}>
        {level}
      </b>
      {reason}
    </p>
  )
}
