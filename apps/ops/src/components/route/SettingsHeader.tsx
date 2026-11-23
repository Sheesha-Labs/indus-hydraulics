'use client'

import { ButtonLink } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { usePathname } from 'next/navigation'
import { settingsTitle } from '../../lib/settings-nav'

/**
 * The settings page header (board 212: crumb "Settings", the section as the title). The settings layout
 * renders T7 once for every /settings page, so the title follows the URL here rather than in each page.
 * A few pages carry the board's own header extra: Mailboxes (85) links to Sending rules; Sending (87) says
 * the rules apply to every send. S34 adds Save to its actions when a form is dirty (219).
 */
export default function SettingsHeader() {
  const path = usePathname()
  const actions =
    path === '/settings/mailboxes' ? (
      <ButtonLink href="/settings/sending" variant="secondary">
        Sending rules
      </ButtonLink>
    ) : undefined
  const meta =
    path === '/settings/sending' ? 'Rules apply to every send, approved or automatic' : undefined
  return (
    <PageHeader
      crumb="Settings"
      title={settingsTitle(path)}
      {...(actions ? { actions } : {})}
      {...(meta ? { meta } : {})}
    />
  )
}
