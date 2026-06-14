'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  acceptProductBlueprint,
  queueProductBlueprintGeneration,
  refineProductBlueprint,
  rejectProductBlueprint,
  retryProductBlueprint,
} from './blueprintActions'
import { parseBlueprintContext } from '../../../../../lib/product-blueprint/types'

export type BlueprintSuggestionRow = {
  id: string
  status: 'pending' | 'accepted' | 'rejected' | 'superseded'
  output: string
  createdAtIso: string
  inputContext: unknown
}

type Props = {
  productId: string
  generationAvailable: boolean
  referenceImageUrl: string
  suggestions: BlueprintSuggestionRow[]
}

export default function BlueprintImagePanel({
  productId,
  generationAvailable,
  referenceImageUrl,
  suggestions,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [refinement, setRefinement] = useState('')
  const active = suggestions.find((suggestion) => suggestion.status === 'pending') ?? null
  const context = active ? parseBlueprintContext(active.inputContext) : null
  const isProcessing =
    context?.generationStatus === 'queued' || context?.generationStatus === 'generating'

  useEffect(() => {
    if (!isProcessing) return
    const timer = window.setInterval(() => router.refresh(), 3500)
    return () => window.clearInterval(timer)
  }, [isProcessing, router])

  function run(task: () => Promise<{ success: boolean; message?: string }>, onSuccess?: () => void) {
    setError(null)
    startTransition(async () => {
      const result = await task()
      if (!result.success) {
        setError(result.message ?? 'Action failed')
        return
      }
      onSuccess?.()
      router.refresh()
    })
  }

  function queue(formData: FormData) {
    run(() => queueProductBlueprintGeneration(formData))
  }

  function refine() {
    if (!active) return
    run(
      () => refineProductBlueprint(active.id, refinement),
      () => setRefinement(''),
    )
  }

  function retry() {
    if (!active) return
    run(() => retryProductBlueprint(active.id))
  }

  function accept() {
    if (!active) return
    run(() => acceptProductBlueprint(active.id))
  }

  function reject() {
    if (!active || !window.confirm('Reject this draft and delete its generated image?')) return
    run(() => rejectProductBlueprint(active.id))
  }

  return (
    <section className="border border-[var(--color-border)] bg-[var(--color-elevated)]">
      <div className="grid grid-cols-[1fr_150px] gap-5 border-b border-[var(--color-border)] p-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="bg-[var(--color-primary)] px-2 py-1 font-mono text-[10px] tracking-[0.12em] text-white">
              BLUEPRINT STUDIO
            </span>
            <span className="font-mono text-[10px] text-[var(--color-muted)]">
              GPT-5.5 · GPT IMAGE · HUMAN APPROVAL
            </span>
          </div>
          <h3 className="text-[17px] font-semibold text-[var(--color-primary)]">
            Generate an INDUS technical product plate
          </h3>
          <p className="mt-1 max-w-2xl text-[12px] leading-5 text-[var(--color-muted)]">
            The agent builds a product-specific prompt from verified catalogue data, follows the
            approved visual reference, and saves a draft for review. Nothing reaches the product
            page until you accept it.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={referenceImageUrl}
          alt="Approved INDUS technical blueprint style reference"
          className="aspect-[4/3] w-[150px] border border-[var(--color-border)] object-cover"
        />
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 border border-[var(--color-status-danger)] bg-[var(--color-status-danger)]/10 px-4 py-3 text-[12px] text-[var(--color-status-danger)]">
            {error}
          </div>
        )}

        {!generationAvailable && (
          <div className="mb-4 border border-[var(--color-border)] bg-[var(--color-deep)] px-4 py-3 text-[12px] text-[var(--color-muted)]">
            Generation is installed but inactive. Configure <code>OPENAI_API_KEY</code> in the
            admin environment and ensure the Inngest worker is connected.
          </div>
        )}

        {!active && (
          <form action={queue} className="space-y-3">
            <input type="hidden" name="productId" value={productId} />
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium">
                Optional product-specific visual direction
              </span>
              <textarea
                name="customInstructions"
                rows={4}
                maxLength={1500}
                placeholder="Example: Show a cutaway through the valve body, with the spool and return spring visible. Put the pressure port on the left."
                className="w-full border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] leading-5"
              />
            </label>
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] text-[var(--color-muted)]">
                Verified product specs are included automatically. Missing numeric facts are omitted,
                not invented.
              </p>
              <button
                type="submit"
                disabled={pending || !generationAvailable}
                className="h-10 shrink-0 bg-[var(--color-accent)] px-5 font-mono text-[11px] font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending ? 'QUEUING…' : 'GENERATE DRAFT'}
              </button>
            </div>
          </form>
        )}

        {active && context && isProcessing && (
          <div className="flex min-h-44 items-center justify-between gap-6 border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div>
              <p className="font-mono text-[11px] tracking-[0.12em] text-[var(--color-accent)]">
                {context.generationStatus === 'queued' ? 'QUEUED' : 'GENERATING'}
              </p>
              <p className="mt-2 text-[15px] font-medium">
                Building blueprint attempt {context.attempts}
              </p>
              <p className="mt-1 text-[12px] text-[var(--color-muted)]">
                This page refreshes automatically while the Inngest job runs.
              </p>
            </div>
            <div className="h-12 w-12 animate-pulse border-2 border-[var(--color-accent)] bg-[var(--color-accent)]/10" />
          </div>
        )}

        {active && context?.generationStatus === 'failed' && (
          <div className="border border-[var(--color-status-danger)] bg-[var(--color-status-danger)]/5 p-5">
            <p className="font-mono text-[11px] tracking-[0.12em] text-[var(--color-status-danger)]">
              GENERATION FAILED
            </p>
            <p className="mt-2 text-[12px] text-[var(--color-body)]">
              {context.error ?? 'The background job failed without an error message.'}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={retry}
                disabled={pending || !generationAvailable}
                className="h-9 bg-[var(--color-primary)] px-4 text-[12px] font-medium text-white disabled:opacity-40"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={reject}
                disabled={pending}
                className="h-9 border border-[var(--color-border)] px-4 text-[12px] text-[var(--color-muted)] disabled:opacity-40"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {active && context?.generationStatus === 'ready' && context.storagePath && (
          <div className="grid grid-cols-[minmax(360px,560px)_1fr] gap-6">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={context.storagePath}
                alt={`${context.productSnapshot.title} generated blueprint draft`}
                className="aspect-[4/3] w-full border border-[var(--color-border)] bg-white object-contain"
              />
              <p className="mt-2 font-mono text-[10px] text-[var(--color-muted)]">
                DRAFT · ATTEMPT {context.attempts} · NOT YET ON PRODUCT PAGE
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <p className="font-mono text-[10px] tracking-[0.12em] text-[var(--color-muted)]">
                  REVIEW CHECKLIST
                </p>
                <ul className="mt-2 space-y-1 text-[12px] leading-5 text-[var(--color-body)]">
                  <li>Product form and cutaway are technically plausible</li>
                  <li>Labels, numbers, units, and manufacturer identity are correct</li>
                  <li>No invented certifications, pressure ratings, or materials</li>
                  <li>Composition remains legible at product-card size</li>
                </ul>
              </div>

              <label className="block">
                <span className="mb-1 block text-[12px] font-medium">
                  Refinement instruction
                </span>
                <textarea
                  value={refinement}
                  onChange={(event) => setRefinement(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Example: Correct the temperature label to -40°C to +100°C and make the twin steel helix more visible."
                  className="w-full border border-[var(--color-border)] bg-white px-3 py-2 text-[13px] leading-5"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={accept}
                  disabled={pending}
                  className="h-10 bg-[oklch(0.43_0.13_145)] px-5 text-[12px] font-semibold text-white disabled:opacity-40"
                >
                  Accept onto product
                </button>
                <button
                  type="button"
                  onClick={refine}
                  disabled={pending || refinement.trim().length < 3}
                  className="h-10 bg-[var(--color-primary)] px-5 text-[12px] font-semibold text-white disabled:opacity-40"
                >
                  Refine draft
                </button>
                <button
                  type="button"
                  onClick={reject}
                  disabled={pending}
                  className="h-10 border border-[var(--color-border)] px-5 text-[12px] text-[var(--color-muted)] disabled:opacity-40"
                >
                  Reject
                </button>
              </div>

              <details className="border border-[var(--color-border)] bg-[var(--color-surface)]">
                <summary className="cursor-pointer px-3 py-2 font-mono text-[10px] tracking-[0.1em] text-[var(--color-muted)]">
                  VIEW EXACT GENERATION PROMPT
                </summary>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap border-t border-[var(--color-border)] p-3 text-[10px] leading-4 text-[var(--color-body)]">
                  {context.prompt}
                </pre>
              </details>
            </div>
          </div>
        )}

        {active && !context && (
          <div className="border border-[var(--color-status-danger)] p-4 text-[12px] text-[var(--color-status-danger)]">
            This draft has invalid generation metadata and cannot be reviewed safely.
          </div>
        )}
      </div>
    </section>
  )
}
