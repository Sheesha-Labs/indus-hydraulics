import ReviewSkeleton from '../../../components/skeleton/ReviewSkeleton'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/** Board 104 · Review (T4 Review queue). S06 builds it. */
export default async function ReviewPage() {
  await requireOpsUser().catch(signInFor(`/review`))
  return (
    <ReviewSkeleton
      variant="queue"
      crumb="Workspace"
      title="Review"
      sprint="S06"
      what="Board 104: the Assistant's proposals waiting for a person, each opened as a proposal card."
    />
  )
}
