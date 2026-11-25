import 'server-only'
import { randomUUID } from 'node:crypto'
import { descriptionSimilarity, findDuplicates, parseQuantity, partNoNorm } from '@indus/ops-core'
import { opsDb, Prisma, type $Enums } from '@indus/ops-db'
import sharp from 'sharp'
import { SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'
import { OPS_BUCKETS } from '../storage/buckets'
import { getStorage } from '../storage/storage'
import { bumpIntake } from './live'
import { readStoredBytes } from './parse/index'
import { TX_OPTIONS } from '../../lib/tx-options'

/**
 * Board 15 and board 17 decisions (S08-T04). Every change a person makes to a staged line is theirs: decision
 * `edited` or `accepted`, `decidedById`, a version bump, and an activity row ("Decided by KB") with the span the
 * value stood on. Unsure values are only ever written by a person's answer. Nothing here touches enquiry_line:
 * confirmation hands the accepted lines to the enquiry step (server/enquiry/from-batch.ts).
 */
type Tx = Prisma.TransactionClient
export interface Person {
  id: string
  name: string
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return (
    ((parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '')).toUpperCase() ||
    '?'
  )
}

const CANDIDATE_SELECT = {
  id: true,
  batchId: true,
  fileId: true,
  ord: true,
  description: true,
  qty: true,
  qtyPrinted: true,
  uom: true,
  partNo: true,
  partNoNorm: true,
  confidence: true,
  reasons: true,
  unsure: true,
  decision: true,
  notes: true,
  duplicateOfId: true,
  fieldSpans: true,
  version: true,
  batch: { select: { status: true, clientCompanyId: true } },
  file: { select: { storedFile: { select: { bucket: true, path: true, mimeType: true } } } },
} as const

async function load(tx: Tx, id: string, version?: number) {
  const c = await tx.intakeLineCandidate.findUnique({ where: { id }, select: CANDIDATE_SELECT })
  if (!c) throw new SafeError('That line is no longer in the review.')
  if (c.batch.status !== 'open') throw new SafeError('These lines are already confirmed.')
  if (version !== undefined && c.version !== version)
    throw new SafeError('Someone changed this line a moment ago. The page shows the latest.')
  return c
}

function subjectOf(c: { fileId: string | null; batchId: string }) {
  return { subjectType: 'intake_file' as const, subjectId: c.fileId ?? c.batchId }
}

const decided = (p: Person) => ({
  decidedById: p.id,
  decidedAt: new Date(),
  version: { increment: 1 },
})

/** Marks repeats within a batch (same part, descriptions ≥ 0.9 alike). Pending lines only; decisions stand. */
export async function detectDuplicates(tx: Tx, batchId: string): Promise<number> {
  const lines = await tx.intakeLineCandidate.findMany({
    where: { batchId, decision: { not: 'removed' } },
    orderBy: { ord: 'asc' },
    select: { id: true, partNoNorm: true, description: true, decision: true, duplicateOfId: true },
  })
  const dupes = findDuplicates(lines)
  let n = 0
  for (const [dup, of] of dupes) {
    const row = lines.find((l) => l.id === dup)!
    if (row.decision !== 'pending' || row.duplicateOfId === of) continue
    await tx.intakeLineCandidate.update({ where: { id: dup }, data: { duplicateOfId: of } })
    n += 1
  }
  return n
}

export interface LineEdit {
  id: string
  version: number
  description?: string | undefined
  partNo?: string | undefined
  qty?: string | undefined
  uom?: string | undefined
}

/** An inline edit on board 15 (part number, quantity, description, unit): the line becomes the person's. */
export async function updateCandidate(
  p: Person,
  e: LineEdit
): Promise<{ id: string; version: number }> {
  return opsDb.$transaction(async (tx) => {
    const c = await load(tx, e.id, e.version)
    const data: Prisma.IntakeLineCandidateUpdateInput = {}
    const changes: Array<{ field: string; before: unknown; after: unknown }> = []
    if (e.description !== undefined && e.description.trim() !== c.description) {
      const v = e.description.trim()
      if (!v) throw new SafeError('A line needs a description.')
      data.description = v
      changes.push({ field: 'description', before: c.description, after: v })
    }
    if (e.partNo !== undefined && (e.partNo.trim() || null) !== c.partNo) {
      const v = e.partNo.trim() || null
      data.partNo = v
      data.partNoNorm = partNoNorm(v) || null
      data.part = { disconnect: true }
      data.partMatch = v ? 'person' : null
      changes.push({ field: 'partNo', before: c.partNo, after: v })
    }
    if (e.qty !== undefined) {
      const q = parseQuantity(e.qty, 'dot')
      if (q.value === null) throw new SafeError('Type the quantity as a number, e.g. 12 or 2.5.')
      const before = c.qty?.toString() ?? null
      if (before === null || Number(before) !== q.value) {
        data.qty = new Prisma.Decimal(q.value)
        changes.push({ field: 'qty', before, after: String(q.value) })
      }
    }
    if (e.uom !== undefined && (e.uom.trim().toUpperCase() || null) !== c.uom) {
      const v = e.uom.trim().toUpperCase() || null
      data.uom = v
      data.uomMethod = 'person'
      changes.push({ field: 'uom', before: c.uom, after: v })
    }
    if (!changes.length) return { id: c.id, version: c.version }
    const who = initials(p.name)
    const out = await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: p.id },
        ...subjectOf(c),
        changes: changes.map((x) => ({
          ...x,
          field: `line ${c.ord} ${x.field}`,
          kind: 'quantity' as const,
        })),
        note: `Decided by ${who}`,
      },
      (t) =>
        t.intakeLineCandidate.update({
          where: { id: c.id },
          data: {
            ...data,
            decision: 'edited',
            ...(changes.some((x) => x.field === (c.unsure as { field?: string } | null)?.field)
              ? { unsure: Prisma.JsonNull }
              : {}),
            reasons: [
              ...((c.reasons as string[] | null) ?? []),
              `Decided by ${who}`,
            ] as Prisma.InputJsonValue,
            ...decided(p),
          },
          select: { id: true, version: true },
        })
    )
    await bumpIntake(c.batchId, tx)
    return out
  }, TX_OPTIONS)
}

