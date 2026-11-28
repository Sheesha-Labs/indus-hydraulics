'use client'

import type { ReactNode } from 'react'
import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { SETTINGS_ACTIONS_SLOT } from '../../lib/settings-nav'

const noop = () => () => undefined

/**
 * A settings page's own header buttons (boards 57, 39, 213, 214), rendered into the slot the layout's
 * SettingsHeader leaves for them: the page's client state (dirty, a modal to open) owns the buttons, the header
 * owns their place. Nothing renders before hydration (the slot is found in the DOM).
 */
export default function HeaderActions({ children }: { children: ReactNode }) {
  const slot = useSyncExternalStore(
    noop,
    () => document.getElementById(SETTINGS_ACTIONS_SLOT),
    () => null
  )
  return slot ? createPortal(children, slot) : null
}
