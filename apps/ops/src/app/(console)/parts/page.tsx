import IndexSkeleton from '../../../components/skeleton/IndexSkeleton'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/** Board 162 · Parts (T1 Index). S29 builds it; S02-T07 placeholder. */
export default async function PartsPage() {
  await requireOpsUser().catch(signInFor(`/parts`))
  return (
    <IndexSkeleton
      crumb="Directory"
      title="Parts"
      sprint="S29"
      what="Board 162: every part quoted or bought, with its price memory."
    />
  )
}