/**
 * An open question on a line. Prisma's JsonNull marker is matched by class identity and can mismatch under next dev,
 * storing `{}` instead of NULL; only an object with a question counts.
 */
export function hasQuestion(u: unknown): boolean {
  return !!u && typeof u === 'object' && typeof (u as { question?: unknown }).question === 'string'
}

/** A Check line confirmed as read. Never an Unsure one: that needs an answer. */
export async function confirmCandidate(p: Person, id: string, version: number): Promise<void> {
  await opsDb.$transaction(async (tx) => {
    const c = await load(tx, id, version)
    if (c.confidence === 'unsure' && hasQuestion(c.unsure))
      throw new SafeError('Answer the question on this line first.')
    if (c.duplicateOfId) throw new SafeError('Merge or keep this duplicate first.')
    await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: p.id },
        ...subjectOf(c),
        changes: [
          {
            field: `line ${c.ord} decision`,
            before: c.decision,
            after: 'accepted',
            kind: 'decision',
          },
        ],
        note: `Decided by ${initials(p.name)}`,
      },
      (t) =>
        t.intakeLineCandidate.update({
          where: { id },
          data: { decision: 'accepted', ...decided(p) },
        })
    )
    await bumpIntake(c.batchId, tx)
  }, TX_OPTIONS)
}

/** "Accept all high": Sure, pending, not a duplicate. Never a Check or Low line. */
export async function acceptAllHigh(p: Person, batchId: string): Promise<{ accepted: number }> {
  return opsDb.$transaction(async (tx) => {
    const b = await tx.intakeBatch.findUnique({ where: { id: batchId }, select: { status: true } })
    if (!b || b.status !== 'open') throw new SafeError('These lines are already confirmed.')
    const r = await tx.intakeLineCandidate.updateMany({
      where: { batchId, confidence: 'sure', decision: 'pending', duplicateOfId: null },
      data: {
        decision: 'accepted',
        decidedById: p.id,
        decidedAt: new Date(),
        version: { increment: 1 },
      },
    })
    if (r.count)
      await writeTracked(
        tx,
        {
          actor: { kind: 'user', id: p.id },
          subjectType: 'intake_file',
          subjectId: batchId,
          changes: [{ field: 'lines accepted', before: 0, after: r.count, kind: 'decision' }],
          note: `Accepted all high · decided by ${initials(p.name)}`,
        },
        async () => undefined
      )
    await bumpIntake(batchId, tx)
    return { accepted: r.count }
  }, TX_OPTIONS)
}

