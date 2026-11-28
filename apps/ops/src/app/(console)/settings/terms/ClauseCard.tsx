'use client'

import {
  approvalRuleLabel,
  parseVariables,
  renderClause,
  type ApprovalRule,
  type TermsValues,
} from '@indus/ops-core'
import { Button, Checkbox } from '@indus/ops-ui/controls'
import { Field } from '@indus/ops-ui/form'
import { useToast } from '@indus/ops-ui/overlay'
import { Chip, SignoffTag, Tag } from '@indus/ops-ui/status'
import { cn } from '@indus/ops-ui'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import type { ClauseView, PresetView } from '../../../../server/terms/clauses'
import {
  archiveClauseAction,
  setDefaultClauseAction,
  setPresetClauseAction,
  setPresetValuesAction,
  updateClauseAction,
} from './actions/terms'
import ApprovalFields, { approvalFromForm } from './ApprovalFields'
import ClauseBody from './ClauseBody'
import { SAMPLE_CONTEXT, SAMPLE_LABEL } from './sample'

interface ClauseCardProps {
  clause: ClauseView
  /** The preset picked on the right: its values for this clause, and membership. */
  preset: PresetView | null
  isOwner: boolean
}

const valuesFrom = (form: FormData, names: readonly string[]): Record<string, string> =>
  Object.fromEntries(
    names.map((n) => [n, String(form.get(n) ?? '').trim()]).filter(([, v]) => v !== '')
  )

/**
 * Board 39's clause card: code, tags (default, presets, source, approval rule, lock), the body with its
 * variables, Edit (Owner). With a preset picked, the clause's values in that preset and a live preview on a
 * sample enquiry; the Owner may change the values or take the clause in or out of the preset.
 */
export default function ClauseCard({ clause: c, preset, isOwner }: ClauseCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const inPreset = preset ? c.presets.find((x) => x.id === preset.id) : undefined
  const { names } = parseVariables(c.body)
  const [values, setValues] = useState<TermsValues>({ ...c.defaults, ...(inPreset?.values ?? {}) })
  const preview = renderClause(c.body, { ...SAMPLE_CONTEXT, ...values })

  async function run(p: Promise<{ success: boolean; error?: string }>, ok?: string) {
    setBusy(true)
    const r = await p
    setBusy(false)
    if (!r.success) {
      toast({ kind: 'error', title: r.error ?? 'Something went wrong' })
      return false
    }
    if (ok) toast({ kind: 'success', title: ok })
    router.refresh()
    return true
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const body = String(f.get('body') ?? '')
    const ok = await run(
      updateClauseAction({
        id: c.id,
        version: c.version,
        patch: {
          title: String(f.get('title') ?? ''),
          body,
          defaults: valuesFrom(f, parseVariables(body).names),
          approvalRule: approvalFromForm(f),
          locked: f.get('locked') === 'on',
        },
      }),
      `${c.code} saved`
    )
    if (ok) setEditing(false)
  }

  const tags = (
    <span className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="text-io-ink-3 w-9 flex-none text-[12px]">{c.code}</span>
      {c.presets.length
        ? c.presets.map((x, i) => (
            <Chip key={x.id} tone="acc" label={c.isDefault && i === 0 ? `Default · ${x.name}` : x.name} />
          ))
        : c.isDefault
          ? <Chip tone="acc" label="Default" />
          : null}
      {c.sourceRef ? <Chip tone="n" label={c.sourceRef} /> : null}
      {c.approvalRule ? <Chip tone="warn" label={approvalRuleLabel(c.approvalRule)} /> : null}
      {c.locked ? <Tag kind="lock">Locked</Tag> : null}
      {c.signoffStatus === 'awaiting' ? <SignoffTag /> : null}
    </span>
  )

  return (
    <article
      aria-label={`${c.code} ${c.title}`}
      data-clause={c.code}
      className={cn(
        'rounded-io-card bg-io-card flex flex-col gap-3 border px-[18px] py-4',
        inPreset ? 'border-io-accent' : 'border-io-line'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {tags}
        {isOwner && !editing ? (
          <Button variant="link" onClick={() => setEditing(true)} aria-label={`Edit ${c.code}`}>
            Edit
          </Button>
        ) : null}
      </div>
      {editing ? (
        <form onSubmit={save} className="flex flex-col gap-3">
          <Field type="text" name="title" label="Title" defaultValue={c.title} required />
          <Field
            type="textarea"
            name="body"
            label="Wording"
            defaultValue={c.body}
            required
            hint="Write {variable} where a value changes; it prints upper case."
          />
          {names.length ? (
            <div className="grid grid-cols-2 gap-3">
              {names.map((n) => (
                <Field
                  key={n}
                  type="text"
                  name={n}
                  label={`Default {${n}}`}
                  defaultValue={c.defaults[n] === undefined ? '' : String(c.defaults[n])}
                  optional
                />
              ))}
            </div>
          ) : null}
          <ApprovalFields rule={c.approvalRule as ApprovalRule | null} />
          <Checkbox name="locked" label="Lock wording so the Assistant cannot change it" defaultChecked={c.locked} />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" variant="secondary" busy={busy}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <span className="flex-1" />
            {!c.isDefault ? (
              <Button
                variant="ghost"
                onClick={() => run(setDefaultClauseAction({ id: c.id }), `${c.code} is the default`)}
              >
                Make default
              </Button>
            ) : null}
            <Button
              variant="danger"
              onClick={() => run(archiveClauseAction({ id: c.id }), `${c.code} archived`)}
            >
              Archive
            </Button>
          </div>
        </form>
      ) : (
        <ClauseBody body={c.body} />
      )}
      {preset && !editing ? (
        <div className="border-io-line flex flex-col gap-2.5 border-t pt-3">
          {isOwner ? (
            <Checkbox
              label={`In ${preset.name}`}
              checked={!!inPreset}
              disabled={busy}
              onChange={(e) =>
                run(
                  setPresetClauseAction({
                    presetId: preset.id,
                    clauseId: c.id,
                    member: e.currentTarget.checked,
                  })
                )
              }
            />
          ) : null}
          {inPreset && names.length ? (
            <form
              className="grid grid-cols-[repeat(2,minmax(0,1fr))] items-end gap-3"
              onInput={(e) => setValues(valuesFrom(new FormData(e.currentTarget), names))}
              onSubmit={(e) => {
                e.preventDefault()
                void run(
                  setPresetValuesAction({
                    presetId: preset.id,
                    clauseId: c.id,
                    values: valuesFrom(new FormData(e.currentTarget), names),
                  }),
                  `${preset.name} values saved`
                )
              }}
            >
              {names.map((n) => (
                <Field
                  key={n}
                  type="text"
                  name={n}
                  label={n}
                  defaultValue={values[n] === undefined ? '' : String(values[n])}
                  {...(isOwner ? {} : { state: 'readonly' as const })}
                />
              ))}
              {isOwner ? (
                <Button type="submit" size="sm" className="justify-self-start" busy={busy}>
                  Save values
                </Button>
              ) : null}
            </form>
          ) : null}
          {inPreset ? (
            <p className="text-io-ink-2 m-0 text-[12.5px] leading-[1.45]">
              <span className="text-io-ink-3">{SAMPLE_LABEL}: </span>
              {preview.ok ? preview.text : <span className="text-io-bad">{preview.error}</span>}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
