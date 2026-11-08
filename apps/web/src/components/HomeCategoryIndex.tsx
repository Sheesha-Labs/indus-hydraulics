import Image from 'next/image'
import Link from 'next/link'
import { mediaUrl } from '../lib/media'

export type HomeSubcategory = { slug: string; name: string }

export type HomeCategory = {
  slug: string
  name: string
  skuCount: number
  image: { storagePath: string; alt: string | null } | null
  /** Published direct children with at least one active SKU, in admin order. */
  subcategories: HomeSubcategory[]
}

/** Sub-category links a card shows before "Show all". */
const VISIBLE_SUBCATEGORIES = 6

/**
 * A card with only one or two more than the visible count shows them all —
 * "Show 1 more" costs a click to reveal less than the button itself.
 */
const COLLAPSE_SLACK = 2

/**
 * The home page's catalogue index: every top-level category, each with its
 * photograph and its sub-category links.
 *
 * This replaced a six-card grid (one featured card plus five tiles) that
 * showed a quarter of the catalogue and spent each card's text on a generic
 * blurb. The home page is the strongest page on the site, and those cards
 * passed that strength to six category pages and no sub-category at all.
 *
 * ALL OF IT IS IN THE HTML; ONLY SOME OF IT IS OPEN. Each card shows its
 * first few sub-categories and keeps the rest in a native `<details>`, so
 * every link is in the server-rendered document a crawler reads, while the
 * section stays a scannable grid rather than a wall of 250 links. Same pattern
 * as the market pages' catalogue (components/markets/MarketCatalogueIndex).
 *
 * BUILT FROM THE LIVE TREE. Categories, sub-categories, order and counts all
 * come from the database, so a new range appears here when it is published
 * and an empty one (no active SKUs) is never linked.
 *
 * A Server Component with no client JavaScript: the disclosure is native.
 */
/*
  The closing tile fills whatever the last row leaves empty, so the grid ends
  square instead of on one stranded card. Literal class maps because Tailwind
  only generates classes it finds written out in full. A row with no gap gets
  no tile at that breakpoint; the section header still links to /c.
*/
const MD_FILL: Record<number, string> = { 0: 'md:hidden', 1: 'md:flex md:col-span-1' }
const XL_FILL: Record<number, string> = {
  0: 'xl:hidden',
  1: 'xl:flex xl:col-span-1',
  2: 'xl:flex xl:col-span-2',
}

