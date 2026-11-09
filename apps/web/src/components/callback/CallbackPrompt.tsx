'use client'

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  CALLBACK_CONFIG,
  CALLBACK_PROMPT_ENABLED,
  CALLBACK_STORAGE,
  DAY_MS,
  looksLikeBot,
  marketSlugFromPath,
  overrideSurface,
  readEpoch,
  suppressionReason,
  surfaceFor,
  type CallbackCountry,
  type CallbackSurface,
  type CallbackTrigger,
  type CloseMethod,
} from '../../lib/callback/rules'
import { trackCallback } from '../../lib/callback/analytics'

/**
 * The call-back prompt's controller (handoff §3): owns every trigger, every
 * suppression rule and which surface opens. Mounted once in the storefront
 * layout, right after the skip link, so the non-modal corner card sits early
 * in the tab order.
 *
 * It is deliberately small. The three surfaces — markup, form, Radix Dialog —
 * live in CallbackSurfaces and load only when a trigger fires (prefetched
 * while the browser is idle), so a visitor who is never prompted never pays
 * for them.
 *
 * At most one prompt per tab session, whichever trigger fires first:
 *  - inactivity: 45 s with no scroll, pointer, key or touch input  → B / E
 *  - exit intent: the pointer leaves through the top edge (desktop) → B
 *  - tab return: back after 20 s or more on another tab           → D / E
 */

const CallbackSurfaces = lazy(() => import('./CallbackSurfaces'))

type Props = {
  /** [ISO, dial] for every export market, sorted by name (server-built). */
  countries: CallbackCountry[]
  /** The HQ's Schema.org opening hours — drives "Export desk online". */
  openingHours: string[]
  /** "+971 52 2477942" */
  deskPhone: string
  deskEmail: string
}

type OpenState = { surface: CallbackSurface; trigger: CallbackTrigger; override: boolean; openedAt: number }

const ACTIVITY_EVENTS = ['scroll', 'pointermove', 'pointerdown', 'keydown', 'touchstart', 'wheel'] as const

/** Selectors for "something else is already over the page". */
const OVERLAY_SELECTOR = '[aria-modal="true"], dialog[open], [data-overlay-open="true"], header [aria-expanded="true"]'
const FIELD_SELECTOR = 'input, textarea, select, [contenteditable="true"], [contenteditable=""]'
const ROOT_ATTR = 'data-callback-root'

function storageGet(store: 'local' | 'session', key: string): string | null {
  try {
    return (store === 'local' ? window.localStorage : window.sessionStorage).getItem(key)
  } catch {
    return null
  }
}

function storageSet(store: 'local' | 'session', key: string, value: string): void {
  try {
    ;(store === 'local' ? window.localStorage : window.sessionStorage).setItem(key, value)
  } catch {
    // Private mode or blocked storage: the prompt simply cannot remember, and
    // the one-per-page-load guard (openRef) still holds.
  }
}

function insidePrompt(el: Element | null): boolean {
  return !!el?.closest(`[${ROOT_ATTR}]`)
}

