import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { orderRef, routeParam } from '../../../../../lib/route-params'

/** Invoices tab of an order (T2, C11). S26 builds it. */
export default async function OrdersRefInvoicesPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/orders/${ref}/invoices`))
  routeParam(orderRef, ref)
  return <Arrives sprint="S26" what="Board 46: the tax invoice and what is owed." />
}
