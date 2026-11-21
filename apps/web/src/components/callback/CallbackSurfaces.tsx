'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as RadioGroup from '@radix-ui/react-radio-group'
import { buttonVariants } from '@indus/ui'
import { requestCallback } from '../../actions/callback'
import { DIAL_COUNTRIES } from '@indus/domain'
import CountryPicker, { countryPickerOpen } from '../phone/CountryPicker'
import { defaultPhoneCountry } from '../../lib/phone'
import { deskStatus, dubaiNow, parseOpeningHours } from '../../lib/opening-hours'
import { trackCallback } from '../../lib/callback/analytics'
import {
  CALLBACK_CATEGORIES,
  CALLBACK_CONFIG,
  CALLBACK_MESSAGES,
  CALLBACK_STORAGE,
  DEFAULT_CALLBACK_CATEGORY,
  DESCRIPTION_MAX,
  GCC_ORDER,
  cleanPhoneInput,
  displayPhone,
  firstName,
  marketSlugFromPath,
  orderCountries,
  toE164,
  validateCallbackFields,
  whatsappHref,
  type CallbackCategory,
  type CallbackFieldErrors,
  type CallbackSurface,
  type CallbackTrigger,
  type CloseMethod,
} from '../../lib/callback/rules'

/**
 * The call-back prompt's three surfaces (design_handoff_callback_popup):
 *
 *   B · SplitModal  — desktop, inactivity or exit intent. Navy rail + form.
 *   D · CornerCard  — desktop, back from another tab. Non-modal, no scrim.
 *   E · MobileSheet — phones, any trigger. Bottom sheet, swipe to close.
 *
 * Loaded lazily by CallbackPrompt, which owns the triggers and suppression.
 * This file owns the form (one schema for all three), the modal mechanics and
 * the success / failure states. B and E are Radix dialogs — focus trap,
 * Escape, scroll lock with gutter compensation and focus return come from
 * there, as for every other dialog in packages/ui. D is ours: it must never
 * take focus or block the page.
 */

type Props = {
  surface: CallbackSurface
  trigger: CallbackTrigger
  openedAt: number
  openingHours: string[]
  deskPhone: string
  deskEmail: string
  /** Close requested — record suppression and analytics. The exit animation follows. */
  onClose: (method: CloseMethod) => void
  /** A request was accepted — record the 30-day suppression. */
  onSubmitted: () => void
  /** The exit animation has finished; unmount. */
  onClosed: () => void
}

type Status = 'idle' | 'submitting' | 'success' | 'error'
type FieldKey = 'name' | 'email' | 'phone'

const EXIT_MS = { B: 140, D: 160, E: 220 } as const
const ROOT = { 'data-callback-root': '' }

// ── Shared form state ─────────────────────────────────────────────────────

