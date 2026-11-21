'use client'

import { useState, useTransition, useId } from 'react'
import { DiffView, Textarea } from '@indus/ui'
import {
  generateSuggestion,
  acceptSuggestion,
  rejectSuggestion,
} from '../../../app/admin/(shell)/seo/ai/actions'

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
  const editId = useId()
  const [meta, setMeta] = useState<{ costUsdMicros: number; cacheHitRatio: number | null } | null>(
    null
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
        className="text-ih-accent hover:bg-ih-surface-2 hover:border-ih-border inline-flex h-7 items-center gap-1 rounded-md border border-transparent px-2 text-[11px] tabular-nums disabled:opacity-50"
        title={`Generate ${fieldLabel[field]} with Claude`}
      >
        ✨ {pending && !suggestion ? 'Thinking…' : 'Suggest'}
      </button>

      {open && (
        <div className="border-ih-border bg-ih-surface absolute right-0 z-20 mt-1 w-[480px] rounded-lg border p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-ih-muted text-[10.5px] tracking-[0.1em] uppercase tabular-nums">
              AI Suggestion
            </p>
            <button
              type="button"
              onClick={handleReject}
              disabled={pending}
              className="text-ih-muted hover:text-ih-ink-2 text-[14px]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {error && (
            <div
              className="bg-ih-danger-soft text-ih-danger-ink mb-3 rounded-lg border border-[oklch(0.4_0.18_25)] px-3 py-2 text-[12px]"
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
                {/*
                  useId, not a static string: this button renders once per SEO
                  field on the page, so a fixed id would repeat and every
                  label would resolve to whichever textarea came first.
                */}
                <label
                  htmlFor={editId}
                  className="text-ih-muted mb-1 block text-[10.5px] uppercase tabular-nums"
                >
                  Edit before accepting (optional)
                </label>
                <Textarea
                  id={editId}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={field === 'seoDescription' ? 3 : 2}
                  className="px-2 py-1.5 text-[12px]"
                />
              </div>

              {meta && (
                <p className="text-ih-muted mb-3 text-[11px] tabular-nums">
                  ${(meta.costUsdMicros / 1_000_000).toFixed(4)} this call
                  {meta.cacheHitRatio !== null
                    ? ` · cache ${(meta.cacheHitRatio * 100).toFixed(0)}%`
                    : ''}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={pending}
                  className="border-ih-border text-ih-ink-2 hover:bg-ih-surface-2 h-8 rounded-md border px-3 text-[11px] tabular-nums disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleAccept(true)}
                  disabled={pending}
                  className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-8 px-3 text-[11px] tabular-nums disabled:opacity-50"
                >
                  Accept{editValue.trim() !== suggestion.trim() ? ' edit' : ''}
                </button>
              </div>
            </>
          )}

          {!suggestion && !error && pending && (
            <p className="text-ih-muted py-3 text-[11px] tabular-nums">Calling Claude…</p>
          )}
        </div>
      )}
    </div>
  )
}
