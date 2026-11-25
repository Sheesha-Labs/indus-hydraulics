import type { EmailSegment, ForwardHeader } from '@indus/ops-core'

/**
 * What the intake parsers return (S08-T01, 08-map-integrations §3). Parsers never touch the database and never
 * infer a quantity or a price: they render the file faithfully, with coordinates, so a model's verbatim quote
 * can be found again (spans) and code can read the numbers itself.
 */

/** One run of text on a PDF page, in PDF user units with the origin at the TOP-left. */
export interface PdfTextItem {
  str: string
  /** Offsets of `str` in the page's `text`. */
  start: number
  end: number
  x: number
  y: number
  w: number
  h: number
}

export interface PageText {
  page: number
  width: number
  height: number
  text: string
  items: PdfTextItem[]
}

export interface SheetCell {
  /** Column letter(s): A, B … AA. */
  c: string
  v: string
  /** "A5:C5" on the top-left cell of a merged range. */
  merged?: string
  /** The cell holds a formula; `v` is its cached result. */
  formula?: boolean
  hidden?: boolean
}

export interface SheetRow {
  r: number
  hidden?: boolean
  cells: SheetCell[]
}

export interface SheetGridSheet {
  name: string
  hidden: boolean
  rows: SheetRow[]
}

export interface SheetGrid {
  sheets: SheetGridSheet[]
}

export interface DocxTable {
  /** 1-based table number, as in the T{n}R{r}C{c} coordinates. */
  n: number
  rows: string[][]
}

export type ParsedDocument =
  | {
      kind: 'pdf'
      pageCount: number
      hasTextLayer: boolean
      pages: PageText[]
      encrypted: false
      title: string | null
    }
  | {
      kind: 'sheet'
      format: 'xlsx' | 'xls' | 'csv'
      grid: SheetGrid
      /** Flattened coordinate text: "--- SHEET: name ---" then "R12\tA:value\tB:value". */
      text: string
      /** The text in chunks of 500 rows with the first row repeated, for sheets over 2,000 rows. */
      chunks: string[]
    }
  | {
      kind: 'docx'
      /** Paragraphs as lines; tables as "T1R2\tC1:value\tC2:value". */
      text: string
      tables: DocxTable[]
      images: Array<{ contentType: string; base64: string }>
    }
  | {
      kind: 'image'
      /** JPEG, auto-rotated, long edge ≤ 2000 px, metadata stripped. */
      base64: string
      width: number
      height: number
      /** From the file's metadata when present (board 17 "96 dpi scan"). */
      dpi: number | null
    }
  | {
      kind: 'email'
      /** The stored plain-text body: the exact text spans point into. */
      text: string
      textHash: string | null
      segments: EmailSegment[]
      forwards: ForwardHeader[]
    }
  | {
      kind: 'zip'
      decision: 'expand' | 'store_only'
      reason?: string
      entries: Array<{ name: string; size: number }>
    }
  | {
      kind: 'unsupported'
      ask: 'xlsx_or_pdf' | 'pdf_or_docx' | 'jpeg_or_pdf' | 'other'
      detail: string
    }
  | { kind: 'password_protected' }
  | { kind: 'unreadable'; detail: string }

export type ParsedKind = ParsedDocument['kind']
