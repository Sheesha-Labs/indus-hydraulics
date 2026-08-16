import * as React from 'react'

import { formatPrice, type CurrencyCode } from '@indus/domain'

import { cn } from './lib/utils'

/**
 * Single source of truth for catalogue price rendering. Used on PDP, PLP
 * cards, search results, related-products grids, and the compare page so
 * all surfaces look identical.
 *
 * Layout variants:
 *   - `inline` (default): horizontal — primary $price followed by optional
 *     strike-through compare price. Suits cards.
 *   - `stacked`: vertical block — primary on top, compare below. Suits the
 *     PDP price block and the search "top match" callout.
 *
 * When `listPrice` is null, renders the children prop (typically a
 * "Request quote" button) in place of a number.
 */

export type ProductPriceProps = {
  listPrice: number | null | undefined
  currency: CurrencyCode
  compareAtPrice?: number | null | undefined
  /** Visual layout. Defaults to `inline`. */
  layout?: 'inline' | 'stacked'
  /** Tailwind size for the primary number; passed through `cn`. */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  /** Rendered when listPrice is null (quote-only). */
  quoteCta?: React.ReactNode
}

const SIZE_CLASS = {
  sm: 'text-[14px]',
  md: 'text-[16px]',
  lg: 'text-[20px]',
  xl: 'text-[26px]',
} as const

export function ProductPrice({
  listPrice,
  currency,
  compareAtPrice,
  layout = 'inline',
  size = 'md',
  className,
  quoteCta,
}: ProductPriceProps) {
  const formatted = formatPrice({
    listPrice: listPrice ?? null,
    currency,
    ...(compareAtPrice !== undefined ? { compareAtPrice } : {}),
  })

  if (formatted.isQuoteOnly) {
    return (
      <span
        className={cn(
          'font-mono text-ih-muted text-[12px] uppercase tracking-wider',
          className,
        )}
      >
        {quoteCta ?? 'Request quote'}
      </span>
    )
  }

  const primaryCls = cn('font-mono font-semibold tracking-tight', SIZE_CLASS[size])

  if (layout === 'stacked') {
    return (
      <div className={cn('flex flex-col items-end gap-0.5', className)}>
        <span className={primaryCls}>{formatted.primary}</span>
        {formatted.compareAt && (
          <span className="font-mono text-[11px] text-ih-muted-2 line-through">
            {formatted.compareAt}
          </span>
        )}
      </div>
    )
  }

  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      <span className={primaryCls}>{formatted.primary}</span>
      {formatted.compareAt && (
        <span className="font-mono text-[11px] text-ih-muted-2 line-through">
          {formatted.compareAt}
        </span>
      )}
    </span>
  )
}
