import ExceptionSkeleton from '../../../../../../components/skeleton/ExceptionSkeleton'
import { requireOpsUser } from '../../../../../../lib/access'
import { signInFor } from '../../../../../../lib/page-access'
import type { OrderException } from '../../../../../../lib/route-params'
import { orderExceptionKind, orderRef, routeParam } from '../../../../../../lib/route-params'

const TITLE: Readonly<Record<OrderException, string>> = {
  collection: 'Collection problem',
  'failed-inspection': 'Failed inspection',
  'cannot-deliver': 'Cannot deliver',
  'client-change': 'Client change',
  claim: 'Claim',
  'supplier-documents': 'Supplier documents missing',
  reissue: 'Reissue a document',
}

/** Boards 195–201 · Order exceptions (X1 Exception page). A page of the order without its cockpit. S28 builds it. */
export default async function OrdersRefExceptionsKindPage({
  params,
}: {
  params: Promise<{ ref: string; kind: string }>
}) {
  const { ref, kind } = await params
  await requireOpsUser().catch(signInFor(`/orders/${ref}/exceptions/${kind}`))
  const order = routeParam(orderRef, ref)
  const exception = routeParam(orderExceptionKind, kind)
  return (
    <ExceptionSkeleton
      crumb={`Orders / ${order}`}
      title={TITLE[exception]}
      sprint="S28"
      what="Boards 195 to 201: what happened, the decision to take and the emails drafted for it."
    />
  )
}
