import IndexSkeleton from '../../../components/skeleton/IndexSkeleton'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/** Board 234 · Call-backs (T1 Index). S19 builds it; S02-T07 placeholder. */
export default async function CallbacksPage() {
  await requireOpsUser().catch(signInFor(`/callbacks`))
  return (
    <IndexSkeleton
      crumb="Workspace"
      title="Call-backs"
      sprint="S19"
      what="Board 234: call-back requests from the website, oldest first."
    />
  )
}
