import { cn } from '../lib/cn'

export type FxState = 'live' | 'locked' | 'stale'

export interface FxTagProps {
  state: FxState
  /** "EUR → AED 3.9789". */
  pair: string
  /** When the rate was locked (state locked). */
  lockedOn?: Date
  /** How old the rate is (state stale). */
  ageDays?: number
  className?: string
}

const TONE: Record<FxState, string> = {
  live: 'bg-io-fill text-io-ink-2',
  locked: 'bg-io-accent-tint text-io-accent',
  stale: 'bg-io-warn-tint text-io-warn',
}

// TODO(S01-T10): use formatDate from packages/ops-ui/src/format.ts (S01-T05) once it lands.
const DAY = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Dubai',
})

/** The words always say which rate this is, so the tint is never the only signal. */
export function fxText({ state, pair, lockedOn, ageDays }: FxTagProps): string {
  if (state === 'live') return `Live · ${pair}`
  if (state === 'locked')
    return `${lockedOn ? `Locked ${DAY.format(lockedOn)}` : 'Locked'} · ${pair}`
  const age =
    ageDays === undefined
      ? 'Rate is out of date'
      : `Rate is ${ageDays} ${ageDays === 1 ? 'day' : 'days'} old`
  return `${age} · ${pair}`
}

/** The FX rate a figure uses (kit K-12 FX): live, locked to a date, or stale. */
export default function FxTag(props: FxTagProps) {
  return (
    <span
      data-state={props.state}
      className={cn(
        'rounded-io-tag inline-flex h-[22px] items-center gap-1.5 px-2 text-[11.5px]',
        TONE[props.state],
        props.className
      )}
    >
      {fxText(props)}
    </span>
  )
}
