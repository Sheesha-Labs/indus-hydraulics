import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › documents (T7 body; the layout draws the header and sub-nav). S11 builds it. */
export default async function SettingsDocumentsPage() {
  await requireOpsUser().catch(signInFor(`/settings/documents`))
  return (
    <Arrives
      sprint="S11"
      what="Board 213: the trade licence, VAT certificate and other company documents."
    />
  )
}