function useCallbackForm(props: Props) {
  const { surface, trigger, openedAt, deskPhone, onSubmitted } = props

  // Default dial code: the market page's country, else the visitor's country
  // (geo cookie set by the proxy), else the UAE.
  const defaultIso = useMemo(
    () =>
      defaultPhoneCountry(
        DIAL_COUNTRIES,
        document.querySelector('[data-callback-market]')?.getAttribute('data-callback-market')
      ),
    []
  )
  const ordered = useMemo(() => orderCountries(DIAL_COUNTRIES, defaultIso), [defaultIso])
  // The leading "suggested" rows — the default and the GCC — before the A–Z list.
  const topCount = useMemo(() => {
    const top = new Set<string>([defaultIso, ...GCC_ORDER])
    let n = 0
    while (n < ordered.length && top.has(ordered[n]![0])) n++
    return n
  }, [ordered, defaultIso])

  const [category, setCategory] = useState<CallbackCategory>(DEFAULT_CALLBACK_CATEGORY)
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [iso, setIso] = useState(ordered[0]?.[0] ?? 'AE')
  const [phone, setPhone] = useState('')
  // The server's verdict on the last submit; cleared as soon as a field changes.
  const [serverErrors, setServerErrors] = useState<CallbackFieldErrors>({})
  const [attempted, setAttempted] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [desk, setDesk] = useState<{ deskOpen: boolean; nextOpen: string | null } | null>(null)

  // Computed once: the page title does not change under an open prompt.
  const [whatsapp] = useState(() => whatsappHref(deskPhone.replace(/\D/g, ''), document.title))

  const dial = ordered.find((c) => c[0] === iso)?.[1] ?? '+971'

  // Live validation once the visitor has tried to submit — derived, not stored.
  const errors: CallbackFieldErrors = attempted
    ? { ...serverErrors, ...validateCallbackFields({ name, email, dial, phone }) }
    : serverErrors

  const selectCategory = useCallback((v: string) => {
    setCategory(v as CallbackCategory)
    trackCallback('callback_chip_select', { category: v })
  }, [])

  /** Focus a field by name inside the submitted form. */
  const focusField = (formEl: HTMLFormElement, key: FieldKey) =>
    formEl.querySelector<HTMLInputElement>(`[name="${key}"]`)?.focus()

  const submit = useCallback(
    async (formEl: HTMLFormElement) => {
      if (status === 'submitting' || status === 'success') return
      setAttempted(true)
      const found = validateCallbackFields({ name, email, dial, phone })
      setServerErrors({})
      const firstBad = (['name', 'email', 'phone'] as FieldKey[]).find((k) => found[k])
      trackCallback('callback_submit_attempt', { surface, valid: !firstBad })
      if (firstBad) {
        focusField(formEl, firstBad)
        return
      }
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setStatus('error')
        trackCallback('callback_submit_error', { surface, status: 'offline' })
        return
      }

      const fd = new FormData()
      const path = window.location.pathname
      fd.set('surface', surface)
      fd.set('trigger', trigger)
      if (surface === 'B') {
        fd.set('category', category)
        fd.set('description', description)
      }
      fd.set('name', name)
      fd.set('email', email.trim().toLowerCase())
      fd.set('phoneCountry', iso)
      fd.set('phone', phone)
      fd.set('pageUrl', `${window.location.origin}${path}`)
      fd.set('pageTitle', document.title)
      fd.set('referrer', document.referrer)
      const market = marketSlugFromPath(path)
      if (market) fd.set('market', market)
      try {
        const utm = JSON.parse(
          window.sessionStorage.getItem(CALLBACK_STORAGE.utm) ?? '{}'
        ) as Record<string, string>
        for (const [k, v] of Object.entries(utm)) fd.set(k, v)
      } catch {
        // No stored campaign; nothing to send.
      }
      const trap = new FormData(formEl).get('website')
      fd.set('website', typeof trap === 'string' ? trap : '')
      fd.set('elapsedMs', String(Date.now() - openedAt))

      setStatus('submitting')
      try {
        const result = await requestCallback(fd)
        if (result.success) {
          setDesk(result.data)
          setStatus('success')
          onSubmitted()
          trackCallback('callback_submit_success', {
            surface,
            trigger,
            category: surface === 'B' ? category : null,
            market,
          })
          return
        }
        if (result.error === 'invalid') {
          setServerErrors(result.fieldErrors)
          setStatus('idle')
          const bad = (['name', 'email', 'phone'] as FieldKey[]).find((k) => result.fieldErrors[k])
          if (bad) focusField(formEl, bad)
          trackCallback('callback_submit_error', { surface, status: 422 })
          return
        }
        setStatus('error')
        trackCallback('callback_submit_error', {
          surface,
          status: result.error === 'rate_limited' ? 429 : 500,
        })
      } catch {
        setStatus('error')
        trackCallback('callback_submit_error', { surface, status: 'network' })
      }
    },
    [
      status,
      name,
      email,
      dial,
      phone,
      iso,
      surface,
      trigger,
      category,
      description,
      openedAt,
      onSubmitted,
    ]
  )

  const phoneE164 = toE164(dial, phone)

  return {
    ordered,
    topCount,
    category,
    selectCategory,
    description,
    setDescription,
    name,
    setName: (v: string) => {
      setServerErrors({})
      setName(v)
    },
    email,
    setEmail: (v: string) => {
      setServerErrors({})
      setEmail(v)
    },
    iso,
    setIso,
    phone,
    setPhone: (v: string) => {
      setServerErrors({})
      setPhone(cleanPhoneInput(v))
    },
    errors,
    status,
    desk,
    submit,
    busy: status === 'submitting',
    phoneRead: phoneE164 ? displayPhone(phoneE164, dial) : phone,
    whatsapp,
    tel: `tel:+${deskPhone.replace(/\D/g, '')}`,
  }
}

type Form = ReturnType<typeof useCallbackForm>

// ── Small parts ───────────────────────────────────────────────────────────

const fieldCls =
  'w-full rounded-md border bg-ih-surface px-[14px] text-[14px] text-ih-ink outline-none ' +
  'transition-[border-color,box-shadow] duration-150 placeholder:text-ih-muted ' +
  'focus:border-ih-accent focus:ring-[3px] focus:ring-ih-accent-soft read-only:bg-ih-surface-2'

function fieldState(invalid: boolean): string {
  return invalid ? 'border-ih-danger ring-[3px] ring-ih-danger-soft' : 'border-ih-border-strong'
}

const labelCls = 'mb-1.5 block text-[12px] font-medium text-ih-ink-2'
const errorCls = 'mt-[5px] text-[11.5px] text-ih-danger-ink'
const linkCls = 'underline underline-offset-[3px] text-ih-accent hover:text-ih-accent-hover'

