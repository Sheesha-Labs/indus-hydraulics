/**
 * Comparing supplier offers, and pricing our own quote from the winner.
 *
 * Two halves that must not be confused:
 *
 *   LANDED COST — what one unit actually costs us, in AED, once currency,
 *   Incoterm gap, duty and minimum-order waste are all accounted for. This is
 *   the only basis on which two offers can be compared.
 *
 *   MARKUP — what we add on top. Kept strictly separate because "markup" and
 *   "margin" are different numbers and conflating them silently eats profit:
 *   a 30% markup on cost is a 23% margin, not a 30% one.
 *
 * Nothing here invents a freight figure. Where an Incoterm gap has no cost
 * supplied, the landed cost is null and the offer is flagged incomparable
 * rather than ranked on a number nobody supplied.
 */

/** Order matters: later terms include more of the cost of getting it here. */
export const INCOTERMS = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'] as const
export type Incoterm = (typeof INCOTERMS)[number]

/** Terms at or beyond this point already include main-carriage freight. */
const FREIGHT_INCLUDED_FROM = INCOTERMS.indexOf('CFR')
/** DDP is the only term that already includes duty. */
const DUTY_INCLUDED_FROM = INCOTERMS.indexOf('DDP')

export type SupplierOfferLine = {
  supplierName: string
  /** Null when the supplier declined or omitted this line. */
  unitPrice: number | null
  currency: string
  incoterm: Incoterm | null
  /** Minimum the supplier will sell. */
  moq: number | null
  leadTimeDays: number | null
  /** Quantity the customer actually asked for. */
  requestedQty: number
}

export type LandedCostInput = {
  offer: SupplierOfferLine
  /** Units of AED per 1 unit of the offer currency. 1 for AED itself. */
  fxToAed: number | null
  /** When the rate was taken. A stale rate on a 30-day quote quietly eats margin. */
  fxAsOf: Date | null
  /** Estimated inbound freight per unit in AED. Required when the Incoterm excludes it. */
  freightPerUnitAed: number | null
  /** Import duty as a percentage of goods value. Required unless the term is DDP. */
  dutyPct: number | null
  /** Rates older than this are refused rather than used. */
  maxFxAgeDays?: number
  now?: Date
}

export type LandedCostFlag =
  | 'no_price'
  | 'fx_missing'
  | 'fx_stale'
  | 'incoterm_unknown'
  | 'freight_unknown'
  | 'duty_unknown'
  | 'moq_exceeds_requirement'

export type LandedCost = {
  /** Per unit, in AED, across the quantity actually required. Null when incomparable. */
  perUnitAed: number | null
  /** Total for the requested quantity. */
  totalAed: number | null
  /** Units we must buy — MOQ when it exceeds what we need. */
  purchaseQty: number
  flags: LandedCostFlag[]
  breakdown: {
    goodsAed: number | null
    freightAed: number | null
    dutyAed: number | null
    /** Cost of units bought beyond requirement, spread over the ones we need. */
    moqWasteAed: number | null
  }
}

const DAY_MS = 86_400_000

/**
 * Normalise one offer to a landed cost per unit in AED.
 *
 * Returns `perUnitAed: null` with flags rather than a partial number whenever
 * an input is missing. A comparison that silently treats an unknown freight
 * cost as zero ranks the wrong supplier first.
 */
