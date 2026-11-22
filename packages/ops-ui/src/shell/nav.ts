// Sidebar navigation model (05 §3.13, C10): destinations, groups, the legacy alias table, the first-segment →
// NavKey mapping, the collapsed-state cookie and the Assistant pill's worst-state rule. Pure data and
// functions: safe on the server, in the proxy and in tests.
import type { OpsIconName } from '../icons/OpsIcon'
import type { AssistantStatus } from '../types'

export type NavKey =
  | 'today'
  | 'review'
  | 'mail'
  | 'enquiries'
  | 'quotations'
  | 'orders'
  | 'money'
  | 'suppliers'
  | 'clients'
  | 'parts'
  | 'reports'
  | 'autopilot'
  | 'assistant-log'
  | 'settings'

export interface NavItem {
  key: NavKey
  label: string
  href: string
  icon: OpsIconName
}

export interface NavGroup {
  label: string
  items: readonly NavItem[]
}

/** The five sidebar groups. Money joins Work after Orders (C10); Settings sits in the foot. */
export const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { key: 'today', label: 'Today', href: '/today', icon: 'today' },
      { key: 'review', label: 'Review', href: '/review', icon: 'review' },
      { key: 'mail', label: 'Mail', href: '/mail', icon: 'mail' },
    ],
  },
  {
    label: 'Work',
    items: [
      { key: 'enquiries', label: 'Enquiries', href: '/enquiries', icon: 'enquiries' },
      { key: 'quotations', label: 'Quotations', href: '/quotations', icon: 'quotations' },
      { key: 'orders', label: 'Orders', href: '/orders', icon: 'orders' },
      { key: 'money', label: 'Money', href: '/money', icon: 'money' },
    ],
  },
  {
    label: 'Directory',
    items: [
      { key: 'suppliers', label: 'Suppliers', href: '/suppliers', icon: 'suppliers' },
      { key: 'clients', label: 'Clients', href: '/clients', icon: 'clients' },
      { key: 'parts', label: 'Parts', href: '/parts', icon: 'parts' },
    ],
  },
  {
    label: 'Insight',
    items: [{ key: 'reports', label: 'Reports', href: '/reports/overdue', icon: 'reports' }],
  },
  {
    label: 'Assistant',
    items: [
      { key: 'autopilot', label: 'Autopilot', href: '/assistant/autopilot', icon: 'autopilot' },
      { key: 'assistant-log', label: 'Assistant log', href: '/assistant/log', icon: 'log' },
    ],
  },
] as const

/** The foot's Settings link. */
export const SETTINGS_ITEM: NavItem = {
  key: 'settings',
  label: 'Settings',
  href: '/settings',
  icon: 'settings',
}

/** Every sidebar destination in screen order: the 13 group items, then Settings (14). */
export const NAV_DESTINATIONS: readonly NavItem[] = [
  ...NAV_GROUPS.flatMap((g) => g.items),
  SETTINGS_ITEM,
]

/** Where the pill menu's "Autopilot →" goes. */
export const AUTOPILOT_HREF = '/assistant/autopilot'

/** Profile menu links: board 84 is one page with #profile and #devices sections (S02-T07 decision). */
export const PROFILE_HREF = '/settings/team#profile'
export const DEVICES_HREF = '/settings/team#devices'

/**
 * The handoff's legacy alias table (old CRM names → the current destination). Used only to redirect old
 * bookmarks, if any, from the proxy; nothing renders these names.
 */
export const NAV_ALIASES: Readonly<Record<string, NavKey>> = {
  Dashboard: 'today',
  Tasks: 'today',
  Notifications: 'review',
  Leads: 'enquiries',
  Deals: 'enquiries',
  'Deal spaces': 'enquiries',
  'Supplier RFQs': 'enquiries',
  Principals: 'suppliers',
  Catalogue: 'parts',
  Invoices: 'orders',
  Freight: 'orders',
  'Users & roles': 'settings',
}

const SEGMENT_KEYS: Readonly<Record<string, NavKey>> = {
  today: 'today',
  review: 'review',
  mail: 'mail',
  enquiries: 'enquiries',
  quotations: 'quotations',
  orders: 'orders',
  money: 'money',
  suppliers: 'suppliers',
  clients: 'clients',
  parts: 'parts',
  reports: 'reports',
  settings: 'settings',
}

/**
 * The active sidebar item for a URL. `assistant/log` is the Assistant log; every other `assistant/*` page
 * (autopilot, guardrails, cost, learned) belongs to Autopilot. Tasks, call-backs and search open from Today
 * or the command bar and highlight nothing (C10), as does any unknown segment.
 */
export function activeKeyFromSegment(first: string | undefined, second?: string): NavKey | null {
  if (!first) return null
  if (first === 'assistant') return second === 'log' ? 'assistant-log' : 'autopilot'
  return SEGMENT_KEYS[first] ?? null
}

/** `activeKeyFromSegment` for a pathname ("/assistant/log?x=1" → 'assistant-log'). */
export function activeKeyFromPathname(pathname: string): NavKey | null {
  const [first, second] = pathname.split(/[?#]/)[0]!.split('/').filter(Boolean)
  return activeKeyFromSegment(first, second)
}

/** The collapsed state lives in this cookie so the server renders the right width (no shift on load). */
export const SIDEBAR_COOKIE = 'ops_sidebar'
export const SIDEBAR_COOKIE_COLLAPSED = 'collapsed'
export const SIDEBAR_COOKIE_EXPANDED = 'expanded'

export function isSidebarCollapsed(cookieValue: string | undefined): boolean {
  return cookieValue === SIDEBAR_COOKIE_COLLAPSED
}

/**
 * Most severe first (C23 order, S08): a disconnected mailbox beats a pause, a pause beats an unsure
 * Assistant, and anything beats running. `off` (Autopilot switched off on purpose) ranks after unsure.
 */
export const ASSISTANT_SEVERITY: readonly AssistantStatus[] = [
  'disconnected',
  'paused',
  'unsure',
  'off',
  'running',
]

/** The pill shows the worst current state across the mailboxes and the Assistant. */
export function worstAssistantStatus(
  states: AssistantStatus | readonly AssistantStatus[]
): AssistantStatus {
  const list: readonly AssistantStatus[] = typeof states === 'string' ? [states] : states
  for (const s of ASSISTANT_SEVERITY) if (list.includes(s)) return s
  return 'running'
}
