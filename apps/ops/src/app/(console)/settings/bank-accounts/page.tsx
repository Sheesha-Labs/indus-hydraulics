import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Settings › bank-accounts (T7 body; the layout draws the header and sub-nav). S34 builds it. */
export default async function SettingsBankAccountsPage() {
  await requireOpsUser().catch(signInFor(`/settings/bank-accounts`))
  return (
    <Arrives
      sprint="S34"
      what="The bank accounts printed on quotations and invoices. A change needs a call-back."
    />
  )
}
