import { PageHeader } from '@indus/ops-ui/shell'
import { T7Settings } from '@indus/ops-ui/templates'
import type { ReactNode } from 'react'
import Arrives, { type Sprint } from './Arrives'

export interface SettingsSkeletonProps {
  crumb: string
  title: string
  /** The sub-nav (SubNav), in T7's navigation landmark. */
  subnav: ReactNode
  subnavLabel?: string
  sprint: Sprint
  what: string
}

/**
 * T7 Settings form skeleton for pages outside /settings that use the template: the Assistant pages, a
 * client or part profile, document sharing. (/settings/* renders T7 once, in settings/layout.tsx.)
 */
export default function SettingsSkeleton({
  crumb,
  title,
  subnav,
  subnavLabel,
  sprint,
  what,
}: SettingsSkeletonProps) {
  return (
    <T7Settings
      header={<PageHeader crumb={crumb} title={title} />}
      subnav={subnav}
      {...(subnavLabel ? { subnavLabel } : {})}
    >
      <div className="py-6">
        <Arrives sprint={sprint} what={what} />
      </div>
    </T7Settings>
  )
}
