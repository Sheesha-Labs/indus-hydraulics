import type { Metadata } from 'next'
import Link from 'next/link'
import { buildBreadcrumbLd } from '@indus/domain'
import { JsonLd } from '@indus/ui'
import { pageMetadata, urlFor } from '../../../lib/seo'

const DESCRIPTION =
  'Free reference tools for hydraulic specification — pressure conversion, hose dash sizes and thread identification.'

export const metadata: Metadata = pageMetadata({
  title: 'Hydraulic tools & reference',
  description: DESCRIPTION,
  path: '/tools',
})

const TOOLS = [
  {
    href: '/tools/thread-identifier',
    name: 'Thread identifier',
    blurb:
      'Work from taper, thread angle and seat to a fitting family — JIC, ORFS, BSP, metric DIN, NPT or Komatsu.',
  },
  {
    href: '/tools/pressure-converter',
    name: 'Pressure converter',
    blurb:
      'psi, bar and MPa. The same hose is specified in all three depending on whose datasheet you are reading.',
  },
  {
    href: '/tools/dash-size-chart',
    name: 'Dash size chart',
    blurb:
      'Dash number to inches and millimetres, with the two caveats that cause most ordering mistakes.',
  },
]

export default function ToolsIndexPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd({
          items: [
            { name: 'Home', url: urlFor('/') },
            { name: 'Tools', url: urlFor('/tools') },
          ],
        })}
      />
      <header className="max-w-[720px] py-12">
        <p className="mono text-ih-muted mb-3 text-[10.5px] font-medium tracking-[0.13em] uppercase">
          Reference
        </p>
        <h1 className="mb-4 font-serif text-[clamp(34px,5vw,52px)] leading-[1.08] font-normal tracking-[-0.02em]">
          Hydraulic tools & reference
        </h1>
        <p className="text-ih-muted text-[17px] leading-[1.55]">{DESCRIPTION}</p>
      </header>
      <div className="grid grid-cols-1 gap-4 pb-8 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group border-ih-border bg-ih-surface hover:border-ih-accent flex min-w-0 flex-col rounded-lg border p-6 transition-colors"
          >
            <h2 className="text-ih-ink group-hover:text-ih-accent mb-2 text-[18px] font-semibold">
              {tool.name}
            </h2>
            <p className="text-ih-muted text-[14px] leading-[1.55]">{tool.blurb}</p>
          </Link>
        ))}
      </div>
      <p className="text-ih-muted pb-20 text-[14px] leading-[1.6]">
        Thread dimensions, crimp diameters and fitting pressure ratings are in the{' '}
        <Link href="/resources" className="text-ih-accent hover:underline">
          reference library
        </Link>
        .
      </p>
    </>
  )
}