const outlineBtnCls = buttonVariants({ kind: 'outline', size: 'md' })

function CloseIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin motion-reduce:animate-none"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

/** Visually hidden, unlabelled, skipped by Tab: only a bot fills it. */
function Honeypot() {
  return (
    <input
      type="text"
      name="website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="absolute top-0 -left-[9999px] h-px w-px opacity-0"
    />
  )
}

function PhoneGroup({
  form,
  height,
  id,
  describedBy,
  trailing,
}: {
  form: Form
  height: 'h-11' | 'h-12'
  id: string
  describedBy?: string
  trailing?: ReactNode
}) {
  const invalid = !!form.errors.phone
  // The outer wrapper positions the country list; the inner group clips its
  // own children to the rounded corners but is not positioned, so it does
  // not clip the list.
  return (
    <div className="relative">
      <div
        className={`flex ${height} bg-ih-surface focus-within:border-ih-accent focus-within:ring-ih-accent-soft overflow-hidden rounded-md border transition-[border-color,box-shadow] duration-150 focus-within:ring-[3px] ${fieldState(invalid)}`}
      >
        <CountryPicker
          countries={form.ordered}
          topCount={form.topCount}
          value={form.iso}
          disabled={form.busy}
          onChange={form.setIso}
        />
        <input
          id={id}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="52 123 4567"
          value={form.phone}
          readOnly={form.busy}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(e) => form.setPhone(e.target.value)}
          className="text-ih-ink placeholder:text-ih-muted min-w-0 flex-1 border-0 bg-transparent px-[14px] text-[14px] tabular-nums outline-none max-[767px]:text-[16px]"
        />
        {trailing}
      </div>
    </div>
  )
}

function FailureLine({ form, deskPhone }: { form: Form; deskPhone: string }) {
  if (form.status !== 'error') return null
  return (
    <p role="alert" className="text-ih-danger-ink text-[12.5px] leading-[1.5]">
      That didn&rsquo;t send. Call{' '}
      <a href={form.tel} className="underline underline-offset-[3px]">
        {deskPhone}
      </a>{' '}
      or{' '}
      <a
        href={form.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-[3px]"
      >
        WhatsApp us
      </a>
      .
    </p>
  )
}

function PrimaryButton({
  form,
  label,
  className = '',
}: {
  form: Form
  label: string
  className?: string
}) {
  return (
    <button
      type="submit"
      disabled={form.busy}
      aria-busy={form.busy || undefined}
      className={`${buttonVariants({ kind: 'primary', size: 'lg', block: true })} ${className}`}
    >
      {form.busy ? (
        <>
          <Spinner />
          Sending…
        </>
      ) : (
        label
      )}
    </button>
  )
}

function SuccessPanel({
  form,
  onDone,
  compact = false,
}: {
  form: Form
  onDone: () => void
  compact?: boolean
}) {
  const when = form.desk?.deskOpen
    ? 'within one working hour'
    : form.desk?.nextOpen
      ? `when the desk opens ${form.desk.nextOpen}`
      : 'as soon as the desk opens'
  return (
    <div className={compact ? 'pt-4' : ''}>
      <span
        className="bg-ih-accent-soft text-ih-accent grid h-7 w-7 place-items-center rounded-full"
        aria-hidden="true"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <p className="text-ih-ink mt-3 text-[18px] font-medium">Thanks, {firstName(form.name)}.</p>
      <p className="text-ih-ink-2 mt-1.5 text-[14px] leading-[1.55]">
        An engineer will call <span className="font-mono text-[13.5px]">{form.phoneRead}</span>{' '}
        {when}. We&rsquo;ve sent a copy to {form.email.trim().toLowerCase()}.
      </p>
      <button type="button" onClick={onDone} className={`${outlineBtnCls} mt-5`}>
        Back to the page
      </button>
    </div>
  )
}

// ── Exit animation ────────────────────────────────────────────────────────

function useExit(props: Props) {
  const [closing, setClosing] = useState(false)
  const closingRef = useRef(false)
  // Latest props behind a ref, so `requestClose` is stable for the life of the
  // surface — the corner card's auto-close timer depends on it.
  const latest = useRef(props)
  useEffect(() => {
    latest.current = props
  })
  const requestClose = useCallback((method: CloseMethod) => {
    if (closingRef.current) return
    closingRef.current = true
    const p = latest.current
    p.onClose(method)
    setClosing(true)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => latest.current.onClosed(), reduce ? 100 : EXIT_MS[p.surface])
  }, [])
  return { closing, requestClose }
}

/**
 * Announces success. One per surface and inside it: Radix hides everything
 * outside an open modal from assistive tech, so a region elsewhere would be
 * silenced exactly when it speaks.
 */
