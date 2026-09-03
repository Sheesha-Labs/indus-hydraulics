'use client'

import { Button, StatusPill, ToastProvider, useToast } from '@indus/ui'
import { useRouter } from 'next/navigation'
import * as React from 'react'

import { createMediaUploadTicket, finaliseMediaUpload } from '../../../media/actions'
import { attachToEnquiry, extractAttachmentLines } from '../../actions'

export type AttachmentRow = {
  id: string
  filename: string
  bytes: number | null
  extractionStatus: 'pending' | 'extracted' | 'unsupported' | 'failed'
  extractionNote: string | null
  extractedLines: number
  href: string
}

type Props = { enquiryId: string; attachments: AttachmentRow[] }

const STATUS_TONE = {
  extracted: 'good',
  pending: 'muted',
  unsupported: 'warn',
  failed: 'danger',
} as const

function humanBytes(n: number | null): string {
  if (!n) return ''
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`
}

function Inner({ enquiryId, attachments }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setBusy('upload')
    try {
      // Bytes go browser -> storage directly. A Server Action caps its request
      // body at 1 MB, so posting a real RFQ sheet through one is rejected by
      // the framework before any of our code runs.
      const ticket = await createMediaUploadTicket({
        filename: file.name,
        contentType: file.type,
        bytes: file.size,
      })
      if (!ticket.success) throw new Error(ticket.message)

      const put = await fetch(ticket.data.signedUrl, {
        method: 'PUT',
        headers: { 'content-type': file.type },
        body: file,
      })
      if (!put.ok) throw new Error('The upload did not complete.')

      // No `bytes` here on purpose: finalise re-lists the object and measures
      // the real size from storage rather than trusting the browser's number.
      const media = await finaliseMediaUpload({
        key: ticket.data.key,
        bucket: ticket.data.bucket,
        filename: file.name,
        contentType: file.type,
        alt: null,
      })
      if (!media.success) throw new Error(media.message)

      const form = new FormData()
      form.set('enquiryId', enquiryId)
      form.set('mediaId', media.data.id)
      form.set('filename', file.name)
      const attached = await attachToEnquiry(form)
      if (!attached.success) throw new Error(attached.message)

      toast({ title: `${file.name} attached` })
      router.refresh()
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : 'Upload failed', tone: 'danger' })
    } finally {
      setBusy(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function onExtract(attachmentId: string) {
    setBusy(attachmentId)
    try {
      const form = new FormData()
      form.set('attachmentId', attachmentId)
      const res = await extractAttachmentLines(form)
      if (!res.success) throw new Error(res.message)
      // Built as one literal rather than spread: the repo runs
      // exactOptionalPropertyTypes, under which a conditional spread widens the
      // property to `T | undefined` and stops matching the option type.
      const title =
        res.data.added > 0
          ? `${res.data.added} line${res.data.added === 1 ? '' : 's'} added`
          : 'Nothing extracted'
      if (res.data.added === 0) {
        // Toast tones are default | success | danger — no warn. Nothing
        // extracted is an outcome, not an error, so it stays default and the
        // description carries the reason.
        toast({ title, description: res.data.note ?? 'Nothing could be read from that file.' })
      } else if (res.data.note) {
        toast({ title, description: res.data.note })
      } else {
        toast({ title })
      }
      router.refresh()
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : 'Extraction failed', tone: 'danger' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {attachments.length === 0 ? (
        <p className="text-[13px] text-ih-muted">
          No files attached. PDF sheets are read directly, including scanned ones; Excel is read
          cell by cell.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ih-border px-3 py-2"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <a className="truncate text-[14px] text-ih-ink hover:underline" href={a.href}>
                  {a.filename}
                </a>
                <span className="font-mono text-[12px] text-ih-muted">
                  {humanBytes(a.bytes)}
                  {a.extractedLines > 0 ? ` · ${a.extractedLines} lines added` : ''}
                </span>
                {a.extractionNote ? (
                  <span className="text-[12px] text-ih-muted">{a.extractionNote}</span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <StatusPill tone={STATUS_TONE[a.extractionStatus]} size="sm">
                  {a.extractionStatus}
                </StatusPill>
                {a.extractionStatus !== 'unsupported' ? (
                  <Button
                    kind="outline"
                    size="dense-sm"
                    loading={busy === a.id}
                    onClick={() => onExtract(a.id)}
                  >
                    {a.extractionStatus === 'extracted' ? 'Re-read' : 'Read items'}
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3">
        <Button
          kind="outline"
          size="dense"
          loading={busy === 'upload'}
          onClick={() => inputRef.current?.click()}
        >
          Attach a file
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.xlsx,.docx,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={onPick}
        />
        <p className="text-[13px] text-ih-muted">PDF or Excel. Word files are stored but not read.</p>
      </div>
    </div>
  )
}

export default function AttachmentsPanel(props: Props) {
  return (
    <ToastProvider>
      <Inner {...props} />
    </ToastProvider>
  )
}