/**
 * An Unsure line answered (board 15 resolver, board 17 handwriting): the chosen value is written as the person's,
 * the question is cleared, the choice is logged with the span it was read from and kept as a preference signal for
 * the learner (S07). "Type it" sends the typed value through here too.
 */
export async function resolveUnsure(
  p: Person,
  i: {
    id: string
    version: number
    value: string
    via: 'option' | 'typed' | 'handwriting'
    choice?: 'printed' | 'handwritten' | undefined
  }
): Promise<{ cropFileId: string | null }> {
  const pre = await opsDb.intakeLineCandidate.findUnique({
    where: { id: i.id },
    select: CANDIDATE_SELECT,
  })
  if (!pre) throw new SafeError('That line is no longer in the review.')
  const u = (pre.unsure as { field?: string; options?: Array<{ value: string }> } | null) ?? null
  const field = u?.field ?? 'qty'
  // A handwriting choice keeps the page as evidence: an image source is cropped server-side before the transaction.
  const cropFileId =
    i.via === 'handwriting'
      ? await storePageCrop(pre.file?.storedFile ?? null, pre.batchId, p.id)
      : null
  await opsDb.$transaction(async (tx) => {
    const c = await load(tx, i.id, i.version)
    const v = i.value.trim()
    if (!v) throw new SafeError('Choose or type a value.')
    const data: Prisma.IntakeLineCandidateUpdateInput = {}
    let before: unknown
    if (field === 'qty' || field === 'quantity') {
      const q = parseQuantity(v, 'dot')
      if (q.value === null) throw new SafeError('Type the quantity as a number, e.g. 12 or 2.5.')
      before = c.qty?.toString() ?? null
      data.qty = new Prisma.Decimal(q.value)
    } else if (field === 'partNumber' || field === 'part' || field === 'part_number') {
      before = c.partNo
      data.partNo = v
      data.partNoNorm = partNoNorm(v) || null
      data.partMatch = 'person'
      data.part = { disconnect: true }
    } else if (field === 'uom' || field === 'unit') {
      before = c.uom
      data.uom = v.toUpperCase()
      data.uomMethod = 'person'
    } else if (field === 'reference') {
      // "Which earlier order?" (board 36): the person names it; it travels with the line as a note.
      before = c.notes
      data.notes = [c.notes, `Same as ${v}`].filter(Boolean).join(' · ')
    } else {
      before = c.description
      data.description = v
    }
    const who = initials(p.name)
    const span =
      (c.fieldSpans as Record<string, string> | null)?.[field === 'quantity' ? 'qty' : field] ??
      null
    await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: p.id },
        ...subjectOf(c),
        changes: [{ field: `line ${c.ord} ${field}`, before, after: v, kind: 'quantity' }],
        note: `Decided by ${who}${i.choice ? ` · ${i.choice}` : ''}${span ? ` · span ${span}` : ''}${cropFileId ? ` · page crop ${cropFileId}` : ''}`,
      },
      (t) =>
        t.intakeLineCandidate.update({
          where: { id: c.id },
          data: {
            ...data,
            unsure: Prisma.JsonNull,
            decision: 'edited',
            reasons: [
              ...((c.reasons as string[] | null) ?? []),
              `Decided by ${who}`,
            ] as Prisma.InputJsonValue,
            ...decided(p),
          },
        })
    )
    await tx.preferenceSignal.create({
      data: {
        kind: 'unsure_choice',
        actionKey: 'extract_lines',
        companyId: c.batch.clientCompanyId,
        createdById: p.id,
        payload: {
          field,
          chosen: v,
          via: i.via,
          options: (u?.options ?? []).map((o) => o.value),
        } as Prisma.InputJsonValue,
      },
    })
    await bumpIntake(c.batchId, tx)
  }, TX_OPTIONS)
  return { cropFileId }
}

