/**
 * Resolve contact addresses for a supplier by fetching its OWN website.
 *
 * Own domain only. Directories, marketplaces and LinkedIn are never touched:
 * all of them prohibit scraping in their terms, all sit behind bot management
 * that blocks datacentre IPs, and beating that requires residential proxies —
 * a deliberate violation rather than an oversight. Where this returns nothing,
 * the admin screen offers manual entry instead.
 *
 * robots.txt is honoured through the shared scraper context, which also carries
 * the identifying user agent and the throttle. A supplier that disallows us
 * gets skipped, not worked around.
 */

import { CONTACT_PATHS, extractContacts, type ExtractedContact } from '@indus/domain'

import { createScraperContext, RobotsDisallowedError } from './scraper/fetch'

/** Stop after this many pages per supplier — most sites answer on the first. */
const MAX_PAGES = 4

/** Give up on a supplier quickly; a slow site must not stall the whole run. */
const PER_SUPPLIER_TIMEOUT_MS = 20_000

export type ContactResolution = {
  contacts: ExtractedContact[]
  pagesFetched: number
  /** Set when we stopped for a reason worth showing a human. */
  skippedReason: 'no_website' | 'robots_disallowed' | 'unreachable' | 'timeout' | null
}

/**
 * Try the supplier's homepage and its likely contact pages.
 *
 * Returns whatever it found — an empty list is a normal outcome, not an error.
 * Contact coverage on this supplier population is genuinely partial: expect
 * roughly 60-80% on German and Italian manufacturers, where an Impressum is
 * legally required, and 20-40% on Chinese and Turkish ones.
 */
export async function resolveSupplierContacts(input: {
  website: string | null
  domain: string | null
  fetchImpl?: typeof fetch
}): Promise<ContactResolution> {
  if (!input.website && !input.domain) {
    return { contacts: [], pagesFetched: 0, skippedReason: 'no_website' }
  }

  const base = input.website ?? `https://${input.domain}`
  let origin: string
  let hostname: string
  try {
    const url = new URL(base.startsWith('http') ? base : `https://${base}`)
    origin = url.origin
    hostname = url.hostname
  } catch {
    return { contacts: [], pagesFetched: 0, skippedReason: 'no_website' }
  }

  const ctx = createScraperContext({
    hostname,
    // Gentle: one request a second against a stranger's site.
    requestsPerSecond: 1,
    ...(input.fetchImpl ? { fetchImpl: input.fetchImpl } : {}),
  })

  const found = new Map<string, ExtractedContact>()
  let pagesFetched = 0
  let skippedReason: ContactResolution['skippedReason'] = null

  const deadline = Date.now() + PER_SUPPLIER_TIMEOUT_MS
  const paths: string[] = ['/', ...CONTACT_PATHS]

  for (const path of paths) {
    if (pagesFetched >= MAX_PAGES) break
    if (Date.now() > deadline) {
      skippedReason = skippedReason ?? 'timeout'
      break
    }

    const pageUrl = `${origin}${path}`
    let page: { status: number; html: string; finalUrl: string }
    try {
      page = await ctx.fetchHtml(pageUrl)
      pagesFetched += 1
    } catch (error) {
      if (error instanceof RobotsDisallowedError) {
        // Disallowed applies to the whole host — stop, do not try other paths.
        return { contacts: [], pagesFetched, skippedReason: 'robots_disallowed' }
      }
      // A 404 on /kontakt is expected and uninteresting; keep going.
      continue
    }

    // A 404 body is boilerplate; extracting from it yields the site's generic
    // webmaster address at best and noise at worst.
    if (page.status >= 400) continue

    // finalUrl, not pageUrl: after a redirect the evidence must name the page
    // actually read, since that URL is what a bounce is audited against later.
    for (const contact of extractContacts({
      html: page.html,
      pageUrl: page.finalUrl || pageUrl,
      ownDomain: input.domain ?? hostname,
    })) {
      const existing = found.get(contact.email)
      if (!existing || (contact.confidence === 'high' && existing.confidence !== 'high')) {
        found.set(contact.email, contact)
      }
    }

    // A high-confidence own-domain address is enough; stop burning requests.
    if ([...found.values()].some((c) => c.onOwnDomain && c.confidence === 'high')) break
  }

  const contacts = [...found.values()]
  if (contacts.length === 0 && pagesFetched === 0 && !skippedReason) {
    skippedReason = 'unreachable'
  }

  return { contacts, pagesFetched, skippedReason }
}
