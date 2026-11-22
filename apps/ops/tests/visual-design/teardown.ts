import { writeSummary } from './summary'

/** Playwright global teardown: refresh the design-parity summary when parity rows exist (local only). */
export default function teardown(): void {
  const file = writeSummary()
  if (file) console.log(`Design parity summary: ${file}`)
}
