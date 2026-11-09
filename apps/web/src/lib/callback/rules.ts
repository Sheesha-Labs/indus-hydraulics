/**
 * The call-back prompt's rules — when it may open, which surface it opens,
 * and what a valid request is.
 *
 * Pure and dependency-free on purpose: the browser controller, the lazily
 * loaded surfaces and the server action all import this one module, so the
 * client's "Enter a valid email" and the server's are the same check, and
 * the suppression rules can be unit-tested without a DOM.
 *
 * Design source: the call-back popup handoff (surfaces B, D, E). Copy marked
 * [proposed] in that handoff is still awaiting client sign-off.
 */

// ── Config ────────────────────────────────────────────────────────────────

/**
 * Kill switch. Set `NEXT_PUBLIC_CALLBACK_PROMPT=off` in Vercel and redeploy to
 * stop every trigger. The `?cb=` QA override still works while it is off.
 */
export const CALLBACK_PROMPT_ENABLED = process.env.NEXT_PUBLIC_CALLBACK_PROMPT !== 'off'

export const CALLBACK_CONFIG = {
  /** No input of any kind for this long → B (desktop) or E (phone). */
  inactivityMs: 45_000,
  /** The inactivity clock starts this long after `load`. */
  inactivityStartDelayMs: 3_000,
  /** Away from the tab at least this long → D (desktop) or E (phone) on return. */
  tabAwayMs: 20_000,
  /** Let the page repaint before the corner card slides in. */
  tabReturnDelayMs: 600,
  exitIntent: true,
  /** Exit intent is ignored this early on a page. */
  minPageMs: 8_000,
  /** A first-pageview visitor must have been on the page this long (inactivity only). */
  bounceGuardMs: 15_000,
  dismissDays: 7,
  submitDays: 30,
  /** The corner card closes itself this long after a successful submit. */
  cornerAutoCloseMs: 8_000,
  /**
   * Never on these. A path matches when it equals the entry or continues it
   * with "/". The form pages are excluded because the visitor is already
   * talking to us; the legal pages because nobody reading them wants a sales
   * call.
   */
  excludePaths: [
    '/contact',
    '/quote',
    '/rfq',
    '/checkout',
    '/cart',
    '/thank-you',
    '/privacy',
    '/terms',
    '/newsletter',
    '/maintenance',
  ],
  desktopQuery: '(min-width: 768px) and (pointer: fine)',
} as const

export const CALLBACK_STORAGE = {
  /** sessionStorage — one prompt per tab session, whichever trigger fired it. */
  shown: 'ih_cb_shown',
  /** sessionStorage — pageviews this session, for the bounce guard. */
  pageviews: 'ih_cb_pv',
  /** sessionStorage — first-touch utm_* of this session, as JSON. */
  utm: 'ih_cb_utm',
  /** localStorage — epoch ms; closed, so stay quiet until then (7 days). */
  dismissedUntil: 'ih_cb_dismissed_until',
  /** localStorage — epoch ms; submitted, so stay quiet until then (30 days). */
  submittedUntil: 'ih_cb_submitted_until',
} as const

export const DAY_MS = 86_400_000

// ── Vocabulary ────────────────────────────────────────────────────────────

export const CALLBACK_SURFACES = ['B', 'D', 'E'] as const
export type CallbackSurface = (typeof CALLBACK_SURFACES)[number]

/** `manual` is the `?cb=` QA override. */
export const CALLBACK_TRIGGERS = ['inactivity', 'exit', 'tab_return', 'manual'] as const
export type CallbackTrigger = (typeof CALLBACK_TRIGGERS)[number]

export const CALLBACK_CATEGORIES = [
  { value: 'hoses_fittings', label: 'Hoses & fittings' },
  { value: 'pumps', label: 'Pumps' },
  { value: 'valves', label: 'Valves' },
  { value: 'cylinders', label: 'Cylinders' },
  { value: 'seals', label: 'Seals' },
  { value: 'repair_service', label: 'Repair / service' },
  { value: 'other', label: 'Something else' },
] as const
export type CallbackCategory = (typeof CALLBACK_CATEGORIES)[number]['value']
export const DEFAULT_CALLBACK_CATEGORY: CallbackCategory = 'hoses_fittings'

