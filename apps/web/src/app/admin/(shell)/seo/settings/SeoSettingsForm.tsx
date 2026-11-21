'use client'

import { useState, useTransition } from 'react'
import type { SeoSetting } from '@indus/db'
import { saveSeoSettings } from '../actions'
import { Input, Textarea } from '@indus/ui'

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
    <form action={handleSave} className="flex max-w-[640px] flex-col gap-5">
      <div>
        <label
          htmlFor="seosettings-defaultMetaTitleTemplate"
          className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
        >
          Default Title Template
        </label>
        <Input
          id="seosettings-defaultMetaTitleTemplate"
          name="defaultMetaTitleTemplate"
          type="text"
          defaultValue={seoSetting?.defaultMetaTitleTemplate ?? ''}
          placeholder="%s — Indus Hydraulics"
        />
        <p className="text-ih-muted mt-1 text-[11px]">
          Use %s for the page-specific title part. The OS falls back to the plain title if applying
          the template would push past 70 characters.
        </p>
      </div>

      <div>
        <label
          htmlFor="seosettings-defaultMetaDescription"
          className="text-ih-muted mb-1.5 block text-[10.5px] font-medium tracking-[0.13em] uppercase tabular-nums"
        >
          Default Meta Description
        </label>
        <Textarea
          id="seosettings-defaultMetaDescription"
          name="defaultMetaDescription"
          rows={3}
          defaultValue={seoSetting?.defaultMetaDescription ?? ''}
          placeholder="Indus Hydraulics — precision hydraulic components for industrial applications."
          className="resize-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-9 px-5 text-[12px] tabular-nums disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Settings'}
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
