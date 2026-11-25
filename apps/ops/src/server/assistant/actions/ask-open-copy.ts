import 'server-only'
import { opsDb } from '@indus/ops-db'
import {
  checkNote,
  fillNote,
  replyReferences,
  shortNoteSchema,
  type StoredMailFlags,
} from '@indus/ops-core'
import { replySubject } from '../../mail/reply'
import { threadVersion } from '../../mail/thread-version'
import { askOpenCopyUser, PROMPT_VERSION, SYSTEM_PARTS } from '../prompts/ask-open-copy.v1'
import { creditHoldContext } from '../guardrail-context'
import { registerAction } from '../registry'
import type { ActionDefinition, OutboundDraft, ProposalDraft } from '../types'

/**
 * `ask_open_copy` (S05-T07, board 97 state 3, Draft and ask): a password-protected attachment we cannot read.
 * Sonnet (ask-open-copy@1) drafts a two-sentence reply in the same thread, from the mailbox holding it, asking
 * for an unprotected copy; code fills the file names. A person approves it in Review (S06), and the send queue
 * does the rest. Nothing is sent from here.
 */
export interface AskOpenCopyInput {
  messageId: string
  mailboxId: string
  mailboxAddress: string
  threadId: string
  rfcMessageId: string | null
  referencesRfcIds: string[]
  fromAddress: string
  fromName: string | null
  subject: string
  files: string[]
}

export interface AskOpenCopyOut {
  note: string
  problem: string | null
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function filesPhrase(files: readonly string[]): string {
  if (files.length <= 1) return files[0] ?? 'the attachment'
  return `${files.slice(0, -1).join(', ')} and ${files.at(-1)}`
}

const definition: ActionDefinition<AskOpenCopyInput, AskOpenCopyOut> = {
  key: 'ask_open_copy',
  group: 'sourcing',
  aiPurpose: 'draft',
  external: true,
  // S07-T01: a send to a client on credit hold asks.
  guardrailContext: (request) => creditHoldContext(request),
  concurrencyGroup: 'mail',
  surface: 'review',

  estimate: () => ({ chars: 2_500, maxTokens: 400 }),

  async gather({ request }) {
    const m = await opsDb.mailMessage.findUniqueOrThrow({
      where: { id: request.subjectId },
      select: {
        id: true,
        mailboxId: true,
        threadId: true,
        rfcMessageId: true,
        referencesRfcIds: true,
        fromAddress: true,
        fromName: true,
        subject: true,
        flags: true,
        mailbox: { select: { address: true } },
      },
    })
    const files = ((m.flags as StoredMailFlags | null) ?? {}).passwordProtected ?? []
    const input: AskOpenCopyInput = {
      messageId: m.id,
      mailboxId: m.mailboxId,
      mailboxAddress: m.mailbox.address,
      threadId: m.threadId,
      rfcMessageId: m.rfcMessageId,
      referencesRfcIds: m.referencesRfcIds,
      fromAddress: m.fromAddress.toLowerCase(),
      fromName: m.fromName,
      subject: m.subject ?? '',
      files,
    }
    return {
      input,
      versions: { message: m.id, files: files.join('|'), thread: await threadVersion(m.threadId) },
    }
  },

  async currentVersions(request) {
    return (await this.gather({ request })).versions
  },

  async propose(input, ai) {
    const res = await ai.call({
      route: 'draft',
      system: SYSTEM_PARTS,
      user: askOpenCopyUser({
        subject: input.subject,
        senderName: input.fromName,
        fileCount: input.files.length,
      }),
      zod: shortNoteSchema,
      maxTokens: 400,
      promptVersion: PROMPT_VERSION,
    })
    if (!res.ok)
      return {
        ok: false,
        reason: res.reason,
        detail: res.detail,
        costUsd: res.costUsd,
        callIds: res.callIds,
      }
    return {
      ok: true,
      out: { note: res.value.note.trim(), problem: null },
      costUsd: res.costUsd,
      model: res.model,
      promptVersion: PROMPT_VERSION,
      callIds: res.callIds,
    }
  },

  async verify(out) {
    const c = checkNote(out.note, ['files'])
    return {
      out: { ...out, problem: c.ok ? null : (c.why ?? 'The note did not pass the checks') },
      checks: [
        { label: 'Same thread and mailbox', status: 'pass' },
        c.ok
          ? { label: 'No figures or links', status: 'pass' }
          : { label: 'No figures or links', status: 'fail', detail: c.why },
      ],
      confidence: c.ok ? 'sure' : 'unsure',
      ...(c.ok ? {} : { unsure: [{ field: 'note', why: c.why ?? 'Check the note' }] }),
    }
  },

  toProposal(v, input): ProposalDraft {
    const files = filesPhrase(input.files)
    const body = fillNote(v.out.note, { files })
    return {
      headline: `Ask ${input.fromName ?? input.fromAddress} for an open copy of ${files}`,
      reasons: [{ text: `${files} is password-protected, so it could not be read` }],
      preview: {
        mailbox: input.mailboxAddress,
        to: [input.fromAddress],
        subject: replySubject(input.subject),
        text: body,
      },
      checks: v.checks,
      confidence: v.confidence,
      unsureAbout: v.out.problem,
      onApproveText: `Sends the reply from ${input.mailboxAddress} in this thread`,
      options: [
        { key: 'send', label: 'Send the reply', consequence: 'Queued with the 5-minute undo' },
        { key: 'skip', label: 'Not needed', consequence: 'Nothing is sent' },
      ],
    }
  },

  // External: on approval (S06) the send queue sends `outbound`; the effect itself records nothing.
  async effect() {
    return { note: 'Asked the sender for an open copy', undoable: false }
  },

  outbound(v, input): OutboundDraft | null {
    if (v.out.problem) return null
    const text = fillNote(v.out.note, { files: filesPhrase(input.files) })
    return {
      kind: 'other',
      mailboxId: input.mailboxId,
      to: [input.fromAddress],
      subject: replySubject(input.subject),
      bodyHtml: `<p>${escapeHtml(text)}</p>`,
      bodyText: text,
      threadId: input.threadId,
      ...(input.rfcMessageId
        ? {
            inReplyToRfcId: input.rfcMessageId,
            referencesRfcIds: replyReferences(input.referencesRfcIds, input.rfcMessageId),
          }
        : {}),
      subjectType: 'mail_message',
      subjectId: input.messageId,
    }
  },
}

registerAction(definition)
export default definition
