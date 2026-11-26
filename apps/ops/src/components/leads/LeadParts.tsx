import { LEAD_TRACK, leadTrackIndex } from '@indus/ops-core'
import { ButtonLink } from '@indus/ops-ui/controls'
import { RecordTabs } from '@indus/ops-ui/shell'
import { StageTrack } from '@indus/ops-ui/status'
import type { Route } from 'next'
import Link from 'next/link'
import type { LeadDetail } from '../../data/leads'
import { fmtDay } from '../../data/leads'
import { ConvertButton, SpecCell, StageMenu } from './LeadClient'

/**
 * Board 22 · Lead detail (S09-T05, `#s22`): the lead variant of the record header (crumb, serif title, who and
 * how it came, the New · Contacted · Qualified · Enquiry track, four tabs), the material specs with their
 * sources, and the rail (lead facts, source documents, activity).
 */
export function LeadHeader({ lead }: { lead: LeadDetail }) {
  const who = [
    lead.company,
    lead.contact?.name
      ? `${lead.contact.name}${lead.contact.role ? `, ${lead.contact.role}` : ''}`
      : null,
    `Source: ${lead.source.toLowerCase()}`,
    lead.owner ? `Owner ${lead.owner.name}` : null,
  ].filter(Boolean)
  const base = `/enquiries/leads/${lead.ref}`
  const ended = lead.stage === 'converted' || lead.stage === 'dropped'
  return (
    <header
      data-part="lead-header"
      className="bg-io-card border-io-line flex flex-col gap-3 border-b px-7 pt-4"
    >
      <div className="flex items-center justify-between gap-4">
        <nav
          aria-label="Breadcrumb"
          className="text-io-ink-3 flex min-w-0 items-center gap-2 text-[12px]"
        >
          <Link
            href={'/enquiries/leads' as Route}
            className="io-focus rounded-io-tag hover:text-io-ink"
          >
            Leads
          </Link>
          <span aria-hidden="true">/</span>
          {lead.companyId ? (
            <Link
              href={`/clients/${lead.companyId}` as Route}
              className="io-focus rounded-io-tag hover:text-io-ink truncate"
            >
              {lead.company}
            </Link>
          ) : (
            <span className="truncate">{lead.company ?? lead.name}</span>
          )}
          <span aria-hidden="true">/</span>
          <b aria-current="page" className="text-io-ink-2 font-medium whitespace-nowrap">
            {lead.ref}
          </b>
        </nav>
        <div className="flex flex-none items-center gap-2">
          {ended ? null : (
            <StageMenu
              leadId={lead.id}
              leadRef={lead.ref}
              version={lead.version}
              stage={lead.stage}
            />
          )}
          {ended ? null : (
            <ButtonLink href={`/enquiries/new?lead=${lead.ref}`} className="px-3 text-[12.5px]">
              Upload more files
            </ButtonLink>
          )}
          {lead.stage === 'converted' && lead.convertedEnquiryRef ? (
            <ButtonLink
              variant="primary"
              href={`/enquiries/${lead.convertedEnquiryRef}`}
              className="px-[13px] text-[12.5px]"
            >
              Open {lead.convertedEnquiryRef}
            </ButtonLink>
          ) : lead.stage === 'dropped' ? null : (
            <ConvertButton />
          )}
        </div>
      </div>
      <div className="flex items-start justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="io-display text-io-record m-0">{lead.title}</h1>
          <p className="text-io-ink-3 m-0 text-[12.5px]">{who.join(' · ')}</p>
        </div>
        <StageTrack
          flow="custom"
          stages={LEAD_TRACK}
          current={LEAD_TRACK[leadTrackIndex(lead.stage)]!}
          label="Lead stage"
          className="mt-2 flex-none"
        />
      </div>
      <RecordTabs
        aria-label="Lead sections"
        tabs={[
          {
            key: 'specs',
            label: 'Material specs',
            href: base,
            segment: '',
            count: lead.lines.length,
          },
          {
            key: 'documents',
            label: 'Documents',
            href: `${base}/documents`,
            segment: 'documents',
            count: lead.documents.length,
          },
          { key: 'notes', label: 'Notes', href: `${base}/notes`, segment: 'notes' },
          { key: 'activity', label: 'Activity', href: `${base}/activity`, segment: 'activity' },
        ]}
      />
    </header>
  )
}

const GRID = 'grid grid-cols-[28px_minmax(0,1fr)_150px_44px_44px_140px_70px] items-center gap-3'

