import * as React from 'react'
import { cn } from './lib/utils'

export interface SerpPreviewProps {
  title: string
  description: string
  url: string
  className?: string
  variant?: 'desktop' | 'mobile'
}

/**
 * Approximate Google SERP snippet preview. Not pixel-perfect (Google
 * frequently rewrites titles and trims at word boundaries) but close enough
 * to surface obvious truncation problems to the editor.
 */
export function SerpPreview({
  title,
  description,
  url,
  className,
  variant = 'desktop',
}: SerpPreviewProps) {
  const titleClass =
    variant === 'desktop' ? 'text-[20px] leading-[1.3]' : 'text-[16px] leading-[1.3]'
  const descClass =
    variant === 'desktop' ? 'text-[14px] leading-[1.45]' : 'text-[13px] leading-[1.45]'
  return (
    <div
      className={cn(
        'border border-ih-border bg-white p-4 max-w-[600px]',
        className,
      )}
    >
      <div className="text-[12px] text-[#5f6368] mb-1 truncate">{prettyUrl(url)}</div>
      <div className={cn('text-[#1a0dab] font-normal truncate', titleClass)}>
        {title || 'No title'}
      </div>
      <div className={cn('text-[#4d5156] mt-1 line-clamp-2', descClass)}>
        {description || 'No description'}
      </div>
    </div>
  )
}

function prettyUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.host}${u.pathname.replace(/\/$/, '')}`
  } catch {
    return url
  }
}
