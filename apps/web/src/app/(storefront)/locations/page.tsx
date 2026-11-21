import type { Metadata } from 'next'
import Link from 'next/link'
import {
  buildBreadcrumbLd,
  buildServiceLd,
  serviceAreaNames,
  serviceAreasOrdered,
} from '@indus/domain'
import { JsonLd } from '@indus/ui'
import { ORG_ID, SITE_NAME, pageMetadata, urlFor } from '../../../lib/seo'

const DESCRIPTION =
  'On-site hydraulic hose assembly and replacement across Dubai, Abu Dhabi, Habshan, Sharjah, Ajman, Ras Al Khaimah and Fujairah.'

export const metadata: Metadata = pageMetadata({
  title: 'On-site hose service areas',
  description: DESCRIPTION,
  path: '/locations',
})

export default function LocationsIndexPage() {
  const areas = serviceAreasOrdered()

  return (
    <main className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)]">
      <JsonLd
        data={[
          buildServiceLd({
            name: 'On-site hydraulic hose assembly and replacement',
            description: DESCRIPTION,
            url: urlFor('/locations'),
            areaServed: serviceAreaNames(),
            providerId: ORG_ID,
            providerName: SITE_NAME,
            serviceType: 'Hydraulic hose assembly and repair',
          }),
          buildBreadcrumbLd({
            items: [
              { name: 'Home', url: urlFor('/') },
              { name: 'Service areas', url: urlFor('/locations') },
            ],
          }),
        ]}
      />

      <header className="max-w-[760px] py-12">
        <p className="mono text-ih-muted mb-3 text-[10.5px] font-medium tracking-[0.13em] uppercase">
          On-site service
        </p>
        <h1 className="mb-4 font-serif text-[clamp(34px,5vw,52px)] leading-[1.08] font-normal tracking-[-0.02em]">
          Where we service on site
        </h1>
        <p className="text-ih-muted mb-4 text-[17px] leading-[1.55]">{DESCRIPTION}</p>
        {/*
          Wording matters and is asserted by a test in packages/domain: these
          are areas we service, not places we have premises. There is one
          verified office, and claiming more risks a false-presence penalty.
        */}
        <p className="text-ih-muted-2 text-[14px] leading-[1.6]">
          Our hose bay and warehouse are in Dubai. Everywhere else on this page is somewhere we
          travel to — mobile assembly at the machine, or a certified build delivered and fitted.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => (
          <Link
            key={area.slug}
            href={`/locations/${area.slug}`}
            className="group border-ih-border bg-ih-surface hover:border-ih-accent flex min-w-0 flex-col rounded-lg border p-6 transition-colors"
          >
            <p className="mono text-ih-muted mb-2 text-[10.5px] tracking-[0.12em] uppercase">
              {area.region}
            </p>
            <h2 className="text-ih-ink group-hover:text-ih-accent mb-2 text-[19px] font-semibold">
              {area.name}
            </h2>
            <p className="text-ih-muted mb-3 text-[14px] leading-[1.55]">{area.summary}</p>
            <p className="mono text-ih-muted-2 mt-auto text-[11px]">
              {area.zones.slice(0, 3).join(' · ')}
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}
