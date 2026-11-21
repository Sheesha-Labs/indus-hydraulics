import type { ReactNode } from 'react'

// Every console page is per-user and per-request.
export const dynamic = 'force-dynamic'

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return children
}
