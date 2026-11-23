'use client'

import { Button, Segmented } from '@indus/ops-ui/controls'
import { Note } from '@indus/ops-ui/card'
import { cn } from '@indus/ops-ui/lib/cn'
import { SignoffTag } from '@indus/ops-ui/status'
import { useCallback, useId, useState, type ReactNode } from 'react'
import { saveMoneySettingAction } from '../../actions/setup'
import type { MoneyStepData } from '../../data/setup'
import {
  DEFAULT_QUOTATION_CHOICES,
  QUOTATION_CURRENCY_CHOICES,
  fxSentence,
  hardMinSentence,
  moneyFieldErrors,
  parsePercent,
  roundingSentence,
  vatRateLabels,
  type CurrencySetting,
  type PricingDefaults,
  type VatSetting,
} from '../../lib/money-defaults'
import { useSettingAutosave } from './useSettingAutosave'

/**
 * Setup 4 · Money defaults (board 82), the client half. Each editable setting autosaves on its own
 * (800 ms, version-checked, Setup 1's pattern): quotation currencies and the default (`currency`), the two
 * printed VAT wordings (`vat`), default margin and floor (`pricing.defaults`). Book currency, the FX
 * source, the VAT rates, the hard minimum and the rounding rule are shown read-only; they change in
 * Settings › Money. Every value still awaiting the Owner's sign-off carries the SignoffTag (ADR-28).
 *
 * (decision, C4) The board's "Next quotation number" is a read-only note: INDUS/Q stays unseeded until
 * cutover, so nothing here can set it.
 */

export interface MoneyFormProps {
  data: MoneyStepData
}

const BOX =
  'border-io-line bg-io-card text-io-ink rounded-io-ctl h-io-btn-lg inline-flex items-center self-start border px-3 text-[13px] whitespace-nowrap'

const INPUT =
  'io-focus-field border-io-line bg-io-card text-io-ink rounded-io-ctl h-io-btn-lg min-w-0 border px-3 text-[13px] outline-none aria-invalid:border-io-bad-solid'

const PILL =
  'border-io-stroke rounded-io-pill bg-io-card io-focus h-io-btn-sm inline-flex cursor-pointer items-center border px-3 text-[12.5px] whitespace-nowrap data-[state=off]:hover:border-io-stroke-hover data-[state=on]:bg-io-navy data-[state=on]:border-io-navy data-[state=on]:text-white'

function Hint({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <span id={id} className="text-io-ink-3 text-[12px] leading-[1.4]">
      {children}
    </span>
  )
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <span id={id} className="text-io-bad text-[11.5px]">
      {children}
    </span>
  )
}

/** One board-82 row: the label column (240) and the value column, a line under each row. */
function Row({
  label,
  tag,
  children,
  name,
}: {
  label: string
  tag?: boolean
  children: ReactNode
  name: string
}) {
  return (
    <div
      data-money-row={name}
      className="border-io-line grid grid-cols-[240px_minmax(0,1fr)] items-start gap-4 border-b py-3"
    >
      <div className="flex flex-col items-start gap-1.5 pt-[9px]">
        <span className="text-io-ink text-[13px] font-medium">{label}</span>
        {tag ? <SignoffTag /> : null}
      </div>
      <div className="flex min-w-0 flex-col gap-[5px]">{children}</div>
    </div>
  )
}

function Conflict({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="bg-io-bad-tint text-io-banner-bad-ink rounded-io-card flex items-center gap-3 px-4 py-3 text-[13px]"
    >
      <span className="flex-1">{message} Your last change was not saved.</span>
      <Button size="sm" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  )
}

const saveCurrency = (value: CurrencySetting, expectedVersion: number) =>
  saveMoneySettingAction({ key: 'currency', value, expectedVersion })
const saveVat = (value: VatSetting, expectedVersion: number) =>
  saveMoneySettingAction({ key: 'vat', value, expectedVersion })
const savePricing = (value: PricingDefaults, expectedVersion: number) =>
  saveMoneySettingAction({ key: 'pricing.defaults', value, expectedVersion })

