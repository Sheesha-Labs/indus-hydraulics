import { columnOrder } from './header-detect'
import { uomKey, type UomTable } from './uom'

/**
 * Column mapping for a spreadsheet (S08-T05, board 35 "Maps to"). Each column of the header row is scored for each
 * line field from its header text and from the values under it; every field goes to at most one column (the best),
 * and anything left over is ignored. A remembered mapping for the client is keyed by `headerSignature`, which sorts
 * the normalised header cells so a sheet with its columns reordered still finds it; the remembered mapping is
 * applied by header text (`byHeader`), not by column letter, for the same reason.
 */
export const MAP_TARGETS = [
  'line_no',
  'description',
  'part_no',
  'qty',
  'uom',
  'spec',
  'make',
  'notes',
  'ignore',
] as const
export type MapTarget = (typeof MAP_TARGETS)[number]

export const MAP_TARGET_LABEL: Record<MapTarget, string> = {
  line_no: 'Line no.',
  description: 'Description',
  part_no: 'Part no.',
  qty: 'Quantity',
  uom: 'UoM',
  spec: 'Material / spec',
  make: 'Make',
  notes: 'Line note',
  ignore: 'Ignore',
}

/** Board 35's chip strip over the grid: short names. */
export const MAP_TARGET_SHORT: Record<MapTarget, string> = {
  line_no: 'LINE',
  description: 'DESCRIPTION',
  part_no: 'PART NO.',
  qty: 'QTY',
  uom: 'UOM',
  spec: 'SPEC',
  make: 'MAKE',
  notes: 'NOTE',
  ignore: '',
}

const HEADER: Array<[Exclude<MapTarget, 'ignore'>, RegExp]> = [
  [
    'line_no',
    /^(s\/?n|sr\.?\s*no\.?|sl\.?\s*no\.?|no\.?|#|item\s*no\.?|line(\s*no\.?)?|pos(ition)?|item)$/i,
  ],
  [
    'description',
    /desc|particulars|product name|item name|^item description$|^material description$/i,
  ],
  [
    'part_no',
    /part\s*(no|number|#)|p\/?n\b|\bpn\b|mpn|maker|model|code|article|cat(alogue)?\s*no/i,
  ],
  ['qty', /^(qty|quantity|req(uired)?\.?\s*qty|order\s*qty|nos)\.?$|quantity/i],
  ['uom', /^(unit|uom|u\/?m|um|units)\.?$/i],
  ['spec', /spec|material|size|rating|grade|standard/i],
  ['make', /^(make|brand|manufacturer|oem)$/i],
  ['notes', /remark|note|comment/i],
]

export interface ColumnGuess {
  c: string
  header: string
  target: MapTarget
  score: number
  /** The first value under the header (board 35 "Sample"). */
  sample: string
}

function sampleScore(
  target: Exclude<MapTarget, 'ignore'>,
  samples: readonly string[],
  uoms: UomTable
): number {
  const vals = samples.map((s) => s.trim()).filter(Boolean)
  if (!vals.length) return 0
  const share = (f: (v: string) => boolean) => vals.filter(f).length / vals.length
  switch (target) {
    case 'qty':
      return share((v) => /^\d+([.,]\d+)?(\s*[a-z]{1,5}\.?)?$/i.test(v)) * 2
    case 'line_no':
      return vals.every((v, i) => Number(v) === i + 1 || Number(v) === Number(vals[0]) + i) ? 2 : 0
    case 'uom':
      return share((v) => uoms.codes.has(uomKey(v)) || uoms.aliases.has(uomKey(v))) * 2
    case 'description':
      return share((v) => /[a-z]{3,}/i.test(v) && v.length > 8) * 1.5
    case 'part_no':
      return share(
        (v) => /\d/.test(v) && /^[A-Z0-9][A-Z0-9\-./ ]{2,}$/i.test(v) && !/\s{2}/.test(v)
      )
    default:
      return 0
  }
}

/** Best column per field; a header match counts 3, the values up to 2 more. */
export function inferMapping(
  header: ReadonlyArray<{ c: string; v: string }>,
  samplesByColumn: ReadonlyMap<string, readonly string[]>,
  uoms: UomTable
): ColumnGuess[] {
  const cols = [...header].filter((h) => h.v.trim()).sort((a, b) => columnOrder(a.c, b.c))
  const scores: Array<{ c: string; target: Exclude<MapTarget, 'ignore'>; score: number }> = []
  for (const h of cols) {
    const samples = samplesByColumn.get(h.c) ?? []
    for (const [target, re] of HEADER) {
      const byHeader = re.test(h.v.trim()) ? 3 : 0
      const byValues = sampleScore(target, samples, uoms)
      // Values alone never claim a column for a free-text field: a header has to say so.
      if (!byHeader && (target === 'spec' || target === 'make' || target === 'notes')) continue
      const score = byHeader + byValues
      if (score >= 2) scores.push({ c: h.c, target, score })
    }
  }
  scores.sort((a, b) => b.score - a.score)
  const taken = new Map<string, { target: MapTarget; score: number }>()
  const used = new Set<MapTarget>()
  for (const s of scores) {
    if (taken.has(s.c) || used.has(s.target)) continue
    taken.set(s.c, { target: s.target, score: s.score })
    used.add(s.target)
  }
  return cols.map((h) => ({
    c: h.c,
    header: h.v.trim(),
    target: taken.get(h.c)?.target ?? 'ignore',
    score: taken.get(h.c)?.score ?? 0,
    sample: (samplesByColumn.get(h.c) ?? []).find((s) => s.trim())?.trim() ?? '',
  }))
}

export function headerKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * What identifies "the same kind of sheet" from a client: its header cells, normalised and SORTED, so reordering
 * the columns keeps the signature. The server hashes this string.
 */
export function headerSignature(header: ReadonlyArray<{ v: string }>): string {
  return header
    .map((h) => headerKey(h.v))
    .filter(Boolean)
    .sort()
    .join('|')
}

/** A remembered mapping applied to this sheet's columns by header text; unknown headers fall back to the guess. */
export function applyRemembered(
  guesses: readonly ColumnGuess[],
  byHeader: Readonly<Record<string, string>>
): ColumnGuess[] {
  const isTarget = (t: string): t is MapTarget => (MAP_TARGETS as readonly string[]).includes(t)
  return guesses.map((g) => {
    const t = byHeader[headerKey(g.header)]
    return t && isTarget(t) ? { ...g, target: t, score: 10 } : g
  })
}

/** Header text → field, for saving. */
export function byHeaderOf(guesses: readonly ColumnGuess[]): Record<string, MapTarget> {
  return Object.fromEntries(guesses.map((g) => [headerKey(g.header), g.target]))
}
