'use client'

import {
  confirmUploadAction,
  createIntakeBatchAction,
  requestUploadSlotsAction,
} from '../../app/(console)/enquiries/intake/actions/queue'

/**
 * The browser side of an intake upload (S08-T03): a batch when there is none yet, one signed URL per file, a PUT
 * straight to Storage, then "record it" — the server reads the object back and checks what it really is. Returns
 * the batch and the files refused, with the reason a person can act on.
 */
export interface SendOutcome {
  batchId: string | null
  sent: number
  refused: Array<{ name: string; why: string }>
}

export async function sendFiles(
  files: readonly File[],
  opts: { batchId: string | null; replacesFileId?: string; leadRef?: string | null }
): Promise<SendOutcome> {
  let batchId = opts.batchId
  if (!batchId) {
    const b = await createIntakeBatchAction({
      source: 'upload',
      ...(opts.leadRef ? { leadRef: opts.leadRef } : {}),
    })
    if (!b.success)
      return { batchId: null, sent: 0, refused: files.map((f) => ({ name: f.name, why: b.error })) }
    batchId = b.data.batchId
  }
  const slots = await requestUploadSlotsAction({
    batchId,
    files: files.map((f) => ({ name: f.name, size: f.size })),
  })
  if (!slots.success)
    return { batchId, sent: 0, refused: files.map((f) => ({ name: f.name, why: slots.error })) }
  const refused: SendOutcome['refused'] = []
  let sent = 0
  await Promise.all(
    slots.data.map(async (slot, i) => {
      const file = files[i]!
      if ('error' in slot) {
        refused.push({ name: slot.name, why: slot.error })
        return
      }
      try {
        const put = await fetch(slot.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'content-type': file.type || 'application/octet-stream', 'x-upsert': 'false' },
        })
        if (!put.ok) {
          refused.push({ name: file.name, why: 'Upload failed. Try again.' })
          return
        }
      } catch {
        refused.push({
          name: file.name,
          why: 'Upload failed. Check your connection and try again.',
        })
        return
      }
      const done = await confirmUploadAction({
        batchId: batchId!,
        key: slot.key,
        filename: file.name,
        ...(opts.replacesFileId ? { replacesFileId: opts.replacesFileId } : {}),
      })
      if (!done.success) {
        refused.push({ name: file.name, why: done.error })
        return
      }
      sent += 1
    })
  )
  return { batchId, sent, refused }
}

/** What the file chooser offers (the server checks again by the bytes). */
export const INTAKE_ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.heic,.xlsx,.xlsm,.xls,.csv,.docx,.zip'
