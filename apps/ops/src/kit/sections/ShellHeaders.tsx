import { ButtonLink, Choices, LinkTabs, SearchInput, Segmented } from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import {
  AssistantStrip,
  PageHeader,
  RecordHeader,
  TodayHeader,
  type RecordHeaderProps,
  type RecordTab,
} from '@indus/ops-ui/shell'
import { BannerSlot, type SystemBanner } from '@indus/ops-ui/status'
import { needLabel } from '@indus/ops-core'
import type { ReactNode } from 'react'
import { recordTabItems } from '../../lib/record-tabs'
import { HEADERS } from '../fixtures'

// Shell kit header specimens (S02-T02): PageHeader, TodayHeader, RecordHeader, AssistantStrip and the
// BannerSlot strip. Shell.tsx lays them out in the L1 k00 rows and the /_kit/shell-only rows.

const H = HEADERS
const ENQ = H.enquiryRef
const KIT = '/_kit/shell'

/** The nine enquiry tabs board 75 and the L1 sheet draw (the product's eleven are ENQUIRY_TABS, C8). */
const BOARD_ENQUIRY_TABS: RecordTab[] = H.boardEnquiryTabs.map((label) => {
  const segment = label === 'Overview' ? '' : label.toLowerCase()
  return {
    key: label.toLowerCase(),
    label,
    segment,
    href: segment ? `/enquiries/${ENQ}/${segment}` : `/enquiries/${ENQ}`,
  }
})

type HeaderCore = Omit<RecordHeaderProps, 'cta' | 'tabs' | 'activeTab'>

const ENQUIRY: HeaderCore = {
  kind: 'enquiry',
  crumb: { label: 'Enquiries', href: '/enquiries' },
  client: H.client,
  reference: ENQ,
  title: H.enquiryTitle,
  meta: H.enquiryMeta,
  threadHref: `/mail/clients?record=${ENQ}`,
  stage: { flow: 'enquiry', current: 'Quotes in' },
  logActivityHref: `${KIT}?log=1`,
}

const ORDER: HeaderCore = {
  kind: 'order',
  crumb: { label: 'Orders', href: '/orders' },
  client: H.client,
  reference: H.orderEnquiryRef,
  title: H.orderTitle,
  meta: H.orderMeta,
  threadHref: `/mail/clients?record=${H.orderEnquiryRef}`,
  stage: { flow: 'order', current: 'Freight' },
  logActivityHref: `${KIT}?log=1`,
}

const cta = (label: string, href: string) => ({ label, href })

/** A record header and its Assistant strip, stacked as the T2 layout stacks them. */
function Record({
  header,
  did,
  need,
  recordKey,
}: {
  header: RecordHeaderProps
  did: string
  need?: { label: string; href: string }
  recordKey: string
}) {
  return (
    <div className="flex flex-none flex-col">
      <RecordHeader {...header} />
      <AssistantStrip recordKey={recordKey} did={did} {...(need ? { need } : {})} />
    </div>
  )
}

const review = (ref: string) => `/review?record=${ref}`

/** The L1 k00 "Record header" row: enquiry on Compare, order on Freight (the sheet's two). */
export function SheetRecordHeaders() {
  return (
    <>
      <Record
        recordKey={`record:${ENQ}`}
        header={{
          ...ENQUIRY,
          tabs: BOARD_ENQUIRY_TABS,
          activeTab: 'compare',
          cta: cta('Price the quotation', `/enquiries/${ENQ}/pricing`),
        }}
        did={H.enquiryDid}
        need={{ label: needLabel(1), href: review(ENQ) }}
      />
      <Record
        recordKey={`record:${H.orderRef}`}
        header={{
          ...ORDER,
          tabs: recordTabItems('order', H.orderRef),
          activeTab: 'freight',
          cta: cta('Book freight', `/orders/${H.orderRef}/freight`),
        }}
        did={H.orderDidSheet}
      />
    </>
  )
}

/**
 * Board 75's two cards (1046 wide with their border): enquiry on Overview, order on Freight. These are the
 * design-parity crops (tests/visual-design/headers.spec.ts).
 */
