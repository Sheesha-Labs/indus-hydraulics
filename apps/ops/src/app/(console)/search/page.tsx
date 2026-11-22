import IndexSkeleton from '../../../components/skeleton/IndexSkeleton'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/** Board 209 · Search (T1 Index). S31 builds it; S02-T07 placeholder. */
export default async function SearchPage() {
  await requireOpsUser().catch(signInFor(`/search`))
  return (
    <IndexSkeleton
      crumb="Workspace"
      title="Search"
      sprint="S31"
      what="Board 209: results across records, mail and attachments, by any reference."
    />
  )
}
