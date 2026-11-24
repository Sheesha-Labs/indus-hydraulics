import { CLASS_LABEL, MAIL_CLASSES } from '@indus/ops-core'
import type { Route } from 'next'
import Link from 'next/link'
import type { ThreadView } from '../../data/mail'
import MailCorrections from './MailCorrections'

/**
 * Board 91's right pane, "What the Assistant did": the classification with its reason and confidence and the
 * level it runs at, the actions taken with their times (each with Why?), a link to the open Review card, and
 * "Not right?" with the corrections.
 */
const CONFIDENCE_WORD = { sure: 'Sure', likely: 'Likely', unsure: 'Unsure' } as const

export default function AssistantPane({
  thread,
  linkHref,
}: {
  thread: ThreadView
  linkHref: string
}) {
  const l = thread.latest
  const review = thread.actions.find(
    (a) => a.surface === 'review' && (a.state === 'proposed' || a.state === 'later')
  )
  const classes = MAIL_CLASSES.filter((c) => c !== 'unclassified').map((c) => ({
    value: c,
    label: CLASS_LABEL[c],
  }))
  const unsure = l.confidence === 'unsure'
  const reason = l.note?.split(' · ').slice(2).join(' · ') || null
  return (
    <aside
      aria-label="What the Assistant did"
      className="bg-io-card border-io-line flex min-h-0 flex-col gap-3 overflow-y-auto border-l px-4 py-4"
    >
      <p className="flex items-center gap-2">
        <span className="bg-io-ink text-io-card rounded-io-tag px-1.5 py-0.5 text-[10.5px] font-semibold tracking-[0.06em] uppercase">
          Assistant
        </span>
        <span className="io-eyebrow">What the Assistant did</span>
      </p>
      <section className="flex flex-col gap-1.5">
        <h2 className="text-[13px] font-medium">
          {unsure
            ? 'Unsure what this is'
            : l.classification === 'unclassified'
              ? 'Not sorted yet'
              : `Classified as ${l.classLabel.toLowerCase()}`}
        </h2>
        {reason ? <p className="text-io-ink-2 text-[12.5px] leading-[1.5]">{reason}</p> : null}
        {l.confidence ? (
          <p className="text-io-ink-3 flex items-center gap-1.5 text-[11.5px]">
            {CONFIDENCE_WORD[l.confidence]} ·
            <span className="border-io-line rounded-io-tag border px-1.5 py-0.5 text-[11px]">
              {thread.levelWord}
            </span>
          </p>
        ) : null}
      </section>
      <hr className="border-io-line" />
      <section className="flex flex-col gap-2">
        <h2 className="text-[12.5px] font-medium">Actions taken</h2>
        {thread.actions.length === 0 ? (
          <p className="text-io-ink-3 text-[12px]">Nothing yet.</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {thread.actions.map((a) => (
              <li
                key={a.id}
                className="grid grid-cols-[52px_minmax(0,1fr)] gap-2 text-[12px] leading-[1.45]"
              >
                <span className="text-io-ink-3 tabular-nums">{a.time}</span>
                <span>
                  {a.headline}{' '}
                  <Link
                    href={`/why/${a.ref}` as Route}
                    className="text-io-accent io-focus rounded-io-tag whitespace-nowrap hover:underline"
                  >
                    Why?
                  </Link>
                </span>
              </li>
            ))}
          </ol>
        )}
        {review ? (
          <Link
            href={`/review?action=${review.ref}` as Route}
            className="text-io-accent io-focus rounded-io-tag text-[12.5px] hover:underline"
          >
            Open in Review ↗
          </Link>
        ) : null}
      </section>
      <hr className="border-io-line" />
      <section className="flex flex-col gap-2">
        <h2 className="text-[12.5px] font-medium">Not right?</h2>
        <MailCorrections
          messageId={l.id}
          current={l.classification}
          classes={classes}
          records={thread.records}
          linkHref={linkHref}
        />
      </section>
    </aside>
  )
}
