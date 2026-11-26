import 'server-only'
import type { Prisma } from '@indus/ops-db'
import type { OpsUser } from '../../lib/access'
import { SAFE_MESSAGES, SafeError } from '../../lib/safe-message'
import { bumpCounters, recordCounterKey } from '../assistant/live-counter'
import { writeTracked } from '../assistant/write-tracked'

/**
 * Board 05 header facts (S09-T03): title, client ref, deadline, decision-by and owner, edited by a person with
 * an optimistic version check. When the enquiry changed since the person opened it, nothing is written: the
 * reply carries what changed, by whom, so the editor can offer "Keep theirs" or "Keep mine" (S06 three-way).
 */

export const FACT_FIELDS = ['title', 'clientRef', 'deadline', 'decisionBy', 'ownerId'] as const
export type FactField = (typeof FACT_FIELDS)[number]

export interface FactsInput {
  enquiryId: string
  version: number
  title?: string | undefined
  clientRef?: string | null | undefined
  /** YYYY-MM-DD (Dubai); stored at 14:00 GST that day, like intake. */
  deadline?: string | null | undefined
  decisionBy?: string | null | undefined
  ownerId?: string | null | undefined
}

export type FactsResult =
  | { kind: 'saved'; version: number; changed: FactField[] }
  | {
      kind: 'conflict'
      version: number
      by: string
      theirs: Partial<Record<FactField, string | null>>
    }

const FACT_KIND = {
  title: 'other',
  clientRef: 'other',
  deadline: 'terms',
  decisionBy: 'terms',
  ownerId: 'other',
} as const satisfies Record<FactField, 'other' | 'terms'>

const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null)
const deadlineAt = (s: string) => new Date(`${s}T10:00:00.000Z`)

function current(e: {
  title: string
  clientRef: string | null
  deadline: Date | null
  decisionBy: Date | null
  ownerId: string | null
}): Record<FactField, string | null> {
  return {
    title: e.title,
    clientRef: e.clientRef,
    deadline: day(e.deadline),
    decisionBy: day(e.decisionBy),
    ownerId: e.ownerId,
  }
}

export async function updateEnquiryFacts(
  tx: Prisma.TransactionClient,
  input: FactsInput,
  user: Pick<OpsUser, 'id'>
): Promise<FactsResult> {
  const e = await tx.enquiry.findUnique({
    where: { id: input.enquiryId },
    select: {
      ref: true,
      version: true,
      title: true,
      clientRef: true,
      deadline: true,
      decisionBy: true,
      ownerId: true,
    },
  })
  if (!e) throw new SafeError(SAFE_MESSAGES.gone)
  const now = current(e)
  if (e.version !== input.version) {
    const last = await tx.activityEvent.findFirst({
      where: {
        subjectType: 'enquiry',
        subjectId: input.enquiryId,
        field: { in: [...FACT_FIELDS, 'stage'] },
      },
      orderBy: { at: 'desc' },
      select: { actorKind: true, actorId: true },
    })
    const who =
      last?.actorKind === 'assistant'
        ? 'the Assistant'
        : last?.actorId
          ? ((await tx.user.findUnique({ where: { id: last.actorId }, select: { initials: true } }))
              ?.initials ?? 'someone')
          : 'someone'
    const asked = FACT_FIELDS.filter((f) => input[f] !== undefined)
    return {
      kind: 'conflict',
      version: e.version,
      by: who,
      theirs: Object.fromEntries(asked.map((f) => [f, now[f]])),
    }
  }
  if (input.ownerId) {
    const owner = await tx.user.findFirst({
      where: { id: input.ownerId, status: 'active' },
      select: { id: true },
    })
    if (!owner) throw new SafeError('Choose an active team member as owner.')
  }
  const next: Record<FactField, string | null> = { ...now }
  for (const f of FACT_FIELDS)
    if (input[f] !== undefined) next[f] = (input[f] as string | null) ?? null
  if (!next.title?.trim()) throw new SafeError('Give the enquiry a title.')
  const changed = FACT_FIELDS.filter((f) => next[f] !== now[f])
  if (changed.length === 0) return { kind: 'saved', version: e.version, changed: [] }
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: user.id },
      enquiryId: input.enquiryId,
      subjectType: 'enquiry',
      subjectId: input.enquiryId,
      changes: changed.map((f) => ({
        field: f,
        before: now[f],
        after: next[f],
        kind: FACT_KIND[f],
      })),
    },
    async (t) => {
      const { count } = await t.enquiry.updateMany({
        where: { id: input.enquiryId, version: e.version },
        data: {
          title: next.title!.trim(),
          clientRef: next.clientRef?.trim() || null,
          deadline: next.deadline ? deadlineAt(next.deadline) : null,
          decisionBy: next.decisionBy ? new Date(`${next.decisionBy}T00:00:00.000Z`) : null,
          ownerId: next.ownerId,
          version: { increment: 1 },
        },
      })
      if (count === 0) throw new SafeError(SAFE_MESSAGES.conflict)
    }
  )
  await bumpCounters([recordCounterKey(e.ref)], 1, tx)
  return { kind: 'saved', version: e.version + 1, changed }
}
