/**
 * Read line items out of an enquiry attachment.
 *
 * Format strategy, and the reasoning behind each choice:
 *
 *   PDF  — sent to Claude as a native `document` block. NO text-extraction
 *          library is involved. GCC portal RFQ sheets are frequently scanned
 *          images, where every text extractor returns an empty string and the
 *          failure looks identical to "this PDF has no items". Extraction also
 *          destroys the table structure the quantities live in.
 *
 *   XLSX — parsed with `exceljs`, deliberately NOT with `xlsx` (SheetJS).
 *          SheetJS 0.18.5 is the last npm release and carries CVE-2023-30533
 *          (prototype pollution) and CVE-2024-22363 (ReDoS). It is fine where
 *          it is used today — staff-uploaded catalogue imports — but an
 *          enquiry attachment arrives from outside and is attacker-controlled.
 *          Cell values are read as strings and handed to the model; no formula
 *          evaluation, no type coercion.
 *
 *   DOCX — not extracted. `mammoth.extractRawText` flattens tables into token
 *          soup, which detaches every quantity from its description; that is
 *          worse than no extraction, because it produces confident nonsense.
 *          The file is stored and readable, and the human is told to paste.
 *
 * Every returned row carries the verbatim text it came from, the same rule the
 * pasted-body path follows and the same rule the database CHECK enforces.
 */

import Anthropic from '@anthropic-ai/sdk'

const MODEL = 'claude-opus-5'
const PRICE = { input: 5.0, output: 25.0 } as const

/** Claude's document-block ceiling; larger files are rejected, not truncated. */
export const MAX_PDF_BYTES = 30 * 1024 * 1024

export type ExtractedAttachmentLine = {
  description: string
  qty: number | null
  unit: string | null
  partNumber: string | null
  certification: string | null
  /** Verbatim text from the document supporting this row. */
  sourceText: string
}

export type AttachmentExtraction = {
  status: 'extracted' | 'unsupported' | 'failed'
  note: string | null
  lines: ExtractedAttachmentLine[]
  costUsdMicros: number
  extractorName: string
}

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['lines'],
  properties: {
    lines: {
      type: 'array',
      maxItems: 200,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['description', 'qty', 'unit', 'partNumber', 'certification', 'sourceText'],
        properties: {
          description: { type: 'string' },
          qty: { type: ['number', 'null'] },
          unit: { type: ['string', 'null'] },
          partNumber: { type: ['string', 'null'] },
          certification: { type: ['string', 'null'], description: 'e.g. 3.1 MTC, IACS. Null if not stated.' },
          sourceText: { type: 'string', description: 'Verbatim text from the document for this row.' },
        },
      },
    },
  },
} as const

const SYSTEM = `You read procurement RFQ sheets and return their line items.

Rules, in order of importance:
1. sourceText must be text that appears in the document, copied as written. If
   you cannot copy such a span for a row, omit the row.
2. Never infer a quantity. If the sheet does not state one, qty is null. A
   plausible guess here becomes a real purchase order.
3. Only report items the sheet actually lists. Do not add anything you expect
   to see, and do not merge two rows into one.
4. certification is only what the sheet states — 3.1 MTC, EN 10204, IACS class
   approval. Absent means null, not "no".
5. Headers, totals, terms, page furniture and signature blocks are not line
   items.`

function costMicros(u: { input_tokens?: number; output_tokens?: number } | undefined): number {
  if (!u) return 0
  return Math.round(
    (((u.input_tokens ?? 0) / 1e6) * PRICE.input + ((u.output_tokens ?? 0) / 1e6) * PRICE.output) * 1e6,
  )
}

/** Whitespace-insensitive containment — PDFs and sheets re-wrap constantly. */
function appearsVerbatim(quote: string, haystack: string): boolean {
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
  const q = norm(quote)
  return q.length >= 3 && norm(haystack).includes(q)
}

/**
 * Keep only rows whose sourceText really appears in the document.
 *
 * For a PDF the model reads the file directly, so there is no text to check
 * against — pass `null` and the check is skipped, which is why PDF rows still
 * carry sourceText for a human to verify against the original.
 */
export function keepEvidencedLines(
  raw: unknown,
  documentText: string | null,
): { kept: ExtractedAttachmentLine[]; dropped: number } {
  if (!Array.isArray(raw)) return { kept: [], dropped: 0 }

  const kept: ExtractedAttachmentLine[] = []
  let dropped = 0

  for (const item of raw) {
    if (typeof item !== 'object' || item === null) { dropped += 1; continue }
    const l = item as Partial<ExtractedAttachmentLine>

    if (typeof l.description !== 'string' || !l.description.trim()) { dropped += 1; continue }
    if (typeof l.sourceText !== 'string' || !l.sourceText.trim()) { dropped += 1; continue }
    if (documentText !== null && !appearsVerbatim(l.sourceText, documentText)) { dropped += 1; continue }

    kept.push({
      description: l.description.trim(),
      qty: typeof l.qty === 'number' && Number.isFinite(l.qty) ? l.qty : null,
      unit: typeof l.unit === 'string' && l.unit.trim() ? l.unit.trim().toUpperCase() : null,
      partNumber: typeof l.partNumber === 'string' && l.partNumber.trim() ? l.partNumber.trim() : null,
      certification:
        typeof l.certification === 'string' && l.certification.trim()
          ? l.certification.trim().toUpperCase()
          : null,
      sourceText: l.sourceText.trim().slice(0, 500),
    })
  }

  return { kept, dropped }
}

