'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  acceptProductBlueprint,
  generateProductBlueprintPrompt,
  queueProductBlueprintGeneration,
  refineProductBlueprint,
  rejectProductBlueprint,
  retryProductBlueprint,
} from './blueprintActions'
import { parseBlueprintContext } from '../../../../../../lib/product-blueprint/types'

export type BlueprintSuggestionRow = {
  id: string
  status: 'pending' | 'accepted' | 'rejected' | 'superseded'
  output: string
  createdAtIso: string
  inputContext: unknown
}

type Props = {
  productId: string
  productTitle: string
  generationAvailable: boolean
  referenceImageUrl: string
  suggestions: BlueprintSuggestionRow[]
}

export default function BlueprintImagePanel({
  productId,
  productTitle,
  generationAvailable,
  referenceImageUrl,
  suggestions,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [copied, setCopied] = useState(false)
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

  function run(
    task: () => Promise<{ success: boolean; message?: string }>,
    onSuccess?: () => void
  ) {
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

  function generatePrompt() {
    setError(null)
    setCopied(false)
    startTransition(async () => {
      const result = await generateProductBlueprintPrompt(productId)
      if (!result.success) {
        setError(result.message)
        return
      }
      setPrompt(result.data.prompt)
    })
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
    } catch {
      setError('Could not copy the prompt to the clipboard')
    }
  }

  function refine() {
    if (!active) return
    run(
      () => refineProductBlueprint(active.id, refinement),
      () => setRefinement('')
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
    <section className="border-ih-border bg-ih-surface rounded-lg border">
      <div className="border-ih-border grid grid-cols-[1fr_150px] gap-5 border-b p-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="bg-ih-navy text-ih-bg px-2 py-1 text-[11px] tracking-[0.12em] tabular-nums">
              BLUEPRINT STUDIO
            </span>
            <span className="text-ih-muted text-[11px] tabular-nums">
              GPT-5.5 · GPT IMAGE · HUMAN APPROVAL
            </span>
          </div>
          <h3 className="text-ih-ink text-[18px] font-medium">
            Generate an INDUS technical product plate
          </h3>
          <p className="text-ih-muted mt-1 max-w-2xl text-[12px] leading-5">
            Generate a complete image prompt from the product title, review or edit it, then send
            that exact prompt into the approved INDUS blueprint image workflow. Nothing reaches the
            product page until you accept it.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={referenceImageUrl}
          alt="Approved INDUS technical blueprint style reference"
          className="border-ih-border aspect-[4/3] w-[150px] border object-cover"
        />
      </div>

      <div className="p-5">
        {error && (
          <div className="border-ih-danger text-ih-danger mb-4 rounded-lg border bg-[var(--color-ih-danger)]/10 px-4 py-3 text-[12px]">
            {error}
          </div>
        )}

        {!generationAvailable && (
          <div className="border-ih-border bg-ih-surface-2 text-ih-muted mb-4 rounded-lg border px-4 py-3 text-[12px]">
            Generation is installed but inactive. Configure <code>OPENAI_API_KEY</code> in the admin
            environment and ensure the Inngest worker is connected.
          </div>
        )}

        {!active && (
          <form action={queue} className="flex flex-col gap-4">
            <input type="hidden" name="productId" value={productId} />
            <div className="border-ih-border bg-ih-bg flex items-end justify-between gap-4 rounded-lg border p-4">
              <div>
                <p className="text-ih-muted text-[11px] tracking-[0.12em] tabular-nums">
                  TITLE-ONLY SOURCE
                </p>
                <p className="text-ih-ink mt-1 text-[14px] font-medium">{productTitle}</p>
                <p className="text-ih-muted mt-1 text-[11px]">
                  Catalogue descriptions and specifications are not sent to the prompt author.
                </p>
              </div>
              <button
                type="button"
                onClick={generatePrompt}
                disabled={pending || !generationAvailable}
                className="bg-ih-navy text-ih-bg hover:bg-ih-ink h-10 shrink-0 px-5 text-[11px] font-medium tabular-nums disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending ? 'AUTHORING…' : prompt ? 'REGENERATE PROMPT' : 'GENERATE PROMPT'}
              </button>
            </div>

            <label className="block">
              <span className="mb-1 flex items-center justify-between gap-4 text-[12px] font-medium">
                <span>Ready image prompt</span>
                <span className="text-ih-muted text-[11px] font-normal tabular-nums">
                  {prompt.length.toLocaleString()} / 12,000
                </span>
              </span>
              <textarea
                name="prompt"
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value)
                  setCopied(false)
                }}
                rows={16}
                maxLength={12000}
                placeholder="Select Generate prompt to author a complete blueprint image brief from this product title."
                className="border-ih-border bg-ih-surface w-full rounded-lg border px-3 py-3 text-[11px] leading-5 tabular-nums"
              />
            </label>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={copyPrompt}
                  disabled={!prompt}
                  className="border-ih-border text-ih-ink-2 h-9 rounded-md border px-4 text-[12px] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {copied ? 'Copied' : 'Copy prompt'}
                </button>
                <p className="text-ih-muted text-[11px]">
                  Edit freely. The image job uses the text shown above verbatim.
                </p>
              </div>
              <button
                type="submit"
                disabled={pending || !generationAvailable || prompt.trim().length < 400}
                className="bg-ih-accent text-ih-accent-fg hover:bg-ih-accent-hover h-10 shrink-0 px-5 text-[11px] font-medium tabular-nums disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pending ? 'WORKING…' : 'GENERATE IMAGE DRAFT'}
              </button>
            </div>
          </form>
        )}

        {active && context && isProcessing && (
          <div className="border-ih-border bg-ih-bg flex min-h-44 items-center justify-between gap-6 rounded-lg border p-6">
            <div>
              <p className="text-ih-accent text-[11px] tracking-[0.12em] tabular-nums">
                {context.generationStatus === 'queued' ? 'QUEUED' : 'GENERATING'}
              </p>
              <p className="mt-2 text-[15px] font-medium">
                Building blueprint attempt {context.attempts}
              </p>
              <p className="text-ih-muted mt-1 text-[12px]">
                This page refreshes automatically while the Inngest job runs.
              </p>
            </div>
            <div className="bg-ih-accent/10 border-ih-accent h-12 w-12 animate-pulse border-2" />
          </div>
        )}

        {active && context?.generationStatus === 'failed' && (
          <div className="border-ih-danger rounded-lg border bg-[var(--color-ih-danger)]/5 p-5">
            <p className="text-ih-danger text-[11px] tracking-[0.12em] tabular-nums">
              GENERATION FAILED
            </p>
            <p className="text-ih-ink-2 mt-2 text-[12px]">
              {context.error ?? 'The background job failed without an error message.'}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={retry}
                disabled={pending || !generationAvailable}
                className="bg-ih-navy text-ih-bg h-9 px-4 text-[12px] font-medium disabled:opacity-40"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={reject}
                disabled={pending}
                className="border-ih-border text-ih-muted h-9 rounded-md border px-4 text-[12px] disabled:opacity-40"
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
                className="border-ih-border bg-ih-surface aspect-[4/3] w-full rounded-lg border object-contain"
              />
              <p className="text-ih-muted mt-2 text-[11px] tabular-nums">
                DRAFT · ATTEMPT {context.attempts} · NOT YET ON PRODUCT PAGE
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <p className="text-ih-muted text-[11px] tracking-[0.12em] tabular-nums">
                  REVIEW CHECKLIST
                </p>
                <ul className="text-ih-ink-2 mt-2 flex flex-col gap-1 text-[12px] leading-5">
                  <li>Product form and cutaway are technically plausible</li>
                  <li>Labels, numbers, units, and manufacturer identity are correct</li>
                  <li>No invented certifications, pressure ratings, or materials</li>
                  <li>Composition remains legible at product-card size</li>
                </ul>
              </div>

              <label className="block">
                <span className="mb-1 block text-[12px] font-medium">Refinement instruction</span>
                <textarea
                  value={refinement}
                  onChange={(event) => setRefinement(event.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Example: Correct the temperature label to -40°C to +100°C and make the twin steel helix more visible."
                  className="border-ih-border bg-ih-surface w-full rounded-lg border px-3 py-2 text-[13px] leading-5"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={accept}
                  disabled={pending}
                  className="h-10 bg-[oklch(0.43_0.13_145)] px-5 text-[12px] font-medium text-white disabled:opacity-40"
                >
                  Accept onto product
                </button>
                <button
                  type="button"
                  onClick={refine}
                  disabled={pending || refinement.trim().length < 3}
                  className="bg-ih-navy text-ih-bg h-10 px-5 text-[12px] font-medium disabled:opacity-40"
                >
                  Refine draft
                </button>
                <button
                  type="button"
                  onClick={reject}
                  disabled={pending}
                  className="border-ih-border text-ih-muted h-10 rounded-md border px-5 text-[12px] disabled:opacity-40"
                >
                  Reject
                </button>
              </div>

              <details className="border-ih-border bg-ih-bg rounded-lg border">
                <summary className="text-ih-muted cursor-pointer px-3 py-2 text-[11px] tracking-[0.1em] tabular-nums">
                  VIEW EXACT GENERATION PROMPT
                </summary>
                <pre className="border-ih-border text-ih-ink-2 max-h-72 overflow-auto border-t p-3 text-[11px] leading-4 whitespace-pre-wrap">
                  {context.prompt}
                </pre>
              </details>
            </div>
          </div>
        )}

        {active && !context && (
          <div className="border-ih-danger text-ih-danger rounded-lg border p-4 text-[12px]">
            This draft has invalid generation metadata and cannot be reviewed safely.
          </div>
        )}
      </div>
    </section>
  )
}
