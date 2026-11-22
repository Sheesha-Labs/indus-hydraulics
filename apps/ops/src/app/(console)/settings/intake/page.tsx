import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › intake (T7 body; the layout draws the header and sub-nav). S19 builds it. */
export default async function SettingsIntakePage() {
  await requireOpsUser().catch(signInFor(`/settings/intake`))
  return (
    <Arrives sprint="S19" what="Boards 235 and 236: website enquiries and call-back requests." />
  )
}
