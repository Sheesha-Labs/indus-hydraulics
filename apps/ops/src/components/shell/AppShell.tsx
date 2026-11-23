'use client'

import {
  activeKeyFromSegment,
  Sidebar,
  ShellLiveProvider,
  type ShellLive,
  type SidebarUser,
} from '@indus/ops-ui/shell'
import type { SystemBanner } from '@indus/ops-ui/status'
import type { AssistantStatus } from '@indus/ops-ui/types'
import { useRouter, useSelectedLayoutSegments } from 'next/navigation'
import { useMemo, type ReactNode } from 'react'
import { templateSpecimenNav } from '../../kit/template-nav'
import { useLiveKeys, type LiveCounts, type LiveKey } from '../../lib/live-keys'
import { recordKeyFromSegments } from '../../lib/live-poller'
import AssistantPanel from './AssistantPanel'
import CommandBar from './CommandBar'
import HelpPanel from './HelpPanel'
import NotificationsPanel from './NotificationsPanel'
import Providers, { useShell } from './Providers'
import SystemBanners from './SystemBanners'

export interface AppShellProps {
  user: SidebarUser
  /** From the `ops_sidebar` cookie, so the server renders the right width. */
  collapsed: boolean
  /** Every current Assistant and mailbox state; the pill shows the worst (C23). */
  assistant: readonly AssistantStatus[]
  /** S04-T09: the pill's words when a mailbox drives it ("sales@ disconnected"). */
  assistantLabel?: string
  /** Helper only (ADR-05): "Website admin ↗" in the avatar menu. */
  websiteAdminHref?: string
  signOutAction: (formData: FormData) => void | Promise<void>
  banners: readonly SystemBanner[]
  children: ReactNode
  /** The `@drawer` parallel slot (Why?, S02-T06). */
  drawer: ReactNode
}

/** The badge keys each role sees (Owner: Today, Review, Mail; Helper: Today, Mail). */
function badgeKeys(role: SidebarUser['role']): LiveKey[] {
  return role === 'owner' ? ['today', 'review', 'mail'] : ['today', 'mail']
}

/** Only the readings that have arrived: an absent key keeps what the server rendered. */
function badgesFrom(counts: LiveCounts): NonNullable<ShellLive['badges']> {
  const badges: NonNullable<ShellLive['badges']> = {}
  for (const key of ['today', 'review', 'mail'] as const) {
    const n = counts[key]
    if (n !== undefined) badges[key] = n
  }
  return badges
}

/**
 * The console frame (05 §6.1): the sidebar, `<main id="content">` with the system banners and the page,
 * the right-hand dock (Assistant, Help), the `@drawer` slot (Why?) and the overlays opened from anywhere
 * (command bar, notifications), inside the client providers. It is not an authorization boundary: the layout reads the
 * session only to draw the shell, and every page and action checks access itself.
 */
export default function AppShell(props: AppShellProps) {
  return (
    <Providers>
      <ShellFrame {...props} />
    </Providers>
  )
}

function ShellFrame({
  user,
  collapsed,
  assistant,
  assistantLabel,
  websiteAdminHref,
  signOutAction,
  banners,
  children,
  drawer,
}: AppShellProps) {
  const router = useRouter()
  const shell = useShell()
  // Route groups are not path segments.
  const segments = useSelectedLayoutSegments().filter((s) => !s.startsWith('('))
  // A template specimen (/_kit/templates/<t>, S02-T04) marks the row its board draws.
  const active = activeKeyFromSegment(segments[0], segments[1]) ?? templateSpecimenNav(segments)
  const recordKey = recordKeyFromSegments(segments)
  const recordRef = recordKey ? recordKey.slice('record:'.length) : null
  const keys = useMemo(
    () => [...badgeKeys(user.role), ...(recordKey ? [recordKey] : [])],
    [user.role, recordKey]
  )
  const counts = useLiveKeys(keys)
  const { open } = shell

  const live = useMemo<ShellLive>(
    () => ({
      badges: badgesFrom(counts),
      live: counts,
      openCommand: () => open('command'),
      openNotifications: () => open('notifications'),
      refresh: () => router.refresh(),
    }),
    [counts, open, router]
  )

  return (
    <ShellLiveProvider value={live}>
      <div data-part="app-shell" className="bg-io-paper flex min-h-screen">
        <div className="sticky top-0 h-screen flex-none">
          <Sidebar
            user={user}
            active={active}
            assistant={assistant}
            {...(assistantLabel ? { assistantLabel } : {})}
            collapsed={collapsed}
            signOutAction={signOutAction}
            {...(websiteAdminHref ? { websiteAdminHref } : {})}
          />
        </div>
        <main id="content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          <SystemBanners banners={banners} />
          {children}
        </main>
        {/* The right-hand dock (S03 Assistant, S06 Help): it pushes the page aside, it does not cover it. */}
        <div data-part="shell-dock" className="sticky top-0 h-screen flex-none">
          <AssistantPanel recordRef={recordRef} assistant={assistant} />
          <HelpPanel />
        </div>
        {drawer}
      </div>
      <CommandBar role={user.role} />
      <NotificationsPanel />
    </ShellLiveProvider>
  )
}
