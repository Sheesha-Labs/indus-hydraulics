import { ButtonLink } from '@indus/ops-ui/controls'
import { Banner } from '@indus/ops-ui/status'
import type { ThreadView } from '../../data/mail'
import AskOpenCopyButton from './AskOpenCopyButton'
import TranslationToggle from './TranslationToggle'

/**
 * Board 97, the states of one message: a password-protected attachment (→ ask_open_copy, Draft and ask), a
 * file stored but never opened (over the zip guard), an attachment that could not be read, a body still being
 * fetched, and Original / English for an email in another script. Server component.
 */
export default function MailStateNotes({ thread }: { thread: ThreadView }) {
  const l = thread.latest
  const s = l.state
  const asked = thread.actions.find((a) => a.actionKey === 'ask_open_copy')
  return (
    <>
      {s.bodyPending ? (
        <section aria-label="Loading the email" aria-busy className="flex flex-col gap-2 py-1">
          <span className="bg-io-fill-2 rounded-io-tag h-2.5 w-2/5" />
          <span className="bg-io-fill-2 rounded-io-tag h-2.5 w-4/5" />
          <span className="bg-io-fill-2 rounded-io-tag h-2.5 w-3/4" />
          <p className="text-io-ink-3 text-[12px]">Fetching from Gmail…</p>
        </section>
      ) : null}
      {s.protectedFiles.length ? (
        <div className="flex flex-col gap-2">
          <Banner tone="warn" icon="warn">
            {s.protectedFiles.join(', ')} {s.protectedFiles.length === 1 ? 'is' : 'are'}{' '}
            password-protected.
          </Banner>
          {asked ? (
            <ButtonLink
              href={`/review?action=${asked.ref}`}
              variant="secondary"
              className="self-start"
            >
              {asked.state === 'proposed' || asked.state === 'later'
                ? 'The reply waits in Review'
                : 'Open the reply in Review'}
            </ButtonLink>
          ) : (
            <div className="self-start">
              <AskOpenCopyButton messageId={l.id} />
            </div>
          )}
        </div>
      ) : null}
      {s.oversized.map((f) => (
        <p key={f.name} className="text-io-ink-2 text-[12.5px]">
          <span className="font-medium">{f.name}</span> · {f.note}
        </p>
      ))}
      {s.unreadable.length ? (
        <p className="text-io-ink-2 flex flex-wrap items-center gap-2 text-[12.5px]">
          <span>
            {s.unreadable.join(', ')} could not be read here (damaged or an unsupported format).
          </span>
          <a
            href={thread.gmailUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-io-accent io-focus rounded-io-tag underline underline-offset-2"
          >
            Open in Gmail ↗
          </a>
        </p>
      ) : null}
      {s.translation ? (
        <TranslationToggle
          messageId={l.id}
          english={s.translation.english}
          languageName={s.translation.languageName}
        />
      ) : null}
    </>
  )
}
