import 'server-only'
import { estimatePdfTokens, MODELS, type CallAttachment, type SystemPart } from '@indus/ops-ai'
import { partNoNorm } from '@indus/ops-core'
import type { ActionAi } from '../assistant/types'
import {
  extractApiSchema,
  fromApi,
  extractUser,
  PROMPT_VERSION,
  SYSTEM_PARTS,
  type ExtractedLine,
  type ExtractOutput,
} from '../assistant/prompts/extract-lines.v1'
import { readableText } from './parse/email'
import { chunkPdf, needsChunking } from './parse/pdf'
import type { ParsedDocument } from './parse/types'

/**
 * Model side of action #5 (S08-T02, 08 §2.4 / §3). No database: the parsed document and its bytes come in, the
 * model's lines come out with page numbers mapped back to the original document. Sonnet 5.5 reads; a document
 * over 15 pages starts on Opus 5.5, and a Sonnet read with more than 20 % Unsure lines (decided by the caller in
 * code) is read once more, whole, on Opus 5.5. Chunks run three at a time and merge by position; a line repeated
 * on an overlap page is dropped.
 */
export const EXTRACT_MODEL = MODELS.sonnet
export const ESCALATION_MODEL = MODELS.opus
export const ESCALATE_PAGES = 15
export const ESCALATE_UNSURE_SHARE = 0.2
const CONCURRENCY = 3
const MAX_IMAGES = 5

export interface Chunk {
  describe: string
  text: string | null
  attachments: CallAttachment[]
  /** Chunk page n → original page pages[n-1] (PDF chunks). */
  pages: number[] | null
}

export async function planChunks(doc: ParsedDocument, bytes: Uint8Array | null): Promise<Chunk[]> {
  switch (doc.kind) {
    case 'pdf': {
      if (!bytes) return []
      const parts = needsChunking(doc.pageCount, bytes.length)
        ? await chunkPdf(bytes, { pagesPerChunk: 20, overlap: 1 })
        : [{ pages: doc.pages.map((p) => p.page), bytes }]
      return parts.map((c) => ({
        describe: `PDF, pages ${c.pages[0]}–${c.pages.at(-1)} of ${doc.pageCount}${doc.hasTextLayer ? '' : ' (scanned)'}`,
        text: null,
        attachments: [
          {
            type: 'document',
            mediaType: 'application/pdf',
            base64: Buffer.from(c.bytes).toString('base64'),
            estTokens: estimatePdfTokens(c.pages.length),
          },
        ],
        pages: c.pages,
      }))
    }
    case 'sheet':
      return doc.chunks.map((text, i) => ({
        describe:
          doc.chunks.length > 1
            ? `Spreadsheet, part ${i + 1} of ${doc.chunks.length}`
            : 'Spreadsheet',
        text,
        attachments: [],
        pages: null,
      }))
    case 'docx':
      return [
        {
          describe: doc.images.length ? 'Word document with embedded images' : 'Word document',
          text: doc.text,
          attachments: doc.images
            .filter((im) => /jpe?g|png|webp/.test(im.contentType))
            .slice(0, MAX_IMAGES)
            .map((im) => ({
              type: 'image' as const,
              mediaType: (im.contentType.includes('png')
                ? 'image/png'
                : im.contentType.includes('webp')
                  ? 'image/webp'
                  : 'image/jpeg') as 'image/png' | 'image/webp' | 'image/jpeg',
              base64: im.base64,
              estTokens: 1_600,
            })),
          pages: null,
        },
      ]
    case 'image':
      return [
        {
          describe: 'Image (photo or scan), page 1',
          text: null,
          attachments: [
            { type: 'image', mediaType: 'image/jpeg', base64: doc.base64, estTokens: 1_600 },
          ],
          pages: [1],
        },
      ]
    case 'email': {
      const parts = readableText(doc)
      if (!parts.length) return []
      return [
        {
          describe: 'Email body',
          text: parts.map((p) => p.text).join('\n\n'),
          attachments: [],
          pages: null,
        },
      ]
    }
    default:
      return []
  }
}

export interface ExtractRun {
  ok: true
  lines: ExtractedLine[]
  documentLevel: ExtractOutput['documentLevel']
  model: string
  costUsd: string
  callIds: string[]
  chunks: number
}

export type ExtractResult =
  ExtractRun | { ok: false; reason: string; detail: string; costUsd: string; callIds: string[] }

function addUsd(a: string, b: string): string {
  return (Number(a) + Number(b)).toFixed(6)
}

async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (t: T, i: number) => Promise<R>
): Promise<R[]> {
  const out = new Array<R>(items.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++
        out[i] = await fn(items[i]!, i)
      }
    })
  )
  return out
}

/** Same line seen twice (an overlap page, a continuation): same part, same printed quantity, same description start. */
export function sameLine(a: ExtractedLine, b: ExtractedLine): boolean {
  const pa = partNoNorm(a.partNumber)
  const pb = partNoNorm(b.partNumber)
  if (pa && pb && pa !== pb) return false
  const qa = (a.qtyPrinted ?? '').replace(/\s+/g, '')
  const qb = (b.qtyPrinted ?? '').replace(/\s+/g, '')
  if (qa !== qb) return false
  const da = a.description.toLowerCase().replace(/\s+/g, ' ').slice(0, 40)
  const db = b.description.toLowerCase().replace(/\s+/g, ' ').slice(0, 40)
  return da === db
}

const firstPage = (l: ExtractedLine) => l.evidence.find((e) => e.page !== null)?.page ?? null

