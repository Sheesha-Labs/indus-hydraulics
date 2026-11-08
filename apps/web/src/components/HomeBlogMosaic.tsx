import Image from 'next/image'
import Link from 'next/link'
import { mediaUrl } from '../lib/media'

export type HomeBlogTile = {
  id: string
  slug: string
  title: string
  hero: { storagePath: string; alt: string | null } | null
}

/**
 * Tiles each breakpoint shows. Every tile is in the HTML; narrower screens
 * stop earlier so a phone gets the lead and four, not the lead and eight.
 * Literal strings because Tailwind only generates classes written in full.
 */
function visibilityFor(index: number): string {
  if (index >= 7) return 'hidden lg:block'
  if (index >= 5) return 'hidden md:block'
  return 'block'
}

/**
 * The home page's blog teaser as a photo mosaic: image and title, nothing
 * else.
 *
 * Replaced three full cards (photo, category, date, reading time, title,
 * excerpt) that showed three articles out of four hundred. Each tile is now
 * the article's hero photograph with its title set over a bottom-weighted
 * scrim — the same treatment as the industry tiles above it — so the band
 * shows nine articles in roughly the height three took.
 *
 * Layout, on a 4-column grid from lg: the newest article is a 2×2 lead, four
 * tiles sit beside it and four more run along the bottom. Below lg the lead
 * spans the row and the rest fall into two columns.
 */
export default function HomeBlogMosaic({ posts }: { posts: HomeBlogTile[] }) {
  return (
    <ul className="grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-4 lg:gap-4">
      {posts.map((post, index) => {
        const lead = index === 0
        return (
          <li
            key={post.id}
            className={`${visibilityFor(index)} ${lead ? 'col-span-2 lg:row-span-2' : ''}`}
          >
            <Link
              href={`/blog/${post.slug}`}
              className={`group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-lg bg-ih-navy text-white focus-visible:shadow-[0_0_0_3px_var(--color-ih-accent-soft)] focus-visible:outline-none ${
                lead ? 'aspect-[16/10] p-5 sm:p-7 lg:aspect-auto' : 'aspect-[4/3] p-3.5 sm:p-4'
              }`}
            >
              {post.hero ? (
                <Image
                  src={mediaUrl(post.hero.storagePath)}
                  alt={post.hero.alt ?? post.title}
                  fill
                  sizes={
                    lead
                      ? '(max-width: 1024px) 100vw, 660px'
                      : '(max-width: 1024px) 50vw, 330px'
                  }
                  className="-z-20 object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              ) : null}
              <div
                aria-hidden="true"
                className={`absolute inset-0 -z-10 bg-gradient-to-t ${
                  lead
                    ? 'from-[oklch(0_0_0/0.85)] via-[oklch(0_0_0/0.3)] to-transparent'
                    : 'from-[oklch(0_0_0/0.88)] via-[oklch(0_0_0/0.45)] to-[oklch(0_0_0/0.05)]'
                }`}
              />
              <h3
                className={
                  lead
                    ? 'max-w-[560px] font-serif text-[clamp(22px,2.4vw,32px)] font-normal leading-[1.15] tracking-[-0.01em]'
                    : 'line-clamp-3 text-[13.5px] font-semibold leading-[1.3] tracking-[-0.01em] sm:text-[14.5px]'
                }
              >
                {post.title}
              </h3>
              {lead ? (
                <span
                  aria-hidden="true"
                  className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-white/75 transition-colors group-hover:text-white"
                >
                  Read the article →
                </span>
              ) : null}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
