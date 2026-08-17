import type { Metadata } from 'next'
import Link from 'next/link'
import { buildBreadcrumbLd, dashSizeTable } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import ToolPageHeader from '../../../../components/tools/ToolPageHeader'
import { pageMetadata, urlFor } from '../../../../lib/seo'

const DESCRIPTION =
  'Hydraulic hose dash sizes converted to inches and millimetres. The dash number is the nominal bore in sixteenths of an inch.'

export const metadata: Metadata = pageMetadata({
  title: 'Hydraulic hose dash size chart',
  description: DESCRIPTION,
  path: '/tools/dash-size-chart',
})

/**
 * Static table, rendered as real HTML on the server.
 *
 * Deliberately not a client component and deliberately not an image. Most
 * competitor dash charts in this niche are JPEGs or PDFs, and an answer engine
 * cannot cite what it cannot parse — so plain semantic table markup is doing
 * SEO work here as much as accessibility work.
 */
export default function DashSizeChartPage() {
  const rows = dashSizeTable()

  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd({
          items: [
            { name: 'Home', url: urlFor('/') },
            { name: 'Tools', url: urlFor('/tools') },
            { name: 'Dash size chart', url: urlFor('/tools/dash-size-chart') },
          ],
        })}
      />
      <ToolPageHeader
        title="Dash size chart"
        intro="The dash number is the nominal inside diameter in sixteenths of an inch. That is a definition, not a lookup — which is why the arithmetic below is exact and the caveats underneath matter more than the numbers."
      />

      <div className="max-w-[760px] pb-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-ih-border bg-ih-surface text-[14px]">
            <caption className="mono caption-top pb-2.5 text-left text-[10.5px] uppercase tracking-[0.14em] text-ih-muted">
              Nominal hose bore by dash size
            </caption>
            <thead>
              <tr>
                {['Dash', 'Inches', 'Decimal in', 'Millimetres'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="mono border-b border-ih-border bg-ih-surface-2 px-3.5 py-2.5 text-left text-[10.5px] font-medium uppercase tracking-[0.08em] text-ih-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.dash}>
                  <th
                    scope="row"
                    className="mono border-b border-ih-border px-3.5 py-2.5 text-left font-medium text-ih-ink"
                  >
                    -{row.dash}
                  </th>
                  <td className="mono border-b border-ih-border px-3.5 py-2.5 tabular-nums text-ih-ink-2">
                    {row.inchFraction}&Prime;
                  </td>
                  <td className="mono border-b border-ih-border px-3.5 py-2.5 tabular-nums text-ih-ink-2">
                    {row.inches.toFixed(4)}
                  </td>
                  <td className="mono border-b border-ih-border px-3.5 py-2.5 tabular-nums text-ih-ink-2">
                    {row.millimetres.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="max-w-[760px] pb-20">
        <div className="rounded-md border-l-4 border-ih-warning bg-ih-warning-soft p-4">
          <p className="mono mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-warning">
            Two caveats
          </p>
          <p className="mb-2 text-[14px] leading-[1.6] text-ih-ink-2">
            <strong>It is nominal.</strong> Actual bore varies with construction — a compact hose in
            a given dash size does not necessarily share the bore of a standard one in the same
            size. Take the real figure from the datasheet for the grade you are buying.
          </p>
          <p className="text-[14px] leading-[1.6] text-ih-ink-2">
            <strong>Fittings use the same numbers differently.</strong> On a JIC or SAE fitting the
            dash refers to the tube outside diameter the fitting suits, not the hose bore. A -8 hose
            and a -8 fitting are a matched pair by convention, not because the two dimensions are
            the same thing.
          </p>
        </div>
        <p className="mt-5 text-[14px] leading-[1.6] text-ih-muted">
          Choosing a grade rather than a size?{' '}
          <Link href="/c/hydraulic-hoses" className="text-ih-accent hover:underline">
            Browse hydraulic hose by construction
          </Link>
          .
        </p>
      </div>
    </>
  )
}
