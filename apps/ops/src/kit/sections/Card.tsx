import {
  Card,
  Contact,
  KeyValue,
  Kpi,
  List,
  NeedsRow,
  Note,
  Person,
  Stat,
} from '@indus/ops-ui/card'
import { ButtonLink } from '@indus/ops-ui/controls'
import { formatDate, formatMoney } from '@indus/ops-ui/format'
import { cn } from '@indus/ops-ui/lib/cn'
import type { ReactNode } from 'react'
import { COMPANIES, KIT_NOW, PEOPLE, REFS } from '../fixtures'

/** Set to 'built' when S01-T05 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'built'

/**
 * One spec row (L1 `.cv-sr`). `full` rows exist only on /_kit/card; inside the L1 mirror (k04) they are
 * hidden so the card keeps the sheet's height.
 */
function Row({
  name,
  code,
  note,
  full = false,
  children,
}: {
  name: string
  code: string
  note: string
  full?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'border-io-line-2 grid grid-cols-[200px_minmax(0,1fr)] items-start gap-6 border-t pt-[18px] first:border-t-0 first:pt-0',
        full && 'in-data-[kit-section=k04]:hidden'
      )}
    >
      <div className="flex flex-col gap-[3px] tracking-normal">
        <b className="text-[13px] leading-[normal] font-medium">{name}</b>
        <code className="text-io-accent font-sans text-[11.5px] leading-[normal]">{code}</code>
        <small className="text-io-ink-3 text-[12px] leading-[1.45]">{note}</small>
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

const aed = (v: string) => formatMoney('AED', v).text
const usdList = (v: string) => formatMoney('USD', v, { decimals: 'list' }).text

/**
 * Card kit specimen: the L1 k04 mirror (the sheet's rows, parts and widths with neutral samples), then the
 * variants the sheet does not show (/_kit/card only): a titled card with text, every list mark, the other
 * label widths, KPI up, avatar sizes, warn and plain notes.
 */
