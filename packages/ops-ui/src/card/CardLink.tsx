import type { Route } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import type { LinkSpec } from '../types'

/** True for a LinkSpec ({ label, href }) rather than a plain node. */
export function isLinkSpec(v: unknown): v is LinkSpec {
  return typeof v === 'object' && v !== null && 'href' in v && 'label' in v
}

/**
 * A link inside a card part (accent). An external link opens in a new tab with rel noopener noreferrer.
 * Internal links go through next/link.
 */
export default function CardLink({
  href,
  external = false,
  className,
  children,
}: {
  href: string
  external?: boolean | undefined
  className?: string
  children: ReactNode
}) {
  const cls = cn('io-focus rounded-io-tag text-io-accent hover:underline', className)
  if (external)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    )
  return (
    <Link href={href as Route} className={cls}>
      {children}
    </Link>
  )
}
