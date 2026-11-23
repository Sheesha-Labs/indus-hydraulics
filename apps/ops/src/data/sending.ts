import 'server-only'
import {
  attachmentName,
  SENDING_RULE_ROWS,
  type CcChoice,
  type SendingRole,
  type ThreadModeValue,
} from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import type { OpsUser } from '../lib/access'
import { signatureLines } from '../server/gmail/send-as'
import { getSettingEntries } from '../server/settings/get'
import type { SignoffStatus } from '../server/settings/registry'

/** Page read for board 87 (Settings › Sending). Two queries: the rules, the mailboxes with their owners. */

export type SendingRowView = {
  key: string
  label: string
  audience: 'client' | 'supplier'
  fromRole: SendingRole
  cc: CcChoice
  signatureUserId: string | null
  threadMode: ThreadModeValue
  awaiting: boolean
}

export type SignerView = {
  userId: string
  firstName: string
  name: string
  mailboxAddress: string | null
  lines: string[]
  /** Saved in Settings › Sending; otherwise the mailbox's Gmail signature is shown. */
  saved: boolean
}

export type SendingPage = {
  rows: SendingRowView[]
  fromOptions: Array<{ value: SendingRole; label: string }>
  ccOptions: Array<{ value: CcChoice; label: string }>
  signers: SignerView[]
  caps: Array<{ mailboxId: string; address: string; cap: number }>
  hold: { minutes: number; version: number }
  timing: { clientWindow: 'next_morning' | 'immediately'; version: number; signoff: SignoffStatus }
  names: {
    quotation: string
    supplierRfq: string
    quotationExample: string
    supplierRfqExample: string
    version: number
    signoff: SignoffStatus
  }
  signaturesVersion: number
  testAddresses: { addresses: string[]; version: number }
  canEdit: boolean
}

const short = (address: string | undefined, fallback: string) => (address ? `${address.split('@')[0]}@` : fallback)

export async function getSendingPage(user: OpsUser): Promise<SendingPage> {
  const [rules, mailboxes] = await Promise.all([
    opsDb.sendingRule.findMany(),
    opsDb.mailbox.findMany({
      where: { role: { in: ['client', 'supplier'] } },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        address: true,
        role: true,
        dailySendCap: true,
        signatureHtml: true,
        owner: { select: { id: true, name: true, status: true } },
      },
    }),
  ])
  const [undo, timing, names, signatures, tests] = await getSettingEntries([
    'undo',
    'send.timing',
    'send.attachment_names',
    'send.signatures',
    'mail.test_allowlist',
  ] as const)

  const byKind = new Map(rules.map((r) => [r.kind as string, r]))
  const sales = mailboxes.find((m) => m.role === 'client')
  const purchase = mailboxes.find((m) => m.role === 'supplier')
  const ownerOf = (role: string) => mailboxes.find((m) => m.role === role)?.owner?.id ?? null

  const rows = SENDING_RULE_ROWS.map((row): SendingRowView => {
    const rule = byKind.get(row.kinds[0]!)
    const fromRole = (rule?.fromRole ?? row.audience) as SendingRole
    const cc: CcChoice =
      rule?.ccSpecial === 'accounts_contact'
        ? 'accounts_contact'
        : ((rule?.ccRole as CcChoice | null | undefined) ?? 'none')
    return {
      key: row.key,
      label: row.label,
      audience: row.audience,
      fromRole,
      cc,
      signatureUserId: rule?.signatureUserId ?? ownerOf(fromRole),
      threadMode: (rule?.threadMode ?? (row.audience === 'client' ? 'client_thread' : 'new_thread')) as ThreadModeValue,
      awaiting: row.kinds.some((k) => byKind.get(k)?.signoffStatus !== 'signed_off'),
    }
  })

  const signers: SignerView[] = mailboxes
    .filter((m) => m.owner && m.owner.status === 'active')
    .filter((m, i, all) => all.findIndex((x) => x.owner?.id === m.owner?.id) === i)
    .map((m) => {
      const saved = signatures.value[m.owner!.id]
      return {
        userId: m.owner!.id,
        firstName: m.owner!.name.split(' ')[0] ?? m.owner!.name,
        name: m.owner!.name,
        mailboxAddress: m.address,
        lines: saved ? saved.text.split('\n').filter(Boolean) : signatureLines(m.signatureHtml),
        saved: !!saved,
      }
    })

  return {
    rows,
    fromOptions: [
      { value: 'client', label: short(sales?.address, 'sales@') },
      { value: 'supplier', label: short(purchase?.address, 'purchase@') },
    ],
    ccOptions: [
      { value: 'none', label: '—' },
      { value: 'client', label: short(sales?.address, 'sales@') },
      { value: 'supplier', label: short(purchase?.address, 'purchase@') },
      { value: 'accounts_contact', label: 'accounts contact' },
    ],
    signers,
    caps: mailboxes.map((m) => ({ mailboxId: m.id, address: m.address, cap: m.dailySendCap })),
    hold: { minutes: undo.value.sendWindowMinutes, version: undo.version },
    timing: {
      clientWindow: timing.value.clientWindow ?? 'next_morning',
      version: timing.version,
      signoff: timing.signoffStatus,
    },
    names: {
      quotation: names.value.quotation,
      supplierRfq: names.value.supplierRfq,
      quotationExample: attachmentName(names.value.quotation, { n: '26941' }),
      supplierRfqExample: attachmentName(names.value.supplierRfq, { ref: '2609-P12' }),
      version: names.version,
      signoff: names.signoffStatus,
    },
    signaturesVersion: signatures.version,
    testAddresses: { addresses: tests.value.addresses, version: tests.version },
    canEdit: user.role === 'owner',
  }
}
