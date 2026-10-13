/**
 * Geometry for the column charts on the resources pages.
 *
 * Columns are drawn as SVG paths rather than styled divs: their heights are
 * data, and inline `style=` is banned in this app, so the numbers belong in
 * SVG attributes where they are geometry rather than presentation.
 *
 * Mark spec (see the dataviz notes in the PR): columns no wider than 24px, a
 * 4px rounded data end and a square foot on the baseline, a 2px surface gap
 * between neighbours — which these charts get for free because columns never
 * touch.
 */

/** A column with its top corners rounded and its foot square on the baseline. */
export function columnPath(x: number, baseline: number, width: number, height: number, radius = 4): string {
  if (height <= 0) return ''
  const r = Math.min(radius, width / 2, height)
  const top = baseline - height
  return [
    `M${x},${baseline}`,
    `V${top + r}`,
    `Q${x},${top} ${x + r},${top}`,
    `H${x + width - r}`,
    `Q${x + width},${top} ${x + width},${top + r}`,
    `V${baseline}`,
    'Z',
  ].join(' ')
}

/** Clean axis ticks from zero to `max` in `step`s, inclusive. */
export function ticks(max: number, step: number): number[] {
  const out: number[] = []
  for (let v = 0; v <= max; v += step) out.push(v)
  return out
}
