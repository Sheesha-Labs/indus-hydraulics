import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › company (T7 body; the layout draws the header and sub-nav). S34 builds it. */
export default async function SettingsCompanyPage() {
  await requireOpsUser().catch(signInFor(`/settings/company`))
  return (
    <Arrives
      sprint="S34"
      what="Board 213: the legal name, TRN, address and logo printed on every document."
    />
  )
}
