'use client'

import { useState, useTransition } from 'react'
import type { SeoSetting } from '@indus/db'
import { saveSeoSettings } from '../actions'

interface Props {
  seoSetting: SeoSetting | null
}

/**
 * Default meta-title template + default description shown when an entity
 * has no override. Edited via the existing `saveSeoSettings` server action.
 */
export default function SeoSettingsForm({ seoSetting }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSave(formData: FormData) {
    setError(null)
    // Preserve robotsTxt — saveSeoSettings clobbers all four fields.
    formData.set('robotsTxt', seoSetting?.robotsTxt ?? '')
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
    <form action={handleSave} className="max-w-[640px] space-y-5">
      <div>
        <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
          Default Title Template
        </label>
        <input
          name="defaultMetaTitleTemplate"
          type="text"
          defaultValue={seoSetting?.defaultMetaTitleTemplate ?? ''}
          placeholder="%s — Indus Hydraulics"
          className="w-full h-10 px-3 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
        />
        <p className="mt-1 text-[11px] text-[var(--color-muted)]">
          Use %s for the page-specific title part. The OS falls back to the plain title if applying the template would push past 70 characters.
        </p>
      </div>

      <div>
        <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
          Default Meta Description
        </label>
        <textarea
          name="defaultMetaDescription"
          rows={3}
          defaultValue={seoSetting?.defaultMetaDescription ?? ''}
          placeholder="Indus Hydraulics — precision hydraulic components for industrial applications."
          className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-elevated)] text-[13px] focus:outline-none focus:border-[var(--color-accent)] resize-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && (
          <span className="font-mono text-[11px] text-[var(--color-good)]">Saved ✓</span>
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
