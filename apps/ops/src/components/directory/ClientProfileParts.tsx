import { Chip } from '@indus/ops-ui/status'
import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { ClientPage } from '../../data/clients'

/**
 * Board 12 cards (S10-T02, `#s12`): Enquiries, Quotations sent and Leads (Card·List rows), What they buy (bars by
 * trade share) and Lost reasons over 12 months. Server-rendered; no stock wording anywhere (§1.5).
 */
export function SectionCard({
  eyebrow,
  note,
  children,
  label,
}: {
  eyebrow: string
  note?: ReactNode
  children: ReactNode
  label?: string
}) {
  return (
    <section
      aria-label={label ?? eyebrow}
      className="bg-io-card border-io-line rounded-io-card overflow-hidden border"
    >
      <div className="border-io-line flex items-center justify-between border-b px-[18px] py-3.5">
        <h2 className="io-eyebrow m-0">{eyebrow}</h2>
        {note ? <span className="text-io-ink-3 text-[12px]">{note}</span> : null}
      </div>
      {children}
    </section>
  )
}

const ROW = 'border-io-line border-b px-[18px] py-3.5 text-[12.5px] last:border-b-0'

export function EnquiriesCard({ page }: { page: ClientPage }) {
  return (
    <SectionCard eyebrow={`Enquiries · ${page.enquiries.length}`} note={page.enquiryNote}>
      {page.enquiries.length ? (
        <ul className="m-0 list-none p-0">
          {page.enquiries.map((e) => (
            <li
              key={e.id}
              className={`${ROW} grid grid-cols-[132px_minmax(0,1fr)_64px_64px_120px_56px] items-center gap-3`}
            >
              <Link
                href={`/enquiries/${e.ref}` as Route}
                className="io-focus rounded-io-tag text-[12.5px]"
              >
                {e.ref}
              </Link>
              <span className="truncate font-medium">{e.title}</span>
              <span className="text-io-ink-3 text-right">{e.lines} lines</span>
              <span className="text-right">{e.value ?? '—'}</span>
              <span>
                <Chip tone={e.stageTone} label={e.stage} />
              </span>
              <span className="text-io-ink-3 text-right">{e.date}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-io-ink-3 m-0 px-[18px] py-4 text-[12.5px]">
          No enquiries from this client yet.
        </p>
      )}
    </SectionCard>
  )
}

export function QuotationsCard({ page }: { page: ClientPage }) {
  return (
    <SectionCard eyebrow={`Quotations sent · ${page.quotations.length}`} note={page.quotedNote}>
      {page.quotations.length ? (
        <ul className="m-0 list-none p-0">
          {page.quotations.map((q) => (
            <li
              key={q.id}
              className={`${ROW} grid grid-cols-[130px_minmax(0,1fr)_60px_80px_60px_120px] items-center gap-3`}
            >
              <Link
                href={`/enquiries/${q.enquiryRef}` as Route}
                className="io-focus rounded-io-tag"
              >
                {q.number}
              </Link>
              <span className="truncate">{q.title}</span>
              <span className="text-io-ink-3">{q.date}</span>
              <span className="text-right">{q.total}</span>
              <span className="text-io-ink-3 text-right text-[12px]">{q.margin ?? ''}</span>
              <span className="justify-self-end">
                <Chip tone={q.statusTone} label={q.status} />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-io-ink-3 m-0 px-[18px] py-4 text-[12.5px]">No quotation sent yet.</p>
      )}
    </SectionCard>
  )
}

export function LeadsCard({ page }: { page: ClientPage }) {
  return (
    <SectionCard eyebrow={`Leads · ${page.leads.length}`}>
      {page.leads.length ? (
        <ul className="m-0 list-none p-0">
          {page.leads.map((l) => (
            <li
              key={l.id}
              className={`${ROW} grid grid-cols-[80px_minmax(0,1fr)_80px_90px] items-center gap-3`}
            >
              <Link href={`/enquiries/leads/${l.ref}` as Route} className="io-focus rounded-io-tag">
                {l.ref}
              </Link>
              <span className="truncate">{l.title}</span>
              <span className="text-right">{l.value ?? '—'}</span>
              <span className="justify-self-end">
                <Chip tone="acc" label={l.stage[0]!.toUpperCase() + l.stage.slice(1)} />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-io-ink-3 m-0 px-[18px] py-4 text-[12.5px]">No open leads.</p>
      )}
    </SectionCard>
  )
}

export function BuysCard({ page }: { page: ClientPage }) {
  return (
    <section
      aria-label="What they buy"
      className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
    >
      <h2 className="io-eyebrow m-0 mb-3">What they buy</h2>
      {page.buys.length ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {page.buys.map((b) => (
            <li key={b.key} className="flex flex-col gap-1.5 text-[12.5px]">
              <span className="flex justify-between">
                <span>{b.label}</span>
                <span>{b.pct}%</span>
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 100 4"
                preserveAspectRatio="none"
                className="h-1 w-full"
              >
                <rect x="0" y="0" width="100" height="4" rx="2" className="fill-io-fill" />
                <rect
                  x="0"
                  y="0"
                  width={Math.max(b.pct, 1)}
                  height="4"
                  rx="2"
                  className="fill-io-accent"
                />
              </svg>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-io-ink-3 m-0 text-[12.5px]">
          Shows once their enquiry lines are matched to trades.
        </p>
      )}
    </section>
  )
}

export function LostReasonsCard({ page }: { page: ClientPage }) {
  return (
    <section
      aria-label="Lost reasons"
      className="bg-io-card border-io-line rounded-io-card border px-5 py-4"
    >
      <h2 className="io-eyebrow m-0 mb-3">Lost reasons · 12 months</h2>
      {page.lostReasons.length ? (
        <dl className="m-0 flex flex-col gap-2 text-[12.5px]">
          {page.lostReasons.map((r) => (
            <div key={r.label} className="flex justify-between">
              <dt>{r.label}</dt>
              <dd className="m-0">{r.count}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-io-ink-3 m-0 text-[12.5px]">Nothing lost in the last 12 months.</p>
      )}
    </section>
  )
}
