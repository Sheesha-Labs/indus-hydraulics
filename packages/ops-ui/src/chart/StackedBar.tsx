import { useId } from 'react'
import ChartFigure, { type ChartFrame } from './ChartFigure'
import { pct, svgId, TONE_FILL } from './tones'
import type { ChartTone } from '../types'

export interface StackedSegment {
  key: string
  label: string
  value: number
  display: string
  tone: ChartTone
}

export interface StackedBarProps extends ChartFrame {
  segments: readonly StackedSegment[]
}

/** 8px legend square, r 2. */
export function LegendSwatch({ tone }: { tone: ChartTone }) {
  return (
    <svg width="8" height="8" aria-hidden="true" className="block flex-none">
      <rect width="8" height="8" rx="2" className={TONE_FILL[tone]} />
    </svg>
  )
}

/**
 * One 14px track split by share (kit K-12 Stacked), with a legend that prints every value. The 2px gaps
 * and the 3px rounded ends are an SVG mask, so the gaps stay transparent on any ground.
 */
export default function StackedBar({ segments, ...frame }: StackedBarProps) {
  const uid = svgId(useId())
  const total = segments.reduce((a, s) => a + Math.max(0, s.value), 0)
  const placed = segments.map((s, i) => ({
    ...s,
    at: segments.slice(0, i).reduce((a, p) => a + Math.max(0, p.value), 0),
  }))
  const mask = `${uid}-stack`
  return (
    <ChartFigure
      {...frame}
      table={{
        head: ['Segment', 'Value'],
        rows: segments.map((s) => ({ key: s.key, cells: [s.label, s.display] })),
      }}
    >
      <div className="flex flex-col gap-2">
        <svg aria-hidden="true" className="block h-[14px] w-full">
          <defs>
            <mask id={mask}>
              <rect width="100%" height="14" rx="3" className="fill-white" />
              {placed.slice(1).map((s) => (
                <rect
                  key={s.key}
                  x={pct(s.at, total)}
                  width="2"
                  height="14"
                  transform="translate(-1 0)"
                />
              ))}
            </mask>
          </defs>
          <g mask={`url(#${mask})`}>
            {placed.map((s) => (
              <rect
                key={s.key}
                x={pct(s.at, total)}
                width={pct(Math.max(0, s.value), total)}
                height="14"
                className={TONE_FILL[s.tone]}
              />
            ))}
          </g>
        </svg>
        <div
          aria-hidden="true"
          className="text-io-ink-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px]"
        >
          {segments.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <LegendSwatch tone={s.tone} />
              {s.label}
              <b className="font-medium">{s.display}</b>
            </span>
          ))}
        </div>
      </div>
    </ChartFigure>
  )
}
