import { Card } from '@indus/ops-ui/card'
import { PageHeader } from '@indus/ops-ui/shell'
import { T1Index } from '@indus/ops-ui/templates'
import type { ReactNode } from 'react'
import Arrives, { type Sprint } from './Arrives'

export interface IndexSkeletonProps {
  /** 11.5 line above the title: the sidebar group ("Work", "Directory"). */
  crumb: string
  title: string
  sprint: Sprint
  what: string
  /** T1b: the 360 preview of the selected row (suppliers). */
  preview?: boolean
  /** Header actions (secondary links only; the page's one primary arrives with its sprint). */
  actions?: ReactNode
}

/** T1 Index list skeleton: the page header, then the list's placeholder (and the T1b preview column). */
export default function IndexSkeleton({
  crumb,
  title,
  sprint,
  what,
  preview,
  actions,
}: IndexSkeletonProps) {
  return (
    <T1Index
      header={<PageHeader crumb={crumb} title={title} {...(actions ? { actions } : {})} />}
      {...(preview
        ? {
            preview: (
              <Card eyebrow="Preview" text="The selected row opens here with its activity." />
            ),
          }
        : {})}
    >
      <Arrives sprint={sprint} what={what} />
    </T1Index>
  )
}
