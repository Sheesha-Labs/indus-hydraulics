import DashboardSkeleton from '../../../components/skeleton/DashboardSkeleton'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/** Board 202 · Money (T8 dashboard). S27 builds it. */
export default async function MoneyPage() {
  await requireOpsUser().catch(signInFor(`/money`))
  return (
    <DashboardSkeleton
      crumb="Work"
      title="Money"
      sprint="S27"
      what="Board 202: cash in and out, invoices due and payments waiting."
    />
  )
}
