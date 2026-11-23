import { cn } from '@indus/ops-ui/lib/cn'
import {
  AssistantPill,
  Banner,
  BannerAction,
  BannerSlot,
  Check,
  Chip,
  KIT_STATUS_FAMILIES,
  ProgressBar,
  StageTrack,
  STATUS_VOCABULARY,
  SignoffTag,
  StatusVocabulary,
  Tag,
  type StatusFamily,
  type SystemBanner,
} from '@indus/ops-ui/status'
import type { MarkTone, Tone } from '@indus/ops-ui/types'
import type { ReactNode } from 'react'
import { REFS } from '../fixtures'

/** Set to 'built' when S01-T04 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'built'

/**
 * One spec row (L1 `.cv-sr`): name, API and note on the left, specimens on the right. `full` rows exist
 * only on /_kit/status; inside the L1 mirror (section k02) they are hidden so the card matches the sheet.
 */
function Row({
  name,
  code,
  note,
  full = false,
  column = false,
  children,
}: {
  name: string
  code: string
  note: string
  full?: boolean
  /** Stack the specimens (L1 `.cv-cl`) instead of wrapping them in a row (`.cv-rw`). */
  column?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'border-io-line-2 grid grid-cols-[200px_minmax(0,1fr)] items-start gap-6 border-t pt-[18px] first:border-t-0 first:pt-0',
        full && 'in-data-[kit-section=k02]:hidden'
      )}
    >
      <div className="flex flex-col gap-[3px] tracking-normal">
        <b className="text-[13px] leading-[normal] font-medium">{name}</b>
        <code className="text-io-accent font-sans text-[11.5px] leading-[normal]">{code}</code>
        <small className="text-io-ink-3 text-[12px] leading-[1.45]">{note}</small>
      </div>
      <div className={cn('flex gap-3', column ? 'flex-col items-start' : 'flex-wrap items-center')}>
        {children}
      </div>
    </div>
  )
}

/** One specimen set in a line box, as the sheet's inline imports sit (a chip rides the baseline). */
function Line({ children }: { children: ReactNode }) {
  return <div className="text-[16px] leading-normal">{children}</div>
}

/** A specimen with its caption underneath (L1 `.cv-cap`); `inline` sets it in a line box as Row does. */
function Cap({
  caption,
  inline = false,
  children,
}: {
  caption: string
  inline?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      {inline ? <div className="text-[11px] leading-normal">{children}</div> : children}
      <span className="text-io-ink-3 text-[11px] leading-[normal] tracking-normal">{caption}</span>
    </div>
  )
}

const TONES: { tone: Tone; label: string }[] = [
  { tone: 'ok', label: 'Accepted' },
  { tone: 'warn', label: 'Awaiting advance' },
  { tone: 'bad', label: 'Overdue' },
  { tone: 'n', label: 'Draft' },
  { tone: 'acc', label: 'Sent' },
  { tone: 'navy', label: 'Principal' },
  { tone: 'out', label: 'Suggest' },
  { tone: 'solid-ok', label: 'Paid in full' },
  { tone: 'solid-bad', label: 'Blocked' },
]

const MARKS: { mark: MarkTone; label: string }[] = [
  { mark: 'ok', label: 'Passed' },
  { mark: 'warn', label: 'Warning' },
  { mark: 'bad', label: 'Failed' },
  { mark: 'n', label: 'Not checked' },
  { mark: 'run', label: 'Checking' },
  { mark: 'todo', label: 'Not started' },
]

const PRODUCT_FAMILIES = (Object.keys(STATUS_VOCABULARY) as StatusFamily[]).filter(
  (f) => !(KIT_STATUS_FAMILIES as readonly string[]).includes(f)
)

const SYSTEM_BANNERS: SystemBanner[] = [
  {
    kind: 'info',
    props: { tone: 'info', children: 'Zoho Books is the ledger. Payments sync within 5 minutes.' },
  },
  {
    kind: 'mailbox-disconnected',
    props: {
      tone: 'bad',
      title: 'sales@ disconnected.',
      children: 'Nothing is sent until it reconnects.',
      actions: <BannerAction href="?banner=reconnect">Reconnect</BannerAction>,
    },
  },
  {
    kind: 'assistant-paused',
    props: { tone: 'warn', title: 'Assistant paused.', children: 'Nothing runs until you resume.' },
  },
]

