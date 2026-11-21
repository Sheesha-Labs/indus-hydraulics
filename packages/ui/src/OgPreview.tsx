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
      className={cn('border-ih-border max-w-[500px] overflow-hidden border bg-white', className)}
    >
      <div className="bg-ih-surface-2 text-ih-muted flex aspect-[1.91/1] items-center justify-center text-[11px]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="OG preview" className="h-full w-full object-cover" />
        ) : (
          'No OG image'
        )}
      </div>
      <div className={cn('border-ih-border border-t p-3', variant === 'twitter' && 'border-t-0')}>
        <div className="truncate text-[11px] tracking-wide text-[#65676b] uppercase">
          {prettyHost(url)}
        </div>
        <div className="mt-0.5 truncate text-[14px] font-semibold text-[#1d2129]">
          {title || 'No title'}
        </div>
        <div className="mt-0.5 line-clamp-2 text-[12px] text-[#65676b]">
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
