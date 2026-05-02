'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import type { SeoSetting, Redirect } from '@indus/db'
import { saveSeoSettings, addRedirect, deleteRedirect } from '../app/(shell)/seo/actions'

interface Props {
  activeTab: string
  seoSetting: SeoSetting | null
  redirects: Redirect[]
}

const TABS = [
  { id: 'settings', label: 'Meta Settings' },
  { id: 'robots', label: 'Robots.txt' },
  { id: 'redirects', label: 'Redirects' },
]

export default function SeoPageClient({ activeTab, seoSetting, redirects: initialRedirects }: Props) {
  const [isPending, startTransition] = useTransition()
  const [redirects, setRedirects] = useState(initialRedirects)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSave(formData: FormData) {
    setError(null)
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

  function handleAddRedirect(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await addRedirect(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      const from = formData.get('fromPath') as string
      const to = formData.get('toPath') as string
      const code = parseInt(formData.get('statusCode') as string, 10) || 301
      setRedirects((prev) => [
        { id: Date.now().toString(), fromPath: from, toPath: to, statusCode: code, createdAt: new Date() },
        ...prev.filter((r) => r.fromPath !== from),
      ])
    })
  }

  function handleDelete(id: string) {
    setError(null)
    startTransition(async () => {
      const res = await deleteRedirect(id)
      if (!res.success) {
        setError(res.message)
        return
      }
      setRedirects((prev) => prev.filter((r) => r.id !== id))
    })
  }

  return (
    <>
      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] mb-6">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={`?tab=${tab.id}`}
            className={`px-4 py-2.5 font-mono text-[12px] border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-[var(--color-accent)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-body)]'
            }`}
          >
            {tab.label}
            {tab.id === 'redirects' && initialRedirects.length > 0 && (
              <span className="ml-1.5 font-mono text-[10px] bg-[var(--color-deep)] px-1.5 py-0.5">
                {initialRedirects.length}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Meta Settings tab */}
      {activeTab === 'settings' && (
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
            <p className="mt-1 text-[11px] text-[var(--color-muted)]">Use %s for the page-specific title part.</p>
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
              <span className="font-mono text-[11px] text-[oklch(0.5_0.18_25)]" role="alert">{error}</span>
            )}
          </div>
        </form>
      )}

      {/* Robots.txt tab */}
      {activeTab === 'robots' && (
        <form action={handleSave} className="max-w-[640px] space-y-5">
          <input type="hidden" name="defaultMetaTitleTemplate" value={seoSetting?.defaultMetaTitleTemplate ?? ''} />
          <input type="hidden" name="defaultMetaDescription" value={seoSetting?.defaultMetaDescription ?? ''} />
          <div>
            <label className="block font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-1.5">
              robots.txt content
            </label>
            <textarea
              name="robotsTxt"
              rows={14}
              defaultValue={seoSetting?.robotsTxt ?? 'User-agent: *\nAllow: /\n\nSitemap: https://indushydraulics.com/sitemap.xml'}
              className="w-full px-3 py-2.5 border border-[var(--color-border)] bg-[var(--color-elevated)] font-mono text-[12px] focus:outline-none focus:border-[var(--color-accent)] resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="h-9 px-5 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Save robots.txt'}
            </button>
            {saved && (
              <span className="font-mono text-[11px] text-[var(--color-good)]">Saved ✓</span>
            )}
          </div>
        </form>
      )}

      {/* Redirects tab */}
      {activeTab === 'redirects' && (
        <div className="max-w-[800px]">
          {/* Add redirect form */}
          <form action={handleAddRedirect} className="border border-[var(--color-border)] bg-[var(--color-elevated)] p-4 mb-6">
            <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--color-muted)] mb-3">Add Redirect</p>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block font-mono text-[10px] uppercase text-[var(--color-muted)] mb-1">From Path</label>
                <input
                  name="fromPath"
                  type="text"
                  required
                  placeholder="/old-page"
                  className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
              <div className="flex-1">
                <label className="block font-mono text-[10px] uppercase text-[var(--color-muted)] mb-1">To Path</label>
                <input
                  name="toPath"
                  type="text"
                  required
                  placeholder="/new-page"
                  className="w-full h-9 px-3 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>
              <div className="w-24">
                <label className="block font-mono text-[10px] uppercase text-[var(--color-muted)] mb-1">Code</label>
                <select
                  name="statusCode"
                  className="w-full h-9 px-2 border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] focus:outline-none"
                >
                  <option value="301">301</option>
                  <option value="302">302</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="h-9 px-4 bg-[var(--color-accent)] text-white font-mono text-[12px] hover:opacity-90 disabled:opacity-50 shrink-0"
              >
                Add
              </button>
            </div>
          </form>

          {/* Redirects table */}
          {redirects.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-[var(--color-border)]">
              <p className="text-[var(--color-muted)] text-[13px]">No redirects configured.</p>
            </div>
          ) : (
            <div className="border border-[var(--color-border)] overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-deep)]">
                    <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">From</th>
                    <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">To</th>
                    <th className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">Code</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {redirects.map((r) => (
                    <tr key={r.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-deep)]">
                      <td className="px-4 py-3 font-mono text-[12px] text-[var(--color-muted)]">{r.fromPath}</td>
                      <td className="px-4 py-3 text-[var(--color-body)]">{r.toPath}</td>
                      <td className="px-4 py-3 font-mono text-[12px]">{r.statusCode}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={isPending}
                          className="font-mono text-[11px] text-[var(--color-danger)] hover:underline disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  )
}
