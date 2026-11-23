import 'server-only'
import { opsDb } from '@indus/ops-db'
import { createGmailClient, type GmailApi } from './client'
import type { GmailBudget } from './quota'
import { getAccessToken, markTokenExpired } from './tokens'

/**
 * The Gmail client for one stored mailbox (S04-T02/T03): access tokens from tokens.ts, label policy from the
 * mailbox's own `Indus/*` gmail_label rows. Tests swap the transport with `useGmailTransportForTests`.
 */
let testTransport: ((mailboxId: string) => GmailApi) | undefined

/** Test hook: every gmailFor() call talks to the given fake instead of Google. Pass undefined to reset. */
export function useGmailTransportForTests(
  factory: ((mailboxId: string) => GmailApi) | undefined
): void {
  testTransport = factory
}

export async function indusLabelIdsOf(mailboxId: string): Promise<ReadonlySet<string>> {
  const rows = await opsDb.gmailLabel.findMany({
    where: { mailboxId, name: { startsWith: 'Indus/' } },
    select: { gmailLabelId: true },
  })
  return new Set(rows.map((r) => r.gmailLabelId))
}

export function gmailFor(mailboxId: string, budget: GmailBudget): GmailApi {
  const fake = testTransport
  return createGmailClient({
    mailboxId,
    budget,
    accessToken: fake ? async () => 'test-token' : () => getAccessToken(mailboxId),
    indusLabelIds: () => indusLabelIdsOf(mailboxId),
    onUnauthorized: () => markTokenExpired(mailboxId),
    ...(fake ? { transport: () => fake(mailboxId) } : {}),
  })
}
