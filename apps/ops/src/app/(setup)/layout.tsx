import type { ReactNode } from 'react'

/**
 * The (setup) group: the Owner's first run, Welcome (board 78, T11) and the six setup steps (boards
 * 79–83 and 84b, T9 rail). Signed-in pages drawn WITHOUT the console shell: the boards draw no sidebar,
 * and T11 owns the page's `<main>` (inside AppShell it would be a second one). (decision: the S02-T07
 * table lists these under (console); a nested layout cannot drop the console layout's AppShell, so they
 * sit in their own group. The URLs are the same.)
 *
 * Not an authorization boundary: each page calls requireOpsUser() itself, and the proxy protects both
 * paths (they are not on its public allowlist).
 */
export const dynamic = 'force-dynamic'

export default function SetupLayout({ children }: { children: ReactNode }) {
  return children
}