/** Status kit specimen: the L1 k02 mirror, then every variant and state (/_kit/status only). */
export default function StatusSpecimen() {
  return (
    <>
      {/* ---- L1 k02 mirror ---- */}
      <Row
        name="Chip · tones"
        code='part="Chip" tone'
        note="ok · warn · bad · n · acc · navy · out"
      >
        {TONES.map((t) => (
          <Cap key={t.tone} caption={t.tone} inline>
            <Chip tone={t.tone} label={t.label} />
          </Cap>
        ))}
      </Row>

      <Row
        name="Chip · status word"
        code="family · status="
        note="Tone looked up from the vocabulary below"
      >
        <Line>
          <Chip family="enquiry" status="Quotes in" />
        </Line>
        <Line>
          <Chip family="enquiry" status="Negotiation" />
        </Line>
        <Line>
          <Chip family="supplier" status="Trial" />
        </Line>
        <Line>
          <Chip family="money" status="Part-paid" />
        </Line>
        <Line>
          <Chip family="doc" status="Superseded" />
        </Line>
        <Line>
          <Chip family="client" status="No reply" />
        </Line>
        <Line>
          <Chip family="line" status="Regret" />
        </Line>
      </Row>

      <Row
        name="Chip · size + dot"
        code="size · dot"
        note="sm 18 in tables, md 22, lg 26 in headers"
      >
        <Line>
          <Chip family="enquiry" status="Quoted" size="sm" />
        </Line>
        <Line>
          <Chip family="enquiry" status="Quoted" />
        </Line>
        <Line>
          <Chip family="enquiry" status="Quoted" size="lg" />
        </Line>
        <Line>
          <Chip family="assistant" status="Running" dot />
        </Line>
      </Row>

      <Row name="Check" code='part="Check" mark' note="Check rows, price guard, inspection">
        {MARKS.map((m) => (
          <Cap key={m.mark} caption={m.mark} inline>
            <Check mark={m.mark} label={m.label} />
          </Cap>
        ))}
      </Row>

      <Row name="Tag" code='part="Tag" kind' note="assistant · count · level · action · ref · lock">
        <Cap caption="assistant">
          <Tag kind="assistant">Assistant</Tag>
        </Cap>
        <Cap caption="count">
          <Tag kind="count">14</Tag>
        </Cap>
        <Cap caption="level">
          <Tag kind="level">Do and tell</Tag>
        </Cap>
        <Cap caption="action">
          <Tag kind="action">Send quotation</Tag>
        </Cap>
        <Cap caption="ref">
          <Tag kind="ref">{REFS.supplierRfq}</Tag>
        </Cap>
        <Cap caption="lock">
          <Tag kind="lock">Locked · you send</Tag>
        </Cap>
      </Row>

      <Row
        name="SignoffTag"
        code='part="SignoffTag"'
        note="ADR-28: a seeded default the Owner has not confirmed (S03-T04)"
        full
      >
        <Cap caption="awaiting">
          <SignoffTag />
        </Cap>
      </Row>

      <Row
        name="Banner"
        code='part="Banner" tone'
        note="warn · bad · info · ok · assistant; strip = full width under a header"
        column
      >
        <Banner
          tone="bad"
          title="sales@ disconnected."
          className="w-fit"
          actions={<BannerAction href="?banner=reconnect">Reconnect</BannerAction>}
        >
          Gmail stopped syncing at 09:12. Nothing is sent until it reconnects.
        </Banner>
        <Banner
          tone="warn"
          className="w-fit"
          actions={<BannerAction href="?banner=call-back">Record call-back</BannerAction>}
        >
          A supplier changed bank details on 21 Sep. Payments are blocked until you record a
          call-back.
        </Banner>
        <Banner tone="info" className="w-fit">
          Zoho Books is the ledger. Payments recorded here sync within 5 minutes.
        </Banner>
        <Banner
          tone="assistant"
          strip
          className="w-fit"
          actions={<BannerAction href="?banner=review">Review</BannerAction>}
        >
          drafted the quotation and checked 12 prices against history
        </Banner>
      </Row>

      <Row name="Stage track" code='part="Stage" flow' note="enquiry · order · custom" column>
        <StageTrack flow="enquiry" current="Quoted" />
        <StageTrack flow="order" current="Inspection" />
      </Row>

      <Row name="Assistant status" code='part="Dot"' note="Sidebar pill states">
        <AssistantPill status="running" />
        <AssistantPill status="paused" />
        <AssistantPill status="disconnected" />
        <AssistantPill status="unsure" label="Assistant · 2 unsure" />
        <AssistantPill status="off" />
      </Row>

      <Row name="Progress" code='part="Bar"' note="value · total · barTone">
        <ProgressBar label="Lines quoted" value={9} total={12} />
        <ProgressBar label="Advance received" value={30} total={100} tone="ok" valueText="30%" />
        <ProgressBar
          label="Cost cap"
          value={4.1}
          total={5}
          tone="warn"
          valueText="USD 4.10 of 5.00"
        />
      </Row>

      <Row name="Vocabulary" code='part="Vocabulary"' note="Every state word and its tone" column>
        <StatusVocabulary />
      </Row>

      {/* ---- /_kit/status only: the rest of every part ---- */}
      <Row
        full
        name="Chip · family decides"
        code="family"
        note={`The same word takes its family's tone: "No reply" is bad on supplier RFQs, warn on a client response.`}
      >
        <Cap caption="rfq">
          <Chip family="rfq" status="No reply" />
        </Cap>
        <Cap caption="recipient">
          <Chip family="recipient" status="No reply" />
        </Cap>
        <Cap caption="client">
          <Chip family="client" status="No reply" />
        </Cap>
        <Cap caption="enquiry">
          <Chip family="enquiry" status="Quoted" />
        </Cap>
        <Cap caption="line">
          <Chip family="line" status="Quoted" />
        </Cap>
        <Cap caption="rfq">
          <Chip family="rfq" status="Quoted" />
        </Cap>
      </Row>

      <Row
        full
        name="Chip · strike"
        code="~ in the vocabulary"
        note="Superseded, Withdrawn and Void print struck through"
      >
        <Chip family="doc" status="Superseded" />
        <Chip family="rfq" status="Withdrawn" />
        <Chip family="document" status="Void" />
        <Chip tone="n" label="Replaced by R3" strike />
      </Row>

      <Row
        full
        name="Chip · every size"
        code="size · dot"
        note="Each size with and without the dot"
      >
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Cap key={size} caption={size}>
            <div className="flex items-center gap-2">
              <Chip family="rfq" status="Chased" size={size} />
              <Chip family="rfq" status="Chased" size={size} dot />
            </div>
          </Cap>
        ))}
      </Row>

      <Row
        full
        name="Check · lg and acc"
        code='size="lg" · mark="acc"'
        note="20px in check lists; acc marks an info step"
      >
        {[...MARKS, { mark: 'acc' as const, label: 'Noted' }].map((m) => (
          <Cap key={m.mark} caption={m.mark}>
            <Check mark={m.mark} label={m.label} size="lg" />
          </Cap>
        ))}
      </Row>

      <Row
        full
        name="Banner · ok and icons"
        code="tone · icon · title"
        note="An icon is a labelled check mark"
        column
      >
        <Banner tone="ok" icon="ok" title="Synced.">
          All 3 mailboxes are live.
        </Banner>
        <Banner tone="warn" icon="warn" title="purchase@ is behind.">
          Last sync 40 minutes ago.
        </Banner>
        <Banner tone="info" icon="n">
          History import runs overnight.
        </Banner>
        <Banner tone="bad" icon="bad" announce={false} title="Payment blocked.">
          The bank details changed after the last payment.
        </Banner>
      </Row>

      <Row
        full
        name="Banner · strip"
        code="strip"
        note="40px under a page header, full width"
        column
      >
        <Banner tone="warn" strip>
          The Assistant is paused. Nothing runs until you resume.
        </Banner>
        <Banner
          tone="bad"
          strip
          announce={false}
          actions={<BannerAction href="?banner=reconnect">Reconnect</BannerAction>}
        >
          sales@ disconnected. Nothing is sent until it reconnects.
        </Banner>
      </Row>

      <Row
        full
        name="BannerSlot"
        code="banners"
        note="One banner, most severe first (C23), with +n more for the rest"
        column
      >
        <BannerSlot banners={SYSTEM_BANNERS} className="w-full" />
        <BannerSlot banners={SYSTEM_BANNERS.slice(0, 1)} className="w-full" />
      </Row>

      <Row
        full
        name="Stage track · more"
        code="flow · current"
        note="Won folds into the final stage; custom takes its own stages"
        column
      >
        <StageTrack flow="enquiry" current="Won" />
        <StageTrack flow="order" current="Confirmed" />
        <StageTrack
          flow="custom"
          label="Tender stage"
          stages={['Reading', 'Clarifying', 'Bid pack', 'Submitted']}
          current="Bid pack"
        />
      </Row>

      <Row
        full
        name="Assistant status · link"
        code="href · onClick"
        note="In the sidebar the pill opens Autopilot"
      >
        <AssistantPill status="running" href="?assistant=autopilot" />
        <AssistantPill status="paused" href="?assistant=autopilot" />
      </Row>

      <Row
        full
        name="Progress · tones"
        code="barTone"
        note="acc · ok · warn · bad · navy; no label"
      >
        <ProgressBar label="Quoted" value={9} total={13} />
        <ProgressBar label="Delivered" value={6} total={8} tone="ok" />
        <ProgressBar label="Budget used" value={7} total={10} tone="warn" />
        <ProgressBar label="Overdue" value={3} total={4} tone="bad" />
        <ProgressBar label="Shipped" value={2} total={5} tone="navy" />
        <ProgressBar value={1} total={3} />
      </Row>

      <Row
        full
        name="Vocabulary · product"
        code="families"
        note="Stored lifecycles the kit does not name. Tones await sign-off."
        column
      >
        <StatusVocabulary families={PRODUCT_FAMILIES} />
      </Row>
    </>
  )
}
