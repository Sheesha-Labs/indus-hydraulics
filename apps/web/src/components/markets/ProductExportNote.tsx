import Link from 'next/link'
import { marketDestinationCount } from '@indus/domain'

/**
 * The export line on a product page. One sentence, one link.
 *
 * WHY THIS IS NOT `MarketReachSection`
 *
 * Every other surface — blog, service cases, industries, categories — closes on
 * a section naming twelve destinations. There are 1,487 active product pages.
 * Twelve links on each is ~17,800 links of identical shape across the thinnest
 * and most template-similar pages on the site, which would make templated
 * link injection the site's dominant internal-link signal. That is the
 * doorway-page pattern our own competitor teardown identifies, at the scale
 * where it actually bites. So the highest-intent page in the funnel gets the
 * message and one link into the hub, and the hub distributes.
 *
 * WHY IT IS NOT GEO-PERSONALISED, HAVING BEEN DESIGNED THAT WAY FIRST
 *
 * Naming the visitor's own country here would be a good conversion device, and
 * `hero-geo.ts` already has the wording for all 126. Two things killed it.
 * Reading `x-vercel-ip-country` needs `headers()`, which opts the route out of
 * static rendering — and this route has `generateStaticParams` over the whole
 * catalogue, so the cost is 1,487 pages going dynamic for one clause. And per
 * the note in `hero-geo.ts`, crawlers resolve to US addresses and would never
 * see the variant anyway: the SEO value of this line is the link to `/markets`
 * and nothing else. A static line delivers that at no rendering cost.
 *
 * The count comes from `marketDestinationCount()` rather than being typed, so
 * market 127 updates 1,487 pages without an edit here.
 */
export default function ProductExportNote() {
  return (
    <p className="text-ih-muted text-[13.5px] leading-[1.55]">
      Shipped worldwide from our Dubai warehouse.{' '}
      <Link href="/markets" className="text-ih-accent font-medium hover:underline">
        Transit, routes and documentation for {marketDestinationCount()} destinations
        <span aria-hidden="true"> →</span>
      </Link>
    </p>
  )
}
