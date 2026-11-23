import 'server-only'
import { decideZip, ZIP_LIMITS } from '@indus/ops-core'
import yauzl from 'yauzl'

/**
 * Zip-bomb guard for archive attachments (S04-T05, 08-map-integrations §1.6). Reads only the central
 * directory (entry count and declared expanded sizes), never inflates anything. Returns a note when the archive
 * must be stored but not expanded, or null when later extraction may expand it.
 */
const NOTES = {
  too_many_entries: `Archive not expanded: more than ${ZIP_LIMITS.maxEntries} files.`,
  too_large_expanded: 'Archive not expanded: more than 100 MB once expanded.',
  ratio_too_high: `Archive not expanded: compresses more than ${ZIP_LIMITS.maxRatio}× (possible zip bomb).`,
  unreadable: 'Archive not expanded: it could not be read.',
} as const

export async function scanZip(bytes: Uint8Array): Promise<string | null> {
  const result = await new Promise<{ entries: number; expanded: number } | null>((resolve) => {
    yauzl.fromBuffer(
      Buffer.from(bytes),
      { lazyEntries: true, validateEntrySizes: false },
      (err, zip) => {
        if (err || !zip) return resolve(null)
        let entries = 0
        let expanded = 0
        zip.on('entry', (entry: yauzl.Entry) => {
          entries += 1
          expanded += entry.uncompressedSize
          // Stop reading the directory as soon as a limit is crossed.
          if (entries > ZIP_LIMITS.maxEntries || expanded > ZIP_LIMITS.maxExpandedBytes) {
            zip.close()
            resolve({ entries, expanded })
            return
          }
          zip.readEntry()
        })
        zip.on('end', () => resolve({ entries, expanded }))
        zip.on('error', () => resolve(null))
        zip.readEntry()
      }
    )
  })
  if (!result) return NOTES.unreadable
  const decision = decideZip({
    entries: result.entries,
    expandedBytes: result.expanded,
    compressedBytes: bytes.length,
  })
  return decision.action === 'expand' ? null : NOTES[decision.reason]
}
