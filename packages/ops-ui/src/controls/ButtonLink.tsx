import type { Route } from 'next'
import Link from 'next/link'
import { cn } from '../lib/cn'
import { buttonChildren, buttonVariants, type ButtonOwnProps, type Labelled } from './Button'

export type ButtonLinkProps = ButtonOwnProps &
  Labelled & {
    href: string
    prefetch?: boolean
    target?: '_blank'
    className?: string
  }

/**
 * A link with the Button look (next/link). Shared. Navigation is a link, never a button with a router
 * push: it opens in a new tab, shows its URL and works before hydration. `target="_blank"` adds
 * rel="noopener noreferrer".
 */
export default function ButtonLink({
  variant = 'secondary',
  size = 'md',
  busy = false,
  trail,
  icon,
  kbd,
  href,
  prefetch,
  target,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      {...rest}
      // Callers pass plain strings; apps/ops checks its own literals through typedRoutes.
      href={href as Route}
      {...(prefetch === undefined ? {} : { prefetch })}
      {...(target ? { target, rel: 'noopener noreferrer' } : {})}
      data-variant={variant}
      data-size={size}
      {...(busy ? { 'aria-busy': true, 'data-state': 'busy' } : {})}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {buttonChildren({ busy, icon, trail, kbd, label: children })}
    </Link>
  )
}
