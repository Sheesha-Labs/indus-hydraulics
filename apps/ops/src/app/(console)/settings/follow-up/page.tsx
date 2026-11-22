import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › follow-up (T7 body; the layout draws the header and sub-nav). S34 builds it. */
export default async function SettingsFollowUpPage() {
  await requireOpsUser().catch(signInFor(`/settings/follow-up`))
  return (
    <Arrives sprint="S34" what="How often the Assistant follows up with clients and suppliers." />
  )
}
