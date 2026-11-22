import ReviewSkeleton from '../../../../../components/skeleton/ReviewSkeleton'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { recordId, routeParam } from '../../../../../lib/route-params'

/** Board 204 · Supplier payment (T4 single approver). S27 builds it. */
export default async function MoneyPaymentsIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireOpsUser().catch(signInFor(`/money/payments/${id}`))
  routeParam(recordId, id)
  return (
    <ReviewSkeleton
      variant="single-approver"
      crumb="Money / Payments"
      title="Supplier payment"
      sprint="S27"
      what="Board 204: one supplier payment, its checks and the bank call-back, for one approver."
    />
  )
}
