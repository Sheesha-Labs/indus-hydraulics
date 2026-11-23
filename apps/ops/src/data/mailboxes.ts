import 'server-only'
import { opsDb } from '@indus/ops-db'
import type {
  ConnectedMailboxView,
  ConnectOutcome,
  ConnectRole,
} from '../components/mailboxes/ConnectMailboxModal'
import { can, type OpsUser } from '../lib/access'
import { env } from '../lib/env'
import { signatureLines } from '../server/gmail/send-as'
import { getSetting } from '../server/settings/get'

/** Page reads for the mailbox screens (boards 80, 85, 86). */

export type ConnectContext = {
  domain: string
  dataLocation: string
  ownerName: string
  allowedRoles: ConnectRole[]
}

export async function getConnectContext(user: OpsUser): Promise<ConnectContext> {
  const [consent, owner] = await Promise.all([
    getSetting('mailbox.consent'),
    opsDb.user.findFirst({ where: { role: 'owner', status: 'active' }, select: { name: true } }),
  ])
  const allowedRoles: ConnectRole[] =
    user.role === 'owner'
      ? ['client', 'supplier', 'read_only', 'personal']
      : can(user, 'send_supplier_mail')
        ? ['supplier']
        : []
  return {
    domain: env().GOOGLE_WORKSPACE_DOMAIN.toLowerCase(),
    dataLocation: consent.dataLocation,
    ownerName: owner?.name ?? 'the Owner',
    allowedRoles,
  }
}

export async function getConnectedMailbox(id: string): Promise<ConnectedMailboxView | null> {
  const m = await opsDb.mailbox.findUnique({
    where: { id },
    select: {
      id: true,
      address: true,
      role: true,
      grantedEmail: true,
      canSend: true,
      signatureHtml: true,
      sendAsAliases: true,
    },
  })
  if (!m) return null
  return {
    id: m.id,
    address: m.address,
    role: m.role,
    grantedEmail: m.grantedEmail,
    canSend: m.canSend,
    signatureLines: signatureLines(m.signatureHtml),
    aliases: m.sendAsAliases,
  }
}

const OUTCOMES: readonly ConnectOutcome[] = [
  'connected',
  'drafts_only',
  'wrong_account',
  'blocked_by_admin',
  'denied',
  'expired',
  'not_configured',
  'error',
]
const ROLES: readonly ConnectRole[] = ['client', 'supplier', 'read_only', 'personal']

export type ConnectReturn = {
  step: 4
  role?: ConnectRole
  outcome: ConnectOutcome
  mailbox: ConnectedMailboxView | null
}

/** The callback's redirect query (`?connect=<role>&step=4&outcome=…&mailbox=…`), validated, or null. */
export async function readConnectReturn(
  q: Record<string, string | string[] | undefined>
): Promise<ConnectReturn | null> {
  const one = (k: string) => (typeof q[k] === 'string' ? (q[k] as string) : undefined)
  const outcome = one('outcome') as ConnectOutcome | undefined
  if (!outcome || !OUTCOMES.includes(outcome)) return null
  const role = one('connect') as ConnectRole | undefined
  const id = one('mailbox')
  const mailbox = id && /^[0-9a-f-]{36}$/i.test(id) ? await getConnectedMailbox(id) : null
  return { step: 4, outcome, mailbox, ...(role && ROLES.includes(role) ? { role } : {}) }
}

/** Board 80: the Client and Supplier mailbox cards of setup step 2. */
export type SetupMailboxCard = {
  role: 'client' | 'supplier'
  address: string
  connected: boolean
  canSend: boolean
  ownerName: string | null
  ownerInitials: string | null
  signatureLines: string[]
}

export async function getSetupMailboxCards(domain: string): Promise<SetupMailboxCard[]> {
  const rows = await opsDb.mailbox.findMany({
    where: { role: { in: ['client', 'supplier'] } },
    select: {
      role: true,
      address: true,
      status: true,
      canSend: true,
      signatureHtml: true,
      owner: { select: { name: true, initials: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
  const cards: SetupMailboxCard[] = []
  for (const role of ['client', 'supplier'] as const) {
    const row = rows.find((r) => r.role === role)
    const connected = !!row && !['disconnected', 'token_expired', 'revoked'].includes(row.status)
    cards.push({
      role,
      address: row?.address ?? `${role === 'client' ? 'sales' : 'purchase'}@${domain}`,
      connected,
      canSend: !!row?.canSend,
      ownerName: row?.owner?.name ?? null,
      ownerInitials: row?.owner?.initials ?? null,
      signatureLines: signatureLines(row?.signatureHtml),
    })
  }
  return cards
}
