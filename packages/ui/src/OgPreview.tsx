import * as React from 'react'
import { cn } from './lib/utils'

export interface OgPreviewProps {
  title: string
  description: string
  url: string
  imageUrl?: string | null
  variant?: 'facebook' | 'twitter' | 'linkedin'
  className?: string
}

/**
 * Approximate Open Graph card preview. The three variants are visually
 * similar but differ in domain placement, font weight, and aspect ratio.
 */
export function OgPreview({
  title,
  description,
  url,
  imageUrl,
  variant = 'facebook',
  className,
}: OgPreviewProps) {
  return (
    <div
      className={cn(
        'border border-[var(--color-border)] bg-white max-w-[500px] overflow-hidden',
        className,
      )}
    >
      <div className="aspect-[1.91/1] bg-[var(--color-deep)] flex items-center justify-center text-[var(--color-muted)] text-[11px]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="OG preview" className="w-full h-full object-cover" />
        ) : (
          'No OG image'
        )}
      </div>
      <div
        className={cn(
          'p-3 border-t border-[var(--color-border)]',
          variant === 'twitter' && 'border-t-0',
        )}
      >
        <div className="text-[11px] text-[#65676b] uppercase tracking-wide truncate">
          {prettyHost(url)}
        </div>
        <div className="text-[14px] font-semibold text-[#1d2129] truncate mt-0.5">
          {title || 'No title'}
        </div>
        <div className="text-[12px] text-[#65676b] line-clamp-2 mt-0.5">
          {description || 'No description'}
        </div>
      </div>
    </div>
  )
}

function prettyHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}
