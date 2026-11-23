import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { Readable } from 'node:stream'
import { env } from '../../lib/env'
import { isOpsBucket, type OpsBucket } from './buckets'
import type { OpsStorage } from './storage'

/**
 * LOCAL DEVELOPMENT ONLY: a stand-in for Supabase Storage when no Supabase stack is configured
 * (`getStorage()` never returns it in production or preview). Objects live under
 * `<os tmpdir>/indus-ops-storage/<bucket>/<key>`. Its "signed URLs" point at
 * `/api/files/local?op=put|get&b=…&k=…&exp=…&sig=…`, served by the files route only while this stand-in
 * is the active storage, with an HMAC so a URL works only as issued and until it expires.
 */

export const LOCAL_FILES_PATH = '/api/files/local'

const ROOT = join(tmpdir(), 'indus-ops-storage')

function secret(): string {
  return env().OPS_AUTH_SECRET ?? 'indus-ops-local-storage-dev-only'
}

type Op = 'put' | 'get'

function sign(op: Op, bucket: string, key: string, exp: number): string {
  return createHmac('sha256', secret())
    .update(`${op}\n${bucket}\n${key}\n${exp}`)
    .digest('base64url')
}

function signedPath(op: Op, bucket: OpsBucket, key: string, ttlSeconds: number): string {
  const exp = Date.now() + ttlSeconds * 1000
  const q = new URLSearchParams({
    op,
    b: bucket,
    k: key,
    exp: String(exp),
    sig: sign(op, bucket, key, exp),
  })
  return `${LOCAL_FILES_PATH}?${q.toString()}`
}

/** The object's path on disk; null when the key would escape the bucket's folder. */
function pathOf(bucket: OpsBucket, key: string): string | null {
  const base = resolve(ROOT, bucket)
  const full = resolve(base, key)
  return full.startsWith(base + '/') ? full : null
}

/** Check a local signed URL's query; returns the object it grants, or null. */
export function verifyLocalUrl(
  params: URLSearchParams,
  op: Op
): { bucket: OpsBucket; key: string } | null {
  const b = params.get('b') ?? ''
  const k = params.get('k') ?? ''
  const exp = Number(params.get('exp'))
  const sig = params.get('sig') ?? ''
  if (params.get('op') !== op || !isOpsBucket(b) || !k || !Number.isFinite(exp)) return null
  if (exp < Date.now()) return null
  const want = Buffer.from(sign(op, b, k, exp))
  const got = Buffer.from(sig)
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null
  return pathOf(b, k) ? { bucket: b, key: k } : null
}

/** Write an object (the PUT half of the local signed upload URL). */
export async function writeLocalObject(bucket: OpsBucket, key: string, bytes: Uint8Array) {
  const full = pathOf(bucket, key)
  if (!full) throw new Error('storage: bad key')
  await mkdir(dirname(full), { recursive: true })
  await writeFile(full, bytes)
}

export async function localObjectExists(bucket: OpsBucket, key: string): Promise<boolean> {
  const full = pathOf(bucket, key)
  if (!full) return false
  return stat(full).then(
    (s) => s.isFile(),
    () => false
  )
}

export function localStorage(): OpsStorage {
  return {
    kind: 'local',
    async createSignedUploadUrl(bucket, key) {
      return { url: signedPath('put', bucket, key, 2 * 60 * 60) }
    },
    async createSignedUrl(bucket, key, expiresInSeconds) {
      return (await localObjectExists(bucket, key))
        ? signedPath('get', bucket, key, expiresInSeconds)
        : null
    },
    async openRead(bucket, key) {
      const full = pathOf(bucket, key)
      if (!full || !(await localObjectExists(bucket, key))) return null
      return Readable.toWeb(createReadStream(full)) as unknown as ReadableStream<Uint8Array>
    },
    async remove(bucket, key) {
      const full = pathOf(bucket, key)
      if (full) await rm(full, { force: true })
    },
  }
}
