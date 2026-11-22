import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › pricing (T7 body; the layout draws the header and sub-nav). S34 builds it. */
export default async function SettingsPricingPage() {
  await requireOpsUser().catch(signInFor(`/settings/pricing`))
  return <Arrives sprint="S34" what="Board 215: default margins, VAT treatment and FX sources." />
}
