'use client'

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

/** The element focused right now, unless that is nothing (body). */
function focused(): HTMLElement | null {
  const el = document.activeElement
  return el instanceof HTMLElement && el !== document.body ? el : null
}

/** Focus `el` if it is still on the page, otherwise the page's `<main id="content">`. */
export function focusBack(el: HTMLElement | null): void {
  const target = el?.isConnected ? el : document.getElementById('content')
  target?.focus({ preventScroll: true })
}

/**
 * The control that opened a surface (shell/README: "focus returns to the control that opened it"). The
 * element focused when `open` turns true is kept in the returned ref. A modal Drawer takes it as
 * `returnFocusRef`; a docked panel passes `restore: true` and focus goes back when it closes, unless the
 * person has already moved focus somewhere else on the page.
 */
export function useReturnFocus(
  open: boolean,
  options: { restore?: boolean; within?: RefObject<HTMLElement | null> } = {}
): RefObject<HTMLElement | null> {
  const opener = useRef<HTMLElement | null>(null)
  const wasOpen = useRef(false)
  const { restore = false, within } = options

  // Layout effect: runs before the surface's own autofocus moves focus inside it.
  useLayoutEffect(() => {
    if (open && !wasOpen.current) opener.current = focused()
  }, [open])

  useEffect(() => {
    if (wasOpen.current && !open && restore) {
      const now = focused()
      const inside = now === null || (within?.current?.contains(now) ?? false)
      if (inside) focusBack(opener.current)
    }
    wasOpen.current = open
  }, [open, restore, within])

  return opener
}
