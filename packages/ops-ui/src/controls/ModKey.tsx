'use client'

import { useIsMac } from '../lib/use-is-mac'

/** The ⌘ glyph on macOS, "Ctrl+" elsewhere. Kbd's only client part. */
export default function ModKey() {
  return useIsMac() ? '⌘' : 'Ctrl+'
}
