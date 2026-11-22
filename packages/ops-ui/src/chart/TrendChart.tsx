import { cn } from '../lib/cn'
import ChartFigure, { type ChartFrame } from './ChartFigure'
import { LegendSwatch } from './StackedBar'
import { TONE_STROKE } from './tones'
import type { ChartTone } from '../types'

export interface TrendSeries {
  key: string
  label: string
  tone: ChartTone
  values: readonly number[]
  /** A reference or guardrail line: dashed, no points. */
  dashed?: boolean
}

export interface TrendChartProps extends ChartFrame {
  x: readonly string[]
  series: readonly TrendSeries[]
  /** How a value reads in the hidden table. Default String(v). */
  format?: (v: number) => string
}

/** Kit geometry: viewBox 600×180, plot x 20–580, y 10–150, x labels on y 176. */
const W = 600
const X0 = 20
const XW = 560
const Y0 = 150
const YH = 140
const GRID = [0, 1, 2, 3].map((i) => +(10 + i * 46.6).toFixed(1))
const r2 = (v: number) => +v.toFixed(2)

/** Line chart (kit K-12 Trend): 2px series with white points; dashed reference series. */
export default function TrendChart({ x, series, format = String, ...frame }: TrendChartProps) {
  const all = series.flatMap((s) => s.values)
  const lo = Math.min(...all) * 0.85
  const hi = Math.max(...all) * 1.08
  const span = hi - lo || 1
  const X = (i: number) => r2(X0 + i * (XW / Math.max(1, x.length - 1)))
  const Y = (v: number) => r2(Y0 - ((v - lo) / span) * YH)

  return (
    <ChartFigure
      {...frame}
      table={{
        head: ['Series', ...x],
        rows: series.map((s) => ({ key: s.key, cells: [s.label, ...s.values.map(format)] })),
      }}
    >
      <svg
        viewBox={`0 0 ${W} 180`}
        aria-hidden="true"
        className="block h-auto w-full overflow-visible"
      >
        {GRID.map((y) => (
          <line key={y} x1="0" x2={W} y1={y} y2={y} className="stroke-io-line-2" />
        ))}
        {series.map((s) => (
          <g key={s.key} data-series={s.key}>
            <path
              d={s.values.map((v, i) => `${i ? 'L' : 'M'}${X(i)} ${Y(v)}`).join(' ')}
              fill="none"
              strokeWidth="2"
              {...(s.dashed ? { strokeDasharray: '5 4' } : {})}
              className={TONE_STROKE[s.tone]}
            />
            {s.dashed
              ? null
              : s.values.map((v, i) => (
                  <circle
                    key={i}
                    cx={X(i)}
                    cy={Y(v)}
                    r="3"
                    strokeWidth="1.5"
                    className={cn('fill-io-card', TONE_STROKE[s.tone])}
                  />
                ))}
          </g>
        ))}
        {x.map((t, i) => (
          <text
            key={`${t}-${i}`}
            x={X(i)}
            y="176"
            textAnchor="middle"
            className="fill-io-ink-3 text-[10px]"
          >
            {t}
          </text>
        ))}
      </svg>
      {series.length > 1 ? (
        <div
          aria-hidden="true"
          className="text-io-ink-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px]"
        >
          {series.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <LegendSwatch tone={s.tone} />
              {s.label}
            </span>
          ))}
        </div>
      ) : null}
    </ChartFigure>
  )
}
