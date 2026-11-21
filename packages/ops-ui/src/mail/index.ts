// Mail kit (S01-T09a): `@indus/ops-ui/mail`. Client parts: SandboxedBody (the Expand toggle) and Composer
// (TipTap and the action handlers). Everything else renders from the server. Email bodies reach the page only
// as SanitizedHtml, and only inside SandboxedBody's sandboxed srcdoc frame.
export { default as ThreadRow } from './ThreadRow'
export { default as MailFolder } from './MailFolder'
export { default as MailMessage } from './MailMessage'
export { default as SandboxedBody } from './SandboxedBody'
export { default as RenderedEmail } from './Email'
export { default as Composer } from './Composer'
export { default as AttachmentChip } from './AttachmentChip'
export { default as AssistantNote } from './AssistantNote'
export { FRAME_CSP, FRAME_SANDBOX, frameDocument } from './frame-document'
export type {
  AssistantNoteProps,
  AttachmentChipProps,
  ComposerProps,
  DraftPayload,
  Mailbox,
  MailFolderProps,
  MailMessageProps,
  MailRole,
  MailType,
  Recipient,
  RenderedEmailProps,
  Result,
  SandboxedBodyProps,
  SandboxHeight,
  SanitizedHtml,
  ThreadRowProps,
} from './types'
