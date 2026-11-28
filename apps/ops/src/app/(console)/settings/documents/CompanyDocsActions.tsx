'use client'

import { Button, Checkbox, Select } from '@indus/ops-ui/controls'
import { Field } from '@indus/ops-ui/form'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import HeaderActions from '../../../../components/route/HeaderActions'
import { putFile } from '../../../../components/directory/wizard/DocumentsStep'
import { COMPANY_DOC_KINDS, COMPANY_DOC_LABEL, USED_IN } from '../../../../lib/company-docs'
import {
  archiveCompanyDocumentAction,
  companyDocSlotAction,
  saveCompanyDocumentAction,
} from './actions/documents'

type Kind = (typeof COMPANY_DOC_KINDS)[number]
export interface DocForEdit {
  id: string
  kind: Kind
  title: string
  fileId: string | null
  usedIn: string[]
  expiresAt: string | null
}

/** "Add document" (the one primary, in the header) and its modal. */
export default function CompanyDocsActions() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <HeaderActions>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Add document
        </Button>
      </HeaderActions>
      <DocModal open={open} onOpenChange={setOpen} replacing={null} />
    </>
  )
}

/** A row's actions: open the file, Replace (a new version; the old one is archived), Archive. */
export function DocRowActions({ doc, isOwner }: { doc: DocForEdit; isOwner: boolean }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  return (
    <span className="flex items-center justify-end gap-1">
      {doc.fileId ? (
        <a
          href={`/api/files/${doc.fileId}?inline=1`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-io-accent io-focus rounded-io-tag px-1 text-[12.5px]"
        >
          Open<span className="sr-only"> {doc.title}</span>
        </a>
      ) : null}
      {isOwner ? (
        <>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setOpen(true)}
            aria-label={`Replace ${doc.title}`}
          >
            Replace
          </Button>
          <Button
            size="xs"
            variant="ghost"
            aria-label={`Archive ${doc.title}`}
            onClick={async () => {
              const r = await archiveCompanyDocumentAction({ id: doc.id })
              if (!r.success) toast({ kind: 'error', title: r.error })
              else toast({ kind: 'success', title: `${doc.title} archived` })
              router.refresh()
            }}
          >
            Archive
          </Button>
          <DocModal open={open} onOpenChange={setOpen} replacing={doc} />
        </>
      ) : null}
    </span>
  )
}

function DocModal({
  open,
  onOpenChange,
  replacing,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  replacing: DocForEdit | null
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const formId = replacing ? `doc-${replacing.id}` : 'doc-new'

  async function submit(f: FormData) {
    setBusy(true)
    let upload: { key: string; filename: string } | null = null
    if (file) {
      const slot = await companyDocSlotAction({ name: file.name, size: file.size })
      if (!slot.success || !(await putFile(slot.data.uploadUrl, file))) {
        setBusy(false)
        toast({
          kind: 'error',
          title: slot.success ? 'The upload did not arrive. Try again.' : slot.error,
        })
        return
      }
      upload = { key: slot.data.key, filename: file.name }
    }
    const r = await saveCompanyDocumentAction({
      kind: String(f.get('kind')) as Kind,
      title: String(f.get('title') ?? ''),
      number: String(f.get('number') ?? '').trim() || null,
      issuer: String(f.get('issuer') ?? '').trim() || null,
      expiresAt: String(f.get('expiresAt') ?? '') || null,
      usedIn: f.getAll('usedIn').map(String) as (typeof USED_IN)[number][],
      upload,
      replaces: replacing?.id ?? null,
    })
    setBusy(false)
    if (!r.success) {
      toast({ kind: 'error', title: r.error })
      return
    }
    toast({ kind: 'success', title: replacing ? `${replacing.title} replaced` : 'Document added' })
    setFile(null)
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={replacing ? `Replace ${replacing.title}` : 'Add document'}
      note={
        replacing
          ? 'The current one is archived and kept in the history.'
          : 'Reminders at 60, 30 and 7 days before expiry.'
      }
      actions={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form={formId} busy={busy}>
            {replacing ? 'Replace' : 'Add document'}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          void submit(new FormData(e.currentTarget))
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-io-ink-2 text-[12px] font-medium">Kind</span>
            <Select
              size="md"
              name="kind"
              aria-label="Kind"
              defaultValue={replacing?.kind ?? 'trade_licence'}
              options={COMPANY_DOC_KINDS.map((k) => ({ value: k, label: COMPANY_DOC_LABEL[k] }))}
            />
          </label>
          <Field
            type="text"
            name="title"
            label="Title"
            required
            defaultValue={replacing?.title ?? ''}
          />
          <Field type="text" name="issuer" label="Issued by" optional />
          <Field type="text" name="number" label="Number" optional />
          <Field
            type="date"
            name="expiresAt"
            label="Expires"
            optional
            defaultValue={replacing?.expiresAt ?? ''}
          />
        </div>
        <fieldset className="m-0 flex flex-wrap gap-x-4 gap-y-2 border-0 p-0">
          <legend className="text-io-ink-2 mb-1.5 text-[12px] font-medium">Used in</legend>
          {USED_IN.map((u) => (
            <Checkbox
              key={u}
              name="usedIn"
              value={u}
              label={u}
              defaultChecked={replacing?.usedIn.includes(u) ?? false}
            />
          ))}
        </fieldset>
        <label className="border-io-stroke rounded-io-ctl bg-io-paper io-focus flex cursor-pointer flex-col gap-1 border border-dashed px-4 py-4 text-center text-[13px]">
          <span className="font-medium">{file ? file.name : 'Choose the file'}</span>
          <span className="text-io-ink-3 text-[12px]">
            PDF, PNG or JPEG, up to 20 MB
            {replacing?.fileId ? ' · empty keeps the current file' : ''}
          </span>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            className="sr-only"
            aria-label="Document file"
            onChange={(e) => setFile(e.currentTarget.files?.[0] ?? null)}
          />
        </label>
      </form>
    </Modal>
  )
}
