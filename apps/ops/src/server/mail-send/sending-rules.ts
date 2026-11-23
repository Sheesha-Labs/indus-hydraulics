import 'server-only'
import { SENDING_RULE_ROWS, type CcChoice, type SendingRole } from '@indus/ops-core'
import type { $Enums, Prisma } from '@indus/ops-db'
import { sanitizeSignature, signatureLines } from '../gmail/send-as'

/**
 * Board 87 writes (S04-T07). A saved row is the Owner's decision, so it also signs the seeded default off
 * (ADR-28): "Default · awaiting sign-off" goes away for every kind in the row.
 */
type Tx = Prisma.TransactionClient

export class SendingRuleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SendingRuleError'
  }
}

export type RuleChoice = {
  fromRole: SendingRole
  cc: CcChoice
  signatureUserId: string | null
  threadMode: $Enums.ThreadMode
}

export async function saveSendingRuleRow(
  tx: Tx,
  rowKey: string,
  choice: RuleChoice,
  userId: string,
  now = new Date()
): Promise<{ kinds: string[]; before: RuleChoice | null }> {
  const row = SENDING_RULE_ROWS.find((r) => r.key === rowKey)
  if (!row) throw new SendingRuleError('That mail type does not exist.')
  if (choice.cc !== 'none' && choice.cc === choice.fromRole) {
    throw new SendingRuleError('CC the other mailbox, not the one the email is sent from.')
  }
  if (choice.signatureUserId) {
    const signer = await tx.user.findUnique({
      where: { id: choice.signatureUserId },
      select: { status: true },
    })
    if (signer?.status !== 'active') throw new SendingRuleError('Choose an active person to sign.')
  }
  const kinds = row.kinds as $Enums.OutboundKind[]
  const first = await tx.sendingRule.findUnique({ where: { kind: kinds[0]! } })
  const before: RuleChoice | null = first
    ? {
        fromRole: first.fromRole as SendingRole,
        cc:
          first.ccSpecial === 'accounts_contact'
            ? 'accounts_contact'
            : ((first.ccRole ?? 'none') as CcChoice),
        signatureUserId: first.signatureUserId,
        threadMode: first.threadMode,
      }
    : null
  const data = {
    fromRole: choice.fromRole,
    ccRole: choice.cc === 'client' || choice.cc === 'supplier' ? choice.cc : null,
    ccSpecial: choice.cc === 'accounts_contact' ? 'accounts_contact' : null,
    signatureUserId: choice.signatureUserId,
    threadMode: choice.threadMode,
    signoffStatus: 'signed_off' as const,
    signedOffById: userId,
    signedOffAt: now,
  }
  for (const kind of kinds) {
    await tx.sendingRule.upsert({ where: { kind }, create: { kind, ...data }, update: data })
  }
  return { kinds, before }
}

/** A signature typed as lines: the signer's own name line is bold, the rest plain (board 87 blocks). */
export function signatureFromLines(
  lines: readonly string[],
  boldName: string | null
): { html: string; text: string } {
  const trimmed = lines.map((l) => l.replace(/\s+/g, ' ').trim())
  // No blank lines at either end, never two in a row.
  const clean = trimmed
    .filter((l, i) => l || (i > 0 && trimmed[i - 1]))
    .join('\n')
    .trim()
    .split('\n')
  const escape = (s: string) =>
    s
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
  const html = clean
    .map((l) => (boldName && l === boldName ? `<b>${escape(l)}</b>` : escape(l)))
    .join('<br>')
  const safe = sanitizeSignature(`<div>${html}</div>`) ?? ''
  return { html: safe, text: signatureLines(safe).join('\n') }
}

export async function saveDailyCaps(
  tx: Tx,
  caps: ReadonlyArray<{ mailboxId: string; cap: number }>
): Promise<Array<{ mailboxId: string; before: number; after: number }>> {
  const out = []
  for (const c of caps) {
    const row = await tx.mailbox.findUnique({
      where: { id: c.mailboxId },
      select: { dailySendCap: true },
    })
    if (!row) throw new SendingRuleError('That mailbox is not connected.')
    await tx.mailbox.update({ where: { id: c.mailboxId }, data: { dailySendCap: c.cap } })
    out.push({ mailboxId: c.mailboxId, before: row.dailySendCap, after: c.cap })
  }
  return out
}
