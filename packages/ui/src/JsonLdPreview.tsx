import * as React from 'react'
import { cn } from './lib/utils'

export interface JsonLdPreviewProps {
  data: unknown
  className?: string
}

/**
 * Pretty-printed JSON-LD viewer for the admin Schema tab. Keep it simple — a
 * collapsible tree library is overkill for the typical product/breadcrumb LD.
 */
export function JsonLdPreview({ data, className }: JsonLdPreviewProps) {
  const text = React.useMemo(() => {
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }, [data])
  return (
    <pre
      className={cn(
        'border border-ih-border bg-ih-surface-2 p-3 font-mono text-[11px] leading-relaxed text-ih-ink-2 overflow-auto max-h-[420px]',
        className,
      )}
    >
      {text}
    </pre>
  )
}
