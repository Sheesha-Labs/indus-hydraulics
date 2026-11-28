import type {
  DocBlock,
  DocTableBlock,
  DocTableRow,
  DocumentData,
  EstimateDocument,
  HouseDocument,
} from './types'

/**
 * Pagination shared by the screen and the PDF (S11-T03, ADR-14). Both renderers draw exactly the pages this
 * returns, so they can never disagree on page breaks or page count. Heights are estimates in the kit's CSS
 * pixels (A4 = 794 × 1123), deliberately on the generous side: a page may end a little early, never overflow
 * (the PDF test re-renders every page with wrapping on and fails if one spills).
 *
 * A page carries a slice of the same DocumentData: the first page has the letterhead, title, parties and
 * subject; later pages repeat only the number (running header) and, when a table continues, its header row.
 * Rows never split across pages.
 */

export interface DocPage<T extends DocumentData = DocumentData> {
  /** 1-based. */
  page: number
  pageCount: number
  first: boolean
  last: boolean
  /** The slice of the document on this page. */
  data: T
}

/** Usable body height on a page: 1123 − top padding 44 − footer zone 80. */
const BODY = 999
/** US Letter is 1056 tall at the same width scale: 67 px less body. */
const LETTER_LOSS = 1123 - 1056
/** Running header + gap on continuation pages. */
const CONT_HEAD = 40

const LINE = 16

/** Lines a text needs at about `cpl` characters per line. */
function lines(text: string | undefined, cpl: number): number {
  if (!text) return 0
  return text.split('\n').reduce((n, part) => n + Math.max(1, Math.ceil(part.length / cpl)), 0)
}

/** Characters per line of the description column: ~6.2 px per character at 11.5–12 px Geist. */
function descCpl(cols: readonly string[]): number {
  const other = cols.length - 2
  const descPct = Math.max(20, 100 - 5 - other * 10.5)
  return Math.max(14, Math.floor((698 * descPct) / 100 / 6.4))
}

/** A table row: padding, the description's lines, a bold first line, the small line under it. */
function rowHeight(
  row: DocTableRow,
  cpl: number,
  m: { pad: number; line: number; sub: number }
): number {
  const desc = row.cells[1]
  if (!desc) return m.pad + m.line
  const main = lines(desc.v, (desc.span ?? 1) > 1 ? cpl * 3 : cpl) || 1
  return (
    m.pad + m.line * main + (desc.bold ? m.line : 0) + (desc.sub ? m.sub * lines(desc.sub, cpl) : 0)
  )
}

/** Row metrics in px, from the HTML layouts (padding, then line boxes at their leading). */
const EST_ROW = { pad: 15, line: 11.5 * 1.45, sub: 10.5 * 1.45 }
const HOUSE_ROW = { pad: 17, line: 12 * 1.45, sub: 10 * 1.45 + 2 }

interface Unit {
  /** Height in px. */
  h: number
  /** Rows of a table continue under a repeated header on the next page. */
  tableRow?: { block: number; row: number; headH: number }
  /** Index of the house block, or a named estimate part. */
  part: number | 'totals' | 'notes' | 'sign'
}

/**
 * Pack units onto pages; a table row that starts a new page brings its header row with it. The template's
 * paper sets the body height; "Lines on page 1" caps the table rows on the first page.
 */
function pack(firstHead: number, units: Unit[], page?: DocumentData['page']): Unit[][] {
  const body = page?.size === 'Letter' ? BODY - LETTER_LOSS : BODY
  const cap = page?.firstPageRows
  const pages: Unit[][] = [[]]
  let used = firstHead
  let firstRows = 0
  for (const u of units) {
    const capped = cap !== undefined && pages.length === 1 && !!u.tableRow && firstRows >= cap
    if ((capped || used + u.h > body) && pages.at(-1)!.length > 0) {
      pages.push([])
      used = CONT_HEAD + (u.tableRow ? u.tableRow.headH : 0)
    }
    pages.at(-1)!.push(u)
    if (pages.length === 1 && u.tableRow) firstRows++
    used += u.h
  }
  return pages
}

// ── Estimate ─────────────────────────────────────────────────────────────────────────────────────

function estimateHead(d: EstimateDocument): number {
  const L = 11.5 * 1.45
  // Logo 58 + 6, legal name 13 × 1.6, address lines and the contact line at 10.5 × 1.6.
  const letterhead = 64 + 21 + 16.8 * 3
  const party = L * (2 + d.billTo.lines.length)
  const meta = (L + 3) * d.meta.length
  return letterhead + (d.revision ? 10 + 28 : 0) + 22 + Math.max(party, meta) + 18 + 31
}

