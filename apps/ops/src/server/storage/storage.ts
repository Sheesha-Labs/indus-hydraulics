import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { env } from '../../lib/env'
import { SafeError } from '../../lib/safe-message'
import type { OpsBucket } from './buckets'
import { localStorage } from './local-storage'

/**
 * The few Storage operations Ops uses (ADR-21), behind one interface so tests mock it and local
 * development without a Supabase stack can use a disk stand-in. Every operation takes an `OpsBucket`
 * (from `OPS_BUCKETS`), never a free string.
 *
 * File bytes never pass through a server action or a route body of ours in production: the browser
 * PUTs to a signed upload URL, and reads come back as a 60-second signed URL.
 */
export interface OpsStorage {
  readonly kind: 'supabase' | 'local'
  /** A URL the browser PUTs the file to (expires after two hours on Supabase). */
  createSignedUploadUrl(bucket: OpsBucket, key: string): Promise<{ url: string }>
  /** A short-lived URL the browser may GET the object from; `download` names the saved file. */
  createSignedUrl(
    bucket: OpsBucket,
    key: string,
    expiresInSeconds: number,
    opts?: { download?: string }
  ): Promise<string | null>
  /** The object's bytes as a stream, or null when it does not exist. */
  openRead(bucket: OpsBucket, key: string): Promise<ReadableStream<Uint8Array> | null>
  remove(bucket: OpsBucket, key: string): Promise<void>
  /**
   * Server-side write of bytes Ops itself fetched (S04-T05: Gmail bodies and attachments). Never overwrites:
   * an existing object at the key is kept (`existed: true`), so a retried step is harmless.
   */
  upload(
    bucket: OpsBucket,
    key: string,
    bytes: Uint8Array,
    contentType: string
  ): Promise<{ existed: boolean }>
}

function supabaseStorage(url: string, secretKey: string): OpsStorage {
  const client = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const bucketOf = (bucket: OpsBucket) => client.storage.from(bucket)
  return {
    kind: 'supabase',
    async createSignedUploadUrl(bucket, key) {
      const { data, error } = await bucketOf(bucket).createSignedUploadUrl(key)
      if (error || !data) throw new Error(`storage: signed upload URL failed (${bucket})`)
      return { url: data.signedUrl }
    },
    async createSignedUrl(bucket, key, expiresInSeconds, opts) {
      const { data, error } = await bucketOf(bucket).createSignedUrl(
        key,
        expiresInSeconds,
        opts?.download ? { download: opts.download } : undefined
      )
      if (error || !data) return null
      return data.signedUrl
    },
    async openRead(bucket, key) {
      const { data, error } = await bucketOf(bucket).createSignedUrl(key, 60)
      if (error || !data) return null
      const res = await fetch(data.signedUrl, { cache: 'no-store' })
      if (!res.ok || !res.body) return null
      return res.body
    },
    async remove(bucket, key) {
      const { error } = await bucketOf(bucket).remove([key])
      if (error) throw new Error(`storage: remove failed (${bucket})`)
    },
    async upload(bucket, key, bytes, contentType) {
      const { error } = await bucketOf(bucket).upload(key, bytes, { contentType, upsert: false })
      if (!error) return { existed: false }
      // 409 Duplicate: the object is already there (a retried step). Keep it.
      const status = (error as { statusCode?: string | number }).statusCode
      if (String(status) === '409' || /exists|duplicate/i.test(error.message))
        return { existed: true }
      throw new Error(`storage: upload failed (${bucket})`)
    },
  }
}

let override: OpsStorage | null = null

/** Tests only: replace the storage (pass null to restore). */
export function setStorageForTests(storage: OpsStorage | null): void {
  override = storage
}

/**
 * Supabase when SUPABASE_URL and SUPABASE_SECRET_KEY are set; outside production without them, the
 * local disk stand-in; in production without them, a refusal ("File storage is not set up yet.").
 */
export function getStorage(): OpsStorage {
  if (override) return override
  const e = env()
  if (e.SUPABASE_URL && e.SUPABASE_SECRET_KEY) {
    return supabaseStorage(e.SUPABASE_URL, e.SUPABASE_SECRET_KEY)
  }
  if (e.APP_ENV !== 'production' && e.APP_ENV !== 'preview') return localStorage()
  throw new SafeError('File storage is not set up yet. Try again later.')
}

/** True when uploads go to the local disk stand-in (local development only). */
export function usesLocalStorage(): boolean {
  if (override) return override.kind === 'local'
  const e = env()
  return (
    !(e.SUPABASE_URL && e.SUPABASE_SECRET_KEY) &&
    e.APP_ENV !== 'production' &&
    e.APP_ENV !== 'preview'
  )
}