export default function CardSpecimen() {
  return (
    <>
      {/* ---- L1 k04 mirror ---- */}
      <Row
        name="Card"
        code={'part="Card"'}
        note="eyebrow · link · items mark~title~sub~right (right with > is a link)"
      >
        <div className="flex w-[420px] flex-col gap-2.5">
          <Card
            eyebrow="Came in since yesterday"
            link={{ label: 'See all', href: '/_kit/card?see=all' }}
            items={[
              {
                key: 'enq',
                mark: 'n',
                title: '2 new enquiries',
                sub: `${REFS.enquiry} ${COMPANIES.client} · about USD 40k`,
              },
              {
                key: 'quotes',
                mark: 'ok',
                title: '3 supplier quotes captured',
                sub: 'Example Valve, Sample Valves, Demo Bearings',
                right: '09:12',
              },
              {
                key: 'price',
                mark: 'warn',
                title: '1 price above history',
                sub: 'BRG-6316-C3 · Demo Bearings +6%',
                right: 'Review',
              },
            ]}
          />
        </div>
        <div className="flex w-[420px] flex-col gap-2.5">
          <Card
            eyebrow="Order"
            pairs={[
              { label: 'Client', value: COMPANIES.client },
              { label: 'Order value', value: usdList('218500') },
              { label: 'Client PO', value: REFS.clientRef },
              {
                label: 'Delivery',
                value: `${formatDate('2026-12-14T08:00:00Z', { now: KIT_NOW })} · 24 days left`,
                emphasis: 'bad',
              },
              {
                label: 'Quotation',
                value: REFS.quotationRevised,
                emphasis: 'link',
                href: '/_kit/card?quotation=Q10001-R2',
              },
            ]}
          />
        </div>
      </Row>

      <Row
        name="KV"
        code={'part="KV" layout'}
        note="rows (label column) or stack (label over value)"
      >
        <div className="flex w-[380px] flex-col gap-2.5">
          <KeyValue
            pairs={[
              { label: 'Incoterm', value: 'DAP site' },
              { label: 'Payment', value: '30% advance', sub: 'then 70% before dispatch' },
              { label: 'Currency', value: 'USD' },
              { label: 'Book currency', value: 'AED' },
            ]}
          />
        </div>
        <div className="flex w-[620px] flex-col gap-2.5">
          <KeyValue
            layout="stack"
            pairs={[
              { label: 'Client', value: 'Sample Client' },
              { label: 'Lines', value: '12' },
              { label: 'Value', value: usdList('157500') },
              {
                label: 'Deadline',
                value: formatDate('2026-09-30T08:00:00Z', { now: KIT_NOW }),
                emphasis: 'bad',
              },
            ]}
          />
        </div>
      </Row>

      <Row name="Stat · KPI" code={'part="Stat|KPI"'} note="Small totals box; KPI tile with delta">
        {/* /_kit/card shows the total row. The sheet's own parser drops its "=" total marker and prints the
            last row plain, so the L1 mirror (k04) does the same to keep the sheet's height. */}
        <div className="flex w-[260px] flex-col gap-2.5 in-data-[kit-section=k04]:hidden">
          <Stat
            rows={[
              { label: 'Supplier cost', value: aed('32428.04') },
              { label: 'Freight', value: aed('2427.13') },
              { label: 'Other', value: aed('299.14') },
              { label: 'Landed', value: aed('35154.31'), total: true },
            ]}
          />
        </div>
        <div className="hidden w-[260px] flex-col gap-2.5 in-data-[kit-section=k04]:flex">
          <Stat
            rows={[
              { label: 'Supplier cost', value: aed('32428.04') },
              { label: 'Freight', value: aed('2427.13') },
              { label: 'Other', value: aed('299.14') },
              { label: 'Landed', value: aed('35154.31') },
            ]}
          />
        </div>
        <Kpi label="Awaiting decision" value={usdList('608200')} sub="weighted USD 316,400" />
        <Kpi label="Margin, last 30 days" value="13.4%" sub="−1.6 pts vs estimate" direction="dn" />
      </Row>

      <Row
        name="Needs-you row"
        code={'part="NeedsRow"'}
        note="Today and Review: action tag, record, one line of context, buttons"
      >
        <div className="flex w-[820px] flex-col gap-2.5">
          <NeedsRow
            action="Send quotation"
            title={`${REFS.quotationRevised} · ${COMPANIES.client}`}
            sub="Assistant drafted · price guard 2 warnings"
            actions={
              <ButtonLink variant="primary" size="sm" href="/_kit/card?review=1">
                Review
              </ButtonLink>
            }
          />
          <NeedsRow
            action="Bank change"
            title="Sample Valves LLC · payments blocked"
            sub="Record a call-back to the number on file"
            actions={
              <ButtonLink variant="primary" size="sm" href="/_kit/card?open=1">
                Open
              </ButtonLink>
            }
          />
        </div>
      </Row>

      <Row
        name="Person · Contact · Note"
        code={'part="Person|Contact|Note"'}
        note="owner · helper · assistant · ext"
      >
        <Person who="owner" initials={PEOPLE.owner.initials} name={PEOPLE.owner.name} sub="Owner" />
        <Person
          who="helper"
          initials={PEOPLE.helper.initials}
          name={PEOPLE.helper.name}
          sub={PEOPLE.helper.role}
        />
        <Person who="assistant" initials="AS" name="Assistant" sub="Do and tell" />
        <Person who="ext" initials="BX" label="Buyer Example" size="sm" />
        <div className="flex w-[300px] flex-col gap-2.5">
          <Contact
            eyebrow="Client contact"
            rows={[
              { label: 'Name', value: 'Buyer Example' },
              { label: 'Role', value: 'Materials manager' },
              {
                label: 'Email',
                value: 'buyer@client.example',
                href: 'mailto:buyer@client.example',
              },
              { label: 'Thread', value: `RE: RFQ ${REFS.clientRef}`, href: '/_kit/card?thread=1' },
            ]}
          />
        </div>
        <div className="flex w-[360px] flex-col gap-2.5">
          <Note title="On send ·">
            the quotation goes from sales@ in the buyer’s thread, with the PDF attached.
          </Note>
        </div>
      </Row>

      {/* ---- Beyond the sheet (/_kit/card only) ---- */}
      <Row
        name="Card · title · text"
        code="title titleAs text"
        note="The title is a heading at the level the page sets; text 12.5/1.55"
        full
      >
        <div className="flex w-[420px] flex-col gap-2.5">
          <Card
            eyebrow="Enquiry"
            title={`${REFS.enquiry} · ${COMPANIES.client}`}
            titleAs="h3"
            text="Twelve lines received by email. Four suppliers asked; two quotes are in and one regretted."
            kvLabelWidth={110}
            pairs={[
              { label: 'Received', value: formatDate('2026-09-14T08:00:00Z', { now: KIT_NOW }) },
              { label: 'Deadline', value: formatDate('2025-09-30T08:00:00Z', { now: KIT_NOW }) },
            ]}
          />
        </div>
        <div className="flex w-[420px] flex-col gap-2.5">
          <List
            items={[
              { key: 'ok', mark: 'ok', title: 'Passed', sub: 'mark ok' },
              { key: 'warn', mark: 'warn', title: 'Needs attention', sub: 'mark warn' },
              { key: 'bad', mark: 'bad', title: 'Problem', sub: 'mark bad' },
              { key: 'acc', mark: 'acc', title: 'Next', sub: 'mark acc' },
              { key: 'run', mark: 'run', title: 'In progress', sub: 'mark run' },
              {
                key: 'todo',
                mark: 'todo',
                title: 'To do',
                right: { label: 'Open', href: '/_kit/card?todo=1' },
              },
              { key: 'none', mark: null, title: 'No mark column', right: '10:41' },
            ]}
          />
        </div>
      </Row>

      <Row
        name="KV widths · KPI up"
        code="labelWidth 110|160 · cols · dir up"
        note="Label widths are a closed set; stack takes 2–5 columns"
        full
      >
        <div className="flex w-[380px] flex-col gap-2.5">
          <KeyValue
            labelWidth={160}
            pairs={[
              { label: 'Book currency', value: 'AED' },
              { label: 'Quotation currency', value: 'USD' },
            ]}
          />
        </div>
        <div className="flex w-[380px] flex-col gap-2.5">
          <KeyValue
            layout="stack"
            cols={3}
            pairs={[
              { label: 'Lines', value: '12' },
              { label: 'Priced', value: '11' },
              { label: 'Open', value: '1', emphasis: 'bad' },
            ]}
          />
        </div>
        <Kpi label="Won, last 90 days" value="9" sub="+2 vs previous 90 days" direction="up" />
      </Row>

      <Row
        name="Person sizes · notes"
        code="size sm|md|lg · tone warn|plain"
        note="Avatars 22 / 30 / 40; an avatar alone is named for screen readers"
        full
      >
        <Person who="owner" initials={PEOPLE.owner.initials} label={PEOPLE.owner.name} size="lg" />
        <Person who="helper" initials={PEOPLE.helper.initials} label={PEOPLE.helper.name} />
        <Person who="assistant" initials="AS" label="Assistant" size="sm" />
        <div className="flex w-[360px] flex-col gap-2.5">
          <Note tone="warn" title="Unsure ·">
            the unit price on line 4 could be per box of ten.
          </Note>
          <Note tone="plain" title="Terms ·">
            validity is stated per line; delivery from receipt of PO.
          </Note>
        </div>
      </Row>
    </>
  )
}
