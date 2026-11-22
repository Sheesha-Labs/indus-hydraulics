import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › accounting (T7 body; the layout draws the header and sub-nav). S27 builds it. */
export default async function SettingsAccountingPage() {
  await requireOpsUser().catch(signInFor(`/settings/accounting`))
  return (
    <Arrives sprint="S27" what="Board 205: how orders, invoices and payments post to Zoho Books." />
  )
}
