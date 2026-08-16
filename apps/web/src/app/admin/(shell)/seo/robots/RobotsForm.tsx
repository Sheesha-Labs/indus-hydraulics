'use client'

import { useState, useTransition } from 'react'
import { saveSeoSettings } from '../actions'

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
    <form action={handleSave} className="max-w-[800px] space-y-5">
      <div className="border border-[oklch(0.75_0.12_70)]/40 bg-[oklch(0.96_0.05_70)]/40 px-4 py-3 text-[12px] leading-relaxed">
        <strong>Infrastructure change.</strong> Edits here ship to <code>/robots.txt</code> on
        next request. A bad rule can deindex the entire site — the audit log records every
        change so you can revert quickly.
      </div>

      <div>
        <label className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
          robots.txt content
        </label>
        <textarea
          name="robotsTxt"
          rows={16}
          defaultValue={
            seoSetting?.robotsTxt ??
            'User-agent: *\nAllow: /\n\nSitemap: https://indushydraulics.com/sitemap.xml'
          }
          className="w-full px-3 py-2.5 border border-ih-border bg-ih-surface font-mono text-[12px] focus:outline-none focus:border-ih-accent resize-none"
        />
        <p className="mt-2 text-[11px] text-ih-muted">
          Lines starting with <code>#</code> are comments. The Sitemap directive is appended
          automatically when present in `SeoSetting.robotsTxtAutoAppendSitemap`.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 bg-ih-accent text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save robots.txt'}
        </button>
        {saved && (
          <span className="font-mono text-[11px] text-ih-success">Saved ✓</span>
        )}
        {error && (
          <span className="font-mono text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">
            {error}
          </span>
        )}
      </div>
    </form>
  )
}
