import 'server-only'
import { opsDb, type Prisma } from '@indus/ops-db'
import { registerBasisHook } from '../mail-send/hooks'
import { actionDefinition } from './registry'
import type { ActionRequest } from './types'
import { basisHash } from './runner'
import { setActor } from './write-tracked'

/**
 * Stale proposals (S06-T01, ADR-11). A proposal is built on record versions (its basisHash). It is stale when:
 *   - a new inbound message arrived in its thread (markStaleOnInbound, from the mail router): staleAt and a
 *     reason worded for the sender ("The client replied since this was drafted (10:02)"); or
 *   - its definition's currentVersions now hash differently (isStale, at approval and in the send gate).
 *
 * Checked three times: when the card is read (Review shows the banner), when a person approves (blocked, Redraft
 * offered) and when the send gate runs (a queued send whose proposal went stale stops as 'stale').
 */
const OPEN = { in: ['proposed', 'later'] } satisfies Prisma.EnumActionStateFilter<'AssistantAction'>

/** Actions whose proposal is an email in a thread: a new inbound there makes them stale. */
const THREAD_BOUND = [
  'ask_open_copy',
  'resend_alternate_contact',
  'manual_reply',
  'correction_email',
]

type ActionRow = {
  id: string
  actionKey: string
  basisHash: string | null
  staleAt: Date | null
  staleReason: string | null
  subjectType: string | null
  subjectId: string | null
  inputs: unknown
}

function requestOf(a: ActionRow): ActionRequest | null {
  const r = (a.inputs as { request?: ActionRequest } | null)?.request
  if (r) return r
  if (!a.subjectType || !a.subjectId) return null
  return {
    actionKey: a.actionKey,
    subjectType: a.subjectType as ActionRequest['subjectType'],
    subjectId: a.subjectId,
    trigger: 'staleness',
    origin: 'live',
    sourceVersion: 0,
  }
}

/** The basis hash the action would have if drafted now; null when its definition cannot say. */
export async function currentBasis(a: ActionRow): Promise<string | null> {
  const def = actionDefinition(a.actionKey)
  const request = requestOf(a)
  if (!def?.currentVersions || !request) return null
  try {
    return basisHash(await def.currentVersions(request))
  } catch {
    // The subject is gone (a deleted message): treat as changed.
    return 'gone'
  }
}

const SELECT = {
  id: true,
  actionKey: true,
  basisHash: true,
  staleAt: true,
  staleReason: true,
  subjectType: true,
  subjectId: true,
  inputs: true,
} as const

export async function isStale(
  actionId: string
): Promise<{ stale: boolean; reason: string | null }> {
  const a = await opsDb.assistantAction.findUnique({ where: { id: actionId }, select: SELECT })
  if (!a) return { stale: true, reason: 'This proposal is no longer here.' }
  if (a.staleAt) return { stale: true, reason: a.staleReason }
  if (!a.basisHash) return { stale: false, reason: null }
  const now = await currentBasis(a)
  if (now !== null && now !== a.basisHash)
    return { stale: true, reason: 'The record changed since this was drafted.' }
  return { stale: false, reason: null }
}

function dubaiClock(at: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(at)
}

export function staleReasonFor(role: string | null, at: Date): string {
  const who = role === 'client' ? 'The client' : role === 'supplier' ? 'The supplier' : 'The sender'
  return `${who} replied since this was drafted (${dubaiClock(at)}).`
}

/**
 * A new inbound message: every open proposal in its thread becomes stale. Returns the actions marked. The
 * message that a proposal was drafted from never marks it (it is older than the proposal).
 */
export async function markStaleOnInbound(messageId: string): Promise<string[]> {
  const m = await opsDb.mailMessage.findUnique({
    where: { id: messageId },
    select: {
      id: true,
      threadId: true,
      direction: true,
      sentAt: true,
      mailbox: { select: { role: true } },
    },
  })
  if (!m || m.direction !== 'inbound') return []
  const siblings = await opsDb.mailMessage.findMany({
    where: { threadId: m.threadId, id: { not: m.id } },
    select: { id: true },
    take: 500,
  })
  const open = await opsDb.assistantAction.findMany({
    where: {
      state: OPEN,
      staleAt: null,
      actionKey: { in: THREAD_BOUND },
      OR: [
        { subjectType: 'mail_thread', subjectId: m.threadId },
        { subjectType: 'mail_message', subjectId: { in: siblings.map((s) => s.id) } },
      ],
    },
    select: { id: true },
  })
  if (open.length === 0) return []
  const reason = staleReasonFor(m.mailbox.role, m.sentAt)
  await opsDb.$transaction(async (tx) => {
    await setActor(tx, { kind: 'system' })
    await tx.assistantAction.updateMany({
      where: { id: { in: open.map((a) => a.id) }, staleAt: null },
      data: { staleAt: new Date(), staleReason: reason },
    })
  })
  return open.map((a) => a.id)
}

/**
 * The S04 gate's basis hook: the CURRENT basis of the action that queued this send. A stale-marked action
 * answers a value that never equals a stored hash, so the gate stops the send as 'stale'.
 */
export async function gateBasis(input: { outboundId: string }): Promise<string | null> {
  const row = await opsDb.outboundEmail.findUnique({
    where: { id: input.outboundId },
    select: { actionId: true },
  })
  if (!row?.actionId) return null
  const a = await opsDb.assistantAction.findUnique({ where: { id: row.actionId }, select: SELECT })
  if (!a) return null
  if (a.staleAt) return `stale:${a.staleAt.toISOString()}`
  return currentBasis(a)
}

let registered = false
/** Called once where the send function loads (inngest/mail/send.ts). */
export function registerStalenessGate(): void {
  if (registered) return
  registerBasisHook(gateBasis)
  registered = true
}
