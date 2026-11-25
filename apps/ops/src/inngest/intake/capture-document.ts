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
import { assistantRun } from '../assistant/run'
import { defineOpsFunction } from '../define'

/**
 * ops.capture.document (S08-T03, 10-architecture §4.8): one intake file from Queued to Ready or Needs attention.
 *
 *   start     queued → extracting ("Detecting layout"); a cancelled, removed or confirmed file stops here
 *   inspect   reads the file once with no database: encrypted, unreadable, unsupported, a coarse scan → Needs
 *             attention without a model call; an archive within limits is expanded into its own files
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
    if (start.skip || !start.file) return { skipped: 'not queued' }

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
    return { status }
  }
)
