import { spawnSync } from 'node:child_process'

/**
 * Runs one capture step in a subprocess (see run-step.ts): the local Inngest stub runs no function, so e2e and
 * parity specs take the step a real run would take with the same server code.
 */
export function runStep(step: 'map-sheet' | 'same-as-before', id: string): Record<string, unknown> {
  const r = spawnSync(
    'bun',
    ['--conditions', 'react-server', 'tests/support/run-step.ts', step, id],
    {
      cwd: process.cwd(),
      env: { ...process.env, APP_ENV: 'local' },
      encoding: 'utf8',
    }
  )
  if (r.status !== 0) throw new Error(`run-step ${step} failed: ${r.stderr.slice(-800)}`)
  return JSON.parse(r.stdout.trim().split('\n').at(-1)!) as Record<string, unknown>
}
