import { redirect } from 'next/navigation'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { ORDER_TABS } from '../../../../lib/record-tabs'
import { orderRef, routeParam } from '../../../../lib/route-params'

/** `/orders/[ref]` opens the first tab, Confirmation: every order tab is a real step (05 §6.1). */
export default async function OrderPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/orders/${ref}`))
  redirect(ORDER_TABS[0].href(routeParam(orderRef, ref)))
}
