import { spawnSync } from 'node:child_process'

/**
 * Runs one capture step, the mail router's step or one Assistant action in a subprocess (see run-step.ts): the
 * local Inngest stub runs no function, so e2e and parity specs take the step a real run would take with the same
 * server code. `answerPath` is the model's answer for an action, from a fixture file.
 */
export function runStep(
  step: 'map-sheet' | 'same-as-before' | 'route-classified' | 'action',
  id: string,
  answerPath?: string
): Record<string, unknown> {
  const r = spawnSync(
    'bun',
    [
      '--conditions',
      'react-server',
      'tests/support/run-step.ts',
      step,
      id,
      ...(answerPath ? [answerPath] : []),
    ],
    {
      cwd: process.cwd(),
      // The dev server's own settings: the local Inngest stub, the local app.
      env: {
        ...process.env,
        APP_ENV: 'local',
        INNGEST_DEV: process.env.INNGEST_DEV ?? 'http://localhost:8289',
      },
      encoding: 'utf8',
    }
  )
  if (r.status !== 0) throw new Error(`run-step ${step} failed: ${r.stderr.slice(-2500)}`)
  return JSON.parse(r.stdout.trim().split('\n').at(-1)!) as Record<string, unknown>
}
