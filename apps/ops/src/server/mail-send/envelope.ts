import 'server-only'
import { mayRoleSend } from '@indus/ops-core'
import { opsDb, type $Enums } from '@indus/ops-db'
import { getSetting } from '../settings/get'
import { signatureFor, type SignatureBlock } from './signature'

/**
 * Who sends what (S04-T07, board 87, 08-map §1.9): `resolveSendEnvelope(kind, context)` turns the sending rule
 * for a kind into the mailbox, alias, CC, signature, thread mode and timing every outbound path uses before it
 * calls scheduleSend. The From alias is re-checked at send time by the gate.
 *
 *   rule        the kind's sending_rule row: From by mailbox ROLE (client = sales@, supplier = purchase@)
 *   no rule     'other' and the rest: the caller names the mailbox (a hand-written reply, the test email)
 *   roles       Read-only and Personal mailboxes never send (refused here and nowhere bypassed)
 *   thread      a thread is used only when it is in the sending mailbox; otherwise a new message starts and
 *               the reason is returned (never send from a mailbox that does not hold the thread)
 *   cc          the other business mailbox by role, or the client's accounts contact on invoices and reminders
 */
export type EnvelopeContext = {
  /** Required when the kind has no sending rule ('other'): the mailbox the person chose. */
  mailboxId?: string | null
  /** ops.mail_thread id of the conversation being answered, when there is one. */
  threadId?: string | null
  /** The client's accounts contact, for rules with ccSpecial 'accounts_contact'. */
  accountsContactEmail?: string | null
}

export type SendEnvelope = {
  mailboxId: string
  mailboxAddress: string
  fromAlias: string
  cc: string[]
  signature: SignatureBlock | null
  threadMode: $Enums.ThreadMode
  threadId: string | null
  holdMinutes: number
  respectSendWindow: boolean
  notes: Array<'thread_in_other_mailbox' | 'no_accounts_contact'>
}

export type EnvelopeResult =
  | { ok: true; envelope: SendEnvelope }
  | {
      ok: false
      reason: 'no_mailbox' | 'role_cannot_send' | 'mailbox_required'
      message: string
    }

const NO_MAILBOX = (role: string) =>
  `No ${role === 'client' ? 'Client' : 'Supplier'} mailbox is connected. Connect it in Settings › Mailboxes.`

export async function resolveSendEnvelope(
  kind: $Enums.OutboundKind,
  context: EnvelopeContext = {}
): Promise<EnvelopeResult> {
  const rule = await opsDb.sendingRule.findUnique({ where: { kind } })
  const select = {
    id: true,
    address: true,
    role: true,
    ownerUserId: true,
    signatureHtml: true,
    disconnectedAt: true,
  } as const

  let mailbox
  if (rule) {
    if (!mayRoleSend(rule.fromRole)) {
      return {
        ok: false,
        reason: 'role_cannot_send',
        message: 'Read-only and Personal mailboxes never send.',
      }
    }
    // One mailbox per business role; a disconnected one is still chosen (sends wait for it, never switch).
    mailbox = await opsDb.mailbox.findFirst({
      where: { role: rule.fromRole },
      orderBy: [{ disconnectedAt: { sort: 'asc', nulls: 'first' } }, { createdAt: 'asc' }],
      select,
    })
    if (!mailbox) return { ok: false, reason: 'no_mailbox', message: NO_MAILBOX(rule.fromRole) }
  } else {
    if (!context.mailboxId) {
      return { ok: false, reason: 'mailbox_required', message: 'Choose the mailbox to send from.' }
    }
    mailbox = await opsDb.mailbox.findUnique({ where: { id: context.mailboxId }, select })
    if (!mailbox)
      return { ok: false, reason: 'no_mailbox', message: 'That mailbox is not connected.' }
  }
  if (!mayRoleSend(mailbox.role)) {
    return {
      ok: false,
      reason: 'role_cannot_send',
      message: 'Read-only and Personal mailboxes never send.',
    }
  }

  const notes: SendEnvelope['notes'] = []
  let threadId: string | null = null
  if (context.threadId) {
    const thread = await opsDb.mailThread.findUnique({
      where: { id: context.threadId },
      select: { mailboxId: true },
    })
    if (thread?.mailboxId === mailbox.id) threadId = context.threadId
    else notes.push('thread_in_other_mailbox')
  }

  const cc: string[] = []
  if (rule?.ccRole && rule.ccRole !== mailbox.role) {
    const other = await opsDb.mailbox.findFirst({
      where: { role: rule.ccRole },
      orderBy: { createdAt: 'asc' },
      select: { address: true },
    })
    if (other) cc.push(other.address)
  }
  if (rule?.ccSpecial === 'accounts_contact') {
    if (context.accountsContactEmail) cc.push(context.accountsContactEmail.trim().toLowerCase())
    else notes.push('no_accounts_contact')
  }

  const { sendWindowMinutes } = await getSetting('undo')
  const signature = await signatureFor({
    signerId: rule?.signatureUserId ?? mailbox.ownerUserId,
    mailboxSignatureHtml: mailbox.signatureHtml,
  })
  return {
    ok: true,
    envelope: {
      mailboxId: mailbox.id,
      mailboxAddress: mailbox.address,
      fromAlias: mailbox.address,
      cc,
      signature,
      threadMode: rule?.threadMode ?? (threadId ? 'client_thread' : 'new_thread'),
      threadId,
      holdMinutes: sendWindowMinutes,
      respectSendWindow: rule?.respectSendWindow ?? true,
      notes,
    },
  }
}
