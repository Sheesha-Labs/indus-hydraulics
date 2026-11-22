'use client'

import { PageHeader } from '@indus/ops-ui/shell'
import { usePathname } from 'next/navigation'
import { settingsTitle } from '../../lib/settings-nav'

/**
 * The settings page header (board 212: crumb "Settings", the section as the title). The settings layout
 * renders T7 once for every /settings page, so the title follows the URL here rather than in each page.
 * S34 adds Save to its actions when a form is dirty (219).
 */
export default function SettingsHeader() {
  return <PageHeader crumb="Settings" title={settingsTitle(usePathname())} />
}
