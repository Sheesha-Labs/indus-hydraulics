import { SETTINGS, type SettingValue } from '../server/settings/registry'

/**
 * Setup 4 · Money defaults (board 82) rules shared by the form (client) and the save action (server).
 * Pure: the registry is Zod only. The values themselves live in settings_entry (C12, C13, C32).
 */

/** The settings Setup 4 edits. fx is shown read-only (its source and times are Settings › Money). */
export const MONEY_KEYS = ['currency', 'vat', 'pricing.defaults'] as const
export type MoneySettingKey = (typeof MONEY_KEYS)[number]
export type MoneySettingValue<K extends MoneySettingKey> = SettingValue<K>

export type CurrencySetting = SettingValue<'currency'>
export type VatSetting = SettingValue<'vat'>
export type PricingDefaults = SettingValue<'pricing.defaults'>
export type FxSetting = SettingValue<'fx'>

/** The quotation currencies board 82 offers (the book currency first). */
export const QUOTATION_CURRENCY_CHOICES = ['AED', 'USD', 'EUR'] as const

/** "AED or USD by default": the default quotation currency is one of these two. */
export const DEFAULT_QUOTATION_CHOICES = ['AED', 'USD'] as const

const FX_SOURCE_NAME: Record<FxSetting['source'], string> = {
  CBUAE: 'Central Bank of the UAE',
}

/** "Central Bank of the UAE · daily 06:00": the source and its first fetch (C32: retries follow). */
export function fxSentence(fx: FxSetting): string {
  return `${FX_SOURCE_NAME[fx.source]} · daily ${fx.fetchTimes[0] ?? '06:00'}`
}

function amount(n: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)
}

function percent(n: number): string {
  return `${amount(n)}%`
}

/** C13: "Round unit prices up to AED 5, and to AED 10 above AED 5,000". */
export function roundingSentence(rule: PricingDefaults['rounding']): string {
  return `Round unit prices up to AED ${amount(rule.stepAed)}, and to AED ${amount(
    rule.above.stepAed
  )} above AED ${amount(rule.above.thresholdAed)}`
}

/** "5% on local supply" and "0% on exports" (exports are zero-rated). */
export function vatRateLabels(vat: VatSetting): { local: string; exports: string } {
  return { local: `${percent(vat.standardRatePct)} on local supply`, exports: '0% on exports' }
}

/** "The Assistant never proposes a line below 5%." (C12 hard minimum, read-only here). */
export function hardMinSentence(pricing: PricingDefaults): string {
  return `The Assistant never proposes a line below ${percent(pricing.hardMinPct)}.`
}

/**
 * Field errors for one Setup 4 value, keyed by the field's path (`floorPct`, `quotation`,
 * `localWording` …), from the same schema the server applies: floor ≤ margin, hard minimum ≤ floor,
 * the default currency among the quotation currencies, wordings not empty.
 */
export function moneyFieldErrors<K extends MoneySettingKey>(
  key: K,
  value: MoneySettingValue<K>
): Record<string, string> {
  const parsed = SETTINGS[key].schema.safeParse(value)
  if (parsed.success) return {}
  const out: Record<string, string> = {}
  for (const issue of parsed.error.issues) {
    const path = issue.path.map(String).join('.') || 'value'
    if (!(path in out)) out[path] = issue.message
  }
  return out
}

/** A percentage typed into a field: a number, or NaN when it is not one (the schema refuses it). */
export function parsePercent(raw: string): number {
  const t = raw.trim().replace(/%$/, '').trim()
  return t === '' ? Number.NaN : Number(t)
}
