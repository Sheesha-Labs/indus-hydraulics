import DashboardSkeleton from '../../../../../components/skeleton/DashboardSkeleton'
import { requireOpsUser } from '../../../../../lib/access'
import { signInFor } from '../../../../../lib/page-access'
import { month as monthParam, routeParam } from '../../../../../lib/route-params'

/** Board 206 · Month close (T8 dashboard: KPI strip, orders, checklist). S27 builds it. */
export default async function MoneyCloseMonthPage({
  params,
}: {
  params: Promise<{ month: string }>
}) {
  const { month } = await params
  await requireOpsUser().catch(signInFor(`/money/close/${month}`))
  const period = routeParam(monthParam, month)
  return (
    <DashboardSkeleton
      crumb="Money"
      title={`Month close · ${period}`}
      sprint="S27"
      what="Board 206: the month's checklist, from invoices and payments to the Zoho Books reconciliation."
    />
  )
}
