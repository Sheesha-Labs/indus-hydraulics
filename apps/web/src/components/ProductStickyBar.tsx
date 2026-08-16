'use client'

import { useEffect, useState } from 'react'

type Props = {
  title: string
  sku: string
  datasheetUrl?: string
  whatsappUrl?: string | null
  emailUrl: string
}

export default function ProductStickyBar({ title, sku, datasheetUrl, whatsappUrl, emailUrl }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY
      const maxScroll = document.body.scrollHeight - 1400
      setVisible(scrollY > 700 && scrollY < maxScroll)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 bg-ih-surface border-t border-ih-border"
      style={{ boxShadow: '0 -4px 20px -8px rgba(17,20,24,0.1)' }}
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 xl:px-12 py-3 flex gap-4 items-center">
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <b className="text-[14px] font-semibold truncate">{title}</b>
          <span className="font-mono text-[11px] text-ih-muted shrink-0">{sku}</span>
        </div>
        <div className="flex gap-2 shrink-0">
          {datasheetUrl && (
            <a
              href={datasheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-4 flex items-center border border-ih-border font-mono text-[12px] text-ih-ink-2 hover:bg-ih-surface-2 transition-colors"
            >
              ↓ Datasheet
            </a>
          )}
          <a
            href={emailUrl}
            className="h-9 px-4 flex items-center border border-ih-ink bg-ih-surface font-mono text-[12px] text-ih-ink hover:bg-ih-surface-2 transition-colors"
          >
            Email Quote
          </a>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-4 flex items-center font-mono text-[12px] text-white transition-opacity hover:opacity-90"
              style={{ background: '#16a34a' }}
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
