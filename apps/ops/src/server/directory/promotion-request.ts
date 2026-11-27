import 'server-only'
import { suggestApprovedPromotion } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import { requestActionQuietly } from '../assistant/request'
import { getSetting } from '../settings/get'

/**
 * The two automatic triggers of `promote_supplier` (S10-T07), exported for later sprints. Both only ask: the
 * card goes to Review and a person decides. One request per supplier per day (the source version carries the
 * date), so a second PO draft the same day does not add a second card.
 */
const day = (now: Date) => now.toISOString().slice(0, 10)

/**
 * S24: a supplier PO draft targets a Contact-only supplier. Asks for the Trial promotion with the PO's value in
 * view. Nothing for any other tier (Trial counts against its limit in S24; Blocked never gets a PO).
 */
export async function requestPromotionForPo(
  supplierId: string,
  po: { ref: string; amount: string; currency: string },
  now = new Date()
): Promise<boolean> {
  const p = await opsDb.supplierProfile.findUnique({
    where: { companyId: supplierId },
    select: { tier: true },
  })
  if (p?.tier !== 'contact_only') return false
  return requestActionQuietly({
    actionKey: 'promote_supplier',
    subjectType: 'company',
    subjectId: supplierId,
    trigger: 'po_draft',
    origin: 'live',
    sourceVersion: `trial:po:${po.ref}:${po.currency} ${po.amount}:${day(now)}`,
  })
}

/**
 * S26: called after each delivered PO. Suggests Trial → Approved once the setting's number of POs arrived on
 * time with no late delivery and no quality claim.
 */
export async function requestApprovedSuggestion(
  supplierId: string,
  history: { deliveredOnTime: number; deliveredLate: number; qualityClaims: number },
  now = new Date()
): Promise<boolean> {
  const [p, trust] = await Promise.all([
    opsDb.supplierProfile.findUnique({ where: { companyId: supplierId }, select: { tier: true } }),
    getSetting('suppliers.trust'),
  ])
  if (
    !p ||
    !suggestApprovedPromotion({
      tier: p.tier,
      ...history,
      approvedAfterPos: trust.approvedAfterPos,
    })
  )
    return false
  return requestActionQuietly({
    actionKey: 'promote_supplier',
    subjectType: 'company',
    subjectId: supplierId,
    trigger: 'po_delivered',
    origin: 'live',
    sourceVersion: `approved:${day(now)}`,
  })
}
