import { Card } from '@indus/ops-ui/card'
import { PageHeader } from '@indus/ops-ui/shell'
import { T8Today } from '@indus/ops-ui/templates'
import Arrives, { type Sprint } from './Arrives'

export interface DashboardSkeletonProps {
  crumb: string
  title: string
  sprint: Sprint
  what: string
}

/** T8 Today, dashboard variant (board 202): a KPI row and two columns of cards. */
export default function DashboardSkeleton({ crumb, title, sprint, what }: DashboardSkeletonProps) {
  return (
    <T8Today variant="dashboard" header={<PageHeader crumb={crumb} title={title} />}>
      <Arrives sprint={sprint} what={what} />
      <Card eyebrow="At a glance" text="Figures and lists arrive with the page." />
    </T8Today>
  )
}
