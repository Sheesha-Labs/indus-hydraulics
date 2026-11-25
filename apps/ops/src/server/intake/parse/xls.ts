import 'server-only'
import { createRequire } from 'node:module'
import { Worker } from 'node:worker_threads'
import { gridToText } from './sheet-text'
import type { ParsedDocument, SheetGrid } from './types'
import { XLS_WORKER_SOURCE } from './xls-worker'

/**
 * Legacy .xls (BIFF) through SheetJS 0.20 from its official CDN tarball, never the stale npm `xlsx`. It runs in a
 * worker thread with values only (no formulas, no HTML) and a 10-second limit, because a hostile BIFF file is
 * the riskiest thing a client can send. Any failure asks the client for XLSX or PDF instead.
 */
const TIMEOUT_MS = 10_000
const requireFromHere = createRequire(import.meta.url)

export async function parseXls(bytes: Uint8Array): Promise<ParsedDocument> {
  let xlsxPath: string
  try {
    xlsxPath = requireFromHere.resolve('xlsx')
  } catch {
    return { kind: 'unsupported', ask: 'xlsx_or_pdf', detail: 'The XLS reader is not available' }
  }
  const grid = await new Promise<SheetGrid | { error: string }>((resolve) => {
    const worker = new Worker(XLS_WORKER_SOURCE, {
      eval: true,
      workerData: { xlsxPath, bytes },
      resourceLimits: { maxOldGenerationSizeMb: 256 },
    })
    const timer = setTimeout(() => {
      void worker.terminate()
      resolve({ error: 'timed out' })
    }, TIMEOUT_MS)
    worker.once('message', (m: SheetGrid | { error: string }) => {
      clearTimeout(timer)
      void worker.terminate()
      resolve(m)
    })
    worker.once('error', (e) => {
      clearTimeout(timer)
      resolve({ error: e.message })
    })
  })
  if ('error' in grid)
    return {
      kind: 'unsupported',
      ask: 'xlsx_or_pdf',
      detail: `This XLS file could not be read (${grid.error.slice(0, 60)})`,
    }
  const { text, chunks } = gridToText(grid)
  return { kind: 'sheet', format: 'xls', grid, text, chunks }
}
