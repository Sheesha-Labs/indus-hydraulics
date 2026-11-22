import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › mailboxes (T7 body; the layout draws the header and sub-nav). S04 builds it. */
export default async function SettingsMailboxesPage() {
  await requireOpsUser().catch(signInFor(`/settings/mailboxes`))
  return <Arrives sprint="S04" what="Board 85: sales@ and purchase@, their connection and sync." />
}
