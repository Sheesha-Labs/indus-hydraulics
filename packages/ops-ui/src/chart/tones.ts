// Chart tones → io- classes for SVG fill and stroke (05 §3.9). Static strings so Tailwind can read them.
// TODO(S01-T10): move ChartTone and Ccy into packages/ops-ui/src/types.ts (05 §3.0) when it exists.

/** acc, navy, ok/warn/bad (solid), n (neutral stroke grey), l (accent-line). */
export type ChartTone = 'acc' | 'navy' | 'ok' | 'warn' | 'bad' | 'n' | 'l'

export type Ccy = 'AED' | 'USD' | 'EUR' | 'GBP' | 'CNY' | 'INR' | 'JPY'

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
