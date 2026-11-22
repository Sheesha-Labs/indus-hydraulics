import { PageHeader } from '@indus/ops-ui/shell'
import { T10Gantt } from '@indus/ops-ui/templates'
import Arrives, { type Sprint } from './Arrives'

export interface GanttSkeletonProps {
  crumb: string
  title: string
  sprint: Sprint
  what: string
}

/** T10 Calendar / Gantt skeleton (tasks). */
export default function GanttSkeleton({ crumb, title, sprint, what }: GanttSkeletonProps) {
  return (
    <T10Gantt header={<PageHeader crumb={crumb} title={title} />}>
      <Arrives sprint={sprint} what={what} />
    </T10Gantt>
  )
}
