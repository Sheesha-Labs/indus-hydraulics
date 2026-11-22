// The ten list empty states (States kit EM table). Copy is the kit's; hrefs are the console routes in
// 05 §6.1. A caller can override any part on <EmptyState>.

export type EmptyList =
  | 'enquiries'
  | 'quotations'
  | 'orders'
  | 'suppliers'
  | 'clients'
  | 'parts'
  | 'review'
  | 'mail'
  | 'reports'
  | 'log'

export interface EmptyAction {
  label: string
  href: string
  /** The one primary button; the rest are link-style. */
  primary?: boolean
}

export interface EmptyCopy {
  /** Two-letter code in the navy mark. */
  mark: string
  title: string
  text: string
  actions: readonly EmptyAction[]
}

export const EMPTY_LISTS = [
  'enquiries',
  'quotations',
  'orders',
  'suppliers',
  'clients',
  'parts',
  'review',
  'mail',
  'reports',
  'log',
] as const satisfies readonly EmptyList[]

export const EMPTY_COPY: Readonly<Record<EmptyList, EmptyCopy>> = {
  enquiries: {
    mark: 'En',
    title: 'No enquiries yet',
    text: 'New enquiries arrive from sales@ and the website. The Assistant proposes each one for you to confirm.',
    actions: [
      { label: 'New enquiry', href: '/enquiries/new', primary: true },
      { label: 'Import history', href: '/history-import' },
    ],
  },
  quotations: {
    mark: 'Qt',
    title: 'No quotations yet',
    text: 'Quotations are drafted from an enquiry once supplier prices are in.',
    actions: [{ label: 'Go to enquiries', href: '/enquiries' }],
  },
  orders: {
    mark: 'Or',
    title: 'No orders yet',
    text: 'An order starts when a client PO arrives against a quotation.',
    actions: [{ label: 'How orders start', href: '/help/orders' }],
  },
  suppliers: {
    mark: 'Su',
    title: 'No suppliers yet',
    text: 'Import your contacts from purchase@ or add the suppliers you already work with.',
    actions: [
      { label: 'Add supplier', href: '/suppliers/new', primary: true },
      { label: 'Import from purchase@', href: '/history-import' },
    ],
  },
  clients: {
    mark: 'Cl',
    title: 'No clients yet',
    text: 'Clients are created from the first enquiry they send.',
    actions: [{ label: 'Import history', href: '/history-import' }],
  },
  parts: {
    mark: 'Pa',
    title: 'No parts yet',
    text: 'Parts are built from enquiry lines and supplier quotes as they arrive.',
    actions: [],
  },
  review: {
    mark: 'Rv',
    title: 'Nothing waiting for you',
    text: 'When the Assistant needs a decision, it appears here. Everything it did on its own is in the Assistant log.',
    actions: [{ label: 'Open Assistant log', href: '/assistant/log' }],
  },
  mail: {
    mark: 'Ml',
    title: 'Inbox is clear',
    text: 'Mail from sales@ and purchase@ that needs a person shows here.',
    actions: [],
  },
  reports: {
    mark: 'Rp',
    title: 'Not enough history yet',
    text: 'Reports fill in after about 4 weeks of enquiries.',
    actions: [],
  },
  log: {
    mark: 'Lg',
    title: 'No Assistant actions yet',
    text: 'Every action the Assistant takes is recorded here and cannot be edited.',
    actions: [],
  },
}
