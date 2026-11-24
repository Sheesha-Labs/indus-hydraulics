import 'server-only'
import { opsDb } from '@indus/ops-db'
import { replyReferences } from '@indus/ops-core'
import { threadVersion } from '../../mail/thread-version'
import { registerAction } from '../registry'
import type { ActionDefinition, OutboundDraft, ProposalDraft } from '../types'

/**
 * `manual_reply` (S05-T05, Draft and ask): a Helper's reply in a client-mailbox thread waits for the Owner. The
 * row is written by server/mail/reply.ts, never by the runner; this definition gives Review what it needs:
 * the basis (the thread's latest inbound, so a client reply makes the card stale) and the email to schedule on
 * approval, in the thread's own mailbox, replying to its latest message.
 */
export interface ManualReplyInput {
  threadId: string
  mailboxId: string
  rfcMessageId: string | null
  referencesRfcIds: string[]
}

export async function loadManualReply(threadId: string): Promise<ManualReplyInput> {
  const t = await opsDb.mailThread.findUniqueOrThrow({
    where: { id: threadId },
    select: {
      id: true,
      mailboxId: true,
      messages: {
        where: { rfcMessageId: { not: null } },
        orderBy: { sentAt: 'desc' },
        take: 1,
        select: { rfcMessageId: true, referencesRfcIds: true },
      },
    },
  })
  const last = t.messages[0]
  return {
    threadId: t.id,
    mailboxId: t.mailboxId,
    rfcMessageId: last?.rfcMessageId ?? null,
    referencesRfcIds: last?.referencesRfcIds ?? [],
  }
}

const definition: ActionDefinition<ManualReplyInput, Record<string, never>> = {
  key: 'manual_reply',
  group: 'mail',
  aiPurpose: 'other',
  external: true,
  concurrencyGroup: 'mail',
  surface: 'review',

  estimate: () => ({ chars: 0, maxTokens: 0 }),

  async gather({ request }) {
    const input = await loadManualReply(request.subjectId)
    return { input, versions: { thread: await threadVersion(input.threadId) } }
  },

  async currentVersions(request) {
    return { thread: await threadVersion(request.subjectId) }
  },

  // Written by a person, not drafted: nothing to propose, verify or call a model for.
  async propose() {
    return { ok: true, out: {}, costUsd: '0.000000', model: null, promptVersion: null, callIds: [] }
  },
  async verify(out) {
    return { out, checks: [], confidence: 'sure' }
  },
  toProposal(v): ProposalDraft {
    return { headline: 'Reply', reasons: [], checks: v.checks, confidence: v.confidence }
  },
  async effect() {
    return { note: 'Reply sent by the Owner', undoable: false }
  },

  outbound(_v, input): OutboundDraft | null {
    // The email itself (to, cc, subject, body) comes from the proposal and any edit: see S06-T02 decisions.
    return {
      kind: 'other',
      mailboxId: input.mailboxId,
      to: [],
      subject: '',
      bodyHtml: '',
      bodyText: '',
      threadId: input.threadId,
      ...(input.rfcMessageId
        ? {
            inReplyToRfcId: input.rfcMessageId,
            referencesRfcIds: replyReferences(input.referencesRfcIds, input.rfcMessageId),
          }
        : {}),
      subjectType: 'mail_thread',
      subjectId: input.threadId,
    }
  },
}

registerAction(definition)
export default definition
