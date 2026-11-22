import { cn } from '../lib/cn'
import { statusTone, TONE_CLASS, type StatusFamily, type StatusWord } from '../status'
import type { Size3, Tone } from '../types'

type ChipBase = { size?: Size3; dot?: boolean; className?: string }

/**
 * A status word, or an explicit tone with its own label. The family is required with a word, so the same
 * word can take a different tone per family ("No reply" is bad on a supplier RFQ, warn on a client
 * response). There is no way to give a chip a colour without a word.
 */
export type ChipProps<F extends StatusFamily = StatusFamily> =
  | (ChipBase & { family: F; status: StatusWord<F>; label?: string })
  | (ChipBase & { tone: Tone; label: string; strike?: boolean })

const SIZE: Record<Size3, string> = {
  sm: 'h-io-chip-sm px-1.5 text-[10.5px]',
  md: 'h-io-chip px-2 text-[11px]',
  lg: 'h-io-chip-lg px-2.5 text-[12px]',
}

/**
 * Status kit `ks-chip`: h 22 (sm 18 / lg 26), px 8 (6 / 10), 11px (10.5 / 12) 500, pill, optional 6px dot.
 * The word is always printed, so colour is never the only signal; the dot is decorative.
 */
export default function Chip<F extends StatusFamily>(props: ChipProps<F>) {
  const { size = 'md', dot = false, className } = props
  let tone: Tone
  let strike: boolean
  let label: string
  if ('family' in props) {
    ;({ tone, strike } = statusTone(props.family, props.status))
    label = props.label ?? props.status
  } else {
    tone = props.tone
    strike = props.strike ?? false
    label = props.label
  }
  return (
    <span
      data-part="chip"
      data-tone={tone}
      className={cn(
        'rounded-io-pill inline-flex flex-none items-center gap-[5px] leading-none font-medium whitespace-nowrap',
        SIZE[size],
        TONE_CLASS[tone],
        strike && 'line-through',
        className
      )}
    >
      {dot ? (
        <span aria-hidden="true" className="rounded-io-pill size-1.5 flex-none bg-current" />
      ) : null}
      {label}
    </span>
  )
}
