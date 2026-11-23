import Link from 'next/link'
import { serviceAreasOrdered } from '@indus/domain'

/**
 * A one-band link strip into the service-area pages, for pages that talk
 * about the business in the UAE (contact, the UAE supplier page).
 *
 * It exists because `/locations` and `/locations/abu-dhabi` were unknown to
 * Google in November 2026: the only internal links into the area pages were
 * the footer and the area pages themselves. Every link here is crawlable
 * server markup.
 */
export default function ServiceAreaStrip({
  heading = 'On site across the UAE',
  body = 'Hose assemblies built at the machine, or made in the Dubai hose bay and fitted on site.',
}: {
  heading?: string
  body?: string
}) {
  return (
    <section className="border-ih-border bg-ih-surface border-t px-5 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-14">
        <div>
          <p className="text-ih-muted text-[10.5px] font-medium tracking-[0.13em] uppercase">
            Service areas
          </p>
          <h2 className="mt-3 font-serif text-[26px] leading-[1.12] font-normal tracking-[-0.01em] sm:text-[30px]">
            {heading}
          </h2>
          <p className="text-ih-ink-2 mt-3 text-[14.5px] leading-[1.6]">{body}</p>
        </div>
        <ul className="flex list-none flex-wrap content-start gap-2 p-0">
          {serviceAreasOrdered().map((area) => (
            <li key={area.slug}>
              <Link
                href={`/locations/${area.slug}`}
                className="border-ih-border text-ih-ink-2 hover:border-ih-accent hover:text-ih-accent inline-flex h-10 items-center rounded-full border px-4 text-[13.5px] transition-colors"
              >
                Hose repair in {area.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/locations"
              className="text-ih-accent inline-flex h-10 items-center px-2 text-[13.5px] font-medium hover:underline"
            >
              All service areas →
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}
