import 'server-only'
import { opsDb } from '@indus/ops-db'
import { emitEvent } from '../../inngest/emit'
import { moveOutbound } from './status'

/**
 * Undo (ADR-11, board 93 "Undo 3:12"): one conditional update, then the cancel event.
 *
 *   scheduled             cancellable while `undoUntil` is in the future (the five minutes the server owns)
 *   held, waiting         cancellable any time before the claim: nothing has gone to Google
 *   sending and after     refused: "Too late: this email has already left"
 *
 * The database status is the authority; `ops/mail.send.cancelled` only saves the sleeping run a wake-up. A
 * second Undo on a cancelled row succeeds again (idempotent). Releasing a consumed number (ADR-15) is the
 * numbering sprint's hook on this function's result.
 */
export type UndoResult =
  | { success: true; data: { outboundId: string; alreadyCancelled: boolean } }
  | { success: false; error: string }

export const TOO_LATE = 'Too late: this email has already left'

/** The audit row is written by the calling action (defineAction), which knows the person. */
export async function undoSend(
  outboundId: string,
  deps: { now?: () => Date; emit?: typeof emitEvent } = {}
): Promise<UndoResult> {
  const now = (deps.now ?? (() => new Date()))()
  const data = { failureReason: null, updatedAt: now }
  const inWindow = await moveOutbound(outboundId, ['scheduled'], 'cancelled', data, {
    undoUntil: { gt: now },
  })
  const moved =
    inWindow || (await moveOutbound(outboundId, ['held', 'waiting_for_mailbox'], 'cancelled', data))
  if (!moved) {
    const row = await opsDb.outboundEmail.findUnique({
      where: { id: outboundId },
      select: { status: true },
    })
    if (!row) return { success: false, error: 'That email was not found' }
    if (row.status === 'cancelled')
      return { success: true, data: { outboundId, alreadyCancelled: true } }
    return { success: false, error: TOO_LATE }
  }
  await (deps.emit ?? emitEvent)({
    name: 'ops/mail.send.cancelled',
    id: `send-cancelled:${outboundId}`,
    data: { outboundId },
  })
  return { success: true, data: { outboundId, alreadyCancelled: false } }
}
