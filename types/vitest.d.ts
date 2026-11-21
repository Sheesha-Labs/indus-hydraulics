// Test files import from 'vitest'. At runtime `bun test` provides that module
// and implements the parts of Vitest's API this repo uses. For the type checker
// it is bun:test, plus the Vitest signatures bun test accepts but bun-types does
// not declare. Nothing here changes what a test does; it only lets the checker
// read the tests the way Vitest's own types did.

declare module 'bun:test' {
  interface MatchersBuiltin<T = unknown> {
    // Vitest types these loosely; bun-types narrows `expected` to the received
    // type, which rejects e.g. an optional lookup as the expected value.
    toBe(expected: unknown): void
    toEqual(expected: unknown): void
    toContain(expected: unknown): void
  }

  // eslint-disable-next-line typescript/no-explicit-any -- must match bun-types' declaration to merge
  interface Describe<T extends Readonly<any[]>> {
    // Vitest's describe(name, options, fn).
    (label: DescribeLabel, options: { timeout?: number }, fn: (...args: T) => void): void
  }
}

declare module 'vitest' {
  import type { vi as bunVi } from 'bun:test'

  export * from 'bun:test'

  export const vi: typeof bunVi & {
    hoisted<T>(factory: () => T): T
    importActual<T = Record<string, unknown>>(path: string): Promise<T>
  }
}
