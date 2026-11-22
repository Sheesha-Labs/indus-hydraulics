import { T11Auth } from '@indus/ops-ui/templates'
import type { ReactNode } from 'react'

/**
 * The (auth) group: sign-in, re-authentication, invite acceptance, reset, two-factor. Every page is the T11
 * sign-in card on paper, with no sidebar and no console shell. T11 owns `<main id="content">`; pages render
 * the card's content only. Not an authorization boundary: these pages are public by design (proxy allowlist),
 * and each one decides for itself what a signed-in visitor sees.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <T11Auth>{children}</T11Auth>
}