/**
 * Flatten a workbook to text, without SheetJS.
 *
 * Values are read as written. No formula evaluation and no type coercion —
 * SheetJS's default inference turns the part number "1-2-3" into a date and
 * "007" into 7, and the same trap exists in any parser left to guess.
 */
export async function sheetToText(buffer: Buffer): Promise<string> {
  const ExcelJS = (await import('exceljs')).default
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(buffer as unknown as ArrayBuffer)

  const out: string[] = []
  wb.eachSheet((sheet) => {
    out.push(`--- SHEET: ${sheet.name} ---`)
    sheet.eachRow({ includeEmpty: false }, (row) => {
      const cells: string[] = []
      row.eachCell({ includeEmpty: true }, (cell) => {
        const v = cell.value
        if (v === null || v === undefined) { cells.push(''); return }
        if (typeof v === 'object' && 'richText' in v) {
          cells.push((v.richText as Array<{ text: string }>).map((t) => t.text).join(''))
        } else if (typeof v === 'object' && 'text' in v) {
          cells.push(String((v as { text: unknown }).text))
        } else if (typeof v === 'object' && 'result' in v) {
          // A formula cell: take the cached result, never re-evaluate.
          cells.push(String((v as { result: unknown }).result ?? ''))
        } else {
          cells.push(String(v))
        }
      })
      if (cells.some((c) => c.trim())) out.push(cells.join('\t'))
    })
  })

  return out.join('\n')
}

async function extractFromText(text: string, kind: string): Promise<AttachmentExtraction> {
  const client = new Anthropic()
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: `${kind.toUpperCase()} CONTENTS:\n\n${text}` }],
  })

  const cost = costMicros(response.usage)
  const block = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
  if (!block) {
    return { status: 'failed', note: 'The model returned no output.', lines: [], costUsdMicros: cost, extractorName: `attachment-${kind}/v1` }
  }

  let parsed: { lines?: unknown }
  try {
    parsed = JSON.parse(block.text) as { lines?: unknown }
  } catch {
    return { status: 'failed', note: 'The model output was not valid JSON.', lines: [], costUsdMicros: cost, extractorName: `attachment-${kind}/v1` }
  }

  const { kept, dropped } = keepEvidencedLines(parsed.lines, text)
  return {
    status: 'extracted',
    note: dropped > 0 ? `${dropped} row(s) dropped — no traceable text in the document.` : null,
    lines: kept,
    costUsdMicros: cost,
    extractorName: `attachment-${kind}/v1`,
  }
}

async function extractFromPdf(buffer: Buffer): Promise<AttachmentExtraction> {
  if (buffer.byteLength > MAX_PDF_BYTES) {
    return {
      status: 'unsupported',
      note: `This PDF is ${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB, over the ${MAX_PDF_BYTES / 1024 / 1024} MB limit. Split it or paste the items.`,
      lines: [],
      costUsdMicros: 0,
      extractorName: 'attachment-pdf/v1',
    }
  }

  const client = new Anthropic()
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: buffer.toString('base64') },
          },
          { type: 'text', text: 'Return the line items from this RFQ sheet.' },
        ],
      },
    ],
  })

  const cost = costMicros(response.usage)
  const block = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
  if (!block) {
    return { status: 'failed', note: 'The model returned no output.', lines: [], costUsdMicros: cost, extractorName: 'attachment-pdf/v1' }
  }

  let parsed: { lines?: unknown }
  try {
    parsed = JSON.parse(block.text) as { lines?: unknown }
  } catch {
    return { status: 'failed', note: 'The model output was not valid JSON.', lines: [], costUsdMicros: cost, extractorName: 'attachment-pdf/v1' }
  }

  // The model read the file itself, so there is no extracted text to check a
  // quote against. sourceText is still required and still shown, so a human can
  // verify each row against the original page.
  const { kept } = keepEvidencedLines(parsed.lines, null)
  return {
    status: 'extracted',
    note: kept.length === 0 ? 'No line items were found in this document.' : null,
    lines: kept,
    costUsdMicros: cost,
    extractorName: 'attachment-pdf/v1',
  }
}

/** Route one attachment to the right reader. */
export async function extractFromAttachment(input: {
  buffer: Buffer
  mimeType: string | null
  filename: string
}): Promise<AttachmentExtraction> {
  const mime = (input.mimeType ?? '').toLowerCase()
  const ext = input.filename.toLowerCase().split('.').pop() ?? ''

  if (mime === 'application/pdf' || ext === 'pdf') {
    return extractFromPdf(input.buffer)
  }

  if (mime.includes('spreadsheetml') || ext === 'xlsx') {
    const text = await sheetToText(input.buffer)
    if (!text.trim()) {
      return { status: 'failed', note: 'The workbook appeared to be empty.', lines: [], costUsdMicros: 0, extractorName: 'attachment-xlsx/v1' }
    }
    return extractFromText(text, 'xlsx')
  }

  if (mime.includes('wordprocessingml') || ext === 'docx') {
    return {
      status: 'unsupported',
      note: 'Word documents are not read automatically — table structure is lost in conversion, which detaches quantities from their descriptions. Open it and paste the items instead.',
      lines: [],
      costUsdMicros: 0,
      extractorName: 'attachment-docx/none',
    }
  }

  return {
    status: 'unsupported',
    note: `No reader for ${ext || mime || 'this file type'}. It is stored and can be downloaded; paste the items to add them.`,
    lines: [],
    costUsdMicros: 0,
    extractorName: 'attachment-none/v1',
  }
}
