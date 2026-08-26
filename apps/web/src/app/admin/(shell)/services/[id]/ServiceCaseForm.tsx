'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateServiceCase } from '../actions'

export type ServiceCaseRow = {
  id: string
  status: string
  isFeatured: boolean
  title: string
  titleAccent: string | null
  deck: string
  topicLabel: string
  region: string | null
  caseDateLabel: string | null
  cardOneLiner: string | null
  cardTagLabel: string
  cardTagStyle: string
  cardDurationLabel: string | null
  durationDays: number | null
  savingsAmount: number | null
  seoTitle: string | null
  seoDescription: string | null
  robotsIndex: boolean
}

/**
 * What actually gets edited after a case is written.
 *
 * The article body is not here on purpose: `bodyBlocks` has its own typed
 * schema and deserves the treatment the blog editor got rather than a JSON
 * textarea that can silently produce an unrenderable block.
 */
export default function ServiceCaseForm({ row }: { row: ServiceCaseRow }) {
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setMessage(null)
    setError(null)
    startTransition(async () => {
      const result = await updateServiceCase(formData)
      if (result.success) {
        setMessage('Saved. The case and the index are live.')
        router.refresh()
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6 py-4">
      <input type="hidden" name="id" value={row.id} />

      <Section title="Publishing">
        <Field label="Status">
          <select name="status" defaultValue={row.status} className={INPUT}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <Checkbox
          name="isFeatured"
          defaultChecked={row.isFeatured}
          label="Case of the Week"
          hint="One slot. Setting this clears whoever holds it."
        />
      </Section>

      <Section title="Hero">
        <Text name="title" label="Title" defaultValue={row.title} required />
        <Text name="titleAccent" label="Title accent" defaultValue={row.titleAccent ?? ''} />
        <Field label="Deck">
          <textarea name="deck" defaultValue={row.deck} rows={3} className={INPUT} required />
        </Field>
        <Text name="topicLabel" label="Topic pill" defaultValue={row.topicLabel} required />
        <Text name="region" label="Region pill" defaultValue={row.region ?? ''} />
        <Text name="caseDateLabel" label="Date line" defaultValue={row.caseDateLabel ?? ''} />
      </Section>

      <Section title="Index card">
        <Field label="One-liner">
          <textarea
            name="cardOneLiner"
            defaultValue={row.cardOneLiner ?? ''}
            rows={2}
            className={INPUT}
          />
        </Field>
        <Text name="cardTagLabel" label="Tag label" defaultValue={row.cardTagLabel} required />
        <Field label="Tag style">
          <select name="cardTagStyle" defaultValue={row.cardTagStyle} className={INPUT}>
            <option value="standard">Standard</option>
            <option value="oil">Oil</option>
          </select>
        </Field>
        <Text
          name="cardDurationLabel"
          label="Duration overlay"
          defaultValue={row.cardDurationLabel ?? ''}
        />
      </Section>

      <Section title="Sorting">
        <Text
          name="durationDays"
          label="Turnaround (days)"
          defaultValue={row.durationDays?.toString() ?? ''}
          hint="Sorts the “fastest turnaround” view. Blank sorts last."
        />
        <Text
          name="savingsAmount"
          label="Savings amount"
          defaultValue={row.savingsAmount?.toString() ?? ''}
          hint="Sorts the “biggest saving” view. Blank sorts last."
        />
      </Section>

      <Section title="SEO">
        <Text name="seoTitle" label="Meta title" defaultValue={row.seoTitle ?? ''} />
        <Field label="Meta description">
          <textarea
            name="seoDescription"
            defaultValue={row.seoDescription ?? ''}
            rows={2}
            className={INPUT}
          />
        </Field>
        <Checkbox name="robotsIndex" defaultChecked={row.robotsIndex} label="Allow indexing" />
      </Section>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? 'Saving…' : 'Save'}
        </button>
        {message ? <span className="text-sm">{message}</span> : null}
        {error ? <span className="text-ih-danger text-sm">{error}</span> : null}
      </div>
    </form>
  )
}

const INPUT = 'border-ih-border w-full rounded border px-3 py-2 text-sm'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-ih-border space-y-3 border-t pt-4">
      <legend className="mono text-ih-muted text-[11px] uppercase tracking-[0.1em]">{title}</legend>
      {children}
    </fieldset>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="text-ih-muted block text-xs">{hint}</span> : null}
    </label>
  )
}

function Text({
  name,
  label,
  defaultValue,
  hint,
  required,
}: {
  name: string
  label: string
  defaultValue: string
  hint?: string
  required?: boolean
}) {
  return (
    <Field label={label} hint={hint}>
      <input name={name} defaultValue={defaultValue} className={INPUT} required={required} />
    </Field>
  )
}

function Checkbox({
  name,
  label,
  defaultChecked,
  hint,
}: {
  name: string
  label: string
  defaultChecked: boolean
  hint?: string
}) {
  return (
    <label className="flex items-start gap-2">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1" />
      <span>
        <span className="text-sm font-medium">{label}</span>
        {hint ? <span className="text-ih-muted block text-xs">{hint}</span> : null}
      </span>
    </label>
  )
}
