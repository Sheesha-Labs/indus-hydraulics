import 'server-only'
import { opsDb } from '@indus/ops-db'
import { SENDS_EXTERNALLY } from '@indus/ops-core'
import { DecisionError, undoApproval, type Decider } from './decisions'
import { RevertError, undoInternal, type RevertEvent } from './revert'

/**
 * Undo, owned by the server (S06-T07, ADR-11). One entry point for the toast, the receipt row and ⌘Z:
 *
 *   queued (an email in its 5-minute hold)  the send is cancelled (conditional: only while scheduled) and the
 *                                            card comes back in Review with the person's edits; anything the
 *                                            approval consumed is released.
 *   done, internal, inside undoUntil         its changes go back as new rows; done → undone.
 *   an email that already left               not undone: the answer says when it left and offers a correction.
 */
export type UndoOutcome =
  | { undone: true; ref: string; at: string; events: RevertEvent[] }
  | { undone: false; left: { ref: string; at: string | null } }

const EXTERNAL = new Set<string>(SENDS_EXTERNALLY)
const LEFT = ['sending', 'sent', 'unknown'] as const

const CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Dubai',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export async function undoAction(
  actionId: string,
  user: Decider,
  now = new Date()
): Promise<UndoOutcome> {
  const a = await opsDb.assistantAction.findUnique({
    where: { id: actionId },
    select: { id: true, ref: true, actionKey: true, state: true },
  })
  if (!a) throw new DecisionError('not_found', 'That action is no longer here.')
  const out = await opsDb.outboundEmail.findFirst({
    where: { actionId: a.id },
    orderBy: { createdAt: 'desc' },
    select: { status: true, sentAt: true, updatedAt: true },
  })
  if (out && (LEFT as readonly string[]).includes(out.status)) {
    const at = out.sentAt ?? out.updatedAt
    return { undone: false, left: { ref: a.ref, at: at ? CLOCK.format(at) : null } }
  }
  if (a.state === 'queued') {
    const r = await undoApproval({ actionId: a.id }, user, now)
    return { undone: true, ref: r.ref, at: CLOCK.format(now), events: [] }
  }
  if (a.state === 'done' && EXTERNAL.has(a.actionKey)) {
    return { undone: false, left: { ref: a.ref, at: null } }
  }
  if (a.state === 'done') {
    try {
      const r = await undoInternal(a.id, user, now)
      return { undone: true, ref: r.ref, at: CLOCK.format(now), events: r.events }
    } catch (e) {
      if (e instanceof RevertError) throw new DecisionError('too_late', e.message)
      throw e
    }
  }
  throw new DecisionError('too_late', 'Too late to undo this here.')
}
