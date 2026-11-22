import 'server-only'
import { opsDb } from '@indus/ops-db'
import type { SystemBanner } from '@indus/ops-ui/status'
import type { AssistantStatus } from '@indus/ops-ui/types'
import { cache } from 'react'

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
 * System banners under the page header (C23, S08): mailbox disconnected, Assistant paused, sync delayed,
 * Zoho disconnected. S02: none. S04/S05 read the mailbox and pause state here.
 */
export async function getShellBanners(): Promise<SystemBanner[]> {
  return []
}

/**
 * Every current Assistant and mailbox state, for the pill (it shows the worst, C23). S02: the Assistant has
 * nothing to run yet, so 'running' with no warnings; S05 reads the pause row and the mailbox statuses.
 */
export async function getShellAssistantStates(): Promise<AssistantStatus[]> {
  return ['running']
}
