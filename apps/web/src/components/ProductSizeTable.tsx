import type { ReactNode } from 'react'
import {
  hasVariantEquivalents,
  hasVariantPressures,
  hasVariantWeights,
  variantColumnUnit,
  variantDimensionColumns,
  variantDimensions,
  variantEndColumns,
  variantEquivalentBrand,
  variantHoseLabel,
  variantPortHeading,
  variantSizeHeading,
  variantTableKind,
  variantText,
  variantTextColumns,
  isStandardDesignation,
  type VariantColumn,
  type VariantLike,
  type VariantTableKind,
} from '@indus/domain'

/**
 * Per-size competitor numbers, keyed by Indus part number — one extra column
 * per maker or standard. A plain object (not a Map) because it crosses the
 * server/client boundary into the tabs.
 */
export type SizeEquivalents = {
  brands: string[]
  byPartNumber: Record<string, Record<string, string>>
}

/** Column heading: a maker's number is an equivalent; a standard code is a designation. */
function equivalentHeading(brand: string): string {
  return isStandardDesignation(brand) ? `${brand} no.` : `${brand} equivalent`
}

type Props = {
  variants: VariantLike[]
  /** Per-size cross-references; each brand becomes a column after the Indus part number. */
  equivalents?: SizeEquivalents | null
  /** Shown above the table, e.g. "Parker 13943 / 1L943". Null hides the line. */
  equivalenceNote?: string | null
  /**
   * Competitor named by the listing's cross-references. Drives the
   * not-affiliated line, which has to appear on every page that names a
   * competitor — including the families whose sizes carry no per-size
   * equivalent, where the name appears only in the note above the table.
   */
  equivalenceBrand?: string | null
  /**
   * Whether the range is offered in 316 stainless on request. True for the
   * hydraulic fitting and adapter catalogue, which is where that offer comes
   * from. False for anything it is not true of — a 15,000 psi hammer union is
   * a forged alloy-steel pressure part and there is no 316 equivalent to
   * order, so the line must not render on those pages.
   */
  stainlessOnRequest?: boolean
  /**
   * Heading of the part-number column — "Indus part no.", "<Maker> part no."
   * or "Part no.". Read off the rows by `variantPartNumberHeading`, because a
   * branded listing may carry the maker's numbers or Indus `IH-` numbers.
   */
  partNumberHeading?: string
}

/**
 * A rigging table runs from a 0.333 t shackle to a 7,520 kN rope, so its
 * figures get thousands separators; hose and fitting tables print as they
 * always have.
 */
/** A column headed by a bare drawing letter — A, d1, Ø2, L′, R max — rather than a word. */
const DRAWING_LETTER_LABEL = /^(?:Ø?[A-Za-z]{1,2}\d{0,2}′?(?: max| min)?|Ø\d{0,2})$/

function formatCell(value: number | undefined, kind: VariantTableKind, column: VariantColumn): string {
  if (value === undefined) return '—'
  return kind === 'lifting' || column.grouped
    ? value.toLocaleString('en-GB', { maximumFractionDigits: 3 })
    : String(value)
}

/** Size cards shown on a phone before the rest fold behind "Show all". */
const MOBILE_PREVIEW = 8
/**
 * Above this many sizes the phone does NOT render a card per size: "Show all"
 * opens the full table (sideways-scrolling) instead. The biggest listings
 * carry 1,000+ sizes, and a card each would be ~10× the DOM of the table row.
 */
const MOBILE_ALL_CARDS_MAX = 40

/** One column of the size table, shared by the table and the phone cards. */
type SizeColumn = {
  key: string
  heading: ReactNode
  /** Tooltip on the table header (the column's help text). */
  title?: string
  align?: 'right'
  nowrap?: boolean
  cell: (v: VariantLike) => ReactNode
}

/** A size as a card: part number on top, every other column as label → value. */
function SizeCard({ v, cols, partNumberHeading }: { v: VariantLike; cols: SizeColumn[]; partNumberHeading: string }) {
  return (
    <li className="rounded-[var(--radius-lg)] border border-ih-border bg-ih-surface">
      <div className="flex items-baseline justify-between gap-3 border-b border-ih-border px-4 py-2.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ih-muted">{partNumberHeading}</span>
        <span className="text-[14px] font-semibold tabular-nums text-ih-ink">{v.partNumber}</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 px-4 py-3">
        {cols.map((c) => (
          <div key={c.key} className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ih-muted">{c.heading}</dt>
            <dd className="mt-0.5 break-words text-[13.5px] tabular-nums text-ih-ink">{c.cell(v)}</dd>
          </div>
        ))}
      </dl>
    </li>
  )
}

