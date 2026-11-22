import { Person } from '@indus/ops-ui/card'
import { FxTag, Money } from '@indus/ops-ui/chart'
import { AssistantPill, StatusVocabulary as Vocabulary } from '@indus/ops-ui/status'
import { IO_VALUES } from '@indus/ops-ui/tokens'
import type { ReactNode } from 'react'
import { FX, KIT_NOW, PEOPLE } from '../fixtures'
import KitSection from '../KitSection'

// L0 Foundations, mirrored section for section (f01–f07). Text is the sheet's own design notes, with every
// name, company and figure replaced by neutral samples (CLAUDE.md §12). The kit parts the sheet embeds are the
// real ones: Card Person, Status AssistantPill and Vocabulary, Chart Money and FX.

function Eyebrow({ children }: { children: ReactNode }) {
  return <span className="io-eyebrow leading-[normal]">{children}</span>
}

/** A colour chip: SVG presentation attributes carry the token, so no class has to be built at runtime. */
function Chip({ token }: { token: string }) {
  return (
    <svg width="56" height="40" viewBox="0 0 56 40" aria-hidden="true" className="block">
      <rect width="56" height="40" rx="6" fill={`var(${token})`} />
      <rect
        x="0.5"
        y="0.5"
        width="55"
        height="39"
        rx="5.5"
        fill="none"
        stroke="var(--io-sheet-line)"
      />
    </svg>
  )
}

function Swatch({ token, note }: { token: string; note: string }) {
  return (
    <div className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3">
      <Chip token={token} />
      <span>
        <b className="block text-[12.5px] leading-[17px] font-medium">{token}</b>
        <code className="text-io-accent block text-[11.5px] leading-[21px]">
          {IO_VALUES[token]}
        </code>
        <small className="text-io-ink-3 block text-[11.5px] leading-[1.4]">{note}</small>
      </span>
    </div>
  )
}

function SwatchGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <Eyebrow>{title}</Eyebrow>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  )
}

const tintNote = (tint: string, use: string) => `on ${tint} ${IO_VALUES[tint]} · ${use}`

function Identity() {
  return (
    <KitSection
      sheet="l0"
      id="f01"
      crumb="F-01 · Identity"
      title="Indus Operations"
      text="A standalone console at operations.indushydraulics.com for one owner, one Helper and the Assistant. These foundations come from the Round 1–4 boards; the kits on Ops Component Sheet carry them."
    >
      <div className="grid grid-cols-[360px_minmax(0,1fr)] items-start gap-10">
        <div className="flex flex-col gap-3.5">
          <div className="flex h-14 items-center gap-3">
            <span className="text-io-navy w-[134px] text-[22px] leading-[normal] font-semibold tracking-[-0.01em]">
              Indus
            </span>
            <span className="text-io-navy text-[22px] leading-[normal] font-semibold tracking-[-0.01em]">
              Operations
            </span>
          </div>
          <span className="text-io-ink-3 text-[12.5px] leading-[1.5]">
            Browser tab “Indus Operations”, noindex. Users sign in with @indushydraulics.me
            accounts.
          </span>
        </div>
        <div className="flex flex-col gap-4">
          <Eyebrow>People</Eyebrow>
          <div className="flex flex-wrap gap-7">
            <Person
              who="owner"
              size="lg"
              initials={PEOPLE.owner.initials}
              name={PEOPLE.owner.name}
              sub={PEOPLE.owner.role}
            />
            <Person
              who="helper"
              size="lg"
              initials={PEOPLE.helper.initials}
              name={PEOPLE.helper.name}
              sub={PEOPLE.helper.role}
            />
            <Person
              who="assistant"
              size="lg"
              initials={PEOPLE.assistant.initials}
              name={PEOPLE.assistant.name}
              sub={PEOPLE.assistant.role}
            />
          </div>
          <Eyebrow>Assistant status</Eyebrow>
          <div className="flex flex-wrap items-start gap-6">
            <AssistantPill status="running" />
            <AssistantPill status="paused" />
            <AssistantPill status="disconnected" />
          </div>
        </div>
      </div>
    </KitSection>
  )
}