const validCurrency = (v: CurrencySetting) =>
  Object.keys(moneyFieldErrors('currency', v)).length === 0
const validVat = (v: VatSetting) => Object.keys(moneyFieldErrors('vat', v)).length === 0
const validPricing = (v: PricingDefaults) =>
  Object.keys(moneyFieldErrors('pricing.defaults', v)).length === 0

/** The default quotation currency after the list changed: keep it if still listed, else AED, else USD. */
function defaultAfter(list: readonly string[], current: string): string {
  if (list.includes(current)) return current
  return DEFAULT_QUOTATION_CHOICES.find((c) => list.includes(c)) ?? current
}

export default function MoneyForm({ data }: MoneyFormProps) {
  const ids = useId()
  const currency = useSettingAutosave({
    initial: data.currency.value,
    version: data.currency.version,
    save: saveCurrency,
    valid: validCurrency,
  })
  const vat = useSettingAutosave({
    initial: data.vat.value,
    version: data.vat.version,
    save: saveVat,
    valid: validVat,
  })
  const pricing = useSettingAutosave({
    initial: data.pricing.value,
    version: data.pricing.version,
    save: savePricing,
    valid: validPricing,
  })
  // What the person typed in the two percentage fields (the stored value is a number).
  const [marginText, setMarginText] = useState(String(data.pricing.value.marginPct))
  const [floorText, setFloorText] = useState(String(data.pricing.value.floorPct))

  const currencyErrors = moneyFieldErrors('currency', currency.value)
  const vatErrors = moneyFieldErrors('vat', vat.value)
  const pricingErrors = moneyFieldErrors('pricing.defaults', pricing.value)
  const marginError = Number.isFinite(pricing.value.marginPct)
    ? pricingErrors.marginPct
    : 'Use a percentage from 0 to 100.'
  const floorError = Number.isFinite(pricing.value.floorPct)
    ? pricingErrors.floorPct
    : 'Use a percentage from 0 to 100.'

  const toggleCurrency = useCallback(
    (code: string) => {
      const v = currency.value
      const on = v.quotation.includes(code)
      const quotation = on
        ? v.quotation.filter((c) => c !== code)
        : QUOTATION_CURRENCY_CHOICES.filter((c) => c === code || v.quotation.includes(c))
      currency.set({
        ...v,
        quotation,
        defaultQuotation: defaultAfter(quotation, v.defaultQuotation),
      })
    },
    [currency]
  )

  const conflict = currency.conflict ?? vat.conflict ?? pricing.conflict
  const rates = vatRateLabels(vat.value)
  const defaultChoices = DEFAULT_QUOTATION_CHOICES.filter((c) =>
    currency.value.quotation.includes(c)
  )

  return (
    <div data-money-form="" className="flex max-w-[900px] flex-col">
      {conflict ? <Conflict message={conflict} /> : null}

      <Row name="book" label="Book currency">
        <span className={BOX}>{currency.value.book}</span>
        <Hint>Profit, reports and the ledger are kept in {currency.value.book}.</Hint>
      </Row>

      <Row name="quotation" label="Quotation currencies">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <fieldset className="m-0 flex gap-1.5 border-0 p-0">
            <legend className="sr-only">Quotation currencies</legend>
            {QUOTATION_CURRENCY_CHOICES.map((code) => {
              const on = currency.value.quotation.includes(code)
              return (
                <button
                  key={code}
                  type="button"
                  aria-pressed={on}
                  data-state={on ? 'on' : 'off'}
                  onClick={() => toggleCurrency(code)}
                  className={PILL}
                >
                  {code}
                </button>
              )
            })}
          </fieldset>
          {defaultChoices.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-io-ink-3 text-[12px]" aria-hidden="true">
                Default
              </span>
              <Segmented
                size="sm"
                aria-label="Default quotation currency"
                value={currency.value.defaultQuotation}
                options={defaultChoices.map((c) => ({ value: c, label: c }))}
                onValueChange={(c) => currency.set({ ...currency.value, defaultQuotation: c })}
              />
            </div>
          ) : null}
        </div>
        {currencyErrors.quotation || currencyErrors.defaultQuotation ? (
          <FieldError id={`${ids}-qc-err`}>
            {currencyErrors.quotation ?? currencyErrors.defaultQuotation}
          </FieldError>
        ) : null}
        <Hint>Set per client; AED or USD by default.</Hint>
      </Row>

      <Row name="fx" label="Exchange rates" tag={data.fx.awaiting}>
        <span className={BOX}>{fxSentence(data.fx.value)}</span>
        <Hint>A rate locks on each supplier quote when it is captured.</Hint>
      </Row>

      <Row name="vat" label="VAT" tag={data.vat.awaiting}>
        <div className="flex gap-2">
          <span className={BOX}>{rates.local}</span>
          <span className={BOX}>{rates.exports}</span>
        </div>
        <div className="mt-1 grid max-w-[640px] grid-cols-2 gap-2">
          {(
            [
              ['localWording', 'Printed on local supply'],
              ['exportWording', 'Printed on exports'],
            ] as const
          ).map(([field, label]) => {
            const id = `${ids}-${field}`
            const error = vatErrors[field]
            return (
              <div key={field} className="flex min-w-0 flex-col gap-1">
                <label htmlFor={id} className="text-io-ink-2 text-[12px] font-medium">
                  {label}
                </label>
                <input
                  id={id}
                  value={vat.value[field]}
                  maxLength={200}
                  onChange={(e) => vat.set({ ...vat.value, [field]: e.target.value })}
                  {...(error ? { 'aria-invalid': true, 'aria-describedby': `${id}-err` } : {})}
                  className={cn(INPUT, 'w-full')}
                />
                {error ? <FieldError id={`${id}-err`}>{error}</FieldError> : null}
              </div>
            )
          })}
        </div>
        <Hint>Printed on quotations as written above.</Hint>
      </Row>

      <Row
        name="margin"
        label="Default margin · floor"

        tag={data.pricing.awaiting}
      >
        <div className="flex gap-2">
          {(
            [
              ['marginPct', 'Default margin', marginText, setMarginText, marginError],
              ['floorPct', 'Floor', floorText, setFloorText, floorError],
            ] as const
          ).map(([field, label, text, setText, error]) => {
            const id = `${ids}-${field}`
            return (
              <span key={field} className="relative inline-flex">
                <label htmlFor={id} className="sr-only">
                  {label}
                </label>
                <input
                  id={id}
                  value={text}
                  inputMode="decimal"
                  maxLength={6}
                  onChange={(e) => {
                    setText(e.target.value)
                    pricing.set({ ...pricing.value, [field]: parsePercent(e.target.value) })
                  }}
                  {...(error
                    ? { 'aria-invalid': true, 'aria-describedby': `${ids}-margin-err` }
                    : {})}
                  className={cn(INPUT, 'w-[76px] pr-6 tabular-nums')}
                />
                <span
                  aria-hidden="true"
                  className="text-io-ink-3 pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[13px]"
                >
                  %
                </span>
              </span>
            )
          })}
        </div>
        {marginError || floorError || pricingErrors.hardMinPct ? (
          <FieldError id={`${ids}-margin-err`}>
            {marginError ?? floorError ?? pricingErrors.hardMinPct}
          </FieldError>
        ) : null}
        <Hint>Below the floor the Assistant asks you first.</Hint>
        <Hint>{hardMinSentence(pricing.value)}</Hint>
      </Row>

      <Row name="rounding" label="Rounding" tag={data.pricing.awaiting}>
        <span className={BOX}>{roundingSentence(pricing.value.rounding)}</span>
      </Row>

      <Row name="numbering" label="Next quotation number">
        <Note tone="plain" className="max-w-[640px] text-[12.5px]">
          Set at cutover in Settings › Numbering, from the highest INDUS/Q in Gmail, Zoho Books and
          the old admin. Until then quotations can be drafted and previewed but not approved.
        </Note>
      </Row>

      <p className="text-io-ink-3 pt-3 text-[12px]">
        Zoho Books: connect later in Settings › Integrations.
      </p>
    </div>
  )
}
