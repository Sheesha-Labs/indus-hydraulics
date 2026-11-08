import Image from 'next/image'
import Link from 'next/link'
import { mediaUrl } from '../lib/media'

export type HomeIndustry = {
  slug: string
  /** IND.01 … — derived from list position, so it follows admin reordering. */
  code: string
  name: string
  tagline: string | null
  heroImage: string | null
  heroImageAlt: string | null
}

/**
 * Industries served, as photo tiles — one per industry page.
 *
 * Replaced a row of text-only cells (code, name, a sentence) that gave the
 * band nothing to look at. Each tile is now the industry's own hero
 * photograph (the same one its page and the /industries index use) under a
 * bottom-weighted scrim, with the name and tagline set over it, and the
 * whole tile links to the industry page.
 *
 * Layout: four landscape tiles to a row from lg (eight industries make two
 * rows; a single row of eight left each tile ~157px wide and wrapped the
 * names onto three lines), and a swipe rail of portrait tiles below that,
 * where they would otherwise stack into a very long column.
 */
export default function HomeIndustryTiles({ industries }: { industries: HomeIndustry[] }) {
  return (
    <ul className="no-scrollbar -mx-5 flex list-none snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 py-1 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0">
      {industries.map((industry) => (
        <li key={industry.slug} className="w-[220px] shrink-0 snap-start sm:w-[240px] lg:w-auto">
          <Link
            href={`/industries/${industry.slug}`}
            className="group relative isolate flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-lg bg-ih-navy p-4 text-white lg:aspect-[4/3] lg:p-5 focus-visible:shadow-[0_0_0_3px_var(--color-ih-accent-soft)] focus-visible:outline-none"
          >
            {industry.heroImage ? (
              <Image
                src={mediaUrl(industry.heroImage)}
                alt={industry.heroImageAlt ?? industry.name}
                fill
                sizes="(max-width: 640px) 220px, (max-width: 1024px) 240px, 340px"
                className="-z-20 object-cover transition-transform duration-500 group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            ) : null}
            {/* Bottom-weighted scrim: dark where the text sits, light at the
                top so the photograph still reads as a photograph. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-t from-[oklch(0_0_0/0.86)] via-[oklch(0_0_0/0.35)] to-[oklch(0_0_0/0.05)] transition-colors"
            />
            <span className="absolute left-3 top-3 rounded-[3px] bg-[oklch(0_0_0/0.45)] px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] text-white/85">
              {industry.code}
            </span>
            <span className="flex items-end justify-between gap-2">
              <span className="text-[16px] font-semibold leading-[1.2] tracking-[-0.01em] lg:text-[19px]">
                {industry.name}
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 font-mono text-[14px] text-white/70 transition-transform group-hover:translate-x-0.5 group-hover:text-white motion-reduce:transition-none"
              >
                →
              </span>
            </span>
            {industry.tagline ? (
              <span className="mt-1.5 line-clamp-2 font-mono text-[10px] uppercase leading-[1.5] tracking-[0.08em] text-white/75 lg:text-[10.5px]">
                {industry.tagline}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  )
}
