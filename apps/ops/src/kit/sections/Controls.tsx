import {
  Button,
  ButtonLink,
  Checkbox,
  Choices,
  Kbd,
  LinkTabs,
  Radio,
  RadioGroup,
  SearchInput,
  Segmented,
  Select,
  Spinner,
  Toggle,
  type ButtonSize,
} from '@indus/ops-ui/controls'
import { cn } from '@indus/ops-ui/lib/cn'
import type { ButtonVariant } from '@indus/ops-ui/types'
import { ExternalLink, MoreHorizontal, Send } from 'lucide-react'
import type { ReactNode } from 'react'
import { COMPANIES } from '../fixtures'
import {
  ChoicesButtonsDemo,
  ControlledToggleDemo,
  PaneTabsDemo,
  PaneTabsWithPanels,
  SearchTriggerDemo,
} from './ControlsDemos'

/** Set to 'built' when S01-T03 lands: visual tests skip pending sections. */
export const status: 'built' | 'pending' = 'built'

// Hover and focus are CSS, so a still specimen cannot show them by interaction. These classes put a real
// Button and Select into the look :hover and :focus-visible give them, from the same tokens.
const PRIMARY_HOVER = 'bg-io-accent-hover border-io-accent-hover'
const FOCUS_RING = 'shadow-[0_0_0_2px_var(--io-card),0_0_0_4px_var(--io-accent)]'
const FIELD_FOCUS = 'border-io-accent shadow-[0_0_0_3px_var(--io-accent-tint)]'

/**
 * One spec row (L1 `.cv-sr`): name, API and note on the left, specimens on the right. `full` rows exist
 * only on /_kit/controls; inside the L1 mirror (section k01) they are hidden so the card matches the sheet.
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
        full && 'in-data-[kit-section=k01]:hidden'
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

/** A specimen with its caption underneath (L1 `.cv-cap`). */
function Cap({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      {children}
      <span className="text-io-ink-3 text-[11px] leading-[normal] tracking-normal">{caption}</span>
    </div>
  )
}

const VARIANTS: ButtonVariant[] = [
  'primary',
  'secondary',
  'navy',
  'ghost',
  'danger',
  'destructive',
  'link',
]
const SIZES: ButtonSize[] = ['lg', 'md', 'sm', 'xs']

const RECORD_TABS = [
  'Overview',
  'Lines',
  'Suppliers',
  'Questions',
  'Compare',
  'Pricing',
  'Quotation',
  'Files',
  'Activity',
].map((label) => ({ key: label.toLowerCase(), label, href: `?tab=${label.toLowerCase()}` }))

const PANE_TABS = [
  { key: 'details', label: 'Details' },
  { key: 'lines', label: 'Lines', count: 12 },
  { key: 'history', label: 'History' },
  { key: 'why', label: 'Why?' },
]

const QUOTE_FILTERS = [
  { value: 'awaiting', label: 'Awaiting decision', count: 14 },
  { value: 'drafts', label: 'Drafts', count: 3 },
  { value: 'won', label: 'Won', count: 9 },
  { value: 'lost', label: 'Lost', count: 6 },
  { value: 'superseded', label: 'Superseded' },
]
const PART_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'bearings', label: 'Bearings' },
  { value: 'valves', label: 'Valves' },
  { value: 'filters', label: 'Filters' },
]

const filterHref = (v: string) => `?filter=${v}`