/** Columns that carry a manufacturer's rating — they get the lowest-rated-component note. */
const RATING_KEYS = new Set(['ratedPsi', 'maxPsi', 'contPsi', 'flowGpm', 'maxFlowGpm', 'ratedRpm', 'maxRpm', 'torqueLbIn', 'columnLoadLbs', 'capacityTon'])

/**
 * The orderable sizes under one listing.
 *
 * This is the table a buyer actually works from: they arrive holding a hose
 * bore and a port size, or a competitor's part number, and they leave with
 * ours. So the two identifier columns come first and the dimensions follow,
 * rather than the catalogue's own order, which leads with the size codes.
 *
 * Columns are derived from the rows (see `@indus/domain/variant-columns`) —
 * a rigid fitting prints A/B/H, an elbow A/B/E, a flange head A/B/F, and the
 * component renders whichever of those the product carries instead of a fixed
 * set with empty cells.
 *
 * Wide by nature, so from md up it scrolls inside its own container; on a
 * phone each size is a card instead (see the render).
 */
export default function ProductSizeTable({
  variants,
  equivalents,
  equivalenceNote,
  equivalenceBrand,
  stainlessOnRequest = true,
  partNumberHeading = 'Indus part no.',
}: Props) {
  if (variants.length === 0) {
    return (
      <p className="text-[14px] text-ih-muted">
        Size table not published for this product yet — tell us the bore and port size you need and
        we will confirm the part number.
      </p>
    )
  }

  const dimensionColumns = variantDimensionColumns(variants)
  // A rigging table is read by size first, so its size and grade columns lead;
  // a fitting's O-ring size trails the dimensions as it always has.
  const allTextColumns = variantTextColumns(variants)
  const leadTextColumns = allTextColumns.filter((c) => c.lead)
  const textColumns = allTextColumns.filter((c) => !c.lead)
  const portHeading = variantPortHeading(variants)
  const sizeHeading = variantSizeHeading(variants)
  const xrefBrands = equivalents?.brands ?? []
  const equivalentBrand = variantEquivalentBrand(variants)
  // The variant's own competitor column steps aside when the cross-references
  // carry the same maker — the same Parker number twice is not two columns.
  const showEquivalents =
    hasVariantEquivalents(variants) && !(equivalentBrand && xrefBrands.includes(equivalentBrand))
  const disclaimerBrand = equivalenceBrand ?? equivalentBrand
  const endColumns = variantEndColumns(variants)
  const showHose = variants.some((v) => variantHoseLabel(v) !== null)
  // A hose fitting gets one port column headed by what the value is. An
  // adapter has two or three ends, so it gets numbered end columns instead and
  // this single one steps aside.
  const showPort = endColumns.length === 0 && variants.some((v) => Boolean(v.portLabel))
  const showWeight = hasVariantWeights(variants)
  const showPressure = hasVariantPressures(variants)
  // Hose or fitting, read off the rows themselves — see `variantTableKind`. A
  // hose has no port and its size column IS its bore, so the two places this
  // table speaks in fitting terms have to say something else.
  const kind = variantTableKind(variants)
  // Lashing capacity is a load-securing figure, and a table that prints only a
  // breaking load has no working rating at all; both need saying under a
  // rigging table, because a buyer reads the biggest number as the rating.
  const hasLashing = dimensionColumns.some((c) => c.key.startsWith('lc'))
  const showsRatings = dimensionColumns.some((c) => RATING_KEYS.has(c.key))
  // A cartridge valve row carries the maker's base model code; the code a buyer
  // orders adds the configuration letters, and those are settled on the quote.
  const isCartridge = leadTextColumns.some((c) => c.key === 'cavity')
  const breakingOnly =
    kind === 'lifting' &&
    !dimensionColumns.some((c) => c.key.startsWith('wll') || c.key.startsWith('lc')) &&
    dimensionColumns.some((c) => c.key.startsWith('mbl'))

  const dimHeading = (c: VariantColumn): ReactNode => (
    <>
      {/* A drawing letter keeps its case: `d` and `D` are different dimensions on
          the same drawing, and the row's uppercase styling would merge them. */}
      {DRAWING_LETTER_LABEL.test(c.label) ? <span className="normal-case">{c.label}</span> : c.label}
      {variantColumnUnit(c) && (
        <>
          {' '}
          <span className="text-ih-muted-2">({variantColumnUnit(c)})</span>
        </>
      )}
    </>
  )
  const cols: SizeColumn[] = [
    ...(showEquivalents
      ? [{
          key: 'competitorMpn',
          heading: equivalentBrand ? `${equivalentBrand} equivalent` : 'Equivalent',
          cell: (v: VariantLike) => v.competitorMpn ?? '—',
        }]
      : []),
    ...xrefBrands.map((b) => ({
      key: `xref-${b}`,
      heading: equivalentHeading(b),
      nowrap: true,
      cell: (v: VariantLike) => equivalents?.byPartNumber[v.partNumber]?.[b] ?? '—',
    })),
    ...leadTextColumns.map((c) => ({
      key: `lead-${c.key}`,
      heading: c.label,
      title: c.help,
      nowrap: true,
      cell: (v: VariantLike) => variantText(v.dimensions, c.key) ?? '—',
    })),
    ...(showHose ? [{ key: 'hose', heading: sizeHeading, cell: (v: VariantLike) => variantHoseLabel(v) ?? '—' }] : []),
    ...(showPort ? [{ key: 'port', heading: portHeading, cell: (v: VariantLike) => v.portLabel ?? '—' }] : []),
    ...endColumns.map((c) => ({
      key: `end-${c.key}`,
      heading: c.label,
      title: c.help,
      nowrap: true,
      cell: (v: VariantLike) => v[c.key] ?? '—',
    })),
    ...dimensionColumns.map((c) => ({
      key: `dim-${c.key}`,
      heading: dimHeading(c),
      title: c.help,
      align: 'right' as const,
      cell: (v: VariantLike) => formatCell(variantDimensions(v.dimensions)[c.key], kind, c),
    })),
    ...textColumns.map((c) => ({
      key: `text-${c.key}`,
      heading: c.label,
      title: c.help,
      cell: (v: VariantLike) => variantText(v.dimensions, c.key) ?? '—',
    })),
    ...(showWeight
      ? [{ key: 'weight', heading: <>Weight <span className="text-ih-muted-2">(g)</span></>, align: 'right' as const, cell: (v: VariantLike) => v.weightG ?? '—' }]
      : []),
    ...(showPressure
      ? [{ key: 'pressure', heading: <>Working pressure <span className="text-ih-muted-2">(bar)</span></>, align: 'right' as const, cell: (v: VariantLike) => v.pressureBar ?? '—' }]
      : []),
  ]

  return (
    <div className="ih-sizes">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-[26px] font-normal tracking-[-0.01em]">
          Sizes &amp; part numbers
        </h2>
        <span className="text-[11px] uppercase tracking-[0.08em] text-ih-muted">
          {variants.length} size{variants.length === 1 ? '' : 's'}
        </span>
      </div>

      {equivalenceNote && (
        <p className="mb-5 text-[14px] leading-[1.6] text-ih-ink-2">{equivalenceNote}</p>
      )}

      {/*
        One column list drives both layouts, so the phone cards and the table
        can never disagree about what a size carries.

        Phones (< md) get a card per size: the part number as the card's
        heading and every other column as a label/value pair. A 7–12 column
        table at 375px is a sideways scroll where the reader loses the part
        number the moment they move off it; a buyer on a phone is looking up
        one size, not comparing twelve. Long ranges show the first
        MOBILE_PREVIEW cards and fold the rest behind "Show all", which is a
        native <details>, so it needs no script and every card stays in the
        HTML. From md up it is the table it always was.
      */}
      <ol className="flex flex-col gap-2.5 md:hidden">
        {variants.slice(0, MOBILE_PREVIEW).map((v) => (
          <SizeCard key={v.partNumber} v={v} cols={cols} partNumberHeading={partNumberHeading} />
        ))}
      </ol>
      {variants.length > MOBILE_PREVIEW && (
        <details className="group/sizes mt-2.5 md:hidden">
          <summary className="flex h-11 cursor-pointer list-none items-center justify-center rounded-[var(--radius-md)] border border-ih-border-strong bg-ih-surface text-[13.5px] font-medium text-ih-ink [&::-webkit-details-marker]:hidden">
            <span className="group-open/sizes:hidden">Show all {variants.length} sizes</span>
            <span className="hidden group-open/sizes:inline">Show fewer sizes</span>
          </summary>
          {variants.length <= MOBILE_ALL_CARDS_MAX ? (
            <ol className="mt-2.5 flex flex-col gap-2.5">
              {variants.slice(MOBILE_PREVIEW).map((v) => (
                <SizeCard key={v.partNumber} v={v} cols={cols} partNumberHeading={partNumberHeading} />
              ))}
            </ol>
          ) : null}
        </details>
      )}

      {/* On a phone the table only appears for a long range, once "Show all"
          is opened (the wrapper's :has() sees the open <details>). */}
      <div
        className={`overflow-x-auto overscroll-x-contain border border-ih-border md:mt-0 md:block ${
          variants.length > MOBILE_ALL_CARDS_MAX ? 'mt-2.5 hidden [.ih-sizes:has(details[open])_&]:block' : 'hidden'
        }`}
      >
        <table className="w-full min-w-[640px] text-[13px] tabular-nums">
          <thead>
            <tr className="bg-ih-surface-2 text-[11px] uppercase tracking-[0.08em] text-ih-muted">
              <th scope="col" className="px-3.5 py-2.5 text-left font-medium whitespace-nowrap">
                {partNumberHeading}
              </th>
              {cols.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  title={c.title}
                  className={`px-3.5 py-2.5 font-medium whitespace-nowrap ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {c.heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.partNumber} className="border-t border-ih-border">
                <th scope="row" className="px-3.5 py-2.5 text-left font-medium whitespace-nowrap text-ih-ink">
                  {v.partNumber}
                </th>
                {cols.map((c) => (
                  <td
                    key={c.key}
                    className={`px-3.5 py-2.5 text-ih-ink-2 ${c.nowrap ? 'whitespace-nowrap' : ''} ${c.align === 'right' ? 'text-right' : ''}`}
                  >
                    {c.cell(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 text-[12.5px] leading-[1.55] text-ih-muted">
        {(leadTextColumns.length > 0 ||
          endColumns.length > 0 ||
          dimensionColumns.length > 0 ||
          textColumns.length > 0) && (
          <p>
            {[...leadTextColumns, ...endColumns, ...dimensionColumns, ...textColumns]
              .map((c) => `${c.label} — ${c.help}`)
              .join(' ')}
            {/* A fitting's letters are read off a dimension drawing and a buyer
                can ask for it stamped. A hose has no such drawing — its columns
                are headed with what they are — so the offer would be an offer
                of nothing. */}
            {kind === 'fitting' || kind === 'lifting' || kind === 'valve'
              ? ' Ask us for the dimension drawing if you need it stamped.'
              : ''}
          </p>
        )}
        {showPressure && kind === 'fitting' && (
          <p>
            Working pressure is the manufacturer&rsquo;s published rating for the fitting itself. An
            assembly is limited by its lowest-rated component, so check it against the hose, the
            tube and the port you are mating to.
          </p>
        )}
        {showPressure && kind === 'hose' && (
          <p>
            Working pressure is the published rating for the hose itself. A made-up assembly is
            limited by its lowest-rated part, so check it against the coupling, the clamp or
            ferrule, and the temperature you are running at.
          </p>
        )}
        {showsRatings && (
          <p>
            Pressure, flow, speed, torque and load figures are the manufacturer&rsquo;s published
            ratings for that part number. A circuit is limited by its lowest-rated component, so
            check them against the hose, fittings and valves it connects to.
          </p>
        )}
        {isCartridge && (
          <p>
            Part numbers are the maker&rsquo;s base model codes. The full ordering code adds letters
            for the control, setting range, seal and material options, and we confirm it with the
            quotation. Capacity and pressure are the maker&rsquo;s published ratings for the
            cartridge; check them against the cavity body and the rest of the circuit.
          </p>
        )}
        {kind === 'lifting' && (
          <p>
            WLL is the most the part may carry in service. Proof and breaking loads are test figures
            — never lift to them. Each load is shown in the unit the manufacturer rates the part in,
            and a size ships with the manufacturer&rsquo;s test certificate.
          </p>
        )}
        {hasLashing && (
          <p>
            LC is the lashing capacity — what a tie-down may hold when securing a load under EN
            12195. It is not a lifting rating: never lift with load-securing equipment.
          </p>
        )}
        {breakingOnly && (
          <p>
            This range is published with a breaking load only, not a working load limit. Tell us
            the duty before using it to lift, and we will confirm a rating or recommend a rated
            part.
          </p>
        )}
        {kind === 'valve' && (
          <p>
            Lengths are in millimetres and weights in kilograms, as published for each size and
            class. The end connection, trim, seat and operator you order can change the length and
            weight, so we confirm the general arrangement drawing with the quotation.
          </p>
        )}
        {kind === 'tube' && (
          <p>
            These are typical sizes for the range, not a full mill list. Other diameters, walls, fin
            geometries and lengths are made to order: tell us the standard and grade, the O.D. and
            wall, and the length you need. Mill test certificates to EN 10204 3.1 are available on
            request.
          </p>
        )}
        {kind === 'hose' && (
          <p>
            Cut lengths and made-up assemblies are prepared in Dubai. Tell us the bore, the length
            and the ends you need.
          </p>
        )}
        {stainlessOnRequest && (
          <p>
            Every size is available in 316 stainless steel on request — add “-SS” to the part
            number when you enquire.
          </p>
        )}
        {disclaimerBrand && (
          <p>
            Indus Hydraulics is not affiliated with {disclaimerBrand}. {disclaimerBrand} part
            numbers are shown for cross-reference only, so you can order from an existing bill of
            materials.
          </p>
        )}
      </div>
    </div>
  )
}
