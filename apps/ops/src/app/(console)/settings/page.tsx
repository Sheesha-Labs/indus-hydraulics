import Arrives from '../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/** Board 212 · Settings home (T7 body; the layout draws the header and sub-nav). S34 builds it. */
export default async function SettingsPage() {
  await requireOpsUser().catch(signInFor(`/settings`))
  return (
    <Arrives
      sprint="S34"
      what="Board 212: every setting by group, and the state of each integration."
    />
  )
}
