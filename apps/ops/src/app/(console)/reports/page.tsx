import { redirect } from 'next/navigation'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/** `/reports` opens the first report, Overdue (the sidebar links there directly). */
export default async function ReportsPage() {
  await requireOpsUser().catch(signInFor('/reports'))
  redirect('/reports/overdue')
}
