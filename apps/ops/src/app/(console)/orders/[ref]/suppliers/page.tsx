import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { orderRef, routeParam } from '../../../../../lib/route-params'

/** Suppliers tab of an order (T2, C11). S24 builds it. */
export default async function OrdersRefSuppliersPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/orders/${ref}/suppliers`))
  routeParam(orderRef, ref)
  return <Arrives sprint="S24" what="Boards 70, 71 and 41: supplier POs and production chasing." />
}
