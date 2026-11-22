import IndexSkeleton from '../../../components/skeleton/IndexSkeleton'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/** Board 160 · Quotations (T1 Index). S23 builds it; S02-T07 placeholder. */
export default async function QuotationsPage() {
  await requireOpsUser().catch(signInFor(`/quotations`))
  return (
    <IndexSkeleton
      crumb="Work"
      title="Quotations"
      sprint="S23"
      what="Board 160: every quotation, awaiting, draft, won, lost or superseded."
    />
  )
}
