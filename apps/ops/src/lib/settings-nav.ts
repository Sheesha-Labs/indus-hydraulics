// The settings sub-nav (board 212 is canonical, C41; 04 R4-05). Pure data: the settings layout, the
// Assistant pages (which sit in the Assistant group) and route-tree.test.ts read it. Every href goes
// through `to()`, so a renamed folder fails the typedRoutes check.
import { to } from './routes'

export interface SubNavItem {
  label: string
  href: string
  /** The page header's title when it is not the label ("Company profile"). */
  title?: string
}

export interface SubNavGroup {
  /** The eyebrow over the group; none for a one-group nav. */
  label?: string
  items: readonly SubNavItem[]
}

export const SETTINGS_NAV: readonly SubNavGroup[] = [
  {
    label: 'Company',
    items: [
      { label: 'Profile', href: to('/settings/company'), title: 'Company profile' },
      { label: 'Bank accounts', href: to('/settings/bank-accounts') },
      { label: 'Company documents', href: to('/settings/documents') },
    ],
  },
  {
    label: 'People',
    // Board 84 is one page: Team, permissions, then #profile, #devices and #security (S02-T07 decision).
    items: [
      { label: 'Team', href: to('/settings/team'), title: 'Team, profile and devices' },
      { label: 'Profile', href: to('/settings/team#profile') },
      { label: 'Devices', href: to('/settings/team#devices') },
      { label: 'Notifications', href: to('/settings/notifications') },
    ],
  },
  {
    label: 'Mail',
    items: [
      { label: 'Mailboxes', href: to('/settings/mailboxes') },
      { label: 'Sending rules', href: to('/settings/sending') },
      { label: 'Email templates', href: to('/settings/templates') },
    ],
  },
  {
    label: 'Assistant',
    items: [
      { label: 'Autopilot', href: to('/assistant/autopilot') },
      { label: 'Preferences learned', href: to('/assistant/learned') },
      { label: 'Cost', href: to('/assistant/cost'), title: 'Cost and limits' },
    ],
  },
  {
    label: 'Selling',
    items: [
      { label: 'Pricing, VAT and FX', href: to('/settings/pricing') },
      { label: 'Offer terms', href: to('/settings/terms') },
      { label: 'Follow-up cadence', href: to('/settings/follow-up') },
    ],
  },
  {
    label: 'Documents',
    items: [
      { label: 'Templates', href: to('/settings/document-templates'), title: 'Document templates' },
      { label: 'Numbering', href: to('/settings/numbering') },
    ],
  },
  {
    label: 'Intake',
    items: [{ label: 'Website and call-back', href: to('/settings/intake'), title: 'Intake' }],
  },
  {
    label: 'Integrations',
    items: [
      { label: 'All integrations', href: to('/settings/integrations'), title: 'Integrations' },
      { label: 'Accounting', href: to('/settings/accounting') },
    ],
  },
  {
    label: 'Data',
    items: [
      {
        label: 'Export, retention, deletion',
        href: to('/settings/privacy'),
        title: 'Data and privacy',
      },
    ],
  },
]

/** The settings page header's title for a pathname: the row's title or label; "Settings" on the home. */
export function settingsTitle(pathname: string): string {
  for (const group of SETTINGS_NAV)
    for (const item of group.items)
      if (!item.href.includes('#') && item.href === pathname) return item.title ?? item.label
  // A page under a section (/settings/document-templates/quotation) keeps the section's title.
  for (const group of SETTINGS_NAV)
    for (const item of group.items)
      if (!item.href.includes('#') && pathname.startsWith(`${item.href}/`))
        return item.title ?? item.label
  return 'Settings'
}

/**
 * The id of the header slot a settings page fills with its own actions (board 57 "Preview with an enquiry",
 * "Publish"): the page's client editor owns the dirty state, so it portals its buttons into the layout's
 * header rather than the header knowing every form.
 */
export const SETTINGS_ACTIONS_SLOT = 'settings-header-actions'
