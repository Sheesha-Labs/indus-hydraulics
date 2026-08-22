import Image from 'next/image'
import { Navigation } from 'lucide-react'

/**
 * The "come and see us" band: the office photo beside a live map of the HQ,
 * with a directions button that opens the native Maps app on a phone.
 *
 * The map is Google's keyless embed (`output=embed`) rather than a map
 * library. A tile renderer would be ~800KB of JavaScript and a new CSP
 * connect-src entry to draw one pin on one page; the iframe is a single
 * element. It does need `frame-src https://www.google.com` in the storefront
 * CSP — without it the browser blocks the frame outright and the band renders
 * as a blank box (src/proxy.ts).
 *
 * `photo` is null until the founder supplies a photograph of the Al Qusais
 * office. Until then the map takes the full width rather than showing a grey
 * placeholder, so the band never looks unfinished.
 */
export default function HqMap({
  city,
  addressLines,
  mapQuery,
  note,
  photo,
}: {
  city: string
  addressLines: string[]
  /** What Google is asked to centre on — an address, or "lat,lng" once known. */
  mapQuery: string
  note: string | null
  photo: { src: string; alt: string } | null
}) {
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`

  return (
    <section className="border-t border-ih-border py-14">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Head office</span>
            <h2 className="mt-2 font-serif text-[clamp(26px,3vw,34px)] font-normal leading-[1.1] tracking-[-0.01em]">
              Come and see us in {city}.
            </h2>
            <address className="mt-3 not-italic text-[14px] leading-[1.6] text-ih-muted">
              {addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>
          <a
            href={directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="hq-get-directions"
            className="inline-flex h-11 items-center gap-2 rounded-sm bg-ih-navy px-5 text-[13.5px] font-medium text-white transition-colors hover:bg-ih-ink"
          >
            <Navigation size={15} strokeWidth={1.8} aria-hidden />
            Get directions
          </a>
        </div>

        <div className={`grid gap-4 ${photo ? 'lg:grid-cols-[0.85fr_1.15fr]' : 'grid-cols-1'}`}>
          {photo ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-ih-border lg:aspect-auto">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 1023px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          ) : null}
          <iframe
            src={embedSrc}
            title={`Map of the Indus Hydraulics office in ${city}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="h-[320px] w-full rounded-lg border border-ih-border md:h-[400px]"
          />
        </div>

        {note ? <p className="mt-4 text-[12.5px] text-ih-muted">{note}</p> : null}
      </div>
    </section>
  )
}
