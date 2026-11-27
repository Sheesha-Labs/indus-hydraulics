'use client'

import { Button } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { saveSupplierViewAction } from '../../app/(console)/suppliers/actions/views'
import { FIELD } from './DirectoryEditors'

/** "Save view" on board 128: the current filters under a short name, shown as a chip for this person. */
export default function SaveViewButton() {
  const sp = useSearchParams()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const { toast } = useToast()
  const router = useRouter()
  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title="Save this view"
      trigger={
        <Button size="sm" variant="ghost">
          Save view
        </Button>
      }
      actions={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!name.trim()}
            onClick={() =>
              void (async () => {
                const r = await saveSupplierViewAction({ name, query: sp.toString() })
                if (!r.success) {
                  toast({ kind: 'error', title: r.error })
                  return
                }
                setOpen(false)
                setName('')
                toast({ kind: 'success', title: 'View saved' })
                router.refresh()
              })()
            }
          >
            Save view
          </Button>
        </>
      }
    >
      <label className="flex flex-col gap-1.5 text-[12.5px]">
        Name
        <input
          className={FIELD}
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. UAE local"
        />
      </label>
    </Modal>
  )
}
