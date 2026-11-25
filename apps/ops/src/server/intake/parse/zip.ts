import 'server-only'
import { decideZip, ZIP_LIMITS } from '@indus/ops-core'
import yauzl from 'yauzl'
import type { ParsedDocument } from './types'

/**
 * Zip archives (S08-T01, 08 §1.6): at most 200 entries, 100 MB expanded and a compression ratio of 50; anything
 * over a limit is stored as it came and not expanded. Expanded entries become their own intake files, so each is
 * parsed by its own parser. Directories, macOS resource forks and hidden files are skipped.
 */
interface Entry {
  name: string
  size: number
}

function open(bytes: Uint8Array): Promise<yauzl.ZipFile | null> {
  return new Promise((resolve) => {
    yauzl.fromBuffer(
      Buffer.from(bytes),
      { lazyEntries: true, validateEntrySizes: true },
      (err, zip) => resolve(err || !zip ? null : zip)
    )
  })
}

const SKIP = (name: string) =>
  name.endsWith('/') || name.startsWith('__MACOSX/') || /(^|\/)\./.test(name)

export async function parseZip(bytes: Uint8Array): Promise<ParsedDocument> {
  const zip = await open(bytes)
  if (!zip) return { kind: 'unreadable', detail: 'The archive could not be read' }
  const entries = await new Promise<Entry[]>((resolve) => {
    const out: Entry[] = []
    zip.on('entry', (e: yauzl.Entry) => {
      if (!SKIP(e.fileName)) out.push({ name: e.fileName, size: e.uncompressedSize })
      if (out.length > ZIP_LIMITS.maxEntries) {
        zip.close()
        resolve(out)
        return
      }
      zip.readEntry()
    })
    zip.on('end', () => resolve(out))
    zip.on('error', () => resolve(out))
    zip.readEntry()
  })
  const expanded = entries.reduce((s, e) => s + e.size, 0)
  const d = decideZip({
    entries: entries.length,
    expandedBytes: expanded,
    compressedBytes: bytes.length,
  })
  return d.action === 'expand'
    ? { kind: 'zip', decision: 'expand', entries }
    : { kind: 'zip', decision: 'store_only', reason: d.reason, entries }
}

/** The files inside an archive parseZip allowed to expand. Sizes are re-checked while inflating. */
export async function expandZip(
  bytes: Uint8Array
): Promise<Array<{ name: string; bytes: Uint8Array }>> {
  const zip = await open(bytes)
  if (!zip) return []
  return new Promise((resolve, reject) => {
    const out: Array<{ name: string; bytes: Uint8Array }> = []
    let total = 0
    zip.on('entry', (e: yauzl.Entry) => {
      if (SKIP(e.fileName)) return zip.readEntry()
      zip.openReadStream(e, (err, stream) => {
        if (err || !stream) return reject(err ?? new Error('zip entry unreadable'))
        const parts: Buffer[] = []
        stream.on('data', (c: Buffer) => {
          total += c.length
          if (total > ZIP_LIMITS.maxExpandedBytes) {
            stream.destroy()
            zip.close()
            reject(new Error('archive expands past the limit'))
            return
          }
          parts.push(c)
        })
        stream.on('end', () => {
          out.push({ name: e.fileName.split('/').pop() ?? e.fileName, bytes: Buffer.concat(parts) })
          zip.readEntry()
        })
        stream.on('error', reject)
      })
    })
    zip.on('end', () => resolve(out))
    zip.on('error', reject)
    zip.readEntry()
  })
}
