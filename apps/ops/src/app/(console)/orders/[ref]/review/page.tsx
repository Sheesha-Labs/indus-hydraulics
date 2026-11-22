import ReviewSkeleton from '../../../../../components/skeleton/ReviewSkeleton'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { orderRef, routeParam } from '../../../../../lib/route-params'

/** Board 194 · One review of every order document (T4 bundle). A page of the order without its cockpit. S24 builds it. */
export default async function OrdersRefReviewPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/orders/${ref}/review`))
  const order = routeParam(orderRef, ref)
  return (
    <ReviewSkeleton
      variant="bundle"
      crumb={`Orders / ${order}`}
      title="Order documents"
      sprint="S24"
      what="Board 194: one review of every document the won quotation needs."
    />
  )
}
