import 'server-only'
import { opsDb } from '@indus/ops-db'
import { BannerAction, type SystemBanner } from '@indus/ops-ui/status'
import type { AssistantStatus } from '@indus/ops-ui/types'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { env } from '../lib/env'

/** The sidebar's identity line prints the mailbox's local part; anything else prints "—". */
export type ShellMailbox = 'sales@' | 'purchase@' | null

/**
 * The signed-in person's primary mailbox, for "Signed in as … · sales@". One query while nobody has a
 * mailbox (S02–S04), two once they do: the column has no Prisma relation. Wrapped in cache() so the layout
 * and a page asking in the same request share it.
 */
export const getShellMailbox = cache(async (userId: string): Promise<ShellMailbox> => {
  const user = await opsDb.user.findUnique({
    where: { id: userId },
    select: { primaryMailboxId: true },
  })
  if (!user?.primaryMailboxId) return null
  const mailbox = await opsDb.mailbox.findUnique({
    where: { id: user.primaryMailboxId },
    select: { address: true },
  })
  return mailboxLabel(mailbox?.address)
})

/** `sales@indushydraulics.me` → `sales@`; any other address → null. */
export function mailboxLabel(address: string | null | undefined): ShellMailbox {
  const local = address?.split('@')[0]?.toLowerCase()
  return local === 'sales' || local === 'purchase' ? `${local}@` : null
}

/**
 * Outside production, the cookie `ops_fixture_banners=1` turns on three neutral fixture banners (mailbox
 * disconnected, sync delayed, an info note) so the one-banner rule (C23) can be seen and tested: only the
 * mailbox banner shows, with "+2 more". Never read in production.
 */
export const FIXTURE_BANNERS_COOKIE = 'ops_fixture_banners'

export function fixtureBanners(): SystemBanner[] {
  return [
    {
      kind: 'info',
      props: { tone: 'info', children: 'Zoho Books last synced 08:00. Next sync in 4 minutes.' },
    },
    {
      kind: 'sync-delayed',
      props: {
        tone: 'warn',
        title: 'purchase@ sync delayed.',
        children: 'New mail may take a few minutes longer to appear.',
      },
    },
    {
      kind: 'mailbox-disconnected',
      props: {
        tone: 'bad',
        title: 'sales@ disconnected.',
        children: 'Gmail stopped syncing at 09:12. Nothing is sent until it reconnects.',
        actions: <BannerAction href="/settings/mailboxes">Reconnect</BannerAction>,
      },
    },
  ]
}

/**
 * System banners under the page header (C23, S08): mailbox disconnected, Assistant paused, sync delayed,
 * Zoho disconnected. The shell shows the most severe one with "+n more". S02: none (fixtures outside
 * production behind FIXTURE_BANNERS_COOKIE). S04/S05 read the mailbox and pause state here.
 */
export async function getShellBanners(): Promise<SystemBanner[]> {
  if (env().APP_ENV === 'production') return []
  const jar = await cookies()
  return jar.get(FIXTURE_BANNERS_COOKIE)?.value === '1' ? fixtureBanners() : []
}

/**
 * Every current Assistant and mailbox state, for the pill (it shows the worst, C23). S02: the Assistant has
 * nothing to run yet, so 'running' with no warnings; S05 reads the pause row and the mailbox statuses.
 */
export async function getShellAssistantStates(): Promise<AssistantStatus[]> {
  return ['running']
}
