import type { Route } from 'next'
import Link from 'next/link'
import { MAIL_TYPE_TONE } from '@indus/ops-ui/status'
import { MailMessage, type Mailbox } from '@indus/ops-ui/mail'
import { Chip } from '@indus/ops-ui/status'
import type { NotBusinessToday, ThreadView } from '../../data/mail'
import MailStateCards from './MailStateCards'
import MailStateNotes from './MailStateNotes'
import ReplyBox from './ReplyBox'

/**
 * The conversation (board 91, middle of the reading area): subject and "Open in Gmail ↗", the type and record
 * chips, a note when the conversation spans both mailboxes, then the messages (bodies only inside the kit's
 * sandboxed frame) and the reply box. Earlier messages collapse to a count.
 */
export default function ThreadReading({
  thread,
  nonce,
  reply,
  notBusiness = null,
  allHref,
}: {
  thread: ThreadView
  nonce?: string | undefined
  notBusiness?: NotBusinessToday | null
  /** "show" on a huge thread. */
  allHref: string
  reply: {
    mailbox: Mailbox
    mailboxes: Record<Mailbox, string>
    permission: 'send' | 'propose' | 'none'
    envelope: string
    cc: string[]
  }
}) {
  const l = thread.latest
  return (
    <div className="flex min-h-0 min-w-0 flex-col gap-3">
      <header className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <h2 className="min-w-0 flex-1 text-[16px] leading-[1.35] font-medium">
            {thread.subject}
          </h2>
          <a
            href={thread.gmailUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-io-accent io-focus rounded-io-tag flex-none text-[12.5px] hover:underline"
          >
            Open in Gmail ↗
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {l.type ? <Chip tone={MAIL_TYPE_TONE[l.type]} label={l.type} /> : null}
          {thread.records.map((r) => (
            <span
              key={`${r.subjectType}:${r.subjectId}`}
              className="border-io-line text-io-ink-2 h-io-tag rounded-io-tag inline-flex items-center border px-1.5 text-[11px]"
            >
              {r.label}
            </span>
          ))}
        </div>
        {thread.crossMailbox ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {thread.mailboxesInThread.map((a) => (
              <span
                key={a}
                className="bg-io-fill text-io-ink-2 rounded-io-pill h-io-tag inline-flex items-center px-2 text-[11px]"
              >
                {a.split('@')[0]}@
              </span>
            ))}
            <p className="text-io-ink-3 text-[12px]">{thread.crossMailbox}</p>
          </div>
        ) : null}
      </header>
      <MailStateCards thread={thread} notBusiness={notBusiness} />
      <MailStateNotes thread={thread} />
      {thread.earlier > 0 && !thread.collapsedAfterFirst ? (
        <p className="text-io-ink-3 text-[12px]">
          {thread.earlier} earlier {thread.earlier === 1 ? 'message' : 'messages'} ·{' '}
          <a
            href={thread.gmailUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-io-accent io-focus rounded-io-tag hover:underline"
          >
            show in Gmail
          </a>
        </p>
      ) : null}
      <ol className="flex flex-col gap-3">
        {thread.messages.map((m, i) => (
          <li key={m.id} className="flex flex-col gap-1">
            {i === 1 && thread.collapsedAfterFirst ? (
              <Link
                href={allHref as Route}
                className="border-io-line text-io-accent io-focus rounded-io-ctl mb-2 block border border-dashed px-3 py-2 text-center text-[12.5px] hover:underline"
              >
                {thread.earlier} earlier {thread.earlier === 1 ? 'message' : 'messages'} · show
              </Link>
            ) : null}
            <p className="text-io-ink-3 text-[11.5px]">
              To {m.mailbox} · {m.time}
            </p>
            <MailMessage
              from={m.from}
              to={m.to}
              {...(m.cc ? { cc: m.cc } : {})}
              subject={m.subject}
              bodyHtml={m.bodyHtml}
              attachments={m.attachments}
              bodyHeight="preview"
              {...(nonce ? { nonce } : {})}
            />
          </li>
        ))}
      </ol>
      <ReplyBox
        threadId={thread.id}
        mailbox={reply.mailbox}
        mailboxes={reply.mailboxes}
        to={[l.from.address]}
        cc={reply.cc}
        subject={/^re:/i.test(thread.subject) ? thread.subject : `Re: ${thread.subject}`}
        envelope={reply.envelope}
        replyTo={l.from.name ?? l.from.address}
        permission={reply.permission}
      />
    </div>
  )
}
