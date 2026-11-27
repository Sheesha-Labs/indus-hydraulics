import 'server-only'
import { detectBankChangeRequest } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { requestAction } from '../assistant/request'
import { matchCompanyBySender } from './match-company'

/**
 * The bank-change watch in the mail pipeline (S10-T07, board 132): every live inbound email from a known supplier is
 * read for a bank-change request (phrases, or an IBAN we do not hold). A hit asks for `bank_change_alert`, which
 * blocks payments at once; the alert reads the flags (look-alike domain, first email, domain age) itself.
 */
export async function watchBankChange(messageId: string): Promise<boolean> {
  const m = await opsDb.mailMessage.findUnique({
    where: { id: messageId },
    select: { fromAddress: true, bodyText: true, direction: true, origin: true },
  })
  if (!m || m.direction !== 'inbound' || m.origin !== 'live' || !m.bodyText) return false
  const match = (await matchCompanyBySender(m.fromAddress)).match
  if (!match?.isSupplier) return false
  const known = await opsDb.supplierBankAccount.findMany({
    where: { supplierId: match.companyId, supersededAt: null },
    select: { ibanLast4: true },
  })
  const d = detectBankChangeRequest({
    text: m.bodyText.slice(0, 20_000),
    knownIbanLast4: known.map((k) => k.ibanLast4),
    lookalikeDomain: false,
    firstEmailFromAddress: false,
    domainAgeDays: null,
  })
  if (!d.isRequest) return false
  await requestAction({
    actionKey: 'bank_change_alert',
    subjectType: 'mail_message',
    subjectId: messageId,
    trigger: 'mail.classified',
    origin: 'live',
    sourceVersion: messageId,
  })
  return true
}
