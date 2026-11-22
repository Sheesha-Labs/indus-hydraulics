import { T7Settings } from '@indus/ops-ui/templates'
import type { ReactNode } from 'react'
import SettingsHeader from '../../../components/route/SettingsHeader'
import SubNav from '../../../components/route/SubNav'
import { SETTINGS_NAV } from '../../../lib/settings-nav'

/**
 * Settings (T7, board 212 is canonical, C41): one sub-nav on every settings page, grouped Company · People
 * · Mail · Assistant · Selling · Documents · Intake · Integrations · Data. The header and sub-nav persist;
 * the pages fill the sections column. Not an authorization boundary: every settings page calls
 * requireOpsUser() itself (S34 makes the Owner-only ones requireOwner()).
 */
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <T7Settings header={<SettingsHeader />} subnav={<SubNav groups={SETTINGS_NAV} />}>
      <div className="py-6">{children}</div>
    </T7Settings>
  )
}
