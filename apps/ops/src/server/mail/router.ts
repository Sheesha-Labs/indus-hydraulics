import 'server-only'
import { opsDb } from '@indus/ops-db'
import { requestAction } from '../assistant/request'

/**
 * The mail pipeline router (S05-T04): which action a mail event starts.
 *
 *   ops/mail.received    live inbound mail → #1 classify. Backfilled and imported mail is never acted on;
 *                        our own sent mail (outbound) is not classified.
 *   ops/mail.classified  business classes → #2 link. Not business, out of office, bounces and phishing are
 *                        handled where they stand (S05-T07 adds the out-of-office and bounce follow-ups).
 *
 * Downstream hooks by class (create the enquiry S08, capture the quote S15, the PO S22, the supplier question
 * S14) attach here when their sprints land; until then the class and the link are the whole effect.
 */
const NO_LINK = new Set(['not_business', 'auto_reply', 'bounce', 'phishing', 'unclassified'])

export type RouteResult = { requested: string | null; skipped?: string }

export async function routeReceived(data: {
  messageId: string
  origin?: string
}): Promise<RouteResult> {
  if ((data.origin ?? 'live') !== 'live') return { requested: null, skipped: 'origin' }
  const m = await opsDb.mailMessage.findUnique({
    where: { id: data.messageId },
    select: { id: true, direction: true, origin: true, bodyTextHash: true },
  })
  if (!m) return { requested: null, skipped: 'missing' }
  if (m.direction !== 'inbound') return { requested: null, skipped: 'outbound' }
  if (m.origin !== 'live') return { requested: null, skipped: 'origin' }
  const id = await requestAction({
    actionKey: 'classify_mail',
    subjectType: 'mail_message',
    subjectId: m.id,
    trigger: 'mail.received',
    origin: 'live',
    sourceVersion: m.bodyTextHash ?? 1,
  })
  return { requested: id }
}

export async function routeClassified(data: {
  messageId: string
  class?: string
  origin?: string
}): Promise<RouteResult> {
  if ((data.origin ?? 'live') !== 'live') return { requested: null, skipped: 'origin' }
  if (NO_LINK.has(String(data.class ?? 'unclassified')))
    return { requested: null, skipped: 'class' }
  const id = await requestAction({
    actionKey: 'link_mail',
    subjectType: 'mail_message',
    subjectId: data.messageId,
    trigger: 'mail.classified',
    origin: 'live',
    sourceVersion: String(data.class),
  })
  return { requested: id }
}
