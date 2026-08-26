'use client'

import { useSearchParams } from 'next/navigation'
import ServicesCaseList, { type ServicesCaseListProps } from './ServicesCaseList'
import { parseCategory, parseSort } from '../../lib/service-case-params'

/**
 * Applies `?category=` and `?sort=` in the browser.
 *
 * The server used to read those from `searchParams`, which made /services
 * dynamic — it rendered per request for every visitor and every crawler and
 * the CDN never held a copy, at ~47 KB of origin transfer each time. There are
 * twenty published cases and the page already shipped all of them, so the
 * filtering never needed the server.
 *
 * Must stay wrapped in a `<Suspense>` whose fallback renders the same list
 * with the defaults: `useSearchParams` forces a client-side bailout during
 * prerender, and the fallback is what ends up in the static HTML. An empty one
 * would mean shipping a /services page with no cases in it for crawlers.
 */
export default function ServicesCaseBrowser(props: ServicesCaseListProps) {
  const searchParams = useSearchParams()
  return (
    <ServicesCaseList
      {...props}
      category={parseCategory(searchParams.get('category') ?? undefined)}
      sort={parseSort(searchParams.get('sort') ?? undefined)}
    />
  )
}
