import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › notifications (T7 body; the layout draws the header and sub-nav). S30 builds it. */
export default async function SettingsNotificationsPage() {
  await requireOpsUser().catch(signInFor(`/settings/notifications`))
  return <Arrives sprint="S30" what="Board 181: what reaches you, how and when." />
}
