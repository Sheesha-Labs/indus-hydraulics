import IndexSkeleton from '../../../../components/skeleton/IndexSkeleton'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'

/** Board 111 · Assistant log (T1 Index). S06 builds it; S02-T07 placeholder. */
export default async function AssistantLogPage() {
  await requireOpsUser().catch(signInFor(`/assistant/log`))
  return (
    <IndexSkeleton
      crumb="Assistant"
      title="Assistant log"
      sprint="S06"
      what="Board 111: every action the Assistant took or proposed, append-only."
    />
  )
}
