import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Report (T1, Reports tabs). S33 builds it. */
export default async function ReportsWinlossPage() {
  await requireOpsUser().catch(signInFor(`/reports/winloss`))
  return <Arrives sprint="S33" what="Board 54: quotations won and lost, and why." />
}
