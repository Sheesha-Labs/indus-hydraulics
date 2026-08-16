'use client'

import { useActionState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { startScrape } from '../actions'

type State =
  | { kind: 'idle' }
  | {
      kind: 'error'
      message: string
      fieldErrors?: Record<string, string[]>
    }

const INITIAL: State = { kind: 'idle' }

export default function StartScrapeForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [state, formAction] = useActionState<State, FormData>(async (_prev, formData) => {
    const result = await startScrape(formData)
    if (!result.success) {
      return { kind: 'error', message: result.message, fieldErrors: result.fieldErrors }
    }
    // Navigate inside a transition so we still get the pending state until
    // the new page commits.
    startTransition(() => router.push(`/admin/scraper/${result.data.jobId}`))
    return { kind: 'idle' }
  }, INITIAL)

  const fieldErr = (key: string) =>
    state.kind === 'error' ? state.fieldErrors?.[key]?.[0] : undefined

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field
        label="Sitemap or listing URL *"
        hint="Paste the competitor's sitemap.xml URL, a category page, or any URL that points us at their catalogue."
        error={fieldErr('sourceUrl')}
      >
        <input
          required
          name="sourceUrl"
          type="url"
          placeholder="https://competitor.example/sitemap.xml"
          className="h-9 w-full px-3 border border-ih-border bg-ih-bg text-[13px] focus:outline-none focus:ring-2 focus:ring-ih-accent"
        />
      </Field>

      <Field
        label="OR paste specific product URLs"
        hint="One URL per line. If supplied, the crawler skips sitemap discovery and goes straight to these pages."
        error={fieldErr('urlListText')}
      >
        <textarea
          name="urlListText"
          rows={6}
          placeholder={'https://competitor.example/products/a10vso-71\nhttps://competitor.example/products/a4vg-125\n…'}
          className="w-full px-3 py-2 border border-ih-border bg-ih-bg text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-ih-accent"
        />
      </Field>

      <Field label="Notes (optional)" hint="Internal — shown on the job page only.">
        <input
          name="notes"
          maxLength={500}
          className="h-9 w-full px-3 border border-ih-border bg-ih-bg text-[13px]"
          placeholder="e.g. 'New competitor, axial-piston focus'"
        />
      </Field>

      {state.kind === 'error' && (
        <div
          role="alert"
          className="border border-[oklch(0.4_0.18_25)] bg-[oklch(0.97_0.04_25)] text-[oklch(0.3_0.18_25)] px-4 py-3 text-[13px]"
        >
          {state.message}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 bg-ih-accent text-white font-mono text-[12px] tracking-wider uppercase disabled:opacity-50"
        >
          {pending ? 'Starting…' : 'Start crawl'}
        </button>
        <p className="text-[11px] text-ih-muted">
          Discovery runs in the background — you&rsquo;ll land on the job page and watch progress live.
        </p>
      </div>
    </form>
  )
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-mono tracking-wider uppercase text-ih-muted">
        {label}
      </span>
      {children}
      {error ? (
        <span className="text-[12px] text-[oklch(0.5_0.18_25)]">{error}</span>
      ) : hint ? (
        <span className="text-[11px] text-ih-muted">{hint}</span>
      ) : null}
    </label>
  )
}
