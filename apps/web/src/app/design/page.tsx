import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Chip,
  EmptyState,
  Eyebrow,
  Field,
  HairlineCell,
  HairlineGrid,
  InlineError,
  Input,
  Note,
  SectionHead,
  Select,
  Skeleton,
  SkeletonProductGrid,
  SpecList,
  StaleAt,
  Stat,
  StatTile,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@indus/ui'
import OverlaySpecimen from './OverlaySpecimen'

/**
 * The foundation board.
 *
 * 02-screen-index.md §00 asks for this as an internal route: "a living
 * specimen sheet ... how the team catches drift later, and it is cheap
 * because it is only the primitives."
 *
 * It is a specimen, not a page — it deliberately shows every primitive in
 * every state, including the ones the artboards never draw (empty, loading,
 * error, disabled, focus). If something here looks wrong, it is wrong
 * everywhere, and fixing it costs one commit instead of fifty files.
 *
 * Staff-only: proxy.ts requires a valid staff token for /design, the same
 * check /admin gets. noindex below is belt-and-braces, not the gate.
 */

export const metadata: Metadata = {
  title: 'Design language v2 — foundation',
  robots: { index: false, follow: false, nocache: true },
}

const SWATCHES = [
  ['Navy', 'bg-ih-navy', '--ih-navy', 'chrome, footers, dark bands'],
  ['Navy 2', 'bg-ih-navy-2', '--ih-navy-2', 'raised surface on navy'],
  ['Signal', 'bg-ih-accent', '--ih-accent', 'THE primary action, links'],
  ['Signal hover', 'bg-ih-accent-hover', '--ih-accent-hover', 'pressed / hover step'],
  ['Signal soft', 'bg-ih-accent-soft', '--ih-accent-soft', 'tinted panel, selected row'],
  ['Steel', 'bg-ih-steel', '--ih-steel', 'secondary data blue'],
  ['Steel soft', 'bg-ih-steel-soft', '--ih-steel-soft', 'steel-tinted panel'],
  ['Page', 'bg-ih-bg', '--ih-bg', 'cool paper — the page ground'],
  ['Surface', 'bg-ih-surface', '--ih-surface', 'cards, nav, table bodies'],
  ['Surface 2', 'bg-ih-surface-2', '--ih-surface-2', 'inset panels, hover rows'],
  ['Surface 3', 'bg-ih-surface-3', '--ih-surface-3', 'avatar fill, deepest inset'],
  ['Border', 'bg-ih-border', '--ih-border', 'the hairline'],
  ['Border strong', 'bg-ih-border-strong', '--ih-border-strong', 'outline buttons, drop zones'],
  ['Ink', 'bg-ih-ink', '--ih-ink', 'headings, primary text'],
  ['Ink 2', 'bg-ih-ink-2', '--ih-ink-2', 'body copy, lede'],
  ['Muted', 'bg-ih-muted', '--ih-muted', 'secondary text, eyebrows'],
  ['Muted 2', 'bg-ih-muted-2', '--ih-muted-2', '≥14px non-essential only'],
  ['Success', 'bg-ih-success', '--ih-success', 'low chroma by design'],
  ['Warning', 'bg-ih-warning', '--ih-warning', 'low chroma by design'],
  ['Danger', 'bg-ih-danger', '--ih-danger', 'low chroma by design'],
] as const

const TYPE_SCALE = [
  ['Page H1', 'serif', 'font-serif text-[46px] leading-[1.05] tracking-[-0.01em]'],
  ['Section H2 serif', 'serif', 'font-serif text-[34px] tracking-[-0.01em]'],
  ['Section H2 sans', 'sans 500', 'text-[30px] font-medium tracking-[-0.02em]'],
  ['H3', 'sans 500', 'text-[17px] font-medium tracking-[-0.02em]'],
  ['Lede', 'sans 400', 'text-[16px] leading-[1.6] text-ih-ink-2'],
  ['Body', 'sans 400', 'text-[13px]'],
  ['Small / meta', 'sans 400', 'text-xs text-ih-muted'],
] as const

function Section({
  n,
  title,
  note,
  children,
}: {
  n: string
  title: string
  note?: string
  children: ReactNode
}) {
  return (
    <section className="border-b border-ih-border px-12 py-14 last:border-b-0">
      <SectionHead number={n} title={title} />
      {note ? <p className="-mt-3 mb-7 max-w-[72ch] text-[13px] leading-relaxed text-ih-muted">{note}</p> : null}
      {children}
    </section>
  )
}

