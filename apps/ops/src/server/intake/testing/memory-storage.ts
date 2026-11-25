import type { OpsBucket } from '../../storage/buckets'
import type { OpsStorage } from '../../storage/storage'

/** In-memory Storage for intake tests; `put` stands in for the browser's PUT to a signed URL. Test-only. */
export function memoryStorage() {
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
      return new ReadableStream<Uint8Array>({
        start(c) {
          c.enqueue(bytes)
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
    put: (b: OpsBucket, k: string, bytes: Uint8Array) => objects.set(id(b, k), bytes),
  }
}
