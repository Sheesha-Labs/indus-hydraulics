import type { Metadata } from 'next'
import type { ReactNode } from 'react'

/**
 * The (client) group: the pages a client opens from a link (/q, /d, /s, /u; apps/ops/CLAUDE.md §5.1). Each
 * page is a T12 client page. Rules that hold for every page under here:
 * - never read a console session (no requireOpsUser, no auth(), no console cookie): the signed link token
 *   in the URL is the only credential, verified by the page;
 * - render only ClientSafe* DTOs: never a supplier, line state, cost or margin (C36);
 * - the proxy sets `Cache-Control: private, no-store` and `Referrer-Policy: no-referrer` for these paths
 *   (lib/security-headers.ts, kind 'client').
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return children
}
