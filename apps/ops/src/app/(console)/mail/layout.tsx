import type { ReactNode } from 'react'

/**
 * Mail (boards 91, 94). Each page renders the whole T3 screen itself (components/mail/MailScreen): the thread
 * list depends on the search params, which a layout cannot read. Not an authorization boundary: every page
 * calls requireOpsUser() (apps/ops/CLAUDE.md §5.3).
 */
export default function MailLayout({ children }: { children: ReactNode }) {
  return children
}
