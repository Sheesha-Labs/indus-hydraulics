import 'server-only'
import type { Tone, BarTone } from '@indus/ops-ui/types'
import { opsDb, type $Enums } from '@indus/ops-db'

/**
 * Board 14 reads (S08-T03): the processing queue of a batch, or of every open batch, with the "Intake n" count for
 * the header tabs. Two round trips: one read transaction (batches with their files, the count), then the
 * uploaders' names.
 */
export interface QueueRow {
  id: string
  batchId: string
  name: string
  meta: string
  status: $Enums.IntakeFileStatus
  chip: { label: string; tone: Tone }
  bar: { pct: number; tone: BarTone }
  result: string
  action: 'review' | 'map' | 'cancel' | 'remove' | 'reupload' | 'none'
  href: string | null
}

export interface QueueBatch {
  id: string
  uploadedBy: string
  at: string
  rows: QueueRow[]
}

const TYPE: Record<string, string> = {
  pdf: 'PDF',
  jpg: 'JPEG',
  jpeg: 'JPEG',
  png: 'PNG',
  webp: 'WEBP',
  heic: 'HEIC',
  xlsx: 'XLSX',
  xlsm: 'XLSM',
  xls: 'XLS',
  csv: 'CSV',
  docx: 'DOCX',
  zip: 'ZIP',
}

export function bytesText(n: number | null): string | null {
  if (!n) return null
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

interface FileRow {
  id: string
  batchId: string
  filename: string
  kind: string
  status: $Enums.IntakeFileStatus
  progressPct: number
  progressNote: string | null
  pageCount: number | null
  sizeBytes: number | null
  failureKind: string | null
  failureNote: string | null
  linesFound: number
  linesToCheck: number
  /** A spreadsheet's working mapping (board 35); absent in older callers. */
  sheetMap?: unknown
}

export function queueRowOf(f: FileRow): QueueRow {
  const ext = /\.([a-z0-9]+)$/i.exec(f.filename)?.[1]?.toLowerCase() ?? ''
  const type =
    f.kind === 'paste'
      ? 'Email text'
      : f.kind === 'email'
        ? 'Email body'
        : (TYPE[ext] ?? ext.toUpperCase())
  const pages =
    f.kind === 'pdf' && f.pageCount ? `${f.pageCount} page${f.pageCount === 1 ? '' : 's'}` : null
  const size = bytesText(f.sizeBytes)
  const meta = [
    type,
    f.status === 'needs_attention' && f.failureNote && f.failureNote !== f.progressNote
      ? f.failureNote
      : pages,
    f.status === 'needs_attention' && f.failureNote ? null : size,
  ]
    .filter(Boolean)
    .join(' · ')
  const base = {
    id: f.id,
    batchId: f.batchId,
    name: f.filename,
    meta,
    status: f.status,
    href: null as string | null,
  }
  switch (f.status) {
    case 'ready':
      // A spreadsheet waits on its column mapping (board 35) before its lines are reviewed.
      if (f.kind === 'sheet' && f.sheetMap && !(f.sheetMap as { confirmedAt?: string | null }).confirmedAt)
        return {
          ...base,
          chip: { label: 'Columns to map', tone: 'warn' },
          bar: { pct: 100, tone: 'navy' },
          result: `${f.linesFound} line${f.linesFound === 1 ? '' : 's'} found · check the columns`,
          action: 'map',
          href: `/enquiries/intake/${f.batchId}/map?file=${f.id}`,
        }
      return {
        ...base,
        chip: { label: 'Ready to review', tone: 'ok' },
        bar: { pct: 100, tone: 'navy' },
        result:
          f.kind === 'zip'
            ? (f.progressNote ?? 'Expanded')
            : `${f.linesFound} line${f.linesFound === 1 ? '' : 's'} extracted · ${f.linesToCheck} to check`,
        action: f.kind === 'zip' ? 'none' : 'review',
        href: f.kind === 'zip' ? null : `/enquiries/intake/${f.batchId}`,
      }
    case 'extracting':
      return {
        ...base,
        chip: { label: 'Extracting', tone: 'acc' },
        bar: { pct: Math.max(5, f.progressPct), tone: 'acc' },
        result: f.progressNote ?? 'Detecting layout',
        action: 'cancel',
      }
    case 'queued':
      return {
        ...base,
        chip: { label: 'Queued', tone: 'n' },
        bar: { pct: 0, tone: 'acc' },
        result: 'Waiting',
        action: 'remove',
      }
    case 'needs_attention':
      return {
        ...base,
        chip: { label: 'Needs attention', tone: 'bad' },
        bar: { pct: 100, tone: 'bad' },
        result: f.progressNote ?? 'Could not be read',
        action: 'reupload',
      }
    case 'cancelled':
      return {
        ...base,
        chip: { label: 'Cancelled', tone: 'n' },
        bar: { pct: 0, tone: 'acc' },
        result: 'Stopped before any line was read',
        action: 'remove',
      }
    default:
      return {
        ...base,
        chip: { label: 'Removed', tone: 'n' },
        bar: { pct: 0, tone: 'acc' },
        result: 'Removed',
        action: 'none',
      }
  }
}

const FILE_SELECT = {
  id: true,
  batchId: true,
  filename: true,
  kind: true,
  status: true,
  progressPct: true,
  progressNote: true,
  pageCount: true,
  sizeBytes: true,
  failureKind: true,
  failureNote: true,
  linesFound: true,
  linesToCheck: true,
  sheetMap: true,
} as const

const OPEN_FILE = {
  status: { not: 'removed' as $Enums.IntakeFileStatus },
  parentFileId: null,
} as const

function clock(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
}

/** "Intake n": files in open batches that are not removed (the header tab count). */
export async function intakeCount(): Promise<number> {
  return opsDb.intakeFile.count({ where: { ...OPEN_FILE, batch: { status: 'open' } } })
}

async function namesOf(ids: readonly (string | null)[]): Promise<Map<string, string>> {
  const want = [...new Set(ids.filter((x): x is string => !!x))]
  if (!want.length) return new Map()
  const users = await opsDb.user.findMany({
    where: { id: { in: want } },
    select: { id: true, name: true },
  })
  return new Map(users.map((u) => [u.id, u.name.split(/\s+/)[0] ?? u.name]))
}

export async function getQueue(opts: {
  batchId?: string | null
}): Promise<{ batches: QueueBatch[]; intakeCount: number }> {
  const where = opts.batchId
    ? { id: opts.batchId }
    : { status: 'open' as $Enums.IntakeBatchStatus, files: { some: OPEN_FILE } }
  const [batches, count] = await opsDb.$transaction([
    opsDb.intakeBatch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        createdById: true,
        source: true,
        files: { where: OPEN_FILE, orderBy: { createdAt: 'asc' }, select: FILE_SELECT },
      },
    }),
    opsDb.intakeFile.count({ where: { ...OPEN_FILE, batch: { status: 'open' } } }),
  ])
  const names = await namesOf(batches.map((b) => b.createdById))
  return {
    intakeCount: count,
    batches: batches.map((b) => ({
      id: b.id,
      uploadedBy: b.createdById
        ? (names.get(b.createdById) ?? 'someone')
        : b.source === 'mail'
          ? 'the Assistant'
          : 'someone',
      at: clock(b.createdAt),
      rows: b.files.map(queueRowOf),
    })),
  }
}

