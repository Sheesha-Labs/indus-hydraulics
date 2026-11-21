import type { DialCountry } from '@indus/domain'
import { toE164 } from '../phone'

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

export function isExcludedPath(
  path: string,
  prefixes: readonly string[] = CALLBACK_CONFIG.excludePaths
): boolean {
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
  if (
    ctx.trigger === 'inactivity' &&
    ctx.pageviews < 2 &&
    ctx.msOnPage < CALLBACK_CONFIG.bounceGuardMs
  ) {
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
  return (
    webdriver ||
    /bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternalhit|bingpreview/i.test(
      userAgent
    )
  )
}

// ── Countries ─────────────────────────────────────────────────────────────

/** A dial-code row — see `DIAL_COUNTRIES` in @indus/domain. */
export type CallbackCountry = DialCountry

export { GCC_ORDER, FALLBACK_COUNTRY, orderCountries, flagSrc, filterCountries } from '../phone'

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

export { cleanPhoneInput, toE164 } from '../phone'

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

export { displayPhone } from '../phone'

/** wa.me link with the page-aware opener the handoff specifies. */
export function whatsappHref(phoneDigits: string, pageTitle: string): string {
  const title = pageTitle.replace(/\s*\|\s*Indus Hydraulics\s*$/, '').trim() || 'your website'
  const text = `Hello, I'm on ${title} and need help finding a part.`
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`
}
