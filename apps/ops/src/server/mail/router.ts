import 'server-only'
import { startEmailIntake } from '../intake/email-body'
import { opsDb } from '@indus/ops-db'
import type { StoredMailFlags } from '@indus/ops-core'
import { requestAction, requestActionQuietly } from '../assistant/request'
import { isMailPipelineEnabled } from '../assistant/pipeline-switch'
import { markStaleOnInbound } from '../assistant/staleness'
import { handleBounce } from './bounce'

/**
 * The mail pipeline router (S05-T04): which action a mail event starts.
 *
 *   ops/mail.received    live inbound mail → #1 classify. Backfilled and imported mail is never acted on;
 *                        our own sent mail (outbound) is not classified.
 *   ops/mail.classified  business classes → #2 link, and ask_open_copy when an attachment is password-
 *                        protected; an out-of-office reply → ooo_facts; a bounce → handleBounce (S05-T07).
 *                        Not business and phishing are handled where they stand.
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
  // S06-T01: a reply in a thread makes the open proposals drafted in it stale, switch or not.
  await markStaleOnInbound(m.id)
  // S05-T09: the switch. Off, the message stays unclassified; switching on sorts it with the backlog.
  if (!(await isMailPipelineEnabled())) return { requested: null, skipped: 'pipeline_off' }
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
  actionId?: string
}): Promise<RouteResult & { also?: string[] }> {
  if ((data.origin ?? 'live') !== 'live') return { requested: null, skipped: 'origin' }
  const cls = String(data.class ?? 'unclassified')
  if (cls === 'auto_reply') return routeAutoReply(data.messageId)
  if (cls === 'bounce') {
    const out = await handleBounce(data.messageId, data.actionId ?? null)
    return out.kind === 'skipped'
      ? { requested: null, skipped: `bounce:${out.why}` }
      : { requested: null, also: [`bounce:${out.kind}`] }
  }
  if (NO_LINK.has(cls)) return { requested: null, skipped: 'class' }
  const also = await routeProtectedAttachment(data.messageId)
  // #4 (S08-T06): a live client enquiry is read into an intake now; the Create enquiry card follows once
  // its body and attachments are read (capture → requestEnquiryWhenSettled).
  if (cls === 'client_enquiry') await startEmailIntake(null, data.messageId).catch(() => null)
  // S09-T06 (171b state 5): a client reply in the thread of a regretted enquiry may name new lines. It is read
  // like an enquiry; the Create enquiry card that follows links the new enquiry to the regretted one.
  if (cls === 'client_reply' && (await inRegrettedThread(data.messageId)))
    await startEmailIntake(null, data.messageId).catch(() => null)
  // S09-T07: a client reply in the thread of an enquiry with questions waiting is read against them.
  if (cls === 'client_reply') await requestAnswerMatch(data.messageId)
  const id = await requestAction({
    actionKey: 'link_mail',
    subjectType: 'mail_message',
    subjectId: data.messageId,
    trigger: 'mail.classified',
    origin: 'live',
    sourceVersion: String(data.class),
  })
  return also ? { requested: id, also: [also] } : { requested: id }
}

async function requestAnswerMatch(messageId: string): Promise<void> {
  const m = await opsDb.mailMessage.findUnique({
    where: { id: messageId },
    select: {
      bodyTextHash: true,
      thread: {
        select: {
          enquiry: {
            select: {
              id: true,
              _count: { select: { clientQuestions: { where: { status: 'sent' } } } },
            },
          },
        },
      },
    },
  })
  const e = m?.thread.enquiry
  if (!e || !e._count.clientQuestions) return
  await requestAction({
    actionKey: 'match_client_answers',
    subjectType: 'mail_message',
    subjectId: messageId,
    enquiryId: e.id,
    trigger: 'mail.classified',
    origin: 'live',
    sourceVersion: m.bodyTextHash ?? 1,
  })
}

async function inRegrettedThread(messageId: string): Promise<boolean> {
  const m = await opsDb.mailMessage.findUnique({
    where: { id: messageId },
    select: { thread: { select: { enquiry: { select: { stage: true } } } } },
  })
  return m?.thread.enquiry?.stage === 'regretted'
}

/** An out-of-office reply → ooo_facts; an automatic acknowledgement needs nothing. */
async function routeAutoReply(messageId: string): Promise<RouteResult> {
  const m = await opsDb.mailMessage.findUnique({
    where: { id: messageId },
    select: { id: true, flags: true, bodyTextHash: true },
  })
  const kind = ((m?.flags as StoredMailFlags | null) ?? {}).autoReply?.kind
  if (!m || kind !== 'out_of_office') return { requested: null, skipped: 'auto_ack' }
  const id = await requestAction({
    actionKey: 'ooo_facts',
    subjectType: 'mail_message',
    subjectId: m.id,
    trigger: 'mail.classified',
    origin: 'live',
    sourceVersion: m.bodyTextHash ?? 1,
  })
  return { requested: id }
}

/** Board 97 (3): a password-protected attachment on business mail → ask_open_copy (Draft and ask). */
async function routeProtectedAttachment(messageId: string): Promise<string | null> {
  const m = await opsDb.mailMessage.findUnique({
    where: { id: messageId },
    select: { id: true, mailboxId: true, flags: true },
  })
  const files = ((m?.flags as StoredMailFlags | null) ?? {}).passwordProtected ?? []
  if (!m || files.length === 0) return null
  return requestAction({
    actionKey: 'ask_open_copy',
    subjectType: 'mail_message',
    subjectId: m.id,
    trigger: 'mail.password_protected',
    origin: 'live',
    sourceVersion: files.join('|').slice(0, 200),
    mailboxId: m.mailboxId,
  })
}

/** A person's "Draft “Ask sender for an open copy”" (board 97): same action, origin manual. */
export async function askForOpenCopy(messageId: string): Promise<'queued' | 'nothing' | 'failed'> {
  const m = await opsDb.mailMessage.findUnique({
    where: { id: messageId },
    select: {
      id: true,
      mailboxId: true,
      attachments: {
        where: { extractionStatus: 'password_protected' },
        select: { filename: true },
      },
    },
  })
  if (!m || m.attachments.length === 0) return 'nothing'
  const ok = await requestActionQuietly({
    actionKey: 'ask_open_copy',
    subjectType: 'mail_message',
    subjectId: m.id,
    trigger: 'person',
    origin: 'manual',
    sourceVersion: m.attachments
      .map((a) => a.filename)
      .join('|')
      .slice(0, 200),
    mailboxId: m.mailboxId,
  })
  return ok ? 'queued' : 'failed'
}
