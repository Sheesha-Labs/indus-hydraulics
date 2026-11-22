import { redirect } from 'next/navigation'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/** `/mail` (the sidebar's Mail) opens All mail: every folder is a segment of its own (boards 91, 94). */
export default async function MailPage() {
  await requireOpsUser().catch(signInFor('/mail'))
  redirect('/mail/all')
}
