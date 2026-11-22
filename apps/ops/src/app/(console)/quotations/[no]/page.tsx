import { notFound } from 'next/navigation'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { quotationNo, routeParam } from '../../../../lib/route-params'

/**
 * `/quotations/Q10001-R2` → the owning enquiry's Quotation tab (05 §6.1; `INDUS/` is dropped because a
 * slash cannot sit in a segment). S17 resolves the number to its enquiry and redirects there
 * (`redirect`, not permanent: a quotation can be re-homed by a merge). Until then nothing resolves, so a
 * well-formed number shows board 211's "not imported" state and a malformed one the same not-found.
 */
export default async function QuotationPage({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params
  await requireOpsUser().catch(signInFor(`/quotations/${no}`))
  routeParam(quotationNo, no)
  notFound()
}
