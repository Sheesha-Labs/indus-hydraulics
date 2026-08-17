import type { ReactNode } from 'react'

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-[var(--spacing-max-w)] px-[var(--spacing-page-gutter)]">{children}</main>
}
