// Mail kit types (05-map-frontend §3.10). MailRole and MailType were added by S01-T04 because the tone maps in
// status.ts key on them; the part props joined in S01-T09a.
import type { Result } from '@indus/ops-core'
import type { ReactNode } from 'react'
import type { FileType, LinkSpec } from '../types'

export type MailRole = 'Supplier' | 'Client' | 'Internal' | 'Unknown'

export type MailType =
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
  /** S05-T05: board 91 rows for out-of-office replies, newsletters and the rest. */
  | 'Auto-reply'
  | 'Not business'
  | 'Other'

/**
 * Email HTML that has been through the server sanitizer. ops-ui exports no way to make one: the S05 server
 * sanitizer (`sanitizeMailHtml()`) is the only producer, and tests use the helper in `__fixtures__/mail.ts`.
 * An unsanitized string therefore cannot reach SandboxedBody by accident.
 */
export type SanitizedHtml = string & { readonly __brand: 'SanitizedHtml' }

/** The two business mailboxes. Client mail goes from sales@, supplier mail from purchase@. */
export type Mailbox = 'sales' | 'purchase'

export interface Recipient {
  name?: string
  address: string
}

/** Server-action result shape (apps/ops CLAUDE.md §6.2): the shared one from @indus/ops-core. */
export type { Result } from '@indus/ops-core'

export interface ThreadRowProps {
  href: string
  from: string
  /** The sender's role (05 §3.10 calls it `role`; renamed because JSX lint reads `role` as an ARIA role). */
  senderRole: MailRole
  company?: string
  time: string
  subject: string
  type?: MailType
  recordRef?: string
  assistantNote?: string
  unread?: boolean
  selected?: boolean
}

export interface MailFolderProps {
  label: string
  count?: number
  warn?: boolean
  active?: boolean
  href: string
}

export interface AttachmentChipProps {
  fileType: FileType
  name: string
  size?: string
  href?: string
  unavailable?: boolean
}

/** Frame heights, a closed set: the frame cannot size itself to a sandboxed document (no same-origin). */
export type SandboxHeight = 'preview' | 'reading'

export interface SandboxedBodyProps {
  html: SanitizedHtml
  /**
   * The request's CSP nonce (the `x-nonce` request header). A srcdoc document inherits the console's CSP,
   * whose `style-src` admits only nonced styles, so the frame's base stylesheet must carry it. Without it
   * the body renders in the browser's default styles.
   */
  nonce?: string
  /** 'preview' 127px (the kit Message body: four lines; cards); 'reading' 360px with an Expand toggle to 720px. Default 'reading'. */
  height?: SandboxHeight
  /** Accessible name of the frame. Default "Email body". */
  title?: string
}

export interface MailMessageProps {
  from: { name: string; address: string }
  to: string
  cc?: string
  subject: string
  /** Branded: only produced by sanitizeMailHtml() on the server. */
  bodyHtml: SanitizedHtml
  attachments?: AttachmentChipProps[]
  /** Default 'blocked'. 'shown' arrives with the S05 image proxy; until then both render blocked. */
  remoteImages?: 'blocked' | 'shown'
  /** Passed to SandboxedBody. */
  nonce?: string
  bodyHeight?: SandboxHeight
}

/** Preview of what the recipient will see. Our own outbound content, so the body is React, not HTML. */
export interface RenderedEmailProps {
  subject: string
  from: { name: string; address: string }
  to: string
  cc?: string
  time: string
  body: ReactNode
  attachments?: AttachmentChipProps[]
  signature?: ReactNode
}

export interface DraftPayload {
  mailbox: Mailbox
  to: Recipient[]
  cc: Recipient[]
  bcc: Recipient[]
  subject: string
  /** Editor HTML. The server sanitizes it again before it is queued. */
  html: string
}

export interface ComposerProps {
  /** Locked by context: client mail = sales@ in the client thread, supplier mail = purchase@. */
  mailbox: Mailbox
  /** Display address of each mailbox (read from settings by the page). */
  mailboxes: Record<Mailbox, string>
  mailboxLocked?: boolean
  to: Recipient[]
  cc?: Recipient[]
  bcc?: Recipient[]
  subject: string
  initialHtml: string
  attachments?: AttachmentChipProps[]
  /** Right of the toolbar, e.g. "Assistant draft · edited". */
  toolbarNote?: string
  /** Right of the footer, e.g. "Sends from sales@ in the client thread". */
  footNote?: string
  /** Default "Send". */
  primaryLabel?: string
  onSend: (draft: DraftPayload) => Promise<Result<{ sendId: string; undoRemainingMs: number }>>
  onSaveDraft: (draft: DraftPayload) => Promise<Result<{ draftId: string }>>
  onDiscard: () => void
  /** Opens the attachment picker. Without it the Attach button is not shown. */
  onAttach?: () => void
}

export interface AssistantNoteProps {
  children: ReactNode
  link?: LinkSpec
}
