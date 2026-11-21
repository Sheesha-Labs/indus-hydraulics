import { useId } from 'react'
import { cn } from '../lib/cn'
import ChartFigure, { type ChartFrame } from './ChartFigure'
import { pct, svgId, TONE_FILL, type ChartTone } from './tones'

export interface BarListDatum {
  key: string
  label: string
  /** Drives the bar length only; the printed figure is `display`. */
  value: number
  display: string
  tone?: ChartTone
  sub?: string
}

/** Closed set: Tailwind cannot build a column width from a runtime number. */
export type BarListLabelWidth = 120 | 150 | 180 | 200

export interface BarListProps extends ChartFrame {
  data: readonly BarListDatum[]
  /** Default 150. */
  labelWidth?: BarListLabelWidth
}

const COLS: Record<BarListLabelWidth, string> = {
  120: 'grid-cols-[120px_minmax(0,1fr)_80px]',
  150: 'grid-cols-[150px_minmax(0,1fr)_80px]',
  180: 'grid-cols-[180px_minmax(0,1fr)_80px]',
  200: 'grid-cols-[200px_minmax(0,1fr)_80px]',
}

/** Horizontal bars (kit K-12 Bars): label · 10px track · value printed beside every bar. */
export default function BarList({ data, labelWidth = 150, ...frame }: BarListProps) {
  const uid = svgId(useId())
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <ChartFigure
      {...frame}
      table={{
        head: ['Item', 'Value', 'Note'],
        rows: data.map((d) => ({ key: d.key, cells: [d.label, d.display, d.sub ?? ''] })),
      }}
    >
      <div aria-hidden="true">
        {data.map((d, i) => {
          const clip = `${uid}-bar-${i}`
          return (
            <div
              key={d.key}
              className={cn('grid items-center gap-2.5 py-1 text-[12.5px]', COLS[labelWidth])}
            >
              <span>{d.label}</span>
              <svg className="block h-[10px] w-full">
                <defs>
                  <clipPath id={clip}>
                    <rect width="100%" height="10" rx="2" />
                  </clipPath>
                </defs>
                <rect width="100%" height="10" rx="2" className="fill-io-fill" />
                <rect
                  width={pct(Math.max(0, d.value), max)}
                  height="10"
                  clipPath={`url(#${clip})`}
                  className={TONE_FILL[d.tone ?? 'acc']}
                />
              </svg>
              <span className="text-right font-medium">
                {d.display}
                {d.sub ? (
                  <small className="text-io-ink-3 block text-[11px] font-normal">{d.sub}</small>
                ) : null}
              </span>
            </div>
          )
        })}
      </div>
    </ChartFigure>
  )
}
