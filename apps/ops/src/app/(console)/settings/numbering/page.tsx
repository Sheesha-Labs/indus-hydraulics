import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › numbering (T7 body; the layout draws the header and sub-nav). S11 builds it. */
export default async function SettingsNumberingPage() {
  await requireOpsUser().catch(signInFor(`/settings/numbering`))
  return <Arrives sprint="S11" what="Board 214: the number format of every document series." />
}