export default function CallbackPrompt({ countries, openingHours, deskPhone, deskEmail }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState<OpenState | null>(null)

  const openRef = useRef<OpenState | null>(null)
  const pathRef = useRef(pathname)
  const pageStartRef = useRef(0)
  const dirtyRef = useRef(false)
  const shownThisLoad = useRef(false)

  const show = useCallback((state: OpenState) => {
    openRef.current = state
    shownThisLoad.current = true
    setOpen(state)
    trackCallback('callback_prompt_shown', {
      surface: state.surface,
      trigger: state.trigger,
      page_path: pathRef.current,
      market: marketSlugFromPath(pathRef.current),
    })
  }, [])

  /** Every trigger funnels through here; the rules decide. */
  const tryOpen = useCallback(
    (trigger: CallbackTrigger) => {
      if (!CALLBACK_PROMPT_ENABLED || openRef.current || shownThisLoad.current) return
      const desktop = window.matchMedia(CALLBACK_CONFIG.desktopQuery).matches
      const surface = surfaceFor(trigger, desktop)
      if (!surface) return
      const active = document.activeElement
      const reason = suppressionReason({
        now: Date.now(),
        trigger,
        path: pathRef.current,
        shownThisSession: storageGet('session', CALLBACK_STORAGE.shown) === '1',
        dismissedUntil: readEpoch(storageGet('local', CALLBACK_STORAGE.dismissedUntil)),
        submittedUntil: readEpoch(storageGet('local', CALLBACK_STORAGE.submittedUntil)),
        fieldFocused: !!active && active !== document.body && active.matches(FIELD_SELECTOR) && !insidePrompt(active),
        pageFormDirty: dirtyRef.current,
        overlayOpen: !!document.querySelector(OVERLAY_SELECTOR),
        bot:
          looksLikeBot(navigator.userAgent, navigator.webdriver === true) ||
          (document as Document & { prerendering?: boolean }).prerendering === true,
        pageviews: Number(storageGet('session', CALLBACK_STORAGE.pageviews)) || 1,
        msOnPage: Date.now() - pageStartRef.current,
      })
      if (reason) return
      storageSet('session', CALLBACK_STORAGE.shown, '1')
      show({ surface, trigger, override: false, openedAt: Date.now() })
    },
    [show],
  )

  // Per page: the clock for "time on page", the pageview count for the bounce
  // guard, the dirty-form flag, first-touch UTMs and the ?cb= QA override.
  useEffect(() => {
    pathRef.current = pathname
    pageStartRef.current = Date.now()
    dirtyRef.current = false
    const pv = Number(storageGet('session', CALLBACK_STORAGE.pageviews)) || 0
    storageSet('session', CALLBACK_STORAGE.pageviews, String(pv + 1))

    const search = window.location.search
    if (!storageGet('session', CALLBACK_STORAGE.utm)) {
      const params = new URLSearchParams(search)
      const utm: Record<string, string> = {}
      for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
        const v = params.get(k)
        if (v) utm[k] = v.slice(0, 120)
      }
      if (Object.keys(utm).length > 0) storageSet('session', CALLBACK_STORAGE.utm, JSON.stringify(utm))
    }

    const forced = overrideSurface(search)
    if (forced && !openRef.current) show({ surface: forced, trigger: 'manual', override: true, openedAt: Date.now() })
  }, [pathname, show])

  // The triggers. One set of listeners for the life of the layout.
  useEffect(() => {
    if (!CALLBACK_PROMPT_ENABLED) return
    let timer: ReturnType<typeof setTimeout> | undefined
    let returnTimer: ReturnType<typeof setTimeout> | undefined
    let started = false
    let lastActivity = 0
    let hiddenAt = 0

    const arm = () => {
      clearTimeout(timer)
      if (!started || openRef.current || document.visibilityState === 'hidden') return
      timer = setTimeout(() => tryOpen('inactivity'), CALLBACK_CONFIG.inactivityMs)
    }

    const onActivity = () => {
      const t = Date.now()
      if (t - lastActivity < 500) return
      lastActivity = t
      arm()
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now()
        clearTimeout(timer)
        return
      }
      const away = hiddenAt ? Date.now() - hiddenAt : 0
      hiddenAt = 0
      arm()
      if (away >= CALLBACK_CONFIG.tabAwayMs) {
        clearTimeout(returnTimer)
        returnTimer = setTimeout(() => tryOpen('tab_return'), CALLBACK_CONFIG.tabReturnDelayMs)
      }
    }

    const onMouseOut = (e: MouseEvent) => {
      if (!CALLBACK_CONFIG.exitIntent || e.relatedTarget !== null || e.clientY > 0) return
      tryOpen('exit')
    }

    // Typing into any form on the page (not ours) means "leave them alone".
    const onInput = (e: Event) => {
      const target = e.target as Element | null
      if (target && !insidePrompt(target) && target.matches(FIELD_SELECTOR)) dirtyRef.current = true
    }

    const begin = () => {
      setTimeout(() => {
        started = true
        arm()
      }, CALLBACK_CONFIG.inactivityStartDelayMs)
    }

    if (document.readyState === 'complete') begin()
    else window.addEventListener('load', begin, { once: true })

    for (const ev of ACTIVITY_EVENTS) window.addEventListener(ev, onActivity, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    document.addEventListener('mouseout', onMouseOut)
    document.addEventListener('input', onInput, true)

    // Fetch the surfaces' code while nothing else is happening, so the first
    // prompt opens without a network round trip.
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback
    const prefetch = () => void import('./CallbackSurfaces').catch(() => undefined)
    const prefetchTimer = setTimeout(() => (idle ? idle(prefetch, { timeout: 5000 }) : prefetch()), 10_000)

    return () => {
      clearTimeout(timer)
      clearTimeout(returnTimer)
      clearTimeout(prefetchTimer)
      window.removeEventListener('load', begin)
      for (const ev of ACTIVITY_EVENTS) window.removeEventListener(ev, onActivity)
      document.removeEventListener('visibilitychange', onVisibility)
      document.removeEventListener('mouseout', onMouseOut)
      document.removeEventListener('input', onInput, true)
    }
  }, [tryOpen])

  const handleClose = useCallback((method: CloseMethod) => {
    const state = openRef.current
    if (!state) return
    if (!state.override && method !== 'done') {
      storageSet('local', CALLBACK_STORAGE.dismissedUntil, String(Date.now() + CALLBACK_CONFIG.dismissDays * DAY_MS))
    }
    trackCallback('callback_prompt_closed', {
      surface: state.surface,
      trigger: state.trigger,
      method,
      ms_open: Date.now() - state.openedAt,
    })
  }, [])

  const handleSubmitted = useCallback(() => {
    const state = openRef.current
    if (!state || state.override) return
    storageSet('local', CALLBACK_STORAGE.submittedUntil, String(Date.now() + CALLBACK_CONFIG.submitDays * DAY_MS))
  }, [])

  const handleClosed = useCallback(() => {
    openRef.current = null
    setOpen(null)
  }, [])

  if (!open) return null

  return (
    <Suspense fallback={null}>
      <CallbackSurfaces
        surface={open.surface}
        trigger={open.trigger}
        openedAt={open.openedAt}
        countries={countries}
        openingHours={openingHours}
        deskPhone={deskPhone}
        deskEmail={deskEmail}
        onClose={handleClose}
        onSubmitted={handleSubmitted}
        onClosed={handleClosed}
      />
    </Suspense>
  )
}