/** The page, downsized, kept as the evidence of a handwriting choice. Images only: a PDF page is not rasterised here. */
async function storePageCrop(
  file: { bucket: string; path: string; mimeType: string } | null,
  batchId: string,
  userId: string
): Promise<string | null> {
  if (!file || !file.mimeType.startsWith('image/')) return null
  const bytes = await readStoredBytes(file)
  if (!bytes) return null
  const crop = await sharp(bytes)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer()
  const key = `intake/${batchId}/${randomUUID()}.jpg`
  await getStorage().upload(OPS_BUCKETS.uploads, key, crop, 'image/jpeg')
  const { createHash } = await import('node:crypto')
  const row = await opsDb.storedFile.create({
    data: {
      bucket: OPS_BUCKETS.uploads,
      path: key,
      filename: 'Page crop.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: crop.length,
      sha256: createHash('sha256').update(crop).digest('hex'),
      source: 'generated',
      uploadedById: userId,
    },
    select: { id: true },
  })
  return row.id
}

export type MergeMode = 'keep' | 'sum' | 'both'

/** Board 17 duplicates: keep one line (the first's quantity), sum into one line, or keep both as separate lines. */
export async function mergeDuplicates(p: Person, dupId: string, mode: MergeMode): Promise<void> {
  await opsDb.$transaction(async (tx) => {
    const dup = await load(tx, dupId)
    if (!dup.duplicateOfId) throw new SafeError('That line is not marked as a duplicate.')
    const first = await load(tx, dup.duplicateOfId)
    const who = initials(p.name)
    const note = `Decided by ${who} · ${mode === 'keep' ? 'merged, kept one' : mode === 'sum' ? 'merged, quantities summed' : 'kept both'}`
    await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: p.id },
        ...subjectOf(dup),
        changes: [
          {
            field: `line ${dup.ord} duplicate of line ${first.ord}`,
            before: 'duplicate',
            after: mode,
            kind: 'decision',
          },
        ],
        note,
      },
      async (t) => {
        if (mode === 'both') {
          await t.intakeLineCandidate.update({
            where: { id: dup.id },
            data: { duplicateOfId: null, version: { increment: 1 } },
          })
          return
        }
        await t.intakeLineCandidate.update({
          where: { id: dup.id },
          data: { decision: 'merged', ...decided(p) },
        })
        const sum = mode === 'sum' && first.qty && dup.qty ? first.qty.plus(dup.qty) : null
        await t.intakeLineCandidate.update({
          where: { id: first.id },
          data: {
            ...(sum ? { qty: sum } : {}),
            decision: hasQuestion(first.unsure) ? first.decision : sum ? 'edited' : 'accepted',
            ...decided(p),
          },
        })
      }
    )
    await bumpIntake(dup.batchId, tx)
  }, TX_OPTIONS)
}

/** Takes a line out (it was not asked for). */
export async function removeCandidate(p: Person, id: string, version: number): Promise<void> {
  await opsDb.$transaction(async (tx) => {
    const c = await load(tx, id, version)
    await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: p.id },
        ...subjectOf(c),
        changes: [
          {
            field: `line ${c.ord} decision`,
            before: c.decision,
            after: 'removed',
            kind: 'decision',
          },
        ],
        note: `Removed by ${initials(p.name)}`,
      },
      (t) =>
        t.intakeLineCandidate.update({
          where: { id },
          data: {
            decision: 'removed',
            unsure: Prisma.JsonNull,
            duplicateOfId: null,
            ...decided(p),
          },
        })
    )
    // A line others repeated stops being their original.
    await tx.intakeLineCandidate.updateMany({
      where: { duplicateOfId: id },
      data: { duplicateOfId: null },
    })
    await bumpIntake(c.batchId, tx)
  }, TX_OPTIONS)
}

/** Board 17 "Enter lines manually": a blank line the person fills in; it is theirs from the start. */
export async function addManualLine(
  p: Person,
  batchId: string,
  fileId: string | null
): Promise<{ id: string }> {
  return opsDb.$transaction(async (tx) => {
    const b = await tx.intakeBatch.findUnique({ where: { id: batchId }, select: { status: true } })
    if (!b || b.status !== 'open') throw new SafeError('These lines are already confirmed.')
    const last = await tx.intakeLineCandidate.aggregate({
      where: { batchId },
      _max: { ord: true },
    })
    const row = await tx.intakeLineCandidate.create({
      data: {
        batchId,
        fileId,
        ord: (last._max.ord ?? 0) + 1,
        description: '',
        uom: 'EA',
        uomMethod: 'person',
        confidence: 'sure',
        decision: 'edited',
        sourceKind: 'manual',
        reasons: [`Typed by ${initials(p.name)}`] as Prisma.InputJsonValue,
        decidedById: p.id,
        decidedAt: new Date(),
      },
      select: { id: true },
    })
    await bumpIntake(batchId, tx)
    return row
  }, TX_OPTIONS)
}

