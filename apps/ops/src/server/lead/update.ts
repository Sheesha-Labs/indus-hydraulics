import 'server-only'
import type { LeadStage } from '@indus/ops-core'
import type { Prisma } from '@indus/ops-db'
import type { OpsUser } from '../../lib/access'
import { SAFE_MESSAGES, SafeError } from '../../lib/safe-message'
import { writeTracked } from '../assistant/write-tracked'
import { changeLeadStage, TransitionRefused, VersionConflict } from '../enquiry/transition'

/**
 * Board 22 edits (S09-T05): a line's spec note, the lead's notes and its stage. Each is version-checked and
 * logged; the stage goes through the lead machine.
 */
type Tx = Prisma.TransactionClient

export async function updateLeadLineSpec(
  tx: Tx,
  i: { lineId: string; version: number; specNotes: string | null },
  user: Pick<OpsUser, 'id'>
): Promise<{ version: number }> {
  const l = await tx.leadLine.findUnique({
    where: { id: i.lineId },
    select: { leadId: true, specNotes: true, version: true, no: true },
  })
  if (!l) throw new SafeError(SAFE_MESSAGES.gone)
  if (l.version !== i.version) throw new SafeError(SAFE_MESSAGES.conflict)
  const next = i.specNotes?.trim() || null
  if (next === l.specNotes) return { version: l.version }
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'lead',
      subjectId: l.leadId,
      changes: [
        { field: `line${l.no}.specNotes`, before: l.specNotes, after: next, kind: 'other' },
      ],
      note: `Line ${l.no} spec edited`,
    },
    async (t) => {
      const { count } = await t.leadLine.updateMany({
        where: { id: i.lineId, version: i.version },
        data: { specNotes: next, version: { increment: 1 } },
      })
      if (count === 0) throw new SafeError(SAFE_MESSAGES.conflict)
    }
  )
  return { version: l.version + 1 }
}

export async function updateLeadNotes(
  tx: Tx,
  i: { leadId: string; version: number; notes: string | null },
  user: Pick<OpsUser, 'id'>
): Promise<{ version: number }> {
  const l = await tx.lead.findUnique({
    where: { id: i.leadId },
    select: { notes: true, version: true },
  })
  if (!l) throw new SafeError(SAFE_MESSAGES.gone)
  if (l.version !== i.version) throw new SafeError(SAFE_MESSAGES.conflict)
  const next = i.notes?.trim() || null
  if (next === l.notes) return { version: l.version }
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      subjectType: 'lead',
      subjectId: i.leadId,
      changes: [{ field: 'notes', before: l.notes, after: next, kind: 'other' }],
    },
    async (t) => {
      const { count } = await t.lead.updateMany({
        where: { id: i.leadId, version: i.version },
        data: { notes: next, version: { increment: 1 } },
      })
      if (count === 0) throw new SafeError(SAFE_MESSAGES.conflict)
    }
  )
  return { version: l.version + 1 }
}

export async function setLeadStage(
  tx: Tx,
  i: { leadId: string; version: number; to: Exclude<LeadStage, 'converted'> },
  user: Pick<OpsUser, 'id' | 'role'>
): Promise<{ from: LeadStage }> {
  try {
    const from = await changeLeadStage(tx, {
      leadId: i.leadId,
      to: i.to,
      ctx: { actorRole: user.role },
      actor: { kind: 'user', id: user.id },
      expectedVersion: i.version,
    })
    return { from }
  } catch (e) {
    if (e instanceof TransitionRefused) throw new SafeError(e.reason)
    if (e instanceof VersionConflict) throw new SafeError(SAFE_MESSAGES.conflict)
    throw e
  }
}
