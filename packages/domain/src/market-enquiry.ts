import {
  MARKET_INCOTERM_OPTIONS,
  MARKET_URGENCY_OPTIONS,
  type MarketUrgencyOption,
} from './market-pages'

/**
 * Turning a market-page enquiry into the fields an RFQ actually stores.
 *
 * Pure, and separate from the server action, because this is where the
 * commercially load-bearing decisions live: which enquiries jump the queue,
 * what the desk sees before opening the record, and which select values are
 * trusted at all. None of that is testable through a form submission without
 * writing a real RFQ to a real database.
 */

/**
 * "Needed by" → the RFQ urgency enum, which drives the admin queue's sort and
 * the internal alert's subject line.
 *
 * NOTHING MAPS TO `plant_down`. That state escalates to a 24/7 phone rotation,
 * and a buyer four weeks of sea freight away is by definition not in that
 * situation — the closing band gives them the number instead. An export form
 * that could raise a plant-down alert would teach the desk to distrust the
 * flag, which costs far more than it saves.
 */
const URGENCY_BY_NEEDED_BY: Record<MarketUrgencyOption, 'routine' | 'priority'> = {
  'From stock — urgent': 'priority',
  'Within a week': 'priority',
  'Planned shutdown': 'routine',
  'Budgetary only': 'routine',
}

/**
 * Which surface an enquiry came from. Three, and they are measured separately
 * on purpose: the mid-page quote form catches a reader who has just read the
 * catalogue, the closing card catches one who scrolled the market page
 * undecided, and the index form catches someone whose destination we do not
 * list at all. A shift in the ratio between them says something about the
 * pages; one merged number says nothing.
 */
export type MarketEnquirySource =
  | 'market_quote_form'
  | 'market_quick_enquiry'
  | 'markets_index_enquiry'

export function enquiryUrgency(neededBy: string | null): 'routine' | 'priority' {
  if (!neededBy) return 'routine'
  return URGENCY_BY_NEEDED_BY[neededBy as MarketUrgencyOption] ?? 'routine'
}

/**
 * Accept an Incoterm only if it is one we offered.
 *
 * A `<select>` is trivially edited in the browser and this value lands in a
 * column the desk quotes against, so it is an allow-list rather than a
 * sanitise. Anything unrecognised becomes null — "advise us" — which is the
 * safe reading of an enquiry whose Incoterm we cannot trust.
 */
export function normaliseIncoterm(value: string | null | undefined): string | null {
  if (!value) return null
  return (MARKET_INCOTERM_OPTIONS as readonly string[]).includes(value) ? value : null
}

/** Same allow-list treatment for "needed by", which sets the queue priority. */
export function normaliseNeededBy(value: string | null | undefined): string | null {
  if (!value) return null
  return (MARKET_URGENCY_OPTIONS as readonly string[]).includes(value) ? value : null
}

/**
 * Split one "contact name" field into the two columns the schema has.
 *
 * One input rather than two because a market page is a cold surface and every
 * extra field costs completions. A single word becomes the first name with an
 * empty surname — correct for a mononym, and honest rather than guessing.
 */
export function splitContactName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0]!, lastName: '' }
  return { firstName: parts[0]!, lastName: parts.slice(1).join(' ') }
}

export type ApplicationContextInput = {
  marketName: string
  /**
   * Absent for an index enquiry. That form's destination field is FREE TEXT
   * and is deliberately never matched against the registry — its whole purpose
   * is the destinations that are not on the list — so there is no ISO code to
   * record and inventing one would make the field look validated when it is
   * not. `marketName` carries whatever the buyer typed.
   */
  countryCode?: string | null
  deliveryCity?: string | null
  neededBy?: string | null
  wantsChecklist?: boolean
  source: MarketEnquirySource
}

const SOURCE_LABELS: Record<MarketEnquirySource, string> = {
  market_quote_form: 'market page — quote form',
  market_quick_enquiry: 'market page — quick enquiry',
  markets_index_enquiry: 'markets index — destination enquiry',
}

/**
 * The summary the desk reads before opening the record.
 *
 * These facts go here AND into their own columns where columns exist —
 * `incoterm`, `currency`, `urgency`. The duplication is deliberate: the
 * columns are what you filter and report on, this is what you read in the
 * alert email without clicking through.
 */
export function buildApplicationContext(input: ApplicationContextInput): string {
  return [
    `Export market: ${input.marketName}${input.countryCode ? ` (${input.countryCode})` : ''}`,
    // An index enquiry names a destination we may not ship to yet. Saying so
    // in the first two lines is what stops the desk quoting a lane before
    // anyone has checked there is one.
    input.countryCode ? null : 'Destination typed by the buyer — not a listed market. Confirm the lane before quoting.',
    input.deliveryCity ? `Delivery city: ${input.deliveryCity}` : null,
    input.neededBy ? `Needed by: ${input.neededBy}` : null,
    input.wantsChecklist ? `Wants the ${input.marketName} conformity checklist` : null,
    `Source: ${SOURCE_LABELS[input.source]}`,
  ]
    .filter((line): line is string => line !== null)
    .join('\n')
}

/** Subject line on the RFQ, the confirmation and the internal alert. */
export function marketEnquirySubject(marketName: string): string {
  return `Export enquiry — ${marketName}`
}
