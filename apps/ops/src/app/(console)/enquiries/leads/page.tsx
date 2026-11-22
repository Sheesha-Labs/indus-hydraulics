import IndexSkeleton from '../../../../components/skeleton/IndexSkeleton'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Board 22 · Leads (T1 Index). S09 builds it; S02-T07 placeholder. */
export default async function EnquiriesLeadsPage() {
  await requireOpsUser().catch(signInFor(`/enquiries/leads`))
  return (
    <IndexSkeleton
      crumb="Work · Enquiries"
      title="Leads"
      sprint="S09"
      what="Boards 22 and 23: leads not yet qualified into enquiries."
    />
  )
}
