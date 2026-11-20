'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import { useFieldWiring } from '@indus/ui'
import { DIAL_COUNTRIES } from '@indus/domain'
import CountryPicker from './CountryPicker'
import { FALLBACK_COUNTRY, GCC_ORDER, composePhone, defaultPhoneCountry, orderCountries, readGeoCountry } from '../../lib/phone'

type Props = {
  /** Name of the hidden field the form submits: "+971 52 123 4567". */
  name?: string
  /** Explicit id for the number input; otherwise inherited from an enclosing @indus/ui Field. */
  id?: string
  /** The page's own country (a market page). Wins over the visitor's geo country. */
  defaultCountry?: string | null
  /** 'md' 36px (h-11 on phones), 'lg' 40px — match the inputs beside it. */
  size?: 'md' | 'lg'
  placeholder?: string
  invalid?: boolean
  describedBy?: string
  disabled?: boolean
}

/**
 * Phone / WhatsApp field for the enquiry forms: the shared flag + country
 * picker, then the national number.
 *
 * The form submits ONE value under `name` — the dial code and the number
 * composed into "+971 52 123 4567" (`composePhone`) — plus `phoneCountry`
 * with the ISO code, so the server actions keep their single `phone` field.
 *
 * The default flag is the page's country, else the visitor's country from the
 * proxy's geo cookie, else the UAE, until the visitor picks one themselves.
 */

/** The cookie does not change while the page is open, so nothing to subscribe to. */
const subscribeNever = () => () => {}
const serverGeo = () => null

export default function PhoneInput({
  name = 'phone',
  id,
  defaultCountry,
  size = 'md',
  placeholder,
  invalid,
  describedBy,
  disabled,
}: Props) {
  const wiring = useFieldWiring(id)
  // The geo cookie is unreadable during server render: the server snapshot is
  // null (fallback flag), and React swaps in the browser value after hydration
  // without a mismatch.
  const geo = useSyncExternalStore(subscribeNever, readGeoCountry, serverGeo)
  const top = defaultPhoneCountry(DIAL_COUNTRIES, defaultCountry, geo)
  // The visitor's own pick; until then the field follows the default.
  const [picked, setPicked] = useState<string | null>(null)
  const iso = picked ?? top
  const [national, setNational] = useState('')

  const ordered = useMemo(() => orderCountries(DIAL_COUNTRIES, top), [top])
  const topCount = useMemo(() => {
    const set = new Set<string>([top, ...GCC_ORDER])
    let n = 0
    while (n < ordered.length && set.has(ordered[n]![0])) n++
    return n
  }, [ordered, top])

  const dial = ordered.find((c) => c[0] === iso)?.[1] ?? FALLBACK_COUNTRY[1]
  const isInvalid = invalid ?? !!wiring.error
  const height = size === 'lg' ? 'h-11 sm:h-10' : 'h-11 sm:h-9'

  return (
    <div className="relative">
      <div
        className={`flex ${height} overflow-hidden rounded-lg border bg-ih-surface transition-[border-color,box-shadow] duration-150 focus-within:border-ih-accent focus-within:ring-[3px] focus-within:ring-ih-accent-soft ${
          isInvalid ? 'border-ih-danger' : 'border-ih-border'
        }`}
      >
        <CountryPicker
          countries={ordered}
          topCount={topCount}
          value={iso}
          disabled={disabled}
          onChange={setPicked}
        />
        <input
          id={wiring.id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={placeholder ?? 'Mobile number'}
          value={national}
          disabled={disabled}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy ?? wiring.describedBy}
          onChange={(e) => setNational(e.target.value.slice(0, 24))}
          className="min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[14px] tabular-nums text-ih-ink outline-none placeholder:text-ih-muted max-[767px]:text-[16px]"
        />
      </div>
      <input type="hidden" name={name} value={composePhone(dial, national)} />
      <input type="hidden" name="phoneCountry" value={iso} />
    </div>
  )
}
