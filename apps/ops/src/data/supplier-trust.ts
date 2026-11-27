import 'server-only'
import { canPaySupplier, maskedIban, tierChecklist } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { maskIbans, phonesInMessage } from '../server/directory/bank'
import { previewBlockEffects } from '../server/directory/block'

/**
 * Boards 130–132 reads (S10-T07): the promotion checklist, the block effects, and the bank-change alert (the email,
 * its flags, the account on file and the requested one as bank + last 4 only, the number on file and the numbers in
 * the email marked "do not use"). Never an IBAN in clear.
 */
const DT = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
const D = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: 'numeric', month: 'short', year: 'numeric' })
const fmt = (d: Date) => DT.format(d).replace('Sept', 'Sep').replace(',', '')

export async function promoteData(supplierId: string) {
  const c = await opsDb.company.findUnique({
    where: { id: supplierId },
    select: {
      name: true,
      primaryDomain: true,
      supplierProfile: { select: { tier: true, posCount: true, onboardingStatus: true } },
      complianceDocs: { where: { kind: 'trade_licence', archivedAt: null }, select: { id: true, status: true } },
      bankAccounts: { where: { supersededAt: null }, select: { status: true } },
      screenings: { where: { listName: { not: null } }, orderBy: { checkedAt: 'desc' }, take: 10, select: { result: true } },
    },
  })
  if (!c?.supplierProfile) return null
  const screening = c.screenings.some((s) => s.result === 'hit') ? 'hit' : c.screenings.length && c.screenings.every((s) => s.result === 'clear') ? 'clear' : 'open'
  const bank = c.bankAccounts.some((b) => b.status === 'pending_verification') ? 'pending' : c.bankAccounts.some((b) => b.status === 'verified') ? 'verified' : 'none'
  return {
    name: c.name,
    tier: c.supplierProfile.tier,
    posCount: c.supplierProfile.posCount,
    rows: tierChecklist({
      licenceEvidence: c.complianceDocs.some((d) => d.status === 'received'),
      domainAgeDays: null,
      domainMatchesName: !!c.primaryDomain && c.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(c.primaryDomain.split('.')[0]!.replace(/[^a-z0-9]/g, '').slice(0, 6)),
      blocked: c.supplierProfile.tier === 'blocked',
      screening,
      bank,
    }),
    open: await opsDb.assistantAction.findFirst({
      where: { actionKey: 'promote_supplier', subjectId: supplierId, state: { in: ['proposed', 'later'] } },
      select: { id: true, ref: true },
    }),
  }
}

export async function blockData(supplierId: string) {
  const c = await opsDb.company.findUnique({
    where: { id: supplierId },
    select: { name: true, supplierProfile: { select: { tier: true, blockReason: true, blockNote: true, blockedAt: true } } },
  })
  if (!c?.supplierProfile) return null
  return {
    name: c.name,
    tier: c.supplierProfile.tier,
    blockedAt: c.supplierProfile.blockedAt ? D.format(c.supplierProfile.blockedAt) : null,
    blockReason: c.supplierProfile.blockReason,
    effects: await previewBlockEffects(supplierId),
  }
}

export async function bankChangeData(supplierId: string, accountId: string) {
  const acc = await opsDb.supplierBankAccount.findFirst({
    where: { id: accountId, supplierId },
    select: {
      id: true,
      status: true,
      bankName: true,
      ibanLast4: true,
      requestedAt: true,
      requestedViaMessageId: true,
      riskFlags: true,
      coolingOffUntil: true,
      callbackOutcome: true,
      supplier: {
        select: {
          name: true,
          phone: true,
          supplierProfile: { select: { tier: true, registryPhone: true } },
          bankAccounts: {
            where: { status: 'verified', supersededAt: null, id: { not: accountId } },
            orderBy: { verifiedAt: 'desc' },
            take: 1,
            select: { bankName: true, ibanLast4: true, verifiedAt: true },
          },
        },
      },
    },
  })
  if (!acc) return null
  const msg = acc.requestedViaMessageId
    ? await opsDb.mailMessage.findUnique({
        where: { id: acc.requestedViaMessageId },
        select: { id: true, fromAddress: true, sentAt: true, bodyText: true, threadId: true },
      })
    : null
  const flags = (acc.riskFlags ?? {}) as {
    lookalikeDomain?: boolean
    firstEmailFromAddress?: boolean
    urgency?: boolean
    domainAgeDays?: number | null
    risk?: string
    domain?: string
  }
  const onFile = acc.supplier.bankAccounts[0] ?? null
  const now = new Date()
  const gate = canPaySupplier({
    tier: acc.supplier.supplierProfile?.tier ?? 'contact_only',
    now,
    accounts: await opsDb.supplierBankAccount.findMany({
      where: { supplierId },
      select: { status: true, currency: true, coolingOffUntil: true, supersededAt: true },
    }),
  })
  return {
    supplierName: acc.supplier.name,
    tier: acc.supplier.supplierProfile?.tier ?? 'contact_only',
    status: acc.status,
    outcome: acc.callbackOutcome,
    coolingOffUntil: acc.coolingOffUntil && acc.coolingOffUntil > now ? fmt(acc.coolingOffUntil) : null,
    gate: gate.allowed ? 'Payments allowed' : `Blocked · ${gate.reason.replace(/_/g, ' ')}${'until' in gate && gate.until ? ` until ${fmt(gate.until)}` : ''}`,
    email: msg ? { from: msg.fromAddress, at: fmt(msg.sentAt), text: maskIbans(msg.bodyText ?? '').slice(0, 1200), threadId: msg.threadId } : null,
    flags: [
      ...(flags.lookalikeDomain ? [{ mark: 'bad' as const, title: `Domain ${flags.domain ?? ''} looks like the supplier's`, sub: 'Not the domain used before' }] : []),
      ...(flags.domainAgeDays != null && flags.domainAgeDays < 90 ? [{ mark: 'bad' as const, title: `Domain registered ${flags.domainAgeDays} days ago`, sub: flags.domain ?? '' }] : []),
      ...(flags.firstEmailFromAddress ? [{ mark: 'bad' as const, title: 'First email from this address', sub: 'Not in any earlier thread' }] : []),
      ...(flags.urgency ? [{ mark: 'warn' as const, title: 'Asks for payment now', sub: 'Urgency is a common fraud sign' }] : []),
    ],
    risk: flags.risk ?? 'high',
    onFile: onFile ? { bank: onFile.bankName, masked: maskedIban(onFile.ibanLast4), verified: onFile.verifiedAt ? D.format(onFile.verifiedAt) : null } : null,
    requested: { bank: acc.bankName, masked: acc.ibanLast4 === '----' ? 'No IBAN in the email' : maskedIban(acc.ibanLast4) },
    numberOnFile: acc.supplier.supplierProfile?.registryPhone ?? acc.supplier.phone ?? null,
    numbersInEmail: msg ? await phonesInMessage(opsDb, msg.id) : [],
  }
}

/** S27's payment gate for one supplier (exported for the money engine). */
export async function supplierPaymentGate(supplierId: string, currency?: string | null) {
  const [p, accounts] = await Promise.all([
    opsDb.supplierProfile.findUnique({ where: { companyId: supplierId }, select: { tier: true } }),
    opsDb.supplierBankAccount.findMany({ where: { supplierId }, select: { status: true, currency: true, coolingOffUntil: true, supersededAt: true } }),
  ])
  return canPaySupplier({ tier: p?.tier ?? 'contact_only', currency: currency ?? null, now: new Date(), accounts })
}