function paginateEstimate(d: EstimateDocument): DocPage<EstimateDocument>[] {
  const cpl = descCpl(d.items.cols)
  const units: Unit[] = d.items.rows.map((r, i) => ({
    h: rowHeight(r, cpl, EST_ROW),
    tableRow: { block: 0, row: i, headH: 31 },
    part: 0,
  }))
  units.push({ h: 12 + d.totals.reduce((n, t) => n + (t.grand ? 35 : 25), 0), part: 'totals' })
  if (d.notes.length)
    units.push({
      h: 16 + d.notes.reduce((n, x) => n + 10 + 17 + 16.3 * lines(x.text, 118), 0),
      part: 'notes',
    })
  // The signature and stamp strip, with room for the signature and stamp images.
  units.push({ h: 14 + 64 + 36, part: 'sign' })
  const packed = pack(estimateHead(d), units, d.page)
  return packed.map((us, i) => {
    const rows = us.filter((u) => u.tableRow).map((u) => u.tableRow!.row)
    const has = (p: Unit['part']) => us.some((u) => u.part === p)
    return {
      page: i + 1,
      pageCount: packed.length,
      first: i === 0,
      last: i === packed.length - 1,
      data: {
        ...d,
        items: { ...d.items, rows: rows.map((r) => d.items.rows[r]!) },
        totals: has('totals') ? d.totals : [],
        notes: has('notes') ? d.notes : [],
        signer: has('sign') ? d.signer : '',
      },
    }
  })
}

// ── House ─────────────────────────────────────────────────────────────────────────────────────────

function houseHead(d: HouseDocument): number {
  const letterhead = Math.max(60, 21 + 18 * (d.meta.length ? 4 : 4)) + 17
  const title = 13.5 + 10 + 72 + 10 + 19.5
  const meta = 24 * d.meta.length
  const party = d.party.length
    ? 18 + 15 + 13.5 + 6 + 20 + Math.max(...d.party.map((p) => 18.6 * p.lines.length))
    : 0
  return letterhead + 20 + Math.max(title, meta) + party + (d.subject ? 14 + 24 + 19 : 0)
}

function blockHeight(b: DocBlock): number {
  switch (b.t) {
    case 'table':
      return 0 // rows are units of their own
    case 'totals':
      return (
        14 +
        Math.max(
          18 * lines(b.words, 48),
          b.rows.reduce((n, r) => n + (r.grand ? 42 : 31), 0)
        )
      )
    case 'section':
      return 18 + 22
    case 'terms':
      return 10 + b.rows.reduce((n, r) => n + 13 + 18 * Math.max(1, lines(r.value, 70)), 0)
    case 'bank':
      // The signature column (lead, 46 px line, name, role, company, stamp image) is the taller side.
      return 16 + 17 + 46 + 27 + 17 + 17 + 46
    case 'sign':
      return 14 + 44
    case 'slips':
      return 12 + 40 + 30 * Math.max(...b.boxes.map((x) => x.fields.length))
    case 'remark':
      return 14 + Math.max(64, 24 + LINE * lines(b.text, 100))
  }
}

function paginateHouse(d: HouseDocument): DocPage<HouseDocument>[] {
  const units: Unit[] = []
  d.blocks.forEach((b, bi) => {
    if (b.t === 'table') {
      const cpl = descCpl(b.cols)
      // The header row (and the gap above it) travels with the first row.
      if (!b.rows.length) units.push({ h: 16 + 34, part: bi })
      b.rows.forEach((r, ri) =>
        units.push({
          h: rowHeight(r, cpl, HOUSE_ROW) + (ri === 0 ? 16 + 34 : 0),
          tableRow: { block: bi, row: ri, headH: 34 },
          part: bi,
        })
      )
    } else units.push({ h: blockHeight(b), part: bi })
  })
  // A numbered section heading never ends a page on its own: it travels with what follows.
  const merged: Unit[] = []
  for (let i = 0; i < units.length; i++) {
    const u = units[i]!
    const b = typeof u.part === 'number' ? d.blocks[u.part] : undefined
    const next = units[i + 1]
    if (b?.t === 'section' && next && !next.tableRow) {
      merged.push({ ...next, h: next.h + u.h, part: next.part })
      merged.push({ h: 0, part: u.part })
      i++
    } else merged.push(u)
  }
  const packed = pack(houseHead(d), merged, d.page)
  return packed.map((us, i) => {
    const blocks: DocBlock[] = []
    const ids = [...new Set(us.map((u) => u.part as number))].sort((a, b) => a - b)
    for (const bi of ids) {
      const b = d.blocks[bi]!
      if (b.t === 'table') {
        const rows = us.filter((u) => u.tableRow?.block === bi).map((u) => b.rows[u.tableRow!.row]!)
        blocks.push({ ...b, rows } satisfies DocTableBlock)
      } else blocks.push(b)
    }
    return {
      page: i + 1,
      pageCount: packed.length,
      first: i === 0,
      last: i === packed.length - 1,
      data: { ...d, blocks },
    }
  })
}

/** The house running footer's page count: "01 / 03" (Document Kit). */
export function housePageLabel(page: number, pageCount: number): string {
  const two = (n: number) => String(n).padStart(2, '0')
  return `${two(page)} / ${two(Math.max(page, pageCount))}`
}

/** The Estimate footer's page count: "Page 1 of 3". */
export function estimatePageLabel(page: number, pageCount: number): string {
  return `Page ${page} of ${Math.max(page, pageCount)}`
}

export function paginate(d: EstimateDocument): DocPage<EstimateDocument>[]
export function paginate(d: HouseDocument): DocPage<HouseDocument>[]
export function paginate(d: DocumentData): DocPage[]
export function paginate(d: DocumentData): DocPage[] {
  return d.layout === 'estimate' ? paginateEstimate(d) : paginateHouse(d)
}
