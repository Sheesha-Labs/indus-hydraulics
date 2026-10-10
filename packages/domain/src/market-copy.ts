import type {
  MarketFactRow,
  MarketFaq,
  MarketFreightMode,
  MarketPage,
  MarketSector,
  MarketSectorSlug,
} from './market-pages'
import { MARKET_SECTOR_OPTIONS } from './page-sections/subpages'
import type { SectionValues } from './page-sections/types'

/**
 * Market copy from Pages & Blocks, laid over the market record.
 *
 * The 126 market records were written into the codebase, so every copy edit
 * on a country page cost a deploy — and a deploy empties every page cache on
 * the site. The copy now lives in each market's `market/<slug>` document; the
 * record stays as the fallback and as the source of everything that is data
 * rather than copy (map geometry, cities and coordinates, currency, dial code,
 * the compliance record).
 *
 * Every override is all-or-nothing per field: a list is used only when it has
 * exactly the count the design needs and every row is complete. A half-edited
 * list in the admin therefore never reaches a live page — the record renders
 * until the editor finishes.
 *
 * Pure: no Prisma, no React. The storefront passes `content.values`.
 */

type Values = (sectionKey: string) => SectionValues

const s = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : null

function rows(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v)
    ? (v.filter((r) => r && typeof r === 'object') as Record<string, unknown>[])
    : []
}

/** Rows mapped through `pick`, or null unless every row is complete and the count fits. */
function complete<T>(
  v: unknown,
  pick: (r: Record<string, unknown>) => T | null,
  count: { exactly?: number; min?: number }
): T[] | null {
  const list = rows(v)
  if (count.exactly !== undefined && list.length !== count.exactly) return null
  if (count.min !== undefined && list.length < count.min) return null
  const out: T[] = []
  for (const r of list) {
    const item = pick(r)
    if (item === null) return null
    out.push(item)
  }
  return out
}

const SECTOR_SLUGS = new Set<string>(MARKET_SECTOR_OPTIONS.map((o) => o.value))

/** Fewer than this many complete FAQs and the record's questions render instead. */
export const MARKET_FAQ_MIN = 6

export type MarketMeta = { title: string | null; description: string | null }

export function applyMarketCopy(page: MarketPage, values: Values): MarketPage {
  const hero = values('hero')
  const freight = values('freight')

  const facts = complete<MarketFactRow>(
    hero.facts,
    (r) => (s(r.label) && s(r.value) ? { label: s(r.label)!, value: s(r.value)! } : null),
    { exactly: 4 }
  )
  const manifest = complete<MarketFactRow>(
    values('manifest').items,
    (r) => (s(r.label) && s(r.value) ? { label: s(r.label)!, value: s(r.value)! } : null),
    { exactly: page.manifest.length }
  )
  const modes = complete<MarketFreightMode>(
    freight.modes,
    (r) =>
      s(r.name) && s(r.transit) && s(r.route) && s(r.useCase)
        ? { name: s(r.name)!, transit: s(r.transit)!, route: s(r.route)!, useCase: s(r.useCase)! }
        : null,
    { exactly: 3 }
  )
  const sectors = complete<MarketSector>(
    values('sectors').items,
    (r) =>
      s(r.slug) && SECTOR_SLUGS.has(s(r.slug)!) && s(r.name) && s(r.description)
        ? { slug: s(r.slug) as MarketSectorSlug, name: s(r.name)!, description: s(r.description)! }
        : null,
    { exactly: 6 }
  )
  // Six distinct industries: each card links to its industry page.
  const sectorsOk = sectors && new Set(sectors.map((x) => x.slug)).size === 6 ? sectors : null
  const faqs = complete<MarketFaq>(
    values('faq').items,
    (r) => (s(r.q) && s(r.a) ? { question: s(r.q)!, answer: s(r.a)! } : null),
    { min: MARKET_FAQ_MIN }
  )

  return {
    ...page,
    lede: s(hero.lede) ?? page.lede,
    facts: (facts as unknown as MarketPage['facts']) ?? page.facts,
    manifest: manifest ?? page.manifest,
    freight: (modes as unknown as MarketPage['freight']) ?? page.freight,
    orderSteps: {
      third: s(freight.order_step_3) ?? page.orderSteps.third,
      fourth: s(freight.order_step_4) ?? page.orderSteps.fourth,
    },
    sectors: (sectorsOk as unknown as MarketPage['sectors']) ?? page.sectors,
    faqs: faqs ?? page.faqs,
  }
}

/** Meta title and description overrides for a market page; null keeps the defaults. */
export function marketMeta(values: Values): MarketMeta {
  const hero = values('hero')
  return { title: s(hero.meta_title), description: s(hero.meta_description) }
}

/**
 * The record's copy as Pages & Blocks values — what the one-off seed writes so
 * every market document starts as an exact copy of the live page.
 */
export function marketCopyValues(page: MarketPage): Record<string, SectionValues> {
  return {
    hero: {
      lede: page.lede,
      facts: page.facts.map((f) => ({ label: f.label, value: f.value })),
    },
    manifest: { items: page.manifest.map((f) => ({ label: f.label, value: f.value })) },
    freight: {
      modes: page.freight.map((m) => ({
        name: m.name,
        transit: m.transit,
        route: m.route,
        useCase: m.useCase,
      })),
      order_step_3: page.orderSteps.third,
      order_step_4: page.orderSteps.fourth,
    },
    sectors: {
      items: page.sectors.map((x) => ({ slug: x.slug, name: x.name, description: x.description })),
    },
    faq: { items: page.faqs.map((f) => ({ q: f.question, a: f.answer })) },
  }
}
