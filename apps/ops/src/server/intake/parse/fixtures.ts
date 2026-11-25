import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Reads a generated fixture (see __fixtures__/build-fixtures.ts). Test-only. */
export function fixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync(join(import.meta.dir, '__fixtures__', name)))
}
