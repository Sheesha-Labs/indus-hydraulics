import { isSidebarCollapsed, SIDEBAR_COOKIE } from '@indus/ops-ui/shell/nav'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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
 * verifies the session token on every request. The redirect below covers a session whose user row was
 * suspended after the token was issued: there is no shell to draw for them.
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
    if (error instanceof AccessError) redirect('/sign-in')
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
