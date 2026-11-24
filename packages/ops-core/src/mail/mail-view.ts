import type { MailClassValue } from '../assistant/schemas/classify'
import type { HandledState } from './pipeline-rules'

/**
 * The Mail view's vocabulary (S05-T05, board 91): which messages a folder and a type filter select, and how
 * a stored class reads on a row. Pure, so the data layer, the folder rail and the tests share one table.
 */
export const MAIL_TYPE_SLUGS = [
  'new-enquiry',
  'client-reply',
  'supplier-quote',
  'supplier-question',
  'client-po',
  'supplier-documents',
  'freight',
  'payments',
  'auto-replies',
  'not-business',
] as const
export type MailTypeSlug = (typeof MAIL_TYPE_SLUGS)[number]

/** Board 91's Type group: the label and the stored classes behind each slug. */
export const MAIL_TYPES: Readonly<
  Record<MailTypeSlug, { label: string; classes: readonly MailClassValue[] }>
> = {
  'new-enquiry': { label: 'New enquiry', classes: ['client_enquiry'] },
  'client-reply': { label: 'Client reply', classes: ['client_reply'] },
  'supplier-quote': { label: 'Supplier quote', classes: ['supplier_quote'] },
  'supplier-question': { label: 'Supplier question', classes: ['supplier_question'] },
  'client-po': { label: 'Client PO', classes: ['client_po'] },
  'supplier-documents': {
    label: 'Supplier documents',
    classes: ['supplier_documents', 'supplier_price_list', 'supplier_other'],
  },
  freight: { label: 'Freight', classes: ['freight'] },
  payments: { label: 'Payments', classes: ['payment'] },
  'auto-replies': { label: 'Auto-replies & bounces', classes: ['auto_reply', 'bounce'] },
  'not-business': { label: 'Not business', classes: ['not_business', 'phishing'] },
}

export const MAIL_FOLDER_KEYS = [
  'all',
  'needs-you',
  'unsure',
  'not-linked',
  'suppliers',
  'clients',
  'sent',
  'sales',
  'purchase',
  'handled',
] as const
export type MailFolderKey = (typeof MAIL_FOLDER_KEYS)[number]

/** What a folder selects, as plain filters the data layer turns into a query. */
export interface FolderFilter {
  mailboxRole?: 'client' | 'supplier'
  handledState?: HandledState
  direction: 'inbound' | 'outbound'
  /** Sender role, for the Clients and Suppliers folders. */
  senderRole?: 'client' | 'supplier'
}

export function folderFilter(folder: MailFolderKey): FolderFilter {
  switch (folder) {
    case 'sales':
      return { mailboxRole: 'client', direction: 'inbound' }
    case 'purchase':
      return { mailboxRole: 'supplier', direction: 'inbound' }
    case 'unsure':
      return { handledState: 'unsure', direction: 'inbound' }
    case 'not-linked':
      return { handledState: 'not_linked', direction: 'inbound' }
    case 'needs-you':
      return { handledState: 'needs_you', direction: 'inbound' }
    case 'handled':
      return { handledState: 'handled', direction: 'inbound' }
    case 'clients':
      return { senderRole: 'client', direction: 'inbound' }
    case 'suppliers':
      return { senderRole: 'supplier', direction: 'inbound' }
    case 'sent':
      return { direction: 'outbound' }
    default:
      return { direction: 'inbound' }
  }
}

/** The kit's row type (ops-ui MailType) for a stored class; null when there is nothing to show yet. */
export type MailRowType =
  | 'Supplier quote'
  | 'Client reply'
  | 'New enquiry'
  | 'Supplier question'
  | 'Client PO'
  | 'Supplier documents'
  | 'Freight'
  | 'Payments'
  | 'Unsure'
  | 'Bounce'
  | 'Phishing'
  | 'Auto-reply'
  | 'Not business'
  | 'Other'

export function rowType(
  cls: MailClassValue,
  confidence: 'sure' | 'likely' | 'unsure' | null
): MailRowType | null {
  if (confidence === 'unsure') return 'Unsure'
  switch (cls) {
    case 'client_enquiry':
      return 'New enquiry'
    case 'client_reply':
      return 'Client reply'
    case 'client_po':
      return 'Client PO'
    case 'supplier_quote':
      return 'Supplier quote'
    case 'supplier_question':
      return 'Supplier question'
    case 'supplier_documents':
    case 'supplier_price_list':
    case 'supplier_other':
      return 'Supplier documents'
    case 'freight':
      return 'Freight'
    case 'payment':
      return 'Payments'
    case 'auto_reply':
      return 'Auto-reply'
    case 'bounce':
      return 'Bounce'
    case 'phishing':
      return 'Phishing'
    case 'not_business':
      return 'Not business'
    case 'other':
      return 'Other'
    default:
      return null
  }
}

/** "10:42" today, "Yesterday", "Mon", or "15 Sep" (Dubai time), as the thread list shows it. */
export function threadTime(at: Date, now: Date, timeZone = 'Asia/Dubai'): string {
  const day = (d: Date) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d)
  const today = day(now)
  if (day(at) === today) {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(at)
  }
  if (day(new Date(now.getTime() - 86_400_000)) === day(at)) return 'Yesterday'
  if (now.getTime() - at.getTime() < 6 * 86_400_000) {
    return new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short' }).format(at)
  }
  // A fixed month table: ICU spells September "Sep" or "Sept" depending on the runtime.
  const [, mm, dd] = day(at).split('-')
  return `${Number(dd)} ${MONTHS[Number(mm) - 1]}`
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

/** "Open in Gmail ↗": the thread in the right account (authuser = the mailbox address). */
export function gmailThreadUrl(mailboxAddress: string, gmailThreadId: string): string {
  return `https://mail.google.com/mail/u/?authuser=${encodeURIComponent(mailboxAddress)}#all/${encodeURIComponent(gmailThreadId)}`
}
