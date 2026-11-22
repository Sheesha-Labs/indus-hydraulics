import ExceptionSkeleton from '../../../../../components/skeleton/ExceptionSkeleton'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { invoiceNo, routeParam } from '../../../../../lib/route-params'

/** Board 203 · Client invoice (X1 Exception page). S27 builds it. */
export default async function MoneyInvoicesNoPage({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params
  await requireOpsUser().catch(signInFor(`/money/invoices/${no}`))
  const invoice = routeParam(invoiceNo, no)
  return (
    <ExceptionSkeleton
      crumb="Money / Invoices"
      title={invoice}
      sprint="S27"
      what="Board 203: one client invoice from issue to paid, with reminders and disputes."
    />
  )
}
