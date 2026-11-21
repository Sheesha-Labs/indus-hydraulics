'use client'

import { useState, useTransition } from 'react'
import { saveSeoSettings } from '../actions'
import { Textarea } from '@indus/ui'

interface Props {
  seoSetting: {
    defaultMetaTitleTemplate: string | null
    defaultMetaDescription: string | null
    robotsTxt: string | null
  } | null
}

/**
 * Live editor for the served `/robots.txt`. Storefront `app/robots.ts` reads
 * this same value, parses it, and emits the configured rules; if it's empty,
 * a permissive default (User-agent: * / Allow: /) ships instead.
 */
export default function RobotsForm({ seoSetting }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSave(formData: FormData) {
    setError(null)
    // Preserve the other settings fields the action overwrites.
    formData.set('defaultMetaTitleTemplate', seoSetting?.defaultMetaTitleTemplate ?? '')
    formData.set('defaultMetaDescription', seoSetting?.defaultMetaDescription ?? '')
    startTransition(async () => {
      const res = await saveSeoSettings(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form action={handleSave} className="flex max-w-[800px] flex-col gap-5">
      <div className="bg-ih-warning-soft/40 rounded-lg border border-[oklch(0.75_0.12_70)]/40 px-4 py-3 text-[12px] leading-relaxed">
        <strong>Infrastructure change.</strong> Edits here ship to <code>/robots.txt</code> on next
        request. A bad rule can deindex the entire site — the audit log records every change so you
        can revert quickly.
      </div>

      <div>
        <label
          htmlFor="robots-robotsTxt"
          className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
        >
          robots.txt content
        </label>
        <Textarea
          id="robots-robotsTxt"
          name="robotsTxt"
          rows={16}
          defaultValue={
            seoSetting?.robotsTxt ??
            'User-agent: *\nAllow: /\n\nSitemap: https://indushydraulics.com/sitemap.xml'
          }
          className="resize-none text-[12px] tabular-nums"
        />
        <p className="text-ih-muted mt-2 text-[11px]">
          Lines starting with <code>#</code> are comments. The Sitemap directive is appended
          automatically when present in `SeoSetting.robotsTxtAutoAppendSitemap`.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-9 px-5 text-[12px] tabular-nums disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save robots.txt'}
        </button>
        {saved && <span className="text-ih-success text-[11px] tabular-nums">Saved ✓</span>}
        {error && (
          <span className="text-ih-danger-ink text-[11px] tabular-nums" role="alert">
            {error}
          </span>
        )}
      </div>
    </form>
  )
}
