import 'server-only'
import type { Prisma } from '@indus/ops-db'
import { domainOf, type MailClassValue, type StoredMailFlags } from '@indus/ops-core'
import { writeTracked } from '../assistant/write-tracked'
import { changeType, OverrideError, type Actor, type OverrideResult } from './overrides'
import { learnDomain } from './resolve-unsure'

/**
 * Phishing (S05-T07, board 96 right column). The checks' reasons are stored in mail_message.flags.phishing;
 * the card says nothing was opened or acted on. "Report to Google" is only an Open in Gmail link: no API call,
 * nothing moved (architecture §1.5). "It's real" (here) is a person's word against the checks:
 *   - the class becomes the person's choice (writeTracked, preference_signal 'override' with the reasons)
 *   - the phishing flag is cleared and kept as `phishingCleared` for the record
 *   - with a company chosen, the sender's domain joins it (never a public mail domain)
 */
const NOT_ALLOWED: readonly MailClassValue[] = ['phishing', 'unclassified', 'bounce', 'auto_reply']

export async function itsReal(
  tx: Prisma.TransactionClient,
  input: { messageId: string; cls: MailClassValue; companyId?: string | null; actor: Actor }
): Promise<OverrideResult & { learned: string | null }> {
  if (NOT_ALLOWED.includes(input.cls)) throw new OverrideError('Choose what the email really is')
  const m = await tx.mailMessage.findUnique({
    where: { id: input.messageId },
    select: { id: true, fromAddress: true, classification: true, flags: true },
  })
  if (!m) throw new OverrideError('That message is no longer here')
  const flags = (m.flags as (StoredMailFlags & Record<string, unknown>) | null) ?? {}
  if (m.classification !== 'phishing' && !flags.phishing)
    throw new OverrideError('This email is not flagged')
  const reasons = flags.phishing?.reasons.map((r) => r.code) ?? []

  const out = await changeType(tx, {
    messageId: m.id,
    cls: input.cls,
    actor: input.actor,
    signal: { phishingCleared: true, phishingReasons: reasons },
  })
  const { phishing, ...rest } = flags
  await writeTracked(
    tx,
    {
      actor: { kind: 'user', id: input.actor.id },
      subjectType: 'mail_message',
      subjectId: m.id,
      changes: [{ field: 'flags.phishing', before: reasons, after: null, kind: 'status' }],
      note: `Marked real by ${input.actor.initials}`,
    },
    (t) =>
      t.mailMessage.update({
        where: { id: m.id },
        data: {
          flags: { ...rest, phishingCleared: phishing ?? true } as Prisma.InputJsonValue,
        },
      })
  )
  const learned = input.companyId
    ? await learnDomain(tx, input.companyId, domainOf(m.fromAddress), input.actor, '"It’s real"')
    : null
  return { ...out, learned }
}
