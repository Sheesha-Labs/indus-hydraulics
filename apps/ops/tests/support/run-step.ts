/**
 * Runs one capture step, or one Assistant action, outside Inngest, for e2e on a machine where the Inngest stub
 * drops events (S08-T05/T06):
 *
 *   bun --conditions react-server tests/support/run-step.ts map-sheet <intakeFileId>
 *   bun --conditions react-server tests/support/run-step.ts same-as-before <intakeFileId>
 *   bun --conditions react-server tests/support/run-step.ts route-classified <messageId>
 *   bun --conditions react-server tests/support/run-step.ts action <request.json> [<model-answer.json>]
 *
 * `action` takes the runner's own path — resolve, gather, propose, verify, decide, effect or on-proposed — with
 * the model's answer read from a fixture file instead of the API (no network, no cost). The same server code.
 */
import { readFileSync } from 'node:fs'

// Outside a Next request there is no incremental cache: settings are read straight through. This script is
// run by bun (tests/support/steps.ts), never by the app, so the Bun global is there.
// eslint-disable-next-line no-restricted-globals -- run by bun in e2e only, never part of the Node app
Bun.plugin({
  name: 'next-cache-outside-next',
  setup(build) {
    build.module('next/cache', () => ({
      loader: 'object',
      exports: {
        unstable_cache: <T>(fn: T) => fn,
        revalidateTag: () => undefined,
        revalidatePath: () => undefined,
        unstable_noStore: () => undefined,
      },
    }))
  },
})

process.on('uncaughtException', (e) => {
  console.error(e instanceof Error ? `${e.message}\n${e.stack ?? ''}` : String(e))
  process.exit(1)
})
process.on('unhandledRejection', (e) => {
  console.error(e instanceof Error ? `${e.message}\n${e.stack ?? ''}` : String(e))
  process.exit(1)
})

const [step, arg, answerPath] = process.argv.slice(2)
if (!step || !arg)
  throw new Error(
    'usage: run-step.ts <map-sheet|same-as-before|action> <id|request.json> [answer.json]'
  )
if (step === 'map-sheet') {
  const { mapSheetFile } = await import('../../src/server/intake/sheet-map')
  console.log(JSON.stringify(await mapSheetFile(arg)))
} else if (step === 'same-as-before') {
  const { annotateSameAsBefore } = await import('../../src/server/intake/past-line')
  console.log(JSON.stringify({ annotated: await annotateSameAsBefore(arg) }))
} else if (step === 'route-classified') {
  // ops.mail.route's step for a classified message (the S05 router): a client enquiry opens its intake.
  await import('../../src/server/assistant/actions')
  const { routeClassified } = await import('../../src/server/mail/router')
  console.log(
    JSON.stringify(
      await routeClassified({ messageId: arg, class: 'client_enquiry', origin: 'live' })
    )
  )
} else if (step === 'action') {
  await import('../../src/server/assistant/actions')
  const { actionRequestEvent } = await import('../../src/server/assistant/request')
  const r = await import('../../src/server/assistant/runner')
  const data = actionRequestEvent(JSON.parse(readFileSync(arg, 'utf8'))).data
  const stage = async <T>(name: string, f: () => Promise<T>): Promise<T> => {
    try {
      return await f()
    } catch (e) {
      throw new Error(`${name}: ${e instanceof Error ? e.message : String(e)}`, { cause: e })
    }
  }
  const resolved = await stage('resolve', () => r.resolveRun(data))
  if (resolved.blocked) throw new Error(`blocked: ${resolved.blocked}`)
  const gathered = await stage('gather', () => r.gatherRun(data))
  const answer = answerPath ? (JSON.parse(readFileSync(answerPath, 'utf8')) as unknown) : null
  const proposed = await stage('propose', () =>
    r.proposeRun(data, gathered.input, {
      call: async () =>
        ({
          ok: true,
          value: answer,
          costUsd: '0.000000',
          model: 'fixture',
          callIds: [],
          usage: null,
        }) as never,
    })
  )
  if (!proposed.ok) throw new Error(`propose: ${proposed.reason}`)
  const verified = await stage('verify', () => r.verifyRun(data, proposed.out, gathered.input))
  const decided = await stage('decide', () =>
    r.decideRun({
      data,
      resolved,
      basisHash: gathered.basisHash,
      input: gathered.input,
      proposal: {
        ok: true,
        verified: verified as never,
        costUsd: proposed.costUsd,
        model: proposed.model,
        promptVersion: proposed.promptVersion,
        callIds: proposed.callIds,
      },
    })
  )
  if (decided.created && decided.state === 'running') await r.effectRun(decided.actionId)
  if (decided.created && decided.state === 'proposed') await r.proposedRun(decided.actionId)
  console.log(
    JSON.stringify({ actionId: decided.actionId, ref: decided.ref, state: decided.state })
  )
} else throw new Error(`unknown step ${step}`)
process.exit(0)
