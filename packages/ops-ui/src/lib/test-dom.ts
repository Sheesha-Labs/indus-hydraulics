// DOM test setup for kit component tests (jsdom docblock files import this first). Not shipped: only
// *.test.tsx files import it. Adds the jest-dom matchers to bun test's expect and re-exports the Testing
// Library pieces the tests use. Each test file registers `afterEach(cleanup)` itself: this module is
// evaluated once per process, so a hook registered here would bind to the first file only.
import * as matchers from '@testing-library/jest-dom/matchers'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'
import { expect } from 'vitest'

declare module 'bun:test' {
  // Declaration merging needs an interface, and it adds no members of its own. toBeEmpty exists in both
  // with different signatures; bun's own wins.
  /* eslint-disable typescript/no-empty-interface, typescript/no-empty-object-type */
  interface Matchers<T> extends Omit<
    TestingLibraryMatchers<typeof expect.stringContaining, T>,
    'toBeEmpty'
  > {}
  /* eslint-enable typescript/no-empty-interface, typescript/no-empty-object-type */
}

expect.extend(matchers)
export { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
