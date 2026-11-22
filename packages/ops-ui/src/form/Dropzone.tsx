'use client'

import type { Result } from '@indus/ops-core'
import { X } from 'lucide-react'
import { useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react'
import Button from '../controls/Button'
import InlineState from '../states/InlineState'
import DropzoneFrame from './DropzoneFrame'

/** Architecture C19: the largest file Ops takes, 20 MB. */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024

/**
 * Uploads one file and returns its id. The caller supplies it: S03-T05 wires a server action that returns
 * a Supabase Storage signed upload URL and PUTs the file there from the browser (ADR-21). A file never
 * passes through a server action or route body, which would hit the Vercel request-size limit.
 */
export type UploadFile = (file: File) => Promise<Result<{ fileId: string }>>

export interface DropzoneProps {
  title: string
  text: ReactNode
  /** Extensions (".pdf") and MIME types ("application/pdf", "image/*"). Empty accepts anything. */
  accept: string[]
  multiple?: boolean
  /** Default "Choose files". */
  buttonLabel?: string
  /** ready (default) invites a drop; idle is the quieter look on paper. Drag-over is internal. */
  state?: 'ready' | 'idle'
  /** Default 20 MB (C19). A larger file is refused before upload is called. */
  maxBytes?: number
  upload: UploadFile
  /** The accepted files, before they upload. */
  onFiles?: (files: File[]) => void
  /** Each file that finished uploading. */
  onUploaded?: (file: { name: string; fileId: string }) => void
  /**
   * When set, one hidden input per uploaded file posts its id under this name with the enclosing form.
   * The file input itself never has a name, so the bytes are never part of a form post.
   */
  name?: string
}

interface Item {
  key: number
  name: string
  size: number
  status: 'uploading' | 'done' | 'error'
  error?: string
  fileId?: string
}

/** "340 KB", "1.2 MB" (1024-based, like the 20 MB limit). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** True when `file` matches one of the accept patterns (extension, exact MIME or "type/*"). */
export function isAccepted(file: Pick<File, 'name' | 'type'>, accept: readonly string[]): boolean {
  if (accept.length === 0) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept.some((raw) => {
    const p = raw.trim().toLowerCase()
    if (p.startsWith('.')) return name.endsWith(p)
    if (p.endsWith('/*')) return type.startsWith(p.slice(0, -1))
    return type === p
  })
}

/** Why a file is refused before upload, or null. */
export function rejection(
  file: Pick<File, 'name' | 'type' | 'size'>,
  accept: readonly string[],
  maxBytes: number
): string | null {
  if (file.size > maxBytes) return `Over ${Math.round(maxBytes / (1024 * 1024))} MB`
  if (!isAccepted(file, accept)) return 'Not an accepted file type'
  return null
}

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`

/**
 * Form kit Dropzone (client). A real <button> opens the hidden file input, so it works from the keyboard;
 * dropping works too. The drag state is announced ("Release to add 2 files"). Each file shows as a row with
 * its size and an InlineState (uploading, uploaded, or why it failed) and can be removed. Size and type are
 * checked before `upload` is called; a refused file never reaches it.
 */
export default function Dropzone({
  title,
  text,
  accept,
  multiple = true,
  buttonLabel = 'Choose files',
  state = 'ready',
  maxBytes = MAX_UPLOAD_BYTES,
  upload,
  onFiles,
  onUploaded,
  name,
}: DropzoneProps) {
  const input = useRef<HTMLInputElement>(null)
  const depth = useRef(0)
  const nextKey = useRef(0)
  const [over, setOver] = useState<number | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [announcement, setAnnouncement] = useState('')

  function patch(key: number, change: Partial<Item>) {
    setItems((all) => all.map((it) => (it.key === key ? { ...it, ...change } : it)))
  }

  async function send(key: number, file: File) {
    let result: Result<{ fileId: string }>
    try {
      result = await upload(file)
    } catch {
      result = { success: false, error: 'Upload failed. Try again.' }
    }
    if (result.success) {
      patch(key, { status: 'done', fileId: result.data.fileId })
      onUploaded?.({ name: file.name, fileId: result.data.fileId })
    } else {
      patch(key, { status: 'error', error: result.error })
    }
  }

  function add(list: FileList | File[]) {
    const files = Array.from(list).slice(0, multiple ? undefined : 1)
    if (files.length === 0) return
    const accepted: { key: number; file: File }[] = []
    const added: Item[] = files.map((file) => {
      const key = nextKey.current++
      const why = rejection(file, accept, maxBytes)
      if (why) return { key, name: file.name, size: file.size, status: 'error', error: why }
      accepted.push({ key, file })
      return { key, name: file.name, size: file.size, status: 'uploading' }
    })
    setItems((all) => (multiple ? [...all, ...added] : added))
    const refused = files.length - accepted.length
    setAnnouncement(
      [
        accepted.length ? `${plural(accepted.length, 'file')} added` : '',
        refused ? `${plural(refused, 'file')} refused` : '',
      ]
        .filter(Boolean)
        .join(', ')
    )
    if (accepted.length) onFiles?.(accepted.map((a) => a.file))
    for (const a of accepted) void send(a.key, a.file)
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) add(e.target.files)
    e.target.value = ''
  }

  function count(e: DragEvent) {
    return e.dataTransfer?.items?.length || e.dataTransfer?.files?.length || 1
  }
  function onDragEnter(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    depth.current += 1
    const n = multiple ? count(e) : 1
    setOver(n)
    setAnnouncement(`Release to add ${plural(n, 'file')}`)
  }
  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
  }
  function onDragLeave() {
    depth.current = Math.max(0, depth.current - 1)
    if (depth.current === 0) {
      setOver(null)
      setAnnouncement('')
    }
  }
  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    depth.current = 0
    setOver(null)
    if (e.dataTransfer?.files) add(e.dataTransfer.files)
  }

  function remove(item: Item) {
    setItems((all) => all.filter((it) => it.key !== item.key))
    setAnnouncement(`${item.name} removed`)
  }

  return (
    <div data-part="dropzone" className="flex w-full flex-col gap-2">
      <DropzoneFrame
        look={over === null ? state : 'over'}
        title={over === null ? title : `Release to add ${plural(over, 'file')}`}
        text={text}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        action={
          <Button size="sm" className="px-3" onClick={() => input.current?.click()}>
            {buttonLabel}
          </Button>
        }
      />
      <input
        ref={input}
        type="file"
        hidden
        tabIndex={-1}
        aria-hidden="true"
        accept={accept.join(',')}
        multiple={multiple}
        onChange={onChange}
      />
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
      {items.length > 0 ? (
        <ul aria-label="Files" className="flex flex-col gap-1.5">
          {items.map((it) => (
            <li
              key={it.key}
              data-status={it.status}
              className="rounded-io-ctl border-io-line bg-io-card flex items-center gap-3 border py-1 pr-1 pl-3 text-[12.5px]"
            >
              <span className="min-w-0 flex-1 truncate font-medium">{it.name}</span>
              <span className="text-io-ink-3 flex-none">{formatBytes(it.size)}</span>
              <InlineState
                className="flex-none py-0"
                kind={
                  it.status === 'uploading' ? 'loading' : it.status === 'done' ? 'saved' : 'error'
                }
                text={
                  it.status === 'uploading'
                    ? 'Uploading…'
                    : it.status === 'done'
                      ? 'Uploaded'
                      : (it.error ?? 'Upload failed')
                }
              />
              <Button
                variant="ghost"
                size="xs"
                icon={X}
                aria-label={`Remove ${it.name}`}
                onClick={() => remove(it)}
              />
              {name && it.fileId ? <input type="hidden" name={name} value={it.fileId} /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
