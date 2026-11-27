'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { clientIp } from '../../../../lib/request-origin'
import { SafeError } from '../../../../lib/safe-message'
import { linkToken } from '../../../../lib/route-params'
import {
  portalConfirmUpload,
  portalUploadSlot,
} from '../../../../server/directory/document-request'

/**
 * The /u upload page's two calls (S10-T04, C28). Public: no console session is read; the link token is the only
 * credential and every call re-verifies it, rate-limited per link and per address. Errors are safe sentences.
 */
type Result<T> = { success: true; data: T } | { success: false; error: string }

const slotSchema = z.object({
  token: linkToken,
  kind: z.string().max(40),
  name: z.string().max(200),
  size: z.number().int().min(1),
})
const confirmSchema = z.object({
  token: linkToken,
  kind: z.string().max(40),
  key: z.string().max(300),
  filename: z.string().max(200),
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

async function guard<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { success: true, data: await fn() }
  } catch (e) {
    if (e instanceof SafeError) return { success: false, error: e.message }
    console.error('[u] upload failed', e instanceof Error ? e.name : 'error')
    return { success: false, error: 'Something went wrong. Try again in a minute.' }
  }
}

export async function uploadSlotAction(
  raw: z.input<typeof slotSchema>
): Promise<Result<{ key: string; uploadUrl: string }>> {
  const p = slotSchema.safeParse(raw)
  if (!p.success) return { success: false, error: 'Check the file and try again.' }
  const ip = clientIp(await headers())
  return guard(() =>
    portalUploadSlot(p.data.token, p.data.kind, { name: p.data.name, size: p.data.size }, ip)
  )
}

export async function confirmUploadAction(
  raw: z.input<typeof confirmSchema>
): Promise<Result<{ complete: boolean }>> {
  const p = confirmSchema.safeParse(raw)
  if (!p.success) return { success: false, error: 'Check the file and try again.' }
  const h = await headers()
  return guard(() =>
    portalConfirmUpload(
      p.data.token,
      {
        kind: p.data.kind,
        key: p.data.key,
        filename: p.data.filename,
        expiresAt: p.data.expiresAt ?? null,
      },
      { ip: clientIp(h), userAgent: h.get('user-agent') }
    )
  )
}