export default function HomeCategoryIndex({
  categories,
  skuCount,
}: {
  categories: HomeCategory[]
  /** Active SKUs across the catalogue, for the closing tile's search prompt. */
  skuCount: number
}) {
  const mdGap = (2 - (categories.length % 2)) % 2
  const xlGap = (3 - (categories.length % 3)) % 3

  return (
    /*
      Cards stretch to the tallest in their row, so each row reads as one even
      band whatever a category's range count. The cost is that opening "Show
      all" in one card grows its row-mates' empty space too — accepted: rows
      that never line up looked broken, an opened row looks opened.
    */
    <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
      {categories.map((category, index) => (
        <li key={category.slug} className="flex">
          <CategoryCard category={category} index={index} />
        </li>
      ))}
      {/* Hidden on a single column: there is no gap to fill, and the mobile
          "Browse all" button below the grid does this job. */}
      <li className={`hidden ${MD_FILL[mdGap]} ${XL_FILL[xlGap]}`}>
        <div className="flex w-full flex-col justify-center gap-4 rounded-lg border border-dashed border-ih-border-strong bg-ih-surface-2 p-6">
          <div>
            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted">
              Can&rsquo;t see it listed?
            </p>
            <p className="mt-2 max-w-[440px] text-[15px] leading-[1.5] text-ih-ink-2">
              {`Search ${skuCount.toLocaleString()} SKUs by part number, size or spec — or send us the old part number and we’ll cross-reference it.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/c"
              className="inline-flex h-10 items-center rounded-md bg-ih-navy px-4 text-[13.5px] font-medium text-white transition-colors hover:bg-ih-ink focus-visible:shadow-[0_0_0_3px_var(--color-ih-accent-soft)] focus-visible:outline-none"
            >
              Browse all categories
            </Link>
            <Link
              href="/search"
              className="inline-flex h-10 items-center rounded-md border border-ih-border-strong bg-ih-surface px-4 text-[13.5px] text-ih-ink transition-colors hover:border-ih-accent hover:text-ih-accent focus-visible:border-ih-accent focus-visible:shadow-[0_0_0_3px_var(--color-ih-accent-soft)] focus-visible:outline-none"
            >
              Search the catalogue
            </Link>
            <Link
              href="/replacement"
              className="inline-flex h-10 items-center rounded-md border border-ih-border-strong bg-ih-surface px-4 text-[13.5px] text-ih-ink transition-colors hover:border-ih-accent hover:text-ih-accent focus-visible:border-ih-accent focus-visible:shadow-[0_0_0_3px_var(--color-ih-accent-soft)] focus-visible:outline-none"
            >
              Obsolete part lookup
            </Link>
          </div>
        </div>
      </li>
    </ul>
  )
}

function CategoryCard({ category, index }: { category: HomeCategory; index: number }) {
  const subs = category.subcategories
  const collapses = subs.length > VISIBLE_SUBCATEGORIES + COLLAPSE_SLACK
  const shown = collapses ? subs.slice(0, VISIBLE_SUBCATEGORIES) : subs
  const rest = collapses ? subs.slice(VISIBLE_SUBCATEGORIES) : []

  return (
    <article className="@container flex w-full flex-col rounded-lg border border-ih-border bg-ih-surface transition-colors hover:border-ih-border-strong">
      {/*
        One link for the thumbnail and the heading, so the photograph is a
        click target and the category is announced once, not twice.
      */}
      <Link
        href={`/c/${category.slug}`}
        className="group/head flex items-center gap-4 rounded-t-lg p-4 focus-visible:shadow-[inset_0_0_0_2px_var(--color-ih-accent)] focus-visible:outline-none sm:p-5"
      >
        {/*
          4:3 beside the heading rather than a band across the card. The
          artwork is a 3:2 studio group shot; 4:3 keeps nearly all of it, and a
          thumbnail is what lets 25 cards fit without the section running to
          several screens.
        */}
        <span className="relative block aspect-[4/3] w-[104px] shrink-0 overflow-hidden rounded-md border border-ih-border bg-ih-surface-2 sm:w-[120px]">
          {category.image ? (
            <Image
              src={mediaUrl(category.image.storagePath)}
              alt={category.image.alt ?? category.name}
              fill
              sizes="120px"
              className="object-cover transition-transform duration-500 group-hover/head:scale-[1.04] motion-reduce:transition-none"
            />
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[10.5px] tracking-[0.06em] text-ih-muted-2">
            CAT.{String(index + 1).padStart(2, '0')}
          </span>
          <span className="mt-1 block text-[16.5px] font-semibold leading-[1.25] tracking-[-0.015em] text-ih-ink transition-colors group-hover/head:text-ih-accent">
            {category.name}
          </span>
          <span className="mt-1.5 block font-mono text-[11px] text-ih-muted">
            {`${category.skuCount.toLocaleString()} SKUs`}
            {subs.length > 0 ? ` · ${subs.length} ${subs.length === 1 ? 'range' : 'ranges'}` : ''}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 self-start font-mono text-[13px] text-ih-muted-2 transition-colors group-hover/head:text-ih-accent"
        >
          →
        </span>
      </Link>

      {subs.length > 0 && (
        /*
          Two layouts from one set of links.

          md and up: the first few ranges are open, the rest sit behind "Show
          all". Below md the same section would run to ~10,000px for 25 cards,
          so a phone gets the header alone with every range behind one "N
          ranges" disclosure — a scannable index the thumb can open card by
          card.

          A closed <details> cannot be forced open at one breakpoint and shut
          at another, so the open list is hidden below md and repeated, phone-
          only, inside the disclosure. The cost is the first few links twice in
          the HTML — a few kilobytes — and crawlers see every range either way.
        */
        <div className="border-t border-ih-border px-4 sm:px-5">
          <SubcategoryList items={shown} className="hidden md:grid" />

          <details className={`group/more ${rest.length === 0 ? 'md:hidden' : ''}`}>
            <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 text-[12.5px] font-medium text-ih-accent marker:content-none hover:text-ih-ink focus-visible:underline focus-visible:outline-none md:border-t md:border-ih-border [&::-webkit-details-marker]:hidden">
              <span>
                <span className="group-open/more:hidden">
                  <span className="md:hidden">
                    {`${subs.length} ${category.name} ${subs.length === 1 ? 'range' : 'ranges'}`}
                  </span>
                  <span className="hidden md:inline">
                    {`Show all ${subs.length} ${category.name} ranges`}
                  </span>
                </span>
                <span className="hidden group-open/more:inline">Show fewer</span>
              </span>
              <span
                aria-hidden="true"
                className="font-mono text-[14px] leading-none transition-transform group-open/more:rotate-45 motion-reduce:transition-none"
              >
                +
              </span>
            </summary>
            <SubcategoryList items={shown} className="grid md:hidden" />
            {rest.length > 0 && <SubcategoryList items={rest} />}
          </details>
        </div>
      )}
    </article>
  )
}

/**
 * One column in a narrow card, two once the card is wide enough — measured on
 * the card (`@container`), not the viewport, because the grid puts the same
 * card in one, two or three columns. Row-major grid rather than CSS columns,
 * so the reading order across a row matches the admin order.
 *
 * Each link is a full 40px row (the storefront minimum hit target) and may
 * wrap to two lines: some range names run to 45+ characters.
 */
function SubcategoryList({ items, className = 'grid' }: { items: HomeSubcategory[]; className?: string }) {
  return (
    <ul className={`list-none grid-cols-1 gap-x-5 p-0 @[22rem]:grid-cols-2 ${className}`}>
      {items.map((item) => (
        <li key={item.slug} className="border-b border-dotted border-ih-border last:border-b-0 @[22rem]:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
          <Link
            href={`/c/${item.slug}`}
            className="flex min-h-10 items-center py-1 text-[13px] leading-[1.3] text-ih-ink-2 transition-colors hover:text-ih-accent focus-visible:text-ih-accent focus-visible:underline focus-visible:outline-none"
          >
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
