import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { orderRef, routeParam } from '../../../../../lib/route-params'

/** Freight tab of an order (T2, C11). S25 builds it. */
export default async function OrdersRefFreightPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/orders/${ref}/freight`))
  routeParam(orderRef, ref)
  return <Arrives sprint="S25" what="Boards 43 and 72: freight quotes and the booking." />
}
