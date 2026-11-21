'use client'

import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Lock } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import Button from '../controls/Button'
import Select from '../controls/Select'
import { cn } from '../lib/cn'
import AttachmentChip from './AttachmentChip'
import { draftPreview } from './draft-preview'
import type { ComposerProps, DraftPayload, Mailbox, Recipient } from './types'

/** The body's look, shared by the editor and the read-only preview it replaces after hydration. */
const BODY = cn(
  'flex min-h-[120px] flex-col gap-2 px-3.5 py-3 leading-[1.6] break-words whitespace-pre-wrap outline-none',
  '[&_a]:text-io-accent [&_a]:underline [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-5'
)

type Status =
  | { kind: 'idle' }
  | { kind: 'busy'; action: 'send' | 'save' }
  | { kind: 'error'; message: string }
  | { kind: 'sent'; undoRemainingMs: number }
  | { kind: 'saved' }

/**
 * StarterKit cut down to bold, italic, bullet list and link (05 §3.10); TipTap is the only rich-text
 * dependency. StarterKit 3 bundles the link extension, so no separate package. The paragraph, text,
 * document, hard break, list item and undo extensions stay: the four marks need them.
 */
const EXTENSIONS = [
  StarterKit.configure({
    blockquote: false,
    code: false,
    codeBlock: false,
    dropcursor: false,
    heading: false,
    horizontalRule: false,
    orderedList: false,
    strike: false,
    underline: false,
    trailingNode: false,
    link: {
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
      protocols: ['mailto'],
      HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: null },
    },
  }),
]

const recipientText = (r: Recipient): string => (r.name ? `${r.name} <${r.address}>` : r.address)
const listText = (rs: readonly Recipient[]): string => rs.map(recipientText).join(', ')

function Row({
  label,
  htmlFor,
  aside,
  children,
}: {
  label: string
  htmlFor?: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="border-io-line-2 grid grid-cols-[62px_minmax(0,1fr)_auto] items-center gap-2 border-b px-3.5 py-2">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-io-ink-3 text-[12px]">
          {label}
        </label>
      ) : (
        <span className="text-io-ink-3 text-[12px]">{label}</span>
      )}
      <div className="min-w-0">{children}</div>
      <span>{aside}</span>
    </div>
  )
}

function ToolButton({
  label,
  pressed,
  onClick,
  disabled,
  children,
  className,
}: {
  label: string
  pressed?: boolean
  onClick: () => void
  disabled?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      {...(pressed === undefined ? {} : { 'aria-pressed': pressed })}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'io-focus rounded-io-tag hover:text-io-ink cursor-pointer disabled:cursor-default',
        pressed && 'text-io-accent',
        className
      )}
    >
      {children}
    </button>
  )
}