export function categoryLabel(value: string | null | undefined): string | null {
  return CALLBACK_CATEGORIES.find((c) => c.value === value)?.label ?? null
}

export type CloseMethod = 'x' | 'esc' | 'scrim' | 'swipe' | 'done'

// ── Paths ─────────────────────────────────────────────────────────────────

export function isExcludedPath(path: string, prefixes: readonly string[] = CALLBACK_CONFIG.excludePaths): boolean {
  return prefixes.some((p) => path === p || path.startsWith(`${p}/`))
}

/** "/markets/oman" → "oman". Anything else → null. */
export function marketSlugFromPath(path: string): string | null {
  const m = /^\/markets\/([a-z0-9-]+)\/?$/.exec(path)
  return m ? (m[1] ?? null) : null
}

// ── Surface choice ────────────────────────────────────────────────────────

/** Which surface a trigger opens, or null when it has none on this device. */
export function surfaceFor(trigger: CallbackTrigger, desktop: boolean): CallbackSurface | null {
  switch (trigger) {
    case 'exit':
      // A phone has no pointer to leave through the top edge.
      return desktop ? 'B' : null
    case 'inactivity':
      return desktop ? 'B' : 'E'
    case 'tab_return':
      return desktop ? 'D' : 'E'
    case 'manual':
      return desktop ? 'B' : 'E'
  }
}

/** `?cb=B` / `?cb=D` / `?cb=E` — open that surface now, ignoring every rule. */
export function overrideSurface(search: string): CallbackSurface | null {
  const v = new URLSearchParams(search).get('cb')?.toUpperCase()
  return v === 'B' || v === 'D' || v === 'E' ? v : null
}

// ── Suppression ───────────────────────────────────────────────────────────

export type PromptContext = {
  now: number
  trigger: CallbackTrigger
  path: string
  /** Already shown in this tab session. */
  shownThisSession: boolean
  dismissedUntil: number
  submittedUntil: number
  /** An input, textarea, select or contenteditable has focus. */
  fieldFocused: boolean
  /** The visitor has typed into a form on this page. */
  pageFormDirty: boolean
  /** A dialog, drawer or open menu is already on screen. */
  overlayOpen: boolean
  /** Automation, a prerender or a crawler. */
  bot: boolean
  /** Pageviews in this tab session, this one included. */
  pageviews: number
  /** Time on the current page. */
  msOnPage: number
}

export type SuppressionReason =
  | 'shown'
  | 'dismissed'
  | 'submitted'
  | 'excluded_path'
  | 'field_focused'
  | 'form_dirty'
  | 'overlay_open'
  | 'bot'
  | 'too_early'
  | 'bounce_guard'

/**
 * Why the prompt must stay closed, or null when it may open. Order matters
 * only for reporting; any one reason is enough.
 */
export function suppressionReason(ctx: PromptContext): SuppressionReason | null {
  if (ctx.bot) return 'bot'
  if (ctx.shownThisSession) return 'shown'
  if (ctx.submittedUntil > ctx.now) return 'submitted'
  if (ctx.dismissedUntil > ctx.now) return 'dismissed'
  if (isExcludedPath(ctx.path)) return 'excluded_path'
  if (ctx.overlayOpen) return 'overlay_open'
  if (ctx.fieldFocused) return 'field_focused'
  if (ctx.pageFormDirty) return 'form_dirty'
  if (ctx.trigger === 'exit' && ctx.msOnPage < CALLBACK_CONFIG.minPageMs) return 'too_early'
  if (ctx.trigger === 'inactivity' && ctx.pageviews < 2 && ctx.msOnPage < CALLBACK_CONFIG.bounceGuardMs) {
    return 'bounce_guard'
  }
  return null
}