export interface RevisionHit {
  enquiryId: string
  enquiryRef: string
  clientName: string | null
  clientRef: string | null
  reason: 'client_ref' | 'lines'
  matched: number
  total: number
  added: number
  changes: Array<{ ord: number; description: string; from: string; to: string }>
}

/**
 * Board 17 "Revision detected": the batch's client reference matches an open enquiry's, or at least 80 % of its
 * part numbers appear on one open enquiry of the same client. Reads only; the person decides.
 */
export async function detectRevision(batchId: string): Promise<RevisionHit | null> {
  const b = await opsDb.intakeBatch.findUnique({
    where: { id: batchId },
    select: {
      clientRef: true,
      clientCompanyId: true,
      revisionIntent: true,
      candidates: {
        where: { decision: { notIn: ['removed', 'merged'] } },
        select: { ord: true, description: true, partNoNorm: true, qty: true },
      },
    },
  })
  if (!b || !b.candidates.length) return null
  const open = {
    closedAt: null,
    stage: { notIn: ['won', 'lost', 'regretted', 'closed'] as $Enums.EnquiryStage[] },
  }
  const enquiries = await opsDb.enquiry.findMany({
    where: {
      ...open,
      OR: [
        ...(b.clientRef ? [{ clientRef: b.clientRef }] : []),
        ...(b.clientCompanyId ? [{ clientId: b.clientCompanyId }] : []),
      ],
    },
    orderBy: { receivedAt: 'desc' },
    take: 20,
    select: {
      id: true,
      ref: true,
      clientRef: true,
      client: { select: { name: true } },
      lines: {
        select: {
          no: true,
          clientPartNo: true,
          description: true,
          qty: true,
          part: { select: { partNoNorm: true } },
        },
      },
    },
  })
  const norms = b.candidates.map((c) => c.partNoNorm).filter((n): n is string => !!n)
  for (const e of enquiries) {
    const theirs = new Map(
      e.lines
        .map((l) => [l.part?.partNoNorm ?? partNoNorm(l.clientPartNo), l] as const)
        .filter(([n]) => !!n)
    )
    const matched = norms.filter((n) => theirs.has(n)).length
    const byRef = !!b.clientRef && e.clientRef === b.clientRef
    const byLines = norms.length > 0 && matched / norms.length >= 0.8
    if (!byRef && !byLines) continue
    const changes = b.candidates.flatMap((c) => {
      const l = c.partNoNorm
        ? theirs.get(c.partNoNorm)
        : e.lines.find((x) => descriptionSimilarity(x.description, c.description) >= 0.9)
      if (!l || !c.qty || l.qty.equals(c.qty)) return []
      return [
        { ord: c.ord, description: c.description, from: l.qty.toString(), to: c.qty.toString() },
      ]
    })
    return {
      enquiryId: e.id,
      enquiryRef: e.ref,
      clientName: e.client?.name ?? null,
      clientRef: e.clientRef,
      reason: byRef ? 'client_ref' : 'lines',
      matched,
      total: b.candidates.length,
      added: norms.filter((n) => !theirs.has(n)).length,
      changes,
    }
  }
  return null
}

/** Records the person's choice on a detected revision: revision handling itself arrives with S23. */
export async function recordRevisionIntent(
  p: Person,
  batchId: string,
  intent: 'revision' | 'new',
  hit: RevisionHit | null
): Promise<void> {
  await opsDb.$transaction(async (tx) => {
    await writeTracked(
      tx,
      {
        actor: { kind: 'user', id: p.id },
        subjectType: 'intake_file',
        subjectId: batchId,
        changes: [{ field: 'revision intent', before: null, after: intent, kind: 'decision' }],
        note:
          intent === 'revision'
            ? `Marked as a revision of ${hit?.enquiryRef ?? 'an enquiry'}`
            : 'Treated as a new enquiry',
      },
      (t) =>
        t.intakeBatch.update({
          where: { id: batchId },
          data: {
            revisionIntent: {
              kind: intent,
              enquiryId: hit?.enquiryId ?? null,
              ref: hit?.enquiryRef ?? null,
              by: p.id,
              at: new Date().toISOString(),
            } as Prisma.InputJsonValue,
            version: { increment: 1 },
          },
        })
    )
    await bumpIntake(batchId, tx)
  }, TX_OPTIONS)
}

