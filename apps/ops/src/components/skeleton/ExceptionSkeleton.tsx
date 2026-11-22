import { Card } from '@indus/ops-ui/card'
import { PageHeader } from '@indus/ops-ui/shell'
import { X1Exception } from '@indus/ops-ui/templates'
import Arrives, { type Sprint } from './Arrives'

export interface ExceptionSkeletonProps {
  crumb: string
  title: string
  sprint: Sprint
  what: string
}

/** X1 Exception page skeleton: the decision column and the drafted-emails column. */
export default function ExceptionSkeleton({ crumb, title, sprint, what }: ExceptionSkeletonProps) {
  return (
    <X1Exception
      header={<PageHeader crumb={crumb} title={title} />}
      main={<Arrives sprint={sprint} what={what} />}
      side={
        <Card eyebrow="Drafted emails" text="The emails the Assistant drafts for a decision." />
      }
    />
  )
}
