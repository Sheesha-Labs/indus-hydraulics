import IndexSkeleton from '../../../components/skeleton/IndexSkeleton'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/** Board 04 · Enquiries (T1 Index). S09 builds it; S02-T07 placeholder. */
export default async function EnquiriesPage() {
  await requireOpsUser().catch(signInFor(`/enquiries`))
  return (
    <IndexSkeleton
      crumb="Work"
      title="Enquiries"
      sprint="S09"
      what="Board 04: every enquiry by stage, as a table or a board."
    />
  )
}
