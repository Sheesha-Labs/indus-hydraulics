import { createHash } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { OpsBucket } from './buckets'
import type { OpsStorage } from './storage'

/**
 * createUpload / confirmUpload against an in-memory Storage (no Supabase): validation before a URL is
 * issued, and the magic-byte check after the browser's PUT, which deletes a mismatching object.
 */

const h = vi.hoisted(() => ({
  maxUploadMb: 1,
  created: [] as Record<string, unknown>[],
}))

vi.mock('../settings/get', () => ({
  getSetting: async (key: string) => {
    if (key !== 'intake') throw new Error(`unexpected setting ${key}`)
    return { callbackAlertMinutes: 45, duplicateWindowDays: 7, maxUploadMb: h.maxUploadMb }
  },
}))
vi.mock('@indus/ops-db', () => ({
  opsDb: {
    storedFile: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        h.created.push(data)
        return { id: '0193a5b2-7c1d-7e3f-8a9b-000000000001', filename: data['filename'] }
      },
    },
  },
}))

const { createUpload, confirmUpload } = await import('./uploads')
const { setStorageForTests } = await import('./storage')
const { SafeError } = await import('../../lib/safe-message')

/** In-memory Storage; `put` stands in for the browser's PUT to the signed URL. */
function memoryStorage() {
  const objects = new Map<string, Uint8Array>()
  const removed: string[] = []
  const id = (b: OpsBucket, k: string) => `${b}/${k}`
  const storage: OpsStorage = {
    kind: 'local',
    async createSignedUploadUrl(b, k) {
      return { url: `https://storage.test/upload/${id(b, k)}?token=t` }
    },
    async createSignedUrl(b, k) {
      return objects.has(id(b, k)) ? `https://storage.test/${id(b, k)}?token=t` : null
    },
    async upload(b, k, bytes) {
      if (objects.has(id(b, k))) return { existed: true }
      objects.set(id(b, k), bytes)
      return { existed: false }
    },
    async openRead(b, k) {
      const bytes = objects.get(id(b, k))
      if (!bytes) return null
      // Two chunks, so the sniff crosses a chunk boundary.
      const cut = Math.min(5, bytes.length)
      return new ReadableStream<Uint8Array>({
        start(c) {
          c.enqueue(bytes.subarray(0, cut))
          if (bytes.length > cut) c.enqueue(bytes.subarray(cut))
          c.close()
        },
      })
    },
    async remove(b, k) {
      removed.push(id(b, k))
      objects.delete(id(b, k))
    },
  }
  return {
    storage,
    objects,
    removed,
    put: (b: string, k: string, bytes: Uint8Array) => objects.set(`${b}/${k}`, bytes),
  }
}

const PNG_HEAD = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const png = (n = 64) => Uint8Array.from([...PNG_HEAD, ...Array.from({ length: n }, () => 7)])
const jpeg = (n = 64) =>
  Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, ...Array.from({ length: n }, () => 3)])
const LOGO = { kind: 'logo' as const, recordType: 'company-profile' }

let mem: ReturnType<typeof memoryStorage>

beforeEach(() => {
  h.maxUploadMb = 1
  h.created.length = 0
  mem = memoryStorage()
  setStorageForTests(mem.storage)
})
afterEach(() => setStorageForTests(null))

async function refusal(p: Promise<unknown>): Promise<string> {
  try {
    await p
  } catch (e) {
    expect(e).toBeInstanceOf(SafeError)
    return (e as Error).message
  }
  throw new Error('expected a refusal')
}

describe('createUpload', () => {
  it('issues a signed URL for a key under the record prefix, in the kind’s bucket', async () => {
    const out = await createUpload({
      ...LOGO,
      filename: 'Our Logo.png',
      size: 1000,
      mime: 'image/png',
    })
    expect(out.bucket).toBe('ops-company')
    expect(out.key).toMatch(/^company-profile\/logo\/[0-9a-f-]{36}-our-logo\.png$/)
    expect(out.uploadUrl).toContain(out.key)
  })

  it('refuses a file over the maxUploadMb setting', async () => {
    const msg = await refusal(
      createUpload({ ...LOGO, filename: 'big.png', size: 1024 * 1024 + 1, mime: 'image/png' })
    )
    expect(msg).toBe('That file is over 1 MB.')
  })

  it('refuses a type outside the kind’s allowlist', async () => {
    expect(
      await refusal(createUpload({ ...LOGO, filename: 'x.pdf', size: 10, mime: 'application/pdf' }))
    ).toBe('Logo: use PNG or JPEG.')
    expect(
      await refusal(
        createUpload({
          kind: 'stamp',
          recordType: 'company-profile',
          filename: 'x.jpg',
          size: 10,
          mime: 'image/jpeg',
        })
      )
    ).toBe('Stamp: use PNG.')
  })
})

describe('confirmUpload', () => {
  async function uploaded(bytes: Uint8Array, filename = 'logo.png', mime = 'image/png') {
    const { bucket, key } = await createUpload({ ...LOGO, filename, size: bytes.length, mime })
    mem.put(bucket, key, bytes)
    return { bucket, key }
  }

  it('records a real PNG with its size and sha256 (source upload)', async () => {
    const bytes = png()
    const { key } = await uploaded(bytes)
    const out = await confirmUpload(LOGO, key, 'logo.png', 'user-1')
    expect(out.fileId).toBeTruthy()
    expect(h.created).toEqual([
      {
        bucket: 'ops-company',
        path: key,
        filename: 'logo.png',
        mimeType: 'image/png',
        sizeBytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
        source: 'upload',
        uploadedById: 'user-1',
      },
    ])
    expect(mem.removed).toEqual([])
  })

  it('a magic-byte mismatch is refused and the object deleted', async () => {
    const { bucket, key } = await uploaded(jpeg(), 'logo.png', 'image/png')
    expect(await refusal(confirmUpload(LOGO, key, 'logo.png', 'user-1'))).toBe(
      'That file is not a PNG image.'
    )
    expect(mem.removed).toEqual([`${bucket}/${key}`])
    expect(h.created).toEqual([])
  })

  it('a file that is not an image at all is refused and deleted', async () => {
    const { bucket, key } = await uploaded(new TextEncoder().encode('%PDF-1.7 not an image at all'))
    await refusal(confirmUpload(LOGO, key, 'logo.png', 'user-1'))
    expect(mem.removed).toEqual([`${bucket}/${key}`])
  })

  it('an object larger than the limit (whatever the browser declared) is refused and deleted', async () => {
    const { bucket, key } = await uploaded(png(10))
    mem.put(bucket, key, png(1024 * 1024))
    expect(await refusal(confirmUpload(LOGO, key, 'logo.png', 'user-1'))).toBe(
      'That file is over 1 MB.'
    )
    expect(mem.removed).toEqual([`${bucket}/${key}`])
  })

  it('refuses a key it did not issue, and an object that never arrived', async () => {
    expect(await refusal(confirmUpload(LOGO, 'company-profile/stamp/x.png', 'x.png', 'u'))).toMatch(
      /did not arrive/
    )
    const { key } = await createUpload({ ...LOGO, filename: 'l.png', size: 10, mime: 'image/png' })
    expect(await refusal(confirmUpload(LOGO, key, 'l.png', 'u'))).toMatch(/did not arrive/)
    expect(h.created).toEqual([])
  })
})
