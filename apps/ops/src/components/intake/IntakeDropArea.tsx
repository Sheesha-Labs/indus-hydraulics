'use client'

import { Button } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useRef, useState, useSyncExternalStore, type DragEvent } from 'react'
import {
  createIntakeBatchAction,
  pasteEmailTextAction,
} from '../../app/(console)/enquiries/intake/actions/queue'
import { INTAKE_ACCEPT, sendFiles } from './send-files'

/**
 * Board 14's drop area (S08-T03): the large dashed frame with "Drop enquiry files here", the limit line, "Choose
 * files" (the page's one primary) and "Paste email text" (a modal). The first drop creates the batch and the page
 * follows it (?batch=). Files the server refuses come back as a toast with the reason.
 */
const noop = () => () => undefined

export default function IntakeDropArea({
  batchId,
  maxMb,
}: {
  batchId: string | null
  maxMb: number
}) {
  const router = useRouter()
  const { toast } = useToast()
  const input = useRef<HTMLInputElement>(null)
  const depth = useRef(0)
  const [over, setOver] = useState(false)
  // Set once the handlers are attached: a file chosen before hydration would be dropped silently.
  const ready = useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
  const [busy, setBusy] = useState(false)
  const [pasteOpen, setPasteOpen] = useState(false)
  const [text, setText] = useState('')

  async function add(list: FileList | File[]) {
    const files = Array.from(list)
    if (!files.length) return
    setBusy(true)
    const out = await sendFiles(files, { batchId })
    setBusy(false)
    for (const r of out.refused) toast({ kind: 'error', title: `${r.name}: ${r.why}` })
    if (out.sent)
      toast({
        kind: 'success',
        title: `${out.sent} file${out.sent === 1 ? '' : 's'} added to the queue`,
      })
    if (out.batchId && out.batchId !== batchId)
      router.replace(`/enquiries/new?batch=${out.batchId}` as Route)
    else router.refresh()
  }

  async function paste() {
    setBusy(true)
    let id = batchId
    if (!id) {
      const b = await createIntakeBatchAction({ source: 'paste' })
      if (!b.success) {
        setBusy(false)
        toast({ kind: 'error', title: b.error })
        return
      }
      id = b.data.batchId
    }
    const r = await pasteEmailTextAction({ batchId: id, text })
    setBusy(false)
    if (!r.success) {
      toast({ kind: 'error', title: r.error })
      return
    }
    setPasteOpen(false)
    setText('')
    toast({ kind: 'success', title: 'Email text added to the queue' })
    if (id !== batchId) router.replace(`/enquiries/new?batch=${id}` as Route)
    else router.refresh()
  }

  const drag = {
    onDragEnter: (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      depth.current += 1
      setOver(true)
    },
    onDragOver: (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    },
    onDragLeave: () => {
      depth.current = Math.max(0, depth.current - 1)
      if (!depth.current) setOver(false)
    },
    onDrop: (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      depth.current = 0
      setOver(false)
      if (e.dataTransfer?.files) void add(e.dataTransfer.files)
    },
  }

  return (
    <div
      data-part="intake-drop"
      data-state={over ? 'over' : 'ready'}
      {...drag}
      className={
        over
          ? 'rounded-io-card border-io-accent bg-io-accent-tint flex h-[200px] flex-col items-center justify-center gap-2.5 border-[1.5px] border-solid'
          : 'rounded-io-card border-io-accent bg-io-dropzone flex h-[200px] flex-col items-center justify-center gap-2.5 border-[1.5px] border-dashed'
      }
    >
      <h2 className="m-0 font-serif text-[30px] leading-[1.15]">
        {over ? 'Release to add the files' : 'Drop enquiry files here'}
      </h2>
      <p className="text-io-accent m-0 text-[13px]">
        PDF, PNG, JPEG, XLSX or CSV · several at once · up to {maxMb} MB each
      </p>
      <div className="mt-1.5 flex gap-2">
        <Button variant="primary" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? 'Adding…' : 'Choose files'}
        </Button>
        <Modal
          open={pasteOpen}
          onOpenChange={setPasteOpen}
          title="Paste email text"
          width={560}
          trigger={
            <Button variant="secondary" data-action="paste-text">
              Paste email text
            </Button>
          }
          note="Read like an email: lines, client reference and the date it is needed by."
          actions={
            <>
              <Button variant="ghost" onClick={() => setPasteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => void paste()}
                disabled={busy || !text.trim()}
              >
                Add to the queue
              </Button>
            </>
          }
        >
          <label className="text-io-ink-2 mb-1.5 block text-[12.5px]" htmlFor="intake-paste">
            The client’s email, as text
          </label>
          <textarea
            id="intake-paste"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="rounded-io-ctl border-io-stroke bg-io-card io-focus-field w-full resize-y border px-3 py-2 text-[13px] leading-[1.5]"
          />
        </Modal>
      </div>
      <input
        ref={input}
        type="file"
        multiple
        accept={INTAKE_ACCEPT}
        className="hidden"
        aria-label="Choose enquiry files"
        data-ready={ready ? 'true' : undefined}
        onChange={(e) => {
          if (e.target.files) void add(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
