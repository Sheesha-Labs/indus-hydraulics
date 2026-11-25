import 'server-only'
import mammoth from 'mammoth'
import type { DocxTable, ParsedDocument } from './types'

/**
 * DOCX (S08-T01). mammoth.convertToHtml, NOT extractRawText: raw text flattens a table into one cell per line
 * and the rows are lost. The HTML is walked once: paragraphs become lines, each table row becomes
 * "T{n}R{r}\tC1:…\tC2:…" so a quote can be checked against its table cell. Embedded images are returned for the
 * vision model. Legacy .doc is not read: the client is asked for PDF or DOCX.
 */
const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#39': "'",
  nbsp: ' ',
}

function decode(s: string): string {
  return s
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
      if (e.startsWith('#x')) return String.fromCodePoint(Number.parseInt(e.slice(2), 16))
      if (e.startsWith('#') && e !== '#39') return String.fromCodePoint(Number(e.slice(1)))
      return ENTITIES[e.toLowerCase()] ?? m
    })
    .replace(/\s+/g, ' ')
    .trim()
}

/** mammoth's HTML → lines and tables. Its output is simple and well formed: p, h1–h6, li, table/tr/td, br. */
export function htmlToDocxText(html: string): { text: string; tables: DocxTable[] } {
  const lines: string[] = []
  const tables: DocxTable[] = []
  let depth = 0
  let table: DocxTable | null = null
  let row: string[] | null = null
  let cell: string | null = null
  let para = ''
  const flushPara = () => {
    const t = decode(para)
    if (t) lines.push(t)
    para = ''
  }
  const re = /<(\/?)([a-z0-9]+)[^>]*>|([^<]+)/gi
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const [, close, tagRaw, text] = m
    if (text !== undefined) {
      if (cell !== null) cell += text
      else para += text
      continue
    }
    const tag = tagRaw!.toLowerCase()
    if (tag === 'table') {
      if (!close) {
        depth += 1
        if (depth === 1) {
          flushPara()
          table = { n: tables.length + 1, rows: [] }
        }
      } else {
        depth -= 1
        if (depth === 0 && table) {
          tables.push(table)
          table.rows.forEach((r, i) => {
            lines.push(`T${table!.n}R${i + 1}\t${r.map((v, c) => `C${c + 1}:${v}`).join('\t')}`)
          })
          table = null
        }
      }
    } else if (depth === 1 && tag === 'tr') {
      if (!close) row = []
      else if (row && table) {
        if (row.some((v) => v !== '')) table.rows.push(row)
        row = null
      }
    } else if (depth === 1 && (tag === 'td' || tag === 'th')) {
      if (!close) cell = ''
      else if (cell !== null && row) {
        row.push(decode(cell))
        cell = null
      }
    } else if (depth >= 1) {
      // Nested tables and paragraphs inside a cell join the cell's text.
      if (cell !== null && (tag === 'p' || tag === 'br') && close !== '/') cell += ' '
    } else if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tag)) {
      if (close) flushPara()
    } else if (tag === 'br') para += '\n'
  }
  flushPara()
  return { text: lines.join('\n'), tables }
}

export async function parseDocx(bytes: Uint8Array): Promise<ParsedDocument> {
  const images: Array<{ contentType: string; base64: string }> = []
  try {
    const res = await mammoth.convertToHtml(
      { buffer: Buffer.from(bytes) },
      {
        convertImage: mammoth.images.imgElement(async (img) => {
          if (images.length < 20) {
            const base64 = await img.read('base64')
            images.push({ contentType: img.contentType, base64 })
          }
          return { src: '' }
        }),
      }
    )
    const { text, tables } = htmlToDocxText(res.value)
    return { kind: 'docx', text, tables, images }
  } catch (e) {
    return {
      kind: 'unreadable',
      detail: `Could not open the document (${(e as Error).message.slice(0, 80)})`,
    }
  }
}
