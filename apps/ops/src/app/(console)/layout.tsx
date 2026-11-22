import { isSidebarCollapsed, SIDEBAR_COOKIE } from '@indus/ops-ui/shell/nav'
import { cookies } from 'next/headers'
import type { ReactNode } from 'react'
import AppShell from '../../components/shell/AppShell'
import SkipLink from '../../components/shell/SkipLink'
import { getShellAssistantStates, getShellBanners, getShellMailbox } from '../../data/shell'
import { AccessError, requireOpsUser } from '../../lib/access'
import { signOutAction } from '../(auth)/sign-in/actions'

// Every console page is per-user and per-request.
export const dynamic = 'force-dynamic'

/** Helper only (ADR-05): the website's admin, opened from the avatar menu. */
const WEBSITE_ADMIN_HREF = 'https://indushydraulics.com/admin'

/**
 * The console layout: the skip link, then AppShell (sidebar, banner slot, `<main id="content">`, the page
 * and the `@drawer` slot) inside the client providers.
 *
 * NOT an authorization boundary (CLAUDE.md §4.2, apps/ops/CLAUDE.md §5.3). A layout does not re-run on every
 * navigation (App Router partial rendering), so a check here would be skipped by soft navigations. It reads
 * the user only to draw the shell; every page and every action calls requireOpsUser() itself, and the proxy
 * verifies the session token on every request.
 *
 * Without a user there is no shell to draw, and the page underneath decides what happens: a console page
 * redirects to sign-in itself, and an unknown path renders not-found. That matters because the `@drawer`
 * catch-all makes this layout the match for EVERY path no other route claims, public ones included (a
 * client document path before its route exists, a webhook path): redirecting here would send those to
 * /sign-in instead of a 404.
 */
export default async function ConsoleLayout({
  children,
  drawer,
}: {
  children: ReactNode
  drawer: ReactNode
}) {
  let user
  try {
    user = await requireOpsUser()
  } catch (error) {
    if (error instanceof AccessError) return children
    throw error
  }
  const [mailbox, banners, assistant, jar] = await Promise.all([
    getShellMailbox(user.id),
    getShellBanners(),
    getShellAssistantStates(),
    cookies(),
  ])
  const helper = user.role === 'helper'
  return (
    <>
      <SkipLink />
      <AppShell
        user={{
          name: user.name,
          initials: user.initials,
          role: user.role,
          roleLabel: helper ? 'Helper · sourcing' : 'Owner',
          mailbox,
        }}
        collapsed={isSidebarCollapsed(jar.get(SIDEBAR_COOKIE)?.value)}
        assistant={assistant}
        {...(helper ? { websiteAdminHref: WEBSITE_ADMIN_HREF } : {})}
        signOutAction={signOutAction}
        banners={banners}
        drawer={drawer}
      >
        {children}
      </AppShell>
    </>
  )
}
