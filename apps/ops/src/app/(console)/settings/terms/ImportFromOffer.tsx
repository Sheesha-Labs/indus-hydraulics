'use client'

import { Button } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { putFile } from '../../../../components/directory/wizard/DocumentsStep'
import { startTermsImportAction, termsImportSlotAction } from './actions/terms'

/**
 * Board 39 "Import from offer": pick an INDUS/Q PDF; it uploads to private storage and the Assistant reads its
 * terms into candidates, listed above the clauses for you to accept one by one. Nothing is added by itself.
 */
export default function ImportFromOffer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)

  async function start() {
    if (!file) return
    setBusy(true)
    const slot = await termsImportSlotAction({ name: file.name, size: file.size })
    if (!slot.success || !(await putFile(slot.data.uploadUrl, file))) {
      setBusy(false)
      toast({
        kind: 'error',
        title: slot.success ? 'The upload did not arrive. Try again.' : slot.error,
      })
      return
    }
    const r = await startTermsImportAction({ key: slot.data.key, filename: file.name })
    setBusy(false)
    if (!r.success) {
      toast({ kind: 'error', title: r.error })
      return
    }
    toast({ kind: 'success', title: 'Reading the offer’s terms' })
    setFile(null)
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Import from offer"
      note="The file stays in private storage; it is never shared."
      actions={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={start} busy={busy} disabled={!file}>
            Read the terms
          </Button>
        </>
      }
    >
      <p className="m-0 mb-3">
        Choose an offer Indus issued (an INDUS/Q PDF). The Assistant splits its terms into clauses
        you can accept, edit or skip one by one; nothing is added to the library by itself.
      </p>
      <label className="border-io-stroke rounded-io-ctl bg-io-paper io-focus flex cursor-pointer flex-col gap-1 border border-dashed px-4 py-5 text-center text-[13px]">
        <span className="font-medium">{file ? file.name : 'Choose a PDF'}</span>
        <span className="text-io-ink-3 text-[12px]">PDF, up to 20 MB</span>
        <input
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          aria-label="Offer PDF"
          onChange={(e) => setFile(e.currentTarget.files?.[0] ?? null)}
        />
      </label>
    </Modal>
  )
}
