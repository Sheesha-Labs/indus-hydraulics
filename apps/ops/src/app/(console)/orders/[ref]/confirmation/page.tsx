import Arrives from '../../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { orderRef, routeParam } from '../../../../../lib/route-params'

/** Confirmation tab of an order (T2, C11). S24 builds it. */
export default async function OrdersRefConfirmationPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/orders/${ref}/confirmation`))
  routeParam(orderRef, ref)
  return (
    <Arrives
      sprint="S24"
      what="Board 38: the client’s PO checked against the quotation, and the order acknowledgement."
    />
  )
}
