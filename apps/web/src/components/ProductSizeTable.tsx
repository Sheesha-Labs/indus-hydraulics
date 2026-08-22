import {
  hasVariantEquivalents,
  hasVariantPressures,
  hasVariantWeights,
  variantDimensionColumns,
  variantDimensions,
  variantEndColumns,
  variantEquivalentBrand,
  variantHoseLabel,
  variantPortHeading,
  variantText,
  variantTextColumns,
  type VariantLike,
} from '@indus/domain'

type Props = {
  variants: VariantLike[]
  /** Shown above the table, e.g. "Parker 13943 / 1L943". Null hides the line. */
  equivalenceNote?: string | null
  /**
   * Competitor named by the listing's cross-references. Drives the
   * not-affiliated line, which has to appear on every page that names a
   * competitor — including the families whose sizes carry no per-size
   * equivalent, where the name appears only in the note above the table.
   */
  equivalenceBrand?: string | null
}

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
 * Wide by nature, so it scrolls inside its own container. Letting the page
 * scroll sideways instead is the bug the tab strip above it already had.
 */
export default function ProductSizeTable({
  variants,
  equivalenceNote,
  equivalenceBrand,
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
  const textColumns = variantTextColumns(variants)
  const portHeading = variantPortHeading(variants)
  const showEquivalents = hasVariantEquivalents(variants)
  const equivalentBrand = variantEquivalentBrand(variants)
  const disclaimerBrand = equivalenceBrand ?? equivalentBrand
  const endColumns = variantEndColumns(variants)
  const showHose = variants.some((v) => variantHoseLabel(v) !== null)
  // A hose fitting gets one port column headed by what the value is. An
  // adapter has two or three ends, so it gets numbered end columns instead and
  // this single one steps aside.
  const showPort = endColumns.length === 0 && variants.some((v) => Boolean(v.portLabel))
  const showWeight = hasVariantWeights(variants)
  const showPressure = hasVariantPressures(variants)

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-[26px] font-normal tracking-[-0.01em]">
          Sizes &amp; part numbers
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ih-muted">
          {variants.length} size{variants.length === 1 ? '' : 's'}
        </span>
      </div>

      {equivalenceNote && (
        <p className="mb-5 text-[14px] leading-[1.6] text-ih-ink-2">{equivalenceNote}</p>
      )}

      <div className="overflow-x-auto border border-ih-border">
        <table className="w-full min-w-[640px] font-mono text-[13px]">
          <thead>
            <tr className="bg-ih-surface-2 text-[11px] uppercase tracking-[0.08em] text-ih-muted">
              <th scope="col" className="px-3.5 py-2.5 text-left font-medium">
                Indus part no.
              </th>
              {showEquivalents && (
                <th scope="col" className="px-3.5 py-2.5 text-left font-medium">
                  {equivalentBrand ? `${equivalentBrand} equivalent` : 'Equivalent'}
                </th>
              )}
              {showHose && (
                <th scope="col" className="px-3.5 py-2.5 text-left font-medium">
                  Hose bore
                </th>
              )}
              {showPort && (
                <th scope="col" className="px-3.5 py-2.5 text-left font-medium">
                  {portHeading}
                </th>
              )}
              {endColumns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  title={c.help}
                  className="px-3.5 py-2.5 text-left font-medium whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
              {dimensionColumns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  title={c.help}
                  className="px-3.5 py-2.5 text-right font-medium whitespace-nowrap"
                >
                  {c.label} <span className="text-ih-muted-2">({c.unit})</span>
                </th>
              ))}
              {textColumns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  title={c.help}
                  className="px-3.5 py-2.5 text-left font-medium whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
              {showWeight && (
                <th scope="col" className="px-3.5 py-2.5 text-right font-medium whitespace-nowrap">
                  Weight <span className="text-ih-muted-2">(g)</span>
                </th>
              )}
              {showPressure && (
                <th scope="col" className="px-3.5 py-2.5 text-right font-medium whitespace-nowrap">
                  Working pressure <span className="text-ih-muted-2">(bar)</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => {
              const dims = variantDimensions(v.dimensions)
              const hose = variantHoseLabel(v)
              return (
                <tr key={v.partNumber} className="border-t border-ih-border">
                  <th scope="row" className="px-3.5 py-2.5 text-left font-medium text-ih-ink">
                    {v.partNumber}
                  </th>
                  {showEquivalents && (
                    <td className="px-3.5 py-2.5 text-ih-ink-2">{v.competitorMpn ?? '—'}</td>
                  )}
                  {showHose && <td className="px-3.5 py-2.5 text-ih-ink-2">{hose ?? '—'}</td>}
                  {showPort && (
                    <td className="px-3.5 py-2.5 text-ih-ink-2">{v.portLabel ?? '—'}</td>
                  )}
                  {endColumns.map((c) => (
                    <td key={c.key} className="px-3.5 py-2.5 whitespace-nowrap text-ih-ink-2">
                      {v[c.key] ?? '—'}
                    </td>
                  ))}
                  {dimensionColumns.map((c) => (
                    <td key={c.key} className="px-3.5 py-2.5 text-right text-ih-ink-2">
                      {dims[c.key] ?? '—'}
                    </td>
                  ))}
                  {textColumns.map((c) => (
                    <td key={c.key} className="px-3.5 py-2.5 text-ih-ink-2">
                      {variantText(v.dimensions, c.key) ?? '—'}
                    </td>
                  ))}
                  {showWeight && (
                    <td className="px-3.5 py-2.5 text-right text-ih-ink-2">{v.weightG ?? '—'}</td>
                  )}
                  {showPressure && (
                    <td className="px-3.5 py-2.5 text-right text-ih-ink-2">
                      {v.pressureBar ?? '—'}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 text-[12.5px] leading-[1.55] text-ih-muted">
        {(endColumns.length > 0 || dimensionColumns.length > 0 || textColumns.length > 0) && (
          <p>
            {[...endColumns, ...dimensionColumns, ...textColumns]
              .map((c) => `${c.label} — ${c.help}`)
              .join(' ')}{' '}
            Ask us for the dimension drawing if you need it stamped.
          </p>
        )}
        {showPressure && (
          <p>
            Working pressure is the manufacturer&rsquo;s published rating for the fitting itself. An
            assembly is limited by its lowest-rated component, so check it against the hose, the
            tube and the port you are mating to.
          </p>
        )}
        <p>
          Every size is available in 316 stainless steel on request — add “-SS” to the part number
          when you enquire.
        </p>
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
