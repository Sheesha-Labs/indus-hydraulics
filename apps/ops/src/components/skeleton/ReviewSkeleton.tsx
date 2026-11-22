import { Card } from '@indus/ops-ui/card'
import { PageHeader } from '@indus/ops-ui/shell'
import { T4Review } from '@indus/ops-ui/templates'
import Arrives, { type Sprint } from './Arrives'

export interface ReviewSkeletonProps {
  /** queue: the Review page (T4a); bundle: one card for many documents (194); single-approver (204). */
  variant: 'queue' | 'bundle' | 'single-approver'
  crumb: string
  title: string
  sprint: Sprint
  what: string
}

/** T4 Review skeleton in its three variants. Nothing to approve yet, so no ProposalCard. */
export default function ReviewSkeleton({
  variant,
  crumb,
  title,
  sprint,
  what,
}: ReviewSkeletonProps) {
  const header = <PageHeader crumb={crumb} title={title} />
  const detail = <Arrives sprint={sprint} what={what} />
  if (variant === 'bundle')
    return (
      <T4Review
        variant="bundle"
        header={header}
        documentTabs={null}
        bundle={<Card eyebrow="Documents" text="The order documents, one tab each." />}
        detail={detail}
      />
    )
  if (variant === 'single-approver')
    return (
      <T4Review
        variant="single-approver"
        header={header}
        detail={detail}
        side={<Card eyebrow="Status" text="The instruction and its checks." />}
      />
    )
  return (
    <T4Review
      header={header}
      queue={<Card eyebrow="Queue" text="Proposals waiting for a person." />}
      detail={detail}
    />
  )
}
