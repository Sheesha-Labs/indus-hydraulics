/**
 * The text around a resolved span (S06-T05): up to `radius` characters each side, cut at a word boundary,
 * with an ellipsis where the source goes on. `matchAt` is where the span starts inside the returned text, so
 * the drawer highlights the exact occurrence the model cited even when the same words appear twice.
 */
export interface SourceWindow {
  text: string
  match: string
  matchAt: number
  /** 1-based paragraph (blank-line separated) the span starts in. */
  paragraph: number
}

export function sourceWindow(
  source: string,
  charStart: number,
  charEnd: number,
  radius = 300
): SourceWindow | null {
  if (charStart < 0 || charEnd <= charStart || charEnd > source.length) return null
  let from = Math.max(0, charStart - radius)
  let to = Math.min(source.length, charEnd + radius)
  if (from > 0) {
    const sp = source.indexOf(' ', from)
    if (sp !== -1 && sp < charStart) from = sp + 1
  }
  if (to < source.length) {
    const sp = source.lastIndexOf(' ', to)
    if (sp >= charEnd) to = sp
  }
  const lead = from > 0 ? '…' : ''
  const tail = to < source.length ? '…' : ''
  const before = source.slice(0, charStart)
  return {
    text: `${lead}${source.slice(from, to)}${tail}`,
    match: source.slice(charStart, charEnd),
    matchAt: lead.length + (charStart - from),
    paragraph: before.split(/\n\s*\n/).length,
  }
}