export function Board75() {
  return (
    <>
      <Board75Card id="enquiry">
        <Record
          recordKey={`record:${ENQ}`}
          header={{
            ...ENQUIRY,
            tabs: BOARD_ENQUIRY_TABS,
            activeTab: 'overview',
            cta: cta('Compare quotes', `/enquiries/${ENQ}/compare`),
          }}
          did={H.enquiryDid}
          need={{ label: needLabel(1), href: review(ENQ) }}
        />
      </Board75Card>
      <Board75Card id="order">
        <Record
          recordKey={`record:${H.orderRef}`}
          header={{
            ...ORDER,
            tabs: recordTabItems('order', H.orderRef),
            activeTab: 'freight',
            cta: cta('Book the flights', `/orders/${H.orderRef}/freight`),
          }}
          did={H.orderDid}
          need={{ label: 'approve the booking', href: review(H.orderRef) }}
        />
      </Board75Card>
    </>
  )
}

/**
 * One board 75 card. The board's page sets 14px type, so the -0.005em tracking every part inherits there is
 * -0.07px, where the console's 13px body gives -0.065px; the card recreates the board's value, or the long
 * tab and stage rows drift a pixel by their right end.
 */
function Board75Card({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div
      data-board-75={id}
      className="border-io-line rounded-io-card w-[1046px] overflow-hidden border tracking-[-0.07px]"
    >
      {children}
    </div>
  )
}

/**
 * T2A and T2B's header region: the 1202px main column of the 1440 board (right of the 236 sidebar and its
 * rule, inside the board frame), Lines and Freight tabs. The T2 boards mount RecordHeader.dc without the
 * console's line height (their header is 207 high where board 75's is 210); the frame recreates that so the
 * crop compares the parts, not the boards' type setting.
 */
const T2_FRAME = 'w-[1202px] [&_[data-part=record-header]]:leading-[normal]'

export function TemplateHeaders() {
  return (
    <>
      <div data-template-header="T2A" className={T2_FRAME}>
        <Record
          recordKey={`record:${ENQ}`}
          header={{
            ...ENQUIRY,
            tabs: BOARD_ENQUIRY_TABS,
            activeTab: 'lines',
            cta: cta('Compare quotes', `/enquiries/${ENQ}/compare`),
          }}
          did={H.t2aDid}
          need={{ label: needLabel(1), href: review(ENQ) }}
        />
      </div>
      <div data-template-header="T2B" className={T2_FRAME}>
        <Record
          recordKey={`record:${H.orderRef}`}
          header={{
            ...ORDER,
            tabs: recordTabItems('order', H.orderRef),
            activeTab: 'freight',
            cta: cta('Book freight', `/orders/${H.orderRef}/freight`),
          }}
          did={H.orderDidSheet}
        />
      </div>
    </>
  )
}

/** The three kinds with the product's tab sets: enquiry Overview (11, C8), order Freight (9), tender (C9). */
export function RecordKinds() {
  return (
    <>
      <Record
        recordKey={`record:${ENQ}`}
        header={{
          ...ENQUIRY,
          tabs: recordTabItems('enquiry', ENQ, { lines: 12, rfqs: 4, questions: 1 }),
          activeTab: 'overview',
          cta: cta('Compare quotes', `/enquiries/${ENQ}/compare`),
        }}
        did={H.enquiryDid}
        need={{ label: needLabel(1), href: review(ENQ) }}
      />
      <Record
        recordKey={`record:${H.orderRef}`}
        header={{
          ...ORDER,
          tabs: recordTabItems('order', H.orderRef, { documents: 3 }),
          activeTab: 'freight',
          chip: { label: 'Bank change', tone: 'warn' },
          cta: cta('Book freight', `/orders/${H.orderRef}/freight`),
        }}
        did={H.orderDid}
        need={{ label: needLabel(2), href: review(H.orderRef) }}
      />
      <Record
        recordKey={`record:${ENQ}`}
        header={{
          ...ENQUIRY,
          kind: 'tender',
          title: 'Plant spares tender · SPS/T/2026/001',
          tabs: recordTabItems('tender', ENQ),
          activeTab: 'timeline',
          chip: { label: 'Closes in 5 d 22 h', tone: 'warn' },
          cta: cta('Open the bid pack', `/enquiries/${ENQ}/tender/bid`),
        }}
        did="read the tender pack and listed 3 queries for the buyer"
        need={{ label: needLabel(3), href: review(ENQ) }}
      />
    </>
  )
}

const kitHref = (key: string) => (v: string) => `${KIT}?${key}=${v}`

