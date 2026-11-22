import IndexSkeleton from '../../../components/skeleton/IndexSkeleton'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/** Board 128 · Suppliers (T1 Index). S10 builds it; S02-T07 placeholder. */
export default async function SuppliersPage() {
  await requireOpsUser().catch(signInFor(`/suppliers`))
  return (
    <IndexSkeleton
      crumb="Directory"
      title="Suppliers"
      sprint="S10"
      preview
      what="Board 128: every supplier with its tier, coverage and recent quotes."
    />
  )
}