export function MaterialSpecTable({ lead, all }: { lead: LeadDetail; all: boolean }) {
  const SHOW = 9
  const rows = all ? lead.lines : lead.lines.slice(0, SHOW)
  const more = lead.lines.length - rows.length
  const p = lead.provenance
  return (
    <section
      aria-labelledby="material"
      data-part="material-specs"
      className="bg-io-card border-io-line rounded-io-card overflow-hidden border"
    >
      <div className="border-io-line flex items-center justify-between gap-3 border-b px-[18px] py-3.5">
        <h2 id="material" className="io-eyebrow m-0 text-[10.5px] tracking-[0.13em]">
          Material requested · {lead.lines.length} line{lead.lines.length === 1 ? '' : 's'}
        </h2>
        {p?.filename ? (
          <span className="text-io-ink-3 truncate text-[12px]">
            Filled from {p.filename}
            {p.by ? ` · confirmed by ${p.by.split(' ')[0]}` : ''}
            {p.at ? `, ${fmtDay(p.at)}` : ''}
          </span>
        ) : null}
      </div>
      {lead.lines.length === 0 ? (
        <p className="text-io-ink-3 m-0 px-[18px] py-4 text-[12.5px]">
          No material list yet. Upload the client’s files and place their lines on this lead.
        </p>
      ) : (
        <div role="table" aria-labelledby="material">
          <div
            role="row"
            className={`${GRID} border-io-line text-io-ink-3 border-b px-[18px] py-2.5 text-[10.5px] font-medium tracking-[0.08em] uppercase`}
          >
            <span role="columnheader">#</span>
            <span role="columnheader">Description</span>
            <span role="columnheader">Part no.</span>
            <span role="columnheader" className="text-right">
              Qty
            </span>
            <span role="columnheader">UoM</span>
            <span role="columnheader">Material / spec</span>
            <span role="columnheader">Source</span>
          </div>
          {rows.map((l) => (
            <div
              key={l.id}
              role="row"
              data-line={l.no}
              className={`${GRID} border-io-line border-b px-[18px] py-[11px] text-[12.5px] last:border-b-0`}
            >
              <span role="cell" className="text-io-ink-3">
                {l.no}
              </span>
              <span role="cell" className="truncate" title={l.description}>
                {l.description}
              </span>
              <span role="cell" className="truncate text-[11px]">
                {l.partNo ?? '—'}
              </span>
              <span role="cell" className="text-right text-[13px] font-medium">
                {l.qty ?? '—'}
              </span>
              <span role="cell" className="text-io-ink-3 text-[11px]">
                {l.uom ?? ''}
              </span>
              <span role="cell" className="min-w-0 text-[11.5px]">
                <SpecCell
                  lineId={l.id}
                  leadRef={lead.ref}
                  version={l.version}
                  value={l.specNotes}
                  no={l.no}
                />
              </span>
              <span role="cell" className="text-[11px]">
                {l.spanId ? (
                  <Link
                    href={`/why/sp_${l.spanId}` as Route}
                    className="text-io-accent io-focus rounded-io-tag underline-offset-2 hover:underline"
                  >
                    {l.sourcePage ? `p.${l.sourcePage}` : 'Source'} ↗
                  </Link>
                ) : (
                  <span className="text-io-ink-3">
                    {l.sourcePage ? `p.${l.sourcePage}` : 'Typed'}
                  </span>
                )}
              </span>
            </div>
          ))}
          {more > 0 ? (
            <div className="px-[18px] py-3 text-[12.5px]">
              <Link
                href={`/enquiries/leads/${lead.ref}?all=1` as Route}
                className="text-io-ink-2 io-focus rounded-io-tag hover:underline"
              >
                + {more} more line{more === 1 ? '' : 's'}
              </Link>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

const EYEBROW = 'io-eyebrow m-0 text-[10.5px] tracking-[0.13em]'

export function LeadRail({
  lead,
  activity,
}: {
  lead: LeadDetail
  activity: Array<{ id: string; at: Date; text: string; when: string }>
}) {
  return (
    <div className="flex flex-col gap-4">
      <section
        aria-labelledby="lead-facts"
        className="bg-io-card border-io-line rounded-io-card flex flex-col gap-3 border p-5"
      >
        <h2 id="lead-facts" className={EYEBROW}>
          Lead
        </h2>
        <dl className="m-0 flex flex-col gap-2 text-[12.5px]">
          {[
            ['Est. value', lead.estValue ?? '—'],
            ['Interest', lead.interest ?? '—'],
            ['Needed by', lead.neededBy ? fmtDay(lead.neededBy) : '—'],
            ['Categories', lead.categories.length ? String(lead.categories.length) : '—'],
            ['Client ref', lead.clientRef ?? '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-io-ink-3">{k}</dt>
              <dd className="m-0 truncate text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section
        aria-labelledby="lead-docs"
        className="bg-io-card border-io-line rounded-io-card flex flex-col gap-3 border p-5"
      >
        <h2 id="lead-docs" className={EYEBROW}>
          Source documents
        </h2>
        {lead.documents.length === 0 ? (
          <p className="text-io-ink-3 m-0 text-[12.5px]">No documents yet.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {lead.documents.map((d) => (
              <li key={d.id} className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="io-hatch border-io-line rounded-io-tag h-9 w-8 flex-none border"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-[12.5px]">{d.filename}</span>
                  <span className="text-io-ink-3 text-[11.5px]">
                    {d.linesFound
                      ? `${d.linesFound} lines read · ${d.linesKept} kept`
                      : 'Reference · no lines'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section
        aria-labelledby="lead-activity"
        className="bg-io-card border-io-line rounded-io-card flex flex-col gap-3 border p-5"
      >
        <h2 id="lead-activity" className={EYEBROW}>
          Activity
        </h2>
        {activity.length === 0 ? (
          <p className="text-io-ink-3 m-0 text-[12.5px]">Nothing recorded yet.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[12.5px]">
            {activity.slice(0, 4).map((a) => (
              <li key={a.id} className="flex justify-between gap-3">
                <span className="min-w-0 truncate">{a.text}</span>
                <time dateTime={a.at.toISOString()} className="text-io-ink-3 flex-none">
                  {a.when}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
