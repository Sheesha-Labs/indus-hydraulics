import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › privacy (T7 body; the layout draws the header and sub-nav). S34 builds it. */
export default async function SettingsPrivacyPage() {
  await requireOpsUser().catch(signInFor(`/settings/privacy`))
  return <Arrives sprint="S34" what="Board 217: export, retention and deletion." />
}
