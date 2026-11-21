import { useId } from 'react'
import { pct, svgId, TONE_FILL } from '../chart/tones'
import { cn } from '../lib/cn'
import type { BarTone } from '../types'

export interface ProgressBarProps {
  value: number
  total: number
  tone?: BarTone
  /** Printed above the track and used as the accessible name. */
  label?: string
  /** Printed beside the label and read as aria-valuetext. Default "9 of 13". */
  valueText?: string
  className?: string
}

/**
 * Status kit `ks-bar`: label row 11.5 ink-3 with the value 500 ink, then an 8px track (r 2, fill) holding one
 * tone segment. The track is SVG so the fill width is a presentation attribute, not a style.
 */
export default function ProgressBar({
  value,
  total,
  tone = 'acc',
  label,
  valueText,
  className,
}: ProgressBarProps) {
  const clip = `${svgId(useId())}-track`
  const text = valueText ?? `${value} of ${total}`
  const filled = Math.max(0, Math.min(value, total))
  return (
    <div
      role="progressbar"
      aria-label={label ?? 'Progress'}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={filled}
      aria-valuetext={text}
      data-part="progress"
      className={cn('inline-flex min-w-[140px] flex-col gap-[5px]', className)}
    >
      {label ? (
        <div aria-hidden="true" className="text-io-ink-3 flex justify-between gap-1 text-[11.5px]">
          <span>{label}</span>
          <b className="text-io-ink font-medium">{text}</b>
        </div>
      ) : null}
      <svg aria-hidden="true" className="block h-2 w-0 min-w-full">
        <defs>
          <clipPath id={clip}>
            <rect width="100%" height="8" rx="2" />
          </clipPath>
        </defs>
        <rect width="100%" height="8" rx="2" className="fill-io-fill" />
        <rect
          width={pct(filled, total)}
          height="8"
          clipPath={`url(#${clip})`}
          className={TONE_FILL[tone]}
        />
      </svg>
    </div>
  )
}
