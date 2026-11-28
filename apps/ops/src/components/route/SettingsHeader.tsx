'use client'

import { ButtonLink } from '@indus/ops-ui/controls'
import { PageHeader } from '@indus/ops-ui/shell'
import { usePathname } from 'next/navigation'
import { SETTINGS_ACTIONS_SLOT, settingsTitle } from '../../lib/settings-nav'

/**
 * The settings page header (board 212: crumb "Settings", the section as the title). The settings layout
 * renders T7 once for every /settings page, so the title follows the URL here rather than in each page.
 * A few pages carry the board's own header extra: Mailboxes (85) links to Sending rules; Sending (87) says
 * the rules apply to every send. S34 adds Save to its actions when a form is dirty (219). Document templates
 * (57) leave an empty slot that the editor fills with Save, Preview and Publish (SETTINGS_ACTIONS_SLOT).
 */
/** S11 pages whose client editor owns the header's actions (57, 39, 213, 214). */
const SLOT_PAGES = [
  '/settings/document-templates',
  '/settings/terms',
  '/settings/documents',
  '/settings/numbering',
] as const

export default function SettingsHeader() {
  const path = usePathname()
  const actions =
    path === '/settings/mailboxes' ? (
      <ButtonLink href="/settings/sending" variant="secondary">
        Sending rules
      </ButtonLink>
    ) : SLOT_PAGES.some((p) => path === p || path.startsWith(`${p}/`)) ? (
      <div id={SETTINGS_ACTIONS_SLOT} className="flex items-center gap-2" />
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
