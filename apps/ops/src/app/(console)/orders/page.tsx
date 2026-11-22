import IndexSkeleton from '../../../components/skeleton/IndexSkeleton'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/** Board 202 columns · Orders (T1 Index). S24 builds it; S02-T07 placeholder. */
export default async function OrdersPage() {
  await requireOpsUser().catch(signInFor(`/orders`))
  return (
    <IndexSkeleton
      crumb="Work"
      title="Orders"
      sprint="S24"
      what="Every order after the win, with its stage and next step."
    />
  )
}