/**
 * Board 92 manual card: the clients to pick from (name order, the first 300) and what is already on the batch.
 * One read each, in one transaction.
 */
export async function getManualEnquiry(batchId: string | null): Promise<{
  clients: Array<{ id: string; name: string }>
  facts: { clientCompanyId: string | null; clientRef: string | null; deadline: string | null }
  hasFiles: boolean
}> {
  const [clients, batch] = await opsDb.$transaction([
    // The Client picker: live companies that can be a client (never archived, merged or supplier-only).
    opsDb.company.findMany({
      where: {
        archivedAt: null,
        mergedIntoId: null,
        OR: [{ isClient: true }, { isSupplier: false }],
      },
      orderBy: { name: 'asc' },
      take: 300,
      select: { id: true, name: true },
    }),
    opsDb.intakeBatch.findMany({
      where: { id: batchId ?? '00000000-0000-0000-0000-000000000000' },
      take: 1,
      select: {
        clientCompanyId: true,
        clientRef: true,
        deadline: true,
        _count: { select: { files: true } },
      },
    }),
  ])
  const b = batch[0]
  return {
    clients,
    facts: {
      clientCompanyId: b?.clientCompanyId ?? null,
      clientRef: b?.clientRef ?? null,
      deadline: b?.deadline
        ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai' }).format(b.deadline)
        : null,
    },
    hasFiles: (b?._count.files ?? 0) > 0,
  }
}