/** The L1 k00 "Page header" row: Quotations with filters, Parts with search. */
export function SheetPageHeaders() {
  return (
    <>
      <PageHeader
        className="w-fit"
        crumb="Selling"
        title="Quotations"
        actions={<ButtonLink href={`${KIT}?export=quotations`}>Export</ButtonLink>}
        filters={
          <Choices
            aria-label="Quotation filter"
            options={[...H.quotationFilters]}
            value="awaiting"
            hrefFor={kitHref('q')}
          />
        }
        summary={H.quotationSummary}
      />
      <PageHeader
        className="w-fit"
        crumb="Directory"
        title="Parts · 2,000"
        actions={
          <>
            <ButtonLink href={`${KIT}?export=parts`}>Export</ButtonLink>
            <ButtonLink variant="primary" href={`${KIT}?new=part`}>
              New part
            </ButtonLink>
          </>
        }
        search={<SearchInput size="lg" aria-label="Search parts" defaultValue="6316 C3" />}
        filters={
          <Choices
            aria-label="Part filter"
            options={[...H.partFilters]}
            value="all"
            hrefFor={kitHref('p')}
          />
        }
      />
    </>
  )
}

/** PageHeader's other slots (/_kit/shell only): steps, meta + tag + chip, segmented, tabs. */
export function PageHeaderVariants() {
  return (
    <>
      <PageHeader
        crumb="Bring in the history"
        title="History import"
        steps={[
          { label: 'Mailboxes', state: 'done' },
          { label: 'Range', state: 'done' },
          { label: 'Review', state: 'current' },
          { label: 'Import', state: 'todo' },
        ]}
        actions={<ButtonLink href={`${KIT}?step=back`}>Back</ButtonLink>}
      />
      <PageHeader
        crumb="Assistant"
        title="Autopilot"
        meta="Last changed 2 days ago"
        tag="Level 2"
        chip={{ label: 'Running', tone: 'ok' }}
        actions={
          <ButtonLink variant="primary" href={`${KIT}?save=1`}>
            Save levels
          </ButtonLink>
        }
      />
      <PageHeader
        crumb="Work"
        title="Enquiries"
        segmented={
          <Segmented
            aria-label="View"
            options={[
              { value: 'table', label: 'Table' },
              { value: 'board', label: 'Board' },
            ]}
            value="table"
            hrefFor={kitHref('view')}
          />
        }
        actions={
          <ButtonLink variant="primary" href={`${KIT}?new=enquiry`}>
            New enquiry
          </ButtonLink>
        }
        filters={
          <Choices
            aria-label="Enquiry filter"
            options={[...H.enquiryFilters]}
            value="open"
            hrefFor={kitHref('e')}
          />
        }
      />
      <PageHeader
        crumb="Insight"
        title="Reports"
        tabs={
          <LinkTabs
            aria-label="Reports"
            tabsStyle="pane"
            active="overdue"
            items={[
              { key: 'overdue', label: 'Overdue', href: `${KIT}?r=overdue` },
              { key: 'winloss', label: 'Win / loss', href: `${KIT}?r=winloss` },
              { key: 'pipeline', label: 'Pipeline', href: `${KIT}?r=pipeline` },
            ]}
          />
        }
      />
    </>
  )
}

export function SheetTodayHeader() {
  return (
    <TodayHeader
      className="w-fit"
      greeting={H.greeting}
      assistant="running"
      notificationCount={3}
    />
  )
}

export function SheetAssistantStrip() {
  return (
    <AssistantStrip
      className="w-fit"
      recordKey="record:kit"
      did={H.stripDid}
      need={{ label: 'Review 2', href: review(ENQ) }}
    />
  )
}

const BANNERS: SystemBanner[] = [
  {
    kind: 'sync-delayed',
    props: { tone: 'info', children: 'Accounting last synced 08:00. Next sync in 4 minutes.' },
  },
  {
    kind: 'mailbox-disconnected',
    props: {
      tone: 'bad',
      title: 'sales@ disconnected.',
      children: 'Mail stopped syncing at 09:12. Nothing is sent until it reconnects.',
    },
  },
  { kind: 'assistant-paused', props: { tone: 'warn', children: 'The Assistant is paused.' } },
]

/** BannerSlot `placement="strip"` under a PageHeader (S08, C23): one banner and "+2 more". */
export function BannerStrip({ className }: { className?: string }) {
  return (
    <div className={cn('border-io-line flex w-full flex-col border', className)}>
      <PageHeader crumb="Work" title="Enquiries" />
      <BannerSlot placement="strip" banners={BANNERS} />
    </div>
  )
}
