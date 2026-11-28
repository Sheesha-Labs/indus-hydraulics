'use client'

import {
  parseVariables,
  TERMS_CATEGORIES,
  TERMS_CATEGORY_LABEL,
  type TermsCategory,
} from '@indus/ops-core'
import { Button, Checkbox, Select } from '@indus/ops-ui/controls'
import { Field } from '@indus/ops-ui/form'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClauseAction } from './actions/terms'
import ApprovalFields, { approvalFromForm } from './ApprovalFields'

/** Board 39 "New clause": category, title, wording with {variables}, defaults, approval rule and lock. */
export default function NewClauseModal({
  open,
  onOpenChange,
  category,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  category: TermsCategory
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const [body, setBody] = useState('')
  const { names, unknown } = parseVariables(body)
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New clause"
      width={560}
      note="Wording prints upper case; variables fill from the preset, the enquiry or one order."
      actions={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="new-clause"
            busy={busy}
            disabled={unknown.length > 0}
          >
            Add clause
          </Button>
        </>
      }
    >
      <form
        id="new-clause"
        className="flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          setBusy(true)
          const r = await createClauseAction({
            category: String(f.get('category')) as TermsCategory,
            title: String(f.get('title') ?? ''),
            body: String(f.get('body') ?? ''),
            defaults: Object.fromEntries(
              names.map((n) => [n, String(f.get(n) ?? '').trim()]).filter(([, v]) => v !== '')
            ),
            approvalRule: approvalFromForm(f),
            locked: f.get('locked') === 'on',
          })
          setBusy(false)
          if (!r.success) {
            toast({ kind: 'error', title: r.error })
            return
          }
          toast({ kind: 'success', title: `${r.data.code} added` })
          setBody('')
          onOpenChange(false)
          router.refresh()
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-io-ink-2 text-[12px] font-medium">Category</span>
            <Select
              size="md"
              name="category"
              aria-label="Category"
              defaultValue={category}
              options={TERMS_CATEGORIES.map((c) => ({ value: c, label: TERMS_CATEGORY_LABEL[c] }))}
            />
          </label>
          <Field type="text" name="title" label="Title" required />
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-io-ink-2 text-[12px] font-medium">Wording</span>
          <textarea
            name="body"
            required
            minLength={3}
            maxLength={600}
            rows={3}
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            aria-invalid={unknown.length > 0 || undefined}
            className="border-io-stroke rounded-io-ctl io-focus-field bg-io-card border px-3 py-2 text-[13px] leading-[1.5]"
          />
          <span
            className={unknown.length ? 'text-io-bad text-[11.5px]' : 'text-io-ink-3 text-[11.5px]'}
          >
            {unknown.length
              ? `{${unknown[0]}} is not a variable.`
              : 'Write {variable} where a value changes, e.g. {days} days from delivery.'}
          </span>
        </label>
        {names.length ? (
          <div className="grid grid-cols-2 gap-3">
            {names.map((n) => (
              <Field key={n} type="text" name={n} label={`Default {${n}}`} optional />
            ))}
          </div>
        ) : null}
        <ApprovalFields rule={null} />
        <Checkbox name="locked" label="Lock wording so the Assistant cannot change it" />
      </form>
    </Modal>
  )
}
