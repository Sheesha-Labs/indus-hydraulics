import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › sending (T7 body; the layout draws the header and sub-nav). S04 builds it. */
export default async function SettingsSendingPage() {
  await requireOpsUser().catch(signInFor(`/settings/sending`))
  return <Arrives sprint="S04" what="Board 87: send windows, caps and the undo delay." />
}