function Colour() {
  return (
    <KitSection
      sheet="l0"
      id="f02"
      crumb="F-02 · Colour"
      title="Colour"
      text="Cool paper surfaces, navy for structure and state, one blue accent for action and links. Status families each have a tint for the chip and a darker ink for its text. Values are oklch, written literally in kits; tokens.css names them."
    >
      <div className="grid grid-cols-3 gap-5">
        <SwatchGroup title="Surfaces">
          <Swatch token="--io-card" note="Cards, panes, headers" />
          <Swatch token="--io-paper" note="App background, table heads, stat boxes" />
          <Swatch token="--io-fill" note="Neutral chip, hover, progress track" />
          <Swatch token="--io-ground" note="Canvas ground only, never product UI" />
        </SwatchGroup>
        <SwatchGroup title="Ink">
          <Swatch token="--io-ink" note="Body text, titles" />
          <Swatch token="--io-ink-2" note="Secondary text, paragraphs" />
          <Swatch token="--io-ink-3" note="Meta, labels, eyebrows" />
          <Swatch token="--io-ink-4" note="Placeholders, empty values, upcoming" />
        </SwatchGroup>
        <SwatchGroup title="Lines">
          <Swatch token="--io-line" note="Card borders, header rules" />
          <Swatch token="--io-line-2" note="Row separators inside cards" />
          <Swatch token="--io-stroke" note="Control borders" />
        </SwatchGroup>
        <SwatchGroup title="Brand">
          <Swatch token="--io-navy" note="Active nav, Assistant tag, current stage, segmented on" />
          <Swatch token="--io-accent" note="Primary button, links, references, focus" />
          <Swatch token="--io-accent-tint" note="Count badges, action tags, selected wash" />
          <Swatch token="--io-accent-wash" note="Assistant strip, selected row, on-approve note" />
          <Swatch token="--io-accent-line" note="Gantt bars, done-stage connector" />
        </SwatchGroup>
        <SwatchGroup title="Status">
          <Swatch token="--io-ok" note={tintNote('--io-ok-tint', 'done, approved, paid')} />
          <Swatch
            token="--io-warn"
            note={tintNote('--io-warn-tint', 'waiting, partial, attention')}
          />
          <Swatch token="--io-bad" note={tintNote('--io-bad-tint', 'overdue, blocked, failed')} />
          <Swatch token="--io-info" note={tintNote('--io-info-tint', 'neutral information')} />
          <Swatch token="--io-mark" note="Source highlight in Why? only, never a status" />
        </SwatchGroup>
      </div>
    </KitSection>
  )
}

function TypeRow({ name, spec, children }: { name: string; spec: string; children: ReactNode }) {
  return (
    <div className="border-io-line-2 grid grid-cols-[240px_minmax(0,1fr)] items-baseline gap-6 border-t py-3.5 first:border-t-0">
      <span>
        <b className="block text-[13px] leading-[17px] font-medium">{name}</b>
        <small className="text-io-ink-3 block text-[11.5px] leading-[21px]">{spec}</small>
      </span>
      {children}
    </div>
  )
}

