import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › document-templates (T7 body; the layout draws the header and sub-nav). S11 builds it. */
export default async function SettingsDocumentTemplatesPage() {
  await requireOpsUser().catch(signInFor(`/settings/document-templates`))
  return (
    <Arrives
      sprint="S11"
      what="Board 57: the layouts of quotations, POs, invoices and other documents."
    />
  )
}