function LiveRegion({ form }: { form: Form }) {
  return (
    <p aria-live="polite" className="sr-only">
      {form.status === 'success' ? 'Request sent. We will call you back.' : ''}
    </p>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────

export default function CallbackSurfaces(props: Props) {
  const form = useCallbackForm(props)
  const exit = useExit(props)

  return (
    <>
      {props.surface === 'B' ? <SplitModal {...props} form={form} exit={exit} /> : null}
      {props.surface === 'D' ? <CornerCard {...props} form={form} exit={exit} /> : null}
      {props.surface === 'E' ? <MobileSheet {...props} form={form} exit={exit} /> : null}
    </>
  )
}

type SurfaceProps = Props & { form: Form; exit: ReturnType<typeof useExit> }

// ── B · Split modal ───────────────────────────────────────────────────────

const RAIL_POINTS = [
  'A hydraulic engineer calls within one working hour.',
  'Price, stock and lead time on the same call.',
  'Written quote by email, in AED or USD.',
]

function SplitModal({ form, exit, deskPhone, deskEmail }: SurfaceProps) {
  const ids = {
    chips: useId(),
    desc: useId(),
    name: useId(),
    email: useId(),
    phone: useId(),
    err: useId(),
  }
  const firstChip = useRef<HTMLButtonElement>(null)
  const chipRefs = useRef(new Map<string, HTMLButtonElement>())
  const mailto = `mailto:${deskEmail}?subject=${encodeURIComponent('Enquiry from website')}`

  return (
    <Dialog.Root open modal onOpenChange={(o) => !o && exit.requestClose('x')}>
      <Dialog.Portal>
        <Dialog.Overlay
          {...ROOT}
          className={`bg-ih-scrim fixed inset-0 z-[90] grid place-items-center overflow-y-auto px-6 py-8 ${
            exit.closing
              ? 'animate-[ih-fade-out_140ms_ease-in_forwards]'
              : 'animate-[ih-fade-in_180ms_ease-out]'
          }`}
        >
          <Dialog.Content
            aria-describedby={undefined}
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              ;(chipRefs.current.get(form.category) ?? firstChip.current)?.focus()
            }}
            onEscapeKeyDown={(e) => {
              e.preventDefault()
              // An open country list takes the Escape; the prompt stays.
              if (countryPickerOpen()) return
              exit.requestClose('esc')
            }}
            onPointerDownOutside={(e) => {
              e.preventDefault()
              exit.requestClose('scrim')
            }}
            onInteractOutside={(e) => e.preventDefault()}
            className={`bg-ih-surface relative grid w-[820px] max-w-full grid-cols-[300px_1fr] overflow-hidden rounded-lg shadow-[0_24px_64px_rgba(10,16,30,.28)] outline-none max-[859px]:grid-cols-[260px_1fr] ${
              exit.closing
                ? 'animate-[ih-fade-out_140ms_ease-in_forwards]'
                : 'animate-[ih-cb-rise_220ms_cubic-bezier(.2,.7,.2,1)] motion-reduce:animate-[ih-fade-in_180ms_ease-out]'
            }`}
          >
            <LiveRegion form={form} />
            {/* Navy rail */}
            <div className="bg-ih-navy flex flex-col px-8 py-9">
              <p className="text-ih-on-navy-eyebrow font-mono text-[10.5px] font-medium tracking-[0.13em] uppercase">
                Indus export desk
              </p>
              <Dialog.Title className="mt-3.5 font-serif text-[30px] leading-[1.12] font-normal text-white">
                Before you go — <em>let us find it for you.</em>
              </Dialog.Title>
              <ol className="text-ih-on-navy-body mt-7 flex flex-col gap-3 text-[13px] leading-[1.45]">
                {RAIL_POINTS.map((point, i) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span
                      className="mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-white/12 text-[11px] text-white"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    {point}
                  </li>
                ))}
              </ol>
              <div className="mt-auto border-t border-white/14 pt-[22px]">
                <a
                  href={form.tel}
                  onClick={() =>
                    trackCallback('callback_alt_click', { surface: 'B', channel: 'tel' })
                  }
                  className="block font-mono text-[14px] text-white hover:underline"
                >
                  {deskPhone}
                </a>
                <a
                  href={`mailto:${deskEmail}`}
                  onClick={() =>
                    trackCallback('callback_alt_click', { surface: 'B', channel: 'email' })
                  }
                  className="text-ih-on-navy-body mt-1 block text-[12.5px] hover:text-white hover:underline"
                >
                  {deskEmail}
                </a>
              </div>
            </div>

            {/* Form panel */}
            <div className="relative px-9 pt-9 pb-8">
              <Dialog.Close
                aria-label="Close"
                className="text-ih-muted hover:bg-ih-surface-2 hover:text-ih-ink focus-visible:outline-ih-accent absolute top-[18px] right-[18px] grid h-8 w-8 place-items-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <CloseIcon size={18} />
              </Dialog.Close>

              {form.status === 'success' ? (
                <div className="pt-10">
                  <SuccessPanel form={form} onDone={() => exit.requestClose('done')} />
                </div>
              ) : (
                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault()
                    void form.submit(e.currentTarget)
                  }}
                  className="relative"
                >
                  <Honeypot />
                  <p id={ids.chips} className={labelCls}>
                    What were you looking for?
                  </p>
                  <RadioGroup.Root
                    aria-labelledby={ids.chips}
                    value={form.category}
                    onValueChange={form.selectCategory}
                    disabled={form.busy}
                    loop
                    className="flex flex-wrap gap-2 pr-8"
                  >
                    {CALLBACK_CATEGORIES.map((c, i) => (
                      <RadioGroup.Item
                        key={c.value}
                        value={c.value}
                        ref={(el) => {
                          if (el) chipRefs.current.set(c.value, el)
                          if (i === 0) firstChip.current = el
                        }}
                        className="border-ih-border bg-ih-surface text-ih-ink-2 hover:border-ih-border-strong focus-visible:outline-ih-accent data-[state=checked]:border-ih-accent data-[state=checked]:bg-ih-accent inline-flex h-8 items-center rounded-full border px-3 text-[12.5px] whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 data-[state=checked]:text-white"
                      >
                        {c.label}
                      </RadioGroup.Item>
                    ))}
                  </RadioGroup.Root>

                  <label htmlFor={ids.desc} className={`${labelCls} mt-5`}>
                    Part number or short description{' '}
                    <span className="text-ih-muted font-normal">— optional</span>
                  </label>
                  <input
                    id={ids.desc}
                    name="description"
                    maxLength={DESCRIPTION_MAX}
                    placeholder="e.g. 2SN ½″ × 2 m with JIC ends"
                    value={form.description}
                    readOnly={form.busy}
                    onChange={(e) => form.setDescription(e.target.value)}
                    className={`${fieldCls} ${fieldState(false)} h-11`}
                  />

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={ids.name} className={labelCls}>
                        Name
                      </label>
                      <input
                        id={ids.name}
                        name="name"
                        autoComplete="name"
                        placeholder="Full name"
                        value={form.name}
                        readOnly={form.busy}
                        aria-invalid={!!form.errors.name || undefined}
                        aria-describedby={form.errors.name ? `${ids.err}-name` : undefined}
                        onChange={(e) => form.setName(e.target.value)}
                        className={`${fieldCls} ${fieldState(!!form.errors.name)} h-11`}
                      />
                      {form.errors.name ? (
                        <p id={`${ids.err}-name`} className={errorCls}>
                          {form.errors.name}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label htmlFor={ids.email} className={labelCls}>
                        Email
                      </label>
                      <input
                        id={ids.email}
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="name@company.com"
                        value={form.email}
                        readOnly={form.busy}
                        aria-invalid={!!form.errors.email || undefined}
                        aria-describedby={form.errors.email ? `${ids.err}-email` : undefined}
                        onChange={(e) => form.setEmail(e.target.value)}
                        className={`${fieldCls} ${fieldState(!!form.errors.email)} h-11`}
                      />
                      {form.errors.email ? (
                        <p id={`${ids.err}-email`} className={errorCls}>
                          {form.errors.email}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <label htmlFor={ids.phone} className={`${labelCls} mt-4`}>
                    Phone / WhatsApp
                  </label>
                  <PhoneGroup
                    form={form}
                    height="h-11"
                    id={ids.phone}
                    describedBy={form.errors.phone ? `${ids.err}-phone` : undefined}
                  />
                  {form.errors.phone ? (
                    <p id={`${ids.err}-phone`} className={errorCls}>
                      {form.errors.phone}
                    </p>
                  ) : null}

                  <div className="mt-4">
                    <FailureLine form={form} deskPhone={deskPhone} />
                  </div>
                  <PrimaryButton form={form} label="Call me back" className="mt-4" />
                  <p className="text-ih-muted mt-2.5 text-center text-[12px]">
                    Prefer email?{' '}
                    <a
                      href={mailto}
                      onClick={() =>
                        trackCallback('callback_alt_click', { surface: 'B', channel: 'email' })
                      }
                      className={linkCls}
                    >
                      Write to us
                    </a>
                  </p>
                </form>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ── D · Corner card ───────────────────────────────────────────────────────

function CornerCard({ form, exit, deskPhone, deskEmail, openingHours }: SurfaceProps) {
  const titleId = useId()
  const errId = useId()
  const cardRef = useRef<HTMLDivElement>(null)
  const [deskOpen, nextOpen] = useMemo(() => {
    const s = deskStatus(parseOpeningHours(openingHours), dubaiNow())
    return [s.open, s.nextOpen] as const
  }, [openingHours])
  const anyError = !!(form.errors.name || form.errors.email || form.errors.phone)

  // Sit above any bar docked to the bottom of the viewport (the PDP sticky
  // bar, the compare tray) instead of covering it.
  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        let dock = 0
        for (const el of document.querySelectorAll<HTMLElement>('[data-bottom-dock]')) {
          const r = el.getBoundingClientRect()
          if (r.height > 0 && r.bottom >= window.innerHeight - 1) dock = Math.max(dock, r.height)
        }
        card.style.setProperty('--ih-dock', `${Math.round(dock)}px`)
      })
    }
    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    const obs = new MutationObserver(measure)
    obs.observe(document.body, { childList: true, subtree: false })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
      obs.disconnect()
    }
  }, [])

  // The success state closes itself after a moment — only here, where the
  // card sits over a page the visitor is using.
  const { requestClose } = exit
  useEffect(() => {
    if (form.status !== 'success') return
    const t = window.setTimeout(() => requestClose('done'), CALLBACK_CONFIG.cornerAutoCloseMs)
    return () => window.clearTimeout(t)
  }, [form.status, requestClose])

  return (
    <div
      ref={cardRef}
      {...ROOT}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          exit.requestClose('esc')
        }
      }}
      className={`border-ih-border bg-ih-surface fixed right-7 bottom-[calc(28px+var(--ih-dock,0px))] z-[45] w-[380px] max-w-[calc(100vw-32px)] rounded-lg border px-6 pt-6 pb-[22px] shadow-[0_12px_40px_rgba(10,16,30,.18)] transition-[bottom] duration-200 ${
        exit.closing
          ? 'animate-[ih-fade-out_160ms_ease-in_forwards]'
          : 'animate-[ih-cb-corner_260ms_cubic-bezier(.2,.7,.2,1)] motion-reduce:animate-[ih-fade-in_180ms_ease-out]'
      }`}
    >
      <LiveRegion form={form} />
      <button
        type="button"
        aria-label="Close"
        onClick={() => exit.requestClose('x')}
        className="text-ih-muted hover:bg-ih-surface-2 hover:text-ih-ink focus-visible:outline-ih-accent absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <CloseIcon size={16} />
      </button>

      <div className="flex items-center gap-3">
        <span
          className="bg-ih-navy grid h-10 w-10 shrink-0 place-items-center rounded-full text-[14px] font-medium text-white"
          aria-hidden="true"
        >
          IH
        </span>
        <div>
          <p id={titleId} className="text-ih-ink text-[14px] font-medium">
            Welcome back
          </p>
          <p className="text-ih-muted flex items-center gap-1.5 text-[12px]">
            <span
              className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${deskOpen ? 'bg-ih-success' : 'bg-ih-muted'}`}
              aria-hidden="true"
            />
            {deskOpen
              ? 'Export desk online'
              : nextOpen
                ? `Back ${nextOpen}`
                : 'Export desk offline'}
          </p>
        </div>
      </div>

      {form.status === 'success' ? (
        <SuccessPanel form={form} onDone={() => exit.requestClose('done')} compact />
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            void form.submit(e.currentTarget)
          }}
          className="relative"
        >
          <Honeypot />
          <p className="text-ih-ink-2 mt-4 mb-3.5 text-[14px] leading-[1.55]">
            Can&rsquo;t find the part you need? Leave your number and we&rsquo;ll call you back.
          </p>
          <div className="mb-2.5 grid grid-cols-2 gap-2.5">
            <input
              name="name"
              aria-label="Name"
              autoComplete="name"
              placeholder="Name"
              value={form.name}
              readOnly={form.busy}
              aria-invalid={!!form.errors.name || undefined}
              aria-describedby={anyError ? errId : undefined}
              onChange={(e) => form.setName(e.target.value)}
              className={`${fieldCls} ${fieldState(!!form.errors.name)} h-11`}
            />
            <input
              name="email"
              type="email"
              inputMode="email"
              aria-label="Email"
              autoComplete="email"
              placeholder="Email"
              value={form.email}
              readOnly={form.busy}
              aria-invalid={!!form.errors.email || undefined}
              aria-describedby={anyError ? errId : undefined}
              onChange={(e) => form.setEmail(e.target.value)}
              className={`${fieldCls} ${fieldState(!!form.errors.email)} h-11`}
            />
          </div>
          <PhoneGroup
            form={form}
            height="h-11"
            id={`${errId}-phone`}
            describedBy={anyError ? errId : undefined}
            trailing={
              <button
                type="submit"
                disabled={form.busy}
                aria-busy={form.busy || undefined}
                aria-label={form.busy ? 'Sending' : undefined}
                className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover relative inline-flex shrink-0 items-center justify-center px-3.5 text-[13.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white disabled:opacity-70"
              >
                <span className={form.busy ? 'invisible' : ''}>Call me</span>
                {form.busy ? (
                  <span className="absolute inset-0 grid place-items-center">
                    <Spinner />
                  </span>
                ) : null}
              </button>
            }
          />
          {anyError ? (
            <p id={errId} className={errorCls}>
              {CALLBACK_MESSAGES.combined}
            </p>
          ) : null}
          {form.status === 'error' ? (
            <div className="mt-2.5">
              <FailureLine form={form} deskPhone={deskPhone} />
            </div>
          ) : null}
          <div className="mt-3.5 flex gap-4 text-[13px]">
            <a
              href={`mailto:${deskEmail}?subject=${encodeURIComponent('Enquiry from website')}`}
              onClick={() =>
                trackCallback('callback_alt_click', { surface: 'D', channel: 'email' })
              }
              className={linkCls}
            >
              Write to us
            </a>
            <a
              href={form.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackCallback('callback_alt_click', { surface: 'D', channel: 'whatsapp' })
              }
              className={linkCls}
            >
              WhatsApp
            </a>
          </div>
        </form>
      )}
    </div>
  )
}

// ── E · Mobile sheet ──────────────────────────────────────────────────────

function MobileSheet({ form, exit, deskPhone }: SurfaceProps) {
  const ids = { name: useId(), email: useId(), phone: useId(), err: useId() }
  const sheetRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number; t: number; dy: number } | null>(null)

  // Keep the sheet above the on-screen keyboard and the focused field in view,
  // by moving the sheet and scrolling its own container — never the page.
  useEffect(() => {
    const vv = window.visualViewport
    const sheet = sheetRef.current
    if (!vv || !sheet) return
    const fit = () => {
      const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      sheet.style.setProperty('--ih-kb', `${Math.round(keyboard)}px`)
      sheet.style.setProperty('--ih-vvh', `${Math.round(vv.height)}px`)
      const active = document.activeElement
      if (active instanceof HTMLElement && sheet.contains(active) && active !== sheet) {
        const a = active.getBoundingClientRect()
        const s = sheet.getBoundingClientRect()
        if (a.bottom > s.bottom - 12) sheet.scrollTop += a.bottom - s.bottom + 24
        else if (a.top < s.top + 12) sheet.scrollTop -= s.top - a.top + 24
      }
    }
    vv.addEventListener('resize', fit)
    vv.addEventListener('scroll', fit)
    sheet.addEventListener('focusin', fit)
    return () => {
      vv.removeEventListener('resize', fit)
      vv.removeEventListener('scroll', fit)
      sheet.removeEventListener('focusin', fit)
    }
  }, [])

  // Swipe down from the handle / headline: past 80px or a flick closes.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    drag.current = { y: e.clientY, t: Date.now(), dy: 0 }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    const sheet = sheetRef.current
    if (!d || !sheet) return
    d.dy = Math.max(0, e.clientY - d.y)
    sheet.style.setProperty('--ih-cb-drag', `${d.dy}px`)
  }
  const onPointerUp = () => {
    const d = drag.current
    const sheet = sheetRef.current
    drag.current = null
    if (!d || !sheet) return
    const velocity = d.dy / Math.max(1, Date.now() - d.t)
    if (d.dy > 80 || (d.dy > 24 && velocity > 0.6)) {
      exit.requestClose('swipe')
    } else {
      sheet.style.setProperty('--ih-cb-drag', '0px')
    }
  }

  return (
    <Dialog.Root open modal onOpenChange={(o) => !o && exit.requestClose('x')}>
      <Dialog.Portal>
        <Dialog.Overlay
          {...ROOT}
          className={`bg-ih-scrim fixed inset-0 z-[90] flex flex-col justify-end ${
            exit.closing
              ? 'animate-[ih-fade-out_220ms_ease-in_forwards]'
              : 'animate-[ih-fade-in_180ms_ease-out]'
          }`}
        >
          <Dialog.Content
            ref={sheetRef}
            aria-describedby={undefined}
            onOpenAutoFocus={(e) => {
              // Focus the sheet itself: focusing a field would throw the
              // keyboard up over a prompt the visitor has not read yet.
              e.preventDefault()
              sheetRef.current?.focus()
            }}
            onEscapeKeyDown={(e) => {
              e.preventDefault()
              // An open country list takes the Escape; the prompt stays.
              if (countryPickerOpen()) return
              exit.requestClose('esc')
            }}
            onPointerDownOutside={(e) => {
              e.preventDefault()
              exit.requestClose('scrim')
            }}
            onInteractOutside={(e) => e.preventDefault()}
            className={`bg-ih-surface relative mb-[var(--ih-kb,0px)] max-h-[min(90dvh,calc(var(--ih-vvh,100dvh)-24px))] w-full translate-y-[var(--ih-cb-drag,0px)] overflow-y-auto overscroll-contain rounded-t-xl px-[22px] pt-3.5 pb-[calc(28px+env(safe-area-inset-bottom))] outline-none ${
              exit.closing
                ? 'animate-[ih-cb-drop_220ms_ease-in_forwards] motion-reduce:animate-[ih-fade-out_100ms_ease-in_forwards]'
                : 'animate-[ih-dock_280ms_cubic-bezier(.32,.72,0,1)] motion-reduce:animate-[ih-fade-in_180ms_ease-out]'
            }`}
          >
            <LiveRegion form={form} />
            <div
              className="-mx-[22px] -mt-3.5 touch-none px-[22px] pt-3.5"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div
                className="bg-ih-border-strong mx-auto mb-[18px] h-1 w-10 rounded-sm"
                aria-hidden="true"
              />
              {form.status === 'success' ? null : (
                <>
                  <Dialog.Title className="text-ih-ink pr-10 text-[24px] font-medium tracking-[-0.02em]">
                    Leaving so soon?
                  </Dialog.Title>
                  <p className="text-ih-accent mt-0.5 font-serif text-[26px] leading-[1.1]">
                    <em>Tell us what you were looking for.</em>
                  </p>
                </>
              )}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="text-ih-muted hover:text-ih-ink focus-visible:outline-ih-accent absolute top-[7px] right-px grid h-11 w-11 place-items-center rounded-md focus-visible:outline-2 focus-visible:-outline-offset-4"
            >
              <CloseIcon size={18} />
            </Dialog.Close>

            {form.status === 'success' ? (
              <>
                <Dialog.Title className="sr-only">Call-back requested</Dialog.Title>
                <SuccessPanel form={form} onDone={() => exit.requestClose('done')} />
              </>
            ) : (
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault()
                  void form.submit(e.currentTarget)
                }}
                className="relative"
              >
                <Honeypot />
                <p className="text-ih-ink-2 mt-[18px] mb-2 text-[13.5px] font-medium">
                  Share your details for a call-back.
                </p>
                <div className="flex flex-col gap-2.5">
                  <div>
                    <input
                      id={ids.name}
                      name="name"
                      aria-label="Name"
                      autoComplete="name"
                      placeholder="Name"
                      value={form.name}
                      readOnly={form.busy}
                      aria-invalid={!!form.errors.name || undefined}
                      aria-describedby={form.errors.name ? `${ids.err}-name` : undefined}
                      onChange={(e) => form.setName(e.target.value)}
                      className={`${fieldCls} ${fieldState(!!form.errors.name)} h-12 text-[16px]`}
                    />
                    {form.errors.name ? (
                      <p id={`${ids.err}-name`} className={errorCls}>
                        {form.errors.name}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <input
                      id={ids.email}
                      name="email"
                      type="email"
                      inputMode="email"
                      aria-label="Email"
                      autoComplete="email"
                      placeholder="Email"
                      value={form.email}
                      readOnly={form.busy}
                      aria-invalid={!!form.errors.email || undefined}
                      aria-describedby={form.errors.email ? `${ids.err}-email` : undefined}
                      onChange={(e) => form.setEmail(e.target.value)}
                      className={`${fieldCls} ${fieldState(!!form.errors.email)} h-12 text-[16px]`}
                    />
                    {form.errors.email ? (
                      <p id={`${ids.err}-email`} className={errorCls}>
                        {form.errors.email}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-2.5">
                  <PhoneGroup
                    form={form}
                    height="h-12"
                    id={ids.phone}
                    describedBy={form.errors.phone ? `${ids.err}-phone` : undefined}
                  />
                  {form.errors.phone ? (
                    <p id={`${ids.err}-phone`} className={errorCls}>
                      {form.errors.phone}
                    </p>
                  ) : null}
                </div>
                {form.status === 'error' ? (
                  <div className="mt-2.5">
                    <FailureLine form={form} deskPhone={deskPhone} />
                  </div>
                ) : null}
                <PrimaryButton form={form} label="Call me back" className="mt-2.5" />
                <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                  <a
                    href={form.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackCallback('callback_alt_click', { surface: 'E', channel: 'whatsapp' })
                    }
                    className={`${outlineBtnCls} h-11`}
                  >
                    WhatsApp
                  </a>
                  <a
                    href={form.tel}
                    onClick={() =>
                      trackCallback('callback_alt_click', { surface: 'E', channel: 'tel' })
                    }
                    className={`${outlineBtnCls} h-11`}
                  >
                    Call now
                  </a>
                </div>
                <p className="text-ih-muted mt-3 text-center text-[12px]">
                  Your number is used for this call-back only.
                </p>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
