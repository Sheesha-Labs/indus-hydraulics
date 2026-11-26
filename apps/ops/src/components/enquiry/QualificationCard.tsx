import { Check, Chip, Tag } from '@indus/ops-ui/status'
import type { Route } from 'next'
import Link from 'next/link'
import type { QualificationView, SignalView } from '../../data/qualification'
import ReadNowButton from './ReadNowButton'

/**
 * Board 167 · the quick read before sourcing (S09-T06), and 171b state 1 while it runs. Three lists of signals
 * (Legitimacy; Fit; Effort and value), each a Status·Check mark, a sentence, a sub-line and the evidence link.
 * The model weighed them; code decided the chips. Server component; the path cards beside it are PathChooser.
 */
type Read = Extract<QualificationView, { state: 'read' }>

const MARK = { ok: 'ok', warn: 'warn', bad: 'bad', none: 'n' } as const
const MARK_LABEL = { ok: 'Passed', warn: 'Warning', bad: 'Problem', none: 'No signal' } as const

function SignalRow({ s }: { s: SignalView }) {
  return (
    <li className="border-io-line grid grid-cols-[16px_minmax(0,1fr)_auto] items-start gap-x-2.5 border-t py-2.5 first:border-t-0">
      <Check mark={MARK[s.mark]} label={MARK_LABEL[s.mark]} className="mt-0.5" />
      <span className="min-w-0">
        <span className="text-io-ink block text-[13px] leading-[1.4]">{s.text}</span>
        {s.sub ? (
          <span className="text-io-ink-3 mt-0.5 block text-[12px] leading-[1.45]">{s.sub}</span>
        ) : null}
      </span>
      {s.link ? (
        s.link.external ? (
          <a
            href={s.link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-io-accent io-focus rounded-io-tag text-[12.5px] whitespace-nowrap hover:underline"
          >
            {s.link.label}
          </a>
        ) : (
          <Link
            href={s.link.href as Route}
            className="text-io-accent io-focus rounded-io-tag text-[12.5px] whitespace-nowrap hover:underline"
          >
            {s.link.label}
          </Link>
        )
      ) : (
        <span />
      )}
    </li>
  )
}

function SignalList({ title, rows }: { title: string; rows: SignalView[] }) {
  return (
    <section aria-label={title} className="min-w-0">
      <h3 className="io-eyebrow border-io-line m-0 border-b pb-2">{title}</h3>
      <ul className="m-0 list-none p-0">
        {rows.map((s, i) => (
          <SignalRow key={`${i}-${s.text}`} s={s} />
        ))}
      </ul>
    </section>
  )
}

const FRAME = 'rounded-io-card border-io-line bg-io-card border p-5'

export default function QualificationCard({
  q,
  enquiryId,
  enquiryRef,
}: {
  q: QualificationView
  enquiryId: string
  enquiryRef: string
}) {
  if (q.state === 'reading')
    return (
      <section
        id="qualification"
        aria-busy="true"
        aria-label="Quick read"
        className={FRAME}
        data-state="reading"
      >
        <div className="flex items-center justify-between">
          <h2 className="io-eyebrow m-0">Qualification · reading</h2>
        </div>
        <div className="mt-3 flex items-start gap-3">
          <Tag kind="assistant">Assistant</Tag>
          <p className="text-io-ink-2 m-0 text-[12.5px] leading-[1.45]">
            Reading the sender and the lines · usually under a minute
          </p>
        </div>
        <div aria-hidden="true" className="mt-4 flex flex-col gap-2.5">
          <span className="io-shimmer rounded-io-tag block h-2.5 w-3/5" />
          <span className="io-shimmer rounded-io-tag block h-2.5 w-1/2" />
          <span className="io-shimmer rounded-io-tag block h-2.5 w-[55%]" />
        </div>
        <p className="text-io-ink-3 m-0 mt-4 text-[12.5px] leading-[1.45]">
          Sourcing can start before the read finishes; the path is asked when it lands.
        </p>
      </section>
    )
  if (q.state === 'failed')
    return (
      <section id="qualification" aria-label="Quick read" className={FRAME} data-state="failed">
        <h2 className="io-eyebrow m-0">Quick read · before sourcing</h2>
        <p className="text-io-ink-2 m-0 mt-3 text-[13px] leading-[1.45]">
          {q.reason}. Choose a path from what you know of the client and the lines, or ask for the
          read.
        </p>
        <div className="mt-3">
          <ReadNowButton enquiryId={enquiryId} enquiryRef={enquiryRef} />
        </div>
      </section>
    )
  if (q.state === 'spam_filed') return null
  return <ReadCard q={q} />
}

function ReadCard({ q }: { q: Read }) {
  return (
    <section id="qualification" aria-label="Quick read" className={FRAME} data-state="read">
      <header className="flex flex-wrap items-center gap-2.5">
        <h2 className="io-eyebrow m-0">Quick read · before sourcing</h2>
        <Tag kind="assistant">Assistant</Tag>
        <span className="text-io-ink-3 text-[12.5px]">
          {q.readAt}
          {q.afterEmail ? `, ${q.afterEmail}` : ''}
        </span>
        <span className="ml-auto flex flex-wrap gap-1.5">
          {q.chips.map((c) => (
            <Chip key={c.label} tone={c.tone} label={c.label} />
          ))}
        </span>
      </header>
      <div className="mt-4">
        <SignalList title="Legitimacy" rows={q.legitimacy} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-6">
        <SignalList title="Fit" rows={q.fit} />
        <SignalList title="Effort and value" rows={q.effort} />
      </div>
      {q.reasons.length ? (
        <details className="mt-4">
          <summary className="text-io-accent io-focus rounded-io-tag w-fit cursor-pointer text-[12.5px]">
            Why this path
          </summary>
          <ul className="text-io-ink-2 m-0 mt-2 list-disc pl-5 text-[12.5px] leading-[1.5]">
            {q.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  )
}
