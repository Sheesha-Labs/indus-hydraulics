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
        <p className="mono mb-3 text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
          Reference
        </p>
        <h1 className="mb-4 font-serif text-[clamp(34px,5vw,52px)] font-normal leading-[1.08] tracking-[-0.02em]">
          Hydraulic tools & reference
        </h1>
        <p className="text-[17px] leading-[1.55] text-ih-muted">{DESCRIPTION}</p>
      </header>
      <div className="grid grid-cols-1 gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group flex min-w-0 flex-col rounded-lg border border-ih-border bg-ih-surface p-6 transition-colors hover:border-ih-accent"
          >
            <h2 className="mb-2 text-[18px] font-semibold text-ih-ink group-hover:text-ih-accent">
              {tool.name}
            </h2>
            <p className="text-[14px] leading-[1.55] text-ih-muted">{tool.blurb}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
