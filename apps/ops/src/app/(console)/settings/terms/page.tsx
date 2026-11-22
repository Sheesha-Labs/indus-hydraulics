import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › terms (T7 body; the layout draws the header and sub-nav). S11 builds it. */
export default async function SettingsTermsPage() {
  await requireOpsUser().catch(signInFor(`/settings/terms`))
  return <Arrives sprint="S11" what="Board 39: the offer terms printed on quotations." />
}
