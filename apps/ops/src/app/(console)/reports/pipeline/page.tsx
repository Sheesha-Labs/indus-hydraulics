import Arrives from '../../../../components/skeleton/Arrives'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Report (T1, Reports tabs). S33 builds it. */
export default async function ReportsPipelinePage() {
  await requireOpsUser().catch(signInFor(`/reports/pipeline`))
  return <Arrives sprint="S33" what="Board 55: open enquiries and quotations by stage and value." />
}