/** A stored epoch-ms value, or 0 for anything missing or unreadable. */
export function readEpoch(raw: string | null | undefined): number {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Crawlers and automation never see the prompt. */
export function looksLikeBot(userAgent: string, webdriver: boolean): boolean {
  return webdriver || /bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternalhit|bingpreview/i.test(userAgent)
}

// ── Countries ─────────────────────────────────────────────────────────────

/** [ISO 3166-1 alpha-2, dial code], e.g. ["OM", "+968"]. */
export type CallbackCountry = readonly [iso: string, dial: string]

export const GCC_ORDER = ['AE', 'SA', 'OM', 'KW', 'QA', 'BH'] as const
export const FALLBACK_COUNTRY: CallbackCountry = ['AE', '+971']

/**
 * The dial-code select's order: the default first, then the GCC, then
 * everything else in the order given (the server sorts it by country name).
 */
export function orderCountries(countries: readonly CallbackCountry[], defaultIso: string): CallbackCountry[] {
  const byIso = new Map(countries.map((c) => [c[0], c] as const))
  if (!byIso.has(FALLBACK_COUNTRY[0])) byIso.set(FALLBACK_COUNTRY[0], FALLBACK_COUNTRY)
  const out: CallbackCountry[] = []
  const seen = new Set<string>()
  const push = (iso: string) => {
    const c = byIso.get(iso)
    if (c && !seen.has(iso)) {
      out.push(c)
      seen.add(iso)
    }
  }
  push(byIso.has(defaultIso) ? defaultIso : FALLBACK_COUNTRY[0])
  for (const iso of GCC_ORDER) push(iso)
  for (const c of countries) push(c[0])
  return out
}

// ── Validation ────────────────────────────────────────────────────────────

/** Copy marked [proposed] in the handoff — awaiting client sign-off. */
export const CALLBACK_MESSAGES = {
  name: 'Enter your name.',
  email: 'Enter a valid email address.',
  phone: 'Enter a phone number we can call.',
  combined: 'Add your name, email and phone so we can call you.',
} as const

export const DESCRIPTION_MAX = 200
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Keep digits and spaces only — what the phone field accepts as typed. */
export function cleanPhoneInput(raw: string): string {
  return raw.replace(/[^\d\s]/g, '').replace(/\s{2,}/g, ' ').slice(0, 20)
}

/**
 * National digits + dial code → E.164, or null when it cannot be a real
 * number. A trunk "0" is dropped ("052 …" in the UAE is "+971 52 …"), as is a
 * repeated country code typed into the national field.
 */
export function toE164(dial: string, national: string): string | null {
  const cc = dial.replace(/\D/g, '')
  let digits = national.replace(/\D/g, '')
  if (!cc) return null
  if (digits.startsWith('00' + cc)) digits = digits.slice(2 + cc.length)
  digits = digits.replace(/^0+/, '')
  if (digits.length < 6 || digits.length > 14) return null
  if (cc.length + digits.length > 15) return null
  return `+${cc}${digits}`
}

export type CallbackFieldErrors = Partial<Record<'name' | 'email' | 'phone', string>>

export function validateCallbackFields(input: {
  name: string
  email: string
  dial: string
  phone: string
}): CallbackFieldErrors {
  const errors: CallbackFieldErrors = {}
  const name = input.name.trim()
  if (name.length < 2 || name.length > 80) errors.name = CALLBACK_MESSAGES.name
  const email = input.email.trim()
  if (email.length > 254 || !EMAIL.test(email)) errors.email = CALLBACK_MESSAGES.email
  if (!toE164(input.dial, input.phone)) errors.phone = CALLBACK_MESSAGES.phone
  return errors
}

/** "Fatima Al Hashimi" → "Fatima". */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? ''
}

/** "+971521234567" with dial "+971" → "+971 52 123 4567"-ish, for reading back. */
export function displayPhone(e164: string, dial: string): string {
  const cc = dial.replace(/\D/g, '')
  const rest = e164.replace(/^\+/, '').slice(cc.length)
  const groups = rest.length > 7 ? [rest.slice(0, 2), rest.slice(2, 5), rest.slice(5)] : [rest.slice(0, 3), rest.slice(3)]
  return `+${cc} ${groups.filter(Boolean).join(' ')}`
}

/** wa.me link with the page-aware opener the handoff specifies. */
export function whatsappHref(phoneDigits: string, pageTitle: string): string {
  const title = pageTitle.replace(/\s*\|\s*Indus Hydraulics\s*$/, '').trim() || 'your website'
  const text = `Hello, I'm on ${title} and need help finding a part.`
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`
}