export function computeLandedCost(input: LandedCostInput): LandedCost {
  const { offer } = input
  const flags: LandedCostFlag[] = []
  const empty = { goodsAed: null, freightAed: null, dutyAed: null, moqWasteAed: null }

  if (offer.unitPrice == null) {
    return { perUnitAed: null, totalAed: null, purchaseQty: 0, flags: ['no_price'], breakdown: empty }
  }

  // We must buy at least the MOQ, but the customer only needs requestedQty.
  const purchaseQty = Math.max(offer.requestedQty, offer.moq ?? 0)
  if (offer.moq != null && offer.moq > offer.requestedQty) flags.push('moq_exceeds_requirement')

  const fx = offer.currency.toUpperCase() === 'AED' ? 1 : input.fxToAed
  if (fx == null || !Number.isFinite(fx) || fx <= 0) {
    flags.push('fx_missing')
  } else if (offer.currency.toUpperCase() !== 'AED') {
    const asOf = input.fxAsOf
    const maxAge = input.maxFxAgeDays ?? 7
    const now = input.now ?? new Date()
    if (!asOf || (now.getTime() - asOf.getTime()) / DAY_MS > maxAge) flags.push('fx_stale')
  }

  if (!offer.incoterm) flags.push('incoterm_unknown')

  const termIndex = offer.incoterm ? INCOTERMS.indexOf(offer.incoterm) : -1
  const freightIncluded = termIndex >= FREIGHT_INCLUDED_FROM && termIndex !== -1
  const dutyIncluded = termIndex >= DUTY_INCLUDED_FROM && termIndex !== -1

  if (!freightIncluded && input.freightPerUnitAed == null) flags.push('freight_unknown')
  if (!dutyIncluded && input.dutyPct == null) flags.push('duty_unknown')

  const blocking = flags.some((f) =>
    f === 'fx_missing' || f === 'fx_stale' || f === 'freight_unknown' || f === 'duty_unknown' || f === 'incoterm_unknown',
  )
  if (blocking || fx == null) {
    return { perUnitAed: null, totalAed: null, purchaseQty, flags, breakdown: empty }
  }

  // Goods: we pay for every unit we must buy, not just the ones we need.
  const goodsAed = offer.unitPrice * fx * purchaseQty
  const freightAed = freightIncluded ? 0 : (input.freightPerUnitAed ?? 0) * purchaseQty
  const dutyAed = dutyIncluded ? 0 : goodsAed * ((input.dutyPct ?? 0) / 100)

  const totalPurchaseAed = goodsAed + freightAed + dutyAed
  // Spread the whole purchase over the units the customer actually wants.
  const perUnitAed = totalPurchaseAed / offer.requestedQty
  const totalAed = perUnitAed * offer.requestedQty

  const moqWasteAed =
    purchaseQty > offer.requestedQty
      ? (totalPurchaseAed / purchaseQty) * (purchaseQty - offer.requestedQty)
      : 0

  return {
    perUnitAed: round2(perUnitAed),
    totalAed: round2(totalAed),
    purchaseQty,
    flags,
    breakdown: {
      goodsAed: round2(goodsAed),
      freightAed: round2(freightAed),
      dutyAed: round2(dutyAed),
      moqWasteAed: round2(moqWasteAed),
    },
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export type RankedOffer = {
  offer: SupplierOfferLine
  landed: LandedCost
  score: number
  /** Set when the offer cannot be ranked at all. */
  incomparable: boolean
}

/**
 * Rank offers for one line.
 *
 * Price dominates, but lead time is not free: against a 1.2-day response
 * window and a customer deadline, an offer that lands two weeks late can be
 * worth less than one 15% dearer. `leadTimeWeight` is how much a day is worth
 * relative to a dirham, and the caller sets it per enquiry.
 *
 * Incomparable offers sort last and keep their flags — they are shown to the
 * human as "needs a freight number", not hidden.
 */
export function rankOffers(
  offers: Array<{ offer: SupplierOfferLine; landed: LandedCost }>,
  opts: { leadTimeWeightAedPerDay?: number } = {},
): RankedOffer[] {
  const perDay = opts.leadTimeWeightAedPerDay ?? 0

  const scored = offers.map(({ offer, landed }) => {
    const incomparable = landed.perUnitAed == null
    const base = landed.perUnitAed ?? Number.POSITIVE_INFINITY
    const leadPenalty = perDay > 0 && offer.leadTimeDays != null ? offer.leadTimeDays * perDay : 0
    return { offer, landed, score: incomparable ? Number.POSITIVE_INFINITY : base + leadPenalty, incomparable }
  })

  return scored.sort((a, b) => {
    if (a.incomparable !== b.incomparable) return a.incomparable ? 1 : -1
    if (a.score !== b.score) return a.score - b.score
    return a.offer.supplierName.localeCompare(b.offer.supplierName)
  })
}

/**
 * How much of an enquiry a supplier can actually cover.
 *
 * A supplier quoting 5 of 5 lines at a slightly higher price is often worth
 * more than the cheapest on 2 of 5 — one purchase order, one shipment, one
 * relationship. Surfaced as a number rather than folded into the score, so the
 * human makes that call.
 */
export function basketCoverage(
  supplierName: string,
  allLines: Array<{ offers: SupplierOfferLine[] }>,
): { quoted: number; total: number; pct: number } {
  const total = allLines.length
  const quoted = allLines.filter((line) =>
    line.offers.some((o) => o.supplierName === supplierName && o.unitPrice != null),
  ).length
  return { quoted, total, pct: total === 0 ? 0 : Math.round((quoted / total) * 100) }
}

// ─────────────────────────────────────────────────────────────────────────────
// Markup
// ─────────────────────────────────────────────────────────────────────────────

export type MarkupMode = 'percentage' | 'absolute' | 'target_margin'

export type MarkupRule = {
  mode: MarkupMode
  /** Percent for 'percentage' and 'target_margin'; AED for 'absolute'. */
  value: number
}

export type PricedLine = {
  landedPerUnitAed: number
  sellPerUnitAed: number
  /** Markup as a percentage OF COST. */
  markupPct: number
  /** Margin as a percentage OF SELL PRICE. Never equal to markupPct. */
  marginPct: number
  profitPerUnitAed: number
}

/**
 * Apply a markup rule to a landed cost.
 *
 * The three modes are genuinely different arithmetic, and the difference is
 * where money quietly leaks:
 *
 *   percentage     sell = cost x (1 + p)      30% markup on 100 -> 130
 *   absolute       sell = cost + a            +30 on 100        -> 130
 *   target_margin  sell = cost / (1 - m)      30% MARGIN on 100 -> 142.86
 *
 * A 30% markup yields a 23.08% margin. Asking for "30%" and getting the wrong
 * one of these costs about 9 points of margin on every line.
 */
export function applyMarkup(landedPerUnitAed: number, rule: MarkupRule): PricedLine {
  if (!Number.isFinite(landedPerUnitAed) || landedPerUnitAed < 0) {
    throw new Error('landed cost must be a non-negative finite number')
  }

  let sell: number
  switch (rule.mode) {
    case 'percentage':
      sell = landedPerUnitAed * (1 + rule.value / 100)
      break
    case 'absolute':
      sell = landedPerUnitAed + rule.value
      break
    case 'target_margin': {
      if (rule.value >= 100) {
        throw new Error('a target margin of 100% or more implies an infinite price')
      }
      sell = landedPerUnitAed / (1 - rule.value / 100)
      break
    }
  }

  sell = round2(sell)
  const profit = round2(sell - landedPerUnitAed)

  return {
    landedPerUnitAed: round2(landedPerUnitAed),
    sellPerUnitAed: sell,
    markupPct: landedPerUnitAed === 0 ? 0 : round2((profit / landedPerUnitAed) * 100),
    marginPct: sell === 0 ? 0 : round2((profit / sell) * 100),
    profitPerUnitAed: profit,
  }
}

/**
 * Resolve which markup rule applies, most specific first.
 *
 * line override > per-quote > category rule > global default.
 */
export function resolveMarkupRule(rules: {
  line?: MarkupRule | null
  quote?: MarkupRule | null
  category?: MarkupRule | null
  fallback: MarkupRule
}): MarkupRule {
  return rules.line ?? rules.quote ?? rules.category ?? rules.fallback
}
