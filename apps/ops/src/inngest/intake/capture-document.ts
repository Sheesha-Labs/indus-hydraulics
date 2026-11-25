import { CAPTURE_CANCELLED, CAPTURE_REQUESTED } from '../../server/intake/upload'
import {
  expandArchive,
  extractRequest,
  failFile,
  finishCapture,
  inspectFile,
  noteReading,
  startCapture,
} from '../../server/intake/capture'
import { annotateSameAsBefore } from '../../server/intake/past-line'
import { mapSheetFile } from '../../server/intake/sheet-map'
import { assistantRun } from '../assistant/run'
import { defineOpsFunction } from '../define'

/**
 * ops.capture.document (S08-T03, 10-architecture §4.8): one intake file from Queued to Ready or Needs attention.
 *
 *   start     queued → extracting ("Detecting layout"); a cancelled, removed or confirmed file stops here
 *   inspect   reads the file once with no database: encrypted, unreadable, unsupported, a coarse scan → Needs
 *             attention without a model call; an archive within limits is expanded into its own files
 *   email     an email body (board 36) skips inspect; after extraction, lines that say "same as last order" are
 *             resolved to the client's earlier line or left Unsure
 *   sheet     a spreadsheet is mapped in code (board 35) and its lines written from the cells; no model call
 *   extract   invokes ops.assistant.run for extract_lines (#5), which stages the lines and marks the file Ready;
 *             nothing is held open while it runs
 *   finish    a run that did not stage (refused, budget, failure) leaves the file Needs attention with the reason
 *
 * Live lane, one run per file. Cancel (board 14) sends ops/document.capture.cancelled for the file. Pause waits.
 */
export const captureDocument = defineOpsFunction(
  {
    id: 'ops.capture.document',
    lane: 'live',
    perKey: { key: 'event.data.intakeFileId', limit: 1 },
    retries: 2,
    idempotency: 'event.data.intakeFileId',
    pause: 'wait',
    cancelOn: [{ event: CAPTURE_CANCELLED, match: 'data.intakeFileId' }],
  },
  { event: CAPTURE_REQUESTED },
  async ({ event, step }) => {
    const intakeFileId = String(event.data.intakeFileId)
    const start = await step.run('start', () => startCapture(intakeFileId))
    if (start.skip) return { skipped: 'not queued' }
    // An email body (board 36) has no stored file: it goes straight to extraction.
    const email = start.kind === 'email'
    if (!email) {
      if (!start.file) return { skipped: 'not queued' }
      const inspection = await step.run('inspect', () => inspectFile(start.file!))
      if (inspection.zip?.expand) {
        const r = await step.run('expand', () => expandArchive(intakeFileId, start))
        return { expanded: r.added, refused: r.refused.length }
      }
      if (inspection.failure) {
        await step.run('fail', () => failFile(intakeFileId, start.batchId, inspection.failure!))
        return { status: 'needs_attention', failure: inspection.failure.kind }
      }
      await step.run('progress', () => noteReading(intakeFileId, start.batchId, inspection))
      if (inspection.sheet) {
        // A spreadsheet is mapped in code from its cells; the person checks the mapping on board 35.
        const r = await step.run('map-sheet', () => mapSheetFile(intakeFileId))
        return { status: 'ready', lines: r.lines, remembered: r.remembered }
      }
    }

    const run = await step
      .invoke('extract', {
        function: assistantRun,
        data: extractRequest(intakeFileId, start.sha256) as never,
        timeout: '20m',
      })
      .catch((e: unknown) => ({ skipped: e instanceof Error ? e.message.slice(0, 60) : 'failed' }))

    const status = await step.run('finish', () =>
      finishCapture(intakeFileId, start.batchId, run as { state?: string; skipped?: string } | null)
    )
    if (email && status === 'ready')
      await step.run('same-as-before', () => annotateSameAsBefore(intakeFileId))
    return { status }
  }
)
