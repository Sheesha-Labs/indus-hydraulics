import 'server-only'
import { opsDb } from '@indus/ops-db'
import { CORRECTION_REASON_LABEL, type CorrectionReason } from '@indus/ops-core'
import { correctionHint } from './actions/correction-email'
import { requestActionQuietly } from './request'
import { reissueFor } from './undo-hooks'

/**
 * "Send a correction instead?" (S06-T07, board 114): for an action whose email already left. A document a
 * later sprint can reissue (S17/S23's quotation R2) is reissued; anything else asks the Assistant for a
 * correction_email card, which always waits for a person in Review.
 */
export class CorrectionStartError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CorrectionStartError'
  }
}

export async function startCorrection(
  input: { actionId: string; reason: CorrectionReason; note: string | null },
  by: { id: string }
): Promise<{ kind: 'reissue'; ref: string } | { kind: 'drafting' }> {
  const a = await opsDb.assistantAction.findUnique({
    where: { id: input.actionId },
    select: {
      id: true,
      ref: true,
      actionKey: true,
      state: true,
      subjectType: true,
      subjectId: true,
      enquiryId: true,
    },
  })
  if (!a) throw new CorrectionStartError('That action is no longer here.')
  const left = await opsDb.outboundEmail.findFirst({
    where: { actionId: a.id, status: { in: ['sent', 'sending', 'unknown'] } },
    orderBy: { createdAt: 'desc' },
    select: { threadId: true, mailboxId: true },
  })
  if (!left?.threadId) throw new CorrectionStartError('Nothing left the building for this action.')
  const reissue = reissueFor(a.actionKey)
  if (reissue) return { kind: 'reissue', ...(await reissue(a.id, by)) }
  const open = await opsDb.assistantAction.count({
    where: { correctionOfId: a.id, state: { in: ['proposed', 'later', 'queued'] } },
  })
  if (open > 0)
    throw new CorrectionStartError('A correction for this is already waiting in Review.')
  const n = await opsDb.assistantAction.count({ where: { correctionOfId: a.id } })
  const queued = await requestActionQuietly({
    actionKey: 'correction_email',
    subjectType: 'mail_thread',
    subjectId: left.threadId,
    enquiryId: a.enquiryId,
    trigger: 'person',
    origin: 'live',
    sourceVersion: `correction:${a.id}:${n}`,
    mailboxId: left.mailboxId,
    correctionOfId: a.id,
    hint: correctionHint(CORRECTION_REASON_LABEL[input.reason], input.note),
  })
  if (!queued)
    throw new CorrectionStartError('The Assistant could not be reached. Try again shortly.')
  return { kind: 'drafting' }
}
