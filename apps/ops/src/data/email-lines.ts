import 'server-only'
import { emailBodyRegions, segmentEmail } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { formatDate, formatTime } from '@indus/ops-ui/format'
import { countsOf } from '../server/intake/review'

/**
 * Board 36 · Read lines from email (S08-T05). The message as received with its sources marked — a table, a sentence,
 * an earlier reply greyed and ignored — beside the facts code read (client, client ref, needed by) and the lines
 * with their source and confidence. Two reads: the thread's latest inbound message with its intake batch, then the
 * batch's lines with the spans their descriptions stand on.
 */
export type EmailBlock =
  | { kind: 'text'; text: string; start: number; marks: Array<{ start: number; end: number }> }
  | { kind: 'table'; rows: string[][]; lines: number }
  | { kind: 'ignored'; text: string }

export interface EmailLine {
  id: string
  ord: number
  description: string
  partNo: string | null
  qty: string | null
  uom: string | null
  source: string
  sourceTone: 'info' | 'warn' | 'neutral'
  label: 'High' | 'Check' | 'Low'
  tone: 'ok' | 'warn' | 'bad'
  note: string | null
}

export interface EmailLinesModel {
  folder: string
  threadId: string
  message: {
    id: string
    subject: string
    fromName: string | null
    fromAddress: string
    to: string
    sentAt: string
    attachments: Array<{ id: string; name: string; type: string; size: string }>
  }
  batch: { id: string } | null
  blocks: EmailBlock[]
  sources: number
  textLines: number
  facts: {
    client: { name: string; sub: string } | null
    clientRef: { value: string; sub: string } | null
    neededBy: { date: string; quote: string } | null
  }
  lines: EmailLine[]
  attachments: Array<{ id: string; name: string; chip: string; tone: 'info' | 'ok' | 'warn' | 'bad'; note: string }>
  unitsNote: string | null
  lineCount: number
  toCheck: number
  blocker: string | null
  reading: boolean
}

