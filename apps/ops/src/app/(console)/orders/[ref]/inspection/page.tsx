import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { orderRef, routeParam } from '../../../../../lib/route-params'

/** Inspection tab of an order (T2, C11). S25 builds it. */
export default async function OrdersRefInspectionPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/orders/${ref}/inspection`))
  routeParam(orderRef, ref)
  return <Arrives sprint="S25" what="Board 42: inspection before shipment." />
}
