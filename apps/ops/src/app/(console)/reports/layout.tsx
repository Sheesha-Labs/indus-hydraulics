import { PageHeader } from '@indus/ops-ui/shell'
import { T1Index } from '@indus/ops-ui/templates'
import type { ReactNode } from 'react'
import SegmentTabs from '../../../components/route/SegmentTabs'
import { to } from '../../../lib/routes'

const TABS = [
  { key: 'overdue', label: 'Overdue', href: to('/reports/overdue') },
  { key: 'winloss', label: 'Win / loss', href: to('/reports/winloss') },
  { key: 'pipeline', label: 'Pipeline', href: to('/reports/pipeline') },
]

/**
 * Reports (boards 53–55, T1): the page header with one tab per report persists; each report fills the
 * list. Not an authorization boundary: every report page calls requireOpsUser() itself.
 */
export default function ReportsLayout({ children }: { children: ReactNode }) {
  return (
    <T1Index
      header={
        <PageHeader
          crumb="Insight"
          title="Reports"
          tabs={<SegmentTabs items={TABS} aria-label="Reports" />}
        />
      }
    >
      {children}
    </T1Index>
  )
}
