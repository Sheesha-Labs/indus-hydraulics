/**
 * Runs one capture step outside Inngest, for e2e on a machine where the Inngest stub drops events (S08-T05):
 *
 *   bun --conditions react-server tests/support/run-step.ts map-sheet <intakeFileId>
 *   bun --conditions react-server tests/support/run-step.ts same-as-before <intakeFileId>
 *
 * The same server functions ops.capture.document calls, with the environment the dev server has.
 */
const [step, id] = process.argv.slice(2)
if (!step || !id) throw new Error('usage: run-step.ts <map-sheet|same-as-before> <intakeFileId>')
if (step === 'map-sheet') {
  const { mapSheetFile } = await import('../../src/server/intake/sheet-map')
  console.log(JSON.stringify(await mapSheetFile(id)))
} else if (step === 'same-as-before') {
  const { annotateSameAsBefore } = await import('../../src/server/intake/past-line')
  console.log(JSON.stringify({ annotated: await annotateSameAsBefore(id) }))
} else throw new Error(`unknown step ${step}`)
process.exit(0)