const LABEL = { sure: 'High', likely: 'Check', unsure: 'Low' } as const
const TONE = { sure: 'ok', likely: 'warn', unsure: 'bad' } as const
function sizeOf(n: number | null): string {
  if (!n) return ''
  return n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`
}

const typeOf = (name: string) => /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toUpperCase() ?? 'FILE'

/** The body as blocks: plain text (with the lines read from it marked), tables, and the ignored earlier reply. */
export function blocksOf(
  text: string,
  regions: ReturnType<typeof emailBodyRegions>,
  textMarks: ReadonlyArray<number>,
  tableLines: (r: { start: number; end: number }) => number
): EmailBlock[] {
  const out: EmailBlock[] = []
  let at = 0
  const plain = (from: number, to: number) => {
    const t = text.slice(from, to)
    if (!t.trim()) return
    const marks = textMarks
      .filter((m) => m >= from && m < to)
      .map((m) => {
        const s = text.lastIndexOf('\n', m - 1) + 1
        const e = text.indexOf('\n', m)
        return { start: Math.max(s, from), end: Math.min(e < 0 ? to : e, to) }
      })
    out.push({ kind: 'text', text: t, start: from, marks })
  }
  for (const r of regions) {
    plain(at, r.start)
    if (r.kind === 'table') out.push({ kind: 'table', rows: r.rows ?? [], lines: tableLines(r) })
    else if (r.kind === 'ignored') out.push({ kind: 'ignored', text: text.slice(r.start, r.end).trim() })
    at = r.end
  }
  plain(at, text.length)
  return out
}

export async function getEmailLines(folder: string, threadId: string): Promise<EmailLinesModel | null> {
  const thread = await opsDb.mailThread.findUnique({
    where: { id: threadId },
    select: {
      id: true,
      messages: {
        where: { direction: 'inbound' },
        orderBy: { sentAt: 'desc' },
        take: 1,
        select: {
          id: true,
          subject: true,
          fromName: true,
          fromAddress: true,
          toAddresses: true,
          sentAt: true,
          bodyText: true,
          attachments: { select: { id: true, filename: true, sizeBytes: true } },
          intakeBatches: {
            where: { status: { not: 'cancelled' } },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              clientRef: true,
              terms: true,
              clientCompany: { select: { id: true, name: true } },
              files: {
                where: { status: { not: 'removed' } },
                select: {
                  id: true,
                  kind: true,
                  filename: true,
                  status: true,
                  linesFound: true,
                  failureNote: true,
                },
              },
              candidates: {
                where: { decision: { notIn: ['removed', 'merged'] } },
                orderBy: { ord: 'asc' },
                select: {
                  id: true,
                  ord: true,
                  description: true,
                  partNo: true,
                  qty: true,
                  uom: true,
                  uomRaw: true,
                  confidence: true,
                  reasons: true,
                  unsure: true,
                  decision: true,
                  duplicateOfId: true,
                  sourceKind: true,
                  sourceDetail: true,
                  fieldSpans: true,
                  file: { select: { kind: true, filename: true } },
                },
              },
            },
          },
        },
      },
    },
  })
  const m = thread?.messages[0]
  if (!thread || !m) return null
  const batch = m.intakeBatches[0] ?? null
  const text = m.bodyText ?? ''
  const regions = emailBodyRegions(text, segmentEmail(text))
  const lines = batch?.candidates ?? []
  const spanIds = lines.flatMap((c) => {
    const d = (c.fieldSpans as Record<string, string> | null)?.description
    return d && c.file?.kind === 'email' ? [d] : []
  })
  const spans = spanIds.length
    ? await opsDb.sourceSpan.findMany({
        where: { id: { in: spanIds } },
        select: { id: true, charStart: true },
      })
    : []
  const startOf = new Map(spans.map((s) => [s.id, s.charStart]))
  const emailStarts = lines.flatMap((c) => {
    if (c.file?.kind !== 'email') return []
    const at = startOf.get((c.fieldSpans as Record<string, string> | null)?.description ?? '')
    return at === null || at === undefined ? [] : [{ at, detail: c.sourceDetail }]
  })
  const inTable = (r: { start: number; end: number }) =>
    emailStarts.filter((s) => s.at >= r.start && s.at < r.end).length
  const textMarks = emailStarts
    .filter((s) => !regions.some((r) => r.kind === 'table' && s.at >= r.start && s.at < r.end))
    .map((s) => s.at)
  const blocks = blocksOf(text, regions, textMarks, inTable)
  const tables = regions.filter((r) => r.kind === 'table').length
  const terms = (batch?.terms ?? {}) as {
    neededBy?: { date: string; quote: string } | null
    clientRefHow?: string | null
    clientHow?: string | null
  }
  const pastEnquiries = batch?.clientCompany
    ? await opsDb.enquiry.count({ where: { clientId: batch.clientCompany.id } })
    : 0

  const units = [
    ...new Map(
      lines
        .filter((l) => l.uomRaw && l.uom && l.uomRaw.toUpperCase() !== l.uom.toUpperCase())
        .map((l) => [l.uomRaw!.toLowerCase(), `“${l.uomRaw!.toLowerCase()}” → ${l.uom}`])
    ).values(),
  ]
  const reply = regions.find((r) => r.kind === 'ignored')
  const replyDate = reply ? /^On\s+(\d{1,2}\s+[A-Za-z]{3})/m.exec(text.slice(reply.start, reply.end))?.[1] : null
  const unitsNote = [
    units.length ? `Units read as written: ${units.join(', ')}.` : null,
    reply ? `The quoted reply${replyDate ? ` from ${replyDate}` : ''} is not read.` : null,
  ]
    .filter(Boolean)
    .join(' ')
  const counts = countsOf(lines)
  return {
    folder,
    threadId,
    message: {
      id: m.id,
      subject: m.subject ?? '(no subject)',
      fromName: m.fromName,
      fromAddress: m.fromAddress,
      to: m.toAddresses.join(', '),
      sentAt: `${formatDate(m.sentAt, { year: 'always' })}, ${formatTime(m.sentAt)}`,
      attachments: m.attachments.map((a) => ({
        id: a.id,
        name: a.filename,
        type: typeOf(a.filename),
        size: sizeOf(a.sizeBytes),
      })),
    },
    batch: batch ? { id: batch.id } : null,
    blocks,
    sources: tables + (textMarks.length ? 1 : 0),
    textLines: textMarks.length,
    facts: {
      client: batch?.clientCompany
        ? {
            name: batch.clientCompany.name,
            sub: `${terms.clientHow ?? 'Known sender'} · ${pastEnquiries} past enquir${pastEnquiries === 1 ? 'y' : 'ies'}`,
          }
        : null,
      clientRef: batch?.clientRef
        ? { value: batch.clientRef, sub: terms.clientRefHow ?? 'Found in the message' }
        : null,
      neededBy: terms.neededBy
        ? {
            date: formatDate(`${terms.neededBy.date}T12:00:00Z`, { year: 'always' }),
            quote: terms.neededBy.quote,
          }
        : null,
    },
    lines: lines.map((l) => {
      const reasons = (l.reasons as string[] | null) ?? []
      const fromEmail = l.file?.kind === 'email'
      return {
        id: l.id,
        ord: l.ord,
        description: l.description,
        partNo: l.partNo,
        qty: l.qty?.toString() ?? null,
        uom: l.uom,
        source: fromEmail ? (l.sourceDetail === 'table' ? 'Table' : 'Text') : typeOf(l.file?.filename ?? ''),
        sourceTone: fromEmail ? (l.sourceDetail === 'table' ? 'info' : 'warn') : 'neutral',
        label: LABEL[l.confidence],
        tone: TONE[l.confidence],
        note: l.confidence === 'sure' ? null : (reasons[0] ?? null),
      }
    }),
    attachments: (batch?.files ?? [])
      .filter((f) => f.kind !== 'email')
      .map((f) => ({
        id: f.id,
        name: f.filename,
        ...(f.status === 'ready'
          ? { chip: 'Ready', tone: 'ok' as const, note: `${f.linesFound} line${f.linesFound === 1 ? '' : 's'} from it are merged here.` }
          : f.status === 'needs_attention'
            ? { chip: 'Needs attention', tone: 'bad' as const, note: f.failureNote ?? 'Not read.' }
            : f.status === 'extracting'
              ? { chip: 'Reading', tone: 'info' as const, note: 'Attachment added to the intake queue as its own file. Lines from it are merged here if any are found.' }
              : { chip: 'Queued', tone: 'info' as const, note: 'Attachment added to the intake queue as its own file. Lines from it are merged here if any are found.' }),
      })),
    unitsNote: unitsNote || null,
    lineCount: counts.total,
    toCheck: lines.filter((l) => l.confidence !== 'sure').length,
    // Board 36 continues with the lines as read (Unsure ones become questions), so only "nothing read" blocks.
    blocker: !batch ? 'Opening the intake…' : counts.total ? null : 'No lines were read from this email.',
    reading: (batch?.files ?? []).some((f) => f.status === 'queued' || f.status === 'extracting'),
  }
}