function Type() {
  return (
    <KitSection
      sheet="l0"
      id="f03"
      crumb="F-03 · Type"
      title="Type"
      text="Geist 400 and 500 for the product, 600 only for avatar initials, badges and A4 totals. Instrument Serif for titles. Tabular numerals everywhere."
    >
      <TypeRow name="Section title" spec="Instrument Serif 40/1">
        <span className="io-display text-io-section">Search, command bar and linking records</span>
      </TypeRow>
      <TypeRow name="Greeting · Today" spec="Instrument Serif 32/1">
        <span className="io-display text-io-greeting">Good morning, Owner · Friday 20 Nov</span>
      </TypeRow>
      <TypeRow name="Record title" spec="Instrument Serif 30/1.05">
        <span className="io-display text-io-record">
          Turnaround spares — valves, bearings &amp; instruments
        </span>
      </TypeRow>
      <TypeRow name="Document title" spec="Instrument Serif 54/1 (A4)">
        <span className="io-display text-io-doc">Quotation</span>
      </TypeRow>
      <TypeRow name="KPI" spec="Geist 500 24, −.02em">
        <span className="text-io-kpi">USD 12,400</span>
      </TypeRow>
      <TypeRow name="Page title" spec="Geist 500 18">
        <span className="text-io-page">Quotations</span>
      </TypeRow>
      <TypeRow name="Proposal headline" spec="Geist 500 16/1.35">
        <span className="text-io-headline">
          Send IH-RFQ-2611-P01 to 5 suppliers for 6 bearing lines.
        </span>
      </TypeRow>
      <TypeRow name="Card title" spec="Geist 500 15">
        <span className="text-io-card-title">No enquiries yet</span>
      </TypeRow>
      <TypeRow name="Body" spec="Geist 400 13/1.45">
        <span className="text-io-body">
          Example Valve Co quoted 2 of 3 valve lines at EUR 8,420.00 per set, FCA, 6 weeks.
        </span>
      </TypeRow>
      <TypeRow name="Dense · cell" spec="Geist 400 12.5">
        <span className="text-io-cell">BRG-6316-C3 · Deep groove ball bearing, C3 · 24 ea</span>
      </TypeRow>
      <TypeRow name="Meta" spec="Geist 400 12 · ink-3">
        <span className="text-io-meta text-io-ink-3">
          Assistant drafted · price guard 2 warnings
        </span>
      </TypeRow>
      <TypeRow name="Chip" spec="Geist 500 11">
        <span className="text-io-chip">Awaiting advance</span>
      </TypeRow>
      <TypeRow name="Eyebrow · table head" spec="Geist 500 10.5 · uppercase · +.1em">
        <span className="io-eyebrow">Came in since yesterday</span>
      </TypeRow>
    </KitSection>
  )
}

function RadiusSample({
  className,
  label,
  note,
}: {
  className: string
  label: string
  note: string
}) {
  return (
    <div className="flex w-[130px] flex-col gap-1.5">
      <i
        className={`border-io-accent-line bg-io-accent-tint block h-16 w-24 border ${className}`}
      />
      <b className="text-[12.5px] leading-[17px] font-medium">{label}</b>
      <small className="text-io-ink-3 text-[11.5px] leading-[15px]">{note}</small>
    </div>
  )
}

function ElevationSample({
  className,
  label,
  note,
}: {
  className: string
  label: string
  note: string
}) {
  return (
    <div className="flex w-[130px] flex-col gap-1.5">
      <i className={`rounded-io-card bg-io-card mb-1.5 block h-[72px] w-[110px] ${className}`} />
      <b className="text-[12.5px] leading-[17px] font-medium">{label}</b>
      <small className="text-io-ink-3 text-[11.5px] leading-[15px]">{note}</small>
    </div>
  )
}

const SIZES: [string, string][] = [
  ['Sidebar', '236 · collapsed 64'],
  ['Page gutter', '28 left and right'],
  ['Index header', '60 high, then a filter row'],
  ['Record header', '≈ 230 with stage track and tabs'],
  ['Assistant strip', '40'],
  ['Button', '40 lg · 36 md · 32 sm · 26 xs'],
  ['Field', '36 · select inline 30'],
  ['Chip', '22 · sm 18 · lg 26'],
  ['Tag', '20 · action tag 22'],
  ['Table row', '≥ 40 · dense 32'],
  ['Drawer', '420–480 from the right'],
  ['Modal', '480–560'],
  ['Board', '1440 × 940'],
  ['A4 on a board', '476 × 674 (.6) or 440 × 622 (.5542)'],
]