export default function DesignFoundationPage() {
  return (
    <main id="main" className="mx-auto max-w-[1440px] bg-ih-bg pb-24">
      <header className="border-b border-ih-border bg-ih-surface px-12 py-14">
        <Eyebrow>Design language · v2 · Indus · Bazar grammar</Eyebrow>
        <h1 className="mt-4 max-w-[24ch] text-pretty font-serif text-[46px] font-normal leading-[1.05] tracking-[-0.01em]">
          Quiet paper, one blue that <em className="italic">means something</em>, and data set in mono.
        </h1>
        <p className="mt-5 max-w-[68ch] text-[16px] leading-[1.6] text-ih-ink-2">
          Every primitive in every state. If a component drifts from the contract, it shows here first — which is
          the whole reason this route exists.
        </p>
        <div className="mt-6">
          <Breadcrumb items={[{ label: 'INTERNAL' }, { label: 'DESIGN' }, { label: 'FOUNDATION' }]} />
        </div>
      </header>

      <Section n="/01" title="The blue family." note="One loud colour. Everything else is ink, paper and rule. Semantic colours are deliberately low-chroma so they never compete with the accent.">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {SWATCHES.map(([name, bg, token, use]) => (
            <div key={token}>
              <div className={`h-16 rounded-lg border border-ih-border ${bg}`} />
              <div className="mt-2.5 text-[12.5px] font-medium">{name}</div>
              <div className="mt-1 font-mono text-[10px] leading-relaxed text-ih-muted">
                {token}
                <br />
                {use}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section n="/02" title="Type." note="Three families, no exceptions. Geist for UI, Instrument Serif for display (weight 400 only — never bold inside a serif headline), JetBrains Mono for anything machine-readable.">
        <div className="flex flex-col gap-6">
          {TYPE_SCALE.map(([role, family, cls]) => (
            <div key={role} className="grid grid-cols-[180px_1fr] items-baseline gap-8 border-b border-ih-border pb-5">
              <div>
                <div className="text-[12.5px] font-medium">{role}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ih-muted">{family}</div>
              </div>
              <p className={cls}>Pressure-tested to 350 bar</p>
            </div>
          ))}
          <div className="grid grid-cols-[180px_1fr] items-baseline gap-8">
            <div>
              <div className="text-[12.5px] font-medium">Data / SKU</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ih-muted">mono · tnum</div>
            </div>
            <p className="font-mono text-[13px] tabular-nums">A10VSO 71 DFR/31R-PPA12N00 · 350 bar · 71 cc/rev</p>
          </div>
        </div>
      </Section>

      <Section n="/03" title="Buttons." note="Five kinds, three sizes, five states each. Note the outline hover — it goes accent-bordered and accent-texted, not grey. One primary action per view.">
        <div className="flex flex-col gap-7">
          {(['primary', 'navy', 'outline', 'ghost'] as const).map((kind) => (
            <div key={kind} className="flex flex-wrap items-center gap-3">
              <span className="w-20 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ih-muted">{kind}</span>
              <Button kind={kind} size="sm">
                Small
              </Button>
              <Button kind={kind}>Add to quote</Button>
              <Button kind={kind} size="lg">
                Large
              </Button>
              <Button kind={kind} disabled>
                Disabled
              </Button>
              <Button kind={kind} loading>
                Submitting
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-ih-navy p-5">
            <span className="w-20 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ih-steel">onnavy</span>
            <Button kind="onnavy" size="sm">
              Small
            </Button>
            <Button kind="onnavy">Talk to an engineer</Button>
            <Button kind="onnavy" disabled>
              Disabled
            </Button>
          </div>
          <p className="text-[12.5px] text-ih-muted">
            Tab through the row above — every control takes an accent border plus a 3px accent-soft halo. Focus is
            never removed without a replacement.
          </p>
        </div>
      </Section>

      <Section n="/04" title="Fields." note="40px tall, radius 6. Validation is on blur, never on keystroke. An error replaces the hint rather than stacking under it, so the control never changes height.">
        <div className="grid max-w-[860px] grid-cols-2 gap-6">
          <Field label="Part number" hint="As printed on the nameplate." htmlFor="d-sku">
            <Input id="d-sku" placeholder="e.g. A10VSO 71" />
          </Field>
          <Field label="Brand" htmlFor="d-brand">
            <Select id="d-brand" defaultValue="">
              <option value="">Any brand</option>
              <option>Bosch Rexroth</option>
              <option>Parker Hannifin</option>
            </Select>
          </Field>
          <Field label="Work email" error="Enter a company email address." htmlFor="d-email">
            <Input id="d-email" defaultValue="me@gmail.com" error="Enter a company email address." />
          </Field>
          <Field label="Disabled" hint="Not editable in this state." htmlFor="d-dis">
            <Input id="d-dis" defaultValue="IH-PGH4-21-020" disabled />
          </Field>
          <Field label="Requirement" hint="Free text is fine — an engineer reads every one." className="col-span-2" htmlFor="d-req">
            <Textarea id="d-req" placeholder="What failed, and what it sits in." />
          </Field>
          <div className="col-span-2 flex gap-8">
            <Checkbox label="In stock only" defaultChecked />
            <Checkbox label="Made to order" />
            <Checkbox label="Disabled" disabled />
          </div>
        </div>
      </Section>

      <Section n="/05" title="Badges, chips and avatars.">
        <div className="flex flex-col gap-7">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Default</Badge>
            <Badge kind="accent">Accent</Badge>
            <Badge kind="navy">Navy</Badge>
            <Badge kind="steel">Steel</Badge>
            <Badge kind="success" dot>
              In stock
            </Badge>
            <Badge kind="warn" dot>
              2–3 week lead
            </Badge>
            <Badge kind="danger" dot>
              Discontinued
            </Badge>
            <Badge kind="steel" square>
              NEW
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Chip on>All services 20</Chip>
            <Chip>Cylinders 1</Chip>
            <Chip>BOP &amp; pressure control 10</Chip>
            <Chip ghost>Ghost</Chip>
          </div>
          <div className="flex items-center gap-4">
            <Avatar initials="KM" size={40} />
            <Avatar initials="AB" size={32} accent />
            <Avatar initials="RS" size={24} />
          </div>
        </div>
      </Section>

      <Section n="/06" title="Containers." note="1px rules do the separating work. Shadow-1 is for a genuinely raised card; shadow-2 is reserved for true overlays.">
        <div className="grid grid-cols-3 gap-5">
          <Card className="p-5">
            <Eyebrow>Card</Eyebrow>
            <p className="mt-3 text-[13px] text-ih-ink-2">The workhorse container. Radius 10, hairline border, no shadow.</p>
          </Card>
          <Card raised className="p-5">
            <Eyebrow>Card · raised</Eyebrow>
            <p className="mt-3 text-[13px] text-ih-ink-2">Shadow-1. Rare — most separation is a border.</p>
          </Card>
          <Note>
            The one editorial aside per page. Accent-soft ground with a matching border, 12.5px.
          </Note>
        </div>

        <div className="mt-6">
          <HairlineGrid>
            {[
              ['WELLHEAD & BOP', 'Pressure control', 'Rated to API 6A/16A.'],
              ['ROTATING', 'Top drive & swivel', 'Seal kits and rebuilds.'],
              ['CIRCULATION', 'Mud pump fluid end', 'Liners, pistons, valves.'],
              ['HANDLING', 'Tongs & elevators', 'Hydraulic power units.'],
            ].map(([tag, title, body]) => (
              <HairlineCell key={tag}>
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ih-accent">{tag}</div>
                <h4 className="mt-2.5 text-[15px] font-medium">{title}</h4>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ih-muted">{body}</p>
              </HairlineCell>
            ))}
          </HairlineGrid>
          <p className="mt-3 text-[12.5px] text-ih-muted">
            The four-up hairline grid — 1px gaps over a border-coloured ground, so no cell doubles its neighbour&rsquo;s
            rule.
          </p>
        </div>
      </Section>

      <Section n="/07" title="Data display.">
        <div className="grid grid-cols-[1.4fr_1fr] gap-10">
          <div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ref</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead numeric>Waiting</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ['RFQ-4821', 'Gulf Drilling Services', 'Cylinders · 4 lines', '38 min'],
                    ['RFQ-4820', 'Emirates Steel', 'Valves · 12 lines', '1h 12m'],
                    ['RFQ-4819', 'Jebel Ali Terminal', 'Pumps · 2 lines', '2h 04m'],
                  ].map(([ref, cust, scope, wait]) => (
                    <TableRow key={ref}>
                      <TableCell className="font-mono text-xs text-ih-accent">{ref}</TableCell>
                      <TableCell className="font-medium">{cust}</TableCell>
                      <TableCell className="text-[12.5px] text-ih-muted">{scope}</TableCell>
                      <TableCell numeric>{wait}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
            <div className="mt-3 flex items-center gap-3">
              <StaleAt at="2026-08-16T09:42:00Z" />
              <span className="text-[12.5px] text-ih-muted">— cached figures always carry their read time.</span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Card className="p-5">
              <Eyebrow className="mb-3">Spec list</Eyebrow>
              <SpecList
                rows={[
                  ['Working pressure', '350 bar'],
                  ['Displacement', '71 cc/rev'],
                  ['Mounting', 'SAE J744 4-bolt'],
                  ['Port thread', '1″ BSP'],
                ]}
              />
            </Card>
            <div className="grid grid-cols-3 gap-7">
              <Stat value="1,134" label="SKUs in stock" />
              <Stat value="29" label="Partner brands" />
              <Stat value="23 yrs" label="In business" />
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <StatTile label="Open RFQs" value="24" delta="+6 vs last week" />
              <StatTile label="Stock-out lines" value="38" delta="+11" down />
            </div>
          </div>
        </div>
      </Section>

      <Section
        n="/08"
        title="Empty, loading and error."
        note="The designs show only the populated state. These are built to the language rather than drawn — 03-interactions-and-states.md §5 calls this the largest gap in the package. Skeletons are deliberately not animated: a static block that appears for 200ms is calmer than one that shimmers."
      >
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <EmptyState
              condition="Nothing matched that query"
              message="No SKU, category or service matched “A10VSO 999”. It may be an obsolete code."
              action={<Button kind="primary">Cross-reference it</Button>}
            />
          </Card>
          <Card>
            <EmptyState
              condition="Your quote list is empty"
              message="Add parts from any product page and they will collect here until you send them."
              action={<Button kind="outline">Browse the catalogue</Button>}
            />
          </Card>
        </div>

        <div className="mt-6">
          <InlineError message="Stock levels could not be read from the warehouse feed." />
        </div>

        <div className="mt-8">
          <Eyebrow className="mb-4">Loading — product grid</Eyebrow>
          <SkeletonProductGrid count={4} />
        </div>

        <div className="mt-8 max-w-[540px]">
          <Eyebrow className="mb-4">Loading — inline</Eyebrow>
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        </div>
      </Section>

      <Section n="/09" title="The navy band." note="Exactly one dark panel per long page, used for the support or CTA moment. Eyebrow in steel, white serif heading, body at 82% lightness, checklist with steel ticks.">
        <div className="rounded-lg bg-ih-navy px-12 py-14">
          <Eyebrow className="text-ih-steel">Support</Eyebrow>
          <h3 className="mt-3 max-w-[22ch] text-pretty font-serif text-[34px] font-normal text-white">
            An engineer answers, <em className="italic">not a call centre.</em>
          </h3>
          <p className="mt-4 max-w-[62ch] text-[14.5px] leading-relaxed text-[oklch(0.82_0.02_250)]">
            Send a part number, a photo of a nameplate, or a description of what failed. If we do not have an
            interchange on file, we will say so.
          </p>
          <div className="mt-8 grid max-w-[820px] grid-cols-2 gap-x-8 gap-y-3">
            {['Same-day dispatch from Jebel Ali', 'Datasheets and 3D models on every SKU', 'Cross-reference on obsolete codes', '24-month manufacturer warranty'].map((t) => (
              <div key={t} className="flex items-baseline gap-2.5 text-[13.5px] text-[oklch(0.86_0.02_250)]">
                <span aria-hidden="true" className="text-ih-steel">
                  ✓
                </span>
                {t}
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-3">
            <Button kind="primary">Request a quote</Button>
            <Button kind="onnavy">Talk to an engineer</Button>
          </div>
        </div>
      </Section>

      <Section
        n="/10"
        title="Overlays."
        note="Dialog, dropdown and tooltip delegate focus management to Radix packages this workspace already declared. Toast is ours — it is a live region, not a focus trap, so politeness is tone-dependent: successes announce politely, failures assertively. Note the second tooltip: it sits over a DISABLED button, which fires no pointer events, so the trigger has to be a wrapper rather than the button itself."
      >
        <OverlaySpecimen />
      </Section>
    </main>
  )
}