export interface ReviewCounts {
  total: number
  confirmed: number
  toCheck: number
  duplicates: number
  unsure: number
}

export function countsOf(
  lines: ReadonlyArray<{
    decision: string
    confidence: string
    duplicateOfId: string | null
    unsure: unknown
  }>
): ReviewCounts {
  const live = lines.filter((l) => l.decision !== 'removed' && l.decision !== 'merged')
  const pending = live.filter((l) => l.decision === 'pending')
  return {
    total: live.length,
    confirmed: live.length - pending.length,
    toCheck: pending.filter((l) => !l.duplicateOfId && l.confidence !== 'sure').length,
    duplicates: pending.filter((l) => !!l.duplicateOfId).length,
    unsure: live.filter((l) => l.confidence === 'unsure' && hasQuestion(l.unsure)).length,
  }
}

/** Why "Continue" is not allowed yet, or null. */
export function continueBlocker(c: ReviewCounts): string | null {
  if (!c.total) return 'There are no lines to confirm.'
  if (c.unsure)
    return `${c.unsure} line${c.unsure === 1 ? '' : 's'} still ${c.unsure === 1 ? 'needs' : 'need'} an answer.`
  if (c.duplicates)
    return `${c.duplicates} duplicate${c.duplicates === 1 ? '' : 's'} to merge or keep.`
  if (c.confirmed < c.total)
    return `${c.total - c.confirmed} line${c.total - c.confirmed === 1 ? '' : 's'} still to confirm.`
  return null
}

/**
 * Freezes the review: every line decided, no Unsure, no duplicate left. Writes nothing to enquiry_line; the caller
 * creates the enquiry (S08-T06 createEnquiryFromBatch) in the same transaction.
 */
export async function assertConfirmable(
  tx: Tx,
  batchId: string,
  opts: { lines?: boolean } = {}
): Promise<void> {
  const b = await tx.intakeBatch.findUnique({
    where: { id: batchId },
    select: {
      status: true,
      files: { where: { status: { in: ['queued', 'extracting'] } }, select: { id: true } },
    },
  })
  if (!b) throw new SafeError('That intake no longer exists.')
  if (b.status !== 'open') throw new SafeError('These lines are already confirmed.')
  if (b.files.length) throw new SafeError('A file is still being read. Wait for it, or remove it.')
  // Board 36 continues with Sure and Likely lines as read; Unsure lines become question cards (S08-T06).
  if (opts.lines === false) return
  const lines = await tx.intakeLineCandidate.findMany({
    where: { batchId },
    select: { decision: true, confidence: true, duplicateOfId: true, unsure: true },
  })
  const why = continueBlocker(countsOf(lines))
  if (why) throw new SafeError(why)
}

/** The batch a line belongs to, for revalidating its page ('' when it is gone). */
export async function batchOfCandidate(candidateId: string): Promise<string> {
  const c = await opsDb.intakeLineCandidate.findUnique({
    where: { id: candidateId },
    select: { batchId: true },
  })
  return c?.batchId ?? ''
}

/** Board 17 "Ask client for original": only an intake that came by mail has a thread to reply in. */
export async function requestOriginalTarget(fileId: string): Promise<{
  id: string
  batchId: string
  failureKind: string | null
  enquiryId: string | null
}> {
  const f = await opsDb.intakeFile.findUnique({
    where: { id: fileId },
    select: {
      id: true,
      batchId: true,
      failureKind: true,
      batch: { select: { mailMessageId: true, enquiryId: true } },
    },
  })
  if (!f) throw new SafeError('That file is no longer in the intake.')
  if (!f.batch.mailMessageId)
    throw new SafeError('This file was uploaded, not emailed: there is no thread to reply in.')
  return { id: f.id, batchId: f.batchId, failureKind: f.failureKind, enquiryId: f.batch.enquiryId }
}
