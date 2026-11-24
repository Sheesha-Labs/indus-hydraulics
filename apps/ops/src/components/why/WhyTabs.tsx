import { CheckList, ConfidenceLine, WhyList } from '@indus/ops-ui/assistant'
import { List } from '@indus/ops-ui/card'
import type { Route } from 'next'
import Link from 'next/link'
import type { WhyTab, WhyView } from '../../data/why'
import SourcePanel from './SourcePanel'

/**
 * The three Why? tabs (S06-T05, board 112 / S04A), the same in the drawer and on the full page. Reasons: the
 * reasons (each source link switches to Sources at its span), the alternatives the Assistant weighed and why
 * they lost, the code checks and the confidence. Sources: the highlighted spans. History: the value's
 * before → after rows with who made each change.
 */
export function whyTabs(view: WhyView) {
  return [
    { key: 'reasons', label: 'Reasons' },
    { key: 'sources', label: 'Sources', count: view.spans.length },
    { key: 'history', label: 'History' },
  ]
}

function Eyebrow({ children }: { children: string }) {
  return <h3 className="io-eyebrow m-0">{children}</h3>
}

export default function WhyTabBody({
  view,
  tab,
  activeSpan,
  onEvidence,
}: {
  view: WhyView
  tab: WhyTab
  activeSpan: string | null
  onEvidence?: (evidenceId: string) => void
}) {
  // S04A: the Reasons tab shows the main source inline (the one the link pointed at, else the first).
  const lead = view.spans.find((x) => x.key === activeSpan) ?? view.spans[0] ?? null
  if (tab === 'sources')
    return <SourcePanel spans={view.spans} activeSpan={activeSpan} noQuote={view.noQuote} />
  if (tab === 'history')
    return view.history.length === 0 ? (
      <p className="text-io-ink-3 m-0 text-[12.5px]">
        This value has not changed since it was captured.
      </p>
    ) : (
      <List
        items={view.history.map((h) => ({
          key: h.key,
          mark: null,
          title: (
            <span>
              <span className="text-io-ink-3">{h.field}</span> {h.before} → {h.after}
            </span>
          ),
          sub: (
            <span>
              {h.who}
              {h.note ? ` · ${h.note}` : ''} ·{' '}
              <Link
                href={`/why/${encodeURIComponent(h.evidenceId)}` as Route}
                className="text-io-accent io-focus rounded-io-tag underline underline-offset-2"
              >
                Why?
              </Link>
            </span>
          ),
          right: <span className="tabular-nums">{h.time}</span>,
        }))}
      />
    )
  return (
    <>
      {view.overridden ? (
        <p className="text-io-ink-3 m-0 text-[12.5px]" data-part="overridden">
          {view.overridden}
        </p>
      ) : null}
      {view.reasons.length ? (
        <WhyList reasons={view.reasons} {...(onEvidence ? { onEvidence } : {})} />
      ) : (
        <p className="text-io-ink-3 m-0 text-[12.5px]">{view.noQuote ?? 'No reasons recorded.'}</p>
      )}
      {lead ? <SourcePanel spans={[lead]} activeSpan={lead.key} noQuote={null} /> : null}
      {view.alternatives.length ? (
        <section className="flex flex-col gap-2" aria-label="Alternatives considered">
          <Eyebrow>Alternatives considered</Eyebrow>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {view.alternatives.map((a) => (
              <li
                key={a.key}
                className="border-io-line rounded-io-card flex flex-col gap-0.5 border px-3.5 py-2.5"
              >
                <span className="text-io-ink text-[13px] font-medium">{a.label}</span>
                {a.why ? <span className="text-io-ink-3 text-[12.5px]">{a.why}</span> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {view.checks.length ? <CheckList items={view.checks} /> : null}
      {view.confidence ? (
        <ConfidenceLine
          level={view.confidence.level}
          {...(view.confidence.reason ? { reason: view.confidence.reason } : {})}
        />
      ) : null}
      {view.footnote ? (
        <p className="text-io-ink-3 m-0 text-[11.5px]" data-part="footnote">
          {view.footnote}
        </p>
      ) : null}
    </>
  )
}
