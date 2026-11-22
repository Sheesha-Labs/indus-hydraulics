import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › integrations (T7 body; the layout draws the header and sub-nav). S34 builds it. */
export default async function SettingsIntegrationsPage() {
  await requireOpsUser().catch(signInFor(`/settings/integrations`))
  return (
    <Arrives sprint="S34" what="Board 218: Google, Zoho Books and the website, and their health." />
  )
}