/** Controls kit specimen: the L1 k01 mirror, then every variant, size and state (/_kit/controls only). */
export default function ControlsSpecimen() {
  return (
    <>
      {/* ---- L1 k01 mirror ---- */}
      <Row
        name="Button · variant"
        code='part="Button" variant'
        note="One primary per surface. Navy for batch sends, ghost for tertiary, danger only for blocking and cancelling."
      >
        <Cap caption="primary">
          <Button variant="primary">Approve and send</Button>
        </Cap>
        <Cap caption="secondary">
          <Button variant="secondary">Edit</Button>
        </Cap>
        <Cap caption="navy">
          <Button variant="navy">Send RFQs</Button>
        </Cap>
        <Cap caption="ghost">
          <Button variant="ghost">Edit</Button>
        </Cap>
        <Cap caption="danger">
          <Button variant="danger">Block supplier</Button>
        </Cap>
        <Cap caption="link">
          <Button variant="link">Open thread in Mail ↗</Button>
        </Cap>
      </Row>

      <Row
        name="Button · size"
        code="size"
        note="lg on proposal cards and dialogs, md in headers, sm in rows, xs in dense tables."
      >
        <Cap caption="lg · 40px">
          <Button size="lg">Approve</Button>
        </Cap>
        <Cap caption="md · 36px">
          <Button size="md">Approve</Button>
        </Cap>
        <Cap caption="sm · 32px">
          <Button size="sm">Approve</Button>
        </Cap>
        <Cap caption="xs · 26px">
          <Button size="xs">Approve</Button>
        </Cap>
      </Row>

      <Row name="Button · state" code="state" note="hover · focus · disabled · busy">
        <Cap caption="rest">
          <Button variant="primary">Send quotation</Button>
        </Cap>
        <Cap caption="hover">
          <Button variant="primary" className={PRIMARY_HOVER}>
            Send quotation
          </Button>
        </Cap>
        <Cap caption="focus">
          <Button variant="primary" className={FOCUS_RING}>
            Send quotation
          </Button>
        </Cap>
        <Cap caption="disabled">
          <Button variant="primary" disabled>
            Send quotation
          </Button>
        </Cap>
        <Cap caption="busy">
          <Button variant="primary" busy>
            Sending…
          </Button>
        </Cap>
      </Row>

      <Row
        name="Segmented"
        code='part="Segmented"'
        note="Views and modes. options a|b|c, counts as Label:12 (Label:!3 for a red count)."
      >
        <Cap caption="view">
          <Segmented
            aria-label="View"
            value="table"
            options={[
              { value: 'table', label: 'Table' },
              { value: 'board', label: 'Board' },
              { value: 'calendar', label: 'Calendar' },
            ]}
          />
        </Cap>
        <Cap caption="with counts">
          <Segmented
            aria-label="Queue"
            value="needs"
            options={[
              { value: 'all', label: 'All', count: 23 },
              { value: 'needs', label: 'Needs you', count: 6, countTone: 'bad' },
              { value: 'waiting', label: 'Waiting', count: 9 },
            ]}
          />
        </Cap>
        <Cap caption="sm">
          <Segmented
            aria-label="Preview size"
            size="sm"
            value="desktop"
            options={[
              { value: 'desktop', label: 'Desktop' },
              { value: 'phone', label: 'Phone' },
            ]}
          />
        </Cap>
      </Row>

      <Row
        name="Tabs"
        code='part="Tabs"'
        note="pane: in cards and drawers. record: under the record title."
      >
        <Cap caption="pane">
          <PaneTabsDemo items={PANE_TABS} initial="lines" />
        </Cap>
        <Cap caption="record">
          <LinkTabs
            aria-label="Record sections"
            tabsStyle="record"
            active="compare"
            items={RECORD_TABS}
          />
        </Cap>
      </Row>

      <Row
        name="Toggle · Checkbox · Radio"
        code='part="Toggle|Checkbox|Radio"'
        note="on · mixed · locked (navy: set by policy, not editable)"
      >
        <Cap caption="toggle">
          <Toggle checked label="Chase suppliers" sub="Up to 3 chasers, 2 working days apart" />
        </Cap>
        <Cap caption="off">
          <Toggle checked={false} label="Send quotation" />
        </Cap>
        <Cap caption="locked">
          <Toggle checked locked={{ reason: 'Set by policy' }} label="Supplier payments · Never" />
        </Cap>
        <Cap caption="checkbox">
          <Checkbox checked label="Include drawings" />
        </Cap>
        <Cap caption="mixed">
          <Checkbox checked="mixed" label="3 of 12 lines" />
        </Cap>
        <Cap caption="radio">
          <Radio
            name="vat"
            value="export"
            defaultChecked
            label="Export · zero-rated"
            sub="VAT 0%"
          />
        </Cap>
        <Cap caption="radio off">
          <Radio name="vat" value="local" label="Local · 5%" />
        </Cap>
      </Row>

      <Row
        name="Select"
        code='part="Select"'
        note="Inline 30px, form 36px (size md). label prefixes the value."
      >
        <Cap caption="inline">
          <Select inlineLabel="Currency" options={[{ value: 'USD', label: 'USD' }]} />
        </Cap>
        <Cap caption="form">
          <Select
            size="md"
            aria-label="Delivery terms"
            options={[{ value: 'dap', label: 'DAP Site A' }]}
          />
        </Cap>
        <Cap caption="open">
          <Select
            size="md"
            aria-label="Client"
            className={FIELD_FOCUS}
            options={[{ value: 'client', label: COMPANIES.client }]}
          />
        </Cap>
      </Row>

      <Row name="Filter chips" code='part="Choices"' note="Index filters. One active.">
        <Choices
          aria-label="Quotation status"
          value="awaiting"
          options={QUOTE_FILTERS}
          hrefFor={filterHref}
        />
        <Choices
          aria-label="Part family"
          size="sm"
          value="valves"
          options={PART_FILTERS}
          hrefFor={filterHref}
        />
      </Row>

      <Row
        name="Search · keys"
        code='part="Search|Kbd"'
        note="Sidebar and command bar use ⌘K; parts search is lg with its matched spellings."
      >
        <Cap caption="md">
          <SearchTriggerDemo placeholder="Search…" kbd="⌘K" />
        </Cap>
        <Cap caption="lg · focus">
          <SearchInput
            size="lg"
            aria-label="Search parts"
            defaultValue="6316 C3"
            matchedSpellings={['6316C3', '6316-C3']}
            className={FIELD_FOCUS}
          />
        </Cap>
        <Cap caption="keys">
          <Kbd keys="esc" />
          <Kbd keys="G R" />
        </Cap>
      </Row>

      {/* ---- Full specimen: /_kit/controls only ---- */}
      <Row
        full
        name="Button · variant × size"
        code="<Button variant size>"
        note="Every variant at every height. Each variant names its own border colour; link has no box."
      >
        <div className="grid grid-cols-[repeat(4,max-content)] items-center gap-3">
          {VARIANTS.flatMap((variant) =>
            SIZES.map((size) => (
              <Button key={`${variant}-${size}`} variant={variant} size={size}>
                {variant} {size}
              </Button>
            ))
          )}
        </div>
      </Row>

      <Row
        full
        name="Button · disabled · busy"
        code="disabled · busy"
        note="disabled is opacity .45. busy keeps the label, adds the spinner and aria-busy, and ignores clicks."
      >
        <div className="grid grid-cols-[repeat(7,max-content)] items-center gap-3">
          {VARIANTS.map((variant) => (
            <Button key={`d-${variant}`} variant={variant} disabled>
              {variant}
            </Button>
          ))}
          {VARIANTS.map((variant) => (
            <Button key={`b-${variant}`} variant={variant} busy>
              Saving…
            </Button>
          ))}
        </div>
      </Row>

      <Row
        full
        name="Button · hover · focus"
        code=":hover · :focus-visible"
        note="CSS states, shown here with the same tokens: secondary hover is paper + stroke-hover; focus is a 2px white gap and a 2px accent ring."
      >
        <Cap caption="secondary hover">
          <Button className="bg-io-paper border-io-stroke-hover">Edit</Button>
        </Cap>
        <Cap caption="navy hover">
          <Button variant="navy" className="bg-io-navy-hover">
            Send RFQs
          </Button>
        </Cap>
        <Cap caption="ghost hover">
          <Button variant="ghost" className="bg-io-fill text-io-ink">
            Edit
          </Button>
        </Cap>
        <Cap caption="danger hover">
          <Button variant="danger" className="bg-io-bad-hover-tint border-io-bad-hover-line">
            Block supplier
          </Button>
        </Cap>
        <Cap caption="secondary focus">
          <Button className={FOCUS_RING}>Edit</Button>
        </Cap>
      </Row>

      <Row
        full
        name="Button · icon · trail · kbd"
        code="icon · trail · kbd · asChild · ButtonLink"
        note="Icons are decorative (aria-hidden); an icon-only button must have aria-label. ButtonLink navigates."
      >
        <Cap caption="icon">
          <Button variant="navy" icon={Send}>
            Send RFQs
          </Button>
        </Cap>
        <Cap caption="trail">
          <Button trail="3">Review</Button>
        </Cap>
        <Cap caption="kbd">
          <Button variant="primary" kbd="⌘↵">
            Approve
          </Button>
        </Cap>
        <Cap caption="icon only">
          <Button size="sm" icon={MoreHorizontal} aria-label="More actions" />
        </Cap>
        <Cap caption="ButtonLink">
          <ButtonLink href="/_kit/l1" icon={ExternalLink}>
            Open the sheet
          </ButtonLink>
        </Cap>
        <Cap caption="asChild">
          <Button asChild variant="ghost" size="sm">
            <a href="#controls">Jump to top</a>
          </Button>
        </Cap>
      </Row>

      <Row
        full
        name="Segmented · links"
        code="hrefFor"
        note="URL state renders a <nav> of links with aria-current; it works from a server component."
      >
        <Segmented
          aria-label="View (links)"
          value="board"
          hrefFor={(v) => `?view=${v}`}
          options={[
            { value: 'table', label: 'Table' },
            { value: 'board', label: 'Board' },
            { value: 'calendar', label: 'Calendar' },
          ]}
        />
      </Row>

      <Row
        full
        name="Tabs · panels · links"
        code="PaneTabs · LinkTabs"
        note="PaneTabs is an ARIA tablist for panels in a card or drawer; LinkTabs navigate (pane, record, vertical)."
      >
        <Cap caption="PaneTabs with panels">
          <PaneTabsWithPanels
            items={[
              { key: 'reasons', label: 'Reasons' },
              { key: 'sources', label: 'Sources', count: 3 },
              { key: 'history', label: 'History' },
            ]}
          />
        </Cap>
        <Cap caption="LinkTabs pane">
          <LinkTabs
            aria-label="Pane links"
            tabsStyle="pane"
            active="lines"
            items={PANE_TABS.map((t) => ({ ...t, href: `?pane=${t.key}` }))}
          />
        </Cap>
        <Cap caption="LinkTabs vertical">
          <LinkTabs
            aria-label="Settings sections"
            tabsStyle="pane"
            orientation="vertical"
            active="mailboxes"
            items={[
              { key: 'company', label: 'Company', href: '?section=company' },
              { key: 'mailboxes', label: 'Mailboxes', href: '?section=mailboxes' },
              { key: 'numbering', label: 'Numbering', href: '?section=numbering' },
            ]}
          />
        </Cap>
      </Row>

      <Row
        full
        name="Toggle · Checkbox · Radio · more"
        code="disabled · locked · RadioGroup"
        note="Disabled controls fade to .45. A locked checkbox is navy and stays checked. RadioGroup is a fieldset with a legend."
      >
        <Cap caption="toggle disabled">
          <Toggle checked={false} disabled label="Send quotation" />
        </Cap>
        <Cap caption="toggle controlled">
          <ControlledToggleDemo />
        </Cap>
        <Cap caption="checkbox off">
          <Checkbox label="Include drawings" />
        </Cap>
        <Cap caption="checkbox locked">
          <Checkbox locked={{ reason: 'Set by policy' }} label="Identifier check" />
        </Cap>
        <Cap caption="checkbox disabled">
          <Checkbox disabled label="Attach datasheets" sub="No datasheets on file" />
        </Cap>
        <Cap caption="RadioGroup">
          <RadioGroup
            name="vat-group"
            legend="VAT treatment"
            defaultValue="export"
            options={[
              { value: 'export', label: 'Export · zero-rated', sub: 'VAT 0%' },
              { value: 'local', label: 'Local · 5%' },
              { value: 'exempt', label: 'Exempt', disabled: true },
            ]}
          />
        </Cap>
      </Row>

      <Row
        full
        name="Select · Choices · Search · Spinner"
        code="disabled · buttons · input · spinner"
        note="Choices with onValueChange are buttons (aria-pressed). SearchInput md, empty. The spinner is decorative."
      >
        <Cap caption="select disabled">
          <Select
            size="md"
            disabled
            aria-label="Incoterm"
            options={[{ value: 'fca', label: 'FCA' }]}
          />
        </Cap>
        <Cap caption="choices buttons">
          <ChoicesButtonsDemo options={PART_FILTERS} initial="all" />
        </Cap>
        <Cap caption="search input md">
          <SearchInput
            aria-label="Search enquiries"
            placeholder="Search enquiries, parts, references…"
            kbd="⌘K"
          />
        </Cap>
        <Cap caption="spinner">
          <span className="text-io-accent">
            <Spinner />
          </span>
        </Cap>
      </Row>
    </>
  )
}
