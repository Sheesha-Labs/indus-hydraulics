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
    <form action={handleSave} className="max-w-[640px] flex flex-col gap-5">
      <div>
        <label htmlFor="seosettings-defaultMetaTitleTemplate" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
          Default Title Template
        </label>
        <Input
          id="seosettings-defaultMetaTitleTemplate"
          name="defaultMetaTitleTemplate"
          type="text"
          defaultValue={seoSetting?.defaultMetaTitleTemplate ?? ''}
          placeholder="%s — Indus Hydraulics" />
        <p className="mt-1 text-[11px] text-ih-muted">
          Use %s for the page-specific title part. The OS falls back to the plain title if applying the template would push past 70 characters.
        </p>
      </div>

      <div>
        <label htmlFor="seosettings-defaultMetaDescription" className="block font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-muted mb-1.5">
          Default Meta Description
        </label>
        <Textarea
          id="seosettings-defaultMetaDescription"
          name="defaultMetaDescription"
          rows={3}
          defaultValue={seoSetting?.defaultMetaDescription ?? ''}
          placeholder="Indus Hydraulics — precision hydraulic components for industrial applications." className="resize-none" />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 bg-ih-accent text-ih-accent-fg font-mono text-[12px] hover:bg-ih-accent-hover disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && (
          <span className="font-mono text-[11px] text-ih-success">Saved ✓</span>
        )}
        {error && (
          <span className="font-mono text-[11px] text-ih-danger-ink" role="alert">
            {error}
          </span>
        )}
      </div>
    </form>
  )
}
