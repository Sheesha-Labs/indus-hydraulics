/**
 * Copy for the mailbox connect flow (board 86, docs/gmail-setup.md §g). The admin instructions here and in the
 * runbook must say the same thing: a person copies them to the Workspace admin.
 */
export function adminTrustInstructions(domain: string): string {
  return [
    `${domain}'s Google Workspace admin has not allowed Indus Operations.`,
    'In the Google Admin console: Security › Access and data control › API controls › Manage third-party app access › Add app › OAuth app name or client ID.',
    'Find Indus Operations, choose Trusted, and save. Then try connecting again.',
  ].join('\n')
}

export const CONNECT_STEPS = [
  'Choose a role',
  'Before Google asks',
  "Google's consent screen",
  'Back in the console',
  'Success',
] as const

export type ConnectRoleOption = {
  value: 'client' | 'supplier' | 'read_only' | 'personal'
  label: string
  sub: string
}

export const ROLE_OPTIONS: readonly ConnectRoleOption[] = [
  {
    value: 'client',
    label: 'Client mailbox',
    sub: 'Quotations, client replies and POs are sent from here.',
  },
  { value: 'supplier', label: 'Supplier mailbox', sub: 'Supplier RFQs, chasers and supplier POs.' },
  { value: 'read_only', label: 'Read-only', sub: 'The Assistant reads but never sends.' },
  { value: 'personal', label: 'Personal', sub: 'Read only for threads you link.' },
]

export const WILL = [
  'Read mail and attachments, to create enquiries and capture quotes',
  'Create drafts and send, only as your rules allow',
  'Add Indus/ labels',
] as const

export const WILL_NEVER = [
  'Delete mail',
  'Change Gmail settings or filters',
  'Read Google Drive, Calendar or Contacts',
] as const

/** Default address per role on the Workspace domain (sales@ for clients, purchase@ for suppliers). */
export function defaultAddress(role: ConnectRoleOption['value'], domain: string): string {
  if (role === 'client') return `sales@${domain}`
  if (role === 'supplier') return `purchase@${domain}`
  return ''
}