function Shape() {
  return (
    <KitSection
      sheet="l0"
      id="f04"
      crumb="F-04 · Shape and space"
      title="Radius, elevation and sizes"
      text="Cards use a 1px line and no shadow at rest. Shadows lift only what floats: A4 pages, menus, modals."
    >
      <Eyebrow>Radius</Eyebrow>
      <div className="flex flex-wrap items-start gap-6">
        <RadiusSample className="rounded-io-paper" label="2px" note="A4 paper" />
        <RadiusSample className="rounded-io-tag" label="4px" note="Tags, refs, keys" />
        <RadiusSample className="rounded-io-ctl" label="6px" note="Buttons, fields, selects" />
        <RadiusSample className="rounded-io-card" label="10px" note="Cards, tables, banners" />
        <RadiusSample className="rounded-io-dialog" label="14px" note="Modals, command bar" />
        <RadiusSample
          className="rounded-io-pill"
          label="999px"
          note="Chips, filter pills, avatars"
        />
      </div>
      <Eyebrow>Elevation</Eyebrow>
      <div className="flex flex-wrap items-start gap-6 pt-2 pb-1">
        <ElevationSample className="shadow-io-e1" label="e1" note="Boards, resting cards" />
        <ElevationSample className="shadow-io-e2" label="e2" note="A4 pages, emails" />
        <ElevationSample className="shadow-io-e3" label="e3" note="Menus, popovers" />
        <ElevationSample className="shadow-io-e4" label="e4" note="Modals" />
      </div>
      <Eyebrow>Sizes</Eyebrow>
      <div className="text-io-body grid grid-cols-[200px_minmax(0,1fr)] gap-x-5 gap-y-[9px]">
        {SIZES.map(([k, v]) => (
          <KeyValue key={k} k={k} v={v} />
        ))}
      </div>
    </KitSection>
  )
}

function KeyValue({ k, v }: { k: string; v: string }) {
  return (
    <>
      <span className="text-io-ink-3">{k}</span>
      <span>{v}</span>
    </>
  )
}

const FORMATS: [string, string, string][] = [
  ['Enquiry', 'ENQ-2026-0001', 'Year, then 4 digits'],
  ['Quotation', 'INDUS/Q10001 · INDUS/Q10001-R2', 'R1 has no suffix; revisions -R2, -R3'],
  ['Supplier RFQ', 'IH-RFQ-2611-P01', 'Year-month, then one ref per trade group'],
  [
    'Documents',
    'INDUS/PO10001 · OA1001 · PI1001 · INV10001 · DN0001 · PL0001',
    'One family, one prefix',
  ],
  ['Client refs', 'SAMPLE/PO-0001 · PO-SAMPLE-0001', 'Shown as the client wrote them'],
  [
    'Money',
    'USD 12,400.00 · AED 45,539.00',
    'Currency code first, 2 decimals in documents, none in lists where all are whole',
  ],
  ['Negative', '(1,283.00)', 'Brackets, in --io-bad'],
  ['Empty', '—', 'Em dash in --io-ink-4'],
  ['FX', `EUR 1 = AED ${FX.EUR} · locked 2 Oct`, 'Book currency AED; quote currency per client'],
  [
    'VAT',
    'Export zero-rated · local 5% · mixed',
    'Per quotation; VAT shown in AED on tax invoices',
  ],
  [
    'Dates',
    '14 Sep · Wed 23 Sep · 30 Sep 2026',
    'No leading zero; year only when it is not this year or on documents',
  ],
  ['Times', '09:12 · 10:42', '24-hour, local'],
  ['Quantities', '24 ea · 2 set · 40 m', 'Unit after the number'],
  ['Durations', '6 wks · 5 working days · 1.2 d', 'Working days for deadlines'],
]