function toggleLink(editor: Editor) {
  if (editor.isActive('link')) {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  const href = window.prompt('Link address')?.trim()
  if (href) editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
}

/**
 * Mail kit `km-cp`: compose or edit an outbound email. Line border, r 10, 12.5px.
 *  - From: the mailbox select (26 h), locked when the thread decides it (client mail = sales@ in the client
 *    thread, supplier mail = purchase@; never switch mailbox for a thread). To/Cc/Bcc come from the context
 *    and are shown, not edited; Subject is editable.
 *  - Toolbar (paper ground): B, I, List, Link, Attach, and a note on the right ("Assistant draft · edited").
 *  - Body: TipTap, min-h 120. Attachments. Footer: Send (the one primary, a person's button), Save draft,
 *    Discard, and a note on the right that becomes the result of the last action.
 * Client: editor state and the action handlers. The server sanitizes the editor HTML again on send.
 */
export default function Composer({
  mailbox: initialMailbox,
  mailboxes,
  mailboxLocked = false,
  to,
  cc = [],
  bcc = [],
  subject: initialSubject,
  initialHtml,
  attachments = [],
  toolbarNote,
  footNote,
  primaryLabel = 'Send',
  onSend,
  onSaveDraft,
  onDiscard,
  onAttach,
}: ComposerProps) {
  const id = useId()
  const [mailbox, setMailbox] = useState<Mailbox>(initialMailbox)
  const [subject, setSubject] = useState(initialSubject)
  const [showCopies, setShowCopies] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const editor = useEditor({
    extensions: EXTENSIONS,
    content: initialHtml,
    // The App Router renders this on the server too: ProseMirror needs a live document, so the editor is
    // created after hydration and a same-size placeholder stands in until then.
    immediatelyRender: false,
    // The toolbar reads isActive() during render.
    shouldRerenderOnTransaction: true,
    // TipTap's injected <style> carries no CSP nonce; the classes below carry its two essential rules.
    injectCSS: false,
    editorProps: {
      attributes: {
        'aria-label': 'Message body',
        'aria-multiline': 'true',
        role: 'textbox',
        class: cn(BODY, 'focus-visible:shadow-[inset_0_0_0_2px_var(--io-accent-tint)]'),
      },
    },
  })

  const busy = status.kind === 'busy'
  const draft = (): DraftPayload => ({
    mailbox,
    to,
    cc,
    bcc,
    subject,
    html: editor ? editor.getHTML() : initialHtml,
  })

  async function send() {
    setStatus({ kind: 'busy', action: 'send' })
    try {
      const r = await onSend(draft())
      setStatus(
        r.success
          ? { kind: 'sent', undoRemainingMs: r.data.undoRemainingMs }
          : { kind: 'error', message: r.error }
      )
    } catch {
      setStatus({ kind: 'error', message: 'Not sent. Try again.' })
    }
  }

  async function save() {
    setStatus({ kind: 'busy', action: 'save' })
    try {
      const r = await onSaveDraft(draft())
      setStatus(r.success ? { kind: 'saved' } : { kind: 'error', message: r.error })
    } catch {
      setStatus({ kind: 'error', message: 'Draft not saved. Try again.' })
    }
  }

  const note =
    status.kind === 'sent'
      ? `Queued. Undo for ${Math.max(1, Math.ceil(status.undoRemainingMs / 60_000))} min`
      : status.kind === 'saved'
        ? 'Draft saved'
        : footNote

  const showCc = cc.length > 0 || showCopies
  const showBcc = bcc.length > 0 || showCopies

  return (
    <div
      data-part="composer"
      className="border-io-line rounded-io-card bg-io-card flex w-full flex-col overflow-hidden border text-[12.5px]"
    >
      <Row
        label="From"
        htmlFor={`${id}-from`}
        aside={
          mailboxLocked ? (
            <span className="text-io-ink-3 inline-flex items-center gap-1 text-[12px]">
              <Lock aria-hidden="true" className="size-3" strokeWidth={1.75} />
              Locked to this thread
            </span>
          ) : null
        }
      >
        <Select
          id={`${id}-from`}
          value={mailbox}
          onChange={(e) => setMailbox(e.target.value as Mailbox)}
          disabled={mailboxLocked}
          options={[
            { value: 'sales', label: mailboxes.sales },
            { value: 'purchase', label: mailboxes.purchase },
          ]}
          className="h-io-btn-xs text-[12px] opacity-100"
        />
      </Row>
      <Row
        label="To"
        aside={
          showCc && showBcc ? null : (
            <button
              type="button"
              onClick={() => setShowCopies(true)}
              className="text-io-ink-3 hover:text-io-ink io-focus rounded-io-tag cursor-pointer text-[12px]"
            >
              Cc · Bcc
            </button>
          )
        }
      >
        <span className="block truncate">{listText(to)}</span>
      </Row>
      {showCc ? (
        <Row label="Cc">
          <span className="block truncate">{listText(cc)}</span>
        </Row>
      ) : null}
      {showBcc ? (
        <Row label="Bcc">
          <span className="block truncate">{listText(bcc)}</span>
        </Row>
      ) : null}
      <Row label="Subject" htmlFor={`${id}-subject`}>
        <input
          id={`${id}-subject`}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="io-focus-field rounded-io-tag w-full bg-transparent"
        />
      </Row>
      <div
        role="toolbar"
        aria-label="Formatting"
        className="border-io-line-2 bg-io-paper text-io-ink-3 flex items-center gap-3.5 border-b px-3.5 py-1.5 text-[12px]"
      >
        <ToolButton
          label="Bold"
          pressed={editor?.isActive('bold') ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className="text-io-ink font-bold"
        >
          B
        </ToolButton>
        <ToolButton
          label="Italic"
          pressed={editor?.isActive('italic') ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className="italic"
        >
          I
        </ToolButton>
        <ToolButton
          label="Bullet list"
          pressed={editor?.isActive('bulletList') ?? false}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          • List
        </ToolButton>
        <ToolButton
          label="Link"
          pressed={editor?.isActive('link') ?? false}
          disabled={!editor}
          onClick={() => editor && toggleLink(editor)}
        >
          Link
        </ToolButton>
        {onAttach ? (
          <ToolButton label="Attach a file" onClick={onAttach}>
            Attach
          </ToolButton>
        ) : null}
        {toolbarNote ? <span className="ml-auto">{toolbarNote}</span> : null}
      </div>
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div aria-label="Message body" aria-busy="true" role="group" className={BODY}>
          {draftPreview(initialHtml)}
        </div>
      )}
      {attachments.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 px-3.5 pb-3">
          {attachments.map((a) => (
            <AttachmentChip key={`${a.fileType}:${a.name}`} {...a} />
          ))}
        </div>
      ) : null}
      <div className="border-io-line flex items-center gap-2 border-t px-3.5 py-2.5">
        <Button
          variant="primary"
          size="sm"
          busy={busy && status.action === 'send'}
          disabled={busy}
          onClick={send}
        >
          {primaryLabel}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          busy={busy && status.action === 'save'}
          disabled={busy}
          onClick={save}
        >
          Save draft
        </Button>
        <Button variant="ghost" size="sm" disabled={busy} onClick={onDiscard}>
          Discard
        </Button>
        <span className="flex-1" />
        {status.kind === 'error' ? (
          <span role="alert" className="text-io-bad text-[12px]">
            {status.message}
          </span>
        ) : (
          <span role="status" className="text-io-ink-3 text-[12px]">
            {note}
          </span>
        )}
      </div>
    </div>
  )
}
