import 'server-only'
import {
  canTransition,
  canTransitionLead,
  canTransitionLine,
  TransitionRefused,
  type EnquiryStage,
  type EnquiryTransitionContext,
  type LeadStage,
  type LeadTransitionContext,
  type LineStatus,
  type LineTransitionContext,
} from '@indus/ops-core'
import type { $Enums, Prisma } from '@indus/ops-db'
import { bumpCounters, recordCounterKey } from '../assistant/live-counter'
import { writeTracked } from '../assistant/write-tracked'

/**
 * The only code that writes `enquiry.stage`, `enquiry_line.status` and `lead.stage` (S09-T01; 10-architecture
 * §4.4). Each change asks the pure machine in ops-core first, writes with an optimistic version check when the
 * caller holds one, records one activity event through writeTracked, and bumps the record's live key.
 * `transition-writers.guard.test.ts` fails if any other file writes those fields.
 *
 * Every function takes the caller's transaction: the move commits or rolls back with the work that caused it.
 */

type Tx = Prisma.TransactionClient

export type Actor = { kind: $Enums.ActorKind; id?: string | null }

export class VersionConflict extends Error {
  constructor() {
    super('This record changed since you opened it.')
    this.name = 'VersionConflict'
  }
}

export { TransitionRefused }

export interface StageChange {
  enquiryId: string
  to: EnquiryStage
  ctx?: EnquiryTransitionContext
  actor: Actor
  actionId?: string | null
  /** Optimistic check: the version the person saw. */
  expectedVersion?: number
  note?: string | null
  /** Other columns that change with the stage (chosenPath, closedReason, regretReason …). */
  data?: Omit<Prisma.EnquiryUncheckedUpdateManyInput, 'stage' | 'stageChangedAt' | 'version'>
}

/** Moves an enquiry; returns the stage before. Throws TransitionRefused or VersionConflict. */
export async function changeEnquiryStage(tx: Tx, c: StageChange): Promise<EnquiryStage> {
  const e = await tx.enquiry.findUniqueOrThrow({
    where: { id: c.enquiryId },
    select: { ref: true, stage: true, version: true },
  })
  if (c.expectedVersion !== undefined && e.version !== c.expectedVersion)
    throw new VersionConflict()
  const from = e.stage as EnquiryStage
  const check = canTransition(from, c.to, c.ctx ?? {})
  if (!check.ok) throw new TransitionRefused(from, c.to, check.reason)
  await writeTracked(
    tx,
    {
      actor: c.actor,
      actionId: c.actionId ?? null,
      enquiryId: c.enquiryId,
      subjectType: 'enquiry',
      subjectId: c.enquiryId,
      changes: [{ field: 'stage', before: from, after: c.to, kind: 'status' }],
      note: c.note ?? null,
    },
    async (t) => {
      const { count } = await t.enquiry.updateMany({
        where: { id: c.enquiryId, version: e.version },
        data: { ...c.data, stage: c.to, stageChangedAt: new Date(), version: { increment: 1 } },
      })
      if (count === 0) throw new VersionConflict()
    }
  )
  await bumpCounters([recordCounterKey(e.ref)], 1, tx)
  return from
}

export interface LineChange {
  lineId: string
  to: LineStatus
  ctx?: LineTransitionContext
  actor: Actor
  actionId?: string | null
  expectedVersion?: number
  note?: string | null
  data?: Omit<Prisma.EnquiryLineUncheckedUpdateManyInput, 'status' | 'version'>
  /** The caller records the change itself (a revert, or a write with several fields): apply only. */
  untracked?: boolean
}

/** Moves a line; returns the status before. Throws TransitionRefused or VersionConflict. */
export async function changeLineStatus(tx: Tx, c: LineChange): Promise<LineStatus> {
  const l = await tx.enquiryLine.findUniqueOrThrow({
    where: { id: c.lineId },
    select: { status: true, version: true, enquiryId: true, enquiry: { select: { ref: true } } },
  })
  if (c.expectedVersion !== undefined && l.version !== c.expectedVersion)
    throw new VersionConflict()
  const from = l.status as LineStatus
  const check = canTransitionLine(from, c.to, {
    ...c.ctx,
    heldReason:
      c.ctx?.heldReason ?? (typeof c.data?.heldReason === 'string' ? c.data.heldReason : null),
    notQuotedReason:
      c.ctx?.notQuotedReason ??
      (typeof c.data?.notQuotedReason === 'string' ? c.data.notQuotedReason : null),
    regretReason:
      c.ctx?.regretReason ??
      ((typeof c.data?.regretReason === 'string' ? c.data.regretReason : null) as never),
  })
  if (!check.ok) throw new TransitionRefused(from, c.to, check.reason)
  const apply = async (t: Tx) => {
    const { count } = await t.enquiryLine.updateMany({
      where: { id: c.lineId, version: l.version },
      data: { ...c.data, status: c.to, version: { increment: 1 } },
    })
    if (count === 0) throw new VersionConflict()
  }
  if (c.untracked) await apply(tx)
  else
    await writeTracked(
      tx,
      {
        actor: c.actor,
        actionId: c.actionId ?? null,
        enquiryId: l.enquiryId,
        subjectType: 'enquiry_line',
        subjectId: c.lineId,
        changes: [{ field: 'status', before: from, after: c.to, kind: 'status' }],
        note: c.note ?? null,
      },
      apply
    )
  await bumpCounters([recordCounterKey(l.enquiry.ref)], 1, tx)
  return from
}

/** Moves several lines of one enquiry to the same status (a question holds them, a regret ends them). */
export async function changeLinesStatus(
  tx: Tx,
  lineIds: readonly string[],
  c: Omit<LineChange, 'lineId'>
): Promise<LineStatus[]> {
  const out: LineStatus[] = []
  for (const lineId of lineIds) out.push(await changeLineStatus(tx, { ...c, lineId }))
  return out
}

export interface LeadChange {
  leadId: string
  to: LeadStage
  ctx?: LeadTransitionContext
  actor: Actor
  expectedVersion?: number
  note?: string | null
  data?: Omit<Prisma.LeadUncheckedUpdateManyInput, 'stage' | 'version'>
}

export async function changeLeadStage(tx: Tx, c: LeadChange): Promise<LeadStage> {
  const l = await tx.lead.findUniqueOrThrow({
    where: { id: c.leadId },
    select: { stage: true, version: true },
  })
  if (c.expectedVersion !== undefined && l.version !== c.expectedVersion)
    throw new VersionConflict()
  const from = l.stage as LeadStage
  const check = canTransitionLead(from, c.to, c.ctx ?? {})
  if (!check.ok) throw new TransitionRefused(from, c.to, check.reason)
  await writeTracked(
    tx,
    {
      actor: c.actor,
      subjectType: 'lead',
      subjectId: c.leadId,
      changes: [{ field: 'stage', before: from, after: c.to, kind: 'status' }],
      note: c.note ?? null,
    },
    async (t) => {
      const { count } = await t.lead.updateMany({
        where: { id: c.leadId, version: l.version },
        data: { ...c.data, stage: c.to, version: { increment: 1 } },
      })
      if (count === 0) throw new VersionConflict()
    }
  )
  return from
}