function Data() {
  return (
    <KitSection
      sheet="l0"
      id="f05"
      crumb="F-05 · Data"
      title="Numbers, references and dates"
      text="How every reference, amount, date and quantity is written. The same strings appear on boards, in mail and on A4 documents."
    >
      <div className="grid grid-cols-[140px_minmax(0,1.3fr)_minmax(0,1fr)] text-[13px]">
        {FORMATS.map(([k, v, n]) => (
          <FormatRow key={k} k={k} v={v} n={n} />
        ))}
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <Money ccy="USD" amount="12400.00" aed={{ rate: FX.USD }} />
        <Money ccy="EUR" amount="8420.00" aed={{ rate: FX.EUR }} />
        <Money ccy="AED" amount="-1283.00" />
        <FxTag
          state="locked"
          pair={`EUR → AED ${FX.EUR}`}
          lockedOn={new Date('2026-10-02T08:00:00Z')}
          now={KIT_NOW}
        />
      </div>
    </KitSection>
  )
}

function FormatRow({ k, v, n }: { k: string; v: string; n: string }) {
  const cell = 'border-t border-io-line-2 py-2.5'
  return (
    <>
      <span className={`${cell} text-io-ink-3`}>{k}</span>
      <span className={`${cell} font-medium`}>{v}</span>
      <span className={`${cell} text-io-ink-3 text-[12.5px]`}>{n}</span>
    </>
  )
}

function Status() {
  return (
    <KitSection
      sheet="l0"
      id="f06"
      crumb="F-06 · Status"
      title="Status vocabulary"
      text="Every state word in the product and its tone. Pass the word to Status Kit (status=) and the chip colours itself."
    >
      <Vocabulary />
    </KitSection>
  )
}

const RULES: [string, string][] = [
  [
    'Geist only, with tabular numerals',
    'No fixed-width face anywhere: references, part numbers, money and dates are Geist.',
  ],
  [
    'Instrument Serif for titles',
    'Section, greeting, record and document titles. Never for UI labels.',
  ],
  [
    'One owner, one Helper, one Assistant',
    'The Owner (sales@), the Helper (purchase@) and the Assistant. No other staff.',
  ],
  [
    'Human-only verbs',
    'Approve, Send quotation, Release payment, Sign stay on buttons a person presses. The Assistant drafts, checks, chases and proposes.',
  ],
  [
    'The Assistant speaks plainly',
    'First person, no exclamation marks, states what it did and what it needs.',
  ],
  [
    'Vocabulary',
    'Enquiry, then Order after the win. Supplier, with Principal as a supplier type. Supplier RFQ, not onward RFQ.',
  ],
  ['No market restrictions', 'No compliance holds or declines for any market.'],
  [
    'No phones, calls or WhatsApp',
    'No mobile screens and no call or WhatsApp channels are designed.',
  ],
  ['No emoji', 'Glyphs only where they are text: ✓ ! ✕ → ↗ ⌘.'],
  ['Every line is quoted from principals', 'There is no quote-from-stock path.'],
]

function Rules() {
  return (
    <KitSection
      sheet="l0"
      id="f07"
      crumb="F-07 · Rules"
      title="Standing rules"
      text="Decisions the client has made that every new board follows."
    >
      <div className="grid grid-cols-2 gap-3">
        {RULES.map(([title, body]) => (
          <div
            key={title}
            className="rounded-io-card border-io-line text-io-ink-2 flex flex-col gap-1 border px-4 py-3.5 text-[12.5px] leading-[1.5]"
          >
            <b className="text-io-ink text-[13.5px] font-medium">{title}</b>
            <span>{body}</span>
          </div>
        ))}
      </div>
    </KitSection>
  )
}

/** The L0 Foundations sheet, sections f01–f07 in sheet order. */
export default function Foundations() {
  return (
    <>
      <Identity />
      <Colour />
      <Type />
      <Shape />
      <Data />
      <Status />
      <Rules />
    </>
  )
}
