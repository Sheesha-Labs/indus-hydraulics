import 'server-only'
import { opsDb, type $Enums } from '@indus/ops-db'
import { htmlToText } from '../gmail/html'
import { getSetting } from '../settings/get'

/**
 * The signature block the console inserts (S04-T07, board 87; 08-map §1.9: the Gmail API does not add the
 * Gmail signature). In order:
 *
 *   1  the sending rule's signer (sending_rule.signatureUserId), else the mailbox owner
 *   2  that person's block saved in Settings › Sending (`send.signatures`)
 *   3  the mailbox's own Gmail signature, read from send-as and sanitised at connect
 *
 * Null when none exists: the email goes without one rather than with someone else's.
 */
export type SignatureBlock = { html: string; text: string }

export async function signatureFor(input: {
  signerId: string | null
  mailboxSignatureHtml: string | null
}): Promise<SignatureBlock | null> {
  if (input.signerId) {
    const saved = (await getSetting('send.signatures'))[input.signerId]
    if (saved?.html.trim()) return saved
  }
  const html = input.mailboxSignatureHtml?.trim()
  return html ? { html, text: htmlToText(html) } : null
}

/** The signer for a kind sent from a mailbox: the rule's signer, else the mailbox owner. */
export async function signerFor(
  kind: $Enums.OutboundKind,
  mailboxOwnerId: string | null
): Promise<string | null> {
  const rule = await opsDb.sendingRule.findUnique({
    where: { kind },
    select: { signatureUserId: true },
  })
  return rule?.signatureUserId ?? mailboxOwnerId
}
