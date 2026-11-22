import GanttSkeleton from '../../../components/skeleton/GanttSkeleton'
import { requireOpsUser } from '../../../lib/access'
import { signInFor } from '../../../lib/page-access'

/** Board 56 · Tasks and calendar (T10). S30 builds it. */
export default async function TasksPage() {
  await requireOpsUser().catch(signInFor(`/tasks`))
  return (
    <GanttSkeleton
      crumb="Workspace"
      title="Tasks"
      sprint="S30"
      what="Board 56: tasks and the week's calendar."
    />
  )
}
