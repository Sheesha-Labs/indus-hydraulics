'use client'

import {
  activeKeyFromSegment,
  Sidebar,
  ShellLiveProvider,
  type ShellLive,
  type SidebarUser,
} from '@indus/ops-ui/shell'
import { BannerSlot, type SystemBanner } from '@indus/ops-ui/status'
import type { AssistantStatus } from '@indus/ops-ui/types'
import { useRouter, useSelectedLayoutSegments } from 'next/navigation'
import { useMemo, type ReactNode } from 'react'
import { templateSpecimenNav } from '../../kit/template-nav'
import { useLiveKeys, type LiveCounts, type LiveKey } from '../../lib/live-keys'
import { recordKeyFromSegments } from '../../lib/live-poller'
import Providers, { useShell } from './Providers'

export interface AppShellProps {
  user: SidebarUser
  /** From the `ops_sidebar` cookie, so the server renders the right width. */
  collapsed: boolean
  /** Every current Assistant and mailbox state; the pill shows the worst (C23). */
  assistant: readonly AssistantStatus[]
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
 * The console frame (05 §6.1): the sidebar, `<main id="content">` with the banner slot and the page, and the
 * `@drawer` slot, inside the client providers. It is not an authorization boundary: the layout reads the
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
            collapsed={collapsed}
            signOutAction={signOutAction}
            {...(websiteAdminHref ? { websiteAdminHref } : {})}
          />
        </div>
        <main id="content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          <BannerSlot banners={banners} placement="strip" />
          {children}
        </main>
        {drawer}
      </div>
    </ShellLiveProvider>
  )
}
