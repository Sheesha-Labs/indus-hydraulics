// Chart tones → io- classes for SVG fill and stroke (05 §3.9). Static strings so Tailwind can read them.
// ChartTone and Ccy live in ../types (05 §3.0); re-exported here for the chart kit's own imports.
import type { ChartTone } from '../types'

export type { Ccy, ChartTone } from '../types'

export const TONE_FILL: Record<ChartTone, string> = {
  acc: 'fill-io-accent',
  navy: 'fill-io-navy',
  ok: 'fill-io-ok-solid',
  warn: 'fill-io-warn-solid',
  bad: 'fill-io-bad-solid',
  n: 'fill-io-stroke',
  l: 'fill-io-accent-line',
}

export const TONE_STROKE: Record<ChartTone, string> = {
  acc: 'stroke-io-accent',
  navy: 'stroke-io-navy',
  ok: 'stroke-io-ok-solid',
  warn: 'stroke-io-warn-solid',
  bad: 'stroke-io-bad-solid',
  n: 'stroke-io-stroke',
  l: 'stroke-io-accent-line',
}

/** SVG-safe id fragment from React's useId(). */
export const svgId = (id: string): string => id.replace(/[^a-zA-Z0-9_-]/g, '')

/** A percentage attribute value, trimmed: pct(1, 3) → "33.3333%". */
export const pct = (part: number, whole: number): string =>
  `${whole > 0 ? +((part / whole) * 100).toFixed(4) : 0}%`
