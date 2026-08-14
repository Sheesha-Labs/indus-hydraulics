'use client'

import { useState, useTransition } from 'react'
import { DiffView } from '@indus/ui'
import {
  generateSuggestion,
  acceptSuggestion,
  rejectSuggestion,
} from '../../app/admin/(shell)/seo/ai/actions'

type Field = 'seoTitle' | 'seoDescription' | 'focusKeyword'

interface Props {
  entityType: 'product' | 'category' | 'brand' | 'industry' | 'cms_page' | 'blog_post'
  entityId: string
  field: Field
  /** Currently-typed-in value in the drawer (compared in the diff view). */
  currentValue: string
  /** Called when the suggestion is accepted; parent updates form state. */
  onAccepted: (newValue: string) => void
}

/**
 * Inline "Suggest with AI" button with a popover diff. Opens, calls the
 * Anthropic-backed `generateSuggestion`, shows the suggestion side-by-side
 * with the current value, and lets the editor accept (writes through to
 * the entity field + audit log) or reject.
 *
 * Uses an `<details>` element so we don't need a portal/Dialog primitive
 * for v1 — keeps the component dependency-free.
 */
export default function AiSuggestButton({
  entityType,
  entityId,
  field,
  currentValue,
  onAccepted,
}: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [suggestionId, setSuggestionId] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<string>('')
  const [editValue, setEditValue] = useState<string>('')
  const [meta, setMeta] = useState<{ costUsdMicros: number; cacheHitRatio: number | null } | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

  function handleGenerate() {
    setError(null)
    setSuggestion('')
    setSuggestionId(null)
    setMeta(null)
    setOpen(true)
    startTransition(async () => {
      const res = await generateSuggestion({ entityType, entityId, field })
      if (!res.success) {
        setError(res.message)
        return
      }
      setSuggestion(res.data.output)
      setEditValue(res.data.output)
      setSuggestionId(res.data.suggestionId)
      setMeta({ costUsdMicros: res.data.costUsdMicros, cacheHitRatio: res.data.cacheHitRatio })
    })
  }

  function handleAccept(useEdited: boolean) {
    if (!suggestionId) return
    setError(null)
    const value = useEdited && editValue.trim().length > 0 ? editValue.trim() : suggestion
    startTransition(async () => {
      const res = await acceptSuggestion(suggestionId, useEdited ? value : null)
      if (!res.success) {
        setError(res.message)
        return
      }
      onAccepted(value)
      setOpen(false)
      setSuggestion('')
      setSuggestionId(null)
    })
  }

  function handleReject() {
    if (!suggestionId) {
      setOpen(false)
      return
    }
    setError(null)
    startTransition(async () => {
      const res = await rejectSuggestion(suggestionId)
      if (!res.success) {
        setError(res.message)
        return
      }
      setOpen(false)
      setSuggestion('')
      setSuggestionId(null)
    })
  }

  const fieldLabel: Record<Field, string> = {
    seoTitle: 'title',
    seoDescription: 'description',
    focusKeyword: 'keyword',
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleGenerate}
        disabled={pending}
        className="inline-flex items-center gap-1 h-7 px-2 font-mono text-[11px] text-[var(--color-accent)] hover:bg-[var(--color-deep)] border border-transparent hover:border-[var(--color-border)] disabled:opacity-50"
        title={`Generate ${fieldLabel[field]} with Claude`}
      >
        ✨ {pending && !suggestion ? 'Thinking…' : 'Suggest'}
      </button>

      {open && (
        <div className="absolute z-20 right-0 mt-1 w-[480px] border border-[var(--color-border)] bg-white shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-[var(--color-muted)]">
              AI Suggestion
            </p>
            <button
              type="button"
              onClick={handleReject}
              disabled={pending}
              className="text-[var(--color-muted)] hover:text-[var(--color-body)] text-[14px]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {error && (
            <div
              className="mb-3 px-3 py-2 border border-[oklch(0.4_0.18_25)] bg-[oklch(0.97_0.04_25)] text-[12px] text-[oklch(0.5_0.18_25)]"
              role="alert"
            >
              {error}
            </div>
          )}

          {suggestion && (
            <>
              <DiffView
                before={currentValue}
                after={suggestion}
                beforeLabel="Current"
                afterLabel="Suggested"
                className="mb-3"
              />

              <div className="mb-3">
                <label className="block font-mono text-[10px] uppercase text-[var(--color-muted)] mb-1">
                  Edit before accepting (optional)
                </label>
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={field === 'seoDescription' ? 3 : 2}
                  className="w-full px-2 py-1.5 border border-[var(--color-border)] bg-white text-[12px] resize-y focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              {meta && (
                <p className="font-mono text-[10px] text-[var(--color-muted)] mb-3">
                  ${(meta.costUsdMicros / 1_000_000).toFixed(4)} this call
                  {meta.cacheHitRatio !== null
                    ? ` · cache ${(meta.cacheHitRatio * 100).toFixed(0)}%`
                    : ''}
                </p>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={pending}
                  className="h-8 px-3 font-mono text-[11px] border border-[var(--color-border)] text-[var(--color-body)] hover:bg-[var(--color-deep)] disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleAccept(true)}
                  disabled={pending}
                  className="h-8 px-3 font-mono text-[11px] bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-50"
                >
                  Accept{editValue.trim() !== suggestion.trim() ? ' edit' : ''}
                </button>
              </div>
            </>
          )}

          {!suggestion && !error && pending && (
            <p className="font-mono text-[11px] text-[var(--color-muted)] py-3">
              Calling Claude…
            </p>
          )}
        </div>
      )}
    </div>
  )
}