/** Concatenates chunk results in order, maps chunk pages to original pages and drops overlap repeats. */
export function mergeChunks(
  results: ReadonlyArray<{ out: ExtractOutput; pages: number[] | null }>
): ExtractOutput {
  const lines: ExtractedLine[] = []
  const level: ExtractOutput['documentLevel'] = {
    clientRef: null,
    closingDate: null,
    deliveryTerms: null,
    currency: null,
    quoteValidity: null,
    partialAllowed: null,
  }
  let prevPages = new Set<number>()
  for (const r of results) {
    const map = (p: number | null) => (p === null || !r.pages ? p : (r.pages[p - 1] ?? p))
    for (const raw of r.out.lines) {
      const line: ExtractedLine = {
        ...raw,
        evidence: raw.evidence.map((e) => ({ ...e, page: map(e.page) })),
      }
      const page = firstPage(line)
      const onOverlap = page !== null && prevPages.has(page)
      if (onOverlap && lines.some((l) => sameLine(l, line))) continue
      lines.push(line)
    }
    for (const k of Object.keys(level) as Array<keyof typeof level>) {
      const v = r.out.documentLevel[k]
      if (!level[k] && v) level[k] = { ...v, page: map(v.page) }
    }
    prevPages = new Set(r.pages ?? [])
  }
  return { lines: lines.map((l, i) => ({ ...l, ord: i + 1 })), documentLevel: level }
}

/**
 * A chunk the model could not finish (max_tokens even after the doubled retry) is split in two and each half read
 * on its own: a PDF by pages, text by lines. One page or one line that still overflows fails the read.
 */
export async function splitChunk(chunk: Chunk): Promise<Chunk[] | null> {
  const doc = chunk.attachments.find((a) => a.type === 'document')
  if (doc && chunk.pages && chunk.pages.length > 1) {
    const half = Math.ceil(chunk.pages.length / 2)
    const parts = await chunkPdf(Buffer.from(doc.base64, 'base64'), {
      pagesPerChunk: half,
      overlap: 0,
    })
    return parts.map((p) => {
      const pages = p.pages.map((n) => chunk.pages![n - 1]!)
      return {
        ...chunk,
        describe: `${chunk.describe.replace(/, pages .*$/, '')}, pages ${pages[0]}–${pages.at(-1)}`,
        attachments: [
          {
            type: 'document' as const,
            mediaType: 'application/pdf' as const,
            base64: Buffer.from(p.bytes).toString('base64'),
            estTokens: estimatePdfTokens(p.pages.length),
          },
        ],
        pages,
      }
    })
  }
  if (chunk.text && !chunk.attachments.length) {
    const lines = chunk.text.split('\n')
    if (lines.length < 4) return null
    // Keep a sheet's heading and first row on both halves.
    const head = lines[0]!.startsWith('--- SHEET:') ? lines.slice(0, 2) : []
    const body = lines.slice(head.length)
    const mid = Math.ceil(body.length / 2)
    return [body.slice(0, mid), body.slice(mid)].map((part, i) => ({
      ...chunk,
      describe: `${chunk.describe} (part ${i + 1} of 2)`,
      text: [...head, ...part].join('\n'),
    }))
  }
  return null
}

export async function runExtraction(args: {
  chunks: readonly Chunk[]
  ai: ActionAi
  model: string
  today: string
  units: SystemPart
}): Promise<ExtractResult> {
  let cost = '0.000000'
  const callIds: string[] = []
  type Read =
    | { ok: true; out: ExtractOutput; pages: number[] | null }[]
    | { ok: false; reason: string; detail: string }

  const read = async (chunk: Chunk, depth: number): Promise<Read> => {
    const r = await args.ai.call({
      route: 'extract',
      model: args.model,
      effort: 'medium',
      system: [...SYSTEM_PARTS, args.units],
      user: extractUser({ today: args.today, describe: chunk.describe, text: chunk.text }),
      attachments: chunk.attachments,
      zod: extractApiSchema,
      maxTokens: 16_000,
      promptVersion: PROMPT_VERSION,
    })
    cost = addUsd(cost, r.costUsd)
    callIds.push(...r.callIds)
    if (r.ok) return [{ ok: true, out: fromApi(r.value), pages: chunk.pages }]
    if (r.reason === 'max_tokens' && depth < 3) {
      const halves = await splitChunk(chunk)
      if (halves) {
        const parts = await Promise.all(halves.map((h) => read(h, depth + 1)))
        const bad = parts.find((p) => !Array.isArray(p))
        if (bad && !Array.isArray(bad)) return bad
        return parts.flat() as Extract<Read, unknown[]>
      }
    }
    return { ok: false, reason: r.reason, detail: r.detail }
  }

  const results = await mapLimit(args.chunks, CONCURRENCY, (chunk) => read(chunk, 0))
  const failed = results.find((x) => !Array.isArray(x))
  if (failed && !Array.isArray(failed))
    return { ok: false, reason: failed.reason, detail: failed.detail, costUsd: cost, callIds }
  const merged = mergeChunks(
    (results as Array<Extract<Read, unknown[]>>).flat().map((x) => ({ out: x.out, pages: x.pages }))
  )
  return {
    ok: true,
    ...merged,
    model: args.model,
    costUsd: cost,
    callIds,
    chunks: args.chunks.length,
  }
}

/** The model a document starts on (08 §2.4: over 15 pages goes straight to Opus 5.5). */
export function startingModel(doc: ParsedDocument): string {
  return doc.kind === 'pdf' && doc.pageCount > ESCALATE_PAGES ? ESCALATION_MODEL : EXTRACT_MODEL
}
