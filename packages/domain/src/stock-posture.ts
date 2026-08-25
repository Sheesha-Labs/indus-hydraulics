/**
 * What the catalogue says about availability, in one place.
 *
 * Until 2026-08-25 every page derived its own answer from two per-product
 * columns — `stockQty`, which is set on exactly one product in 1,486, and
 * `leadTimeDays`. The result was that the whole catalogue advertised a lead
 * time and the `Offer` on every product declared `BackOrder`, which is the
 * opposite of the commercial position: the stock is in Dubai and it moves in
 * days.
 *
 * So the posture is stated ONCE, here, and every surface reads it: the pill on
 * the product page, the delivery row under it, the `Offer.availability` a
 * crawler and an AI shopping agent read, and the availability filter on
 * /search. A claim this size should be one line to change and impossible to
 * disagree with itself.
 *
 * WHAT IT ASSERTS. That a listed product ships from stock in Dubai and reaches
 * a UAE buyer inside three working days. It is a commercial promise, made by
 * the founder on 2026-08-25 on the basis of the inventory actually held. It is
 * not derived from per-product stock records, because there are none —
 * `stockQty` stays the exception that overrides, not the source.
 *
 * WHAT IT DOES NOT DO. It does not touch `leadTimeDays`. Those figures are the
 * real per-product data — 7 days on fittings, 240 on a blowout preventer — and
 * they are what the pages fall back to the moment the posture is lifted or a
 * category is exempted. Overwriting them would throw away the only record of
 * what each item actually takes.
 *
 * EXEMPTING A CATEGORY is one entry in `exemptCategories`. It is matched against
 * every category in a product's chain, so naming a root exempts the whole
 * branch, and an exempt product falls back to its own `leadTimeDays`. Nothing is
 * exempt today, by the founder's explicit instruction. The candidates, if the
 * claim ever needs narrowing, are the 207 products whose recorded lead time is
 * four weeks or more: `blowout-preventers` (up to 240 days),
 * `flow-iron-wellhead-equipment-uae` (168), `oilfield-valve-suppliers-uae`
 * (84) and 69 of the industrial hose lines (112).
 */

export type CatalogueStockPosture = {
  /** Does the catalogue claim ex-stock by default? */
  readonly exStock: boolean
  /** Working days to delivery, as claimed. */
  readonly deliveryDays: number
  /**
   * Category slugs the claim does NOT cover. Matched against every category in
   * a product's chain, so naming a root exempts its whole branch — the caller
   * passes the chain, not just the leaf, or a root listed here would quietly
   * exempt nothing.
   */
  readonly exemptCategories: readonly string[]
}

export const CATALOGUE_STOCK_POSTURE: CatalogueStockPosture = {
  exStock: true,
  deliveryDays: 3,
  exemptCategories: [],
}

/** What a page needs to know about one product to state its availability. */
export type StockFacts = {
  /** `discontinued` overrides the posture — it is a fact about the product. */
  status?: string | null
  /** Counted stock, where a product actually has a count. Beats the posture. */
  stockQty?: number | null
  stockWarehouse?: string | null
  leadTimeDays?: number | null
  /** Every category this product sits under, leaf first. For the exemptions. */
  categorySlugs?: readonly string[]
}

export type AvailabilityKind = 'ex_stock' | 'counted_stock' | 'lead_time' | 'unavailable'

export type ProductAvailability = {
  kind: AvailabilityKind
  /** Pill text. */
  label: string
  /** Sentence for the delivery row. */
  deliveryNote: string
  /** Key into the JSON-LD availability map. */
  schema: 'in_stock' | 'out_of_stock' | 'lead_time'
}

function posturedCovers(facts: StockFacts, posture: CatalogueStockPosture): boolean {
  if (!posture.exStock) return false
  if (posture.exemptCategories.length === 0) return true
  const chain = facts.categorySlugs ?? []
  return !chain.some((slug) => posture.exemptCategories.includes(slug))
}

/**
 * The one answer, for every surface.
 *
 * Order matters: a discontinued product is unavailable whatever the posture
 * says, a counted stock figure is better information than a blanket claim, and
 * only then does the catalogue-wide position apply.
 */
export function productAvailability(
  facts: StockFacts,
  posture: CatalogueStockPosture = CATALOGUE_STOCK_POSTURE,
): ProductAvailability {
  if (facts.status === 'discontinued') {
    return {
      kind: 'unavailable',
      label: 'Discontinued',
      deliveryNote: 'Discontinued — ask us for the current equivalent.',
      schema: 'out_of_stock',
    }
  }

  const qty = facts.stockQty ?? 0
  if (qty > 0) {
    return {
      kind: 'counted_stock',
      label: `In stock · ${qty} unit${qty === 1 ? '' : 's'}${
        facts.stockWarehouse ? ` · ${facts.stockWarehouse}` : ''
      }`,
      deliveryNote: `${qty} unit${qty === 1 ? '' : 's'} on the shelf${
        facts.stockWarehouse ? ` at ${facts.stockWarehouse}` : ''
      } — dispatched the same working day.`,
      schema: 'in_stock',
    }
  }

  if (posturedCovers(facts, posture)) {
    const days = posture.deliveryDays
    return {
      kind: 'ex_stock',
      label: `Ex-stock · delivery in ${days} days`,
      deliveryNote: `Ex-stock from Dubai — delivered within ${days} working days in the UAE. Export orders ship on the lane stated for the destination.`,
      schema: 'in_stock',
    }
  }

  const lead = facts.leadTimeDays
  if (typeof lead === 'number' && lead > 0) {
    return {
      kind: 'lead_time',
      label: `Lead time · ${lead} day${lead === 1 ? '' : 's'}`,
      deliveryNote: `Typically dispatched within ${lead} working day${lead === 1 ? '' : 's'}.`,
      schema: 'lead_time',
    }
  }

  return {
    kind: 'unavailable',
    label: 'Contact for availability',
    deliveryNote: 'Contact us for current lead time.',
    schema: 'lead_time',
  }
}
